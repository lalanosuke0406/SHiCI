import test from "node:test";
import assert from "node:assert/strict";
import {randomBytes,createHmac,randomUUID,generateKeyPairSync} from "node:crypto";
import {fileURLToPath} from "node:url";
import {mkdtempSync,mkdirSync} from "node:fs";
import {join,resolve,dirname} from "node:path";
import {Miniflare} from "miniflare";
import {bundleWorker} from "../bundle.mjs";
import {FreeEngine} from "../../client/src/free-engine.js";
const origin="https://shici-46n.pages.dev";

test("unregistered peer query completes; later registration, verified E2EE and encrypted attachment still work",async t=>{
  const secret=randomBytes(32).toString("hex"),root=fileURLToPath(new URL("../../../.local-tests/",import.meta.url));mkdirSync(root,{recursive:true});
  const pair=generateKeyPairSync("ec",{namedCurve:"prime256v1"}),jwk=pair.privateKey.export({format:"jwk"});
  const publicKey=Buffer.concat([Buffer.from([4]),Buffer.from(jwk.x,"base64url"),Buffer.from(jwk.y,"base64url")]).toString("base64url");
  const vapid=JSON.stringify({subject:origin,publicKey,privateKey:jwk.d});
  const pushes=[];let pushStatus=201;
  const subscription=user=>({endpoint:"https://fcm.googleapis.com/fixture/"+user,keys:{p256dh:publicKey,auth:randomBytes(16).toString("base64url")}});
  const waitPush=async count=>{for(let i=0;i<100 && pushes.length<count;i++)await new Promise(resolve=>setTimeout(resolve,10));assert.equal(pushes.length,count);};
  const scriptPath=await bundleWorker(join(mkdtempSync(join(root,"free-bundle-")),"worker.mjs"));
  const mf=new Miniflare({modules:true,modulesRoot:dirname(scriptPath),
    scriptPath,compatibilityDate:"2026-07-30",
    outboundService:async request=>{pushes.push({url:request.url,body:new Uint8Array(await request.arrayBuffer())});return new Response(null,{status:pushStatus});},
    durableObjects:{APPLICATION:{className:"FreeApplication",useSQLite:true}},r2Buckets:["ATTACHMENTS"],r2Persist:mkdtempSync(join(root,"free-r2-")),
    bindings:{FREE_PUSH_VAPID:vapid,ENABLE_FREE_MESSENGER:"true",FREE_AUTH_SECRET:secret,FREE_USERS_JSON:'["alice","bob","carol"]',SHICI_ORIGIN:origin}});
  t.after(()=>mf.dispose());
  const grant=(sub,peers)=>{
    const body=Buffer.from(JSON.stringify({aud:"shici-free-v1",sub,peers,exp:Math.floor(Date.now()/1000)+600})).toString("base64url");
    return body+"."+createHmac("sha256",secret).update(body).digest("base64url");
  };
  const sent=[],updates={alice:[],bob:[]};let lastSigned;
  const engines=[];
  function client(user,peer) {
    const memory=new Map(),config={provider:"cloudflare",encryption:"required",baseUrl:"https://free.local/",userId:user,
      peers:[{userId:peer,displayName:peer}],accessGrant:grant(user,[peer]),maxAttachmentBytes:5*1024*1024};
    const engine=new FreeEngine(config,event=>updates[user]?.push(event),{memory:true,socketFactory:null,
      fetch:(url,options)=>{if(options.headers["X-Device-Signature"])lastSigned={url,options};sent.push({path:new URL(url).pathname,body:options.body?new TextDecoder().decode(options.body):""});
        return mf.dispatchFetch(url,{...options,headers:{...options.headers,Origin:origin}});},
      vault:{loadDevice:async name=>memory.get(name)||null,saveDevice:async(name,data)=>memory.set(name,structuredClone(data))}});
    engines.push(engine);return engine;
  }
  t.after(()=>engines.forEach(engine=>engine.close()));
  const alice=client("alice","bob"),bob=client("bob","alice");
  assert.equal((await alice.request("start")).registrationRequired,true);
  assert.equal((await alice.request("start",{accepted:true})).ready,true);
  await assert.rejects(alice.request("selectPeer",{peerId:"bob"}),/未登録/);
  await alice.request("_sync");
  assert.equal((await bob.request("start",{accepted:true})).ready,true);
  const pushConfig=await alice.request("pushConfiguration");assert.equal(pushConfig.publicKey,publicKey);assert.equal(pushConfig.subscribed,false);
  await alice.request("registerPush",{subscription:subscription("alice")});
  await bob.request("registerPush",{subscription:subscription("bob")});
  assert.equal((await alice.request("pushConfiguration")).subscribed,true);
  const a=await alice.request("selectPeer",{peerId:"bob"}),b=await bob.request("selectPeer",{peerId:"alice"});
  assert.equal(a.verificationRequired,true);assert.equal(a.code,b.code);
  await assert.rejects(alice.request("sendText",{roomId:a.roomId,body:"not yet authorized",transactionId:randomUUID()}));
  await alice.request("confirmPeer",{peerId:"bob",code:a.code});
  await bob.request("confirmPeer",{peerId:"alice",code:b.code});
  const first="暗号化した業務メッセージ（テスト）",second="返信も暗号化されます（テスト）";
  const firstId=randomUUID();
  await alice.request("sendText",{roomId:a.roomId,body:first,transactionId:firstId});
  await waitPush(1);assert.equal(pushes[0].url,"https://fcm.googleapis.com/fixture/bob");
  await alice.request("sendText",{roomId:a.roomId,body:first,transactionId:firstId});
  await new Promise(resolve=>setTimeout(resolve,30));assert.equal(pushes.length,1,"retry must not duplicate a push");
  assert.ok(updates.alice.at(-1).messages.some(message=>message.body===first && message.mine),"sender must decrypt its own sent text");
  await bob.request("older");
  assert.ok(updates.bob.at(-1).messages.some(message=>message.body===first));
  await bob.request("sendText",{roomId:b.roomId,body:second,transactionId:randomUUID()});
  assert.ok(updates.bob.at(-1).messages.some(message=>message.body===second && message.mine),"reply sender must decrypt its own text");
  await waitPush(2);assert.equal(pushes[1].url,"https://fcm.googleapis.com/fixture/alice");
  await alice.request("older");
  assert.ok(updates.alice.at(-1).messages.some(message=>message.body===second));
  const filename="非公開の資料.txt",plain="添付ファイル内のテストデータ";
  const file=new File([plain],filename,{type:"text/plain"});
  const result=await alice.request("sendFile",{roomId:a.roomId,file,transactionId:randomUUID()});
  await waitPush(3);assert.equal(pushes[2].url,"https://fcm.googleapis.com/fixture/bob");
  const ownDownload=await alice.request("download",{roomId:a.roomId,eventId:result.eventId});
  assert.equal(new TextDecoder().decode(ownDownload.data),plain,"sender must decrypt its own attachment");
  alice.messages.clear();await alice.request("older");
  assert.ok(updates.alice.at(-1).messages.some(message=>message.body===first && message.mine),"sender history must decrypt again");
  await bob.request("older");
  const downloaded=await bob.request("download",{roomId:b.roomId,eventId:result.eventId});
  assert.equal(new TextDecoder().decode(downloaded.data),plain);assert.equal(downloaded.name,filename);
  const replay=await mf.dispatchFetch(lastSigned.url,{...lastSigned.options,headers:{...lastSigned.options.headers,Origin:origin}});
  assert.equal(replay.status,409);
  const forged=await mf.dispatchFetch(lastSigned.url,{...lastSigned.options,headers:{...lastSigned.options.headers,Origin:origin,"X-Device-Nonce":randomUUID()}});
  assert.equal(forged.status,401);
  for(const request of sent) {
    assert.equal(request.body.includes(first),false);assert.equal(request.body.includes(second),false);
    assert.equal(request.body.includes(filename),false);assert.equal(request.body.includes(plain),false);
  }
  pushStatus=410;
  await alice.request("sendText",{roomId:a.roomId,body:"expired subscription fixture",transactionId:randomUUID()});await waitPush(4);
  for(let i=0;i<100 && (await bob.request("pushConfiguration")).subscribed;i++)await new Promise(resolve=>setTimeout(resolve,10));
  assert.equal((await bob.request("pushConfiguration")).subscribed,false);
  await bob.request("registerPush",{subscription:subscription("bob")});pushStatus=500;
  await alice.request("sendText",{roomId:a.roomId,body:"push failure must not fail message",transactionId:randomUUID()});await waitPush(5);
  await bob.request("disablePush");assert.equal((await bob.request("pushConfiguration")).subscribed,false);
  await alice.request("sendText",{roomId:a.roomId,body:"notifications disabled fixture",transactionId:randomUUID()});
  await new Promise(resolve=>setTimeout(resolve,30));assert.equal(pushes.length,5);
  const unsignedPush=await mf.dispatchFetch("https://free.local/push/subscription",{method:"POST",headers:{Origin:origin,Authorization:"Bearer "+grant("alice",["bob"]),"Content-Type":"application/json"},body:JSON.stringify({enabled:false})});
  assert.equal(unsignedPush.status,401);
  const replacement=client("alice","bob");await assert.rejects(replacement.request("start",{accepted:true}),/別の端末/);
  await assert.rejects(alice.request("selectPeer",{peerId:"carol"}),/許可/);
  const denied=await mf.dispatchFetch("https://free.local/keys/upload",{method:"POST",headers:{Origin:origin,Authorization:"Bearer "+grant("alice",["bob"]),"Content-Type":"application/json"},body:"{}"});
  assert.equal(denied.status,401);
});
