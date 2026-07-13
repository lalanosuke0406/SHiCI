function getConversationState(sessionId) {
  const cache = CacheService.getScriptCache();
  const key = "SHICI_STATE_" + sessionId;
  const saved = cache.get(key);

  if (!saved) {
    return {
      currentEntity: null,
      currentView: null,
      candidateEntities: []
    };
  }

  const state = JSON.parse(saved);

  if (!state.currentView) state.currentView = null;
  if (!state.candidateEntities) state.candidateEntities = [];

  return state;
}




function saveConversationState(sessionId, state) {
  const cache = CacheService.getScriptCache();
  const key = "SHICI_STATE_" + sessionId;

  // 30分保持
  cache.put(key, JSON.stringify(state), 1800);
}




function clearConversationState(sessionId) {
  const cache = CacheService.getScriptCache();
  const key = "SHICI_STATE_" + sessionId;
  cache.remove(key);
}



function selectCandidateFromState(text, state) {
  
  if (!state || !state.candidateEntities || state.candidateEntities.length === 0) {
    return null;
  }

  const keyword = extractSearchKeyword(text);

  const normalizedKeyword = keyword
  .replace(/のやつ/g, "")
  .replace(/やつ/g, "")
  .replace(/のもの/g, "")
  .replace(/番/g, "")
  .trim();

  // 「1」「2番」「3つ目」など
  const numberMatch = keyword.match(/[0-9０-９]+/);
  if (numberMatch) {
    const num = Number(numberMatch[0].replace(/[０-９]/g, s =>
      String.fromCharCode(s.charCodeAt(0) - 0xFEE0)
    ));

    if (num >= 1 && num <= state.candidateEntities.length) {
      return state.candidateEntities[num - 1];
    }
  }

  // 「1216」「24mm」など、候補内の文字で絞り込み
  const matches = state.candidateEntities.filter(c => {
    const haystack = [
      c.alias,
      c.keyword,
      c.entityId,
      c.notes
    ].join(" ").toLowerCase();

    return haystack.includes(normalizedKeyword.toLowerCase());
  });

  if (matches.length === 1) {
    return matches[0];
  }

  return null;
}



function ConversationStateEngine_handle(text, sessionId) {
  const state = getConversationState(sessionId);

  const view = resolveView(text);

  if (view) {
    state.currentView = view;
    saveConversationState(sessionId, state);
  }

  // 1. 直前候補から選択できるか確認
  const selected = selectCandidateFromState(text, state);

  if (selected) {
    state.currentEntity = selected;
    state.candidateEntities = [];
    saveConversationState(sessionId, state);

    return EntityHandler_dispatch(selected);
  }

  // 2. 新規Entity解決
  const candidates = resolveEntityCandidates(text);

  if (candidates.length === 0) {
    if (state.currentEntity) {
      return EntityHandler_dispatch(state.currentEntity);
    }

    return "現在のEntity Resolution Knowledgeでは、該当する候補が見つかりませんでした。";
  }

  // 3. 候補が1件なら確定
  if (candidates.length === 1) {
    const entity = candidates[0];

    state.currentEntity = entity;
    state.candidateEntities = [];
    saveConversationState(sessionId, state);

    return EntityHandler_dispatch(entity);
  }

  // 4. 複数候補なら保存して提示
  state.candidateEntities = candidates;
  saveConversationState(sessionId, state);

  return formatMultipleEntityCandidates(text, candidates);
}



function ConversationStateEngine_selectCandidate(entityId, sessionId) {

  const state = getConversationState(sessionId);

  if (
    !state ||
    !state.candidateEntities ||
    state.candidateEntities.length === 0
  ) {
    return createError("選択できる候補がありません。");
  }

  const entity = state.candidateEntities.find(function(candidate) {
    return candidate.entityId === entityId;
  });

  if (!entity) {
    return createError("選択された候補が見つかりません。");
  }

  // 選択されたEntityを現在のEntityとして保存
  state.currentEntity = entity;

  // 候補一覧は選択完了後に空にする
  state.candidateEntities = [];

  saveConversationState(sessionId, state);

  // 通常のEntity処理へ渡して製品詳細を生成
  const answer = EntityHandler_dispatch(entity);

  return {
    status: "success",
    messageType: "text",
    answer: String(answer || "")
  };
}



