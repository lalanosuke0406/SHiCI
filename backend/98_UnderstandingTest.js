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



/*
=========================================
Test Runner
=========================================
*/

/**
 * Understandingの決定論的テストを
 * まとめて実行する。
 *
 * 外部APIは呼び出さない。
 */
function UnderstandingTest_runAll() {

  const tests = [

    {
      name:
        "Version2Structure",
      run:
        UnderstandingTest_runVersion2Structure
    },

    {
      name:
        "OpenAIInstructionsHoldingPressureP1",
      run:
        UnderstandingTest_validateVersion2OpenAIInstructionsHoldingPressureP1
    },

    {
      name:
        "OpenAIInstructionsHoldingTimeT1",
      run:
        UnderstandingTest_validateVersion2OpenAIInstructionsHoldingTimeT1
    },

    {
      name:
        "HoldingPressureP1Update",
      run:
        UnderstandingTest_validateVersion2HoldingPressureP1Update
    },

    {
      name:
        "HoldingTimeT1Update",
      run:
        UnderstandingTest_validateVersion2HoldingTimeT1Update
    },

    {
      name:
        "Version2UpdateAdapterCompatibility",
      run:
        UnderstandingTest_runVersion2UpdateAdapterCompatibility
    },

    {
      name:
        "HoldingConditionView",
      run:
        UnderstandingTest_validateVersion2HoldingConditionView
    },

    {
      name:
        "OpenAIInstructionsHoldingCondition",
      run:
        UnderstandingTest_validateVersion2OpenAIInstructionsHoldingCondition
    },

    {
      name:
        "HoldingStagesUpdateFields",
      run:
        UnderstandingTest_validateVersion2HoldingStagesUpdateFields
    },

    {
        name:
            "InjectionStagesUpdateFields",
        run:
            UnderstandingTest_validateVersion2InjectionStagesUpdateFields
    },

    {
        name:
            "ResinTemperatureUpdateFields",
        run:
            UnderstandingTest_validateVersion2ResinTemperatureUpdateFields
    },

    {
        name:
            "RampUpdateFields",
        run:
            UnderstandingTest_validateVersion2RampUpdateFields
    },

    {
        name:
            "OpenAIInstructionsInjectionStages",
        run:
            UnderstandingTest_validateVersion2OpenAIInstructionsInjectionStages
    },

    {
      name:
        "OpenAIInstructionsHoldingStages",
      run:
        UnderstandingTest_validateVersion2OpenAIInstructionsHoldingStages
    },

    {
      name:
        "HoldingStagesUpdateAdapterReady",
      run:
        UnderstandingTest_validateVersion2HoldingStagesUpdateAdapterReady
    }

  ];


  UnderstandingTest_runTestSuite(
    "Understanding Test",
    tests
  );

}


/**
 * Understandingの実OpenAI通信テストを
 * まとめて実行する。
 *
 * 外部APIを実際に呼び出す。
 */
function UnderstandingTest_runAllLive() {

  const tests = [

    {
      name:
        "Version2OpenAILive",
      run:
        UnderstandingTest_runVersion2OpenAILive
    },

    {
      name:
        "Version2HandleRoutingLive",
      run:
        UnderstandingTest_runVersion2HandleRoutingLive
    },

    {
        name:
            "OpenAIInjectionStagesUpdate",
        run:
            UnderstandingTest_runVersion2OpenAIInjectionStagesUpdate
    },

    {
        name:
            "OpenAIRampUpdate",
        run:
            UnderstandingTest_runVersion2OpenAIRampUpdate
    },

    {
      name:
        "OpenAIHoldingCondition",
      run:
        UnderstandingTest_runVersion2OpenAIHoldingCondition
    },

    {
      name:
        "OpenAIHoldingTimeT1Update",
      run:
        UnderstandingTest_runVersion2OpenAIHoldingTimeT1Update
    },

    {
      name:
        "OpenAIHoldingStagesUpdate",
      run:
        UnderstandingTest_runVersion2OpenAIHoldingStagesUpdate
    }

  ];


  UnderstandingTest_runTestSuite(
    "Understanding Live Test",
    tests
  );

}


/**
 * 共通Test Runner。
 *
 * 各テストを最後まで実行し、
 * Failureをまとめて報告する。
 *
 * @param {string} suiteName
 * @param {Array<Object>} tests
 */
function UnderstandingTest_runTestSuite(
  suiteName,
  tests
) {

  const failures =
    [];


  Logger.log(
    "========================================="
  );

  Logger.log(
    "[" +
    suiteName +
    " Start]"
  );

  Logger.log(
    "========================================="
  );


  tests.forEach(
    function(test) {

      try {

        test.run();


        Logger.log(
          "[PASS] " +
          test.name
        );

      } catch (error) {

        failures.push({

          name:
            test.name,

          message:
            error &&
            error.message
              ? error.message
              : String(error)

        });


        console.error(
          "[FAIL] " +
          test.name +
          ": " +
          (
            error &&
            error.stack
              ? error.stack
              : error
          )
        );

      }

    }
  );


  if (
    failures.length >
      0
  ) {

    throw new Error(
      suiteName +
      " Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  Logger.log(
    "========================================="
  );

  Logger.log(
    "[" +
    suiteName +
    " Passed]"
  );

  Logger.log(
    "========================================="
  );

}






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



/*
=========================================
Non-Update Entity Query Test
=========================================
*/


/**
 * 質問形式の入力から、
 * Entity Queryを正しく取得できるか確認する。
 *
 * このテストでは、
 * Entity Resolution、
 * Snapshot、
 * Response生成は行わない。
 */
function UnderstandingTest_runQuestionEntityQuery() {

  const inputText =
    "ワンワンの型温は？";


  Logger.log(
    "========================================="
  );

  Logger.log(
    "[Question Entity Query Test Start]"
  );

  Logger.log(
    "Input: " +
    inputText
  );


  const understandingResult =
    UnderstandingEngine_understand(
      inputText
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


  /*
  =========================================
  Contract確認
  =========================================
  */

  UnderstandingResultContract_validate(
    understandingResult
  );


  /*
  =========================================
  Intent確認
  =========================================
  */

  UnderstandingTest_assertEqual(
    understandingResult.intent.type,
    "question",
    "intent.type"
  );


  /*
  =========================================
  Entity Query確認
  =========================================
  */

  UnderstandingTest_assertEqual(
    understandingResult.entity.query,
    "ワンワン",
    "entity.query"
  );


  /*
  =========================================
  Entity Type Hint確認
  =========================================
  */

  UnderstandingTest_assertEqual(
    understandingResult
      .entity
      .entityTypeHint,
    "product",
    "entity.entityTypeHint"
  );


  /*
  =========================================
  Update情報が混入していないことを確認
  =========================================
  */

  UnderstandingTest_assertEqual(
    understandingResult.change.field,
    null,
    "change.field"
  );

  UnderstandingTest_assertEqual(
    understandingResult.change.operation,
    null,
    "change.operation"
  );

  UnderstandingTest_assertEqual(
    understandingResult.change.value,
    null,
    "change.value"
  );

  UnderstandingTest_assertEqual(
    understandingResult.change.unit,
    null,
    "change.unit"
  );


  Logger.log(
    "[Question Entity Query Test Passed]"
  );

  Logger.log(
    "========================================="
  );

}



/*
=========================================
Understanding Result Ver.2.0
Contract / Schema Structure Test

外部APIは呼び出さない。

確認対象：
・Understanding Request Contract Ver.2.0
・Understanding Result Contract Ver.2.0
・OpenAI Structured Output Schema Ver.2.0
・代表的なUnderstanding Result
・不正な構造の拒否
=========================================
*/


/**
 * Understanding Ver.2.0の構造テストをまとめて実行する。
 *
 * 外部APIは呼び出さない。
 */
function UnderstandingTest_runVersion2Structure() {

  Logger.log(
    "[Understanding Ver.2.0 Structure Test Start]"
  );


  UnderstandingTest_validateVersion2RequestContract();

  UnderstandingTest_validateVersion2OpenAISchema();

  UnderstandingTest_validateVersion2Update();

  UnderstandingTest_validateVersion2GeneralKnowledge();

  UnderstandingTest_validateVersion2Communication();

  UnderstandingTest_rejectVersion1Result();

  UnderstandingTest_rejectInvalidCommunicationConsistency();

  UnderstandingTest_rejectInvalidResolutionConsistency();


  Logger.log(
    "[Understanding Ver.2.0 Structure Test Passed]"
  );

}


/**
 * Understanding Request Contract Ver.2.0を確認する。
 */
function UnderstandingTest_validateVersion2RequestContract() {

  const request =
    UnderstandingRequestContract_create(
      "ワンワンの型温は？"
    );


  UnderstandingTest_assertEqualV2(
    request.schemaVersion,
    "2.0",
    "Request schemaVersion"
  );

  UnderstandingTest_assertEqualV2(
    request.contractType,
    "understanding_request",
    "Request contractType"
  );

  UnderstandingTest_assertEqualV2(
    request.payload.input.originalText,
    "ワンワンの型温は？",
    "Request originalText"
  );


  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedCommunicationTypes,
    "thanks",
    "allowedCommunicationTypes"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedIntentTypes,
    "question",
    "allowedIntentTypes"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedIntentTypes,
    "update",
    "allowedIntentTypes"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedKnowledgeBoundaryTypes,
    "company_knowledge",
    "allowedKnowledgeBoundaryTypes"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedKnowledgeBoundaryTypes,
    "general_knowledge",
    "allowedKnowledgeBoundaryTypes"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedKnowledgeBoundaryTypes,
    "derived_knowledge",
    "allowedKnowledgeBoundaryTypes"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedConversationActions,
    "new",
    "allowedConversationActions"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedEntityTypeHints,
    "product",
    "allowedEntityTypeHints"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedViewNames,
    "mold_temperature",
    "allowedViewNames"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedChangeFields,
    "mold_temperature",
    "allowedChangeFields"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedChangeOperations,
    "set",
    "allowedChangeOperations"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedChangeUnits,
    "celsius",
    "allowedChangeUnits"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedViewNames,
    "cooling_time",
    "allowedViewNames"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedChangeFields,
    "cooling_time",
    "allowedChangeFields"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedChangeUnits,
    "second",
    "allowedChangeUnits"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedChangeFields,
    "injection_speed_v1",
    "allowedChangeFields"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedChangeFields,
    "injection_stroke_s1",
    "allowedChangeFields"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedChangeFields,
    "injection_speed_v2",
    "allowedChangeFields"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedChangeFields,
    "injection_stroke_s2",
    "allowedChangeFields"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedChangeFields,
    "injection_speed_v3",
    "allowedChangeFields"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedChangeFields,
    "injection_stroke_s3",
    "allowedChangeFields"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedChangeFields,
    "injection_speed_v4",
    "allowedChangeFields"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedChangeFields,
    "injection_stroke_s4",
    "allowedChangeFields"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedChangeFields,
    "injection_speed_v5",
    "allowedChangeFields"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedChangeFields,
    "injection_stroke_s5",
    "allowedChangeFields"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedChangeUnits,
    "millimeter",
    "allowedChangeUnits"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedChangeUnits,
    "millimeter_per_second",
    "allowedChangeUnits"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedChangeFields,
    "holding_pressure_p1",
    "allowedChangeFields"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedChangeFields,
    "holding_time_t1",
    "allowedChangeFields"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedChangeFields,
    "holding_pressure_p2",
    "allowedChangeFields"
  );


  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedChangeFields,
    "holding_time_t2",
    "allowedChangeFields"
  );


  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedChangeFields,
    "holding_pressure_p3",
    "allowedChangeFields"
  );


  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedChangeFields,
    "holding_time_t3",
    "allowedChangeFields"
  );


  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedChangeFields,
    "holding_pressure_p4",
    "allowedChangeFields"
  );


  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedChangeFields,
    "holding_time_t4",
    "allowedChangeFields"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedChangeUnits,
    "megapascal",
    "allowedChangeUnits"
  );

  UnderstandingTest_assertArrayIncludesV2(
    request.policy.allowedViewNames,
    "holding_condition",
    "allowedViewNames"
  );


  Logger.log(
    "[Passed] Version 2.0 Request Contract"
  );

}


