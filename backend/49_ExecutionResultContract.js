/*
=========================================
SHiCI

ExecutionResultContract.js

役割

SpreadsheetTransactionEngineが返す
正式なExecution Resultを定義する。

Execution Resultは
Execution Planの実行結果を表す。

=========================================
*/



/*
=========================================
Status
=========================================
*/

const EXECUTION_RESULT_STATUS_SUCCESS =
  "success";

const EXECUTION_RESULT_STATUS_FAILED =
  "failed";

const EXECUTION_RESULT_STATUS_ROLLED_BACK =
  "rolled_back";

const EXECUTION_RESULT_STATUS_PARTIAL =
  "partial";



/*
=========================================
Operation Status
=========================================
*/

const EXECUTION_OPERATION_STATUS_SUCCESS =
  "success";

const EXECUTION_OPERATION_STATUS_FAILED =
  "failed";

const EXECUTION_OPERATION_STATUS_SKIPPED =
  "skipped";



/*
=========================================
Rollback Status
=========================================
*/

const EXECUTION_ROLLBACK_STATUS_NONE =
  "none";

const EXECUTION_ROLLBACK_STATUS_SUCCESS =
  "success";

const EXECUTION_ROLLBACK_STATUS_FAILED =
  "failed";



/*
=========================================
Factory
=========================================
*/

/**
 * 空のExecution Resultを生成する。
 *
 * @return {Object}
 */
function ExecutionResultContract_createEmpty() {

  return {

    executionResultId:
      null,

    executionPlanId:
      null,

    status:
      null,

    startedAt:
      null,

    completedAt:
      null,

    durationMs:
      null,

    operations:
      [],

    bindings:
      [],

    rollback:
      ExecutionResultContract_createEmptyRollback(),

    errors:
      [],

    metadata:
      {

        executor:
          null,

        requestId:
          null,

        correlationId:
          null

      }

  };

}



/**
 * 空のOperation Resultを生成する。
 *
 * @return {Object}
 */
function ExecutionResultContract_createEmptyOperationResult() {

  return {

    operationId:
      null,

    sequence:
      null,

    operationType:
      null,

    status:
      null,

    startedAt:
      null,

    completedAt:
      null,

    durationMs:
      null,

    affectedRows:
      0,

    message:
      null,

    error:
      null

  };

}



/**
 * 空のBinding Resultを生成する。
 *
 * @return {Object}
 */
function ExecutionResultContract_createEmptyBindingResult() {

  return {

    bindingId:
      null,

    resolvedValue:
      null,

    resolved:
      false

  };

}



/**
 * 空のRollback Resultを生成する。
 *
 * @return {Object}
 */
function ExecutionResultContract_createEmptyRollback() {

  return {

    performed:
      false,

    status:
      EXECUTION_ROLLBACK_STATUS_NONE,

    operations:
      [],

    startedAt:
      null,

    completedAt:
      null,

    durationMs:
      null

  };

}



/**
 * 空のErrorを生成する。
 *
 * @return {Object}
 */
function ExecutionResultContract_createEmptyError() {

  return {

    code:
      null,

    operationId:
      null,

    message:
      null,

    detail:
      null

  };

}









/*
=========================================
Part 2

Main Validation
・Execution Result全体
・Status
・Operation Results
・Binding Results
=========================================
*/


/*
=========================================
Validation
=========================================
*/

/**
 * Execution Result全体を検証する。
 *
 * @param {Object} executionResult
 * @return {boolean}
 */
