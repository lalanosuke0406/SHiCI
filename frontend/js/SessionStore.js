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

    return localStorage.getItem(
        SESSION_KEY
    ) || "";

}




function setSessionId(
    sessionId
) {

    localStorage.setItem(
        SESSION_KEY,
        sessionId
    );

}






/**
 * セッションIDを削除する
 * （デバッグ・ログアウト用）
 */
function clearSessionId() {
    localStorage.removeItem(SESSION_KEY);
}


