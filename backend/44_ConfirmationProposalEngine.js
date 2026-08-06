/*
=========================================
SHiCI
44_ConfirmationProposalEngine.js

Confirmation Proposal Engine
Version 1.0

役割：
・Change PlanからConfirmation Proposalを生成する
・Presentation Formatterを呼び出す
・Proposal IDを採番する
・Confirmation Proposal Contractで検証する

禁止：
・Spreadsheetを更新しない
・Change Planを実行しない
・標準条件を切り替えない
・新しい条件IDを採番しない
・Proposalを永続保存しない
・ユーザーの承認を自動的に行わない
・LLMを呼び出さない
=========================================
*/


/*
=========================================
定数
=========================================
*/

const CONFIRMATION_PROPOSAL_ENGINE_VERSION =
  "1.0";


/*
=========================================
Public API
=========================================
*/

/**
 * Change PlanからConfirmation Proposalを生成する。
 *
 * @param {Object} changePlan
 * @return {Object}
 */
function ConfirmationProposalEngine_build(
  changePlan
) {

  ConfirmationProposalEngine_validateInput(
    changePlan
  );






  Logger.log(
    "[Confirmation Debug] changePlan=\n" +
    JSON.stringify(
        changePlan,
        null,
        2
    )
  );









  /*
  =========================================
  Presentation生成
  =========================================
  */

  const presentation =
    ConfirmationPresentationFormatter_format(
      changePlan
    );

  Logger.log(
    "[Confirmation Debug] presentation=\n" +
    JSON.stringify(
        presentation,
        null,
        2
    )
  );



  /*
  =========================================
  Proposal生成
  =========================================
  */

  const proposal =
    ConfirmationProposalContract_createEmpty();


  const proposalId =
    ConfirmationProposalEngine_generateProposalId();


  const generatedAt =
    ConfirmationProposalEngine_getCurrentTimestamp();


  /*
  =========================================
  IDs
  =========================================
  */

  proposal.proposalId =
    proposalId;


  proposal.changePlanId =
    changePlan.changePlanId;


  proposal.status =
    "pending";


  /*
  =========================================
  Subject
  =========================================
  */

  proposal.subject =
    ConfirmationProposalEngine_buildSubject(
      changePlan
    );


  /*
  =========================================
  Presentation
  =========================================
  */

  proposal.presentation = {

    proposalType:
      presentation.proposalType,

    title:
      presentation.title,

    message:
      presentation.message

  };


  /*
  =========================================
  Changes
  =========================================
  */

  proposal.changes =
    ConfirmationProposalEngine_copyChanges(
      presentation.changes
    );


  /*
  =========================================
  Actions
  =========================================
  */

  proposal.actions = [

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

  ];


  /*
  =========================================
  Payload
  =========================================
  */

  proposal.payload = {

    proposalId:
      proposalId,

    changePlanId:
      changePlan.changePlanId

  };


  /*
  =========================================
  Metadata
  =========================================
  */

  proposal.metadata = {

    source:
      "change_plan",

    generatedAt:
      generatedAt,

    expiresAt:
      null

  };


  /*
  =========================================
  Contract Validation
  =========================================
  */

  ConfirmationProposalContract_validate(
    proposal
  );


  return proposal;

}


/*
=========================================
Input Validation
=========================================
*/

/**
 * Confirmation Proposal生成前に
 * Change Planを検証する。
 *
 * @param {Object} changePlan
 */
