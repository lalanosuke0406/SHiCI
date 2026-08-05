/*
=========================================
SHiCI
52_SpreadsheetRepository.js

Spreadsheet Repository
Version 1.0

役割：
・Execution Layerから要求された
  Spreadsheet操作を実行する
・SpreadsheetAppへ直接アクセスする
・シート名とHeader名を基準に処理する
・affectedRowsを返す

Ver.1.0対応Operation：
・insert
・update
・delete

設計原則：
・1 Operation = 1 Entity
・UPDATE / DELETEの複数行操作は禁止する
・Headerに存在しない項目は拒否する
・空criteriaによる更新・削除は禁止する

禁止：
・Execution Planを解釈しない
・Runtime Bindingを解決しない
・Transaction制御を行わない
・Rollback判断を行わない
・Operation Resultを生成しない
・LLMを呼び出さない
=========================================
*/


/*
=========================================
Supported Operation Types
=========================================
*/

const SPREADSHEET_REPOSITORY_OPERATION_INSERT =
  "insert";

const SPREADSHEET_REPOSITORY_OPERATION_UPDATE =
  "update";

const SPREADSHEET_REPOSITORY_OPERATION_DELETE =
  "delete";


/*
=========================================
Public API
=========================================
*/

/**
 * Spreadsheet Operationを実行する。
 *
 * 実際のOperation種別ごとの処理へ
 * 振り分けるだけの公開窓口。
 *
 * @param {string} operationType
 * @param {string} sheetName
 * @param {Object|null} values
 * @param {Object|null} criteria
 * @return {Object}
 */
function SpreadsheetRepository_execute(
  operationType,
  sheetName,
  values,
  criteria
) {

  const normalizedOperationType =
    SpreadsheetRepository_requireNonEmptyString(
      operationType,
      "operationType"
    );


  const normalizedSheetName =
    SpreadsheetRepository_requireNonEmptyString(
      sheetName,
      "sheetName"
    );


  if (
    normalizedOperationType ===
      SPREADSHEET_REPOSITORY_OPERATION_INSERT
  ) {

    return SpreadsheetRepository_insert(
      normalizedSheetName,
      values
    );

  }


  if (
    normalizedOperationType ===
      SPREADSHEET_REPOSITORY_OPERATION_UPDATE
  ) {

    return SpreadsheetRepository_update(
      normalizedSheetName,
      values,
      criteria
    );

  }


  if (
    normalizedOperationType ===
      SPREADSHEET_REPOSITORY_OPERATION_DELETE
  ) {

    return SpreadsheetRepository_delete(
      normalizedSheetName,
      criteria
    );

  }


  throw new Error(
    "未対応のSpreadsheet Repository operationTypeです。" +
    " operationType=" +
    normalizedOperationType
  );

}


/*
=========================================
Operation Public Functions
=========================================
*/

/**
 * 1行を追加する。
 *
 * Header順に1行分の値を組み立て、
 * 最終行の次へsetValues()で書き込む。
 *
 * @param {string} sheetName
 * @param {Object} values
 * @return {Object}
 */
function SpreadsheetRepository_insert(
  sheetName,
  values
) {

  const normalizedSheetName =
    SpreadsheetRepository_requireNonEmptyString(
      sheetName,
      "sheetName"
    );


  SpreadsheetRepository_validateValues(
    values,
    "values"
  );


  const sheet =
    SpreadsheetRepository_getSheet(
      normalizedSheetName
    );


  const headerInfo =
    SpreadsheetRepository_getHeaderInfo(
      sheet
    );


  SpreadsheetRepository_validateFieldsExist(
    values,
    headerInfo.headerMap,
    "values"
  );


  const rowValues =
    SpreadsheetRepository_buildInsertRowValues(
      headerInfo.headers,
      values
    );


  const insertRowNumber =
    SpreadsheetRepository_getInsertRowNumber(
      sheet
    );


  sheet
    .getRange(
      insertRowNumber,
      1,
      1,
      headerInfo.lastColumn
    )
    .setValues(
      [
        rowValues
      ]
    );


  return SpreadsheetRepository_createResult(
    1
  );

}


