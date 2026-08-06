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
        typeof result !==
            "object" ||
        Array.isArray(
            result
        )
    ) {

        throw new Error(
            "更新案の情報がありません。"
        );

    }


    /*
    =========================================
    Proposal形式の判定
    =========================================
    */

    const proposalId =
        String(
            result.proposalId || ""
        ).trim();


    const changePlanId =
        String(
            result.changePlanId || ""
        ).trim();


    const requestId =
        String(
            result.requestId || ""
        ).trim();


    const isExecutionProposal =
        Boolean(
            proposalId &&
            changePlanId
        );


    const isLegacyUpdateRequest =
        Boolean(
            requestId
        );


    if (
        !isExecutionProposal &&
        !isLegacyUpdateRequest
    ) {

        throw new Error(
            "更新確認に必要なIDがありません。"
        );

    }


    /*
    =========================================
    表示情報の取得
    =========================================
    */

    const confirmation =
        isExecutionProposal
            ? (
                result.presentation &&
                typeof result.presentation ===
                    "object" &&
                !Array.isArray(
                    result.presentation
                )
                    ? result.presentation
                    : {}
            )
            : (
                result.confirmation &&
                typeof result.confirmation ===
                    "object" &&
                !Array.isArray(
                    result.confirmation
                )
                    ? result.confirmation
                    : {}
            );

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

    const proposalChanges =
        isExecutionProposal &&
        Array.isArray(
            confirmation.changes
        )
            ? confirmation.changes
            : [];

    const presentationActions =
        Array.isArray(
            confirmation.actions
        )
            ? confirmation.actions
            : [];


    const confirmAction =
        presentationActions.find(
            function(action) {

                return (
                    action &&
                    action.actionType ===
                        "confirm"
                );

            }
        ) || {};


    const rejectAction =
        presentationActions.find(
            function(action) {

                return (
                    action &&
                    action.actionType ===
                        "reject"
                );

            }
        ) || {};


    const confirmLabel =
        String(
            confirmation.confirmLabel ||
            confirmAction.label ||
            "この内容で確定"
        ).trim();


    const cancelLabel =
        String(
            confirmation.cancelLabel ||
            rejectAction.label ||
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

    card.dataset.proposalMode =
        isExecutionProposal
            ? "execution"
            : "legacy";


    card.dataset.requestId =
        requestId;


    card.dataset.proposalId =
        proposalId;


    card.dataset.changePlanId =
        changePlanId;


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
    変更項目一覧
    =========================================
    */

    if (
        proposalChanges.length >
            0
    ) {

        const changesElement =
            document.createElement(
                "div"
            );

        changesElement.className =
            "update-confirmation-changes";


        proposalChanges.forEach(
            function(change) {

                if (
                    !change ||
                    typeof change !==
                        "object" ||
                    Array.isArray(
                        change
                    )
                ) {

                    return;

                }


                const label =
                    String(
                        change.label ||
                        change.path ||
                        "変更項目"
                    ).trim();


                const before =
                    change.before ===
                        null ||
                    change.before ===
                        undefined
                        ? "未設定"
                        : String(
                            change.before
                        );


                const after =
                    change.after ===
                        null ||
                    change.after ===
                        undefined
                        ? "未設定"
                        : String(
                            change.after
                        );


                const unit =
                    String(
                        change.unit ||
                        ""
                    ).trim();


                const changeElement =
                    document.createElement(
                        "div"
                    );

                changeElement.className =
                    "update-confirmation-change";


                const labelElement =
                    document.createElement(
                        "div"
                    );

                labelElement.className =
                    "update-confirmation-change-label";

                labelElement.textContent =
                    label;


                const valueElement =
                    document.createElement(
                        "div"
                    );

                valueElement.className =
                    "update-confirmation-change-value";

                valueElement.textContent =
                    before +
                    unit +
                    " → " +
                    after +
                    unit;


                changeElement.appendChild(
                    labelElement
                );

                changeElement.appendChild(
                    valueElement
                );

                changesElement.appendChild(
                    changeElement
                );

            }
        );


        body.appendChild(
            changesElement
        );

    }







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
                    "update_target_resolved"
            ) {

                /*
                * 更新案を生成し、
                * 確認カードを表示する。
                */
                await handleResolvedUpdateTarget(
                    result
                );


                /*
                * 候補選択が完了したため、
                * 選択済み表示へ変える。
                */
                completeCandidateSelection(
                    card
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

        const proposalMode =
            String(
                card.dataset.proposalMode ||
                ""
            ).trim();


        const requestId =
            String(
                card.dataset.requestId ||
                ""
            ).trim();


        const proposalId =
            String(
                card.dataset.proposalId ||
                ""
            ).trim();


        const changePlanId =
            String(
                card.dataset.changePlanId ||
                ""
            ).trim();


        if (
            proposalMode ===
                "execution"
        ) {

            if (
                !proposalId ||
                !changePlanId
            ) {

                resetUpdateConfirmation(
                    card,
                    "変更案の確定に必要なIDを取得できませんでした。"
                );

                return;

            }

        } else {

            if (
                !requestId
            ) {

                resetUpdateConfirmation(
                    card,
                    "更新案IDを取得できませんでした。"
                );

                return;

            }

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

                let result =
                    null;


                if (
                    proposalMode ===
                        "execution"
                ) {

                    result =
                        await confirmExecutionProposal(
                            proposalId,
                            changePlanId,
                            null
                        );

                } else {

                    result =
                        await confirmUpdateRequest(
                            requestId
                        );

                }

                const isExecutionSuccess =
                    proposalMode ===
                        "execution" &&
                    result &&
                    result.status ===
                        "completed" &&
                    result.executionStatus ===
                        "success";


                const isLegacySuccess =
                    proposalMode !==
                        "execution" &&
                    result &&
                    result.status ===
                        "success";


                if (
                    isExecutionSuccess ||
                    isLegacySuccess
                ) {

                    completeUpdateConfirmation(
                        card,
                        result
                    );

                    addMessage(
                        proposalMode ===
                            "execution"
                            ? "変更を確定しました。"
                            : (
                                result.message ||
                                "金型温度を更新しました。"
                            ),
                        "shici"
                    );

                    return;

                }

                let failureMessage =
                    "変更を確定できませんでした。";


                if (
                    proposalMode ===
                        "execution"
                ) {

                    if (
                        result &&
                        result.executionStatus ===
                            "rolled_back"
                    ) {

                        failureMessage =
                            "変更処理に失敗したため、元の状態へ戻しました。";

                    } else if (
                        result &&
                        result.executionStatus ===
                            "partial"
                    ) {

                        failureMessage =
                            "変更処理が一部だけ完了しました。管理者へ確認してください。";

                    } else if (
                        result &&
                        result.executionStatus ===
                            "failed"
                    ) {

                        failureMessage =
                            "変更処理を実行できませんでした。";

                    }

                } else if (
                    result &&
                    result.message
                ) {

                    failureMessage =
                        result.message;

                }


                resetUpdateConfirmation(
                    card,
                    failureMessage
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

                let result =
                    null;


                if (
                    proposalMode ===
                        "execution"
                ) {

                    /*
                    * 新Execution ProposalのReject Actionは
                    * まだBackendへ接続していない。
                    *
                    * この段階では、画面上だけキャンセル済みにして、
                    * Pending Changeは有効期限による失効へ委ねる。
                    */
                    completeUpdateCancellation(
                        card
                    );


                    addMessage(
                        "変更をキャンセルしました。",
                        "shici"
                    );


                    return;

                } else {

                    result =
                        await cancelUpdateRequest(
                            requestId
                        );

                }

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




