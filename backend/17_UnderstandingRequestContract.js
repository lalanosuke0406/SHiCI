/*
=========================================
SHiCI
UnderstandingRequestContract.js

役割：
・自然言語理解を依頼するContractを生成する
・Understanding Request Contractを検証する

このContractは、
LLMへ業務処理を依頼するものではない。

依頼するのは、
自然言語をUnderstanding Resultへ
構造化することだけである。

禁止：
・Knowledgeを含めない
・Database情報を含めない
・Canonical Entityを確定しない
・Snapshotを含めない
・業務上の判断を依頼しない
・権限判断を依頼しない
・回答生成を依頼しない
・Create / Update / Deleteの実行を依頼しない
=========================================
*/


/**
 * Understanding Request Contractを生成する。
 *
 * 現段階では、
 * 一つの独立したユーザー発話を理解する。
 *
 * Conversation Stateは、
 * 後の段階で正式なContractとして接続する。
 *
 * @param {string} originalText
 * @returns {Object}
 */
function UnderstandingRequestContract_create(
  originalText
) {

  const normalizedOriginalText =
    String(
      originalText || ""
    ).trim();

  if (
    !normalizedOriginalText
  ) {

    throw new Error(
      "Understanding Requestにユーザー入力がありません。"
    );

  }


  const contract = {

    schemaVersion:
      "2.0",

    contractType:
      "understanding_request",

    metadata: {

      createdAt:
        new Date().toISOString()

    },

    payload: {

      input: {

        originalText:
          normalizedOriginalText

      }

    },

    policy: {

      /*
       * Understandingが返してよい
       * Communication Type。
       *
       * Communication Typeは、
       * 回答文章そのものではない。
       */
      allowedCommunicationTypes: [

        "greeting",
        "thanks",
        "acknowledgement",
        "farewell",
        "apology",
        "none"

      ],


      /*
       * Understandingが返してよいIntent。
       *
       * これらは業務処理の実行命令ではなく、
       * ユーザーが何をしようとしているかを
       * 表す言語非依存の分類である。
       *
       * consultation / confirmationは、
       * Ver.1.0からのCanonical値を維持する。
       */
      allowedIntentTypes: [

        "question",
        "create",
        "update",
        "delete",
        "consultation",
        "confirmation",
        "communication",
        "unknown"

      ],


      /*
       * 発話が必要とするKnowledge経路。
       *
       * Knowledgeを取得した結果ではない。
       * 登録情報の存在を保証するものでもない。
       */
      allowedKnowledgeBoundaryTypes: [

        "communication",
        "company_knowledge",
        "general_knowledge",
        "derived_knowledge",
        "unknown"

      ],


      /*
       * 現在の会話との関係。
       *
       * Conversation Stateそのものは、
       * 現段階ではRequestへ接続していない。
       */
      allowedConversationActions: [

        "continue",
        "change",
        "new"

      ],


      /*
       * Entityを表す自然言語表現に対して、
       * Understandingが付与してよいType Hint。
       *
       * Canonical Entityを確定するものではない。
       */
      allowedEntityTypeHints: [

        "product",
        "mold",
        "material",
        "condition",
        "machine",
        "trouble",
        "part",
        "process",
        "unknown"

      ],


      /*
       * ユーザーが求めるViewとして、
       * Understandingが返してよいCanonical値。
       *
       * 正式なViewの確定および表示仕様の決定は、
       * View ResolutionとView Specificationが行う。
       */
      allowedViewNames: [

        "material",
        "drying_condition",
        "mold_temperature",
        "cooling_time",
        "holding_condition",
        "cavity_count",
        "gate",
        "machine",
        "product_weight",
        "shot_weight",
        "cycle_time",
        "drawing_number",
        "trouble_history"

      ],


      /*
       * 現時点で自然言語操作の理解対象として
       * 正式に扱う変更項目。
       *
       * 表記ゆれや各言語の言葉を列挙する場所ではない。
       * LLMは自然言語を理解し、
       * このCanonical Fieldへ構造化する。
       */
      allowedChangeFields: [

        "mold_temperature",
        "cooling_time",

        "resin_temperature_z0",
        "resin_temperature_z1",
        "resin_temperature_z2",
        "resin_temperature_zp",
        "resin_temperature_zj",
        "resin_temperature_z4",
        "resin_temperature_z5",
        "resin_temperature_z6",
        "resin_temperature_zh",

        "metering_position",
        "pressure_limit",
        "pressure_limit_time",
        "holding_speed",

        "injection_speed_v1",
        "injection_stroke_s1",
        "injection_speed_v2",
        "injection_stroke_s2",
        "injection_speed_v3",
        "injection_stroke_s3",
        "injection_speed_v4",
        "injection_stroke_s4",
        "injection_speed_v5",
        "injection_stroke_s5",

        "injection_speed_ramp_1",
        "injection_speed_ramp_2",
        "injection_speed_ramp_3",
        "injection_speed_ramp_4",
        "injection_speed_ramp_5",

        "holding_pressure_p1",
        "holding_time_t1",
        "holding_pressure_p2",
        "holding_time_t2",
        "holding_pressure_p3",
        "holding_time_t3",
        "holding_pressure_p4",
        "holding_time_t4",

        "holding_ramp_1",
        "holding_ramp_2",
        "holding_ramp_3",
        "holding_ramp_4"

      ],


      /*
       * Changeとして表現してよい操作。
       */
      allowedChangeOperations: [

        "set",
        "add",
        "remove",
        "increase",
        "decrease",
        "replace",
        "create",
        "delete"

      ],


      /*
       * Changeとして返してよい単位。
       *
       * 現段階では、
       * 正式なUpdate対象である金型温度に
       * 必要な単位だけを定義する。
       */
      allowedChangeUnits: [

        "celsius",
        "millimeter",
        "millimeter_per_second",
        "second",
        "megapascal"

      ],


      /*
       * 自然言語理解における責務境界。
       */
      rules: [

        "ユーザーが伝えた意味だけを構造化する。",

        "入力された自然言語の言語を識別する。",

        "異なる言語で同じ意味が伝えられた場合は、同じ言語非依存の内部値へ構造化する。",

        "表記ゆれ、略語、省略、自然な語順を理解してよい。",

        "communication.typeは、Communicationとしての分類だけを表し、回答文章を生成してはならない。",

        "intent.typeは、ユーザーの目的を表し、処理の実行許可を意味しない。",

        "knowledgeBoundary.typeは、後続処理が必要とするKnowledge経路だけを表す。",

        "knowledgeBoundary.typeによって、Knowledgeの存在や回答内容を断定してはならない。",

        "company_knowledgeと判断しても、対象Entityや登録情報が実在すると断定してはならない。",

        "general_knowledgeと判断しても、一般知識を社内仕様として扱ってはならない。",

        "derived_knowledgeと判断しても、計算や導出を実行してはならない。",

        "conversation.actionは、現在の発話と会話の関係だけを表す。",

        "Conversation Stateが与えられていない場合、存在しない会話Contextを推測してはならない。",

        "entity.queryには、ユーザーがEntityを表すために使用した自然言語上の表現だけを設定する。",

        "entity.queryへViewを表す語句を混入させてはならない。",

        "entity.queryをCanonical Entity IDへ変換してはならない。",

        "entity.entityTypeHintは候補であり、Entity Typeの確定結果ではない。",

        "view.nameは、ユーザーが見たい情報のCanonicalな候補を表す。",

        "view.nameは、正式なView Specificationの確定結果ではない。",

        "resolution.requiredは、後続処理でEntity Resolutionが必要かだけを表す。",

        "resolution.requiredがtrueでも、Entityが存在することや解決できることを保証してはならない。",

        "Knowledgeを検索してはならない。",

        "Databaseへアクセスしてはならない。",

        "登録済みの事実を推測してはならない。",

        "現在状態を推測してはならない。",

        "不足している情報を創作してはならない。",

        "業務上の妥当性を判断してはならない。",

        "権限を判断してはならない。",

        "更新案を生成してはならない。",

        "回答文を生成してはならない。",

        "Create、Update、Deleteを実行してはならない。",

        "必要な情報が不足している場合は、missingFieldsへ不足項目を設定する。",

        "使用しない項目も、Schemaで定義されたnull、none、unknown、false、空配列などの明示的な値で返す。",

        "必ず定義されたUnderstanding Result Schema Version 2.0に従って出力する。"

      ]

    }

  };


  return UnderstandingRequestContract_validate(
    contract
  );

}


