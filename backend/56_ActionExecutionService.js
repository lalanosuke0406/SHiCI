/*
=========================================
SHiCI
56_ActionExecutionService.js

Action Execution Service
Version 1.0

役割：
・ActionRouterから実行要求を受け取る
・実行要求の入力を検証する
・ExecutionControllerへ実行を委譲する
・Action Resultを生成して返す

禁止：
・Spreadsheetを直接操作しない
・Execution Planを生成しない
・Operationを生成しない
・Runtime Bindingを解決しない
・TransactionやRollbackを直接実行しない
・ユーザー向け自然言語を生成しない
・LLMを呼び出さない

依存方向：
ActionRouter
    ↓
ActionExecutionService
    ↓
ExecutionController
=========================================
*/


/*
=========================================
Action Type
=========================================
*/

const ACTION_EXECUTION_SERVICE_ACTION_CONFIRM =
  "confirm_execution_proposal";


/*
=========================================
Action Result Status
=========================================
*/

const ACTION_EXECUTION_SERVICE_STATUS_COMPLETED =
  "completed";

const ACTION_EXECUTION_SERVICE_STATUS_REJECTED =
  "rejected";


/*
=========================================
Public API
=========================================
*/

/**
 * Execution Actionを実行する。
 *
 * @param {Object} actionRequest
 * @return {Object}
 */
function ActionExecutionService_execute(
  actionRequest
) {

  ActionExecutionService_validateRequest(
    actionRequest
  );


  const normalizedRequest =
    ActionExecutionService_normalizeRequest(
      actionRequest
    );


  if (
    normalizedRequest.actionType ===
      ACTION_EXECUTION_SERVICE_ACTION_CONFIRM
  ) {

    return ActionExecutionService_executeConfirmation(
      normalizedRequest
    );

  }


  throw new Error(
    "未対応のAction Execution Service actionTypeです。" +
    " actionType=" +
    normalizedRequest.actionType
  );

}


/*
=========================================
Confirmation Execution
=========================================
*/

/**
 * Confirmation Proposalの確定と
 * Execution Layerの実行を行う。
 *
 * @param {Object} actionRequest
 * @return {Object}
 */
function ActionExecutionService_executeConfirmation(
  actionRequest
) {

  ActionExecutionService_validateNormalizedRequest(
    actionRequest
  );


  const executionControllerResult =
    ExecutionController_confirmAndExecute(
      actionRequest.proposalId,
      actionRequest.changePlanId,
      actionRequest.metadata
    );


  ExecutionController_validateResult(
    executionControllerResult
  );


  const actionResult =
    ActionExecutionService_buildCompletedResult(
      actionRequest,
      executionControllerResult
    );


  ActionExecutionService_validateResult(
    actionResult
  );


  return actionResult;

}


/*
=========================================
Request Validation
=========================================
*/

/**
 * Action Requestの入力を検証する。
 *
 * @param {Object} actionRequest
 */
function ActionExecutionService_validateRequest(
  actionRequest
) {

  ActionExecutionService_assertObject(
    actionRequest,
    "actionRequest"
  );


  ActionExecutionService_requireNonEmptyString(
    actionRequest.actionType,
    "actionRequest.actionType"
  );


  ActionExecutionService_requireNonEmptyString(
    actionRequest.proposalId,
    "actionRequest.proposalId"
  );


  ActionExecutionService_requireNonEmptyString(
    actionRequest.changePlanId,
    "actionRequest.changePlanId"
  );


  if (
    actionRequest.metadata !==
      null &&
    actionRequest.metadata !==
      undefined
  ) {

    ActionExecutionService_assertObject(
      actionRequest.metadata,
      "actionRequest.metadata"
    );

  }

}


/**
 * 正規化後のAction Requestを検証する。
 *
 * @param {Object} actionRequest
 */
