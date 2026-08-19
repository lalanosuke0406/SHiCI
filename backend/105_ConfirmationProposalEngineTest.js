/*
=========================================
SHiCI
105_ConfirmationProposalEngineTest.js

Confirmation Proposal Engine
Version 1.0 Integration Test

役割：
・実際のEntity Mutationから
  Confirmation Proposalまで接続して確認する
・Change Planの識別子がProposalへ
  正しく引き継がれることを確認する
・表示用差分が正しく生成されることを確認する
・元のChange Planが変更されないことを確認する
・不正なChange Planを拒否することを確認する

対象：
・product
・change_state
・standard_condition.mold_temperature

禁止：
・Spreadsheetを更新しない
・Change Planを実行しない
・条件IDを採番しない
・標準条件を切り替えない
・OpenAI APIを呼び出さない
=========================================
*/


/*
=========================================
Test Runner
=========================================
*/

/**
 * Confirmation Proposal Engine
 * Ver.1.0の全テストを実行する。
 */
function ConfirmationProposalEngineTest_runAll() {

  const tests = [

    {
      name:
        "buildProposalFromActualChangePlan",
      run:
        ConfirmationProposalEngineTest_buildProposalFromActualChangePlan
    },

    {
      name:
        "proposalIdentifiersAreConsistent",
      run:
        ConfirmationProposalEngineTest_proposalIdentifiersAreConsistent
    },

    {
      name:
        "presentationIsGenerated",
      run:
        ConfirmationProposalEngineTest_presentationIsGenerated
    },

    {
      name:
        "buildMeteringPositionConfirmation",
      run:
        ConfirmationProposalEngineTest_buildMeteringPositionConfirmation
    },

    {
        name:
            "holdingTimeT1PresentationIsGenerated",
        run:
            ConfirmationProposalEngineTest_holdingTimeT1PresentationIsGenerated
    },

    {
        name:
            "holdingStagesPresentationIsGenerated",
        run:
            ConfirmationProposalEngineTest_holdingStagesPresentationIsGenerated
    },

    {
        name:
            "rampPresentationIsGenerated",
        run:
            ConfirmationProposalEngineTest_rampPresentationIsGenerated
    },

    {
        name:
            "injectionStagesPresentationIsGenerated",
        run:
            ConfirmationProposalEngineTest_injectionStagesPresentationIsGenerated
    },

    {
      name:
        "confirmationActionsAreEnabled",
      run:
        ConfirmationProposalEngineTest_confirmationActionsAreEnabled
    },

    {
      name:
        "originalChangePlanIsNotModified",
      run:
        ConfirmationProposalEngineTest_originalChangePlanIsNotModified
    },

    {
      name:
        "nonReadyChangePlanIsRejected",
      run:
        ConfirmationProposalEngineTest_nonReadyChangePlanIsRejected
    },

    {
      name:
        "nonPendingConfirmationIsRejected",
      run:
        ConfirmationProposalEngineTest_nonPendingConfirmationIsRejected
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
      "Confirmation Proposal Engine Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[Confirmation Proposal Engine Ver.1.0 Test Passed]"
  );

}


/*
=========================================
正常系
=========================================
*/

/**
 * 実際のChange Plan Engineから生成した
 * Change PlanをProposalへ変換できることを確認する。
 */
function ConfirmationProposalEngineTest_buildProposalFromActualChangePlan() {

  const changePlan =
    ConfirmationProposalEngineTest_createActualChangePlan();


  const proposal =
    ConfirmationProposalEngine_build(
      changePlan
    );


  ConfirmationProposalEngineTest_assertEqual(
    proposal.schemaVersion,
    "1.0",
    "proposal.schemaVersion"
  );


  ConfirmationProposalEngineTest_assertNonEmptyString(
    proposal.proposalId,
    "proposal.proposalId"
  );


  ConfirmationProposalEngineTest_assertTrue(
    proposal.proposalId.indexOf(
      "CONFIRMATION-"
    ) ===
      0,
    "proposalIdはCONFIRMATION-で始まる必要があります。"
  );


  ConfirmationProposalEngineTest_assertEqual(
    proposal.changePlanId,
    changePlan.changePlanId,
    "proposal.changePlanId"
  );


  ConfirmationProposalEngineTest_assertEqual(
    proposal.status,
    "pending",
    "proposal.status"
  );


  ConfirmationProposalEngineTest_assertEqual(
    proposal.subject.entityType,
    "product",
    "proposal.subject.entityType"
  );


  ConfirmationProposalEngineTest_assertEqual(
    proposal.subject.entityId,
    "P-000035",
    "proposal.subject.entityId"
  );


  ConfirmationProposalEngineTest_assertEqual(
    proposal.subject.displayName,
    "LEVER, CLAMP",
    "proposal.subject.displayName"
  );


  ConfirmationProposalEngineTest_assertEqual(
    proposal.subject.drawingNumber,
    "KLW-M374C-000",
    "proposal.subject.drawingNumber"
  );


  ConfirmationProposalContract_validate(
    proposal
  );

}


/**
 * Proposal内のIDが相互に一致することを確認する。
 */
function ConfirmationProposalEngineTest_proposalIdentifiersAreConsistent() {

  const changePlan =
    ConfirmationProposalEngineTest_createActualChangePlan();


  const proposal =
    ConfirmationProposalEngine_build(
      changePlan
    );


  ConfirmationProposalEngineTest_assertEqual(
    proposal.payload.proposalId,
    proposal.proposalId,
    "payload.proposalId"
  );


  ConfirmationProposalEngineTest_assertEqual(
    proposal.payload.changePlanId,
    proposal.changePlanId,
    "payload.changePlanId"
  );


  ConfirmationProposalEngineTest_assertEqual(
    proposal.changePlanId,
    changePlan.changePlanId,
    "changePlanId inheritance"
  );

}


/**
 * Formatterを通した表示情報が
 * 正しくProposalへ格納されることを確認する。
 */
function ConfirmationProposalEngineTest_presentationIsGenerated() {

  const changePlan =
    ConfirmationProposalEngineTest_createActualChangePlan();


  const proposal =
    ConfirmationProposalEngine_build(
      changePlan
    );


  ConfirmationProposalEngineTest_assertEqual(
    proposal.presentation.proposalType,
    "standard_condition_change",
    "presentation.proposalType"
  );


  ConfirmationProposalEngineTest_assertEqual(
    proposal.presentation.title,
    "標準成形条件の変更",
    "presentation.title"
  );


  ConfirmationProposalEngineTest_assertEqual(
    proposal.presentation.message,
    "LEVER, CLAMP（KLW-M374C-000）の標準成形条件を変更します。",
    "presentation.message"
  );


  ConfirmationProposalEngineTest_assertEqual(
    proposal.changes.length,
    1,
    "proposal.changes.length"
  );


  const change =
    proposal.changes[0];


  ConfirmationProposalEngineTest_assertEqual(
    change.path,
    "standard_condition.mold_temperature",
    "change.path"
  );


  ConfirmationProposalEngineTest_assertEqual(
    change.label,
    "金型温度",
    "change.label"
  );


  ConfirmationProposalEngineTest_assertEqual(
    change.before,
    60,
    "change.before"
  );


  ConfirmationProposalEngineTest_assertEqual(
    change.after,
    61,
    "change.after"
  );


  ConfirmationProposalEngineTest_assertEqual(
    change.unit,
    "℃",
    "change.unit"
  );

}


/**
 * pending Proposalの確認操作が
 * 有効であることを確認する。
 */
function ConfirmationProposalEngineTest_confirmationActionsAreEnabled() {

  const changePlan =
    ConfirmationProposalEngineTest_createActualChangePlan();


  const proposal =
    ConfirmationProposalEngine_build(
      changePlan
    );


  const confirmAction =
    ConfirmationProposalContract_findAction(
      proposal.actions,
      "confirm"
    );


  const rejectAction =
    ConfirmationProposalContract_findAction(
      proposal.actions,
      "reject"
    );


  ConfirmationProposalEngineTest_assertEqual(
    confirmAction.label,
    "変更する",
    "confirmAction.label"
  );


  ConfirmationProposalEngineTest_assertEqual(
    confirmAction.enabled,
    true,
    "confirmAction.enabled"
  );


  ConfirmationProposalEngineTest_assertEqual(
    rejectAction.label,
    "キャンセル",
    "rejectAction.label"
  );


  ConfirmationProposalEngineTest_assertEqual(
    rejectAction.enabled,
    true,
    "rejectAction.enabled"
  );

}


/**
 * Proposal生成によって
 * 元のChange Planが変更されないことを確認する。
 */
function ConfirmationProposalEngineTest_originalChangePlanIsNotModified() {

  const changePlan =
    ConfirmationProposalEngineTest_createActualChangePlan();


  const originalJson =
    JSON.stringify(
      changePlan
    );


  ConfirmationProposalEngine_build(
    changePlan
  );


  const afterJson =
    JSON.stringify(
      changePlan
    );


  ConfirmationProposalEngineTest_assertEqual(
    afterJson,
    originalJson,
    "changePlan"
  );

}


/*
=========================================
異常系
=========================================
*/

/**
 * ready_for_confirmationではない
 * Change Planを拒否することを確認する。
 */
function ConfirmationProposalEngineTest_nonReadyChangePlanIsRejected() {

  const changePlan =
    ConfirmationProposalEngineTest_createActualChangePlan();


  changePlan.status =
    "blocked";


  ConfirmationProposalEngineTest_assertThrows(
    function() {

      ConfirmationProposalEngine_build(
        changePlan
      );

    },
    "Change Plan"
  );

}


/**
 * confirmation.statusがpendingではない
 * Change Planを拒否することを確認する。
 */
function ConfirmationProposalEngineTest_nonPendingConfirmationIsRejected() {

  const changePlan =
    ConfirmationProposalEngineTest_createActualChangePlan();


  changePlan.confirmation.status =
    "confirmed";


  ConfirmationProposalEngineTest_assertThrows(
    function() {

      ConfirmationProposalEngine_build(
        changePlan
      );

    },
    "confirmation"
  );

}


/*
=========================================
Integration Fixture
=========================================
*/

/**
 * 実際の処理を使用して
 * Change Planを生成する。
 *
 * Spreadsheetは読み取るが更新しない。
 *
 * @return {Object}
 */
function ConfirmationProposalEngineTest_createActualChangePlan() {

  const mutation =
    EntityMutationContract_createEmpty();


  mutation.mutationId =
    "MUTATION_CONFIRMATION_PROPOSAL_TEST_001";


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
    "2026-07-31T17:36:00+09:00";


  EntityMutationContract_validate(
    mutation
  );


  const resolutionResult =
    EntityMutationResolutionEngine_resolve(
      mutation
    );


  ConfirmationProposalEngineTest_assertEqual(
    resolutionResult.status,
    "resolved",
    "resolutionResult.status"
  );


  const changePlan =
    ChangePlanEngine_build(
      resolutionResult
    );


  ConfirmationProposalEngineTest_assertEqual(
    changePlan.status,
    "ready_for_confirmation",
    "changePlan.status"
  );


  ConfirmationProposalEngineTest_assertEqual(
    changePlan.confirmation.status,
    "pending",
    "changePlan.confirmation.status"
  );


  ConfirmationProposalEngineTest_assertEqual(
    changePlan.executable,
    false,
    "changePlan.executable"
  );


  return changePlan;

}



function ConfirmationProposalEngineTest_createHoldingTimeT1ChangePlan() {

  const mutation =
    EntityMutationContract_createEmpty();


  mutation.mutationId =
    "MUTATION_CONFIRMATION_PROPOSAL_TEST_HT_T1";


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
    "2026-08-10T20:20:00+09:00";


  EntityMutationContract_validate(
    mutation
  );


  const resolutionResult =
    EntityMutationResolutionEngine_resolve(
      mutation
    );


  ConfirmationProposalEngineTest_assertEqual(
    resolutionResult.status,
    "resolved",
    "resolutionResult.status"
  );


    ConfirmationProposalEngineTest_setHoldingTimeT1SnapshotOverride();


    try {

    const changePlan =
        ChangePlanEngine_build(
        resolutionResult
        );


    ConfirmationProposalEngineTest_assertEqual(
        changePlan.status,
        "ready_for_confirmation",
        "changePlan.status"
    );


    return changePlan;

    } finally {

    ConfirmationProposalEngineTest_clearHoldingTimeT1SnapshotOverride();

    }

}



/*
=========================================
Holding Time T1 Snapshot Override
=========================================
*/

let ConfirmationProposalEngineTest_originalSnapshotGetter =
  null;


function ConfirmationProposalEngineTest_setHoldingTimeT1SnapshotOverride() {

  if (
    ConfirmationProposalEngineTest_originalSnapshotGetter ===
      null
  ) {

    ConfirmationProposalEngineTest_originalSnapshotGetter =
      SnapshotEngine_getProductSnapshot;

  }


  SnapshotEngine_getProductSnapshot =
    function(productId) {

      ConfirmationProposalEngineTest_assertEqual(
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

          "計量値(mm)":
            "",

          "保圧力:P1":
            30,

          "保圧時間:T1":
            "",

          "保圧力:P2":
            "",

          "保圧時間:T2":
            "",

          "保圧力:P3":
            "",

          "保圧時間:T3":
            "",

          "保圧力:P4":
            "",

          "保圧時間:T4":
            "",

          "射出速度:V1":
            "",

          "射出ストローク:S1":
            "",

          "射出速度:V2":
            "",

          "射出ストローク:S2":
            "",

          "射出速度:V3":
            "",

          "射出ストローク:S3":
            "",

          "射出速度:V4":
            "",

          "射出ストローク:S4":
            "",

          "射出速度:V5":
            "",

          "射出ストローク:S5":
            "",

          "速度徐変1(ON/OFF)":
            "",

          "速度徐変2(ON/OFF)":
            "",

          "速度徐変3(ON/OFF)":
            "",

          "速度徐変4(ON/OFF)":
            "",

          "速度徐変5(ON/OFF)":
            "",


          "保圧徐変1(ON/OFF)":
            "",

          "保圧徐変2(ON/OFF)":
            "",

          "保圧徐変3(ON/OFF)":
            "",

          "保圧徐変4(ON/OFF)":
            "",

          "最終更新日":
            "2026-08-01T00:00:00.000Z"

        }

      };

    };

}


