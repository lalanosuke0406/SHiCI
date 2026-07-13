

function updateCell(sheet, rowNumber, headers, headerName, value) {

  if (value === undefined) {
    return;
  }

  const colIndex = headers.indexOf(headerName);

  if (colIndex === -1) {
    return;
  }

  sheet.getRange(rowNumber, colIndex + 1).setValue(value);
}




/*製品CRU*/

/*製品C登録*/

function addProduct(sheet, data) {

  const productId = generateId("P");

  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];

  const row = [];

  headers.forEach(header => {
    switch(header) {
      case "製品ID":
        row.push(productId);
        break;

      case "図番":
        row.push(data.drawingNo || "");
        break;

      case "製品名":
        row.push(data.productName || "");
        break;

      case "金型ID":
        row.push(data.moldId || "");
        break;

      case "材料ID":
        row.push(data.materialId || "");
        break;

      case "成形機ID":
        row.push(data.machineId || "");
        break;

      case "現在標準条件ID":
        row.push(data.conditionId || "");
        break;

      case "製品単重(g)":
        row.push(data.productWeight || "");
        break;

      case "1ショット重量(g)":
        row.push(data.shotWeight || "");
        break;

      case "1ショット時間(秒)":
        row.push(data.shotTime || "");
        break;

      case "取出機使用有無":
        row.push(data.robotUse || "");
        break;

      case "標準歩留(%)":
        row.push(data.standardYield || "");
        break;

      case "注意点":
        row.push(data.notes || "");
        break;

      case "最終更新日":
        row.push(new Date());
        break;

      default:
        row.push("");
    }
  });

  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      action: "addProduct",
      message: "製品を追加しました",
      productId: productId,
      drawingNo: data.drawingNo || "",
      productName: data.productName || "",
      moldId: data.moldId || "",
      materialId: data.materialId || "",
      machineId: data.machineId || "",
      conditionId: data.conditionId || ""
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*製品R検索*/

