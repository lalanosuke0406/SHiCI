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
 * 金型温度の更新案を生成して
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
    更新種別の確認
    =========================================
    */

    const updateType =
        String(
            result.updateType || ""
        ).trim();

    if (
        updateType !==
            "mold_temperature"
    ) {

        throw new Error(
            "この更新内容には、まだ対応していません。"
        );

    }


    /*
    =========================================
    更新対象情報の取得
    =========================================
    */

    const target =
        result.target &&
        typeof result.target ===
            "object"
            ? result.target
            : {};

    const productId =
        String(
            target.productId ||
            target.entityId ||
            ""
        ).trim();

    if (!productId) {

        throw new Error(
            "更新対象の製品IDを取得できませんでした。"
        );

    }


    /*
    =========================================
    期待状態の取得
    =========================================
    */

    const expectedState =
        result.expectedState &&
        typeof result.expectedState ===
            "object"
            ? result.expectedState
            : {};

    const expectedCurrentConditionId =
        String(
            expectedState.currentConditionId ||
            ""
        ).trim();

    if (
        !expectedCurrentConditionId
    ) {

        throw new Error(
            "現在標準条件IDを取得できませんでした。"
        );

    }


    /*
    =========================================
    変更予定値の取得
    =========================================
    */

    const proposedValue =
        result.proposedValue &&
        typeof result.proposedValue ===
            "object"
            ? result.proposedValue
            : {};

    const newMoldTemperature =
        Number(
            proposedValue.value
        );

    if (
        !Number.isFinite(
            newMoldTemperature
        )
    ) {

        throw new Error(
            "変更後の金型温度を取得できませんでした。"
        );

    }


    /*
    =========================================
    更新案を生成
    =========================================
    */

    const proposal =
        await createMoldTemperatureUpdateProposal(
            productId,
            expectedCurrentConditionId,
            newMoldTemperature
        );


    /*
    =========================================
    更新案生成結果の確認
    =========================================
    */

    if (
        !proposal ||
        proposal.status !==
            "success"
    ) {

        throw new Error(
            proposal &&
            proposal.message
                ? proposal.message
                : "更新案を作成できませんでした。"
        );

    }

    if (
        !proposal.requiresConfirmation ||
        !proposal.requestId
    ) {

        throw new Error(
            "更新確認に必要な情報を取得できませんでした。"
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