/**
 * criteriaに一致する1行を更新する。
 *
 * 一致行が0件または2件以上の場合は、
 * 意図しない更新を防ぐため例外とする。
 *
 * @param {string} sheetName
 * @param {Object} values
 * @param {Object} criteria
 * @return {Object}
 */
function SpreadsheetRepository_update(
  sheetName,
  values,
  criteria
) {

  const normalizedSheetName =
    SpreadsheetRepository_requireNonEmptyString(
      sheetName,
      "sheetName"
    );


  SpreadsheetRepository_validateValues(
    values,
    "values"
  );


  SpreadsheetRepository_validateCriteria(
    criteria,
    "criteria"
  );


  const sheet =
    SpreadsheetRepository_getSheet(
      normalizedSheetName
    );


  const headerInfo =
    SpreadsheetRepository_getHeaderInfo(
      sheet
    );


  SpreadsheetRepository_validateFieldsExist(
    values,
    headerInfo.headerMap,
    "values"
  );


  SpreadsheetRepository_validateFieldsExist(
    criteria,
    headerInfo.headerMap,
    "criteria"
  );


  const matchingRowNumbers =
    SpreadsheetRepository_findMatchingRowNumbers(
      sheet,
      headerInfo,
      criteria
    );


  const targetRowNumber =
    SpreadsheetRepository_requireSingleMatchingRow(
      matchingRowNumbers,
      normalizedSheetName,
      criteria
    );


    SpreadsheetRepository_writeUpdatedCells(
    sheet,
    targetRowNumber,
    headerInfo.headerMap,
    values
  );


  return SpreadsheetRepository_createResult(
    1
  );

}


/**
 * criteriaに一致する1行を削除する。
 *
 * 一致行が0件または2件以上の場合は、
 * 意図しない削除を防ぐため例外とする。
 *
 * Ver.1.0では、
 * 1 Operationによる削除は必ず1行とする。
 *
 * @param {string} sheetName
 * @param {Object} criteria
 * @return {Object}
 */
function SpreadsheetRepository_delete(
  sheetName,
  criteria
) {

  const normalizedSheetName =
    SpreadsheetRepository_requireNonEmptyString(
      sheetName,
      "sheetName"
    );


  SpreadsheetRepository_validateCriteria(
    criteria,
    "criteria"
  );


  const sheet =
    SpreadsheetRepository_getSheet(
      normalizedSheetName
    );


  const headerInfo =
    SpreadsheetRepository_getHeaderInfo(
      sheet
    );


  SpreadsheetRepository_validateFieldsExist(
    criteria,
    headerInfo.headerMap,
    "criteria"
  );


  const matchingRowNumbers =
    SpreadsheetRepository_findMatchingRowNumbers(
      sheet,
      headerInfo,
      criteria
    );


  const targetRowNumber =
    SpreadsheetRepository_requireSingleMatchingRow(
      matchingRowNumbers,
      normalizedSheetName,
      criteria
    );


  /*
   * Header行はrequireSingleMatchingRow()によって
   * 対象外となっている。
   */
  sheet.deleteRow(
    targetRowNumber
  );


  return SpreadsheetRepository_createResult(
    1
  );

}




/*
=========================================
Spreadsheet Override
=========================================
*/

/**
 * テスト時だけ使用するSpreadsheet。
 *
 * 通常運用ではnullのまま使用する。
 */
let SpreadsheetRepository_spreadsheetOverride =
  null;


/**
 * テスト用Spreadsheetを設定する。
 *
 * @param {Object|null} spreadsheet
 */
function SpreadsheetRepository_setSpreadsheetOverride(
  spreadsheet
) {

  if (
    spreadsheet !==
      null
  ) {

    SpreadsheetRepository_assertSpreadsheet(
      spreadsheet,
      "spreadsheetOverride"
    );

  }


  SpreadsheetRepository_spreadsheetOverride =
    spreadsheet;

}


