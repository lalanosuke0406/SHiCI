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
            "holdingTimeT1PresentationIsGenerated",
        run:
            ConfirmationProposalEngineTest_holdingTimeT1PresentationIsGenerated
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

          "保圧力:P1":
            30,

          "保圧時間:T1":
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