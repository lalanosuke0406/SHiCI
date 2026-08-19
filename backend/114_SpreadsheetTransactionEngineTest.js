/*
=========================================
SHiCI
114_SpreadsheetTransactionEngineTest.js

Spreadsheet Transaction Engine Test
Version 1.0

実際のSpreadsheetと本番採番は使用しない。
すべてFake Spreadsheetと
ID Generator Override上で検証する。
=========================================
*/


/*
=========================================
Test Runner
=========================================
*/

/**
 * SpreadsheetTransactionEngineの
 * 全テストを実行する。
 */
function test_SpreadsheetTransactionEngine_runAll() {

  const tests = [

    {
      name:
        "allOperationsSuccess",
      run:
        test_SpreadsheetTransactionEngine_allOperationsSuccess
    },

    {
      name:
        "failureCreatesSkippedResults",
      run:
        test_SpreadsheetTransactionEngine_failureCreatesSkippedResults
    },

    {
      name:
        "rollbackRunsInReverseOrder",
      run:
        test_SpreadsheetTransactionEngine_rollbackRunsInReverseOrder
    },

    {
      name:
        "rollbackSuccess",
      run:
        test_SpreadsheetTransactionEngine_rollbackSuccess
    },

    {
      name:
        "rollbackFailure",
      run:
        test_SpreadsheetTransactionEngine_rollbackFailure
    },

    {
      name:
        "firstOperationFailureDoesNotRollback",
      run:
        test_SpreadsheetTransactionEngine_firstOperationFailureDoesNotRollback
    },

    {
      name:
        "runtimeBindingIsResolved",
      run:
        test_SpreadsheetTransactionEngine_runtimeBindingIsResolved
    },

    {
      name:
        "executionPlanIsNotModified",
      run:
        test_SpreadsheetTransactionEngine_executionPlanIsNotModified
    },

    {
      name:
        "resultPassesContract",
      run:
        test_SpreadsheetTransactionEngine_resultPassesContract
    },

    {
      name:
        "booleanConditionDetailIsPersisted",
      run:
        test_SpreadsheetTransactionEngine_booleanConditionDetailIsPersisted
    }

  ];


  const failures =
    [];


  console.log(
    "========================================="
  );

  console.log(
    "SpreadsheetTransactionEngine Test Start"
  );

  console.log(
    "========================================="
  );


  try {

    tests.forEach(
      function(test) {

        try {

          SpreadsheetRepository_clearSpreadsheetOverride();

          RuntimeBindingResolver_clearIdGeneratorOverride();


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

          SpreadsheetRepository_clearSpreadsheetOverride();

          RuntimeBindingResolver_clearIdGeneratorOverride();

        }

      }
    );

  } finally {

    SpreadsheetRepository_clearSpreadsheetOverride();

    RuntimeBindingResolver_clearIdGeneratorOverride();

  }


  if (
    failures.length >
      0
  ) {

    throw new Error(
      "SpreadsheetTransactionEngine Test Failed\n" +
      JSON.stringify(
        failures,
        null,
        2
      )
    );

  }


  console.log(
    "[Spreadsheet Transaction Engine Ver.1.0 Test Passed]"
  );

}


/*
=========================================
All Operations Success
=========================================
*/

/**
 * 全Operationが成功した場合に、
 * status=successとなることを確認する。
 */
function test_SpreadsheetTransactionEngine_allOperationsSuccess() {

  const fixture =
    SpreadsheetTransactionEngineTest_createSuccessFixture();


  const result =
    SpreadsheetTransactionEngine_execute(
      fixture.executionPlan
    );


  SpreadsheetTransactionEngineTest_assertEquals(
    EXECUTION_RESULT_STATUS_SUCCESS,
    result.status,
    "result.status"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    3,
    result.operations.length,
    "result.operations.length"
  );


  result.operations.forEach(
    function(operationResult, index) {

      SpreadsheetTransactionEngineTest_assertEquals(
        EXECUTION_OPERATION_STATUS_SUCCESS,
        operationResult.status,
        "result.operations[" +
        index +
        "].status"
      );

    }
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    false,
    result.rollback.performed,
    "result.rollback.performed"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    EXECUTION_ROLLBACK_STATUS_NONE,
    result.rollback.status,
    "result.rollback.status"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    0,
    result.errors.length,
    "result.errors.length"
  );

}


/*
=========================================
Skipped Results
=========================================
*/

