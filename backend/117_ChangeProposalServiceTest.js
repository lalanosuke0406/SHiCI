/*
=========================================
SHiCI
117_ChangeProposalServiceTest.js

Change Proposal Service Test
Version 1.0

役割：
・Understanding Resultから
  Confirmation Proposalまでの経路を検証する
・Pending Changeが正しく保存されることを確認する
・Spreadsheetは更新しない
・作成したPending Changeはテスト後に削除する
=========================================
*/


/*
=========================================
Test Runner
=========================================
*/

/**
 * ChangeProposalServiceの全テストを実行する。
 */
function test_ChangeProposalService_runAll() {

  const tests = [

    {
      name:
        "proposalCreated",
      run:
        test_ChangeProposalService_proposalCreated
    },

    {
      name:
        "changePlanAndProposalAreConsistent",
      run:
        test_ChangeProposalService_changePlanAndProposalAreConsistent
    },

    {
      name:
        "pendingChangeIsStored",
      run:
        test_ChangeProposalService_pendingChangeIsStored
    },

    {
      name:
        "metadataIsApplied",
      run:
        test_ChangeProposalService_metadataIsApplied
    },

    {
      name:
        "inputsAreNotModified",
      run:
        test_ChangeProposalService_inputsAreNotModified
    },

    {
      name:
        "unsupportedEntityType",
      run:
        test_ChangeProposalService_unsupportedEntityType
    },

    {
      name:
        "entityNotFound",
      run:
        test_ChangeProposalService_entityNotFound
    },

    {
      name:
        "invalidIntentIsRejected",
      run:
        test_ChangeProposalService_invalidIntentIsRejected
    }

  ];


  const failures =
    [];


  console.log(
    "========================================="
  );

  console.log(
    "ChangeProposalService Test Start"
  );

  console.log(
    "========================================="
  );


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
      "ChangeProposalService Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[Change Proposal Service Ver.1.0 Test Passed]"
  );

}


/*
=========================================
Proposal Created
=========================================
*/

/**
 * 正常な金型温度変更要求から、
 * Confirmation Proposalが生成されることを確認する。
 */
function test_ChangeProposalService_proposalCreated() {

  const understandingResult =
    ChangeProposalServiceTest_createMoldTemperatureUnderstandingResult(
      "ワンワン",
      61
    );


  let result =
    null;


  try {

    result =
      ChangeProposalService_create(
        understandingResult,
        {

          requestedBy:
            "USER_CHANGE_PROPOSAL_TEST",

          requestedAt:
            "2026-08-05T01:00:00.000Z",

          requestId:
            "REQUEST_CHANGE_PROPOSAL_TEST_001",

          source:
            "change_proposal_service_test"

        }
      );


    ChangeProposalServiceTest_assertEquals(
      CHANGE_PROPOSAL_SERVICE_STATUS_CREATED,
      result.status,
      "result.status"
    );


    ChangeProposalServiceTest_assertEquals(
      true,
      result.requiresConfirmation,
      "result.requiresConfirmation"
    );


    ChangeProposalServiceTest_assertNonEmptyString(
      result.proposalId,
      "result.proposalId"
    );


    ChangeProposalServiceTest_assertNonEmptyString(
      result.changePlanId,
      "result.changePlanId"
    );


    ChangeProposalServiceTest_assertObject(
      result.subject,
      "result.subject"
    );


    ChangeProposalServiceTest_assertEquals(
      "product",
      result.subject.entityType,
      "result.subject.entityType"
    );


    ChangeProposalServiceTest_assertEquals(
      "P-000035",
      result.subject.entityId,
      "result.subject.entityId"
    );


    ChangeProposalServiceTest_assertObject(
      result.presentation,
      "result.presentation"
    );


    ChangeProposalServiceTest_assertNonEmptyString(
      result.presentation.title,
      "result.presentation.title"
    );


    ChangeProposalServiceTest_assertNonEmptyString(
      result.presentation.message,
      "result.presentation.message"
    );


    ChangeProposalServiceTest_assertTrue(
      Array.isArray(
        result.presentation.changes
      ),
      "result.presentation.changes"
    );


    ChangeProposalServiceTest_assertTrue(
      result.presentation.changes.length >
        0,
      "result.presentation.changes.length"
    );


    ChangeProposalServiceTest_assertTrue(
      Array.isArray(
        result.presentation.actions
      ),
      "result.presentation.actions"
    );


    ChangeProposalServiceTest_assertEquals(
      2,
      result.presentation.actions.length,
      "result.presentation.actions.length"
    );


    ChangeProposalServiceTest_assertEquals(
      "confirm",
      result.presentation.actions[0].actionType,
      "result.presentation.actions[0].actionType"
    );


    ChangeProposalServiceTest_assertEquals(
      "reject",
      result.presentation.actions[1].actionType,
      "result.presentation.actions[1].actionType"
    );


    ChangeProposalServiceTest_assertEquals(
      true,
      ChangeProposalService_validateResult(
        result
      ),
      "ChangeProposalService_validateResult"
    );

  } finally {

    ChangeProposalServiceTest_removePendingResult(
      result
    );

  }

}


