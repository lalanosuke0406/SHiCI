function AnswerBuilder_buildProductSnapshot(keyword, snapshot) {
  if (!snapshot || snapshot.status !== "success") {
    return "Snapshotの取得に失敗しました。";
  }

  return formatSnapshotAnswer(keyword, snapshot);
}




function formatMultipleEntityCandidates(userText, candidates) {

  let text = "";

  text += "「" + extractSearchKeyword(userText) + "」に該当する候補が複数あります。\n\n";

  candidates.forEach(function(c, index) {

    text += "【" + (index + 1) + "】\n";

    // 製品
    if (c.drawingNo || c.productName) {

      if (c.drawingNo) {
        text += "図番： " + c.drawingNo + "\n";
      }

      if (c.productName) {
        text += "製品名： " + c.productName + "\n";
      }

    } else {

      // 将来 Material / Mold 等にも対応
      text += c.alias || c.keyword;

      if (c.notes) {
        text += "（" + c.notes + "）";
      }

      text += "\n";

    }

    text += "\n";

  });

  text += "番号を入力してください。";

  return text;

}



function formatSingleEntityAnswer(entity) {
  let text = "";

  text += "Entityを特定しました。\n\n";
  text += "alias： " + entity.alias + "\n";
  text += "entityType： " + entity.entityType + "\n";
  text += "entityId： " + entity.entityId + "\n";
  text += "keyword： " + entity.keyword + "\n";

  return text;
}



function formatSnapshotAnswer(userText, snapshot) {
  const product = snapshot.product || {};
  const material = snapshot.material || {};
  const machine = snapshot.machine || {};
  const mold = snapshot.mold || {};
  const condition = snapshot.condition || {};
  const conditionDetail = snapshot.conditionDetail || {};

  let text = "";

  text += "社内データベースを検索しました。\n\n";

  if (product["製品名"]) {
    text += "「" + userText + "」は、社内では以下の製品に該当します。\n\n";
    text += "製品名： " + product["製品名"] + "\n";
  }

  if (product["図番"]) text += "図番： " + product["図番"] + "\n";
  
  if (product["注意点"]) text += "通称・注意点： " + product["注意点"] + "\n";

  if (product["製品単重(g)"]) text += "製品単重： " + product["製品単重(g)"] + " g\n";
  if (product["1ショット重量(g)"]) text += "1ショット重量： " + product["1ショット重量(g)"] + " g\n";
  if (product["1ショット時間(秒)"]) text += "サイクルタイム： " + product["1ショット時間(秒)"] + " 秒\n";
  if (product["取出機使用有無"]) text += "取出機： " + product["取出機使用有無"] + "\n";

  text += "\n";

  if (material["材料名"] || material["グレード"]) {
    text += "■材料\n";
    if (material["材料名"]) text += "材料名： " + material["材料名"] + "\n";
    if (material["グレード"]) text += "グレード： " + material["グレード"] + "\n";
    if (material["色番"]) text += "色番： " + material["色番"] + "\n";
    if (material["乾燥条件"]) text += "乾燥条件： " + material["乾燥条件"] + "\n";
    text += "\n";
  }

  if (machine["成形機名"] || machine["通称1"]) {
    text += "■成形機\n";
    if (machine["成形機名"]) text += "成形機名： " + machine["成形機名"] + "\n";
    if (machine["通称1"]) text += "通称： " + machine["通称1"] + "\n";
    if (machine["型締力(TYPE)"]) text += "型締力： " + machine["型締力(TYPE)"] + " t\n";
    text += "\n";
  }

  if (mold["金型番号"]) {
    text += "■金型\n";
    text += "金型番号： " + mold["金型番号"] + "\n";
    if (mold["取数"]) text += "取数： " + mold["取数"] + "\n";
    if (mold["ゲート方式"]) text += "ゲート方式： " + mold["ゲート方式"] + "\n";
    text += "\n";
  }

  if (condition["条件ID"]) {
    text += "■現在標準条件\n";
    
    if (condition["条件名"]) text += "条件名： " + condition["条件名"] + "\n";
    if (condition["備考"]) text += condition["備考"] + "\n";
    if (condition["条件状態"]) text += "状態： " + condition["条件状態"] + "\n";
    text += "\n";
  }

  if (conditionDetail && Object.keys(conditionDetail).length > 0) {
    text += "標準条件の詳細も登録されています。\n";
  }

  return text.trim();
}