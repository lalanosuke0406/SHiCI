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
            "buildHoldingPressureP1ChangePlan",
        run:
            ChangePlanEngineTest_buildHoldingPressureP1ChangePlan
    },

    {
        name:
            "buildHoldingTimeT1ChangePlan",
        run:
            ChangePlanEngineTest_buildHoldingTimeT1ChangePlan
    },

    {
        name:
            "buildHoldingStagesChangePlans",
        run:
            ChangePlanEngineTest_buildHoldingStagesChangePlans
    },

    {
        name:
            "buildInjectionStagesChangePlans",
        run:
            ChangePlanEngineTest_buildInjectionStagesChangePlans
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

        ChangePlanEngineTest_clearSnapshotOverride();

        ChangePlanEngineTest_setSnapshotOverride();


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

        ChangePlanEngineTest_clearSnapshotOverride();

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
 * ワンワンの保圧力P1を
 * 30MPaから31MPaへ変更する
 * Change Planが生成されることを確認する。
 */
function ChangePlanEngineTest_buildHoldingPressureP1ChangePlan() {

  const resolutionResult =
    ChangePlanEngineTest_createHoldingPressureP1ResolvedMutation();


  const changePlan =
    ChangePlanEngine_build(
      resolutionResult
    );


  ChangePlanEngineTest_assertEqual(
    changePlan.status,
    "ready_for_confirmation",
    "status"
  );


  ChangePlanEngineTest_assertEqual(
    changePlan.changes.length,
    1,
    "changes.length"
  );


  const change =
    changePlan.changes[0];


  ChangePlanEngineTest_assertEqual(
    change.path,
    "standard_condition.holding_pressure_p1",
    "change.path"
  );


  ChangePlanEngineTest_assertEqual(
    change.before,
    30,
    "change.before"
  );


  ChangePlanEngineTest_assertEqual(
    change.after,
    31,
    "change.after"
  );


  ChangePlanEngineTest_assertEqual(
    change.unit,
    "megapascal",
    "change.unit"
  );


  ChangePlanEngineTest_assertEqual(
    changePlan.proposedSnapshot
      .conditionDetail["保圧力:P1"],
    31,
    "proposedSnapshot.conditionDetail.保圧力:P1"
  );


  ChangePlanContract_validate(
    changePlan
  );

}



/**
 * ワンワンの保圧時間T1を
 * 未登録から9秒へ変更する
 * Change Planが生成されることを確認する。
 */
function ChangePlanEngineTest_buildHoldingTimeT1ChangePlan() {

  const resolutionResult =
    ChangePlanEngineTest_createHoldingTimeT1ResolvedMutation();


  const changePlan =
    ChangePlanEngine_build(
      resolutionResult
    );


  ChangePlanEngineTest_assertEqual(
    changePlan.status,
    "ready_for_confirmation",
    "status"
  );


  ChangePlanEngineTest_assertEqual(
    changePlan.changes.length,
    1,
    "changes.length"
  );


  const change =
    changePlan.changes[0];


  ChangePlanEngineTest_assertEqual(
    change.path,
    "standard_condition.holding_time_t1",
    "change.path"
  );


  ChangePlanEngineTest_assertEqual(
    change.before,
    null,
    "change.before"
  );


  ChangePlanEngineTest_assertEqual(
    change.after,
    9,
    "change.after"
  );


  ChangePlanEngineTest_assertEqual(
    change.unit,
    "second",
    "change.unit"
  );


  ChangePlanEngineTest_assertEqual(
    changePlan.proposedSnapshot
      .conditionDetail["保圧時間:T1"],
    9,
    "proposedSnapshot.conditionDetail.保圧時間:T1"
  );


  ChangePlanContract_validate(
    changePlan
  );

}



/**
 * P2/T2～P4/T4の各保圧条件Fieldについて、
 * 未登録から新しい値へのChange Planが
 * 共通経路で生成されることを確認する。
 */
function ChangePlanEngineTest_buildHoldingStagesChangePlans() {

  const cases = [

    {
      field:
        "holding_pressure_p2",
      path:
        "standard_condition.holding_pressure_p2",
      spreadsheetHeader:
        "保圧力:P2",
      value:
        180,
      unit:
        "megapascal"
    },

    {
      field:
        "holding_time_t2",
      path:
        "standard_condition.holding_time_t2",
      spreadsheetHeader:
        "保圧時間:T2",
      value:
        2,
      unit:
        "second"
    },

    {
      field:
        "holding_pressure_p3",
      path:
        "standard_condition.holding_pressure_p3",
      spreadsheetHeader:
        "保圧力:P3",
      value:
        150,
      unit:
        "megapascal"
    },

    {
      field:
        "holding_time_t3",
      path:
        "standard_condition.holding_time_t3",
      spreadsheetHeader:
        "保圧時間:T3",
      value:
        3,
      unit:
        "second"
    },

    {
      field:
        "holding_pressure_p4",
      path:
        "standard_condition.holding_pressure_p4",
      spreadsheetHeader:
        "保圧力:P4",
      value:
        120,
      unit:
        "megapascal"
    },

    {
      field:
        "holding_time_t4",
      path:
        "standard_condition.holding_time_t4",
      spreadsheetHeader:
        "保圧時間:T4",
      value:
        4,
      unit:
        "second"
    }

  ];


  cases.forEach(
    function(testCase) {

      const resolutionResult =
        ChangePlanEngineTest_createHoldingStageResolvedMutation(
          testCase
        );


      const changePlan =
        ChangePlanEngine_build(
          resolutionResult
        );


      ChangePlanEngineTest_assertEqual(
        changePlan.status,
        "ready_for_confirmation",
        testCase.field + " status"
      );


      ChangePlanEngineTest_assertEqual(
        changePlan.changes.length,
        1,
        testCase.field + " changes.length"
      );


      const change =
        changePlan.changes[0];


      ChangePlanEngineTest_assertEqual(
        change.path,
        testCase.path,
        testCase.field + " change.path"
      );


      ChangePlanEngineTest_assertEqual(
        change.before,
        null,
        testCase.field + " change.before"
      );


      ChangePlanEngineTest_assertEqual(
        change.after,
        testCase.value,
        testCase.field + " change.after"
      );


      ChangePlanEngineTest_assertEqual(
        change.unit,
        testCase.unit,
        testCase.field + " change.unit"
      );


      ChangePlanEngineTest_assertEqual(
        changePlan
          .proposedSnapshot
          .conditionDetail[
            testCase.spreadsheetHeader
          ],
        testCase.value,
        testCase.field +
          " proposedSnapshot"
      );


      /*
       * Current Snapshotは変更されない。
       */
      ChangePlanEngineTest_assertEqual(
        changePlan
          .currentSnapshot
          .conditionDetail[
            testCase.spreadsheetHeader
          ],
        null,
        testCase.field +
          " currentSnapshot"
      );


      ChangePlanContract_validate(
        changePlan
      );

    }
  );

}



/**
 * V1/S1～V5/S5の各射出条件Fieldについて、
 * 未登録から新しい値へのChange Planが
 * 共通経路で生成されることを確認する。
 */
function ChangePlanEngineTest_buildInjectionStagesChangePlans() {

  const cases = [

    {
      field:
        "injection_speed_v1",
      path:
        "standard_condition.injection_speed_v1",
      spreadsheetHeader:
        "射出速度:V1",
      value:
        100,
      unit:
        "millimeter_per_second"
    },

    {
      field:
        "injection_stroke_s1",
      path:
        "standard_condition.injection_stroke_s1",
      spreadsheetHeader:
        "射出ストローク:S1",
      value:
        20,
      unit:
        "millimeter"
    },

    {
      field:
        "injection_speed_v2",
      path:
        "standard_condition.injection_speed_v2",
      spreadsheetHeader:
        "射出速度:V2",
      value:
        90,
      unit:
        "millimeter_per_second"
    },

    {
      field:
        "injection_stroke_s2",
      path:
        "standard_condition.injection_stroke_s2",
      spreadsheetHeader:
        "射出ストローク:S2",
      value:
        30,
      unit:
        "millimeter"
    },

    {
      field:
        "injection_speed_v3",
      path:
        "standard_condition.injection_speed_v3",
      spreadsheetHeader:
        "射出速度:V3",
      value:
        80,
      unit:
        "millimeter_per_second"
    },

    {
      field:
        "injection_stroke_s3",
      path:
        "standard_condition.injection_stroke_s3",
      spreadsheetHeader:
        "射出ストローク:S3",
      value:
        40,
      unit:
        "millimeter"
    },

    {
      field:
        "injection_speed_v4",
      path:
        "standard_condition.injection_speed_v4",
      spreadsheetHeader:
        "射出速度:V4",
      value:
        70,
      unit:
        "millimeter_per_second"
    },

    {
      field:
        "injection_stroke_s4",
      path:
        "standard_condition.injection_stroke_s4",
      spreadsheetHeader:
        "射出ストローク:S4",
      value:
        50,
      unit:
        "millimeter"
    },

    {
      field:
        "injection_speed_v5",
      path:
        "standard_condition.injection_speed_v5",
      spreadsheetHeader:
        "射出速度:V5",
      value:
        60,
      unit:
        "millimeter_per_second"
    },

    {
      field:
        "injection_stroke_s5",
      path:
        "standard_condition.injection_stroke_s5",
      spreadsheetHeader:
        "射出ストローク:S5",
      value:
        60,
      unit:
        "millimeter"
    }

  ];


  cases.forEach(
    function(testCase) {

      const resolutionResult =
        ChangePlanEngineTest_createHoldingStageResolvedMutation(
          testCase
        );


      const changePlan =
        ChangePlanEngine_build(
          resolutionResult
        );


      ChangePlanEngineTest_assertEqual(
        changePlan.status,
        "ready_for_confirmation",
        testCase.field + " status"
      );


      ChangePlanEngineTest_assertEqual(
        changePlan.changes.length,
        1,
        testCase.field + " changes.length"
      );


      const change =
        changePlan.changes[0];


      ChangePlanEngineTest_assertEqual(
        change.path,
        testCase.path,
        testCase.field + " change.path"
      );


      ChangePlanEngineTest_assertEqual(
        change.before,
        null,
        testCase.field + " change.before"
      );


      ChangePlanEngineTest_assertEqual(
        change.after,
        testCase.value,
        testCase.field + " change.after"
      );


      ChangePlanEngineTest_assertEqual(
        change.unit,
        testCase.unit,
        testCase.field + " change.unit"
      );


      ChangePlanEngineTest_assertEqual(
        changePlan
          .proposedSnapshot
          .conditionDetail[
            testCase.spreadsheetHeader
          ],
        testCase.value,
        testCase.field +
          " proposedSnapshot"
      );


      ChangePlanEngineTest_assertEqual(
        changePlan
          .currentSnapshot
          .conditionDetail[
            testCase.spreadsheetHeader
          ],
        null,
        testCase.field +
          " currentSnapshot"
      );


      ChangePlanContract_validate(
        changePlan
      );

    }
  );

}




function ChangePlanEngineTest_createHoldingStageResolvedMutation(
  testCase
) {

  const mutation =
    EntityMutationContract_createEmpty();


  mutation.mutationId =
    "MUTATION_CHANGE_PLAN_TEST_" +
    String(
      testCase.field
    )
      .toUpperCase();


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
      testCase.path,

    currentValue:
      null,

    proposedValue:
      testCase.value,

    unit:
      testCase.unit,

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
        testCase.field,

      currentValue:
        null,

      proposedValue:
        testCase.value,

      unit:
        testCase.unit

    }

  });


  mutation.reason =
    "Holding Stage Change Plan Test";


  mutation.metadata.source =
    "understanding_result";

  mutation.metadata.requestedBy =
    "USER_TEST_001";

  mutation.metadata.requestedAt =
    "2026-08-16T15:20:00+09:00";


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
    testCase.field +
      " resolutionResult.status"
  );


  return resolutionResult;

}