/*
=========================================
Change Plan / Proposal Consistency
=========================================
*/

/**
 * Service Result内のChange Planと
 * Confirmation ProposalのID・対象・変更内容が
 * 整合していることを確認する。
 */
function test_ChangeProposalService_changePlanAndProposalAreConsistent() {

  const understandingResult =
    ChangeProposalServiceTest_createMoldTemperatureUnderstandingResult(
      "ワンワン",
      62
    );


  let result =
    null;


  try {

    result =
      ChangeProposalService_create(
        understandingResult,
        {

          requestedBy:
            "USER_CHANGE_PROPOSAL_TEST",

          requestId:
            "REQUEST_CHANGE_PROPOSAL_TEST_002"

        }
      );


    ChangeProposalServiceTest_assertEquals(
      CHANGE_PROPOSAL_SERVICE_STATUS_CREATED,
      result.status,
      "result.status"
    );


    ChangeProposalServiceTest_assertObject(
      result.changePlan,
      "result.changePlan"
    );


    ChangeProposalServiceTest_assertObject(
      result.proposal,
      "result.proposal"
    );


    ChangePlanContract_validate(
      result.changePlan
    );


    ConfirmationProposalContract_validate(
      result.proposal
    );


    ChangeProposalServiceTest_assertEquals(
      result.changePlanId,
      result.changePlan.changePlanId,
      "changePlanId / changePlan.changePlanId"
    );


    ChangeProposalServiceTest_assertEquals(
      result.changePlanId,
      result.proposal.changePlanId,
      "changePlanId / proposal.changePlanId"
    );


    ChangeProposalServiceTest_assertEquals(
      result.proposalId,
      result.proposal.proposalId,
      "proposalId / proposal.proposalId"
    );


    ChangeProposalServiceTest_assertEquals(
      "ready_for_confirmation",
      result.changePlan.status,
      "changePlan.status"
    );


    ChangeProposalServiceTest_assertEquals(
      "pending",
      result.proposal.status,
      "proposal.status"
    );


    ChangeProposalServiceTest_assertEquals(
      true,
      result.changePlan.confirmation.required,
      "changePlan.confirmation.required"
    );


    ChangeProposalServiceTest_assertEquals(
      false,
      result.changePlan.executable,
      "changePlan.executable"
    );


    ChangeProposalServiceTest_assertEquals(
      "product",
      result.changePlan.subject.entityType,
      "changePlan.subject.entityType"
    );


    ChangeProposalServiceTest_assertEquals(
      "P-000035",
      result.changePlan.subject.entityId,
      "changePlan.subject.entityId"
    );


    ChangeProposalServiceTest_assertEquals(
      result.changePlan.subject.entityId,
      result.proposal.subject.entityId,
      "subject.entityId consistency"
    );


    ChangeProposalServiceTest_assertEquals(
      1,
      result.changePlan.changes.length,
      "changePlan.changes.length"
    );


    ChangeProposalServiceTest_assertEquals(
      "standard_condition.mold_temperature",
      result.changePlan.changes[0].path,
      "changePlan.changes[0].path"
    );


    ChangeProposalServiceTest_assertEquals(
        result
            .changePlan
            .currentSnapshot
            .conditionDetail["金型温度(℃)"],
        result.changePlan.changes[0].before,
        "changePlan.changes[0].before"
    );


    ChangeProposalServiceTest_assertEquals(
        62,
        result.changePlan.changes[0].after,
        "changePlan.changes[0].after"
    );


    ChangeProposalServiceTest_assertEquals(
      "celsius",
      result.changePlan.changes[0].unit,
      "changePlan.changes[0].unit"
    );


    ChangeProposalServiceTest_assertEquals(
      result.proposalId,
      result.payload.proposalId,
      "payload.proposalId"
    );


    ChangeProposalServiceTest_assertEquals(
      result.changePlanId,
      result.payload.changePlanId,
      "payload.changePlanId"
    );

  } finally {

    ChangeProposalServiceTest_removePendingResult(
      result
    );

  }

}