/**
 * 途中のOperationが失敗した場合に、
 * 後続Operationがskippedとなることを確認する。
 */
function test_SpreadsheetTransactionEngine_failureCreatesSkippedResults() {

  const fixture =
    SpreadsheetTransactionEngineTest_createRollbackSuccessFixture();


  const result =
    SpreadsheetTransactionEngine_execute(
      fixture.executionPlan
    );


  SpreadsheetTransactionEngineTest_assertEquals(
    EXECUTION_OPERATION_STATUS_SUCCESS,
    result.operations[0].status,
    "operation1.status"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    EXECUTION_OPERATION_STATUS_SUCCESS,
    result.operations[1].status,
    "operation2.status"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    EXECUTION_OPERATION_STATUS_FAILED,
    result.operations[2].status,
    "operation3.status"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    EXECUTION_OPERATION_STATUS_SKIPPED,
    result.operations[3].status,
    "operation4.status"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    0,
    result.operations[3].affectedRows,
    "operation4.affectedRows"
  );

}


/*
=========================================
Rollback Reverse Order
=========================================
*/

/**
 * 成功済みOperationが、
 * Forward実行とは逆順で
 * Rollbackされることを確認する。
 */
function test_SpreadsheetTransactionEngine_rollbackRunsInReverseOrder() {

  const fixture =
    SpreadsheetTransactionEngineTest_createRollbackSuccessFixture();


  const result =
    SpreadsheetTransactionEngine_execute(
      fixture.executionPlan
    );


  SpreadsheetTransactionEngineTest_assertEquals(
    2,
    result.rollback.operations.length,
    "rollback.operations.length"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    "ROLLBACK_INSERT_DETAIL",
    result.rollback.operations[0].operationId,
    "rollback.operations[0].operationId"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    1,
    result.rollback.operations[0].sequence,
    "rollback.operations[0].sequence"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    "ROLLBACK_INSERT_CONDITION",
    result.rollback.operations[1].operationId,
    "rollback.operations[1].operationId"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    2,
    result.rollback.operations[1].sequence,
    "rollback.operations[1].sequence"
  );

}


/*
=========================================
Rollback Success
=========================================
*/

/**
 * Rollbackがすべて成功した場合に、
 * Transaction全体がrolled_backとなり、
 * Spreadsheetが開始前の状態へ戻ることを確認する。
 */
function test_SpreadsheetTransactionEngine_rollbackSuccess() {

  const fixture =
    SpreadsheetTransactionEngineTest_createRollbackSuccessFixture();


  const beforeJson =
    JSON.stringify(
      fixture.spreadsheet.getAllSheetValues()
    );


  const result =
    SpreadsheetTransactionEngine_execute(
      fixture.executionPlan
    );


  SpreadsheetTransactionEngineTest_assertEquals(
    EXECUTION_RESULT_STATUS_ROLLED_BACK,
    result.status,
    "result.status"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    true,
    result.rollback.performed,
    "result.rollback.performed"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    EXECUTION_ROLLBACK_STATUS_SUCCESS,
    result.rollback.status,
    "result.rollback.status"
  );


  result.rollback.operations.forEach(
    function(operationResult, index) {

      SpreadsheetTransactionEngineTest_assertEquals(
        EXECUTION_OPERATION_STATUS_SUCCESS,
        operationResult.status,
        "rollback.operations[" +
        index +
        "].status"
      );

    }
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    beforeJson,
    JSON.stringify(
      fixture.spreadsheet.getAllSheetValues()
    ),
    "spreadsheet after rollback"
  );


  SpreadsheetTransactionEngineTest_assertTrue(
    result.errors.length >=
      1,
    "result.errors.length"
  );

}


/*
=========================================
Rollback Failure
=========================================
*/

/**
 * Forward Operation失敗後のRollbackにも失敗した場合、
 * Transaction全体がfailedとなることを確認する。
 */
function test_SpreadsheetTransactionEngine_rollbackFailure() {

  const fixture =
    SpreadsheetTransactionEngineTest_createRollbackFailureFixture();


  const result =
    SpreadsheetTransactionEngine_execute(
      fixture.executionPlan
    );


  SpreadsheetTransactionEngineTest_assertEquals(
    EXECUTION_RESULT_STATUS_FAILED,
    result.status,
    "result.status"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    true,
    result.rollback.performed,
    "result.rollback.performed"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    EXECUTION_ROLLBACK_STATUS_FAILED,
    result.rollback.status,
    "result.rollback.status"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    EXECUTION_OPERATION_STATUS_FAILED,
    result.rollback.operations[0].status,
    "rollback.operations[0].status"
  );


  /*
   * Forward ErrorとRollback Errorの
   * 両方が収集される。
   */
  SpreadsheetTransactionEngineTest_assertTrue(
    result.errors.length >=
      2,
    "result.errors.length"
  );

}


