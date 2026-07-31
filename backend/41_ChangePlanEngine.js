/*
=========================================
SHiCI
41_ChangePlanEngine.js

Change Plan Engine
Version 1.0

役割：
・Resolved Entity Mutationを受け取る
・現在のProduct Snapshotを取得する
・変更前と変更後の差分を構成する
・Change Plan Contract Ver.1.0を生成する

Ver.1.0対応範囲：
・product Entity
・change_state
・standard_condition.mold_temperature

禁止：
・Spreadsheetを更新しない
・新しい条件IDを採番しない
・現在標準条件IDを書き換えない
・確認を自動承認しない
・Persistenceを実行しない
・自然言語回答を生成しない
=========================================
*/


/*
=========================================
定数
=========================================
*/

const CHANGE_PLAN_ENGINE_VERSION =
  "1.0";


const CHANGE_PLAN_ENGINE_SUPPORTED_PATH =
  "standard_condition.mold_temperature";


const CHANGE_PLAN_ENGINE_MOLD_TEMPERATURE_KEY =
  "金型温度(℃)";


/*
=========================================
Entry Point
=========================================
*/

/**
 * Entity Mutation Resolution Resultから
 * Change Planを生成する。
 *
 * @param {Object} resolutionResult
 * @return {Object}
 */
function ChangePlanEngine_build(
  resolutionResult
) {

  ChangePlanEngine_validateResolutionResult(
    resolutionResult
  );


  const mutation =
    ChangePlanEngine_clone(
      resolutionResult.mutation
    );


  EntityMutationContract_validate(
    mutation
  );


  const productId =
    mutation.subject.entityId;


  const snapshot =
    SnapshotEngine_getProductSnapshot(
      productId
    );


  ChangePlanEngine_validateSnapshotResult(
    snapshot,
    productId
  );


  const changePlan =
    ChangePlanContract_createEmpty();


  ChangePlanEngine_setBaseInformation(
    changePlan,
    mutation,
    snapshot
  );


  const blockingFields =
    ChangePlanEngine_findBlockingFields(
      mutation,
      snapshot
    );


  if (
    blockingFields.length >
      0
  ) {

    return ChangePlanEngine_buildBlockedPlan(
      changePlan,
      mutation,
      snapshot,
      blockingFields
    );

  }


  ChangePlanEngine_applyStateChanges(
    changePlan,
    mutation,
    snapshot
  );


  ChangePlanEngine_applySnapshotPlan(
    changePlan,
    mutation,
    snapshot
  );


  ChangePlanEngine_applyEvents(
    changePlan,
    mutation
  );


  changePlan.status =
    "ready_for_confirmation";

  changePlan.confirmation.required =
    true;

  changePlan.confirmation.status =
    "pending";

  changePlan.executable =
    false;


  ChangePlanContract_validate(
    changePlan
  );


  return changePlan;

}


/*
=========================================
Base Information
=========================================
*/

/**
 * Change Planの基本情報を設定する。
 *
 * @param {Object} changePlan
 * @param {Object} mutation
 * @param {Object} snapshot
 */
function ChangePlanEngine_setBaseInformation(
  changePlan,
  mutation,
  snapshot
) {

  changePlan.changePlanId =
    ChangePlanEngine_createChangePlanId();


  changePlan.mutationId =
    mutation.mutationId;


  changePlan.subject = {

    entityType:
      mutation.subject.entityType,

    entityId:
      mutation.subject.entityId,

    displayName:
      snapshot.product["製品名"]

  };


  changePlan.currentEntity = {

    entityType:
      mutation.subject.entityType,

    entityId:
      mutation.subject.entityId,

    displayName:
      snapshot.product["製品名"],

    drawingNumber:
      snapshot.product["図番"]

  };


  changePlan.reason =
    mutation.reason;


  changePlan.unresolvedReferences =
    ChangePlanEngine_clone(
      mutation.unresolvedReferences
    );


  changePlan.missingFields =
    ChangePlanEngine_clone(
      mutation.missingFields
    );


  changePlan.metadata = {

    source:
      "entity_mutation",

    requestedBy:
      mutation.metadata.requestedBy,

    requestedAt:
      mutation.metadata.requestedAt,

    generatedAt:
      new Date().toISOString()

  };

}


/*
=========================================
Blocking Detection
=========================================
*/

/**
 * Change Plan生成を妨げる不足項目を取得する。
 *
 * @param {Object} mutation
 * @param {Object} snapshot
 * @return {Array<string>}
 */