function searchProducts(e) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("製品マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        type: "products",
        count: 0,
        records: []
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = values[0];

  const productIdCol = headers.indexOf("製品ID");
  const drawingCol = headers.indexOf("図番");
  const productNameCol = headers.indexOf("製品名");
  const moldIdCol = headers.indexOf("金型ID");
  const materialIdCol = headers.indexOf("材料ID");
  const machineIdCol = headers.indexOf("成形機ID");
  const conditionIdCol = headers.indexOf("現在標準条件ID");

  const productId = e.parameter.productId || "";
  const drawingNo = e.parameter.drawingNo || "";
  const productName = e.parameter.productName || "";
  const moldId = e.parameter.moldId || "";
  const materialId = e.parameter.materialId || "";
  const machineId = e.parameter.machineId || "";
  const conditionId = e.parameter.conditionId || "";

  let results = [];

  for (let i = 1; i < values.length; i++) {

    let hit = true;

    if (
      productId &&
      productIdCol !== -1 &&
      values[i][productIdCol] != productId
    ) {
      hit = false;
    }

    if (
      drawingNo &&
      drawingCol !== -1 &&
      values[i][drawingCol] != drawingNo
    ) {
      hit = false;
    }

    if (
      productName &&
      productNameCol !== -1 &&
      String(values[i][productNameCol] || "")
        .indexOf(productName) === -1
    ) {
      hit = false;
    }

    if (
      moldId &&
      moldIdCol !== -1 &&
      values[i][moldIdCol] != moldId
    ) {
      hit = false;
    }

    if (
      materialId &&
      materialIdCol !== -1 &&
      values[i][materialIdCol] != materialId
    ) {
      hit = false;
    }

    if (
      machineId &&
      machineIdCol !== -1 &&
      values[i][machineIdCol] != machineId
    ) {
      hit = false;
    }

    if (
      conditionId &&
      conditionIdCol !== -1 &&
      values[i][conditionIdCol] != conditionId
    ) {
      hit = false;
    }

    if (hit) {

      let record = {};

      headers.forEach((header, index) => {
        record[header] = values[i][index];
      });

      results.push(record);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      type: "products",
      count: results.length,
      records: results
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*製品U更新*/

function updateProduct(sheet, data) {

  const values = sheet.getDataRange().getValues();
  const headers = values[0];

  const productIdCol = headers.indexOf("製品ID");
  const drawingCol = headers.indexOf("図番");

  if (!data.productId && !data.drawingNo) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: "更新には productId または drawingNo が必要です"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  for (let i = 1; i < values.length; i++) {

    let hit = false;

    if (
      data.productId &&
      productIdCol !== -1 &&
      values[i][productIdCol] == data.productId
    ) {
      hit = true;

    } else if (
      data.drawingNo &&
      drawingCol !== -1 &&
      values[i][drawingCol] == data.drawingNo
    ) {
      hit = true;
    }

    if (hit) {

      const oldDrawingNo = values[i][drawingCol];

      const nextDrawingNo =
        data.newDrawingNo ||
        data.newdrawingNo ||
        data.new_drawing_no ||
        data.drawingNoTo ||
        data.toDrawingNo ||
        "";

      if (nextDrawingNo) {
        updateCell(sheet, i + 1, headers, "図番", nextDrawingNo);
      }

      if (!nextDrawingNo && data.productId && data.drawingNo) {
        updateCell(sheet, i + 1, headers, "図番", data.drawingNo);
      }

      updateCell(sheet, i + 1, headers, "製品名", data.productName);
      updateCell(sheet, i + 1, headers, "金型ID", data.moldId);
      updateCell(sheet, i + 1, headers, "材料ID", data.materialId);
      updateCell(sheet, i + 1, headers, "成形機ID", data.machineId);
      updateCell(sheet, i + 1, headers, "現在標準条件ID", data.conditionId);

      updateCell(sheet, i + 1, headers, "製品単重(g)", data.productWeight);
      updateCell(sheet, i + 1, headers, "1ショット重量(g)", data.shotWeight);
      updateCell(sheet, i + 1, headers, "1ショット時間(秒)", data.shotTime);
      updateCell(sheet, i + 1, headers, "取出機使用有無", data.robotUse);
      updateCell(sheet, i + 1, headers, "標準歩留(%)", data.standardYield);

      updateCell(sheet, i + 1, headers, "注意点", data.notes);
      updateCell(sheet, i + 1, headers, "最終更新日", new Date());

      const finalDrawingNo =
        nextDrawingNo ||
        (data.productId && data.drawingNo ? data.drawingNo : oldDrawingNo);

      return ContentService
        .createTextOutput(JSON.stringify({
          status: "success",
          action: "updateProduct",
          message: "製品情報を更新しました",
          productId: values[i][productIdCol],
          oldDrawingNo: oldDrawingNo,
          receivedDrawingNo: data.drawingNo || "",
          receivedNewDrawingNo: data.newDrawingNo || "",
          drawingNo: finalDrawingNo,
          moldId: data.moldId || "",
          materialId: data.materialId || "",
          machineId: data.machineId || "",
          conditionId: data.conditionId || ""
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "error",
      message: "対象製品が見つかりません",
      productId: data.productId || "",
      drawingNo: data.drawingNo || "",
      newDrawingNo: data.newDrawingNo || ""
    }))
    .setMimeType(ContentService.MimeType.JSON);
}





/*材料CRU*/

/*材料C登録*/

function addMaterial(data) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("材料マスター");

  const materialId = generateId("MAT");

  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];

  const row = [];

  headers.forEach(header => {
    switch(header) {
      case "材料ID":
        row.push(materialId);
        break;
      case "材料名":
        row.push(data.materialName || "");
        break;
      case "グレード":
        row.push(data.grade || "");
        break;
      case "色番":
        row.push(data.colorNo || "");
        break;
      case "メーカー":
        row.push(data.maker || "");
        break;
      case "樹脂分類":
        row.push(data.resinType || "");
        break;
      case "乾燥条件":
        row.push(data.dryingCondition || "");
        break;
      case "特徴":
        row.push(data.features || "");
        break;
      case "注意点":
        row.push(data.notes || "");
        break;
      case "仕入先":
        row.push(data.supplier || "");
        break;
      case "仕入単価":
        row.push(data.unitPrice || "");
        break;
      case "最小注文数":
        row.push(data.minOrderQty || "");
        break;
      case "発注点在庫数":
        row.push(data.reorderPoint || "");
        break;
      case "最終更新日":
        row.push(new Date());
        break;
      default:
        row.push("");
    }
  });

  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      action: "addMaterial",
      message: "材料を追加しました",
      materialId: materialId,
      materialName: data.materialName || "",
      grade: data.grade || "",
      colorNo: data.colorNo || ""
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*材料R検索*/

function searchMaterial(e) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("材料マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        type: "material",
        count: 0,
        records: []
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = values[0];

  const materialIdCol = headers.indexOf("材料ID");
  const materialNameCol = headers.indexOf("材料名");
  const gradeCol = headers.indexOf("グレード");
  const makerCol = headers.indexOf("メーカー");
  const resinTypeCol = headers.indexOf("樹脂分類");

  const materialId = e.parameter.materialId || "";
  const materialName = e.parameter.materialName || "";
  const grade = e.parameter.grade || "";
  const maker = e.parameter.maker || "";
  const resinType = e.parameter.resinType || "";

  let results = [];

  for (let i = 1; i < values.length; i++) {

    let hit = false;

    if (
      materialId &&
      materialIdCol !== -1 &&
      values[i][materialIdCol] == materialId
    ) {
      hit = true;
    }

    if (
      materialName &&
      materialNameCol !== -1 &&
      String(values[i][materialNameCol] || "").indexOf(materialName) !== -1
    ) {
      hit = true;
    }

    if (
      grade &&
      gradeCol !== -1 &&
      String(values[i][gradeCol] || "").indexOf(grade) !== -1
    ) {
      hit = true;
    }

    if (
      maker &&
      makerCol !== -1 &&
      String(values[i][makerCol] || "").indexOf(maker) !== -1
    ) {
      hit = true;
    }

    if (
      resinType &&
      resinTypeCol !== -1 &&
      String(values[i][resinTypeCol] || "").indexOf(resinType) !== -1
    ) {
      hit = true;
    }

    if (hit) {
      let record = {};

      headers.forEach((header, index) => {
        record[header] = values[i][index];
      });

      results.push(record);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      type: "material",
      count: results.length,
      records: results
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*材料U更新*/

function updateMaterial(data) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("材料マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: "材料マスターにデータがありません"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = values[0];
  const materialIdCol = headers.indexOf("材料ID");

  if (!data.materialId) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: "materialId が必要です"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  for (let i = 1; i < values.length; i++) {

    if (values[i][materialIdCol] == data.materialId) {

      updateCell(sheet, i + 1, headers, "材料名", data.materialName);
      updateCell(sheet, i + 1, headers, "グレード", data.grade);
      updateCell(sheet, i + 1, headers, "色番", data.colorNo);
      updateCell(sheet, i + 1, headers, "メーカー", data.maker);
      updateCell(sheet, i + 1, headers, "樹脂分類", data.resinType);
      updateCell(sheet, i + 1, headers, "乾燥条件", data.dryingCondition);
      updateCell(sheet, i + 1, headers, "特徴", data.features);
      updateCell(sheet, i + 1, headers, "注意点", data.notes);
      updateCell(sheet, i + 1, headers, "仕入先", data.supplier);
      updateCell(sheet, i + 1, headers, "仕入単価", data.unitPrice);
      updateCell(sheet, i + 1, headers, "最小注文数", data.minOrderQty);
      updateCell(sheet, i + 1, headers, "発注点在庫数", data.reorderPoint);

      updateCell(sheet, i + 1, headers, "最終更新日", new Date());

      return ContentService
        .createTextOutput(JSON.stringify({
          status: "success",
          action: "updateMaterial",
          message: "材料情報を更新しました",
          materialId: data.materialId
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "error",
      message: "指定された材料IDが見つかりません",
      materialId: data.materialId
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*材料を材料IDで取得*/

function getMaterialById(materialId) {

  if (!materialId) {
    return null;
  }

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("材料マスター");

  const values = sheet.getDataRange().getValues();
  const headers = values[0];

  const materialIdCol = headers.indexOf("材料ID");

  for (let i = 1; i < values.length; i++) {
    if (values[i][materialIdCol] == materialId) {

      let material = {};

      headers.forEach((header, index) => {
        material[header] = values[i][index];
      });

      return material;
    }
  }

  return null;
}





/*成形機CRU*/

/*成形機C登録*/

function addMachine(data) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("成形機マスター");

  const machineId = generateId("MC");

  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];

  const row = [];

  headers.forEach(header => {
    switch (header) {
      case "成形機ID":
        row.push(machineId);
        break;

      case "呼称1":
        row.push(data.machineAlias1 || "");
        break;

      case "呼称2":
        row.push(data.machineAlias2 || "");
        break;

      case "成形機名(MODEL)":
        row.push(data.machineName || "");
        break;

      case "メーカー":
        row.push(data.maker || "");
        break;

      case "型式(MACHINE NO.)":
        row.push(data.model || "");
        break;

      case "型締力(TYPE)":
        row.push(
          data.clampingForce
            ? String(data.clampingForce).replace(/[^0-9.]/g, "")
            : ""
        );
        break;

      case "スクリュー径":
        row.push(data.screwDiameter || "");
        break;

      case "プランジャー径":
        row.push(data.plungerDiameter || "");
        break;

      case "射出方式":
        row.push(data.injectionType || "");
        break;

      case "製造年月":
        row.push(data.manufactureDate || "");
        break;

      case "特徴":
        row.push(data.features || "");
        break;

      case "注意点":
        row.push(data.notes || "");
        break;

      case "最終更新日":
        row.push(new Date());
        break;

      default:
        row.push("");
    }
  });

  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      action: "addMachine",
      message: "成形機を追加しました",
      machineId: machineId,
      machineName: data.machineName || "",
      machineAlias1: data.machineAlias1 || "",
      machineAlias2: data.machineAlias2 || "",
      maker: data.maker || "",
      model: data.model || "",
      clampingForce: data.clampingForce
        ? String(data.clampingForce).replace(/[^0-9.]/g, "")
        : "",
      screwDiameter: data.screwDiameter || "",
      plungerDiameter: data.plungerDiameter || "",
      injectionType: data.injectionType || "",
      manufactureDate: data.manufactureDate || ""
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*成形機R検索*/

function searchMachine(e) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("成形機マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        type: "machine",
        count: 0,
        records: []
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = values[0];

  const machineId = e.parameter.machineId || "";
  const machineName = e.parameter.machineName || "";
  const alias = e.parameter.alias || "";
  const maker = e.parameter.maker || "";
  const model = e.parameter.model || "";

  const machineIdCol = headers.indexOf("成形機ID");
  const alias1Col = headers.indexOf("呼称1");
  const alias2Col = headers.indexOf("呼称2");
  const machineNameCol = headers.indexOf("成形機名(MODEL)");
  const makerCol = headers.indexOf("メーカー");
  const modelCol = headers.indexOf("型式(MACHINE NO.)");

  let results = [];

  for (let i = 1; i < values.length; i++) {

    const row = values[i];

    let hit = false;

    if (
      machineId &&
      machineIdCol !== -1 &&
      row[machineIdCol] == machineId
    ) {
      hit = true;
    }

    if (
      machineName &&
      machineNameCol !== -1 &&
      String(row[machineNameCol] || "").indexOf(machineName) !== -1
    ) {
      hit = true;
    }

    if (
      alias &&
      (
        (alias1Col !== -1 && String(row[alias1Col] || "").indexOf(alias) !== -1) ||
        (alias2Col !== -1 && String(row[alias2Col] || "").indexOf(alias) !== -1)
      )
    ) {
      hit = true;
    }

    if (
      maker &&
      makerCol !== -1 &&
      String(row[makerCol] || "").indexOf(maker) !== -1
    ) {
      hit = true;
    }

    if (
      model &&
      modelCol !== -1 &&
      String(row[modelCol] || "").indexOf(model) !== -1
    ) {
      hit = true;
    }

    if (hit) {

      let record = {};

      headers.forEach((header, index) => {
        record[header] = row[index];
      });

      results.push(record);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      type: "machine",
      count: results.length,
      records: results
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*成形機U更新*/

function updateMachine(data) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("成形機マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: "成形機マスターにデータがありません"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = values[0];

  const machineIdCol =
    headers.indexOf("成形機ID");

  if (!data.machineId) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: "machineId が必要です"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  for (let i = 1; i < values.length; i++) {

    if (values[i][machineIdCol] == data.machineId) {

      updateCell(sheet, i + 1, headers, "呼称1", data.machineAlias1);
      updateCell(sheet, i + 1, headers, "呼称2", data.machineAlias2);
      updateCell(sheet, i + 1, headers, "成形機名(MODEL)", data.machineName);
      updateCell(sheet, i + 1, headers, "メーカー", data.maker);
      updateCell(sheet, i + 1, headers, "型式(MACHINE NO.)", data.model);

      if (data.clampingForce !== undefined) {
        updateCell(
          sheet,
          i + 1,
          headers,
          "型締力(TYPE)",
          String(data.clampingForce)
            .replace(/[^0-9.]/g, "")
        );
      }

      updateCell(sheet, i + 1, headers, "スクリュー径", data.screwDiameter);
      updateCell(sheet, i + 1, headers, "プランジャー径", data.plungerDiameter);
      updateCell(sheet, i + 1, headers, "射出方式", data.injectionType);
      updateCell(sheet, i + 1, headers, "製造年月", data.manufactureDate);
      updateCell(sheet, i + 1, headers, "特徴", data.features);
      updateCell(sheet, i + 1, headers, "注意点", data.notes);

      updateCell(
        sheet,
        i + 1,
        headers,
        "最終更新日",
        new Date()
      );

      return ContentService
        .createTextOutput(JSON.stringify({
          status: "success",
          action: "updateMachine",
          message: "成形機情報を更新しました",
          machineId: data.machineId
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "error",
      message: "指定された成形機IDが見つかりません",
      machineId: data.machineId
    }))
    .setMimeType(ContentService.MimeType.JSON);
}






/*成形条件CRU*/

/*成形条件C登録*/

function addCondition(data) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("成形条件マスター");

  const conditionId = generateId("COND");

  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];

  const row = [];

  headers.forEach(header => {
    switch (header) {
      case "条件ID":
        row.push(conditionId);
        break;
      case "製品ID":
        row.push(data.productId || "");
        break;
      case "親条件ID":
        row.push(data.parentConditionId || "");
        break;
      case "版数":
        row.push(data.version || "");
        break;
      case "状態":
        row.push(data.conditionStatus || data.status || "試験");
        break;
      case "条件名":
        row.push(data.conditionName || "");
        break;
      case "図番":
        row.push(data.drawingNo || "");
        break;
      case "材料ID":
        row.push(data.materialId || "");
        break;
      case "成形機ID":
        row.push(data.machineId || "");
        break;
      case "変更理由":
        row.push(data.changeReason || "");
        break;
      case "結果":
        row.push(data.result || "");
        break;
      case "変更者":
        row.push(data.changedBy || "");
        break;
      case "成形条件ファイルID":
        row.push(data.conditionFileId || "");
        break;
      case "備考":
        row.push(data.notes || "");
        break;
      case "最終更新日":
        row.push(new Date());
        break;
      default:
        row.push("");
    }
  });

  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      action: "addCondition",
      message: "成形条件を追加しました",
      conditionId: conditionId,
      productId: data.productId || "",
      drawingNo: data.drawingNo || "",
      conditionName: data.conditionName || "",
      conditionStatus: data.conditionStatus || data.status || "試験"
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*成形条件R検索*/
function searchCondition(e) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("成形条件マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        type: "condition",
        count: 0,
        records: []
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = values[0];

  const conditionId = e.parameter.conditionId || "";
  const productId = e.parameter.productId || "";
  const drawingNo = e.parameter.drawingNo || "";
  const conditionStatus = e.parameter.conditionStatus || "";

  let results = [];

  for (let i = 1; i < values.length; i++) {

    const row = values[i];

    let hit = false;

    if (
      conditionId &&
      row[headers.indexOf("条件ID")] == conditionId
    ) {
      hit = true;
    }

    if (
      productId &&
      row[headers.indexOf("製品ID")] == productId
    ) {
      hit = true;
    }

    if (
      drawingNo &&
      row[headers.indexOf("図番")] == drawingNo
    ) {
      hit = true;
    }

    if (
      conditionStatus &&
      row[headers.indexOf("状態")] == conditionStatus
    ) {
      hit = true;
    }

    if (hit) {

      let record = {};

      headers.forEach((header, index) => {
        record[header] = row[index];
      });

      results.push(record);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      type: "condition",
      count: results.length,
      records: results
    }))
    .setMimeType(ContentService.MimeType.JSON);
}






/*成形条件詳細CRU*/

/*成形条件詳細C登録*/

function addConditionDetail(data) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("成形条件詳細マスター");

  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];

  const row = [];

  const map = {
    "条件ID": "conditionId",
    "成形条件ファイルID": "conditionFileId",
    "ファイル名": "fileName",
    "樹脂温:Z0": "resinTempZ0",
    "樹脂温:Z1": "resinTempZ1",
    "樹脂温:Z2": "resinTempZ2",
    "樹脂温:ZP": "resinTempZP",
    "樹脂温:ZJ": "resinTempZJ",
    "樹脂温:Z4": "resinTempZ4",
    "樹脂温:Z5": "resinTempZ5",
    "樹脂温:Z6": "resinTempZ6",
    "樹脂温:ZH": "resinTempZH",
    "計量値(mm)": "meteringPosition",
    "射出ストローク:S1": "injectionStrokeS1",
    "射出ストローク:S2": "injectionStrokeS2",
    "射出ストローク:S3": "injectionStrokeS3",
    "射出ストローク:S4": "injectionStrokeS4",
    "射出ストローク:S5": "injectionStrokeS5",
    "射出速度:V1": "injectionSpeedV1",
    "射出速度:V2": "injectionSpeedV2",
    "射出速度:V3": "injectionSpeedV3",
    "射出速度:V4": "injectionSpeedV4",
    "射出速度:V5": "injectionSpeedV5",
    "速度徐変1(ON/OFF)": "speedRamp1",
    "速度徐変2(ON/OFF)": "speedRamp2",
    "速度徐変3(ON/OFF)": "speedRamp3",
    "速度徐変4(ON/OFF)": "speedRamp4",
    "速度徐変5(ON/OFF)": "speedRamp5",
    "切換応答": "switchResponse",
    "保圧力:P1": "holdingPressureP1",
    "保圧力:P2": "holdingPressureP2",
    "保圧力:P3": "holdingPressureP3",
    "保圧力:P4": "holdingPressureP4",
    "保圧時間:T1": "holdingTimeT1",
    "保圧時間:T2": "holdingTimeT2",
    "保圧時間:T3": "holdingTimeT3",
    "保圧時間:T4": "holdingTimeT4",
    "保圧速度": "holdingSpeed",
    "保圧徐変1(ON/OFF)": "holdingRamp1",
    "保圧徐変2(ON/OFF)": "holdingRamp2",
    "保圧徐変3(ON/OFF)": "holdingRamp3",
    "保圧徐変4(ON/OFF)": "holdingRamp4",
    "冷却時間": "coolingTime",
    "スクリュー回転": "screwRotation",
    "背圧": "backPressure",
    "サックバック量": "suckBackAmount",
    "サックバック速度": "suckBackSpeed",
    "射出ユニット後退時間": "injectionUnitRetractTime",
    "有効/無効": "isActive"
  };

  headers.forEach(header => {

    if (header === "最終更新日") {
      row.push(new Date());
      return;
    }

    const key = map[header];

    if (key) {
      row.push(data[key] || "");
    } else {
      row.push("");
    }
  });

  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      action: "addConditionDetail",
      message: "成形条件詳細を追加しました",
      conditionId: data.conditionId || "",
      conditionFileId: data.conditionFileId || "",
      fileName: data.fileName || "",
      isActive: data.isActive || ""
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*成形条件詳細R検索*/

function searchConditionDetail(e) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("成形条件詳細マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        type: "conditionDetail",
        count: 0,
        records: []
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = values[0];

  const conditionId = e.parameter.conditionId || "";
  const conditionFileId = e.parameter.conditionFileId || "";
  const fileName = e.parameter.fileName || "";
  const isActive = e.parameter.isActive || "";

  const conditionIdCol =
    headers.indexOf("条件ID");

  const conditionFileIdCol =
    headers.indexOf("成形条件ファイルID");

  const fileNameCol =
    headers.indexOf("ファイル名");

  const isActiveCol =
    headers.indexOf("有効/無効");

  let results = [];

  for (let i = 1; i < values.length; i++) {

    const row = values[i];

    let hit = true;

    if (
      conditionId &&
      (
        conditionIdCol === -1 ||
        row[conditionIdCol] != conditionId
      )
    ) {
      hit = false;
    }

    if (
      conditionFileId &&
      (
        conditionFileIdCol === -1 ||
        row[conditionFileIdCol] != conditionFileId
      )
    ) {
      hit = false;
    }

    if (
      fileName &&
      (
        fileNameCol === -1 ||
        String(row[fileNameCol] || "")
          .indexOf(fileName) === -1
      )
    ) {
      hit = false;
    }

    if (
      isActive &&
      (
        isActiveCol === -1 ||
        String(row[isActiveCol]) != isActive
      )
    ) {
      hit = false;
    }

    if (hit) {

      let record = {};

      headers.forEach((header, index) => {
        record[header] = row[index];
      });

      results.push(record);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      type: "conditionDetail",
      count: results.length,
      records: results
    }))
    .setMimeType(ContentService.MimeType.JSON);
}






/*トラブル履歴CRU*/

/*トラブル履歴C登録*/

function addTrouble(data) {
  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("トラブル履歴");

  const troubleId = generateId("TR");

  let mold = null;
  let product = null;

  // 1. まず製品情報を取得
  if (data.productId) {
    product = getProductById(data.productId);
  }

  if (!product && data.drawingNo) {
    product = getProductByDrawingNo(data.drawingNo);
  }

  // 2. 金型情報を取得
  if (data.moldId) {
    mold = getMoldById(data.moldId);
  }

  if (!mold && data.moldNo) {
    mold = getMoldByNo(data.moldNo);
  }

  if (!mold && data.drawingNo) {
    mold = getMoldByDrawingNo(data.drawingNo);
  }

  if (!mold && product && product["金型ID"]) {
    mold = getMoldById(product["金型ID"]);
  }

  if (!mold && data.productId) {
    mold = getMoldByProductId(data.productId);
  }

  // 3. 金型から製品を補完
  const drawingNoFromMold = mold ? mold["図番"] : "";

  if (!product && mold && mold["製品ID"]) {
    product = getProductById(mold["製品ID"]);
  }

  if (!product && drawingNoFromMold) {
    product = getProductByDrawingNo(drawingNoFromMold);
  }

  // 4. 補完値を確定
  const productId =
    data.productId ||
    (product ? product["製品ID"] : "") ||
    (mold ? mold["製品ID"] : "");

  const drawingNo =
    data.drawingNo ||
    (product ? product["図番"] : "") ||
    (mold ? mold["図番"] : "");

  const moldId =
    data.moldId ||
    (product ? product["金型ID"] : "") ||
    (mold ? mold["金型ID"] : "");

  const moldNo =
    data.moldNo ||
    (mold ? mold["金型番号"] : "");

  const conditionId =
    data.conditionId ||
    (product ? product["現在標準条件ID"] : "");

  const materialId =
    data.materialId ||
    (product ? product["材料ID"] : "");

  const machineId =
    data.machineId ||
    (product ? product["成形機ID"] : "");

  // 5. 登録
  sheet.appendRow([
    troubleId,
    data.occurredDate || new Date(),
    productId,
    drawingNo,
    moldId,
    moldNo,
    conditionId,
    materialId,
    machineId,
    data.problem || "",
    data.cause || "",
    data.countermeasure || "",
    data.status || "未対策",
    data.registeredBy || "",
    data.relatedMoldHistoryId || "",
    data.notes || "",
    new Date()
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      action: "addTrouble",
      message: "トラブル履歴を追加しました",
      troubleId: troubleId,
      occurredDate: data.occurredDate || "",
      productId: productId,
      drawingNo: drawingNo,
      moldId: moldId,
      moldNo: moldNo,
      conditionId: conditionId,
      materialId: materialId,
      machineId: machineId,
      problem: data.problem || "",
      status: data.status || "未対策",
      relatedMoldHistoryId: data.relatedMoldHistoryId || "",
      autoCompleted: {
        mold: mold ? true : false,
        product: product ? true : false
      }
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*トラブル履歴R検索*/

function searchTrouble(e) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("トラブル履歴");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        type: "trouble",
        count: 0,
        records: []
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = values[0];

  const troubleId = e.parameter.troubleId || "";
  const productId = e.parameter.productId || "";
  const drawingNo = e.parameter.drawingNo || "";
  const moldId = e.parameter.moldId || "";
  const moldNo = e.parameter.moldNo || "";
  const conditionId = e.parameter.conditionId || "";
  const materialId = e.parameter.materialId || "";
  const machineId = e.parameter.machineId || "";
  const problem = e.parameter.problem || "";
  const status = e.parameter.status || "";
  const relatedMoldHistoryId = e.parameter.relatedMoldHistoryId || "";

  const troubleIdCol = headers.indexOf("トラブルID");
  const productIdCol = headers.indexOf("製品ID");
  const drawingNoCol = headers.indexOf("図番");
  const moldIdCol = headers.indexOf("金型ID");
  const moldNoCol = headers.indexOf("金型番号");
  const conditionIdCol = headers.indexOf("条件ID");
  const materialIdCol = headers.indexOf("材料ID");
  const machineIdCol = headers.indexOf("成形機ID");
  const problemCol = headers.indexOf("発生現象");
  const statusCol = headers.indexOf("ステータス");
  const relatedMoldHistoryIdCol = headers.indexOf("関連金型履歴ID");

  let results = [];

  for (let i = 1; i < values.length; i++) {

    const row = values[i];
    let hit = true;

    if (
      troubleId &&
      (troubleIdCol === -1 || row[troubleIdCol] != troubleId)
    ) {
      hit = false;
    }

    if (
      productId &&
      (productIdCol === -1 || row[productIdCol] != productId)
    ) {
      hit = false;
    }

    if (
      drawingNo &&
      (drawingNoCol === -1 || row[drawingNoCol] != drawingNo)
    ) {
      hit = false;
    }

    if (
      moldId &&
      (moldIdCol === -1 || row[moldIdCol] != moldId)
    ) {
      hit = false;
    }

    if (
      moldNo &&
      (moldNoCol === -1 || row[moldNoCol] != moldNo)
    ) {
      hit = false;
    }

    if (
      conditionId &&
      (conditionIdCol === -1 || row[conditionIdCol] != conditionId)
    ) {
      hit = false;
    }

    if (
      materialId &&
      (materialIdCol === -1 || row[materialIdCol] != materialId)
    ) {
      hit = false;
    }

    if (
      machineId &&
      (machineIdCol === -1 || row[machineIdCol] != machineId)
    ) {
      hit = false;
    }

    if (
      problem &&
      (
        problemCol === -1 ||
        String(row[problemCol] || "").indexOf(problem) === -1
      )
    ) {
      hit = false;
    }

    if (
      status &&
      (
        statusCol === -1 ||
        String(row[statusCol] || "").indexOf(status) === -1
      )
    ) {
      hit = false;
    }

    if (
      relatedMoldHistoryId &&
      (
        relatedMoldHistoryIdCol === -1 ||
        row[relatedMoldHistoryIdCol] != relatedMoldHistoryId
      )
    ) {
      hit = false;
    }

    if (hit) {
      let record = {};

      headers.forEach((header, index) => {
        record[header] = row[index];
      });

      results.push(record);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      type: "trouble",
      count: results.length,
      records: results
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*トラブル履歴U更新*/

function updateTroubleById(data) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("トラブル履歴");

  const values = sheet.getDataRange().getValues();
  const headers = values[0];

  const troubleIdCol = headers.indexOf("トラブルID");

  if (!data.troubleId) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: "troubleId が必要です"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  for (let i = 1; i < values.length; i++) {

    if (values[i][troubleIdCol] == data.troubleId) {

      updateCell(sheet, i + 1, headers, "発生日", data.occurredDate);
      updateCell(sheet, i + 1, headers, "製品ID", data.productId);
      updateCell(sheet, i + 1, headers, "図番", data.drawingNo);
      updateCell(sheet, i + 1, headers, "金型ID", data.moldId);
      updateCell(sheet, i + 1, headers, "金型番号", data.moldNo);
      updateCell(sheet, i + 1, headers, "条件ID", data.conditionId);
      updateCell(sheet, i + 1, headers, "材料ID", data.materialId);
      updateCell(sheet, i + 1, headers, "成形機ID", data.machineId);
      updateCell(sheet, i + 1, headers, "発生現象", data.problem);
      updateCell(sheet, i + 1, headers, "原因", data.cause);
      updateCell(sheet, i + 1, headers, "対策", data.countermeasure);
      updateCell(sheet, i + 1, headers, "ステータス", data.status);
      updateCell(sheet, i + 1, headers, "登録者", data.registeredBy);
      updateCell(sheet, i + 1, headers, "関連金型履歴ID", data.relatedMoldHistoryId);
      updateCell(sheet, i + 1, headers, "備考", data.notes);
      updateCell(sheet, i + 1, headers, "最終更新日", new Date());

      return ContentService
        .createTextOutput(JSON.stringify({
          status: "success",
          action: "updateTrouble",
          message: "トラブル履歴を更新しました",
          troubleId: data.troubleId
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "error",
      message: "指定されたトラブルIDが見つかりません",
      troubleId: data.troubleId
    }))
    .setMimeType(ContentService.MimeType.JSON);
}






/*金型CRU*/

/*金型C登録*/

function addMold(data) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("金型マスター");

  const moldId = generateId("MOLD");

  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];

  const row = [];

  headers.forEach(header => {
    switch (header) {
      case "金型ID":
        row.push(moldId);
        break;
      case "金型番号":
        row.push(data.moldNo || "");
        break;
      case "図番":
        row.push(data.drawingNo || "");
        break;
      case "製品ID":
        row.push(data.productId || "");
        break;
      case "製品名":
        row.push(data.productName || "");
        break;
      case "取数":
        row.push(data.cavityCount || "");
        break;
      case "ゲート方式":
        row.push(data.gateType || "");
        break;
      case "ランナー方式":
        row.push(data.runnerType || "");
        break;
      case "ホットランナー有無":
        row.push(data.hotRunner || "");
        break;
      case "金型構造":
        row.push(data.moldStructure || "");
        break;
      case "材質":
        row.push(data.moldMaterial || "");
        break;
      case "製作年月":
        row.push(data.manufactureDate || "");
        break;
      case "保管場所":
        row.push(data.storageLocation || "");
        break;
      case "金型状態":
        row.push(data.moldStatus || "");
        break;
      case "注意点":
        row.push(data.notes || "");
        break;
      case "最終更新日":
        row.push(new Date());
        break;
      default:
        row.push("");
    }
  });

  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      action: "addMold",
      message: "金型を追加しました",
      moldId: moldId,
      moldNo: data.moldNo || "",
      drawingNo: data.drawingNo || "",
      productId: data.productId || "",
      productName: data.productName || ""
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*金型R検索*/

function searchMold(e) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("金型マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        type: "mold",
        count: 0,
        records: []
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = values[0];

  const moldId = e.parameter.moldId || "";
  const moldNo = e.parameter.moldNo || "";
  const drawingNo = e.parameter.drawingNo || "";
  const productId = e.parameter.productId || "";
  const productName = e.parameter.productName || "";
  const moldStatus = e.parameter.moldStatus || "";

  const moldIdCol = headers.indexOf("金型ID");
  const moldNoCol = headers.indexOf("金型番号");
  const drawingNoCol = headers.indexOf("図番");
  const productIdCol = headers.indexOf("製品ID");
  const productNameCol = headers.indexOf("製品名");
  const moldStatusCol = headers.indexOf("金型状態");

  let results = [];

  for (let i = 1; i < values.length; i++) {

    const row = values[i];
    let hit = true;

    if (moldId && (moldIdCol === -1 || row[moldIdCol] != moldId)) hit = false;
    if (moldNo && (moldNoCol === -1 || row[moldNoCol] != moldNo)) hit = false;
    if (drawingNo && (drawingNoCol === -1 || row[drawingNoCol] != drawingNo)) hit = false;
    if (productId && (productIdCol === -1 || row[productIdCol] != productId)) hit = false;

    if (
      productName &&
      (
        productNameCol === -1 ||
        String(row[productNameCol] || "").indexOf(productName) === -1
      )
    ) {
      hit = false;
    }

    if (
      moldStatus &&
      (
        moldStatusCol === -1 ||
        String(row[moldStatusCol] || "").indexOf(moldStatus) === -1
      )
    ) {
      hit = false;
    }

    if (hit) {
      let record = {};

      headers.forEach((header, index) => {
        record[header] = row[index];
      });

      results.push(record);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      type: "mold",
      count: results.length,
      records: results
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*金型U更新*/

function updateMold(data) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("金型マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: "金型マスターにデータがありません"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = values[0];
  const moldIdCol = headers.indexOf("金型ID");
  const moldNoCol = headers.indexOf("金型番号");

  if (!data.moldId && !data.moldNo) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: "更新には moldId または moldNo が必要です"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  for (let i = 1; i < values.length; i++) {

    let hit = false;

    if (data.moldId && moldIdCol !== -1 && values[i][moldIdCol] == data.moldId) {
      hit = true;
    }

    if (!hit && data.moldNo && moldNoCol !== -1 && values[i][moldNoCol] == data.moldNo) {
      hit = true;
    }

    if (hit) {

      updateCell(sheet, i + 1, headers, "金型番号", data.newMoldNo || data.moldNo);
      updateCell(sheet, i + 1, headers, "図番", data.drawingNo);
      updateCell(sheet, i + 1, headers, "製品ID", data.productId);
      updateCell(sheet, i + 1, headers, "製品名", data.productName);
      updateCell(sheet, i + 1, headers, "取数", data.cavityCount);
      updateCell(sheet, i + 1, headers, "ゲート方式", data.gateType);
      updateCell(sheet, i + 1, headers, "ランナー方式", data.runnerType);
      updateCell(sheet, i + 1, headers, "ホットランナー有無", data.hotRunner);
      updateCell(sheet, i + 1, headers, "金型構造", data.moldStructure);
      updateCell(sheet, i + 1, headers, "材質", data.moldMaterial);
      updateCell(sheet, i + 1, headers, "製作年月", data.manufactureDate);
      updateCell(sheet, i + 1, headers, "保管場所", data.storageLocation);
      updateCell(sheet, i + 1, headers, "金型状態", data.moldStatus);
      updateCell(sheet, i + 1, headers, "注意点", data.notes);
      updateCell(sheet, i + 1, headers, "最終更新日", new Date());

      return ContentService
        .createTextOutput(JSON.stringify({
          status: "success",
          action: "updateMold",
          message: "金型情報を更新しました",
          moldId: moldIdCol !== -1 ? values[i][moldIdCol] : "",
          moldNo: data.newMoldNo || data.moldNo || values[i][moldNoCol]
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "error",
      message: "指定された金型が見つかりません",
      moldId: data.moldId || "",
      moldNo: data.moldNo || ""
    }))
    .setMimeType(ContentService.MimeType.JSON);
}





/*金型履歴CRU*/

/*金型履歴C登録*/

function addMoldHistory(data) {
  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("金型履歴");

  const moldHistoryId = generateId("MH");

  sheet.appendRow([
    moldHistoryId,
    data.moldId || "",
    data.moldNo || "",
    data.drawingNo || "",
    data.implementedDate || new Date(),
    data.category || "",
    data.content || "",
    data.reason || "",
    data.person || "",
    data.effect || "",
    data.troubleId || "",
    data.notes || "",
    new Date()
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      action: "addMoldHistory",
      message: "金型履歴を追加しました",
      moldHistoryId: moldHistoryId,
      moldId: data.moldId || "",
      moldNo: data.moldNo || "",
      drawingNo: data.drawingNo || "",
      implementedDate: data.implementedDate || "",
      category: data.category || "",
      effect: data.effect || "",
      troubleId: data.troubleId || ""
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*金型履歴R検索*/

function searchMoldHistory(e) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("金型履歴");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        type: "moldHistory",
        count: 0,
        records: []
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = values[0];

  const moldHistoryId = e.parameter.moldHistoryId || "";
  const moldId = e.parameter.moldId || "";
  const moldNo = e.parameter.moldNo || "";
  const drawingNo = e.parameter.drawingNo || "";
  const category = e.parameter.category || "";
  const troubleId = e.parameter.troubleId || "";

  const moldHistoryIdCol = headers.indexOf("履歴ID");
  const moldIdCol = headers.indexOf("金型ID");
  const moldNoCol = headers.indexOf("金型番号");
  const drawingNoCol = headers.indexOf("図番");
  const categoryCol = headers.indexOf("区分");
  const troubleIdCol = headers.indexOf("関連トラブルID");

  let results = [];

  for (let i = 1; i < values.length; i++) {

    const row = values[i];
    let hit = true;

    if (
      moldHistoryId &&
      (moldHistoryIdCol === -1 || row[moldHistoryIdCol] != moldHistoryId)
    ) {
      hit = false;
    }

    if (
      moldId &&
      (moldIdCol === -1 || row[moldIdCol] != moldId)
    ) {
      hit = false;
    }

    if (
      moldNo &&
      (moldNoCol === -1 || row[moldNoCol] != moldNo)
    ) {
      hit = false;
    }

    if (
      drawingNo &&
      (drawingNoCol === -1 || row[drawingNoCol] != drawingNo)
    ) {
      hit = false;
    }

    if (
      category &&
      (categoryCol === -1 || String(row[categoryCol] || "").indexOf(category) === -1)
    ) {
      hit = false;
    }

    if (
      troubleId &&
      (troubleIdCol === -1 || row[troubleIdCol] != troubleId)
    ) {
      hit = false;
    }

    if (hit) {

      let record = {};

      headers.forEach((header, index) => {
        record[header] = row[index];
      });

      results.push(record);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      type: "moldHistory",
      count: results.length,
      records: results
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*金型履歴U更新*/

function updateMoldHistoryById(data) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("金型履歴");

  const values = sheet.getDataRange().getValues();
  const headers = values[0];

  const moldHistoryIdCol = headers.indexOf("履歴ID");

  if (!data.moldHistoryId) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: "moldHistoryId が必要です"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  for (let i = 1; i < values.length; i++) {

    if (values[i][moldHistoryIdCol] == data.moldHistoryId) {

      updateCell(sheet, i + 1, headers, "金型ID", data.moldId);
      updateCell(sheet, i + 1, headers, "金型番号", data.moldNo);
      updateCell(sheet, i + 1, headers, "図番", data.drawingNo);
      updateCell(sheet, i + 1, headers, "実施日", data.implementedDate);
      updateCell(sheet, i + 1, headers, "区分", data.category);
      updateCell(sheet, i + 1, headers, "内容", data.content);
      updateCell(sheet, i + 1, headers, "理由", data.reason);
      updateCell(sheet, i + 1, headers, "対応者", data.person);
      updateCell(sheet, i + 1, headers, "効果確認", data.effect);
      updateCell(sheet, i + 1, headers, "関連トラブルID", data.troubleId);
      updateCell(sheet, i + 1, headers, "備考", data.notes);
      updateCell(sheet, i + 1, headers, "最終更新日", new Date());

      return ContentService
        .createTextOutput(JSON.stringify({
          status: "success",
          action: "updateMoldHistory",
          message: "金型履歴を更新しました",
          moldHistoryId: data.moldHistoryId
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "error",
      message: "指定された金型履歴IDが見つかりません",
      moldHistoryId: data.moldHistoryId
    }))
    .setMimeType(ContentService.MimeType.JSON);
}




/*部品CRU*/

/*部品C登録*/

function addPart(data) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("部品マスター");

  const partId = generateId("PART");

  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];

  const row = [];

  headers.forEach(header => {
    switch (header) {
      case "部品ID":
        row.push(partId);
        break;
      case "部品名":
        row.push(data.partName || "");
        break;
      case "部品分類":
        row.push(data.partCategory || "");
        break;
      case "図番":
        row.push(data.drawingNo || "");
        break;
      case "メーカー":
        row.push(data.maker || "");
        break;
      case "仕入先":
        row.push(data.supplier || "");
        break;
      case "仕入単価":
        row.push(data.unitPrice || "");
        break;
      case "最小注文数":
        row.push(data.minOrderQty || "");
        break;
      case "発注点在庫数":
        row.push(data.reorderPoint || "");
        break;
      case "リードタイム(日)":
        row.push(data.leadTimeDays || "");
        break;
      case "保管場所":
        row.push(data.storageLocation || "");
        break;
      case "注意点":
        row.push(data.notes || "");
        break;
      case "最終更新日":
        row.push(new Date());
        break;
      default:
        row.push("");
    }
  });

  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      action: "addPart",
      message: "部品を追加しました",
      partId: partId,
      partName: data.partName || "",
      partCategory: data.partCategory || ""
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*部品R検索*/

function searchParts(e) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("部品マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        type: "part",
        count: 0,
        records: []
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = values[0];

  const partIdCol = headers.indexOf("部品ID");
  const partNameCol = headers.indexOf("部品名");
  const categoryCol = headers.indexOf("部品分類");
  const drawingCol = headers.indexOf("図番");

  const partId = e.parameter.partId || "";
  const partName = e.parameter.partName || "";
  const partCategory = e.parameter.partCategory || "";
  const drawingNo = e.parameter.drawingNo || "";

  let results = [];

  for (let i = 1; i < values.length; i++) {

    let hit = true;

    if (
      partId &&
      partIdCol !== -1 &&
      values[i][partIdCol] != partId
    ) {
      hit = false;
    }

    if (
      partName &&
      partNameCol !== -1 &&
      String(values[i][partNameCol] || "")
        .indexOf(partName) === -1
    ) {
      hit = false;
    }

    if (
      partCategory &&
      categoryCol !== -1 &&
      values[i][categoryCol] != partCategory
    ) {
      hit = false;
    }

    if (
      drawingNo &&
      drawingCol !== -1 &&
      values[i][drawingCol] != drawingNo
    ) {
      hit = false;
    }

    if (hit) {

      let record = {};

      headers.forEach((header, index) => {
        record[header] = values[i][index];
      });

      results.push(record);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      type: "part",
      count: results.length,
      records: results
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*部品U更新*/

function updatePart(data) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("部品マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: "部品マスターにデータがありません"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = values[0];
  const partIdCol = headers.indexOf("部品ID");

  if (!data.partId) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: "partId が必要です"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  for (let i = 1; i < values.length; i++) {

    if (values[i][partIdCol] == data.partId) {

      updateCell(sheet, i + 1, headers, "部品名", data.partName);
      updateCell(sheet, i + 1, headers, "部品分類", data.partCategory);
      updateCell(sheet, i + 1, headers, "図番", data.drawingNo);
      updateCell(sheet, i + 1, headers, "メーカー", data.maker);
      updateCell(sheet, i + 1, headers, "仕入先", data.supplier);
      updateCell(sheet, i + 1, headers, "仕入単価", data.unitPrice);
      updateCell(sheet, i + 1, headers, "最小注文数", data.minOrderQty);
      updateCell(sheet, i + 1, headers, "発注点在庫数", data.reorderPoint);
      updateCell(sheet, i + 1, headers, "リードタイム(日)", data.leadTimeDays);
      updateCell(sheet, i + 1, headers, "保管場所", data.storageLocation);
      updateCell(sheet, i + 1, headers, "注意点", data.notes);
      updateCell(sheet, i + 1, headers, "最終更新日", new Date());

      return ContentService
        .createTextOutput(JSON.stringify({
          status: "success",
          action: "updatePart",
          message: "部品情報を更新しました",
          partId: data.partId
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "error",
      message: "指定された部品IDが見つかりません",
      partId: data.partId
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*部品を部品IDで取得*/

function getPartById(partId) {

  if (!partId) {
    return null;
  }

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("部品マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return null;
  }

  const headers = values[0];
  const partIdCol = headers.indexOf("部品ID");

  if (partIdCol === -1) {
    return null;
  }

  for (let i = 1; i < values.length; i++) {

    if (values[i][partIdCol] == partId) {

      let result = {};

      headers.forEach((header, index) => {
        result[header] = values[i][index];
      });

      return result;
    }
  }

  return null;
}


/*部品を部品名で取得*/

function getPartByName(partName) {

  if (!partName) {
    return null;
  }

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("部品マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return null;
  }

  const headers = values[0];
  const partNameCol = headers.indexOf("部品名");

  if (partNameCol === -1) {
    return null;
  }

  for (let i = 1; i < values.length; i++) {

    if (values[i][partNameCol] == partName) {

      let result = {};

      headers.forEach((header, index) => {
        result[header] = values[i][index];
      });

      return result;
    }
  }

  return null;
}




/*製品-部品CRU*/

/*使用部品C登録*/

function addUsedPart(data) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("製品-部品マスター");

  const usedPartId = generateId("UP");

  sheet.appendRow([
    usedPartId,
    data.productId || "",
    data.partId || "",
    data.usageQty || "",
    data.processName || "",
    data.notes || "",
    new Date()
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      action: "addUsedPart",
      message: "使用部品を追加しました",
      usedPartId: usedPartId,
      productId: data.productId || "",
      partId: data.partId || ""
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*使用部品R検索*/

function searchUsedParts(e) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("製品-部品マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        type: "usedPart",
        count: 0,
        records: []
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = values[0];

  const usedPartIdCol = headers.indexOf("使用部品ID");
  const productIdCol = headers.indexOf("製品ID");
  const partIdCol = headers.indexOf("部品ID");
  const processCol = headers.indexOf("使用工程");

  const usedPartId = e.parameter.usedPartId || "";
  const productId = e.parameter.productId || "";
  const partId = e.parameter.partId || "";
  const processName = e.parameter.processName || "";

  let results = [];

  for (let i = 1; i < values.length; i++) {

    let hit = true;

    if (
      usedPartId &&
      usedPartIdCol !== -1 &&
      values[i][usedPartIdCol] != usedPartId
    ) {
      hit = false;
    }

    if (
      productId &&
      productIdCol !== -1 &&
      values[i][productIdCol] != productId
    ) {
      hit = false;
    }

    if (
      partId &&
      partIdCol !== -1 &&
      values[i][partIdCol] != partId
    ) {
      hit = false;
    }

    if (
      processName &&
      processCol !== -1 &&
      values[i][processCol] != processName
    ) {
      hit = false;
    }

    if (hit) {

      let record = {};

      headers.forEach((header, index) => {
        record[header] = values[i][index];
      });

      results.push(record);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      type: "usedPart",
      count: results.length,
      records: results
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*使用部品U更新*/

function updateUsedPart(data) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("製品-部品マスター");

  const values = sheet.getDataRange().getValues();

  const headers = values[0];
  const usedPartIdCol = headers.indexOf("使用部品ID");

  if (!data.usedPartId) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: "usedPartId が必要です"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  for (let i = 1; i < values.length; i++) {

    if (values[i][usedPartIdCol] == data.usedPartId) {

      updateCell(sheet, i + 1, headers, "製品ID", data.productId);
      updateCell(sheet, i + 1, headers, "部品ID", data.partId);
      updateCell(sheet, i + 1, headers, "使用数", data.usageQty);
      updateCell(sheet, i + 1, headers, "使用工程", data.processName);
      updateCell(sheet, i + 1, headers, "注意点", data.notes);
      updateCell(sheet, i + 1, headers, "最終更新日", new Date());

      return ContentService
        .createTextOutput(JSON.stringify({
          status: "success",
          action: "updateUsedPart",
          message: "使用部品を更新しました",
          usedPartId: data.usedPartId
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "error",
      message: "指定された使用部品IDが見つかりません",
      usedPartId: data.usedPartId
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*使用部品を製品IDで取得*/

function getUsedPartsByProductId(productId) {

  if (!productId) {
    return [];
  }

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("製品-部品マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return [];
  }

  const headers = values[0];
  const productIdCol = headers.indexOf("製品ID");

  let results = [];

  for (let i = 1; i < values.length; i++) {

    if (values[i][productIdCol] == productId) {

      let record = {};

      headers.forEach((header, index) => {
        record[header] = values[i][index];
      });

      results.push(record);
    }
  }

  return results;
}




/*工程CRU*/

/*工程C登録*/

function addProcess(data) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("工程マスター");

  const processId = generateId("PROCESS");

  const headers = sheet
    .getRange(1, 1, 1, sheet.getLastColumn())
    .getValues()[0];

  const row = [];

  headers.forEach(header => {
    switch (header) {
      case "工程ID":
        row.push(processId);
        break;
      case "工程名":
        row.push(data.processName || "");
        break;
      case "標準時間(秒)":
        row.push(data.standardTime || "");
        break;
      case "使用設備":
        row.push(data.equipment || "");
        break;
      case "作業者区分":
        row.push(data.operatorCategory || "");
        break;
      case "注意点":
        row.push(data.notes || "");
        break;
      case "最終更新日":
        row.push(new Date());
        break;
      default:
        row.push("");
    }
  });

  sheet.appendRow(row);

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      action: "addProcess",
      message: "工程を追加しました",
      processId: processId,
      processName: data.processName || ""
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*工程C登録*/

function searchProcesses(e) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("工程マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        type: "process",
        count: 0,
        records: []
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = values[0];

  const processIdCol = headers.indexOf("工程ID");
  const processNameCol = headers.indexOf("工程名");
  const equipmentCol = headers.indexOf("使用設備");

  const processId = e.parameter.processId || "";
  const processName = e.parameter.processName || "";
  const equipment = e.parameter.equipment || "";

  let results = [];

  for (let i = 1; i < values.length; i++) {

    let hit = true;

    if (
      processId &&
      processIdCol !== -1 &&
      values[i][processIdCol] != processId
    ) {
      hit = false;
    }

    if (
      processName &&
      processNameCol !== -1 &&
      String(values[i][processNameCol] || "")
        .indexOf(processName) === -1
    ) {
      hit = false;
    }

    if (
      equipment &&
      equipmentCol !== -1 &&
      String(values[i][equipmentCol] || "")
        .indexOf(equipment) === -1
    ) {
      hit = false;
    }

    if (hit) {

      let record = {};

      headers.forEach((header, index) => {
        record[header] = values[i][index];
      });

      results.push(record);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      type: "process",
      count: results.length,
      records: results
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*工程U更新*/

function updateProcess(data) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("工程マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: "工程マスターにデータがありません"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = values[0];
  const processIdCol = headers.indexOf("工程ID");

  if (!data.processId) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: "processId が必要です"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  for (let i = 1; i < values.length; i++) {

    if (values[i][processIdCol] == data.processId) {

      updateCell(sheet, i + 1, headers, "工程名", data.processName);
      updateCell(sheet, i + 1, headers, "標準時間(秒)", data.standardTime);
      updateCell(sheet, i + 1, headers, "使用設備", data.equipment);
      updateCell(sheet, i + 1, headers, "作業者区分", data.operatorCategory);
      updateCell(sheet, i + 1, headers, "注意点", data.notes);
      updateCell(sheet, i + 1, headers, "最終更新日", new Date());

      return ContentService
        .createTextOutput(JSON.stringify({
          status: "success",
          action: "updateProcess",
          message: "工程情報を更新しました",
          processId: data.processId
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "error",
      message: "指定された工程IDが見つかりません",
      processId: data.processId
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*工程を工程IDで取得*/

function getProcessById(processId) {

  if (!processId) {
    return null;
  }

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("工程マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return null;
  }

  const headers = values[0];
  const processIdCol = headers.indexOf("工程ID");

  if (processIdCol === -1) {
    return null;
  }

  for (let i = 1; i < values.length; i++) {

    if (values[i][processIdCol] == processId) {

      let result = {};

      headers.forEach((header, index) => {
        result[header] = values[i][index];
      });

      return result;
    }
  }

  return null;
}


/*工程を工程名で取得*/

function getProcessByName(processName) {

  if (!processName) {
    return null;
  }

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("工程マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return null;
  }

  const headers = values[0];
  const processNameCol = headers.indexOf("工程名");

  if (processNameCol === -1) {
    return null;
  }

  for (let i = 1; i < values.length; i++) {

    if (values[i][processNameCol] == processName) {

      let result = {};

      headers.forEach((header, index) => {
        result[header] = values[i][index];
      });

      return result;
    }
  }

  return null;
}




/*製品-工程CRU*/

/*製品-工程C登録*/

function addUsedProcess(data) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("製品-工程マスター");

  const usedProcessId = generateId("USED_PROCESS");

  sheet.appendRow([
    usedProcessId,
    data.productId || "",
    data.processId || "",
    data.processOrder || "",
    data.standardTime || "",
    data.notes || "",
    new Date()
  ]);

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      action: "addUsedProcess",
      message: "製品工程を追加しました",
      usedProcessId: usedProcessId,
      productId: data.productId || "",
      processId: data.processId || "",
      processOrder: data.processOrder || ""
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*製品-工程R検索*/

function searchUsedProcesses(e) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("製品-工程マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "success",
        type: "usedProcess",
        count: 0,
        records: []
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = values[0];

  const usedProcessIdCol = headers.indexOf("使用工程ID");
  const productIdCol = headers.indexOf("製品ID");
  const processIdCol = headers.indexOf("工程ID");
  const processOrderCol = headers.indexOf("工程順");

  const usedProcessId = e.parameter.usedProcessId || "";
  const productId = e.parameter.productId || "";
  const processId = e.parameter.processId || "";
  const processOrder = e.parameter.processOrder || "";

  let results = [];

  for (let i = 1; i < values.length; i++) {

    let hit = true;

    if (
      usedProcessId &&
      usedProcessIdCol !== -1 &&
      values[i][usedProcessIdCol] != usedProcessId
    ) {
      hit = false;
    }

    if (
      productId &&
      productIdCol !== -1 &&
      values[i][productIdCol] != productId
    ) {
      hit = false;
    }

    if (
      processId &&
      processIdCol !== -1 &&
      values[i][processIdCol] != processId
    ) {
      hit = false;
    }

    if (
      processOrder &&
      processOrderCol !== -1 &&
      values[i][processOrderCol] != processOrder
    ) {
      hit = false;
    }

    if (hit) {
      let record = {};

      headers.forEach((header, index) => {
        record[header] = values[i][index];
      });

      results.push(record);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      type: "usedProcess",
      count: results.length,
      records: results
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*製品-工程U更新*/

function updateUsedProcess(data) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("製品-工程マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: "製品-工程マスターにデータがありません"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const headers = values[0];
  const usedProcessIdCol = headers.indexOf("使用工程ID");

  if (!data.usedProcessId) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: "usedProcessId が必要です"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  for (let i = 1; i < values.length; i++) {

    if (values[i][usedProcessIdCol] == data.usedProcessId) {

      updateCell(sheet, i + 1, headers, "製品ID", data.productId);
      updateCell(sheet, i + 1, headers, "工程ID", data.processId);
      updateCell(sheet, i + 1, headers, "工程順", data.processOrder);
      updateCell(sheet, i + 1, headers, "標準時間(秒)", data.standardTime);
      updateCell(sheet, i + 1, headers, "注意点", data.notes);
      updateCell(sheet, i + 1, headers, "最終更新日", new Date());

      return ContentService
        .createTextOutput(JSON.stringify({
          status: "success",
          action: "updateUsedProcess",
          message: "製品工程を更新しました",
          usedProcessId: data.usedProcessId
        }))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "error",
      message: "指定された使用工程IDが見つかりません",
      usedProcessId: data.usedProcessId
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


/*製品-工程を製品IDで取得*/

function getUsedProcessesByProductId(productId) {

  if (!productId) {
    return [];
  }

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("製品-工程マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return [];
  }

  const headers = values[0];
  const productIdCol = headers.indexOf("製品ID");

  if (productIdCol === -1) {
    return [];
  }

  let results = [];

  for (let i = 1; i < values.length; i++) {

    if (values[i][productIdCol] == productId) {

      let record = {};

      headers.forEach((header, index) => {
        record[header] = values[i][index];
      });

      results.push(record);
    }
  }

  results.sort((a, b) => {
    return Number(a["工程順"] || 0) - Number(b["工程順"] || 0);
  });

  return results;
}






/*類似トラブル取得*/

function getSimilarTroubles(criteria) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("トラブル履歴");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return [];
  }

  const headers = values[0];

  const troubleIdCol = headers.indexOf("トラブルID");
  const productIdCol = headers.indexOf("製品ID");
  const drawingNoCol = headers.indexOf("図番");
  const moldIdCol = headers.indexOf("金型ID");
  const moldNoCol = headers.indexOf("金型番号");
  const conditionIdCol = headers.indexOf("条件ID");
  const materialIdCol = headers.indexOf("材料ID");
  const machineIdCol = headers.indexOf("成形機ID");
  const problemCol = headers.indexOf("発生現象");

  let results = [];

  for (let i = 1; i < values.length; i++) {

    const row = values[i];

    let score = 0;
    let reasons = [];

    if (
      criteria.problem &&
      problemCol !== -1 &&
      String(row[problemCol] || "").indexOf(criteria.problem) !== -1
    ) {
      score += 3;
      reasons.push("発生現象一致");
    }

    if (
      criteria.materialId &&
      materialIdCol !== -1 &&
      row[materialIdCol] == criteria.materialId
    ) {
      score += 2;
      reasons.push("材料ID一致");
    }

    if (
      criteria.moldId &&
      moldIdCol !== -1 &&
      row[moldIdCol] == criteria.moldId
    ) {
      score += 2;
      reasons.push("金型ID一致");
    }

    if (
      criteria.conditionId &&
      conditionIdCol !== -1 &&
      row[conditionIdCol] == criteria.conditionId
    ) {
      score += 2;
      reasons.push("条件ID一致");
    }

    if (
      criteria.machineId &&
      machineIdCol !== -1 &&
      row[machineIdCol] == criteria.machineId
    ) {
      score += 1;
      reasons.push("成形機ID一致");
    }

    if (
      criteria.productId &&
      productIdCol !== -1 &&
      row[productIdCol] == criteria.productId
    ) {
      score += 2;
      reasons.push("製品ID一致");
    }

    if (score > 0) {

      let record = {};

      headers.forEach((header, index) => {
        record[header] = row[index];
      });

      results.push({
        score: score,
        reasons: reasons,
        record: record
      });
    }
  }

  results.sort((a, b) => b.score - a.score);

  return results;
}






/*材料トラブル検索*/

function searchTroubleByMaterial(e) {

  const materialId = e.parameter.materialId;

  if (!materialId) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: "materialId が必要です"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const productSheet = ss.getSheetByName("製品マスター");
  const troubleSheet = ss.getSheetByName("トラブル履歴");

  const productValues = productSheet.getDataRange().getValues();
  const productHeaders = productValues[0];

  const productDrawingCol = productHeaders.indexOf("図番");
  const productMaterialIdCol = productHeaders.indexOf("材料ID");

  let drawingNos = [];

  for (let i = 1; i < productValues.length; i++) {
    if (productValues[i][productMaterialIdCol] == materialId) {
      drawingNos.push(productValues[i][productDrawingCol]);
    }
  }

  const troubleValues = troubleSheet.getDataRange().getValues();
  const troubleHeaders = troubleValues[0];

  const troubleDrawingCol = troubleHeaders.indexOf("図番");

  let results = [];

  for (let i = 1; i < troubleValues.length; i++) {
    const troubleDrawingNo = troubleValues[i][troubleDrawingCol];

    if (drawingNos.includes(troubleDrawingNo)) {
      let record = {};

      troubleHeaders.forEach((header, index) => {
        record[header] = troubleValues[i][index];
      });

      results.push(record);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      type: "troubleByMaterial",
      materialId: materialId,
      productCount: drawingNos.length,
      troubleCount: results.length,
      drawingNos: drawingNos,
      records: results
    }))
    .setMimeType(ContentService.MimeType.JSON);
}



/*知識をトラブルから取得*/

function getKnowledgeFromTroubles(similarTroubles) {

  const causeCounts = {};
  const countermeasureCounts = {};
  const statusCounts = {};

  similarTroubles.forEach(item => {

    const record = item.record || {};

    const cause = normalizeCause(record["原因"] || "");
    const countermeasure = normalizeCountermeasure(record["対策"] || "");
    const status = record["ステータス"] || "";

    if (cause) {
      causeCounts[cause] = (causeCounts[cause] || 0) + 1;
    }

    if (countermeasure) {
      countermeasureCounts[countermeasure] =
        (countermeasureCounts[countermeasure] || 0) + 1;
    }

    if (status) {
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    }
  });

  return {
    topCauses: convertCountsToArray(causeCounts),
    topCountermeasures: convertCountsToArray(countermeasureCounts),
    statusSummary: convertCountsToArray(statusCounts)
  };
}









/*全文検索*/

function fullTextSearch(e) {

  const keyword = e.parameter.keyword || "";

  const conditions = {
    drawingNo: e.parameter.drawingNo || "",
    moldNo: e.parameter.moldNo || "",
    materialId: e.parameter.materialId || "",
    materialName: e.parameter.materialName || "",
    grade: e.parameter.grade || "",
    machine: e.parameter.machine || "",
    status: e.parameter.status || "",
    problem: e.parameter.problem || ""
  };

  const hasKeyword = keyword !== "";
  const hasCondition = Object.keys(conditions).some(key => conditions[key] !== "");

  if (!hasKeyword && !hasCondition) {
    return ContentService
      .createTextOutput(JSON.stringify({
        status: "error",
        message: "keyword または検索条件が必要です"
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const targetSheets = [
  "製品マスター",
  "トラブル履歴",
  "金型履歴",
  "材料マスター",
  "成形機マスター",
  "成形条件マスター"
  ];

  let results = [];

  targetSheets.forEach(sheetName => {

    const sheet = ss.getSheetByName(sheetName);

    if (!sheet) {
      return;
    }

    const values = sheet.getDataRange().getValues();

    if (values.length < 2) {
      return;
    }

    const headers = values[0];

    for (let i = 1; i < values.length; i++) {

      const rowText = values[i].join(" ");

      if (hasKeyword && rowText.indexOf(keyword) === -1) {
        continue;
      }

      let matched = true;

      Object.keys(conditions).forEach(key => {

        const conditionValue = conditions[key];

        if (!conditionValue) {
          return;
        }

        const headerName = convertConditionKeyToHeader(key);
        const col = headers.indexOf(headerName);

        if (col === -1) {
          matched = false;
          return;
        }

        const cellValue = String(values[i][col] || "");

        if (cellValue.indexOf(conditionValue) === -1) {
          matched = false;
        }
      });

      if (!matched) {
        continue;
      }

      let record = {};

      headers.forEach((header, index) => {
        record[header] = values[i][index];
      });

      results.push({
        sheetName: sheetName,
        rowNumber: i + 1,
        record: record
      });
    }
  });

  return ContentService
    .createTextOutput(JSON.stringify({
      status: "success",
      type: "search",
      keyword: keyword,
      conditions: conditions,
      count: results.length,
      records: results
    }))
    .setMimeType(ContentService.MimeType.JSON);
}


function convertConditionKeyToHeader(key) {

  const map = {
    drawingNo: "図番",
    moldNo: "金型番号",
    materialId: "材料ID",
    materialName: "材料名",
    grade: "グレード",
    machine: "成形機",
    status: "ステータス",
    problem: "発生現象"
  };

  return map[key] || key;
}




/*自動採番*/

function generateId(prefix) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("システム設定");

  const values = sheet.getDataRange().getValues();

  const key = prefix + "_LAST_NO";

  for (let i = 1; i < values.length; i++) {

    if (values[i][0] == key) {

      const lastNo = Number(values[i][1]) || 0;
      const nextNo = lastNo + 1;

      sheet.getRange(i + 1, 2).setValue(nextNo);

      return prefix + "-" + String(nextNo).padStart(6, "0");
    }
  }

  throw new Error("設定項目が見つかりません: " + key);
}



/*スナップショット関数*/

function getSnapshot(e) {

  let mold = null;
  let product = null;

  if (e.parameter.moldId) {
    mold = getMoldById(e.parameter.moldId);
  }

  if (!mold && e.parameter.moldNo) {
    mold = getMoldByNo(e.parameter.moldNo);
  }

  if (!mold && e.parameter.drawingNo) {
    mold = getMoldByDrawingNo(e.parameter.drawingNo);
  }

  if (mold) {
    product = getProductById(mold["製品ID"]);
  }

  if (!product && e.parameter.productId) {
    product = getProductById(e.parameter.productId);
  }

  if (!product && e.parameter.drawingNo) {
    product = getProductByDrawingNo(e.parameter.drawingNo);
  }

  if (!mold && product && product["金型ID"]) {
    mold = getMoldById(product["金型ID"]);
  }

  const material =
    product
      ? getMaterialById(product["材料ID"])
      : null;

  const machine =
    product
      ? getMachineById(product["成形機ID"])
      : null;

  const usedParts =
    product
      ? getUsedPartsByProductId(product["製品ID"])
      : [];

  const usedPartDetails =
    usedParts.map(item => {
      return {
        usage: item,
        part: getPartById(item["部品ID"])
      };
    });

  const usedProcesses =
    product
      ? getUsedProcessesByProductId(product["製品ID"])
      : [];

  const usedProcessDetails =
    usedProcesses.map(item => {
      return {
        usage: item,
        process: getProcessById(item["工程ID"])
      };
    });


  const condition =
    product
      ? getConditionById(product["現在標準条件ID"])
      : null;

  const conditionDetail =
    condition
      ? getConditionDetailByConditionId(condition["条件ID"])
      : null;

  const troubleHistory =
    mold
      ? getTroubleHistoryByMoldId(mold["金型ID"])
      : (
          product
            ? getTroubleHistoryByProductId(product["製品ID"])
            : []
        );

  const moldHistory =
    mold
      ? getMoldHistoryByMoldId(mold["金型ID"])
      : [];

  const similarTroubles = getSimilarTroubles({
    productId: product ? product["製品ID"] : "",
    materialId: product ? product["材料ID"] : "",
    machineId: product ? product["成形機ID"] : "",
    conditionId: product ? product["現在標準条件ID"] : "",
    moldId: mold ? mold["金型ID"] : "",
    problem: e.parameter.problem || ""
  });

  const knowledge =
    getKnowledgeFromTroubles(similarTroubles);

  const snapshot = {
    status: "success",
    type: "snapshot",

    product: product,
    material: material,
    machine: machine,
    condition: condition,
    conditionDetail: conditionDetail,
    mold: mold,

    usedParts: usedPartDetails,
    usedProcesses: usedProcessDetails,

    troubleHistory: troubleHistory,
    moldHistory: moldHistory,

    similarTroubles: similarTroubles,
    knowledge: knowledge,

    summary: {
      troubleCount: troubleHistory.length,
      moldHistoryCount: moldHistory.length,
      similarTroubleCount: similarTroubles.length,
      topCauseCount: knowledge.topCauses.length,
      topCountermeasureCount: knowledge.topCountermeasures.length,
      usedPartCount: usedPartDetails.length,
      usedProcessCount: usedProcessDetails.length,
        totalProcessTime:
          usedProcessDetails.reduce(
            (sum, x) => sum + Number(x.usage["標準時間(秒)"] || 0),
            0
          ),

      totalPartQty:
        usedPartDetails.reduce(
          (sum, x) =>
            sum + Number(x.usage["使用数"] || 0),
          0
        )
    }
  };

  return ContentService
    .createTextOutput(JSON.stringify(snapshot))
    .setMimeType(ContentService.MimeType.JSON);
}







/*補完関数*/

/*製品を製品IDで取得*/

function getProductById(productId) {

  if (!productId) {
    return null;
  }

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("製品マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return null;
  }

  const headers = values[0];
  const productIdCol = headers.indexOf("製品ID");

  if (productIdCol === -1) {
  return null;
  }


  for (let i = 1; i < values.length; i++) {

    if (values[i][productIdCol] == productId) {

      let result = {};

      headers.forEach((header, index) => {
        result[header] = values[i][index];
      });

      return result;
    }
  }

  return null;
}


/*製品を図番で取得*/

function getProductByDrawingNo(drawingNo) {

  if (!drawingNo) {
    return null;
  }

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("製品マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return null;
  }

  const headers = values[0];
  const drawingNoCol = headers.indexOf("図番");

  if (drawingNoCol === -1) {
  return null;
  }

  for (let i = 1; i < values.length; i++) {

    if (values[i][drawingNoCol] == drawingNo) {

      let result = {};

      headers.forEach((header, index) => {
        result[header] = values[i][index];
      });

      return result;
    }
  }

  return null;
}


/*条件をIDで取得*/

function getConditionById(conditionId) {

  if (!conditionId) {
    return null;
  }

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("成形条件マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return null;
  }

  const headers = values[0];
  const conditionIdCol = headers.indexOf("条件ID");

  for (let i = 1; i < values.length; i++) {

    if (values[i][conditionIdCol] == conditionId) {

      let result = {};

      headers.forEach((header, index) => {
        result[header] = values[i][index];
      });

      return result;
    }
  }

  return null;
}


/*成形機をIDで取得*/

function getMachineById(machineId) {

  if (!machineId) {
    return null;
  }

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("成形機マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return null;
  }

  const headers = values[0];
  const machineIdCol = headers.indexOf("成形機ID");

  for (let i = 1; i < values.length; i++) {

    if (values[i][machineIdCol] == machineId) {

      let result = {};

      headers.forEach((header, index) => {
        result[header] = values[i][index];
      });

      return result;
    }
  }

  return null;
}


/*金型を金型IDで取得*/

function getMoldById(moldId) {

  if (!moldId) {
    return null;
  }

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("金型マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return null;
  }

  const headers = values[0];
  const moldIdCol = headers.indexOf("金型ID");

  for (let i = 1; i < values.length; i++) {

    if (values[i][moldIdCol] == moldId) {

      let result = {};

      headers.forEach((header, index) => {
        result[header] = values[i][index];
      });

      return result;
    }
  }

  return null;
}

/*金型を図番で取得*/

function getMoldByDrawingNo(drawingNo) {

  if (!drawingNo) {
    return null;
  }

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("金型マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return null;
  }

  const headers = values[0];
  const drawingNoCol = headers.indexOf("図番");

  for (let i = 1; i < values.length; i++) {

    if (values[i][drawingNoCol] == drawingNo) {

      let result = {};

      headers.forEach((header, index) => {
        result[header] = values[i][index];
      });

      return result;
    }
  }

  return null;
}

/*金型を金型番号で取得*/

function getMoldByNo(moldNo) {

  if (!moldNo) {
    return null;
  }

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("金型マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return null;
  }

  const headers = values[0];
  const moldNoCol = headers.indexOf("金型番号");

  for (let i = 1; i < values.length; i++) {

    if (values[i][moldNoCol] == moldNo) {

      let result = {};

      headers.forEach((header, index) => {
        result[header] = values[i][index];
      });

      return result;
    }
  }

  return null;
}

/*金型を製品IDで取得*/

function getMoldByProductId(productId) {

  if (!productId) {
    return null;
  }

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("金型マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return null;
  }

  const headers = values[0];
  const productIdCol = headers.indexOf("製品ID");

  for (let i = 1; i < values.length; i++) {

    if (values[i][productIdCol] == productId) {

      let result = {};

      headers.forEach((header, index) => {
        result[header] = values[i][index];
      });

      return result;
    }
  }

  return null;
}

/*トラブル履歴を製品IDで取得*/

function getTroubleHistoryByProductId(productId) {

  if (!productId) {
    return [];
  }

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("トラブル履歴");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return [];
  }

  const headers = values[0];
  const productIdCol = headers.indexOf("製品ID");

  let results = [];

  for (let i = 1; i < values.length; i++) {
    if (productIdCol !== -1 && values[i][productIdCol] == productId) {
      let record = {};
      headers.forEach((header, index) => {
        record[header] = values[i][index];
      });
      results.push(record);
    }
  }

  return results;
}

/*トラブル履歴を金型IDで取得*/

function getTroubleHistoryByMoldId(moldId) {

  if (!moldId) {
    return [];
  }

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("トラブル履歴");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return [];
  }

  const headers = values[0];
  const moldIdCol = headers.indexOf("金型ID");

  let results = [];

  for (let i = 1; i < values.length; i++) {
    if (moldIdCol !== -1 && values[i][moldIdCol] == moldId) {
      let record = {};
      headers.forEach((header, index) => {
        record[header] = values[i][index];
      });
      results.push(record);
    }
  }

  return results;
}

/*金型履歴を金型IDで取得*/

function getMoldHistoryByMoldId(moldId) {

  if (!moldId) {
    return [];
  }

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("金型履歴");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return [];
  }

  const headers = values[0];
  const moldIdCol = headers.indexOf("金型ID");

  let results = [];

  for (let i = 1; i < values.length; i++) {
    if (moldIdCol !== -1 && values[i][moldIdCol] == moldId) {
      let record = {};
      headers.forEach((header, index) => {
        record[header] = values[i][index];
      });
      results.push(record);
    }
  }

  return results;
}

/*条件詳細を条件IDで取得*/

function getConditionDetailByConditionId(conditionId) {

  if (!conditionId || conditionId === "未登録") {
    return null;
  }

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("成形条件詳細マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return null;
  }

  const headers = values[0];
  const conditionIdCol = headers.indexOf("条件ID");

  for (let i = 1; i < values.length; i++) {
    if (conditionIdCol !== -1 && values[i][conditionIdCol] == conditionId) {
      let record = {};
      headers.forEach((header, index) => {
        record[header] = values[i][index];
      });
      return record;
    }
  }

  return null;
}

/* */

function convertCountsToArray(counts) {

  const results = [];

  Object.keys(counts).forEach(key => {
    results.push({
      name: key,
      count: counts[key]
    });
  });

  results.sort((a, b) => b.count - a.count);

  return results;
}

/*正規化*/

function normalizeCause(text) {

  if (!text) {
    return "";
  }

  const value = String(text);

  if (
    value.indexOf("樹脂温") !== -1 &&
    (
      value.indexOf("低") !== -1 ||
      value.indexOf("不足") !== -1
    )
  ) {
    return "樹脂温不足";
  }

  if (
    value.indexOf("ノズル") !== -1 &&
    (
      value.indexOf("低") !== -1 ||
      value.indexOf("不足") !== -1
    )
  ) {
    return "ノズル温度不足";
  }

  if (
    value.indexOf("乾燥") !== -1 &&
    (
      value.indexOf("不足") !== -1 ||
      value.indexOf("不十分") !== -1
    )
  ) {
    return "乾燥不足";
  }

  if (
    value.indexOf("ガス") !== -1 ||
    value.indexOf("ベント") !== -1
  ) {
    return "ガス抜け不良";
  }

  if (
    value.indexOf("ゲート") !== -1 &&
    (
      value.indexOf("小") !== -1 ||
      value.indexOf("細") !== -1 ||
      value.indexOf("詰") !== -1
    )
  ) {
    return "ゲート流動不足";
  }

  return value;
}

function normalizeCountermeasure(text) {

  if (!text) {
    return "";
  }

  const value = String(text);

  if (
    (
      value.indexOf("樹脂温") !== -1 ||
      value.indexOf("ノズル") !== -1 ||
      value.indexOf("温度") !== -1
    ) &&
    (
      value.indexOf("上げ") !== -1 ||
      value.indexOf("上昇") !== -1 ||
      value.indexOf("UP") !== -1
    )
  ) {
    return "温度上昇";
  }

  if (
    value.indexOf("乾燥") !== -1 &&
    (
      value.indexOf("延長") !== -1 ||
      value.indexOf("長") !== -1 ||
      value.indexOf("追加") !== -1
    )
  ) {
    return "乾燥強化";
  }

  if (
    value.indexOf("ベント") !== -1 ||
    value.indexOf("ガス") !== -1
  ) {
    return "ガス抜け改善";
  }

  if (
    value.indexOf("ゲート") !== -1 &&
    (
      value.indexOf("拡") !== -1 ||
      value.indexOf("広") !== -1 ||
      value.indexOf("大") !== -1
    )
  ) {
    return "ゲート拡大";
  }

  return value;
}






















/*ここからテスト用*/

function testUpdate() {
  const e = {
    postData: {
      contents: JSON.stringify({
        action: "update",
        drawingNo: "TEST-001",
        notes: "更新テスト：注意点を書き換えました",
        material: "PBT-GF30"
      })
    }
  };

  const result = doPost(e);
  Logger.log(result.getContent());
}






function testPost() {
  const e = {
    postData: {
      contents: JSON.stringify({
        productId: "P0099",
        drawingNo: "TEST-001",
        productName: "テスト製品",
        material: "PBT",
        color: "黒",
        dryingCondition: "120℃×4h",
        machine: "GL200",
        moldingCondition: "テスト条件",
        notes: "追加テスト"
      })
    }
  };

  const result = doPost(e);
  Logger.log(result.getContent());
}



function testAddProduct() {
  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("製品マスター");

  const data = {
    action: "addProduct",
    drawingNo: "TEST-P-AUTO",
    productName: "製品ID自動採番テスト",
    material: "テスト材料"
  };

  const result = addProduct(sheet, data);
  Logger.log(result.getContent());
}




function testAddTrouble() {
  const e = {
    postData: {
      contents: JSON.stringify({
        apiKey: API_KEY,
        action: "addTrouble",
        drawingNo: "TEST-001",
        moldNo: "M001",
        problem: "ショート",
        cause: "樹脂温度が低い可能性",
        countermeasure: "樹脂温度を10℃上げて確認",
        registeredBy: "鳥居"
      })
    }
  };

  const result = doPost(e);
  Logger.log(result.getContent());
}



function testAddMoldHistory() {
  const e = {
    postData: {
      contents: JSON.stringify({
        apiKey: API_KEY,
        action: "addMoldHistory",
        moldNo: "M001",
        drawingNo: "TEST-001",
        category: "修理",
        content: "金型履歴IDの自動採番テスト",
        person: "鳥居"
      })
    }
  };

  const result = doPost(e);
  Logger.log(result.getContent());
}



function testUpdateTrouble() {
  const e = {
    postData: {
      contents: JSON.stringify({
        apiKey: API_KEY,
        action: "updateTrouble",
        troubleId: "TR-000001",
        countermeasure: "樹脂温度を10℃上げて改善確認済み"
      })
    }
  };

  const result = doPost(e);
  Logger.log(result.getContent());
}




function testUpdateMoldHistory() {
  const e = {
    postData: {
      contents: JSON.stringify({
        apiKey: API_KEY,
        action: "updateMoldHistory",
        moldHistoryId: "MH-000001",
        category: "改造",
        content: "金型履歴更新テスト：内容を修正しました",
        person: "鳥居"
      })
    }
  };

  const result = doPost(e);
  Logger.log(result.getContent());
}







function testAddCondition() {
  const e = {
    postData: {
      contents: JSON.stringify({
        action: "addCondition",
        productId: "P-000001",
        parentConditionId: "",
        version: "1",
        conditionStatus: "標準",
        conditionName: "GX-F12 初期標準条件",
        drawingNo: "5000-0143-50V",
        materialId: "MAT-0002",
        machineId: "MC-0001",
        changeReason: "初期登録",
        result: "良好",
        changedBy: "鳥居",
        conditionFileId: "",
        notes: "テスト登録"
      })
    }
  };

  const result = doPost(e);
  Logger.log(result.getContent());
}





