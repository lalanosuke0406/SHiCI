import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import {readFile} from "node:fs/promises";
import {createHmac,randomBytes} from "node:crypto";
const source=await readFile(new URL("../../backend/86_ExecutiveMessengerGateway.js",import.meta.url),"utf8");
const secret=randomBytes(32).toString("hex");
function gateway(extra={}) {
  const props={EXECUTIVE_MESSENGER_PROVIDER:"cloudflare",EXECUTIVE_FREE_API_URL:"https://shici-free.account.workers.dev/",
    EXECUTIVE_FREE_AUTH_SECRET:secret,EXECUTIVE_FREE_USERS_JSON:'{"s1":"alice","s2":"bob","s3":"carol"}',...extra};
  const context=vm.createContext({PropertiesService:{getScriptProperties:()=>({getProperty:key=>props[key]})},
    ExecutiveMessageService_listPeersForUser:()=>[{userId:"s2",displayName:"Bob"},{userId:"not-executive",displayName:"Other"}],
    Utilities:{Charset:{UTF_8:"UTF-8"},base64EncodeWebSafe:value=>Buffer.from(value).toString("base64url"),
      computeHmacSha256Signature:(body,key)=>createHmac("sha256",key).update(body).digest()}});
  vm.runInContext(source,context);return context;
}
test("GAS issues a short, signed grant for the role-filtered peers, never its signing secret",()=>{
  const config=gateway().ExecutiveMessengerGateway_getConfiguration({userId:"s1"});
  assert.equal(config.provider,"cloudflare");assert.equal(config.userId,"alice");assert.equal(config.peers.length,1);
  const [body,signature]=config.accessGrant.split(".");
  assert.equal(signature,createHmac("sha256",secret).update(body).digest("base64url"));
  const grant=JSON.parse(Buffer.from(body,"base64url"));
  assert.deepEqual(grant.peers,["bob"]);assert.equal(grant.sub,"alice");assert.equal(grant.exp-grant.iat,900);
  assert.equal(JSON.stringify(config).includes(secret),false);
});
test("free configuration rejects ambiguous mappings, unknown users and non-HTTPS endpoints",()=>{
  for(const extra of [{EXECUTIVE_FREE_USERS_JSON:'{"s1":"alice","s2":"alice"}'},{EXECUTIVE_FREE_AUTH_SECRET:"short"},
    {EXECUTIVE_FREE_API_URL:"http://localhost:8787"},{EXECUTIVE_FREE_API_URL:"https://host.net/path"}])
    assert.throws(()=>gateway(extra).ExecutiveMessengerGateway_getConfiguration({userId:"s1"}));
  assert.throws(()=>gateway().ExecutiveMessengerGateway_getConfiguration({userId:"unknown"}));
});