/**
 * Understanding Request Contractを検証する。
 *
 * このValidationは、
 * Contractの構造だけを確認する。
 *
 * 発話の意味や業務上の妥当性は判断しない。
 *
 * @param {Object} contract
 * @returns {Object}
 */
function UnderstandingRequestContract_validate(
  contract
) {

  if (
    !contract ||
    typeof contract !==
      "object" ||
    Array.isArray(
      contract
    )
  ) {

    throw new Error(
      "Understanding Request ContractがObjectではありません。"
    );

  }


  /*
  =========================================
  Contract識別情報
  =========================================
  */

  if (
    contract.schemaVersion !==
      "2.0"
  ) {

    throw new Error(
      "Understanding Request ContractのSchema Versionが不正です。"
    );

  }

  if (
    contract.contractType !==
      "understanding_request"
  ) {

    throw new Error(
      "Contract Typeがunderstanding_requestではありません。"
    );

  }


  /*
  =========================================
  必須Object
  =========================================
  */

  UnderstandingRequestContract_requireObject(
    contract.metadata,
    "metadata"
  );

  UnderstandingRequestContract_requireObject(
    contract.payload,
    "payload"
  );

  UnderstandingRequestContract_requireObject(
    contract.policy,
    "policy"
  );

  UnderstandingRequestContract_requireObject(
    contract.payload.input,
    "payload.input"
  );


  /*
  =========================================
  Metadata
  =========================================
  */

  if (
    typeof contract.metadata.createdAt !==
      "string" ||
    !contract.metadata.createdAt.trim()
  ) {

    throw new Error(
      "metadata.createdAtが正しくありません。"
    );

  }


  /*
  =========================================
  Input
  =========================================
  */

  if (
    typeof contract.payload.input.originalText !==
      "string" ||
    !contract.payload.input.originalText.trim()
  ) {

    throw new Error(
      "payload.input.originalTextが正しくありません。"
    );

  }


  /*
  =========================================
  Policy Array
  =========================================
  */

  UnderstandingRequestContract_requireStringArray(
    contract.policy.allowedCommunicationTypes,
    "policy.allowedCommunicationTypes"
  );

  UnderstandingRequestContract_requireStringArray(
    contract.policy.allowedIntentTypes,
    "policy.allowedIntentTypes"
  );

  UnderstandingRequestContract_requireStringArray(
    contract.policy.allowedKnowledgeBoundaryTypes,
    "policy.allowedKnowledgeBoundaryTypes"
  );

  UnderstandingRequestContract_requireStringArray(
    contract.policy.allowedConversationActions,
    "policy.allowedConversationActions"
  );

  UnderstandingRequestContract_requireStringArray(
    contract.policy.allowedEntityTypeHints,
    "policy.allowedEntityTypeHints"
  );

  UnderstandingRequestContract_requireStringArray(
    contract.policy.allowedViewNames,
    "policy.allowedViewNames"
  );

  UnderstandingRequestContract_requireStringArray(
    contract.policy.allowedChangeFields,
    "policy.allowedChangeFields"
  );

  UnderstandingRequestContract_requireStringArray(
    contract.policy.allowedChangeOperations,
    "policy.allowedChangeOperations"
  );

  UnderstandingRequestContract_requireStringArray(
    contract.policy.allowedChangeUnits,
    "policy.allowedChangeUnits"
  );

  UnderstandingRequestContract_requireStringArray(
    contract.policy.rules,
    "policy.rules"
  );


  return contract;

}


/**
 * Objectであることを確認する。
 *
 * @param {*} value
 * @param {string} fieldName
 */
function UnderstandingRequestContract_requireObject(
  value,
  fieldName
) {

  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(value)
  ) {

    throw new Error(
      fieldName +
      "がObjectではありません。"
    );

  }

}


/**
 * 空でないStringだけを持つArrayであることを確認する。
 *
 * @param {*} value
 * @param {string} fieldName
 */
function UnderstandingRequestContract_requireStringArray(
  value,
  fieldName
) {

  if (
    !Array.isArray(value)
  ) {

    throw new Error(
      fieldName +
      "がArrayではありません。"
    );

  }

  value.forEach(
    function(item, index) {

      if (
        typeof item !==
          "string" ||
        !item.trim()
      ) {

        throw new Error(
          fieldName +
          "[" +
          index +
          "]が正しいStringではありません。"
        );

      }

    }
  );

}


