/*
=========================================
SHiCI
36_EntityMutationContract.js

Entity Mutation Contract
Version 1.0

役割：
・SHiCIのEntity世界に生じる変化の
  共通構造を定義する
・Mutationの初期値を生成する
・Mutation構造を検証する

禁止：
・自然言語を解析しない
・Entity Resolutionを行わない
・Knowledgeを検索しない
・Storageへ書き込まない
・CRUD関数を呼び出さない
・変更内容を推測しない
=========================================
*/


/*
=========================================
定数
=========================================
*/

/**
 * Entity Mutation ContractのSchema Version
 */
const ENTITY_MUTATION_SCHEMA_VERSION =
  "1.0";


/**
 * Mutation Type
 */
const ENTITY_MUTATION_ALLOWED_TYPES = [

  "create_entity",

  "change_identity",

  "change_attribute",

  "create_relation",

  "change_relation",

  "change_state",

  "append_event",

  "set_current_snapshot"

];


/**
 * Preservation Policy
 */
const ENTITY_MUTATION_ALLOWED_PRESERVATION_POLICIES = [

  "replace_current",

  "create_new_snapshot",

  "create_new_version",

  "append_history",

  "create_relation",

  "close_and_create_relation"

];


/**
 * 初期対応するEntity Type
 *
 * Storage上のシート名ではなく、
 * SHiCIが理解するEntity Typeを定義する。
 */
const ENTITY_MUTATION_ALLOWED_ENTITY_TYPES = [

  "product",

  "material",

  "machine",

  "mold",

  "part",

  "process",

  "condition",

  "user"

];


/*
=========================================
生成
=========================================
*/

/**
 * 空のEntity Mutationを生成する。
 *
 * @return {Object}
 */
