/*
=========================================
SHiCI
47_ExecutionPlanContract.js

Execution Plan Contract
Version 1.0

役割：
・Execution Planの構造を定義する
・Spreadsheet更新前の実行命令を固定する
・Operationの順序と内容を検証する
・Change Planとの対応関係を保証する
・Transaction Engineへ渡せる状態か判定する

重要：
・このContractはSpreadsheetを更新しない
・このContractはExecution Planを生成しない
・このContractは業務判断をしない
・このContractは構造の生成と検証のみを行う

Execution Planとは：
・何を変更したいかではなく
・どのデータへ
・どの操作を
・どの順番で実行するか
を表す実行命令書である
=========================================
*/


/*
=========================================
定数
=========================================
*/

const EXECUTION_PLAN_CONTRACT_VERSION =
  "1.0";


const EXECUTION_PLAN_STATUS_DRAFT =
  "draft";


const EXECUTION_PLAN_STATUS_READY =
  "ready_for_execution";


const EXECUTION_PLAN_STATUS_EXECUTING =
  "executing";


const EXECUTION_PLAN_STATUS_COMPLETED =
  "completed";


const EXECUTION_PLAN_STATUS_FAILED =
  "failed";


const EXECUTION_PLAN_OPERATION_INSERT =
  "insert";


const EXECUTION_PLAN_OPERATION_UPDATE =
  "update";


const EXECUTION_PLAN_OPERATION_APPEND =
  "append";


const EXECUTION_PLAN_OPERATION_DELETE =
  "delete";


/*
=========================================
Factory
=========================================
*/

/**
 * 空のExecution Planを生成する。
 *
 * @return {Object}
 */
function ExecutionPlanContract_createEmpty() {

  return {

    schemaVersion:
      "1.0",

    contractVersion:
      EXECUTION_PLAN_CONTRACT_VERSION,

    executionPlanId:
      null,

    changePlanId:
      null,

    proposalId:
      null,

    status:
      EXECUTION_PLAN_STATUS_DRAFT,

    subject: {

      entityType:
        null,

      entityId:
        null,

      entityName:
        null

    },

    operations:
      [],

    executionPolicy: {

      atomic:
        true,

      stopOnError:
        true,

      rollbackRequired:
        true

    },

    executable:
      false,

    createdAt:
      null,

    createdBy:
      null,

    metadata: {

      source:
        null,

      requestId:
        null,

      correlationId:
        null

    }

  };

}


/**
 * 空のOperationを生成する。
 *
 * @return {Object}
 */
function ExecutionPlanContract_createEmptyOperation() {

  return {

    operationId:
      null,

    sequence:
      null,

    operationType:
      null,

    target: {

      repository:
        "spreadsheet",

      sheetName:
        null,

      entityType:
        null,

      entityId:
        null

    },

    payload: {

      values:
        null,

      criteria:
        null

    },

    rollback: {

      supported:
        false,

      operationType:
        null,

      payload:
        null

    },

    metadata: {

      description:
        null,

      sourcePath:
        null

    }

  };

}


/*
=========================================
Validation
=========================================
*/

/**
 * Execution Plan全体を検証する。
 *
 * @param {Object} executionPlan
 * @return {boolean}
 */
function ExecutionPlanContract_validate(
  executionPlan
) {

  ExecutionPlanContract_assertObject(
    executionPlan,
    "executionPlan"
  );


  ExecutionPlanContract_assertEqual(
    executionPlan.schemaVersion,
    "1.0",
    "executionPlan.schemaVersion"
  );


  ExecutionPlanContract_assertEqual(
    executionPlan.contractVersion,
    EXECUTION_PLAN_CONTRACT_VERSION,
    "executionPlan.contractVersion"
  );


  ExecutionPlanContract_assertNonEmptyString(
    executionPlan.executionPlanId,
    "executionPlan.executionPlanId"
  );


  ExecutionPlanContract_assertNonEmptyString(
    executionPlan.changePlanId,
    "executionPlan.changePlanId"
  );


  ExecutionPlanContract_assertNonEmptyString(
    executionPlan.proposalId,
    "executionPlan.proposalId"
  );


  ExecutionPlanContract_validateStatus(
    executionPlan.status
  );


  ExecutionPlanContract_validateSubject(
    executionPlan.subject
  );


  ExecutionPlanContract_validateOperations(
    executionPlan.operations
  );


  ExecutionPlanContract_validateExecutionPolicy(
    executionPlan.executionPolicy
  );


  ExecutionPlanContract_assertBoolean(
    executionPlan.executable,
    "executionPlan.executable"
  );


  ExecutionPlanContract_validateExecutableConsistency(
    executionPlan
  );


  ExecutionPlanContract_assertNonEmptyString(
    executionPlan.createdAt,
    "executionPlan.createdAt"
  );


  if (
    executionPlan.createdBy !==
      null
  ) {

    ExecutionPlanContract_assertNonEmptyString(
      executionPlan.createdBy,
      "executionPlan.createdBy"
    );

  }


  ExecutionPlanContract_validateMetadata(
    executionPlan.metadata
  );


  return true;

}