/**
 * テスト用Spreadsheetを解除する。
 */
function SpreadsheetRepository_clearSpreadsheetOverride() {

  SpreadsheetRepository_spreadsheetOverride =
    null;

}









/*
=========================================
Spreadsheet Resolution
=========================================
*/

/**
 * Repositoryが使用するSpreadsheetを取得する。
 *
 * 既存プロジェクトにSpreadsheet取得関数が
 * 定義されている場合は、それを優先する。
 *
 * それ以外は、バインドされたSpreadsheetを使用する。
 *
 * @return {GoogleAppsScript.Spreadsheet.Spreadsheet}
 */
function SpreadsheetRepository_getSpreadsheet() {

      /*
  =========================================
  Test Override
  =========================================
  */

  if (
    SpreadsheetRepository_spreadsheetOverride !==
      null
  ) {

    SpreadsheetRepository_assertSpreadsheet(
      SpreadsheetRepository_spreadsheetOverride,
      "SpreadsheetRepository_spreadsheetOverride"
    );


    return SpreadsheetRepository_spreadsheetOverride;

  }



  /*
   * 既存プロジェクト側に
   * getSpreadsheet()が存在する場合は優先する。
   */
  if (
    typeof getSpreadsheet ===
      "function"
  ) {

    const spreadsheet =
      getSpreadsheet();


    SpreadsheetRepository_assertSpreadsheet(
      spreadsheet,
      "getSpreadsheet() result"
    );


    return spreadsheet;

  }


  /*
   * Container-bound Apps Scriptの場合。
   */
  if (
    typeof SpreadsheetApp !==
      "undefined" &&
    SpreadsheetApp &&
    typeof SpreadsheetApp.getActiveSpreadsheet ===
      "function"
  ) {

    const activeSpreadsheet =
      SpreadsheetApp.getActiveSpreadsheet();


    if (
      activeSpreadsheet !==
        null
    ) {

      SpreadsheetRepository_assertSpreadsheet(
        activeSpreadsheet,
        "SpreadsheetApp.getActiveSpreadsheet() result"
      );


      return activeSpreadsheet;

    }

  }


  throw new Error(
    "SpreadsheetRepositoryが使用するSpreadsheetを取得できません。"
  );

}


/**
 * 指定されたシートを取得する。
 *
 * 存在しないシート名は拒否する。
 *
 * @param {string} sheetName
 * @return {GoogleAppsScript.Spreadsheet.Sheet}
 */
function SpreadsheetRepository_getSheet(
  sheetName
) {

  const normalizedSheetName =
    SpreadsheetRepository_requireNonEmptyString(
      sheetName,
      "sheetName"
    );


  const spreadsheet =
    SpreadsheetRepository_getSpreadsheet();


  const sheet =
    spreadsheet.getSheetByName(
      normalizedSheetName
    );


  if (
    sheet ===
      null
  ) {

    throw new Error(
      "指定されたシートが存在しません。" +
      " sheetName=" +
      normalizedSheetName
    );

  }


  SpreadsheetRepository_assertSheet(
    sheet,
    "sheet"
  );


  return sheet;

}


/*
=========================================
Header
=========================================
*/

/**
 * シートの1行目からHeader情報を取得する。
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @return {Object}
 */