/*
=========================================
Pending Change Store
=========================================
*/

/**
 * 生成されたChange PlanとProposalが
 * Pending Change Storeへ保存されることを確認する。
 */
function test_ChangeProposalService_pendingChangeIsStored() {

  const understandingResult =
    ChangeProposalServiceTest_createMoldTemperatureUnderstandingResult(
      "ワンワン",
      63
    );


  let result =
    null;


  try {

    result =
      ChangeProposalService_create(
        understandingResult,
        {

          requestedBy:
            "USER_CHANGE_PROPOSAL_TEST",

          requestId:
            "REQUEST_CHANGE_PROPOSAL_TEST_003"

        }
      );


    ChangeProposalServiceTest_assertEquals(
      CHANGE_PROPOSAL_SERVICE_STATUS_CREATED,
      result.status,
      "result.status"
    );


    ChangeProposalServiceTest_assertEquals(
      true,
      PendingChangeStore_exists(
        result.proposalId
      ),
      "PendingChangeStore_exists"
    );


    const pendingEntry =
      PendingChangeStore_get(
        result.proposalId,
        result.changePlanId
      );


    ChangeProposalServiceTest_assertEquals(
      "pending",
      pendingEntry.status,
      "pendingEntry.status"
    );


    ChangeProposalServiceTest_assertEquals(
      result.proposalId,
      pendingEntry.proposalId,
      "pendingEntry.proposalId"
    );


    ChangeProposalServiceTest_assertEquals(
      result.changePlanId,
      pendingEntry.changePlanId,
      "pendingEntry.changePlanId"
    );


    ChangeProposalServiceTest_assertDeepEquals(
      result.changePlan,
      pendingEntry.changePlan,
      "pendingEntry.changePlan"
    );


    ChangeProposalServiceTest_assertDeepEquals(
      result.proposal,
      pendingEntry.proposal,
      "pendingEntry.proposal"
    );


    ChangeProposalServiceTest_assertEquals(
      "stored",
      result.pending.status,
      "result.pending.status"
    );


    ChangeProposalServiceTest_assertNonEmptyString(
      result.pending.storedAt,
      "result.pending.storedAt"
    );


    ChangeProposalServiceTest_assertNonEmptyString(
      result.pending.expiresAt,
      "result.pending.expiresAt"
    );

  } finally {

    ChangeProposalServiceTest_removePendingResult(
      result
    );

  }

}


/*
=========================================
Metadata
=========================================
*/

/**
 * Serviceへ渡したMetadataが、
 * Entity MutationおよびChange Planへ反映されることを確認する。
 */