function ConfirmationProposalEngineTest_clearHoldingTimeT1SnapshotOverride() {

  if (
    ConfirmationProposalEngineTest_originalSnapshotGetter !==
      null
  ) {

    SnapshotEngine_getProductSnapshot =
      ConfirmationProposalEngineTest_originalSnapshotGetter;


    ConfirmationProposalEngineTest_originalSnapshotGetter =
      null;

  }

}



/*
=========================================
Assertion
=========================================
*/

function ConfirmationProposalEngineTest_assertEqual(
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


function ConfirmationProposalEngineTest_assertTrue(
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


function ConfirmationProposalEngineTest_assertNonEmptyString(
  value,
  label
) {

  if (
    typeof value !==
      "string" ||
    value.trim() ===
      ""
  ) {

    throw new Error(
      label +
      "は空でないstringである必要があります。"
    );

  }

}


function ConfirmationProposalEngineTest_assertThrows(
  callback,
  expectedMessagePart
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
        expectedMessagePart
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
      expectedMessagePart
    ) ===
      -1
  ) {

    throw new Error(
      "例外メッセージが一致しません。expectedPart=" +
      JSON.stringify(
        expectedMessagePart
      ) +
      " actual=" +
      JSON.stringify(
        actualMessage
      )
    );

  }

}