function SpreadsheetRepository_getHeaderInfo(
  sheet
) {

  SpreadsheetRepository_assertSheet(
    sheet,
    "sheet"
  );


  const lastColumn =
    sheet.getLastColumn();


  if (
    !Number.isInteger(
      lastColumn
    ) ||
    lastColumn <
      1
  ) {

    throw new Error(
      "SpreadsheetのHeaderを取得できません。" +
      " sheetName=" +
      sheet.getName()
    );

  }


  const headerValues =
    sheet
      .getRange(
        1,
        1,
        1,
        lastColumn
      )
      .getValues()[0];


  if (
    !Array.isArray(
      headerValues
    ) ||
    headerValues.length ===
      0
  ) {

    throw new Error(
      "SpreadsheetのHeader行が空です。" +
      " sheetName=" +
      sheet.getName()
    );

  }


  const headerMap =
    {};


  const normalizedHeaders =
    [];


  headerValues.forEach(
    function(headerValue, index) {

      const header =
        SpreadsheetRepository_requireNonEmptyString(
          String(
            headerValue
          ),
          "header[" +
          index +
          "]"
        );


      if (
        Object.prototype.hasOwnProperty.call(
          headerMap,
          header
        )
      ) {

        throw new Error(
          "SpreadsheetのHeader名が重複しています。" +
          " sheetName=" +
          sheet.getName() +
          " header=" +
          header
        );

      }


      /*
       * Google Sheetsの列番号は1始まり。
       */
      headerMap[
        header
      ] =
        index +
        1;


      normalizedHeaders.push(
        header
      );

    }
  );


  return {

    headers:
      normalizedHeaders,

    headerMap:
      headerMap,

    lastColumn:
      lastColumn

  };

}


/**
 * Header名から列番号を取得する。
 *
 * 存在しないHeader名は拒否する。
 *
 * @param {Object} headerMap
 * @param {string} fieldName
 * @param {string} label
 * @return {number}
 */
function SpreadsheetRepository_getColumnNumber(
  headerMap,
  fieldName,
  label
) {

  SpreadsheetRepository_assertObject(
    headerMap,
    "headerMap"
  );


  const normalizedFieldName =
    SpreadsheetRepository_requireNonEmptyString(
      fieldName,
      label ||
        "fieldName"
    );


  if (
    !Object.prototype.hasOwnProperty.call(
      headerMap,
      normalizedFieldName
    )
  ) {

    throw new Error(
      "SpreadsheetのHeaderに存在しない項目です。" +
      " fieldName=" +
      normalizedFieldName
    );

  }


  const columnNumber =
    headerMap[
      normalizedFieldName
    ];


  if (
    !Number.isInteger(
      columnNumber
    ) ||
    columnNumber <
      1
  ) {

    throw new Error(
      "Spreadsheetの列番号が不正です。" +
      " fieldName=" +
      normalizedFieldName +
      " columnNumber=" +
      columnNumber
    );

  }


  return columnNumber;

}





/*
=========================================
Insert Support
=========================================
*/

/**
 * Header順にINSERT用の1行分配列を生成する。
 *
 * valuesに存在しないHeaderは空文字とする。
 *
 * @param {Array<string>} headers
 * @param {Object} values
 * @return {Array<*>}
 */
function SpreadsheetRepository_buildInsertRowValues(
  headers,
  values
) {

  if (
    !Array.isArray(
      headers
    )
  ) {

    throw new Error(
      "headersはArrayである必要があります。"
    );

  }


  if (
    headers.length ===
      0
  ) {

    throw new Error(
      "headersは空Arrayにできません。"
    );

  }


  SpreadsheetRepository_assertObject(
    values,
    "values"
  );


  return headers.map(
    function(header, index) {

      const normalizedHeader =
        SpreadsheetRepository_requireNonEmptyString(
          header,
          "headers[" +
          index +
          "]"
        );


      if (
        Object.prototype.hasOwnProperty.call(
          values,
          normalizedHeader
        )
      ) {

        return SpreadsheetRepository_normalizeCellValue(
          values[
            normalizedHeader
          ]
        );

      }


      return "";

    }
  );

}


/**
 * 新しい行を書き込む行番号を返す。
 *
 * Headerは1行目にあるため、
 * データが存在しない場合でも2行目へ追加する。
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @return {number}
 */
function SpreadsheetRepository_getInsertRowNumber(
  sheet
) {

  SpreadsheetRepository_assertSheet(
    sheet,
    "sheet"
  );


  const lastRow =
    sheet.getLastRow();


  if (
    !Number.isInteger(
      lastRow
    ) ||
    lastRow <
      0
  ) {

    throw new Error(
      "Spreadsheetの最終行番号が不正です。" +
      " sheetName=" +
      sheet.getName() +
      " lastRow=" +
      lastRow
    );

  }


  /*
   * Headerだけの場合はlastRow=1。
   * 空シートはHeader取得時点で拒否されるため、
   * 通常は2以上の行番号が返る。
   */
  return Math.max(
    lastRow +
      1,
    2
  );

}


