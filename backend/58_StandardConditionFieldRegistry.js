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


  metering_position: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "metering_position",

    path:
      "standard_condition.metering_position",

    spreadsheetHeader:
      "計量値(mm)",

    label:
      "計量値",

    valueType:
      "number",

    canonicalUnit:
      "millimeter",

    displayUnit:
      "mm",

    preservationPolicy:
      STANDARD_CONDITION_FIELD_PRESERVATION_CREATE_NEW_VERSION,

    group:
      "standard_condition",

    enabled:
      true

  },


  pressure_limit: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "pressure_limit",

    path:
      "standard_condition.pressure_limit",

    spreadsheetHeader:
      "上限圧(MPa)",

    label:
      "上限圧",

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

  },


  pressure_limit_time: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "pressure_limit_time",

    path:
      "standard_condition.pressure_limit_time",

    spreadsheetHeader:
      "上限時間(秒)",

    label:
      "上限時間",

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


  holding_speed: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "holding_speed",

    path:
      "standard_condition.holding_speed",

    spreadsheetHeader:
      "保圧速度(mm/s)",

    label:
      "保圧速度",

    valueType:
      "number",

    canonicalUnit:
      "millimeter_per_second",

    displayUnit:
      "mm/s",

    preservationPolicy:
      STANDARD_CONDITION_FIELD_PRESERVATION_CREATE_NEW_VERSION,

    group:
      "standard_condition",

    enabled:
      true

  },


  

  resin_temperature_z0: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "resin_temperature_z0",

    path:
      "standard_condition.resin_temperature_z0",

    spreadsheetHeader:
      "樹脂温:Z0",

    label:
      "樹脂温 Z0",

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

  resin_temperature_z1: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "resin_temperature_z1",

    path:
      "standard_condition.resin_temperature_z1",

    spreadsheetHeader:
      "樹脂温:Z1",

    label:
      "樹脂温 Z1",

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

  resin_temperature_z2: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "resin_temperature_z2",

    path:
      "standard_condition.resin_temperature_z2",

    spreadsheetHeader:
      "樹脂温:Z2",

    label:
      "樹脂温 Z2",

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

  resin_temperature_zp: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "resin_temperature_zp",

    path:
      "standard_condition.resin_temperature_zp",

    spreadsheetHeader:
      "樹脂温:ZP",

    label:
      "樹脂温 ZP",

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

  resin_temperature_zj: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "resin_temperature_zj",

    path:
      "standard_condition.resin_temperature_zj",

    spreadsheetHeader:
      "樹脂温:ZJ",

    label:
      "樹脂温 ZJ",

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

  resin_temperature_z4: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "resin_temperature_z4",

    path:
      "standard_condition.resin_temperature_z4",

    spreadsheetHeader:
      "樹脂温:Z4",

    label:
      "樹脂温 Z4",

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

  resin_temperature_z5: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "resin_temperature_z5",

    path:
      "standard_condition.resin_temperature_z5",

    spreadsheetHeader:
      "樹脂温:Z5",

    label:
      "樹脂温 Z5",

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

  resin_temperature_z6: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "resin_temperature_z6",

    path:
      "standard_condition.resin_temperature_z6",

    spreadsheetHeader:
      "樹脂温:Z6",

    label:
      "樹脂温 Z6",

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

  resin_temperature_zh: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "resin_temperature_zh",

    path:
      "standard_condition.resin_temperature_zh",

    spreadsheetHeader:
      "樹脂温:ZH",

    label:
      "樹脂温 ZH",

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



  injection_speed_v1: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "injection_speed_v1",

    path:
      "standard_condition.injection_speed_v1",

    spreadsheetHeader:
      "射出速度:V1",

    label:
      "射出速度 V1",

    valueType:
      "number",

    canonicalUnit:
      "millimeter_per_second",

    displayUnit:
      "mm/s",

    preservationPolicy:
      STANDARD_CONDITION_FIELD_PRESERVATION_CREATE_NEW_VERSION,

    group:
      "standard_condition",

    enabled:
      true

  },

  injection_stroke_s1: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "injection_stroke_s1",

    path:
      "standard_condition.injection_stroke_s1",

    spreadsheetHeader:
      "射出ストローク:S1",

    label:
      "射出ストローク S1",

    valueType:
      "number",

    canonicalUnit:
      "millimeter",

    displayUnit:
      "mm",

    preservationPolicy:
      STANDARD_CONDITION_FIELD_PRESERVATION_CREATE_NEW_VERSION,

    group:
      "standard_condition",

    enabled:
      true

  },

  injection_speed_v2: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "injection_speed_v2",

    path:
      "standard_condition.injection_speed_v2",

    spreadsheetHeader:
      "射出速度:V2",

    label:
      "射出速度 V2",

    valueType:
      "number",

    canonicalUnit:
      "millimeter_per_second",

    displayUnit:
      "mm/s",

    preservationPolicy:
      STANDARD_CONDITION_FIELD_PRESERVATION_CREATE_NEW_VERSION,

    group:
      "standard_condition",

    enabled:
      true

  },

  injection_stroke_s2: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "injection_stroke_s2",

    path:
      "standard_condition.injection_stroke_s2",

    spreadsheetHeader:
      "射出ストローク:S2",

    label:
      "射出ストローク S2",

    valueType:
      "number",

    canonicalUnit:
      "millimeter",

    displayUnit:
      "mm",

    preservationPolicy:
      STANDARD_CONDITION_FIELD_PRESERVATION_CREATE_NEW_VERSION,

    group:
      "standard_condition",

    enabled:
      true

  },

  injection_speed_v3: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "injection_speed_v3",

    path:
      "standard_condition.injection_speed_v3",

    spreadsheetHeader:
      "射出速度:V3",

    label:
      "射出速度 V3",

    valueType:
      "number",

    canonicalUnit:
      "millimeter_per_second",

    displayUnit:
      "mm/s",

    preservationPolicy:
      STANDARD_CONDITION_FIELD_PRESERVATION_CREATE_NEW_VERSION,

    group:
      "standard_condition",

    enabled:
      true

  },

  injection_stroke_s3: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "injection_stroke_s3",

    path:
      "standard_condition.injection_stroke_s3",

    spreadsheetHeader:
      "射出ストローク:S3",

    label:
      "射出ストローク S3",

    valueType:
      "number",

    canonicalUnit:
      "millimeter",

    displayUnit:
      "mm",

    preservationPolicy:
      STANDARD_CONDITION_FIELD_PRESERVATION_CREATE_NEW_VERSION,

    group:
      "standard_condition",

    enabled:
      true

  },

  injection_speed_v4: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "injection_speed_v4",

    path:
      "standard_condition.injection_speed_v4",

    spreadsheetHeader:
      "射出速度:V4",

    label:
      "射出速度 V4",

    valueType:
      "number",

    canonicalUnit:
      "millimeter_per_second",

    displayUnit:
      "mm/s",

    preservationPolicy:
      STANDARD_CONDITION_FIELD_PRESERVATION_CREATE_NEW_VERSION,

    group:
      "standard_condition",

    enabled:
      true

  },

  injection_stroke_s4: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "injection_stroke_s4",

    path:
      "standard_condition.injection_stroke_s4",

    spreadsheetHeader:
      "射出ストローク:S4",

    label:
      "射出ストローク S4",

    valueType:
      "number",

    canonicalUnit:
      "millimeter",

    displayUnit:
      "mm",

    preservationPolicy:
      STANDARD_CONDITION_FIELD_PRESERVATION_CREATE_NEW_VERSION,

    group:
      "standard_condition",

    enabled:
      true

  },

  injection_speed_v5: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "injection_speed_v5",

    path:
      "standard_condition.injection_speed_v5",

    spreadsheetHeader:
      "射出速度:V5",

    label:
      "射出速度 V5",

    valueType:
      "number",

    canonicalUnit:
      "millimeter_per_second",

    displayUnit:
      "mm/s",

    preservationPolicy:
      STANDARD_CONDITION_FIELD_PRESERVATION_CREATE_NEW_VERSION,

    group:
      "standard_condition",

    enabled:
      true

  },

  injection_stroke_s5: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "injection_stroke_s5",

    path:
      "standard_condition.injection_stroke_s5",

    spreadsheetHeader:
      "射出ストローク:S5",

    label:
      "射出ストローク S5",

    valueType:
      "number",

    canonicalUnit:
      "millimeter",

    displayUnit:
      "mm",

    preservationPolicy:
      STANDARD_CONDITION_FIELD_PRESERVATION_CREATE_NEW_VERSION,

    group:
      "standard_condition",

    enabled:
      true

  },



  injection_speed_ramp_1: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "injection_speed_ramp_1",

    path:
      "standard_condition.injection_speed_ramp_1",

    spreadsheetHeader:
      "速度徐変1(ON/OFF)",

    label:
      "速度徐変1",

    valueType:
      "boolean",

    canonicalUnit:
      null,

    displayUnit:
      null,

    preservationPolicy:
      STANDARD_CONDITION_FIELD_PRESERVATION_CREATE_NEW_VERSION,

    group:
      "standard_condition",

    enabled:
      true

  },

  injection_speed_ramp_2: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "injection_speed_ramp_2",

    path:
      "standard_condition.injection_speed_ramp_2",

    spreadsheetHeader:
      "速度徐変2(ON/OFF)",

    label:
      "速度徐変2",

    valueType:
      "boolean",

    canonicalUnit:
      null,

    displayUnit:
      null,

    preservationPolicy:
      STANDARD_CONDITION_FIELD_PRESERVATION_CREATE_NEW_VERSION,

    group:
      "standard_condition",

    enabled:
      true

  },


  injection_speed_ramp_3: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "injection_speed_ramp_3",

    path:
      "standard_condition.injection_speed_ramp_3",

    spreadsheetHeader:
      "速度徐変3(ON/OFF)",

    label:
      "速度徐変3",

    valueType:
      "boolean",

    canonicalUnit:
      null,

    displayUnit:
      null,

    preservationPolicy:
      STANDARD_CONDITION_FIELD_PRESERVATION_CREATE_NEW_VERSION,

    group:
      "standard_condition",

    enabled:
      true

  },


  injection_speed_ramp_4: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "injection_speed_ramp_4",

    path:
      "standard_condition.injection_speed_ramp_4",

    spreadsheetHeader:
      "速度徐変4(ON/OFF)",

    label:
      "速度徐変4",

    valueType:
      "boolean",

    canonicalUnit:
      null,

    displayUnit:
      null,

    preservationPolicy:
      STANDARD_CONDITION_FIELD_PRESERVATION_CREATE_NEW_VERSION,

    group:
      "standard_condition",

    enabled:
      true

  },


  injection_speed_ramp_5: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "injection_speed_ramp_5",

    path:
      "standard_condition.injection_speed_ramp_5",

    spreadsheetHeader:
      "速度徐変5(ON/OFF)",

    label:
      "速度徐変5",

    valueType:
      "boolean",

    canonicalUnit:
      null,

    displayUnit:
      null,

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

  },

  holding_time_t1: {

    registryVersion:
        STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
        "holding_time_t1",

    path:
        "standard_condition.holding_time_t1",

    spreadsheetHeader:
        "保圧時間:T1",

    label:
        "保圧時間 T1",

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

  holding_pressure_p2: {

    registryVersion:
        STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
        "holding_pressure_p2",

    path:
        "standard_condition.holding_pressure_p2",

    spreadsheetHeader:
        "保圧力:P2",

    label:
        "保圧力 P2",

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

  },

  holding_time_t2: {

    registryVersion:
        STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
        "holding_time_t2",

    path:
        "standard_condition.holding_time_t2",

    spreadsheetHeader:
        "保圧時間:T2",

    label:
        "保圧時間 T2",

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

  holding_pressure_p3: {

    registryVersion:
        STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
        "holding_pressure_p3",

    path:
        "standard_condition.holding_pressure_p3",

    spreadsheetHeader:
        "保圧力:P3",

    label:
        "保圧力 P3",

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

  },

  holding_time_t3: {

    registryVersion:
        STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
        "holding_time_t3",

    path:
        "standard_condition.holding_time_t3",

    spreadsheetHeader:
        "保圧時間:T3",

    label:
        "保圧時間 T3",

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

  holding_pressure_p4: {

    registryVersion:
        STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
        "holding_pressure_p4",

    path:
        "standard_condition.holding_pressure_p4",

    spreadsheetHeader:
        "保圧力:P4",

    label:
        "保圧力 P4",

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

  },

  holding_time_t4: {

    registryVersion:
        STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
        "holding_time_t4",

    path:
        "standard_condition.holding_time_t4",

    spreadsheetHeader:
        "保圧時間:T4",

    label:
        "保圧時間 T4",

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



  holding_ramp_1: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "holding_ramp_1",

    path:
      "standard_condition.holding_ramp_1",

    spreadsheetHeader:
      "保圧徐変1(ON/OFF)",

    label:
      "保圧徐変1",

    valueType:
      "boolean",

    canonicalUnit:
      null,

    displayUnit:
      null,

    preservationPolicy:
      STANDARD_CONDITION_FIELD_PRESERVATION_CREATE_NEW_VERSION,

    group:
      "standard_condition",

    enabled:
      true

  },


  holding_ramp_2: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "holding_ramp_2",

    path:
      "standard_condition.holding_ramp_2",

    spreadsheetHeader:
      "保圧徐変2(ON/OFF)",

    label:
      "保圧徐変2",

    valueType:
      "boolean",

    canonicalUnit:
      null,

    displayUnit:
      null,

    preservationPolicy:
      STANDARD_CONDITION_FIELD_PRESERVATION_CREATE_NEW_VERSION,

    group:
      "standard_condition",

    enabled:
      true

  },


  holding_ramp_3: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "holding_ramp_3",

    path:
      "standard_condition.holding_ramp_3",

    spreadsheetHeader:
      "保圧徐変3(ON/OFF)",

    label:
      "保圧徐変3",

    valueType:
      "boolean",

    canonicalUnit:
      null,

    displayUnit:
      null,

    preservationPolicy:
      STANDARD_CONDITION_FIELD_PRESERVATION_CREATE_NEW_VERSION,

    group:
      "standard_condition",

    enabled:
      true

  },


  holding_ramp_4: {

    registryVersion:
      STANDARD_CONDITION_FIELD_REGISTRY_VERSION,

    changeField:
      "holding_ramp_4",

    path:
      "standard_condition.holding_ramp_4",

    spreadsheetHeader:
      "保圧徐変4(ON/OFF)",

    label:
      "保圧徐変4",

    valueType:
      "boolean",

    canonicalUnit:
      null,

    displayUnit:
      null,

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


    if (
    definition.valueType ===
      "number"
  ) {

    StandardConditionFieldRegistry_requireNonEmptyString(
      definition.canonicalUnit,
      "definition.canonicalUnit"
    );


  StandardConditionFieldRegistry_requireNonEmptyString(
      definition.displayUnit,
      "definition.displayUnit"
    );

  } else if (
    definition.valueType ===
      "boolean"
  ) {

    if (
      definition.canonicalUnit !==
        null
    ) {

      throw new Error(
        "valueType=booleanの場合、canonicalUnitはnullである必要があります。"
      );

    }


    if (
      definition.displayUnit !==
        null
    ) {

      throw new Error(
        "valueType=booleanの場合、displayUnitはnullである必要があります。"
      );

    }

  }


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
        "number" &&
    definition.valueType !==
        "boolean"
  ) {

    throw new Error(
        "Standard Condition Field Ver.1.0では" +
        "valueType=numberまたはbooleanだけを扱います。"
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