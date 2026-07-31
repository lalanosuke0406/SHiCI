/*
=========================================
SHiCI
38_EntityMutationResolutionEngine.js

Entity Mutation Resolution Engine
Version 1.0

役割：
・Entity MutationのSubjectを
  Canonical Entityへ解決する
・既存のEntity Resolutionを利用する
・解決済みMutationまたは候補を返す

解決結果：
・resolved
・candidates
・not_found

禁止：
・自然言語の変更内容を再解釈しない
・Semantic候補を自動確定しない
・Snapshotを生成しない
・Storageを更新しない
・CRUD関数を呼び出さない
・Update Requestを生成しない
・自然言語回答を生成しない
=========================================
*/


/*
=========================================
Entry Point
=========================================
*/

/**
 * Entity MutationのSubjectを解決する。
 *
 * @param {Object} mutation
 * @return {Object}
 */
function EntityMutationResolutionEngine_resolve(
  mutation
) {

  /*
  =========================================
  Contract確認
  =========================================
  */

  EntityMutationContract_validate(
    mutation
  );


  /*
  =========================================
  解決用Mutationを複製
  =========================================
  */

  const resolvedMutation =
    EntityMutationResolutionEngine_clone(
      mutation
    );


  const subject =
    resolvedMutation.subject;


  /*
  =========================================
  Entity IDが既に存在する場合
  =========================================
  */

  if (
    EntityMutationResolutionEngine_isNonEmptyString(
      subject.entityId
    )
  ) {

    return EntityMutationResolutionEngine_resolveById(
      resolvedMutation
    );

  }


  /*
  =========================================
  Entity Queryによる解決
  =========================================
  */

  return EntityMutationResolutionEngine_resolveByQuery(
    resolvedMutation
  );

}


/*
=========================================
Resolve By ID
=========================================
*/

/**
 * 既に指定されているEntity IDが
 * Resolution Knowledge上に存在するか確認する。
 *
 * @param {Object} mutation
 * @return {Object}
 */
function EntityMutationResolutionEngine_resolveById(
  mutation
) {

  const subject =
    mutation.subject;


  const matchedEntity =
    EntityResolution_findById(
      subject.entityType,
      subject.entityId
    );


  if (
    !matchedEntity
  ) {

    return EntityMutationResolutionEngine_createNotFoundResult(
      mutation,
      "entity_id"
    );

  }


  /*
   * Resolution Knowledge側の値で
   * Canonical Entity情報を確定する。
   */
  mutation.subject.entityType =
    String(
      matchedEntity.entityType
    ).trim();

  mutation.subject.entityId =
    String(
      matchedEntity.entityId
    ).trim();


  /*
   * entityQueryは、元のユーザー表現として保持する。
   *
   * 入力にentityQueryがない場合のみ、
   * Resolution Knowledge上の表現を補完する。
   */
  if (
    !EntityMutationResolutionEngine_isNonEmptyString(
      mutation.subject.entityQuery
    )
  ) {

    mutation.subject.entityQuery =
      EntityMutationResolutionEngine_getCandidateLabel(
        matchedEntity
      );

  }


  EntityMutationContract_validate(
    mutation
  );


  return EntityMutationResolutionEngine_createResolvedResult(
    mutation,
    matchedEntity,
    "entity_id"
  );

}


/*
=========================================
Resolve By Query
=========================================
*/

/**
 * Entity Queryから候補を検索し、
 * Resolution Methodに応じて結果を返す。
 *
 * @param {Object} mutation
 * @return {Object}
 */
function EntityMutationResolutionEngine_resolveByQuery(
  mutation
) {

  const subject =
    mutation.subject;


  const entityQuery =
    String(
      subject.entityQuery || ""
    ).trim();


  const allCandidates =
    resolveEntityCandidates(
      entityQuery
    );


  /*
   * SubjectのEntity Typeと
   * 一致する候補だけを残す。
   */
  const candidates =
    EntityMutationResolutionEngine_filterCandidatesByType(
      allCandidates,
      subject.entityType
    );


  if (
    candidates.length ===
      0
  ) {

    return EntityMutationResolutionEngine_createNotFoundResult(
      mutation,
      "entity_query"
    );

  }


  /*
  =========================================
  Semantic Resolution
  =========================================

  Semantic Resolutionは、
  候補が1件だけであっても自動確定しない。
  */

  if (
    EntityMutationResolutionEngine_containsSemanticCandidate(
      candidates
    )
  ) {

    return EntityMutationResolutionEngine_createCandidatesResult(
      mutation,
      candidates,
      "semantic"
    );

  }


  /*
  =========================================
  Knowledge Resolution
  =========================================
  */

  if (
    candidates.length ===
      1
  ) {

    const candidate =
      candidates[0];


    mutation.subject.entityType =
      String(
        candidate.entityType
      ).trim();

    mutation.subject.entityId =
      String(
        candidate.entityId
      ).trim();


    EntityMutationContract_validate(
      mutation
    );


    return EntityMutationResolutionEngine_createResolvedResult(
      mutation,
      candidate,
      "knowledge"
    );

  }


  /*
   * Knowledge Resolutionで複数候補がある場合は、
   * ユーザーによる選択が必要。
   */
  return EntityMutationResolutionEngine_createCandidatesResult(
    mutation,
    candidates,
    "knowledge"
  );

}


/*
=========================================
Candidate判定
=========================================
*/

/**
 * CandidateをEntity Typeで絞り込む。
 *
 * @param {Array<Object>} candidates
 * @param {string} entityType
 * @return {Array<Object>}
 */