function EntityMutationContract_createEmpty() {

  return {

    schemaVersion:
      ENTITY_MUTATION_SCHEMA_VERSION,

    mutationId:
      null,

    mutationType:
      null,

    subject: {

      entityType:
        null,

      entityId:
        null,

      entityQuery:
        null

    },

    identityChanges:
      [],

    attributeChanges:
      [],

    relationChanges:
      [],

    stateChanges:
      [],

    events:
      [],

    snapshotChange:
      null,

    reason:
      null,

    evidence:
      [],

    unresolvedReferences:
      [],

    missingFields:
      [],

    confirmation: {

      required:
        true

    },

    metadata: {

      source:
        "user_input",

      requestedBy:
        null,

      requestedAt:
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
 * Entity Mutationを検証する。
 *
 * 正常な場合は検証済みMutationを返す。
 *
 * @param {Object} mutation
 * @return {Object}
 */
function EntityMutationContract_validate(
  mutation
) {

  EntityMutationContract_assertObject(
    mutation,
    "mutation"
  );


  /*
  =========================================
  Schema
  =========================================
  */

  EntityMutationContract_assertEqual(
    mutation.schemaVersion,
    ENTITY_MUTATION_SCHEMA_VERSION,
    "schemaVersion"
  );


  /*
  =========================================
  Mutation ID
  =========================================
  */

  if (
    mutation.mutationId !==
      null
  ) {

    EntityMutationContract_assertNonEmptyString(
      mutation.mutationId,
      "mutationId"
    );

  }


  /*
  =========================================
  Mutation Type
  =========================================
  */

  EntityMutationContract_assertAllowedValue(
    mutation.mutationType,
    ENTITY_MUTATION_ALLOWED_TYPES,
    "mutationType"
  );


  /*
  =========================================
  Subject
  =========================================
  */

  EntityMutationContract_validateSubject(
    mutation.subject,
    mutation.mutationType
  );


  /*
  =========================================
  Change Arrays
  =========================================
  */

  EntityMutationContract_validateChangeArray(
    mutation.identityChanges,
    "identityChanges"
  );

  EntityMutationContract_validateChangeArray(
    mutation.attributeChanges,
    "attributeChanges"
  );

  EntityMutationContract_validateRelationChanges(
    mutation.relationChanges
  );

  EntityMutationContract_validateChangeArray(
    mutation.stateChanges,
    "stateChanges"
  );

  EntityMutationContract_validateEvents(
    mutation.events
  );


  /*
  =========================================
  Snapshot Change
  =========================================
  */

  if (
    mutation.snapshotChange !==
      null
  ) {

    EntityMutationContract_validateSnapshotChange(
      mutation.snapshotChange
    );

  }


  /*
  =========================================
  Reason
  =========================================
  */

  if (
    mutation.reason !==
      null
  ) {

    EntityMutationContract_assertString(
      mutation.reason,
      "reason"
    );

  }


  /*
  =========================================
  Collections
  =========================================
  */

  EntityMutationContract_assertArray(
    mutation.evidence,
    "evidence"
  );

  EntityMutationContract_validateUnresolvedReferences(
    mutation.unresolvedReferences
  );

  EntityMutationContract_assertStringArray(
    mutation.missingFields,
    "missingFields"
  );


  /*
  =========================================
  Confirmation
  =========================================
  */

  EntityMutationContract_validateConfirmation(
    mutation.confirmation
  );


  /*
  =========================================
  Metadata
  =========================================
  */

  EntityMutationContract_validateMetadata(
    mutation.metadata
  );


  /*
  =========================================
  Mutation Type整合性
  =========================================
  */

  EntityMutationContract_validateTypeConsistency(
    mutation
  );


  return mutation;

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
 * @param {string} mutationType
 */
function EntityMutationContract_validateSubject(
  subject,
  mutationType
) {

  EntityMutationContract_assertObject(
    subject,
    "subject"
  );

  EntityMutationContract_assertAllowedValue(
    subject.entityType,
    ENTITY_MUTATION_ALLOWED_ENTITY_TYPES,
    "subject.entityType"
  );


  /*
   * Create Entityでは、
   * Entity IDはまだ存在しなくてよい。
   *
   * ただし、新しく成立させるEntityを
   * 人間が認識できる表現として、
   * entityQueryは必要とする。
   */
  if (
    mutationType ===
      "create_entity"
  ) {

    if (
      subject.entityId !==
        null
    ) {

      EntityMutationContract_assertNonEmptyString(
        subject.entityId,
        "subject.entityId"
      );

    }

    EntityMutationContract_assertNonEmptyString(
      subject.entityQuery,
      "subject.entityQuery"
    );

    return;

  }


  /*
   * 既存Entityに対するMutationでは、
   * entityIdまたはentityQueryが必要。
   *
   * Compose段階ではEntity Resolution前のため、
   * entityQueryのみでも許可する。
   */
  if (
    subject.entityId ===
      null &&
    !EntityMutationContract_isNonEmptyString(
      subject.entityQuery
    )
  ) {

    throw new Error(
      "subjectにはentityIdまたはentityQueryが必要です。"
    );

  }


  if (
    subject.entityId !==
      null
  ) {

    EntityMutationContract_assertNonEmptyString(
      subject.entityId,
      "subject.entityId"
    );

  }


  if (
    subject.entityQuery !==
      null
  ) {

    EntityMutationContract_assertNonEmptyString(
      subject.entityQuery,
      "subject.entityQuery"
    );

  }

}


/*
=========================================
Change
=========================================
*/

/**
 * Identity／Attribute／State Change配列を検証する。
 *
 * @param {Array} changes
 * @param {string} fieldName
 */
function EntityMutationContract_validateChangeArray(
  changes,
  fieldName
) {

  EntityMutationContract_assertArray(
    changes,
    fieldName
  );

  changes.forEach(
    function(change, index) {

      EntityMutationContract_validateChange(
        change,
        fieldName +
          "[" +
          index +
          "]"
      );

    }
  );

}


/**
 * Changeを検証する。
 *
 * @param {Object} change
 * @param {string} fieldName
 */
function EntityMutationContract_validateChange(
  change,
  fieldName
) {

  EntityMutationContract_assertObject(
    change,
    fieldName
  );

  EntityMutationContract_assertNonEmptyString(
    change.path,
    fieldName + ".path"
  );


  if (
    !Object.prototype.hasOwnProperty.call(
      change,
      "currentValue"
    )
  ) {

    throw new Error(
      fieldName +
      ".currentValueがありません。"
    );

  }


  if (
    !Object.prototype.hasOwnProperty.call(
      change,
      "proposedValue"
    )
  ) {

    throw new Error(
      fieldName +
      ".proposedValueがありません。"
    );

  }


  if (
    change.unit !==
      null
  ) {

    EntityMutationContract_assertNonEmptyString(
      change.unit,
      fieldName + ".unit"
    );

  }


  EntityMutationContract_validatePreservationPolicy(
    change.preservationPolicy,
    fieldName + ".preservationPolicy"
  );

}


/*
=========================================
Relation
=========================================
*/

/**
 * Relation Changeを検証する。
 *
 * @param {Array} relationChanges
 */
function EntityMutationContract_validateRelationChanges(
  relationChanges
) {

  EntityMutationContract_assertArray(
    relationChanges,
    "relationChanges"
  );

  relationChanges.forEach(
    function(relationChange, index) {

      const fieldName =
        "relationChanges[" +
        index +
        "]";

      EntityMutationContract_assertObject(
        relationChange,
        fieldName
      );

      EntityMutationContract_assertNonEmptyString(
        relationChange.relationType,
        fieldName + ".relationType"
      );


      if (
        !Object.prototype.hasOwnProperty.call(
          relationChange,
          "currentTarget"
        )
      ) {

        throw new Error(
          fieldName +
          ".currentTargetがありません。"
        );

      }


      if (
        !Object.prototype.hasOwnProperty.call(
          relationChange,
          "proposedTarget"
        )
      ) {

        throw new Error(
          fieldName +
          ".proposedTargetがありません。"
        );

      }


      if (
        relationChange.currentTarget !==
          null
      ) {

        EntityMutationContract_validateEntityReference(
          relationChange.currentTarget,
          fieldName + ".currentTarget"
        );

      }


      if (
        relationChange.proposedTarget !==
          null
      ) {

        EntityMutationContract_validateEntityReference(
          relationChange.proposedTarget,
          fieldName + ".proposedTarget"
        );

      }


      EntityMutationContract_validatePreservationPolicy(
        relationChange.preservationPolicy,
        fieldName + ".preservationPolicy"
      );

    }
  );

}


/**
 * Entity Referenceを検証する。
 *
 * @param {Object} reference
 * @param {string} fieldName
 */
function EntityMutationContract_validateEntityReference(
  reference,
  fieldName
) {

  EntityMutationContract_assertObject(
    reference,
    fieldName
  );

  EntityMutationContract_assertAllowedValue(
    reference.entityType,
    ENTITY_MUTATION_ALLOWED_ENTITY_TYPES,
    fieldName + ".entityType"
  );


  if (
    !Object.prototype.hasOwnProperty.call(
      reference,
      "entityId"
    )
  ) {

    throw new Error(
      fieldName +
      ".entityIdがありません。"
    );

  }


  if (
    !Object.prototype.hasOwnProperty.call(
      reference,
      "entityQuery"
    )
  ) {

    throw new Error(
      fieldName +
      ".entityQueryがありません。"
    );

  }


  if (
    reference.entityId !==
      null
  ) {

    EntityMutationContract_assertNonEmptyString(
      reference.entityId,
      fieldName + ".entityId"
    );

  }


  if (
    reference.entityQuery !==
      null
  ) {

    EntityMutationContract_assertNonEmptyString(
      reference.entityQuery,
      fieldName + ".entityQuery"
    );

  }


  if (
    reference.entityId ===
      null &&
    !EntityMutationContract_isNonEmptyString(
      reference.entityQuery
    )
  ) {

    throw new Error(
      fieldName +
      "にはentityIdまたはentityQueryが必要です。"
    );

  }

}


/*
=========================================
Unresolved Reference
=========================================
*/

/**
 * 未解決参照を検証する。
 *
 * @param {Array} unresolvedReferences
 */
function EntityMutationContract_validateUnresolvedReferences(
  unresolvedReferences
) {

  EntityMutationContract_assertArray(
    unresolvedReferences,
    "unresolvedReferences"
  );

  unresolvedReferences.forEach(
    function(reference, index) {

      const fieldName =
        "unresolvedReferences[" +
        index +
        "]";

      EntityMutationContract_assertObject(
        reference,
        fieldName
      );

      EntityMutationContract_assertNonEmptyString(
        reference.path,
        fieldName + ".path"
      );

      EntityMutationContract_assertAllowedValue(
        reference.entityType,
        ENTITY_MUTATION_ALLOWED_ENTITY_TYPES,
        fieldName + ".entityType"
      );

      EntityMutationContract_assertNonEmptyString(
        reference.entityQuery,
        fieldName + ".entityQuery"
      );

    }
  );

}


/*
=========================================
Event
=========================================
*/

/**
 * Eventを検証する。
 *
 * @param {Array} events
 */
function EntityMutationContract_validateEvents(
  events
) {

  EntityMutationContract_assertArray(
    events,
    "events"
  );

  events.forEach(
    function(event, index) {

      const fieldName =
        "events[" +
        index +
        "]";

      EntityMutationContract_assertObject(
        event,
        fieldName
      );

      EntityMutationContract_assertNonEmptyString(
        event.eventType,
        fieldName + ".eventType"
      );


      if (
        !Object.prototype.hasOwnProperty.call(
          event,
          "occurredAt"
        )
      ) {

        throw new Error(
          fieldName +
          ".occurredAtがありません。"
        );

      }


      if (
        !Object.prototype.hasOwnProperty.call(
          event,
          "details"
        )
      ) {

        throw new Error(
          fieldName +
          ".detailsがありません。"
        );

      }


      if (
        event.occurredAt !==
          null
      ) {

        EntityMutationContract_assertNonEmptyString(
          event.occurredAt,
          fieldName + ".occurredAt"
        );

      }


      if (
        event.details !==
          null
      ) {

        EntityMutationContract_assertObject(
          event.details,
          fieldName + ".details"
        );

      }

    }
  );

}


/*
=========================================
Snapshot
=========================================
*/

/**
 * Snapshot Changeを検証する。
 *
 * @param {Object} snapshotChange
 */
function EntityMutationContract_validateSnapshotChange(
  snapshotChange
) {

  EntityMutationContract_assertObject(
    snapshotChange,
    "snapshotChange"
  );

  EntityMutationContract_assertNonEmptyString(
    snapshotChange.snapshotType,
    "snapshotChange.snapshotType"
  );


  if (
    !Object.prototype.hasOwnProperty.call(
      snapshotChange,
      "currentSnapshotId"
    )
  ) {

    throw new Error(
      "snapshotChange.currentSnapshotIdがありません。"
    );

  }


  if (
    !Object.prototype.hasOwnProperty.call(
      snapshotChange,
      "proposedSnapshotId"
    )
  ) {

    throw new Error(
      "snapshotChange.proposedSnapshotIdがありません。"
    );

  }


  if (
    snapshotChange.currentSnapshotId !==
      null
  ) {

    EntityMutationContract_assertNonEmptyString(
      snapshotChange.currentSnapshotId,
      "snapshotChange.currentSnapshotId"
    );

  }


  if (
    snapshotChange.proposedSnapshotId !==
      null
  ) {

    EntityMutationContract_assertNonEmptyString(
      snapshotChange.proposedSnapshotId,
      "snapshotChange.proposedSnapshotId"
    );

  }


  EntityMutationContract_validatePreservationPolicy(
    snapshotChange.preservationPolicy,
    "snapshotChange.preservationPolicy"
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
function EntityMutationContract_validateConfirmation(
  confirmation
) {

  EntityMutationContract_assertObject(
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
function EntityMutationContract_validateMetadata(
  metadata
) {

  EntityMutationContract_assertObject(
    metadata,
    "metadata"
  );

  EntityMutationContract_assertNonEmptyString(
    metadata.source,
    "metadata.source"
  );


  if (
    metadata.requestedBy !==
      null
  ) {

    EntityMutationContract_assertNonEmptyString(
      metadata.requestedBy,
      "metadata.requestedBy"
    );

  }


  if (
    metadata.requestedAt !==
      null
  ) {

    EntityMutationContract_assertNonEmptyString(
      metadata.requestedAt,
      "metadata.requestedAt"
    );

  }

}


/*
=========================================
Mutation Type整合性
=========================================
*/

/**
 * Mutation Typeと内容の整合性を検証する。
 *
 * Mutationには複数種類のChangeが
 * 同時に含まれる可能性がある。
 *
 * mutationTypeは、そのMutationの
 * 中心となる変化を表す。
 *
 * @param {Object} mutation
 */
function EntityMutationContract_validateTypeConsistency(
  mutation
) {

  switch (
    mutation.mutationType
  ) {

    case "create_entity":

      EntityMutationContract_validateCreateEntityConsistency(
        mutation
      );

      return;


    case "change_identity":

      EntityMutationContract_assertNotEmptyArray(
        mutation.identityChanges,
        "identityChanges"
      );

      return;


    case "change_attribute":

      EntityMutationContract_assertNotEmptyArray(
        mutation.attributeChanges,
        "attributeChanges"
      );

      return;


    case "create_relation":
    case "change_relation":

      EntityMutationContract_assertNotEmptyArray(
        mutation.relationChanges,
        "relationChanges"
      );

      return;


    case "change_state":

      EntityMutationContract_assertNotEmptyArray(
        mutation.stateChanges,
        "stateChanges"
      );

      return;


    case "append_event":

      EntityMutationContract_assertNotEmptyArray(
        mutation.events,
        "events"
      );

      return;


    case "set_current_snapshot":

      if (
        mutation.snapshotChange ===
          null
      ) {

        throw new Error(
          "set_current_snapshotにはsnapshotChangeが必要です。"
        );

      }

      return;


    default:

      throw new Error(
        "未対応のmutationTypeです。"
      );

  }

}


/**
 * Create Entityの整合性を検証する。
 *
 * 新しいEntityには、
 * 少なくとも一つ以上のIdentity情報が必要。
 *
 * @param {Object} mutation
 */
function EntityMutationContract_validateCreateEntityConsistency(
  mutation
) {

  if (
    mutation.identityChanges.length ===
      0
  ) {

    throw new Error(
      "create_entityには1件以上のidentityChangesが必要です。"
    );

  }


  mutation.identityChanges.forEach(
    function(change, index) {

      if (
        change.currentValue !==
          null
      ) {

        throw new Error(
          "create_entityのidentityChanges[" +
          index +
          "].currentValueはnullである必要があります。"
        );

      }

    }
  );

}


/*
=========================================
Preservation Policy
=========================================
*/

/**
 * Preservation Policyを検証する。
 *
 * @param {string|null} preservationPolicy
 * @param {string} fieldName
 */
function EntityMutationContract_validatePreservationPolicy(
  preservationPolicy,
  fieldName
) {

  if (
    preservationPolicy ===
      null
  ) {

    throw new Error(
      fieldName +
      "がありません。"
    );

  }

  EntityMutationContract_assertAllowedValue(
    preservationPolicy,
    ENTITY_MUTATION_ALLOWED_PRESERVATION_POLICIES,
    fieldName
  );

}


/*
=========================================
共通Assertion
=========================================
*/

function EntityMutationContract_assertObject(
  value,
  fieldName
) {

  if (
    !value ||
    typeof value !==
      "object" ||
    Array.isArray(
      value
    )
  ) {

    throw new Error(
      fieldName +
      "はObjectである必要があります。"
    );

  }

}


function EntityMutationContract_assertArray(
  value,
  fieldName
) {

  if (
    !Array.isArray(
      value
    )
  ) {

    throw new Error(
      fieldName +
      "はArrayである必要があります。"
    );

  }

}


function EntityMutationContract_assertNotEmptyArray(
  value,
  fieldName
) {

  EntityMutationContract_assertArray(
    value,
    fieldName
  );

  if (
    value.length ===
      0
  ) {

    throw new Error(
      fieldName +
      "には1件以上の要素が必要です。"
    );

  }

}


function EntityMutationContract_assertString(
  value,
  fieldName
) {

  if (
    typeof value !==
      "string"
  ) {

    throw new Error(
      fieldName +
      "はstringである必要があります。"
    );

  }

}


function EntityMutationContract_assertNonEmptyString(
  value,
  fieldName
) {

  if (
    !EntityMutationContract_isNonEmptyString(
      value
    )
  ) {

    throw new Error(
      fieldName +
      "は空でないstringである必要があります。"
    );

  }

}


function EntityMutationContract_assertStringArray(
  value,
  fieldName
) {

  EntityMutationContract_assertArray(
    value,
    fieldName
  );

  value.forEach(
    function(item, index) {

      EntityMutationContract_assertNonEmptyString(
        item,
        fieldName +
          "[" +
          index +
          "]"
      );

    }
  );

}


function EntityMutationContract_assertAllowedValue(
  value,
  allowedValues,
  fieldName
) {

  if (
    allowedValues.indexOf(
      value
    ) ===
      -1
  ) {

    throw new Error(
      fieldName +
      "に未対応の値が指定されています: " +
      value
    );

  }

}


function EntityMutationContract_assertEqual(
  actual,
  expected,
  fieldName
) {

  if (
    actual !==
      expected
  ) {

    throw new Error(
      fieldName +
      "が不正です。expected=" +
      expected +
      ", actual=" +
      actual
    );

  }

}


/**
 * 値が空ではない文字列かを判定する。
 *
 * @param {*} value
 * @return {boolean}
 */
function EntityMutationContract_isNonEmptyString(
  value
) {

  return (
    typeof value ===
      "string" &&
    value.trim() !==
      ""
  );

}


