/*
=========================================
SHiCI
46_ConfirmationExecutionEngine.js

Confirmation Execution Engine
Version 1.0

役割：
・ユーザーの確認操作を受け付ける
・Pending Change Storeから原本を取得する
・proposalIdとchangePlanIdを照合する
・confirmまたはrejectの操作を検証する
・確認待ちデータを一度だけ消費する
・後続処理へ安全なChange Planを渡す

重要：
・このEngineはSpreadsheetを更新しない
・このEngineはExecution Planを生成しない
・このEngineはChange Planを実行しない
・フロントエンドから業務値を受け取らない
・フロントエンドから送られた変更内容を信用しない

入力として信用するもの：
・proposalId
・changePlanId
・actionType

実際の変更内容は、
Pending Change Store内の原本を使用する。
=========================================
*/


/*
=========================================
定数
=========================================
*/

const CONFIRMATION_EXECUTION_ENGINE_VERSION =
  "1.0";


const CONFIRMATION_EXECUTION_ACTION_CONFIRM =
  "confirm";


const CONFIRMATION_EXECUTION_ACTION_REJECT =
  "reject";


/*
=========================================
Public API
=========================================
*/

/**
 * 確認操作を処理する。
 *
 * actionType：
 * ・confirm
 * ・reject
 *
 * @param {string} proposalId
 * @param {string} changePlanId
 * @param {string} actionType
 * @param {Object=} metadata
 * @return {Object}
 */
function ConfirmationExecutionEngine_execute(
  proposalId,
  changePlanId,
  actionType,
  metadata
) {

  ConfirmationExecutionEngine_validateRequest(
    proposalId,
    changePlanId,
    actionType,
    metadata
  );


  const lock =
    ConfirmationExecutionEngine_getLock();


  /*
   * 同一Proposalに対する二重操作を防ぐ。
   *
   * confirmボタンの連打や、
   * confirmとrejectの同時送信を防止する。
   */
  lock.waitLock(
    30000
  );


  try {

    const entry =
      PendingChangeStore_get(
        proposalId,
        changePlanId
      );


    ConfirmationExecutionEngine_validatePendingEntry(
      entry,
      actionType
    );


    const result =
      actionType ===
        CONFIRMATION_EXECUTION_ACTION_CONFIRM
        ? ConfirmationExecutionEngine_buildConfirmedResult(
            entry,
            metadata
          )
        : ConfirmationExecutionEngine_buildRejectedResult(
            entry,
            metadata
          );


    /*
     * 結果生成後に確認待ちデータを削除する。
     *
     * これにより同じProposalは
     * 二度処理できなくなる。
     */
    PendingChangeStore_remove(
      proposalId,
      changePlanId
    );


    return result;

  } finally {

    lock.releaseLock();

  }

}


/**
 * confirm操作を処理する。
 *
 * @param {string} proposalId
 * @param {string} changePlanId
 * @param {Object=} metadata
 * @return {Object}
 */
function ConfirmationExecutionEngine_confirm(
  proposalId,
  changePlanId,
  metadata
) {

  return ConfirmationExecutionEngine_execute(
    proposalId,
    changePlanId,
    CONFIRMATION_EXECUTION_ACTION_CONFIRM,
    metadata
  );

}


/**
 * reject操作を処理する。
 *
 * @param {string} proposalId
 * @param {string} changePlanId
 * @param {Object=} metadata
 * @return {Object}
 */
function ConfirmationExecutionEngine_reject(
  proposalId,
  changePlanId,
  metadata
) {

  return ConfirmationExecutionEngine_execute(
    proposalId,
    changePlanId,
    CONFIRMATION_EXECUTION_ACTION_REJECT,
    metadata
  );

}


/*
=========================================
Request Validation
=========================================
*/

/**
 * 確認操作リクエストを検証する。
 *
 * @param {string} proposalId
 * @param {string} changePlanId
 * @param {string} actionType
 * @param {Object=} metadata
 */
