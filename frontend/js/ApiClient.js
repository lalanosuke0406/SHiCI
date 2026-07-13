/*
=========================================
SHiCI
ApiClient.js

役割：
・GASとの通信
=========================================
*/

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbw34Qs-g5IqPLwluES704A03yyoW9P6liiv6z3JOkJiVFMP-Fifg6i6IH4EM98EM-Ubjg/exec";

/**
 * SHiCIへ質問する
 */
async function askShici(text) {

    if (!GAS_API_URL) {

        return {
            type: "text",
            message: "Cloudflare版SHiCIの画面は動作しています。"
        };

    }

    const url =
        GAS_API_URL +
        "?text=" + encodeURIComponent(text) +
        "&sessionId=" + encodeURIComponent(getSessionId());

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("通信に失敗しました。");
    }

    const data = await response.json();

    return data;

}


async function selectCandidate(entityId) {

    const url =
        GAS_API_URL +
        "?action=selectCandidate" +
        "&entityId=" + encodeURIComponent(entityId) +
        "&sessionId=" + encodeURIComponent(getSessionId());

    const response = await fetch(url);

    if (!response.ok) {
        throw new Error("通信に失敗しました。");
    }

    return await response.json();
}







