/*
=========================================
SHiCI
ApiClient.js

役割：
・GASとの通信
=========================================
*/

const GAS_API_URL = "https://script.google.com/macros/s/AKfycbw34Qs-g5IqPLwluES704A03yyoW9P6liiv6z3JOkJiVFMP-Fifg6i6IH4EM98EM-Ubjg/exec";




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







