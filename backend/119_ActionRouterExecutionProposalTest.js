/*
=========================================
SHiCI
119_ActionRouterExecutionProposalTest.js

Action Router Execution Proposal Test
Version 1.0

役割：
・ActionRouterからActionExecutionServiceへの
  Confirmation実行経路を検証する
・認証済みユーザー情報のMetadata伝播を確認する
・入力原本の不変性を確認する

本番Spreadsheet・Pending Change Storeは使用しない。
AuthorizationEngineとActionExecutionServiceを
テスト中だけOverrideする。
=========================================
*/


/*
=========================================
Test Runner
=========================================
*/

/**
 * ActionRouter Execution Proposalの
 * 全テストを実行する。
 */
function test_ActionRouterExecutionProposal_runAll() {

  const tests = [

    {
      name:
        "dispatchesConfirmExecutionProposal",
      run:
        test_ActionRouterExecutionProposal_dispatchesConfirmExecutionProposal
    },

    {
      name:
        "passesAuthenticatedUserMetadata",
      run:
        test_ActionRouterExecutionProposal_passesAuthenticatedUserMetadata
    },

    {
      name:
        "inputIsNotModified",
      run:
        test_ActionRouterExecutionProposal_inputIsNotModified
    }

  ];


  const failures =
    [];


  console.log(
    "========================================="
  );

  console.log(
    "ActionRouter ExecutionProposal Test Start"
  );

  console.log(
    "========================================="
  );


  tests.forEach(
    function(test) {

      try {

        ActionRouterExecutionProposalTest_clearOverrides();


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

        ActionRouterExecutionProposalTest_clearOverrides();

      }

    }
  );


  if (
    failures.length >
      0
  ) {

    throw new Error(
      "ActionRouter ExecutionProposal Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[Action Router Execution Proposal Ver.1.0 Test Passed]"
  );

}


/*
=========================================
Dispatch
=========================================
*/

/**
 * confirmExecutionProposal Actionが、
 * ActionExecutionService_execute()へ
 * 正しく振り分けられることを確認する。
 */
function test_ActionRouterExecutionProposal_dispatchesConfirmExecutionProposal() {

  const expectedServiceResult = {

    schemaVersion:
      "1.0",

    serviceVersion:
      "1.0",

    actionType:
      ACTION_EXECUTION_SERVICE_ACTION_CONFIRM,

    status:
      ACTION_EXECUTION_SERVICE_STATUS_COMPLETED,

    proposalId:
      "PROPOSAL-ACTION-ROUTER-EXECUTION-TEST-001",

    changePlanId:
      "CHANGE-PLAN-ACTION-ROUTER-EXECUTION-TEST-001",

    executionPlanId:
      "EXECUTION-PLAN-ACTION-ROUTER-EXECUTION-TEST-001",

    executionResultId:
      "EXECUTION-RESULT-ACTION-ROUTER-EXECUTION-TEST-001",

    executionStatus:
      EXECUTION_RESULT_STATUS_SUCCESS

  };


  let capturedActionRequest =
    null;


  ActionRouterExecutionProposalTest_setAuthorizationOverride(
    ActionRouterExecutionProposalTest_createAuthenticatedUser()
  );


  ActionRouterExecutionProposalTest_setServiceOverride(
    function(actionRequest) {

      capturedActionRequest =
        ActionRouterExecutionProposalTest_deepCopy(
          actionRequest
        );


      return ActionRouterExecutionProposalTest_deepCopy(
        expectedServiceResult
      );

    }
  );


  const result =
    ActionRouter_routePost({

      action:
        "confirmExecutionProposal",

      sessionId:
        "SESSION-ACTION-ROUTER-EXECUTION-TEST-001",

      proposalId:
        "PROPOSAL-ACTION-ROUTER-EXECUTION-TEST-001",

      changePlanId:
        "CHANGE-PLAN-ACTION-ROUTER-EXECUTION-TEST-001",

      requestId:
        "REQUEST-ACTION-ROUTER-EXECUTION-TEST-001"

    });


  ActionRouterExecutionProposalTest_assertDeepEquals(
    expectedServiceResult,
    result,
    "router result"
  );


  ActionRouterExecutionProposalTest_assertObject(
    capturedActionRequest,
    "capturedActionRequest"
  );


  ActionRouterExecutionProposalTest_assertEquals(
    ACTION_EXECUTION_SERVICE_ACTION_CONFIRM,
    capturedActionRequest.actionType,
    "capturedActionRequest.actionType"
  );


  ActionRouterExecutionProposalTest_assertEquals(
    "PROPOSAL-ACTION-ROUTER-EXECUTION-TEST-001",
    capturedActionRequest.proposalId,
    "capturedActionRequest.proposalId"
  );


  ActionRouterExecutionProposalTest_assertEquals(
    "CHANGE-PLAN-ACTION-ROUTER-EXECUTION-TEST-001",
    capturedActionRequest.changePlanId,
    "capturedActionRequest.changePlanId"
  );

}


/*
=========================================
Metadata
=========================================
*/

/**
 * 認証済みUserとRequest情報が、
 * ActionExecutionService Metadataへ
 * 正しく渡されることを確認する。
 */
function test_ActionRouterExecutionProposal_passesAuthenticatedUserMetadata() {

  const authenticatedUser =
    ActionRouterExecutionProposalTest_createAuthenticatedUser();


  let capturedActionRequest =
    null;


  ActionRouterExecutionProposalTest_setAuthorizationOverride(
    authenticatedUser
  );


  ActionRouterExecutionProposalTest_setServiceOverride(
    function(actionRequest) {

      capturedActionRequest =
        ActionRouterExecutionProposalTest_deepCopy(
          actionRequest
        );


      return {

        schemaVersion:
          "1.0",

        serviceVersion:
          "1.0",

        actionType:
          ACTION_EXECUTION_SERVICE_ACTION_CONFIRM,

        status:
          ACTION_EXECUTION_SERVICE_STATUS_COMPLETED,

        proposalId:
          actionRequest.proposalId,

        changePlanId:
          actionRequest.changePlanId,

        executionPlanId:
          "EXECUTION-PLAN-ACTION-ROUTER-EXECUTION-TEST-002",

        executionResultId:
          "EXECUTION-RESULT-ACTION-ROUTER-EXECUTION-TEST-002",

        executionStatus:
          EXECUTION_RESULT_STATUS_SUCCESS

      };

    }
  );


  ActionRouter_routePost({

    action:
      "confirmExecutionProposal",

    sessionId:
      "SESSION-ACTION-ROUTER-EXECUTION-TEST-002",

    proposalId:
      "PROPOSAL-ACTION-ROUTER-EXECUTION-TEST-002",

    changePlanId:
      "CHANGE-PLAN-ACTION-ROUTER-EXECUTION-TEST-002",

    requestId:
      "REQUEST-ACTION-ROUTER-EXECUTION-TEST-002"

  });


  ActionRouterExecutionProposalTest_assertObject(
    capturedActionRequest,
    "capturedActionRequest"
  );


  ActionRouterExecutionProposalTest_assertObject(
    capturedActionRequest.metadata,
    "capturedActionRequest.metadata"
  );


  ActionRouterExecutionProposalTest_assertEquals(
    authenticatedUser.userId,
    capturedActionRequest.metadata.requestedBy,
    "metadata.requestedBy"
  );


  ActionRouterExecutionProposalTest_assertEquals(
    authenticatedUser.userId,
    capturedActionRequest.metadata.decidedBy,
    "metadata.decidedBy"
  );


  ActionRouterExecutionProposalTest_assertEquals(
    authenticatedUser.userId,
    capturedActionRequest.metadata.userId,
    "metadata.userId"
  );


  ActionRouterExecutionProposalTest_assertEquals(
    "REQUEST-ACTION-ROUTER-EXECUTION-TEST-002",
    capturedActionRequest.metadata.requestId,
    "metadata.requestId"
  );


  ActionRouterExecutionProposalTest_assertEquals(
    "action_router",
    capturedActionRequest.metadata.source,
    "metadata.source"
  );


  ActionRouterExecutionProposalTest_assertNonEmptyString(
    capturedActionRequest.metadata.requestedAt,
    "metadata.requestedAt"
  );


  ActionRouterExecutionProposalTest_assertTrue(
    !Number.isNaN(
      new Date(
        capturedActionRequest.metadata.requestedAt
      ).getTime()
    ),
    "metadata.requestedAt is ISO date"
  );

}


/*
=========================================
Input Immutability
=========================================
*/

/**
 * ActionRouter実行によって、
 * POST Data原本が変更されないことを確認する。
 */
function test_ActionRouterExecutionProposal_inputIsNotModified() {

  ActionRouterExecutionProposalTest_setAuthorizationOverride(
    ActionRouterExecutionProposalTest_createAuthenticatedUser()
  );


  ActionRouterExecutionProposalTest_setServiceOverride(
    function(actionRequest) {

      return {

        schemaVersion:
          "1.0",

        serviceVersion:
          "1.0",

        actionType:
          ACTION_EXECUTION_SERVICE_ACTION_CONFIRM,

        status:
          ACTION_EXECUTION_SERVICE_STATUS_COMPLETED,

        proposalId:
          actionRequest.proposalId,

        changePlanId:
          actionRequest.changePlanId,

        executionPlanId:
          "EXECUTION-PLAN-ACTION-ROUTER-EXECUTION-TEST-003",

        executionResultId:
          "EXECUTION-RESULT-ACTION-ROUTER-EXECUTION-TEST-003",

        executionStatus:
          EXECUTION_RESULT_STATUS_SUCCESS

      };

    }
  );


  const data = {

    action:
      "confirmExecutionProposal",

    sessionId:
      "SESSION-ACTION-ROUTER-EXECUTION-TEST-003",

    proposalId:
      "PROPOSAL-ACTION-ROUTER-EXECUTION-TEST-003",

    changePlanId:
      "CHANGE-PLAN-ACTION-ROUTER-EXECUTION-TEST-003",

    requestId:
      "REQUEST-ACTION-ROUTER-EXECUTION-TEST-003"

  };


  const originalJson =
    JSON.stringify(
      data
    );


  ActionRouter_routePost(
    data
  );


  ActionRouterExecutionProposalTest_assertEquals(
    originalJson,
    JSON.stringify(
      data
    ),
    "POST data"
  );

}


/*
=========================================
Fixture
=========================================
*/

/**
 * 認証済みEditor Userを生成する。
 *
 * @return {Object}
 */
function ActionRouterExecutionProposalTest_createAuthenticatedUser() {

  return {

    userId:
      "USER-ACTION-ROUTER-EXECUTION-TEST-001",

    email:
      "action-router-execution-test@example.com",

    name:
      "Action Router Execution Test User",

    nickName:
      "Execution Router Test",

    role:
      "EDITOR",

    status:
      "ACTIVE"

  };

}


/*
=========================================
Override
=========================================
*/

let ActionRouterExecutionProposalTest_originalRequireWritePermission =
  null;


let ActionRouterExecutionProposalTest_originalActionExecutionServiceExecute =
  null;


/**
 * AuthorizationEngineを差し替える。
 *
 * @param {Object} authenticatedUser
 */
function ActionRouterExecutionProposalTest_setAuthorizationOverride(
  authenticatedUser
) {

  ActionRouterExecutionProposalTest_assertObject(
    authenticatedUser,
    "authenticatedUser"
  );


  if (
    ActionRouterExecutionProposalTest_originalRequireWritePermission ===
      null
  ) {

    ActionRouterExecutionProposalTest_originalRequireWritePermission =
      AuthorizationEngine_requireWritePermission;

  }


  AuthorizationEngine_requireWritePermission =
    function(sessionId) {

      ActionRouterExecutionProposalTest_assertNonEmptyString(
        sessionId,
        "sessionId"
      );


      return ActionRouterExecutionProposalTest_deepCopy(
        authenticatedUser
      );

    };

}


/**
 * ActionExecutionService_executeを差し替える。
 *
 * @param {Function} callback
 */
function ActionRouterExecutionProposalTest_setServiceOverride(
  callback
) {

  if (
    typeof callback !==
      "function"
  ) {

    throw new Error(
      "callbackはFunctionである必要があります。"
    );

  }


  if (
    ActionRouterExecutionProposalTest_originalActionExecutionServiceExecute ===
      null
  ) {

    ActionRouterExecutionProposalTest_originalActionExecutionServiceExecute =
      ActionExecutionService_execute;

  }


  ActionExecutionService_execute =
    callback;

}


/**
 * 全Overrideを解除する。
 */
function ActionRouterExecutionProposalTest_clearOverrides() {

  if (
    ActionRouterExecutionProposalTest_originalRequireWritePermission !==
      null
  ) {

    AuthorizationEngine_requireWritePermission =
      ActionRouterExecutionProposalTest_originalRequireWritePermission;


    ActionRouterExecutionProposalTest_originalRequireWritePermission =
      null;

  }


  if (
    ActionRouterExecutionProposalTest_originalActionExecutionServiceExecute !==
      null
  ) {

    ActionExecutionService_execute =
      ActionRouterExecutionProposalTest_originalActionExecutionServiceExecute;


    ActionRouterExecutionProposalTest_originalActionExecutionServiceExecute =
      null;

  }

}


/*
=========================================
Assertions
=========================================
*/

function ActionRouterExecutionProposalTest_assertEquals(
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


function ActionRouterExecutionProposalTest_assertDeepEquals(
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


function ActionRouterExecutionProposalTest_assertTrue(
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


function ActionRouterExecutionProposalTest_assertObject(
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


function ActionRouterExecutionProposalTest_assertNonEmptyString(
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


function ActionRouterExecutionProposalTest_deepCopy(
  value
) {

  return JSON.parse(
    JSON.stringify(
      value
    )
  );

}