function ExecutionResultContract_validate(
  executionResult
) {

  ExecutionResultContract_assertObject(
    executionResult,
    "executionResult"
  );


  /*
  =========================================
  Identity
  =========================================
  */

  ExecutionResultContract_assertNonEmptyString(
    executionResult.executionResultId,
    "executionResult.executionResultId"
  );


  ExecutionResultContract_assertNonEmptyString(
    executionResult.executionPlanId,
    "executionResult.executionPlanId"
  );


  /*
  =========================================
  Status
  =========================================
  */

  ExecutionResultContract_validateStatus(
    executionResult.status
  );


  /*
  =========================================
  Time
  =========================================
  */

  ExecutionResultContract_assertNonEmptyString(
    executionResult.startedAt,
    "executionResult.startedAt"
  );


  ExecutionResultContract_assertNonEmptyString(
    executionResult.completedAt,
    "executionResult.completedAt"
  );


  ExecutionResultContract_assertNonNegativeFiniteNumber(
    executionResult.durationMs,
    "executionResult.durationMs"
  );


  ExecutionResultContract_validateDurationConsistency(
    executionResult.startedAt,
    executionResult.completedAt,
    executionResult.durationMs,
    "executionResult"
  );


  /*
  =========================================
  Operation Results
  =========================================
  */

  ExecutionResultContract_validateOperations(
    executionResult.operations
  );


  /*
  =========================================
  Binding Results
  =========================================
  */

  ExecutionResultContract_validateBindings(
    executionResult.bindings
  );


  /*
  =========================================
  Rollback Result
  =========================================
  */

  ExecutionResultContract_validateRollback(
    executionResult.rollback
  );


  /*
  =========================================
  Errors
  =========================================
  */

  ExecutionResultContract_validateErrors(
    executionResult.errors
  );


  /*
  =========================================
  Metadata
  =========================================
  */

  ExecutionResultContract_validateMetadata(
    executionResult.metadata
  );


  /*
  =========================================
  Cross-field Consistency
  =========================================
  */

  ExecutionResultContract_validateStatusConsistency(
    executionResult
  );


  return true;

}


/*
=========================================
Execution Result Status
=========================================
*/

/**
 * Execution Resultのstatusを検証する。
 *
 * @param {string} status
 */
function ExecutionResultContract_validateStatus(
  status
) {

  ExecutionResultContract_assertNonEmptyString(
    status,
    "executionResult.status"
  );


  const supportedStatuses = [

    EXECUTION_RESULT_STATUS_SUCCESS,

    EXECUTION_RESULT_STATUS_FAILED,

    EXECUTION_RESULT_STATUS_ROLLED_BACK,

    EXECUTION_RESULT_STATUS_PARTIAL

  ];


  if (
    supportedStatuses.indexOf(
      status
    ) ===
      -1
  ) {

    throw new Error(
      "未対応のExecution Result statusです。" +
      " status=" +
      status
    );

  }

}


/*
=========================================
Operation Results
=========================================
*/

/**
 * Operation Result配列を検証する。
 *
 * @param {Array<Object>} operations
 */
function ExecutionResultContract_validateOperations(
  operations
) {

  if (
    !Array.isArray(
      operations
    )
  ) {

    throw new Error(
      "executionResult.operationsはArrayである必要があります。"
    );

  }


  if (
    operations.length ===
      0
  ) {

    throw new Error(
      "executionResult.operationsには1件以上のOperation Resultが必要です。"
    );

  }


  const operationIds =
    {};


  operations.forEach(
    function(operationResult, index) {

      ExecutionResultContract_validateOperationResult(
        operationResult,
        index
      );


      if (
        operationIds[
          operationResult.operationId
        ]
      ) {

        throw new Error(
          "Operation ResultのoperationIdが重複しています。" +
          " operationId=" +
          operationResult.operationId
        );

      }


      operationIds[
        operationResult.operationId
      ] =
        true;


      const expectedSequence =
        index +
        1;


      if (
        operationResult.sequence !==
          expectedSequence
      ) {

        throw new Error(
          "Operation Resultのsequenceが不正です。" +
          " expected=" +
          expectedSequence +
          " actual=" +
          operationResult.sequence
        );

      }

    }
  );

}


/**
 * 1件のOperation Resultを検証する。
 *
 * @param {Object} operationResult
 * @param {number} index
 */