function test_ChangeProposalService_metadataIsApplied() {

  const understandingResult =
    ChangeProposalServiceTest_createMoldTemperatureUnderstandingResult(
      "ワンワン",
      64
    );


  const metadata = {

    requestedBy:
      "USER_METADATA_CHANGE_PROPOSAL_TEST",

    requestedAt:
      "2026-08-05T02:03:04.000Z",

    requestId:
      "REQUEST_CHANGE_PROPOSAL_METADATA_TEST",

    source:
      "change_proposal_service_test"

  };


  let result =
    null;


  try {

    result =
      ChangeProposalService_create(
        understandingResult,
        metadata
      );


    ChangeProposalServiceTest_assertEquals(
      CHANGE_PROPOSAL_SERVICE_STATUS_CREATED,
      result.status,
      "result.status"
    );


    ChangeProposalServiceTest_assertEquals(
      "USER_METADATA_CHANGE_PROPOSAL_TEST",
      result.mutation.metadata.requestedBy,
      "mutation.metadata.requestedBy"
    );


    ChangeProposalServiceTest_assertEquals(
      "2026-08-05T02:03:04.000Z",
      result.mutation.metadata.requestedAt,
      "mutation.metadata.requestedAt"
    );


    ChangeProposalServiceTest_assertEquals(
      "understanding_result",
      result.mutation.metadata.source,
      "mutation.metadata.source"
    );


    ChangeProposalServiceTest_assertEquals(
      "USER_METADATA_CHANGE_PROPOSAL_TEST",
      result.changePlan.metadata.requestedBy,
      "changePlan.metadata.requestedBy"
    );


    ChangeProposalServiceTest_assertEquals(
      "2026-08-05T02:03:04.000Z",
      result.changePlan.metadata.requestedAt,
      "changePlan.metadata.requestedAt"
    );


    ChangeProposalServiceTest.assertNonNullDateString(
      result.changePlan.metadata.generatedAt,
      "changePlan.metadata.generatedAt"
    );

  } finally {

    ChangeProposalServiceTest_removePendingResult(
      result
    );

  }

}


/*
=========================================
Input Immutability
=========================================
*/

/**
 * Service実行によって、
 * Understanding ResultとMetadata原本が
 * 変更されないことを確認する。
 */
function test_ChangeProposalService_inputsAreNotModified() {

  const understandingResult =
    ChangeProposalServiceTest_createMoldTemperatureUnderstandingResult(
      "ワンワン",
      65
    );


  const metadata = {

    requestedBy:
      "USER_IMMUTABILITY_TEST",

    requestedAt:
      "2026-08-05T03:00:00.000Z",

    requestId:
      "REQUEST_CHANGE_PROPOSAL_IMMUTABILITY_TEST",

    source:
      "change_proposal_service_test"

  };


  const originalUnderstandingResultJson =
    JSON.stringify(
      understandingResult
    );


  const originalMetadataJson =
    JSON.stringify(
      metadata
    );


  let result =
    null;


  try {

    result =
      ChangeProposalService_create(
        understandingResult,
        metadata
      );


    ChangeProposalServiceTest_assertEquals(
      originalUnderstandingResultJson,
      JSON.stringify(
        understandingResult
      ),
      "understandingResult"
    );


    ChangeProposalServiceTest_assertEquals(
      originalMetadataJson,
      JSON.stringify(
        metadata
      ),
      "metadata"
    );

  } finally {

    ChangeProposalServiceTest_removePendingResult(
      result
    );

  }

}


/*
=========================================
Unsupported
=========================================
*/

/**
 * Product以外のEntity Type Hintは、
 * ProductMutationAdapterの対応外として
 * unsupported Resultになることを確認する。
 */
