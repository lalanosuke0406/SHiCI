/*
=========================================
SHiCI
120_UpdateTargetResolvedUnderstandingTest.js

Update Target Resolved Understanding Test
Version 1.0

役割：
・update_target_resolvedへ
  正式なUnderstanding Resultが保持されることを検証する
・直接確定経路と候補選択経路の両方を確認する
・Understanding Result原本の不変性を確認する

本番Spreadsheetは更新しない。
SnapshotEngineはテスト中だけOverrideする。
=========================================
*/


/*
=========================================
Test Runner
=========================================
*/

/**
 * Update Target Resolved Understandingの
 * 全テストを実行する。
 */
function test_UpdateTargetResolvedUnderstanding_runAll() {

  const tests = [

    {
      name:
        "directResolvedContainsUnderstandingResult",
      run:
        test_UpdateTargetResolvedUnderstanding_directResolvedContainsUnderstandingResult
    },

    {
        name:
            "coolingTimeDirectResolved",
        run:
            test_UpdateTargetResolvedUnderstanding_coolingTimeDirectResolved
    },

    {
      name:
        "candidateSelectionRestoresUnderstandingResult",
      run:
        test_UpdateTargetResolvedUnderstanding_candidateSelectionRestoresUnderstandingResult
    },

    {
        name:
            "coolingTimeCandidateSelectionRestoresUnderstandingResult",
        run:
            test_UpdateTargetResolvedUnderstanding_coolingTimeCandidateSelectionRestoresUnderstandingResult
    },

    {
      name:
        "understandingResultIsNotModified",
      run:
        test_UpdateTargetResolvedUnderstanding_understandingResultIsNotModified
    }

  ];


  const failures =
    [];


  console.log(
    "========================================="
  );

  console.log(
    "UpdateTargetResolved Understanding Test Start"
  );

  console.log(
    "========================================="
  );


  tests.forEach(
    function(test) {

      try {

        UpdateTargetResolvedUnderstandingTest_clearEnvironment();


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
              : String(
                  error
                )

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

      } finally {

        UpdateTargetResolvedUnderstandingTest_clearEnvironment();

      }

    }
  );


  if (
    failures.length >
      0
  ) {

    throw new Error(
      "UpdateTargetResolved Understanding Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[Update Target Resolved Understanding Ver.1.0 Test Passed]"
  );

}


/*
=========================================
Direct Resolution
=========================================
*/

/**
 * Entityが直接1件に確定した場合の
 * update_target_resolvedへ、
 * 正式なUnderstanding Resultが含まれることを確認する。
 */
function test_UpdateTargetResolvedUnderstanding_directResolvedContainsUnderstandingResult() {

  const understandingResult =
    UpdateTargetResolvedUnderstandingTest_createUnderstandingResult(
      "ワンワン",
      61
    );


  const updateIntent =
    UpdateUnderstandingAdapter_convert(
      understandingResult
    );


  const entity =
    UpdateTargetResolvedUnderstandingTest_createProductEntity();


  UpdateTargetResolvedUnderstandingTest_setSnapshotOverride();


  /*
   * 本体修正後は、第3引数として
   * Understanding Resultを渡す。
   */
  const result =
    UnderstandingEngine_buildUpdateTargetResult(
      entity,
      updateIntent,
      understandingResult
    );


  UpdateTargetResolvedUnderstandingTest_validateResolvedResult(
    result,
    understandingResult,
    61
  );

}








/**
 * 冷却時間の更新要求が直接1件に確定した場合、
 * update_target_resolvedへ正しく変換されることを確認する。
 */
function test_UpdateTargetResolvedUnderstanding_coolingTimeDirectResolved() {

  const understandingResult =
    UpdateTargetResolvedUnderstandingTest_createCoolingTimeUnderstandingResult(
      "ワンワン",
      9
    );


  const updateIntent =
    UpdateUnderstandingAdapter_convert(
      understandingResult
    );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    "ready",
    updateIntent.status,
    "updateIntent.status"
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    "cooling_time",
    updateIntent.updateType,
    "updateIntent.updateType"
  );


  const entity =
    UpdateTargetResolvedUnderstandingTest_createProductEntity();


  UpdateTargetResolvedUnderstandingTest_setSnapshotOverride();


  const result =
    UnderstandingEngine_buildUpdateTargetResult(
      entity,
      updateIntent,
      understandingResult
    );


  UpdateTargetResolvedUnderstandingTest_assertObject(
    result,
    "result"
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    "update_target_resolved",
    result.messageType,
    "result.messageType"
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    "cooling_time",
    result.updateType,
    "result.updateType"
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    9,
    result.proposedValue.value,
    "result.proposedValue.value"
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    "second",
    result.proposedValue.canonicalUnit,
    "result.proposedValue.canonicalUnit"
  );


  UpdateTargetResolvedUnderstandingTest_assertDeepEquals(
    understandingResult,
    result.understandingResult,
    "result.understandingResult"
  );

}












