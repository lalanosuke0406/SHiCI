/*
=========================================
SHiCI
ActionRouter.js

役割：
・リクエスト振り分け
=========================================
*/

/**
 * GETルーティング
 */
function ActionRouter_routeGet(e) {

    // SHiCIチャット
    if (e.parameter.text) {

        const text =
            e.parameter.text;

        const sessionId =
            e.parameter.sessionId || "default";

        return routeRequest(
            text,
            sessionId
        );

    }

    // Candidate選択
    if (
        e.parameter.action ===
        "selectCandidate"
    ) {

        return ConversationStateEngine_selectCandidate(
            e.parameter.entityId,
            e.parameter.sessionId
        );

    }

    // その他検索
    if (e.parameter.type === "trouble") return searchTrouble(e);
    if (e.parameter.type === "mold") return searchMold(e);
    if (e.parameter.type === "moldHistory") return searchMoldHistory(e);
    if (e.parameter.type === "material") return searchMaterial(e);
    if (e.parameter.type === "machine") return searchMachine(e);
    if (e.parameter.type === "products") return searchProducts(e);
    if (e.parameter.type === "part") return searchParts(e);
    if (e.parameter.type === "usedPart") return searchUsedParts(e);
    if (e.parameter.type === "condition") return searchCondition(e);
    if (e.parameter.type === "conditionDetail") return searchConditionDetail(e);
    if (e.parameter.type === "snapshot") return getSnapshot(e);
    if (e.parameter.type === "troubleByMaterial") return searchTroubleByMaterial(e);
    if (e.parameter.type === "search") return fullTextSearch(e);
    if (e.parameter.type === "process") return searchProcesses(e);
    if (e.parameter.type === "usedProcess") return searchUsedProcesses(e);

    return {
        status: "error",
        message: "Unknown Request"
    };

}

/**
 * POSTルーティング
 */
