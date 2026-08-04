/*
=========================================
SHiCI
54_SpreadsheetTransactionEngine.js

Spreadsheet Transaction Engine
Version 1.0

役割：
・Execution Plan全体を受け取る
・Runtime Bindingを解決する
・Operationをsequence順に実行する
・Operation Resultを蓄積する
・失敗時に成功済みOperationを逆順Rollbackする
・Execution Resultを組み立てて返す

禁止：
・SpreadsheetAppを直接操作しない
・Repositoryを直接呼び出さない
・Operation Resultを自前で生成しない
・Execution Plan原本を変更しない
・Rollback対象を推測しない
・LLMを呼び出さない

依存方向：
SpreadsheetTransactionEngine
        ↓
RuntimeBindingResolver
        ↓
SpreadsheetOperationExecutor
        ↓
SpreadsheetRepository
        ↓
SpreadsheetApp
=========================================
*/


/*
=========================================
Public API
=========================================
*/

/**
 * Execution Planを実行する。
 *
 * @param {Object} executionPlan
 * @return {Object}
 */
function SpreadsheetTransactionEngine_execute(
  executionPlan
) {

  SpreadsheetTransactionEngine_validateExecutionPlan(
    executionPlan
  );


  const originalExecutionPlanJson =
    JSON.stringify(
      executionPlan
    );


  const startedAtDate =
    new Date();


  const startedAt =
    startedAtDate.toISOString();


  /*
  =========================================
  Runtime Binding Resolution
  =========================================
  */

  const bindingResolution =
    RuntimeBindingResolver_resolve(
      executionPlan
    );


  const bindingMap =
    bindingResolution.bindingMap;


  const bindingResults =
    bindingResolution.bindingResults;


  /*
  =========================================
  Operation Execution
  =========================================
  */

  const operationResults =
    [];


  const successfulOperations =
    [];


  let failedOperationResult =
    null;


  for (
    let index = 0;
    index < executionPlan.operations.length;
    index += 1
  ) {

    const operation =
      executionPlan.operations[index];


    const operationResult =
      SpreadsheetOperationExecutor_execute(
        operation,
        bindingMap
      );


    operationResults.push(
      operationResult
    );


    if (
      operationResult.status ===
        EXECUTION_OPERATION_STATUS_SUCCESS
    ) {

      successfulOperations.push(
        operation
      );


      continue;

    }


    failedOperationResult =
      operationResult;


    if (
      executionPlan.executionPolicy.stopOnError ===
        true
    ) {

      break;

    }

  }


  /*
  =========================================
  Skipped Operation Results
  =========================================
  */

  SpreadsheetTransactionEngine_appendSkippedOperationResults(
    executionPlan,
    operationResults
  );


  /*
  =========================================
  Rollback
  =========================================
  */

  let rollbackResult =
    ExecutionResultContract_createEmptyRollback();


  if (
    failedOperationResult !==
      null &&
    executionPlan.executionPolicy.rollbackRequired ===
      true
  ) {

    rollbackResult =
      SpreadsheetTransactionEngine_executeRollback(
        successfulOperations,
        bindingMap
      );

  }


  /*
  =========================================
  Completion
  =========================================
  */

  const completedAtDate =
    new Date();


  const completedAt =
    completedAtDate.toISOString();


  const durationMs =
    completedAtDate.getTime() -
    startedAtDate.getTime();


  const executionResult =
    SpreadsheetTransactionEngine_buildExecutionResult(
      executionPlan,
      operationResults,
      bindingResults,
      rollbackResult,
      failedOperationResult,
      startedAt,
      completedAt,
      durationMs
    );


  SpreadsheetTransactionEngine_assertExecutionPlanNotModified(
    executionPlan,
    originalExecutionPlanJson
  );


  ExecutionResultContract_validate(
    executionResult
  );


  return executionResult;

}


/*
=========================================
Execution Plan Validation
=========================================
*/

/**
 * Transaction実行対象のExecution Planを検証する。
 *
 * @param {Object} executionPlan
 */
function SpreadsheetTransactionEngine_validateExecutionPlan(
  executionPlan
) {

  ExecutionPlanContract_validate(
    executionPlan
  );


  if (
    executionPlan.status !==
      EXECUTION_PLAN_STATUS_READY
  ) {

    throw new Error(
      "SpreadsheetTransactionEngineで実行するには、" +
      "Execution Planがready_for_executionである必要があります。"
    );

  }


  if (
    executionPlan.executable !==
      true
  ) {

    throw new Error(
      "SpreadsheetTransactionEngineで実行するには、" +
      "executionPlan.executable=trueである必要があります。"
    );

  }


  if (
    !Array.isArray(
      executionPlan.operations
    ) ||
    executionPlan.operations.length ===
      0
  ) {

    throw new Error(
      "実行対象のExecution Planには1件以上のOperationが必要です。"
    );

  }

}


