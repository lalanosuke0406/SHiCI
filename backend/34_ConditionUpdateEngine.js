/*
=========================================
SHiCI
34_ConditionUpdateEngine.js

役割：
・成形条件変更に関する専用処理
・現在標準条件IDの限定更新
・更新直前の整合性確認
=========================================
*/


/**
 * 製品マスターの現在標準条件IDだけを更新する
 *
 * この関数は、汎用的な製品更新には使用しない。
 * 成形条件変更の確定処理からのみ呼び出す。
 *
 * @param {string} productId
 * @param {string} newConditionId
 * @param {string} expectedCurrentConditionId
 * @return {Object}
 */
function ConditionUpdateEngine_updateCurrentConditionId(
  productId,
  newConditionId,
  expectedCurrentConditionId
) {

  const normalizedProductId =
    String(
      productId || ""
    ).trim();

  const normalizedNewConditionId =
    String(
      newConditionId || ""
    ).trim();

  const normalizedExpectedConditionId =
    String(
      expectedCurrentConditionId || ""
    ).trim();

  if (!normalizedProductId) {

    throw new Error(
      "製品IDがありません。"
    );

  }

  if (!normalizedNewConditionId) {

    throw new Error(
      "新しい条件IDがありません。"
    );

  }

  const sheet =
    SpreadsheetApp
      .openById(
        SPREADSHEET_ID
      )
      .getSheetByName(
        "製品マスター"
      );

  if (!sheet) {

    throw new Error(
      "製品マスターがありません。"
    );

  }

  const values =
    sheet
      .getDataRange()
      .getValues();

  if (
    !values ||
    values.length === 0
  ) {

    throw new Error(
      "製品マスターに見出しがありません。"
    );

  }

  const headers =
    values[0];

  const productIdColumn =
    headers.indexOf(
      "製品ID"
    );

  const conditionIdColumn =
    headers.indexOf(
      "現在標準条件ID"
    );

  const updatedAtColumn =
    headers.indexOf(
      "最終更新日"
    );

  if (
    productIdColumn === -1
  ) {

    throw new Error(
      "製品マスターに「製品ID」列がありません。"
    );

  }

  if (
    conditionIdColumn === -1
  ) {

    throw new Error(
      "製品マスターに「現在標準条件ID」列がありません。"
    );

  }

  for (
    let rowIndex = 1;
    rowIndex < values.length;
    rowIndex++
  ) {

    const storedProductId =
      String(
        values[rowIndex][
          productIdColumn
        ] || ""
      ).trim();

    if (
      storedProductId !==
      normalizedProductId
    ) {

      continue;

    }

    const currentConditionId =
      String(
        values[rowIndex][
          conditionIdColumn
        ] || ""
      ).trim();

    /*
    更新案を作成した時点から、
    別の操作によって標準条件が変わっていないか確認する。
    */

    if (
      currentConditionId !==
      normalizedExpectedConditionId
    ) {

      throw new Error(
        "現在標準条件が更新案の作成後に変更されています。最新情報を確認して、もう一度操作してください。"
      );

    }

    const sheetRowNumber =
      rowIndex + 1;

    sheet
      .getRange(
        sheetRowNumber,
        conditionIdColumn + 1
      )
      .setValue(
        normalizedNewConditionId
      );

    if (
      updatedAtColumn !== -1
    ) {

      sheet
        .getRange(
          sheetRowNumber,
          updatedAtColumn + 1
        )
        .setValue(
          new Date()
        );

    }

    return {

      status:
        "success",

      productId:
        normalizedProductId,

      oldConditionId:
        currentConditionId,

      newConditionId:
        normalizedNewConditionId

    };

  }

  throw new Error(
    "指定された製品IDが製品マスターに見つかりません。"
  );

}



/**
 * 現在の成形条件を複製し、
 * 新しい成形条件マスター行を作成する
 *
 * @param {string} sourceConditionId
 * @param {Object} user
 * @param {string} changeReason
 * @return {Object}
 */
