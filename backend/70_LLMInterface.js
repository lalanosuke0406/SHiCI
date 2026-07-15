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




/**
 * Semantic Entity ResolutionをLLMへ依頼する。
 *
 * 通常回答用のAI Contractとは異なり、
 * Entity候補を構造化データとして取得する。
 *
 * @param {Object} semanticContract
 * @return {Object}
 */
function LLMInterface_resolveEntityCandidates(
  semanticContract
) {

  LLMInterface_validateSemanticContract(
    semanticContract
  );

  const provider =
    Config_getLLMProvider();

  switch (provider) {

    case "openai":
      return OpenAIAdapter_resolveEntityCandidates(
        semanticContract
      );

    case "mock":
      /*
       * Mock Providerでは外部AIを利用しないため、
       * Semantic候補なしとして扱う。
       */
      return {
        candidates: []
      };

    default:
      throw new Error(
        "Semantic Entity Resolutionに未対応のLLM Providerです: " +
        provider
      );
  }
}


/**
 * Semantic Resolution Contractの
 * 最低限の構造を確認する。
 */
function LLMInterface_validateSemanticContract(
  semanticContract
) {

  if (
    !semanticContract ||
    typeof semanticContract !== "object"
  ) {
    throw new Error(
      "Semantic Resolution Contractが指定されていません。"
    );
  }

  if (
    semanticContract.taskType !==
    "semantic_entity_resolution"
  ) {
    throw new Error(
      "Task Typeがsemantic_entity_resolutionではありません。"
    );
  }

  if (
    !String(
      semanticContract.entityQuery || ""
    ).trim()
  ) {
    throw new Error(
      "Semantic Resolution ContractにEntity Queryがありません。"
    );
  }

  if (
    !Array.isArray(
      semanticContract.candidates
    )
  ) {
    throw new Error(
      "Semantic Resolution ContractにCandidate一覧がありません。"
    );
  }
}