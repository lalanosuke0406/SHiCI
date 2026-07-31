/*
=========================================
SHiCI

108_ExecutionPlanContractTest.js

Execution Plan Contract Test
Version 1.0

Part 1
・Test Runner
・Fixture
・Test Helper
=========================================
*/


/*
=========================================
Test Runner
=========================================
*/

/**
 * ExecutionPlanContract Test Entry Point
 */
function test_ExecutionPlanContract() {

  console.log("");

  console.log(
    "========================================="
  );

  console.log(
    "ExecutionPlanContract Test Start"
  );

  console.log(
    "========================================="
  );


  /*
  =========================================
  Factory Test
  =========================================
  */

  test_ExecutionPlanContract_createEmpty();

  test_ExecutionPlanContract_createEmptyOperation();


  /*
  =========================================
  Validation Normal Test
  =========================================
  */

  test_ExecutionPlanContract_validate_normal();


  /*
  =========================================
  Validation Error Test
  =========================================
  */

  test_ExecutionPlanContract_validate_error();

  test_ExecutionPlanContract_validate_operationErrors();

  test_ExecutionPlanContract_validate_remainingErrors();


  console.log("");

  console.log(
    "========================================="
  );

  console.log(
    "[Execution Plan Contract Ver.1.0 Test Passed]"
  );

  console.log(
    "========================================="
  );

}


/*
=========================================
Fixture
=========================================
*/

/**
 * 正常なExecution Planを生成する。
 *
 * @return {Object}
 */
function ExecutionPlanContractTest_createValidExecutionPlan() {

  const executionPlan =
    ExecutionPlanContract_createEmpty();


  executionPlan.executionPlanId =
    "execution-plan-001";

  executionPlan.changePlanId =
    "change-plan-001";

  executionPlan.proposalId =
    "proposal-001";


  executionPlan.status =
    EXECUTION_PLAN_STATUS_READY;


  executionPlan.subject.entityType =
    "Product";

  executionPlan.subject.entityId =
    "PRODUCT-001";

  executionPlan.subject.entityName =
    "Sample Product";


  executionPlan.operations = [

    ExecutionPlanContractTest_createValidInsertOperation(
      1
    )

  ];


  executionPlan.executionPolicy.atomic =
    true;

  executionPlan.executionPolicy.stopOnError =
    true;

  executionPlan.executionPolicy.rollbackRequired =
    true;


  executionPlan.executable =
    true;


  executionPlan.createdAt =
    "2026-07-31T00:00:00.000Z";

  executionPlan.createdBy =
    "ExecutionPlanContractTest";


  executionPlan.metadata.source =
    "unit_test";

  executionPlan.metadata.requestId =
    "request-001";

  executionPlan.metadata.correlationId =
    "correlation-001";


  return executionPlan;

}


/**
 * 正常なinsert Operationを生成する。
 *
 * @param {number} sequence
 * @return {Object}
 */
function ExecutionPlanContractTest_createValidInsertOperation(
  sequence
) {

  const operation =
    ExecutionPlanContract_createEmptyOperation();


  operation.operationId =
    "operation-insert-" +
    sequence;

  operation.sequence =
    sequence;

  operation.operationType =
    EXECUTION_PLAN_OPERATION_INSERT;


  operation.target.repository =
    "spreadsheet";

  operation.target.sheetName =
    "Products";

  operation.target.entityType =
    "Product";

  operation.target.entityId =
    "PRODUCT-001";


  operation.payload.values = {

    productId:
      "PRODUCT-001",

    productName:
      "Sample Product"

  };

  operation.payload.criteria =
    null;


  operation.rollback.supported =
    false;

  operation.rollback.operationType =
    null;

  operation.rollback.payload =
    null;


  operation.metadata.description =
    "Productsシートへ製品を追加する";

  operation.metadata.sourcePath =
    "changePlan.changes[0]";


  return operation;

}


/**
 * 正常なappend Operationを生成する。
 *
 * @param {number} sequence
 * @return {Object}
 */
function ExecutionPlanContractTest_createValidAppendOperation(
  sequence
) {

  const operation =
    ExecutionPlanContract_createEmptyOperation();


  operation.operationId =
    "operation-append-" +
    sequence;

  operation.sequence =
    sequence;

  operation.operationType =
    EXECUTION_PLAN_OPERATION_APPEND;


  operation.target.repository =
    "spreadsheet";

  operation.target.sheetName =
    "ProductHistory";

  operation.target.entityType =
    "ProductHistory";

  operation.target.entityId =
    null;


  operation.payload.values = {

    historyId:
      "HISTORY-001",

    productId:
      "PRODUCT-001",

    action:
      "updated"

  };

  operation.payload.criteria =
    null;


  operation.rollback.supported =
    false;

  operation.rollback.operationType =
    null;

  operation.rollback.payload =
    null;


  operation.metadata.description =
    "ProductHistoryへ履歴を追加する";

  operation.metadata.sourcePath =
    "changePlan.changes[1]";


  return operation;

}


/**
 * 正常なupdate Operationを生成する。
 *
 * @param {number} sequence
 * @return {Object}
 */
function ExecutionPlanContractTest_createValidUpdateOperation(
  sequence
) {

  const operation =
    ExecutionPlanContract_createEmptyOperation();


  operation.operationId =
    "operation-update-" +
    sequence;

  operation.sequence =
    sequence;

  operation.operationType =
    EXECUTION_PLAN_OPERATION_UPDATE;


  operation.target.repository =
    "spreadsheet";

  operation.target.sheetName =
    "Products";

  operation.target.entityType =
    "Product";

  operation.target.entityId =
    "PRODUCT-001";


  operation.payload.values = {

    productName:
      "Updated Product"

  };

  operation.payload.criteria = {

    productId:
      "PRODUCT-001"

  };


  operation.rollback.supported =
    true;

  operation.rollback.operationType =
    EXECUTION_PLAN_OPERATION_UPDATE;

  operation.rollback.payload = {

    values: {

      productName:
        "Sample Product"

    },

    criteria: {

      productId:
        "PRODUCT-001"

    }

  };


  operation.metadata.description =
    "Productsシートの製品名を更新する";

  operation.metadata.sourcePath =
    "changePlan.changes[0]";


  return operation;

}


