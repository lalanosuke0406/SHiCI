



function checkApiKey(e) {
  const key = e.parameter.apiKey;
  return key === API_KEY;
}


/*==========================
  POST
==========================*/

function doPost(e) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("製品マスター");

  const data = JSON.parse(e.postData.contents);

  /*
  if (data.apiKey !== API_KEY) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status:"error",
        message:"APIキーが正しくありません"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
  */

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

  return ContentService
    .createTextOutput(JSON.stringify({
      status:"error",
      message:"不明なactionです"
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*==========================
  GET
==========================*/

function doGet(e) {

  Logger.log(JSON.stringify(e.parameter));

  // SHiCIチャット入口
  if (e.parameter.text) {

    const text = e.parameter.text;
    const sessionId = e.parameter.sessionId || "default";

    Logger.log("routeRequest開始");

    const result = routeRequest(text, sessionId);

    Logger.log(result);

    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // 以下は既存API
  if (e.parameter.action === "selectCandidate") {
    return selectCandidate(e);
  }
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

  return ContentService
    .createTextOutput(JSON.stringify({
      status:"error",
      message:"Unknown Request"
    }))
    .setMimeType(ContentService.MimeType.JSON);
}



function selectCandidate(e) {

  const result = ConversationStateEngine_selectCandidate(
    e.parameter.entityId,
    e.parameter.sessionId
  );

  return ContentService
    .createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);

}






