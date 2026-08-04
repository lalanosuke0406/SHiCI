/*
=========================================
SHiCI
53_SpreadsheetOperationExecutor.js

Spreadsheet Operation Executor
Version 1.0

役割：
・Execution PlanのOperationを1件だけ実行する
・Operation内のbindingRefを実行直前に解決する
・SpreadsheetRepositoryへ処理を依頼する
・実行時間を計測する
・Operation Resultを返す

禁止：
・Execution Plan全体を処理しない
・次のOperationを実行しない
・Transaction制御を行わない
・Rollback判断を行わない
・Runtime Bindingを新規生成しない
・Execution Plan原本を変更しない
・SpreadsheetAppを直接操作しない
・LLMを呼び出さない

依存方向：
SpreadsheetTransactionEngine
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
 * Operationを1件だけ実行する。
 *
 * Operation原本とBinding Mapは変更しない。
 *
 * Repository実行が成功した場合は
 * success Operation Resultを返す。
 *
 * Repository実行中に例外が発生した場合は
 * failed Operation Resultへ変換して返す。
 *
 * @param {Object} operation
 * @param {Object} bindingMap
 * @return {Object}
 */
function SpreadsheetOperationExecutor_execute(
  operation,
  bindingMap
) {

  /*
  =========================================
  Input Validation
  =========================================
  */

  SpreadsheetOperationExecutor_validateOperation(
    operation
  );


  SpreadsheetOperationExecutor_validateBindingMap(
    bindingMap
  );


  /*
   * Executorによる原本変更を検出するため、
   * 実行前のJSON表現を保持する。
   */
  const originalOperationJson =
    JSON.stringify(
      operation
    );


  const originalBindingMapJson =
    JSON.stringify(
      bindingMap
    );


  /*
  =========================================
  Start
  =========================================
  */

  const startedAtDate =
    new Date();


  const startedAt =
    startedAtDate.toISOString();


  try {

    /*
    =========================================
    Payload Resolution
    =========================================
    */

    const resolvedPayload =
      SpreadsheetOperationExecutor_resolvePayload(
        operation,
        bindingMap
      );


    /*
    =========================================
    Repository Execution
    =========================================
    */

    const repositoryResult =
      SpreadsheetOperationExecutor_executeRepository(
        operation,
        resolvedPayload
      );


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


    /*
     * Part2で実装する。
     */
    const operationResult =
      SpreadsheetOperationExecutor_createSuccessResult(
        operation,
        repositoryResult,
        startedAt,
        completedAt,
        durationMs
      );


    SpreadsheetOperationExecutor_assertInputsNotModified(
      operation,
      originalOperationJson,
      bindingMap,
      originalBindingMapJson
    );


    return operationResult;

  } catch (error) {

    /*
    =========================================
    Failure
    =========================================
    */

    const completedAtDate =
      new Date();


    const completedAt =
      completedAtDate.toISOString();


    const durationMs =
      completedAtDate.getTime() -
      startedAtDate.getTime();


    /*
     * Part2で実装する。
     */
    const operationResult =
      SpreadsheetOperationExecutor_createFailedResult(
        operation,
        error,
        startedAt,
        completedAt,
        durationMs
      );


    SpreadsheetOperationExecutor_assertInputsNotModified(
      operation,
      originalOperationJson,
      bindingMap,
      originalBindingMapJson
    );


    return operationResult;

  }

}


/*
=========================================
Operation Validation
=========================================
*/

/**
 * Operation入力を検証する。
 *
 * Executorで必要な項目だけを検証する。
 * Execution Plan全体の正式検証は、
 * Transaction Engineより前に
 * ExecutionPlanContractが行う。
 *
 * @param {Object} operation
 */