/**
 * 保圧時間T1のChange Planが
 * Confirmation Proposalへ正しく変換されることを確認する。
 */
function ConfirmationProposalEngineTest_holdingTimeT1PresentationIsGenerated() {

  const changePlan =
    ConfirmationProposalEngineTest_createHoldingTimeT1ChangePlan();


  const proposal =
    ConfirmationProposalEngine_build(
      changePlan
    );


  ConfirmationProposalEngineTest_assertEqual(
    proposal.status,
    "pending",
    "proposal.status"
  );


  ConfirmationProposalEngineTest_assertEqual(
    proposal.changes.length,
    1,
    "proposal.changes.length"
  );


  const change =
    proposal.changes[0];


  ConfirmationProposalEngineTest_assertEqual(
    change.path,
    "standard_condition.holding_time_t1",
    "change.path"
  );


  ConfirmationProposalEngineTest_assertEqual(
    change.label,
    "保圧時間 T1",
    "change.label"
  );


  ConfirmationProposalEngineTest_assertEqual(
    change.before,
    "",
    "change.before"
  );


  ConfirmationProposalEngineTest_assertEqual(
    change.after,
    9,
    "change.after"
  );


  ConfirmationProposalEngineTest_assertEqual(
    change.unit,
    "秒",
    "change.unit"
  );


  ConfirmationProposalContract_validate(
    proposal
  );

}