/**
 * Spreadsheetへ書き込める値へ正規化する。
 *
 * undefinedは空文字へ変換する。
 * nullは明示値として空文字へ変換する。
 *
 * ObjectやArrayはRepositoryでは許可しない。
 * bindingRefはExecutorで事前解決されている必要がある。
 *
 * @param {*} value
 * @return {*}
 */
function SpreadsheetRepository_normalizeCellValue(
  value
) {

  if (
    value ===
      null ||
    value ===
      undefined
  ) {

    return "";

  }


  if (
    Array.isArray(
      value
    ) ||
    (
      typeof value ===
        "object" &&
      !(value instanceof Date)
    )
  ) {

    throw new Error(
      "SpreadsheetへObjectまたはArrayを直接書き込むことはできません。"
    );

  }


  if (
    typeof value ===
      "number" &&
    !Number.isFinite(
      value
    )
  ) {

    throw new Error(
      "Spreadsheetへ有限でないnumberを書き込むことはできません。"
    );

  }


  return value;

}





/*
=========================================
Row Search
=========================================
*/

/**
 * criteriaに一致する行番号をすべて取得する。
 *
 * Header行は検索対象に含めない。
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {Object} headerInfo
 * @param {Object} criteria
 * @return {Array<number>}
 */
function SpreadsheetRepository_findMatchingRowNumbers(
  sheet,
  headerInfo,
  criteria
) {

  SpreadsheetRepository_assertSheet(
    sheet,
    "sheet"
  );


  SpreadsheetRepository_assertObject(
    headerInfo,
    "headerInfo"
  );


  SpreadsheetRepository_validateCriteria(
    criteria,
    "criteria"
  );


  SpreadsheetRepository_validateFieldsExist(
    criteria,
    headerInfo.headerMap,
    "criteria"
  );


  const lastRow =
    sheet.getLastRow();


  if (
    !Number.isInteger(
      lastRow
    ) ||
    lastRow <
      1
  ) {

    throw new Error(
      "Spreadsheetの最終行番号が不正です。" +
      " sheetName=" +
      sheet.getName() +
      " lastRow=" +
      lastRow
    );

  }


  /*
   * Headerしか存在しない場合、
   * データ行は0件。
   */
  if (
    lastRow ===
      1
  ) {

    return [];

  }


  const dataRowCount =
    lastRow -
    1;


  const dataValues =
    sheet
      .getRange(
        2,
        1,
        dataRowCount,
        headerInfo.lastColumn
      )
      .getValues();


  const matchingRowNumbers =
    [];


  dataValues.forEach(
    function(rowValues, index) {

      const matched =
        SpreadsheetRepository_rowMatchesCriteria(
          rowValues,
          headerInfo.headerMap,
          criteria
        );


      if (
        matched
      ) {

        /*
         * dataValues[0]はSpreadsheet上の2行目。
         */
        matchingRowNumbers.push(
          index +
          2
        );

      }

    }
  );


  return matchingRowNumbers;

}


/**
 * 1行がcriteriaの全項目に一致するか確認する。
 *
 * criteriaはAND条件として扱う。
 *
 * @param {Array<*>} rowValues
 * @param {Object} headerMap
 * @param {Object} criteria
 * @return {boolean}
 */