function ConfirmationExecutionEngine_validateRequest(
  proposalId,
  changePlanId,
  actionType,
  metadata
) {

  ConfirmationExecutionEngine_assertNonEmptyString(
    proposalId,
    "proposalId"
  );


  ConfirmationExecutionEngine_assertNonEmptyString(
    changePlanId,
    "changePlanId"
  );


  ConfirmationExecutionEngine_assertNonEmptyString(
    actionType,
    "actionType"
  );


  const supportedActions = [
    CONFIRMATION_EXECUTION_ACTION_CONFIRM,
    CONFIRMATION_EXECUTION_ACTION_REJECT
  ];


  if (
    supportedActions.indexOf(
      actionType
    ) ===
      -1
  ) {

    throw new Error(
      "未対応の確認操作です。actionType=" +
      actionType
    );

  }


  if (
    metadata !==
      undefined &&
    metadata !==
      null
  ) {

    ConfirmationExecutionEngine_assertObject(
      metadata,
      "metadata"
    );

  }

}


/*
=========================================
Pending Entry Validation
=========================================
*/

/**
 * Storeから取得したEntryを
 * 確認操作の直前に再検証する。
 *
 * @param {Object} entry
 * @param {string} actionType
 */
function ConfirmationExecutionEngine_validatePendingEntry(
  entry,
  actionType
) {

  ConfirmationExecutionEngine_assertObject(
    entry,
    "entry"
  );


  PendingChangeStore_validateEntry(
    entry
  );


  if (
    entry.status !==
      "pending"
  ) {

    throw new Error(
      "確認対象はpending状態である必要があります。"
    );

  }


  const changePlan =
    entry.changePlan;


  const proposal =
    entry.proposal;


  ChangePlanContract_validate(
    changePlan
  );


  ConfirmationProposalContract_validate(
    proposal
  );


  if (
    changePlan.status !==
      "ready_for_confirmation"
  ) {

    throw new Error(
      "Change Planはready_for_confirmationである必要があります。"
    );

  }


  if (
    !changePlan.confirmation ||
    changePlan.confirmation.required !==
      true
  ) {

    throw new Error(
      "Change Planには確認要求が必要です。"
    );

  }


  if (
    changePlan.confirmation.status !==
      "pending"
  ) {

    throw new Error(
      "Change Planのconfirmation.statusはpendingである必要があります。"
    );

  }


  if (
    changePlan.executable !==
      false
  ) {

    throw new Error(
      "確認前のChange Planはexecutable=falseである必要があります。"
    );

  }


  if (
    proposal.status !==
      "pending"
  ) {

    throw new Error(
      "Confirmation Proposalはpending状態である必要があります。"
    );

  }


  if (
    proposal.proposalId !==
      entry.proposalId
  ) {

    throw new Error(
      "EntryとProposalのproposalIdが一致しません。"
    );

  }


  if (
    changePlan.changePlanId !==
      entry.changePlanId
  ) {

    throw new Error(
      "EntryとChange PlanのchangePlanIdが一致しません。"
    );

  }


  if (
    proposal.changePlanId !==
      changePlan.changePlanId
  ) {

    throw new Error(
      "ProposalとChange PlanのchangePlanIdが一致しません。"
    );

  }


  const action =
    ConfirmationExecutionEngine_findAction(
      proposal.actions,
      actionType
    );


  if (
    action.enabled !==
      true
  ) {

    throw new Error(
      "指定された確認操作は無効です。actionType=" +
      actionType
    );

  }

}


/*
=========================================
Confirmed Result
=========================================
*/

/**
 * confirm結果を生成する。
 *
 * Change Plan本体は変更せず、
 * 後続のExecution Plan生成へ渡す。
 *
 * @param {Object} entry
 * @param {Object=} metadata
 * @return {Object}
 */