/**
 * OpenAI用Structured Output Schemaを確認する。
 *
 * OpenAI APIは呼ばない。
 */
function UnderstandingTest_validateVersion2OpenAISchema() {

  const request =
    UnderstandingRequestContract_create(
      "ワンワンの型温は？"
    );

  const schema =
    OpenAIAdapter_buildUnderstandingSchema(
      request
    );


  UnderstandingTest_assertEqualV2(
    schema.type,
    "object",
    "Schema root type"
  );

  UnderstandingTest_assertEqualV2(
    schema.additionalProperties,
    false,
    "Schema root additionalProperties"
  );


  UnderstandingTest_assertTrueV2(
    !!schema.properties.knowledgeBoundary,
    "SchemaにknowledgeBoundaryがありません。"
  );

  UnderstandingTest_assertTrueV2(
    !!schema.properties.resolution,
    "Schemaにresolutionがありません。"
  );


  UnderstandingTest_assertArrayIncludesV2(
    schema.required,
    "knowledgeBoundary",
    "Schema required"
  );

  UnderstandingTest_assertArrayIncludesV2(
    schema.required,
    "resolution",
    "Schema required"
  );


  UnderstandingTest_assertArrayIncludesV2(
    schema.properties.schemaVersion.enum,
    "2.0",
    "Schema schemaVersion enum"
  );

  UnderstandingTest_assertArrayIncludesV2(
    schema.properties
      .knowledgeBoundary
      .properties
      .type
      .enum,
    "company_knowledge",
    "Schema Knowledge Boundary enum"
  );

  UnderstandingTest_assertArrayIncludesV2(
    schema.properties
      .knowledgeBoundary
      .properties
      .type
      .enum,
    "general_knowledge",
    "Schema Knowledge Boundary enum"
  );

  UnderstandingTest_assertArrayIncludesV2(
    schema.properties
      .knowledgeBoundary
      .properties
      .type
      .enum,
    "derived_knowledge",
    "Schema Knowledge Boundary enum"
  );

  UnderstandingTest_assertEqualV2(
    schema.properties
      .resolution
      .properties
      .required
      .type,
    "boolean",
    "Schema resolution.required type"
  );

  UnderstandingTest_assertArrayIncludesV2(
    schema.properties
        .view
        .properties
        .name
        .anyOf[0]
        .enum,
    "cooling_time",
    "Schema view.name enum"
  );


  UnderstandingTest_assertArrayIncludesV2(
    schema.properties
        .change
        .properties
        .field
        .anyOf[0]
        .enum,
    "cooling_time",
    "Schema change.field enum"
  );


  UnderstandingTest_assertArrayIncludesV2(
    schema.properties
        .change
        .properties
        .unit
        .anyOf[0]
        .enum,
    "second",
    "Schema change.unit enum"
  );

  UnderstandingTest_assertArrayIncludesV2(
    schema.properties
        .view
        .properties
        .name
        .anyOf[0]
        .enum,
    "holding_condition",
    "Schema view.name enum"
  );

  UnderstandingTest_assertArrayIncludesV2(
    schema.properties
        .change
        .properties
        .field
        .anyOf[0]
        .enum,
    "holding_pressure_p1",
    "Schema change.field enum"
  );

  UnderstandingTest_assertArrayIncludesV2(
    schema.properties
        .change
        .properties
        .unit
        .anyOf[0]
        .enum,
    "megapascal",
    "Schema change.unit enum"
  );

  UnderstandingTest_assertArrayIncludesV2(
    schema.properties
        .change
        .properties
        .field
        .anyOf[0]
        .enum,
    "holding_time_t1",
    "Schema change.field enum"
  );


  [
    "injection_speed_v1",
    "injection_stroke_s1",
    "injection_speed_v2",
    "injection_stroke_s2",
    "injection_speed_v3",
    "injection_stroke_s3",
    "injection_speed_v4",
    "injection_stroke_s4",
    "injection_speed_v5",
    "injection_stroke_s5"
  ].forEach(
    function(field) {

        UnderstandingTest_assertArrayIncludesV2(
        schema.properties
            .change
            .properties
            .field
            .anyOf[0]
            .enum,
        field,
        "Schema change.field enum"
        );

    }
  );


  [
    "millimeter",
    "millimeter_per_second"
  ].forEach(
    function(unit) {

        UnderstandingTest_assertArrayIncludesV2(
        schema.properties
            .change
            .properties
            .unit
            .anyOf[0]
            .enum,
        unit,
        "Schema change.unit enum"
        );

    }
  );


  [
    "holding_pressure_p2",
    "holding_time_t2",
    "holding_pressure_p3",
    "holding_time_t3",
    "holding_pressure_p4",
    "holding_time_t4"
  ].forEach(
    function(field) {

        UnderstandingTest_assertArrayIncludesV2(
        schema.properties
            .change
            .properties
            .field
            .anyOf[0]
            .enum,
        field,
        "Schema change.field enum"
        );

    }
  );


  Logger.log(
    "[Passed] Version 2.0 OpenAI Schema"
  );

}




/**
 * OpenAI Understanding Instructionsに
 * 保圧力P1のCanonical変換規則が
 * 含まれていることを確認する。
 *
 * OpenAI APIは呼ばない。
 */
function UnderstandingTest_validateVersion2OpenAIInstructionsHoldingPressureP1() {

  const request =
    UnderstandingRequestContract_create(
      "ワンワンのP1を30MPaにして"
    );


  const instructions =
    OpenAIAdapter_buildUnderstandingInstructions(
      request
    );


  UnderstandingTest_assertTrueV2(
    instructions.indexOf(
      "holding_pressure_p1"
    ) !== -1,
    "Instructionsにholding_pressure_p1がありません。"
  );


  UnderstandingTest_assertTrueV2(
    instructions.indexOf(
      "megapascal"
    ) !== -1,
    "Instructionsにmegapascalがありません。"
  );


  Logger.log(
    "[Passed] Version 2.0 OpenAI Instructions Holding Pressure P1"
  );

}



/**
 * OpenAI Understanding Instructionsに
 * 保圧時間T1のCanonical変換規則が
 * 含まれていることを確認する。
 *
 * OpenAI APIは呼ばない。
 */
function UnderstandingTest_validateVersion2OpenAIInstructionsHoldingTimeT1() {

  const request =
    UnderstandingRequestContract_create(
      "ワンワンのT1を9秒にして"
    );


  const instructions =
    OpenAIAdapter_buildUnderstandingInstructions(
      request
    );


  UnderstandingTest_assertTrueV2(
    instructions.indexOf(
      "holding_time_t1"
    ) !== -1,
    "Instructionsにholding_time_t1がありません。"
  );


  UnderstandingTest_assertTrueV2(
    instructions.indexOf(
      "second"
    ) !== -1,
    "Instructionsにsecondがありません。"
  );


  Logger.log(
    "[Passed] Version 2.0 OpenAI Instructions Holding Time T1"
  );

}






/**
 * UpdateのResultを検証する。
 */
function UnderstandingTest_validateVersion2Update() {

  const result = {

    schemaVersion:
      "2.0",

    resultType:
      "understanding_result",

    input: {

      originalText:
        "ワンワンの型温を61℃にして",

      language:
        "ja"

    },

    communication: {

      type:
        "none"

    },

    intent: {

      type:
        "update"

    },

    knowledgeBoundary: {

      type:
        "company_knowledge"

    },

    conversation: {

      action:
        "new"

    },

    entity: {

      query:
        "ワンワン",

      entityTypeHint:
        "product"

    },

    view: {

      name:
        "mold_temperature"

    },

    resolution: {

      required:
        true

    },

    change: {

      field:
        "mold_temperature",

      operation:
        "set",

      value:
        61,

      unit:
        "celsius"

    },

    missingFields: [],

    memory: {

      decision:
        "none"

    }

  };


  const validated =
    UnderstandingResultContract_validate(
      result
    );


  UnderstandingTest_assertEqualV2(
    validated.intent.type,
    "update",
    "Update Intent"
  );

  UnderstandingTest_assertEqualV2(
    validated.knowledgeBoundary.type,
    "company_knowledge",
    "Update Knowledge Boundary"
  );

  UnderstandingTest_assertEqualV2(
    validated.resolution.required,
    true,
    "Update Resolution"
  );

  UnderstandingTest_assertEqualV2(
    validated.change.field,
    "mold_temperature",
    "Update Change Field"
  );

  UnderstandingTest_assertEqualV2(
    validated.change.operation,
    "set",
    "Update Change Operation"
  );

  UnderstandingTest_assertEqualV2(
    validated.change.value,
    61,
    "Update Change Value"
  );

  UnderstandingTest_assertEqualV2(
    validated.change.unit,
    "celsius",
    "Update Change Unit"
  );


  Logger.log(
    "[Passed] Version 2.0 Update"
  );

}



/**
 * 保圧力P1 UpdateのResultを検証する。
 */
function UnderstandingTest_validateVersion2HoldingPressureP1Update() {

  const result = {

    schemaVersion:
      "2.0",

    resultType:
      "understanding_result",

    input: {

      originalText:
        "ワンワンのP1を30MPaにして",

      language:
        "ja"

    },

    communication: {

      type:
        "none"

    },

    intent: {

      type:
        "update"

    },

    knowledgeBoundary: {

      type:
        "company_knowledge"

    },

    conversation: {

      action:
        "continue"

    },

    entity: {

      query:
        "ワンワン",

      entityTypeHint:
        "product"

    },

    view: {

      name:
        null

    },

    resolution: {

      required:
        true

    },

    change: {

      field:
        "holding_pressure_p1",

      operation:
        "set",

      value:
        30,

      unit:
        "megapascal"

    },

    missingFields: [],

    memory: {

      decision:
        "none"

    }

  };


  const validated =
    UnderstandingResultContract_validate(
      result
    );


  UnderstandingTest_assertEqualV2(
    validated.change.field,
    "holding_pressure_p1",
    "Holding Pressure P1 Change Field"
  );

  UnderstandingTest_assertEqualV2(
    validated.change.value,
    30,
    "Holding Pressure P1 Change Value"
  );

  UnderstandingTest_assertEqualV2(
    validated.change.unit,
    "megapascal",
    "Holding Pressure P1 Change Unit"
  );


  Logger.log(
    "[Passed] Version 2.0 Holding Pressure P1 Update"
  );

}



