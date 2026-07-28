/**
 * SHiCI General Knowledge Engine
 *
 * Company Knowledgeを必要としない、
 * 一般的な知識に関する質問を扱う。
 *
 * General Knowledgeは、
 * SHiCIへ登録された社内事実として扱わない。
 *
 * Version 1.0
 */


/**
 * 発話がGeneral Knowledgeだけで処理可能かを判定する。
 *
 * Version 1.0では誤判定を避けるため、
 * 明らかな一般知識の質問だけを対象とする。
 *
 * Company Knowledgeを参照する可能性がある発話は、
 * General Knowledgeとして確定しない。
 *
 * @param {string} text
 * @return {boolean}
 */
function GeneralKnowledgeEngine_canHandle(text) {

  const normalized =
    GeneralKnowledgeEngine_normalizeText(text);

  if (!normalized) {
    return false;
  }

  /*
   * 社内Entityや登録情報を尋ねている可能性が高い表現。
   *
   * これらを含む場合は、General Knowledgeへ送らず、
   * Company Knowledge側で処理する。
   */
  const companyKnowledgePatterns = [
    /図番/,
    /金型番号/,
    /金型/,
    /成形機/,
    /何号機/,
    /取数/,
    /取り数/,
    /ゲート/,
    /型温/,
    /金型温度/,
    /乾燥条件/,
    /標準条件/,
    /製品重量/,
    /単重/,
    /ショット重量/,
    /サイクル/,
    /材料は/,
    /材料を/,
    /登録/,
    /変更/,
    /更新/,
    /履歴/,
    /トラブル/,
    /注意点/
  ];

  const mayRequireCompanyKnowledge =
    companyKnowledgePatterns.some(
      function(pattern) {
        return pattern.test(normalized);
      }
    );

  if (mayRequireCompanyKnowledge) {
    return false;
  }

  /*
   * 明らかな一般知識質問。
   *
   * Version 1.0では、
   * 定義・性質・理由・比較・一般的方法など、
   * Entityの特定を必要としない質問を対象とする。
   */
  const generalKnowledgePatterns = [

    // 定義
    /とは(?:何|なん)?(?:ですか)?$/,
    /って何(?:ですか)?$/,
    /とはどういう(?:意味|もの)(?:ですか)?$/,
    /の意味(?:は|を教えて)/,

    // 一般的な性質
    /の特徴(?:は|を教えて)/,
    /の性質(?:は|を教えて)/,
    /の特性(?:は|を教えて)/,
    /の用途(?:は|を教えて)/,
    /のメリット(?:は|を教えて)/,
    /のデメリット(?:は|を教えて)/,

    // 原因・原理
    /なぜ(?:ですか)?$/,
    /どうして(?:ですか)?$/,
    /の理由(?:は|を教えて)/,
    /の原理(?:は|を教えて)/,
    /の仕組み(?:は|を教えて)/,

    // 一般比較
    /と.+の違い(?:は|を教えて)/,
    /と.+を比較/,
    /どちらが.+(?:ですか)?$/,

    // 一般的方法
    /するには(?:どうすればいい|どうしたらいい|何が必要)/,
    /の方法(?:は|を教えて)/,
    /どうやって.+(?:しますか|するの)/,

    // 一般値・一般条件
    /一般的な/,
    /一般には/,
    /通常は/,
    /目安(?:は|を教えて)/,
    /耐熱温度(?:は|を教えて)/,
    /融点(?:は|を教えて)/,
    /ガラス転移温度(?:は|を教えて)/,
    /比重(?:は|を教えて)/,
    /線膨張係数(?:は|を教えて)/,
    /熱分解温度(?:は|を教えて)/
  ];

  return generalKnowledgePatterns.some(
    function(pattern) {
      return pattern.test(normalized);
    }
  );
}


/**
 * General Knowledge判定用に入力を正規化する。
 *
 * 意味を変えず、
 * 文字幅、空白、末尾記号のみを整える。
 *
 * @param {string} text
 * @return {string}
 */
function GeneralKnowledgeEngine_normalizeText(text) {

  return String(text || "")
    .normalize("NFKC")
    .trim()
    .replace(/[。．.!！?？]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}


/**
 * General Knowledge用のAI Contractを構築する。
 *
 * このContractはCompany Knowledgeを含まない。
 * 一般知識を一般論として回答することだけを許可する。
 *
 * @param {string} text
 * @return {Object}
 */
function GeneralKnowledgeEngine_buildContract(text) {

  return {
    schemaVersion: "1.0",

    responseType: "ai_contract",

    metadata: {
      source: "SHiCI",
      knowledgeBoundary: "general",
      knowledgeSources: [
        "general"
      ]
    },

    systemInstruction: {
      role: "SHiCI",

      objective:
        "ユーザーの質問に対して、一般的な知識を用いて正確かつ分かりやすく回答する。",

      rules: [
        "一般知識として回答し、SHiCIに登録された社内情報として表現しない。",
        "特定企業、特定製品、特定金型、特定設備の事実を推測しない。",
        "質問が個別の社内情報を必要とする場合は、一般論だけで断定しない。",
        "一般値に条件や幅がある場合は、単一の絶対値として断定しない。",
        "前提条件によって回答が変わる場合は、重要な前提を明示する。",
        "確実でない内容を、確定した事実として表現しない。",
        "ユーザーが使用した言語と同じ言語で回答する。",
        "質問へ直接答え、必要以上に情報を広げない。",
        "Knowledge Boundary、Knowledge Source、Entity Resolutionなどの内部構造をユーザーへ示さない。"
      ]
    },

    responsePolicy: {
      sourceOfTruth:
        "general_knowledge",

      knowledgeSources: [
        "general"
      ],

      allowCalculation: true,
      allowSummary: true,
      allowExplanation: true,
      allowGroundedInference: true,
      allowAssumption: false,

      allowGeneralKnowledge: true,
      allowCompanyKnowledge: false,

      missingInformationBehavior:
        "state_limitation_or_request_context",

      responseLanguage:
        "same_as_user"
    },

    context: {
      knowledgeBoundary:
        "general",

      knowledgeSources: [
        "general"
      ],

      companyKnowledge: null
    },

    userQuestion:
      String(text || "").trim()
  };
}


/**
 * General Knowledgeへ応答する。
 *
 * General Knowledgeも、
 * 標準AI Contract経路を使用する。
 *
 * @param {string} text
 * @return {string}
 */
function GeneralKnowledgeEngine_respond(text) {

  const aiContract =
    GeneralKnowledgeEngine_buildContract(text);

  return LLMInterface_generate(
    aiContract
  );
}