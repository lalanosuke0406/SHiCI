// Isolated feasibility probe. No production entry point, key exchange, or recovery protocol.
// HMAC here authenticates access; it is not end-to-end encryption.
const EVENT_LIMIT = 32 * 1024;
const FILE_LIMIT = 5 * 1024 * 1024;
const STORAGE_LIMIT = 128 * 1024 * 1024;
const REQUESTS_PER_DAY = 10000;
const R2_WRITES_PER_DAY = 100;
const R2_READS_PER_DAY = 1000;
const PROTOCOL = "shici-probe-v1";
const encoder = new TextEncoder();
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const reply = (value, status=200) => Response.json(value, {status, headers:{"Cache-Control":"no-store", "X-Content-Type-Options":"nosniff"}});
class Failure extends Error {constructor(status, reason) {super(reason); this.status=status;}}
export {Failure, boundedBytes, reply};
const unbase64 = text => Uint8Array.from(atob(text.replace(/-/g,"+").replace(/_/g,"/")), c=>c.charCodeAt(0));
async function claimsFor(request, env) {
  if (env.ENABLE_ISOLATED_PROBE !== "true" || !env.PROBE_AUTH_SECRET || env.PROBE_AUTH_SECRET.length < 32) throw new Failure(503,"probe_disabled");
  const origin = request.headers.get("Origin");
  if (origin !== env.SHICI_ORIGIN) throw new Failure(403,"origin_denied");
  let token = request.headers.get("Authorization")?.replace(/^Bearer /, "");
  if (request.headers.get("Upgrade")?.toLowerCase() === "websocket") {
    const protocols = (request.headers.get("Sec-WebSocket-Protocol") || "").split(",").map(s=>s.trim());
    if (protocols[0] !== PROTOCOL || protocols.length !== 2) throw new Failure(401,"token_required");
    token = protocols[1];
  }
  try {
    if (!token || token.length > 4096) throw Error();
    const parts = token.split("."); if (parts.length !== 2) throw Error();
    const key = await crypto.subtle.importKey("raw",encoder.encode(env.PROBE_AUTH_SECRET),{name:"HMAC",hash:"SHA-256"},false,["verify"]);
    if (!await crypto.subtle.verify("HMAC",key,unbase64(parts[1]),encoder.encode(parts[0]))) throw Error();
    const claims = JSON.parse(new TextDecoder().decode(unbase64(parts[0])));
    const now = Math.floor(Date.now()/1000);
    const users = JSON.parse(env.PROBE_USERS_JSON || "[]");
    if (!Array.isArray(users) || users.length < 2 || users.length > 5 ||
        claims.aud !== "shici-free-feasibility" || !Number.isSafeInteger(claims.exp) || claims.exp <= now || claims.exp > now+900 ||
        !Array.isArray(claims.pair) || claims.pair.length !== 2 || new Set(claims.pair).size !== 2 ||
        !claims.pair.includes(claims.sub) || claims.pair.some(id=>typeof id!=="string" || !/^[a-z0-9_-]{1,64}$/.test(id) || !users.includes(id))) throw Error();
    return claims;
  } catch {throw new Failure(401,"invalid_token");}
}
async function boundedBytes(request, limit) {
  if (Number(request.headers.get("Content-Length")) > limit) throw new Failure(413,"size_limit");
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader(), chunks=[]; let length=0;
  try {
    for (;;) {
      const {done,value} = await reader.read(); if (done) break;
      length += value.byteLength;
      if (length > limit) {await reader.cancel(); throw new Failure(413,"size_limit");}
      chunks.push(value);
    }
  } finally {reader.releaseLock();}
  const output = new Uint8Array(length); let offset=0;
  for(const chunk of chunks){output.set(chunk,offset);offset+=chunk.length;}
  return output;
}
export default {
  async fetch(request, env) {
    try {
      if (request.method === "OPTIONS") {
        if (request.headers.get("Origin") !== env.SHICI_ORIGIN) return reply({error:"origin_denied"},403);
        return new Response(null,{status:204,headers:{"Access-Control-Allow-Origin":env.SHICI_ORIGIN,
          "Access-Control-Allow-Methods":"GET, POST, OPTIONS", "Access-Control-Allow-Headers":"Authorization, Content-Type", "Cache-Control":"no-store"}});
      }
      const claims = await claimsFor(request, env);
      const headers = new Headers(request.headers);
      headers.set("X-Probe-Claims", JSON.stringify(claims)); // Never trust the caller's version.
      headers.delete("Authorization");
      const response = await env.LEDGER.get(env.LEDGER.idFromName("isolated-evaluation")).fetch(new Request(request,{headers}));
      if (response.status === 101) return response;
      const output = new Response(response.body,response);
      output.headers.set("Access-Control-Allow-Origin",env.SHICI_ORIGIN);
      return output;
    } catch(error) {return reply({error:error instanceof Failure ? error.message : "probe_failed"},error.status || 500);}
  }
};

