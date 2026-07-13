function UnderstandingEngine_handle(text, sessionId) {
  const state = getConversationState(sessionId);

  // 1. Viewを解決してStateに保存
  const view = resolveView(text);
  if (view) {
    state.currentView = view;
    saveConversationState(sessionId, state);
  }

  // 2. 直前候補から選択できるか確認
  const selected = selectCandidateFromState(text, state);

  if (selected) {
    state.currentEntity = selected;
    state.candidateEntities = [];
    saveConversationState(sessionId, state);

    return UnderstandingEngine_respond(text, selected);
  }

  // 3. 新規Entity解決
  const candidates = resolveEntityCandidates(text);

  if (candidates.length === 0) {

    if (state.currentEntity) {
      return UnderstandingEngine_respond(text, state.currentEntity);
    }

    return "現在のEntity Resolution Knowledgeでは、該当する候補が見つかりませんでした。";
  }

  // 4. 候補が1件なら確定
  if (candidates.length === 1) {
    const entity = candidates[0];

    state.currentEntity = entity;
    state.candidateEntities = [];
    saveConversationState(sessionId, state);

    return UnderstandingEngine_respond(text, entity);
  }

  // 5. 複数候補なら保存して提示
  state.candidateEntities = candidates;
  saveConversationState(sessionId, state);

  // 表示用Entityへ変換
  const displayCandidates =
    candidates.map(EntityHandler_buildCandidateView);

  return {
    messageType: "candidate",
    message: "該当する候補が複数あります。選択してください。",
    candidates: displayCandidates
  };
}


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

    return ResponseSpecification_build(
      userText,
      snapshot
    );
  }

  // 製品以外は、現在の既存処理を維持する
  return EntityHandler_dispatch(entity);

}




