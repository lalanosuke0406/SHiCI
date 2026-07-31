/*
=========================================
SHiCI
103_ConfirmationProposalContractTest.js

Confirmation Proposal Contract
Version 1.0 Test

役割：
・空構造を確認する
・正常なProposalを検証する
・識別子の不整合を拒否する
・Action構造の不正を拒否する
・完了済みProposalのAction状態を確認する

禁止：
・Spreadsheetを更新しない
・Change Planを実行しない
・Snapshotを取得しない
・OpenAI APIを呼び出さない
=========================================
*/


/*
=========================================
Test Runner
=========================================
*/

/**
 * Confirmation Proposal Contract
 * Ver.1.0の全テストを実行する。
 */
function ConfirmationProposalContractTest_runAll() {

  const tests = [

    {
      name:
        "createEmptyStructure",
      run:
        ConfirmationProposalContractTest_createEmptyStructure
    },

    {
      name:
        "validPendingProposal",
      run:
        ConfirmationProposalContractTest_validPendingProposal
    },

    {
      name:
        "payloadProposalIdMismatchIsRejected",
      run:
        ConfirmationProposalContractTest_payloadProposalIdMismatchIsRejected
    },

    {
      name:
        "payloadChangePlanIdMismatchIsRejected",
      run:
        ConfirmationProposalContractTest_payloadChangePlanIdMismatchIsRejected
    },

    {
      name:
        "proposalWithoutChangesIsRejected",
      run:
        ConfirmationProposalContractTest_proposalWithoutChangesIsRejected
    },

    {
      name:
        "proposalWithoutRejectActionIsRejected",
      run:
        ConfirmationProposalContractTest_proposalWithoutRejectActionIsRejected
    },

    {
      name:
        "pendingDisabledConfirmIsRejected",
      run:
        ConfirmationProposalContractTest_pendingDisabledConfirmIsRejected
    },

    {
      name:
        "confirmedProposalWithDisabledActionsIsAccepted",
      run:
        ConfirmationProposalContractTest_confirmedProposalWithDisabledActionsIsAccepted
    },

    {
      name:
        "confirmedProposalWithEnabledActionIsRejected",
      run:
        ConfirmationProposalContractTest_confirmedProposalWithEnabledActionIsRejected
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
      "Confirmation Proposal Contract Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[Confirmation Proposal Contract Ver.1.0 Test Passed]"
  );

}


/*
=========================================
空構造
=========================================
*/

/**
 * createEmpty()が想定した
 * 初期構造を返すことを確認する。
 */
function ConfirmationProposalContractTest_createEmptyStructure() {

  const proposal =
    ConfirmationProposalContract_createEmpty();


  ConfirmationProposalContractTest_assertEqual(
    proposal.schemaVersion,
    "1.0",
    "schemaVersion"
  );


  ConfirmationProposalContractTest_assertEqual(
    proposal.proposalId,
    null,
    "proposalId"
  );


  ConfirmationProposalContractTest_assertEqual(
    proposal.changePlanId,
    null,
    "changePlanId"
  );


  ConfirmationProposalContractTest_assertEqual(
    proposal.status,
    "pending",
    "status"
  );


  ConfirmationProposalContractTest_assertTrue(
    Array.isArray(
      proposal.changes
    ),
    "changesはArrayである必要があります。"
  );


  ConfirmationProposalContractTest_assertEqual(
    proposal.changes.length,
    0,
    "changes.length"
  );


  ConfirmationProposalContractTest_assertTrue(
    Array.isArray(
      proposal.actions
    ),
    "actionsはArrayである必要があります。"
  );


  ConfirmationProposalContractTest_assertEqual(
    proposal.actions.length,
    2,
    "actions.length"
  );


  ConfirmationProposalContractTest_assertEqual(
    proposal.actions[0].actionType,
    "confirm",
    "actions[0].actionType"
  );


  ConfirmationProposalContractTest_assertEqual(
    proposal.actions[1].actionType,
    "reject",
    "actions[1].actionType"
  );


  ConfirmationProposalContractTest_assertEqual(
    proposal.payload.proposalId,
    null,
    "payload.proposalId"
  );


  ConfirmationProposalContractTest_assertEqual(
    proposal.payload.changePlanId,
    null,
    "payload.changePlanId"
  );

}


/*
=========================================
正常系
=========================================
*/

/**
 * 正常なpending Proposalが
 * Contractを通過することを確認する。
 */
function ConfirmationProposalContractTest_validPendingProposal() {

  const proposal =
    ConfirmationProposalContractTest_createPendingProposal();


  const validated =
    ConfirmationProposalContract_validate(
      proposal
    );


  ConfirmationProposalContractTest_assertTrue(
    validated ===
      proposal,
    "validateは同じProposalを返す必要があります。"
  );

}


/**
 * confirmed状態かつ全Action無効のProposalが
 * Contractを通過することを確認する。
 */
function ConfirmationProposalContractTest_confirmedProposalWithDisabledActionsIsAccepted() {

  const proposal =
    ConfirmationProposalContractTest_createPendingProposal();


  proposal.status =
    "confirmed";


  proposal.actions.forEach(
    function(action) {

      action.enabled =
        false;

    }
  );


  ConfirmationProposalContract_validate(
    proposal
  );

}


/*
=========================================
異常系
=========================================
*/

/**
 * payload.proposalIdとproposalIdが
 * 異なる場合に拒否することを確認する。
 */
function ConfirmationProposalContractTest_payloadProposalIdMismatchIsRejected() {

  const proposal =
    ConfirmationProposalContractTest_createPendingProposal();


  proposal.payload.proposalId =
    "CONFIRMATION-OTHER";


  ConfirmationProposalContractTest_assertThrows(
    function() {

      ConfirmationProposalContract_validate(
        proposal
      );

    },
    "payload.proposalIdとproposalIdが一致しません。"
  );

}


/**
 * payload.changePlanIdとchangePlanIdが
 * 異なる場合に拒否することを確認する。
 */
function ConfirmationProposalContractTest_payloadChangePlanIdMismatchIsRejected() {

  const proposal =
    ConfirmationProposalContractTest_createPendingProposal();


  proposal.payload.changePlanId =
    "CHANGE-PLAN-OTHER";


  ConfirmationProposalContractTest_assertThrows(
    function() {

      ConfirmationProposalContract_validate(
        proposal
      );

    },
    "payload.changePlanIdとchangePlanIdが一致しません。"
  );

}


/**
 * changesが空のProposalを
 * 拒否することを確認する。
 */
function ConfirmationProposalContractTest_proposalWithoutChangesIsRejected() {

  const proposal =
    ConfirmationProposalContractTest_createPendingProposal();


  proposal.changes =
    [];


  ConfirmationProposalContractTest_assertThrows(
    function() {

      ConfirmationProposalContract_validate(
        proposal
      );

    },
    "Confirmation Proposalには1件以上のchangesが必要です。"
  );

}


/**
 * reject Actionが存在しないProposalを
 * 拒否することを確認する。
 */
function ConfirmationProposalContractTest_proposalWithoutRejectActionIsRejected() {

  const proposal =
    ConfirmationProposalContractTest_createPendingProposal();


  proposal.actions =
    proposal.actions.filter(
      function(action) {

        return (
          action.actionType !==
            "reject"
        );

      }
    );


  ConfirmationProposalContractTest_assertThrows(
    function() {

      ConfirmationProposalContract_validate(
        proposal
      );

    },
    "actionsにはrejectが必要です。"
  );

}


/**
 * pending状態でconfirm Actionが
 * 無効になっている場合に拒否する。
 */
function ConfirmationProposalContractTest_pendingDisabledConfirmIsRejected() {

  const proposal =
    ConfirmationProposalContractTest_createPendingProposal();


  const confirmAction =
    ConfirmationProposalContract_findAction(
      proposal.actions,
      "confirm"
    );


  confirmAction.enabled =
    false;


  ConfirmationProposalContractTest_assertThrows(
    function() {

      ConfirmationProposalContract_validate(
        proposal
      );

    },
    "pendingのProposalではconfirm Actionが有効である必要があります。"
  );

}


/**
 * confirmed状態にもかかわらずActionが
 * 有効な場合に拒否する。
 */
function ConfirmationProposalContractTest_confirmedProposalWithEnabledActionIsRejected() {

  const proposal =
    ConfirmationProposalContractTest_createPendingProposal();


  proposal.status =
    "confirmed";


  proposal.actions[0].enabled =
    false;

  proposal.actions[1].enabled =
    true;


  ConfirmationProposalContractTest_assertThrows(
    function() {

      ConfirmationProposalContract_validate(
        proposal
      );

    },
    "完了済みのProposalでは全Actionを無効にする必要があります。"
  );

}


/*
=========================================
Fixture
=========================================
*/

/**
 * 正常なpending Proposalを生成する。
 *
 * @return {Object}
 */
function ConfirmationProposalContractTest_createPendingProposal() {

  const proposal =
    ConfirmationProposalContract_createEmpty();


  proposal.proposalId =
    "CONFIRMATION-TEST-001";


  proposal.changePlanId =
    "CHANGE-PLAN-TEST-001";


  proposal.status =
    "pending";


  proposal.subject = {

    entityType:
      "product",

    entityId:
      "P-000035",

    displayName:
      "LEVER, CLAMP",

    drawingNumber:
      "KLW-M374C-000"

  };


  proposal.presentation = {

    proposalType:
      "standard_condition_change",

    title:
      "標準成形条件の変更",

    message:
      "LEVER, CLAMPの標準成形条件を変更します。"

  };


  proposal.changes.push({

    path:
      "standard_condition.mold_temperature",

    label:
      "金型温度",

    before:
      60,

    after:
      61,

    unit:
      "℃"

  });


  proposal.actions = [

    {
      actionType:
        "confirm",

      label:
        "変更する",

      enabled:
        true
    },

    {
      actionType:
        "reject",

      label:
        "キャンセル",

      enabled:
        true
    }

  ];


  proposal.payload = {

    proposalId:
      proposal.proposalId,

    changePlanId:
      proposal.changePlanId

  };


  proposal.metadata = {

    source:
      "change_plan",

    generatedAt:
      "2026-07-31T17:10:00+09:00",

    expiresAt:
      null

  };


  return proposal;

}


/*
=========================================
Assertion
=========================================
*/

function ConfirmationProposalContractTest_assertEqual(
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


function ConfirmationProposalContractTest_assertTrue(
  condition,
  label
) {

  if (
    condition !==
      true
  ) {

    throw new Error(
      label
    );

  }

}


function ConfirmationProposalContractTest_assertThrows(
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