/**
 * 正常なdelete Operationを生成する。
 *
 * @param {number} sequence
 * @return {Object}
 */
function ExecutionPlanContractTest_createValidDeleteOperation(
  sequence
) {

  const operation =
    ExecutionPlanContract_createEmptyOperation();


  operation.operationId =
    "operation-delete-" +
    sequence;

  operation.sequence =
    sequence;

  operation.operationType =
    EXECUTION_PLAN_OPERATION_DELETE;


  operation.target.repository =
    "spreadsheet";

  operation.target.sheetName =
    "Products";

  operation.target.entityType =
    "Product";

  operation.target.entityId =
    "PRODUCT-001";


  operation.payload.values =
    null;

  operation.payload.criteria = {

    productId:
      "PRODUCT-001"

  };


  operation.rollback.supported =
    true;

  operation.rollback.operationType =
    EXECUTION_PLAN_OPERATION_INSERT;

  operation.rollback.payload = {

    values: {

      productId:
        "PRODUCT-001",

      productName:
        "Sample Product"

    },

    criteria:
      null

  };


  operation.metadata.description =
    "Productsシートから製品を削除する";

  operation.metadata.sourcePath =
    "changePlan.changes[0]";


  return operation;

}


/**
 * JSON互換オブジェクトを複製する。
 *
 * @param {*} value
 * @return {*}
 */
function ExecutionPlanContractTest_deepCopy(
  value
) {

  return JSON.parse(
    JSON.stringify(
      value
    )
  );

}


/*
=========================================
Test Helper
=========================================
*/

/**
 * 値が一致することを確認する。
 *
 * @param {*} expected
 * @param {*} actual
 * @param {string} label
 */
function ExecutionPlanContractTest_assertEquals(
  expected,
  actual,
  label
) {

  if (
    actual !==
      expected
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


/**
 * 値がtrueであることを確認する。
 *
 * @param {*} actual
 * @param {string} label
 */
function ExecutionPlanContractTest_assertTrue(
  actual,
  label
) {

  ExecutionPlanContractTest_assertEquals(
    true,
    actual,
    label
  );

}


/**
 * 値がfalseであることを確認する。
 *
 * @param {*} actual
 * @param {string} label
 */
function ExecutionPlanContractTest_assertFalse(
  actual,
  label
) {

  ExecutionPlanContractTest_assertEquals(
    false,
    actual,
    label
  );

}


/**
 * 値がnullであることを確認する。
 *
 * @param {*} actual
 * @param {string} label
 */
function ExecutionPlanContractTest_assertNull(
  actual,
  label
) {

  ExecutionPlanContractTest_assertEquals(
    null,
    actual,
    label
  );

}


/**
 * 値がObjectであることを確認する。
 *
 * @param {*} actual
 * @param {string} label
 */
function ExecutionPlanContractTest_assertObject(
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
      label +
      " actual=" +
      JSON.stringify(
        actual
      )
    );

  }

}


/**
 * 値がArrayであることを確認する。
 *
 * @param {*} actual
 * @param {string} label
 */
function ExecutionPlanContractTest_assertArray(
  actual,
  label
) {

  if (
    !Array.isArray(
      actual
    )
  ) {

    throw new Error(
      "[AssertArray Failed] " +
      label +
      " actual=" +
      JSON.stringify(
        actual
      )
    );

  }

}


/**
 * Arrayの件数を確認する。
 *
 * @param {number} expectedLength
 * @param {Array} actual
 * @param {string} label
 */
function ExecutionPlanContractTest_assertArrayLength(
  expectedLength,
  actual,
  label
) {

  ExecutionPlanContractTest_assertArray(
    actual,
    label
  );


  ExecutionPlanContractTest_assertEquals(
    expectedLength,
    actual.length,
    label +
    ".length"
  );

}


/**
 * 例外が発生することを確認する。
 *
 * @param {Function} callback
 * @param {string} expectedMessage
 * @param {string} label
 */
function ExecutionPlanContractTest_assertThrows(
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
      null &&
    String(
      thrownError.message
    ).indexOf(
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
        thrownError.message
      )
    );

  }

}



/*
=========================================
Part 2

Factory Test
=========================================
*/


/*
=========================================
Execution Plan Factory Test
=========================================
*/

/**
 * ExecutionPlanContract_createEmpty()を検証する。
 */
