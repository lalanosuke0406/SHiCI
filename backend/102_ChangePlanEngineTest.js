/*
=========================================
SHiCI
102_ChangePlanEngineTest.js

Change Plan Engine
Version 1.0 Test

役割：
・Resolved Entity Mutationから
  Change Planが正しく生成されることを確認する
・現在Snapshotが変更されないことを確認する
・未解決Resolutionを拒否することを確認する
・Spreadsheetを更新せずに検証する

対象：
・product
・change_state
・standard_condition.mold_temperature
=========================================
*/


/*
=========================================
Test Runner
=========================================
*/

/**
 * Change Plan Engine Ver.1.0の
 * 全テストを実行する。
 */
function ChangePlanEngineTest_runAll() {

  const tests = [

    {
      name:
        "buildMoldTemperatureChangePlan",
      run:
        ChangePlanEngineTest_buildMoldTemperatureChangePlan
    },

    {
      name:
        "proposedSnapshotCreatesNextVersion",
      run:
        ChangePlanEngineTest_proposedSnapshotCreatesNextVersion
    },

    {
      name:
        "currentSnapshotIsPreserved",
      run:
        ChangePlanEngineTest_currentSnapshotIsPreserved
    },

    {
      name:
        "originalResolutionResultIsNotModified",
      run:
        ChangePlanEngineTest_originalResolutionResultIsNotModified
    },

    {
      name:
        "unresolvedResolutionIsRejected",
      run:
        ChangePlanEngineTest_unresolvedResolutionIsRejected
    }

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

      }

    }
  );


  if (
    failures.length >
      0
  ) {

    throw new Error(
      "Change Plan Engine Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[Change Plan Engine Ver.1.0 Test Passed]"
  );

}


/*
=========================================
正常系
=========================================
*/

/**
 * ワンワンの型温60℃を61℃へ変更する
 * Change Planが生成されることを確認する。
 */
function ChangePlanEngineTest_buildMoldTemperatureChangePlan() {

  const resolutionResult =
    ChangePlanEngineTest_createResolvedMutation();


  const changePlan =
    ChangePlanEngine_build(
      resolutionResult
    );


  ChangePlanEngineTest_assertEqual(
    changePlan.schemaVersion,
    "1.0",
    "schemaVersion"
  );


  ChangePlanEngineTest_assertEqual(
    changePlan.status,
    "ready_for_confirmation",
    "status"
  );


  ChangePlanEngineTest_assertEqual(
    changePlan.subject.entityType,
    "product",
    "subject.entityType"
  );


  ChangePlanEngineTest_assertEqual(
    changePlan.subject.entityId,
    "P-000035",
    "subject.entityId"
  );


  ChangePlanEngineTest_assertEqual(
    changePlan.subject.displayName,
    "LEVER, CLAMP",
    "subject.displayName"
  );


  ChangePlanEngineTest_assertEqual(
    changePlan.currentEntity.drawingNumber,
    "KLW-M374C-000",
    "currentEntity.drawingNumber"
  );


  ChangePlanEngineTest_assertEqual(
    changePlan.changes.length,
    1,
    "changes.length"
  );


  const change =
    changePlan.changes[0];


  ChangePlanEngineTest_assertEqual(
    change.changeType,
    "state",
    "change.changeType"
  );


  ChangePlanEngineTest_assertEqual(
    change.path,
    "standard_condition.mold_temperature",
    "change.path"
  );


  ChangePlanEngineTest_assertEqual(
    change.before,
    60,
    "change.before"
  );


  ChangePlanEngineTest_assertEqual(
    change.after,
    61,
    "change.after"
  );


  ChangePlanEngineTest_assertEqual(
    change.unit,
    "celsius",
    "change.unit"
  );


  ChangePlanEngineTest_assertEqual(
    changePlan.confirmation.required,
    true,
    "confirmation.required"
  );


  ChangePlanEngineTest_assertEqual(
    changePlan.confirmation.status,
    "pending",
    "confirmation.status"
  );


  ChangePlanEngineTest_assertEqual(
    changePlan.executable,
    false,
    "executable"
  );


  ChangePlanContract_validate(
    changePlan
  );

}