/**
 * P2/T2～P4/T4のChange Planが
 * Confirmation Proposalへ正しく変換されることを確認する。
 */
function ConfirmationProposalEngineTest_holdingStagesPresentationIsGenerated() {

  const cases = [

    {
      field: "holding_pressure_p2",
      path: "standard_condition.holding_pressure_p2",
      label: "保圧力 P2",
      value: 180,
      unit: "megapascal",
      displayUnit: "MPa"
    },

    {
      field: "holding_time_t2",
      path: "standard_condition.holding_time_t2",
      label: "保圧時間 T2",
      value: 2,
      unit: "second",
      displayUnit: "秒"
    },

    {
      field: "holding_pressure_p3",
      path: "standard_condition.holding_pressure_p3",
      label: "保圧力 P3",
      value: 150,
      unit: "megapascal",
      displayUnit: "MPa"
    },

    {
      field: "holding_time_t3",
      path: "standard_condition.holding_time_t3",
      label: "保圧時間 T3",
      value: 3,
      unit: "second",
      displayUnit: "秒"
    },

    {
      field: "holding_pressure_p4",
      path: "standard_condition.holding_pressure_p4",
      label: "保圧力 P4",
      value: 120,
      unit: "megapascal",
      displayUnit: "MPa"
    },

    {
      field: "holding_time_t4",
      path: "standard_condition.holding_time_t4",
      label: "保圧時間 T4",
      value: 4,
      unit: "second",
      displayUnit: "秒"
    }

  ];


  cases.forEach(function(testCase) {

    const changePlan =
      ConfirmationProposalEngineTest_createHoldingStageChangePlan(
        testCase
      );


    const proposal =
      ConfirmationProposalEngine_build(
        changePlan
      );


    ConfirmationProposalEngineTest_assertEqual(
      proposal.status,
      "pending",
      testCase.field + " proposal.status"
    );


    ConfirmationProposalEngineTest_assertEqual(
      proposal.changes.length,
      1,
      testCase.field + " proposal.changes.length"
    );


    const change =
      proposal.changes[0];


    ConfirmationProposalEngineTest_assertEqual(
      change.path,
      testCase.path,
      testCase.field + " change.path"
    );


    ConfirmationProposalEngineTest_assertEqual(
      change.label,
      testCase.label,
      testCase.field + " change.label"
    );


    ConfirmationProposalEngineTest_assertEqual(
      change.before,
      "",
      testCase.field + " change.before"
    );


    ConfirmationProposalEngineTest_assertEqual(
      change.after,
      testCase.value,
      testCase.field + " change.after"
    );


    ConfirmationProposalEngineTest_assertEqual(
      change.unit,
      testCase.displayUnit,
      testCase.field + " change.unit"
    );

  });

}