function ConditionUpdateEngine_createConditionCopy(
  sourceConditionId,
  user,
  changeReason
) {

  const normalizedSourceConditionId =
    String(
      sourceConditionId || ""
    ).trim();

  if (!normalizedSourceConditionId) {

    throw new Error(
      "複製元の条件IDがありません。"
    );

  }

  if (
    !user ||
    !user.userId
  ) {

    throw new Error(
      "更新者情報がありません。"
    );

  }

  const sourceCondition =
    getConditionById(
      normalizedSourceConditionId
    );

  if (!sourceCondition) {

    throw new Error(
      "複製元の成形条件が見つかりません。"
    );

  }

  const sheet =
    SpreadsheetApp
      .openById(
        SPREADSHEET_ID
      )
      .getSheetByName(
        "成形条件マスター"
      );

  if (!sheet) {

    throw new Error(
      "成形条件マスターがありません。"
    );

  }

  const headers =
    sheet
      .getRange(
        1,
        1,
        1,
        sheet.getLastColumn()
      )
      .getValues()[0];

  const newConditionId =
    generateId(
      "COND"
    );

  const sourceVersion =
    Number(
      sourceCondition["版数"]
    );

  const newVersion =
    Number.isFinite(
      sourceVersion
    )
      ? sourceVersion + 1
      : 1;

  const changedBy =
    String(
      user.nickName ||
      user.name ||
      user.email ||
      user.userId
    ).trim();

  const normalizedChangeReason =
    String(
      changeReason ||
      "成形条件変更"
    ).trim();

  const row =
    headers.map(
      function(header) {

        switch (header) {

          case "条件ID":
            return newConditionId;

          case "親条件ID":
            return normalizedSourceConditionId;

          case "版数":
            return newVersion;

          case "状態":
            return "試験";

          case "変更理由":
            return normalizedChangeReason;

          case "変更者":
            return changedBy;

          case "結果":
            return "";

          case "最終更新日":
            return new Date();

          default:

            return sourceCondition[
              header
            ] ?? "";

        }

      }
    );

  sheet.appendRow(
    row
  );

  return {

    status:
      "success",

    sourceConditionId:
      normalizedSourceConditionId,

    newConditionId:
      newConditionId,

    productId:
      sourceCondition["製品ID"] || "",

    parentConditionId:
      normalizedSourceConditionId,

    version:
      newVersion,

    conditionStatus:
      "試験",

    changedBy:
      changedBy,

    changeReason:
      normalizedChangeReason

  };

}



/**
 * 現在の成形条件詳細を複製し、
 * 金型温度だけを変更した新しい詳細行を作成する
 *
 * @param {string} sourceConditionId
 * @param {string} newConditionId
 * @param {number|string} newMoldTemperature
 * @return {Object}
 */
function ConditionUpdateEngine_createConditionDetailCopy(
  sourceConditionId,
  newConditionId,
  newMoldTemperature
) {

  const normalizedSourceConditionId =
    String(
      sourceConditionId || ""
    ).trim();

  const normalizedNewConditionId =
    String(
      newConditionId || ""
    ).trim();

  if (!normalizedSourceConditionId) {

    throw new Error(
      "複製元の条件IDがありません。"
    );

  }

  if (!normalizedNewConditionId) {

    throw new Error(
      "新しい条件IDがありません。"
    );

  }

  const numericMoldTemperature =
    Number(
      newMoldTemperature
    );

  if (
    !Number.isFinite(
      numericMoldTemperature
    )
  ) {

    throw new Error(
      "新しい金型温度が数値ではありません。"
    );

  }

  if (
    numericMoldTemperature < 0 ||
    numericMoldTemperature > 300
  ) {

    throw new Error(
      "金型温度は0℃以上300℃以下で指定してください。"
    );

  }

  const sourceConditionDetail =
    getConditionDetailByConditionId(
      normalizedSourceConditionId
    );

  if (!sourceConditionDetail) {

    throw new Error(
      "複製元の成形条件詳細が見つかりません。"
    );

  }

  const existingNewConditionDetail =
    getConditionDetailByConditionId(
      normalizedNewConditionId
    );

  if (existingNewConditionDetail) {

    throw new Error(
      "新しい条件IDの成形条件詳細はすでに存在します。"
    );

  }

  const sheet =
    SpreadsheetApp
      .openById(
        SPREADSHEET_ID
      )
      .getSheetByName(
        "成形条件詳細マスター"
      );

  if (!sheet) {

    throw new Error(
      "成形条件詳細マスターがありません。"
    );

  }

  const lastColumn =
    sheet.getLastColumn();

  if (
    lastColumn === 0
  ) {

    throw new Error(
      "成形条件詳細マスターに見出しがありません。"
    );

  }

  const headers =
    sheet
      .getRange(
        1,
        1,
        1,
        lastColumn
      )
      .getValues()[0];

  const conditionIdColumn =
    headers.indexOf(
      "条件ID"
    );

  const moldTemperatureColumn =
    headers.indexOf(
      "金型温度(℃)"
    );

  if (
    conditionIdColumn === -1
  ) {

    throw new Error(
      "成形条件詳細マスターに「条件ID」列がありません。"
    );

  }

  if (
    moldTemperatureColumn === -1
  ) {

    throw new Error(
      "成形条件詳細マスターに「金型温度(℃)」列がありません。"
    );

  }

  const row =
    headers.map(
      function(header) {

        switch (header) {

          case "条件ID":

            return normalizedNewConditionId;

          case "金型温度(℃)":

            return numericMoldTemperature;

          default:

            return sourceConditionDetail[
              header
            ] ?? "";

        }

      }
    );

  sheet.appendRow(
    row
  );

  return {

    status:
      "success",

    sourceConditionId:
      normalizedSourceConditionId,

    newConditionId:
      normalizedNewConditionId,

    oldMoldTemperature:
      sourceConditionDetail[
        "金型温度(℃)"
      ] ?? "",

    newMoldTemperature:
      numericMoldTemperature,

    conditionFileId:
      sourceConditionDetail[
        "成形条件ファイルID"
      ] ?? "",

    fileName:
      sourceConditionDetail[
        "ファイル名"
      ] ?? ""

  };

}