function SpreadsheetOperationExecutor_validateOperation(
  operation
) {

  SpreadsheetOperationExecutor_assertObject(
    operation,
    "operation"
  );


  SpreadsheetOperationExecutor_requireNonEmptyString(
    operation.operationId,
    "operation.operationId"
  );


  SpreadsheetOperationExecutor_assertPositiveInteger(
    operation.sequence,
    "operation.sequence"
  );


  SpreadsheetOperationExecutor_validateOperationType(
    operation.operationType
  );


  SpreadsheetOperationExecutor_assertObject(
    operation.target,
    "operation.target"
  );


  if (
    operation.target.repository !==
      "spreadsheet"
  ) {

    throw new Error(
      "SpreadsheetOperationExecutorでは" +
      "repository=spreadsheetのOperationだけを実行できます。" +
      " repository=" +
      String(
        operation.target.repository
      )
    );

  }


  SpreadsheetOperationExecutor_requireNonEmptyString(
    operation.target.sheetName,
    "operation.target.sheetName"
  );


  SpreadsheetOperationExecutor_assertObject(
    operation.payload,
    "operation.payload"
  );


  SpreadsheetOperationExecutor_validatePayloadByOperationType(
    operation.operationType,
    operation.payload
  );

}


/**
 * Operation Typeを検証する。
 *
 * @param {string} operationType
 */
function SpreadsheetOperationExecutor_validateOperationType(
  operationType
) {

  const normalizedOperationType =
    SpreadsheetOperationExecutor_requireNonEmptyString(
      operationType,
      "operation.operationType"
    );


  const supportedOperationTypes = [

    SPREADSHEET_REPOSITORY_OPERATION_INSERT,

    SPREADSHEET_REPOSITORY_OPERATION_UPDATE,

    SPREADSHEET_REPOSITORY_OPERATION_DELETE

  ];


  if (
    supportedOperationTypes.indexOf(
      normalizedOperationType
    ) ===
      -1
  ) {

    throw new Error(
      "SpreadsheetOperationExecutorで未対応のoperationTypeです。" +
      " operationType=" +
      normalizedOperationType
    );

  }

}


/**
 * Operation TypeごとのPayload構造を検証する。
 *
 * @param {string} operationType
 * @param {Object} payload
 */
function SpreadsheetOperationExecutor_validatePayloadByOperationType(
  operationType,
  payload
) {

  SpreadsheetOperationExecutor_assertObject(
    payload,
    "operation.payload"
  );


  /*
  =========================================
  INSERT
  =========================================
  */

  if (
    operationType ===
      SPREADSHEET_REPOSITORY_OPERATION_INSERT
  ) {

    SpreadsheetOperationExecutor_assertNonEmptyObject(
      payload.values,
      "operation.payload.values"
    );


    if (
      payload.criteria !==
        null
    ) {

      throw new Error(
        "insert Operationのpayload.criteriaはnullである必要があります。"
      );

    }


    return;

  }


  /*
  =========================================
  UPDATE
  =========================================
  */

  if (
    operationType ===
      SPREADSHEET_REPOSITORY_OPERATION_UPDATE
  ) {

    SpreadsheetOperationExecutor_assertNonEmptyObject(
      payload.values,
      "operation.payload.values"
    );


    SpreadsheetOperationExecutor_assertNonEmptyObject(
      payload.criteria,
      "operation.payload.criteria"
    );


    return;

  }


  /*
  =========================================
  DELETE
  =========================================
  */

  if (
    operationType ===
      SPREADSHEET_REPOSITORY_OPERATION_DELETE
  ) {

    if (
      payload.values !==
        null
    ) {

      throw new Error(
        "delete Operationのpayload.valuesはnullである必要があります。"
      );

    }


    SpreadsheetOperationExecutor_assertNonEmptyObject(
      payload.criteria,
      "operation.payload.criteria"
    );


    return;

  }

}


/*
=========================================
Binding Map Validation
=========================================
*/

/**
 * Binding Mapを検証する。
 *
 * Bindingを使用しないOperationもあるため、
 * 空Objectを許可する。
 *
 * @param {Object} bindingMap
 */
function SpreadsheetOperationExecutor_validateBindingMap(
  bindingMap
) {

  SpreadsheetOperationExecutor_assertObject(
    bindingMap,
    "bindingMap"
  );


  Object.keys(
    bindingMap
  ).forEach(
    function(bindingId, index) {

      SpreadsheetOperationExecutor_requireNonEmptyString(
        bindingId,
        "bindingMap.key[" +
        index +
        "]"
      );


      SpreadsheetOperationExecutor_validateResolvedBindingValue(
        bindingMap[
          bindingId
        ],
        "bindingMap." +
        bindingId
      );

    }
  );

}


