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

    return EntityHandler_dispatch(selected);
  }

  // 3. 新規Entity解決
  const candidates = resolveEntityCandidates(text);

  if (candidates.length === 0) {
    return "現在のEntity Resolution Knowledgeでは、該当する候補が見つかりませんでした。";
  }

  // 4. 候補が1件なら確定
  if (candidates.length === 1) {
    const entity = candidates[0];

    state.currentEntity = entity;
    state.candidateEntities = [];
    saveConversationState(sessionId, state);

    return EntityHandler_dispatch(entity);
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