/*
=========================================
Status
=========================================
*/

/**
 * statusを検証する。
 *
 * @param {string} status
 */
function ExecutionPlanContract_validateStatus(
  status
) {

  ExecutionPlanContract_assertNonEmptyString(
    status,
    "executionPlan.status"
  );


  const supportedStatuses = [

    EXECUTION_PLAN_STATUS_DRAFT,

    EXECUTION_PLAN_STATUS_READY,

    EXECUTION_PLAN_STATUS_EXECUTING,

    EXECUTION_PLAN_STATUS_COMPLETED,

    EXECUTION_PLAN_STATUS_FAILED

  ];


  if (
    supportedStatuses.indexOf(
      status
    ) ===
      -1
  ) {

    throw new Error(
      "未対応のExecution Plan statusです。status=" +
      status
    );

  }

}


/*
=========================================
Subject
=========================================
*/

/**
 * subjectを検証する。
 *
 * @param {Object} subject
 */
function ExecutionPlanContract_validateSubject(
  subject
) {

  ExecutionPlanContract_assertObject(
    subject,
    "executionPlan.subject"
  );


  ExecutionPlanContract_assertNonEmptyString(
    subject.entityType,
    "executionPlan.subject.entityType"
  );


  ExecutionPlanContract_assertNonEmptyString(
    subject.entityId,
    "executionPlan.subject.entityId"
  );


  if (
    subject.entityName !==
      null
  ) {

    ExecutionPlanContract_assertNonEmptyString(
      subject.entityName,
      "executionPlan.subject.entityName"
    );

  }

}


/*
=========================================
Operations
=========================================
*/

/**
 * operations全体を検証する。
 *
 * @param {Array} operations
 */
function ExecutionPlanContract_validateOperations(
  operations
) {

  if (
    !Array.isArray(
      operations
    )
  ) {

    throw new Error(
      "executionPlan.operationsはArrayである必要があります。"
    );

  }


  if (
    operations.length ===
      0
  ) {

    throw new Error(
      "executionPlan.operationsには1件以上のOperationが必要です。"
    );

  }


  const operationIds =
    {};


  operations.forEach(
    function(operation, index) {

      ExecutionPlanContract_validateOperation(
        operation,
        index
      );


      if (
        operationIds[
          operation.operationId
        ]
      ) {

        throw new Error(
          "operationIdが重複しています。operationId=" +
          operation.operationId
        );

      }


      operationIds[
        operation.operationId
      ] =
        true;


      const expectedSequence =
        index +
        1;


      if (
        operation.sequence !==
          expectedSequence
      ) {

        throw new Error(
          "Operationのsequenceが不正です。expected=" +
          expectedSequence +
          " actual=" +
          operation.sequence
        );

      }

    }
  );

}


/**
 * 1件のOperationを検証する。
 *
 * @param {Object} operation
 * @param {number} index
 */
function ExecutionPlanContract_validateOperation(
  operation,
  index
) {

  const label =
    "executionPlan.operations[" +
    index +
    "]";


  ExecutionPlanContract_assertObject(
    operation,
    label
  );


  ExecutionPlanContract_assertNonEmptyString(
    operation.operationId,
    label +
    ".operationId"
  );


  ExecutionPlanContract_assertPositiveInteger(
    operation.sequence,
    label +
    ".sequence"
  );


  ExecutionPlanContract_validateOperationType(
    operation.operationType,
    label +
    ".operationType"
  );


  ExecutionPlanContract_validateTarget(
    operation.target,
    label +
    ".target"
  );


  ExecutionPlanContract_validatePayload(
    operation.payload,
    operation.operationType,
    label +
    ".payload"
  );


  ExecutionPlanContract_validateRollback(
    operation.rollback,
    label +
    ".rollback"
  );


  ExecutionPlanContract_validateOperationMetadata(
    operation.metadata,
    label +
    ".metadata"
  );

}


