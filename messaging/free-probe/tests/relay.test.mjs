import test from "node:test";
import assert from "node:assert/strict";
import {createHmac,randomBytes,randomUUID} from "node:crypto";
import {fileURLToPath} from "node:url";
import {mkdtempSync,mkdirSync} from "node:fs";
import {resolve,join} from "node:path";
import {setTimeout as delay} from "node:timers/promises";
import {Miniflare} from "miniflare";
import {Attachment,EncryptedAttachment,initAsync} from "@matrix-org/matrix-sdk-crypto-wasm";
const ORIGIN="https://shici-46n.pages.dev";
const secret=randomBytes(32).toString("hex");
const token=(sub="alice",pair=["alice","bob"],exp=Math.floor(Date.now()/1000)+60)=>{
  const body=Buffer.from(JSON.stringify({aud:"shici-free-feasibility",sub,pair,exp})).toString("base64url");
  return body+"."+createHmac("sha256",secret).update(body).digest("base64url");
};
function fixture(t, overrides={}) {
  // workerd's Windows R2 temporary blob names exceed MAX_PATH under long AppContainer temp paths.
  const localRoot=resolve(process.cwd(),"../../../..","work");
  mkdirSync(localRoot,{recursive:true});
  const r2State=mkdtempSync(join(localRoot,"r2-probe-"));
  const mf=new Miniflare({modules:true,scriptPath:fileURLToPath(new URL("../worker.mjs",import.meta.url)),
    compatibilityDate:"2026-07-30",durableObjects:{LEDGER:{className:"ProbeLedger",useSQLite:true}},r2Buckets:["ATTACHMENTS"],
    r2Persist:r2State,
    bindings:{ENABLE_ISOLATED_PROBE:"true",PROBE_AUTH_SECRET:secret,SHICI_ORIGIN:ORIGIN,
      PROBE_USERS_JSON:JSON.stringify(["alice","bob","carol"]),...overrides}});
  t.after(()=>mf.dispose());
  const request=(path,options={},credential=token())=>mf.dispatchFetch("https://probe.local"+path,{
    ...options,headers:{Origin:ORIGIN,Authorization:"Bearer "+credential,...options.headers}});
  return {mf,request};
}
const opaque=()=>({id:randomUUID(),ciphertext:randomBytes(64).toString("base64")});
const post=event=>({method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(event)});

test("disabled probe, forged/expired tickets, wrong origin and unapproved pair fail closed",async t=>{
  const {request}=fixture(t);
  assert.equal((await request("/events",{},token()+"x")).status,401);
  assert.equal((await request("/events",{},token("alice",["alice","bob"],Math.floor(Date.now()/1000)-1))).status,401);
  assert.equal((await request("/events",{},token("alice",["alice","outsider"]))).status,401);
  assert.equal((await request("/events",{headers:{Origin:"https://unapproved.net"}})).status,403);
  const disabled=fixture(t,{ENABLE_ISOLATED_PROBE:"false"});
  assert.equal((await disabled.request("/events")).status,503);
});

test("hibernatable WebSocket receives committed opaque events; retries deduplicate and pairs remain isolated",async t=>{
  const {request}=fixture(t);
  const response=await request("/connect",{headers:{Upgrade:"websocket","Sec-WebSocket-Protocol":"shici-probe-v1, "+token("bob")}});
  assert.equal(response.status,101);
  const socket=response.webSocket; socket.accept();
  t.after(()=>socket.close(1000,"test_complete"));
  const incoming=new Promise((resolve,reject)=>{
    const timeout=setTimeout(()=>reject(Error("No event received")),3000);
    socket.addEventListener("message",event=>{clearTimeout(timeout);resolve(JSON.parse(event.data));},{once:true});
  });
  const event=opaque();
  assert.equal((await request("/events",post(event))).status,200);
  assert.equal((await incoming).id,event.id);
  assert.equal((await request("/events",post(event))).status,200);
  assert.equal((await request("/events",post({...event,ciphertext:randomBytes(64).toString("base64")}))).status,409);
  assert.equal((await (await request("/events",{},token("bob"))).json()).length,1);
  assert.deepEqual(await (await request("/events",{},token("carol",["alice","carol"]))).json(),[]);
  assert.equal((await request("/events",post({id:randomUUID(),body:"must not be stored"}))).status,400);
});

test("official Rust encrypted attachment round trips through private R2; another pair cannot fetch it",async t=>{
  const {mf,request}=fixture(t);
  await initAsync();
  const plain=new TextEncoder().encode("test-only attachment — not business data");
  const encrypted=Attachment.encrypt(plain);
  let data,info;
  try {data=encrypted.encryptedData; info=encrypted.mediaEncryptionInfo;} finally {encrypted.free();}
  assert.notDeepEqual(Buffer.from(data),Buffer.from(plain));
  const response=await request("/attachments",{method:"POST",headers:{"Content-Type":"application/octet-stream"},body:data});
  assert.equal(response.status,201);
  const {id}=await response.json();
  const result=await request("/attachments/"+id,{},token("bob"));
  assert.equal(result.status,200);
  assert.equal(result.headers.get("Cache-Control"),"no-store");
  const received=new Uint8Array(await result.arrayBuffer());
  const file=new EncryptedAttachment(received,info);
  try {assert.deepEqual(Buffer.from(Attachment.decrypt(file)),Buffer.from(plain));} finally {file.free();}
  const changed=received.slice(); changed[0]^=1;
  const tampered=new EncryptedAttachment(changed,info);
  try {assert.throws(()=>Attachment.decrypt(tampered));} finally {tampered.free();}
  assert.equal((await request("/attachments/"+id,{},token("carol",["alice","carol"]))).status,404);
  const objects=await (await mf.getR2Bucket("ATTACHMENTS")).list();
  assert.equal(objects.objects.length,1);
  assert.equal(JSON.stringify(objects).includes("test-only attachment"),false);
});

test("expired authorization cannot read history or receive a later WebSocket event",async t=>{
  const {request}=fixture(t);
  await request("/events"); // Start workerd before minting the deliberately short ticket.
  const short=token("bob",["alice","bob"],Math.floor(Date.now()/1000)+3);
  const response=await request("/connect",{headers:{Upgrade:"websocket","Sec-WebSocket-Protocol":"shici-probe-v1, "+short}});
  assert.equal(response.status,101);
  const socket=response.webSocket; socket.accept();
  const messages=[];socket.addEventListener("message",event=>messages.push(event.data));
  t.after(()=>socket.close(1000,"test_complete"));
  await delay(3500);
  assert.equal((await request("/events",{},short)).status,401);
  assert.equal((await request("/events",post(opaque()))).status,200);
  await delay(250);
  assert.deepEqual(messages,[]);
});

test("concurrent attachment reservations stop at daily write cap; oversized input does not reach R2",async t=>{
  const {mf,request}=fixture(t);
  assert.equal((await request("/attachments",{method:"POST",headers:{"Content-Type":"application/octet-stream"},body:new Uint8Array(5*1024*1024+1)})).status,413);
  const results=await Promise.all(Array.from({length:101},()=>request("/attachments",{
    method:"POST",headers:{"Content-Type":"application/octet-stream"},body:Uint8Array.of(123)})));
  assert.equal(results.filter(response=>response.status===201).length,100);
  assert.equal(results.filter(response=>response.status===429).length,1);
  const objects=await (await mf.getR2Bucket("ATTACHMENTS")).list();
  assert.equal(objects.objects.length,100);
});