function SpreadsheetRepository_rowMatchesCriteria(
  rowValues,
  headerMap,
  criteria
) {

  if (
    !Array.isArray(
      rowValues
    )
  ) {

    throw new Error(
      "rowValuesはArrayである必要があります。"
    );

  }


  SpreadsheetRepository_assertObject(
    headerMap,
    "headerMap"
  );


  SpreadsheetRepository_validateCriteria(
    criteria,
    "criteria"
  );


  return Object.keys(
    criteria
  ).every(
    function(fieldName) {

      const columnNumber =
        SpreadsheetRepository_getColumnNumber(
          headerMap,
          fieldName,
          "criteria." +
          fieldName
        );


      const rowValue =
        rowValues[
          columnNumber -
          1
        ];


      const criteriaValue =
        criteria[
          fieldName
        ];


      return SpreadsheetRepository_valuesEqual(
        rowValue,
        criteriaValue
      );

    }
  );

}


/**
 * 一致行がちょうど1件であることを確認し、
 * 対象行番号を返す。
 *
 * @param {Array<number>} matchingRowNumbers
 * @param {string} sheetName
 * @param {Object} criteria
 * @return {number}
 */
function SpreadsheetRepository_requireSingleMatchingRow(
  matchingRowNumbers,
  sheetName,
  criteria
) {

  if (
    !Array.isArray(
      matchingRowNumbers
    )
  ) {

    throw new Error(
      "matchingRowNumbersはArrayである必要があります。"
    );

  }


  const normalizedSheetName =
    SpreadsheetRepository_requireNonEmptyString(
      sheetName,
      "sheetName"
    );


  SpreadsheetRepository_validateCriteria(
    criteria,
    "criteria"
  );


  if (
    matchingRowNumbers.length ===
      0
  ) {

    throw new Error(
      "criteriaに一致する行が存在しません。" +
      " sheetName=" +
      normalizedSheetName +
      " criteria=" +
      JSON.stringify(
        criteria
      )
    );

  }


  if (
    matchingRowNumbers.length >
      1
  ) {

    throw new Error(
      "criteriaに一致する行が複数存在します。" +
      " sheetName=" +
      normalizedSheetName +
      " count=" +
      matchingRowNumbers.length +
      " rows=" +
      JSON.stringify(
        matchingRowNumbers
      ) +
      " criteria=" +
      JSON.stringify(
        criteria
      )
    );

  }


  const rowNumber =
    matchingRowNumbers[0];


  if (
    !Number.isInteger(
      rowNumber
    ) ||
    rowNumber <
      2
  ) {

    throw new Error(
      "一致行番号が不正です。" +
      " rowNumber=" +
      rowNumber
    );

  }


  return rowNumber;

}





/*
=========================================
Update Support
=========================================
*/

/**
 * valuesで指定されたセルだけを書き込む。
 *
 * 行全体を書き直さないため、
 * 未指定列に存在する数式・チェックボックス・
 * データ検証・将来追加された列を変更しない。
 *
 * @param {GoogleAppsScript.Spreadsheet.Sheet} sheet
 * @param {number} targetRowNumber
 * @param {Object} headerMap
 * @param {Object} values
 */
function SpreadsheetRepository_writeUpdatedCells(
  sheet,
  targetRowNumber,
  headerMap,
  values
) {

  SpreadsheetRepository_assertSheet(
    sheet,
    "sheet"
  );


  SpreadsheetRepository_assertPositiveInteger(
    targetRowNumber,
    "targetRowNumber"
  );


  /*
   * Header行は更新対象にできない。
   */
  if (
    targetRowNumber <
      2
  ) {

    throw new Error(
      "UPDATE対象行は2行目以降である必要があります。" +
      " targetRowNumber=" +
      targetRowNumber
    );

  }


  SpreadsheetRepository_assertObject(
    headerMap,
    "headerMap"
  );


  SpreadsheetRepository_validateValues(
    values,
    "values"
  );


  SpreadsheetRepository_validateFieldsExist(
    values,
    headerMap,
    "values"
  );


  Object.keys(
    values
  ).forEach(
    function(fieldName) {

      const columnNumber =
        SpreadsheetRepository_getColumnNumber(
          headerMap,
          fieldName,
          "values." +
          fieldName
        );


      const normalizedCellValue =
        SpreadsheetRepository_normalizeCellValue(
          values[
            fieldName
          ]
        );


      sheet
        .getRange(
          targetRowNumber,
          columnNumber,
          1,
          1
        )
        .setValues(
          [
            [
              normalizedCellValue
            ]
          ]
        );

    }
  );

}










