/*
=========================================
SHiCI
42_ConfirmationProposalContract.js

Confirmation Proposal Contract
Version 1.0

役割：
・確認画面へ渡すProposal構造を生成する
・Proposalの構造を検証する
・Change PlanとFrontendの境界を固定する

禁止：
・Spreadsheetを更新しない
・Change Planを実行しない
・確認を自動承認しない
・Entityを検索しない
・Snapshotを取得しない
・自然言語をLLMへ生成させない
=========================================
*/


/*
=========================================
定数
=========================================
*/

const CONFIRMATION_PROPOSAL_SCHEMA_VERSION =
  "1.0";


const CONFIRMATION_PROPOSAL_ALLOWED_STATUSES = [

  "pending",

  "confirmed",

  "rejected",

  "expired"

];


const CONFIRMATION_PROPOSAL_ALLOWED_ENTITY_TYPES = [

  "product",

  "material",

  "mold",

  "machine",

  "condition",

  "user"

];


const CONFIRMATION_PROPOSAL_ALLOWED_ACTION_TYPES = [

  "confirm",

  "reject"

];


/*
=========================================
生成
=========================================
*/

/**
 * 空のConfirmation Proposalを生成する。
 *
 * @return {Object}
 */
function ConfirmationProposalContract_createEmpty() {

  return {

    schemaVersion:
      CONFIRMATION_PROPOSAL_SCHEMA_VERSION,

    proposalId:
      null,

    changePlanId:
      null,

    status:
      "pending",

    subject: {

      entityType:
        null,

      entityId:
        null,

      displayName:
        null,

      drawingNumber:
        null

    },

    presentation: {

      proposalType:
        null,

      title:
        null,

      message:
        null

    },

    changes:
      [],

    actions: [

      {
        actionType:
          "confirm",

        label:
          "変更する",

        enabled:
          true
      },

      {
        actionType:
          "reject",

        label:
          "キャンセル",

        enabled:
          true
      }

    ],

    payload: {

      proposalId:
        null,

      changePlanId:
        null

    },

    metadata: {

      source:
        "change_plan",

      generatedAt:
        null,

      expiresAt:
        null

    }

  };

}


/*
=========================================
検証
=========================================
*/

/**
 * Confirmation Proposalを検証する。
 *
 * @param {Object} proposal
 * @return {Object}
 */
function ConfirmationProposalContract_validate(
  proposal
) {

  ConfirmationProposalContract_assertObject(
    proposal,
    "proposal"
  );


  /*
  =========================================
  Schema Version
  =========================================
  */

  ConfirmationProposalContract_assertEqual(
    proposal.schemaVersion,
    CONFIRMATION_PROPOSAL_SCHEMA_VERSION,
    "schemaVersion"
  );


  /*
  =========================================
  IDs
  =========================================
  */

  ConfirmationProposalContract_assertNonEmptyString(
    proposal.proposalId,
    "proposalId"
  );


  ConfirmationProposalContract_assertNonEmptyString(
    proposal.changePlanId,
    "changePlanId"
  );


  /*
  =========================================
  Status
  =========================================
  */

  ConfirmationProposalContract_assertAllowedValue(
    proposal.status,
    CONFIRMATION_PROPOSAL_ALLOWED_STATUSES,
    "status"
  );


  /*
  =========================================
  Subject
  =========================================
  */

  ConfirmationProposalContract_validateSubject(
    proposal.subject
  );


  /*
  =========================================
  Presentation
  =========================================
  */

  ConfirmationProposalContract_validatePresentation(
    proposal.presentation
  );


  /*
  =========================================
  Changes
  =========================================
  */

  ConfirmationProposalContract_validateChanges(
    proposal.changes
  );


  /*
  =========================================
  Actions
  =========================================
  */

  ConfirmationProposalContract_validateActions(
    proposal.actions
  );


  /*
  =========================================
  Payload
  =========================================
  */

  ConfirmationProposalContract_validatePayload(
    proposal.payload
  );


  /*
  =========================================
  Metadata
  =========================================
  */

  ConfirmationProposalContract_validateMetadata(
    proposal.metadata
  );


  /*
  =========================================
  Cross-field consistency
  =========================================
  */

  ConfirmationProposalContract_validateConsistency(
    proposal
  );


  return proposal;

}


/*
=========================================
Subject
=========================================
*/

/**
 * Subjectを検証する。
 *
 * @param {Object} subject
 */