/**
 * 解決済みBinding値を検証する。
 *
 * Ver.1.0ではgenerated_idを扱うため、
 * 空でないstringだけを許可する。
 *
 * @param {*} value
 * @param {string} label
 */
function SpreadsheetOperationExecutor_validateResolvedBindingValue(
  value,
  label
) {

  SpreadsheetOperationExecutor_requireNonEmptyString(
    value,
    label
  );

}


/*
=========================================
Payload Resolution
=========================================
*/

/**
 * Operation Payload内のbindingRefを
 * Binding Mapの実値へ解決する。
 *
 * Operation原本は変更しない。
 *
 * @param {Object} operation
 * @param {Object} bindingMap
 * @return {Object}
 */
function SpreadsheetOperationExecutor_resolvePayload(
  operation,
  bindingMap
) {

  SpreadsheetOperationExecutor_assertObject(
    operation,
    "operation"
  );


  SpreadsheetOperationExecutor_validateBindingMap(
    bindingMap
  );


  const resolvedPayload =
    RuntimeBindingResolver_resolveValue(
      operation.payload,
      bindingMap,
      "operation.payload"
    );


  SpreadsheetOperationExecutor_assertObject(
    resolvedPayload,
    "resolvedPayload"
  );


  /*
   * Binding解決後も、
   * Operation Typeに対応したPayload構造を
   * 維持していることを確認する。
   */
  SpreadsheetOperationExecutor_validatePayloadByOperationType(
    operation.operationType,
    resolvedPayload
  );


  return resolvedPayload;

}


/*
=========================================
Repository Execution
=========================================
*/

/**
 * 解決済みPayloadをSpreadsheetRepositoryへ渡す。
 *
 * @param {Object} operation
 * @param {Object} resolvedPayload
 * @return {Object}
 */
function SpreadsheetOperationExecutor_executeRepository(
  operation,
  resolvedPayload
) {

  SpreadsheetOperationExecutor_assertObject(
    operation,
    "operation"
  );


  SpreadsheetOperationExecutor_assertObject(
    resolvedPayload,
    "resolvedPayload"
  );


  const repositoryResult =
    SpreadsheetRepository_execute(
      operation.operationType,
      operation.target.sheetName,
      resolvedPayload.values,
      resolvedPayload.criteria
    );


  SpreadsheetOperationExecutor_validateRepositoryResult(
    repositoryResult
  );


  return repositoryResult;

}


/**
 * SpreadsheetRepositoryの戻り値を検証する。
 *
 * @param {Object} repositoryResult
 */
function SpreadsheetOperationExecutor_validateRepositoryResult(
  repositoryResult
) {

  SpreadsheetOperationExecutor_assertObject(
    repositoryResult,
    "repositoryResult"
  );


  SpreadsheetOperationExecutor_assertNonNegativeInteger(
    repositoryResult.affectedRows,
    "repositoryResult.affectedRows"
  );


  /*
   * Repository Ver.1.0では、
   * 1 Operation = 1 Entityであるため、
   * 正常終了時のaffectedRowsは1件でなければならない。
   */
  if (
    repositoryResult.affectedRows !==
      1
  ) {

    throw new Error(
      "SpreadsheetRepositoryのaffectedRowsが不正です。" +
      " expected=1" +
      " actual=" +
      repositoryResult.affectedRows
    );

  }

}


/*
=========================================
Input Immutability
=========================================
*/

/**
 * Executorによって入力原本が
 *変更されていないことを確認する。
 *
 * @param {Object} operation
 * @param {string} originalOperationJson
 * @param {Object} bindingMap
 * @param {string} originalBindingMapJson
 */
function SpreadsheetOperationExecutor_assertInputsNotModified(
  operation,
  originalOperationJson,
  bindingMap,
  originalBindingMapJson
) {

  if (
    JSON.stringify(
      operation
    ) !==
      originalOperationJson
  ) {

    throw new Error(
      "SpreadsheetOperationExecutorによってOperation原本が変更されました。"
    );

  }


  if (
    JSON.stringify(
      bindingMap
    ) !==
      originalBindingMapJson
  ) {

    throw new Error(
      "SpreadsheetOperationExecutorによってBinding Map原本が変更されました。"
    );

  }

}