/*
=========================================
First Operation Failure
=========================================
*/

/**
 * 最初のOperationで失敗し、
 * 成功済みOperationが存在しない場合は、
 * Rollbackを実行しないことを確認する。
 */
function test_SpreadsheetTransactionEngine_firstOperationFailureDoesNotRollback() {

  const fixture =
    SpreadsheetTransactionEngineTest_createFirstFailureFixture();


  const result =
    SpreadsheetTransactionEngine_execute(
      fixture.executionPlan
    );


  SpreadsheetTransactionEngineTest_assertEquals(
    EXECUTION_RESULT_STATUS_FAILED,
    result.status,
    "result.status"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    EXECUTION_OPERATION_STATUS_FAILED,
    result.operations[0].status,
    "operation1.status"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    EXECUTION_OPERATION_STATUS_SKIPPED,
    result.operations[1].status,
    "operation2.status"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    false,
    result.rollback.performed,
    "result.rollback.performed"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    EXECUTION_ROLLBACK_STATUS_NONE,
    result.rollback.status,
    "result.rollback.status"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    0,
    result.rollback.operations.length,
    "result.rollback.operations.length"
  );

}


/*
=========================================
Runtime Binding
=========================================
*/

/**
 * Runtime Bindingで生成したIDが、
 * 全Operationで同じ値として使用され、
 * Binding Resultにも保存されることを確認する。
 */
function test_SpreadsheetTransactionEngine_runtimeBindingIsResolved() {

  const fixture =
    SpreadsheetTransactionEngineTest_createSuccessFixture();


  const result =
    SpreadsheetTransactionEngine_execute(
      fixture.executionPlan
    );


  SpreadsheetTransactionEngineTest_assertEquals(
    1,
    result.bindings.length,
    "result.bindings.length"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    "NEW_CONDITION_ID",
    result.bindings[0].bindingId,
    "result.bindings[0].bindingId"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    "COND-TRANSACTION-TEST-001",
    result.bindings[0].resolvedValue,
    "result.bindings[0].resolvedValue"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    true,
    result.bindings[0].resolved,
    "result.bindings[0].resolved"
  );


  const conditionRow =
    fixture.spreadsheet
      .getSheetByName(
        "成形条件マスター"
      )
      .getAllValues()[1];


  const detailRow =
    fixture.spreadsheet
      .getSheetByName(
        "成形条件詳細マスター"
      )
      .getAllValues()[1];


  SpreadsheetTransactionEngineTest_assertEquals(
    "COND-TRANSACTION-TEST-001",
    conditionRow[0],
    "conditionRow.条件ID"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    "COND-TRANSACTION-TEST-001",
    detailRow[0],
    "detailRow.条件ID"
  );

}


/*
=========================================
Execution Plan Immutability
=========================================
*/

/**
 * Transaction実行後も、
 * Execution Plan原本が変更されないことを確認する。
 */
function test_SpreadsheetTransactionEngine_executionPlanIsNotModified() {

  const fixture =
    SpreadsheetTransactionEngineTest_createSuccessFixture();


  const originalJson =
    JSON.stringify(
      fixture.executionPlan
    );


  SpreadsheetTransactionEngine_execute(
    fixture.executionPlan
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    originalJson,
    JSON.stringify(
      fixture.executionPlan
    ),
    "executionPlan"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    null,
    fixture
      .executionPlan
      .bindings[0]
      .resolvedValue,
    "executionPlan.bindings[0].resolvedValue"
  );


  SpreadsheetTransactionEngineTest_assertBindingReference(
    fixture
      .executionPlan
      .operations[0]
      .payload
      .values["条件ID"],
    "NEW_CONDITION_ID",
    "executionPlan.operations[0].payload.values.条件ID"
  );

}


/*
=========================================
Contract Validation
=========================================
*/

/**
 * Transaction Engineが返すExecution Resultが、
 * ExecutionResultContractを通過することを確認する。
 */