/*
=========================================
Skipped Operation Results
=========================================
*/

/**
 * stopOnErrorによって実行されなかったOperationへ、
 * skipped Resultを追加する。
 *
 * @param {Object} executionPlan
 * @param {Array<Object>} operationResults
 */
function SpreadsheetTransactionEngine_appendSkippedOperationResults(
  executionPlan,
  operationResults
) {

  SpreadsheetTransactionEngine_assertObject(
    executionPlan,
    "executionPlan"
  );


  if (
    !Array.isArray(
      operationResults
    )
  ) {

    throw new Error(
      "operationResultsはArrayである必要があります。"
    );

  }


  const completedOperationCount =
    operationResults.length;


  for (
    let index = completedOperationCount;
    index < executionPlan.operations.length;
    index += 1
  ) {

    const operation =
      executionPlan.operations[index];


    operationResults.push(
      SpreadsheetTransactionEngine_createSkippedOperationResult(
        operation
      )
    );

  }

}


/**
 * skipped Operation Resultを生成する。
 *
 * @param {Object} operation
 * @return {Object}
 */
function SpreadsheetTransactionEngine_createSkippedOperationResult(
  operation
) {

  SpreadsheetTransactionEngine_assertObject(
    operation,
    "operation"
  );


  const now =
    new Date().toISOString();


  const result =
    ExecutionResultContract_createEmptyOperationResult();


  result.operationId =
    operation.operationId;


  result.sequence =
    operation.sequence;


  result.operationType =
    operation.operationType;


  result.status =
    EXECUTION_OPERATION_STATUS_SKIPPED;


  result.startedAt =
    now;


  result.completedAt =
    now;


  result.durationMs =
    0;


  result.affectedRows =
    0;


  result.message =
    "先行Operationの失敗により実行されませんでした。";


  result.error =
    null;


  ExecutionResultContract_validateOperationResult(
    result,
    0
  );


  return result;

}


/*
=========================================
Rollback Entry Point
=========================================
*/

/**
 * 成功済みOperationを逆順でRollbackする。
 *
 * Rollback対象は、
 * Forward実行に成功したOperationだけとする。
 *
 * @param {Array<Object>} successfulOperations
 * @param {Object} bindingMap
 * @return {Object}
 */
function SpreadsheetTransactionEngine_executeRollback(
  successfulOperations,
  bindingMap
) {

  if (
    !Array.isArray(
      successfulOperations
    )
  ) {

    throw new Error(
      "successfulOperationsはArrayである必要があります。"
    );

  }


  SpreadsheetTransactionEngine_assertObject(
    bindingMap,
    "bindingMap"
  );


  const rollbackResult =
    ExecutionResultContract_createEmptyRollback();


  /*
   * 最初のOperationが失敗した場合など、
   * 成功済みOperationが存在しなければ
   * Rollbackは実行しない。
   */
  if (
    successfulOperations.length ===
      0
  ) {

    return rollbackResult;

  }


  const startedAtDate =
    new Date();


  rollbackResult.performed =
    true;


  rollbackResult.startedAt =
    startedAtDate.toISOString();


  /*
   * Forward実行とは逆順でRollbackする。
   *
   * successfulOperations原本を変更しないため、
   * slice()した後にreverse()する。
   */
  const rollbackTargets =
    successfulOperations
      .slice()
      .reverse();


  let rollbackFailed =
    false;


  rollbackTargets.forEach(
    function(forwardOperation, index) {

      const rollbackOperation =
        SpreadsheetTransactionEngine_createRollbackOperation(
          forwardOperation,
          index +
            1
        );


      const rollbackOperationResult =
        SpreadsheetOperationExecutor_execute(
          rollbackOperation,
          bindingMap
        );


      rollbackResult.operations.push(
        rollbackOperationResult
      );


      if (
        rollbackOperationResult.status ===
          EXECUTION_OPERATION_STATUS_FAILED
      ) {

        rollbackFailed =
          true;

      }

    }
  );


  const completedAtDate =
    new Date();


  rollbackResult.completedAt =
    completedAtDate.toISOString();


  rollbackResult.durationMs =
    completedAtDate.getTime() -
    startedAtDate.getTime();


  rollbackResult.status =
    rollbackFailed
      ? EXECUTION_ROLLBACK_STATUS_FAILED
      : EXECUTION_ROLLBACK_STATUS_SUCCESS;


  ExecutionResultContract_validateRollback(
    rollbackResult
  );


  return rollbackResult;

}


