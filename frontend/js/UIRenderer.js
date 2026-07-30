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



/*
=========================================
更新確認カード
=========================================
*/

/**
 * 更新確認カードを表示する
 *
 * @param {Object} result
 * @returns {HTMLElement}
 */
function addUpdateConfirmationCard(
    result
) {

    if (
        !result ||
        !result.requestId
    ) {

        throw new Error(
            "更新案の情報がありません。"
        );

    }

    const requestId =
        String(
            result.requestId || ""
        ).trim();

    const confirmation =
        result.confirmation &&
        typeof result.confirmation ===
            "object"
            ? result.confirmation
            : {};

    const title =
        String(
            confirmation.title ||
            "変更内容の確認"
        ).trim();

    const message =
        String(
            confirmation.message ||
            ""
        ).trim();

    const confirmLabel =
        String(
            confirmation.confirmLabel ||
            "この内容で確定"
        ).trim();

    const cancelLabel =
        String(
            confirmation.cancelLabel ||
            "キャンセル"
        ).trim();


    /*
    =========================================
    メッセージ要素
    =========================================
    */

    const messageElement =
        document.createElement(
            "div"
        );

    messageElement.className =
        "message shici update-confirmation-message";


    /*
    =========================================
    カード本体
    =========================================
    */

    const card =
        document.createElement(
            "div"
        );

    card.className =
        "update-confirmation-card";

    card.dataset.requestId =
        requestId;

    card.dataset.requestStatus =
        "PENDING";


    /*
    =========================================
    見出し
    =========================================
    */

    const header =
        document.createElement(
            "div"
        );

    header.className =
        "update-confirmation-header";

    const titleElement =
        document.createElement(
            "div"
        );

    titleElement.className =
        "update-confirmation-title";

    titleElement.textContent =
        title;

    header.appendChild(
        titleElement
    );


    /*
    =========================================
    変更内容
    =========================================
    */

    const body =
        document.createElement(
            "div"
        );

    body.className =
        "update-confirmation-body";

    const messageText =
        document.createElement(
            "div"
        );

    messageText.className =
        "update-confirmation-text";

    messageText.textContent =
        message;

    body.appendChild(
        messageText
    );


    /*
    =========================================
    操作ボタン
    =========================================
    */

    const actions =
        document.createElement(
            "div"
        );

    actions.className =
        "update-confirmation-actions";

    const cancelButton =
        document.createElement(
            "button"
        );

    cancelButton.type =
        "button";

    cancelButton.className =
        "update-confirmation-button update-confirmation-cancel";

    cancelButton.dataset.updateAction =
        "cancel";

    cancelButton.textContent =
        cancelLabel;

    const confirmButton =
        document.createElement(
            "button"
        );

    confirmButton.type =
        "button";

    confirmButton.className =
        "update-confirmation-button update-confirmation-confirm";

    confirmButton.dataset.updateAction =
        "confirm";

    confirmButton.textContent =
        confirmLabel;

    actions.appendChild(
        cancelButton
    );

    actions.appendChild(
        confirmButton
    );


    /*
    =========================================
    状態表示
    =========================================
    */

    const statusElement =
        document.createElement(
            "div"
        );

    statusElement.className =
        "update-confirmation-status";

    statusElement.setAttribute(
        "aria-live",
        "polite"
    );


    /*
    =========================================
    カードを組み立てる
    =========================================
    */

    card.appendChild(
        header
    );

    card.appendChild(
        body
    );

    card.appendChild(
        actions
    );

    card.appendChild(
        statusElement
    );

    messageElement.appendChild(
        card
    );

    chat.appendChild(
        messageElement
    );

    scrollToBottom();

    return card;

}



/**
 * 更新確認カードを処理中状態にする
 *
 * @param {HTMLElement} card
 * @param {string} statusText
 */
function startUpdateConfirmationProcessing(
    card,
    statusText
) {

    if (!card) return;

    card.dataset.requestStatus =
        "PROCESSING";

    card.classList.add(
        "update-confirmation-processing"
    );

    const buttons =
        card.querySelectorAll(
            ".update-confirmation-button"
        );

    buttons.forEach(
        function(button) {

            button.disabled =
                true;

        }
    );

    const statusElement =
        card.querySelector(
            ".update-confirmation-status"
        );

    if (statusElement) {

        statusElement.textContent =
            String(
                statusText ||
                "処理しています..."
            );

    }

    scrollToBottom();

}



/**
 * 更新確認カードを確定済み状態にする
 *
 * @param {HTMLElement} card
 * @param {Object} result
 */