function test_SpreadsheetTransactionEngine_resultPassesContract() {

  const fixture =
    SpreadsheetTransactionEngineTest_createSuccessFixture();


  const result =
    SpreadsheetTransactionEngine_execute(
      fixture.executionPlan
    );


  SpreadsheetTransactionEngineTest_assertEquals(
    true,
    ExecutionResultContract_validate(
      result
    ),
    "ExecutionResultContract_validate"
  );

}


/*
=========================================
Fixtures
=========================================
*/

/**
 * 全Operationが成功するFixtureを生成する。
 *
 * @return {Object}
 */
function SpreadsheetTransactionEngineTest_createSuccessFixture() {

  const spreadsheet =
    SpreadsheetTransactionEngineTest_createSpreadsheet({

      "成形条件マスター": [

        [
          "条件ID",
          "製品ID",
          "状態"
        ]

      ],

      "成形条件詳細マスター": [

        [
          "条件ID",
          "金型温度(℃)"
        ]

      ],

      "製品マスター": [

        [
          "製品ID",
          "現在標準条件ID"
        ],

        [
          "P-000035",
          "COND-000152"
        ]

      ]

    });


  SpreadsheetTransactionEngineTest_prepareEnvironment(
    spreadsheet
  );


  const executionPlan =
    SpreadsheetTransactionEngineTest_createBaseExecutionPlan();


  executionPlan.operations = [

    SpreadsheetTransactionEngineTest_createInsertConditionOperation(
      1
    ),

    SpreadsheetTransactionEngineTest_createInsertDetailOperation(
      2
    ),

    SpreadsheetTransactionEngineTest_createUpdateProductOperation(
      3,
      "COND-000152"
    )

  ];


  ExecutionPlanContract_validate(
    executionPlan
  );


  return {

    spreadsheet:
      spreadsheet,

    executionPlan:
      executionPlan

  };

}


/**
 * Forward Operation 1・2成功後、
 * Operation 3で失敗し、
 * Rollbackが成功するFixtureを生成する。
 *
 * @return {Object}
 */
function SpreadsheetTransactionEngineTest_createRollbackSuccessFixture() {

  const spreadsheet =
    SpreadsheetTransactionEngineTest_createSpreadsheet({

      "成形条件マスター": [

        [
          "条件ID",
          "製品ID",
          "状態"
        ]

      ],

      "成形条件詳細マスター": [

        [
          "条件ID",
          "金型温度(℃)"
        ]

      ],

      "製品マスター": [

        [
          "製品ID",
          "現在標準条件ID"
        ],

        [
          "P-000035",
          "COND-OTHER"
        ]

      ],

      "監査マスター": [

        [
          "監査ID",
          "状態"
        ]

      ]

    });


  SpreadsheetTransactionEngineTest_prepareEnvironment(
    spreadsheet
  );


  const executionPlan =
    SpreadsheetTransactionEngineTest_createBaseExecutionPlan();


  executionPlan.operations = [

    SpreadsheetTransactionEngineTest_createInsertConditionOperation(
      1
    ),

    SpreadsheetTransactionEngineTest_createInsertDetailOperation(
      2
    ),

    /*
     * criteriaの現在標準条件IDが一致しないため失敗する。
     */
    SpreadsheetTransactionEngineTest_createUpdateProductOperation(
      3,
      "COND-000152"
    ),

    SpreadsheetTransactionEngineTest_createInsertAuditOperation(
      4
    )

  ];


  ExecutionPlanContract_validate(
    executionPlan
  );


  return {

    spreadsheet:
      spreadsheet,

    executionPlan:
      executionPlan

  };

}


/**
 * Rollback Operation自体が失敗するFixtureを生成する。
 *
 * @return {Object}
 */
function SpreadsheetTransactionEngineTest_createRollbackFailureFixture() {

  const spreadsheet =
    SpreadsheetTransactionEngineTest_createSpreadsheet({

      "成形条件マスター": [

        [
          "条件ID",
          "製品ID",
          "状態"
        ]

      ],

      "製品マスター": [

        [
          "製品ID",
          "現在標準条件ID"
        ],

        [
          "P-000035",
          "COND-OTHER"
        ]

      ]

    });


  SpreadsheetTransactionEngineTest_prepareEnvironment(
    spreadsheet
  );


  const executionPlan =
    SpreadsheetTransactionEngineTest_createBaseExecutionPlan();


  const insertOperation =
    SpreadsheetTransactionEngineTest_createInsertConditionOperation(
      1
    );


  /*
   * Forward INSERTは成功するが、
   * Rollback DELETEのcriteriaを意図的に
   * 存在しない値へ変更する。
   */
  insertOperation.rollback.payload.criteria = {

    "条件ID":
      "COND-ROLLBACK-NOT-FOUND"

  };


  executionPlan.operations = [

    insertOperation,

    SpreadsheetTransactionEngineTest_createUpdateProductOperation(
      2,
      "COND-000152"
    )

  ];


  ExecutionPlanContract_validate(
    executionPlan
  );


  return {

    spreadsheet:
      spreadsheet,

    executionPlan:
      executionPlan

  };

}


