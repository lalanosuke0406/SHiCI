/*
=========================================
SHiCI
37_ProductMutationAdapter.js

Product Mutation Adapter
Version 1.0

役割：
・Understanding Result Ver.2.0を
  Product Entityに対するMutationへ変換する
・自然言語上の変更要求を、
  Entity世界に起きる変化として構造化する

初期対応：
・Productの標準成形条件に属する
  金型温度の変更

禁止：
・Entity Resolutionを行わない
・現在値を取得しない
・Snapshotを生成しない
・Storageへ書き込まない
・CRUD関数を呼び出さない
・存在しない情報を推測しない
=========================================
*/


/*
=========================================
Entry Point
=========================================
*/

/**
 * Understanding Resultを
 * Product Entity Mutationへ変換する。
 *
 * Update Intent以外の場合はnullを返す。
 *
 * 現在の初期対応範囲外の変更項目についても、
 * nullを返す。
 *
 * @param {Object} understandingResult
 * @return {Object|null}
 */
function ProductMutationAdapter_convert(
  understandingResult
) {

  ProductMutationAdapter_assertObject(
    understandingResult,
    "understandingResult"
  );


  /*
  =========================================
  Understanding Contract確認
  =========================================
  */

  UnderstandingResultContract_validate(
    understandingResult
  );


  /*
  =========================================
  Update判定
  =========================================
  */

  if (
    !understandingResult.intent ||
    understandingResult.intent.type !==
      "update"
  ) {

    return null;

  }


  /*
  =========================================
  Knowledge Boundary確認
  =========================================
  */

  if (
    !understandingResult.knowledgeBoundary ||
    understandingResult
      .knowledgeBoundary
      .type !==
        "company_knowledge"
  ) {

    return null;

  }


  /*
  =========================================
  Entity Type確認
  =========================================
  */

  const entityType =
    ProductMutationAdapter_getEntityType(
      understandingResult
    );


  if (
    entityType !==
      "product"
  ) {

    return null;

  }


  /*
  =========================================
  Change Fieldによる変換
  =========================================
  */

  const changeField =
    understandingResult.change
      ? understandingResult.change.field
      : null;


  const fieldDefinition =
    StandardConditionFieldRegistry_find(
      changeField
    );


  if (
    fieldDefinition ===
      null
  ) {

    return null;

  }


  return ProductMutationAdapter_convertStandardConditionField(
    understandingResult,
    fieldDefinition
  );

}


/*
=========================================
Mold Temperature
=========================================
*/

/**
 * 標準成形条件Fieldの変更要求を
 * Entity Mutationへ変換する。
 *
 * Field固有情報は、
 * StandardConditionFieldRegistryから受け取る。
 *
 * この段階では、
 *
 * ・対象Product ID
 * ・現在のCondition ID
 * ・現在値
 * ・新しいCondition ID
 *
 * はまだ確定しない。
 *
 * それらはEntity Resolutionおよび
 * Snapshot取得後に補完する。
 *
 * @param {Object} understandingResult
 * @param {Object} fieldDefinition
 * @return {Object}
 */
function ProductMutationAdapter_convertStandardConditionField(
  understandingResult,
  fieldDefinition
) {

  UnderstandingResultContract_validate(
    understandingResult
  );


  StandardConditionFieldRegistry_validateDefinition(
    fieldDefinition
  );


  const proposedValue =
    ProductMutationAdapter_getChangeValue(
      understandingResult
    );


  const canonicalUnit =
    ProductMutationAdapter_getCanonicalUnit(
      understandingResult
    );


  /*
   * Understanding Resultの単位と、
   * Registryの正式単位が一致していることを確認する。
   */
  if (
    canonicalUnit !==
      fieldDefinition.canonicalUnit
  ) {

    throw new Error(
      "標準成形条件Fieldの単位が一致しません。" +
      " changeField=" +
      fieldDefinition.changeField +
      " expectedUnit=" +
      fieldDefinition.canonicalUnit +
      " actualUnit=" +
      canonicalUnit
    );

  }


  const mutation =
    EntityMutationContract_createEmpty();


  mutation.mutationType =
    "change_state";


  /*
  =========================================
  Subject
  =========================================
  */

  mutation.subject.entityType =
    "product";

  mutation.subject.entityId =
    null;

  mutation.subject.entityQuery =
    ProductMutationAdapter_getEntityQuery(
      understandingResult
    );


  /*
  =========================================
  State Change
  =========================================
  */

  mutation.stateChanges.push({

    path:
      fieldDefinition.path,

    currentValue:
      null,

    proposedValue:
      proposedValue,

    unit:
      fieldDefinition.canonicalUnit,

    preservationPolicy:
      fieldDefinition.preservationPolicy

  });


  /*
  =========================================
  Snapshot Change
  =========================================
  */

  mutation.snapshotChange = {

    snapshotType:
      "condition",

    currentSnapshotId:
      null,

    proposedSnapshotId:
      null,

    preservationPolicy:
      fieldDefinition.preservationPolicy

  };


  /*
  =========================================
  Event
  =========================================
  */

  mutation.events.push({

    eventType:
      "condition_change_requested",

    occurredAt:
      null,

    details: {

      field:
        fieldDefinition.changeField,

      path:
        fieldDefinition.path,

      label:
        fieldDefinition.label,

      currentValue:
        null,

      proposedValue:
        proposedValue,

      unit:
        fieldDefinition.canonicalUnit

    }

  });


  /*
  =========================================
  Reason
  =========================================
  */

  mutation.reason =
    ProductMutationAdapter_getOriginalText(
      understandingResult
    );


  /*
  =========================================
  Missing Fields
  =========================================
  */

  mutation.missingFields =
    ProductMutationAdapter_copyMissingFields(
      understandingResult
    );


  /*
  =========================================
  Metadata
  =========================================
  */

  mutation.metadata.source =
    "understanding_result";

  mutation.metadata.requestedBy =
    null;

  mutation.metadata.requestedAt =
    null;


  /*
  =========================================
  Contract Validation
  =========================================
  */

  return EntityMutationContract_validate(
    mutation
  );

}