function ExecutionResultContract_validateOperationResult(
  operationResult,
  index
) {

  const label =
    "executionResult.operations[" +
    index +
    "]";


  ExecutionResultContract_assertObject(
    operationResult,
    label
  );


  ExecutionResultContract_assertNonEmptyString(
    operationResult.operationId,
    label +
    ".operationId"
  );


  ExecutionResultContract_assertPositiveInteger(
    operationResult.sequence,
    label +
    ".sequence"
  );


  ExecutionResultContract_validateOperationType(
    operationResult.operationType,
    label +
    ".operationType"
  );


  ExecutionResultContract_validateOperationStatus(
    operationResult.status,
    label +
    ".status"
  );


  /*
  =========================================
  Time
  =========================================
  */

  ExecutionResultContract_assertNonEmptyString(
    operationResult.startedAt,
    label +
    ".startedAt"
  );


  ExecutionResultContract_assertNonEmptyString(
    operationResult.completedAt,
    label +
    ".completedAt"
  );


  ExecutionResultContract_assertNonNegativeFiniteNumber(
    operationResult.durationMs,
    label +
    ".durationMs"
  );


  ExecutionResultContract_validateDurationConsistency(
    operationResult.startedAt,
    operationResult.completedAt,
    operationResult.durationMs,
    label
  );


  /*
  =========================================
  Result Values
  =========================================
  */

  ExecutionResultContract_assertNonNegativeInteger(
    operationResult.affectedRows,
    label +
    ".affectedRows"
  );


  if (
    operationResult.message !==
      null
  ) {

    ExecutionResultContract_assertNonEmptyString(
      operationResult.message,
      label +
      ".message"
    );

  }


  if (
    operationResult.error !==
      null
  ) {

    ExecutionResultContract_validateErrorObject(
      operationResult.error,
      label +
      ".error"
    );

  }


  ExecutionResultContract_validateOperationResultConsistency(
    operationResult,
    label
  );

}


/**
 * Operation Typeを検証する。
 *
 * @param {string} operationType
 * @param {string} label
 */
function ExecutionResultContract_validateOperationType(
  operationType,
  label
) {

  ExecutionResultContract_assertNonEmptyString(
    operationType,
    label
  );


  const supportedOperationTypes = [

    "insert",

    "append",

    "update",

    "delete"

  ];


  if (
    supportedOperationTypes.indexOf(
      operationType
    ) ===
      -1
  ) {

    throw new Error(
      "未対応のOperation Result operationTypeです。" +
      " operationType=" +
      operationType
    );

  }

}


/**
 * Operation Resultのstatusを検証する。
 *
 * @param {string} status
 * @param {string} label
 */
function ExecutionResultContract_validateOperationStatus(
  status,
  label
) {

  ExecutionResultContract_assertNonEmptyString(
    status,
    label
  );


  const supportedStatuses = [

    EXECUTION_OPERATION_STATUS_SUCCESS,

    EXECUTION_OPERATION_STATUS_FAILED,

    EXECUTION_OPERATION_STATUS_SKIPPED

  ];


  if (
    supportedStatuses.indexOf(
      status
    ) ===
      -1
  ) {

    throw new Error(
      "未対応のOperation Result statusです。" +
      " status=" +
      status
    );

  }

}


/**
 * Operation Result内の整合性を検証する。
 *
 * @param {Object} operationResult
 * @param {string} label
 */
function ExecutionResultContract_validateOperationResultConsistency(
  operationResult,
  label
) {

  /*
   * successの場合は、
   * errorを保持してはならない。
   */
  if (
    operationResult.status ===
      EXECUTION_OPERATION_STATUS_SUCCESS
  ) {

    if (
      operationResult.error !==
        null
    ) {

      throw new Error(
        label +
        ".errorはsuccess時にはnullである必要があります。"
      );

    }


    return;

  }


  /*
   * failedの場合は、
   * errorが必須である。
   */
  if (
    operationResult.status ===
      EXECUTION_OPERATION_STATUS_FAILED
  ) {

    if (
      operationResult.error ===
        null
    ) {

      throw new Error(
        label +
        ".errorはfailed時には必須です。"
      );

    }


    return;

  }


  /*
   * skippedの場合は、
   * Storageを更新していないため
   * affectedRowsは0でなければならない。
   */
  if (
    operationResult.status ===
      EXECUTION_OPERATION_STATUS_SKIPPED
  ) {

    if (
      operationResult.affectedRows !==
        0
    ) {

      throw new Error(
        label +
        ".affectedRowsはskipped時には0である必要があります。"
      );

    }


    if (
      operationResult.error !==
        null
    ) {

      throw new Error(
        label +
        ".errorはskipped時にはnullである必要があります。"
      );

    }

  }

}