/**
 * 最初のOperationが失敗するFixtureを生成する。
 *
 * @return {Object}
 */
function SpreadsheetTransactionEngineTest_createFirstFailureFixture() {

  const spreadsheet =
    SpreadsheetTransactionEngineTest_createSpreadsheet({

      "製品マスター": [

        [
          "製品ID",
          "現在標準条件ID"
        ],

        [
          "P-000035",
          "COND-OTHER"
        ]

      ],

      "監査マスター": [

        [
          "監査ID",
          "状態"
        ]

      ]

    });


  SpreadsheetTransactionEngineTest_prepareEnvironment(
    spreadsheet
  );


  const executionPlan =
    SpreadsheetTransactionEngineTest_createBaseExecutionPlan();


  executionPlan.operations = [

    SpreadsheetTransactionEngineTest_createUpdateProductOperation(
      1,
      "COND-000152"
    ),

    SpreadsheetTransactionEngineTest_createInsertAuditOperation(
      2
    )

  ];


  ExecutionPlanContract_validate(
    executionPlan
  );


  return {

    spreadsheet:
      spreadsheet,

    executionPlan:
      executionPlan

  };

}


/**
 * Fake Spreadsheetとテスト採番を設定する。
 *
 * @param {Object} spreadsheet
 */
function SpreadsheetTransactionEngineTest_prepareEnvironment(
  spreadsheet
) {

  SpreadsheetRepository_setSpreadsheetOverride(
    spreadsheet
  );


  RuntimeBindingResolver_setIdGeneratorOverride(
    function(prefix) {

      SpreadsheetTransactionEngineTest_assertEquals(
        "COND",
        prefix,
        "generator prefix"
      );


      return "COND-TRANSACTION-TEST-001";

    }
  );

}


/*
=========================================
Execution Plan Fixture
=========================================
*/

/**
 * 正常なExecution Planの共通部分を生成する。
 *
 * @return {Object}
 */
function SpreadsheetTransactionEngineTest_createBaseExecutionPlan() {

  const executionPlan =
    ExecutionPlanContract_createEmpty();


  executionPlan.executionPlanId =
    "EXECUTION-PLAN-TRANSACTION-TEST-001";


  executionPlan.changePlanId =
    "CHANGE-PLAN-TRANSACTION-TEST-001";


  executionPlan.proposalId =
    "PROPOSAL-TRANSACTION-TEST-001";


  executionPlan.status =
    EXECUTION_PLAN_STATUS_READY;


  executionPlan.subject.entityType =
    "product";

  executionPlan.subject.entityId =
    "P-000035";

  executionPlan.subject.entityName =
    "LEVER, CLAMP";


  executionPlan.bindings = [

    SpreadsheetTransactionEngineTest_createBinding()

  ];


  executionPlan.operations =
    [];


  executionPlan.executionPolicy.atomic =
    true;

  executionPlan.executionPolicy.stopOnError =
    true;

  executionPlan.executionPolicy.rollbackRequired =
    true;


  executionPlan.executable =
    true;


  executionPlan.createdAt =
    "2026-08-04T10:00:00.000Z";


  executionPlan.createdBy =
    "SpreadsheetTransactionEngineTest";


  executionPlan.metadata.source =
    "unit_test";

  executionPlan.metadata.requestId =
    "REQUEST-TRANSACTION-TEST-001";

  executionPlan.metadata.correlationId =
    "CORRELATION-TRANSACTION-TEST-001";


  return executionPlan;

}


/**
 * Runtime Bindingを生成する。
 *
 * @return {Object}
 */
