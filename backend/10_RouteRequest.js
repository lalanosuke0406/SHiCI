/**
 * SHiCI API 統一入口
 *
 * askShici() が
 * ・文字列を返した場合 → 通常メッセージ
 * ・オブジェクトを返した場合 → 構造化メッセージ
 * として扱う
 */
function routeRequest(text, sessionId) {

  text = String(text || "").trim();
  sessionId = sessionId || "default";

  if (!text) {
    return {
      status: "success",
      messageType: "text",
      answer: "質問を入力してください。"
    };
  }

  let result;

  try {

    result =
      askShici(text, sessionId);

  } catch (error) {

    Logger.log(error);

    return createError(
      error &&
      error.message
        ? error.message
        : String(error)
    );

  }

  // 候補カードなどの構造化された回答
  if (
    result &&
    typeof result === "object" &&
    !Array.isArray(result)
  ) {
    return Object.assign(
      {
        status: "success"
      },
      result
    );
  }

  // 従来の文字列回答
  return {
    status: "success",
    messageType: "text",
    answer: String(result || "")
  };
}


/**
 * 通常の文字回答を作る
 */
function createAnswer(answer) {
  return {
    status: "success",
    messageType: "text",
    answer: String(answer || "")
  };
}


/**
 * エラー回答を作る
 */
function createError(message) {
  return {
    status: "error",
    messageType: "error",
    message: String(message || "エラーが発生しました。")
  };
}