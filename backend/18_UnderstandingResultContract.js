/*
=========================================
SHiCI
UnderstandingResultContract.js

役割：
・Understanding Resultの標準構造を定義する
・Understanding ResultのSchemaを検証する

禁止：
・自然言語を理解しない
・LLMを呼び出さない
・Knowledgeを検索しない
・Entityを解決しない
・Snapshotを生成しない
・Conversation Stateを更新しない
・業務上の妥当性を判断しない
・Create / Update / Deleteを実行しない
=========================================
*/


/**
 * Understanding Resultの標準構造を生成する。
 *
 * この関数が返す値は、
 * Understanding Model Ver.1.1に基づく
 * 言語非依存のContractである。
 *
 * @param {string} originalText
 * @returns {Object}
 */
function UnderstandingResultContract_create(
  originalText
) {

  return {

    schemaVersion:
      "1.1",

    resultType:
      "understanding_result",

    input: {

      originalText:
        String(
          originalText || ""
        ),

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

    missingFields:
      [],

    memory: {

      decision:
        "none"

    }

  };

}


/**
 * Understanding Resultの構造を検証する。
 *
 * このValidationは、
 * Contractの構造だけを確認する。
 *
 * Entityの実在、
 * 現在値、
 * 権限、
 * 業務ルール、
 * 変更可能性は確認しない。
 *
 * @param {Object} result
 * @returns {Object}
 */
function UnderstandingResultContract_validate(
  result
) {

  if (
    !result ||
    typeof result !==
      "object" ||
    Array.isArray(result)
  ) {

    throw new Error(
      "Understanding ResultがObjectではありません。"
    );

  }


  /*
  =========================================
  Contract識別情報
  =========================================
  */

  if (
    result.schemaVersion !==
      "1.1"
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
      "Result Typeがunderstanding_resultではありません。"
    );

  }


  /*
  =========================================
  必須Object
  =========================================
  */

  const requiredObjects = [

    "input",
    "communication",
    "intent",
    "conversation",
    "entity",
    "view",
    "change",
    "memory"

  ];

  requiredObjects.forEach(
    function(key) {

      if (
        !result[key] ||
        typeof result[key] !==
          "object" ||
        Array.isArray(
          result[key]
        )
      ) {

        throw new Error(
          "Understanding Resultの" +
          key +
          "がObjectではありません。"
        );

      }

    }
  );


  /*
  =========================================
  Input
  =========================================
  */

  if (
    typeof result.input.originalText !==
      "string"
  ) {

    throw new Error(
      "input.originalTextがStringではありません。"
    );

  }

  if (
    typeof result.input.language !==
      "string" ||
    !result.input.language.trim()
  ) {

    throw new Error(
      "input.languageが正しくありません。"
    );

  }


  /*
  =========================================
  Communication
  =========================================
  */

  const allowedCommunicationTypes = [

    "none",
    "greeting",
    "thanks",
    "farewell",
    "acknowledgement",
    "other"

  ];

  UnderstandingResultContract_requireAllowedValue(
    result.communication.type,
    allowedCommunicationTypes,
    "communication.type"
  );


  /*
  =========================================
  Intent
  =========================================
  */

  const allowedIntentTypes = [

    "question",
    "create",
    "update",
    "delete",
    "consultation",
    "confirmation",
    "communication",
    "unknown"

  ];

  UnderstandingResultContract_requireAllowedValue(
    result.intent.type,
    allowedIntentTypes,
    "intent.type"
  );


  /*
  =========================================
  Conversation
  =========================================
  */

  const allowedConversationActions = [

    "continue",
    "change",
    "new"

  ];

  UnderstandingResultContract_requireAllowedValue(
    result.conversation.action,
    allowedConversationActions,
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

  const allowedEntityTypeHints = [

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

  UnderstandingResultContract_requireAllowedValue(
    result.entity.entityTypeHint,
    allowedEntityTypeHints,
    "entity.entityTypeHint"
  );


  /*
  =========================================
  View
  =========================================
  */

  UnderstandingResultContract_requireNullableString(
    result.view.name,
    "view.name"
  );


  /*
  =========================================
  Change
  =========================================
  */

  UnderstandingResultContract_requireNullableString(
    result.change.field,
    "change.field"
  );

  const allowedOperations = [

    null,
    "set",
    "add",
    "remove",
    "increase",
    "decrease",
    "replace",
    "create",
    "delete"

  ];

  if (
    allowedOperations.indexOf(
      result.change.operation
    ) === -1
  ) {

    throw new Error(
      "change.operationに許可されていない値があります。"
    );

  }

  UnderstandingResultContract_validateChangeValue(
    result.change.value
  );

  UnderstandingResultContract_requireNullableString(
    result.change.unit,
    "change.unit"
  );


  /*
  =========================================
  Missing Fields
  =========================================
  */

  if (
    !Array.isArray(
      result.missingFields
    )
  ) {

    throw new Error(
      "missingFieldsがArrayではありません。"
    );

  }

  result.missingFields.forEach(
    function(field, index) {

      if (
        typeof field !==
          "string" ||
        !field.trim()
      ) {

        throw new Error(
          "missingFields[" +
          index +
          "]が正しいStringではありません。"
        );

      }

    }
  );


  /*
  =========================================
  Memory
  =========================================
  */

  if (
    typeof result.memory.decision !==
      "string" ||
    !result.memory.decision.trim()
  ) {

    throw new Error(
      "memory.decisionが正しくありません。"
    );

  }


  return result;

}


/**
 * 値が許可リストに含まれることを確認する。
 *
 * @param {*} value
 * @param {Array} allowedValues
 * @param {string} fieldName
 */
function UnderstandingResultContract_requireAllowedValue(
  value,
  allowedValues,
  fieldName
) {

  if (
    allowedValues.indexOf(
      value
    ) === -1
  ) {

    throw new Error(
      fieldName +
      "に許可されていない値があります。"
    );

  }

}


/**
 * nullまたはStringであることを確認する。
 *
 * @param {*} value
 * @param {string} fieldName
 */
function UnderstandingResultContract_requireNullableString(
  value,
  fieldName
) {

  if (
    value !== null &&
    typeof value !==
      "string"
  ) {

    throw new Error(
      fieldName +
      "はnullまたはStringでなければなりません。"
    );

  }

}


/**
 * Change Valueの構造を確認する。
 *
 * 現段階では、
 * JSONで安全に表現できる基本型を許可する。
 *
 * @param {*} value
 */
function UnderstandingResultContract_validateChangeValue(
  value
) {

  if (
    value === null
  ) {

    return;

  }

  const valueType =
    typeof value;

  if (
    valueType ===
      "string" ||
    valueType ===
      "number" ||
    valueType ===
      "boolean"
  ) {

    return;

  }

  if (
    Array.isArray(value)
  ) {

    return;

  }

  if (
    valueType ===
      "object"
  ) {

    return;

  }

  throw new Error(
    "change.valueに使用できない型が含まれています。"
  );

}



