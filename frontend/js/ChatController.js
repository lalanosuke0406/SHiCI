/*
=========================================
SHiCI
ChatController.js

役割：
・チャット制御
・送信処理
=========================================
*/

let sendButton;
let welcome;
let logoAccent;

/**
 * 初期化
 */
function initializeChat() {

    sendButton = document.getElementById("sendButton");
    welcome = document.getElementById("welcome");
    logoAccent = document.getElementById("logoAccent");

    inputForm.addEventListener(
        "submit",
        handleSubmit
    );

}

/**
 * 送信処理
 */
async function handleSubmit(event) {

    event.preventDefault();

    const text = query.value.trim();

    if (!text) return;

    // ユーザー発言
    addMessage(text, "user");

    // Welcome非表示
    if (welcome) {

        welcome.classList.add("hide");

        inputForm.classList.add("chat-mode");

        if (logoAccent){

            logoAccent.classList.add("active");

        }

        setTimeout(() => {

            welcome.remove();

            welcome = null;

        }, 350);

    }

    // 入力欄リセット
    clearTextarea();

    // AI応答準備
    const loading = addMessage(
        "確認しています...",
        "shici"
    );

    sendButton.disabled = true;

    try {

        const result = await askShici(text);

        if (result.messageType === "text") {
        
            updateMessage(
                loading,
                result.answer || ""
            );
        
        }
        else if (result.messageType === "candidate") {

        // 「確認しています...」を消す
        loading.remove();

        // 説明文を表示
        addMessage(
            result.message || "",
            "shici"
        );

        addCandidateCards(
            result.candidates || []
        );

        }
        else if (result.messageType === "error") {

            updateMessage(
                loading,
                "エラーが発生しました。\n\n" +
                (result.message || "原因不明のエラーです。")
            );

        }
        else {

            updateMessage(
                loading,
                "未対応のメッセージです。"
            );

        }

    }
    catch (error) {

        updateMessage(
            loading,
            "エラーが発生しました。\n\n" + error.message
        );

    }
    finally {

        sendButton.disabled = false;

    }

}