function SpreadsheetTransactionEngineTest_createBinding() {

  const binding =
    ExecutionPlanContract_createEmptyBinding();


  binding.bindingId =
    "NEW_CONDITION_ID";


  binding.bindingType =
    "generated_id";


  binding.generator.type =
    "sequence_id";


  binding.generator.prefix =
    "COND";


  binding.resolvedValue =
    null;


  binding.metadata.description =
    "Transaction Engine Test Binding";


  return binding;

}


/*
=========================================
Forward Operations
=========================================
*/

/**
 * 新条件INSERT Operationを生成する。
 */
function SpreadsheetTransactionEngineTest_createInsertConditionOperation(
  sequence
) {

  const operation =
    ExecutionPlanContract_createEmptyOperation();


  operation.operationId =
    "INSERT_CONDITION";


  operation.sequence =
    sequence;


  operation.operationType =
    EXECUTION_PLAN_OPERATION_INSERT;


  operation.target.repository =
    "spreadsheet";

  operation.target.sheetName =
    "成形条件マスター";

  operation.target.entityType =
    "condition";

  operation.target.entityId =
    null;


  operation.payload.values = {

    "条件ID": {

      bindingRef:
        "NEW_CONDITION_ID"

    },

    "製品ID":
      "P-000035",

    "状態":
      "試験"

  };


  operation.payload.criteria =
    null;


  operation.rollback.supported =
    true;


  operation.rollback.operationType =
    EXECUTION_PLAN_OPERATION_DELETE;


  operation.rollback.payload = {

    values:
      null,

    criteria: {

      "条件ID": {

        bindingRef:
          "NEW_CONDITION_ID"

      }

    }

  };


  operation.metadata.description =
    "新条件を追加する";


  operation.metadata.sourcePath =
    "test.insertCondition";


  return operation;

}


/**
 * 新条件詳細INSERT Operationを生成する。
 */
function SpreadsheetTransactionEngineTest_createInsertDetailOperation(
  sequence
) {

  const operation =
    ExecutionPlanContract_createEmptyOperation();


  operation.operationId =
    "INSERT_DETAIL";


  operation.sequence =
    sequence;


  operation.operationType =
    EXECUTION_PLAN_OPERATION_INSERT;


  operation.target.repository =
    "spreadsheet";

  operation.target.sheetName =
    "成形条件詳細マスター";

  operation.target.entityType =
    "condition_detail";

  operation.target.entityId =
    null;


  operation.payload.values = {

    "条件ID": {

      bindingRef:
        "NEW_CONDITION_ID"

    },

    "金型温度(℃)":
      61

  };


  operation.payload.criteria =
    null;


  operation.rollback.supported =
    true;


  operation.rollback.operationType =
    EXECUTION_PLAN_OPERATION_DELETE;


  operation.rollback.payload = {

    values:
      null,

    criteria: {

      "条件ID": {

        bindingRef:
          "NEW_CONDITION_ID"

      }

    }

  };


  operation.metadata.description =
    "新条件詳細を追加する";


  operation.metadata.sourcePath =
    "test.insertDetail";


  return operation;

}


/**
 * Product UPDATE Operationを生成する。
 */
function SpreadsheetTransactionEngineTest_createUpdateProductOperation(
  sequence,
  expectedCurrentConditionId
) {

  const operation =
    ExecutionPlanContract_createEmptyOperation();


  operation.operationId =
    "UPDATE_PRODUCT";


  operation.sequence =
    sequence;


  operation.operationType =
    EXECUTION_PLAN_OPERATION_UPDATE;


  operation.target.repository =
    "spreadsheet";

  operation.target.sheetName =
    "製品マスター";

  operation.target.entityType =
    "product";

  operation.target.entityId =
    "P-000035";


  operation.payload.values = {

    "現在標準条件ID": {

      bindingRef:
        "NEW_CONDITION_ID"

    }

  };


  operation.payload.criteria = {

    "製品ID":
      "P-000035",

    "現在標準条件ID":
      expectedCurrentConditionId

  };


  operation.rollback.supported =
    true;


  operation.rollback.operationType =
    EXECUTION_PLAN_OPERATION_UPDATE;


  operation.rollback.payload = {

    values: {

      "現在標準条件ID":
        expectedCurrentConditionId

    },

    criteria: {

      "製品ID":
        "P-000035",

      "現在標準条件ID": {

        bindingRef:
          "NEW_CONDITION_ID"

      }

    }

  };


  operation.metadata.description =
    "製品の標準条件を切り替える";


  operation.metadata.sourcePath =
    "test.updateProduct";


  return operation;

}