/*
=========================================
Input Validation
=========================================
*/

/**
 * valuesを検証する。
 *
 * INSERT / UPDATEでは、
 * 1件以上の項目が必要。
 *
 * @param {*} values
 * @param {string} label
 */
function SpreadsheetRepository_validateValues(
  values,
  label
) {

  SpreadsheetRepository_assertObject(
    values,
    label
  );


  const keys =
    Object.keys(
      values
    );


  if (
    keys.length ===
      0
  ) {

    throw new Error(
      label +
      "は空Objectにできません。"
    );

  }


  keys.forEach(
    function(key, index) {

      SpreadsheetRepository_requireNonEmptyString(
        key,
        label +
        ".key[" +
        index +
        "]"
      );

    }
  );

}


/**
 * criteriaを検証する。
 *
 * UPDATE / DELETEでは、
 * 誤操作防止のため空Objectを許可しない。
 *
 * criteria値には、
 * Spreadsheetのセル値として比較可能な
 * primitiveまたはDateだけを許可する。
 *
 * @param {*} criteria
 * @param {string} label
 */
function SpreadsheetRepository_validateCriteria(
  criteria,
  label
) {

  SpreadsheetRepository_assertObject(
    criteria,
    label
  );


  const keys =
    Object.keys(
      criteria
    );


  if (
    keys.length ===
      0
  ) {

    throw new Error(
      label +
      "は空Objectにできません。"
    );

  }


  keys.forEach(
    function(key, index) {

      SpreadsheetRepository_requireNonEmptyString(
        key,
        label +
        ".key[" +
        index +
        "]"
      );


      SpreadsheetRepository_validateComparableValue(
        criteria[
          key
        ],
        label +
        "." +
        key
      );

    }
  );

}


/**
 * Object内の全項目が、
 * Headerに存在することを確認する。
 *
 * @param {Object} objectValue
 * @param {Object} headerMap
 * @param {string} label
 */
function SpreadsheetRepository_validateFieldsExist(
  objectValue,
  headerMap,
  label
) {

  SpreadsheetRepository_assertObject(
    objectValue,
    label
  );


  SpreadsheetRepository_assertObject(
    headerMap,
    "headerMap"
  );


  Object.keys(
    objectValue
  ).forEach(
    function(fieldName) {

      SpreadsheetRepository_getColumnNumber(
        headerMap,
        fieldName,
        label +
        "." +
        fieldName
      );

    }
  );

}


/*
=========================================
Result
=========================================
*/

/**
 * Repository Resultを生成する。
 *
 * @param {number} affectedRows
 * @return {Object}
 */
function SpreadsheetRepository_createResult(
  affectedRows
) {

  SpreadsheetRepository_assertNonNegativeInteger(
    affectedRows,
    "affectedRows"
  );


  return {

    affectedRows:
      affectedRows

  };

}








/*
=========================================
Comparable Value Validation
=========================================
*/

/**
 * criteriaとして比較可能な値であることを確認する。
 *
 * Object・Array・undefined・有限でないnumberは
 * criteriaに使用できない。
 *
 * Dateは有効な日時だけを許可する。
 *
 * @param {*} value
 * @param {string} label
 */
function SpreadsheetRepository_validateComparableValue(
  value,
  label
) {

  if (
    value ===
      undefined
  ) {

    throw new Error(
      label +
      "にundefinedを指定できません。"
    );

  }


  if (
    Array.isArray(
      value
    )
  ) {

    throw new Error(
      label +
      "にArrayを指定できません。"
    );

  }


  if (
    value instanceof Date
  ) {

    if (
      !Number.isFinite(
        value.getTime()
      )
    ) {

      throw new Error(
        label +
        "は有効なDateである必要があります。"
      );

    }


    return;

  }


  if (
    value !==
      null &&
    typeof value ===
      "object"
  ) {

    throw new Error(
      label +
      "にObjectを指定できません。" +
      " bindingRefはExecutorで事前解決する必要があります。"
    );

  }


  if (
    typeof value ===
      "number" &&
    !Number.isFinite(
      value
    )
  ) {

    throw new Error(
      label +
      "は有限のnumberである必要があります。"
    );

  }

}