/**
 * Proposed Snapshotが、
 * 現在条件を親とした次版になることを確認する。
 */
function ChangePlanEngineTest_proposedSnapshotCreatesNextVersion() {

  const resolutionResult =
    ChangePlanEngineTest_createResolvedMutation();


  const changePlan =
    ChangePlanEngine_build(
      resolutionResult
    );


  ChangePlanEngineTest_assertEqual(
    changePlan.snapshotPlan.currentSnapshotId,
    "COND-000152",
    "snapshotPlan.currentSnapshotId"
  );


  ChangePlanEngineTest_assertEqual(
    changePlan.snapshotPlan.proposedSnapshotId,
    null,
    "snapshotPlan.proposedSnapshotId"
  );


  ChangePlanEngineTest_assertEqual(
    changePlan.snapshotPlan.preservationPolicy,
    "create_new_version",
    "snapshotPlan.preservationPolicy"
  );


  ChangePlanEngineTest_assertEqual(
    changePlan.snapshotPlan.preservesCurrentSnapshot,
    true,
    "snapshotPlan.preservesCurrentSnapshot"
  );


  ChangePlanEngineTest_assertEqual(
    changePlan.snapshotPlan.establishesAsCurrent,
    true,
    "snapshotPlan.establishesAsCurrent"
  );


  const proposedCondition =
    changePlan.proposedSnapshot.condition;


  ChangePlanEngineTest_assertEqual(
    proposedCondition["条件ID"],
    null,
    "proposedCondition.条件ID"
  );


  ChangePlanEngineTest_assertEqual(
    proposedCondition["親条件ID"],
    "COND-000152",
    "proposedCondition.親条件ID"
  );


  ChangePlanEngineTest_assertEqual(
    proposedCondition["版数"],
    5,
    "proposedCondition.版数"
  );


  ChangePlanEngineTest_assertEqual(
    proposedCondition["変更理由"],
    "ワンワンの型温を61℃にして",
    "proposedCondition.変更理由"
  );


  ChangePlanEngineTest_assertEqual(
    changePlan
      .proposedSnapshot
      .conditionDetail["金型温度(℃)"],
    61,
    "proposedSnapshot.conditionDetail.金型温度"
  );

}


/**
 * Current Snapshotが60℃のまま保持され、
 * Proposed Snapshotだけが61℃になることを確認する。
 */
function ChangePlanEngineTest_currentSnapshotIsPreserved() {

  const resolutionResult =
    ChangePlanEngineTest_createResolvedMutation();


  const changePlan =
    ChangePlanEngine_build(
      resolutionResult
    );


  ChangePlanEngineTest_assertEqual(
    changePlan
      .currentSnapshot
      .condition["条件ID"],
    "COND-000152",
    "currentSnapshot.condition.条件ID"
  );


  ChangePlanEngineTest_assertEqual(
    changePlan
      .currentSnapshot
      .conditionDetail["金型温度(℃)"],
    60,
    "currentSnapshot.conditionDetail.金型温度"
  );


  ChangePlanEngineTest_assertEqual(
    changePlan
      .proposedSnapshot
      .conditionDetail["金型温度(℃)"],
    61,
    "proposedSnapshot.conditionDetail.金型温度"
  );

}


/**
 * ChangePlanEngine_build()によって、
 * 元のResolution Resultが変更されないことを確認する。
 */
function ChangePlanEngineTest_originalResolutionResultIsNotModified() {

  const resolutionResult =
    ChangePlanEngineTest_createResolvedMutation();


  const originalJson =
    JSON.stringify(
      resolutionResult
    );


  ChangePlanEngine_build(
    resolutionResult
  );


  const afterJson =
    JSON.stringify(
      resolutionResult
    );


  ChangePlanEngineTest_assertEqual(
    afterJson,
    originalJson,
    "resolutionResult"
  );

}