/**
 * V1/S1～V5/S5のChange Planが
 * Confirmation Proposalへ正しく変換されることを確認する。
 */
function ConfirmationProposalEngineTest_injectionStagesPresentationIsGenerated() {

  const cases = [

    {
      field: "injection_speed_v1",
      path: "standard_condition.injection_speed_v1",
      label: "射出速度 V1",
      value: 100,
      unit: "millimeter_per_second",
      displayUnit: "mm/s"
    },

    {
      field: "injection_stroke_s1",
      path: "standard_condition.injection_stroke_s1",
      label: "射出ストローク S1",
      value: 20,
      unit: "millimeter",
      displayUnit: "mm"
    },

    {
      field: "injection_speed_v2",
      path: "standard_condition.injection_speed_v2",
      label: "射出速度 V2",
      value: 90,
      unit: "millimeter_per_second",
      displayUnit: "mm/s"
    },

    {
      field: "injection_stroke_s2",
      path: "standard_condition.injection_stroke_s2",
      label: "射出ストローク S2",
      value: 30,
      unit: "millimeter",
      displayUnit: "mm"
    },

    {
      field: "injection_speed_v3",
      path: "standard_condition.injection_speed_v3",
      label: "射出速度 V3",
      value: 80,
      unit: "millimeter_per_second",
      displayUnit: "mm/s"
    },

    {
      field: "injection_stroke_s3",
      path: "standard_condition.injection_stroke_s3",
      label: "射出ストローク S3",
      value: 40,
      unit: "millimeter",
      displayUnit: "mm"
    },

    {
      field: "injection_speed_v4",
      path: "standard_condition.injection_speed_v4",
      label: "射出速度 V4",
      value: 70,
      unit: "millimeter_per_second",
      displayUnit: "mm/s"
    },

    {
      field: "injection_stroke_s4",
      path: "standard_condition.injection_stroke_s4",
      label: "射出ストローク S4",
      value: 50,
      unit: "millimeter",
      displayUnit: "mm"
    },

    {
      field: "injection_speed_v5",
      path: "standard_condition.injection_speed_v5",
      label: "射出速度 V5",
      value: 60,
      unit: "millimeter_per_second",
      displayUnit: "mm/s"
    },

    {
      field: "injection_stroke_s5",
      path: "standard_condition.injection_stroke_s5",
      label: "射出ストローク S5",
      value: 60,
      unit: "millimeter",
      displayUnit: "mm"
    }

  ];


  cases.forEach(function(testCase) {

    const changePlan =
      ConfirmationProposalEngineTest_createHoldingStageChangePlan(
        testCase
      );


    const proposal =
      ConfirmationProposalEngine_build(
        changePlan
      );


    ConfirmationProposalEngineTest_assertEqual(
      proposal.status,
      "pending",
      testCase.field + " proposal.status"
    );


    ConfirmationProposalEngineTest_assertEqual(
      proposal.changes.length,
      1,
      testCase.field + " proposal.changes.length"
    );


    const change =
      proposal.changes[0];


    ConfirmationProposalEngineTest_assertEqual(
      change.path,
      testCase.path,
      testCase.field + " change.path"
    );


    ConfirmationProposalEngineTest_assertEqual(
      change.label,
      testCase.label,
      testCase.field + " change.label"
    );


    ConfirmationProposalEngineTest_assertEqual(
      change.before,
      "",
      testCase.field + " change.before"
    );


    ConfirmationProposalEngineTest_assertEqual(
      change.after,
      testCase.value,
      testCase.field + " change.after"
    );


    ConfirmationProposalEngineTest_assertEqual(
      change.unit,
      testCase.displayUnit,
      testCase.field + " change.unit"
    );


    ConfirmationProposalContract_validate(
      proposal
    );

  });

}



