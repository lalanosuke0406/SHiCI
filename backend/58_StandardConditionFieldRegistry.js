/*
=========================================
SHiCI
58_StandardConditionFieldRegistry.js

Standard Condition Field Registry
Version 1.0

役割：
・標準成形条件として更新可能なFieldを一元定義する
・Understanding Resultのchange.fieldから定義を取得する
・Canonical Path、Spreadsheet Header、単位、
  表示名、保存方針を提供する
・各Engineが項目別の個別分岐を持つことを防ぐ

禁止：
・自然言語を解析しない
・Entityを解決しない
・Snapshotを取得しない
・Change Planを生成しない
・Spreadsheetを更新しない
・実行処理を行わない

設計：
change.field
    ↓
StandardConditionFieldRegistry
    ↓
Field Definition
    ├─ path
    ├─ spreadsheetHeader
    ├─ label
    ├─ valueType
    ├─ canonicalUnit
    └─ preservationPolicy
=========================================
*/


/*
=========================================
Registry Version
=========================================
*/

const STANDARD_CONDITION_FIELD_REGISTRY_VERSION =
  "1.0";


/*
=========================================
Preservation Policy
=========================================
*/

const STANDARD_CONDITION_FIELD_PRESERVATION_CREATE_NEW_VERSION =
  "create_new_version";


/*
=========================================
Field Definitions
=========================================
*/

/**
 * 標準成形条件として更新可能なField定義。
 *
 * Ver.1.0では、
 * ・金型温度
 * ・冷却時間
 * の2項目だけを登録する。
 *
 * @type {Object}
 */
const STANDARD_CONDITION_FIELD_DEFINITIONS = {

  mold_temperature: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "mold_temperature",

    path:
      "standard_condition.mold_temperature",

    spreadsheetHeader:
      "金型温度(℃)",

    label:
      "金型温度",

    valueType:
      "number",

    canonicalUnit:
      "celsius",

    displayUnit:
      "℃",

    preservationPolicy:
      STANDARD_CONDITION_FIELD_PRESERVATION_CREATE_NEW_VERSION,

    group:
      "standard_condition",

    enabled:
      true

  },


  cooling_time: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "cooling_time",

    path:
      "standard_condition.cooling_time",

    spreadsheetHeader:
      "冷却時間",

    label:
      "冷却時間",

    valueType:
      "number",

    canonicalUnit:
      "second",

    displayUnit:
      "秒",

    preservationPolicy:
      STANDARD_CONDITION_FIELD_PRESERVATION_CREATE_NEW_VERSION,

    group:
      "standard_condition",

    enabled:
      true

  },


  holding_pressure_p1: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "holding_pressure_p1",

    path:
      "standard_condition.holding_pressure_p1",

    spreadsheetHeader:
      "保圧力:P1",

    label:
      "保圧力 P1",

    valueType:
      "number",

    canonicalUnit:
      "megapascal",

    displayUnit:
      "MPa",

    preservationPolicy:
      STANDARD_CONDITION_FIELD_PRESERVATION_CREATE_NEW_VERSION,

    group:
      "standard_condition",

    enabled:
      true

  }

};


/*
=========================================
Public API
=========================================
*/

/**
 * change.fieldに対応するField Definitionを取得する。
 *
 * 未登録Fieldの場合はnullを返す。
 *
 * @param {string} changeField
 * @return {Object|null}
 */
function StandardConditionFieldRegistry_find(
  changeField
) {

  const normalizedChangeField =
    StandardConditionFieldRegistry_normalizeChangeField(
      changeField
    );


  if (
    normalizedChangeField ===
      null
  ) {

    return null;

  }


  const definition =
    STANDARD_CONDITION_FIELD_DEFINITIONS[
      normalizedChangeField
    ];


  if (
    !definition ||
    definition.enabled !==
      true
  ) {

    return null;

  }


  StandardConditionFieldRegistry_validateDefinition(
    definition
  );


  return StandardConditionFieldRegistry_deepCopy(
    definition
  );

}







/**
 * Canonical Pathに対応する
 * Field Definitionを取得する。
 *
 * 未登録Pathの場合はnullを返す。
 *
 * @param {string} path
 * @return {Object|null}
 */
function StandardConditionFieldRegistry_findByPath(
  path
) {

  if (
    typeof path !==
      "string"
  ) {

    return null;

  }


  const normalizedPath =
    path.trim();


  if (
    normalizedPath ===
      ""
  ) {

    return null;

  }


  const definitions =
    StandardConditionFieldRegistry_list();


  const definition =
    definitions.find(
      function(candidate) {

        return (
          candidate.path ===
            normalizedPath
        );

      }
    ) ||
    null;


  return definition ===
    null
    ? null
    : StandardConditionFieldRegistry_deepCopy(
        definition
      );

}


/**
 * Canonical Pathに対応する
 * Field Definitionを必須取得する。
 *
 * @param {string} path
 * @return {Object}
 */
function StandardConditionFieldRegistry_requireByPath(
  path
) {

  const definition =
    StandardConditionFieldRegistry_findByPath(
      path
    );


  if (
    definition ===
      null
  ) {

    throw new Error(
      "未登録の標準成形条件Pathです。" +
      " path=" +
      String(
        path
      )
    );

  }


  return definition;

}