/*
=========================================
Part 2

Operation Result
・Success Result
・Failed Result
・Error変換
・ExecutionResultContract検証
=========================================
*/


/*
=========================================
Error Codes
=========================================
*/

const SPREADSHEET_OPERATION_EXECUTOR_ERROR_CODE =
  "SPREADSHEET_OPERATION_EXECUTION_FAILED";


/*
=========================================
Success Result
=========================================
*/

/**
 * Repository実行成功時の
 * Operation Resultを生成する。
 *
 * @param {Object} operation
 * @param {Object} repositoryResult
 * @param {string} startedAt
 * @param {string} completedAt
 * @param {number} durationMs
 * @return {Object}
 */
function SpreadsheetOperationExecutor_createSuccessResult(
  operation,
  repositoryResult,
  startedAt,
  completedAt,
  durationMs
) {

  SpreadsheetOperationExecutor_validateOperation(
    operation
  );


  SpreadsheetOperationExecutor_validateRepositoryResult(
    repositoryResult
  );


  SpreadsheetOperationExecutor_validateExecutionTime(
    startedAt,
    completedAt,
    durationMs
  );


  const operationResult =
    ExecutionResultContract_createEmptyOperationResult();


  operationResult.operationId =
    operation.operationId;


  operationResult.sequence =
    operation.sequence;


  operationResult.operationType =
    operation.operationType;


  operationResult.status =
    EXECUTION_OPERATION_STATUS_SUCCESS;


  operationResult.startedAt =
    startedAt;


  operationResult.completedAt =
    completedAt;


  operationResult.durationMs =
    durationMs;


  operationResult.affectedRows =
    repositoryResult.affectedRows;


  operationResult.message =
    "Spreadsheet Operationが正常に完了しました。";


  operationResult.error =
    null;


  /*
   * Operation Result単体として
   * ExecutionResultContractを満たすことを確認する。
   */
  ExecutionResultContract_validateOperationResult(
    operationResult,
    0
  );


  return operationResult;

}


/*
=========================================
Failed Result
=========================================
*/

/**
 * Operation実行失敗時の
 * Operation Resultを生成する。
 *
 * Spreadsheetへ反映された行数を確実に
 * 判定できない場合があるため、
 * Ver.1.0ではaffectedRows=0として扱う。
 *
 * @param {Object} operation
 * @param {*} error
 * @param {string} startedAt
 * @param {string} completedAt
 * @param {number} durationMs
 * @return {Object}
 */
function SpreadsheetOperationExecutor_createFailedResult(
  operation,
  error,
  startedAt,
  completedAt,
  durationMs
) {

  SpreadsheetOperationExecutor_validateOperation(
    operation
  );


  SpreadsheetOperationExecutor_validateExecutionTime(
    startedAt,
    completedAt,
    durationMs
  );


  const operationResult =
    ExecutionResultContract_createEmptyOperationResult();


  operationResult.operationId =
    operation.operationId;


  operationResult.sequence =
    operation.sequence;


  operationResult.operationType =
    operation.operationType;


  operationResult.status =
    EXECUTION_OPERATION_STATUS_FAILED;


  operationResult.startedAt =
    startedAt;


  operationResult.completedAt =
    completedAt;


  operationResult.durationMs =
    durationMs;


  operationResult.affectedRows =
    0;


  operationResult.message =
    "Spreadsheet Operationの実行に失敗しました。";


  operationResult.error =
    SpreadsheetOperationExecutor_createErrorObject(
      operation,
      error
    );


  ExecutionResultContract_validateOperationResult(
    operationResult,
    0
  );


  return operationResult;

}


/*
=========================================
Error Conversion
=========================================
*/

/**
 * 例外をExecution Result形式の
 * Error Objectへ変換する。
 *
 * @param {Object} operation
 * @param {*} error
 * @return {Object}
 */
function SpreadsheetOperationExecutor_createErrorObject(
  operation,
  error
) {

  SpreadsheetOperationExecutor_assertObject(
    operation,
    "operation"
  );


  const errorObject =
    ExecutionResultContract_createEmptyError();


  errorObject.code =
    SpreadsheetOperationExecutor_resolveErrorCode(
      error
    );


  errorObject.operationId =
    operation.operationId;


  errorObject.message =
    SpreadsheetOperationExecutor_resolveErrorMessage(
      error
    );


  errorObject.detail =
    SpreadsheetOperationExecutor_resolveErrorDetail(
      error
    );


  ExecutionResultContract_validateErrorObject(
    errorObject,
    "operationResult.error"
  );


  return errorObject;

}