function ConfirmationProposalContract_validateSubject(
  subject
) {

  ConfirmationProposalContract_assertObject(
    subject,
    "subject"
  );


  ConfirmationProposalContract_assertAllowedValue(
    subject.entityType,
    CONFIRMATION_PROPOSAL_ALLOWED_ENTITY_TYPES,
    "subject.entityType"
  );


  ConfirmationProposalContract_assertNonEmptyString(
    subject.entityId,
    "subject.entityId"
  );


  ConfirmationProposalContract_assertNonEmptyString(
    subject.displayName,
    "subject.displayName"
  );


  if (
    subject.drawingNumber !==
      null
  ) {

    ConfirmationProposalContract_assertNonEmptyString(
      subject.drawingNumber,
      "subject.drawingNumber"
    );

  }

}


/*
=========================================
Presentation
=========================================
*/

/**
 * Presentationを検証する。
 *
 * @param {Object} presentation
 */
function ConfirmationProposalContract_validatePresentation(
  presentation
) {

  ConfirmationProposalContract_assertObject(
    presentation,
    "presentation"
  );


  ConfirmationProposalContract_assertNonEmptyString(
    presentation.proposalType,
    "presentation.proposalType"
  );


  ConfirmationProposalContract_assertNonEmptyString(
    presentation.title,
    "presentation.title"
  );


  ConfirmationProposalContract_assertNonEmptyString(
    presentation.message,
    "presentation.message"
  );

}


/*
=========================================
Changes
=========================================
*/

/**
 * Changesを検証する。
 *
 * @param {Array<Object>} changes
 */
function ConfirmationProposalContract_validateChanges(
  changes
) {

  ConfirmationProposalContract_assertArray(
    changes,
    "changes"
  );


  if (
    changes.length ===
      0
  ) {

    throw new Error(
      "Confirmation Proposalには1件以上のchangesが必要です。"
    );

  }


  changes.forEach(
    function(change, index) {

      const label =
        "changes[" +
        index +
        "]";


      ConfirmationProposalContract_assertObject(
        change,
        label
      );


      ConfirmationProposalContract_assertNonEmptyString(
        change.path,
        label + ".path"
      );


      ConfirmationProposalContract_assertNonEmptyString(
        change.label,
        label + ".label"
      );


      if (
        !Object.prototype.hasOwnProperty.call(
          change,
          "before"
        )
      ) {

        throw new Error(
          label +
          ".beforeが必要です。"
        );

      }


      if (
        !Object.prototype.hasOwnProperty.call(
          change,
          "after"
        )
      ) {

        throw new Error(
          label +
          ".afterが必要です。"
        );

      }


      if (
        change.unit !==
          null &&
        change.unit !==
          undefined
      ) {

        ConfirmationProposalContract_assertNonEmptyString(
          change.unit,
          label + ".unit"
        );

      }

    }
  );

}


/*
=========================================
Actions
=========================================
*/

/**
 * Actionsを検証する。
 *
 * @param {Array<Object>} actions
 */
function ConfirmationProposalContract_validateActions(
  actions
) {

  ConfirmationProposalContract_assertArray(
    actions,
    "actions"
  );


  if (
    actions.length ===
      0
  ) {

    throw new Error(
      "actionsには1件以上のActionが必要です。"
    );

  }


  const actionTypes =
    [];


  actions.forEach(
    function(action, index) {

      const label =
        "actions[" +
        index +
        "]";


      ConfirmationProposalContract_assertObject(
        action,
        label
      );


      ConfirmationProposalContract_assertAllowedValue(
        action.actionType,
        CONFIRMATION_PROPOSAL_ALLOWED_ACTION_TYPES,
        label + ".actionType"
      );


      ConfirmationProposalContract_assertNonEmptyString(
        action.label,
        label + ".label"
      );


      if (
        typeof action.enabled !==
          "boolean"
      ) {

        throw new Error(
          label +
          ".enabledはbooleanである必要があります。"
        );

      }


      if (
        actionTypes.indexOf(
          action.actionType
        ) !==
          -1
      ) {

        throw new Error(
          "actionsに重複したactionTypeがあります。actionType=" +
          action.actionType
        );

      }


      actionTypes.push(
        action.actionType
      );

    }
  );


  if (
    actionTypes.indexOf(
      "confirm"
    ) ===
      -1
  ) {

    throw new Error(
      "actionsにはconfirmが必要です。"
    );

  }


  if (
    actionTypes.indexOf(
      "reject"
    ) ===
      -1
  ) {

    throw new Error(
      "actionsにはrejectが必要です。"
    );

  }

}