/**
 * 金型温度変更の実行前検証
 *
 * この関数では、スプレッドシートへの書き込みは行わない。
 * 必要なデータと現在の整合性だけを確認する。
 *
 * @param {string} productId
 * @param {string} expectedCurrentConditionId
 * @param {number|string} newMoldTemperature
 * @return {Object}
 */
function ConditionUpdateEngine_validateMoldTemperatureUpdate(
  productId,
  expectedCurrentConditionId,
  newMoldTemperature
) {

  const normalizedProductId =
    String(
      productId || ""
    ).trim();

  const normalizedExpectedConditionId =
    String(
      expectedCurrentConditionId || ""
    ).trim();

  if (!normalizedProductId) {

    throw new Error(
      "製品IDがありません。"
    );

  }

  if (!normalizedExpectedConditionId) {

    throw new Error(
      "現在標準条件IDがありません。"
    );

  }

  const numericMoldTemperature =
    Number(
      newMoldTemperature
    );

  if (
    !Number.isFinite(
      numericMoldTemperature
    )
  ) {

    throw new Error(
      "新しい金型温度が数値ではありません。"
    );

  }

  if (
    numericMoldTemperature < 0 ||
    numericMoldTemperature > 300
  ) {

    throw new Error(
      "金型温度は0℃以上300℃以下で指定してください。"
    );

  }


  /*
  =========================================
  製品の確認
  =========================================
  */

  const product =
    getProductById(
      normalizedProductId
    );

  if (!product) {

    throw new Error(
      "対象製品が見つかりません。"
    );

  }

  const actualCurrentConditionId =
    String(
      product[
        "現在標準条件ID"
      ] || ""
    ).trim();

  if (!actualCurrentConditionId) {

    throw new Error(
      "対象製品に現在標準条件IDが登録されていません。"
    );

  }

  if (
    actualCurrentConditionId !==
    normalizedExpectedConditionId
  ) {

    throw new Error(
      "現在標準条件が更新案の作成後に変更されています。最新情報を確認して、もう一度操作してください。"
    );

  }


  /*
  =========================================
  成形条件マスターの確認
  =========================================
  */

  const sourceCondition =
    getConditionById(
      normalizedExpectedConditionId
    );

  if (!sourceCondition) {

    throw new Error(
      "現在標準条件が成形条件マスターに見つかりません。"
    );

  }

  const conditionProductId =
    String(
      sourceCondition[
        "製品ID"
      ] || ""
    ).trim();

  if (
    conditionProductId &&
    conditionProductId !==
    normalizedProductId
  ) {

    throw new Error(
      "現在標準条件と対象製品の関連付けが一致しません。"
    );

  }


  /*
  =========================================
  成形条件詳細の確認
  =========================================
  */

  const sourceConditionDetail =
    getConditionDetailByConditionId(
      normalizedExpectedConditionId
    );

  if (!sourceConditionDetail) {

    throw new Error(
      "現在標準条件の詳細情報が見つかりません。"
    );

  }

  const oldMoldTemperatureRaw =
    sourceConditionDetail[
      "金型温度(℃)"
    ];

  if (
    oldMoldTemperatureRaw === "" ||
    oldMoldTemperatureRaw === null ||
    oldMoldTemperatureRaw === undefined
  ) {

    throw new Error(
      "現在標準条件に金型温度が登録されていません。"
    );

  }

  const oldMoldTemperature =
    Number(
      oldMoldTemperatureRaw
    );

  if (
    !Number.isFinite(
      oldMoldTemperature
    )
  ) {

    throw new Error(
      "現在標準条件の金型温度が数値ではありません。"
    );

  }

  if (
    oldMoldTemperature ===
    numericMoldTemperature
  ) {

    throw new Error(
      "新しい金型温度が現在の金型温度と同じです。"
    );

  }


  /*
  =========================================
  必要なシートと見出しの確認
  =========================================
  */

  const spreadsheet =
    SpreadsheetApp.openById(
      SPREADSHEET_ID
    );

  const conditionSheet =
    spreadsheet.getSheetByName(
      "成形条件マスター"
    );

  const conditionDetailSheet =
    spreadsheet.getSheetByName(
      "成形条件詳細マスター"
    );

  const productSheet =
    spreadsheet.getSheetByName(
      "製品マスター"
    );

  if (!conditionSheet) {

    throw new Error(
      "成形条件マスターがありません。"
    );

  }

  if (!conditionDetailSheet) {

    throw new Error(
      "成形条件詳細マスターがありません。"
    );

  }

  if (!productSheet) {

    throw new Error(
      "製品マスターがありません。"
    );

  }

  const conditionHeaders =
    conditionSheet
      .getRange(
        1,
        1,
        1,
        conditionSheet.getLastColumn()
      )
      .getValues()[0];

  const requiredConditionHeaders = [
    "条件ID",
    "親条件ID",
    "製品ID",
    "版数",
    "状態",
    "変更理由",
    "変更者"
  ];

  requiredConditionHeaders.forEach(
    function(header) {

      if (
        conditionHeaders.indexOf(
          header
        ) === -1
      ) {

        throw new Error(
          "成形条件マスターに「" +
          header +
          "」列がありません。"
        );

      }

    }
  );

  const detailHeaders =
    conditionDetailSheet
      .getRange(
        1,
        1,
        1,
        conditionDetailSheet.getLastColumn()
      )
      .getValues()[0];

  const requiredDetailHeaders = [
    "条件ID",
    "金型温度(℃)"
  ];

  requiredDetailHeaders.forEach(
    function(header) {

      if (
        detailHeaders.indexOf(
          header
        ) === -1
      ) {

        throw new Error(
          "成形条件詳細マスターに「" +
          header +
          "」列がありません。"
        );

      }

    }
  );

  const productHeaders =
    productSheet
      .getRange(
        1,
        1,
        1,
        productSheet.getLastColumn()
      )
      .getValues()[0];

  const requiredProductHeaders = [
    "製品ID",
    "現在標準条件ID"
  ];

  requiredProductHeaders.forEach(
    function(header) {

      if (
        productHeaders.indexOf(
          header
        ) === -1
      ) {

        throw new Error(
          "製品マスターに「" +
          header +
          "」列がありません。"
        );

      }

    }
  );


  return {

    status:
      "success",

    productId:
      normalizedProductId,

    productName:
      product[
        "製品名"
      ] || "",

    drawingNumber:
      product[
        "図番"
      ] || "",

    sourceConditionId:
      normalizedExpectedConditionId,

    oldMoldTemperature:
      oldMoldTemperature,

    newMoldTemperature:
      numericMoldTemperature,

    sourceCondition:
      sourceCondition,

    sourceConditionDetail:
      sourceConditionDetail

  };

}



