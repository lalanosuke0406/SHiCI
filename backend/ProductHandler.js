function ProductHandler(entity) {

  const snapshot =
    SnapshotEngine_getProductSnapshot(entity.entityId);

  if (!snapshot || snapshot.status !== "success") {
    return "製品情報を取得できませんでした。";
  }

  return ProductAnswer(snapshot);

}



function ProductAnswer(snapshot) {

  return AnswerBuilder_buildProductSnapshot(
    snapshot.product["製品名"],
    snapshot
  );

}



/**
 * 製品Entityを、候補一覧で人が判別できる形にする
 */
function ProductHandler_buildCandidateView(entity) {

  const product = getProductById(entity.entityId);

  const mold =
    getMoldById(product["金型ID"]) ||
    getMoldByProductId(entity.entityId);

  Logger.log(product["金型ID"]);
  Logger.log(mold);

  return {
    entityType: entity.entityType,
    entityId: entity.entityId,

    alias: entity.alias || "",
    keyword: entity.keyword || "",

    drawingNo: product["図番"] || "",
    productName: product["製品名"] || "",
    moldNo: mold ? mold["金型番号"] : "-",

    priority: entity.priority,
    notes: entity.notes || ""
  };
}



