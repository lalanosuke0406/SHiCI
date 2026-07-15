/**
 * SHiCI Response Specification
 *
 * Compose済みSnapshotから、
 * LLM非依存のAI Contractを構築する。
 *
 * この層は回答を生成しない。
 * Promptも生成しない。
 */
function ResponseSpecification_build(userText, snapshot) {

  if (!snapshot || snapshot.status !== "success") {
    throw new Error(
      "正常なSnapshotがないため、AI Contractを構築できません。"
    );
  }

  return {
    schemaVersion: "1.0",

    responseType: "ai_contract",

    metadata: {
        source: "SHiCI",
        specification: "Response Specification 2.0"
    },

    systemInstruction: {
      role: "SHiCI",

      objective:
        "提供されたContextを根拠として、ユーザーの質問へ正確に回答する。",

      rules: [
        "Contextに存在する事実だけを事実として回答する。",
        "Contextに存在しない事実を推測または補完しない。",
        "計算はContextに含まれる数値だけを使用する。",
        "推論を行う場合は、Contextから導いた推論であることを明確にする。",
        "回答に必要な情報が不足している場合は、不足している情報を明示する。",
        "ユーザーが使用した言語と同じ言語で回答する。",
        "簡潔で、現場の利用者が理解しやすい形で回答する。"
      ]
    },

    responsePolicy: {
      sourceOfTruth: "context_only",

      allowCalculation: true,
      allowSummary: true,
      allowExplanation: true,

      allowGroundedInference: true,
      allowAssumption: false,

      missingInformationBehavior:
        "state_missing_information",

      responseLanguage:
        "same_as_user"
    },

    context: {
      entityType: "product",

      knowledge: ResponseSpecification_compact({
        product: snapshot.product,
        material: snapshot.material,
        machine: snapshot.machine,
        mold: snapshot.mold,
        condition: snapshot.condition,
        conditionDetail: snapshot.conditionDetail
      })
    },

    userQuestion:
      String(userText || "").trim()
  };
}


/**
 * Snapshotから、null・空文字・空オブジェクトを除去する。
 *
 * 値そのものは変更せず、
 * LLMへ不要な空情報を渡さないための整形だけを行う。
 */
function ResponseSpecification_compact(value) {

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {

    return value
      .map(ResponseSpecification_compact)
      .filter(function(item) {
        return !ResponseSpecification_isEmpty(item);
      });
  }

  if (
    value &&
    typeof value === "object"
  ) {

    const result = {};

    Object.keys(value).forEach(function(key) {

      const compacted =
        ResponseSpecification_compact(value[key]);

      if (!ResponseSpecification_isEmpty(compacted)) {
        result[key] = compacted;
      }

    });

    return result;
  }

  return value;
}


/**
 * AI Contractへ含めない空値かどうかを判定する。
 *
 * 0とfalseは有効な値なので除外しない。
 */
function ResponseSpecification_isEmpty(value) {

  if (
    value === null ||
    value === undefined ||
    value === ""
  ) {
    return true;
  }

  if (
    Array.isArray(value) &&
    value.length === 0
  ) {
    return true;
  }

  if (
    value &&
    typeof value === "object" &&
    Object.keys(value).length === 0
  ) {
    return true;
  }

  return false;
}


