function SnapshotEngine_getProductSnapshot(productId) {

  const product = getProductById(productId);

  if (!product) {
    return {
      status: "error",
      message: "製品が見つかりません。"
    };
  }

  const material = getMaterialById(product["材料ID"]);
  const machine = getMachineById(product["成形機ID"]);
  const mold = getMoldById(product["金型ID"]);
  const condition = getConditionById(product["現在標準条件ID"]);

  let conditionDetail = null;

  if (condition) {
    conditionDetail =
      getConditionDetailByConditionId(condition["条件ID"]);
  }

  return {
    status: "success",
    product: product,
    material: material,
    machine: machine,
    mold: mold,
    condition: condition,
    conditionDetail: conditionDetail
  };

}