/*
=========================================
Value Comparison
=========================================
*/

/**
 * Spreadsheet上の値とcriteria値が
 * 同一であるかを確認する。
 *
 * Date同士は時刻で比較する。
 * DateとISO日時文字列も時刻で比較する。
 * それ以外は型を含めて厳密比較する。
 *
 * @param {*} actual
 * @param {*} expected
 * @return {boolean}
 */
function SpreadsheetRepository_valuesEqual(
  actual,
  expected
) {

  /*
  =========================================
  Date Comparison
  =========================================
  */

  if (
    actual instanceof Date
  ) {

    const actualTime =
      actual.getTime();


    if (
      !Number.isFinite(
        actualTime
      )
    ) {

      return false;

    }


    if (
      expected instanceof Date
    ) {

      return (
        actualTime ===
        expected.getTime()
      );

    }


    if (
      typeof expected ===
        "string"
    ) {

      const expectedTime =
        Date.parse(
          expected
        );


      if (
        Number.isFinite(
          expectedTime
        )
      ) {

        return (
          actualTime ===
          expectedTime
        );

      }

    }


    return false;

  }


  if (
    expected instanceof Date
  ) {

    if (
      typeof actual ===
        "string"
    ) {

      const actualTime =
        Date.parse(
          actual
        );


      if (
        Number.isFinite(
          actualTime
        )
      ) {

        return (
          actualTime ===
          expected.getTime()
        );

      }

    }


    return false;

  }


  /*
  =========================================
  Normal Value Comparison
  =========================================
  */

  return (
    actual ===
    expected
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
function SpreadsheetRepository_assertObject(
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
function SpreadsheetRepository_requireNonEmptyString(
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


/**
 * 0以上の整数であることを確認する。
 *
 * @param {*} value
 * @param {string} label
 */
function SpreadsheetRepository_assertNonNegativeInteger(
  value,
  label
) {

  if (
    !Number.isInteger(
      value
    ) ||
    value <
      0
  ) {

    throw new Error(
      label +
      "は0以上の整数である必要があります。"
    );

  }

}


/**
 * Spreadsheet Objectであることを確認する。
 *
 * @param {*} spreadsheet
 * @param {string} label
 */
function SpreadsheetRepository_assertSpreadsheet(
  spreadsheet,
  label
) {

  if (
    spreadsheet ===
      null ||
    typeof spreadsheet !==
      "object" ||
    typeof spreadsheet.getSheetByName !==
      "function"
  ) {

    throw new Error(
      label +
      "は有効なSpreadsheetである必要があります。"
    );

  }

}


/**
 * Sheet Objectであることを確認する。
 *
 * Repositoryで使用する最低限のAPIが
 * すべて存在することを検証する。
 *
 * @param {*} sheet
 * @param {string} label
 */
function SpreadsheetRepository_assertSheet(
  sheet,
  label
) {

  if (
    sheet ===
      null ||
    typeof sheet !==
      "object" ||
    typeof sheet.getName !==
      "function" ||
    typeof sheet.getRange !==
      "function" ||
    typeof sheet.getLastColumn !==
      "function" ||
    typeof sheet.getLastRow !==
      "function" ||
    typeof sheet.deleteRow !==
      "function"
  ) {

    throw new Error(
      label +
      "は有効なSheetである必要があります。"
    );

  }

}



/**
 * 1以上の整数であることを確認する。
 *
 * @param {*} value
 * @param {string} label
 */
function SpreadsheetRepository_assertPositiveInteger(
  value,
  label
) {

  if (
    !Number.isInteger(
      value
    ) ||
    value <
      1
  ) {

    throw new Error(
      label +
      "は1以上の整数である必要があります。"
    );

  }

}