/*
=========================================
異常系
=========================================
*/

/**
 * resolvedでないResolution Resultからは
 * Change Planを生成できないことを確認する。
 */
function ChangePlanEngineTest_unresolvedResolutionIsRejected() {

  const resolutionResult =
    ChangePlanEngineTest_createResolvedMutation();


  resolutionResult.status =
    "candidates";


  ChangePlanEngineTest_assertThrows(
    function() {

      ChangePlanEngine_build(
        resolutionResult
      );

    },
    "Change Planを生成するにはEntityがresolvedである必要があります。"
  );

}


/*
=========================================
Fixture
=========================================
*/

/**
 * 実データの「ワンワン」を解決した
 * Resolution Resultを生成する。
 *
 * Resolution EngineとSnapshot Engineは
 * 実際の読み取り処理を使用する。
 *
 * @return {Object}
 */
function ChangePlanEngineTest_createResolvedMutation() {

  const mutation =
    EntityMutationContract_createEmpty();


  mutation.mutationId =
    "MUTATION_CHANGE_PLAN_TEST_001";


  mutation.mutationType =
    "change_state";


  mutation.subject.entityType =
    "product";

  mutation.subject.entityId =
    null;

  mutation.subject.entityQuery =
    "ワンワン";


  mutation.stateChanges.push({

    path:
      "standard_condition.mold_temperature",

    currentValue:
      null,

    proposedValue:
      61,

    unit:
      "celsius",

    preservationPolicy:
      "create_new_version"

  });


  mutation.snapshotChange = {

    snapshotType:
      "condition",

    currentSnapshotId:
      null,

    proposedSnapshotId:
      null,

    preservationPolicy:
      "create_new_version"

  };


  mutation.events.push({

    eventType:
      "condition_change_requested",

    occurredAt:
      null,

    details: {

      field:
        "mold_temperature",

      currentValue:
        null,

      proposedValue:
        61,

      unit:
        "celsius"

    }

  });


  mutation.reason =
    "ワンワンの型温を61℃にして";


  mutation.metadata.source =
    "understanding_result";

  mutation.metadata.requestedBy =
    "USER_TEST_001";

  mutation.metadata.requestedAt =
    "2026-07-31T16:55:00+09:00";


  EntityMutationContract_validate(
    mutation
  );


  const resolutionResult =
    EntityMutationResolutionEngine_resolve(
      mutation
    );


  ChangePlanEngineTest_assertEqual(
    resolutionResult.status,
    "resolved",
    "resolutionResult.status"
  );


  ChangePlanEngineTest_assertEqual(
    resolutionResult.mutation.subject.entityId,
    "P-000035",
    "resolved productId"
  );


  return resolutionResult;

}


/*
=========================================
Assertion
=========================================
*/

function ChangePlanEngineTest_assertEqual(
  actual,
  expected,
  label
) {

  if (
    actual !==
      expected
  ) {

    throw new Error(
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


function ChangePlanEngineTest_assertThrows(
  callback,
  expectedMessage
) {

  let thrownError =
    null;


  try {

    callback();

  } catch (error) {

    thrownError =
      error;

  }


  if (
    thrownError ===
      null
  ) {

    throw new Error(
      "例外が発生する必要があります。expected=" +
      JSON.stringify(
        expectedMessage
      )
    );

  }


  const actualMessage =
    thrownError &&
    thrownError.message
      ? thrownError.message
      : String(
          thrownError
        );


  if (
    actualMessage.indexOf(
      expectedMessage
    ) ===
      -1
  ) {

    throw new Error(
      "例外メッセージが一致しません。expected=" +
      JSON.stringify(
        expectedMessage
      ) +
      " actual=" +
      JSON.stringify(
        actualMessage
      )
    );

  }

}