/*
=========================================
Candidate Selection
=========================================
*/

/**
 * 複数候補からEntityを選択した場合に、
 * Conversation Stateへ保存されたUnderstanding Resultが
 * update_target_resolvedへ復元されることを確認する。
 */
function test_UpdateTargetResolvedUnderstanding_candidateSelectionRestoresUnderstandingResult() {

  const sessionId =
    "SESSION-UPDATE-TARGET-UNDERSTANDING-" +
    Utilities
      .getUuid()
      .replace(
        /-/g,
        ""
      );


  UpdateTargetResolvedUnderstandingTest_sessionIds.push(
    sessionId
  );


  const understandingResult =
    UpdateTargetResolvedUnderstandingTest_createUnderstandingResult(
      "ワンワン",
      62
    );


  const entity =
    UpdateTargetResolvedUnderstandingTest_createProductEntity();


  /*
   * 更新候補が複数提示された直後の
   * Conversation Stateを再現する。
   */
  saveConversationState(
    sessionId,
    {

      currentEntity:
        null,

      currentView: {

        keyword:
          "",

        view:
          "mold_temperature",

        priority:
          0,

        notes:
          "Understanding Result Ver.2.0"

      },

      candidateEntities: [

        entity,

        {

          entityType:
            "product",

          entityId:
            "P-TEST-OTHER",

          alias:
            "別候補",

          keyword:
            "OTHER PRODUCT",

          priority:
            2,

          notes:
            "Test Candidate"

        }

      ],

      pendingUpdateIntent: {

        updateType:
          "mold_temperature",

        targetField:
          "金型温度(℃)",

        newValue:
          62,

        unit:
          "℃",

        originalText:
          understandingResult.originalText,

        understandingResult:
          UpdateTargetResolvedUnderstandingTest_deepCopy(
            understandingResult
          )

      }

    }
  );


  UpdateTargetResolvedUnderstandingTest_setSnapshotOverride();


  const result =
    ConversationStateEngine_selectCandidate(
      entity.entityId,
      entity.entityType,
      sessionId
    );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    "success",
    result.status,
    "result.status"
  );


  UpdateTargetResolvedUnderstandingTest_validateResolvedResult(
    result,
    understandingResult,
    62
  );


  /*
   * 候補選択完了後は、
   * Pending Update Intentが消費されている。
   */
  const stateAfterSelection =
    getConversationState(
      sessionId
    );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    null,
    stateAfterSelection.pendingUpdateIntent,
    "stateAfterSelection.pendingUpdateIntent"
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    0,
    stateAfterSelection.candidateEntities.length,
    "stateAfterSelection.candidateEntities.length"
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    entity.entityId,
    stateAfterSelection.currentEntity.entityId,
    "stateAfterSelection.currentEntity.entityId"
  );

}









/**
 * 冷却時間の更新要求で候補が複数になった場合、
 * 候補選択後にUnderstanding Resultと
 * Update Intentが正しく復元されることを確認する。
 */
function test_UpdateTargetResolvedUnderstanding_coolingTimeCandidateSelectionRestoresUnderstandingResult() {

  const sessionId =
    "UPDATE_TARGET_RESOLVED_COOLING_TIME_CANDIDATE_TEST_" +
    new Date().getTime();


  UpdateTargetResolvedUnderstandingTest_sessionIds.push(
    sessionId
  );


  const understandingResult =
    UpdateTargetResolvedUnderstandingTest_createCoolingTimeUnderstandingResult(
      "ワンワン",
      9
    );


  const state =
    getConversationState(
      sessionId
    );


  state.candidateEntities = [

    UpdateTargetResolvedUnderstandingTest_createProductEntity()

  ];


  state.pendingUpdateIntent = {

    updateType:
      "cooling_time",

    targetField:
      "冷却時間",

    newValue:
      9,

    unit:
      "秒",

    originalText:
      understandingResult.input.originalText,

    understandingResult:
      JSON.parse(
        JSON.stringify(
          understandingResult
        )
      )

  };


  saveConversationState(
    sessionId,
    state
  );


  UpdateTargetResolvedUnderstandingTest_setSnapshotOverride();


  const result =
    ConversationStateEngine_selectCandidate(
      "P-000035",
      "product",
      sessionId
    );


  UpdateTargetResolvedUnderstandingTest_assertObject(
    result,
    "result"
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    "success",
    result.status,
    "result.status"
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    "update_target_resolved",
    result.messageType,
    "result.messageType"
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    "cooling_time",
    result.updateType,
    "result.updateType"
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    "冷却時間",
    result.proposedValue.field,
    "result.proposedValue.field"
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    9,
    result.proposedValue.value,
    "result.proposedValue.value"
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    "秒",
    result.proposedValue.unit,
    "result.proposedValue.unit"
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    "second",
    result.proposedValue.canonicalUnit,
    "result.proposedValue.canonicalUnit"
  );


  UpdateTargetResolvedUnderstandingTest_assertDeepEquals(
    understandingResult,
    result.understandingResult,
    "result.understandingResult"
  );

}














