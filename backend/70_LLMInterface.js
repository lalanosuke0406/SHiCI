/**
 * SHiCI LLM Interface
 *
 * AI Contractを適切なLLM Adapterへ渡す。
 *
 * このEngineは特定のLLMを知らない。
 * OpenAI / Gemini / Claude等の選択だけを担当する。
 */

function LLMInterface_generate(aiContract) {

  const startTime = Date.now();

  try {

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

  } finally {

    Logger.log(
      "[TIME] LLMInterface_generate: " +
      (Date.now() - startTime) +
      " ms"
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



/*
=========================================
Natural Language Understanding
=========================================
*/


/**
 * 自然言語理解をLLMへ依頼する。
 *
 * このInterfaceは、
 * 特定のLLM Providerを知らない形で、
 *
 * Understanding Request Contract
 * ↓
 * LLM Adapter
 * ↓
 * Understanding Result
 *
 * を接続する。
 *
 * 返された結果は、
 * Understanding Result Contractによって
 * 構造検証を行う。
 *
 * @param {Object} understandingRequest
 * @returns {Object}
 */
function LLMInterface_understand(
  understandingRequest
) {

  const startTime =
    Date.now();

  try {

    /*
     * 入力側Contractを検証する。
     */
    LLMInterface_validateUnderstandingRequest(
      understandingRequest
    );

    const validatedRequest =
      UnderstandingRequestContract_validate(
        understandingRequest
      );


    const provider =
      Config_getLLMProvider();


    let understandingResult;


    switch (provider) {

      case "openai":

        understandingResult =
          OpenAIAdapter_understand(
            validatedRequest
          );

        break;


      case "mock":

        /*
         * MockによるUnderstandingは、
         * 後続の段階で専用Adapterとして実装する。
         *
         * 不完全な理解結果を仮に生成すると、
         * 正規表現による推測処理を再導入することに
         * つながるため、現段階では明示的に停止する。
         */
        throw new Error(
          "Mock ProviderのNatural Language Understandingは、まだ実装されていません。"
        );


      default:

        throw new Error(
          "Natural Language Understandingに未対応のLLM Providerです: " +
          provider
        );

    }


    /*
     * LLM Adapterから返された値を、
     * Understanding Result Contractとして検証する。
     *
     * Adapterの出力を、
     * 無検証のまま後続Engineへ渡してはならない。
     */
    return UnderstandingResultContract_validate(
      understandingResult
    );

  } finally {

    Logger.log(
      "[TIME] LLMInterface_understand: " +
      (Date.now() - startTime) +
      " ms"
    );

  }

}


/**
 * Natural Language Understanding用Requestの
 * 最低限の構造を確認する。
 *
 * 正式な構造検証は、
 * UnderstandingRequestContract_validate()
 * が担当する。
 *
 * この関数は、
 * LLM Interfaceの入口として
 * Contract Typeを明示的に確認する。
 *
 * @param {Object} understandingRequest
 */
function LLMInterface_validateUnderstandingRequest(
  understandingRequest
) {

  if (
    !understandingRequest ||
    typeof understandingRequest !==
      "object" ||
    Array.isArray(
      understandingRequest
    )
  ) {

    throw new Error(
      "Understanding Request Contractが指定されていません。"
    );

  }

  if (
    understandingRequest.contractType !==
      "understanding_request"
  ) {

    throw new Error(
      "Contract Typeがunderstanding_requestではありません。"
    );

  }

  UnderstandingRequestContract_validate(
    understandingRequest
  );

}