/**
 * 後続skipped確認用INSERT Operationを生成する。
 */
function SpreadsheetTransactionEngineTest_createInsertAuditOperation(
  sequence
) {

  const operation =
    ExecutionPlanContract_createEmptyOperation();


  operation.operationId =
    "INSERT_AUDIT";


  operation.sequence =
    sequence;


  operation.operationType =
    EXECUTION_PLAN_OPERATION_INSERT;


  operation.target.repository =
    "spreadsheet";

  operation.target.sheetName =
    "監査マスター";

  operation.target.entityType =
    "audit";

  operation.target.entityId =
    null;


  operation.payload.values = {

    "監査ID":
      "AUDIT-001",

    "状態":
      "created"

  };


  operation.payload.criteria =
    null;


  operation.rollback.supported =
    true;


  operation.rollback.operationType =
    EXECUTION_PLAN_OPERATION_DELETE;


  operation.rollback.payload = {

    values:
      null,

    criteria: {

      "監査ID":
        "AUDIT-001"

    }

  };


  operation.metadata.description =
    "監査データを追加する";


  operation.metadata.sourcePath =
    "test.insertAudit";


  return operation;

}


/*
=========================================
Fake Spreadsheet
=========================================
*/

/**
 * Fake Spreadsheetを生成する。
 *
 * @param {Object<string, Array<Array<*>>>} sheetDataMap
 * @return {Object}
 */
function SpreadsheetTransactionEngineTest_createSpreadsheet(
  sheetDataMap
) {

  const sheets =
    {};


  Object.keys(
    sheetDataMap
  ).forEach(
    function(sheetName) {

      sheets[
        sheetName
      ] =
        SpreadsheetTransactionEngineTest_createSheet(
          sheetName,
          sheetDataMap[
            sheetName
          ]
        );

    }
  );


  return {

    getSheetByName:
      function(sheetName) {

        return Object.prototype.hasOwnProperty.call(
          sheets,
          sheetName
        )
          ? sheets[
              sheetName
            ]
          : null;

      },

    getAllSheetValues:
      function() {

        const result =
          {};


        Object.keys(
          sheets
        ).forEach(
          function(sheetName) {

            result[
              sheetName
            ] =
              sheets[
                sheetName
              ].getAllValues();

          }
        );


        return result;

      }

  };

}


/**
 * Fake Sheetを生成する。
 */
function SpreadsheetTransactionEngineTest_createSheet(
  sheetName,
  initialValues
) {

  let values =
    SpreadsheetTransactionEngineTest_deepCopy(
      initialValues
    );


  return {

    getName:
      function() {

        return sheetName;

      },

    getLastColumn:
      function() {

        return values.length ===
          0
          ? 0
          : values[0].length;

      },

    getLastRow:
      function() {

        return values.length;

      },

    getRange:
      function(
        startRow,
        startColumn,
        rowCount,
        columnCount
      ) {

        return SpreadsheetTransactionEngineTest_createRange(
          function() {

            const result =
              [];


            for (
              let rowOffset = 0;
              rowOffset < rowCount;
              rowOffset += 1
            ) {

              const row =
                [];


              for (
                let columnOffset = 0;
                columnOffset < columnCount;
                columnOffset += 1
              ) {

                const sourceRow =
                  values[
                    startRow -
                    1 +
                    rowOffset
                  ] ||
                  [];


                const sourceValue =
                  sourceRow[
                    startColumn -
                    1 +
                    columnOffset
                  ];


                row.push(
                  sourceValue ===
                    undefined
                    ? ""
                    : sourceValue
                );

              }


              result.push(
                row
              );

            }


            return SpreadsheetTransactionEngineTest_deepCopy(
              result
            );

          },
          function(newValues) {

            for (
              let rowOffset = 0;
              rowOffset < rowCount;
              rowOffset += 1
            ) {

              const targetRowIndex =
                startRow -
                1 +
                rowOffset;


              while (
                values.length <=
                  targetRowIndex
              ) {

                values.push(
                  []
                );

              }


              for (
                let columnOffset = 0;
                columnOffset < columnCount;
                columnOffset += 1
              ) {

                const targetColumnIndex =
                  startColumn -
                    1 +
                    columnOffset;


                while (
                  values[
                    targetRowIndex
                  ].length <=
                    targetColumnIndex
                ) {

                  values[
                    targetRowIndex
                  ].push(
                    ""
                  );

                }


                values[
                  targetRowIndex
                ][
                  targetColumnIndex
                ] =
                  newValues[
                    rowOffset
                  ][
                    columnOffset
                  ];

              }

            }

          }
        );

      },

    deleteRow:
      function(rowNumber) {

        if (
          !Number.isInteger(
            rowNumber
          ) ||
          rowNumber <
            1 ||
          rowNumber >
            values.length
        ) {

          throw new Error(
            "Fake Sheetの削除行番号が不正です。" +
            " rowNumber=" +
            rowNumber
          );

        }


        values.splice(
          rowNumber -
            1,
          1
        );

      },

    getAllValues:
      function() {

        return SpreadsheetTransactionEngineTest_deepCopy(
          values
        );

      }

  };

}