/**
 * 成形条件マスターの状態だけを更新する
 *
 * @param {string} conditionId
 * @param {string} newStatus
 * @param {string=} expectedCurrentStatus
 * @return {Object}
 */
function ConditionUpdateEngine_updateConditionStatus(
  conditionId,
  newStatus,
  expectedCurrentStatus
) {

  const normalizedConditionId =
    String(
      conditionId || ""
    ).trim();

  const normalizedNewStatus =
    String(
      newStatus || ""
    ).trim();

  const normalizedExpectedStatus =
    expectedCurrentStatus ===
    undefined
      ? null
      : String(
          expectedCurrentStatus || ""
        ).trim();

  if (!normalizedConditionId) {

    throw new Error(
      "条件IDがありません。"
    );

  }

  const allowedStatuses = [
    "試験",
    "標準",
    "旧版"
  ];

  if (
    !allowedStatuses.includes(
      normalizedNewStatus
    )
  ) {

    throw new Error(
      "成形条件の状態が正しくありません。"
    );

  }

  const sheet =
    SpreadsheetApp
      .openById(
        SPREADSHEET_ID
      )
      .getSheetByName(
        "成形条件マスター"
      );

  if (!sheet) {

    throw new Error(
      "成形条件マスターがありません。"
    );

  }

  const values =
    sheet
      .getDataRange()
      .getValues();

  if (
    !values ||
    values.length === 0
  ) {

    throw new Error(
      "成形条件マスターに見出しがありません。"
    );

  }

  const headers =
    values[0];

  const conditionIdColumn =
    headers.indexOf(
      "条件ID"
    );

  const statusColumn =
    headers.indexOf(
      "状態"
    );

  const updatedAtColumn =
    headers.indexOf(
      "最終更新日"
    );

  if (
    conditionIdColumn === -1
  ) {

    throw new Error(
      "成形条件マスターに「条件ID」列がありません。"
    );

  }

  if (
    statusColumn === -1
  ) {

    throw new Error(
      "成形条件マスターに「状態」列がありません。"
    );

  }

  for (
    let rowIndex = 1;
    rowIndex < values.length;
    rowIndex++
  ) {

    const storedConditionId =
      String(
        values[rowIndex][
          conditionIdColumn
        ] || ""
      ).trim();

    if (
      storedConditionId !==
      normalizedConditionId
    ) {

      continue;

    }

    const currentStatus =
      String(
        values[rowIndex][
          statusColumn
        ] || ""
      ).trim();

    if (
      normalizedExpectedStatus !==
        null &&
      currentStatus !==
        normalizedExpectedStatus
    ) {

      throw new Error(
        "成形条件の状態が想定した状態から変更されています。"
      );

    }

    const sheetRowNumber =
      rowIndex + 1;

    sheet
      .getRange(
        sheetRowNumber,
        statusColumn + 1
      )
      .setValue(
        normalizedNewStatus
      );

    if (
      updatedAtColumn !== -1
    ) {

      sheet
        .getRange(
          sheetRowNumber,
          updatedAtColumn + 1
        )
        .setValue(
          new Date()
        );

    }

    return {

      status:
        "success",

      conditionId:
        normalizedConditionId,

      oldStatus:
        currentStatus,

      newStatus:
        normalizedNewStatus

    };

  }

  throw new Error(
    "指定された条件IDが成形条件マスターに見つかりません。"
  );

}