/*
=========================================
Binding Results
=========================================
*/

/**
 * Binding Result配列を検証する。
 *
 * Bindingを使用しないExecution Planも考慮し、
 * 空配列を許可する。
 *
 * @param {Array<Object>} bindings
 */
function ExecutionResultContract_validateBindings(
  bindings
) {

  if (
    !Array.isArray(
      bindings
    )
  ) {

    throw new Error(
      "executionResult.bindingsはArrayである必要があります。"
    );

  }


  const bindingIds =
    {};


  bindings.forEach(
    function(bindingResult, index) {

      ExecutionResultContract_validateBindingResult(
        bindingResult,
        index
      );


      if (
        bindingIds[
          bindingResult.bindingId
        ]
      ) {

        throw new Error(
          "Binding ResultのbindingIdが重複しています。" +
          " bindingId=" +
          bindingResult.bindingId
        );

      }


      bindingIds[
        bindingResult.bindingId
      ] =
        true;

    }
  );

}


/**
 * 1件のBinding Resultを検証する。
 *
 * @param {Object} bindingResult
 * @param {number} index
 */
function ExecutionResultContract_validateBindingResult(
  bindingResult,
  index
) {

  const label =
    "executionResult.bindings[" +
    index +
    "]";


  ExecutionResultContract_assertObject(
    bindingResult,
    label
  );


  ExecutionResultContract_assertNonEmptyString(
    bindingResult.bindingId,
    label +
    ".bindingId"
  );


  ExecutionResultContract_assertBoolean(
    bindingResult.resolved,
    label +
    ".resolved"
  );


  if (
    bindingResult.resolved ===
      true
  ) {

    ExecutionResultContract_assertNonEmptyString(
      bindingResult.resolvedValue,
      label +
      ".resolvedValue"
    );


    return;

  }


  if (
    bindingResult.resolvedValue !==
      null
  ) {

    throw new Error(
      label +
      ".resolvedValueは未解決時にはnullである必要があります。"
    );

  }

}








/*
=========================================
Part 3

Rollback
・Errors
・Metadata
・Execution Result Status Consistency
=========================================
*/


/*
=========================================
Rollback Result
=========================================
*/

/**
 * Rollback Resultを検証する。
 *
 * @param {Object} rollback
 */
function ExecutionResultContract_validateRollback(
  rollback
) {

  ExecutionResultContract_assertObject(
    rollback,
    "executionResult.rollback"
  );


  ExecutionResultContract_assertBoolean(
    rollback.performed,
    "executionResult.rollback.performed"
  );


  ExecutionResultContract_validateRollbackStatus(
    rollback.status
  );


  if (
    !Array.isArray(
      rollback.operations
    )
  ) {

    throw new Error(
      "executionResult.rollback.operationsはArrayである必要があります。"
    );

  }


  const operationIds =
    {};


  rollback.operations.forEach(
    function(operationResult, index) {

      ExecutionResultContract_validateRollbackOperationResult(
        operationResult,
        index
      );


      if (
        operationIds[
          operationResult.operationId
        ]
      ) {

        throw new Error(
          "Rollback Operation ResultのoperationIdが重複しています。" +
          " operationId=" +
          operationResult.operationId
        );

      }


      operationIds[
        operationResult.operationId
      ] =
        true;

    }
  );


  /*
  =========================================
  Rollback Time
  =========================================
  */

  if (
    rollback.performed ===
      true
  ) {

    ExecutionResultContract_assertNonEmptyString(
      rollback.startedAt,
      "executionResult.rollback.startedAt"
    );


    ExecutionResultContract_assertNonEmptyString(
      rollback.completedAt,
      "executionResult.rollback.completedAt"
    );


    ExecutionResultContract_assertNonNegativeFiniteNumber(
      rollback.durationMs,
      "executionResult.rollback.durationMs"
    );


    ExecutionResultContract_validateDurationConsistency(
      rollback.startedAt,
      rollback.completedAt,
      rollback.durationMs,
      "executionResult.rollback"
    );

  } else {

    if (
      rollback.startedAt !==
        null
    ) {

      throw new Error(
        "executionResult.rollback.startedAtは未実行時にはnullである必要があります。"
      );

    }


    if (
      rollback.completedAt !==
        null
    ) {

      throw new Error(
        "executionResult.rollback.completedAtは未実行時にはnullである必要があります。"
      );

    }


    if (
      rollback.durationMs !==
        null
    ) {

      throw new Error(
        "executionResult.rollback.durationMsは未実行時にはnullである必要があります。"
      );

    }

  }


  ExecutionResultContract_validateRollbackConsistency(
    rollback
  );

}