/**
 * Fake Rangeを生成する。
 */
function SpreadsheetTransactionEngineTest_createRange(
  readValues,
  writeValues
) {

  return {

    getValues:
      function() {

        return readValues();

      },

    setValues:
      function(newValues) {

        if (
          !Array.isArray(
            newValues
          )
        ) {

          throw new Error(
            "Fake Range.setValues()にはArrayが必要です。"
          );

        }


        writeValues(
          SpreadsheetTransactionEngineTest_deepCopy(
            newValues
          )
        );


        return this;

      }

  };

}


/*
=========================================
Assertions
=========================================
*/

function SpreadsheetTransactionEngineTest_assertEquals(
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


function SpreadsheetTransactionEngineTest_assertTrue(
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


function SpreadsheetTransactionEngineTest_assertObject(
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


function SpreadsheetTransactionEngineTest_assertBindingReference(
  actual,
  expectedBindingId,
  label
) {

  SpreadsheetTransactionEngineTest_assertObject(
    actual,
    label
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    1,
    Object.keys(
      actual
    ).length,
    label +
    ".keys.length"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    expectedBindingId,
    actual.bindingRef,
    label +
    ".bindingRef"
  );

}


function SpreadsheetTransactionEngineTest_deepCopy(
  value
) {

  return JSON.parse(
    JSON.stringify(
      value
    )
  );

}



function test_SpreadsheetTransactionEngine_booleanConditionDetailIsPersisted() {

  const spreadsheet =
    SpreadsheetTransactionEngineTest_createSpreadsheet({

      "成形条件マスター": [

        [
          "条件ID",
          "製品ID",
          "状態"
        ]

      ],

      "成形条件詳細マスター": [

        [
          "条件ID",
          "金型温度(℃)",
          "速度徐変1(ON/OFF)",
          "保圧徐変1(ON/OFF)"
        ]

      ],

      "製品マスター": [

        [
          "製品ID",
          "現在標準条件ID"
        ],

        [
          "P-000035",
          "COND-000152"
        ]

      ]

    });


  SpreadsheetTransactionEngineTest_prepareEnvironment(
    spreadsheet
  );


  const executionPlan =
    SpreadsheetTransactionEngineTest_createBaseExecutionPlan();


  const detailOperation =
    SpreadsheetTransactionEngineTest_createInsertDetailOperation(
      2
    );


  detailOperation
    .payload
    .values[
      "速度徐変1(ON/OFF)"
    ] =
    true;


  detailOperation
    .payload
    .values[
      "保圧徐変1(ON/OFF)"
    ] =
    false;


  executionPlan.operations = [

    SpreadsheetTransactionEngineTest_createInsertConditionOperation(
      1
    ),

    detailOperation,

    SpreadsheetTransactionEngineTest_createUpdateProductOperation(
      3,
      "COND-000152"
    )

  ];


  ExecutionPlanContract_validate(
    executionPlan
  );


  const result =
    SpreadsheetTransactionEngine_execute(
      executionPlan
    );


  SpreadsheetTransactionEngineTest_assertEquals(
    EXECUTION_RESULT_STATUS_SUCCESS,
    result.status,
    "result.status"
  );


  const detailRow =
    spreadsheet
      .getSheetByName(
        "成形条件詳細マスター"
      )
      .getAllValues()[1];


  SpreadsheetTransactionEngineTest_assertEquals(
    true,
    detailRow[2],
    "速度徐変1(ON/OFF)"
  );


  SpreadsheetTransactionEngineTest_assertEquals(
    false,
    detailRow[3],
    "保圧徐変1(ON/OFF)"
  );


  console.log(
    "[PASS] booleanConditionDetailIsPersisted"
  );

}