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

    const sheet =
        SpreadsheetApp
            .openById(SPREADSHEET_ID)
            .getSheetByName("製品マスター");

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

            data.sessionId
        );

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

    if (data.action === "addProcess") return addProcess(data);
    if (data.action === "updateProcess") return updateProcess(data);

    if (data.action === "addUsedProcess") return addUsedProcess(data);
    if (data.action === "updateUsedProcess") return updateUsedProcess(data);

    return {
        status: "error",
        message: "不明なactionです"
    };

}