/**
 * Rollback statusを検証する。
 *
 * @param {string} status
 */
function ExecutionResultContract_validateRollbackStatus(
  status
) {

  ExecutionResultContract_assertNonEmptyString(
    status,
    "executionResult.rollback.status"
  );


  const supportedStatuses = [

    EXECUTION_ROLLBACK_STATUS_NONE,

    EXECUTION_ROLLBACK_STATUS_SUCCESS,

    EXECUTION_ROLLBACK_STATUS_FAILED

  ];


  if (
    supportedStatuses.indexOf(
      status
    ) ===
      -1
  ) {

    throw new Error(
      "未対応のRollback statusです。" +
      " status=" +
      status
    );

  }

}


/**
 * 1件のRollback Operation Resultを検証する。
 *
 * Rollback Operation Resultは、
 * 通常のOperation Resultと同じ構造を使用する。
 *
 * @param {Object} operationResult
 * @param {number} index
 */
function ExecutionResultContract_validateRollbackOperationResult(
  operationResult,
  index
) {

  const label =
    "executionResult.rollback.operations[" +
    index +
    "]";


  ExecutionResultContract_assertObject(
    operationResult,
    label
  );


  ExecutionResultContract_assertNonEmptyString(
    operationResult.operationId,
    label +
    ".operationId"
  );


  ExecutionResultContract_assertPositiveInteger(
    operationResult.sequence,
    label +
    ".sequence"
  );


  ExecutionResultContract_validateOperationType(
    operationResult.operationType,
    label +
    ".operationType"
  );


  ExecutionResultContract_validateOperationStatus(
    operationResult.status,
    label +
    ".status"
  );


  ExecutionResultContract_assertNonEmptyString(
    operationResult.startedAt,
    label +
    ".startedAt"
  );


  ExecutionResultContract_assertNonEmptyString(
    operationResult.completedAt,
    label +
    ".completedAt"
  );


  ExecutionResultContract_assertNonNegativeFiniteNumber(
    operationResult.durationMs,
    label +
    ".durationMs"
  );


  ExecutionResultContract_validateDurationConsistency(
    operationResult.startedAt,
    operationResult.completedAt,
    operationResult.durationMs,
    label
  );


  ExecutionResultContract_assertNonNegativeInteger(
    operationResult.affectedRows,
    label +
    ".affectedRows"
  );


  if (
    operationResult.message !==
      null
  ) {

    ExecutionResultContract_assertNonEmptyString(
      operationResult.message,
      label +
      ".message"
    );

  }


  if (
    operationResult.error !==
      null
  ) {

    ExecutionResultContract_validateErrorObject(
      operationResult.error,
      label +
      ".error"
    );

  }


  ExecutionResultContract_validateOperationResultConsistency(
    operationResult,
    label
  );

}


/**
 * Rollback Result内の整合性を検証する。
 *
 * @param {Object} rollback
 */
