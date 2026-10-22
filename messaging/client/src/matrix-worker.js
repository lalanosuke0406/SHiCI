import {createClient, ClientEvent, RoomEvent, MatrixEventEvent, EventType, MsgType} from "matrix-js-sdk";
import {decodeRecoveryKey} from "matrix-js-sdk/lib/crypto-api/recovery-key.js";
import {OnlySignedDevicesIsolationMode} from "matrix-js-sdk/lib/crypto-api/index.js";
import {MemoryStore} from "matrix-js-sdk/lib/store/memory.js";
import * as attachment from "./attachment.js";
import {loadDevice, saveDevice, forgetDevice} from "./vault.js";

const quietLogger = {trace(){}, debug(){}, info(){}, warn(){}, error(){}, getChild(){return this;}};
const ALG = "m.megolm.v1.aes-sha2";
const MAX_BYTES = 50 * 1024 * 1024; // Whole-buffer encryption: cap memory use on phones.
let client;
let configuration;
let activeRoom;
let identity;
let storageName;
let recovery;
let generatedKey;
let readyToSend = false;
const watched = new WeakSet();
const mediaRequests = new Set();
const post = data => self.postMessage(data);
const snapshot = () => {
  if (!activeRoom || !readyToSend) return;
  const room = client.getRoom(activeRoom);
  const messages = room.getLiveTimeline().getEvents().filter(event => {
    if (event.isEncrypted()) {
      if (!watched.has(event)) {
        watched.add(event);
        event.on(MatrixEventEvent.Decrypted, snapshot);
      }
      void client.decryptEventIfNeeded(event).catch(() => {});
    }
    return event.getType() === EventType.RoomMessage || event.isEncrypted();
  }).map(event => {
    const content = event.getContent();
    return {id: event.getId(), transactionId: event.getTxnId(), sender: event.getSender(), mine: event.getSender() === identity,
      timestamp: event.getTs(), status: event.status || "sent", encrypted: event.isEncrypted(),
      body: event.isDecryptionFailure() ? "この端末で復号できません。履歴の復元を確認してください。" : content.body || "復号しています…",
      attachment: content.file ? {name: content.body || "添付", mime: content.info?.mimetype || "application/octet-stream",
        size: content.info?.size || 0} : null};
  });
  post({type: "messages", roomId: activeRoom, messages});
};
function validateConfiguration(config) {
  if (config.provider !== "matrix" || config.encryption !== "required") throw new Error("暗号化接続の設定がありません。");
  const url = new URL(config.homeserverUrl);
  if ((url.protocol !== "https:" && !(config.development && url.hostname === "localhost" && url.protocol === "http:")) ||
      url.username || url.password || url.search || url.hash || url.pathname !== "/") throw new Error("接続先の設定が正しくありません。");
  if (!/^@[^:]+:[^\s]+$/.test(config.userId)) throw new Error("利用アカウントの設定がありません。");
  return config;
}
async function start({config, password}) {
  configuration = validateConfiguration(config);
  storageName = `${configuration.homeserverUrl}|${configuration.userId}`;
  let device = await loadDevice(storageName);
  if (!device) {
    if (!password) return {loginRequired: true};
    const loginClient = createClient({baseUrl: config.homeserverUrl, logger: quietLogger});
    const login = await loginClient.login("m.login.password", {identifier: {type: "m.id.user", user: config.userId},
      password, initial_device_display_name: "SHiCI"});
    if (login.user_id !== config.userId) throw new Error("アカウントが一致しません。");
    device = {accessToken: login.access_token, userId: login.user_id, deviceId: login.device_id,
      storageKey: Array.from(crypto.getRandomValues(new Uint8Array(32)))};
    // Save the device before crypto starts so a failed startup never reuses a
    // Matrix device with a different local crypto database.
    await saveDevice(storageName, device);
  }
  identity = device.userId;
  client = createClient({baseUrl: config.homeserverUrl, accessToken: device.accessToken,
    userId: device.userId, deviceId: device.deviceId, logger: quietLogger, store: new MemoryStore(),
    fetchFn: (input, options) => fetch(input, {...options, cache: "no-store"}),
    cryptoCallbacks: {getSecretStorageKey: async ({keys}) => {
      const keyId = await client.secretStorage.getDefaultKeyId();
      return recovery && keys[keyId] ? [keyId, recovery] : null;
    }, cacheSecretStorageKey: (_id, _info, key) => { recovery = key; }}});
  // Synapse can replay a cached initial /sync response immediately after a
  // client restart. Do not infer "no recovery key" from that stale snapshot.
  // Use authoritative account-data GETs for encryption setup metadata, including
  // the guard that prevents silently replacing an existing recovery identity.
  const originalAccountData = client.getAccountDataFromServer.bind(client);
  client.getAccountDataFromServer = async type => {
    if (!/^(m\.secret_storage\.|m\.cross_signing\.|m\.megolm_backup\.)/.test(type)) return originalAccountData(type);
    try {
      return await client.http.authedRequest("GET", "/user/" + encodeURIComponent(identity) + "/account_data/" + encodeURIComponent(type));
    } catch (error) { if (error.errcode === "M_NOT_FOUND") return null; throw error; }
  };
  try {
    const who = await client.whoami();
    if (who.user_id !== config.userId) throw new Error("アカウントが一致しません。");
  } catch (error) {
    if (error.errcode === "M_UNKNOWN_TOKEN") { await forgetDevice(storageName); return {loginRequired: true}; }
    throw error;
  }
  const storeHash = new Uint8Array(await crypto.subtle.digest("SHA-256", new TextEncoder().encode(storageName)));
  const prefix = Array.from(storeHash, value => value.toString(16).padStart(2, "0")).join("");
  await client.initRustCrypto({cryptoDatabasePrefix: "shici-" + prefix + device.deviceId, storageKey: Uint8Array.from(device.storageKey)});
  client.getCrypto().setDeviceIsolationMode(new OnlySignedDevicesIsolationMode());
  // Do not run two clients against the same IndexedDB crypto store. The main
  // thread holds a Web Lock for this account during this worker's lifetime.
  client.on(RoomEvent.Timeline, snapshot);
  client.on(RoomEvent.LocalEchoUpdated, snapshot);
  const prepared = new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("初期同期に時間がかかっています。閉じてから再度開いてください。")), 45000);
    client.on(ClientEvent.Sync, state => {
      if (state === "PREPARED") { clearTimeout(timer); resolve(); }
    });
  });
  await client.startClient({initialSyncLimit: 50});
  await prepared;
  const cryptoApi = client.getCrypto();
  readyToSend = await cryptoApi.isCrossSigningReady() && await cryptoApi.isSecretStorageReady();
  return {loginRequired: false, recoveryRequired: !readyToSend,
    existingRecovery: Boolean(await client.secretStorage.getDefaultKeyId()), userId: identity};
}
async function authentication(password, makeRequest) {
  try { return await makeRequest(undefined); }
  catch (error) {
    const challenge = error.data;
    if (!password || !challenge?.flows?.some(flow => flow.stages.includes("m.login.password")))
      throw new Error("鍵の設定に本人のパスワード確認が必要です。");
    return makeRequest({type: "m.login.password", session: challenge.session,
      identifier: {type: "m.id.user", user: identity}, password});
  }
}
async function generateRecovery() {
  if (await client.secretStorage.getDefaultKeyId()) throw new Error("既存のリカバリーキーを入力してください。上書きしません。");
  generatedKey = await client.getCrypto().createRecoveryKeyFromPassphrase();
  recovery = generatedKey.privateKey;
  return {key: generatedKey.encodedPrivateKey};
}
async function finishRecovery({key, password, saved}) {
  const api = client.getCrypto();
  const keyInfo = await client.secretStorage.getKey();
  if (keyInfo) {
    recovery = decodeRecoveryKey(String(key || "").trim());
    if (!await client.secretStorage.checkKey(recovery, keyInfo[1])) { recovery.fill(0); recovery = null; throw new Error("リカバリーキーが一致しません。"); }
    await api.bootstrapCrossSigning({authUploadDeviceSigningKeys: request => authentication(password, request)});
    await api.loadSessionBackupPrivateKeyFromSecretStorage();
    await api.checkKeyBackupAndEnable();
    await api.restoreKeyBackup();
  } else {
    if (!generatedKey || !saved) throw new Error("リカバリーキーを保管したことを確認してください。");
    await api.bootstrapCrossSigning({authUploadDeviceSigningKeys: request => authentication(password, request)});
    await api.bootstrapSecretStorage({createSecretStorageKey: async () => generatedKey, setupNewKeyBackup: true});
  }
  readyToSend = await api.isCrossSigningReady() && await api.isSecretStorageReady();
  generatedKey = null;
  if (!readyToSend) throw new Error("鍵の設定が完了していません。");
  return {ready: true};
}
function allowedPair(room, peer) {
  if (!room) return false;
  const create = room.currentState.getStateEvents(EventType.RoomCreate, "")?.getContent();
  const pair = create?.["org.shici.participants"];
  return Array.isArray(pair) && pair.length === 2 && pair.includes(identity) && pair.includes(peer) &&
    room.currentState.getStateEvents(EventType.RoomEncryption, "")?.getContent().algorithm === ALG;
}
async function selectPeer({peerId}) {
  if (!readyToSend || !configuration.peers.some(peer => peer.userId === peerId)) throw new Error("許可された相手を選択してください。");
  let room = client.getRooms().find(candidate => allowedPair(candidate, peerId) &&
    ["join", "invite"].includes(candidate.getMyMembership()));
  if (room?.getMyMembership() === "invite") await client.joinRoom(room.roomId);
  if (!room) {
    const result = await client.createRoom({is_direct: true, invite: [peerId], preset: "private_chat",
      visibility: "private", creation_content: {"m.federate": false},
      initial_state: [{type: EventType.RoomEncryption, state_key: "", content: {algorithm: ALG}}]});
    await new Promise((resolve, reject) => {
      const until = Date.now() + 15000;
      const poll = () => {
        const found = client.getRoom(result.room_id);
        if (found) resolve(found);
        else if (Date.now() > until) reject(new Error("会話の同期を待ってから、もう一度相手を選択してください。"));
        else setTimeout(poll, 150);
      };
      poll();
    });
    room = client.getRoom(result.room_id);
  }
  if (!allowedPair(room, peerId)) throw new Error("暗号化された2人用の会話ではありません。");
  activeRoom = room.roomId;
  snapshot();
  return {roomId: activeRoom};
}
async function requireRoom(roomId) {
  const room = client?.getRoom(roomId);
  const peer = configuration.peers.find(candidate => allowedPair(room, candidate.userId));
  if (!readyToSend || !room || !peer || !await client.getCrypto().isEncryptionEnabledInRoom(roomId))
    throw new Error("暗号化された会話を選択してください。");
}
async function sendText({roomId, body, transactionId}) {
  await requireRoom(roomId);
  if (!body || body.length > 10000) throw new Error("メッセージは1万文字以内にしてください。");
  const result = await client.sendMessage(roomId, {msgtype: MsgType.Text, body}, transactionId);
  snapshot();
  return {eventId: result.event_id};
}
async function sendFile({roomId, file, transactionId}) {
  await requireRoom(roomId);
  if (file.size > MAX_BYTES) throw new Error("添付は50MB以下にしてください。");
  const encrypted = await attachment.encryptAttachment(await file.arrayBuffer());
  const upload = await client.uploadContent(new Blob([encrypted.data], {type: "application/octet-stream"}),
    {type: "application/octet-stream", includeFilename: false,
      progressHandler: progress => post({type: "progress", transactionId, loaded: progress.loaded, total: progress.total})});
  encrypted.info.url = upload.content_uri;
  const type = file.type.startsWith("image/") ? MsgType.Image : file.type.startsWith("video/") ? MsgType.Video :
    file.type.startsWith("audio/") ? MsgType.Audio : MsgType.File;
  const result = await client.sendMessage(roomId, {msgtype: type, body: file.name, file: encrypted.info,
    info: {mimetype: file.type || "application/octet-stream", size: file.size}}, transactionId);
  snapshot();
  return {eventId: result.event_id};
}
async function download({roomId, eventId}) {
  await requireRoom(roomId);
  const event = client.getRoom(roomId).findEventById(eventId);
  if (!event) throw new Error("添付が見つかりません。");
  await client.decryptEventIfNeeded(event);
  const content = event.getContent();
  if (!event.isEncrypted() || !content.file) throw new Error("暗号化された添付ではありません。");
  const url = client.mxcUrlToHttp(content.file.url, undefined, undefined, undefined, false, false, true);
  // Never attach Matrix credentials to a URL supplied by message content.
  if (!url || new URL(url).origin !== new URL(configuration.homeserverUrl).origin) throw new Error("添付の取得先が正しくありません。");
  const abort = new AbortController();
  mediaRequests.add(abort);
  try {
    const response = await fetch(url, {headers: {Authorization: "Bearer " + client.getAccessToken()},
      signal: abort.signal, redirect: "error", cache: "no-store"});
    if (!response.ok) throw new Error("添付を取得できませんでした。");
    const encrypted = await response.arrayBuffer();
    if (encrypted.byteLength > MAX_BYTES + 1024) throw new Error("添付が大きすぎます。");
    const data = await attachment.decryptAttachment(encrypted, content.file);
    return {data, mime: content.info?.mimetype || "application/octet-stream", name: content.body || "添付"};
  } finally { mediaRequests.delete(abort); }
}
async function older({roomId}) {
  await requireRoom(roomId);
  await client.scrollback(client.getRoom(roomId), 50);
  snapshot();
}
async function devices() {
  const result = await client.getDevices();
  return result.devices.map(device => ({id: device.device_id, name: device.display_name || "端末", current: device.device_id === client.getDeviceId()}));
}
async function revoke({deviceId, password}) {
  if (deviceId === client.getDeviceId()) throw new Error("この端末を解除するには「この端末の登録を解除」を使ってください。");
  await authentication(password, auth => client.deleteDevice(deviceId, auth));
  return {done: true};
}
async function forget() {
  await client?.logout();
  client?.stopClient();
  await forgetDevice(storageName);
  return {done: true};
}
async function retry({roomId, eventId}) {
  await requireRoom(roomId);
  const room = client.getRoom(roomId);
  const event = room.findEventById(eventId);
  if (!event || event.getSender() !== identity) throw new Error("再送対象が見つかりません。");
  await client.resendEvent(event, room);
  snapshot();
}
const actions = {start, generateRecovery, finishRecovery, selectPeer, sendText, sendFile, download, older, devices, revoke, forget, retry};
self.onmessage = async ({data: {id, action, payload}}) => {
  try {
    if (!actions[action]) throw new Error("未対応の操作です。");
    const result = await actions[action](payload);
    post({id, result});
  } catch (error) {
    const message = error.errcode === "M_FORBIDDEN" ? "認証または操作の権限を確認してください。" :
      error.errcode === "M_UNKNOWN_TOKEN" ? "端末の認証が無効です。再度開いてログインしてください。" :
      error.message?.startsWith("[") ? "処理に失敗しました。接続と鍵の状態を確認してください。" :
      error.message || "処理に失敗しました。";
    post({id, error: message});
  }
};