function ChangePlanEngine_findBlockingFields(
  mutation,
  snapshot
) {

  const missingFields =
    [];


  if (
    mutation.mutationType !==
      "change_state"
  ) {

    missingFields.push(
      "mutation.mutationType.change_state"
    );

  }


  if (
    mutation.subject.entityType !==
      "product"
  ) {

    missingFields.push(
      "mutation.subject.entityType.product"
    );

  }


  if (
    !snapshot.product
  ) {

    missingFields.push(
      "snapshot.product"
    );

  }


  if (
    !snapshot.condition
  ) {

    missingFields.push(
      "snapshot.condition"
    );

  }


  if (
    !snapshot.conditionDetail
  ) {

    missingFields.push(
      "snapshot.conditionDetail"
    );

  }


  if (
    snapshot.product &&
    ChangePlanEngine_isBlank(
      snapshot.product["製品名"]
    )
  ) {

    missingFields.push(
      "snapshot.product.製品名"
    );

  }


  if (
    snapshot.product &&
    ChangePlanEngine_isBlank(
      snapshot.product["現在標準条件ID"]
    )
  ) {

    missingFields.push(
      "snapshot.product.現在標準条件ID"
    );

  }


  if (
    snapshot.condition &&
    ChangePlanEngine_isBlank(
      snapshot.condition["条件ID"]
    )
  ) {

    missingFields.push(
      "snapshot.condition.条件ID"
    );

  }


  if (
    snapshot.conditionDetail &&
    !Object.prototype.hasOwnProperty.call(
      snapshot.conditionDetail,
      CHANGE_PLAN_ENGINE_MOLD_TEMPERATURE_KEY
    )
  ) {

    missingFields.push(
      "snapshot.conditionDetail." +
      CHANGE_PLAN_ENGINE_MOLD_TEMPERATURE_KEY
    );

  }


  if (
    mutation.stateChanges.length ===
      0
  ) {

    missingFields.push(
      "mutation.stateChanges"
    );

  }


  mutation.stateChanges.forEach(
    function(stateChange, index) {

      if (
        stateChange.path !==
          CHANGE_PLAN_ENGINE_SUPPORTED_PATH
      ) {

        missingFields.push(
          "mutation.stateChanges[" +
          index +
          "].unsupportedPath:" +
          stateChange.path
        );

      }


      if (
        typeof stateChange.proposedValue !==
          "number" ||
        !isFinite(
          stateChange.proposedValue
        )
      ) {

        missingFields.push(
          "mutation.stateChanges[" +
          index +
          "].proposedValue"
        );

      }

    }
  );


  /*
   * Productが示す現在標準条件IDと、
   * Snapshotとして取得された条件IDの一致を確認する。
   */
  if (
    snapshot.product &&
    snapshot.condition &&
    !ChangePlanEngine_isBlank(
      snapshot.product["現在標準条件ID"]
    ) &&
    !ChangePlanEngine_isBlank(
      snapshot.condition["条件ID"]
    ) &&
    snapshot.product["現在標準条件ID"] !==
      snapshot.condition["条件ID"]
  ) {

    missingFields.push(
      "snapshot.currentConditionConsistency"
    );

  }


  return ChangePlanEngine_uniqueStrings(
    missingFields
  );

}


/**
 * Blocked Change Planを生成する。
 *
 * @param {Object} changePlan
 * @param {Object} mutation
 * @param {Object} snapshot
 * @param {Array<string>} blockingFields
 * @return {Object}
 */
function ChangePlanEngine_buildBlockedPlan(
  changePlan,
  mutation,
  snapshot,
  blockingFields
) {

  changePlan.status =
    "blocked";


  changePlan.missingFields =
    ChangePlanEngine_uniqueStrings(
      changePlan.missingFields.concat(
        blockingFields
      )
    );


  changePlan.currentSnapshot =
    ChangePlanEngine_buildCurrentConditionSnapshot(
      snapshot
    );


  changePlan.proposedSnapshot =
    null;


  changePlan.events =
    ChangePlanEngine_clone(
      mutation.events
    );


  changePlan.confirmation.required =
    true;

  changePlan.confirmation.status =
    "pending";

  changePlan.executable =
    false;


  ChangePlanContract_validate(
    changePlan
  );


  return changePlan;

}


/*
=========================================
State Changes
=========================================
*/

/**
 * Entity MutationのstateChangesを
 * Change Planのchangesへ変換する。
 *
 * @param {Object} changePlan
 * @param {Object} mutation
 * @param {Object} snapshot
 */
