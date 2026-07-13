/*
=========================================
SHiCI
UIRenderer.js

役割：
・画面描画
・チャット表示
・スクロール制御
=========================================
*/

const chat = document.getElementById("chat");

/**
 * メッセージを追加する
 *
 * @param {string} text
 * @param {string} sender
 * @returns {HTMLElement}
 */
function addMessage(text, sender, isHtml = false) {

    const message = document.createElement("div");

    message.className = "message " + sender;

    if (isHtml) {
        message.innerHTML = text;
    } else {
        message.textContent = text;
    }

    chat.appendChild(message);

    scrollToBottom();

    return message;
}

/**
 * メッセージを書き換える
 *
 * AIの「確認しています...」
 * ↓
 * 回答
 */
function updateMessage(element, text, isHtml = false) {

    if (!element) return;

    if (isHtml) {
        element.innerHTML = text;
    } else {
        element.textContent = text;
    }

    scrollToBottom();
}

/**
 * 一番下までスクロール
 */
function scrollToBottom() {

    requestAnimationFrame(() => {

        chat.scrollTop = chat.scrollHeight;

    });

}

/**
 * 候補カードを作成
 */
function createCandidateCard(entity) {

    return `
        <div class="candidate-card" data-entity-id="${entity.entityId}">
            <div class="candidate-drawing">
                ${entity.drawingNo || ""}
            </div>

            <div class="candidate-name">
                ${entity.productName || ""}
            </div>

            <div class="candidate-mold">
                金型：${entity.moldNo || "-"}
            </div>
            
        </div>
    `;
}



/**
 * 候補一覧を表示
 */
function addCandidateCards(candidates) {

    let html = "";

    candidates.forEach(function(candidate) {
        html += createCandidateCard(candidate);
    });

    addMessage(html, "bot", true);

}


document.addEventListener("click", async function(e) {

    const card = e.target.closest(".candidate-card");

    if (!card) return;

    const entityId = card.dataset.entityId;

    try {

        const result = await selectCandidate(entityId);

        if (result.messageType === "text") {

            addMessage(result.answer, "shici");
        }

    }
    catch (err) {

        alert(err.message);

    }

});




