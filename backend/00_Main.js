



function checkApiKey(e) {
  const key = e.parameter.apiKey;
  return key === API_KEY;
}


/*==========================
  POST
==========================*/

function doPost(e) {

  const data =
    JSON.parse(e.postData.contents);

  /*
  if (data.apiKey !== API_KEY) {
      ...
  }
  */

  const result =
    ActionRouter_routePost(data);

  return ContentService
    .createTextOutput(
      JSON.stringify(result)
    )
    .setMimeType(
      ContentService.MimeType.JSON
    );

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