/**
 * operationTypeを検証する。
 *
 * @param {string} operationType
 * @param {string} label
 */
function ExecutionPlanContract_validateOperationType(
  operationType,
  label
) {

  ExecutionPlanContract_assertNonEmptyString(
    operationType,
    label
  );


  const supportedTypes = [

    EXECUTION_PLAN_OPERATION_INSERT,

    EXECUTION_PLAN_OPERATION_UPDATE,

    EXECUTION_PLAN_OPERATION_APPEND,

    EXECUTION_PLAN_OPERATION_DELETE

  ];


  if (
    supportedTypes.indexOf(
      operationType
    ) ===
      -1
  ) {

    throw new Error(
      "未対応のoperationTypeです。operationType=" +
      operationType
    );

  }

}


/*
=========================================
Target
=========================================
*/

/**
 * Operationのtargetを検証する。
 *
 * @param {Object} target
 * @param {string} label
 */
function ExecutionPlanContract_validateTarget(
  target,
  label
) {

  ExecutionPlanContract_assertObject(
    target,
    label
  );


  ExecutionPlanContract_assertEqual(
    target.repository,
    "spreadsheet",
    label +
    ".repository"
  );


  ExecutionPlanContract_assertNonEmptyString(
    target.sheetName,
    label +
    ".sheetName"
  );


  ExecutionPlanContract_assertNonEmptyString(
    target.entityType,
    label +
    ".entityType"
  );


  if (
    target.entityId !==
      null
  ) {

    ExecutionPlanContract_assertNonEmptyString(
      target.entityId,
      label +
      ".entityId"
    );

  }

}


/*
=========================================
Payload
=========================================
*/

/**
 * Operationのpayloadを検証する。
 *
 * operationTypeによって
 * valuesとcriteriaの必須条件が異なる。
 *
 * @param {Object} payload
 * @param {string} operationType
 * @param {string} label
 */
function ExecutionPlanContract_validatePayload(
  payload,
  operationType,
  label
) {

  ExecutionPlanContract_assertObject(
    payload,
    label
  );


  if (
    operationType ===
      EXECUTION_PLAN_OPERATION_INSERT ||
    operationType ===
      EXECUTION_PLAN_OPERATION_APPEND
  ) {

    ExecutionPlanContract_assertObject(
      payload.values,
      label +
      ".values"
    );


    if (
      payload.criteria !==
        null
    ) {

      ExecutionPlanContract_assertObject(
        payload.criteria,
        label +
        ".criteria"
      );

    }


    return;

  }


  if (
    operationType ===
      EXECUTION_PLAN_OPERATION_UPDATE
  ) {

    ExecutionPlanContract_assertObject(
      payload.values,
      label +
      ".values"
    );


    ExecutionPlanContract_assertObject(
      payload.criteria,
      label +
      ".criteria"
    );


    if (
      Object.keys(
        payload.criteria
      ).length ===
        0
    ) {

      throw new Error(
        label +
        ".criteriaは空にできません。"
      );

    }


    return;

  }


  if (
    operationType ===
      EXECUTION_PLAN_OPERATION_DELETE
  ) {

    if (
      payload.values !==
        null
    ) {

      throw new Error(
        label +
        ".valuesはdeleteではnullである必要があります。"
      );

    }


    ExecutionPlanContract_assertObject(
      payload.criteria,
      label +
      ".criteria"
    );


    if (
      Object.keys(
        payload.criteria
      ).length ===
        0
    ) {

      throw new Error(
        label +
        ".criteriaは空にできません。"
      );

    }

  }

}


/*
=========================================
Rollback
=========================================
*/

/**
 * rollback情報を検証する。
 *
 * @param {Object} rollback
 * @param {string} label
 */
function ExecutionPlanContract_validateRollback(
  rollback,
  label
) {

  ExecutionPlanContract_assertObject(
    rollback,
    label
  );


  ExecutionPlanContract_assertBoolean(
    rollback.supported,
    label +
    ".supported"
  );


  if (
    rollback.supported ===
      true
  ) {

    ExecutionPlanContract_validateOperationType(
      rollback.operationType,
      label +
      ".operationType"
    );


    ExecutionPlanContract_assertObject(
      rollback.payload,
      label +
      ".payload"
    );

  } else {

    if (
      rollback.operationType !==
        null
    ) {

      throw new Error(
        label +
        ".operationTypeはrollback未対応時にはnullである必要があります。"
      );

    }


    if (
      rollback.payload !==
        null
    ) {

      throw new Error(
        label +
        ".payloadはrollback未対応時にはnullである必要があります。"
      );

    }

  }

}


