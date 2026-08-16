/*
=========================================
SHiCI
96_ProductMutationAdapterTest.js

Product Mutation Adapter
Version 1.0 Test

役割：
・Understanding Result Ver.2.0から
  Entity Mutation Ver.1.0への変換を確認する

対象：
・製品の標準成形条件における
  金型温度変更要求

禁止：
・OpenAI APIを呼び出さない
・Entity Resolutionを行わない
・Spreadsheetを更新しない
・Mutationを永続化しない
=========================================
*/


/*
=========================================
Test Runner
=========================================
*/

/**
 * 全テストを実行する。
 */
function ProductMutationAdapterTest_runAll() {

  const tests = [

    {
      name:
        "validMoldTemperature",
      run:
        ProductMutationAdapterTest_validMoldTemperature
    },

    {
      name:
        "trimEntityQuery",
      run:
        ProductMutationAdapterTest_trimEntityQuery
    },

    {
      name:
        "defaultCelsiusUnit",
      run:
        ProductMutationAdapterTest_defaultCelsiusUnit
    },

    {
      name:
        "copyMissingFields",
      run:
        ProductMutationAdapterTest_copyMissingFields
    },

    {
      name:
        "nonUpdateReturnsNull",
      run:
        ProductMutationAdapterTest_nonUpdateReturnsNull
    },

    {
      name:
        "generalKnowledgeReturnsNull",
      run:
        ProductMutationAdapterTest_generalKnowledgeReturnsNull
    },

    {
      name:
        "nonProductReturnsNull",
      run:
        ProductMutationAdapterTest_nonProductReturnsNull
    },


  ];


  const failures =
    [];


  tests.forEach(
    function(test) {

      try {

        test.run();

        console.log(
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
      "Product Mutation Adapter Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[Product Mutation Adapter Ver.1.0 Test Passed]"
  );

}


/*
=========================================
正常系
=========================================
*/

/**
 * 金型温度変更要求が
 * change_state Mutationへ変換されることを確認する。
 */
function ProductMutationAdapterTest_validMoldTemperature() {

  const understandingResult =
    ProductMutationAdapterTest_createUnderstandingResult(
      "ワンワンの型温を61℃にして",
      "ワンワン",
      61,
      "celsius"
    );


  const mutation =
    ProductMutationAdapter_convert(
      understandingResult
    );


  ProductMutationAdapterTest_assertNotNull(
    mutation,
    "mutation"
  );


  ProductMutationAdapterTest_assertEqual(
    mutation.schemaVersion,
    "1.0",
    "schemaVersion"
  );


  ProductMutationAdapterTest_assertEqual(
    mutation.mutationType,
    "change_state",
    "mutationType"
  );


  ProductMutationAdapterTest_assertEqual(
    mutation.subject.entityType,
    "product",
    "subject.entityType"
  );


  ProductMutationAdapterTest_assertEqual(
    mutation.subject.entityId,
    null,
    "subject.entityId"
  );


  ProductMutationAdapterTest_assertEqual(
    mutation.subject.entityQuery,
    "ワンワン",
    "subject.entityQuery"
  );


  ProductMutationAdapterTest_assertEqual(
    mutation.stateChanges.length,
    1,
    "stateChanges.length"
  );


  const stateChange =
    mutation.stateChanges[0];


  ProductMutationAdapterTest_assertEqual(
    stateChange.path,
    "standard_condition.mold_temperature",
    "stateChange.path"
  );


  ProductMutationAdapterTest_assertEqual(
    stateChange.currentValue,
    null,
    "stateChange.currentValue"
  );


  ProductMutationAdapterTest_assertEqual(
    stateChange.proposedValue,
    61,
    "stateChange.proposedValue"
  );


  ProductMutationAdapterTest_assertEqual(
    stateChange.unit,
    "celsius",
    "stateChange.unit"
  );


  ProductMutationAdapterTest_assertEqual(
    stateChange.preservationPolicy,
    "create_new_version",
    "stateChange.preservationPolicy"
  );


  ProductMutationAdapterTest_assertNotNull(
    mutation.snapshotChange,
    "snapshotChange"
  );


  ProductMutationAdapterTest_assertEqual(
    mutation.snapshotChange.snapshotType,
    "condition",
    "snapshotChange.snapshotType"
  );


  ProductMutationAdapterTest_assertEqual(
    mutation.snapshotChange.currentSnapshotId,
    null,
    "snapshotChange.currentSnapshotId"
  );


  ProductMutationAdapterTest_assertEqual(
    mutation.snapshotChange.proposedSnapshotId,
    null,
    "snapshotChange.proposedSnapshotId"
  );


  ProductMutationAdapterTest_assertEqual(
    mutation.snapshotChange.preservationPolicy,
    "create_new_version",
    "snapshotChange.preservationPolicy"
  );


  ProductMutationAdapterTest_assertEqual(
    mutation.events.length,
    1,
    "events.length"
  );


  ProductMutationAdapterTest_assertEqual(
    mutation.events[0].eventType,
    "condition_change_requested",
    "events[0].eventType"
  );


  ProductMutationAdapterTest_assertEqual(
    mutation.reason,
    "ワンワンの型温を61℃にして",
    "reason"
  );


  ProductMutationAdapterTest_assertEqual(
    mutation.metadata.source,
    "understanding_result",
    "metadata.source"
  );


  /*
   * Adapter出力そのものが
   * Entity Mutation Contractを満たすことを確認する。
   */
  EntityMutationContract_validate(
    mutation
  );

}


/**
 * Entity Queryの前後空白が
 * 除去されることを確認する。
 */
function ProductMutationAdapterTest_trimEntityQuery() {

  const understandingResult =
    ProductMutationAdapterTest_createUnderstandingResult(
      "ワンワンの型温を61℃にして",
      "  ワンワン  ",
      61,
      "celsius"
    );


  const mutation =
    ProductMutationAdapter_convert(
      understandingResult
    );


  ProductMutationAdapterTest_assertEqual(
    mutation.subject.entityQuery,
    "ワンワン",
    "subject.entityQuery"
  );

}


/**
 * Unitが指定されていない場合に
 * celsiusが使用されることを確認する。
 */
function ProductMutationAdapterTest_defaultCelsiusUnit() {

  const understandingResult =
    ProductMutationAdapterTest_createUnderstandingResult(
      "ワンワンの型温を61度にして",
      "ワンワン",
      61,
      null
    );


  const mutation =
    ProductMutationAdapter_convert(
      understandingResult
    );


  ProductMutationAdapterTest_assertEqual(
    mutation.stateChanges[0].unit,
    "celsius",
    "stateChanges[0].unit"
  );


  ProductMutationAdapterTest_assertEqual(
    mutation.events[0].details.unit,
    "celsius",
    "events[0].details.unit"
  );

}


/**
 * missingFieldsが参照共有されず、
 * 別Arrayとして複製されることを確認する。
 */
function ProductMutationAdapterTest_copyMissingFields() {

  const understandingResult =
    ProductMutationAdapterTest_createUnderstandingResult(
      "ワンワンの型温を変更して",
      "ワンワン",
      null,
      null
    );


  understandingResult.missingFields = [
    "change.value"
  ];


  const mutation =
    ProductMutationAdapter_convert(
      understandingResult
    );


  ProductMutationAdapterTest_assertArrayEqual(
    mutation.missingFields,
    [
      "change.value"
    ],
    "mutation.missingFields"
  );


  ProductMutationAdapterTest_assertTrue(
    mutation.missingFields !==
      understandingResult.missingFields,
    "missingFieldsが同一Arrayを参照しています。"
  );


  mutation.missingFields.push(
    "test.field"
  );


  ProductMutationAdapterTest_assertArrayEqual(
    understandingResult.missingFields,
    [
      "change.value"
    ],
    "understandingResult.missingFields"
  );

}


/*
=========================================
対象外判定
=========================================
*/

/**
 * Update以外のIntentでは
 * Mutationを生成しないことを確認する。
 */
function ProductMutationAdapterTest_nonUpdateReturnsNull() {

  const understandingResult =
    ProductMutationAdapterTest_createUnderstandingResult(
      "ワンワンの型温は？",
      "ワンワン",
      null,
      null
    );


  understandingResult.intent.type =
    "question";

  understandingResult.change.field =
    null;

  understandingResult.change.operation =
    null;

  understandingResult.change.value =
    null;

  understandingResult.change.unit =
    null;


  const mutation =
    ProductMutationAdapter_convert(
      understandingResult
    );


  ProductMutationAdapterTest_assertEqual(
    mutation,
    null,
    "mutation"
  );

}


/**
 * 一般知識の質問では
 * Mutationを生成しないことを確認する。
 */
function ProductMutationAdapterTest_generalKnowledgeReturnsNull() {

  const understandingResult =
    ProductMutationAdapterTest_createUnderstandingResult(
      "一般的な金型温度について教えて",
      null,
      null,
      null
    );


  understandingResult.intent.type =
    "question";

  understandingResult.knowledgeBoundary.type =
    "general_knowledge";

  understandingResult.resolution.required =
    false;

  understandingResult.change.field =
    null;

  understandingResult.change.operation =
    null;

  understandingResult.change.value =
    null;

  understandingResult.change.unit =
    null;


  const mutation =
    ProductMutationAdapter_convert(
      understandingResult
    );


  ProductMutationAdapterTest_assertEqual(
    mutation,
    null,
    "mutation"
  );

}


/**
 * Product以外のEntity Typeでは
 * Mutationを生成しないことを確認する。
 */
function ProductMutationAdapterTest_nonProductReturnsNull() {

  const understandingResult =
    ProductMutationAdapterTest_createUnderstandingResult(
      "20t-3号機の型温を61℃にして",
      "20t-3号機",
      61,
      "celsius"
    );


  understandingResult.entity.entityTypeHint =
    "machine";


  const mutation =
    ProductMutationAdapter_convert(
      understandingResult
    );


  ProductMutationAdapterTest_assertEqual(
    mutation,
    null,
    "mutation"
  );

}




/*
=========================================
Fixture
=========================================
*/

/**
 * 金型温度変更要求を表す
 * Understanding Result Ver.2.0を生成する。
 *
 * @param {string} originalText
 * @param {string|null} entityQuery
 * @param {*|null} proposedValue
 * @param {string|null} unit
 * @return {Object}
 */
function ProductMutationAdapterTest_createUnderstandingResult(
  originalText,
  entityQuery,
  proposedValue,
  unit
) {

  const result =
    UnderstandingResultContract_create(
      originalText
    );


  result.communication.type =
    "none";

  result.intent.type =
    "update";

  result.conversation.action =
    "new";

  result.entity.query =
    entityQuery;

  result.entity.entityTypeHint =
    "product";

  result.view.name =
    "mold_temperature";

  result.change.field =
    "mold_temperature";

  result.change.operation =
    "set";

  result.change.value =
    proposedValue;

  result.change.unit =
    unit;

  result.missingFields =
    [];

  result.memory.decision =
    "none";

  result.knowledgeBoundary.type =
    "company_knowledge";

  result.resolution.required =
    entityQuery !==
      null;


  return result;

}


/*
=========================================
Assertion
=========================================
*/

/**
 * 厳密比較を行う。
 */
function ProductMutationAdapterTest_assertEqual(
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
      "が一致しません。" +
      " expected=" +
      JSON.stringify(
        expected
      ) +
      ", actual=" +
      JSON.stringify(
        actual
      )
    );

  }

}


/**
 * nullまたはundefinedでないことを確認する。
 */
function ProductMutationAdapterTest_assertNotNull(
  value,
  fieldName
) {

  if (
    value ===
      null ||
    value ===
      undefined
  ) {

    throw new Error(
      fieldName +
      "はnullまたはundefinedであってはなりません。"
    );

  }

}


/**
 * 条件がtrueであることを確認する。
 */
function ProductMutationAdapterTest_assertTrue(
  condition,
  message
) {

  if (
    condition !==
      true
  ) {

    throw new Error(
      message
    );

  }

}


/**
 * Arrayの内容を順序付きで比較する。
 */
function ProductMutationAdapterTest_assertArrayEqual(
  actual,
  expected,
  fieldName
) {

  if (
    !Array.isArray(
      actual
    ) ||
    !Array.isArray(
      expected
    )
  ) {

    throw new Error(
      fieldName +
      "はArrayである必要があります。"
    );

  }


  if (
    actual.length !==
      expected.length
  ) {

    throw new Error(
      fieldName +
      "の要素数が一致しません。" +
      " expected=" +
      JSON.stringify(
        expected
      ) +
      ", actual=" +
      JSON.stringify(
        actual
      )
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
        fieldName +
        "が一致しません。" +
        " expected=" +
        JSON.stringify(
          expected
        ) +
        ", actual=" +
        JSON.stringify(
          actual
        )
      );

    }

  }

}