/**
 * Forward OperationのRollback定義から、
 * Executorへ渡せるRollback Operationを生成する。
 *
 * Forward Operation原本は変更しない。
 *
 * @param {Object} forwardOperation
 * @param {number} rollbackSequence
 * @return {Object}
 */
function SpreadsheetTransactionEngine_createRollbackOperation(
  forwardOperation,
  rollbackSequence
) {

  SpreadsheetTransactionEngine_assertObject(
    forwardOperation,
    "forwardOperation"
  );


  SpreadsheetTransactionEngine_assertPositiveInteger(
    rollbackSequence,
    "rollbackSequence"
  );


  SpreadsheetTransactionEngine_assertObject(
    forwardOperation.rollback,
    "forwardOperation.rollback"
  );


  if (
    forwardOperation.rollback.supported !==
      true
  ) {

    throw new Error(
      "Rollback未対応のOperationをRollbackできません。" +
      " operationId=" +
      String(
        forwardOperation.operationId
      )
    );

  }


  const rollbackOperationType =
    SpreadsheetTransactionEngine_requireNonEmptyString(
      forwardOperation.rollback.operationType,
      "forwardOperation.rollback.operationType"
    );


  SpreadsheetTransactionEngine_assertObject(
    forwardOperation.rollback.payload,
    "forwardOperation.rollback.payload"
  );


  const rollbackOperation =
    ExecutionPlanContract_createEmptyOperation();


  /*
   * Forward Operationとは別のOperation Resultとして
   * 識別できるように専用IDを設定する。
   */
  rollbackOperation.operationId =
    "ROLLBACK_" +
    SpreadsheetTransactionEngine_requireNonEmptyString(
      forwardOperation.operationId,
      "forwardOperation.operationId"
    );


  /*
   * Rollback実行順で1から採番する。
   *
   * Forward Operationのsequenceを
   * そのまま使用しない点に注意する。
   */
  rollbackOperation.sequence =
    rollbackSequence;


  rollbackOperation.operationType =
    rollbackOperationType;


  rollbackOperation.target =
    SpreadsheetTransactionEngine_deepCopy(
      forwardOperation.target
    );


  rollbackOperation.payload =
    SpreadsheetTransactionEngine_deepCopy(
      forwardOperation.rollback.payload
    );


  /*
   * Rollback Operation自体を、
   * さらにRollbackする処理はVer.1.0では行わない。
   */
  rollbackOperation.rollback.supported =
    false;


  rollbackOperation.rollback.operationType =
    null;


  rollbackOperation.rollback.payload =
    null;


  rollbackOperation.metadata.description =
    "Forward OperationのRollbackを実行する。" +
    " forwardOperationId=" +
    forwardOperation.operationId;


  rollbackOperation.metadata.sourcePath =
    "executionPlan.operations[" +
    String(
      forwardOperation.sequence
    ) +
    "].rollback";


  SpreadsheetTransactionEngine_validateRollbackOperation(
    rollbackOperation
  );


  return rollbackOperation;

}



/**
 * Executorへ渡すRollback Operationを検証する。
 *
 * @param {Object} rollbackOperation
 */
function SpreadsheetTransactionEngine_validateRollbackOperation(
  rollbackOperation
) {

  SpreadsheetTransactionEngine_assertObject(
    rollbackOperation,
    "rollbackOperation"
  );


  SpreadsheetTransactionEngine_requireNonEmptyString(
    rollbackOperation.operationId,
    "rollbackOperation.operationId"
  );


  SpreadsheetTransactionEngine_assertPositiveInteger(
    rollbackOperation.sequence,
    "rollbackOperation.sequence"
  );


  SpreadsheetTransactionEngine_requireNonEmptyString(
    rollbackOperation.operationType,
    "rollbackOperation.operationType"
  );


  SpreadsheetTransactionEngine_assertObject(
    rollbackOperation.target,
    "rollbackOperation.target"
  );


  if (
    rollbackOperation.target.repository !==
      "spreadsheet"
  ) {

    throw new Error(
      "Rollback Operationのrepositoryはspreadsheetである必要があります。" +
      " repository=" +
      String(
        rollbackOperation.target.repository
      )
    );

  }


  SpreadsheetTransactionEngine_requireNonEmptyString(
    rollbackOperation.target.sheetName,
    "rollbackOperation.target.sheetName"
  );


  SpreadsheetTransactionEngine_assertObject(
    rollbackOperation.payload,
    "rollbackOperation.payload"
  );


  /*
   * Executorと同じPayloadルールで検証する。
   */
  SpreadsheetOperationExecutor_validatePayloadByOperationType(
    rollbackOperation.operationType,
    rollbackOperation.payload
  );

}






