function UnderstandingEngine_handle(
  text,
  sessionId
) {

  const state =
    getConversationState(
      sessionId
    );


  /*
  =========================================
  更新指示の判定
  =========================================
  */

  const updateIntent =
    UpdateIntentEngine_analyze(
      text
    );

  if (updateIntent) {

    return UnderstandingEngine_handleUpdateIntent(
      text,
      sessionId,
      state,
      updateIntent
    );

  }


  /*
  =========================================
  Knowledge Boundaryの判定
  =========================================
  */

  const knowledgeBoundary =
    KnowledgeBoundaryEngine_select(
      text
    );

  /*
  * Communication
  */
  if (knowledgeBoundary === "communication") {
      return CommunicationEngine_respond(text);
  }

  /*
  * General Knowledge
  */
  if (knowledgeBoundary === "general") {
      return GeneralKnowledgeEngine_respond(text);
  }

  /*
  * Version 1.1
  *
  * それ以外はCompany Knowledgeとして処理する。
  */

  // 1. Viewを解決してStateに保存
  const view = resolveView(text);
  if (view) {
    state.currentView = view;
    saveConversationState(sessionId, state);
  }

  const entityQuery =
    UnderstandingEngine_extractEntityQuery(
      text,
      view
    );


  // 2. 直前候補から選択できるか確認
  const selected = selectCandidateFromState(text, state);

  if (selected) {
    state.currentEntity = selected;
    state.candidateEntities = [];
    saveConversationState(sessionId, state);

    return UnderstandingEngine_respond(text, selected);
  }

  // 3. 新規Entity解決
  const candidates =
    entityQuery
      ? resolveEntityCandidates(
          entityQuery
        )
      : [];

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



/*
=========================================
更新指示処理
=========================================
*/

/**
 * 構造化された更新意図を処理する
 *
 * 現段階では、
 * ・更新値不足の通知
 * ・対象製品の検索
 * ・候補の特定
 * までを行う。
 *
 * マスターデータの更新や
 * 更新案の生成はまだ行わない。
 *
 * @param {string} text
 * @param {string} sessionId
 * @param {Object} state
 * @param {Object} updateIntent
 * @returns {Object|string}
 */
function UnderstandingEngine_handleUpdateIntent(
  text,
  sessionId,
  state,
  updateIntent
) {

  if (
    !updateIntent ||
    updateIntent.intentType !==
      "update"
  ) {

    throw new Error(
      "更新意図を正しく取得できませんでした。"
    );

  }


  /*
  =========================================
  変更後の値が不足している場合
  =========================================
  */

  if (
    updateIntent.status ===
    "incomplete"
  ) {

    return {
      messageType:
        "text",

      answer:
        String(
          updateIntent.message ||
          "変更後の値を指定してください。"
        )
    };

  }


  /*
  =========================================
  現在対応している更新種別を確認
  =========================================
  */

  if (
    updateIntent.status !==
      "ready" ||
    updateIntent.updateType !==
      "mold_temperature"
  ) {

    return {
      messageType:
        "text",

      answer:
        "この変更指示には、まだ対応していません。"
    };

  }


  /*
  =========================================
  対象製品の検索語を抽出
  =========================================
  */

  const targetQuery =
    UpdateIntentEngine_extractTargetEntityQuery(
      text
    );


  /*
  =========================================
  製品名が明示されている場合
  =========================================
  */

  if (targetQuery) {

    const candidates =
      resolveEntityCandidates(
        targetQuery
      );

    /*
     * 候補がない
     */
    if (
      !Array.isArray(
        candidates
      ) ||
      candidates.length ===
        0
    ) {

      return {
        messageType:
          "text",

        answer:
          "変更対象の製品を特定できませんでした。"
      };

    }


    /*
     * 候補が1件
     */
    if (
      candidates.length ===
      1
    ) {

      const entity =
        candidates[0];

      if (
        !entity ||
        entity.entityType !==
          "product"
      ) {

        return {
          messageType:
            "text",

          answer:
            "金型温度を変更できる対象は製品です。"
        };

      }

      state.currentEntity =
        entity;

      state.candidateEntities =
        [];

      saveConversationState(
        sessionId,
        state
      );

      return UnderstandingEngine_buildUpdateTargetResult(
        entity,
        updateIntent
      );

    }


    /*
     * 候補が複数
     *
     * 現段階では候補を保存するが、
     * 通常の候補選択とは区別するため、
     * pendingUpdateIntentもStateへ保存する。
     */
    state.candidateEntities =
      candidates;

    state.pendingUpdateIntent = {
      updateType:
        updateIntent.updateType,

      targetField:
        updateIntent.targetField,

      newValue:
        updateIntent.newValue,

      unit:
        updateIntent.unit,

      originalText:
        String(
          text || ""
        ).trim()
    };

    saveConversationState(
      sessionId,
      state
    );

    const displayCandidates =
      candidates.map(
        EntityHandler_buildCandidateView
      );

    return {
      messageType:
        "candidate",

      message:
        "変更対象の候補が複数あります。選択してください。",

      candidates:
        displayCandidates
    };

  }


  /*
  =========================================
  製品名が省略されている場合
  =========================================
  */

  if (
    state &&
    state.currentEntity
  ) {

    if (
      state.currentEntity.entityType !==
        "product"
    ) {

      return {
        messageType:
          "text",

        answer:
          "現在選択されている対象は製品ではありません。変更する製品名を指定してください。"
      };

    }

    return UnderstandingEngine_buildUpdateTargetResult(
      state.currentEntity,
      updateIntent
    );

  }


  /*
  =========================================
  対象を特定できない場合
  =========================================
  */

  return {
    messageType:
      "text",

    answer:
      "金型温度を変更する製品名を指定してください。"
  };

}



/**
 * 更新対象と変更値を構造化して返す
 *
 * この関数では、
 * UpdateRequestはまだ作成しない。
 *
 * @param {Object} entity
 * @param {Object} updateIntent
 * @returns {Object}
 */
function UnderstandingEngine_buildUpdateTargetResult(
  entity,
  updateIntent
) {

  if (
    !entity ||
    !entity.entityId
  ) {

    throw new Error(
      "更新対象Entityがありません。"
    );

  }

  return {
    messageType:
      "update_target_resolved",

    updateType:
      updateIntent.updateType,

    target: {
      entityType:
        entity.entityType,

      entityId:
        entity.entityId,

      alias:
        String(
          entity.alias ||
          entity.keyword ||
          ""
        ).trim()
    },

    proposedValue: {
      field:
        updateIntent.targetField,

      value:
        updateIntent.newValue,

      unit:
        updateIntent.unit
    },

    message:
      "変更対象と変更内容を確認しました。"
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



function UnderstandingEngine_extractEntityQuery(
  text,
  view
) {

  let query =
    String(text || "");

  /*
   * Viewとして理解した語を除去する。
   */

  if (view) {

    query =
      query.replace(
        view.keyword,
        ""
      );

  }

  query =
    query
      .replace(/は\?/g, "")
      .replace(/\?/g, "")
      .replace(/いる/g, "")
      .replace(/教えて/g, "")
      .trim();

  return query;

}


