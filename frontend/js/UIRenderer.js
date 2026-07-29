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



/**
 * 候補カードを回答待ち状態にする
 *
 * @param {HTMLElement} selectedCard
 * @returns {NodeListOf<Element>}
 */
function startCandidateSelection(
    selectedCard
) {

    /*
     * 過去の候補一覧まで変更しないよう、
     * 選択されたカードを含むメッセージ内だけを対象にする。
     */
    const candidateContainer =
        selectedCard.closest(
            ".message"
        );

    const candidateCards =
        candidateContainer
            ? candidateContainer.querySelectorAll(
                ".candidate-card"
            )
            : document.querySelectorAll(
                ".candidate-card"
            );

    candidateCards.forEach(
        function(candidateCard) {

            candidateCard.classList.add(
                "candidate-card-disabled"
            );

            candidateCard.setAttribute(
                "aria-disabled",
                "true"
            );

        }
    );

    /*
     * 選択したカードだけを回答待ち状態にする。
     */
    selectedCard.classList.remove(
        "candidate-card-disabled"
    );

    selectedCard.classList.add(
        "candidate-card-selected",
        "candidate-card-processing"
    );

    selectedCard.setAttribute(
        "aria-selected",
        "true"
    );

    selectedCard.setAttribute(
        "aria-busy",
        "true"
    );

    scrollToBottom();

    return candidateCards;

}


/**
 * 候補選択が完了した状態にする
 *
 * @param {HTMLElement} selectedCard
 */
function completeCandidateSelection(
    selectedCard
) {

    selectedCard.classList.remove(
        "candidate-card-processing"
    );

    selectedCard.classList.add(
        "candidate-card-completed"
    );

    selectedCard.removeAttribute(
        "aria-busy"
    );

}


/**
 * 候補選択に失敗した場合、
 * 再び選択できる状態へ戻す
 *
 * @param {NodeListOf<Element>} candidateCards
 * @param {HTMLElement} selectedCard
 */
function resetCandidateSelection(
    candidateCards,
    selectedCard
) {

    candidateCards.forEach(
        function(candidateCard) {

            candidateCard.classList.remove(
                "candidate-card-disabled",
                "candidate-card-selected",
                "candidate-card-processing",
                "candidate-card-completed"
            );

            candidateCard.removeAttribute(
                "aria-disabled"
            );

            candidateCard.removeAttribute(
                "aria-selected"
            );

            candidateCard.removeAttribute(
                "aria-busy"
            );

        }
    );

    if (selectedCard) {

        selectedCard.classList.remove(
            "candidate-card-selected",
            "candidate-card-processing",
            "candidate-card-completed"
        );

    }

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

        /*
         * すでに回答待ち、または選択済みなら
         * 再度処理しない。
         */
        if (
            card.classList.contains(
                "candidate-card-processing"
            ) ||
            card.classList.contains(
                "candidate-card-completed"
            ) ||
            card.classList.contains(
                "candidate-card-disabled"
            )
        ) {

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

        /*
         * API通信開始前に視覚状態を変更する。
         */
        const candidateCards =
            startCandidateSelection(
                card
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

                /*
                 * 回答が返ったら拍動を停止し、
                 * 選択済み表示へ変える。
                 */
                completeCandidateSelection(
                    card
                );

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

                /*
                 * エラー時は再選択できる状態へ戻す。
                 */
                resetCandidateSelection(
                    candidateCards,
                    card
                );

                addMessage(
                    "エラーが発生しました。\n\n" +
                    (
                        result.message ||
                        "候補を選択できませんでした。"
                    ),
                    "shici"
                );

                return;

            }

            resetCandidateSelection(
                candidateCards,
                card
            );

            addMessage(
                "候補選択後の応答を処理できませんでした。",
                "shici"
            );

        }
        catch (error) {

            resetCandidateSelection(
                candidateCards,
                card
            );

            addMessage(
                "通信エラーが発生しました。\n\n" +
                (
                    error.message ||
                    "候補を選択できませんでした。"
                ),
                "shici"
            );

        }

    }
);




