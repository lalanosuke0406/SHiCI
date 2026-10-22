// Local device persistence only. The non-extractable wrapping key and encrypted
// credentials are origin-scoped; this is not protection against same-origin XSS.
function database() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("shici-device-v1", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("device");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}
async function access(mode, action) {
  const db = await database();
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction("device", mode);
      const request = action(transaction.objectStore("device"));
      let result;
      request.onsuccess = () => { result = request.result; };
      transaction.oncomplete = () => resolve(result);
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally { db.close(); }
}
export async function loadDevice(name) {
  const record = await access("readonly", store => store.get(name));
  if (!record) return null;
  const plaintext = await crypto.subtle.decrypt({name: "AES-GCM", iv: record.iv,
    additionalData: new TextEncoder().encode(name)}, record.key, record.ciphertext);
  return JSON.parse(new TextDecoder().decode(plaintext));
}
export async function saveDevice(name, device) {
  const key = await crypto.subtle.generateKey({name: "AES-GCM", length: 256}, false, ["encrypt", "decrypt"]);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const plaintext = new TextEncoder().encode(JSON.stringify(device));
  try {
    const ciphertext = await crypto.subtle.encrypt({name: "AES-GCM", iv,
      additionalData: new TextEncoder().encode(name)}, key, plaintext);
    await access("readwrite", store => store.put({key, iv, ciphertext}, name));
  } finally { plaintext.fill(0); }
}
export async function forgetDevice(name) {
  await access("readwrite", store => store.delete(name));
}
