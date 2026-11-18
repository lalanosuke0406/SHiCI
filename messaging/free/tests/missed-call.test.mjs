import test from "node:test";
import assert from "node:assert/strict";
import {FreeApplication} from "../worker.mjs";

test("offline calls leave a private notice, and a stale acknowledgement preserves a newer notice", async () => {
  const records = new Map();
  const storage = {
    get: async key => records.get(key),
    put: async (key, value) => records.set(key, value),
    delete: async key => records.delete(key),
    transaction: async action => action(storage)
  };
  let sockets = [];
  const app = new FreeApplication({storage, getWebSockets: () => sockets}, {});
  app.quota = async () => {};
  app.profile = async () => ({});
  app.proof = async () => {};
  const request = async (sub, path, payload) => {
    const response = await app.fetch(new Request("https://test.invalid"+path, {
      method: payload ? "POST" : "GET",
      headers: {"X-Free-Grant":JSON.stringify({sub, peers:sub === "alice" ? ["bob"] : ["alice"]})},
      body: payload && JSON.stringify(payload)
    }));
    assert.equal(response.status, 200);
    return response.json();
  };
  const offer = () => request("alice", "/call/signal", {peer:"bob", id:crypto.randomUUID(), kind:"offer", sdp:"v=0"});
  assert.deepEqual(await offer(), {delivered:false});
  const {notice} = await request("bob", "/call/missed");
  assert.deepEqual(Object.keys(notice).sort(), ["at", "id"]);
  assert.equal((await request("alice", "/call/missed")).notice, null);
  await offer();
  const newer = (await request("bob", "/call/missed")).notice;
  await request("bob", "/call/missed/ack", {id:notice.id});
  assert.deepEqual((await request("bob", "/call/missed")).notice, newer);
  await request("bob", "/call/missed/ack", {id:newer.id});
  assert.equal((await request("bob", "/call/missed")).notice, null);
  sockets = [{deserializeAttachment: () => ({exp: Date.now()/1000+30}),send(){}}];
  assert.deepEqual(await offer(), {delivered:true});
  assert.equal((await request("bob", "/call/missed")).notice, null);
});
