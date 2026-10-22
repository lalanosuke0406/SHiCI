import {ProbeLedger,Failure,boundedBytes,reply} from "../free-probe/worker.mjs";
const encoder=new TextEncoder();
const DOMAIN="shici-free.invalid";
const idOf=user=>`@${user}:${DOMAIN}`;
const aliasOf=id=>/^@[a-z0-9_-]{1,64}:shici-free\.invalid$/.test(id) ? id.slice(1,-DOMAIN.length-1) : null;
const decode=text=>Uint8Array.from(atob(text.replace(/-/g,"+").replace(/_/g,"/")),c=>c.charCodeAt(0));
const hex=buffer=>Array.from(new Uint8Array(buffer),byte=>byte.toString(16).padStart(2,"0")).join("");
const same=(left,right)=>JSON.stringify(left)===JSON.stringify(right);
async function grantFor(request,env) {
  try {
    const token=(request.headers.get("Authorization")||"").replace(/^Bearer /,"");
    if(token.length>8192) throw Error();
    const [body,signature,...extra]=token.split("."); if(extra.length || !body || !signature) throw Error();
    const key=await crypto.subtle.importKey("raw",encoder.encode(env.FREE_AUTH_SECRET),{name:"HMAC",hash:"SHA-256"},false,["verify"]);
    if(!await crypto.subtle.verify("HMAC",key,decode(signature),encoder.encode(body))) throw Error();
    const grant=JSON.parse(new TextDecoder().decode(decode(body))),now=Math.floor(Date.now()/1000);
    const allowed=JSON.parse(env.FREE_USERS_JSON||"[]");
    if(!Array.isArray(allowed) || allowed.length<2 || allowed.length>5 || new Set(allowed).size!==allowed.length ||
       grant.aud!=="shici-free-v1" || !allowed.includes(grant.sub) ||
       !Number.isSafeInteger(grant.exp) || grant.exp<=now || grant.exp>now+900 ||
       !Array.isArray(grant.peers) || grant.peers.length>4 || new Set(grant.peers).size!==grant.peers.length ||
       grant.peers.some(peer=>peer===grant.sub || !allowed.includes(peer)) ||
       [grant.sub,...grant.peers].some(user=>!/^[a-z0-9_-]{1,64}$/.test(user))) throw Error();
    return grant;
  } catch {throw new Failure(401,"invalid_grant");}
}
export default {
  async fetch(request,env) {
    try {
      if(env.ENABLE_FREE_MESSENGER!=="true" || !env.FREE_AUTH_SECRET || env.FREE_AUTH_SECRET.length<32) throw new Failure(503,"not_configured");
      if(request.headers.get("Origin")!==env.SHICI_ORIGIN) throw new Failure(403,"origin_denied");
      if(request.method==="OPTIONS") return new Response(null,{status:204,headers:{"Access-Control-Allow-Origin":env.SHICI_ORIGIN,
        "Access-Control-Allow-Methods":"GET, POST, OPTIONS", "Access-Control-Allow-Headers":"Authorization, Content-Type, X-Device-Id, X-Device-Time, X-Device-Nonce, X-Device-Signature","Cache-Control":"no-store"}});
      const headers=new Headers(request.headers),url=new URL(request.url);
      headers.delete("X-Free-Grant");
      if(url.pathname!=="/stream") headers.set("X-Free-Grant",JSON.stringify(await grantFor(request,env)));
      headers.delete("Authorization");
      const response=await env.APPLICATION.get(env.APPLICATION.idFromName("shici-free-v1")).fetch(new Request(request,{headers}));
      if(response.status===101) return response;
      const output=new Response(response.body,response);output.headers.set("Access-Control-Allow-Origin",env.SHICI_ORIGIN);return output;
    } catch(error) {return reply({error:error instanceof Failure?error.message:"request_failed"},error.status||500);}
  }
};

