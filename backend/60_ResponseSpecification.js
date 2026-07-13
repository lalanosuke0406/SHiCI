function ResponseSpecification_build(userText, snapshot) {

  const text = userText.trim();

  // 型温
  if (text.includes("型温")) {
    return formatMoldTemperature(snapshot);
  }

  // デフォルト
  return AnswerBuilder_buildProductSnapshot(
    snapshot.product["製品名"],
    snapshot
  );

}



function formatMoldTemperature(snapshot) {

  if (
    snapshot.condition &&
    snapshot.condition["備考"]
  ) {
    return snapshot.condition["備考"];
  }

  return "現在の標準条件に金型温度は登録されていません。";

}


