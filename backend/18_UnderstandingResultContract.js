/*
=========================================
SHiCI
UnderstandingResultContract.js

役割：
・Understanding Resultの標準構造を生成する
・Understanding Resultを検証する

Understanding Resultは、
自然言語の意味を後続処理へ渡すための
Provider非依存Contractである。

禁止：
・Knowledgeを格納しない
・Canonical Entityを確定しない
・Snapshotを格納しない
・業務上の判断結果を格納しない
・権限判断を格納しない
・回答文章を格納しない
・処理実行結果を格納しない
=========================================
*/


/*
=========================================
許可値
=========================================
*/


const UNDERSTANDING_RESULT_ALLOWED_COMMUNICATION_TYPES = [

  "greeting",
  "thanks",
  "acknowledgement",
  "farewell",
  "apology",
  "none"

];


const UNDERSTANDING_RESULT_ALLOWED_INTENT_TYPES = [

  "question",
  "create",
  "update",
  "delete",
  "consultation",
  "confirmation",
  "communication",
  "unknown"

];


const UNDERSTANDING_RESULT_ALLOWED_KNOWLEDGE_BOUNDARY_TYPES = [

  "communication",
  "company_knowledge",
  "general_knowledge",
  "derived_knowledge",
  "unknown"

];


const UNDERSTANDING_RESULT_ALLOWED_CONVERSATION_ACTIONS = [

  "continue",
  "change",
  "new"

];


const UNDERSTANDING_RESULT_ALLOWED_ENTITY_TYPE_HINTS = [

  "product",
  "mold",
  "material",
  "condition",
  "machine",
  "trouble",
  "part",
  "process",
  "unknown"

];


const UNDERSTANDING_RESULT_ALLOWED_VIEW_NAMES = [

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

];


const UNDERSTANDING_RESULT_ALLOWED_CHANGE_FIELDS = [

  null,
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

];


const UNDERSTANDING_RESULT_ALLOWED_CHANGE_OPERATIONS = [

  "set",
  "add",
  "remove",
  "increase",
  "decrease",
  "replace",
  "create",
  "delete"

];


const UNDERSTANDING_RESULT_ALLOWED_CHANGE_UNITS = [

  "celsius",
  "millimeter",
  "millimeter_per_second",
  "second",
  "megapascal"

];


const UNDERSTANDING_RESULT_ALLOWED_MEMORY_DECISIONS = [

  "none"

];


/**
 * 空のUnderstanding Resultを生成する。
 *
 * LLMの出力を補完するためではなく、
 * Contractの標準構造を提供するために使用する。
 *
 * @param {string} originalText
 * @returns {Object}
 */
function UnderstandingResultContract_create(
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
      "Understanding Resultにユーザー入力がありません。"
    );

  }


  return {

    schemaVersion:
      "2.0",

    resultType:
      "understanding_result",

    input: {

      originalText:
        normalizedOriginalText,

      language:
        "unknown"

    },

    communication: {

      type:
        "none"

    },

    intent: {

      type:
        "unknown"

    },

    knowledgeBoundary: {

      type:
        "unknown"

    },

    conversation: {

      action:
        "new"

    },

    entity: {

      query:
        null,

      entityTypeHint:
        "unknown"

    },

    view: {

      name:
        null

    },

    resolution: {

      required:
        false

    },

    change: {

      field:
        null,

      operation:
        null,

      value:
        null,

      unit:
        null

    },

    missingFields: [],

    memory: {

      decision:
        "none"

    }

  };

}


/**
 * Understanding Resultを検証する。
 *
 * ValidationはContract構造だけを確認する。
 *
 * 次は確認しない。
 * ・Entityが実在するか
 * ・Knowledgeが存在するか
 * ・現在値が正しいか
 * ・業務上の変更が可能か
 * ・権限があるか
 *
 * @param {Object} result
 * @returns {Object}
 */