export class ProbeLedger {
  constructor(ctx, env) {this.ctx=ctx; this.env=env;this.eventLimitBytes=EVENT_LIMIT;}
  async quota({bytes=0,write=0,read=0,events=0}={}, transaction) {
    const update = async transaction => {
      const today = new Date().toISOString().slice(0,10);
      const previous = await transaction.get("budget") || {bytes:0};
      const budget = previous.day === today ? previous : {day:today,bytes:previous.bytes,events:previous.events||0,requests:0,writes:0,reads:0};
      if (budget.requests+1 > REQUESTS_PER_DAY || budget.writes+write > R2_WRITES_PER_DAY ||
          budget.reads+read > R2_READS_PER_DAY || budget.bytes+bytes > STORAGE_LIMIT || budget.events+events > 1000) throw new Failure(429,"probe_quota");
      budget.requests++; budget.writes+=write; budget.reads+=read; budget.bytes+=bytes; budget.events+=events;
      await transaction.put("budget",budget);
    };
    if (transaction) await update(transaction); else await this.ctx.storage.transaction(update);
  }
  async fetch(request) {
    try {
      const claims = JSON.parse(request.headers.get("X-Probe-Claims"));
      const pairKey = [...claims.pair].sort().join("~");
      const path = new URL(request.url).pathname;
      if (path === "/connect" && request.method === "GET" && request.headers.get("Upgrade")?.toLowerCase() === "websocket") {
        await this.quota();
        const sockets = this.ctx.getWebSockets();
        if (sockets.length >= 15) throw new Failure(429,"connection_limit");
        const pair = new WebSocketPair(), [client,server] = Object.values(pair);
        this.ctx.acceptWebSocket(server,[pairKey]);
        server.serializeAttachment({pairKey,sub:claims.sub,exp:claims.exp});
        const expires = this.ctx.getWebSockets().map(socket=>socket.deserializeAttachment().exp*1000);
        await this.ctx.storage.setAlarm(Math.min(...expires));
        return new Response(null,{status:101,webSocket:client,headers:{"Sec-WebSocket-Protocol":PROTOCOL}});
      }
      if (path === "/events" && request.method === "POST") {
        const bytes = await boundedBytes(request,this.eventLimitBytes || EVENT_LIMIT);
        let event; try {event=JSON.parse(new TextDecoder().decode(bytes));} catch {throw new Failure(400,"invalid_envelope");}
        if (!event || !UUID.test(event.id) || Object.keys(event).sort().join(",") !== "ciphertext,id" ||
            typeof event.ciphertext!=="string" || !/^[A-Za-z0-9+/]+={0,2}$/.test(event.ciphertext) || event.ciphertext.length<24) throw new Failure(400,"invalid_envelope");
        const key = `event:${pairKey}:${event.id}`;
        // Serialize check-and-commit: a retry with the same ID cannot duplicate or replace ciphertext.
        let stored;
        await this.ctx.storage.transaction(async transaction=>{
          stored = await transaction.get(key);
          if (stored && (stored.sender!==claims.sub || stored.ciphertext!==event.ciphertext)) throw new Failure(409,"id_conflict");
          await this.quota({bytes:stored ? 0 : 2*bytes.length+512,events:stored ? 0 : 1},transaction);
          if (!stored) {
            const order=(await transaction.get("event-order")||0)+1;
            await transaction.put("event-order",order);
            stored = {...event,sender:claims.sub,createdAt:Date.now(),order};
            await transaction.put(key,stored);
          }
        });
        for (const socket of this.ctx.getWebSockets(pairKey)) {
          if (socket.deserializeAttachment().exp*1000 <= Date.now()) {socket.close(1008,"expired"); continue;}
          try {socket.send(JSON.stringify(stored));} catch {}
        }
        return reply(stored);
      }
      if (path === "/events" && request.method === "GET") {
        await this.quota();
        const events = await this.ctx.storage.list({prefix:`event:${pairKey}:`,limit:1000});
        return reply([...events.values()].sort((a,b)=>a.createdAt-b.createdAt).slice(-50));
      }
      if (path === "/attachments" && request.method === "POST") {
        if (request.headers.get("Content-Type") !== "application/octet-stream") throw new Failure(415,"binary_only");
        const data = await boundedBytes(request,FILE_LIMIT);
        if (!data.length) throw new Failure(400,"empty_file");
        await this.quota({bytes:2*data.length+1024,write:1});
        // Reserve before R2 I/O; retain the reservation after uncertain failures (fail closed).
        const id=crypto.randomUUID(), objectKey=`probe/${pairKey}/${id}`;
        await this.env.ATTACHMENTS.put(objectKey,data,{httpMetadata:{contentType:"application/octet-stream"}});
        await this.ctx.storage.put(`file:${pairKey}:${id}`,{objectKey,size:data.length});
        return reply({id,size:data.length},201);
      }
      const match=path.match(/^\/attachments\/([a-f0-9-]+)$/);
      if (match && request.method === "GET") {
        const metadata=await this.ctx.storage.get(`file:${pairKey}:${match[1]}`);
        if (!metadata) throw new Failure(404,"not_found");
        await this.quota({read:1});
        const data=await this.env.ATTACHMENTS.get(metadata.objectKey);
        if (!data) throw new Failure(404,"not_found");
        return new Response(data.body,{headers:{"Content-Type":"application/octet-stream", "Cache-Control":"no-store", "X-Content-Type-Options":"nosniff"}});
      }
      return reply({error:"not_found"},404);
    } catch(error) {return reply({error:error instanceof Failure ? error.message : "probe_failed"},error.status || 500);}
  }
  async alarm() {
    const live=[];
    for (const socket of this.ctx.getWebSockets()) {
      const exp=socket.deserializeAttachment().exp*1000;
      if (exp<=Date.now()) socket.close(1008,"expired"); else live.push(exp);
    }
    if (live.length) await this.ctx.storage.setAlarm(Math.min(...live));
  }
  webSocketMessage(socket) {socket.close(1008,"post_envelopes_over_http");}
  webSocketClose(socket,code,reason) {socket.close(code,reason);}
  webSocketError(socket) {socket.close(1011,"connection_error");}
}
