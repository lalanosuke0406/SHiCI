/*
=========================================
SHiCI
43_ConfirmationPresentationFormatter.js

Confirmation Presentation Formatter
Version 1.0

役割：
・Change Planの内部表現を
  ユーザー表示用の表現へ変換する
・変更項目の表示名を決定する
・単位を表示用へ変換する
・Proposalのタイトルとメッセージを生成する

禁止：
・Spreadsheetを更新しない
・Snapshotを取得しない
・Entityを検索しない
・Change Planを変更しない
・Confirmation Proposalを保存しない
・LLMを呼び出さない
=========================================
*/


/*
=========================================
Presentation Definition
=========================================
*/

/**
 * 標準成形条件変更の共通表示定義。
 *
 * Field固有のlabel・displayUnitは、
 * StandardConditionFieldRegistryから取得する。
 */
const CONFIRMATION_PRESENTATION_STANDARD_CONDITION_DEFINITION = {

  proposalType:
    "standard_condition_change",

  title:
    "標準成形条件の変更",

  defaultOrder:
    100

};

/*
=========================================
Public API
=========================================
*/

/**
 * Change Planから表示情報を生成する。
 *
 * @param {Object} changePlan
 * @return {Object}
 */
function ConfirmationPresentationFormatter_format(
  changePlan
) {

  ConfirmationPresentationFormatter_validateChangePlanInput(
    changePlan
  );


  const formattedChanges =
    changePlan.changes.map(
      function(change) {

        return ConfirmationPresentationFormatter_formatChange(
          change
        );

      }
    );


  formattedChanges.sort(
    function(left, right) {

      return (
        left.order -
        right.order
      );

    }
  );


  const primaryDefinition =
    ConfirmationPresentationFormatter_getDefinition(
      changePlan.changes[0].path
    );


  const displayName =
    ConfirmationPresentationFormatter_getDisplayName(
      changePlan
    );


  const drawingNumber =
    ConfirmationPresentationFormatter_getDrawingNumber(
      changePlan
    );


  return {

    proposalType:
      primaryDefinition.proposalType,

    title:
      primaryDefinition.title,

    message:
      ConfirmationPresentationFormatter_buildMessage(
        displayName,
        drawingNumber
      ),

    changes:
      formattedChanges.map(
        function(change) {

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
              change.unit

          };

        }
      )

  };

}


/**
 * 1件のChangeを表示用へ変換する。
 *
 * @param {Object} change
 * @return {Object}
 */
function ConfirmationPresentationFormatter_formatChange(
  change
) {

  ConfirmationPresentationFormatter_assertObject(
    change,
    "change"
  );


  ConfirmationPresentationFormatter_assertNonEmptyString(
    change.path,
    "change.path"
  );


  if (
    !Object.prototype.hasOwnProperty.call(
      change,
      "before"
    )
  ) {

    throw new Error(
      "change.beforeが必要です。"
    );

  }


  if (
    !Object.prototype.hasOwnProperty.call(
      change,
      "after"
    )
  ) {

    throw new Error(
      "change.afterが必要です。"
    );

  }


  const definition =
    ConfirmationPresentationFormatter_getDefinition(
      change.path
    );


  return {

    path:
      change.path,

    label:
      definition.changeLabel,

    before:
      change.before,

    after:
      change.after,

    unit:
      definition.displayUnit,

    order:
      definition.order

  };

}


/*
=========================================
Definition Resolution
=========================================
*/

/**
 * Change Pathに対応する表示定義を取得する。
 *
 * Field固有情報は、
 * StandardConditionFieldRegistryから取得する。
 *
 * @param {string} path
 * @return {Object}
 */
function ConfirmationPresentationFormatter_getDefinition(
  path
) {

  ConfirmationPresentationFormatter_assertNonEmptyString(
    path,
    "path"
  );


  const fieldDefinition =
    StandardConditionFieldRegistry_findByPath(
      path
    );


  if (
    fieldDefinition ===
      null
  ) {

    throw new Error(
      "未対応のConfirmation表示項目です。path=" +
      path
    );

  }


  return {

    proposalType:
      CONFIRMATION_PRESENTATION_STANDARD_CONDITION_DEFINITION
        .proposalType,

    title:
      CONFIRMATION_PRESENTATION_STANDARD_CONDITION_DEFINITION
        .title,

    changeLabel:
      fieldDefinition.label,

    displayUnit:
      fieldDefinition.displayUnit,

    order:
      CONFIRMATION_PRESENTATION_STANDARD_CONDITION_DEFINITION
        .defaultOrder

  };

}


/*
=========================================
Subject
=========================================
*/

/**
 * Change Planから表示名を取得する。
 *
 * @param {Object} changePlan
 * @return {string}
 */
function ConfirmationPresentationFormatter_getDisplayName(
  changePlan
) {

  const candidates = [

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

  ];


  for (
    let index = 0;
    index < candidates.length;
    index++
  ) {

    if (
      typeof candidates[index] ===
        "string" &&
      candidates[index].trim() !==
        ""
    ) {

      return candidates[index].trim();

    }

  }


  throw new Error(
    "Confirmation表示に必要な製品名を取得できません。"
  );

}


/**
 * Change Planから図番を取得する。
 *
 * 図番が存在しない場合はnullを返す。
 *
 * @param {Object} changePlan
 * @return {string|null}
 */
function ConfirmationPresentationFormatter_getDrawingNumber(
  changePlan
) {

  const candidates = [

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

  ];


  for (
    let index = 0;
    index < candidates.length;
    index++
  ) {

    if (
      typeof candidates[index] ===
        "string" &&
      candidates[index].trim() !==
        ""
    ) {

      return candidates[index].trim();

    }

  }


  return null;

}


/*
=========================================
Message
=========================================
*/

/**
 * Proposal表示用メッセージを生成する。
 *
 * @param {string} displayName
 * @param {string|null} drawingNumber
 * @return {string}
 */
function ConfirmationPresentationFormatter_buildMessage(
  displayName,
  drawingNumber
) {

  ConfirmationPresentationFormatter_assertNonEmptyString(
    displayName,
    "displayName"
  );


  if (
    drawingNumber ===
      null
  ) {

    return (
      displayName +
      "の標準成形条件を変更します。"
    );

  }


  ConfirmationPresentationFormatter_assertNonEmptyString(
    drawingNumber,
    "drawingNumber"
  );


  return (
    displayName +
    "（" +
    drawingNumber +
    "）の標準成形条件を変更します。"
  );

}


/*
=========================================
Input Validation
=========================================
*/

/**
 * Formatterへ渡されるChange Planを
 * 最低限検証する。
 *
 * 完全な構造検証は
 * ChangePlanContract_validate()の責務。
 *
 * @param {Object} changePlan
 */
function ConfirmationPresentationFormatter_validateChangePlanInput(
  changePlan
) {

  ConfirmationPresentationFormatter_assertObject(
    changePlan,
    "changePlan"
  );



  if (
    changePlan.status !==
      "ready_for_confirmation"
  ) {

    throw new Error(
      "Confirmation表示を生成するにはChange Planがready_for_confirmationである必要があります。"
    );

  }


  if (
    !Array.isArray(
      changePlan.changes
    )
  ) {

    throw new Error(
      "changePlan.changesはArrayである必要があります。"
    );

  }


  if (
    changePlan.changes.length ===
      0
  ) {

    throw new Error(
      "Confirmation表示には1件以上のChangeが必要です。"
    );

  }

}


/*
=========================================
Assertion
=========================================
*/

function ConfirmationPresentationFormatter_assertObject(
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


function ConfirmationPresentationFormatter_assertNonEmptyString(
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