function test_ExecutionPlanContract_createEmpty() {

  const executionPlan =
    ExecutionPlanContract_createEmpty();


  ExecutionPlanContractTest_assertObject(
    executionPlan,
    "createEmpty result"
  );


  ExecutionPlanContractTest_assertEquals(
    "1.0",
    executionPlan.schemaVersion,
    "executionPlan.schemaVersion"
  );


  ExecutionPlanContractTest_assertEquals(
    EXECUTION_PLAN_CONTRACT_VERSION,
    executionPlan.contractVersion,
    "executionPlan.contractVersion"
  );


  ExecutionPlanContractTest_assertNull(
    executionPlan.executionPlanId,
    "executionPlan.executionPlanId"
  );


  ExecutionPlanContractTest_assertNull(
    executionPlan.changePlanId,
    "executionPlan.changePlanId"
  );


  ExecutionPlanContractTest_assertNull(
    executionPlan.proposalId,
    "executionPlan.proposalId"
  );


  ExecutionPlanContractTest_assertEquals(
    EXECUTION_PLAN_STATUS_DRAFT,
    executionPlan.status,
    "executionPlan.status"
  );


  ExecutionPlanContractTest_assertObject(
    executionPlan.subject,
    "executionPlan.subject"
  );


  ExecutionPlanContractTest_assertNull(
    executionPlan.subject.entityType,
    "executionPlan.subject.entityType"
  );


  ExecutionPlanContractTest_assertNull(
    executionPlan.subject.entityId,
    "executionPlan.subject.entityId"
  );


  ExecutionPlanContractTest_assertNull(
    executionPlan.subject.entityName,
    "executionPlan.subject.entityName"
  );


  ExecutionPlanContractTest_assertArrayLength(
    0,
    executionPlan.operations,
    "executionPlan.operations"
  );


  ExecutionPlanContractTest_assertObject(
    executionPlan.executionPolicy,
    "executionPlan.executionPolicy"
  );


  ExecutionPlanContractTest_assertTrue(
    executionPlan.executionPolicy.atomic,
    "executionPlan.executionPolicy.atomic"
  );


  ExecutionPlanContractTest_assertTrue(
    executionPlan.executionPolicy.stopOnError,
    "executionPlan.executionPolicy.stopOnError"
  );


  ExecutionPlanContractTest_assertTrue(
    executionPlan.executionPolicy.rollbackRequired,
    "executionPlan.executionPolicy.rollbackRequired"
  );


  ExecutionPlanContractTest_assertFalse(
    executionPlan.executable,
    "executionPlan.executable"
  );


  ExecutionPlanContractTest_assertNull(
    executionPlan.createdAt,
    "executionPlan.createdAt"
  );


  ExecutionPlanContractTest_assertNull(
    executionPlan.createdBy,
    "executionPlan.createdBy"
  );


  ExecutionPlanContractTest_assertObject(
    executionPlan.metadata,
    "executionPlan.metadata"
  );


  ExecutionPlanContractTest_assertNull(
    executionPlan.metadata.source,
    "executionPlan.metadata.source"
  );


  ExecutionPlanContractTest_assertNull(
    executionPlan.metadata.requestId,
    "executionPlan.metadata.requestId"
  );


  ExecutionPlanContractTest_assertNull(
    executionPlan.metadata.correlationId,
    "executionPlan.metadata.correlationId"
  );

}


/*
=========================================
Operation Factory Test
=========================================
*/

/**
 * ExecutionPlanContract_createEmptyOperation()を検証する。
 */
function test_ExecutionPlanContract_createEmptyOperation() {

  const operation =
    ExecutionPlanContract_createEmptyOperation();


  ExecutionPlanContractTest_assertObject(
    operation,
    "createEmptyOperation result"
  );


  ExecutionPlanContractTest_assertNull(
    operation.operationId,
    "operation.operationId"
  );


  ExecutionPlanContractTest_assertNull(
    operation.sequence,
    "operation.sequence"
  );


  ExecutionPlanContractTest_assertNull(
    operation.operationType,
    "operation.operationType"
  );


  ExecutionPlanContractTest_assertObject(
    operation.target,
    "operation.target"
  );


  ExecutionPlanContractTest_assertEquals(
    "spreadsheet",
    operation.target.repository,
    "operation.target.repository"
  );


  ExecutionPlanContractTest_assertNull(
    operation.target.sheetName,
    "operation.target.sheetName"
  );


  ExecutionPlanContractTest_assertNull(
    operation.target.entityType,
    "operation.target.entityType"
  );


  ExecutionPlanContractTest_assertNull(
    operation.target.entityId,
    "operation.target.entityId"
  );


  ExecutionPlanContractTest_assertObject(
    operation.payload,
    "operation.payload"
  );


  ExecutionPlanContractTest_assertNull(
    operation.payload.values,
    "operation.payload.values"
  );


  ExecutionPlanContractTest_assertNull(
    operation.payload.criteria,
    "operation.payload.criteria"
  );


  ExecutionPlanContractTest_assertObject(
    operation.rollback,
    "operation.rollback"
  );


  ExecutionPlanContractTest_assertFalse(
    operation.rollback.supported,
    "operation.rollback.supported"
  );


  ExecutionPlanContractTest_assertNull(
    operation.rollback.operationType,
    "operation.rollback.operationType"
  );


  ExecutionPlanContractTest_assertNull(
    operation.rollback.payload,
    "operation.rollback.payload"
  );


  ExecutionPlanContractTest_assertObject(
    operation.metadata,
    "operation.metadata"
  );


  ExecutionPlanContractTest_assertNull(
    operation.metadata.description,
    "operation.metadata.description"
  );


  ExecutionPlanContractTest_assertNull(
    operation.metadata.sourcePath,
    "operation.metadata.sourcePath"
  );

}


/*
=========================================
Factory Independence Test
=========================================
*/

/**
 * createEmpty()が毎回独立したObjectを返すことを検証する。
 */
function test_ExecutionPlanContract_createEmpty_independent() {

  const first =
    ExecutionPlanContract_createEmpty();

  const second =
    ExecutionPlanContract_createEmpty();


  first.subject.entityType =
    "Product";

  first.operations.push(
    {
      operationId:
        "operation-001"
    }
  );

  first.executionPolicy.atomic =
    false;

  first.metadata.source =
    "first";


  ExecutionPlanContractTest_assertNull(
    second.subject.entityType,
    "second.subject.entityType"
  );


  ExecutionPlanContractTest_assertArrayLength(
    0,
    second.operations,
    "second.operations"
  );


  ExecutionPlanContractTest_assertTrue(
    second.executionPolicy.atomic,
    "second.executionPolicy.atomic"
  );


  ExecutionPlanContractTest_assertNull(
    second.metadata.source,
    "second.metadata.source"
  );

}


/**
 * createEmptyOperation()が毎回独立したObjectを返すことを検証する。
 */
function test_ExecutionPlanContract_createEmptyOperation_independent() {

  const first =
    ExecutionPlanContract_createEmptyOperation();

  const second =
    ExecutionPlanContract_createEmptyOperation();


  first.target.sheetName =
    "Products";

  first.payload.values = {

    productId:
      "PRODUCT-001"

  };

  first.rollback.supported =
    true;

  first.metadata.description =
    "first";


  ExecutionPlanContractTest_assertNull(
    second.target.sheetName,
    "second.target.sheetName"
  );


  ExecutionPlanContractTest_assertNull(
    second.payload.values,
    "second.payload.values"
  );


  ExecutionPlanContractTest_assertFalse(
    second.rollback.supported,
    "second.rollback.supported"
  );


  ExecutionPlanContractTest_assertNull(
    second.metadata.description,
    "second.metadata.description"
  );

}



