import test from "node:test";
import assert from "node:assert/strict";
import {generateKeyPairSync,randomBytes,createPublicKey,verify,hkdfSync,createDecipheriv,diffieHellman} from "node:crypto";
import {validateSubscription,deliverPush,pushConfiguration} from "../push.mjs";
function fixture(){
  const vapid=generateKeyPairSync("ec",{namedCurve:"prime256v1"}),jwk=vapid.privateKey.export({format:"jwk"});
  const raw=Buffer.concat([Buffer.from([4]),Buffer.from(jwk.x,"base64url"),Buffer.from(jwk.y,"base64url")]);
  const client=generateKeyPairSync("ec",{namedCurve:"prime256v1"}),pub=client.publicKey.export({format:"jwk"});
  const auth=randomBytes(16),p256dh=Buffer.concat([Buffer.from([4]),Buffer.from(pub.x,"base64url"),Buffer.from(pub.y,"base64url")]);
  return {vapid,client,p256dh,auth,env:{FREE_PUSH_VAPID:JSON.stringify({subject:"https://shici-46n.pages.dev",publicKey:raw.toString("base64url"),privateKey:jwk.d})},
    subscription:{endpoint:"https://web.push.apple.com/fixture",keys:{p256dh:p256dh.toString("base64url"),auth:auth.toString("base64url")}}};
}
test("Web Push uses signed VAPID and RFC8291 encryption containing only an empty notice",async()=>{
  const f=fixture();assert.deepEqual(await validateSubscription(f.subscription),f.subscription);
  const result=await deliverPush(f.subscription,f.env,async(url,options)=>{
    assert.equal(url,f.subscription.endpoint);assert.equal(options.redirect,"manual");
    assert.equal(options.headers["content-encoding"],"aes128gcm");assert.equal(options.headers.ttl,"3600");
    const auth=options.headers.authorization.match(/^vapid t=([^,]+), k=(.+)$/);assert.ok(auth);
    const [header,claims,signature]=auth[1].split(".");
    assert.equal(JSON.parse(Buffer.from(claims,"base64url")).aud,"https://web.push.apple.com");
    assert.equal(verify("sha256",Buffer.from(header+"."+claims),{key:f.vapid.publicKey,dsaEncoding:"ieee-p1363"},Buffer.from(signature,"base64url")),true);
    const body=Buffer.from(options.body);assert.equal(body.length,4096);
    const sender=body.subarray(21,21+body[20]);assert.equal(sender.length,65);
    const serverKey=createPublicKey({format:"jwk",key:{kty:"EC",crv:"P-256",x:sender.subarray(1,33).toString("base64url"),y:sender.subarray(33).toString("base64url")}});
    const shared=diffieHellman({privateKey:f.client.privateKey,publicKey:serverKey});
    const ikm=hkdfSync("sha256",shared,f.auth,Buffer.concat([Buffer.from("WebPush: info\0"),f.p256dh,sender]),32);
    const salt=body.subarray(0,16),cek=hkdfSync("sha256",ikm,salt,Buffer.from("Content-Encoding: aes128gcm\0"),16),iv=hkdfSync("sha256",ikm,salt,Buffer.from("Content-Encoding: nonce\0"),12);
    const data=body.subarray(86),decipher=createDecipheriv("aes-128-gcm",cek,iv);decipher.setAuthTag(data.subarray(-16));
    const plain=Buffer.concat([decipher.update(data.subarray(0,-16)),decipher.final()]);
    let end=plain.length-1;while(plain[end]===0)end--;assert.equal(plain[end],2);assert.deepEqual(JSON.parse(plain.subarray(0,end).toString()),{});
    return new Response(null,{status:201});
  });assert.equal(result,"accepted");
});
test("invalid endpoints and keys are rejected before any outbound request",async()=>{
  const f=fixture();for(const endpoint of ["http://web.push.apple.com/x","https://127.0.0.1/x","https://web.push.apple.com.evil.test/x","https://user:pass@web.push.apple.com/x","https://web.push.apple.com:8443/x","https://web.push.apple.com/x#fragment"])
    await assert.rejects(validateSubscription({...f.subscription,endpoint}),/invalid_push_subscription/);
  await assert.rejects(validateSubscription({...f.subscription,keys:{...f.subscription.keys,p256dh:"A".repeat(87)}}));
  assert.equal(pushConfiguration({}),null);
});
test("push failures stay best effort; 404/410 mark expired subscriptions",async()=>{
  const f=fixture();for(const status of [404,410])assert.equal(await deliverPush(f.subscription,f.env,async()=>new Response(null,{status})),"expired");
  assert.equal(await deliverPush(f.subscription,f.env,async()=>new Response(null,{status:500})),"failed");
  assert.equal(await deliverPush(f.subscription,f.env,async()=>{throw Error("offline");}),"failed");
});