function ExecutionResultContract_validateRollbackConsistency(
  rollback
) {

  /*
   * 未実行の場合
   */
  if (
    rollback.performed ===
      false
  ) {

    if (
      rollback.status !==
        EXECUTION_ROLLBACK_STATUS_NONE
    ) {

      throw new Error(
        "Rollback未実行時のstatusはnoneである必要があります。"
      );

    }


    if (
      rollback.operations.length !==
        0
    ) {

      throw new Error(
        "Rollback未実行時のoperationsは空配列である必要があります。"
      );

    }


    return;

  }


  /*
   * 実行済みの場合、
   * status=noneは許可しない。
   */
  if (
    rollback.status ===
      EXECUTION_ROLLBACK_STATUS_NONE
  ) {

    throw new Error(
      "Rollback実行済みの場合、statusをnoneにできません。"
    );

  }


  if (
    rollback.operations.length ===
      0
  ) {

    throw new Error(
      "Rollback実行済みの場合、1件以上のRollback Operation Resultが必要です。"
    );

  }


  const failedRollbackOperations =
    rollback.operations.filter(
      function(operationResult) {

        return (
          operationResult.status ===
            EXECUTION_OPERATION_STATUS_FAILED
        );

      }
    );


  /*
   * Rollback成功
   */
  if (
    rollback.status ===
      EXECUTION_ROLLBACK_STATUS_SUCCESS
  ) {

    if (
      failedRollbackOperations.length >
        0
    ) {

      throw new Error(
        "Rollback status=successの場合、failedのRollback Operationを含められません。"
      );

    }


    return;

  }


  /*
   * Rollback失敗
   */
  if (
    rollback.status ===
      EXECUTION_ROLLBACK_STATUS_FAILED
  ) {

    if (
      failedRollbackOperations.length ===
        0
    ) {

      throw new Error(
        "Rollback status=failedの場合、1件以上のfailed Operationが必要です。"
      );

    }

  }

}


/*
=========================================
Errors
=========================================
*/

/**
 * Execution Result全体のError配列を検証する。
 *
 * @param {Array<Object>} errors
 */
function ExecutionResultContract_validateErrors(
  errors
) {

  if (
    !Array.isArray(
      errors
    )
  ) {

    throw new Error(
      "executionResult.errorsはArrayである必要があります。"
    );

  }


  errors.forEach(
    function(errorObject, index) {

      ExecutionResultContract_validateErrorObject(
        errorObject,
        "executionResult.errors[" +
        index +
        "]"
      );

    }
  );

}


/**
 * Error Objectを検証する。
 *
 * @param {Object} errorObject
 * @param {string} label
 */
function ExecutionResultContract_validateErrorObject(
  errorObject,
  label
) {

  ExecutionResultContract_assertObject(
    errorObject,
    label
  );


  ExecutionResultContract_assertNonEmptyString(
    errorObject.code,
    label +
    ".code"
  );


  if (
    errorObject.operationId !==
      null
  ) {

    ExecutionResultContract_assertNonEmptyString(
      errorObject.operationId,
      label +
      ".operationId"
    );

  }


  ExecutionResultContract_assertNonEmptyString(
    errorObject.message,
    label +
    ".message"
  );


  if (
    errorObject.detail !==
      null
  ) {

    if (
      typeof errorObject.detail ===
        "string"
    ) {

      ExecutionResultContract_assertNonEmptyString(
        errorObject.detail,
        label +
        ".detail"
      );

    } else {

      ExecutionResultContract_assertObject(
        errorObject.detail,
        label +
        ".detail"
      );

    }

  }

}


/*
=========================================
Metadata
=========================================
*/

/**
 * Execution ResultのMetadataを検証する。
 *
 * @param {Object} metadata
 */
function ExecutionResultContract_validateMetadata(
  metadata
) {

  ExecutionResultContract_assertObject(
    metadata,
    "executionResult.metadata"
  );


  if (
    metadata.executor !==
      null
  ) {

    ExecutionResultContract_assertNonEmptyString(
      metadata.executor,
      "executionResult.metadata.executor"
    );

  }


  if (
    metadata.requestId !==
      null
  ) {

    ExecutionResultContract_assertNonEmptyString(
      metadata.requestId,
      "executionResult.metadata.requestId"
    );

  }


  if (
    metadata.correlationId !==
      null
  ) {

    ExecutionResultContract_assertNonEmptyString(
      metadata.correlationId,
      "executionResult.metadata.correlationId"
    );

  }

}


/*
=========================================
Execution Result Status Consistency
=========================================
*/

/**
 * Execution Result全体のstatusと、
 * Operation・Rollback・Errorsの整合性を検証する。
 *
 * @param {Object} executionResult
 */