/**
 * 保圧力P1変更要求が
 * change_state Mutationへ変換されることを確認する。
 */
function ProductMutationAdapterTest_validHoldingPressureP1() {

  const understandingResult =
    ProductMutationAdapterTest_createUnderstandingResult(
      "ワンワンのP1を30MPaにして",
      "ワンワン",
      30,
      "megapascal"
    );


  /*
   * 既存Fixtureは金型温度用なので、
   * 今回のFieldだけ明示的に上書きする。
   */
  understandingResult.view.name =
    null;

  understandingResult.change.field =
    "holding_pressure_p1";


  const mutation =
    ProductMutationAdapter_convert(
      understandingResult
    );


  ProductMutationAdapterTest_assertNotNull(
    mutation,
    "mutation"
  );


  ProductMutationAdapterTest_assertEqual(
    mutation.mutationType,
    "change_state",
    "mutationType"
  );


  ProductMutationAdapterTest_assertEqual(
    mutation.stateChanges.length,
    1,
    "stateChanges.length"
  );


  const stateChange =
    mutation.stateChanges[0];


  ProductMutationAdapterTest_assertEqual(
    stateChange.path,
    "standard_condition.holding_pressure_p1",
    "stateChange.path"
  );


  ProductMutationAdapterTest_assertEqual(
    stateChange.proposedValue,
    30,
    "stateChange.proposedValue"
  );


  ProductMutationAdapterTest_assertEqual(
    stateChange.unit,
    "megapascal",
    "stateChange.unit"
  );


  ProductMutationAdapterTest_assertEqual(
    stateChange.preservationPolicy,
    "create_new_version",
    "stateChange.preservationPolicy"
  );


  EntityMutationContract_validate(
    mutation
  );


  Logger.log(
    "[Passed] Product Mutation Adapter Holding Pressure P1"
  );

}