function ConfirmationProposalEngineTest_rampPresentationIsGenerated() {

  const cases = [

    {
      field:
        "injection_speed_ramp_1",
      path:
        "standard_condition.injection_speed_ramp_1",
      value:
        true,
      unit:
        null,
      spreadsheetHeader:
        "速度徐変1(ON/OFF)"
    },

    {
      field:
        "injection_speed_ramp_2",
      path:
        "standard_condition.injection_speed_ramp_2",
      value:
        false,
      unit:
        null,
      spreadsheetHeader:
        "速度徐変2(ON/OFF)"
    },

    {
      field:
        "holding_ramp_1",
      path:
        "standard_condition.holding_ramp_1",
      value:
        true,
      unit:
        null,
      spreadsheetHeader:
        "保圧徐変1(ON/OFF)"
    },

    {
      field:
        "holding_ramp_2",
      path:
        "standard_condition.holding_ramp_2",
      value:
        false,
      unit:
        null,
      spreadsheetHeader:
        "保圧徐変2(ON/OFF)"
    }

  ];


  cases.forEach(
    function(testCase) {

      const changePlan =
        ConfirmationProposalEngineTest_createHoldingStageChangePlan(
          testCase
        );


      const proposal =
        ConfirmationProposalEngine_build(
          changePlan
        );


      ConfirmationProposalEngineTest_assertTrue(
        proposal !== null,
        testCase.field + " proposal"
      );


      ConfirmationProposalEngineTest_assertEqual(
        proposal.status,
        "pending",
        testCase.field + " proposal.status"
      );


      ConfirmationProposalEngineTest_assertEqual(
        proposal.changes.length,
        1,
        testCase.field + " proposal.changes.length"
      );


      const change =
        proposal.changes[0];


      ConfirmationProposalEngineTest_assertEqual(
        change.path,
        testCase.path,
        testCase.field + " change.path"
      );


      ConfirmationProposalEngineTest_assertEqual(
        change.after,
        testCase.value,
        testCase.field + " change.after"
      );


      ConfirmationProposalEngineTest_assertEqual(
        change.unit,
        null,
        testCase.field + " change.unit"
      );


      ConfirmationProposalContract_validate(
        proposal
      );

    }
  );


  console.log(
    "[Passed] Confirmation Proposal Engine Ramp Presentation"
  );

}



