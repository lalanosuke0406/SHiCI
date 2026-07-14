/**
 * SHiCI LLM Interface
 *
 * AI Contractを適切なLLM Adapterへ渡す。
 *
 * このEngineは特定のLLMを知らない。
 * OpenAI / Gemini / Claude等の選択だけを担当する。
 */

function LLMInterface_generate(aiContract) {

  LLMInterface_validate(aiContract);

  const provider =
    Config_getLLMProvider();

  switch (provider) {

    case "mock":
        return MockAdapter_generate(
        aiContract
        );

    case "openai":
        return OpenAIAdapter_generate(
        aiContract
        );

    default:
        throw new Error(
        "未対応のLLM Providerです: " +
        provider
        );

    }

}


/**
 * AI Contractの最低限の構造を確認する。
 */
function LLMInterface_validate(aiContract) {

  if (
    !aiContract ||
    typeof aiContract !== "object"
  ) {
    throw new Error(
      "AI Contractが指定されていません。"
    );
  }

  if (
    aiContract.responseType !==
    "ai_contract"
  ) {
    throw new Error(
      "Response Typeがai_contractではありません。"
    );
  }

}