/*
=========================================
Execution Result Entry Point
=========================================
*/

/**
 * Transaction全体のExecution Resultを組み立てる。
 *
 * @param {Object} executionPlan
 * @param {Array<Object>} operationResults
 * @param {Array<Object>} bindingResults
 * @param {Object} rollbackResult
 * @param {Object|null} failedOperationResult
 * @param {string} startedAt
 * @param {string} completedAt
 * @param {number} durationMs
 * @return {Object}
 */
function SpreadsheetTransactionEngine_buildExecutionResult(
  executionPlan,
  operationResults,
  bindingResults,
  rollbackResult,
  failedOperationResult,
  startedAt,
  completedAt,
  durationMs
) {

  SpreadsheetTransactionEngine_assertObject(
    executionPlan,
    "executionPlan"
  );


  if (
    !Array.isArray(
      operationResults
    )
  ) {

    throw new Error(
      "operationResultsはArrayである必要があります。"
    );

  }


  if (
    operationResults.length ===
      0
  ) {

    throw new Error(
      "operationResultsには1件以上のOperation Resultが必要です。"
    );

  }


  if (
    !Array.isArray(
      bindingResults
    )
  ) {

    throw new Error(
      "bindingResultsはArrayである必要があります。"
    );

  }


  SpreadsheetTransactionEngine_assertObject(
    rollbackResult,
    "rollbackResult"
  );


  if (
    failedOperationResult !==
      null
  ) {

    SpreadsheetTransactionEngine_assertObject(
      failedOperationResult,
      "failedOperationResult"
    );

  }


  SpreadsheetTransactionEngine_validateExecutionTime(
    startedAt,
    completedAt,
    durationMs
  );


  const executionResult =
    ExecutionResultContract_createEmpty();


  /*
  =========================================
  Identity
  =========================================
  */

  executionResult.executionResultId =
    SpreadsheetTransactionEngine_createExecutionResultId();


  executionResult.executionPlanId =
    executionPlan.executionPlanId;


  /*
  =========================================
  Status
  =========================================
  */

  executionResult.status =
    SpreadsheetTransactionEngine_resolveExecutionResultStatus(
      operationResults,
      rollbackResult
    );


  /*
  =========================================
  Time
  =========================================
  */

  executionResult.startedAt =
    startedAt;


  executionResult.completedAt =
    completedAt;


  executionResult.durationMs =
    durationMs;


  /*
  =========================================
  Results
  =========================================
  */

  executionResult.operations =
    SpreadsheetTransactionEngine_deepCopy(
      operationResults
    );


  executionResult.bindings =
    SpreadsheetTransactionEngine_deepCopy(
      bindingResults
    );


  executionResult.rollback =
    SpreadsheetTransactionEngine_deepCopy(
      rollbackResult
    );


  /*
  =========================================
  Errors
  =========================================
  */

  executionResult.errors =
    SpreadsheetTransactionEngine_collectErrors(
      operationResults,
      rollbackResult
    );


  /*
  =========================================
  Metadata
  =========================================
  */

  executionResult.metadata.executor =
    "spreadsheet_transaction_engine";


  executionResult.metadata.requestId =
    executionPlan.metadata &&
    typeof executionPlan
      .metadata
      .requestId ===
        "string" &&
    executionPlan
      .metadata
      .requestId
      .trim() !==
        ""
      ? executionPlan
          .metadata
          .requestId
          .trim()
      : null;


  executionResult.metadata.correlationId =
    executionPlan.metadata &&
    typeof executionPlan
      .metadata
      .correlationId ===
        "string" &&
    executionPlan
      .metadata
      .correlationId
      .trim() !==
        ""
      ? executionPlan
          .metadata
          .correlationId
          .trim()
      : executionPlan.executionPlanId;


  /*
  =========================================
  Final Validation
  =========================================
  */

  ExecutionResultContract_validate(
    executionResult
  );


  return executionResult;

}





