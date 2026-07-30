



function checkApiKey(e) {
  const key = e.parameter.apiKey;
  return key === API_KEY;
}


/**
 * JSONレスポンスを生成する
 */
function createJsonResponse(
  result
) {

  return ContentService
    .createTextOutput(
      JSON.stringify(
        result
      )
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );

}




/*==========================
  POST
==========================*/

function doPost(e) {

  try {

    if (
      !e ||
      !e.postData ||
      !e.postData.contents
    ) {

      return createJsonResponse({
        status: "error",
        messageType: "error",
        code: "INVALID_REQUEST",
        message:
          "リクエストデータがありません。"
      });

    }

    let data;

    try {

      data =
        JSON.parse(
          e.postData.contents
        );

    } catch (parseError) {

      return createJsonResponse({
        status: "error",
        messageType: "error",
        code: "INVALID_JSON",
        message:
          "リクエストの形式が正しくありません。"
      });

    }

    const result =
      ActionRouter_routePost(
        data
      );

    return createJsonResponse(
      result
    );

  } catch (error) {

    console.error(
      "doPost error:",
      error
    );

    return createJsonResponse({
      status: "error",
      messageType: "error",
      code: "REQUEST_FAILED",
      message:
        error &&
        error.message
          ? error.message
          : "処理中にエラーが発生しました。"
    });

  }

}


/*==========================
  GET
==========================*/

function doGet(e) {

  Logger.log(JSON.stringify(e.parameter));

  const result = ActionRouter_routeGet(e);

  return ContentService
    .createTextOutput(
      JSON.stringify(result)
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );

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






