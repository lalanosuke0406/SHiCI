/*
=========================================
SHiCI
55_ExecutionController.js

Execution Controller
Version 1.0

役割：
・Confirmation Executionから
  Execution Plan生成とTransaction実行までを束ねる
・Execution Layerの単一入口を提供する
・Controller Resultを返す

禁止：
・Spreadsheetを直接操作しない
・Operationを生成しない
・Runtime Bindingを解決しない
・Rollbackを直接実行しない
・ユーザー向け文章を生成しない
・認証や権限判定を行わない
・LLMを呼び出さない

依存方向：
ActionRouter
    ↓
ExecutionController
    ↓
ConfirmationExecutionEngine
    ↓
ExecutionPlanEngine
    ↓
SpreadsheetTransactionEngine
=========================================
*/


/*
=========================================
Controller Status
=========================================
*/

const EXECUTION_CONTROLLER_STATUS_COMPLETED =
  "completed";


/*
=========================================
Public API
=========================================
*/

/**
 * Confirmation Proposalを確定し、
 * Execution Plan生成からTransaction実行までを行う。
 *
 * @param {string} proposalId
 * @param {string} changePlanId
 * @param {Object|null} metadata
 * @return {Object}
 */
function ExecutionController_confirmAndExecute(
  proposalId,
  changePlanId,
  metadata
) {

  const normalizedProposalId =
    ExecutionController_requireNonEmptyString(
      proposalId,
      "proposalId"
    );


  const normalizedChangePlanId =
    ExecutionController_requireNonEmptyString(
      changePlanId,
      "changePlanId"
    );


  const normalizedMetadata =
    ExecutionController_normalizeMetadata(
      metadata
    );


  /*
  =========================================
  Confirmation Execution
  =========================================
  */

  const confirmationExecution =
    ConfirmationExecutionEngine_confirm(
      normalizedProposalId,
      normalizedChangePlanId,
      normalizedMetadata
    );


  ExecutionController_validateConfirmationExecution(
    confirmationExecution,
    normalizedProposalId,
    normalizedChangePlanId
  );


  /*
  =========================================
  Execution Plan
  =========================================
  */

  const executionPlan =
    ExecutionPlanEngine_build(
      confirmationExecution
    );


  ExecutionController_validateExecutionPlan(
    executionPlan,
    confirmationExecution
  );


  /*
  =========================================
  Spreadsheet Transaction
  =========================================
  */

  const executionResult =
    SpreadsheetTransactionEngine_execute(
      executionPlan
    );


  ExecutionController_validateExecutionResult(
    executionResult,
    executionPlan
  );


  /*
  =========================================
  Controller Result
  =========================================
  */

  const controllerResult =
    ExecutionController_buildResult(
      confirmationExecution,
      executionPlan,
      executionResult
    );


  ExecutionController_validateResult(
    controllerResult
  );


  return controllerResult;

}


/*
=========================================
Confirmation Execution Validation
=========================================
*/

/**
 * Confirmation Execution Resultを検証する。
 *
 * @param {Object} confirmationExecution
 * @param {string} expectedProposalId
 * @param {string} expectedChangePlanId
 */
function ExecutionController_validateConfirmationExecution(
  confirmationExecution,
  expectedProposalId,
  expectedChangePlanId
) {

  ExecutionController_assertObject(
    confirmationExecution,
    "confirmationExecution"
  );


  ConfirmationExecutionEngine_validateConfirmedResult(
    confirmationExecution
  );


  if (
    confirmationExecution.status !==
      "confirmed"
  ) {

    throw new Error(
      "ExecutionControllerで処理するには、" +
      "Confirmation Executionがconfirmedである必要があります。"
    );

  }


  if (
    confirmationExecution.actionType !==
      "confirm"
  ) {

    throw new Error(
      "ExecutionControllerで処理するには、" +
      "Confirmation ExecutionのactionTypeがconfirmである必要があります。"
    );

  }


  if (
    confirmationExecution.proposalId !==
      expectedProposalId
  ) {

    throw new Error(
      "Confirmation ExecutionのproposalIdが一致しません。"
    );

  }


  if (
    confirmationExecution.changePlanId !==
      expectedChangePlanId
  ) {

    throw new Error(
      "Confirmation ExecutionのchangePlanIdが一致しません。"
    );

  }


  ExecutionController_assertObject(
    confirmationExecution.changePlan,
    "confirmationExecution.changePlan"
  );


  ChangePlanContract_validate(
    confirmationExecution.changePlan
  );

}





