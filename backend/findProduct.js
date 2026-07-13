function findProducts(keyword) {

  const sheet = SpreadsheetApp
    .openById(SPREADSHEET_ID)
    .getSheetByName("製品マスター");

  const values = sheet.getDataRange().getValues();

  if (values.length < 2) {
    return [];
  }

  const headers = values[0];

  const productIdCol   = headers.indexOf("製品ID");
  const drawingCol     = headers.indexOf("図番");
  const productNameCol = headers.indexOf("製品名");

  const results = [];

  for (let i = 1; i < values.length; i++) {

    const productName = values[i][productNameCol];

    if (
      productName &&
      productName.toString().includes(keyword)
    ) {

      results.push({

        productId : values[i][productIdCol],
        drawingNo : values[i][drawingCol],
        productName : productName

      });

    }

  }

  return results;

}