function EntityMutationResolutionEngine_filterCandidatesByType(
  candidates,
  entityType
) {

  if (
    !Array.isArray(
      candidates
    )
  ) {

    return [];

  }


  const normalizedEntityType =
    String(
      entityType || ""
    ).trim();


  return candidates.filter(
    function(candidate) {

      if (
        !candidate
      ) {

        return false;

      }


      return (
        String(
          candidate.entityType || ""
        ).trim() ===
          normalizedEntityType
      );

    }
  );

}


/**
 * Semantic Resolution由来の候補が
 * 含まれているか確認する。
 *
 * @param {Array<Object>} candidates
 * @return {boolean}
 */
function EntityMutationResolutionEngine_containsSemanticCandidate(
  candidates
) {

  return candidates.some(
    function(candidate) {

      return (
        candidate &&
        candidate.resolutionMethod ===
          "semantic"
      );

    }
  );

}


/*
=========================================
Result
=========================================
*/

/**
 * 解決済みResultを生成する。
 *
 * @param {Object} mutation
 * @param {Object} entity
 * @param {string} resolutionMethod
 * @return {Object}
 */
function EntityMutationResolutionEngine_createResolvedResult(
  mutation,
  entity,
  resolutionMethod
) {

  return {

    schemaVersion:
      "1.0",

    status:
      "resolved",

    mutation:
      mutation,

    resolvedEntity:
      EntityMutationResolutionEngine_mapCandidate(
        entity
      ),

    candidates:
      [],

    resolution: {

      method:
        resolutionMethod,

      requiresUserSelection:
        false

    }

  };

}


/**
 * 候補提示Resultを生成する。
 *
 * @param {Object} mutation
 * @param {Array<Object>} candidates
 * @param {string} resolutionMethod
 * @return {Object}
 */
function EntityMutationResolutionEngine_createCandidatesResult(
  mutation,
  candidates,
  resolutionMethod
) {

  return {

    schemaVersion:
      "1.0",

    status:
      "candidates",

    mutation:
      null,

    unresolvedMutation:
      mutation,

    resolvedEntity:
      null,

    candidates:
      candidates.map(
        function(candidate) {

          return EntityMutationResolutionEngine_mapCandidate(
            candidate
          );

        }
      ),

    resolution: {

      method:
        resolutionMethod,

      requiresUserSelection:
        true

    }

  };

}


/**
 * 候補なしResultを生成する。
 *
 * @param {Object} mutation
 * @param {string} resolutionMethod
 * @return {Object}
 */
function EntityMutationResolutionEngine_createNotFoundResult(
  mutation,
  resolutionMethod
) {

  return {

    schemaVersion:
      "1.0",

    status:
      "not_found",

    mutation:
      null,

    unresolvedMutation:
      mutation,

    resolvedEntity:
      null,

    candidates:
      [],

    resolution: {

      method:
        resolutionMethod,

      requiresUserSelection:
        false

    }

  };

}


/*
=========================================
Candidate Mapping
=========================================
*/

/**
 * 既存のEntity Resolution Candidateを
 * Mutation Resolution用の形式へ変換する。
 *
 * @param {Object} candidate
 * @return {Object|null}
 */
function EntityMutationResolutionEngine_mapCandidate(
  candidate
) {

  if (
    !candidate
  ) {

    return null;

  }


  return {

    entityType:
      candidate.entityType !==
        undefined &&
      candidate.entityType !==
        null
        ? String(
            candidate.entityType
          ).trim()
        : null,

    entityId:
      candidate.entityId !==
        undefined &&
      candidate.entityId !==
        null
        ? String(
            candidate.entityId
          ).trim()
        : null,

    label:
      EntityMutationResolutionEngine_getCandidateLabel(
        candidate
      ),

    keyword:
      candidate.keyword !==
        undefined
        ? candidate.keyword
        : null,

    alias:
      candidate.alias !==
        undefined
        ? candidate.alias
        : null,

    priority:
      candidate.priority !==
        undefined &&
      candidate.priority !==
        null
        ? Number(
            candidate.priority
          )
        : null,

    notes:
      candidate.notes !==
        undefined
        ? candidate.notes
        : null,

    resolutionMethod:
      candidate.resolutionMethod ||
      "knowledge",

    semanticConfidence:
      candidate.semanticConfidence !==
        undefined &&
      candidate.semanticConfidence !==
        null
        ? Number(
            candidate.semanticConfidence
          )
        : null,

    semanticReason:
      candidate.semanticReason !==
        undefined
        ? candidate.semanticReason
        : null

  };

}


/**
 * Candidateの表示用識別ラベルを取得する。
 *
 * 自然言語回答を生成するのではなく、
 * Candidate識別に必要な既存値を選択するだけとする。
 *
 * @param {Object} candidate
 * @return {string|null}
 */
function EntityMutationResolutionEngine_getCandidateLabel(
  candidate
) {

  const values = [

    candidate
      ? candidate.keyword
      : null,

    candidate
      ? candidate.alias
      : null,

    candidate
      ? candidate.entityId
      : null

  ];


  for (
    let index = 0;
    index < values.length;
    index++
  ) {

    if (
      EntityMutationResolutionEngine_isNonEmptyString(
        values[index]
      )
    ) {

      return String(
        values[index]
      ).trim();

    }

  }


  return null;

}


/*
=========================================
Utility
=========================================
*/

/**
 * Plain Object／Arrayとして複製する。
 *
 * Entity Mutation Contractの値は、
 * JSON互換データだけで構成される。
 *
 * @param {*} value
 * @return {*}
 */
function EntityMutationResolutionEngine_clone(
  value
) {

  return JSON.parse(
    JSON.stringify(
      value
    )
  );

}


/**
 * 空でない文字列か確認する。
 *
 * @param {*} value
 * @return {boolean}
 */
function EntityMutationResolutionEngine_isNonEmptyString(
  value
) {

  return (
    typeof value ===
      "string" &&
    value.trim() !==
      ""
  );

}