function ConfirmationProposalEngine_validateInput(
  changePlan
) {

  ConfirmationProposalEngine_assertObject(
    changePlan,
    "changePlan"
  );


  /*
   * Engine境界では、
   * Change Plan全体を正式に検証する。
   */
  ChangePlanContract_validate(
    changePlan
  );


  if (
    changePlan.status !==
      "ready_for_confirmation"
  ) {

    throw new Error(
      "Confirmation Proposalを生成するにはChange Planがready_for_confirmationである必要があります。"
    );

  }


  if (
    !changePlan.confirmation ||
    changePlan.confirmation.required !==
      true
  ) {

    throw new Error(
      "Confirmation Proposalを生成するには確認要求が必要です。"
    );

  }


  if (
    changePlan.confirmation.status !==
      "pending"
  ) {

    throw new Error(
      "Confirmation Proposalを生成するにはChange Planのconfirmation.statusがpendingである必要があります。"
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


  ConfirmationProposalEngine_assertNonEmptyString(
    changePlan.changePlanId,
    "changePlan.changePlanId"
  );

}


/*
=========================================
Subject
=========================================
*/

/**
 * Change PlanからProposalのSubjectを生成する。
 *
 * @param {Object} changePlan
 * @return {Object}
 */
function ConfirmationProposalEngine_buildSubject(
  changePlan
) {

  const entityType =
    ConfirmationProposalEngine_findFirstNonEmptyString(
      [

        changePlan.subject
          ? changePlan.subject.entityType
          : null,

        changePlan.currentEntity
          ? changePlan.currentEntity.entityType
          : null

      ]
    );


  const entityId =
    ConfirmationProposalEngine_findFirstNonEmptyString(
      [

        changePlan.subject
          ? changePlan.subject.entityId
          : null,

        changePlan.currentEntity
          ? changePlan.currentEntity.entityId
          : null,

        changePlan.currentSnapshot &&
        changePlan.currentSnapshot.product
          ? changePlan.currentSnapshot.product["製品ID"]
          : null

      ]
    );


  const displayName =
    ConfirmationProposalEngine_findFirstNonEmptyString(
      [

        changePlan.subject
          ? changePlan.subject.displayName
          : null,

        changePlan.currentEntity
          ? changePlan.currentEntity.displayName
          : null,

        changePlan.currentEntity
          ? changePlan.currentEntity.productName
          : null,

        changePlan.currentSnapshot &&
        changePlan.currentSnapshot.product
          ? changePlan.currentSnapshot.product["製品名"]
          : null

      ]
    );


  const drawingNumber =
    ConfirmationProposalEngine_findFirstNonEmptyStringOrNull(
      [

        changePlan.subject
          ? changePlan.subject.drawingNumber
          : null,

        changePlan.currentEntity
          ? changePlan.currentEntity.drawingNumber
          : null,

        changePlan.currentSnapshot &&
        changePlan.currentSnapshot.product
          ? changePlan.currentSnapshot.product["図番"]
          : null

      ]
    );


  if (
    entityType ===
      null
  ) {

    throw new Error(
      "Confirmation Proposalのsubject.entityTypeを取得できません。"
    );

  }


  if (
    entityId ===
      null
  ) {

    throw new Error(
      "Confirmation Proposalのsubject.entityIdを取得できません。"
    );

  }


  if (
    displayName ===
      null
  ) {

    throw new Error(
      "Confirmation Proposalのsubject.displayNameを取得できません。"
    );

  }


  return {

    entityType:
      entityType,

    entityId:
      entityId,

    displayName:
      displayName,

    drawingNumber:
      drawingNumber

  };

}


/*
=========================================
Changes
=========================================
*/

/**
 * Formatterが生成したChangesを複製する。
 *
 * 参照をそのままProposalへ渡さず、
 * 新しいObjectとして生成する。
 *
 * @param {Array<Object>} changes
 * @return {Array<Object>}
 */
function ConfirmationProposalEngine_copyChanges(
  changes
) {

  if (
    !Array.isArray(
      changes
    )
  ) {

    throw new Error(
      "presentation.changesはArrayである必要があります。"
    );

  }


  if (
    changes.length ===
      0
  ) {

    throw new Error(
      "Confirmation Proposalには1件以上のChangeが必要です。"
    );

  }


  return changes.map(
    function(change, index) {

      ConfirmationProposalEngine_assertObject(
        change,
        "presentation.changes[" +
        index +
        "]"
      );


      return {

        path:
          change.path,

        label:
          change.label,

        before:
          change.before,

        after:
          change.after,

        unit:
          change.unit ===
            undefined
              ? null
              : change.unit

      };

    }
  );

}


/*
=========================================
ID Generation
=========================================
*/

/**
 * Proposal IDを生成する。
 *
 * 永続保存は行わない。
 * Ver.1.0ではUUIDを使用する。
 *
 * @return {string}
 */
function ConfirmationProposalEngine_generateProposalId() {

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
    "CONFIRMATION-" +
    uniquePart
  );

}


/*
=========================================
Timestamp
=========================================
*/

/**
 * 現在日時をISO 8601形式で取得する。
 *
 * @return {string}
 */
function ConfirmationProposalEngine_getCurrentTimestamp() {

  return new Date()
    .toISOString();

}


/*
=========================================
Value Resolution
=========================================
*/

/**
 * 候補から最初の空でない文字列を返す。
 *
 * 見つからない場合はnullを返す。
 *
 * @param {Array<*>} candidates
 * @return {string|null}
 */
function ConfirmationProposalEngine_findFirstNonEmptyString(
  candidates
) {

  if (
    !Array.isArray(
      candidates
    )
  ) {

    throw new Error(
      "candidatesはArrayである必要があります。"
    );

  }


  for (
    let index = 0;
    index < candidates.length;
    index++
  ) {

    const value =
      candidates[index];


    if (
      typeof value ===
        "string" &&
      value.trim() !==
        ""
    ) {

      return value.trim();

    }

  }


  return null;

}


/**
 * 候補から最初の空でない文字列を返す。
 *
 * 存在しない場合はnullを許容する項目に使用する。
 *
 * @param {Array<*>} candidates
 * @return {string|null}
 */
function ConfirmationProposalEngine_findFirstNonEmptyStringOrNull(
  candidates
) {

  return ConfirmationProposalEngine_findFirstNonEmptyString(
    candidates
  );

}


/*
=========================================
Assertion
=========================================
*/

function ConfirmationProposalEngine_assertObject(
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


function ConfirmationProposalEngine_assertNonEmptyString(
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



