// Use the same maintained Rust crypto implementation as the Matrix SDK.
// No application-defined encryption or window-only attachment shim.
export async function encryptAttachment(buffer) {
  const {Attachment, initAsync} = await import("@matrix-org/matrix-sdk-crypto-wasm");
  await initAsync();
  const encrypted = Attachment.encrypt(new Uint8Array(buffer));
  try { return {data: encrypted.encryptedData, info: JSON.parse(encrypted.mediaEncryptionInfo)}; }
  finally { encrypted.free(); }
}
export async function decryptAttachment(buffer, info) {
  const {Attachment, EncryptedAttachment, initAsync} = await import("@matrix-org/matrix-sdk-crypto-wasm");
  await initAsync();
  const encrypted = new EncryptedAttachment(new Uint8Array(buffer), JSON.stringify(info));
  try { return Attachment.decrypt(encrypted); }
  finally { encrypted.free(); }
}