function ExecutionResultContract_validateStatusConsistency(
  executionResult
) {

  const successfulOperations =
    executionResult.operations.filter(
      function(operationResult) {

        return (
          operationResult.status ===
            EXECUTION_OPERATION_STATUS_SUCCESS
        );

      }
    );


  const failedOperations =
    executionResult.operations.filter(
      function(operationResult) {

        return (
          operationResult.status ===
            EXECUTION_OPERATION_STATUS_FAILED
        );

      }
    );


  const skippedOperations =
    executionResult.operations.filter(
      function(operationResult) {

        return (
          operationResult.status ===
            EXECUTION_OPERATION_STATUS_SKIPPED
        );

      }
    );


  /*
  =========================================
  Success
  =========================================
  */

  if (
    executionResult.status ===
      EXECUTION_RESULT_STATUS_SUCCESS
  ) {

    if (
      failedOperations.length >
        0
    ) {

      throw new Error(
        "Execution Result status=successの場合、failed Operationを含められません。"
      );

    }


    if (
      skippedOperations.length >
        0
    ) {

      throw new Error(
        "Execution Result status=successの場合、skipped Operationを含められません。"
      );

    }


    if (
      successfulOperations.length !==
        executionResult.operations.length
    ) {

      throw new Error(
        "Execution Result status=successの場合、全Operationがsuccessである必要があります。"
      );

    }


    if (
      executionResult.rollback.performed !==
        false
    ) {

      throw new Error(
        "Execution Result status=successの場合、Rollbackを実行できません。"
      );

    }


    if (
      executionResult.errors.length !==
        0
    ) {

      throw new Error(
        "Execution Result status=successの場合、errorsは空配列である必要があります。"
      );

    }


    return;

  }


  /*
  =========================================
  Rolled Back
  =========================================
  */

  if (
    executionResult.status ===
      EXECUTION_RESULT_STATUS_ROLLED_BACK
  ) {

    if (
      failedOperations.length ===
        0
    ) {

      throw new Error(
        "Execution Result status=rolled_backの場合、1件以上のfailed Operationが必要です。"
      );

    }


    if (
      executionResult.rollback.performed !==
        true
    ) {

      throw new Error(
        "Execution Result status=rolled_backの場合、Rollback実行済みである必要があります。"
      );

    }


    if (
      executionResult.rollback.status !==
        EXECUTION_ROLLBACK_STATUS_SUCCESS
    ) {

      throw new Error(
        "Execution Result status=rolled_backの場合、Rollback statusはsuccessである必要があります。"
      );

    }


    if (
      executionResult.errors.length ===
        0
    ) {

      throw new Error(
        "Execution Result status=rolled_backの場合、1件以上のErrorが必要です。"
      );

    }


    return;

  }


  /*
  =========================================
  Failed
  =========================================
  */

  if (
    executionResult.status ===
      EXECUTION_RESULT_STATUS_FAILED
  ) {

    if (
      failedOperations.length ===
        0
    ) {

      throw new Error(
        "Execution Result status=failedの場合、1件以上のfailed Operationが必要です。"
      );

    }


    if (
      executionResult.errors.length ===
        0
    ) {

      throw new Error(
        "Execution Result status=failedの場合、1件以上のErrorが必要です。"
      );

    }


    /*
     * Rollback未実行、
     * またはRollback失敗をfailedとして扱う。
     */
    if (
      executionResult.rollback.performed ===
        true &&
      executionResult.rollback.status !==
        EXECUTION_ROLLBACK_STATUS_FAILED
    ) {

      throw new Error(
        "Execution Result status=failedでRollback実行済みの場合、Rollback statusはfailedである必要があります。"
      );

    }


    return;

  }


  /*
  =========================================
  Partial
  =========================================
  */

  if (
    executionResult.status ===
      EXECUTION_RESULT_STATUS_PARTIAL
  ) {

    if (
      successfulOperations.length ===
        0
    ) {

      throw new Error(
        "Execution Result status=partialの場合、1件以上のsuccess Operationが必要です。"
      );

    }


    if (
      failedOperations.length ===
        0 &&
      skippedOperations.length ===
        0
    ) {

      throw new Error(
        "Execution Result status=partialの場合、failedまたはskipped Operationが必要です。"
      );

    }


    if (
      executionResult.errors.length ===
        0
    ) {

      throw new Error(
        "Execution Result status=partialの場合、1件以上のErrorが必要です。"
      );

    }

  }

}











