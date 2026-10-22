import test from "node:test";
import assert from "node:assert/strict";
import {randomBytes,createHmac,randomUUID} from "node:crypto";
import {fileURLToPath} from "node:url";
import {mkdtempSync,mkdirSync} from "node:fs";
import {join,resolve} from "node:path";
import {Miniflare} from "miniflare";
import {FreeEngine} from "../../client/src/free-engine.js";
const origin="https://shici-46n.pages.dev";

test("single-device application: registration, explicit matching, bidirectional text and encrypted file, no silent second device",async t=>{
  const secret=randomBytes(32).toString("hex"),root=resolve(process.cwd(),"../../../..","work");mkdirSync(root,{recursive:true});
  const mf=new Miniflare({modules:true,modulesRoot:fileURLToPath(new URL("../../",import.meta.url)),
    scriptPath:fileURLToPath(new URL(process.env.SHICI_TEST_WORKER||"../../free/worker.mjs",import.meta.url)),compatibilityDate:"2026-07-30",
    durableObjects:{APPLICATION:{className:"FreeApplication",useSQLite:true}},r2Buckets:["ATTACHMENTS"],r2Persist:mkdtempSync(join(root,"free-r2-")),
    bindings:{ENABLE_FREE_MESSENGER:"true",FREE_AUTH_SECRET:secret,FREE_USERS_JSON:'["alice","bob","carol"]',SHICI_ORIGIN:origin}});
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
  assert.equal((await bob.request("start",{accepted:true})).ready,true);
  const a=await alice.request("selectPeer",{peerId:"bob"}),b=await bob.request("selectPeer",{peerId:"alice"});
  assert.equal(a.verificationRequired,true);assert.equal(a.code,b.code);
  await assert.rejects(alice.request("sendText",{roomId:a.roomId,body:"not yet authorized",transactionId:randomUUID()}));
  await alice.request("confirmPeer",{peerId:"bob",code:a.code});
  await bob.request("confirmPeer",{peerId:"alice",code:b.code});
  const first="暗号化した業務メッセージ（テスト）",second="返信も暗号化されます（テスト）";
  await alice.request("sendText",{roomId:a.roomId,body:first,transactionId:randomUUID()});
  await bob.request("older");
  assert.ok(updates.bob.at(-1).messages.some(message=>message.body===first));
  await bob.request("sendText",{roomId:b.roomId,body:second,transactionId:randomUUID()});
  await alice.request("older");
  assert.ok(updates.alice.at(-1).messages.some(message=>message.body===second));
  const filename="非公開の資料.txt",plain="添付ファイル内のテストデータ";
  const file=new File([plain],filename,{type:"text/plain"});
  const result=await alice.request("sendFile",{roomId:a.roomId,file,transactionId:randomUUID()});
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
  const replacement=client("alice","bob");await assert.rejects(replacement.request("start",{accepted:true}),/別の端末/);
  await assert.rejects(alice.request("selectPeer",{peerId:"carol"}),/許可/);
  const denied=await mf.dispatchFetch("https://free.local/keys/upload",{method:"POST",headers:{Origin:origin,Authorization:"Bearer "+grant("alice",["bob"]),"Content-Type":"application/json"},body:"{}"});
  assert.equal(denied.status,401);
});

