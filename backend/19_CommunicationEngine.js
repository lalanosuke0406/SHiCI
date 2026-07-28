/**
 * SHiCI Communication Engine
 *
 * Knowledge処理を必要としない、
 * 明らかな日常コミュニケーションを扱う。
 *
 * CommunicationはEntity Resolutionへ進まない。
 * 社内Knowledgeに関する事実も回答しない。
 */


/**
 * 発話がCommunicationだけで完結するかを判定する。
 *
 * Version 1.0では、誤判定を避けるため、
 * 明らかな挨拶・感謝・別れ・応答だけを対象とする。
 *
 * @param {string} text
 * @return {boolean}
 */
function CommunicationEngine_canHandle(text) {

  const normalized =
    CommunicationEngine_normalizeText(text);

  if (!normalized) {
    return false;
  }

  const patterns = [
    // 挨拶
    /^(こんにちは|こんばんは|おはよう|おはようございます)$/,
    /^(やあ|どうも|もしもし)$/,

    // 感謝
    /^(ありがとう|ありがとうございます|ありがとうございました)$/,
    /^(助かりました|助かります)$/,

    // 別れ・終了
    /^(さようなら|またね|また明日|ではまた)$/,
    /^(お疲れさま|お疲れ様|お疲れさまでした|お疲れ様でした)$/,

    // 軽い応答
    /^(はい|いいえ|わかりました|分かりました|了解です|了解しました)$/,
    /^(なるほど|そうですね|そうですか)$/
  ];

  return patterns.some(function(pattern) {
    return pattern.test(normalized);
  });
}


/**
 * Communication用の入力を正規化する。
 *
 * 意味を変えず、末尾の記号や余分な空白だけを除く。
 */
function CommunicationEngine_normalizeText(text) {

  return String(text || "")
    .normalize("NFKC")
    .trim()
    .replace(/[。．.!！?？]+$/g, "")
    .trim();
}





/**
 * Communication用のAI Contractを構築する。
 *
 * 社内Knowledgeを参照せず、
 * 自然なコミュニケーションだけを生成する。
 *
 * @param {string} text
 * @return {Object}
 */
function CommunicationEngine_buildContract(text) {

  return {
    schemaVersion: "1.0",

    responseType: "ai_contract",

    metadata: {
      source: "SHiCI",
      knowledgeBoundary: "communication"
    },

    systemInstruction: {
      role: "SHiCI",

      objective:
        "ユーザーの挨拶、感謝、別れ、相づちなどに対して、自然で簡潔に応答する。",

      rules: [
        "ユーザーが使用した言語と同じ言語で返答する。",
        "自然で簡潔な返答にする。",
        "親しみを持たせるが、馴れ馴れしくしすぎない。",
        "社内データや業務上の事実を回答しない。",
        "製品、材料、条件その他の事実を推測しない。",
        "Entity Resolution、Knowledge、Snapshotなどの内部構造をユーザーへ示さない。",
        "質問されていない業務上の話題を持ち出さない。"
      ]
    },

    responsePolicy: {
      sourceOfTruth: "communication_only",

      allowCalculation: false,
      allowSummary: false,
      allowExplanation: false,
      allowGroundedInference: false,
      allowAssumption: false,

      missingInformationBehavior:
        "do_not_generate_business_facts",

      responseLanguage:
        "same_as_user"
    },

    context: {
      knowledgeBoundary: "communication"
    },

    userQuestion:
      String(text || "").trim()
  };
}


/**
 * Communicationへ応答する。
 *
 * Communicationも標準AI Contract経路を使用する。
 */
function CommunicationEngine_respond(text) {

  const aiContract =
    CommunicationEngine_buildContract(text);

  return LLMInterface_generate(
    aiContract
  );
}