function completeUpdateConfirmation(
    card,
    result
) {

    if (!card) return;

    card.dataset.requestStatus =
        "CONFIRMED";

    card.classList.remove(
        "update-confirmation-processing"
    );

    card.classList.add(
        "update-confirmation-completed"
    );

    const actions =
        card.querySelector(
            ".update-confirmation-actions"
        );

    if (actions) {

        actions.remove();

    }

    const statusElement =
        card.querySelector(
            ".update-confirmation-status"
        );

    if (statusElement) {

        const oldTemperature =
            result &&
            result.oldMoldTemperature !==
                undefined
                ? result.oldMoldTemperature
                : "";

        const newTemperature =
            result &&
            result.newMoldTemperature !==
                undefined
                ? result.newMoldTemperature
                : "";

        if (
            oldTemperature !== "" &&
            newTemperature !== ""
        ) {

            statusElement.textContent =
                "確定しました：" +
                oldTemperature +
                "℃ → " +
                newTemperature +
                "℃";

        } else {

            statusElement.textContent =
                "変更を確定しました。";

        }

    }

    scrollToBottom();

}



/**
 * 更新確認カードをキャンセル済み状態にする
 *
 * @param {HTMLElement} card
 */
function completeUpdateCancellation(
    card
) {

    if (!card) return;

    card.dataset.requestStatus =
        "CANCELLED";

    card.classList.remove(
        "update-confirmation-processing"
    );

    card.classList.add(
        "update-confirmation-cancelled"
    );

    const actions =
        card.querySelector(
            ".update-confirmation-actions"
        );

    if (actions) {

        actions.remove();

    }

    const statusElement =
        card.querySelector(
            ".update-confirmation-status"
        );

    if (statusElement) {

        statusElement.textContent =
            "変更をキャンセルしました。";

    }

    scrollToBottom();

}


/**
 * 更新処理に失敗した場合、
 * カードを再操作可能な状態へ戻す
 *
 * @param {HTMLElement} card
 * @param {string} errorMessage
 */
function resetUpdateConfirmation(
    card,
    errorMessage
) {

    if (!card) return;

    card.dataset.requestStatus =
        "PENDING";

    card.classList.remove(
        "update-confirmation-processing"
    );

    const buttons =
        card.querySelectorAll(
            ".update-confirmation-button"
        );

    buttons.forEach(
        function(button) {

            button.disabled =
                false;

        }
    );

    const statusElement =
        card.querySelector(
            ".update-confirmation-status"
        );

    if (statusElement) {

        statusElement.textContent =
            String(
                errorMessage ||
                "処理に失敗しました。"
            );

    }

    scrollToBottom();

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



/*
=========================================
更新確認カードの操作
=========================================
*/

document.addEventListener(
    "click",
    async function(event) {

        const actionButton =
            event.target.closest(
                ".update-confirmation-button"
            );

        if (!actionButton) {

            return;

        }

        const card =
            actionButton.closest(
                ".update-confirmation-card"
            );

        if (!card) {

            return;

        }

        const requestStatus =
            String(
                card.dataset.requestStatus ||
                ""
            ).trim();

        /*
         * PENDING以外のカードは操作しない。
         * 連続クリックによる二重処理もここで防止する。
         */
        if (
            requestStatus !==
            "PENDING"
        ) {

            return;

        }

        const requestId =
            String(
                card.dataset.requestId ||
                ""
            ).trim();

        if (!requestId) {

            resetUpdateConfirmation(
                card,
                "更新案IDを取得できませんでした。"
            );

            return;

        }

        const updateAction =
            String(
                actionButton.dataset
                    .updateAction ||
                ""
            ).trim();


        /*
        =========================================
        確定
        =========================================
        */

        if (
            updateAction ===
            "confirm"
        ) {

            startUpdateConfirmationProcessing(
                card,
                "変更を確定しています..."
            );

            try {

                const result =
                    await confirmUpdateRequest(
                        requestId
                    );

                if (
                    result &&
                    result.status ===
                        "success"
                ) {

                    completeUpdateConfirmation(
                        card,
                        result
                    );

                    addMessage(
                        result.message ||
                        "金型温度を更新しました。",
                        "shici"
                    );

                    return;

                }

                resetUpdateConfirmation(
                    card,
                    result &&
                    result.message
                        ? result.message
                        : "変更を確定できませんでした。"
                );

            }
            catch (error) {

                resetUpdateConfirmation(
                    card,
                    "エラーが発生しました。\n" +
                    (
                        error &&
                        error.message
                            ? error.message
                            : "変更を確定できませんでした。"
                    )
                );

            }

            return;

        }


        /*
        =========================================
        キャンセル
        =========================================
        */

        if (
            updateAction ===
            "cancel"
        ) {

            startUpdateConfirmationProcessing(
                card,
                "キャンセルしています..."
            );

            try {

                const result =
                    await cancelUpdateRequest(
                        requestId
                    );

                if (
                    result &&
                    result.status ===
                        "success"
                ) {

                    completeUpdateCancellation(
                        card
                    );

                    return;

                }

                resetUpdateConfirmation(
                    card,
                    result &&
                    result.message
                        ? result.message
                        : "変更をキャンセルできませんでした。"
                );

            }
            catch (error) {

                resetUpdateConfirmation(
                    card,
                    "エラーが発生しました。\n" +
                    (
                        error &&
                        error.message
                            ? error.message
                            : "変更をキャンセルできませんでした。"
                    )
                );

            }

        }

    }
);