/*
=========================================
Input Immutability
=========================================
*/

/**
 * update_target_resolved生成によって、
 * Understanding Result原本が変更されないことを確認する。
 */
function test_UpdateTargetResolvedUnderstanding_understandingResultIsNotModified() {

  const understandingResult =
    UpdateTargetResolvedUnderstandingTest_createUnderstandingResult(
      "ワンワン",
      63
    );


  const originalJson =
    JSON.stringify(
      understandingResult
    );


  const updateIntent =
    UpdateUnderstandingAdapter_convert(
      understandingResult
    );


  UpdateTargetResolvedUnderstandingTest_setSnapshotOverride();


  UnderstandingEngine_buildUpdateTargetResult(
    UpdateTargetResolvedUnderstandingTest_createProductEntity(),
    updateIntent,
    understandingResult
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    originalJson,
    JSON.stringify(
      understandingResult
    ),
    "understandingResult"
  );

}


/*
=========================================
Resolved Result Validation
=========================================
*/

/**
 * update_target_resolvedと、
 * 内包されたUnderstanding Resultを検証する。
 *
 * @param {Object} result
 * @param {Object} expectedUnderstandingResult
 * @param {number} expectedValue
 */
function UpdateTargetResolvedUnderstandingTest_validateResolvedResult(
  result,
  expectedUnderstandingResult,
  expectedValue
) {

  UpdateTargetResolvedUnderstandingTest_assertObject(
    result,
    "result"
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    "update_target_resolved",
    result.messageType,
    "result.messageType"
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    "mold_temperature",
    result.updateType,
    "result.updateType"
  );


  UpdateTargetResolvedUnderstandingTest_assertObject(
    result.target,
    "result.target"
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    "product",
    result.target.entityType,
    "result.target.entityType"
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    "P-000035",
    result.target.entityId,
    "result.target.entityId"
  );


  UpdateTargetResolvedUnderstandingTest_assertObject(
    result.proposedValue,
    "result.proposedValue"
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    expectedValue,
    result.proposedValue.value,
    "result.proposedValue.value"
  );


  /*
  =========================================
  Understanding Result
  =========================================
  */

  UpdateTargetResolvedUnderstandingTest_assertObject(
    result.understandingResult,
    "result.understandingResult"
  );


  UnderstandingResultContract_validate(
    result.understandingResult
  );


  UpdateTargetResolvedUnderstandingTest_assertDeepEquals(
    expectedUnderstandingResult,
    result.understandingResult,
    "result.understandingResult"
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    "update",
    result.understandingResult.intent.type,
    "understandingResult.intent.type"
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    "product",
    result
      .understandingResult
      .entity
      .entityTypeHint,
    "understandingResult.entity.entityTypeHint"
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    "mold_temperature",
    result
      .understandingResult
      .change
      .field,
    "understandingResult.change.field"
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    "set",
    result
      .understandingResult
      .change
      .operation,
    "understandingResult.change.operation"
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    expectedValue,
    result
      .understandingResult
      .change
      .value,
    "understandingResult.change.value"
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    "celsius",
    result
      .understandingResult
      .change
      .unit,
    "understandingResult.change.unit"
  );


  UpdateTargetResolvedUnderstandingTest_assertEquals(
    expectedUnderstandingResult.originalText,
    result.understandingResult.originalText,
    "understandingResult.originalText"
  );

}






/**
 * 冷却時間更新を表す
 * Understanding Result Ver.2.0を生成する。
 *
 * @param {string} entityQuery
 * @param {number} value
 * @return {Object}
 */
function UpdateTargetResolvedUnderstandingTest_createCoolingTimeUnderstandingResult(
  entityQuery,
  value
) {

  const originalText =
    String(
      entityQuery
    ) +
    "の冷却時間を" +
    String(
      value
    ) +
    "秒にして";


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
    "cooling_time";

  result.change.field =
    "cooling_time";

  result.change.operation =
    "set";

  result.change.value =
    value;

  result.change.unit =
    "second";

  result.missingFields =
    [];

  result.memory.decision =
    "none";

  result.knowledgeBoundary.type =
    "company_knowledge";

  result.resolution.required =
    true;


  UnderstandingResultContract_validate(
    result
  );


  return result;

}










/*
=========================================
Understanding Result Fixture
=========================================
*/