/**
 * 指定した条件IDの成形条件詳細を削除する
 *
 * ロールバック専用。
 * 通常の削除機能として外部公開しない。
 *
 * @param {string} conditionId
 * @return {Object}
 */
function ConditionUpdateEngine_rollbackConditionDetail(
  conditionId
) {

  const normalizedConditionId =
    String(
      conditionId || ""
    ).trim();

  if (!normalizedConditionId) {

    throw new Error(
      "ロールバック対象の条件IDがありません。"
    );

  }

  const sheet =
    SpreadsheetApp
      .openById(
        SPREADSHEET_ID
      )
      .getSheetByName(
        "成形条件詳細マスター"
      );

  if (!sheet) {

    throw new Error(
      "成形条件詳細マスターがありません。"
    );

  }

  const values =
    sheet
      .getDataRange()
      .getValues();

  if (
    !values ||
    values.length === 0
  ) {

    throw new Error(
      "成形条件詳細マスターに見出しがありません。"
    );

  }

  const headers =
    values[0];

  const conditionIdColumn =
    headers.indexOf(
      "条件ID"
    );

  if (
    conditionIdColumn === -1
  ) {

    throw new Error(
      "成形条件詳細マスターに「条件ID」列がありません。"
    );

  }

  /*
  下から削除することで、
  行番号がずれて誤削除することを防ぐ。
  */

  let deletedCount = 0;

  for (
    let rowIndex =
      values.length - 1;
    rowIndex >= 1;
    rowIndex--
  ) {

    const storedConditionId =
      String(
        values[rowIndex][
          conditionIdColumn
        ] || ""
      ).trim();

    if (
      storedConditionId !==
      normalizedConditionId
    ) {

      continue;

    }

    sheet.deleteRow(
      rowIndex + 1
    );

    deletedCount++;

  }

  return {

    status:
      "success",

    conditionId:
      normalizedConditionId,

    deletedCount:
      deletedCount

  };

}