function ChangePlanEngine_applyStateChanges(
  changePlan,
  mutation,
  snapshot
) {

  const currentMoldTemperature =
    snapshot.conditionDetail[
      CHANGE_PLAN_ENGINE_MOLD_TEMPERATURE_KEY
    ];


  mutation.stateChanges.forEach(
    function(stateChange) {

      if (
        stateChange.path !==
          CHANGE_PLAN_ENGINE_SUPPORTED_PATH
      ) {

        throw new Error(
          "未対応のState Changeです。path=" +
          stateChange.path
        );

      }


      changePlan.changes.push({

        changeType:
          "state",

        path:
          stateChange.path,

        before:
          currentMoldTemperature,

        after:
          stateChange.proposedValue,

        unit:
          stateChange.unit !==
            undefined
            ? stateChange.unit
            : null,

        preservationPolicy:
          stateChange.preservationPolicy !==
            undefined
            ? stateChange.preservationPolicy
            : null

      });

    }
  );

}


/*
=========================================
Snapshot Plan
=========================================
*/

/**
 * Current SnapshotとProposed Snapshotを構成する。
 *
 * 新しい条件IDはPersistence時に採番するため、
 * Change Planではnullのままとする。
 *
 * @param {Object} changePlan
 * @param {Object} mutation
 * @param {Object} snapshot
 */
function ChangePlanEngine_applySnapshotPlan(
  changePlan,
  mutation,
  snapshot
) {

  const currentConditionId =
    snapshot.condition["条件ID"];


  const currentSnapshot =
    ChangePlanEngine_buildCurrentConditionSnapshot(
      snapshot
    );


  const proposedCondition =
    ChangePlanEngine_clone(
      snapshot.condition
    );


  const proposedConditionDetail =
    ChangePlanEngine_clone(
      snapshot.conditionDetail
    );


  const proposedMoldTemperature =
    ChangePlanEngine_getProposedMoldTemperature(
      mutation
    );


  /*
   * 新しい条件は、現在条件を親とする。
   * IDの採番はPersistence層の責務。
   */
  proposedCondition["条件ID"] =
    null;

  proposedCondition["親条件ID"] =
    currentConditionId;

  proposedCondition["版数"] =
    ChangePlanEngine_nextVersion(
      snapshot.condition["版数"]
    );

  proposedCondition["変更理由"] =
    mutation.reason;

  proposedCondition["最終更新日"] =
    null;


  proposedConditionDetail["条件ID"] =
    null;

  proposedConditionDetail[
    CHANGE_PLAN_ENGINE_MOLD_TEMPERATURE_KEY
  ] =
    proposedMoldTemperature;

  proposedConditionDetail["最終更新日"] =
    null;


  changePlan.currentSnapshot =
    currentSnapshot;


  changePlan.proposedSnapshot = {

    snapshotType:
      "condition",

    entityType:
      "product",

    entityId:
      mutation.subject.entityId,

    parentSnapshotId:
      currentConditionId,

    proposedSnapshotId:
      null,

    condition:
      proposedCondition,

    conditionDetail:
      proposedConditionDetail

  };


  const snapshotChange =
    mutation.snapshotChange ||
    {};


  changePlan.snapshotPlan = {

    snapshotType:
      snapshotChange.snapshotType ||
      "condition",

    currentSnapshotId:
      currentConditionId,

    proposedSnapshotId:
      null,

    preservationPolicy:
      snapshotChange.preservationPolicy ||
      "create_new_version",

    preservesCurrentSnapshot:
      true,

    establishesAsCurrent:
      true

  };

}


/**
 * 現在の条件Snapshotを構成する。
 *
 * @param {Object} snapshot
 * @return {Object}
 */
function ChangePlanEngine_buildCurrentConditionSnapshot(
  snapshot
) {

  if (
    !snapshot ||
    !snapshot.condition ||
    !snapshot.conditionDetail
  ) {

    return null;

  }


  return {

    snapshotType:
      "condition",

    entityType:
      "product",

    entityId:
      snapshot.product
        ? snapshot.product["製品ID"]
        : null,

    snapshotId:
      snapshot.condition["条件ID"],

    condition:
      ChangePlanEngine_clone(
        snapshot.condition
      ),

    conditionDetail:
      ChangePlanEngine_clone(
        snapshot.conditionDetail
      )

  };

}


/**
 * Mutationから提案金型温度を取得する。
 *
 * @param {Object} mutation
 * @return {number}
 */
function ChangePlanEngine_getProposedMoldTemperature(
  mutation
) {

  for (
    let index = 0;
    index < mutation.stateChanges.length;
    index++
  ) {

    const stateChange =
      mutation.stateChanges[index];


    if (
      stateChange.path ===
        CHANGE_PLAN_ENGINE_SUPPORTED_PATH
    ) {

      return stateChange.proposedValue;

    }

  }


  throw new Error(
    "金型温度の変更値がありません。"
  );

}