/*
=========================================
Execution Plan Validation
=========================================
*/

/**
 * ExecutionPlanEngineが生成した
 * Execution Planを検証する。
 *
 * @param {Object} executionPlan
 * @param {Object} confirmationExecution
 */
function ExecutionController_validateExecutionPlan(
  executionPlan,
  confirmationExecution
) {

  ExecutionController_assertObject(
    executionPlan,
    "executionPlan"
  );


  ExecutionController_assertObject(
    confirmationExecution,
    "confirmationExecution"
  );


  ExecutionPlanContract_validate(
    executionPlan
  );


  if (
    executionPlan.status !==
      EXECUTION_PLAN_STATUS_READY
  ) {

    throw new Error(
      "ExecutionControllerで実行するExecution Planは" +
      "ready_for_executionである必要があります。"
    );

  }


  if (
    executionPlan.executable !==
      true
  ) {

    throw new Error(
      "ExecutionControllerで実行するExecution Planは" +
      "executable=trueである必要があります。"
    );

  }


  if (
    executionPlan.changePlanId !==
      confirmationExecution.changePlanId
  ) {

    throw new Error(
      "Execution PlanとConfirmation Executionの" +
      "changePlanIdが一致しません。"
    );

  }


  if (
    executionPlan.proposalId !==
      confirmationExecution.proposalId
  ) {

    throw new Error(
      "Execution PlanとConfirmation Executionの" +
      "proposalIdが一致しません。"
    );

  }

}



/*
=========================================
Execution Result Validation
=========================================
*/

/**
 * SpreadsheetTransactionEngineが返した
 * Execution Resultを検証する。
 *
 * @param {Object} executionResult
 * @param {Object} executionPlan
 */
function ExecutionController_validateExecutionResult(
  executionResult,
  executionPlan
) {

  ExecutionController_assertObject(
    executionResult,
    "executionResult"
  );


  ExecutionController_assertObject(
    executionPlan,
    "executionPlan"
  );


  ExecutionResultContract_validate(
    executionResult
  );


  if (
    executionResult.executionPlanId !==
      executionPlan.executionPlanId
  ) {

    throw new Error(
      "Execution ResultとExecution Planの" +
      "executionPlanIdが一致しません。"
    );

  }


  const supportedStatuses = [

    EXECUTION_RESULT_STATUS_SUCCESS,

    EXECUTION_RESULT_STATUS_FAILED,

    EXECUTION_RESULT_STATUS_ROLLED_BACK,

    EXECUTION_RESULT_STATUS_PARTIAL

  ];


  if (
    supportedStatuses.indexOf(
      executionResult.status
    ) ===
      -1
  ) {

    throw new Error(
      "ExecutionControllerで未対応のExecution Result statusです。" +
      " status=" +
      String(
        executionResult.status
      )
    );

  }

}




/*
=========================================
Controller Result
=========================================
*/

/**
 * Controller Resultを組み立てる。
 *
 * confirmationExecutionは、
 * Controllerで必要な項目だけを抜き出す。
 *
 * @param {Object} confirmationExecution
 * @param {Object} executionPlan
 * @param {Object} executionResult
 * @return {Object}
 */
function ExecutionController_buildResult(
  confirmationExecution,
  executionPlan,
  executionResult
) {

  ExecutionController_assertObject(
    confirmationExecution,
    "confirmationExecution"
  );


  ExecutionController_assertObject(
    executionPlan,
    "executionPlan"
  );


  ExecutionController_assertObject(
    executionResult,
    "executionResult"
  );


  return {

    schemaVersion:
      "1.0",

    controllerVersion:
      "1.0",

    status:
      EXECUTION_CONTROLLER_STATUS_COMPLETED,

    proposalId:
      confirmationExecution.proposalId,

    changePlanId:
      confirmationExecution.changePlanId,

    executionPlanId:
      executionPlan.executionPlanId,

    executionResultId:
      executionResult.executionResultId,

    confirmationExecution: {

      status:
        confirmationExecution.status,

      actionType:
        confirmationExecution.actionType,

      decidedAt:
        confirmationExecution.decidedAt,

      decidedBy:
        ExecutionController_resolveDecidedBy(
          confirmationExecution
        )

    },

    executionResult:
      ExecutionController_deepCopy(
        executionResult
      )

  };

}




/**
 * Confirmation Executionから
 * decidedByを取得する。
 *
 * 値が存在しない場合はnullを返す。
 *
 * @param {Object} confirmationExecution
 * @return {string|null}
 */