function UnderstandingResultContract_validate(
  result
) {

  UnderstandingResultContract_requireObject(
    result,
    "Understanding Result"
  );


  /*
  =========================================
  Contract識別情報
  =========================================
  */

  if (
    result.schemaVersion !==
      "2.0"
  ) {

    throw new Error(
      "Understanding ResultのSchema Versionが不正です。"
    );

  }


  if (
    result.resultType !==
      "understanding_result"
  ) {

    throw new Error(
      "resultTypeがunderstanding_resultではありません。"
    );

  }


  /*
  =========================================
  必須Object
  =========================================
  */

  UnderstandingResultContract_requireObject(
    result.input,
    "input"
  );

  UnderstandingResultContract_requireObject(
    result.communication,
    "communication"
  );

  UnderstandingResultContract_requireObject(
    result.intent,
    "intent"
  );

  UnderstandingResultContract_requireObject(
    result.knowledgeBoundary,
    "knowledgeBoundary"
  );

  UnderstandingResultContract_requireObject(
    result.conversation,
    "conversation"
  );

  UnderstandingResultContract_requireObject(
    result.entity,
    "entity"
  );

  UnderstandingResultContract_requireObject(
    result.view,
    "view"
  );

  UnderstandingResultContract_requireObject(
    result.resolution,
    "resolution"
  );

  UnderstandingResultContract_requireObject(
    result.change,
    "change"
  );

  UnderstandingResultContract_requireObject(
    result.memory,
    "memory"
  );


  /*
  =========================================
  Input
  =========================================
  */

  UnderstandingResultContract_requireNonEmptyString(
    result.input.originalText,
    "input.originalText"
  );

  UnderstandingResultContract_requireNonEmptyString(
    result.input.language,
    "input.language"
  );


  /*
  =========================================
  Communication
  =========================================
  */

  UnderstandingResultContract_requireAllowedValue(
    result.communication.type,
    UNDERSTANDING_RESULT_ALLOWED_COMMUNICATION_TYPES,
    "communication.type"
  );


  /*
  =========================================
  Intent
  =========================================
  */

  UnderstandingResultContract_requireAllowedValue(
    result.intent.type,
    UNDERSTANDING_RESULT_ALLOWED_INTENT_TYPES,
    "intent.type"
  );


  /*
  =========================================
  Knowledge Boundary
  =========================================
  */

  UnderstandingResultContract_requireAllowedValue(
    result.knowledgeBoundary.type,
    UNDERSTANDING_RESULT_ALLOWED_KNOWLEDGE_BOUNDARY_TYPES,
    "knowledgeBoundary.type"
  );


  /*
  =========================================
  Conversation
  =========================================
  */

  UnderstandingResultContract_requireAllowedValue(
    result.conversation.action,
    UNDERSTANDING_RESULT_ALLOWED_CONVERSATION_ACTIONS,
    "conversation.action"
  );


  /*
  =========================================
  Entity
  =========================================
  */

  UnderstandingResultContract_requireNullableString(
    result.entity.query,
    "entity.query"
  );

  UnderstandingResultContract_requireAllowedValue(
    result.entity.entityTypeHint,
    UNDERSTANDING_RESULT_ALLOWED_ENTITY_TYPE_HINTS,
    "entity.entityTypeHint"
  );


  /*
  =========================================
  View
  =========================================
  */

  UnderstandingResultContract_requireNullableAllowedValue(
    result.view.name,
    UNDERSTANDING_RESULT_ALLOWED_VIEW_NAMES,
    "view.name"
  );


  /*
  =========================================
  Resolution
  =========================================
  */

  if (
    typeof result.resolution.required !==
      "boolean"
  ) {

    throw new Error(
      "resolution.requiredがbooleanではありません。"
    );

  }


  /*
  =========================================
  Change
  =========================================
  */

  UnderstandingResultContract_requireNullableAllowedValue(
    result.change.field,
    UNDERSTANDING_RESULT_ALLOWED_CHANGE_FIELDS,
    "change.field"
  );

  UnderstandingResultContract_requireNullableAllowedValue(
    result.change.operation,
    UNDERSTANDING_RESULT_ALLOWED_CHANGE_OPERATIONS,
    "change.operation"
  );

  UnderstandingResultContract_requireChangeValue(
    result.change.value
  );

  UnderstandingResultContract_requireNullableAllowedValue(
    result.change.unit,
    UNDERSTANDING_RESULT_ALLOWED_CHANGE_UNITS,
    "change.unit"
  );


  /*
  =========================================
  Missing Fields
  =========================================
  */

  UnderstandingResultContract_requireStringArray(
    result.missingFields,
    "missingFields"
  );


  /*
  =========================================
  Memory
  =========================================
  */

  UnderstandingResultContract_requireAllowedValue(
    result.memory.decision,
    UNDERSTANDING_RESULT_ALLOWED_MEMORY_DECISIONS,
    "memory.decision"
  );


  /*
  =========================================
  Cross-field整合性
  =========================================
  */

  UnderstandingResultContract_validateConsistency(
    result
  );


  return result;

}


/**
 * 項目間の基本的な整合性を確認する。
 *
 * 業務上の正しさは判断しない。
 *
 * @param {Object} result
 */
