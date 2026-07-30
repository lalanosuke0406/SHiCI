/*
=========================================
SHiCI
UnderstandingTest.js

役割：
・Natural Language Understanding経路を
  単独で動作確認する

本番処理からは呼び出さない。
Apps Script Editorから手動実行する。
=========================================
*/


/**
 * 日本語のUpdate指示を理解できるか確認する。
 *
 * 確認対象：
 *
 * Natural Language
 * ↓
 * Understanding Request Contract
 * ↓
 * LLM Interface
 * ↓
 * OpenAI Adapter
 * ↓
 * Structured Output
 * ↓
 * Understanding Result Contract
 *
 * Entity Resolution、Snapshot、Updateは実行しない。
 */
function UnderstandingTest_runUpdateJapanese() {

  const inputText =
    "ワンワンの型温を61℃に変更して";


  Logger.log(
    "========================================="
  );

  Logger.log(
    "[Understanding Test Start]"
  );

  Logger.log(
    "Input: " +
    inputText
  );


  const result =
    UnderstandingEngine_understand(
      inputText
    );


  Logger.log(
    "Result:"
  );

  Logger.log(
    JSON.stringify(
      result,
      null,
      2
    )
  );


  UnderstandingTest_assertUpdateJapanese(
    result
  );


  Logger.log(
    "[Understanding Test Passed]"
  );

  Logger.log(
    "========================================="
  );

}


/**
 * 日本語Update理解結果を検証する。
 *
 * ここではEntityの実在や現在値を確認しない。
 * Understanding Resultの意味だけを確認する。
 *
 * @param {Object} result
 */
function UnderstandingTest_assertUpdateJapanese(
  result
) {

  UnderstandingResultContract_validate(
    result
  );


  UnderstandingTest_assertEqual(
    result.schemaVersion,
    "1.1",
    "schemaVersion"
  );

  UnderstandingTest_assertEqual(
    result.resultType,
    "understanding_result",
    "resultType"
  );

  UnderstandingTest_assertEqual(
    result.input.originalText,
    "ワンワンの型温を61℃に変更して",
    "input.originalText"
  );

  UnderstandingTest_assertEqual(
    result.input.language,
    "ja",
    "input.language"
  );

  UnderstandingTest_assertEqual(
    result.intent.type,
    "update",
    "intent.type"
  );

  UnderstandingTest_assertEqual(
    result.entity.query,
    "ワンワン",
    "entity.query"
  );

  UnderstandingTest_assertEqual(
    result.change.field,
    "mold_temperature",
    "change.field"
  );

  UnderstandingTest_assertEqual(
    result.change.operation,
    "set",
    "change.operation"
  );

  UnderstandingTest_assertEqual(
    result.change.value,
    61,
    "change.value"
  );

  UnderstandingTest_assertEqual(
    result.change.unit,
    "celsius",
    "change.unit"
  );

  if (
    !Array.isArray(
      result.missingFields
    )
  ) {

    throw new Error(
      "missingFieldsがArrayではありません。"
    );

  }

  if (
    result.missingFields.length !==
      0
  ) {

    throw new Error(
      "missingFieldsは空でなければなりません: " +
      JSON.stringify(
        result.missingFields
      )
    );

  }

}


/**
 * 実際値と期待値が一致することを確認する。
 *
 * @param {*} actual
 * @param {*} expected
 * @param {string} fieldName
 */
function UnderstandingTest_assertEqual(
  actual,
  expected,
  fieldName
) {

  if (
    actual !==
      expected
  ) {

    throw new Error(
      fieldName +
      "が期待値と一致しません。" +
      "\nExpected: " +
      JSON.stringify(
        expected
      ) +
      "\nActual: " +
      JSON.stringify(
        actual
      )
    );

  }

}



/*
=========================================
Update Understanding Adapter Test
=========================================
*/


/**
 * Understanding Resultを、
 * 既存Update Intent形式へ変換できるか確認する。
 */
function UnderstandingTest_runUpdateAdapter() {

  const inputText =
    "ワンワンの型温を61℃に変更して";


  Logger.log(
    "========================================="
  );

  Logger.log(
    "[Update Adapter Test Start]"
  );


  const understandingResult =
    UnderstandingEngine_understand(
      inputText
    );


  const updateIntent =
    UpdateUnderstandingAdapter_convert(
      understandingResult
    );


  Logger.log(
    "Understanding Result:"
  );

  Logger.log(
    JSON.stringify(
      understandingResult,
      null,
      2
    )
  );


  Logger.log(
    "Converted Update Intent:"
  );

  Logger.log(
    JSON.stringify(
      updateIntent,
      null,
      2
    )
  );


  UnderstandingTest_assertEqual(
    updateIntent.status,
    "ready",
    "updateIntent.status"
  );

  UnderstandingTest_assertEqual(
    updateIntent.intentType,
    "update",
    "updateIntent.intentType"
  );

  UnderstandingTest_assertEqual(
    updateIntent.updateType,
    "mold_temperature",
    "updateIntent.updateType"
  );

  UnderstandingTest_assertEqual(
    updateIntent.targetField,
    "金型温度(℃)",
    "updateIntent.targetField"
  );

  UnderstandingTest_assertEqual(
    updateIntent.newValue,
    61,
    "updateIntent.newValue"
  );

  UnderstandingTest_assertEqual(
    updateIntent.unit,
    "℃",
    "updateIntent.unit"
  );


  const entityQuery =
    UpdateUnderstandingAdapter_getEntityQuery(
      understandingResult
    );


  UnderstandingTest_assertEqual(
    entityQuery,
    "ワンワン",
    "entityQuery"
  );


  Logger.log(
    "[Update Adapter Test Passed]"
  );

  Logger.log(
    "========================================="
  );

}