/*
=========================================
Execution Policy
=========================================
*/

/**
 * executionPolicyを検証する。
 *
 * @param {Object} executionPolicy
 */
function ExecutionPlanContract_validateExecutionPolicy(
  executionPolicy
) {

  ExecutionPlanContract_assertObject(
    executionPolicy,
    "executionPlan.executionPolicy"
  );


  ExecutionPlanContract_assertBoolean(
    executionPolicy.atomic,
    "executionPlan.executionPolicy.atomic"
  );


  ExecutionPlanContract_assertBoolean(
    executionPolicy.stopOnError,
    "executionPlan.executionPolicy.stopOnError"
  );


  ExecutionPlanContract_assertBoolean(
    executionPolicy.rollbackRequired,
    "executionPlan.executionPolicy.rollbackRequired"
  );


  if (
    executionPolicy.atomic ===
      true &&
    executionPolicy.stopOnError !==
      true
  ) {

    throw new Error(
      "atomic=trueの場合、stopOnError=trueである必要があります。"
    );

  }

}


/*
=========================================
Executable Consistency
=========================================
*/

/**
 * statusとexecutableの整合性を検証する。
 *
 * @param {Object} executionPlan
 */
function ExecutionPlanContract_validateExecutableConsistency(
  executionPlan
) {

  if (
    executionPlan.status ===
      EXECUTION_PLAN_STATUS_READY &&
    executionPlan.executable !==
      true
  ) {

    throw new Error(
      "ready_for_executionのExecution Planはexecutable=trueである必要があります。"
    );

  }


  if (
    executionPlan.status ===
      EXECUTION_PLAN_STATUS_DRAFT &&
    executionPlan.executable !==
      false
  ) {

    throw new Error(
      "draftのExecution Planはexecutable=falseである必要があります。"
    );

  }


  if (
    executionPlan.status ===
      EXECUTION_PLAN_STATUS_COMPLETED &&
    executionPlan.executable !==
      false
  ) {

    throw new Error(
      "completedのExecution Planはexecutable=falseである必要があります。"
    );

  }


  if (
    executionPlan.status ===
      EXECUTION_PLAN_STATUS_FAILED &&
    executionPlan.executable !==
      false
  ) {

    throw new Error(
      "failedのExecution Planはexecutable=falseである必要があります。"
    );

  }

}


/*
=========================================
Metadata
=========================================
*/

/**
 * Execution Planのmetadataを検証する。
 *
 * @param {Object} metadata
 */
function ExecutionPlanContract_validateMetadata(
  metadata
) {

  ExecutionPlanContract_assertObject(
    metadata,
    "executionPlan.metadata"
  );


  if (
    metadata.source !==
      null
  ) {

    ExecutionPlanContract_assertNonEmptyString(
      metadata.source,
      "executionPlan.metadata.source"
    );

  }


  if (
    metadata.requestId !==
      null
  ) {

    ExecutionPlanContract_assertNonEmptyString(
      metadata.requestId,
      "executionPlan.metadata.requestId"
    );

  }


  if (
    metadata.correlationId !==
      null
  ) {

    ExecutionPlanContract_assertNonEmptyString(
      metadata.correlationId,
      "executionPlan.metadata.correlationId"
    );

  }

}


/**
 * Operationのmetadataを検証する。
 *
 * @param {Object} metadata
 * @param {string} label
 */
function ExecutionPlanContract_validateOperationMetadata(
  metadata,
  label
) {

  ExecutionPlanContract_assertObject(
    metadata,
    label
  );


  if (
    metadata.description !==
      null
  ) {

    ExecutionPlanContract_assertNonEmptyString(
      metadata.description,
      label +
      ".description"
    );

  }


  if (
    metadata.sourcePath !==
      null
  ) {

    ExecutionPlanContract_assertNonEmptyString(
      metadata.sourcePath,
      label +
      ".sourcePath"
    );

  }

}


/*
=========================================
Assertion
=========================================
*/

function ExecutionPlanContract_assertObject(
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


function ExecutionPlanContract_assertNonEmptyString(
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


function ExecutionPlanContract_assertBoolean(
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


function ExecutionPlanContract_assertPositiveInteger(
  value,
  label
) {

  if (
    !Number.isInteger(
      value
    ) ||
    value <=
      0
  ) {

    throw new Error(
      label +
      "は1以上の整数である必要があります。"
    );

  }

}


function ExecutionPlanContract_assertEqual(
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
      "が不正です。expected=" +
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