/**
 * 登録済みField Definitionを必須取得する。
 *
 * 未登録Fieldの場合は例外を発生させる。
 *
 * @param {string} changeField
 * @return {Object}
 */
function StandardConditionFieldRegistry_require(
  changeField
) {

  const definition =
    StandardConditionFieldRegistry_find(
      changeField
    );


  if (
    definition ===
      null
  ) {

    throw new Error(
      "未登録の標準成形条件Fieldです。" +
      " changeField=" +
      String(
        changeField
      )
    );

  }


  return definition;

}


/**
 * 指定FieldがRegistry対応項目か確認する。
 *
 * @param {string} changeField
 * @return {boolean}
 */
function StandardConditionFieldRegistry_isSupported(
  changeField
) {

  return (
    StandardConditionFieldRegistry_find(
      changeField
    ) !==
      null
  );

}


/**
 * 有効なField Definition一覧を返す。
 *
 * @return {Array<Object>}
 */
function StandardConditionFieldRegistry_list() {

  return Object.keys(
    STANDARD_CONDITION_FIELD_DEFINITIONS
  )
    .map(
      function(changeField) {

        return StandardConditionFieldRegistry_find(
          changeField
        );

      }
    )
    .filter(
      function(definition) {

        return definition !==
          null;

      }
    );

}


/**
 * 登録済みchange.field一覧を返す。
 *
 * @return {Array<string>}
 */
function StandardConditionFieldRegistry_listChangeFields() {

  return StandardConditionFieldRegistry_list()
    .map(
      function(definition) {

        return definition.changeField;

      }
    );

}


/*
=========================================
Definition Validation
=========================================
*/

/**
 * Field Definitionを検証する。
 *
 * @param {Object} definition
 * @return {boolean}
 */
function StandardConditionFieldRegistry_validateDefinition(
  definition
) {

  StandardConditionFieldRegistry_assertObject(
    definition,
    "definition"
  );


  StandardConditionFieldRegistry_requireNonEmptyString(
    definition.registryVersion,
    "definition.registryVersion"
  );


  if (
    definition.registryVersion !==
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION
  ) {

    throw new Error(
      "Field DefinitionのregistryVersionが不正です。" +
      " registryVersion=" +
      String(
        definition.registryVersion
      )
    );

  }


  StandardConditionFieldRegistry_requireNonEmptyString(
    definition.changeField,
    "definition.changeField"
  );


  StandardConditionFieldRegistry_requireNonEmptyString(
    definition.path,
    "definition.path"
  );


  StandardConditionFieldRegistry_requireNonEmptyString(
    definition.spreadsheetHeader,
    "definition.spreadsheetHeader"
  );


  StandardConditionFieldRegistry_requireNonEmptyString(
    definition.label,
    "definition.label"
  );


  StandardConditionFieldRegistry_requireNonEmptyString(
    definition.valueType,
    "definition.valueType"
  );


  StandardConditionFieldRegistry_requireNonEmptyString(
    definition.canonicalUnit,
    "definition.canonicalUnit"
  );


  StandardConditionFieldRegistry_requireNonEmptyString(
    definition.displayUnit,
    "definition.displayUnit"
  );


  StandardConditionFieldRegistry_requireNonEmptyString(
    definition.preservationPolicy,
    "definition.preservationPolicy"
  );


  StandardConditionFieldRegistry_requireNonEmptyString(
    definition.group,
    "definition.group"
  );


  if (
    definition.valueType !==
      "number"
  ) {

    throw new Error(
      "Standard Condition Field Ver.1.0では" +
      "valueType=numberだけを扱います。"
    );

  }


  if (
    definition.preservationPolicy !==
      STANDARD_CONDITION_FIELD_PRESERVATION_CREATE_NEW_VERSION
  ) {

    throw new Error(
      "未対応のpreservationPolicyです。" +
      " preservationPolicy=" +
      String(
        definition.preservationPolicy
      )
    );

  }


  if (
    definition.group !==
      "standard_condition"
  ) {

    throw new Error(
      "Field Definitionのgroupが不正です。" +
      " group=" +
      String(
        definition.group
      )
    );

  }


  if (
    definition.enabled !==
      true &&
    definition.enabled !==
      false
  ) {

    throw new Error(
      "definition.enabledはbooleanである必要があります。"
    );

  }


  return true;

}


/*
=========================================
Normalization
=========================================
*/

/**
 * change.fieldを正規化する。
 *
 * @param {*} changeField
 * @return {string|null}
 */
function StandardConditionFieldRegistry_normalizeChangeField(
  changeField
) {

  if (
    typeof changeField !==
      "string"
  ) {

    return null;

  }


  const normalized =
    changeField
      .trim()
      .toLowerCase();


  return normalized ===
    ""
    ? null
    : normalized;

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
function StandardConditionFieldRegistry_deepCopy(
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
function StandardConditionFieldRegistry_assertObject(
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
function StandardConditionFieldRegistry_requireNonEmptyString(
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