/**
 * The GAS boundary supplies connection metadata and short-lived relay grants
 * only after the existing executive challenge. Message bodies, Matrix access
 * tokens and decryption keys never pass through GAS.
 */
function ExecutiveMessengerGateway_getConfiguration(user) {
  const properties = PropertiesService.getScriptProperties();
  if (properties.getProperty("EXECUTIVE_MESSENGER_PROVIDER") === "cloudflare") {
    return ExecutiveMessengerGateway_freeConfiguration(user, properties);
  }
  const url = String(properties.getProperty("EXECUTIVE_MATRIX_HOMESERVER_URL") || "").trim();
  const development = properties.getProperty("EXECUTIVE_MESSENGER_ENV") === "development";
  const productionUrl = /^https:\/\/[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?(?::443)?\/?$/i;
  const developmentUrl = /^http:\/\/localhost(?::[0-9]{1,5})?\/?$/;
  if (!url || !(productionUrl.test(url) || (development && developmentUrl.test(url)))) {
    throw new Error("暗号化通信サーバーのURLを設定してください。");
  }
  if (!user || !user.userId) throw new Error("利用ユーザーを確認できません。");
  let accounts;
  try { accounts = JSON.parse(properties.getProperty("EXECUTIVE_MATRIX_USERS_JSON") || "{}"); }
  catch (error) { throw new Error("アカウント対応設定を確認してください。"); }
  const isMatrixId = function(value) { return typeof value === "string" && /^@[^\s:]+:[^\s]+$/.test(value); };
  const id = accounts[user.userId];
  if (!isMatrixId(id)) throw new Error("このユーザーの暗号化アカウントが設定されていません。");
  const peers = ExecutiveMessageService_listPeersForUser(user).filter(function(peer) {
    return Object.prototype.hasOwnProperty.call(accounts, peer.userId) && isMatrixId(accounts[peer.userId]) && accounts[peer.userId] !== id;
  }).map(function(peer) {
    return {userId: accounts[peer.userId], displayName: peer.displayName};
  });
  return {
    provider: "matrix",
    homeserverUrl: url.replace(/\/$/, "") + "/",
    userId: id,
    peers: peers,
    encryption: "required",
    development: development
  };
}

/** A short-lived authorization grant, never a decryption key or Matrix token. */
function ExecutiveMessengerGateway_freeConfiguration(user, properties) {
  if (!user || !user.userId) throw new Error("利用ユーザーを確認できません。");
  const baseUrl = String(properties.getProperty("EXECUTIVE_FREE_API_URL") || "").trim();
  const secret = properties.getProperty("EXECUTIVE_FREE_AUTH_SECRET") || "";
  if (!/^https:\/\/[a-z0-9](?:[a-z0-9.-]*[a-z0-9])?\/?$/i.test(baseUrl) || secret.length < 32)
    throw new Error("暗号化通信の接続設定を確認してください。");
  let mapping;
  try { mapping = JSON.parse(properties.getProperty("EXECUTIVE_FREE_USERS_JSON") || "{}"); }
  catch (error) { throw new Error("アカウント対応設定を確認してください。"); }
  if (!mapping || typeof mapping !== "object" || Array.isArray(mapping)) throw new Error("アカウント対応設定を確認してください。");
  const aliases = Object.keys(mapping).map(function(id) {return mapping[id];});
  if (aliases.length < 2 || aliases.length > 5 || aliases.some(function(id) {return typeof id !== "string" || !/^[a-z0-9_-]{1,64}$/.test(id);}) ||
      new Set(aliases).size !== aliases.length || !Object.prototype.hasOwnProperty.call(mapping,user.userId))
    throw new Error("アカウント対応設定を確認してください。");
  const peers = ExecutiveMessageService_listPeersForUser(user).filter(function(peer) {
    return Object.prototype.hasOwnProperty.call(mapping,peer.userId) && peer.userId !== user.userId;
  }).map(function(peer) {return {userId:mapping[peer.userId],displayName:peer.displayName};});
  const now = Math.floor(Date.now()/1000);
  const grant = {aud:"shici-free-v1",sub:mapping[user.userId],peers:peers.map(function(peer) {return peer.userId;}),iat:now,exp:now+900};
  const body = Utilities.base64EncodeWebSafe(JSON.stringify(grant),Utilities.Charset.UTF_8).replace(/=+$/g,"");
  const signature = Utilities.base64EncodeWebSafe(Utilities.computeHmacSha256Signature(body,secret,Utilities.Charset.UTF_8)).replace(/=+$/g,"");
  return {provider:"cloudflare",baseUrl:baseUrl.replace(/\/$/,"")+"/",userId:grant.sub,peers:peers,
    accessGrant:body+"."+signature,expiresAt:grant.exp*1000,encryption:"required",maxAttachmentBytes:5*1024*1024};
}

/** Prevent old clients from silently writing plaintext after upgrade. */
function ExecutiveMessengerGateway_isRetiredAction(action) {
  return [
    "executiveMessageListPeers", "executiveMessageList", "executiveMessageSend",
    "executivePushConfig", "executivePushSubscribe", "executivePushUnsubscribe"
  ].indexOf(action) !== -1;
}
