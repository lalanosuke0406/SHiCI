/* No navigation, URL changes, browser notifications, or background sync. */
let executiveEpoch = 0, executiveSessionToken = null, executiveClient = null;
let executiveReleaseLock = null, executiveIdleTimer, executiveExpiryTimer;
let executiveConfiguration = null, executiveActiveRoom = null, executiveSelectedPeer = null;
let executiveHandshakeNodes = [], executiveMessages = [];
const executivePending = new Map(), executiveObjectUrls = new Set();
let executiveSensorEnabled = false, executiveFaceDownSince = null;
let executiveRecorder = null, executiveMediaStream = null;
const executiveNode = id => document.getElementById(id);
const executiveStillOpen = epoch => epoch === executiveEpoch && ExecutiveMessageController_isOpen() && !document.hidden;

function initializeExecutiveMessage() {
  const view = executiveNode("executiveMessageView");
  if (!view) return;
  document.addEventListener("visibilitychange", () => { if (document.hidden) ExecutiveMessageController_emergencyClose(); });
  window.addEventListener("pagehide", ExecutiveMessageController_emergencyClose);
  window.addEventListener("pageshow", event => { if (event.persisted) ExecutiveMessageController_emergencyClose(); });
  document.addEventListener("freeze", ExecutiveMessageController_emergencyClose);
  document.addEventListener("keydown", event => { if (event.key === "Escape") ExecutiveMessageController_emergencyClose(); });
  for (const type of ["pointerdown", "keydown"]) view.addEventListener(type, ExecutiveMessageController_resetIdleTimer);
  executiveNode("executiveCloseButton").onclick = ExecutiveMessageController_emergencyClose;
  executiveNode("executivePrivacySensorButton").onclick = ExecutiveMessageController_enablePrivacySensor;
  executiveNode("executiveLoginForm").onsubmit = async event => {
    event.preventDefault();
    const password = executiveNode("executiveLoginPassword").value;
    executiveNode("executiveLoginPassword").value = "";
    await ExecutiveMessageController_connect(password);
  };
  executiveNode("executiveFreeRegisterForm").onsubmit = async event => {
    event.preventDefault();
    if (!executiveNode("executiveFreeRegisterAccepted").checked) return;
    await ExecutiveMessageController_connect(undefined, true);
  };
  executiveNode("executiveConfirmPeerButton").onclick = () => executiveRun(async () => {
    const button = executiveNode("executiveConfirmPeerButton"); button.disabled = true;
    const peerId = executiveSelectedPeer;
    try {
      const result = await executiveClient.request("confirmPeer", {peerId, code: executiveNode("executiveVerificationCode").textContent});
      if (executiveSelectedPeer !== peerId) return;
      executiveNode("executivePeerVerificationPanel").hidden = true;
      executiveActiveRoom = result.roomId;
      await executiveClient.request("older", {roomId: result.roomId}); ExecutiveMessageController_status("");
    } finally {button.disabled = false;}
  });
  executiveNode("executiveRecoveryForm").onsubmit = async event => {
    event.preventDefault();
    const payload = {key: executiveNode("executiveRecoveryInput").value, password: executiveNode("executiveRecoveryPassword").value,
      saved: executiveNode("executiveRecoverySaved").checked};
    executiveNode("executiveRecoveryInput").value = executiveNode("executiveRecoveryPassword").value = "";
    await executiveRun(async () => {
      ExecutiveMessageController_status("履歴の鍵を設定・復元しています…");
      await executiveClient.request("finishRecovery", payload);
      executiveNode("executiveGeneratedKey").textContent = "";
      ExecutiveMessageController_ready();
    });
  };
  executiveNode("executiveGenerateRecovery").onclick = () => executiveRun(async () => {
    const result = await executiveClient.request("generateRecovery");
    executiveNode("executiveGeneratedKey").textContent = result.key;
    executiveNode("executiveNewRecovery").hidden = false;
    executiveNode("executiveGenerateRecovery").hidden = true;
  });
  executiveNode("executiveMessageForm").onsubmit = event => {
    event.preventDefault();
    const body = executiveNode("executiveMessageInput").value.trim();
    if (!body || !executiveActiveRoom) return;
    executiveNode("executiveMessageInput").value = "";
    ExecutiveMessageController_queue(body);
  };
  executiveNode("executiveFileInput").onchange = event => {
    const file = event.target.files[0]; event.target.value = "";
    if (file) ExecutiveMessageController_sendFile(file);
  };
  executiveNode("executiveRecordButton").onclick = ExecutiveMessageController_record;
  executiveNode("executiveOlderButton").onclick = () => executiveRun(() => executiveClient.request("older", {roomId: executiveActiveRoom}));
  executiveNode("executiveDeviceButton").onclick = ExecutiveMessageController_devices;
  executiveNode("executiveForgetButton").onclick = () => executiveRun(async () => {
    await executiveClient.request("forget"); ExecutiveMessageController_emergencyClose();
  });
  executiveNode("executiveDevicesClose").onclick = () => { executiveNode("executiveDevices").hidden = true; };
}
// Awaited callbacks run against a session-bound client wrapper. Closing the view
// rejects every pending request before any continuation can repopulate the DOM.
async function executiveRun(action) {
  const epoch = executiveEpoch;
  if (!executiveStillOpen(epoch)) return;
  try { await action(); }
  catch (error) { if (executiveStillOpen(epoch)) ExecutiveMessageController_status(error.message); }
}
function ExecutiveMessageController_handleChallenge(user, loading, result) {
  executiveHandshakeNodes = executiveHandshakeNodes.filter(node => node?.isConnected);
  executiveHandshakeNodes.push(user, loading); updateMessage(loading, result.answer || "");
}
function ExecutiveMessageController_handleChallengeFailed(user, loading, result) {
  executiveHandshakeNodes.push(user, loading); ExecutiveMessageController_clearHandshakeNodes();
  if (!document.hidden) addMessage(result.answer || "確認できませんでした。", "shici");
}
function ExecutiveMessageController_clearHandshakeNodes() {
  for (const node of executiveHandshakeNodes) node?.remove(); executiveHandshakeNodes = [];
}
function ExecutiveMessageController_getEpoch() { return executiveEpoch; }
function ExecutiveMessageController_handleUnlocked(user, loading, result, requestEpoch = executiveEpoch) {
  executiveHandshakeNodes.push(user, loading); ExecutiveMessageController_clearHandshakeNodes();
  if (document.hidden || requestEpoch !== executiveEpoch) {
    if (result.executiveSessionToken) lockExecutiveMessageBestEffort(result.executiveSessionToken); return;
  }
  if (!result.executiveSessionToken || !["matrix", "cloudflare"].includes(result.messaging?.provider)) throw new Error("接続設定を確認してください。");
  ExecutiveMessageController_emergencyClose();
  executiveSessionToken = result.executiveSessionToken; executiveConfiguration = result.messaging;
  executiveNode("appView").hidden = true; executiveNode("executiveMessageView").hidden = false;
  executiveNode("executiveConnectPanel").hidden = false; executiveNode("executiveLoginForm").hidden = true;
  executiveNode("executiveRecoveryPanel").hidden = true; executiveNode("executiveChatPanel").hidden = true;
  executiveNode("executiveFreeRegisterPanel").hidden = executiveNode("executivePeerVerificationPanel").hidden = true;
  executiveNode("executiveForgetButton").hidden = executiveConfiguration.provider === "cloudflare";
  ExecutiveMessageController_resetIdleTimer();
  const remaining = Math.min(Number(result.expiresAt) - Date.now(), 900000);
  if (!(remaining > 0)) { ExecutiveMessageController_emergencyClose(); return; }
  executiveExpiryTimer = setTimeout(ExecutiveMessageController_emergencyClose, remaining);
  void ExecutiveMessageController_connect();
}
async function ExecutiveMessageController_connect(password, accepted = false) {
  const epoch = executiveEpoch;
  ExecutiveMessageController_status("接続しています…");
  try {
    if (!executiveClient) {
      if (!navigator.locks) throw new Error("最新のブラウザで開いてください。");
      await new Promise((resolve, reject) => {
        navigator.locks.request("shici-device-" + executiveConfiguration.userId, {ifAvailable: true}, async lock => {
          if (!lock) { reject(new Error("同じアカウントを開いている別のSHiCI画面を閉じてください。")); return; }
          let release; const held = new Promise(done => { release = done; });
          if (!executiveStillOpen(epoch)) { release(); reject(new Error("画面は閉じられています。")); return; }
          executiveReleaseLock = release; resolve(); await held;
        }).catch(reject);
      });
      const module = executiveConfiguration.provider === "cloudflare" ? await import("../private/free-client.js") : await import("../private/client.js");
      if (!executiveStillOpen(epoch)) return;
      const client = module.createPrivateClient(event => {
        if (!executiveStillOpen(epoch)) return;
        if (event.type === "messages" && event.roomId === executiveActiveRoom) {
          executiveMessages = event.messages; ExecutiveMessageController_renderMessages();
        } else if (event.type === "progress") ExecutiveMessageController_status("添付を送信しています：" + Math.round(event.loaded / (event.total || 1) * 100) + "%");
        else if (event.type === "error") ExecutiveMessageController_status(event.message);
      });
      executiveClient = {
        async request(...args) {
          const result = await client.request(...args);
          if (!executiveStillOpen(epoch)) throw new Error("画面は閉じられています。");
          return result;
        }, close: () => client.close()
      };
    }
    const result = await executiveClient.request("start", {config: executiveConfiguration, password, accepted});
    if (!executiveStillOpen(epoch)) return;
    executiveNode("executiveFreeRegisterPanel").hidden = !result.registrationRequired;
    if (result.registrationRequired) { ExecutiveMessageController_status("この端末を初めて登録します。"); return; }
    executiveNode("executiveLoginForm").hidden = !result.loginRequired;
    if (result.loginRequired) { ExecutiveMessageController_status("初回の端末登録に、専用アカウントのパスワードを入力してください。"); return; }
    executiveNode("executiveConnectPanel").hidden = true;
    if (result.recoveryRequired) {
      executiveNode("executiveRecoveryPanel").hidden = false;
      executiveNode("executiveGenerateRecovery").hidden = result.existingRecovery;
      executiveNode("executiveExistingRecovery").hidden = !result.existingRecovery;
      ExecutiveMessageController_status(result.existingRecovery ? "保管したリカバリーキーで履歴を復元してください。" : "新しいリカバリーキーを作成・保管してください。");
    } else ExecutiveMessageController_ready();
  } catch (error) { if (executiveStillOpen(epoch)) ExecutiveMessageController_status(error.message); }
}
function ExecutiveMessageController_ready() {
  executiveNode("executiveRecoveryPanel").hidden = executiveNode("executiveConnectPanel").hidden = true;
  executiveNode("executiveFreeRegisterPanel").hidden = true;
  executiveNode("executiveChatPanel").hidden = false;
  const list = executiveNode("executivePeerList"); list.replaceChildren();
  for (const peer of executiveConfiguration.peers) {
    const button = document.createElement("button"); button.type = "button"; button.className = "executive-peer-button";
    button.textContent = peer.displayName; button.onclick = () => ExecutiveMessageController_selectPeer(peer); list.appendChild(button);
  }
  ExecutiveMessageController_status("相手を選択してください。");
  if (executiveConfiguration.peers.length === 1) void ExecutiveMessageController_selectPeer(executiveConfiguration.peers[0]);
}
async function ExecutiveMessageController_selectPeer(peer) {
  executiveSelectedPeer = peer.userId; executiveActiveRoom = null; executiveMessages = [];
  executiveNode("executivePeerVerificationPanel").hidden = true;
  executiveNode("executiveVerificationCode").textContent = "";
  executiveNode("executiveConversation").replaceChildren(); executiveNode("executivePeerTitle").textContent = peer.displayName;
  ExecutiveMessageController_status("会話を開いています…");
  await executiveRun(async () => {
    const result = await executiveClient.request("selectPeer", {peerId: peer.userId});
    if (executiveSelectedPeer !== peer.userId) return;
    if (result.verificationRequired) {
      executiveNode("executiveVerificationCode").textContent = result.code;
      executiveNode("executivePeerVerificationPanel").hidden = false;
      ExecutiveMessageController_status("初回だけ、相手と確認コードを照合してください。"); return;
    }
    executiveActiveRoom = result.roomId;
    await executiveClient.request("older", {roomId: result.roomId}); ExecutiveMessageController_status("");
  });
}
function ExecutiveMessageController_status(text) {
  if (ExecutiveMessageController_isOpen()) executiveNode("executiveStatus").textContent = String(text || "");
}
function ExecutiveMessageController_renderMessages() {
  const conversation = executiveNode("executiveConversation");
  const nearBottom = conversation.scrollHeight - conversation.scrollTop - conversation.clientHeight < 100;
  const remote = new Set(executiveMessages.map(message => message.id));
  for (const [id, message] of executivePending) if (message.eventId && remote.has(message.eventId)) executivePending.delete(id);
  const pending = [...executivePending.values()].filter(message => message.roomId === executiveActiveRoom);
  // The SDK's local echo replaces our immediate optimistic echo by transaction id.
  const sdkTransactions = new Set(executiveMessages.map(message => message.transactionId));
  const messages = executiveMessages.concat(pending.filter(message => !sdkTransactions.has(message.id)));
  const previousScroll = conversation.scrollTop;
  const existing = new Map(Array.from(conversation.children, element => [element.dataset.messageId, element]));
  const keep = new Set();
  let cursor = conversation.firstChild;
  for (const message of messages) {
    const key = String(message.id); keep.add(key);
    let bubble = existing.get(key);
    if (!bubble) {
      bubble = document.createElement("div"); bubble.dataset.messageId = key;
      const body = document.createElement("div"); body.className = "executive-message-body"; bubble.appendChild(body);
      const time = document.createElement("div"); time.className = "executive-message-time"; bubble.appendChild(time);
    }
    bubble.className = "executive-message-bubble " + (message.mine ? "mine" : "theirs");
    bubble.querySelector(".executive-message-body").textContent = message.body;
    if (message.attachment && !message.pending && !bubble.querySelector("[data-attachment],img,audio,video,a[download]")) {
      const button = document.createElement("button"); button.type = "button"; button.textContent = "添付を開く";
      button.dataset.attachment = "true";
      button.onclick = () => ExecutiveMessageController_openAttachment(message.id, bubble, button); bubble.appendChild(button);
    }
    const time = bubble.querySelector(".executive-message-time");
    time.textContent = message.failed || message.status === "not_sent" ? "送信できませんでした" :
      message.status === "sending" || message.pending ? "送信中…" : new Date(message.timestamp).toLocaleTimeString("ja-JP", {hour: "2-digit", minute: "2-digit"});
    const previousRetry = bubble.querySelector("[data-retry]");
    if ((message.failed || message.status === "not_sent") && !previousRetry) {
      const retry = document.createElement("button"); retry.type = "button"; retry.textContent = "再送";
      retry.dataset.retry = "true";
      retry.onclick = () => message.pending ? ExecutiveMessageController_dispatch(message) : executiveRun(() => executiveClient.request("retry", {roomId: executiveActiveRoom, eventId: message.id}));
      bubble.appendChild(retry);
    } else if (!message.failed && message.status !== "not_sent") previousRetry?.remove();
    if (bubble !== cursor) conversation.insertBefore(bubble, cursor);
    cursor = bubble.nextSibling;
  }
  for (const [key, element] of existing) if (!keep.has(key)) element.remove();
  conversation.scrollTop = nearBottom ? conversation.scrollHeight : previousScroll;
}
function ExecutiveMessageController_queue(body, file) {
  const message = {id: crypto.randomUUID(), roomId: executiveActiveRoom, body, file, timestamp: Date.now(), mine: true, pending: true};
  executivePending.set(message.id, message); ExecutiveMessageController_renderMessages(); void ExecutiveMessageController_dispatch(message);
}
function ExecutiveMessageController_sendFile(file) {
  if (!executiveActiveRoom || !ExecutiveMessageController_isOpen()) return;
  const limit = executiveConfiguration.maxAttachmentBytes || 50 * 1024 * 1024;
  if (file.size > limit) { ExecutiveMessageController_status("添付は" + Math.floor(limit / (1024 * 1024)) + "MB以下にしてください。"); return; }
  ExecutiveMessageController_queue(file.name, file);
}
async function ExecutiveMessageController_dispatch(message) {
  if (message.inFlight || !ExecutiveMessageController_isOpen()) return;
  const epoch = executiveEpoch; message.failed = false; message.inFlight = true;
  ExecutiveMessageController_resetIdleTimer(); ExecutiveMessageController_renderMessages();
  try {
    const result = await executiveClient.request(message.file ? "sendFile" : "sendText", {
      roomId: message.roomId, body: message.body, file: message.file, transactionId: message.id});
    message.eventId = result.eventId; message.pending = false; message.status = "sent"; message.file = null;
    ExecutiveMessageController_status("");
  } catch (error) { if (executiveStillOpen(epoch)) { message.failed = true; ExecutiveMessageController_status(error.message); } }
  finally { message.inFlight = false; if (executiveStillOpen(epoch)) ExecutiveMessageController_renderMessages(); }
}
async function ExecutiveMessageController_openAttachment(eventId, bubble, button) {
  button.disabled = true;
  await executiveRun(async () => {
    try {
      const roomId = executiveActiveRoom;
      const result = await executiveClient.request("download", {roomId, eventId});
      if (roomId !== executiveActiveRoom || !bubble.isConnected) return;
      const mime = result.mime.toLowerCase(), url = URL.createObjectURL(new Blob([result.data], {type: mime}));
      executiveObjectUrls.add(url);
      let preview;
      if (["image/jpeg", "image/png", "image/webp", "image/gif"].includes(mime)) { preview = document.createElement("img"); preview.alt = result.name; }
      else if (mime.startsWith("video/") || mime.startsWith("audio/")) {
        preview = document.createElement(mime.startsWith("video/") ? "video" : "audio"); preview.controls = true;
        preview.disablePictureInPicture = true; preview.controlsList = "nodownload noremoteplayback"; preview.setAttribute("playsinline", "");
      } else { preview = document.createElement("a"); preview.href = url; preview.download = result.name; preview.textContent = "ファイルを保存"; }
      if (preview.tagName !== "A") preview.src = url;
      bubble.appendChild(preview); button.remove();
    } catch (error) { button.disabled = false; throw error; }
  });
}
async function ExecutiveMessageController_record() {
  if (executiveRecorder?.state === "recording") { executiveRecorder.stop(); return; }
  if (!executiveActiveRoom || !navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) return;
  const epoch = executiveEpoch, roomId = executiveActiveRoom;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({audio: true});
    if (!executiveStillOpen(epoch)) { stream.getTracks().forEach(track => track.stop()); return; }
    executiveMediaStream = stream;
    const chunks = [], recorder = new MediaRecorder(stream); executiveRecorder = recorder; let size = 0;
    recorder.ondataavailable = event => { if (executiveStillOpen(epoch)) { chunks.push(event.data); size += event.data.size; if (size > 45 * 1024 * 1024) recorder.stop(); } };
    recorder.onstop = () => {
      stream.getTracks().forEach(track => track.stop());
      if (!executiveStillOpen(epoch) || executiveActiveRoom !== roomId) return;
      const mime = recorder.mimeType || "audio/webm";
      ExecutiveMessageController_sendFile(new File(chunks, mime.includes("mp4") ? "音声.m4a" : "音声.webm", {type: mime}));
      executiveNode("executiveRecordButton").textContent = "録音";
    };
    recorder.start(1000); executiveNode("executiveRecordButton").textContent = "録音を止めて送信";
  } catch { if (executiveStillOpen(epoch)) ExecutiveMessageController_status("マイクの利用を許可してください。"); }
}
async function ExecutiveMessageController_devices() {
  await executiveRun(async () => {
    const devices = await executiveClient.request("devices");
    const list = executiveNode("executiveDeviceList"); list.replaceChildren();
    for (const device of devices) {
      const row = document.createElement("div"); row.textContent = device.name + (device.current ? "（この端末）" : "");
      if (!device.current) {
        const password = document.createElement("input"); password.type = "password"; password.placeholder = "本人のパスワード"; password.autocomplete = "off";
        const revoke = document.createElement("button"); revoke.type = "button"; revoke.textContent = "この端末を失効";
        revoke.onclick = () => executiveRun(async () => { const value = password.value; password.value = "";
          await executiveClient.request("revoke", {deviceId: device.id, password: value}); row.remove(); });
        row.append(password, revoke);
      }
      list.appendChild(row);
    }
    executiveNode("executiveDevices").hidden = false;
  });
}
async function ExecutiveMessageController_enablePrivacySensor() {
  const epoch = executiveEpoch;
  try {
    if (typeof DeviceMotionEvent === "undefined") throw new Error();
    if (typeof DeviceMotionEvent.requestPermission === "function" && await DeviceMotionEvent.requestPermission() !== "granted") throw new Error();
    if (!executiveStillOpen(epoch)) return;
    if (!executiveSensorEnabled) window.addEventListener("devicemotion", ExecutiveMessageController_handleDeviceMotion);
    executiveSensorEnabled = true; executiveNode("executivePrivacySensorButton").textContent = "伏せて閉じる：有効";
  } catch { if (executiveStillOpen(epoch)) ExecutiveMessageController_status("端末の動きの利用を許可してください。非対応の場合は「戻る」で閉じられます。"); }
}
function ExecutiveMessageController_handleDeviceMotion(event) {
  if (!ExecutiveMessageController_isOpen()) return;
  const {x, y, z} = event.accelerationIncludingGravity || {};
  const faceDown = Number.isFinite(z) && z < -7.5 && Math.abs(x || 0) < 5 && Math.abs(y || 0) < 5;
  if (!faceDown) { executiveFaceDownSince = null; return; }
  if (executiveFaceDownSince === null) executiveFaceDownSince = Date.now();
  if (Date.now() - executiveFaceDownSince >= 250) ExecutiveMessageController_emergencyClose();
}
function ExecutiveMessageController_isOpen() { return Boolean(executiveSessionToken && executiveNode("executiveMessageView") && !executiveNode("executiveMessageView").hidden); }
function ExecutiveMessageController_resetIdleTimer() {
  if (!ExecutiveMessageController_isOpen()) return;
  clearTimeout(executiveIdleTimer); executiveIdleTimer = setTimeout(ExecutiveMessageController_emergencyClose, 180000);
}
function ExecutiveMessageController_emergencyClose() {
  ++executiveEpoch; // Also invalidate unlock requests which have not returned yet.
  const token = executiveSessionToken; executiveSessionToken = null;
  const view = executiveNode("executiveMessageView"); if (view) view.hidden = true;
  if (token && executiveNode("appView")) executiveNode("appView").hidden = false;
  executiveClient?.close(); executiveClient = null; executiveReleaseLock?.(); executiveReleaseLock = null;
  clearTimeout(executiveIdleTimer); clearTimeout(executiveExpiryTimer);
  if (executiveRecorder?.state === "recording") executiveRecorder.stop(); executiveRecorder = null;
  executiveMediaStream?.getTracks().forEach(track => track.stop()); executiveMediaStream = null;
  if (view) {
    for (const media of view.querySelectorAll("video,audio")) { media.pause(); media.removeAttribute("src"); media.load(); }
    for (const input of view.querySelectorAll("input,textarea")) { input.value = ""; if (input.type === "checkbox") input.checked = false; }
    for (const id of ["executiveConversation", "executivePeerList", "executiveDeviceList"]) executiveNode(id)?.replaceChildren();
    for (const id of ["executiveGeneratedKey", "executivePeerTitle", "executiveStatus", "executiveVerificationCode"]) if (executiveNode(id)) executiveNode(id).textContent = "";
    for (const id of ["executiveFreeRegisterPanel", "executivePeerVerificationPanel"]) if (executiveNode(id)) executiveNode(id).hidden = true;
    executiveNode("executiveDevices").hidden = executiveNode("executiveNewRecovery").hidden = true;
    executiveNode("executiveRecordButton").textContent = "録音";
  }
  for (const url of executiveObjectUrls) URL.revokeObjectURL(url); executiveObjectUrls.clear();
  executiveMessages = []; executivePending.clear(); executiveConfiguration = null;
  executiveActiveRoom = executiveSelectedPeer = executiveFaceDownSince = null;
  ExecutiveMessageController_clearHandshakeNodes(); if (token) lockExecutiveMessageBestEffort(token);
}