export class FreeApplication extends ProbeLedger {
  constructor(ctx,env) {super(ctx,env);this.eventLimitBytes=128*1024;}
  profile(user) {return this.ctx.storage.get("profile:"+user);}
  async proof(request,bytes,profile,user) {
    const time=request.headers.get("X-Device-Time"),nonce=request.headers.get("X-Device-Nonce"),device=request.headers.get("X-Device-Id");
    if(!time || !/^\d{13}$/.test(time) || Math.abs(Date.now()-Number(time))>60000 ||
       !nonce || !/^[a-f0-9-]{36}$/.test(nonce) || device!==profile.device.device_id) throw new Failure(401,"device_proof_required");
    try {
      const raw=decode(profile.device.keys["ed25519:"+device]);
      const key=await crypto.subtle.importKey("raw",raw,{name:"Ed25519"},false,["verify"]);
      const url=new URL(request.url),digest=hex(await crypto.subtle.digest("SHA-256",bytes));
      const message=[request.method,url.pathname+url.search,time,nonce,digest].join("\n");
      if(!await crypto.subtle.verify("Ed25519",key,decode(request.headers.get("X-Device-Signature")||""),encoder.encode(message))) throw Error();
    } catch {throw new Failure(401,"invalid_device_proof");}
    await this.ctx.storage.transaction(async storage=>{
      const key="nonces:"+user,old=await storage.get(key)||{};
      if(old[nonce]) throw new Failure(409,"replayed_request");
      const recent=Object.fromEntries(Object.entries(old).filter(([,timestamp])=>Date.now()-timestamp<120000));
      if(Object.keys(recent).length>=1000) throw new Failure(429,"device_rate_limit");
      recent[nonce]=Date.now();await storage.put(key,recent);
    });
  }
  notify(users) {
    for(const user of users) for(const socket of this.ctx.getWebSockets("user:"+user)) {
      if(socket.deserializeAttachment().exp*1000<=Date.now()) {socket.close(1008,"expired");continue;}
      try {socket.send('{"type":"changed"}');} catch {}
    }
  }
  async fetch(request) {
    let uploading=false;
    try {
      const url=new URL(request.url),path=url.pathname;
      if(request.method==="POST" && /^\/rooms\/[^/]+\/attachments$/.test(path)) {
        if((this.activeUploads||0)>=2) throw new Failure(429,"upload_busy");
        this.activeUploads=(this.activeUploads||0)+1;uploading=true;
      }
      if(path==="/stream") {
        if(request.method!=="GET" || request.headers.get("Upgrade")?.toLowerCase()!=="websocket") throw new Failure(400,"websocket_required");
        const ticket=url.searchParams.get("ticket");
        if(!ticket || !/^[a-f0-9-]{36}$/.test(ticket)) throw new Failure(401,"invalid_ticket");
        /** @type {{until:number,exp:number,sub:string}|undefined} */
        const grant=await this.ctx.storage.transaction(async storage=>{
          const value=await storage.get("ticket:"+ticket);await storage.delete("ticket:"+ticket);return value;
        });
        if(!grant || grant.until<Date.now() || grant.exp*1000<=Date.now()) throw new Failure(401,"expired_ticket");
        if(this.ctx.getWebSockets().length>=15) throw new Failure(429,"connection_limit");
        const [client,server]=Object.values(new WebSocketPair());
        this.ctx.acceptWebSocket(server,["user:"+grant.sub]);server.serializeAttachment(grant);
        await this.ctx.storage.setAlarm(Math.min(...this.ctx.getWebSockets().map(socket=>socket.deserializeAttachment().exp*1000)));
        return new Response(null,{status:101,webSocket:client});
      }
      const grant=JSON.parse(request.headers.get("X-Free-Grant")),user=grant.sub;
      await this.quota();
      if(path==="/profile" && request.method==="GET") {
        const profile=await this.profile(user);
        return reply({registered:Boolean(profile),deviceId:profile?.device.device_id});
      }
      const room=path.match(/^\/rooms\/([a-z0-9_-]{1,64})\/(events|attachments(?:\/[a-f0-9-]+)?)$/);
      const limit=room?.[2]==="attachments" ? 5*1024*1024 : 256*1024;
      const bytes=await boundedBytes(request,limit);
      let body={};
      if(bytes.length && !room?.[2].startsWith("attachments")) {
        try {body=JSON.parse(new TextDecoder().decode(bytes));} catch {throw new Failure(400,"invalid_json");}
      }
      let profile=await this.profile(user);
      if(path==="/keys/upload" && !profile) {
        const device=body.device_keys;
        if(!device || device.user_id!==idOf(user) || !/^[A-Z0-9]{8,64}$/.test(device.device_id) ||
           typeof device.keys?.["ed25519:"+device.device_id]!=="string" || typeof device.keys?.["curve25519:"+device.device_id]!=="string") throw new Failure(400,"invalid_device");
        await this.proof(request,bytes,{device},user);
        // A simultaneous registration must never replace the first accepted identity.
        await this.ctx.storage.transaction(async storage=>{
          if(await storage.get("profile:"+user)) throw new Failure(409,"device_already_registered");
          await this.quota({bytes:2*bytes.length+1024},storage);
          await storage.put("profile:"+user,{device,keys:{},fallback:{}});
        });
        profile=await this.profile(user);
      } else {
        if(!profile) throw new Failure(403,"device_not_registered");
        await this.proof(request,bytes,profile,user);
      }
      if(path==="/keys/upload" && request.method==="POST") {
        if(body.device_keys && (!same(body.device_keys.keys,profile.device.keys) || body.device_keys.device_id!==profile.device.device_id || body.device_keys.user_id!==idOf(user))) throw new Failure(409,"device_changed");
        if(Object.keys(body.one_time_keys||{}).length>100 || Object.keys(body.fallback_keys||{}).length>2) throw new Failure(413,"too_many_keys");
        await this.ctx.storage.transaction(async storage=>{
          profile=await storage.get("profile:"+user);
          const fresh=Object.fromEntries(Object.entries(body.one_time_keys||{}).filter(([key])=>!profile.usedOTKs?.[key]));
          profile.keys={...profile.keys,...fresh};profile.fallback={...profile.fallback,...body.fallback_keys};
          if(Object.keys(body.fallback_keys||{}).length) profile.fallbackUsed=false;
          if(Object.keys(profile.keys).length>200) throw new Failure(429,"key_limit");
          await storage.put("profile:"+user,profile);
        });
        return reply({one_time_key_counts:{signed_curve25519:Object.keys(profile.keys).length}});
      }
      if(path==="/keys/signing" && request.method==="POST") {
        await this.ctx.storage.transaction(async storage=>{
        profile=await storage.get("profile:"+user);
        for(const kind of ["master_key","self_signing_key","user_signing_key"]) {
          if(body[kind]?.user_id!==idOf(user)) throw new Failure(400,"invalid_signing_key");
          if(profile[kind] && !same(profile[kind].keys,body[kind].keys)) throw new Failure(409,"identity_changed");
          profile[kind]=body[kind];
        }
        await storage.put("profile:"+user,profile);
        });return reply({});
      }
      if(path==="/keys/signatures" && request.method==="POST") {
        await this.ctx.storage.transaction(async storage=>{
        profile=await storage.get("profile:"+user);
        if(Object.keys(body).some(id=>id!==idOf(user))) throw new Failure(403,"signature_owner");
        for(const [key,value] of Object.entries(body[idOf(user)]||{})) {
          const target=key===profile.device.device_id ? profile.device : profile.master_key?.keys["ed25519:"+key] ? profile.master_key : undefined;
          if(!target) throw new Failure(400,"unknown_signing_target");
          target.signatures||={};
          for(const [signer,signatures] of Object.entries(value.signatures||{})) {
            if(signer!==idOf(user)) throw new Failure(403,"signature_owner");
            target.signatures[signer]={...target.signatures[signer],...signatures};
          }
        }
        await storage.put("profile:"+user,profile);
        });return reply({failures:{}});
      }
      if(["/keys/query","/keys/claim"].includes(path) && request.method==="POST") {
        const result={device_keys:{},master_keys:{},self_signing_keys:{},user_signing_keys:{},one_time_keys:{},failures:{}};
        const query=path==="/keys/query" ? body.device_keys : body.one_time_keys;
        if(!query || Object.keys(query).length>5) throw new Failure(400,"invalid_key_query");
        await this.ctx.storage.transaction(async storage=>{
          for(const id of Object.keys(query)) {
            const alias=aliasOf(id);if(!alias || (alias!==user && !grant.peers.includes(alias))) throw new Failure(403,"peer_denied");
            const found=await storage.get("profile:"+alias);
            // An explicitly empty device map completes a query for an
            // unregistered user. Omitting it leaves the Rust SDK retrying.
            if(!found) {
              if(path==="/keys/query") result.device_keys[id]={};
              continue;
            }
            if(path==="/keys/query") {
              result.device_keys[id]={[found.device.device_id]:found.device};
              for(const [kind,plural] of [["master_key","master_keys"],["self_signing_key","self_signing_keys"],["user_signing_key","user_signing_keys"]]) if(found[kind]) result[plural][id]=found[kind];
            } else {
              for(const device of Object.keys(query[id])) {
                if(device!==found.device.device_id) continue;
                const entry=Object.entries(found.keys)[0]||Object.entries(found.fallback)[0];
                if(!Object.keys(found.keys).length && entry) found.fallbackUsed=true;
                if(entry) {
                  const [key,value]=entry;result.one_time_keys[id]||={};result.one_time_keys[id][device]={[key]:value};
                  if(found.keys[key]) {
                    found.usedOTKs||={};if(Object.keys(found.usedOTKs).length>=5000) throw new Failure(429,"key_limit");
                    found.usedOTKs[key]=true;delete found.keys[key];
                  }
                }
              }
              await storage.put("profile:"+alias,found);
            }
          }
        });
        return reply(result);
      }
      if(path==="/to-device" && request.method==="POST") {
        if(!["m.room.encrypted","m.room_key.withheld"].includes(body.type) || !/^[a-zA-Z0-9_-]{1,128}$/.test(body.id||"")) throw new Failure(400,"invalid_packet");
        const receivers=Object.keys(body.messages||{});if(receivers.length>5) throw new Failure(413,"too_many_receivers");
        for(const id of receivers) {
          const peer=aliasOf(id);if(peer!==user && !grant.peers.includes(peer)) throw new Failure(403,"peer_denied");
          const target=await this.profile(peer);if(!target) throw new Failure(409,"peer_not_registered");
          const devices=Object.keys(body.messages[id]);if(devices.length!==1 || devices[0]!==target.device.device_id) throw new Failure(409,"peer_device_changed");
        }
        for(const id of receivers) {
          const peer=aliasOf(id),content=body.messages[id][(await this.profile(peer)).device.device_id];
          const key=`inbox:${peer}:${user}:${body.id}`;
          await this.ctx.storage.transaction(async storage=>{
            const previous=await storage.get(key),value={id:key,type:body.type,sender:idOf(user),content};
            if(previous && !same(previous,value)) throw new Failure(409,"packet_conflict");
            if(!previous) {await this.quota({bytes:2*bytes.length+512},storage);await storage.put(key,value);}
          });
        }
        this.notify(receivers.map(aliasOf));return reply({});
      }
      if(path==="/inbox" && request.method==="GET") return reply({events:[...((await this.ctx.storage.list({prefix:"inbox:"+user+":",limit:100})).values())],
        one_time_key_counts:{signed_curve25519:Object.keys(profile.keys).length},unused_fallback_key_types:profile.fallbackUsed?[]:["signed_curve25519"]});
      if(path==="/inbox/ack" && request.method==="POST") {
        if(!Array.isArray(body.ids) || body.ids.length>100 || body.ids.some(id=>typeof id!=="string" || !id.startsWith("inbox:"+user+":"))) throw new Failure(400,"invalid_ack");
        await this.ctx.storage.delete(body.ids);return reply({});
      }
      if(path==="/socket-ticket" && request.method==="POST") {
        const ticket=crypto.randomUUID(),until=Math.min(Date.now()+30000,grant.exp*1000);
        const tickets=await this.ctx.storage.list({prefix:"ticket:"});
        for(const [key,value] of tickets) if(value.until<Date.now()) await this.ctx.storage.delete(key);
        if(tickets.size>30) throw new Failure(429,"ticket_limit");
        await this.ctx.storage.put("ticket:"+ticket,{...grant,until});return reply({ticket});
      }
      if(room) {
        const peer=room[1];if(!grant.peers.includes(peer)) throw new Failure(403,"peer_denied");
        const pairKey=[user,peer].sort().join("~");
        if(room[2]==="events" && request.method==="GET") {
          const all=[...(await this.ctx.storage.list({prefix:`event:${pairKey}:`,limit:1000})).values()]
            .sort((a,b)=>(a.order||a.createdAt)-(b.order||b.createdAt) || a.id.localeCompare(b.id));
          const before=url.searchParams.get("before");
          const end=before ? all.findIndex(event=>event.id===before) : all.length;
          if(end<0) throw new Failure(400,"invalid_cursor");
          const events=all.slice(Math.max(0,end-50),end);
          return reply({events,before:events[0]?.id||null,hasMore:end>50});
        }
        const forwarded=new URL(request.url);forwarded.pathname="/"+room[2];forwarded.search="";
        const headers=new Headers(request.headers);headers.set("X-Probe-Claims",JSON.stringify({...grant,pair:[user,peer]}));
        const result=await super.fetch(new Request(forwarded,{method:request.method,headers,body:bytes.length?bytes:undefined}));
        if(result.ok && request.method==="POST") this.notify([user,peer]);
        return result;
      }
      return reply({error:"not_found"},404);
    } catch(error) {return reply({error:error instanceof Failure?error.message:"request_failed"},error.status||500);}
    finally {if(uploading)this.activeUploads--;}
  }
  webSocketClose(socket) {socket.close(1000,"closed");}
}