/**
 * 指定した条件IDの成形条件マスター行を削除する
 *
 * ロールバック専用。
 * 通常の削除機能として外部公開しない。
 *
 * @param {string} conditionId
 * @param {string} expectedParentConditionId
 * @return {Object}
 */
function ConditionUpdateEngine_rollbackCondition(
  conditionId,
  expectedParentConditionId
) {

  const normalizedConditionId =
    String(
      conditionId || ""
    ).trim();

  const normalizedExpectedParentConditionId =
    String(
      expectedParentConditionId || ""
    ).trim();

  if (!normalizedConditionId) {

    throw new Error(
      "ロールバック対象の条件IDがありません。"
    );

  }

  if (!normalizedExpectedParentConditionId) {

    throw new Error(
      "想定する親条件IDがありません。"
    );

  }

  const sheet =
    SpreadsheetApp
      .openById(
        SPREADSHEET_ID
      )
      .getSheetByName(
        "成形条件マスター"
      );

  if (!sheet) {

    throw new Error(
      "成形条件マスターがありません。"
    );

  }

  const values =
    sheet
      .getDataRange()
      .getValues();

  if (
    !values ||
    values.length === 0
  ) {

    throw new Error(
      "成形条件マスターに見出しがありません。"
    );

  }

  const headers =
    values[0];

  const conditionIdColumn =
    headers.indexOf(
      "条件ID"
    );

  const parentConditionIdColumn =
    headers.indexOf(
      "親条件ID"
    );

  if (
    conditionIdColumn === -1
  ) {

    throw new Error(
      "成形条件マスターに「条件ID」列がありません。"
    );

  }

  if (
    parentConditionIdColumn === -1
  ) {

    throw new Error(
      "成形条件マスターに「親条件ID」列がありません。"
    );

  }

  for (
    let rowIndex = 1;
    rowIndex < values.length;
    rowIndex++
  ) {

    const storedConditionId =
      String(
        values[rowIndex][
          conditionIdColumn
        ] || ""
      ).trim();

    if (
      storedConditionId !==
      normalizedConditionId
    ) {

      continue;

    }

    const storedParentConditionId =
      String(
        values[rowIndex][
          parentConditionIdColumn
        ] || ""
      ).trim();

    /*
    今回の処理で作った条件であることを、
    親条件IDでも確認する。
    */

    if (
      storedParentConditionId !==
      normalizedExpectedParentConditionId
    ) {

      throw new Error(
        "ロールバック対象の親条件IDが想定と一致しません。削除を中止しました。"
      );

    }

    sheet.deleteRow(
      rowIndex + 1
    );

    return {

      status:
        "success",

      conditionId:
        normalizedConditionId,

      parentConditionId:
        storedParentConditionId,

      deletedCount:
        1

    };

  }

  return {

    status:
      "success",

    conditionId:
      normalizedConditionId,

    parentConditionId:
      normalizedExpectedParentConditionId,

    deletedCount:
      0

  };

}



/**
 * 金型温度変更を一括確定する
 *
 * 処理順序：
 * 1. 排他ロック
 * 2. 権限済みユーザー情報の確認
 * 3. 事前検証
 * 4. 条件マスター複製
 * 5. 条件詳細複製
 * 6. 新条件を標準へ変更
 * 7. 製品の現在標準条件IDを切替
 * 8. 旧条件を旧版へ変更
 *
 * 途中で失敗した場合は、
 * 可能な範囲で元の状態へ戻す。
 *
 * @param {string} productId
 * @param {string} expectedCurrentConditionId
 * @param {number|string} newMoldTemperature
 * @param {Object} user
 * @return {Object}
 */
