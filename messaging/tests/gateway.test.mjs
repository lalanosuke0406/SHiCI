import test from "node:test";
import assert from "node:assert/strict";
import vm from "node:vm";
import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../../backend/86_ExecutiveMessengerGateway.js", import.meta.url), "utf8");
function gateway(properties) {
  properties = {EXECUTIVE_MATRIX_USERS_JSON: JSON.stringify({s1:"@alice:matrix.localhost",s2:"@bob:matrix.localhost"}), ...properties};
  const context = vm.createContext({ PropertiesService: { getScriptProperties: () => ({ getProperty: key => properties[key] }) },
    ExecutiveMessageService_listPeersForUser: () => [{userId:"s2",displayName:"bob"},{userId:"unmapped",displayName:"unknown"}] });
  vm.runInContext(source, context);
  return context;
}
test("missing/malformed client URL fails closed", () => {
  for (const url of [undefined, "javascript:alert(1)", "https://host.example/?token=secret", "https://u:p@host.example/",
    "https://host.example/#secret", "https://host.example/path", "http://localhost:8088/"]) {
    assert.throws(() => gateway({ EXECUTIVE_MATRIX_HOMESERVER_URL: url }).ExecutiveMessengerGateway_getConfiguration({userId:"s1"}));
  }
});
test("HTTPS origin accepted, no credentials returned", () => {
  const result = gateway({ EXECUTIVE_MATRIX_HOMESERVER_URL: "https://matrix.example.com/" }).ExecutiveMessengerGateway_getConfiguration({userId:"s1"});
  assert.equal(result.encryption, "required");
  assert.deepEqual(Object.keys(result).sort(), ["development", "encryption", "homeserverUrl", "peers", "provider", "userId"]);
  assert.equal(result.provider,"matrix");
  assert.equal(result.peers.length,1);
  assert.equal(result.peers[0].userId,"@bob:matrix.localhost");
});
test("localhost is only accepted with explicit development mode", () => {
  const result = gateway({ EXECUTIVE_MATRIX_HOMESERVER_URL: "http://localhost:8008/", EXECUTIVE_MESSENGER_ENV: "development" })
    .ExecutiveMessengerGateway_getConfiguration({userId:"s1"});
  assert.equal(result.development, true);
});
test("missing or unmapped identity cannot receive connection settings", () => {
  const context = gateway({EXECUTIVE_MATRIX_HOMESERVER_URL:"https://matrix.example.com/"});
  assert.throws(()=>context.ExecutiveMessengerGateway_getConfiguration());
  assert.throws(()=>context.ExecutiveMessengerGateway_getConfiguration({userId:"unknown"}));
});
test("all old messaging and push actions are retired, lock remains available", () => {
  const context = gateway({});
  for (const action of ["executiveMessageListPeers", "executiveMessageList", "executiveMessageSend", "executivePushConfig",
    "executivePushSubscribe", "executivePushUnsubscribe"]) assert.equal(context.ExecutiveMessengerGateway_isRetiredAction(action), true);
  for (const action of ["ask", "login", "executiveMessageLock"]) assert.equal(context.ExecutiveMessengerGateway_isRetiredAction(action), false);
});
test("router rejects old send before invoking any legacy storage", async () => {
  const context = gateway({});
  vm.runInContext(await readFile(new URL("../../backend/02_ActionRouter.js", import.meta.url), "utf8"), context);
  assert.equal(context.ActionRouter_routePost({ action: "executiveMessageSend", body: "private" }).code, "SECURE_MESSENGER_REQUIRED");
});