function ChangePlanEngineTest_createHoldingTimeT1ResolvedMutation() {

  const mutation =
    EntityMutationContract_createEmpty();


  mutation.mutationId =
    "MUTATION_CHANGE_PLAN_TEST_HT_T1";


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
      "standard_condition.holding_time_t1",

    currentValue:
      null,

    proposedValue:
      9,

    unit:
      "second",

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
        "holding_time_t1",

      currentValue:
        null,

      proposedValue:
        9,

      unit:
        "second"

    }

  });


  mutation.reason =
    "ワンワンのT1を9秒にして";


  mutation.metadata.source =
    "understanding_result";

  mutation.metadata.requestedBy =
    "USER_TEST_001";

  mutation.metadata.requestedAt =
    "2026-08-10T20:00:00+09:00";


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


  return resolutionResult;

}





function ChangePlanEngineTest_createHoldingPressureP1ResolvedMutation() {

  const mutation =
    EntityMutationContract_createEmpty();


  mutation.mutationId =
    "MUTATION_CHANGE_PLAN_TEST_HP_P1";


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
      "standard_condition.holding_pressure_p1",

    currentValue:
      null,

    proposedValue:
      31,

    unit:
      "megapascal",

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
        "holding_pressure_p1",

      currentValue:
        null,

      proposedValue:
        31,

      unit:
        "megapascal"

    }

  });


  mutation.reason =
    "ワンワンのP1を31MPaにして";


  mutation.metadata.source =
    "understanding_result";

  mutation.metadata.requestedBy =
    "USER_TEST_001";

  mutation.metadata.requestedAt =
    "2026-08-10T11:50:00+09:00";


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


  return resolutionResult;

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
Snapshot Override
=========================================
*/