function ExecutionController_resolveDecidedBy(
  confirmationExecution
) {

  ExecutionController_assertObject(
    confirmationExecution,
    "confirmationExecution"
  );


  const decidedBy =
    confirmationExecution.metadata &&
    typeof confirmationExecution
      .metadata
      .decidedBy ===
        "string"
      ? confirmationExecution
          .metadata
          .decidedBy
          .trim()
      : "";


  return decidedBy ||
    null;

}



/*
=========================================
Controller Result Validation
=========================================
*/

/**
 * Controller Result全体を検証する。
 *
 * @param {Object} controllerResult
 * @return {boolean}
 */
function ExecutionController_validateResult(
  controllerResult
) {

  ExecutionController_assertObject(
    controllerResult,
    "controllerResult"
  );


  if (
    controllerResult.schemaVersion !==
      "1.0"
  ) {

    throw new Error(
      "Controller ResultのschemaVersionが不正です。"
    );

  }


  if (
    controllerResult.controllerVersion !==
      "1.0"
  ) {

    throw new Error(
      "Controller ResultのcontrollerVersionが不正です。"
    );

  }


  if (
    controllerResult.status !==
      EXECUTION_CONTROLLER_STATUS_COMPLETED
  ) {

    throw new Error(
      "Controller Resultのstatusはcompletedである必要があります。"
    );

  }


  ExecutionController_requireNonEmptyString(
    controllerResult.proposalId,
    "controllerResult.proposalId"
  );


  ExecutionController_requireNonEmptyString(
    controllerResult.changePlanId,
    "controllerResult.changePlanId"
  );


  ExecutionController_requireNonEmptyString(
    controllerResult.executionPlanId,
    "controllerResult.executionPlanId"
  );


  ExecutionController_requireNonEmptyString(
    controllerResult.executionResultId,
    "controllerResult.executionResultId"
  );


  ExecutionController_assertObject(
    controllerResult.confirmationExecution,
    "controllerResult.confirmationExecution"
  );


  if (
    controllerResult.confirmationExecution.status !==
      "confirmed"
  ) {

    throw new Error(
      "controllerResult.confirmationExecution.statusは" +
      "confirmedである必要があります。"
    );

  }


  if (
    controllerResult.confirmationExecution.actionType !==
      "confirm"
  ) {

    throw new Error(
      "controllerResult.confirmationExecution.actionTypeは" +
      "confirmである必要があります。"
    );

  }


  ExecutionController_requireNonEmptyString(
    controllerResult
      .confirmationExecution
      .decidedAt,
    "controllerResult.confirmationExecution.decidedAt"
  );


  if (
    controllerResult
      .confirmationExecution
      .decidedBy !==
        null
  ) {

    ExecutionController_requireNonEmptyString(
      controllerResult
        .confirmationExecution
        .decidedBy,
      "controllerResult.confirmationExecution.decidedBy"
    );

  }


  ExecutionController_assertObject(
    controllerResult.executionResult,
    "controllerResult.executionResult"
  );


  ExecutionResultContract_validate(
    controllerResult.executionResult
  );


  if (
    controllerResult.executionResultId !==
      controllerResult
        .executionResult
        .executionResultId
  ) {

    throw new Error(
      "Controller ResultのexecutionResultIdが一致しません。"
    );

  }


  if (
    controllerResult.executionPlanId !==
      controllerResult
        .executionResult
        .executionPlanId
  ) {

    throw new Error(
      "Controller ResultのexecutionPlanIdが一致しません。"
    );

  }


  return true;

}









/*
=========================================
Metadata
=========================================
*/

/**
 * Controllerへ渡されたMetadataを正規化する。
 *
 * nullまたはundefinedの場合は空Objectへ変換する。
 * 原本は変更しない。
 *
 * @param {Object|null|undefined} metadata
 * @return {Object}
 */
function ExecutionController_normalizeMetadata(
  metadata
) {

  if (
    metadata ===
      null ||
    metadata ===
      undefined
  ) {

    return {};

  }


  ExecutionController_assertObject(
    metadata,
    "metadata"
  );


  return ExecutionController_deepCopy(
    metadata
  );

}


/*
=========================================
Utility
=========================================
*/

/**
 * JSON互換値をDeep Copyする。
 *
 * @param {*} value
 * @return {*}
 */
function ExecutionController_deepCopy(
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
Assertion
=========================================
*/

/**
 * Objectであることを確認する。
 *
 * @param {*} value
 * @param {string} label
 */
function ExecutionController_assertObject(
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
function ExecutionController_requireNonEmptyString(
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