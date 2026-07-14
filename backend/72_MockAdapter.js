function UnderstandingEngine_respond(userText, entity) {

  if (!entity) {
    return "Entityが特定できませんでした。";
  }

  // 現在Response Specificationに対応しているのは製品Entity
  if (entity.entityType === "product") {

    const snapshot =
      SnapshotEngine_getProductSnapshot(entity.entityId);

    if (!snapshot || snapshot.status !== "success") {
      return "製品情報を取得できませんでした。";
    }

    /*
     * 候補選択直後は、
     * これまでどおり製品Snapshotを表示する。
     *
     * 例
     * 「1」
     * 「2」
     * 「①」
     */
    if (/^[0-9０-９①-⑳]+$/.test(String(userText).trim())) {

      return AnswerBuilder_buildProductSnapshot(
        snapshot.product["製品名"],
        snapshot
      );

    }

    /*
     * それ以外はAI Contractを構築し、
     * LLMへ渡す。
     */
    const aiContract =
      ResponseSpecification_build(
        userText,
        snapshot
      );

    return LLMInterface_generate(
      aiContract
    );

  }

  // 製品以外は従来どおり
  return EntityHandler_dispatch(entity);

}