function ConfirmationProposalEngineTest_createHoldingStageChangePlan(
  testCase
) {

  const mutation =
    EntityMutationContract_createEmpty();


  mutation.mutationId =
    "MUTATION_CONFIRMATION_PROPOSAL_TEST_" +
    String(testCase.field).toUpperCase();


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
    "Holding Stage Confirmation Proposal Test";


  mutation.metadata.source =
    "understanding_result";

  mutation.metadata.requestedBy =
    "USER_TEST_001";

  mutation.metadata.requestedAt =
    "2026-08-17T09:20:00+09:00";


  EntityMutationContract_validate(
    mutation
  );


  const resolutionResult =
    EntityMutationResolutionEngine_resolve(
      mutation
    );


  ConfirmationProposalEngineTest_assertEqual(
    resolutionResult.status,
    "resolved",
    testCase.field + " resolutionResult.status"
  );


  ConfirmationProposalEngineTest_setHoldingTimeT1SnapshotOverride();


  try {

    const changePlan =
      ChangePlanEngine_build(
        resolutionResult
      );


    ConfirmationProposalEngineTest_assertEqual(
      changePlan.status,
      "ready_for_confirmation",
      testCase.field + " changePlan.status"
    );


    return changePlan;

  } finally {

    ConfirmationProposalEngineTest_clearHoldingTimeT1SnapshotOverride();

  }

}



function ConfirmationProposalEngineTest_buildMeteringPositionConfirmation() {

  const testCase = {

    field:
      "metering_position",

    path:
      "standard_condition.metering_position",

    label:
      "計量値",

    value:
      35,

    unit:
      "millimeter",

    displayUnit:
      "mm"

  };


  const changePlan =
    ConfirmationProposalEngineTest_createHoldingStageChangePlan(
      testCase
    );


  const proposal =
    ConfirmationProposalEngine_build(
      changePlan
    );


  ConfirmationProposalEngineTest_assertEqual(
    proposal.status,
    "pending",
    "metering_position proposal.status"
  );


  ConfirmationProposalEngineTest_assertEqual(
    proposal.changes.length,
    1,
    "metering_position proposal.changes.length"
  );


  const change =
    proposal.changes[0];


  ConfirmationProposalEngineTest_assertEqual(
    change.path,
    testCase.path,
    "metering_position change.path"
  );


  ConfirmationProposalEngineTest_assertEqual(
    change.label,
    testCase.label,
    "metering_position change.label"
  );


  ConfirmationProposalEngineTest_assertEqual(
    change.before,
    "",
    "metering_position change.before"
  );


  ConfirmationProposalEngineTest_assertEqual(
    change.after,
    testCase.value,
    "metering_position change.after"
  );


  ConfirmationProposalEngineTest_assertEqual(
    change.unit,
    testCase.displayUnit,
    "metering_position change.unit"
  );


  ConfirmationProposalContract_validate(
    proposal
  );

}