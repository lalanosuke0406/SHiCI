// Test-only key directory. This is not a production identity service or client.
import test from "node:test";
import assert from "node:assert/strict";
import {randomUUID,createHmac,randomBytes} from "node:crypto";
import {fileURLToPath} from "node:url";
import {Miniflare} from "miniflare";
import {OlmMachine,UserId,DeviceId,RoomId,RequestType,EncryptionSettings,EncryptionAlgorithm,
  CollectStrategy,LocalTrust,DeviceLists,DecryptionSettings,TrustRequirement,initAsync} from "@matrix-org/matrix-sdk-crypto-wasm";

class PublicDirectory {
  devices=new Map();
  async process(machine, request) {
    const body=JSON.parse(request.body);
    let response;
    if(request.type===RequestType.KeysUpload) {
      const id=machine.userId.toString(),current=this.devices.get(id)||{};
      this.devices.set(id,{...current,device:body.device_keys||current.device,keys:{...current.keys,...body.one_time_keys}});
      response={one_time_key_counts:{signed_curve25519:Object.keys(this.devices.get(id).keys).length}};
    } else if(request.type===RequestType.KeysQuery) {
      const devices={},masters={},self={},signers={};
      for(const user of Object.keys(body.device_keys)) {
        const found=this.devices.get(user);
        if(found?.device) devices[user]={[found.device.device_id]:found.device};
        if(found?.signing) {
          masters[user]=found.signing.master_key;self[user]=found.signing.self_signing_key;signers[user]=found.signing.user_signing_key;
        }
      }
      response={device_keys:devices,failures:{},master_keys:masters,self_signing_keys:self,user_signing_keys:signers};
    } else if(request.type===RequestType.KeysClaim) {
      const claimed={};
      for(const [user,devices] of Object.entries(body.one_time_keys)) {
        const found=this.devices.get(user);
        for(const device of Object.keys(devices)) {
          const [id,key]=Object.entries(found.keys)[0]; delete found.keys[id];
          claimed[user]||={};claimed[user][device]={[id]:key};
        }
      }
      response={one_time_keys:claimed,failures:{}};
    } else {throw Error("Unexpected crypto request type: "+request.type);}
    await machine.markRequestAsSent(request.id,request.type,JSON.stringify(response));
  }
  async signDevice(machine) {
    const requests=await machine.bootstrapCrossSigning(false);
    const upload=requests.uploadKeysRequest;
    if(upload) {try {await this.process(machine,upload);} finally {upload.free();}}
    const user=machine.userId.toString(),entry=this.devices.get(user);
    const signing=requests.uploadSigningKeysRequest;
    try {entry.signing=JSON.parse(signing.body);} finally {signing.free();}
    const signatures=requests.uploadSignaturesRequest;
    try {
      for(const [device,value] of Object.entries(JSON.parse(signatures.body)[user]||{})) {
        const target=device===entry.device.device_id ? entry.device :
          entry.signing.master_key.keys["ed25519:"+device] ? entry.signing.master_key : undefined;
        if(target) {
          target.signatures||={};
          for(const [signer,values] of Object.entries(value.signatures||{}))
            target.signatures[signer]={...target.signatures[signer],...values};
        }
      }
      if(signatures.id) await machine.markRequestAsSent(signatures.id,signatures.type,'{"failures":{}}');
    } finally {signatures.free();requests.free();}
  }
  async flush(machine) {
    for(let i=0;i<5;i++) {
      const requests=await machine.outgoingRequests();
      if(!requests.length) return;
      for(const request of requests) {try {await this.process(machine,request);} finally {request.free();}}
    }
    throw Error("Key directory did not settle");
  }
}