/*
=========================================
Payload
=========================================
*/

/**
 * Payloadを検証する。
 *
 * Frontendから返送させる識別子だけを保持する。
 *
 * @param {Object} payload
 */
function ConfirmationProposalContract_validatePayload(
  payload
) {

  ConfirmationProposalContract_assertObject(
    payload,
    "payload"
  );


  ConfirmationProposalContract_assertNonEmptyString(
    payload.proposalId,
    "payload.proposalId"
  );


  ConfirmationProposalContract_assertNonEmptyString(
    payload.changePlanId,
    "payload.changePlanId"
  );

}


/*
=========================================
Metadata
=========================================
*/

/**
 * Metadataを検証する。
 *
 * @param {Object} metadata
 */
function ConfirmationProposalContract_validateMetadata(
  metadata
) {

  ConfirmationProposalContract_assertObject(
    metadata,
    "metadata"
  );


  ConfirmationProposalContract_assertNonEmptyString(
    metadata.source,
    "metadata.source"
  );


  ConfirmationProposalContract_assertNonEmptyString(
    metadata.generatedAt,
    "metadata.generatedAt"
  );


  if (
    metadata.expiresAt !==
      null
  ) {

    ConfirmationProposalContract_assertNonEmptyString(
      metadata.expiresAt,
      "metadata.expiresAt"
    );

  }

}


/*
=========================================
整合性
=========================================
*/

/**
 * Proposal内の項目間整合性を検証する。
 *
 * @param {Object} proposal
 */
function ConfirmationProposalContract_validateConsistency(
  proposal
) {

  if (
    proposal.payload.proposalId !==
      proposal.proposalId
  ) {

    throw new Error(
      "payload.proposalIdとproposalIdが一致しません。"
    );

  }


  if (
    proposal.payload.changePlanId !==
      proposal.changePlanId
  ) {

    throw new Error(
      "payload.changePlanIdとchangePlanIdが一致しません。"
    );

  }


  const confirmAction =
    ConfirmationProposalContract_findAction(
      proposal.actions,
      "confirm"
    );


  const rejectAction =
    ConfirmationProposalContract_findAction(
      proposal.actions,
      "reject"
    );


  if (
    proposal.status ===
      "pending"
  ) {

    if (
      confirmAction.enabled !==
        true
    ) {

      throw new Error(
        "pendingのProposalではconfirm Actionが有効である必要があります。"
      );

    }


    if (
      rejectAction.enabled !==
        true
    ) {

      throw new Error(
        "pendingのProposalではreject Actionが有効である必要があります。"
      );

    }

  }


  if (
    proposal.status ===
      "confirmed" ||
    proposal.status ===
      "rejected" ||
    proposal.status ===
      "expired"
  ) {

    if (
      confirmAction.enabled !==
        false ||
      rejectAction.enabled !==
        false
    ) {

      throw new Error(
        "完了済みのProposalでは全Actionを無効にする必要があります。"
      );

    }

  }

}


/**
 * Actionを取得する。
 *
 * @param {Array<Object>} actions
 * @param {string} actionType
 * @return {Object}
 */
function ConfirmationProposalContract_findAction(
  actions,
  actionType
) {

  for (
    let index = 0;
    index < actions.length;
    index++
  ) {

    if (
      actions[index].actionType ===
        actionType
    ) {

      return actions[index];

    }

  }


  throw new Error(
    "Actionが見つかりません。actionType=" +
    actionType
  );

}


/*
=========================================
Assertion
=========================================
*/

function ConfirmationProposalContract_assertObject(
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


function ConfirmationProposalContract_assertArray(
  value,
  label
) {

  if (
    !Array.isArray(
      value
    )
  ) {

    throw new Error(
      label +
      "はArrayである必要があります。"
    );

  }

}


function ConfirmationProposalContract_assertNonEmptyString(
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


function ConfirmationProposalContract_assertAllowedValue(
  value,
  allowedValues,
  label
) {

  if (
    allowedValues.indexOf(
      value
    ) ===
      -1
  ) {

    throw new Error(
      label +
      "が許可されていない値です。value=" +
      JSON.stringify(
        value
      )
    );

  }

}


function ConfirmationProposalContract_assertEqual(
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
      "が一致しません。expected=" +
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



