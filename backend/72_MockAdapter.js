/**
 * SHiCI Contract Viewer
 *
 * AI Contractをそのまま人間へ表示する。
 * 外部AIは呼び出さない。
 *
 * Version 1.0
 */

function MockAdapter_generate(aiContract) {

  MockAdapter_validateContract(aiContract);

  Logger.log(
    "===== AI CONTRACT =====\n" +
    JSON.stringify(aiContract, null, 2)
  );

  return OpenAIAdapter_preview(
    aiContract
    );

}


/**
 * Contract最低限チェック
 */
function MockAdapter_validateContract(aiContract) {

  if (
    !aiContract ||
    typeof aiContract !== "object"
  ) {

    throw new Error(
      "AI Contractがありません。"
    );

  }

  if (
    aiContract.responseType !==
    "ai_contract"
  ) {

    throw new Error(
      "responseTypeがai_contractではありません。"
    );

  }

}