/*
=========================================
Natural Language Understanding
=========================================
*/


/**
 * ユーザーの自然言語入力を理解し、
 * Understanding Resultを返す。
 *
 * この関数は、
 * Understanding Model Ver.1.1における
 * Understand段階だけを担当する。
 *
 * 処理：
 *
 * Natural Language
 * ↓
 * Understanding Request Contract
 * ↓
 * LLM Interface
 * ↓
 * Understanding Result
 *
 * 禁止：
 * ・Knowledgeを検索しない
 * ・Entityを解決しない
 * ・Canonical Entityを確定しない
 * ・Snapshotを生成しない
 * ・Conversation Stateを更新しない
 * ・業務上の妥当性を判断しない
 * ・権限を判断しない
 * ・Update Proposalを生成しない
 * ・Create / Update / Deleteを実行しない
 *
 * @param {string} text
 * @returns {Object}
 */
function UnderstandingEngine_understand(
  text
) {

  const startTime =
    Date.now();

  try {

    /*
    =========================================
    入力の確認
    =========================================
    */

    const originalText =
      String(
        text || ""
      ).trim();

    if (!originalText) {

      throw new Error(
        "Understanding Engineにユーザー入力がありません。"
      );

    }


    /*
    =========================================
    Understanding Request Contract生成
    =========================================
    */

    const understandingRequest =
      UnderstandingRequestContract_create(
        originalText
      );


    /*
    =========================================
    Natural Language Understanding
    =========================================
    */

    const understandingResult =
      LLMInterface_understand(
        understandingRequest
      );


    /*
    =========================================
    Result Contract確認
    =========================================
    */

    return UnderstandingResultContract_validate(
      understandingResult
    );

  } finally {

    Logger.log(
      "[TIME] UnderstandingEngine_understand: " +
      (Date.now() - startTime) +
      " ms"
    );

  }

}





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
  Natural Language Understanding
  =========================================
  */

  const understandingResult =
    UnderstandingEngine_understand(
      text
    );


  /*
  =========================================
  Update Intentの処理
  =========================================
  */

  if (
    understandingResult.intent.type ===
      "update"
  ) {

    const updateIntent =
      UpdateUnderstandingAdapter_convert(
        understandingResult
      );

    const targetQuery =
      UpdateUnderstandingAdapter_getEntityQuery(
        understandingResult
      );

    return UnderstandingEngine_handleUpdateIntent(
      text,
      sessionId,
      state,
      updateIntent,
      targetQuery
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
 * @param {string|null} targetQuery
 * @returns {Object|string}
 */
function UnderstandingEngine_handleUpdateIntent(
  text,
  sessionId,
  state,
  updateIntent,
  targetQuery
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
  対象Entity Queryの確認
  =========================================
  */

  const normalizedTargetQuery =
    String(
      targetQuery || ""
    ).trim();



  /*
  =========================================
  製品名が明示されている場合
  =========================================
  */

  if (normalizedTargetQuery) {

      const candidates =
        resolveEntityCandidates(
          normalizedTargetQuery
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
 * 製品Snapshotから、
 * 更新案生成時に必要となる
 * 現在標準条件IDも取得する。
 *
 * この関数では、
 * UpdateRequestの生成や
 * マスターデータの更新は行わない。
 *
 * @param {Object} entity
 * @param {Object} updateIntent
 * @returns {Object}
 */
function UnderstandingEngine_buildUpdateTargetResult(
  entity,
  updateIntent
) {

  /*
  =========================================
  Entityの確認
  =========================================
  */

  if (
    !entity ||
    !entity.entityId
  ) {

    throw new Error(
      "更新対象Entityがありません。"
    );

  }

  const entityType =
    String(
      entity.entityType || ""
    ).trim();

  const entityId =
    String(
      entity.entityId || ""
    ).trim();

  if (
    entityType !==
      "product"
  ) {

    return {

      messageType:
        "text",

      answer:
        "金型温度を変更できる対象は製品です。"

    };

  }


  /*
  =========================================
  更新意図の確認
  =========================================
  */

  if (
    !updateIntent ||
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

  const newMoldTemperature =
    Number(
      updateIntent.newValue
    );

  if (
    !Number.isFinite(
      newMoldTemperature
    )
  ) {

    return {

      messageType:
        "text",

      answer:
        "変更後の金型温度を正しく取得できませんでした。"

    };

  }


  /*
  =========================================
  製品Snapshotの取得
  =========================================
  */

  const snapshot =
    SnapshotEngine_getProductSnapshot(
      entityId
    );

  if (
    !snapshot ||
    snapshot.status !==
      "success" ||
    !snapshot.product
  ) {

    return {

      messageType:
        "text",

      answer:
        "変更対象の製品情報を取得できませんでした。"

    };

  }


  /*
  =========================================
  現在標準条件IDの取得
  =========================================
  */

  const currentConditionId =
    String(
      snapshot.product[
        "現在標準条件ID"
      ] || ""
    ).trim();

  if (!currentConditionId) {

    return {

      messageType:
        "text",

      answer:
        "この製品には現在標準条件が設定されていないため、金型温度を変更できません。"

    };

  }


  /*
  =========================================
  現在標準条件の存在確認
  =========================================
  */

  if (
    !snapshot.condition
  ) {

    return {

      messageType:
        "text",

      answer:
        "現在標準条件IDに対応する成形条件が見つかりませんでした。"

    };

  }


  /*
  =========================================
  製品表示情報
  =========================================
  */

  const productName =
    String(
      snapshot.product[
        "製品名"
      ] || ""
    ).trim();

  const drawingNumber =
    String(
      snapshot.product[
        "図番"
      ] || ""
    ).trim();

  const alias =
    String(
      entity.alias ||
      entity.keyword ||
      productName ||
      ""
    ).trim();


  /*
  =========================================
  更新対象確定結果
  =========================================
  */

  return {

    messageType:
      "update_target_resolved",

    updateType:
      "mold_temperature",

    target: {

      entityType:
        entityType,

      entityId:
        entityId,

      productId:
        entityId,

      productName:
        productName,

      drawingNumber:
        drawingNumber,

      alias:
        alias

    },

    expectedState: {

      currentConditionId:
        currentConditionId

    },

    proposedValue: {

      field:
        String(
          updateIntent.targetField ||
          "金型温度(℃)"
        ).trim(),

      value:
        newMoldTemperature,

      unit:
        String(
          updateIntent.unit ||
          "℃"
        ).trim()

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


