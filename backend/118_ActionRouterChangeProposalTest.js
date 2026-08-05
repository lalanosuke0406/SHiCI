/*
=========================================
SHiCI
118_ActionRouterChangeProposalTest.js

Action Router Change Proposal Test
Version 1.0

役割：
・ActionRouterからChangeProposalServiceへの
  新しいProposal生成経路を検証する
・認証済みユーザー情報のMetadata伝播を確認する
・入力原本の不変性を確認する

本番Spreadsheet・Pending Change Storeは使用しない。
AuthorizationEngineとChangeProposalServiceを
テスト中だけOverrideする。
=========================================
*/


/*
=========================================
Test Runner
=========================================
*/

/**
 * ActionRouter Change Proposalの
 * 全テストを実行する。
 */
function test_ActionRouterChangeProposal_runAll() {

  const tests = [

    {
      name:
        "dispatchesCreateChangeProposal",
      run:
        test_ActionRouterChangeProposal_dispatchesCreateChangeProposal
    },

    {
      name:
        "passesAuthenticatedUserMetadata",
      run:
        test_ActionRouterChangeProposal_passesAuthenticatedUserMetadata
    },

    {
      name:
        "inputIsNotModified",
      run:
        test_ActionRouterChangeProposal_inputIsNotModified
    }

  ];


  const failures =
    [];


  console.log(
    "========================================="
  );

  console.log(
    "ActionRouter ChangeProposal Test Start"
  );

  console.log(
    "========================================="
  );


  tests.forEach(
    function(test) {

      try {

        ActionRouterChangeProposalTest_clearOverrides();


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

        ActionRouterChangeProposalTest_clearOverrides();

      }

    }
  );


  if (
    failures.length >
      0
  ) {

    throw new Error(
      "ActionRouter ChangeProposal Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[Action Router Change Proposal Ver.1.0 Test Passed]"
  );

}


/*
=========================================
Dispatch
=========================================
*/

/**
 * createChangeProposal Actionが、
 * ChangeProposalService_create()へ
 * 正しく振り分けられることを確認する。
 */
function test_ActionRouterChangeProposal_dispatchesCreateChangeProposal() {

  const understandingResult =
    ActionRouterChangeProposalTest_createUnderstandingResult();


  const expectedServiceResult = {

    schemaVersion:
      "1.0",

    serviceVersion:
      "1.0",

    status:
      "proposal_created",

    proposalId:
      "PROPOSAL-ACTION-ROUTER-TEST-001",

    changePlanId:
      "CHANGE-PLAN-ACTION-ROUTER-TEST-001",

    requiresConfirmation:
      true

  };


  let capturedUnderstandingResult =
    null;


  let capturedMetadata =
    null;


  ActionRouterChangeProposalTest_setAuthorizationOverride(
    ActionRouterChangeProposalTest_createAuthenticatedUser()
  );


  ActionRouterChangeProposalTest_setServiceOverride(
    function(
      actualUnderstandingResult,
      actualMetadata
    ) {

      capturedUnderstandingResult =
        ActionRouterChangeProposalTest_deepCopy(
          actualUnderstandingResult
        );


      capturedMetadata =
        ActionRouterChangeProposalTest_deepCopy(
          actualMetadata
        );


      return ActionRouterChangeProposalTest_deepCopy(
        expectedServiceResult
      );

    }
  );


  const result =
    ActionRouter_routePost({

      action:
        "createChangeProposal",

      sessionId:
        "SESSION-ACTION-ROUTER-TEST-001",

      understandingResult:
        understandingResult,

      requestId:
        "REQUEST-ACTION-ROUTER-TEST-001"

    });


  ActionRouterChangeProposalTest_assertDeepEquals(
    expectedServiceResult,
    result,
    "router result"
  );


  ActionRouterChangeProposalTest_assertDeepEquals(
    understandingResult,
    capturedUnderstandingResult,
    "captured understandingResult"
  );


  ActionRouterChangeProposalTest_assertObject(
    capturedMetadata,
    "capturedMetadata"
  );

}


/*
=========================================
Metadata
=========================================
*/

/**
 * 認証済みUserとRequest情報が、
 * ChangeProposalService Metadataへ
 * 正しく渡されることを確認する。
 */
function test_ActionRouterChangeProposal_passesAuthenticatedUserMetadata() {

  const authenticatedUser =
    ActionRouterChangeProposalTest_createAuthenticatedUser();


  let capturedMetadata =
    null;


  ActionRouterChangeProposalTest_setAuthorizationOverride(
    authenticatedUser
  );


  ActionRouterChangeProposalTest_setServiceOverride(
    function(
      understandingResult,
      metadata
    ) {

      capturedMetadata =
        ActionRouterChangeProposalTest_deepCopy(
          metadata
        );


      return {

        schemaVersion:
          "1.0",

        serviceVersion:
          "1.0",

        status:
          "proposal_created",

        proposalId:
          "PROPOSAL-ACTION-ROUTER-TEST-002",

        changePlanId:
          "CHANGE-PLAN-ACTION-ROUTER-TEST-002",

        requiresConfirmation:
          true

      };

    }
  );


  ActionRouter_routePost({

    action:
      "createChangeProposal",

    sessionId:
      "SESSION-ACTION-ROUTER-TEST-002",

    understandingResult:
      ActionRouterChangeProposalTest_createUnderstandingResult(),

    requestId:
      "REQUEST-ACTION-ROUTER-TEST-002"

  });


  ActionRouterChangeProposalTest_assertEquals(
    authenticatedUser.userId,
    capturedMetadata.requestedBy,
    "metadata.requestedBy"
  );


  ActionRouterChangeProposalTest_assertEquals(
    authenticatedUser.userId,
    capturedMetadata.userId,
    "metadata.userId"
  );


  ActionRouterChangeProposalTest_assertEquals(
    "REQUEST-ACTION-ROUTER-TEST-002",
    capturedMetadata.requestId,
    "metadata.requestId"
  );


  ActionRouterChangeProposalTest_assertEquals(
    "action_router",
    capturedMetadata.source,
    "metadata.source"
  );


  ActionRouterChangeProposalTest_assertNonEmptyString(
    capturedMetadata.requestedAt,
    "metadata.requestedAt"
  );


  ActionRouterChangeProposalTest_assertTrue(
    !Number.isNaN(
      new Date(
        capturedMetadata.requestedAt
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
 * POST DataとUnderstanding Result原本が
 * 変更されないことを確認する。
 */
function test_ActionRouterChangeProposal_inputIsNotModified() {

  ActionRouterChangeProposalTest_setAuthorizationOverride(
    ActionRouterChangeProposalTest_createAuthenticatedUser()
  );


  ActionRouterChangeProposalTest_setServiceOverride(
    function() {

      return {

        schemaVersion:
          "1.0",

        serviceVersion:
          "1.0",

        status:
          "proposal_created",

        proposalId:
          "PROPOSAL-ACTION-ROUTER-TEST-003",

        changePlanId:
          "CHANGE-PLAN-ACTION-ROUTER-TEST-003",

        requiresConfirmation:
          true

      };

    }
  );


  const data = {

    action:
      "createChangeProposal",

    sessionId:
      "SESSION-ACTION-ROUTER-TEST-003",

    understandingResult:
      ActionRouterChangeProposalTest_createUnderstandingResult(),

    requestId:
      "REQUEST-ACTION-ROUTER-TEST-003"

  };


  const originalJson =
    JSON.stringify(
      data
    );


  ActionRouter_routePost(
    data
  );


  ActionRouterChangeProposalTest_assertEquals(
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
 * Update IntentのUnderstanding Resultを生成する。
 *
 * @return {Object}
 */
function ActionRouterChangeProposalTest_createUnderstandingResult() {

  const result =
    UnderstandingResultContract_create(
      "ワンワンの型温を61℃にして"
    );


  result.communication.type =
    "none";


  result.intent.type =
    "update";


  result.conversation.action =
    "new";


  result.entity.query =
    "ワンワン";


  result.entity.entityTypeHint =
    "product";


  result.view.name =
    "mold_temperature";


  result.change.field =
    "mold_temperature";


  result.change.operation =
    "set";


  result.change.value =
    61;


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


/**
 * 認証済みEditor Userを生成する。
 *
 * @return {Object}
 */
function ActionRouterChangeProposalTest_createAuthenticatedUser() {

  return {

    userId:
      "USER-ACTION-ROUTER-TEST-001",

    email:
      "action-router-test@example.com",

    name:
      "Action Router Test User",

    nickName:
      "Router Test",

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

let ActionRouterChangeProposalTest_originalRequireWritePermission =
  null;


let ActionRouterChangeProposalTest_originalChangeProposalServiceCreate =
  null;


/**
 * AuthorizationEngineを差し替える。
 *
 * @param {Object} authenticatedUser
 */
function ActionRouterChangeProposalTest_setAuthorizationOverride(
  authenticatedUser
) {

  ActionRouterChangeProposalTest_assertObject(
    authenticatedUser,
    "authenticatedUser"
  );


  if (
    ActionRouterChangeProposalTest_originalRequireWritePermission ===
      null
  ) {

    ActionRouterChangeProposalTest_originalRequireWritePermission =
      AuthorizationEngine_requireWritePermission;

  }


  AuthorizationEngine_requireWritePermission =
    function(
      sessionId
    ) {

      ActionRouterChangeProposalTest_assertNonEmptyString(
        sessionId,
        "sessionId"
      );


      return ActionRouterChangeProposalTest_deepCopy(
        authenticatedUser
      );

    };

}


/**
 * ChangeProposalService_createを差し替える。
 *
 * @param {Function} callback
 */
function ActionRouterChangeProposalTest_setServiceOverride(
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
    ActionRouterChangeProposalTest_originalChangeProposalServiceCreate ===
      null
  ) {

    ActionRouterChangeProposalTest_originalChangeProposalServiceCreate =
      ChangeProposalService_create;

  }


  ChangeProposalService_create =
    callback;

}


/**
 * 全Overrideを解除する。
 */
function ActionRouterChangeProposalTest_clearOverrides() {

  if (
    ActionRouterChangeProposalTest_originalRequireWritePermission !==
      null
  ) {

    AuthorizationEngine_requireWritePermission =
      ActionRouterChangeProposalTest_originalRequireWritePermission;


    ActionRouterChangeProposalTest_originalRequireWritePermission =
      null;

  }


  if (
    ActionRouterChangeProposalTest_originalChangeProposalServiceCreate !==
      null
  ) {

    ChangeProposalService_create =
      ActionRouterChangeProposalTest_originalChangeProposalServiceCreate;


    ActionRouterChangeProposalTest_originalChangeProposalServiceCreate =
      null;

  }

}


/*
=========================================
Assertions
=========================================
*/

function ActionRouterChangeProposalTest_assertEquals(
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


function ActionRouterChangeProposalTest_assertDeepEquals(
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


function ActionRouterChangeProposalTest_assertTrue(
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


function ActionRouterChangeProposalTest_assertObject(
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


function ActionRouterChangeProposalTest_assertNonEmptyString(
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


function ActionRouterChangeProposalTest_deepCopy(
  value
) {

  return JSON.parse(
    JSON.stringify(
      value
    )
  );

}