function ActionExecutionService_validateNormalizedRequest(
  actionRequest
) {

  ActionExecutionService_assertObject(
    actionRequest,
    "actionRequest"
  );


  if (
    actionRequest.actionType !==
      ACTION_EXECUTION_SERVICE_ACTION_CONFIRM
  ) {

    throw new Error(
      "Confirmation実行にはactionType=" +
      ACTION_EXECUTION_SERVICE_ACTION_CONFIRM +
      "が必要です。"
    );

  }


  ActionExecutionService_requireNonEmptyString(
    actionRequest.proposalId,
    "actionRequest.proposalId"
  );


  ActionExecutionService_requireNonEmptyString(
    actionRequest.changePlanId,
    "actionRequest.changePlanId"
  );


  ActionExecutionService_assertObject(
    actionRequest.metadata,
    "actionRequest.metadata"
  );

}


/*
=========================================
Request Normalization
=========================================
*/

/**
 * Action Requestを正規化する。
 *
 * 入力原本は変更しない。
 *
 * @param {Object} actionRequest
 * @return {Object}
 */
function ActionExecutionService_normalizeRequest(
  actionRequest
) {

  ActionExecutionService_validateRequest(
    actionRequest
  );


  return {

    actionType:
      ActionExecutionService_requireNonEmptyString(
        actionRequest.actionType,
        "actionRequest.actionType"
      ),

    proposalId:
      ActionExecutionService_requireNonEmptyString(
        actionRequest.proposalId,
        "actionRequest.proposalId"
      ),

    changePlanId:
      ActionExecutionService_requireNonEmptyString(
        actionRequest.changePlanId,
        "actionRequest.changePlanId"
      ),

    metadata:
      actionRequest.metadata ===
        null ||
      actionRequest.metadata ===
        undefined
        ? {}
        : ActionExecutionService_deepCopy(
            actionRequest.metadata
          )

  };

}


/*
=========================================
Action Result
=========================================
*/

/**
 * 正常完了したAction Resultを生成する。
 *
 * @param {Object} actionRequest
 * @param {Object} executionControllerResult
 * @return {Object}
 */
function ActionExecutionService_buildCompletedResult(
  actionRequest,
  executionControllerResult
) {

  ActionExecutionService_validateNormalizedRequest(
    actionRequest
  );


  ActionExecutionService_assertObject(
    executionControllerResult,
    "executionControllerResult"
  );


  return {

    schemaVersion:
      "1.0",

    serviceVersion:
      "1.0",

    actionType:
      actionRequest.actionType,

    status:
      ACTION_EXECUTION_SERVICE_STATUS_COMPLETED,

    proposalId:
      executionControllerResult.proposalId,

    changePlanId:
      executionControllerResult.changePlanId,

    executionPlanId:
      executionControllerResult.executionPlanId,

    executionResultId:
      executionControllerResult.executionResultId,

    executionStatus:
      executionControllerResult
        .executionResult
        .status,

    controllerResult:
      ActionExecutionService_deepCopy(
        executionControllerResult
      ),

    metadata: {

      requestId:
        ActionExecutionService_resolveMetadataString(
          actionRequest.metadata,
          "requestId"
        ),

      requestedBy:
        ActionExecutionService_resolveRequestedBy(
          actionRequest.metadata
        ),

      source:
        ActionExecutionService_resolveMetadataString(
          actionRequest.metadata,
          "source"
        )

    }

  };

}


/**
 * Action Resultを検証する。
 *
 * @param {Object} actionResult
 * @return {boolean}
 */
