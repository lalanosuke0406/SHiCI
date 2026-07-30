/*
=========================================
SHiCI
28_UpdateUnderstandingAdapter.js

役割：
・Understanding ResultのUpdate情報を、
  既存Update処理が受け取れる内部形式へ変換する

禁止：
・自然言語を解析しない
・LLMを呼び出さない
・Knowledgeを検索しない
・Entityを解決しない
・Snapshotを生成しない
・Conversation Stateを更新しない
・権限を判断しない
・更新案を生成しない
・データを書き換えない
=========================================
*/


/**
 * Understanding Resultを、
 * 既存Update処理用のUpdate Intentへ変換する。
 *
 * この関数は意味を理解しない。
 * 既に構造化された意味を、
 * 既存内部形式へ変換するだけである。
 *
 * @param {Object} understandingResult
 * @returns {Object|null}
 */
function UpdateUnderstandingAdapter_convert(
  understandingResult
) {

  /*
  =========================================
  Understanding Result確認
  =========================================
  */

  const validatedResult =
    UnderstandingResultContract_validate(
      understandingResult
    );


  /*
  =========================================
  Update以外は対象外
  =========================================
  */

  if (
    validatedResult.intent.type !==
      "update"
  ) {

    return null;

  }


  /*
  =========================================
  現在対応している変更項目
  =========================================
  */

  if (
    validatedResult.change.field !==
      "mold_temperature"
  ) {

    return {

      status:
        "unsupported",

      intentType:
        "update",

      updateType:
        validatedResult.change.field,

      targetField:
        null,

      newValue:
        validatedResult.change.value,

      unit:
        validatedResult.change.unit,

      message:
        "この変更指示には、まだ対応していません。"

    };

  }


  /*
  =========================================
  操作種別確認
  =========================================
  */

  if (
    validatedResult.change.operation !==
      "set"
  ) {

    return {

      status:
        "unsupported",

      intentType:
        "update",

      updateType:
        "mold_temperature",

      targetField:
        "金型温度(℃)",

      newValue:
        validatedResult.change.value,

      unit:
        UpdateUnderstandingAdapter_convertUnit(
          validatedResult.change.unit
        ),

      message:
        "現在、金型温度は値を指定した変更だけに対応しています。"

    };

  }


  /*
  =========================================
  不足情報確認
  =========================================
  */

  const hasMissingValue =
    UpdateUnderstandingAdapter_hasMissingField(
      validatedResult.missingFields,
      "change.value"
    );

  if (
    hasMissingValue ||
    validatedResult.change.value ===
      null
  ) {

    return {

      status:
        "incomplete",

      intentType:
        "update",

      updateType:
        "mold_temperature",

      targetField:
        "金型温度(℃)",

      newValue:
        null,

      unit:
        UpdateUnderstandingAdapter_convertUnit(
          validatedResult.change.unit
        ),

      message:
        "変更後の金型温度を指定してください。"

    };

  }


  /*
  =========================================
  変更値確認
  =========================================
  */

  const newMoldTemperature =
    Number(
      validatedResult.change.value
    );

  if (
    !Number.isFinite(
      newMoldTemperature
    )
  ) {

    return {

      status:
        "incomplete",

      intentType:
        "update",

      updateType:
        "mold_temperature",

      targetField:
        "金型温度(℃)",

      newValue:
        null,

      unit:
        UpdateUnderstandingAdapter_convertUnit(
          validatedResult.change.unit
        ),

      message:
        "変更後の金型温度を正しく取得できませんでした。"

    };

  }


  /*
  =========================================
  既存Update Intent形式へ変換
  =========================================
  */

  return {

    status:
      "ready",

    intentType:
      "update",

    updateType:
      "mold_temperature",

    targetField:
      "金型温度(℃)",

    newValue:
      newMoldTemperature,

    unit:
      UpdateUnderstandingAdapter_convertUnit(
        validatedResult.change.unit
      )

  };

}


/**
 * Understanding ResultのEntity Queryを返す。
 *
 * Entity Resolutionは行わない。
 * ユーザーが使用した自然言語上の表現だけを返す。
 *
 * @param {Object} understandingResult
 * @returns {string|null}
 */
function UpdateUnderstandingAdapter_getEntityQuery(
  understandingResult
) {

  const validatedResult =
    UnderstandingResultContract_validate(
      understandingResult
    );

  if (
    validatedResult.intent.type !==
      "update"
  ) {

    return null;

  }

  const entityQuery =
    validatedResult.entity.query;

  if (
    entityQuery ===
      null
  ) {

    return null;

  }

  const normalizedEntityQuery =
    String(
      entityQuery
    ).trim();

  return normalizedEntityQuery ||
    null;

}


/**
 * Entity Type Hintを返す。
 *
 * これはEntity確定ではない。
 *
 * @param {Object} understandingResult
 * @returns {string}
 */
function UpdateUnderstandingAdapter_getEntityTypeHint(
  understandingResult
) {

  const validatedResult =
    UnderstandingResultContract_validate(
      understandingResult
    );

  return String(
    validatedResult
      .entity
      .entityTypeHint ||
    "unknown"
  ).trim() ||
    "unknown";

}


/**
 * missingFieldsに指定項目が含まれるか確認する。
 *
 * @param {Array} missingFields
 * @param {string} fieldName
 * @returns {boolean}
 */
function UpdateUnderstandingAdapter_hasMissingField(
  missingFields,
  fieldName
) {

  if (
    !Array.isArray(
      missingFields
    )
  ) {

    return false;

  }

  const normalizedFieldName =
    String(
      fieldName || ""
    ).trim();

  return missingFields.some(
    function(missingField) {

      return String(
        missingField || ""
      ).trim() ===
        normalizedFieldName;

    }
  );

}


/**
 * Understanding ResultのCanonical Unitを、
 * 現在の既存Update処理用単位へ変換する。
 *
 * @param {string|null} unit
 * @returns {string}
 */
function UpdateUnderstandingAdapter_convertUnit(
  unit
) {

  const normalizedUnit =
    String(
      unit || ""
    ).trim()
    .toLowerCase();


  if (
    normalizedUnit ===
      "celsius"
  ) {

    return "℃";

  }


  /*
   * 単位が省略された場合でも、
   * 現在対応しているmold_temperatureの
   * 既存内部表現は℃である。
   *
   * これは現在値の推測ではなく、
   * Canonical Fieldに対応する
   * システム内部単位への変換である。
   */
  if (
    !normalizedUnit
  ) {

    return "℃";

  }


  return String(
    unit
  ).trim();

}