/*
=========================================
Execution Result Status
=========================================
*/

/**
 * Operation ResultとRollback Resultから、
 * Transaction全体のstatusを決定する。
 *
 * @param {Array<Object>} operationResults
 * @param {Object} rollbackResult
 * @return {string}
 */
function SpreadsheetTransactionEngine_resolveExecutionResultStatus(
  operationResults,
  rollbackResult
) {

  if (
    !Array.isArray(
      operationResults
    )
  ) {

    throw new Error(
      "operationResultsはArrayである必要があります。"
    );

  }


  SpreadsheetTransactionEngine_assertObject(
    rollbackResult,
    "rollbackResult"
  );


  const successCount =
    operationResults.filter(
      function(operationResult) {

        return (
          operationResult.status ===
            EXECUTION_OPERATION_STATUS_SUCCESS
        );

      }
    ).length;


  const failedCount =
    operationResults.filter(
      function(operationResult) {

        return (
          operationResult.status ===
            EXECUTION_OPERATION_STATUS_FAILED
        );

      }
    ).length;


  const skippedCount =
    operationResults.filter(
      function(operationResult) {

        return (
          operationResult.status ===
            EXECUTION_OPERATION_STATUS_SKIPPED
        );

      }
    ).length;


  /*
  =========================================
  All Success
  =========================================
  */

  if (
    failedCount ===
      0 &&
    skippedCount ===
      0 &&
    successCount ===
      operationResults.length
  ) {

    return EXECUTION_RESULT_STATUS_SUCCESS;

  }


  /*
  =========================================
  Rollback Success
  =========================================
  */

  if (
    failedCount >
      0 &&
    rollbackResult.performed ===
      true &&
    rollbackResult.status ===
      EXECUTION_ROLLBACK_STATUS_SUCCESS
  ) {

    return EXECUTION_RESULT_STATUS_ROLLED_BACK;

  }


  /*
  =========================================
  Rollback Failure
  =========================================
  */

  if (
    failedCount >
      0 &&
    rollbackResult.performed ===
      true &&
    rollbackResult.status ===
      EXECUTION_ROLLBACK_STATUS_FAILED
  ) {

    return EXECUTION_RESULT_STATUS_FAILED;

  }


  /*
  =========================================
  Partial
  =========================================
  */

  if (
    successCount >
      0 &&
    (
      failedCount >
        0 ||
      skippedCount >
        0
    )
  ) {

    return EXECUTION_RESULT_STATUS_PARTIAL;

  }


  /*
   =========================================
   Failure Without Successful Operation
   =========================================
  */

  if (
    failedCount >
      0
  ) {

    return EXECUTION_RESULT_STATUS_FAILED;

  }


  throw new Error(
    "Execution Result statusを決定できません。" +
    " successCount=" +
    successCount +
    " failedCount=" +
    failedCount +
    " skippedCount=" +
    skippedCount +
    " rollbackPerformed=" +
    rollbackResult.performed +
    " rollbackStatus=" +
    rollbackResult.status
  );

}




/*
=========================================
Error Collection
=========================================
*/

/**
 * Forward OperationとRollback Operationから
 * Error Objectを収集する。
 *
 * @param {Array<Object>} operationResults
 * @param {Object} rollbackResult
 * @return {Array<Object>}
 */
function SpreadsheetTransactionEngine_collectErrors(
  operationResults,
  rollbackResult
) {

  if (
    !Array.isArray(
      operationResults
    )
  ) {

    throw new Error(
      "operationResultsはArrayである必要があります。"
    );

  }


  SpreadsheetTransactionEngine_assertObject(
    rollbackResult,
    "rollbackResult"
  );


  const errors =
    [];


  /*
  =========================================
  Forward Errors
  =========================================
  */

  operationResults.forEach(
    function(operationResult) {

      SpreadsheetTransactionEngine_assertObject(
        operationResult,
        "operationResult"
      );


      if (
        operationResult.status ===
          EXECUTION_OPERATION_STATUS_FAILED &&
        operationResult.error !==
          null
      ) {

        errors.push(
          SpreadsheetTransactionEngine_deepCopy(
            operationResult.error
          )
        );

      }

    }
  );


  /*
  =========================================
  Rollback Errors
  =========================================
  */

  if (
    Array.isArray(
      rollbackResult.operations
    )
  ) {

    rollbackResult.operations.forEach(
      function(rollbackOperationResult) {

        SpreadsheetTransactionEngine_assertObject(
          rollbackOperationResult,
          "rollbackOperationResult"
        );


        if (
          rollbackOperationResult.status ===
            EXECUTION_OPERATION_STATUS_FAILED &&
          rollbackOperationResult.error !==
            null
        ) {

          errors.push(
            SpreadsheetTransactionEngine_deepCopy(
              rollbackOperationResult.error
            )
          );

        }

      }
    );

  }


  return errors;

}