/**
 * 保圧時間T1変更要求が
 * change_state Mutationへ変換されることを確認する。
 */
function ProductMutationAdapterTest_validHoldingTimeT1() {

  const understandingResult =
    ProductMutationAdapterTest_createUnderstandingResult(
      "ワンワンのT1を9秒にして",
      "ワンワン",
      9,
      "second"
    );


  /*
   * 既存Fixtureは金型温度用なので、
   * 今回のViewとFieldだけ明示的に上書きする。
   */
  understandingResult.view.name =
    "holding_condition";

  understandingResult.change.field =
    "holding_time_t1";


  const mutation =
    ProductMutationAdapter_convert(
      understandingResult
    );


  ProductMutationAdapterTest_assertNotNull(
    mutation,
    "mutation"
  );


  ProductMutationAdapterTest_assertEqual(
    mutation.mutationType,
    "change_state",
    "mutationType"
  );


  ProductMutationAdapterTest_assertEqual(
    mutation.stateChanges.length,
    1,
    "stateChanges.length"
  );


  const stateChange =
    mutation.stateChanges[0];


  ProductMutationAdapterTest_assertEqual(
    stateChange.path,
    "standard_condition.holding_time_t1",
    "stateChange.path"
  );


  ProductMutationAdapterTest_assertEqual(
    stateChange.proposedValue,
    9,
    "stateChange.proposedValue"
  );


  ProductMutationAdapterTest_assertEqual(
    stateChange.unit,
    "second",
    "stateChange.unit"
  );


  ProductMutationAdapterTest_assertEqual(
    stateChange.preservationPolicy,
    "create_new_version",
    "stateChange.preservationPolicy"
  );


  EntityMutationContract_validate(
    mutation
  );


  Logger.log(
    "[Passed] Product Mutation Adapter Holding Time T1"
  );

}