/*
=========================================
Part 3

Validation Normal Test
=========================================
*/


/*
=========================================
Validation Normal Test Runner
=========================================
*/

/**
 * ExecutionPlanContract_validate()の正常系を検証する。
 */
function test_ExecutionPlanContract_validate_normal() {

  test_ExecutionPlanContract_validate_basic();

  test_ExecutionPlanContract_validate_insert();

  test_ExecutionPlanContract_validate_append();

  test_ExecutionPlanContract_validate_update();

  test_ExecutionPlanContract_validate_delete();

  test_ExecutionPlanContract_validate_multipleOperations();

  test_ExecutionPlanContract_validate_optionalNullValues();

  test_ExecutionPlanContract_validate_statusDraft();

  test_ExecutionPlanContract_validate_statusReady();

  test_ExecutionPlanContract_validate_statusExecuting();

  test_ExecutionPlanContract_validate_statusCompleted();

  test_ExecutionPlanContract_validate_statusFailed();

}


/*
=========================================
Basic Validation
=========================================
*/

/**
 * 正常なExecution Planが検証を通過することを確認する。
 */
function test_ExecutionPlanContract_validate_basic() {

  const executionPlan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  const result =
    ExecutionPlanContract_validate(
      executionPlan
    );


  ExecutionPlanContractTest_assertTrue(
    result,
    "validate basic"
  );

}


/*
=========================================
Operation Type Validation
=========================================
*/

/**
 * insert Operationが検証を通過することを確認する。
 */
function test_ExecutionPlanContract_validate_insert() {

  const executionPlan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  executionPlan.operations = [

    ExecutionPlanContractTest_createValidInsertOperation(
      1
    )

  ];


  const result =
    ExecutionPlanContract_validate(
      executionPlan
    );


  ExecutionPlanContractTest_assertTrue(
    result,
    "validate insert"
  );

}


/**
 * append Operationが検証を通過することを確認する。
 */
function test_ExecutionPlanContract_validate_append() {

  const executionPlan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  executionPlan.operations = [

    ExecutionPlanContractTest_createValidAppendOperation(
      1
    )

  ];


  const result =
    ExecutionPlanContract_validate(
      executionPlan
    );


  ExecutionPlanContractTest_assertTrue(
    result,
    "validate append"
  );

}


/**
 * update Operationが検証を通過することを確認する。
 */
function test_ExecutionPlanContract_validate_update() {

  const executionPlan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  executionPlan.operations = [

    ExecutionPlanContractTest_createValidUpdateOperation(
      1
    )

  ];


  const result =
    ExecutionPlanContract_validate(
      executionPlan
    );


  ExecutionPlanContractTest_assertTrue(
    result,
    "validate update"
  );

}


/**
 * delete Operationが検証を通過することを確認する。
 */
function test_ExecutionPlanContract_validate_delete() {

  const executionPlan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  executionPlan.operations = [

    ExecutionPlanContractTest_createValidDeleteOperation(
      1
    )

  ];


  const result =
    ExecutionPlanContract_validate(
      executionPlan
    );


  ExecutionPlanContractTest_assertTrue(
    result,
    "validate delete"
  );

}


/*
=========================================
Multiple Operations
=========================================
*/

/**
 * 複数Operationが正しいsequenceで並ぶ場合に
 * 検証を通過することを確認する。
 */
function test_ExecutionPlanContract_validate_multipleOperations() {

  const executionPlan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  executionPlan.operations = [

    ExecutionPlanContractTest_createValidInsertOperation(
      1
    ),

    ExecutionPlanContractTest_createValidUpdateOperation(
      2
    ),

    ExecutionPlanContractTest_createValidAppendOperation(
      3
    ),

    ExecutionPlanContractTest_createValidDeleteOperation(
      4
    )

  ];


  const result =
    ExecutionPlanContract_validate(
      executionPlan
    );


  ExecutionPlanContractTest_assertTrue(
    result,
    "validate multiple operations"
  );

}


/*
=========================================
Optional Values
=========================================
*/

/**
 * nullを許可する任意項目がnullでも
 * 検証を通過することを確認する。
 */
function test_ExecutionPlanContract_validate_optionalNullValues() {

  const executionPlan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  executionPlan.subject.entityName =
    null;

  executionPlan.createdBy =
    null;

  executionPlan.metadata.source =
    null;

  executionPlan.metadata.requestId =
    null;

  executionPlan.metadata.correlationId =
    null;


  executionPlan.operations[0].target.entityId =
    null;

  executionPlan.operations[0].metadata.description =
    null;

  executionPlan.operations[0].metadata.sourcePath =
    null;


  const result =
    ExecutionPlanContract_validate(
      executionPlan
    );


  ExecutionPlanContractTest_assertTrue(
    result,
    "validate optional null values"
  );

}


/*
=========================================
Status and Executable
=========================================
*/

/**
 * draftとexecutable=falseの組み合わせが
 * 検証を通過することを確認する。
 */
function test_ExecutionPlanContract_validate_statusDraft() {

  const executionPlan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  executionPlan.status =
    EXECUTION_PLAN_STATUS_DRAFT;

  executionPlan.executable =
    false;


  const result =
    ExecutionPlanContract_validate(
      executionPlan
    );


  ExecutionPlanContractTest_assertTrue(
    result,
    "validate draft status"
  );

}


/**
 * ready_for_executionとexecutable=trueの組み合わせが
 * 検証を通過することを確認する。
 */
function test_ExecutionPlanContract_validate_statusReady() {

  const executionPlan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  executionPlan.status =
    EXECUTION_PLAN_STATUS_READY;

  executionPlan.executable =
    true;


  const result =
    ExecutionPlanContract_validate(
      executionPlan
    );


  ExecutionPlanContractTest_assertTrue(
    result,
    "validate ready status"
  );

}