/**
 * 保圧時間T1 UpdateのResultを検証する。
 */
function UnderstandingTest_validateVersion2HoldingTimeT1Update() {

  const result =
    UnderstandingTest_createVersion2StandardConditionUpdateResult(
      "ワンワンのT1を9秒にして",
      "ワンワン",
      "holding_time_t1",
      9,
      "second",
      []
    );


  result.view.name =
    null;


  const validated =
    UnderstandingResultContract_validate(
      result
    );


  UnderstandingTest_assertEqualV2(
    validated.change.field,
    "holding_time_t1",
    "Holding Time T1 Change Field"
  );


  UnderstandingTest_assertEqualV2(
    validated.change.value,
    9,
    "Holding Time T1 Change Value"
  );


  UnderstandingTest_assertEqualV2(
    validated.change.unit,
    "second",
    "Holding Time T1 Change Unit"
  );


  Logger.log(
    "[Passed] Version 2.0 Holding Time T1 Update"
  );

}





/**
 * General KnowledgeのResultを検証する。
 */
function UnderstandingTest_validateVersion2GeneralKnowledge() {

  const result = {

    schemaVersion:
      "2.0",

    resultType:
      "understanding_result",

    input: {

      originalText:
        "六角形は化学構造として安定していますか？",

      language:
        "ja"

    },

    communication: {

      type:
        "none"

    },

    intent: {

      type:
        "question"

    },

    knowledgeBoundary: {

      type:
        "general_knowledge"

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


  const validated =
    UnderstandingResultContract_validate(
      result
    );


  UnderstandingTest_assertEqualV2(
    validated.knowledgeBoundary.type,
    "general_knowledge",
    "General Knowledge Boundary"
  );

  UnderstandingTest_assertEqualV2(
    validated.entity.query,
    null,
    "General Knowledge Entity Query"
  );

  UnderstandingTest_assertEqualV2(
    validated.resolution.required,
    false,
    "General Knowledge Resolution"
  );


  Logger.log(
    "[Passed] Version 2.0 General Knowledge"
  );

}


/**
 * CommunicationのResultを検証する。
 */
function UnderstandingTest_validateVersion2Communication() {

  const result = {

    schemaVersion:
      "2.0",

    resultType:
      "understanding_result",

    input: {

      originalText:
        "ありがとう",

      language:
        "ja"

    },

    communication: {

      type:
        "thanks"

    },

    intent: {

      type:
        "communication"

    },

    knowledgeBoundary: {

      type:
        "communication"

    },

    conversation: {

      action:
        "continue"

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


  const validated =
    UnderstandingResultContract_validate(
      result
    );


  UnderstandingTest_assertEqualV2(
    validated.communication.type,
    "thanks",
    "Communication Type"
  );

  UnderstandingTest_assertEqualV2(
    validated.intent.type,
    "communication",
    "Communication Intent"
  );

  UnderstandingTest_assertEqualV2(
    validated.knowledgeBoundary.type,
    "communication",
    "Communication Boundary"
  );

  UnderstandingTest_assertEqualV2(
    validated.resolution.required,
    false,
    "Communication Resolution"
  );


  Logger.log(
    "[Passed] Version 2.0 Communication"
  );

}


/**
 * Ver.1.1 Resultが拒否されることを確認する。
 */
function UnderstandingTest_rejectVersion1Result() {

  const result =
    UnderstandingResultContract_create(
      "ワンワンの型温は？"
    );

  result.schemaVersion =
    "1.1";


  UnderstandingTest_assertThrowsV2(
    function() {

      UnderstandingResultContract_validate(
        result
      );

    },
    "Version 1.1 Resultを拒否できませんでした。"
  );


  Logger.log(
    "[Passed] Reject Version 1.1 Result"
  );

}


/**
 * Communicationの不整合が拒否されることを確認する。
 */
function UnderstandingTest_rejectInvalidCommunicationConsistency() {

  const result =
    UnderstandingResultContract_create(
      "ありがとう"
    );

  result.communication.type =
    "thanks";

  result.intent.type =
    "communication";

  result.knowledgeBoundary.type =
    "company_knowledge";


  UnderstandingTest_assertThrowsV2(
    function() {

      UnderstandingResultContract_validate(
        result
      );

    },
    "CommunicationとKnowledge Boundaryの不整合を拒否できませんでした。"
  );


  Logger.log(
    "[Passed] Reject Invalid Communication Consistency"
  );

}


/**
 * Communicationでresolution.required=trueが
 * 拒否されることを確認する。
 */
function UnderstandingTest_rejectInvalidResolutionConsistency() {

  const result =
    UnderstandingResultContract_create(
      "ありがとう"
    );

  result.communication.type =
    "thanks";

  result.intent.type =
    "communication";

  result.knowledgeBoundary.type =
    "communication";

  result.resolution.required =
    true;


  UnderstandingTest_assertThrowsV2(
    function() {

      UnderstandingResultContract_validate(
        result
      );

    },
    "Communicationの不正なResolutionを拒否できませんでした。"
  );


  Logger.log(
    "[Passed] Reject Invalid Resolution Consistency"
  );

}


/*
=========================================
Test Helper
既存Helperとの名前衝突を避けるため、
末尾にV2を付ける。
=========================================
*/


function UnderstandingTest_assertEqualV2(
  actual,
  expected,
  fieldName
) {

  if (
    actual !==
      expected
  ) {

    throw new Error(
      "[Assertion Failed] " +
      fieldName +
      " / expected: " +
      String(expected) +
      " / actual: " +
      String(actual)
    );

  }

}


function UnderstandingTest_assertTrueV2(
  condition,
  message
) {

  if (
    condition !==
      true
  ) {

    throw new Error(
      "[Assertion Failed] " +
      message
    );

  }

}


function UnderstandingTest_assertArrayIncludesV2(
  array,
  expectedValue,
  fieldName
) {

  if (
    !Array.isArray(array)
  ) {

    throw new Error(
      "[Assertion Failed] " +
      fieldName +
      "がArrayではありません。"
    );

  }


  if (
    array.indexOf(
      expectedValue
    ) ===
      -1
  ) {

    throw new Error(
      "[Assertion Failed] " +
      fieldName +
      "に必要な値がありません: " +
      expectedValue
    );

  }

}


function UnderstandingTest_assertThrowsV2(
  callback,
  message
) {

  let errorWasThrown =
    false;


  try {

    callback();

  } catch (error) {

    errorWasThrown =
      true;

  }


  if (
    !errorWasThrown
  ) {

    throw new Error(
      "[Assertion Failed] " +
      message
    );

  }

}



/*
=========================================
Understanding Ver.2.0
OpenAI Live Test

実際にOpenAI APIを呼び出す。

確認対象：
・Structured Output Ver.2.0
・Understanding Result Contract通過
・代表的な自然言語理解
=========================================
*/


/**
 * Understanding Ver.2.0の
 * OpenAI実通信テストをまとめて実行する。
 *
 * 注意：
 * 実際にOpenAI APIを5回呼び出す。
 */
function UnderstandingTest_runVersion2OpenAILive() {

  Logger.log(
    "[Understanding Ver.2.0 OpenAI Live Test Start]"
  );


  UnderstandingTest_runVersion2OpenAICase(
    "Company Knowledge Question",
    "ワンワンの型温は？",
    {
      communicationType:
        "none",

      intentType:
        "question",

      knowledgeBoundaryType:
        "company_knowledge",

      entityQuery:
        "ワンワン",

      entityTypeHint:
        "product",

      viewName:
        "mold_temperature",

      resolutionRequired:
        true,

      changeField:
        null,

      changeOperation:
        null,

      changeValue:
        null,

      changeUnit:
        null,

      requiredMissingFields: []
    }
  );


  UnderstandingTest_runVersion2OpenAICase(
    "Update",
    "ワンワンの型温を61℃にして",
    {
      communicationType:
        "none",

      intentType:
        "update",

      knowledgeBoundaryType:
        "company_knowledge",

      entityQuery:
        "ワンワン",

      entityTypeHint:
        "product",

      viewName:
        "mold_temperature",

      resolutionRequired:
        true,

      changeField:
        "mold_temperature",

      changeOperation:
        "set",

      changeValue:
        61,

      changeUnit:
        "celsius",

      requiredMissingFields: []
    }
  );


  UnderstandingTest_runVersion2OpenAICase(
    "General Knowledge",
    "六角形は化学構造として安定していますか？",
    {
      communicationType:
        "none",

      intentType:
        "question",

      knowledgeBoundaryType:
        "general_knowledge",

      entityQuery:
        null,

      entityTypeHint:
        "unknown",

      viewName:
        null,

      resolutionRequired:
        false,

      changeField:
        null,

      changeOperation:
        null,

      changeValue:
        null,

      changeUnit:
        null,

      requiredMissingFields: []
    }
  );


  UnderstandingTest_runVersion2OpenAICase(
    "Communication",
    "ありがとう",
    {
      communicationType:
        "thanks",

      intentType:
        "communication",

      knowledgeBoundaryType:
        "communication",

      entityQuery:
        null,

      entityTypeHint:
        "unknown",

      viewName:
        null,

      resolutionRequired:
        false,

      changeField:
        null,

      changeOperation:
        null,

      changeValue:
        null,

      changeUnit:
        null,

      requiredMissingFields: []
    }
  );


  UnderstandingTest_runVersion2OpenAICase(
    "Missing Change Value",
    "ワンワンの型温を変更して",
    {
      communicationType:
        "none",

      intentType:
        "update",

      knowledgeBoundaryType:
        "company_knowledge",

      entityQuery:
        "ワンワン",

      entityTypeHint:
        "product",

      viewName:
        "mold_temperature",

      resolutionRequired:
        true,

      changeField:
        "mold_temperature",

      changeOperation:
        "set",

      changeValue:
        null,

      changeUnit:
        null,

      requiredMissingFields: [
        "change.value"
      ]
    }
  );

  UnderstandingTest_runVersion2OpenAICase(
    "Cooling Time Update",
    "ワンワンの冷却時間を9秒にして",
    {

        communicationType:
        "none",

        intentType:
        "update",

        knowledgeBoundaryType:
        "company_knowledge",

        entityQuery:
        "ワンワン",

        entityTypeHint:
        "product",

        viewName:
        "cooling_time",

        resolutionRequired:
        true,

        changeField:
        "cooling_time",

        changeOperation:
        "set",

        changeValue:
        9,

        changeUnit:
        "second",

        requiredMissingFields:
        []

    }
  );


  Logger.log(
    "[Understanding Ver.2.0 OpenAI Live Test Passed]"
  );

}


/**
 * 1件のOpenAI Understanding実通信テストを行う。
 *
 * @param {string} testName
 * @param {string} userText
 * @param {Object} expected
 */
function UnderstandingTest_runVersion2OpenAICase(
  testName,
  userText,
  expected
) {

  Logger.log(
    "[OpenAI Test Start] " +
    testName
  );


  const request =
    UnderstandingRequestContract_create(
      userText
    );


  const result =
    OpenAIAdapter_understand(
      request
    );


  Logger.log(
    "[OpenAI Understanding Result] " +
    testName +
    "\n" +
    JSON.stringify(
      result,
      null,
      2
    )
  );


  /*
  =========================================
  Contract Validation
  =========================================
  */

  UnderstandingResultContract_validate(
    result
  );


  /*
  =========================================
  共通項目
  =========================================
  */

  UnderstandingTest_assertEqualV2(
    result.schemaVersion,
    "2.0",
    testName +
    " schemaVersion"
  );

  UnderstandingTest_assertEqualV2(
    result.resultType,
    "understanding_result",
    testName +
    " resultType"
  );

  UnderstandingTest_assertEqualV2(
    result.input.originalText,
    userText,
    testName +
    " input.originalText"
  );


  /*
  =========================================
  Communication
  =========================================
  */

  UnderstandingTest_assertEqualV2(
    result.communication.type,
    expected.communicationType,
    testName +
    " communication.type"
  );


  /*
  =========================================
  Intent
  =========================================
  */

  UnderstandingTest_assertEqualV2(
    result.intent.type,
    expected.intentType,
    testName +
    " intent.type"
  );


  /*
  =========================================
  Knowledge Boundary
  =========================================
  */

  UnderstandingTest_assertEqualV2(
    result.knowledgeBoundary.type,
    expected.knowledgeBoundaryType,
    testName +
    " knowledgeBoundary.type"
  );


  /*
  =========================================
  Entity
  =========================================
  */

  UnderstandingTest_assertEqualV2(
    result.entity.query,
    expected.entityQuery,
    testName +
    " entity.query"
  );

  UnderstandingTest_assertEqualV2(
    result.entity.entityTypeHint,
    expected.entityTypeHint,
    testName +
    " entity.entityTypeHint"
  );


  /*
  =========================================
  View
  =========================================
  */

  UnderstandingTest_assertEqualV2(
    result.view.name,
    expected.viewName,
    testName +
    " view.name"
  );


  /*
  =========================================
  Resolution
  =========================================
  */

  UnderstandingTest_assertEqualV2(
    result.resolution.required,
    expected.resolutionRequired,
    testName +
    " resolution.required"
  );


  /*
  =========================================
  Change
  =========================================
  */

  UnderstandingTest_assertEqualV2(
    result.change.field,
    expected.changeField,
    testName +
    " change.field"
  );

  UnderstandingTest_assertEqualV2(
    result.change.operation,
    expected.changeOperation,
    testName +
    " change.operation"
  );

  UnderstandingTest_assertEqualV2(
    result.change.value,
    expected.changeValue,
    testName +
    " change.value"
  );

  UnderstandingTest_assertEqualV2(
    result.change.unit,
    expected.changeUnit,
    testName +
    " change.unit"
  );


  /*
  =========================================
  Missing Fields
  =========================================
  */

  UnderstandingTest_assertArrayEqualV2(
    result.missingFields,
    expected.requiredMissingFields,
    testName +
    " missingFields"
  );


  /*
  =========================================
  Memory
  =========================================
  */

  UnderstandingTest_assertEqualV2(
    result.memory.decision,
    "none",
    testName +
    " memory.decision"
  );


  Logger.log(
    "[OpenAI Test Passed] " +
    testName
  );

}


/**
 * Arrayの内容が一致することを確認する。
 *
 * 順序も含めて比較する。
 *
 * @param {*} actual
 * @param {*} expected
 * @param {string} fieldName
 */
function UnderstandingTest_assertArrayEqualV2(
  actual,
  expected,
  fieldName
) {

  if (
    !Array.isArray(actual)
  ) {

    throw new Error(
      "[Assertion Failed] " +
      fieldName +
      "のactualがArrayではありません。"
    );

  }


  if (
    !Array.isArray(expected)
  ) {

    throw new Error(
      "[Assertion Failed] " +
      fieldName +
      "のexpectedがArrayではありません。"
    );

  }


  if (
    actual.length !==
      expected.length
  ) {

    throw new Error(
      "[Assertion Failed] " +
      fieldName +
      "の要素数が一致しません。" +
      " / expected: " +
      JSON.stringify(expected) +
      " / actual: " +
      JSON.stringify(actual)
    );

  }


  for (
    let index = 0;
    index < expected.length;
    index++
  ) {

    if (
      actual[index] !==
        expected[index]
    ) {

      throw new Error(
        "[Assertion Failed] " +
        fieldName +
        "が一致しません。" +
        " / expected: " +
        JSON.stringify(expected) +
        " / actual: " +
        JSON.stringify(actual)
      );

    }

  }

}



/*
=========================================
Understanding Ver.2.0
Update Adapter Compatibility Test

確認対象：
・Ver.2.0 Understanding Resultから
  既存Update Intentへの変換
・不足情報
・未対応項目
・Update以外
・Entity Query
・Entity Type Hint
・Canonical Unit変換
=========================================
*/


/**
 * Understanding Ver.2.0と
 * 既存Update Adapterの互換性をまとめて確認する。
 *
 * OpenAI APIは呼び出さない。
 */
function UnderstandingTest_runVersion2UpdateAdapterCompatibility() {

  Logger.log(
    "[Understanding Ver.2.0 Update Adapter Compatibility Test Start]"
  );


  UnderstandingTest_validateVersion2UpdateAdapterReady();

  UnderstandingTest_validateVersion2CoolingTimeUpdateAdapterReady();

  UnderstandingTest_validateVersion2UpdateAdapterIncomplete();

  UnderstandingTest_validateVersion2UpdateAdapterNonUpdate();

  UnderstandingTest_validateVersion2UpdateAdapterEntityQuery();

  UnderstandingTest_validateVersion2UpdateAdapterEntityTypeHint();

  UnderstandingTest_validateVersion2UpdateAdapterUnitConversion();


  Logger.log(
    "[Understanding Ver.2.0 Update Adapter Compatibility Test Passed]"
  );

}


/**
 * 完全なUpdate Resultが、
 * 既存Update Intentへ正しく変換されることを確認する。
 */
function UnderstandingTest_validateVersion2UpdateAdapterReady() {

  const result =
    UnderstandingTest_createVersion2MoldTemperatureUpdateResult(
      "ワンワンの型温を61℃にして",
      "ワンワン",
      61,
      "celsius",
      []
    );


  const updateIntent =
    UpdateUnderstandingAdapter_convert(
      result
    );


  UnderstandingTest_assertEqualV2(
    updateIntent.status,
    "ready",
    "Update Adapter Ready status"
  );

  UnderstandingTest_assertEqualV2(
    updateIntent.intentType,
    "update",
    "Update Adapter Ready intentType"
  );

  UnderstandingTest_assertEqualV2(
    updateIntent.updateType,
    "mold_temperature",
    "Update Adapter Ready updateType"
  );

  UnderstandingTest_assertEqualV2(
    updateIntent.targetField,
    "金型温度(℃)",
    "Update Adapter Ready targetField"
  );

  UnderstandingTest_assertEqualV2(
    updateIntent.newValue,
    61,
    "Update Adapter Ready newValue"
  );

  UnderstandingTest_assertEqualV2(
    updateIntent.unit,
    "℃",
    "Update Adapter Ready unit"
  );


  Logger.log(
    "[Passed] Version 2.0 Update Adapter Ready"
  );

}




/**
 * 冷却時間の完全なUpdate Resultが、
 * 既存Update Intentへ正しく変換されることを確認する。
 */
function UnderstandingTest_validateVersion2CoolingTimeUpdateAdapterReady() {

  const result =
    UnderstandingTest_createVersion2StandardConditionUpdateResult(
      "ワンワンの冷却時間を9秒にして",
      "ワンワン",
      "cooling_time",
      9,
      "second",
      []
    );


  const updateIntent =
    UpdateUnderstandingAdapter_convert(
      result
    );


  UnderstandingTest_assertEqualV2(
    updateIntent.status,
    "ready",
    "Cooling Time Update Adapter Ready status"
  );


  UnderstandingTest_assertEqualV2(
    updateIntent.intentType,
    "update",
    "Cooling Time Update Adapter Ready intentType"
  );


  UnderstandingTest_assertEqualV2(
    updateIntent.updateType,
    "cooling_time",
    "Cooling Time Update Adapter Ready updateType"
  );


  UnderstandingTest_assertEqualV2(
    updateIntent.targetField,
    "冷却時間",
    "Cooling Time Update Adapter Ready targetField"
  );


  UnderstandingTest_assertEqualV2(
    updateIntent.newValue,
    9,
    "Cooling Time Update Adapter Ready newValue"
  );


  UnderstandingTest_assertEqualV2(
    updateIntent.unit,
    "second",
    "Cooling Time Update Adapter Ready unit"
  );


  Logger.log(
    "[Passed] Version 2.0 Cooling Time Update Adapter Ready"
  );

}





/**
 * 保圧力P1の完全なUpdate Resultが、
 * 既存Update Intentへ正しく変換されることを確認する。
 */
function UnderstandingTest_validateVersion2HoldingPressureP1UpdateAdapterReady() {

  const result =
    UnderstandingTest_createVersion2StandardConditionUpdateResult(
      "ワンワンのP1を30MPaにして",
      "ワンワン",
      "holding_pressure_p1",
      30,
      "megapascal",
      []
    );

  result.view.name =
    null;


  const updateIntent =
    UpdateUnderstandingAdapter_convert(
      result
    );


  UnderstandingTest_assertEqualV2(
    updateIntent.status,
    "ready",
    "Holding Pressure P1 Update Adapter Ready status"
  );


  UnderstandingTest_assertEqualV2(
    updateIntent.intentType,
    "update",
    "Holding Pressure P1 Update Adapter Ready intentType"
  );


  UnderstandingTest_assertEqualV2(
    updateIntent.updateType,
    "holding_pressure_p1",
    "Holding Pressure P1 Update Adapter Ready updateType"
  );


  UnderstandingTest_assertEqualV2(
    updateIntent.targetField,
    "保圧力:P1",
    "Holding Pressure P1 Update Adapter Ready targetField"
  );


  UnderstandingTest_assertEqualV2(
    updateIntent.newValue,
    30,
    "Holding Pressure P1 Update Adapter Ready newValue"
  );


  UnderstandingTest_assertEqualV2(
    updateIntent.unit,
    "megapascal",
    "Holding Pressure P1 Update Adapter Ready unit"
  );


  Logger.log(
    "[Passed] Version 2.0 Holding Pressure P1 Update Adapter Ready"
  );

}



/**
 * 保圧時間T1の完全なUpdate Resultが、
 * 既存Update Intentへ正しく変換されることを確認する。
 */
function UnderstandingTest_validateVersion2HoldingTimeT1UpdateAdapterReady() {

  const result =
    UnderstandingTest_createVersion2StandardConditionUpdateResult(
      "ワンワンのT1を9秒にして",
      "ワンワン",
      "holding_time_t1",
      9,
      "second",
      []
    );


  result.view.name =
    "holding_condition";


  const updateIntent =
    UpdateUnderstandingAdapter_convert(
      result
    );


  UnderstandingTest_assertEqualV2(
    updateIntent.status,
    "ready",
    "Holding Time T1 Update Adapter Ready status"
  );


  UnderstandingTest_assertEqualV2(
    updateIntent.intentType,
    "update",
    "Holding Time T1 Update Adapter Ready intentType"
  );


  UnderstandingTest_assertEqualV2(
    updateIntent.updateType,
    "holding_time_t1",
    "Holding Time T1 Update Adapter Ready updateType"
  );


  UnderstandingTest_assertEqualV2(
    updateIntent.targetField,
    "保圧時間:T1",
    "Holding Time T1 Update Adapter Ready targetField"
  );


  UnderstandingTest_assertEqualV2(
    updateIntent.newValue,
    9,
    "Holding Time T1 Update Adapter Ready newValue"
  );


  UnderstandingTest_assertEqualV2(
    updateIntent.unit,
    "second",
    "Holding Time T1 Update Adapter Ready unit"
  );


  Logger.log(
    "[Passed] Version 2.0 Holding Time T1 Update Adapter Ready"
  );

}






/**
 * 変更値が不足しているUpdate Resultが、
 * incompleteへ変換されることを確認する。
 */
function UnderstandingTest_validateVersion2UpdateAdapterIncomplete() {

  const result =
    UnderstandingTest_createVersion2MoldTemperatureUpdateResult(
      "ワンワンの型温を変更して",
      "ワンワン",
      null,
      null,
      [
        "change.value"
      ]
    );


  const updateIntent =
    UpdateUnderstandingAdapter_convert(
      result
    );


  UnderstandingTest_assertEqualV2(
    updateIntent.status,
    "incomplete",
    "Update Adapter Incomplete status"
  );

  UnderstandingTest_assertEqualV2(
    updateIntent.updateType,
    "mold_temperature",
    "Update Adapter Incomplete updateType"
  );

  UnderstandingTest_assertEqualV2(
    updateIntent.targetField,
    "金型温度(℃)",
    "Update Adapter Incomplete targetField"
  );

  UnderstandingTest_assertEqualV2(
    updateIntent.newValue,
    null,
    "Update Adapter Incomplete newValue"
  );

  UnderstandingTest_assertEqualV2(
    updateIntent.unit,
    "℃",
    "Update Adapter Incomplete unit"
  );

  UnderstandingTest_assertEqualV2(
    updateIntent.message,
    "変更後の金型温度を指定してください。",
    "Update Adapter Incomplete message"
  );


  Logger.log(
    "[Passed] Version 2.0 Update Adapter Incomplete"
  );

}



/**
 * Update以外のUnderstanding Resultでは、
 * nullが返ることを確認する。
 */
function UnderstandingTest_validateVersion2UpdateAdapterNonUpdate() {

  const result =
    UnderstandingResultContract_create(
      "ワンワンの型温は？"
    );


  result.communication.type =
    "none";

  result.intent.type =
    "question";

  result.knowledgeBoundary.type =
    "company_knowledge";

  result.conversation.action =
    "new";

  result.entity.query =
    "ワンワン";

  result.entity.entityTypeHint =
    "product";

  result.view.name =
    "mold_temperature";

  result.resolution.required =
    true;

  result.change.field =
    null;

  result.change.operation =
    null;

  result.change.value =
    null;

  result.change.unit =
    null;

  result.missingFields =
    [];

  result.memory.decision =
    "none";


  const updateIntent =
    UpdateUnderstandingAdapter_convert(
      result
    );


  UnderstandingTest_assertEqualV2(
    updateIntent,
    null,
    "Update Adapter Non Update"
  );


  Logger.log(
    "[Passed] Version 2.0 Update Adapter Non Update"
  );

}


/**
 * Entity Queryを正しく取得できることを確認する。
 */
function UnderstandingTest_validateVersion2UpdateAdapterEntityQuery() {

  const result =
    UnderstandingTest_createVersion2MoldTemperatureUpdateResult(
      "ワンワンの型温を61℃にして",
      "  ワンワン  ",
      61,
      "celsius",
      []
    );


  const entityQuery =
    UpdateUnderstandingAdapter_getEntityQuery(
      result
    );


  UnderstandingTest_assertEqualV2(
    entityQuery,
    "ワンワン",
    "Update Adapter Entity Query"
  );


  Logger.log(
    "[Passed] Version 2.0 Update Adapter Entity Query"
  );

}


/**
 * Entity Type Hintを正しく取得できることを確認する。
 */
function UnderstandingTest_validateVersion2UpdateAdapterEntityTypeHint() {

  const result =
    UnderstandingTest_createVersion2MoldTemperatureUpdateResult(
      "ワンワンの型温を61℃にして",
      "ワンワン",
      61,
      "celsius",
      []
    );


  const entityTypeHint =
    UpdateUnderstandingAdapter_getEntityTypeHint(
      result
    );


  UnderstandingTest_assertEqualV2(
    entityTypeHint,
    "product",
    "Update Adapter Entity Type Hint"
  );


  Logger.log(
    "[Passed] Version 2.0 Update Adapter Entity Type Hint"
  );

}


/**
 * Canonical Unitが既存内部単位へ
 * 正しく変換されることを確認する。
 */
function UnderstandingTest_validateVersion2UpdateAdapterUnitConversion() {

  UnderstandingTest_assertEqualV2(
    UpdateUnderstandingAdapter_convertUnit(
      "celsius"
    ),
    "℃",
    "Update Adapter Celsius Unit"
  );

  UnderstandingTest_assertEqualV2(
    UpdateUnderstandingAdapter_convertUnit(
      null
    ),
    "℃",
    "Update Adapter Null Unit"
  );

  UnderstandingTest_assertEqualV2(
    UpdateUnderstandingAdapter_convertUnit(
      "rpm"
    ),
    "rpm",
    "Update Adapter Other Unit"
  );


  Logger.log(
    "[Passed] Version 2.0 Update Adapter Unit Conversion"
  );

}



/**
 * 標準成形条件Update用の
 * Understanding Result Ver.2.0を生成する。
 *
 * @param {string} originalText
 * @param {string|null} entityQuery
 * @param {string} changeField
 * @param {number|null} value
 * @param {string|null} unit
 * @param {Array} missingFields
 * @returns {Object}
 */
function UnderstandingTest_createVersion2StandardConditionUpdateResult(
  originalText,
  entityQuery,
  changeField,
  value,
  unit,
  missingFields
) {

  const result =
    UnderstandingResultContract_create(
      originalText
    );


  result.communication.type =
    "none";

  result.intent.type =
    "update";

  result.knowledgeBoundary.type =
    "company_knowledge";

  result.conversation.action =
    "new";

  result.entity.query =
    entityQuery;

  result.entity.entityTypeHint =
    "product";

  result.view.name =
    changeField;

  result.resolution.required =
    entityQuery !==
      null;

  result.change.field =
    changeField;

  result.change.operation =
    "set";

  result.change.value =
    value;

  result.change.unit =
    unit;

  result.missingFields =
    Array.isArray(
      missingFields
    )
      ? missingFields.slice()
      : [];

  result.memory.decision =
    "none";


  return result;

}





/**
 * 金型温度Update用の
 * Understanding Result Ver.2.0を生成する。
 *
 * @param {string} originalText
 * @param {string|null} entityQuery
 * @param {number|null} value
 * @param {string|null} unit
 * @param {Array} missingFields
 * @returns {Object}
 */
function UnderstandingTest_createVersion2MoldTemperatureUpdateResult(
  originalText,
  entityQuery,
  value,
  unit,
  missingFields
) {

  const result =
    UnderstandingResultContract_create(
      originalText
    );


  result.communication.type =
    "none";

  result.intent.type =
    "update";

  result.knowledgeBoundary.type =
    "company_knowledge";

  result.conversation.action =
    "new";

  result.entity.query =
    entityQuery;

  result.entity.entityTypeHint =
    "product";

  result.view.name =
    "mold_temperature";

  result.resolution.required =
    entityQuery !==
      null;

  result.change.field =
    "mold_temperature";

  result.change.operation =
    "set";

  result.change.value =
    value;

  result.change.unit =
    unit;

  result.missingFields =
    Array.isArray(
      missingFields
    )
      ? missingFields.slice()
      : [];

  result.memory.decision =
    "none";


  return result;

}



/*
=========================================
Understanding Ver.2.0
Handle Routing Live Test

確認対象：
・knowledgeBoundary.typeによる経路選択
・Communication
・General Knowledge
・Company Knowledge
・Unknown
・entity.query Fallback時に
  currentView未定義エラーが起きないこと

注意：
・OpenAI APIを呼び出す
・Company Knowledgeでは登録データを参照する
=========================================
*/


/**
 * UnderstandingEngine_handleの
 * Ver.2.0経路をまとめて確認する。
 */
function UnderstandingTest_runVersion2HandleRoutingLive() {

  Logger.log(
    "[Understanding Ver.2.0 Handle Routing Live Test Start]"
  );


  /*
  =========================================
  Communication
  =========================================
  */

  UnderstandingTest_runVersion2HandleRoutingCase(
    "Communication",
    "ありがとう",
    "communication"
  );


  /*
  =========================================
  General Knowledge
  =========================================
  */

  UnderstandingTest_runVersion2HandleRoutingCase(
    "General Knowledge",
    "POMとは何ですか？",
    "general_knowledge"
  );


  /*
  =========================================
  Company Knowledge
  =========================================
  */

  UnderstandingTest_runVersion2HandleRoutingCase(
    "Company Knowledge",
    "ワンワンの型温は？",
    "company_knowledge"
  );


  /*
  =========================================
  Entity Query Fallback
  =========================================
  *
  * entity.queryがnullになるかどうかは
  * LLM判断によるため、このケースでは
  * ReferenceErrorが発生しないことを確認する。
  */

  UnderstandingTest_runVersion2HandleRoutingCase(
    "Entity Query Fallback Safety",
    "型温は？",
    "company_knowledge"
  );


  Logger.log(
    "[Understanding Ver.2.0 Handle Routing Live Test Passed]"
  );

}


/**
 * 1件のHandle Routing実通信テストを行う。
 *
 * @param {string} testName
 * @param {string} userText
 * @param {string} expectedBoundary
 */
function UnderstandingTest_runVersion2HandleRoutingCase(
  testName,
  userText,
  expectedBoundary
) {

  const sessionId =
    "UNDERSTANDING_V2_ROUTING_TEST_" +
    testName
      .replace(
        /[^a-zA-Z0-9]/g,
        "_"
      ) +
    "_" +
    new Date().getTime();


  clearConversationState(
    sessionId
  );


  Logger.log(
    "[Handle Routing Test Start] " +
    testName
  );

  Logger.log(
    "Input: " +
    userText
  );


  /*
  =========================================
  Understanding Resultを先に確認
  =========================================
  */

  const understandingResult =
    UnderstandingEngine_understand(
      userText
    );


  UnderstandingResultContract_validate(
    understandingResult
  );


  Logger.log(
    "[Understanding Result] " +
    testName +
    "\n" +
    JSON.stringify(
      understandingResult,
      null,
      2
    )
  );


  UnderstandingTest_assertEqualV2(
    understandingResult
      .knowledgeBoundary
      .type,
    expectedBoundary,
    testName +
    " knowledgeBoundary.type"
  );


  /*
  =========================================
  Handle実行
  =========================================
  */

  const response =
    UnderstandingEngine_handle(
      userText,
      sessionId
    );


  Logger.log(
    "[Handle Response] " +
    testName +
    "\n" +
    JSON.stringify(
      response,
      null,
      2
    )
  );


  /*
  =========================================
  応答存在確認
  =========================================
  */

  if (
    response ===
      null ||
    response ===
      undefined
  ) {

    throw new Error(
      "[Assertion Failed] " +
      testName +
      "の応答がありません。"
    );

  }


  if (
    typeof response ===
      "string" &&
    !String(
      response
    ).trim()
  ) {

    throw new Error(
      "[Assertion Failed] " +
      testName +
      "の文字列応答が空です。"
    );

  }


  if (
    typeof response ===
      "object" &&
    !Array.isArray(
      response
    ) &&
    Object.keys(
      response
    ).length ===
      0
  ) {

    throw new Error(
      "[Assertion Failed] " +
      testName +
      "のObject応答が空です。"
    );

  }


  clearConversationState(
    sessionId
  );


  Logger.log(
    "[Handle Routing Test Passed] " +
    testName
  );

}



/**
 * 保圧条件ViewのResultを検証する。
 */
function UnderstandingTest_validateVersion2HoldingConditionView() {

  const result =
    UnderstandingResultContract_create(
      "ワンワンの保圧条件は？"
    );


  result.communication.type =
    "none";

  result.intent.type =
    "question";

  result.knowledgeBoundary.type =
    "company_knowledge";

  result.conversation.action =
    "new";

  result.entity.query =
    "ワンワン";

  result.entity.entityTypeHint =
    "product";

  result.view.name =
    "holding_condition";

  result.resolution.required =
    true;

  result.change.field =
    null;

  result.change.operation =
    null;

  result.change.value =
    null;

  result.change.unit =
    null;

  result.missingFields =
    [];

  result.memory.decision =
    "none";


  const validated =
    UnderstandingResultContract_validate(
      result
    );


  UnderstandingTest_assertEqualV2(
    validated.view.name,
    "holding_condition",
    "Holding Condition View"
  );


  Logger.log(
    "[Passed] Version 2.0 Holding Condition View"
  );

}


/**
 * OpenAI Understanding Instructionsに
 * 保圧条件ViewのCanonical変換規則が
 * 含まれていることを確認する。
 *
 * OpenAI APIは呼ばない。
 */
function UnderstandingTest_validateVersion2OpenAIInstructionsHoldingCondition() {

  const request =
    UnderstandingRequestContract_create(
      "ワンワンの保圧条件は？"
    );


  const instructions =
    OpenAIAdapter_buildUnderstandingInstructions(
      request
    );


  UnderstandingTest_assertTrueV2(
    instructions.indexOf(
      "holding_condition"
    ) !== -1,
    "Instructionsにholding_conditionがありません。"
  );


  Logger.log(
    "[Passed] Version 2.0 OpenAI Instructions Holding Condition"
  );

}



/**
 * 保圧条件Viewを
 * OpenAIが実際に理解できることを確認する。
 *
 * 実際にOpenAI APIを1回呼び出す。
 */
function UnderstandingTest_runVersion2OpenAIHoldingCondition() {

  const inputText =
    "ワンワンの保圧は？";


  const request =
    UnderstandingRequestContract_create(
      inputText
    );


  const result =
    OpenAIAdapter_understand(
      request
    );


  Logger.log(
    "[OpenAI Holding Condition Result]\n" +
    JSON.stringify(
      result,
      null,
      2
    )
  );


  UnderstandingResultContract_validate(
    result
  );


  UnderstandingTest_assertEqualV2(
    result.intent.type,
    "question",
    "Holding Condition intent.type"
  );


  UnderstandingTest_assertEqualV2(
    result.knowledgeBoundary.type,
    "company_knowledge",
    "Holding Condition knowledgeBoundary.type"
  );


  UnderstandingTest_assertEqualV2(
    result.entity.query,
    "ワンワン",
    "Holding Condition entity.query"
  );


  UnderstandingTest_assertEqualV2(
    result.entity.entityTypeHint,
    "product",
    "Holding Condition entity.entityTypeHint"
  );


  UnderstandingTest_assertEqualV2(
    result.view.name,
    "holding_condition",
    "Holding Condition view.name"
  );


  UnderstandingTest_assertEqualV2(
    result.change.field,
    null,
    "Holding Condition change.field"
  );


  Logger.log(
    "[Passed] Version 2.0 OpenAI Holding Condition"
  );

}




/**
 * 保圧時間T1 Updateを
 * OpenAIが実際に理解できることを確認する。
 *
 * 実際にOpenAI APIを1回呼び出す。
 */
function UnderstandingTest_runVersion2OpenAIHoldingTimeT1Update() {

  const inputText =
    "ワンワンのT1を9秒にして";


  const request =
    UnderstandingRequestContract_create(
      inputText
    );


  const result =
    OpenAIAdapter_understand(
      request
    );


  Logger.log(
    "[OpenAI Holding Time T1 Result]\n" +
    JSON.stringify(
      result,
      null,
      2
    )
  );


  UnderstandingResultContract_validate(
    result
  );


  UnderstandingTest_assertEqualV2(
    result.intent.type,
    "update",
    "Holding Time T1 intent.type"
  );


  UnderstandingTest_assertEqualV2(
    result.knowledgeBoundary.type,
    "company_knowledge",
    "Holding Time T1 knowledgeBoundary.type"
  );


  UnderstandingTest_assertEqualV2(
    result.entity.query,
    "ワンワン",
    "Holding Time T1 entity.query"
  );


  UnderstandingTest_assertEqualV2(
    result.change.field,
    "holding_time_t1",
    "Holding Time T1 change.field"
  );


  UnderstandingTest_assertEqualV2(
    result.change.operation,
    "set",
    "Holding Time T1 change.operation"
  );


  UnderstandingTest_assertEqualV2(
    result.change.value,
    9,
    "Holding Time T1 change.value"
  );


  UnderstandingTest_assertEqualV2(
    result.change.unit,
    "second",
    "Holding Time T1 change.unit"
  );


  Logger.log(
    "[Passed] Version 2.0 OpenAI Holding Time T1 Update"
  );

}



function UnderstandingTest_validateVersion2HoldingStagesUpdateFields() {

  const cases = [

    {
      text:
        "ワンワンのP2を20MPaにして",
      field:
        "holding_pressure_p2",
      value:
        20,
      unit:
        "megapascal"
    },

    {
      text:
        "ワンワンのT2を2秒にして",
      field:
        "holding_time_t2",
      value:
        2,
      unit:
        "second"
    },

    {
      text:
        "ワンワンのP3を15MPaにして",
      field:
        "holding_pressure_p3",
      value:
        15,
      unit:
        "megapascal"
    },

    {
      text:
        "ワンワンのT3を3秒にして",
      field:
        "holding_time_t3",
      value:
        3,
      unit:
        "second"
    },

    {
      text:
        "ワンワンのP4を10MPaにして",
      field:
        "holding_pressure_p4",
      value:
        10,
      unit:
        "megapascal"
    },

    {
      text:
        "ワンワンのT4を4秒にして",
      field:
        "holding_time_t4",
      value:
        4,
      unit:
        "second"
    }

  ];


  cases.forEach(
    function(testCase) {

      const result =
        UnderstandingTest_createVersion2StandardConditionUpdateResult(
          testCase.text,
          "ワンワン",
          testCase.field,
          testCase.value,
          testCase.unit,
          []
        );


      result.view.name =
        "holding_condition";


      const validated =
        UnderstandingResultContract_validate(
          result
        );


      UnderstandingTest_assertEqualV2(
        validated.change.field,
        testCase.field,
        testCase.field + " change.field"
      );

    }
  );


  Logger.log(
    "[Passed] Version 2.0 Holding Stages Update Fields"
  );

}



/**
 * V1/S1～V5/S5の射出条件Fieldについて、
 * Understanding Result Contractが
 * FieldとCanonical Unitを受理することを確認する。
 */
function UnderstandingTest_validateVersion2InjectionStagesUpdateFields() {

  const cases = [

    {
        text:
        "ワンワンのV1を100mm/sにして",
        field:
        "injection_speed_v1",
        value:
        100,
        unit:
        "millimeter_per_second",
        targetField:
        "射出速度:V1"
    },

    {
        text:
        "ワンワンのS1を20mmにして",
        field:
        "injection_stroke_s1",
        value:
        20,
        unit:
        "millimeter",
        targetField:
        "射出ストローク:S1"
    },

    {
        text:
        "ワンワンのV2を90mm/sにして",
        field:
        "injection_speed_v2",
        value:
        90,
        unit:
        "millimeter_per_second",
        targetField:
        "射出速度:V2"
    },

    {
        text:
        "ワンワンのS2を30mmにして",
        field:
        "injection_stroke_s2",
        value:
        30,
        unit:
        "millimeter",
        targetField:
        "射出ストローク:S2"
    },

    {
        text:
        "ワンワンのV3を80mm/sにして",
        field:
        "injection_speed_v3",
        value:
        80,
        unit:
        "millimeter_per_second",
        targetField:
        "射出速度:V3"
    },

    {
        text:
        "ワンワンのS3を40mmにして",
        field:
        "injection_stroke_s3",
        value:
        40,
        unit:
        "millimeter",
        targetField:
        "射出ストローク:S3"
    },

    {
        text:
        "ワンワンのV4を70mm/sにして",
        field:
        "injection_speed_v4",
        value:
        70,
        unit:
        "millimeter_per_second",
        targetField:
        "射出速度:V4"
    },

    {
        text:
        "ワンワンのS4を50mmにして",
        field:
        "injection_stroke_s4",
        value:
        50,
        unit:
        "millimeter",
        targetField:
        "射出ストローク:S4"
    },

    {
        text:
        "ワンワンのV5を60mm/sにして",
        field:
        "injection_speed_v5",
        value:
        60,
        unit:
        "millimeter_per_second",
        targetField:
        "射出速度:V5"
    },

    {
        text:
        "ワンワンのS5を60mmにして",
        field:
        "injection_stroke_s5",
        value:
        60,
        unit:
        "millimeter",
        targetField:
        "射出ストローク:S5"
    }

  ];


  cases.forEach(
    function(testCase) {

      /*
       * Result Contractの許可Fieldに
       * 登録されていることを確認する。
       */
      UnderstandingTest_assertArrayIncludesV2(
        UNDERSTANDING_RESULT_ALLOWED_CHANGE_FIELDS,
        testCase.field,
        "UNDERSTANDING_RESULT_ALLOWED_CHANGE_FIELDS"
      );


      /*
       * 実際のUnderstanding Resultとして
       * Contractを通過できることを確認する。
       */
      const result =
        UnderstandingTest_createVersion2StandardConditionUpdateResult(
          testCase.text,
          "ワンワン",
          testCase.field,
          testCase.value,
          testCase.unit,
          []
        );


      result.view.name =
        null;


      const validated =
        UnderstandingResultContract_validate(
          result
        );

      const updateIntent =
        UpdateUnderstandingAdapter_convert(
            validated
        );


        UnderstandingTest_assertEqualV2(
            updateIntent.status,
            "ready",
            testCase.field + " updateIntent.status"
        );


        UnderstandingTest_assertEqualV2(
            updateIntent.intentType,
            "update",
            testCase.field + " updateIntent.intentType"
        );


        UnderstandingTest_assertEqualV2(
            updateIntent.updateType,
            testCase.field,
            testCase.field + " updateIntent.updateType"
        );


        UnderstandingTest_assertEqualV2(
            updateIntent.targetField,
            testCase.targetField,
            testCase.field + " updateIntent.targetField"
        );


        UnderstandingTest_assertEqualV2(
            updateIntent.newValue,
            testCase.value,
            testCase.field + " updateIntent.newValue"
        );


        UnderstandingTest_assertEqualV2(
            updateIntent.unit,
            testCase.unit,
            testCase.field + " updateIntent.unit"
        );


      UnderstandingTest_assertEqualV2(
        validated.change.field,
        testCase.field,
        testCase.field + " change.field"
      );


      UnderstandingTest_assertEqualV2(
        validated.change.value,
        testCase.value,
        testCase.field + " change.value"
      );


      UnderstandingTest_assertEqualV2(
        validated.change.unit,
        testCase.unit,
        testCase.field + " change.unit"
      );

    }
  );


  Logger.log(
    "[Passed] Version 2.0 Injection Stages Update Fields"
  );

}



function UnderstandingTest_validateVersion2RampUpdateFields() {

  const cases = [

    {
      text: "ワンワンの速度徐変1をONにして",
      field: "injection_speed_ramp_1",
      value: true,
      targetField: "速度徐変1(ON/OFF)"
    },

    {
      text: "ワンワンの速度徐変2をOFFにして",
      field: "injection_speed_ramp_2",
      value: false,
      targetField: "速度徐変2(ON/OFF)"
    },

    {
      text: "ワンワンの速度徐変3をONにして",
      field: "injection_speed_ramp_3",
      value: true,
      targetField: "速度徐変3(ON/OFF)"
    },

    {
      text: "ワンワンの速度徐変4をOFFにして",
      field: "injection_speed_ramp_4",
      value: false,
      targetField: "速度徐変4(ON/OFF)"
    },

    {
      text: "ワンワンの速度徐変5をONにして",
      field: "injection_speed_ramp_5",
      value: true,
      targetField: "速度徐変5(ON/OFF)"
    },

    {
      text: "ワンワンの保圧徐変1をONにして",
      field: "holding_ramp_1",
      value: true,
      targetField: "保圧徐変1(ON/OFF)"
    },

    {
      text: "ワンワンの保圧徐変2をOFFにして",
      field: "holding_ramp_2",
      value: false,
      targetField: "保圧徐変2(ON/OFF)"
    },

    {
      text: "ワンワンの保圧徐変3をONにして",
      field: "holding_ramp_3",
      value: true,
      targetField: "保圧徐変3(ON/OFF)"
    },

    {
      text: "ワンワンの保圧徐変4をOFFにして",
      field: "holding_ramp_4",
      value: false,
      targetField: "保圧徐変4(ON/OFF)"
    }

  ];


  const request =
    UnderstandingRequestContract_create(
      "ワンワンの速度徐変1をONにして"
    );


  const instructions =
    OpenAIAdapter_buildUnderstandingInstructions(
      request
    );


  cases.forEach(
    function(testCase) {

      UnderstandingTest_assertArrayIncludesV2(
        request.policy.allowedChangeFields,
        testCase.field,
        "allowedChangeFields"
      );


      UnderstandingTest_assertArrayIncludesV2(
        UNDERSTANDING_RESULT_ALLOWED_CHANGE_FIELDS,
        testCase.field,
        "UNDERSTANDING_RESULT_ALLOWED_CHANGE_FIELDS"
      );


      UnderstandingTest_assertTrueV2(
        instructions.indexOf(
          testCase.field
        ) !== -1,
        "Instructionsに" +
          testCase.field +
          "がありません。"
      );


      const result =
        UnderstandingTest_createVersion2StandardConditionUpdateResult(
          testCase.text,
          "ワンワン",
          testCase.field,
          testCase.value,
          null,
          []
        );


      result.view.name =
        null;


      const validated =
        UnderstandingResultContract_validate(
          result
        );


      const updateIntent =
        UpdateUnderstandingAdapter_convert(
          validated
        );


      UnderstandingTest_assertEqualV2(
        updateIntent.status,
        "ready",
        testCase.field + " updateIntent.status"
      );


      UnderstandingTest_assertEqualV2(
        updateIntent.intentType,
        "update",
        testCase.field + " updateIntent.intentType"
      );


      UnderstandingTest_assertEqualV2(
        updateIntent.updateType,
        testCase.field,
        testCase.field + " updateIntent.updateType"
      );


      UnderstandingTest_assertEqualV2(
        updateIntent.targetField,
        testCase.targetField,
        testCase.field + " updateIntent.targetField"
      );


      UnderstandingTest_assertEqualV2(
        updateIntent.newValue,
        testCase.value,
        testCase.field + " updateIntent.newValue"
      );


      UnderstandingTest_assertEqualV2(
        validated.change.unit,
        null,
        testCase.field + " change.unit"
      );


      UnderstandingTest_assertEqualV2(
        updateIntent.unit,
        null,
        testCase.field + " updateIntent.unit"
      );

    }
  );


  Logger.log(
    "[Passed] Version 2.0 Ramp Update Fields"
  );

}



function UnderstandingTest_validateVersion2ResinTemperatureUpdateFields() {

  const cases = [

    {
      text: "ワンワンのZ0を200℃にして",
      field: "resin_temperature_z0",
      value: 200,
      unit: "celsius",
      targetField: "樹脂温:Z0"
    },

    {
      text: "ワンワンのZ1を195℃にして",
      field: "resin_temperature_z1",
      value: 195,
      unit: "celsius",
      targetField: "樹脂温:Z1"
    },

    {
      text: "ワンワンのZ2を190℃にして",
      field: "resin_temperature_z2",
      value: 190,
      unit: "celsius",
      targetField: "樹脂温:Z2"
    },

    {
      text: "ワンワンのZPを185℃にして",
      field: "resin_temperature_zp",
      value: 185,
      unit: "celsius",
      targetField: "樹脂温:ZP"
    },

    {
      text: "ワンワンのZJを180℃にして",
      field: "resin_temperature_zj",
      value: 180,
      unit: "celsius",
      targetField: "樹脂温:ZJ"
    },

    {
      text: "ワンワンのZ4を175℃にして",
      field: "resin_temperature_z4",
      value: 175,
      unit: "celsius",
      targetField: "樹脂温:Z4"
    },

    {
      text: "ワンワンのZ5を170℃にして",
      field: "resin_temperature_z5",
      value: 170,
      unit: "celsius",
      targetField: "樹脂温:Z5"
    },

    {
      text: "ワンワンのZ6を165℃にして",
      field: "resin_temperature_z6",
      value: 165,
      unit: "celsius",
      targetField: "樹脂温:Z6"
    },

    {
      text: "ワンワンのZHを160℃にして",
      field: "resin_temperature_zh",
      value: 160,
      unit: "celsius",
      targetField: "樹脂温:ZH"
    }

  ];


  const request =
    UnderstandingRequestContract_create(
      "ワンワンのZ1を195℃にして"
    );


  const instructions =
    OpenAIAdapter_buildUnderstandingInstructions(
      request
    );


  cases.forEach(
    function(testCase) {

      UnderstandingTest_assertArrayIncludesV2(
        request.policy.allowedChangeFields,
        testCase.field,
        "allowedChangeFields"
      );


      UnderstandingTest_assertArrayIncludesV2(
        UNDERSTANDING_RESULT_ALLOWED_CHANGE_FIELDS,
        testCase.field,
        "UNDERSTANDING_RESULT_ALLOWED_CHANGE_FIELDS"
      );


      UnderstandingTest_assertTrueV2(
        instructions.indexOf(
          testCase.field
        ) !== -1,
        "Instructionsに" +
          testCase.field +
          "がありません。"
      );


      const result =
        UnderstandingTest_createVersion2StandardConditionUpdateResult(
          testCase.text,
          "ワンワン",
          testCase.field,
          testCase.value,
          testCase.unit,
          []
        );


      result.view.name =
        null;


      const validated =
        UnderstandingResultContract_validate(
          result
        );


      const updateIntent =
        UpdateUnderstandingAdapter_convert(
          validated
        );


      UnderstandingTest_assertEqualV2(
        updateIntent.status,
        "ready",
        testCase.field + " updateIntent.status"
      );


      UnderstandingTest_assertEqualV2(
        updateIntent.intentType,
        "update",
        testCase.field + " updateIntent.intentType"
      );


      UnderstandingTest_assertEqualV2(
        updateIntent.updateType,
        testCase.field,
        testCase.field + " updateIntent.updateType"
      );


      UnderstandingTest_assertEqualV2(
        updateIntent.targetField,
        testCase.targetField,
        testCase.field + " updateIntent.targetField"
      );


      UnderstandingTest_assertEqualV2(
        updateIntent.newValue,
        testCase.value,
        testCase.field + " updateIntent.newValue"
      );


      UnderstandingTest_assertEqualV2(
        validated.change.unit,
        testCase.unit,
        testCase.field + " change.unit"
      );


      UnderstandingTest_assertEqualV2(
        updateIntent.unit,
        "℃",
        testCase.field + " updateIntent.unit"
      );

    }
  );


  Logger.log(
    "[Passed] Version 2.0 Resin Temperature Update Fields"
  );

}



function UnderstandingTest_validateVersion2OpenAIInstructionsHoldingStages() {

  const request =
    UnderstandingRequestContract_create(
      "ワンワンのP2を20MPaにして"
    );


  const instructions =
    OpenAIAdapter_buildUnderstandingInstructions(
      request
    );


  [
    "holding_pressure_p2",
    "holding_time_t2",
    "holding_pressure_p3",
    "holding_time_t3",
    "holding_pressure_p4",
    "holding_time_t4"
  ].forEach(
    function(field) {

      UnderstandingTest_assertTrueV2(
        instructions.indexOf(
          field
        ) !== -1,
        "Instructionsに" +
          field +
          "がありません。"
      );

    }
  );


  Logger.log(
    "[Passed] Version 2.0 OpenAI Instructions Holding Stages"
  );

}



function UnderstandingTest_runVersion2OpenAIHoldingStagesUpdate() {

  const cases = [

    {
      text:
        "ワンワンのP2を180MPaにして",
      field:
        "holding_pressure_p2",
      value:
        180,
      unit:
        "megapascal"
    },

    {
      text:
        "ワンワンのT2を2秒にして",
      field:
        "holding_time_t2",
      value:
        2,
      unit:
        "second"
    },

    {
      text:
        "ワンワンのP3を150MPaにして",
      field:
        "holding_pressure_p3",
      value:
        150,
      unit:
        "megapascal"
    },

    {
      text:
        "ワンワンのT3を3秒にして",
      field:
        "holding_time_t3",
      value:
        3,
      unit:
        "second"
    },

    {
      text:
        "ワンワンのP4を120MPaにして",
      field:
        "holding_pressure_p4",
      value:
        120,
      unit:
        "megapascal"
    },

    {
      text:
        "ワンワンのT4を4秒にして",
      field:
        "holding_time_t4",
      value:
        4,
      unit:
        "second"
    }

  ];


  cases.forEach(
    function(testCase) {

        const request =
        UnderstandingRequestContract_create(
            testCase.text
        );


        const result =
        OpenAIAdapter_understand(
            request
        );


        Logger.log(
        "[OpenAI Holding Stage Result] " +
        JSON.stringify(
            result,
            null,
            2
        )
        );


        UnderstandingResultContract_validate(
        result
        );


        UnderstandingTest_assertEqualV2(
        result.intent.type,
        "update",
        testCase.field + " intent.type"
        );


        UnderstandingTest_assertEqualV2(
        result.view.name,
        "holding_condition",
        testCase.field + " view.name"
        );


        UnderstandingTest_assertEqualV2(
        result.change.field,
        testCase.field,
        testCase.field + " change.field"
        );


        UnderstandingTest_assertEqualV2(
        result.change.operation,
        "set",
        testCase.field + " change.operation"
        );


        UnderstandingTest_assertEqualV2(
        result.change.value,
        testCase.value,
        testCase.field + " change.value"
        );


        UnderstandingTest_assertEqualV2(
        result.change.unit,
        testCase.unit,
        testCase.field + " change.unit"
        );

    }
  );


  Logger.log(
    "[Passed] Version 2.0 OpenAI Holding Stages Update"
  );

}



function UnderstandingTest_validateVersion2HoldingStagesUpdateAdapterReady() {

  const cases = [

    {
      text:
        "ワンワンのP2を180MPaにして",
      field:
        "holding_pressure_p2",
      value:
        180,
      unit:
        "megapascal",
      targetField:
        "保圧力:P2"
    },

    {
      text:
        "ワンワンのT2を2秒にして",
      field:
        "holding_time_t2",
      value:
        2,
      unit:
        "second",
      targetField:
        "保圧時間:T2"
    },

    {
      text:
        "ワンワンのP3を150MPaにして",
      field:
        "holding_pressure_p3",
      value:
        150,
      unit:
        "megapascal",
      targetField:
        "保圧力:P3"
    },

    {
      text:
        "ワンワンのT3を3秒にして",
      field:
        "holding_time_t3",
      value:
        3,
      unit:
        "second",
      targetField:
        "保圧時間:T3"
    },

    {
      text:
        "ワンワンのP4を120MPaにして",
      field:
        "holding_pressure_p4",
      value:
        120,
      unit:
        "megapascal",
      targetField:
        "保圧力:P4"
    },

    {
      text:
        "ワンワンのT4を4秒にして",
      field:
        "holding_time_t4",
      value:
        4,
      unit:
        "second",
      targetField:
        "保圧時間:T4"
    }

  ];


  cases.forEach(
    function(testCase) {

      const result =
        UnderstandingTest_createVersion2StandardConditionUpdateResult(
          testCase.text,
          "ワンワン",
          testCase.field,
          testCase.value,
          testCase.unit,
          []
        );


      result.view.name =
        "holding_condition";


      const updateIntent =
        UpdateUnderstandingAdapter_convert(
          result
        );


      UnderstandingTest_assertEqualV2(
        updateIntent.status,
        "ready",
        testCase.field + " status"
      );


      UnderstandingTest_assertEqualV2(
        updateIntent.intentType,
        "update",
        testCase.field + " intentType"
      );


      UnderstandingTest_assertEqualV2(
        updateIntent.updateType,
        testCase.field,
        testCase.field + " updateType"
      );


      UnderstandingTest_assertEqualV2(
        updateIntent.targetField,
        testCase.targetField,
        testCase.field + " targetField"
      );


      UnderstandingTest_assertEqualV2(
        updateIntent.newValue,
        testCase.value,
        testCase.field + " newValue"
      );


      UnderstandingTest_assertEqualV2(
        updateIntent.unit,
        testCase.unit,
        testCase.field + " unit"
      );

    }
  );


  Logger.log(
    "[Passed] Version 2.0 Holding Stages Update Adapter Ready"
  );

}



function UnderstandingTest_validateVersion2OpenAIInstructionsInjectionStages() {

  const request =
    UnderstandingRequestContract_create(
      "ワンワンのV2を90mm/sにして"
    );


  const instructions =
    OpenAIAdapter_buildUnderstandingInstructions(
      request
    );


  const requiredTexts = [

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

    "millimeter",
    "millimeter_per_second"

  ];


  requiredTexts.forEach(
    function(text) {

      UnderstandingTest_assertTrueV2(
        instructions.indexOf(
          text
        ) !== -1,
        "Instructionsに" +
        text +
        "がありません。"
      );

    }
  );


  Logger.log(
    "[Passed] Version 2.0 OpenAI Instructions Injection Stages"
  );

}



function UnderstandingTest_runVersion2OpenAIInjectionStagesUpdate() {

  const cases = [

    {
      text: "ワンワンのV1を100mm/sにして",
      field: "injection_speed_v1",
      value: 100,
      unit: "millimeter_per_second"
    },

    {
      text: "ワンワンのS1を20mmにして",
      field: "injection_stroke_s1",
      value: 20,
      unit: "millimeter"
    },

    {
      text: "ワンワンのV2を90mm/sにして",
      field: "injection_speed_v2",
      value: 90,
      unit: "millimeter_per_second"
    },

    {
      text: "ワンワンのS2を30mmにして",
      field: "injection_stroke_s2",
      value: 30,
      unit: "millimeter"
    },

    {
      text: "ワンワンのV3を80mm/sにして",
      field: "injection_speed_v3",
      value: 80,
      unit: "millimeter_per_second"
    },

    {
      text: "ワンワンのS3を40mmにして",
      field: "injection_stroke_s3",
      value: 40,
      unit: "millimeter"
    },

    {
      text: "ワンワンのV4を70mm/sにして",
      field: "injection_speed_v4",
      value: 70,
      unit: "millimeter_per_second"
    },

    {
      text: "ワンワンのS4を50mmにして",
      field: "injection_stroke_s4",
      value: 50,
      unit: "millimeter"
    },

    {
      text: "ワンワンのV5を60mm/sにして",
      field: "injection_speed_v5",
      value: 60,
      unit: "millimeter_per_second"
    },

    {
      text: "ワンワンのS5を60mmにして",
      field: "injection_stroke_s5",
      value: 60,
      unit: "millimeter"
    }

  ];


  cases.forEach(
    function(testCase) {

      const request =
        UnderstandingRequestContract_create(
          testCase.text
        );


      const result =
        OpenAIAdapter_understand(
          request
        );


      Logger.log(
        "[OpenAI Injection Stage Result] " +
        JSON.stringify(
          result,
          null,
          2
        )
      );


      UnderstandingResultContract_validate(
        result
      );


      UnderstandingTest_assertEqualV2(
        result.intent.type,
        "update",
        testCase.field + " intent.type"
      );


      UnderstandingTest_assertEqualV2(
        result.knowledgeBoundary.type,
        "company_knowledge",
        testCase.field + " knowledgeBoundary.type"
      );


      UnderstandingTest_assertEqualV2(
        result.entity.query,
        "ワンワン",
        testCase.field + " entity.query"
      );


      UnderstandingTest_assertEqualV2(
        result.change.field,
        testCase.field,
        testCase.field + " change.field"
      );


      UnderstandingTest_assertEqualV2(
        result.change.operation,
        "set",
        testCase.field + " change.operation"
      );


      UnderstandingTest_assertEqualV2(
        result.change.value,
        testCase.value,
        testCase.field + " change.value"
      );


      UnderstandingTest_assertEqualV2(
        result.change.unit,
        testCase.unit,
        testCase.field + " change.unit"
      );

    }
  );


  Logger.log(
    "[Passed] Version 2.0 OpenAI Injection Stages Update"
  );

}



function UnderstandingTest_runVersion2OpenAIRampUpdate() {

  const cases = [

    {
      text:
        "ワンワンの速度徐変1をONにして",
      field:
        "injection_speed_ramp_1",
      value:
        true
    },

    {
      text:
        "ワンワンの保圧徐変1をOFFにして",
      field:
        "holding_ramp_1",
      value:
        false
    }

  ];


  cases.forEach(
    function(testCase) {

      const request =
        UnderstandingRequestContract_create(
          testCase.text
        );


      const result =
        OpenAIAdapter_understand(
          request
        );


      Logger.log(
        "[OpenAI Ramp Result]\n" +
        JSON.stringify(
          result,
          null,
          2
        )
      );


      const validated =
        UnderstandingResultContract_validate(
          result
        );


      UnderstandingTest_assertEqualV2(
        validated.intent.type,
        "update",
        testCase.field +
          " intent.type"
      );


      UnderstandingTest_assertEqualV2(
        validated.change.field,
        testCase.field,
        testCase.field +
          " change.field"
      );


      UnderstandingTest_assertEqualV2(
        validated.change.value,
        testCase.value,
        testCase.field +
          " change.value"
      );


      UnderstandingTest_assertEqualV2(
        validated.change.unit,
        null,
        testCase.field +
          " change.unit"
      );

    }
  );


  Logger.log(
    "[Passed] Version 2.0 OpenAI Ramp Update"
  );

}



function UnderstandingTest_runKMVS1Probe() {

  const request =
    UnderstandingRequestContract_create(
      "KMV-MC16X-022のS1を61.1mmにして"
    );


  const result =
    OpenAIAdapter_understand(
      request
    );


  Logger.log(
    "[KMV S1 Understanding Probe]\n" +
    JSON.stringify(
      result,
      null,
      2
    )
  );

}



function UnderstandingTest_runKMVEntityCandidatesProbe() {

  const candidates =
    resolveEntityCandidates(
      "KMV-MC16X-022"
    );


  Logger.log(
    "[KMV Entity Candidates Probe]\n" +
    JSON.stringify(
      candidates,
      null,
      2
    )
  );

}



function UnderstandingTest_runKMVLocalEntityProbe() {

  const question =
    "KMV-MC16X-022";


  const extractedKeyword =
    extractSearchKeyword(
      question
    );


  const normalizedKeyword =
    EntityResolution_normalizeText(
      extractedKeyword
    );


  const knowledge =
    loadEntityResolutionKnowledge();


  const matches =
    knowledge
      .map(
        function(item) {

          const normalizedAlias =
            EntityResolution_normalizeText(
              item.alias
            );


          return {

            matched:
              EntityResolution_isMatch(
                normalizedKeyword,
                normalizedAlias
              ),

            alias:
              item.alias,

            normalizedAlias:
              normalizedAlias,

            entityType:
              item.entityType,

            entityId:
              item.entityId,

            keyword:
              item.keyword,

            priority:
              item.priority,

            notes:
              item.notes

          };

        }
      )
      .filter(
        function(item) {

          return item.matched;

        }
      );


  Logger.log(
    "[KMV Local Entity Probe]"
  );


  Logger.log(
    JSON.stringify(
      {

        question:
          question,

        extractedKeyword:
          extractedKeyword,

        normalizedKeyword:
          normalizedKeyword,

        matchCount:
          matches.length,

        matches:
          matches

      },
      null,
      2
    )
  );

}