/*
=========================================
Events
=========================================
*/

/**
 * MutationのEventをChange Planへ複製する。
 *
 * @param {Object} changePlan
 * @param {Object} mutation
 */
function ChangePlanEngine_applyEvents(
  changePlan,
  mutation
) {

  changePlan.events =
    ChangePlanEngine_clone(
      mutation.events
    );

}


/*
=========================================
Validation
=========================================
*/

/**
 * Resolution Resultを検証する。
 *
 * @param {Object} resolutionResult
 */
function ChangePlanEngine_validateResolutionResult(
  resolutionResult
) {

  ChangePlanEngine_assertObject(
    resolutionResult,
    "resolutionResult"
  );


  if (
    resolutionResult.status !==
      "resolved"
  ) {

    throw new Error(
      "Change Planを生成するにはEntityがresolvedである必要があります。status=" +
      JSON.stringify(
        resolutionResult.status
      )
    );

  }


  ChangePlanEngine_assertObject(
    resolutionResult.mutation,
    "resolutionResult.mutation"
  );


  if (
    resolutionResult.mutation.subject ===
      null ||
    typeof resolutionResult.mutation.subject !==
      "object"
  ) {

    throw new Error(
      "resolutionResult.mutation.subjectが必要です。"
    );

  }


  if (
    ChangePlanEngine_isBlank(
      resolutionResult.mutation.subject.entityId
    )
  ) {

    throw new Error(
      "resolved MutationにentityIdがありません。"
    );

  }

}


/**
 * Snapshot Resultを検証する。
 *
 * @param {Object} snapshot
 * @param {string} expectedProductId
 */
function ChangePlanEngine_validateSnapshotResult(
  snapshot,
  expectedProductId
) {

  ChangePlanEngine_assertObject(
    snapshot,
    "snapshot"
  );


  if (
    snapshot.status !==
      "success"
  ) {

    throw new Error(
      "Product Snapshotを取得できませんでした。status=" +
      JSON.stringify(
        snapshot.status
      )
    );

  }


  ChangePlanEngine_assertObject(
    snapshot.product,
    "snapshot.product"
  );


  if (
    snapshot.product["製品ID"] !==
      expectedProductId
  ) {

    throw new Error(
      "解決されたProduct IDとSnapshotの製品IDが一致しません。" +
      " expected=" +
      JSON.stringify(
        expectedProductId
      ) +
      " actual=" +
      JSON.stringify(
        snapshot.product["製品ID"]
      )
    );

  }

}


/*
=========================================
Utility
=========================================
*/

/**
 * Change Plan IDを生成する。
 *
 * @return {string}
 */
function ChangePlanEngine_createChangePlanId() {

  return (
    "CHANGE-PLAN-" +
    Utilities.getUuid()
  );

}


/**
 * 次版数を返す。
 *
 * @param {*} currentVersion
 * @return {number|null}
 */
function ChangePlanEngine_nextVersion(
  currentVersion
) {

  const numericVersion =
    Number(
      currentVersion
    );


  if (
    !isFinite(
      numericVersion
    )
  ) {

    return null;

  }


  return numericVersion + 1;

}


/**
 * 空値か判定する。
 *
 * 0とfalseは空値にしない。
 *
 * @param {*} value
 * @return {boolean}
 */
function ChangePlanEngine_isBlank(
  value
) {

  return (
    value ===
      null ||
    value ===
      undefined ||
    (
      typeof value ===
        "string" &&
      value.trim() ===
        ""
    )
  );

}


/**
 * String配列の重複を除去する。
 *
 * @param {Array<string>} values
 * @return {Array<string>}
 */
function ChangePlanEngine_uniqueStrings(
  values
) {

  const result =
    [];


  values.forEach(
    function(value) {

      if (
        result.indexOf(
          value
        ) ===
          -1
      ) {

        result.push(
          value
        );

      }

    }
  );


  return result;

}


/**
 * JSON互換Objectを複製する。
 *
 * @param {*} value
 * @return {*}
 */
function ChangePlanEngine_clone(
  value
) {

  if (
    value ===
      undefined
  ) {

    return undefined;

  }


  return JSON.parse(
    JSON.stringify(
      value
    )
  );

}


/**
 * Objectであることを確認する。
 *
 * @param {*} value
 * @param {string} label
 */
function ChangePlanEngine_assertObject(
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


