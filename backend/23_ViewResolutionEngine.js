function resolveView(text) {

  const sheet = SpreadsheetApp
    /*
    .getActiveSpreadsheet()
    */
    .openById(SPREADSHEET_ID)
    .getSheetByName("Knowledge_ViewResolution");

  const values = sheet.getDataRange().getValues();

  const keyword = extractSearchKeyword(text).toLowerCase();

  const candidates = [];

  for (let i = 1; i < values.length; i++) {

    const row = values[i];

    const knowledgeKeyword = String(row[0]).toLowerCase();

    if (keyword.includes(knowledgeKeyword)) {

      candidates.push({
        view: row[1],
        priority: Number(row[2]) || 999,
        notes: row[3]
      });

    }

  }

  if (candidates.length === 0) {
    return null;
  }

  candidates.sort((a, b) => a.priority - b.priority);

  return candidates[0];

}



function testView(){

  Logger.log(resolveView("乾燥条件は？"));

}