/*
=========================================
Part 4

Time Validation
・Assertion
・Utility
=========================================
*/


/*
=========================================
Duration Consistency
=========================================
*/

/**
 * startedAt / completedAt / durationMsの
 * 整合性を検証する。
 *
 * durationMsは、
 * completedAt - startedAtと一致する必要がある。
 *
 * @param {string} startedAt
 * @param {string} completedAt
 * @param {number} durationMs
 * @param {string} label
 */
function ExecutionResultContract_validateDurationConsistency(
  startedAt,
  completedAt,
  durationMs,
  label
) {

  const startedTime =
    ExecutionResultContract_parseIsoDateTime(
      startedAt,
      label +
      ".startedAt"
    );


  const completedTime =
    ExecutionResultContract_parseIsoDateTime(
      completedAt,
      label +
      ".completedAt"
    );


  if (
    completedTime <
      startedTime
  ) {

    throw new Error(
      label +
      ".completedAtはstartedAt以降である必要があります。"
    );

  }


  const expectedDurationMs =
    completedTime -
    startedTime;


  if (
    durationMs !==
      expectedDurationMs
  ) {

    throw new Error(
      label +
      ".durationMsが時刻差と一致しません。" +
      " expected=" +
      expectedDurationMs +
      " actual=" +
      durationMs
    );

  }

}


/**
 * ISO 8601形式の日時文字列を解析する。
 *
 * Date.parse()で解釈でき、
 * かつ明示的なタイムゾーンを含む必要がある。
 *
 * @param {*} value
 * @param {string} label
 * @return {number}
 */
function ExecutionResultContract_parseIsoDateTime(
  value,
  label
) {

  ExecutionResultContract_assertNonEmptyString(
    value,
    label
  );


  const normalizedValue =
    value.trim();


  /*
   * UTCのZ、
   * または+09:00のようなOffsetを必須とする。
   *
   * 実行環境のローカルタイムへ
   * 暗黙依存することを防ぐ。
   */
  const hasExplicitTimeZone =
    /(?:Z|[+\-]\d{2}:\d{2})$/.test(
      normalizedValue
    );


  if (
    !hasExplicitTimeZone
  ) {

    throw new Error(
      label +
      "はタイムゾーンを含むISO 8601形式である必要があります。"
    );

  }


  const parsedTime =
    Date.parse(
      normalizedValue
    );


  if (
    !Number.isFinite(
      parsedTime
    )
  ) {

    throw new Error(
      label +
      "は有効な日時である必要があります。"
    );

  }


  return parsedTime;

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
function ExecutionResultContract_assertObject(
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
 * 空でないstringであることを確認する。
 *
 * @param {*} value
 * @param {string} label
 */
function ExecutionResultContract_assertNonEmptyString(
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


/**
 * booleanであることを確認する。
 *
 * @param {*} value
 * @param {string} label
 */
function ExecutionResultContract_assertBoolean(
  value,
  label
) {

  if (
    typeof value !==
      "boolean"
  ) {

    throw new Error(
      label +
      "はbooleanである必要があります。"
    );

  }

}


/**
 * 1以上の整数であることを確認する。
 *
 * @param {*} value
 * @param {string} label
 */
function ExecutionResultContract_assertPositiveInteger(
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
function ExecutionResultContract_assertNonNegativeInteger(
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
 * 0以上の有限数であることを確認する。
 *
 * @param {*} value
 * @param {string} label
 */
function ExecutionResultContract_assertNonNegativeFiniteNumber(
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


/*
=========================================
Utility
=========================================
*/

/**
 * JSON互換値をDeep Copyする。
 *
 * Contract自体では必須ではないが、
 * Test FixtureやResult Builderから
 * 安全に再利用できるよう定義する。
 *
 * @param {*} value
 * @return {*}
 */
function ExecutionResultContract_deepCopy(
  value
) {

  return JSON.parse(
    JSON.stringify(
      value
    )
  );

}



