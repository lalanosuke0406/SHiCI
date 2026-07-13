/*
=========================================
SHiCI
SessionStore.js

役割：
・セッションIDを管理する
・localStorageへ保存する
=========================================
*/

const SESSION_KEY = "shiciSessionId";

/**
 * セッションIDを取得する
 * なければ新しく生成する
 */
function getSessionId() {

    let sessionId = localStorage.getItem(SESSION_KEY);

    if (!sessionId) {

        sessionId =
            "session_" +
            Date.now() +
            "_" +
            Math.random().toString(36).substring(2);

        localStorage.setItem(SESSION_KEY, sessionId);
    }

    return sessionId;
}

/**
 * セッションIDを削除する
 * （デバッグ・ログアウト用）
 */
function clearSessionId() {
    localStorage.removeItem(SESSION_KEY);
}

/**
 * セッションIDを強制再生成する
 */
function regenerateSessionId() {

    clearSessionId();

    return getSessionId();
}
