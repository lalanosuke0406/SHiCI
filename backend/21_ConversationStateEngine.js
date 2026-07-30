function getConversationState(sessionId) {
  const cache = CacheService.getScriptCache();
  const key = "SHICI_STATE_" + sessionId;
  const saved = cache.get(key);

  if (!saved) {
    return {
      currentEntity:
        null,

      currentView:
        null,

      candidateEntities:
        [],

      pendingUpdateIntent:
        null
    };
  }

  const state =
    JSON.parse(
      saved
    );

  if (
    !state.currentView
  ) {

    state.currentView =
      null;

  }

  if (
    !Array.isArray(
      state.candidateEntities
    )
  ) {

    state.candidateEntities =
      [];

  }

  if (
    !state.pendingUpdateIntent ||
    typeof state.pendingUpdateIntent !==
      "object"
  ) {

    state.pendingUpdateIntent =
      null;

  }

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



function ConversationStateEngine_selectCandidate(
  entityId,
  entityType,
  sessionId
) {

  const normalizedEntityId =
    String(
      entityId || ""
    ).trim();

  const normalizedEntityType =
    String(
      entityType || ""
    ).trim();

  if (
    !normalizedEntityId ||
    !normalizedEntityType
  ) {

    return createError(
      "選択された候補情報が不足しています。"
    );

  }

  const state =
    getConversationState(
      sessionId
    );

  /*
  * 更新指示に伴う候補選択だった場合に備え、
  * Entityを確定する前に保留中の更新意図を保持する。
  */
  const pendingUpdateIntent =
    state &&
    state.pendingUpdateIntent &&
    typeof state.pendingUpdateIntent ===
      "object"
      ? state.pendingUpdateIntent
      : null;

  let entity =
    null;

  /*
   * まず、直前に保存された候補Stateから探す。
   */
  if (
    state &&
    Array.isArray(
      state.candidateEntities
    )
  ) {

    entity =
      state.candidateEntities.find(
        function(candidate) {

          return (
            String(
              candidate.entityId || ""
            ).trim() ===
              normalizedEntityId &&

            String(
              candidate.entityType || ""
            ).trim() ===
              normalizedEntityType
          );

        }
      ) || null;

  }

  /*
   * Cacheから候補Stateを取得できなかった場合は、
   * Entity Resolution Knowledgeから再取得する。
   */
  if (!entity) {

    entity =
      EntityResolution_findById(
        normalizedEntityType,
        normalizedEntityId
      );

  }

  if (!entity) {

    return createError(
      "選択された候補が見つかりません。"
    );

  }

  state.currentEntity =
    entity;

  state.candidateEntities =
    [];

  state.pendingUpdateIntent =
    null;

  saveConversationState(
    sessionId,
    state
  );

    /*
  =========================================
  更新指示に伴う候補選択
  =========================================
  */

  if (
    pendingUpdateIntent
  ) {

    /*
    * 現在対応している更新対象は、
    * 製品の金型温度のみ。
    */
    if (
      String(
        entity.entityType || ""
      ).trim() !==
        "product"
    ) {

      return {

        status:
          "error",

        messageType:
          "text",

        answer:
          "金型温度を変更できる対象は製品です。"

      };

    }


    /*
    * 保存されていた更新意図を取得する。
    */
    const updateType =
      String(
        pendingUpdateIntent.updateType ||
        ""
      ).trim();

    const targetField =
      String(
        pendingUpdateIntent.targetField ||
        ""
      ).trim();

    const unit =
      String(
        pendingUpdateIntent.unit ||
        ""
      ).trim();

    const newValue =
      Number(
        pendingUpdateIntent.newValue
      );


    /*
    * 保存内容が正しいか確認する。
    */
    if (
      updateType !==
        "mold_temperature" ||
      !Number.isFinite(
        newValue
      )
    ) {

      return {

        status:
          "error",

        messageType:
          "text",

        answer:
          "保存されていた変更内容を復元できませんでした。もう一度変更内容を指定してください。"

      };

    }


    /*
    * UnderstandingEngineで使用する形式へ
    * 更新意図を復元する。
    */
    const restoredUpdateIntent = {

      status:
        "ready",

      intentType:
        "update",

      updateType:
        updateType,

      targetField:
        targetField ||
        "金型温度(℃)",

      newValue:
        newValue,

      unit:
        unit ||
        "℃"

    };


    /*
    * 候補選択前と同じ形式で返す。
    */
    return {

      status:
        "success",

      ...UnderstandingEngine_buildUpdateTargetResult(
        entity,
        restoredUpdateIntent
      )

    };

  }


  /*
  =========================================
  通常の候補選択
  =========================================
  */

  const answer =
    EntityHandler_dispatch(
      entity
    );

  return {

    status:
      "success",

    messageType:
      "text",

    answer:
      String(
        answer || ""
      )

  };

}