function ConditionUpdateEngine_executeMoldTemperatureUpdate(
  productId,
  expectedCurrentConditionId,
  newMoldTemperature,
  user
) {

  if (
    !user ||
    !user.userId
  ) {

    throw new Error(
      "更新者情報がありません。"
    );

  }

  const lock =
    LockService.getScriptLock();

  let lockAcquired =
    false;

  let validation =
    null;

  let createdCondition =
    null;

  let createdConditionDetail =
    null;

  try {

    /*
    =========================================
    排他ロック
    =========================================
    */

    lock.waitLock(
      30000
    );

    lockAcquired =
      true;


    /*
    =========================================
    事前検証
    =========================================
    */

    validation =
      ConditionUpdateEngine_validateMoldTemperatureUpdate(
        productId,
        expectedCurrentConditionId,
        newMoldTemperature
      );

    const sourceConditionStatus =
      String(
        validation
          .sourceCondition[
            "状態"
          ] || ""
      ).trim();

    if (
      sourceConditionStatus !==
      "標準"
    ) {

      throw new Error(
        "現在標準条件IDが指す成形条件の状態が「標準」ではありません。"
      );

    }


    /*
    =========================================
    変更理由
    =========================================
    */

    const changeReason =
      "金型温度を" +
      validation.oldMoldTemperature +
      "℃から" +
      validation.newMoldTemperature +
      "℃へ変更";


    /*
    =========================================
    新しい条件マスターを作成
    =========================================
    */

    createdCondition =
      ConditionUpdateEngine_createConditionCopy(
        validation.sourceConditionId,
        user,
        changeReason
      );


    /*
    =========================================
    新しい条件詳細を作成
    =========================================
    */

    createdConditionDetail =
      ConditionUpdateEngine_createConditionDetailCopy(
        validation.sourceConditionId,
        createdCondition.newConditionId,
        validation.newMoldTemperature
      );


    /*
    =========================================
    新条件を標準へ変更
    =========================================
    */

    ConditionUpdateEngine_updateConditionStatus(
      createdCondition.newConditionId,
      "標準",
      "試験"
    );


    /*
    =========================================
    製品の現在標準条件IDを切替
    =========================================
    */

    ConditionUpdateEngine_updateCurrentConditionId(
      validation.productId,
      createdCondition.newConditionId,
      validation.sourceConditionId
    );


    /*
    =========================================
    旧条件を旧版へ変更
    =========================================
    */

    ConditionUpdateEngine_updateConditionStatus(
      validation.sourceConditionId,
      "旧版",
      "標準"
    );


    /*
    =========================================
    正常終了
    =========================================
    */

    return {

      status:
        "success",

      action:
        "updateMoldTemperature",

      message:
        "金型温度を更新しました。",

      productId:
        validation.productId,

      productName:
        validation.productName,

      drawingNumber:
        validation.drawingNumber,

      oldConditionId:
        validation.sourceConditionId,

      newConditionId:
        createdCondition.newConditionId,

      oldMoldTemperature:
        validation.oldMoldTemperature,

      newMoldTemperature:
        validation.newMoldTemperature,

      version:
        createdCondition.version,

      changedBy:
        createdCondition.changedBy,

      changeReason:
        createdCondition.changeReason

    };

  } catch (error) {

    /*
    =========================================
    ロールバック
    =========================================

    各内部関数では、値本体の更新後に
    最終更新日設定で失敗する可能性もある。

    そのため、単純な成功フラグだけではなく、
    現在のシート状態を再取得して判断する。
    */

    const rollbackErrors = [];

    const newConditionId =
      createdCondition &&
      createdCondition.newConditionId
        ? String(
            createdCondition.newConditionId
          ).trim()
        : "";

    const sourceConditionId =
      validation &&
      validation.sourceConditionId
        ? String(
            validation.sourceConditionId
          ).trim()
        : String(
            expectedCurrentConditionId || ""
          ).trim();

    const normalizedProductId =
      validation &&
      validation.productId
        ? String(
            validation.productId
          ).trim()
        : String(
            productId || ""
          ).trim();


    /*
    旧条件が「旧版」へ変わっている場合、
    先に「標準」へ戻す。
    */

    if (
      sourceConditionId
    ) {

      try {

        const currentSourceCondition =
          getConditionById(
            sourceConditionId
          );

        const currentSourceStatus =
          currentSourceCondition
            ? String(
                currentSourceCondition[
                  "状態"
                ] || ""
              ).trim()
            : "";

        if (
          currentSourceStatus ===
          "旧版"
        ) {

          ConditionUpdateEngine_updateConditionStatus(
            sourceConditionId,
            "標準",
            "旧版"
          );

        }

      } catch (
        rollbackError
      ) {

        rollbackErrors.push(
          "旧条件の状態を戻せませんでした：" +
          (
            rollbackError &&
            rollbackError.message
              ? rollbackError.message
              : String(
                  rollbackError
                )
          )
        );

      }

    }


    /*
    製品が新条件を指している場合、
    旧条件へ戻す。
    */

    if (
      normalizedProductId &&
      newConditionId &&
      sourceConditionId
    ) {

      try {

        const currentProduct =
          getProductById(
            normalizedProductId
          );

        const currentConditionId =
          currentProduct
            ? String(
                currentProduct[
                  "現在標準条件ID"
                ] || ""
              ).trim()
            : "";

        if (
          currentConditionId ===
          newConditionId
        ) {

          ConditionUpdateEngine_updateCurrentConditionId(
            normalizedProductId,
            sourceConditionId,
            newConditionId
          );

        }

      } catch (
        rollbackError
      ) {

        rollbackErrors.push(
          "製品の現在標準条件IDを戻せませんでした：" +
          (
            rollbackError &&
            rollbackError.message
              ? rollbackError.message
              : String(
                  rollbackError
                )
          )
        );

      }

    }


    /*
    製品が新条件を参照していないことを確認できた場合だけ、
    新条件を削除する。
    */

    let canDeleteNewCondition =
      Boolean(
        newConditionId
      );

    if (
      canDeleteNewCondition &&
      normalizedProductId
    ) {

      try {

        const currentProduct =
          getProductById(
            normalizedProductId
          );

        const currentConditionId =
          currentProduct
            ? String(
                currentProduct[
                  "現在標準条件ID"
                ] || ""
              ).trim()
            : "";

        if (
          currentConditionId ===
          newConditionId
        ) {

          canDeleteNewCondition =
            false;

          rollbackErrors.push(
            "製品が新条件を参照しているため、新条件の削除を中止しました。"
          );

        }

      } catch (
        rollbackError
      ) {

        canDeleteNewCondition =
          false;

        rollbackErrors.push(
          "製品の参照状態を確認できないため、新条件の削除を中止しました：" +
          (
            rollbackError &&
            rollbackError.message
              ? rollbackError.message
              : String(
                  rollbackError
                )
          )
        );

      }

    }


    /*
    新しい条件詳細を削除する。
    */

    if (
      canDeleteNewCondition &&
      newConditionId
    ) {

      try {

        ConditionUpdateEngine_rollbackConditionDetail(
          newConditionId
        );

      } catch (
        rollbackError
      ) {

        rollbackErrors.push(
          "新条件詳細を削除できませんでした：" +
          (
            rollbackError &&
            rollbackError.message
              ? rollbackError.message
              : String(
                  rollbackError
                )
          )
        );

      }

    }


    /*
    新しい条件マスターを削除する。
    */

    if (
      canDeleteNewCondition &&
      newConditionId &&
      sourceConditionId
    ) {

      try {

        ConditionUpdateEngine_rollbackCondition(
          newConditionId,
          sourceConditionId
        );

      } catch (
        rollbackError
      ) {

        rollbackErrors.push(
          "新条件を削除できませんでした：" +
          (
            rollbackError &&
            rollbackError.message
              ? rollbackError.message
              : String(
                  rollbackError
                )
          )
        );

      }

    }


    /*
    元のエラーへロールバック結果を付加する。
    */

    const originalMessage =
      error &&
      error.message
        ? error.message
        : "金型温度の更新に失敗しました。";

    if (
      rollbackErrors.length > 0
    ) {

      throw new Error(
        originalMessage +
        "\n" +
        "ロールバック中にも問題が発生しました。" +
        "\n" +
        rollbackErrors.join(
          "\n"
        )
      );

    }

    throw new Error(
      originalMessage
    );

  } finally {

    if (
      lockAcquired
    ) {

      lock.releaseLock();

    }

  }

}


