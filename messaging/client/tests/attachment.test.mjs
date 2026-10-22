import test from "node:test";
import assert from "node:assert/strict";
import {encryptAttachment, decryptAttachment} from "../src/attachment.js";
test("official Rust attachment encryption round trips and rejects tampered ciphertext", async () => {
  const original = new TextEncoder().encode("SHiCI attachment test only");
  const encrypted = await encryptAttachment(original.buffer);
  assert.notDeepEqual(encrypted.data, original);
  assert.equal(encrypted.info.v, "v2");
  assert.deepEqual(await decryptAttachment(encrypted.data, encrypted.info), original);
  const corrupt = Uint8Array.from(encrypted.data); corrupt[0] ^= 1;
  await assert.rejects(decryptAttachment(corrupt, encrypted.info));
});