function ActionExecutionService_validateResult(
  actionResult
) {

  ActionExecutionService_assertObject(
    actionResult,
    "actionResult"
  );


  if (
    actionResult.schemaVersion !==
      "1.0"
  ) {

    throw new Error(
      "Action ResultのschemaVersionが不正です。"
    );

  }


  if (
    actionResult.serviceVersion !==
      "1.0"
  ) {

    throw new Error(
      "Action ResultのserviceVersionが不正です。"
    );

  }


  if (
    actionResult.actionType !==
      ACTION_EXECUTION_SERVICE_ACTION_CONFIRM
  ) {

    throw new Error(
      "Action ResultのactionTypeが不正です。"
    );

  }


  if (
    actionResult.status !==
      ACTION_EXECUTION_SERVICE_STATUS_COMPLETED
  ) {

    throw new Error(
      "Action Resultのstatusはcompletedである必要があります。"
    );

  }


  ActionExecutionService_requireNonEmptyString(
    actionResult.proposalId,
    "actionResult.proposalId"
  );


  ActionExecutionService_requireNonEmptyString(
    actionResult.changePlanId,
    "actionResult.changePlanId"
  );


  ActionExecutionService_requireNonEmptyString(
    actionResult.executionPlanId,
    "actionResult.executionPlanId"
  );


  ActionExecutionService_requireNonEmptyString(
    actionResult.executionResultId,
    "actionResult.executionResultId"
  );


  const supportedExecutionStatuses = [

    EXECUTION_RESULT_STATUS_SUCCESS,

    EXECUTION_RESULT_STATUS_FAILED,

    EXECUTION_RESULT_STATUS_ROLLED_BACK,

    EXECUTION_RESULT_STATUS_PARTIAL

  ];


  if (
    supportedExecutionStatuses.indexOf(
      actionResult.executionStatus
    ) ===
      -1
  ) {

    throw new Error(
      "Action ResultのexecutionStatusが不正です。" +
      " executionStatus=" +
      String(
        actionResult.executionStatus
      )
    );

  }


  ActionExecutionService_assertObject(
    actionResult.controllerResult,
    "actionResult.controllerResult"
  );


  ExecutionController_validateResult(
    actionResult.controllerResult
  );


  if (
    actionResult.proposalId !==
      actionResult.controllerResult.proposalId
  ) {

    throw new Error(
      "Action ResultのproposalIdがController Resultと一致しません。"
    );

  }


  if (
    actionResult.changePlanId !==
      actionResult.controllerResult.changePlanId
  ) {

    throw new Error(
      "Action ResultのchangePlanIdがController Resultと一致しません。"
    );

  }


  if (
    actionResult.executionPlanId !==
      actionResult.controllerResult.executionPlanId
  ) {

    throw new Error(
      "Action ResultのexecutionPlanIdがController Resultと一致しません。"
    );

  }


  if (
    actionResult.executionResultId !==
      actionResult.controllerResult.executionResultId
  ) {

    throw new Error(
      "Action ResultのexecutionResultIdがController Resultと一致しません。"
    );

  }


  if (
    actionResult.executionStatus !==
      actionResult
        .controllerResult
        .executionResult
        .status
  ) {

    throw new Error(
      "Action ResultのexecutionStatusがExecution Resultと一致しません。"
    );

  }


  ActionExecutionService_assertObject(
    actionResult.metadata,
    "actionResult.metadata"
  );


  return true;

}


/*
=========================================
Metadata
=========================================
*/

/**
 * Metadata内のstringを取得する。
 *
 * @param {Object} metadata
 * @param {string} key
 * @return {string|null}
 */
function ActionExecutionService_resolveMetadataString(
  metadata,
  key
) {

  ActionExecutionService_assertObject(
    metadata,
    "metadata"
  );


  const value =
    metadata[
      key
    ];


  if (
    typeof value !==
      "string"
  ) {

    return null;

  }


  const normalizedValue =
    value.trim();


  return normalizedValue ===
    ""
    ? null
    : normalizedValue;

}


/**
 * 実行要求者をMetadataから取得する。
 *
 * requestedByが存在すれば優先し、
 * 存在しなければdecidedByを使用する。
 *
 * @param {Object} metadata
 * @return {string|null}
 */
function ActionExecutionService_resolveRequestedBy(
  metadata
) {

  const requestedBy =
    ActionExecutionService_resolveMetadataString(
      metadata,
      "requestedBy"
    );


  if (
    requestedBy !==
      null
  ) {

    return requestedBy;

  }


  return ActionExecutionService_resolveMetadataString(
    metadata,
    "decidedBy"
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
function ActionExecutionService_deepCopy(
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
function ActionExecutionService_assertObject(
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
function ActionExecutionService_requireNonEmptyString(
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