function UnderstandingResultContract_validateConsistency(
  result
) {

  /*
   * Communication Intentでは、
   * Knowledge BoundaryもCommunicationである。
   */
  if (
    result.intent.type ===
      "communication" &&
    result.knowledgeBoundary.type !==
      "communication"
  ) {

    throw new Error(
      "intent.typeがcommunicationの場合、knowledgeBoundary.typeもcommunicationである必要があります。"
    );

  }


  /*
   * Communication Boundaryでは、
   * Entity Resolutionを必要としない。
   */
  if (
    result.knowledgeBoundary.type ===
      "communication" &&
    result.resolution.required !==
      false
  ) {

    throw new Error(
      "Communicationではresolution.requiredをfalseにしてください。"
    );

  }


  /*
   * Communicationとして分類されていない発話へ、
   * Communication Typeを設定しない。
   */
  if (
    result.intent.type !==
      "communication" &&
    result.communication.type !==
      "none"
  ) {

    throw new Error(
      "Communication以外のIntentではcommunication.typeをnoneにしてください。"
    );

  }


  /*
   * Change Fieldが存在しない場合、
   * 他のChange項目も原則としてnullである。
   *
   * 不完全な更新指示では、
   * fieldだけが存在し、
   * valueなどがnullになることは許可する。
   */
  if (
    result.change.field ===
      null
  ) {

    if (
      result.change.operation !==
        null ||
      result.change.value !==
        null ||
      result.change.unit !==
        null
    ) {

      throw new Error(
        "change.fieldがnullの場合、changeの他項目もnullである必要があります。"
      );

    }

  }


  /*
   * Update Intent以外では、
   * 現段階のChangeを空にする。
   *
   * create / deleteは将来拡張対象だが、
   * 現在正式に実装済みのChangeはUpdateだけである。
   */
  if (
    result.intent.type !==
      "update"
  ) {

    if (
      result.change.field !==
        null ||
      result.change.operation !==
        null ||
      result.change.value !==
        null ||
      result.change.unit !==
        null
    ) {

      throw new Error(
        "Update以外のIntentではchangeをnullにしてください。"
      );

    }

  }


  /*
   * Entity Queryがないことと、
   * Resolution Requirementは別の概念である。
   *
   * 将来Conversation State上のcurrentEntityを
   * Resolutionする場合があるため、
   * queryがnullでもrequired=trueを禁止しない。
   */


  /*
   * company_knowledgeで特定対象を持つ場合は、
   * 原則としてEntity Resolutionを必要とする。
   */
  if (
    result.knowledgeBoundary.type ===
      "company_knowledge" &&
    result.entity.query !==
      null &&
    result.resolution.required !==
      true
  ) {

    throw new Error(
      "company_knowledgeでentity.queryがある場合、resolution.requiredをtrueにしてください。"
    );

  }

}


/**
 * Objectであることを確認する。
 *
 * @param {*} value
 * @param {string} fieldName
 */
function UnderstandingResultContract_requireObject(
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
 * 空ではないStringであることを確認する。
 *
 * @param {*} value
 * @param {string} fieldName
 */
function UnderstandingResultContract_requireNonEmptyString(
  value,
  fieldName
) {

  if (
    typeof value !==
      "string" ||
    !value.trim()
  ) {

    throw new Error(
      fieldName +
      "が正しいStringではありません。"
    );

  }

}


/**
 * nullまたは空ではないStringであることを確認する。
 *
 * 空文字はnullへ正規化されるべきである。
 *
 * @param {*} value
 * @param {string} fieldName
 */
function UnderstandingResultContract_requireNullableString(
  value,
  fieldName
) {

  if (
    value ===
      null
  ) {

    return;

  }

  UnderstandingResultContract_requireNonEmptyString(
    value,
    fieldName
  );

}


/**
 * 許可値に含まれることを確認する。
 *
 * @param {*} value
 * @param {string[]} allowedValues
 * @param {string} fieldName
 */
function UnderstandingResultContract_requireAllowedValue(
  value,
  allowedValues,
  fieldName
) {

  if (
    typeof value !==
      "string" ||
    allowedValues.indexOf(
      value
    ) ===
      -1
  ) {

    throw new Error(
      fieldName +
      "に許可されていない値が設定されています: " +
      String(value)
    );

  }

}


/**
 * nullまたは許可値であることを確認する。
 *
 * @param {*} value
 * @param {string[]} allowedValues
 * @param {string} fieldName
 */
function UnderstandingResultContract_requireNullableAllowedValue(
  value,
  allowedValues,
  fieldName
) {

  if (
    value ===
      null
  ) {

    return;

  }

  UnderstandingResultContract_requireAllowedValue(
    value,
    allowedValues,
    fieldName
  );

}


/**
 * Change Valueを検証する。
 *
 * 現段階では、
 * null、string、number、booleanを許可する。
 *
 * ObjectやArrayは、
 * 未定義の構造を持ち込むため禁止する。
 *
 * @param {*} value
 */
function UnderstandingResultContract_requireChangeValue(
  value
) {

  if (
    value ===
      null
  ) {

    return;

  }

  const valueType =
    typeof value;


  if (
    valueType !==
      "string" &&
    valueType !==
      "number" &&
    valueType !==
      "boolean"
  ) {

    throw new Error(
      "change.valueの型が不正です。"
    );

  }


  if (
    valueType ===
      "number" &&
    !Number.isFinite(value)
  ) {

    throw new Error(
      "change.valueに有限ではない数値が設定されています。"
    );

  }


  if (
    valueType ===
      "string" &&
    !value.trim()
  ) {

    throw new Error(
      "change.valueに空文字を設定してはなりません。"
    );

  }

}


/**
 * 空ではないStringだけを持つArrayであることを確認する。
 *
 * @param {*} value
 * @param {string} fieldName
 */
function UnderstandingResultContract_requireStringArray(
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