function ActionRouter_routePost(data) {


    if (data.action === "login") {

        return AuthenticationEngine_login(
            data.idToken
        );

    }

    if (data.action === "ask") {

        if (
            !SessionEngine_isSessionValid(
                data.sessionId
            )
        ) {

            return {
                status: "error",
                messageType: "error",
                code: "SESSION_INVALID",
                message: "セッションが無効です。再度ログインしてください。"
            };

        }

        const executiveMessageResult =
            ExecutiveMessageSessionEngine_tryHandleChat(
                data.sessionId,
                data.text
            );

        if (executiveMessageResult) {

            return executiveMessageResult;

        }

        return routeRequest(
            data.text,
            data.sessionId
        );

    }

    if (
        data.action ===
        "selectCandidate"
    ) {

        if (
            !SessionEngine_isSessionValid(
                data.sessionId
            )
        ) {

            return {
                status: "error",
                messageType: "error",
                code: "SESSION_INVALID",
                message:
                    "セッションが無効です。再度ログインしてください。"
            };

        }

        return ConversationStateEngine_selectCandidate(
            String(
                data.entityId || ""
            ).trim(),

            String(
                data.entityType || ""
            ).trim(),

            data.sessionId
        );

    }


    /*
    =========================================
    役員メッセージ
    =========================================
    */

    if (
        data.action ===
        "executiveMessageListPeers"
    ) {

        return ExecutiveMessageService_listPeers(
            data.sessionId,
            data.executiveSessionToken
        );

    }

    if (
        data.action ===
        "executiveMessageList"
    ) {

        return ExecutiveMessageService_listMessages(
            data.sessionId,
            data.executiveSessionToken,
            data.peerUserId
        );

    }

    if (
        data.action ===
        "executiveMessageSend"
    ) {

        return ExecutiveMessageService_sendMessage(
            data.sessionId,
            data.executiveSessionToken,
            data.recipientUserId,
            data.body
        );

    }

    if (
        data.action ===
        "executiveMessageLock"
    ) {

        return ExecutiveMessageService_lock(
            data.sessionId,
            data.executiveSessionToken
        );

    }



        /*
    =========================================
    書き込み操作の認証・権限確認
    =========================================
    */


    let authenticatedUser =
    null;

    const writeActions = [

        "updateProduct",

        "addTrouble",
        "updateTrouble",

        "addMold",
        "updateMold",

        "addMoldHistory",
        "updateMoldHistory",

        "addMaterial",
        "updateMaterial",

        "addMachine",
        "updateMachine",

        "addProduct",

        "addPart",
        "updatePart",

        "addUsedPart",
        "updateUsedPart",

        "addCondition",
        "addConditionDetail",

        "addProcess",
        "updateProcess",

        "addUsedProcess",
        "updateUsedProcess",

        "createMoldTemperatureUpdateProposal",
        "confirmUpdateRequest",
        "cancelUpdateRequest",

        "createChangeProposal",
        "confirmExecutionProposal"

    ];

    if (
        writeActions.includes(
            data.action
        )
    ) {

        authenticatedUser =
            AuthorizationEngine_requireWritePermission(
                data.sessionId
            );

    }

   

    /*
    =========================================
    製品マスター取得
    =========================================
    */

    let sheet = null;

    if (
        data.action === "updateProduct" ||
        data.action === "addProduct"
    ) {

        sheet =
            SpreadsheetApp
                .openById(
                    SPREADSHEET_ID
                )
                .getSheetByName(
                    "製品マスター"
                );

        if (!sheet) {

            throw new Error(
                "製品マスターがありません。"
            );

        }

    }




    if (data.action === "updateProduct") return updateProduct(sheet, data);

    if (data.action === "addTrouble") return addTrouble(data);
    if (data.action === "updateTrouble") return updateTroubleById(data);

    if (data.action === "addMold") return addMold(data);
    if (data.action === "updateMold") return updateMold(data);

    if (data.action === "addMoldHistory") return addMoldHistory(data);
    if (data.action === "updateMoldHistory") return updateMoldHistoryById(data);

    if (data.action === "addMaterial") return addMaterial(data);
    if (data.action === "updateMaterial") return updateMaterial(data);

    if (data.action === "addMachine") return addMachine(data);
    if (data.action === "updateMachine") return updateMachine(data);

    if (data.action === "addProduct") return addProduct(sheet, data);

    if (data.action === "addPart") return addPart(data);
    if (data.action === "updatePart") return updatePart(data);

    if (data.action === "addUsedPart") return addUsedPart(data);
    if (data.action === "updateUsedPart") return updateUsedPart(data);

    if (data.action === "addCondition") return addCondition(data);
    if (data.action === "addConditionDetail") return addConditionDetail(data);






    /*
    =========================================
    Entity Change Proposal生成
    =========================================
    */

    if (
        data.action ===
        "createChangeProposal"
    ) {

        return ChangeProposalService_create(
            data.understandingResult,
            {

                requestedBy:
                    authenticatedUser.userId,

                userId:
                    authenticatedUser.userId,

                requestedAt:
                    new Date()
                        .toISOString(),

                requestId:
                    String(
                        data.requestId || ""
                    ).trim() ||
                    null,

                source:
                    "action_router"

            }
        );

    }














    /*
=========================================
Entity Change Proposal確定・実行
=========================================
*/

if (
    data.action ===
    "confirmExecutionProposal"
) {

    return ActionExecutionService_execute({

        actionType:
            ACTION_EXECUTION_SERVICE_ACTION_CONFIRM,

        proposalId:
            String(
                data.proposalId || ""
            ).trim(),

        changePlanId:
            String(
                data.changePlanId || ""
            ).trim(),

        metadata: {

            requestedBy:
                authenticatedUser.userId,

            decidedBy:
                authenticatedUser.userId,

            userId:
                authenticatedUser.userId,

            requestedAt:
                new Date()
                    .toISOString(),

            requestId:
                String(
                    data.requestId || ""
                ).trim() ||
                null,

            source:
                "action_router"

        }

    });

}























    /*
    =========================================
    金型温度の更新案生成
    =========================================
    */

    if (
        data.action ===
        "createMoldTemperatureUpdateProposal"
    ) {

        return UpdateRequestEngine_createMoldTemperatureProposal(
            String(
                data.productId || ""
            ).trim(),

            String(
                data.expectedCurrentConditionId || ""
            ).trim(),

            data.newMoldTemperature,

            authenticatedUser
        );

    }


    /*
    =========================================
    更新案の確定
    =========================================
    */

    if (
        data.action ===
        "confirmUpdateRequest"
    ) {

        return UpdateRequestEngine_confirm(
            String(
                data.requestId || ""
            ).trim(),

            authenticatedUser
        );

    }


    /*
    =========================================
    更新案のキャンセル
    =========================================
    */

    if (
        data.action ===
        "cancelUpdateRequest"
    ) {

        return UpdateRequestEngine_cancel(
            String(
                data.requestId || ""
            ).trim(),

            authenticatedUser
        );

    }





    if (data.action === "addProcess") return addProcess(data);
    if (data.action === "updateProcess") return updateProcess(data);

    if (data.action === "addUsedProcess") return addUsedProcess(data);
    if (data.action === "updateUsedProcess") return updateUsedProcess(data);

    return {
        status: "error",
        message: "不明なactionです"
    };

}