let ChangePlanEngineTest_originalSnapshotGetter =
  null;


/**
 * SnapshotEngine_getProductSnapshotを
 * Change Plan Engine Test専用の
 * 固定Snapshotへ差し替える。
 */
function ChangePlanEngineTest_setSnapshotOverride() {

  if (
    ChangePlanEngineTest_originalSnapshotGetter ===
      null
  ) {

    ChangePlanEngineTest_originalSnapshotGetter =
      SnapshotEngine_getProductSnapshot;

  }


  SnapshotEngine_getProductSnapshot =
    function(productId) {

      ChangePlanEngineTest_assertEqual(
        productId,
        "P-000035",
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
            "標準",

          "版数":
            4,

          "親条件ID":
            null,

          "変更理由":
            null,

          "最終更新日":
            "2026-08-01T00:00:00.000Z"

        },

        conditionDetail: {

          "条件ID":
            "COND-000152",

          "金型温度(℃)":
            60,

          "冷却時間":
            8,


          "射出速度:V1":
            null,

          "射出ストローク:S1":
            null,

          "射出速度:V2":
            null,

          "射出ストローク:S2":
            null,

          "射出速度:V3":
            null,

          "射出ストローク:S3":
            null,

          "射出速度:V4":
            null,

          "射出ストローク:S4":
            null,

          "射出速度:V5":
            null,

          "射出ストローク:S5":
            null,


          "保圧力:P1":
            30,

          "保圧時間:T1":
            null,

          "保圧力:P2":
            null,

          "保圧時間:T2":
            null,

          "保圧力:P3":
            null,

          "保圧時間:T3":
            null,

          "保圧力:P4":
            null,

          "保圧時間:T4":
            null,

          "最終更新日":
            "2026-08-01T00:00:00.000Z"

        }

      };

    };

}


/**
 * Snapshot Overrideを解除する。
 */
function ChangePlanEngineTest_clearSnapshotOverride() {

  if (
    ChangePlanEngineTest_originalSnapshotGetter !==
      null
  ) {

    SnapshotEngine_getProductSnapshot =
      ChangePlanEngineTest_originalSnapshotGetter;


    ChangePlanEngineTest_originalSnapshotGetter =
      null;

  }

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