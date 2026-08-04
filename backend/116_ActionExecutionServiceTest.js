/*
=========================================
SHiCI
116_ActionExecutionServiceTest.js

Action Execution Service Test
Version 1.0

実際のSpreadsheetと本番採番は使用しない。
Fake SpreadsheetとOverride上で検証する。
=========================================
*/


/*
=========================================
Runner
=========================================
*/

/**
 * ActionExecutionServiceの全テストを実行する。
 */
function test_ActionExecutionService_runAll() {

  const tests = [

    {
      name:
        "success",
      run:
        test_ActionExecutionService_success
    },

    {
      name:
        "resultValidation",
      run:
        test_ActionExecutionService_resultValidation
    },

    {
      name:
        "metadataPropagation",
      run:
        test_ActionExecutionService_metadataPropagation
    },

    {
      name:
        "requestIsNotModified",
      run:
        test_ActionExecutionService_requestIsNotModified
    },

    {
      name:
        "unsupportedActionTypeIsRejected",
      run:
        test_ActionExecutionService_unsupportedActionTypeIsRejected
    },

    {
      name:
        "pendingChangeCannotBeExecutedTwice",
      run:
        test_ActionExecutionService_pendingChangeCannotBeExecutedTwice
    }

  ];


  const failures =
    [];


  console.log(
    "========================================="
  );

  console.log(
    "ActionExecutionService Test Start"
  );

  console.log(
    "========================================="
  );


  try {

    tests.forEach(
      function(test) {

        try {

          ActionExecutionServiceTest_clearEnvironment();


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

          ActionExecutionServiceTest_clearEnvironment();

        }

      }
    );

  } finally {

    ActionExecutionServiceTest_clearEnvironment();

  }


  if (
    failures.length >
      0
  ) {

    throw new Error(
      "ActionExecutionService Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[Action Execution Service Ver.1.0 Test Passed]"
  );

}


/*
=========================================
Success
=========================================
*/

/**
 * Action RequestからExecution Layer全体が実行され、
 * 正常なAction Resultが返ることを確認する。
 */
function test_ActionExecutionService_success() {

  const fixture =
    ActionExecutionServiceTest_createFixture();


  try {

    const request =
      ActionExecutionServiceTest_createRequest(
        fixture
      );


    const result =
      ActionExecutionService_execute(
        request
      );


    ActionExecutionServiceTest_assertEquals(
      ACTION_EXECUTION_SERVICE_STATUS_COMPLETED,
      result.status,
      "result.status"
    );


    ActionExecutionServiceTest_assertEquals(
      ACTION_EXECUTION_SERVICE_ACTION_CONFIRM,
      result.actionType,
      "result.actionType"
    );


    ActionExecutionServiceTest_assertEquals(
      EXECUTION_RESULT_STATUS_SUCCESS,
      result.executionStatus,
      "result.executionStatus"
    );


    ActionExecutionServiceTest_assertEquals(
      fixture.proposal.proposalId,
      result.proposalId,
      "result.proposalId"
    );


    ActionExecutionServiceTest_assertEquals(
      fixture.changePlan.changePlanId,
      result.changePlanId,
      "result.changePlanId"
    );


    ActionExecutionServiceTest_assertTrue(
      typeof result.executionPlanId ===
        "string" &&
      result.executionPlanId.indexOf(
        "EXECUTION-PLAN-"
      ) ===
        0,
      "result.executionPlanId"
    );


    ActionExecutionServiceTest_assertTrue(
      typeof result.executionResultId ===
        "string" &&
      result.executionResultId.indexOf(
        "EXECUTION-RESULT-"
      ) ===
        0,
      "result.executionResultId"
    );


    ActionExecutionServiceTest_assertEquals(
      result.executionPlanId,
      result.controllerResult.executionPlanId,
      "executionPlanId propagation"
    );


    ActionExecutionServiceTest_assertEquals(
      result.executionResultId,
      result.controllerResult.executionResultId,
      "executionResultId propagation"
    );


    ActionExecutionServiceTest_assertEquals(
      EXECUTION_RESULT_STATUS_SUCCESS,
      result
        .controllerResult
        .executionResult
        .status,
      "controllerResult.executionResult.status"
    );


    ActionExecutionServiceTest_validateSpreadsheet(
      fixture
    );

  } finally {

    ActionExecutionServiceTest_clearEnvironment();

  }

}


/*
=========================================
Result Validation
=========================================
*/

/**
 * Action Resultが正式な検証を通過することを確認する。
 */
function test_ActionExecutionService_resultValidation() {

  const fixture =
    ActionExecutionServiceTest_createFixture();


  try {

    const result =
      ActionExecutionService_execute(
        ActionExecutionServiceTest_createRequest(
          fixture
        )
      );


    ActionExecutionServiceTest_assertEquals(
      true,
      ActionExecutionService_validateResult(
        result
      ),
      "ActionExecutionService_validateResult"
    );


    ActionExecutionServiceTest_assertEquals(
      result.executionStatus,
      result
        .controllerResult
        .executionResult
        .status,
      "executionStatus consistency"
    );

  } finally {

    ActionExecutionServiceTest_clearEnvironment();

  }

}


/*
=========================================
Metadata
=========================================
*/

/**
 * Request MetadataがAction Resultおよび
 * Execution Resultへ伝播することを確認する。
 */
function test_ActionExecutionService_metadataPropagation() {

  const fixture =
    ActionExecutionServiceTest_createFixture();


  const request =
    ActionExecutionServiceTest_createRequest(
      fixture
    );


  request.metadata = {

    source:
      "action_execution_service_test",

    requestId:
      "REQUEST_ACTION_EXECUTION_SERVICE_TEST",

    requestedBy:
      "USER_REQUESTED_BY_TEST",

    decidedBy:
      "USER_DECIDED_BY_TEST"

  };


  try {

    const result =
      ActionExecutionService_execute(
        request
      );


    ActionExecutionServiceTest_assertEquals(
      "REQUEST_ACTION_EXECUTION_SERVICE_TEST",
      result.metadata.requestId,
      "result.metadata.requestId"
    );


    ActionExecutionServiceTest_assertEquals(
      "USER_REQUESTED_BY_TEST",
      result.metadata.requestedBy,
      "result.metadata.requestedBy"
    );


    ActionExecutionServiceTest_assertEquals(
      "action_execution_service_test",
      result.metadata.source,
      "result.metadata.source"
    );


    ActionExecutionServiceTest_assertEquals(
      "USER_DECIDED_BY_TEST",
      result
        .controllerResult
        .confirmationExecution
        .decidedBy,
      "confirmationExecution.decidedBy"
    );


    ActionExecutionServiceTest_assertEquals(
      "REQUEST_ACTION_EXECUTION_SERVICE_TEST",
      result
        .controllerResult
        .executionResult
        .metadata
        .requestId,
      "executionResult.metadata.requestId"
    );

  } finally {

    ActionExecutionServiceTest_clearEnvironment();

  }

}


/*
=========================================
Input Immutability
=========================================
*/

/**
 * Service実行によってAction Request原本が
 * 変更されないことを確認する。
 */
function test_ActionExecutionService_requestIsNotModified() {

  const fixture =
    ActionExecutionServiceTest_createFixture();


  const request =
    ActionExecutionServiceTest_createRequest(
      fixture
    );


  const originalJson =
    JSON.stringify(
      request
    );


  try {

    ActionExecutionService_execute(
      request
    );


    ActionExecutionServiceTest_assertEquals(
      originalJson,
      JSON.stringify(
        request
      ),
      "actionRequest"
    );

  } finally {

    ActionExecutionServiceTest_clearEnvironment();

  }

}


/*
=========================================
Unsupported Action Type
=========================================
*/

/**
 * 未対応actionTypeを拒否することを確認する。
 */
function test_ActionExecutionService_unsupportedActionTypeIsRejected() {

  const fixture =
    ActionExecutionServiceTest_createFixture();


  const request =
    ActionExecutionServiceTest_createRequest(
      fixture
    );


  request.actionType =
    "unsupported_action";


  try {

    ActionExecutionServiceTest_assertThrows(

      function() {

        ActionExecutionService_execute(
          request
        );

      },

      "未対応のAction Execution Service actionTypeです。",

      "unsupported actionType"

    );

  } finally {

    ActionExecutionServiceTest_clearEnvironment();

  }

}


/*
=========================================
Pending Change Consumption
=========================================
*/

/**
 * 同じPending Changeを2回実行できないことを確認する。
 */
function test_ActionExecutionService_pendingChangeCannotBeExecutedTwice() {

  const fixture =
    ActionExecutionServiceTest_createFixture();


  const firstRequest =
    ActionExecutionServiceTest_createRequest(
      fixture
    );


  try {

    const firstResult =
      ActionExecutionService_execute(
        firstRequest
      );


    ActionExecutionServiceTest_assertEquals(
      EXECUTION_RESULT_STATUS_SUCCESS,
      firstResult.executionStatus,
      "firstResult.executionStatus"
    );


    ActionExecutionServiceTest_assertThrows(

      function() {

        ActionExecutionService_execute(
          {

            actionType:
              ACTION_EXECUTION_SERVICE_ACTION_CONFIRM,

            proposalId:
              fixture.proposal.proposalId,

            changePlanId:
              fixture.changePlan.changePlanId,

            metadata: {

              source:
                "action_execution_service_test",

              requestId:
                "REQUEST_ACTION_EXECUTION_SERVICE_SECOND",

              requestedBy:
                "USER_ACTION_EXECUTION_SERVICE_TEST",

              decidedBy:
                "USER_ACTION_EXECUTION_SERVICE_TEST"

            }

          }
        );

      },

      null,

      "Pending Change must be consumed once"

    );

  } finally {

    ActionExecutionServiceTest_clearEnvironment();

  }

}


/*
=========================================
Fixture
=========================================
*/

/**
 * ActionExecutionServiceの結合Fixtureを生成する。
 *
 * @return {Object}
 */
function ActionExecutionServiceTest_createFixture() {

  const pendingFixture =
    ExecutionControllerTest_createPendingChangeFixture();


  const spreadsheet =
    ExecutionControllerTest_createSpreadsheetForChangePlan(
      pendingFixture.changePlan
    );


  ActionExecutionServiceTest_prepareEnvironment(
    spreadsheet
  );


  return {

    mutation:
      pendingFixture.mutation,

    resolutionResult:
      pendingFixture.resolutionResult,

    changePlan:
      pendingFixture.changePlan,

    proposal:
      pendingFixture.proposal,

    spreadsheet:
      spreadsheet

  };

}


/**
 * 正常なAction Requestを生成する。
 *
 * @param {Object} fixture
 * @return {Object}
 */
function ActionExecutionServiceTest_createRequest(
  fixture
) {

  ActionExecutionServiceTest_assertObject(
    fixture,
    "fixture"
  );


  return {

    actionType:
      ACTION_EXECUTION_SERVICE_ACTION_CONFIRM,

    proposalId:
      fixture.proposal.proposalId,

    changePlanId:
      fixture.changePlan.changePlanId,

    metadata: {

      source:
        "action_execution_service_test",

      requestId:
        "REQUEST_ACTION_EXECUTION_SERVICE_TEST",

      requestedBy:
        "USER_ACTION_EXECUTION_SERVICE_TEST",

      decidedBy:
        "USER_ACTION_EXECUTION_SERVICE_TEST"

    }

  };

}


/*
=========================================
Environment
=========================================
*/

/**
 * Fake Spreadsheetとテスト採番を設定する。
 *
 * @param {Object} spreadsheet
 */
function ActionExecutionServiceTest_prepareEnvironment(
  spreadsheet
) {

  SpreadsheetRepository_setSpreadsheetOverride(
    spreadsheet
  );


  RuntimeBindingResolver_setIdGeneratorOverride(
    function(prefix) {

      ActionExecutionServiceTest_assertEquals(
        "COND",
        prefix,
        "Runtime Binding prefix"
      );


      return "COND-ACTION-EXECUTION-SERVICE-TEST-001";

    }
  );

}


/**
 * Overrideを解除する。
 */
function ActionExecutionServiceTest_clearEnvironment() {

  SpreadsheetRepository_clearSpreadsheetOverride();


  RuntimeBindingResolver_clearIdGeneratorOverride();

}


/*
=========================================
Spreadsheet Validation
=========================================
*/

/**
 * 正常実行後のSpreadsheet状態を確認する。
 *
 * @param {Object} fixture
 */
function ActionExecutionServiceTest_validateSpreadsheet(
  fixture
) {

  const spreadsheet =
    fixture.spreadsheet;


  const newConditionId =
    "COND-ACTION-EXECUTION-SERVICE-TEST-001";


  const conditionRows =
    spreadsheet
      .getSheetByName(
        "成形条件マスター"
      )
      .getAllValues();


  const conditionHeaderMap =
    ExecutionControllerTest_createHeaderMap(
      conditionRows[0]
    );


  ActionExecutionServiceTest_assertEquals(
    3,
    conditionRows.length,
    "conditionRows.length"
  );


  ActionExecutionServiceTest_assertEquals(
    "旧版",
    conditionRows[1][
      conditionHeaderMap["状態"]
    ],
    "oldCondition.状態"
  );


  ActionExecutionServiceTest_assertEquals(
    newConditionId,
    conditionRows[2][
      conditionHeaderMap["条件ID"]
    ],
    "newCondition.条件ID"
  );


  ActionExecutionServiceTest_assertEquals(
    "標準",
    conditionRows[2][
      conditionHeaderMap["状態"]
    ],
    "newCondition.状態"
  );


  const productRows =
    spreadsheet
      .getSheetByName(
        "製品マスター"
      )
      .getAllValues();


  const productHeaderMap =
    ExecutionControllerTest_createHeaderMap(
      productRows[0]
    );


  ActionExecutionServiceTest_assertEquals(
    newConditionId,
    productRows[1][
      productHeaderMap["現在標準条件ID"]
    ],
    "product.現在標準条件ID"
  );

}


/*
=========================================
Assertions
=========================================
*/

function ActionExecutionServiceTest_assertEquals(
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


function ActionExecutionServiceTest_assertTrue(
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


function ActionExecutionServiceTest_assertObject(
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


/**
 * 例外が発生することを確認する。
 */
function ActionExecutionServiceTest_assertThrows(
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