function ConfirmationExecutionEngine_buildConfirmedResult(
  entry,
  metadata
) {

  const decidedAt =
    ConfirmationExecutionEngine_getCurrentTimestamp();


  const result = {

    schemaVersion:
      "1.0",

    engineVersion:
      CONFIRMATION_EXECUTION_ENGINE_VERSION,

    status:
      "confirmed",

    actionType:
      CONFIRMATION_EXECUTION_ACTION_CONFIRM,

    proposalId:
      entry.proposalId,

    changePlanId:
      entry.changePlanId,

    /*
     * 実行内容はフロントエンドの値ではなく、
     * Storeから取得した原本を渡す。
     */
    changePlan:
      ConfirmationExecutionEngine_deepCopy(
        entry.changePlan
      ),

    subject:
      ConfirmationExecutionEngine_deepCopy(
        entry.proposal.subject
      ),

    decidedAt:
      decidedAt,

    metadata:
      ConfirmationExecutionEngine_buildResultMetadata(
        metadata
      )

  };


  ConfirmationExecutionEngine_validateConfirmedResult(
    result
  );


  return result;

}


/**
 * confirmed結果を検証する。
 *
 * @param {Object} result
 */
function ConfirmationExecutionEngine_validateConfirmedResult(
  result
) {

  ConfirmationExecutionEngine_assertObject(
    result,
    "result"
  );


  if (
    result.status !==
      "confirmed"
  ) {

    throw new Error(
      "confirmed結果のstatusが不正です。"
    );

  }


  if (
    result.actionType !==
      CONFIRMATION_EXECUTION_ACTION_CONFIRM
  ) {

    throw new Error(
      "confirmed結果のactionTypeが不正です。"
    );

  }


  ConfirmationExecutionEngine_assertNonEmptyString(
    result.proposalId,
    "result.proposalId"
  );


  ConfirmationExecutionEngine_assertNonEmptyString(
    result.changePlanId,
    "result.changePlanId"
  );


  ConfirmationExecutionEngine_assertObject(
    result.changePlan,
    "result.changePlan"
  );


  ChangePlanContract_validate(
    result.changePlan
  );


  if (
    result.changePlan.changePlanId !==
      result.changePlanId
  ) {

    throw new Error(
      "confirmed結果とChange PlanのchangePlanIdが一致しません。"
    );

  }


  ConfirmationExecutionEngine_assertObject(
    result.subject,
    "result.subject"
  );


  ConfirmationExecutionEngine_assertNonEmptyString(
    result.decidedAt,
    "result.decidedAt"
  );


  ConfirmationExecutionEngine_assertObject(
    result.metadata,
    "result.metadata"
  );

}


/*
=========================================
Rejected Result
=========================================
*/

/**
 * reject結果を生成する。
 *
 * reject時には、後続処理へ
 * Change Plan本体を渡さない。
 *
 * @param {Object} entry
 * @param {Object=} metadata
 * @return {Object}
 */
function ConfirmationExecutionEngine_buildRejectedResult(
  entry,
  metadata
) {

  const result = {

    schemaVersion:
      "1.0",

    engineVersion:
      CONFIRMATION_EXECUTION_ENGINE_VERSION,

    status:
      "rejected",

    actionType:
      CONFIRMATION_EXECUTION_ACTION_REJECT,

    proposalId:
      entry.proposalId,

    changePlanId:
      entry.changePlanId,

    subject:
      ConfirmationExecutionEngine_deepCopy(
        entry.proposal.subject
      ),

    decidedAt:
      ConfirmationExecutionEngine_getCurrentTimestamp(),

    metadata:
      ConfirmationExecutionEngine_buildResultMetadata(
        metadata
      )

  };


  ConfirmationExecutionEngine_validateRejectedResult(
    result
  );


  return result;

}


/**
 * rejected結果を検証する。
 *
 * @param {Object} result
 */