function test_ChangeProposalService_unsupportedEntityType() {

  const understandingResult =
    ChangeProposalServiceTest_createMoldTemperatureUnderstandingResult(
      "テスト金型",
      61
    );


  understandingResult.entity.entityTypeHint =
    "mold";


  UnderstandingResultContract_validate(
    understandingResult
  );


  const result =
    ChangeProposalService_create(
      understandingResult,
      {

        requestedBy:
          "USER_CHANGE_PROPOSAL_TEST"

      }
    );


  ChangeProposalServiceTest_assertEquals(
    CHANGE_PROPOSAL_SERVICE_STATUS_UNSUPPORTED,
    result.status,
    "result.status"
  );


  ChangeProposalServiceTest_assertEquals(
    null,
    result.proposalId,
    "result.proposalId"
  );


  ChangeProposalServiceTest_assertEquals(
    null,
    result.changePlanId,
    "result.changePlanId"
  );


  ChangeProposalServiceTest_assertEquals(
    false,
    result.requiresConfirmation,
    "result.requiresConfirmation"
  );


  ChangeProposalServiceTest.assertNull(
    result.presentation,
    "result.presentation"
  );


  ChangeProposalServiceTest_assertEquals(
    0,
    result.candidates.length,
    "result.candidates.length"
  );


  ChangeProposalServiceTest_assertNonEmptyString(
    result.message,
    "result.message"
  );


  ChangeProposalServiceTest_assertEquals(
    true,
    ChangeProposalService_validateResult(
      result
    ),
    "ChangeProposalService_validateResult"
  );

}


/*
=========================================
Not Found
=========================================
*/

/**
 * 存在しないProduct Queryの場合、
 * not_found Resultになることを確認する。
 */
function test_ChangeProposalService_entityNotFound() {

  const understandingResult =
    ChangeProposalServiceTest_createMoldTemperatureUnderstandingResult(
      "__SHICI_CHANGE_PROPOSAL_TEST_UNKNOWN_PRODUCT__",
      61
    );


  const originalJson =
    JSON.stringify(
      understandingResult
    );


  const result =
    ChangeProposalService_create(
      understandingResult,
      {

        requestedBy:
          "USER_CHANGE_PROPOSAL_TEST"

      }
    );


  ChangeProposalServiceTest_assertEquals(
    CHANGE_PROPOSAL_SERVICE_STATUS_NOT_FOUND,
    result.status,
    "result.status"
  );


  ChangeProposalServiceTest_assertEquals(
    null,
    result.proposalId,
    "result.proposalId"
  );


  ChangeProposalServiceTest_assertEquals(
    null,
    result.changePlanId,
    "result.changePlanId"
  );


  ChangeProposalServiceTest_assertEquals(
    false,
    result.requiresConfirmation,
    "result.requiresConfirmation"
  );


  ChangeProposalServiceTest.assertNull(
    result.presentation,
    "result.presentation"
  );


  ChangeProposalServiceTest.assertNull(
    result.pending,
    "result.pending"
  );


  ChangeProposalServiceTest.assertNull(
    result.changePlan,
    "result.changePlan"
  );


  ChangeProposalServiceTest.assertNull(
    result.proposal,
    "result.proposal"
  );


  ChangeProposalServiceTest_assertEquals(
    0,
    result.candidates.length,
    "result.candidates.length"
  );


  ChangeProposalServiceTest_assertObject(
    result.mutation,
    "result.mutation"
  );


  ChangeProposalServiceTest_assertEquals(
    "__SHICI_CHANGE_PROPOSAL_TEST_UNKNOWN_PRODUCT__",
    result.mutation.subject.entityQuery,
    "result.mutation.subject.entityQuery"
  );


  ChangeProposalServiceTest_assertEquals(
    originalJson,
    JSON.stringify(
      understandingResult
    ),
    "understandingResult"
  );


  ChangeProposalServiceTest_assertEquals(
    true,
    ChangeProposalService_validateResult(
      result
    ),
    "ChangeProposalService_validateResult"
  );

}


/*
=========================================
Invalid Intent
=========================================
*/

/**
 * Update Intent以外は、
 * ChangeProposalServiceの入力として拒否されることを確認する。
 */
