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
    const userMessage =
        addMessage(
            text,
            "user"
        );

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


        else if (
            result.messageType ===
                "executive_challenge"
        ) {

            ExecutiveMessageController_handleChallenge(
                userMessage,
                loading,
                result
            );

        }


        else if (
            result.messageType ===
                "executive_challenge_failed"
        ) {

            ExecutiveMessageController_handleChallengeFailed(
                userMessage,
                loading,
                result
            );

        }


        else if (
            result.messageType ===
                "executive_message_unlocked"
        ) {

            ExecutiveMessageController_handleUnlocked(
                userMessage,
                loading,
                result
            );

        }


        else if (
            result.messageType ===
                "update_target_resolved"
        ) {

            /*
            * 更新対象と変更値が確定したため、
            * 書き込み権限を確認する専用APIを通して
            * 更新案を作成する。
            */
            await handleResolvedUpdateTarget(
                result
            );

            /*
            * 更新確認カードの表示が完了したため、
            * 「確認しています...」を削除する。
            */
            loading.remove();

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



/*
=========================================
更新対象確定後の処理
=========================================
*/

/**
 * update_target_resolvedを受け取り、
 * Entityの更新案を生成して
 * 確認カードを表示する。
 *
 * この関数を実行した時点では、
 * マスターデータはまだ更新されない。
 *
 * @param {Object} result
 * @returns {Promise<Object>}
 */
async function handleResolvedUpdateTarget(
    result
) {

    /*
    =========================================
    応答形式の確認
    =========================================
    */

    if (
        !result ||
        result.messageType !==
            "update_target_resolved"
    ) {

        throw new Error(
            "更新対象の確定情報がありません。"
        );

    }


    /*
    =========================================
    正式なUnderstanding Resultの取得
    =========================================
    */

    const understandingResult =
        result.understandingResult;


    if (
        !understandingResult ||
        typeof understandingResult !==
            "object" ||
        Array.isArray(
            understandingResult
        )
    ) {

        throw new Error(
            "変更案生成に必要なUnderstanding Resultを取得できませんでした。"
        );

    }





    /*
    =========================================
    新しいEntity Change Proposalを生成
    =========================================
    */

    const proposal =
        await createChangeProposal(
            understandingResult,
            null
        );


    /*
    =========================================
    Proposal生成結果の確認
    =========================================
    */

    if (
        !proposal ||
        typeof proposal !==
            "object" ||
        Array.isArray(
            proposal
        )
    ) {

        throw new Error(
            "変更案を作成できませんでした。"
        );

    }


    if (
        proposal.status !==
            "proposal_created"
    ) {

        throw new Error(
            proposal.message ||
            "変更案を作成できませんでした。"
        );

    }


    if (
        proposal.requiresConfirmation !==
            true ||
        !proposal.proposalId ||
        !proposal.changePlanId
    ) {

        throw new Error(
            "変更確認に必要な情報を取得できませんでした。"
        );

    }


    /*
    =========================================
    更新確認カードを表示
    =========================================
    */

    addUpdateConfirmationCard(
        proposal
    );


    return proposal;

}