/**
 * executingが検証を通過することを確認する。
 */
function test_ExecutionPlanContract_validate_statusExecuting() {

  const executionPlan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  executionPlan.status =
    EXECUTION_PLAN_STATUS_EXECUTING;

  executionPlan.executable =
    false;


  const result =
    ExecutionPlanContract_validate(
      executionPlan
    );


  ExecutionPlanContractTest_assertTrue(
    result,
    "validate executing status"
  );

}


/**
 * completedとexecutable=falseの組み合わせが
 * 検証を通過することを確認する。
 */
function test_ExecutionPlanContract_validate_statusCompleted() {

  const executionPlan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  executionPlan.status =
    EXECUTION_PLAN_STATUS_COMPLETED;

  executionPlan.executable =
    false;


  const result =
    ExecutionPlanContract_validate(
      executionPlan
    );


  ExecutionPlanContractTest_assertTrue(
    result,
    "validate completed status"
  );

}


/**
 * failedとexecutable=falseの組み合わせが
 * 検証を通過することを確認する。
 */
function test_ExecutionPlanContract_validate_statusFailed() {

  const executionPlan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  executionPlan.status =
    EXECUTION_PLAN_STATUS_FAILED;

  executionPlan.executable =
    false;


  const result =
    ExecutionPlanContract_validate(
      executionPlan
    );


  ExecutionPlanContractTest_assertTrue(
    result,
    "validate failed status"
  );

}



/*
=========================================
Part 4

Validation Error Test ①
=========================================
*/


/*
=========================================
Validation Error Runner
=========================================
*/

function test_ExecutionPlanContract_validate_error() {

  test_ExecutionPlanContract_invalidSchemaVersion();

  test_ExecutionPlanContract_invalidContractVersion();

  test_ExecutionPlanContract_missingExecutionPlanId();

  test_ExecutionPlanContract_missingChangePlanId();

  test_ExecutionPlanContract_missingProposalId();

  test_ExecutionPlanContract_invalidStatus();

  test_ExecutionPlanContract_invalidSubject();

  test_ExecutionPlanContract_emptyOperations();

}


/*
=========================================
Header Validation
=========================================
*/

function test_ExecutionPlanContract_invalidSchemaVersion() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();

  plan.schemaVersion =
    "2.0";

  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "executionPlan.schemaVersion",

    "schemaVersion"

  );

}


function test_ExecutionPlanContract_invalidContractVersion() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();

  plan.contractVersion =
    "9.9";

  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "executionPlan.contractVersion",

    "contractVersion"

  );

}


function test_ExecutionPlanContract_missingExecutionPlanId() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();

  plan.executionPlanId =
    "";

  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "executionPlan.executionPlanId",

    "executionPlanId"

  );

}


function test_ExecutionPlanContract_missingChangePlanId() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();

  plan.changePlanId =
    "";

  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "executionPlan.changePlanId",

    "changePlanId"

  );

}


function test_ExecutionPlanContract_missingProposalId() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();

  plan.proposalId =
    "";

  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "executionPlan.proposalId",

    "proposalId"

  );

}


/*
=========================================
Status
=========================================
*/

function test_ExecutionPlanContract_invalidStatus() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();

  plan.status =
    "UNKNOWN_STATUS";

  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "未対応のExecution Plan status",

    "status"

  );

}


/*
=========================================
Subject
=========================================
*/

function test_ExecutionPlanContract_invalidSubject() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();

  plan.subject =
    null;

  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "executionPlan.subject",

    "subject"

  );

}


/*
=========================================
Operations
=========================================
*/

function test_ExecutionPlanContract_emptyOperations() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();

  plan.operations =
    [];

  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "Operationが必要",

    "operations"

  );

}



/*
=========================================
Part 5

Operation Validation Error Test
=========================================
*/


/*
=========================================
Operation Error Test Runner
=========================================
*/

/**
 * Operation関連の異常系を検証する。
 */
function test_ExecutionPlanContract_validate_operationErrors() {

  /*
  =========================================
  Operations
  =========================================
  */

  test_ExecutionPlanContract_operationsNotArray();

  test_ExecutionPlanContract_duplicateOperationId();

  test_ExecutionPlanContract_invalidOperationSequence();

  test_ExecutionPlanContract_wrongOperationSequenceOrder();

  test_ExecutionPlanContract_invalidOperationType();


  /*
  =========================================
  Target
  =========================================
  */

  test_ExecutionPlanContract_invalidTarget();

  test_ExecutionPlanContract_invalidRepository();

  test_ExecutionPlanContract_missingSheetName();

  test_ExecutionPlanContract_missingTargetEntityType();

  test_ExecutionPlanContract_invalidTargetEntityId();


  /*
  =========================================
  Payload
  =========================================
  */

  test_ExecutionPlanContract_invalidPayload();

  test_ExecutionPlanContract_insertMissingValues();

  test_ExecutionPlanContract_appendMissingValues();

  test_ExecutionPlanContract_updateMissingValues();

  test_ExecutionPlanContract_updateMissingCriteria();

  test_ExecutionPlanContract_updateEmptyCriteria();

  test_ExecutionPlanContract_deleteValuesNotNull();

  test_ExecutionPlanContract_deleteMissingCriteria();

  test_ExecutionPlanContract_deleteEmptyCriteria();


  /*
  =========================================
  Rollback
  =========================================
  */

  test_ExecutionPlanContract_invalidRollback();

  test_ExecutionPlanContract_invalidRollbackSupported();

  test_ExecutionPlanContract_supportedRollbackMissingOperationType();

  test_ExecutionPlanContract_supportedRollbackMissingPayload();

  test_ExecutionPlanContract_unsupportedRollbackHasOperationType();

  test_ExecutionPlanContract_unsupportedRollbackHasPayload();

}


/*
=========================================
Operations
=========================================
*/