test("single-device E2EE: verify public keys, share only trusted devices, relay ciphertext and reject corruption",async t=>{
  let stage="initialization";
  try {
  await initAsync();
  const aliceId="@alice:probe.invalid",bobId="@bob:probe.invalid";
  const alice=await OlmMachine.initialize(new UserId(aliceId),new DeviceId("ALICEONE"));
  const bob=await OlmMachine.initialize(new UserId(bobId),new DeviceId("BOBONE"));
  const outsider=await OlmMachine.initialize(new UserId("@carol:probe.invalid"),new DeviceId("CAROLONE"));
  t.after(()=>{alice.close();bob.close();outsider.close();});
  const directory=new PublicDirectory();
  await directory.flush(alice);await directory.flush(bob);
  await directory.signDevice(alice);await directory.signDevice(bob);
  await alice.updateTrackedUsers([new UserId(bobId)]);
  await bob.updateTrackedUsers([new UserId(aliceId)]);
  await directory.flush(alice);await directory.flush(bob);
  const claim=await alice.getMissingSessions([new UserId(bobId)]);
  if(claim) {try {await directory.process(alice,claim);} finally {claim.free();}}
  const settings=new EncryptionSettings();settings.algorithm=EncryptionAlgorithm.MegolmV1AesSha2;
  settings.sharingStrategy=CollectStrategy.onlyTrustedDevices();
  const room="!single-device:probe.invalid";
  const withheld=await alice.shareRoomKey(new RoomId(room),[new UserId(bobId)],settings);
  assert.equal(withheld.filter(request=>request.event_type==="m.room.encrypted").length,0,"unknown device must not receive session keys");
  for(const request of withheld) {await alice.markRequestAsSent(request.id,request.type,"{}");request.free();}
  // Expected fingerprints come directly from the peer in this test, not the directory.
  // A real UI must obtain this confirmation via an independent channel, never auto-trust.
  for(const [local,peer,user,device] of [[alice,bob,bobId,"BOBONE"],[bob,alice,aliceId,"ALICEONE"]]) {
    const known=await local.getDevice(new UserId(user),new DeviceId(device));
    assert.ok(known);
    assert.equal(known.ed25519Key.toBase64(),peer.identityKeys.ed25519.toBase64());
    await known.setLocalTrust(LocalTrust.Verified);known.free();
  }
  const shared=await alice.shareRoomKey(new RoomId(room),[new UserId(bobId)],settings);
  const encryptedKeys=shared.filter(request=>request.event_type==="m.room.encrypted");
  assert.ok(encryptedKeys.length>0);

  const secret=randomBytes(32).toString("hex"),origin="https://shici-46n.pages.dev";
  const mf=new Miniflare({modules:true,scriptPath:fileURLToPath(new URL("../worker.mjs",import.meta.url)),
    compatibilityDate:"2026-07-30",durableObjects:{LEDGER:{className:"ProbeLedger",useSQLite:true}},
    bindings:{ENABLE_ISOLATED_PROBE:"true",PROBE_AUTH_SECRET:secret,SHICI_ORIGIN:origin,PROBE_USERS_JSON:'["alice","bob","carol"]'}});
  t.after(()=>mf.dispose());
  const credential=sub=>{
    const data=Buffer.from(JSON.stringify({aud:"shici-free-feasibility",sub,pair:["alice","bob"],exp:Math.floor(Date.now()/1000)+120})).toString("base64url");
    return data+"."+createHmac("sha256",secret).update(data).digest("base64url");
  };
  const headers=sub=>({Origin:origin,Authorization:"Bearer "+credential(sub),"Content-Type":"application/json"});
  async function relay(value,subject="alice") {
    const id=randomUUID(),ciphertext=Buffer.from(JSON.stringify(value)).toString("base64");
    const sent=await mf.dispatchFetch("https://probe.local/events",{method:"POST",headers:headers(subject),body:JSON.stringify({id,ciphertext})});
    assert.equal(sent.status,200);
    const history=await (await mf.dispatchFetch("https://probe.local/events",{headers:headers(subject==="alice"?"bob":"alice")})).json();
    const found=history.find(event=>event.id===id);
    return JSON.parse(Buffer.from(found.ciphertext,"base64").toString("utf8"));
  }
  for(const request of shared) {
    if(request.event_type==="m.room.encrypted") {
      stage="receive encrypted session key";
      const content=JSON.parse(request.body).messages[bobId].BOBONE;
      const transported=await relay({type:"m.room.encrypted",sender:aliceId,content});
      await bob.receiveSyncChanges(JSON.stringify([transported]),new DeviceLists(),new Map());
    }
    await alice.markRequestAsSent(request.id,request.type,"{}");request.free();
  }
  const plaintext="単一端末の暗号化送信テスト（業務データではありません）";
  stage="encrypt room event";
  const content=JSON.parse(await alice.encryptRoomEvent(new RoomId(room),"m.room.message",JSON.stringify({msgtype:"m.text",body:plaintext})));
  assert.equal(JSON.stringify(content).includes(plaintext),false);
  const encryptedEvent=await relay({type:"m.room.encrypted",sender:aliceId,event_id:"$"+randomUUID(),origin_server_ts:Date.now(),content});
  const decryptSettings=new DecryptionSettings(TrustRequirement.CrossSigned);
  stage="decrypt room event";
  const decoded=await bob.decryptRoomEvent(JSON.stringify(encryptedEvent),new RoomId(room),decryptSettings);
  try {
    assert.equal(JSON.parse(decoded.event).content.body,plaintext);
    assert.equal(decoded.senderClaimedEd25519Key,alice.identityKeys.ed25519.toBase64());
  } finally {decoded.free();}
  await assert.rejects(outsider.decryptRoomEvent(JSON.stringify(encryptedEvent),new RoomId(room),new DecryptionSettings(TrustRequirement.Untrusted)));
  stage="reject modified event";
  const corrupt=structuredClone(encryptedEvent);
  corrupt.content.ciphertext=(corrupt.content.ciphertext[0]==="A"?"B":"A")+corrupt.content.ciphertext.slice(1);
  await assert.rejects(bob.decryptRoomEvent(JSON.stringify(corrupt),new RoomId(room),decryptSettings));
  stage="encrypted reply in the opposite direction";
  const bobClaim=await bob.getMissingSessions([new UserId(aliceId)]);
  if(bobClaim) {try {await directory.process(bob,bobClaim);} finally {bobClaim.free();}}
  const bobShares=await bob.shareRoomKey(new RoomId(room),[new UserId(aliceId)],settings);
  for(const request of bobShares) {
    if(request.event_type==="m.room.encrypted") {
      const content=JSON.parse(request.body).messages[aliceId].ALICEONE;
      const event=await relay({type:"m.room.encrypted",sender:bobId,content},"bob");
      await alice.receiveSyncChanges(JSON.stringify([event]),new DeviceLists(),new Map());
    }
    await bob.markRequestAsSent(request.id,request.type,"{}");request.free();
  }
  const answer="逆方向の暗号化返信テスト";
  const answerContent=JSON.parse(await bob.encryptRoomEvent(new RoomId(room),"m.room.message",JSON.stringify({msgtype:"m.text",body:answer})));
  assert.equal(JSON.stringify(answerContent).includes(answer),false);
  const answerEvent=await relay({type:"m.room.encrypted",sender:bobId,event_id:"$"+randomUUID(),origin_server_ts:Date.now(),content:answerContent},"bob");
  const decryptedAnswer=await alice.decryptRoomEvent(JSON.stringify(answerEvent),new RoomId(room),decryptSettings);
  try {
    assert.equal(JSON.parse(decryptedAnswer.event).content.body,answer);
    assert.equal(decryptedAnswer.senderClaimedEd25519Key,bob.identityKeys.ed25519.toBase64());
  } finally {decryptedAnswer.free();}
  decryptSettings.free();settings.free();
  } catch(error) {throw new Error(stage+": "+(error.message || error.description || error.code || error.constructor.name));}
});
