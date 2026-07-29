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
        <div
            class="candidate-card"
            data-entity-id="${entity.entityId}"
            data-entity-type="${entity.entityType}"
        >
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


document.addEventListener(
    "click",
    async function(event) {

        const card =
            event.target.closest(
                ".candidate-card"
            );

        if (!card) {
            return;
        }

        const entityId =
            String(
                card.dataset.entityId || ""
            ).trim();

        const entityType =
            String(
                card.dataset.entityType || ""
            ).trim();


        if (
            !entityId ||
            !entityType
        ) {

            addMessage(
                "候補情報を取得できませんでした。",
                "shici"
            );

            return;
        }

        const candidateCards =
            document.querySelectorAll(
                ".candidate-card"
            );

        candidateCards.forEach(
            function(candidateCard) {

                candidateCard.style.pointerEvents =
                    "none";

            }
        );

        try {

            const result =
                await selectCandidate(
                    entityId,
                    entityType
                );

            if (
                result.messageType ===
                "text"
            ) {

                addMessage(
                    result.answer || "",
                    "shici"
                );

                return;
            }

            if (
                result.messageType ===
                "error"
            ) {

                addMessage(
                    "エラーが発生しました。\n\n" +
                    (
                        result.message ||
                        "候補を選択できませんでした。"
                    ),
                    "shici"
                );

                candidateCards.forEach(
                    function(candidateCard) {

                        candidateCard.style.pointerEvents =
                            "";

                    }
                );

                return;
            }

            addMessage(
                "候補選択後の応答を処理できませんでした。",
                "shici"
            );

            candidateCards.forEach(
                function(candidateCard) {

                    candidateCard.style.pointerEvents =
                        "";

                }
            );

        }
        catch (error) {

            addMessage(
                "通信エラーが発生しました。\n\n" +
                (
                    error.message ||
                    "候補を選択できませんでした。"
                ),
                "shici"
            );

            candidateCards.forEach(
                function(candidateCard) {

                    candidateCard.style.pointerEvents =
                        "";

                }
            );

        }

    }
);