/**
 * operationsがArrayでない場合に例外となることを確認する。
 */
function test_ExecutionPlanContract_operationsNotArray() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations =
    {};


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "executionPlan.operationsはArrayである必要があります。",

    "operations not array"

  );

}


/**
 * operationIdが重複する場合に例外となることを確認する。
 */
function test_ExecutionPlanContract_duplicateOperationId() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  const firstOperation =
    ExecutionPlanContractTest_createValidInsertOperation(
      1
    );

  const secondOperation =
    ExecutionPlanContractTest_createValidAppendOperation(
      2
    );


  secondOperation.operationId =
    firstOperation.operationId;


  plan.operations = [

    firstOperation,

    secondOperation

  ];


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "operationIdが重複しています。",

    "duplicate operationId"

  );

}


/**
 * sequenceが1以上の整数でない場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_invalidOperationSequence() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations[0].sequence =
    0;


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "sequenceは1以上の整数である必要があります。",

    "invalid operation sequence"

  );

}


/**
 * Operationの順序とsequenceが一致しない場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_wrongOperationSequenceOrder() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations = [

    ExecutionPlanContractTest_createValidInsertOperation(
      1
    ),

    ExecutionPlanContractTest_createValidAppendOperation(
      3
    )

  ];


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "Operationのsequenceが不正です。expected=2 actual=3",

    "wrong operation sequence order"

  );

}


/**
 * 未対応のoperationTypeの場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_invalidOperationType() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations[0].operationType =
    "replace";


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "未対応のoperationTypeです。operationType=replace",

    "invalid operation type"

  );

}


/*
=========================================
Target
=========================================
*/

/**
 * targetがObjectでない場合に例外となることを確認する。
 */
function test_ExecutionPlanContract_invalidTarget() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations[0].target =
    null;


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    ".targetはObjectである必要があります。",

    "invalid target"

  );

}


/**
 * repositoryがspreadsheetでない場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_invalidRepository() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations[0].target.repository =
    "database";


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    ".target.repositoryが不正です。",

    "invalid repository"

  );

}


/**
 * sheetNameが空の場合に例外となることを確認する。
 */
function test_ExecutionPlanContract_missingSheetName() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations[0].target.sheetName =
    "";


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    ".target.sheetNameは空でないstringである必要があります。",

    "missing sheetName"

  );

}


/**
 * target.entityTypeが空の場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_missingTargetEntityType() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations[0].target.entityType =
    "";


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    ".target.entityTypeは空でないstringである必要があります。",

    "missing target entityType"

  );

}


/**
 * target.entityIdが空文字の場合に
 * 例外となることを確認する。
 *
 * entityIdはnullを許可するが、
 * stringの場合は空にできない。
 */
function test_ExecutionPlanContract_invalidTargetEntityId() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations[0].target.entityId =
    "";


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    ".target.entityIdは空でないstringである必要があります。",

    "invalid target entityId"

  );

}


/*
=========================================
Payload
=========================================
*/

/**
 * payloadがObjectでない場合に例外となることを確認する。
 */
function test_ExecutionPlanContract_invalidPayload() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations[0].payload =
    null;


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    ".payloadはObjectである必要があります。",

    "invalid payload"

  );

}


/**
 * insertのvaluesがObjectでない場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_insertMissingValues() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations = [

    ExecutionPlanContractTest_createValidInsertOperation(
      1
    )

  ];


  plan.operations[0].payload.values =
    null;


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    ".payload.valuesはObjectである必要があります。",

    "insert missing values"

  );

}


/**
 * appendのvaluesがObjectでない場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_appendMissingValues() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations = [

    ExecutionPlanContractTest_createValidAppendOperation(
      1
    )

  ];


  plan.operations[0].payload.values =
    null;


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    ".payload.valuesはObjectである必要があります。",

    "append missing values"

  );

}


/**
 * updateのvaluesがObjectでない場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_updateMissingValues() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations = [

    ExecutionPlanContractTest_createValidUpdateOperation(
      1
    )

  ];


  plan.operations[0].payload.values =
    null;


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    ".payload.valuesはObjectである必要があります。",

    "update missing values"

  );

}


/**
 * updateのcriteriaがObjectでない場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_updateMissingCriteria() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations = [

    ExecutionPlanContractTest_createValidUpdateOperation(
      1
    )

  ];


  plan.operations[0].payload.criteria =
    null;


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    ".payload.criteriaはObjectである必要があります。",

    "update missing criteria"

  );

}


/**
 * updateのcriteriaが空Objectの場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_updateEmptyCriteria() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations = [

    ExecutionPlanContractTest_createValidUpdateOperation(
      1
    )

  ];


  plan.operations[0].payload.criteria =
    {};


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    ".payload.criteriaは空にできません。",

    "update empty criteria"

  );

}


/**
 * deleteのvaluesがnullでない場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_deleteValuesNotNull() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations = [

    ExecutionPlanContractTest_createValidDeleteOperation(
      1
    )

  ];


  plan.operations[0].payload.values = {

    productName:
      "Invalid Value"

  };


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    ".payload.valuesはdeleteではnullである必要があります。",

    "delete values not null"

  );

}


/**
 * deleteのcriteriaがObjectでない場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_deleteMissingCriteria() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations = [

    ExecutionPlanContractTest_createValidDeleteOperation(
      1
    )

  ];


  plan.operations[0].payload.criteria =
    null;


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    ".payload.criteriaはObjectである必要があります。",

    "delete missing criteria"

  );

}


/**
 * deleteのcriteriaが空Objectの場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_deleteEmptyCriteria() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations = [

    ExecutionPlanContractTest_createValidDeleteOperation(
      1
    )

  ];


  plan.operations[0].payload.criteria =
    {};


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    ".payload.criteriaは空にできません。",

    "delete empty criteria"

  );

}


/*
=========================================
Rollback
=========================================
*/

/**
 * rollbackがObjectでない場合に例外となることを確認する。
 */