function ConfirmationExecutionEngine_validateRejectedResult(
  result
) {

  ConfirmationExecutionEngine_assertObject(
    result,
    "result"
  );


  if (
    result.status !==
      "rejected"
  ) {

    throw new Error(
      "rejected結果のstatusが不正です。"
    );

  }


  if (
    result.actionType !==
      CONFIRMATION_EXECUTION_ACTION_REJECT
  ) {

    throw new Error(
      "rejected結果のactionTypeが不正です。"
    );

  }


  ConfirmationExecutionEngine_assertNonEmptyString(
    result.proposalId,
    "result.proposalId"
  );


  ConfirmationExecutionEngine_assertNonEmptyString(
    result.changePlanId,
    "result.changePlanId"
  );


  ConfirmationExecutionEngine_assertObject(
    result.subject,
    "result.subject"
  );


  ConfirmationExecutionEngine_assertNonEmptyString(
    result.decidedAt,
    "result.decidedAt"
  );


  ConfirmationExecutionEngine_assertObject(
    result.metadata,
    "result.metadata"
  );


  /*
   * reject結果には、
   * 実行対象のChange Planを含めない。
   */
  if (
    Object.prototype.hasOwnProperty.call(
      result,
      "changePlan"
    )
  ) {

    throw new Error(
      "rejected結果にchangePlanを含めることはできません。"
    );

  }

}


/*
=========================================
Action
=========================================
*/

/**
 * Proposalから指定されたActionを取得する。
 *
 * @param {Array} actions
 * @param {string} actionType
 * @return {Object}
 */
function ConfirmationExecutionEngine_findAction(
  actions,
  actionType
) {

  if (
    !Array.isArray(
      actions
    )
  ) {

    throw new Error(
      "proposal.actionsはArrayである必要があります。"
    );

  }


  const action =
    actions.find(
      function(candidate) {

        return (
          candidate &&
          candidate.actionType ===
            actionType
        );

      }
    );


  if (
    !action
  ) {

    throw new Error(
      "Confirmation Proposalに指定された操作がありません。actionType=" +
      actionType
    );

  }


  return action;

}


/*
=========================================
Metadata
=========================================
*/

/**
 * 結果用metadataを生成する。
 *
 * @param {Object=} metadata
 * @return {Object}
 */
function ConfirmationExecutionEngine_buildResultMetadata(
  metadata
) {

  const sourceMetadata =
    metadata &&
    typeof metadata ===
      "object" &&
    !Array.isArray(
      metadata
    )
      ? metadata
      : {};


  return {

    source:
      typeof sourceMetadata.source ===
        "string" &&
      sourceMetadata.source.trim() !==
        ""
        ? sourceMetadata.source.trim()
        : "confirmation_request",

    decidedBy:
      typeof sourceMetadata.decidedBy ===
        "string" &&
      sourceMetadata.decidedBy.trim() !==
        ""
        ? sourceMetadata.decidedBy.trim()
        : null,

    requestId:
      typeof sourceMetadata.requestId ===
        "string" &&
      sourceMetadata.requestId.trim() !==
        ""
        ? sourceMetadata.requestId.trim()
        : null

  };

}


/*
=========================================
Lock
=========================================
*/

/**
 * 二重実行防止用のLockを取得する。
 *
 * @return {Lock}
 */
function ConfirmationExecutionEngine_getLock() {

  if (
    typeof LockService ===
      "undefined" ||
    !LockService ||
    typeof LockService.getScriptLock !==
      "function"
  ) {

    throw new Error(
      "LockServiceを利用できません。"
    );

  }


  return LockService
    .getScriptLock();

}


/*
=========================================
Utility
=========================================
*/

/**
 * 現在日時をISO 8601形式で取得する。
 *
 * @return {string}
 */
function ConfirmationExecutionEngine_getCurrentTimestamp() {

  return new Date()
    .toISOString();

}


/**
 * JSON変換によるDeep Copy。
 *
 * @param {*} value
 * @return {*}
 */
function ConfirmationExecutionEngine_deepCopy(
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

function ConfirmationExecutionEngine_assertObject(
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


function ConfirmationExecutionEngine_assertNonEmptyString(
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