/*
=========================================
Execution Result ID
=========================================
*/

/**
 * Execution Result IDを生成する。
 *
 * @return {string}
 */
function SpreadsheetTransactionEngine_createExecutionResultId() {

  let uniquePart =
    null;


  if (
    typeof Utilities !==
      "undefined" &&
    Utilities &&
    typeof Utilities.getUuid ===
      "function"
  ) {

    uniquePart =
      Utilities
        .getUuid()
        .replace(
          /-/g,
          ""
        )
        .toUpperCase();

  } else {

    uniquePart =
      String(
        new Date().getTime()
      ) +
      "_" +
      String(
        Math.floor(
          Math.random() *
          1000000000
        )
      );

  }


  return (
    "EXECUTION-RESULT-" +
    uniquePart
  );

}




/*
=========================================
Execution Time
=========================================
*/

/**
 * Transaction全体の実行時刻を検証する。
 *
 * @param {string} startedAt
 * @param {string} completedAt
 * @param {number} durationMs
 */
function SpreadsheetTransactionEngine_validateExecutionTime(
  startedAt,
  completedAt,
  durationMs
) {

  SpreadsheetTransactionEngine_requireNonEmptyString(
    startedAt,
    "startedAt"
  );


  SpreadsheetTransactionEngine_requireNonEmptyString(
    completedAt,
    "completedAt"
  );


  SpreadsheetTransactionEngine_assertNonNegativeFiniteNumber(
    durationMs,
    "durationMs"
  );


  ExecutionResultContract_validateDurationConsistency(
    startedAt,
    completedAt,
    durationMs,
    "executionResult"
  );

}








/*
=========================================
Immutability
=========================================
*/

/**
 * Transaction実行によってExecution Plan原本が
 * 変更されていないことを確認する。
 *
 * @param {Object} executionPlan
 * @param {string} originalExecutionPlanJson
 */
function SpreadsheetTransactionEngine_assertExecutionPlanNotModified(
  executionPlan,
  originalExecutionPlanJson
) {

  if (
    JSON.stringify(
      executionPlan
    ) !==
      originalExecutionPlanJson
  ) {

    throw new Error(
      "SpreadsheetTransactionEngineによってExecution Plan原本が変更されました。"
    );

  }

}


/*
=========================================
Assertion
=========================================
*/

/**
 * Objectであることを確認する。
 *
 * @param {*} value
 * @param {string} label
 */
function SpreadsheetTransactionEngine_assertObject(
  value,
  label
) {

  if (
    value ===
      null ||
    typeof value !==
      "object" ||
    Array.isArray(
      value
    )
  ) {

    throw new Error(
      label +
      "はObjectである必要があります。"
    );

  }

}



/**
 * 空でないstringを返す。
 *
 * @param {*} value
 * @param {string} label
 * @return {string}
 */
function SpreadsheetTransactionEngine_requireNonEmptyString(
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


  return value.trim();

}


/**
 * 1以上の整数であることを確認する。
 *
 * @param {*} value
 * @param {string} label
 */
function SpreadsheetTransactionEngine_assertPositiveInteger(
  value,
  label
) {

  if (
    !Number.isInteger(
      value
    ) ||
    value <
      1
  ) {

    throw new Error(
      label +
      "は1以上の整数である必要があります。"
    );

  }

}


/**
 * JSON互換値をDeep Copyする。
 *
 * @param {*} value
 * @return {*}
 */
function SpreadsheetTransactionEngine_deepCopy(
  value
) {

  return JSON.parse(
    JSON.stringify(
      value
    )
  );

}




/**
 * 0以上の有限なnumberであることを確認する。
 *
 * @param {*} value
 * @param {string} label
 */
function SpreadsheetTransactionEngine_assertNonNegativeFiniteNumber(
  value,
  label
) {

  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value
    ) ||
    value <
      0
  ) {

    throw new Error(
      label +
      "は0以上の有限なnumberである必要があります。"
    );

  }

}