function test_ExecutionPlanContract_invalidRollback() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations[0].rollback =
    null;


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    ".rollbackはObjectである必要があります。",

    "invalid rollback"

  );

}


/**
 * rollback.supportedがbooleanでない場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_invalidRollbackSupported() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations[0].rollback.supported =
    "false";


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    ".rollback.supportedはbooleanである必要があります。",

    "invalid rollback supported"

  );

}


/**
 * rollback対応なのにoperationTypeがない場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_supportedRollbackMissingOperationType() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations = [

    ExecutionPlanContractTest_createValidUpdateOperation(
      1
    )

  ];


  plan.operations[0].rollback.operationType =
    null;


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    ".rollback.operationTypeは空でないstringである必要があります。",

    "supported rollback missing operationType"

  );

}


/**
 * rollback対応なのにpayloadがない場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_supportedRollbackMissingPayload() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations = [

    ExecutionPlanContractTest_createValidUpdateOperation(
      1
    )

  ];


  plan.operations[0].rollback.payload =
    null;


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    ".rollback.payloadはObjectである必要があります。",

    "supported rollback missing payload"

  );

}


/**
 * rollback未対応なのにoperationTypeが設定されている場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_unsupportedRollbackHasOperationType() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations[0].rollback.supported =
    false;

  plan.operations[0].rollback.operationType =
    EXECUTION_PLAN_OPERATION_DELETE;

  plan.operations[0].rollback.payload =
    null;


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    ".rollback.operationTypeはrollback未対応時にはnullである必要があります。",

    "unsupported rollback has operationType"

  );

}


/**
 * rollback未対応なのにpayloadが設定されている場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_unsupportedRollbackHasPayload() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations[0].rollback.supported =
    false;

  plan.operations[0].rollback.operationType =
    null;

  plan.operations[0].rollback.payload = {

    values: {

      productId:
        "PRODUCT-001"

    }

  };


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    ".rollback.payloadはrollback未対応時にはnullである必要があります。",

    "unsupported rollback has payload"

  );

}



/*
=========================================
Part 6

Remaining Validation Error Test
=========================================
*/


/*
=========================================
Remaining Error Test Runner
=========================================
*/

/**
 * Execution Plan全体に関する残りの異常系を検証する。
 */
function test_ExecutionPlanContract_validate_remainingErrors() {

  /*
  =========================================
  Subject
  =========================================
  */

  test_ExecutionPlanContract_missingSubjectEntityType();

  test_ExecutionPlanContract_missingSubjectEntityId();

  test_ExecutionPlanContract_invalidSubjectEntityName();


  /*
  =========================================
  Execution Policy
  =========================================
  */

  test_ExecutionPlanContract_invalidExecutionPolicy();

  test_ExecutionPlanContract_invalidAtomic();

  test_ExecutionPlanContract_invalidStopOnError();

  test_ExecutionPlanContract_invalidRollbackRequired();

  test_ExecutionPlanContract_atomicWithoutStopOnError();


  /*
  =========================================
  Executable
  =========================================
  */

  test_ExecutionPlanContract_invalidExecutableType();

  test_ExecutionPlanContract_readyNotExecutable();

  test_ExecutionPlanContract_draftExecutable();

  test_ExecutionPlanContract_completedExecutable();

  test_ExecutionPlanContract_failedExecutable();


  /*
  =========================================
  Created Information
  =========================================
  */

  test_ExecutionPlanContract_missingCreatedAt();

  test_ExecutionPlanContract_invalidCreatedBy();


  /*
  =========================================
  Execution Plan Metadata
  =========================================
  */

  test_ExecutionPlanContract_invalidMetadata();

  test_ExecutionPlanContract_invalidMetadataSource();

  test_ExecutionPlanContract_invalidMetadataRequestId();

  test_ExecutionPlanContract_invalidMetadataCorrelationId();


  /*
  =========================================
  Operation Metadata
  =========================================
  */

  test_ExecutionPlanContract_invalidOperationMetadata();

  test_ExecutionPlanContract_invalidOperationDescription();

  test_ExecutionPlanContract_invalidOperationSourcePath();

}


/*
=========================================
Subject
=========================================
*/

/**
 * subject.entityTypeが空の場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_missingSubjectEntityType() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.subject.entityType =
    "";


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "executionPlan.subject.entityTypeは空でないstringである必要があります。",

    "missing subject entityType"

  );

}


/**
 * subject.entityIdが空の場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_missingSubjectEntityId() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.subject.entityId =
    "";


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "executionPlan.subject.entityIdは空でないstringである必要があります。",

    "missing subject entityId"

  );

}


/**
 * subject.entityNameはnullを許可するが、
 * stringの場合は空にできないことを確認する。
 */
function test_ExecutionPlanContract_invalidSubjectEntityName() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.subject.entityName =
    "   ";


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "executionPlan.subject.entityNameは空でないstringである必要があります。",

    "invalid subject entityName"

  );

}


/*
=========================================
Execution Policy
=========================================
*/

/**
 * executionPolicyがObjectでない場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_invalidExecutionPolicy() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.executionPolicy =
    null;


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "executionPlan.executionPolicyはObjectである必要があります。",

    "invalid executionPolicy"

  );

}


/**
 * executionPolicy.atomicがbooleanでない場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_invalidAtomic() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.executionPolicy.atomic =
    "true";


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "executionPlan.executionPolicy.atomicはbooleanである必要があります。",

    "invalid executionPolicy.atomic"

  );

}


/**
 * executionPolicy.stopOnErrorがbooleanでない場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_invalidStopOnError() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.executionPolicy.stopOnError =
    1;


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "executionPlan.executionPolicy.stopOnErrorはbooleanである必要があります。",

    "invalid executionPolicy.stopOnError"

  );

}


/**
 * executionPolicy.rollbackRequiredがbooleanでない場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_invalidRollbackRequired() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.executionPolicy.rollbackRequired =
    null;


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "executionPlan.executionPolicy.rollbackRequiredはbooleanである必要があります。",

    "invalid executionPolicy.rollbackRequired"

  );

}


/**
 * atomic=trueなのにstopOnError=falseの場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_atomicWithoutStopOnError() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.executionPolicy.atomic =
    true;

  plan.executionPolicy.stopOnError =
    false;


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "atomic=trueの場合、stopOnError=trueである必要があります。",

    "atomic without stopOnError"

  );

}


/*
=========================================
Executable
=========================================
*/

