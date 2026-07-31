/*
=========================================
SHiCI
39_ChangePlanContract.js

Change Plan Contract
Version 1.0

役割：
・Change Planの初期構造を生成する
・Change Planの構造を検証する
・Engine間で受け渡す形式を固定する

禁止：
・Entityを検索しない
・Snapshotを取得しない
・差分を計算しない
・自然言語回答を生成しない
・Spreadsheetを更新しない
・CRUD関数を呼び出さない
=========================================
*/


/*
=========================================
定数
=========================================
*/

const CHANGE_PLAN_SCHEMA_VERSION =
  "1.0";


const CHANGE_PLAN_ALLOWED_STATUSES = [

  "draft",

  "ready_for_confirmation",

  "blocked"

];


const CHANGE_PLAN_ALLOWED_ENTITY_TYPES = [

  "product",

  "material",

  "mold",

  "machine",

  "condition",

  "user"

];


const CHANGE_PLAN_ALLOWED_CHANGE_TYPES = [

  "identity",

  "attribute",

  "relation",

  "state",

  "event",

  "snapshot"

];


/*
=========================================
生成
=========================================
*/

/**
 * 空のChange Planを生成する。
 *
 * @return {Object}
 */
function ChangePlanContract_createEmpty() {

  return {

    schemaVersion:
      CHANGE_PLAN_SCHEMA_VERSION,

    changePlanId:
      null,

    mutationId:
      null,

    status:
      "draft",

    subject: {

      entityType:
        null,

      entityId:
        null,

      displayName:
        null

    },

    currentEntity: {

      entityType:
        null,

      entityId:
        null,

      displayName:
        null,

      drawingNumber:
        null

    },

    changes:
      [],

    currentSnapshot:
      null,

    proposedSnapshot:
      null,

    snapshotPlan: {

      snapshotType:
        null,

      currentSnapshotId:
        null,

      proposedSnapshotId:
        null,

      preservationPolicy:
        null,

      preservesCurrentSnapshot:
        false,

      establishesAsCurrent:
        false

    },

    events:
      [],

    unresolvedReferences:
      [],

    missingFields:
      [],

    reason:
      null,

    confirmation: {

      required:
        true,

      status:
        "pending"

    },

    executable:
      false,

    metadata: {

      source:
        "entity_mutation",

      requestedBy:
        null,

      requestedAt:
        null,

      generatedAt:
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
 * Change Planを検証する。
 *
 * 正常な場合は、検証済みChange Planを返す。
 *
 * @param {Object} changePlan
 * @return {Object}
 */
function ChangePlanContract_validate(
  changePlan
) {

  ChangePlanContract_assertObject(
    changePlan,
    "changePlan"
  );


  /*
  =========================================
  Schema Version
  =========================================
  */

  ChangePlanContract_assertEqual(
    changePlan.schemaVersion,
    CHANGE_PLAN_SCHEMA_VERSION,
    "schemaVersion"
  );


  /*
  =========================================
  ID
  =========================================
  */

  if (
    changePlan.changePlanId !==
      null
  ) {

    ChangePlanContract_assertNonEmptyString(
      changePlan.changePlanId,
      "changePlanId"
    );

  }


  if (
    changePlan.mutationId !==
      null
  ) {

    ChangePlanContract_assertNonEmptyString(
      changePlan.mutationId,
      "mutationId"
    );

  }


  /*
  =========================================
  Status
  =========================================
  */

  ChangePlanContract_assertAllowedValue(
    changePlan.status,
    CHANGE_PLAN_ALLOWED_STATUSES,
    "status"
  );


  /*
  =========================================
  Subject
  =========================================
  */

  ChangePlanContract_validateEntityReference(
    changePlan.subject,
    "subject",
    true
  );


  /*
  =========================================
  Current Entity
  =========================================
  */

  ChangePlanContract_validateCurrentEntity(
    changePlan.currentEntity
  );


  /*
  =========================================
  Changes
  =========================================
  */

  ChangePlanContract_validateChanges(
    changePlan.changes
  );


  /*
  =========================================
  Snapshot
  =========================================
  */

  if (
    changePlan.currentSnapshot !==
      null
  ) {

    ChangePlanContract_assertObject(
      changePlan.currentSnapshot,
      "currentSnapshot"
    );

  }


  if (
    changePlan.proposedSnapshot !==
      null
  ) {

    ChangePlanContract_assertObject(
      changePlan.proposedSnapshot,
      "proposedSnapshot"
    );

  }


  ChangePlanContract_validateSnapshotPlan(
    changePlan.snapshotPlan
  );


  /*
  =========================================
  Events
  =========================================
  */

  ChangePlanContract_validateEvents(
    changePlan.events
  );


  /*
  =========================================
  Unresolved / Missing
  =========================================
  */

  ChangePlanContract_validateUnresolvedReferences(
    changePlan.unresolvedReferences
  );


  ChangePlanContract_assertStringArray(
    changePlan.missingFields,
    "missingFields"
  );


  /*
  =========================================
  Reason
  =========================================
  */

  if (
    changePlan.reason !==
      null
  ) {

    ChangePlanContract_assertNonEmptyString(
      changePlan.reason,
      "reason"
    );

  }


  /*
  =========================================
  Confirmation
  =========================================
  */

  ChangePlanContract_validateConfirmation(
    changePlan.confirmation
  );


  /*
  =========================================
  Executable
  =========================================
  */

  if (
    typeof changePlan.executable !==
      "boolean"
  ) {

    throw new Error(
      "executableはbooleanである必要があります。"
    );

  }


  /*
  =========================================
  Metadata
  =========================================
  */

  ChangePlanContract_validateMetadata(
    changePlan.metadata
  );


  /*
  =========================================
  Status整合性
  =========================================
  */

  ChangePlanContract_validateStatusConsistency(
    changePlan
  );


  return changePlan;

}


/*
=========================================
Entity Reference
=========================================
*/

/**
 * Entity参照を検証する。
 *
 * @param {Object} entityReference
 * @param {string} label
 * @param {boolean} requireIdentity
 */
function ChangePlanContract_validateEntityReference(
  entityReference,
  label,
  requireIdentity
) {

  ChangePlanContract_assertObject(
    entityReference,
    label
  );


  if (
    entityReference.entityType !==
      null
  ) {

    ChangePlanContract_assertAllowedValue(
      entityReference.entityType,
      CHANGE_PLAN_ALLOWED_ENTITY_TYPES,
      label + ".entityType"
    );

  }


  if (
    entityReference.entityId !==
      null
  ) {

    ChangePlanContract_assertNonEmptyString(
      entityReference.entityId,
      label + ".entityId"
    );

  }


  if (
    entityReference.displayName !==
      null
  ) {

    ChangePlanContract_assertNonEmptyString(
      entityReference.displayName,
      label + ".displayName"
    );

  }


  if (
    requireIdentity ===
      true
  ) {

    if (
      entityReference.entityType ===
        null ||
      entityReference.entityId ===
        null
    ) {

      throw new Error(
        label +
        "にはentityTypeとentityIdが必要です。"
      );

    }

  }

}


/**
 * Current Entityを検証する。
 *
 * @param {Object} currentEntity
 */
function ChangePlanContract_validateCurrentEntity(
  currentEntity
) {

  ChangePlanContract_validateEntityReference(
    currentEntity,
    "currentEntity",
    true
  );


  if (
    currentEntity.drawingNumber !==
      null
  ) {

    ChangePlanContract_assertNonEmptyString(
      currentEntity.drawingNumber,
      "currentEntity.drawingNumber"
    );

  }

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
function ChangePlanContract_validateChanges(
  changes
) {

  ChangePlanContract_assertArray(
    changes,
    "changes"
  );


  changes.forEach(
    function(change, index) {

      const label =
        "changes[" +
        index +
        "]";


      ChangePlanContract_assertObject(
        change,
        label
      );


      ChangePlanContract_assertAllowedValue(
        change.changeType,
        CHANGE_PLAN_ALLOWED_CHANGE_TYPES,
        label + ".changeType"
      );


      ChangePlanContract_assertNonEmptyString(
        change.path,
        label + ".path"
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

        ChangePlanContract_assertNonEmptyString(
          change.unit,
          label + ".unit"
        );

      }


      if (
        change.preservationPolicy !==
          null &&
        change.preservationPolicy !==
          undefined
      ) {

        ChangePlanContract_assertNonEmptyString(
          change.preservationPolicy,
          label + ".preservationPolicy"
        );

      }

    }
  );

}


/*
=========================================
Snapshot Plan
=========================================
*/

/**
 * Snapshot Planを検証する。
 *
 * @param {Object} snapshotPlan
 */
function ChangePlanContract_validateSnapshotPlan(
  snapshotPlan
) {

  ChangePlanContract_assertObject(
    snapshotPlan,
    "snapshotPlan"
  );


  if (
    snapshotPlan.snapshotType !==
      null
  ) {

    ChangePlanContract_assertNonEmptyString(
      snapshotPlan.snapshotType,
      "snapshotPlan.snapshotType"
    );

  }


  if (
    snapshotPlan.currentSnapshotId !==
      null
  ) {

    ChangePlanContract_assertNonEmptyString(
      snapshotPlan.currentSnapshotId,
      "snapshotPlan.currentSnapshotId"
    );

  }


  if (
    snapshotPlan.proposedSnapshotId !==
      null
  ) {

    ChangePlanContract_assertNonEmptyString(
      snapshotPlan.proposedSnapshotId,
      "snapshotPlan.proposedSnapshotId"
    );

  }


  if (
    snapshotPlan.preservationPolicy !==
      null
  ) {

    ChangePlanContract_assertNonEmptyString(
      snapshotPlan.preservationPolicy,
      "snapshotPlan.preservationPolicy"
    );

  }


  if (
    typeof snapshotPlan.preservesCurrentSnapshot !==
      "boolean"
  ) {

    throw new Error(
      "snapshotPlan.preservesCurrentSnapshotはbooleanである必要があります。"
    );

  }


  if (
    typeof snapshotPlan.establishesAsCurrent !==
      "boolean"
  ) {

    throw new Error(
      "snapshotPlan.establishesAsCurrentはbooleanである必要があります。"
    );

  }

}


/*
=========================================
Events
=========================================
*/

/**
 * Eventsを検証する。
 *
 * @param {Array<Object>} events
 */
function ChangePlanContract_validateEvents(
  events
) {

  ChangePlanContract_assertArray(
    events,
    "events"
  );


  events.forEach(
    function(event, index) {

      const label =
        "events[" +
        index +
        "]";


      ChangePlanContract_assertObject(
        event,
        label
      );


      ChangePlanContract_assertNonEmptyString(
        event.eventType,
        label + ".eventType"
      );


      if (
        event.occurredAt !==
          null &&
        event.occurredAt !==
          undefined
      ) {

        ChangePlanContract_assertNonEmptyString(
          event.occurredAt,
          label + ".occurredAt"
        );

      }


      ChangePlanContract_assertObject(
        event.details,
        label + ".details"
      );

    }
  );

}


/*
=========================================
Unresolved References
=========================================
*/

/**
 * 未解決参照を検証する。
 *
 * @param {Array<Object>} unresolvedReferences
 */
function ChangePlanContract_validateUnresolvedReferences(
  unresolvedReferences
) {

  ChangePlanContract_assertArray(
    unresolvedReferences,
    "unresolvedReferences"
  );


  unresolvedReferences.forEach(
    function(reference, index) {

      const label =
        "unresolvedReferences[" +
        index +
        "]";


      ChangePlanContract_assertObject(
        reference,
        label
      );


      ChangePlanContract_assertNonEmptyString(
        reference.path,
        label + ".path"
      );


      ChangePlanContract_assertAllowedValue(
        reference.entityType,
        CHANGE_PLAN_ALLOWED_ENTITY_TYPES,
        label + ".entityType"
      );


      ChangePlanContract_assertNonEmptyString(
        reference.query,
        label + ".query"
      );

    }
  );

}


/*
=========================================
Confirmation
=========================================
*/

/**
 * Confirmationを検証する。
 *
 * @param {Object} confirmation
 */
function ChangePlanContract_validateConfirmation(
  confirmation
) {

  ChangePlanContract_assertObject(
    confirmation,
    "confirmation"
  );


  if (
    typeof confirmation.required !==
      "boolean"
  ) {

    throw new Error(
      "confirmation.requiredはbooleanである必要があります。"
    );

  }


  ChangePlanContract_assertAllowedValue(
    confirmation.status,
    [
      "pending",
      "confirmed",
      "rejected",
      "expired"
    ],
    "confirmation.status"
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
function ChangePlanContract_validateMetadata(
  metadata
) {

  ChangePlanContract_assertObject(
    metadata,
    "metadata"
  );


  ChangePlanContract_assertNonEmptyString(
    metadata.source,
    "metadata.source"
  );


  if (
    metadata.requestedBy !==
      null
  ) {

    ChangePlanContract_assertNonEmptyString(
      metadata.requestedBy,
      "metadata.requestedBy"
    );

  }


  if (
    metadata.requestedAt !==
      null
  ) {

    ChangePlanContract_assertNonEmptyString(
      metadata.requestedAt,
      "metadata.requestedAt"
    );

  }


  if (
    metadata.generatedAt !==
      null
  ) {

    ChangePlanContract_assertNonEmptyString(
      metadata.generatedAt,
      "metadata.generatedAt"
    );

  }

}


/*
=========================================
Status整合性
=========================================
*/

/**
 * Statusと内容の整合性を検証する。
 *
 * @param {Object} changePlan
 */
function ChangePlanContract_validateStatusConsistency(
  changePlan
) {

  if (
    changePlan.status ===
      "ready_for_confirmation"
  ) {

    if (
      changePlan.changes.length ===
        0
    ) {

      throw new Error(
        "ready_for_confirmationのChange Planにはchangesが必要です。"
      );

    }


    if (
      changePlan.currentSnapshot ===
        null
    ) {

      throw new Error(
        "ready_for_confirmationのChange PlanにはcurrentSnapshotが必要です。"
      );

    }


    if (
      changePlan.proposedSnapshot ===
        null
    ) {

      throw new Error(
        "ready_for_confirmationのChange PlanにはproposedSnapshotが必要です。"
      );

    }


    if (
      changePlan.unresolvedReferences.length >
        0 ||
      changePlan.missingFields.length >
        0
    ) {

      throw new Error(
        "未解決参照または不足情報があるChange Planをready_for_confirmationにはできません。"
      );

    }

  }


  if (
    changePlan.status ===
      "blocked"
  ) {

    if (
      changePlan.unresolvedReferences.length ===
        0 &&
      changePlan.missingFields.length ===
        0
    ) {

      throw new Error(
        "blockedのChange Planには未解決参照または不足情報が必要です。"
      );

    }


    if (
      changePlan.executable ===
        true
    ) {

      throw new Error(
        "blockedのChange Planはexecutableにできません。"
      );

    }

  }


  /*
   * Ver.1.0では、
   * Confirmation前のChange Planは実行不可とする。
   */
  if (
    changePlan.confirmation.status !==
      "confirmed" &&
    changePlan.executable ===
      true
  ) {

    throw new Error(
      "確認されていないChange Planはexecutableにできません。"
    );

  }

}


/*
=========================================
Assertion
=========================================
*/

function ChangePlanContract_assertObject(
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


function ChangePlanContract_assertArray(
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


function ChangePlanContract_assertStringArray(
  value,
  label
) {

  ChangePlanContract_assertArray(
    value,
    label
  );


  value.forEach(
    function(item, index) {

      ChangePlanContract_assertNonEmptyString(
        item,
        label +
        "[" +
        index +
        "]"
      );

    }
  );

}


function ChangePlanContract_assertNonEmptyString(
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


function ChangePlanContract_assertAllowedValue(
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


function ChangePlanContract_assertEqual(
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


