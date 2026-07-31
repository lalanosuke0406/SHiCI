/*
=========================================
SHiCI
107_ConfirmationExecutionEngineTest.js

Confirmation Execution Engine
Version 1.0 Integration Test

役割：
・confirm操作を確認する
・reject操作を確認する
・Pending Change Storeの原本が使用されることを確認する
・処理後に確認待ちデータが削除されることを確認する
・同一Proposalの二重操作を拒否することを確認する
・不正なactionTypeを拒否することを確認する

禁止：
・Spreadsheetを更新しない
・Execution Planを生成しない
・Change Planを実行しない
・標準条件を切り替えない
・新しい条件IDを採番しない
・OpenAI APIを呼び出さない
=========================================
*/


/*
=========================================
Test Runner
=========================================
*/

function ConfirmationExecutionEngineTest_runAll() {

  const tests = [

    {
      name:
        "confirmPendingChange",
      run:
        ConfirmationExecutionEngineTest_confirmPendingChange
    },

    {
      name:
        "rejectPendingChange",
      run:
        ConfirmationExecutionEngineTest_rejectPendingChange
    },

    {
      name:
        "confirmedResultUsesStoredOriginal",
      run:
        ConfirmationExecutionEngineTest_confirmedResultUsesStoredOriginal
    },

    {
      name:
        "confirmRemovesPendingChange",
      run:
        ConfirmationExecutionEngineTest_confirmRemovesPendingChange
    },

    {
      name:
        "rejectRemovesPendingChange",
      run:
        ConfirmationExecutionEngineTest_rejectRemovesPendingChange
    },

    {
      name:
        "duplicateConfirmIsRejected",
      run:
        ConfirmationExecutionEngineTest_duplicateConfirmIsRejected
    },

    {
      name:
        "confirmAfterRejectIsRejected",
      run:
        ConfirmationExecutionEngineTest_confirmAfterRejectIsRejected
    },

    {
      name:
        "wrongChangePlanIdIsRejected",
      run:
        ConfirmationExecutionEngineTest_wrongChangePlanIdIsRejected
    },

    {
      name:
        "unsupportedActionIsRejected",
      run:
        ConfirmationExecutionEngineTest_unsupportedActionIsRejected
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
      "Confirmation Execution Engine Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[Confirmation Execution Engine Ver.1.0 Test Passed]"
  );

}


/*
=========================================
Confirm
=========================================
*/

/**
 * confirm操作によって
 * confirmed結果が返ることを確認する。
 */
function ConfirmationExecutionEngineTest_confirmPendingChange() {

  const fixture =
    ConfirmationExecutionEngineTest_createStoredFixture();


  const result =
    ConfirmationExecutionEngine_confirm(
      fixture.proposal.proposalId,
      fixture.changePlan.changePlanId,
      {
        source:
          "integration_test",

        decidedBy:
          "USER_TEST_001",

        requestId:
          "REQUEST_CONFIRM_TEST_001"
      }
    );


  ConfirmationExecutionEngineTest_assertEqual(
    result.schemaVersion,
    "1.0",
    "result.schemaVersion"
  );


  ConfirmationExecutionEngineTest_assertEqual(
    result.engineVersion,
    "1.0",
    "result.engineVersion"
  );


  ConfirmationExecutionEngineTest_assertEqual(
    result.status,
    "confirmed",
    "result.status"
  );


  ConfirmationExecutionEngineTest_assertEqual(
    result.actionType,
    "confirm",
    "result.actionType"
  );


  ConfirmationExecutionEngineTest_assertEqual(
    result.proposalId,
    fixture.proposal.proposalId,
    "result.proposalId"
  );


  ConfirmationExecutionEngineTest_assertEqual(
    result.changePlanId,
    fixture.changePlan.changePlanId,
    "result.changePlanId"
  );


  ConfirmationExecutionEngineTest_assertDeepEqual(
    result.changePlan,
    fixture.changePlan,
    "result.changePlan"
  );


  ConfirmationExecutionEngineTest_assertDeepEqual(
    result.subject,
    fixture.proposal.subject,
    "result.subject"
  );


  ConfirmationExecutionEngineTest_assertNonEmptyString(
    result.decidedAt,
    "result.decidedAt"
  );


  ConfirmationExecutionEngineTest_assertEqual(
    result.metadata.source,
    "integration_test",
    "result.metadata.source"
  );


  ConfirmationExecutionEngineTest_assertEqual(
    result.metadata.decidedBy,
    "USER_TEST_001",
    "result.metadata.decidedBy"
  );


  ConfirmationExecutionEngineTest_assertEqual(
    result.metadata.requestId,
    "REQUEST_CONFIRM_TEST_001",
    "result.metadata.requestId"
  );


  ConfirmationExecutionEngine_validateConfirmedResult(
    result
  );

}


/*
=========================================
Reject
=========================================
*/

/**
 * reject操作によって
 * rejected結果が返ることを確認する。
 */
function ConfirmationExecutionEngineTest_rejectPendingChange() {

  const fixture =
    ConfirmationExecutionEngineTest_createStoredFixture();


  const result =
    ConfirmationExecutionEngine_reject(
      fixture.proposal.proposalId,
      fixture.changePlan.changePlanId,
      {
        source:
          "integration_test",

        decidedBy:
          "USER_TEST_002",

        requestId:
          "REQUEST_REJECT_TEST_001"
      }
    );


  ConfirmationExecutionEngineTest_assertEqual(
    result.schemaVersion,
    "1.0",
    "result.schemaVersion"
  );


  ConfirmationExecutionEngineTest_assertEqual(
    result.engineVersion,
    "1.0",
    "result.engineVersion"
  );


  ConfirmationExecutionEngineTest_assertEqual(
    result.status,
    "rejected",
    "result.status"
  );


  ConfirmationExecutionEngineTest_assertEqual(
    result.actionType,
    "reject",
    "result.actionType"
  );


  ConfirmationExecutionEngineTest_assertEqual(
    result.proposalId,
    fixture.proposal.proposalId,
    "result.proposalId"
  );


  ConfirmationExecutionEngineTest_assertEqual(
    result.changePlanId,
    fixture.changePlan.changePlanId,
    "result.changePlanId"
  );


  ConfirmationExecutionEngineTest_assertDeepEqual(
    result.subject,
    fixture.proposal.subject,
    "result.subject"
  );


  ConfirmationExecutionEngineTest_assertNonEmptyString(
    result.decidedAt,
    "result.decidedAt"
  );


  ConfirmationExecutionEngineTest_assertEqual(
    result.metadata.source,
    "integration_test",
    "result.metadata.source"
  );


  ConfirmationExecutionEngineTest_assertEqual(
    result.metadata.decidedBy,
    "USER_TEST_002",
    "result.metadata.decidedBy"
  );


  ConfirmationExecutionEngineTest_assertEqual(
    result.metadata.requestId,
    "REQUEST_REJECT_TEST_001",
    "result.metadata.requestId"
  );


  ConfirmationExecutionEngineTest_assertEqual(
    Object.prototype.hasOwnProperty.call(
      result,
      "changePlan"
    ),
    false,
    "rejected result has changePlan"
  );


  ConfirmationExecutionEngine_validateRejectedResult(
    result
  );

}


/*
=========================================
Stored Original
=========================================
*/

/**
 * confirm結果が、フロントエンド由来の値ではなく、
 * Storeに保存された原本を使用することを確認する。
 */
function ConfirmationExecutionEngineTest_confirmedResultUsesStoredOriginal() {

  const fixture =
    ConfirmationExecutionEngineTest_createStoredFixture();


  const storedEntry =
    PendingChangeStore_get(
      fixture.proposal.proposalId,
      fixture.changePlan.changePlanId
    );


  const expectedChangePlanJson =
    JSON.stringify(
      storedEntry.changePlan
    );


  const result =
    ConfirmationExecutionEngine_execute(
      fixture.proposal.proposalId,
      fixture.changePlan.changePlanId,
      "confirm",
      {
        source:
          "frontend",

        decidedBy:
          "USER_TEST_003"
      }
    );


  ConfirmationExecutionEngineTest_assertEqual(
    JSON.stringify(
      result.changePlan
    ),
    expectedChangePlanJson,
    "stored original changePlan"
  );


  const temperatureChange =
    result.changePlan.changes[0];


  ConfirmationExecutionEngineTest_assertEqual(
    temperatureChange.path,
    "standard_condition.mold_temperature",
    "temperatureChange.path"
  );


  ConfirmationExecutionEngineTest_assertEqual(
    temperatureChange.before,
    60,
    "temperatureChange.before"
  );


  ConfirmationExecutionEngineTest_assertEqual(
    temperatureChange.after,
    61,
    "temperatureChange.after"
  );

}


/*
=========================================
Store Consumption
=========================================
*/

/**
 * confirm後にStoreから削除されることを確認する。
 */
function ConfirmationExecutionEngineTest_confirmRemovesPendingChange() {

  const fixture =
    ConfirmationExecutionEngineTest_createStoredFixture();


  ConfirmationExecutionEngine_confirm(
    fixture.proposal.proposalId,
    fixture.changePlan.changePlanId
  );


  ConfirmationExecutionEngineTest_assertEqual(
    PendingChangeStore_exists(
      fixture.proposal.proposalId
    ),
    false,
    "exists after confirm"
  );

}


/**
 * reject後にStoreから削除されることを確認する。
 */
function ConfirmationExecutionEngineTest_rejectRemovesPendingChange() {

  const fixture =
    ConfirmationExecutionEngineTest_createStoredFixture();


  ConfirmationExecutionEngine_reject(
    fixture.proposal.proposalId,
    fixture.changePlan.changePlanId
  );


  ConfirmationExecutionEngineTest_assertEqual(
    PendingChangeStore_exists(
      fixture.proposal.proposalId
    ),
    false,
    "exists after reject"
  );

}


/*
=========================================
Duplicate Operation
=========================================
*/

/**
 * 同じProposalを二度confirmできないことを確認する。
 */
function ConfirmationExecutionEngineTest_duplicateConfirmIsRejected() {

  const fixture =
    ConfirmationExecutionEngineTest_createStoredFixture();


  ConfirmationExecutionEngine_confirm(
    fixture.proposal.proposalId,
    fixture.changePlan.changePlanId
  );


  ConfirmationExecutionEngineTest_assertThrows(
    function() {

      ConfirmationExecutionEngine_confirm(
        fixture.proposal.proposalId,
        fixture.changePlan.changePlanId
      );

    },
    "確認待ちデータが見つかりません"
  );

}


/**
 * reject済みのProposalを
 * confirmできないことを確認する。
 */
function ConfirmationExecutionEngineTest_confirmAfterRejectIsRejected() {

  const fixture =
    ConfirmationExecutionEngineTest_createStoredFixture();


  ConfirmationExecutionEngine_reject(
    fixture.proposal.proposalId,
    fixture.changePlan.changePlanId
  );


  ConfirmationExecutionEngineTest_assertThrows(
    function() {

      ConfirmationExecutionEngine_confirm(
        fixture.proposal.proposalId,
        fixture.changePlan.changePlanId
      );

    },
    "確認待ちデータが見つかりません"
  );

}


/*
=========================================
Invalid Request
=========================================
*/

/**
 * 異なるchangePlanIdでは
 * 操作できないことを確認する。
 */
function ConfirmationExecutionEngineTest_wrongChangePlanIdIsRejected() {

  const fixture =
    ConfirmationExecutionEngineTest_createStoredFixture();


  try {

    ConfirmationExecutionEngineTest_assertThrows(
      function() {

        ConfirmationExecutionEngine_confirm(
          fixture.proposal.proposalId,
          "CHANGE_PLAN_WRONG_ID"
        );

      },
      "changePlanIdが一致しません"
    );

  } finally {

    ConfirmationExecutionEngineTest_cleanup(
      fixture
    );

  }

}


/**
 * 未対応のactionTypeを拒否することを確認する。
 */
function ConfirmationExecutionEngineTest_unsupportedActionIsRejected() {

  const fixture =
    ConfirmationExecutionEngineTest_createStoredFixture();


  try {

    ConfirmationExecutionEngineTest_assertThrows(
      function() {

        ConfirmationExecutionEngine_execute(
          fixture.proposal.proposalId,
          fixture.changePlan.changePlanId,
          "approve"
        );

      },
      "未対応の確認操作"
    );

  } finally {

    ConfirmationExecutionEngineTest_cleanup(
      fixture
    );

  }

}


/*
=========================================
Integration Fixture
=========================================
*/

/**
 * 実際の処理経路から
 * Change PlanとProposalを生成し、
 * Pending Change Storeへ保存する。
 *
 * @return {Object}
 */
function ConfirmationExecutionEngineTest_createStoredFixture() {

  const mutation =
    EntityMutationContract_createEmpty();


  mutation.mutationId =
    "MUTATION_CONFIRM_EXECUTION_TEST_" +
    Utilities
      .getUuid()
      .replace(
        /-/g,
        ""
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
    new Date()
      .toISOString();


  EntityMutationContract_validate(
    mutation
  );


  const resolutionResult =
    EntityMutationResolutionEngine_resolve(
      mutation
    );


  ConfirmationExecutionEngineTest_assertEqual(
    resolutionResult.status,
    "resolved",
    "resolutionResult.status"
  );


  const changePlan =
    ChangePlanEngine_build(
      resolutionResult
    );


  const proposal =
    ConfirmationProposalEngine_build(
      changePlan
    );


  PendingChangeStore_save(
    changePlan,
    proposal
  );


  return {

    changePlan:
      changePlan,

    proposal:
      proposal

  };

}


/*
=========================================
Cleanup
=========================================
*/

/**
 * テスト中にEntryが残った場合のみ削除する。
 *
 * @param {Object} fixture
 */
function ConfirmationExecutionEngineTest_cleanup(
  fixture
) {

  if (
    !fixture ||
    !fixture.proposal ||
    typeof fixture.proposal.proposalId !==
      "string"
  ) {

    return;

  }


  const proposalId =
    fixture.proposal.proposalId;


  if (
    PendingChangeStore_exists(
      proposalId
    )
  ) {

    const key =
      PendingChangeStore_buildCacheKey(
        proposalId
      );


    PendingChangeStore_getCache()
      .remove(
        key
      );

  }

}


/*
=========================================
Assertion
=========================================
*/

function ConfirmationExecutionEngineTest_assertEqual(
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


function ConfirmationExecutionEngineTest_assertDeepEqual(
  actual,
  expected,
  label
) {

  const actualJson =
    JSON.stringify(
      actual
    );


  const expectedJson =
    JSON.stringify(
      expected
    );


  if (
    actualJson !==
      expectedJson
  ) {

    throw new Error(
      label +
      " expected=" +
      expectedJson +
      " actual=" +
      actualJson
    );

  }

}


function ConfirmationExecutionEngineTest_assertNonEmptyString(
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


function ConfirmationExecutionEngineTest_assertThrows(
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