function test_ChangeProposalService_invalidIntentIsRejected() {

  const understandingResult =
    ChangeProposalServiceTest_createMoldTemperatureUnderstandingResult(
      "ワンワン",
      61
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


  UnderstandingResultContract_validate(
    understandingResult
  );


  ChangeProposalServiceTest_assertThrows(

    function() {

      ChangeProposalService_create(
        understandingResult,
        null
      );

    },

    "Update Intentだけを受け付けます。",

    "invalid intent"

  );

}


/*
=========================================
Understanding Result Fixture
=========================================
*/

/**
 * 金型温度変更要求を表す
 * Understanding Result Ver.2.0を生成する。
 *
 * @param {string} entityQuery
 * @param {number} proposedValue
 * @return {Object}
 */
function ChangeProposalServiceTest_createMoldTemperatureUnderstandingResult(
  entityQuery,
  proposedValue
) {

  const originalText =
    String(
      entityQuery
    ) +
    "の型温を" +
    String(
      proposedValue
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
    proposedValue;


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
Pending Cleanup
=========================================
*/

/**
 * Testで作成したPending Changeを削除する。
 *
 * @param {Object|null} serviceResult
 */
function ChangeProposalServiceTest_removePendingResult(
  serviceResult
) {

  if (
    serviceResult ===
      null ||
    typeof serviceResult !==
      "object" ||
    Array.isArray(
      serviceResult
    )
  ) {

    return;

  }


  if (
    typeof serviceResult.proposalId !==
      "string" ||
    serviceResult.proposalId.trim() ===
      ""
  ) {

    return;

  }


  if (
    typeof serviceResult.changePlanId !==
      "string" ||
    serviceResult.changePlanId.trim() ===
      ""
  ) {

    return;

  }


  if (
    PendingChangeStore_exists(
      serviceResult.proposalId
    ) !==
      true
  ) {

    return;

  }


  PendingChangeStore_remove(
    serviceResult.proposalId,
    serviceResult.changePlanId
  );

}


/*
=========================================
Assertions
=========================================
*/

function ChangeProposalServiceTest_assertEquals(
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


function ChangeProposalServiceTest_assertDeepEquals(
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


function ChangeProposalServiceTest_assertTrue(
  actual,
  label
) {

  if (
    actual !==
      true
  ) {

    throw new Error(
      "[AssertTrue Failed] " +
      label +
      " actual=" +
      JSON.stringify(
        actual
      )
    );

  }

}


function ChangeProposalServiceTest_assertObject(
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
      label
    );

  }

}


function ChangeProposalServiceTest_assertNonEmptyString(
  actual,
  label
) {

  if (
    typeof actual !==
      "string" ||
    actual.trim() ===
      ""
  ) {

    throw new Error(
      "[AssertNonEmptyString Failed] " +
      label +
      " actual=" +
      JSON.stringify(
        actual
      )
    );

  }

}


/**
 * 例外が発生することを確認する。
 *
 * @param {Function} callback
 * @param {string|null} expectedMessage
 * @param {string} label
 */
function ChangeProposalServiceTest_assertThrows(
  callback,
  expectedMessage,
  label
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
      "[AssertThrows Failed] " +
      label +
      " 例外が発生しませんでした。"
    );

  }


  if (
    expectedMessage !==
      null
  ) {

    const actualMessage =
      thrownError &&
      typeof thrownError.message ===
        "string"
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
        "[AssertThrows Failed] " +
        label +
        " expectedMessage=" +
        JSON.stringify(
          expectedMessage
        ) +
        " actualMessage=" +
        JSON.stringify(
          actualMessage
        )
      );

    }

  }

}


/*
=========================================
Small Assertion Namespace
=========================================

Apps ScriptのGlobal名前空間を増やしすぎないため、
補助的な2関数だけObjectへまとめる。
=========================================
*/

const ChangeProposalServiceTest = {

  assertNull:
    function(
      actual,
      label
    ) {

      if (
        actual !==
          null
      ) {

        throw new Error(
          "[AssertNull Failed] " +
          label +
          " actual=" +
          JSON.stringify(
            actual
          )
        );

      }

    },


  assertNonNullDateString:
    function(
      actual,
      label
    ) {

      ChangeProposalServiceTest_assertNonEmptyString(
        actual,
        label
      );


      if (
        Number.isNaN(
          new Date(
            actual
          ).getTime()
        )
      ) {

        throw new Error(
          "[AssertDateString Failed] " +
          label +
          " actual=" +
          JSON.stringify(
            actual
          )
        );

      }

    }

};