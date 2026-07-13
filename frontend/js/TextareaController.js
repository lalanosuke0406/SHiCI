/*
=========================================
SHiCI
TextareaController.js

役割：
・入力欄の高さ自動調整
・Enter送信
=========================================
*/

let query;
let inputForm;

/**
 * 初期化
 */
function initializeTextarea() {
    query = document.getElementById("query");
    inputForm = document.getElementById("inputForm");

    if (!query || !inputForm) return;

    query.addEventListener("input", adjustTextareaHeight);

    adjustTextareaHeight();
}

/**
 * 高さ自動調整
 */
function adjustTextareaHeight() {
    query.style.height = "auto";
    query.style.height = Math.min(query.scrollHeight, 180) + "px";
}


/**
 * 入力欄をリセット
 */
function clearTextarea() {
    query.value = "";
    query.style.height = "auto";
    adjustTextareaHeight();
}