/**
 * Error Codeを決定する。
 *
 * Ver.1.0では共通コードを使用する。
 * 将来はRepository・Binding・Validationごとに
 * コードを細分化できる。
 *
 * @param {*} error
 * @return {string}
 */
function SpreadsheetOperationExecutor_resolveErrorCode(
  error
) {

  /*
   * 明示的なcodeを持つErrorの場合は、
   * その値を優先する。
   */
  if (
    error &&
    typeof error ===
      "object" &&
    typeof error.code ===
      "string" &&
    error.code.trim() !==
      ""
  ) {

    return error.code.trim();

  }


  return SPREADSHEET_OPERATION_EXECUTOR_ERROR_CODE;

}


/**
 * Error Messageを取得する。
 *
 * @param {*} error
 * @return {string}
 */
function SpreadsheetOperationExecutor_resolveErrorMessage(
  error
) {

  if (
    error &&
    typeof error ===
      "object" &&
    typeof error.message ===
      "string" &&
    error.message.trim() !==
      ""
  ) {

    return error.message.trim();

  }


  if (
    typeof error ===
      "string" &&
    error.trim() !==
      ""
  ) {

    return error.trim();

  }


  return "Spreadsheet Operationの実行中に不明なエラーが発生しました。";

}


/**
 * Error Detailを取得する。
 *
 * stackが存在する場合は文字列として保持する。
 * stackがない場合はnullとする。
 *
 * @param {*} error
 * @return {string|null}
 */
function SpreadsheetOperationExecutor_resolveErrorDetail(
  error
) {

  if (
    error &&
    typeof error ===
      "object" &&
    typeof error.stack ===
      "string" &&
    error.stack.trim() !==
      ""
  ) {

    return error.stack.trim();

  }


  return null;

}


/*
=========================================
Execution Time Validation
=========================================
*/

/**
 * Operation Resultへ設定する
 * 実行時刻とdurationMsを検証する。
 *
 * @param {string} startedAt
 * @param {string} completedAt
 * @param {number} durationMs
 */
function SpreadsheetOperationExecutor_validateExecutionTime(
  startedAt,
  completedAt,
  durationMs
) {

  SpreadsheetOperationExecutor_requireNonEmptyString(
    startedAt,
    "startedAt"
  );


  SpreadsheetOperationExecutor_requireNonEmptyString(
    completedAt,
    "completedAt"
  );


  SpreadsheetOperationExecutor_assertNonNegativeFiniteNumber(
    durationMs,
    "durationMs"
  );


  ExecutionResultContract_validateDurationConsistency(
    startedAt,
    completedAt,
    durationMs,
    "operationResult"
  );

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
function SpreadsheetOperationExecutor_assertObject(
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
 * 1件以上の項目を持つObjectであることを確認する。
 *
 * @param {*} value
 * @param {string} label
 */
function SpreadsheetOperationExecutor_assertNonEmptyObject(
  value,
  label
) {

  SpreadsheetOperationExecutor_assertObject(
    value,
    label
  );


  if (
    Object.keys(
      value
    ).length ===
      0
  ) {

    throw new Error(
      label +
      "は空Objectにできません。"
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
function SpreadsheetOperationExecutor_requireNonEmptyString(
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
function SpreadsheetOperationExecutor_assertPositiveInteger(
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
 * 0以上の整数であることを確認する。
 *
 * @param {*} value
 * @param {string} label
 */
function SpreadsheetOperationExecutor_assertNonNegativeInteger(
  value,
  label
) {

  if (
    !Number.isInteger(
      value
    ) ||
    value <
      0
  ) {

    throw new Error(
      label +
      "は0以上の整数である必要があります。"
    );

  }

}




/**
 * 0以上の有限なnumberであることを確認する。
 *
 * @param {*} value
 * @param {string} label
 */
function SpreadsheetOperationExecutor_assertNonNegativeFiniteNumber(
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