/*
=========================================
Understanding Result取得
=========================================
*/

/**
 * Entity Typeを取得する。
 *
 * @param {Object} understandingResult
 * @return {string|null}
 */
function ProductMutationAdapter_getEntityType(
  understandingResult
) {

  if (
    !understandingResult.entity
  ) {

    return null;

  }


  const entityTypeHint =
    understandingResult
      .entity
      .entityTypeHint;


  if (
    typeof entityTypeHint !==
      "string"
  ) {

    return null;

  }


  const normalized =
    entityTypeHint
      .trim()
      .toLowerCase();


  return normalized !==
    ""
      ? normalized
      : null;

}


/**
 * Entity Queryを取得する。
 *
 * @param {Object} understandingResult
 * @return {string|null}
 */
function ProductMutationAdapter_getEntityQuery(
  understandingResult
) {

  if (
    !understandingResult.entity
  ) {

    return null;

  }


  const query =
    understandingResult.entity.query;


  if (
    typeof query !==
      "string"
  ) {

    return null;

  }


  const normalized =
    query.trim();


  return normalized !==
    ""
      ? normalized
      : null;

}


/**
 * 変更後の値を取得する。
 *
 * @param {Object} understandingResult
 * @return {*}
 */
function ProductMutationAdapter_getChangeValue(
  understandingResult
) {

  if (
    !understandingResult.change
  ) {

    return null;

  }


  if (
    !Object.prototype.hasOwnProperty.call(
      understandingResult.change,
      "value"
    )
  ) {

    return null;

  }


  return understandingResult.change.value;

}


/**
 * Canonical Unitを取得する。
 *
 * 金型温度は、
 * Understanding Contract上では
 * celsiusを使用する。
 *
 * @param {Object} understandingResult
 * @return {string}
 */
function ProductMutationAdapter_getCanonicalUnit(
  understandingResult
) {

  if (
    understandingResult.change &&
    typeof understandingResult.change.unit ===
      "string" &&
    understandingResult.change.unit.trim() !==
      ""
  ) {

    return understandingResult
      .change
      .unit
      .trim();

  }


  return "celsius";

}


/**
 * 元のユーザー入力を取得する。
 *
 * @param {Object} understandingResult
 * @return {string|null}
 */
function ProductMutationAdapter_getOriginalText(
  understandingResult
) {

  if (
    !understandingResult.input ||
    typeof understandingResult
      .input
      .originalText !==
        "string"
  ) {

    return null;

  }


  const originalText =
    understandingResult
      .input
      .originalText
      .trim();


  return originalText !==
    ""
      ? originalText
      : null;

}


/**
 * missingFieldsを複製する。
 *
 * Understanding Resultを
 * Mutation側から変更しないため、
 * 新しいArrayとして返す。
 *
 * @param {Object} understandingResult
 * @return {Array}
 */
function ProductMutationAdapter_copyMissingFields(
  understandingResult
) {

  if (
    !Array.isArray(
      understandingResult.missingFields
    )
  ) {

    return [];

  }


  return understandingResult
    .missingFields
    .slice();

}


/*
=========================================
Assertion
=========================================
*/

function ProductMutationAdapter_assertObject(
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