/**
 * executableがbooleanでない場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_invalidExecutableType() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.executable =
    "true";


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "executionPlan.executableはbooleanである必要があります。",

    "invalid executable type"

  );

}


/**
 * ready_for_executionなのにexecutable=falseの場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_readyNotExecutable() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.status =
    EXECUTION_PLAN_STATUS_READY;

  plan.executable =
    false;


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "ready_for_executionのExecution Planはexecutable=trueである必要があります。",

    "ready status not executable"

  );

}


/**
 * draftなのにexecutable=trueの場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_draftExecutable() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.status =
    EXECUTION_PLAN_STATUS_DRAFT;

  plan.executable =
    true;


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "draftのExecution Planはexecutable=falseである必要があります。",

    "draft status executable"

  );

}


/**
 * completedなのにexecutable=trueの場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_completedExecutable() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.status =
    EXECUTION_PLAN_STATUS_COMPLETED;

  plan.executable =
    true;


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "completedのExecution Planはexecutable=falseである必要があります。",

    "completed status executable"

  );

}


/**
 * failedなのにexecutable=trueの場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_failedExecutable() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.status =
    EXECUTION_PLAN_STATUS_FAILED;

  plan.executable =
    true;


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "failedのExecution Planはexecutable=falseである必要があります。",

    "failed status executable"

  );

}


/*
=========================================
Created Information
=========================================
*/

/**
 * createdAtが空の場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_missingCreatedAt() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.createdAt =
    "";


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "executionPlan.createdAtは空でないstringである必要があります。",

    "missing createdAt"

  );

}


/**
 * createdByはnullを許可するが、
 * stringの場合は空にできないことを確認する。
 */
function test_ExecutionPlanContract_invalidCreatedBy() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.createdBy =
    "   ";


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "executionPlan.createdByは空でないstringである必要があります。",

    "invalid createdBy"

  );

}


/*
=========================================
Execution Plan Metadata
=========================================
*/

/**
 * metadataがObjectでない場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_invalidMetadata() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.metadata =
    null;


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "executionPlan.metadataはObjectである必要があります。",

    "invalid executionPlan metadata"

  );

}


/**
 * metadata.sourceはnullを許可するが、
 * stringの場合は空にできないことを確認する。
 */
function test_ExecutionPlanContract_invalidMetadataSource() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.metadata.source =
    "";


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "executionPlan.metadata.sourceは空でないstringである必要があります。",

    "invalid metadata source"

  );

}


/**
 * metadata.requestIdはnullを許可するが、
 * stringの場合は空にできないことを確認する。
 */
function test_ExecutionPlanContract_invalidMetadataRequestId() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.metadata.requestId =
    "   ";


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "executionPlan.metadata.requestIdは空でないstringである必要があります。",

    "invalid metadata requestId"

  );

}


/**
 * metadata.correlationIdはnullを許可するが、
 * stringの場合は空にできないことを確認する。
 */
function test_ExecutionPlanContract_invalidMetadataCorrelationId() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.metadata.correlationId =
    "";


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    "executionPlan.metadata.correlationIdは空でないstringである必要があります。",

    "invalid metadata correlationId"

  );

}


/*
=========================================
Operation Metadata
=========================================
*/

/**
 * OperationのmetadataがObjectでない場合に
 * 例外となることを確認する。
 */
function test_ExecutionPlanContract_invalidOperationMetadata() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations[0].metadata =
    null;


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    ".metadataはObjectである必要があります。",

    "invalid operation metadata"

  );

}


/**
 * Operation metadata.descriptionはnullを許可するが、
 * stringの場合は空にできないことを確認する。
 */
function test_ExecutionPlanContract_invalidOperationDescription() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations[0].metadata.description =
    "   ";


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    ".metadata.descriptionは空でないstringである必要があります。",

    "invalid operation metadata description"

  );

}


/**
 * Operation metadata.sourcePathはnullを許可するが、
 * stringの場合は空にできないことを確認する。
 */
function test_ExecutionPlanContract_invalidOperationSourcePath() {

  const plan =
    ExecutionPlanContractTest_createValidExecutionPlan();


  plan.operations[0].metadata.sourcePath =
    "";


  ExecutionPlanContractTest_assertThrows(

    function () {

      ExecutionPlanContract_validate(
        plan
      );

    },

    ".metadata.sourcePathは空でないstringである必要があります。",

    "invalid operation metadata sourcePath"

  );

}



/*
=========================================
ExecutionPlanContract Test Runner
=========================================
*/

/**
 * ExecutionPlanContractの全テストを実行する。
 */
function test_ExecutionPlanContract_runAll() {

  Logger.log("=========================================");
  Logger.log("ExecutionPlanContract Test Start");
  Logger.log("=========================================");

  /*
  =========================================
  Factory Test
  =========================================
  */

  test_ExecutionPlanContract_createEmpty();

  test_ExecutionPlanContract_createEmptyOperation();

  test_ExecutionPlanContract_createEmpty_independent();

  test_ExecutionPlanContract_createEmptyOperation_independent();


  /*
  =========================================
  Validation Normal Test
  =========================================
  */

  test_ExecutionPlanContract_validate_normal();


  /*
  =========================================
  Validation Error Test
  =========================================
  */

  test_ExecutionPlanContract_validate_error();

  test_ExecutionPlanContract_validate_operationErrors();

  test_ExecutionPlanContract_validate_remainingErrors();


  Logger.log("=========================================");
  Logger.log("All ExecutionPlanContract Tests Passed.");
  Logger.log("=========================================");

}