/**
 * 金型温度更新を表す
 * Understanding Result Ver.2.0を生成する。
 *
 * @param {string} entityQuery
 * @param {number} value
 * @return {Object}
 */
function UpdateTargetResolvedUnderstandingTest_createUnderstandingResult(
  entityQuery,
  value
) {

  const originalText =
    String(
      entityQuery
    ) +
    "の型温を" +
    String(
      value
    ) +
    "℃にして";


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
    value;


  result.change.unit =
    "celsius";


  result.missingFields =
    [];


  result.memory.decision =
    "none";


  result.knowledgeBoundary.type =
    "company_knowledge";


  result.resolution.required =
    true;


  UnderstandingResultContract_validate(
    result
  );


  return result;

}


/*
=========================================
Entity Fixture
=========================================
*/

/**
 * Test Product Entityを生成する。
 *
 * @return {Object}
 */
function UpdateTargetResolvedUnderstandingTest_createProductEntity() {

  return {

    entityType:
      "product",

    entityId:
      "P-000035",

    alias:
      "ワンワン",

    keyword:
      "LEVER, CLAMP",

    priority:
      1,

    notes:
      "社内通称"

  };

}


/*
=========================================
Snapshot Override
=========================================
*/

let UpdateTargetResolvedUnderstandingTest_originalSnapshotGetter =
  null;


let UpdateTargetResolvedUnderstandingTest_sessionIds =
  [];


/**
 * SnapshotEngine_getProductSnapshotを
 * Fake Snapshotへ差し替える。
 */
function UpdateTargetResolvedUnderstandingTest_setSnapshotOverride() {

  if (
    UpdateTargetResolvedUnderstandingTest_originalSnapshotGetter ===
      null
  ) {

    UpdateTargetResolvedUnderstandingTest_originalSnapshotGetter =
      SnapshotEngine_getProductSnapshot;

  }


  SnapshotEngine_getProductSnapshot =
    function(productId) {

      UpdateTargetResolvedUnderstandingTest_assertEquals(
        "P-000035",
        productId,
        "Snapshot productId"
      );


      return {

        status:
          "success",

        product: {

          "製品ID":
            "P-000035",

          "製品名":
            "LEVER, CLAMP",

          "図番":
            "KLW-M374C-000",

          "現在標準条件ID":
            "COND-000152"

        },

        condition: {

          "条件ID":
            "COND-000152",

          "製品ID":
            "P-000035",

          "状態":
            "標準"

        },

        conditionDetail: {

          "条件ID":
            "COND-000152",

          "金型温度(℃)":
            60,

          "冷却時間":
            8

        

        }

      };

    };

}


/**
 * Test OverrideとConversation Stateを解除する。
 */
function UpdateTargetResolvedUnderstandingTest_clearEnvironment() {

  if (
    UpdateTargetResolvedUnderstandingTest_originalSnapshotGetter !==
      null
  ) {

    SnapshotEngine_getProductSnapshot =
      UpdateTargetResolvedUnderstandingTest_originalSnapshotGetter;


    UpdateTargetResolvedUnderstandingTest_originalSnapshotGetter =
      null;

  }


  UpdateTargetResolvedUnderstandingTest_sessionIds.forEach(
    function(sessionId) {

      clearConversationState(
        sessionId
      );

    }
  );


  UpdateTargetResolvedUnderstandingTest_sessionIds =
    [];

}


/*
=========================================
Assertions
=========================================
*/

function UpdateTargetResolvedUnderstandingTest_assertEquals(
  expected,
  actual,
  label
) {

  if (
    expected !==
      actual
  ) {

    throw new Error(
      "[AssertEquals Failed] " +
      label +
      " expected=" +
      JSON.stringify(
        expected
      ) +
      " actual=" +
      JSON.stringify(
        actual
      )
    );

  }

}


function UpdateTargetResolvedUnderstandingTest_assertDeepEquals(
  expected,
  actual,
  label
) {

  const expectedJson =
    JSON.stringify(
      expected
    );


  const actualJson =
    JSON.stringify(
      actual
    );


  if (
    expectedJson !==
      actualJson
  ) {

    throw new Error(
      "[AssertDeepEquals Failed] " +
      label +
      " expected=" +
      expectedJson +
      " actual=" +
      actualJson
    );

  }

}


function UpdateTargetResolvedUnderstandingTest_assertObject(
  actual,
  label
) {

  if (
    actual ===
      null ||
    typeof actual !==
      "object" ||
    Array.isArray(
      actual
    )
  ) {

    throw new Error(
      "[AssertObject Failed] " +
      label +
      " actual=" +
      JSON.stringify(
        actual
      )
    );

  }

}


function UpdateTargetResolvedUnderstandingTest_deepCopy(
  value
) {

  return JSON.parse(
    JSON.stringify(
      value
    )
  );

}