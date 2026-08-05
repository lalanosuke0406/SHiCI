/*
=========================================
SHiCI
57_ChangeProposalService.js

Change Proposal Service
Version 1.0

役割：
・Understanding ResultからEntity Mutationを生成する
・Entity MutationのSubjectを解決する
・Change Planを生成する
・Confirmation Proposalを生成する
・確認待ちデータをPending Change Storeへ保存する
・Proposal Resultを返す

禁止：
・自然言語を再解析しない
・Entity固有の更新コードを直接実行しない
・Spreadsheetを更新しない
・Execution Planを生成しない
・Confirmationを自動確定しない
・LLMを呼び出さない
・Understanding Result原本を変更しない

依存方向：
ActionRouter
    ↓
ChangeProposalService
    ↓
ProductMutationAdapter
    ↓
EntityMutationResolutionEngine
    ↓
ChangePlanEngine
    ↓
ConfirmationProposalEngine
    ↓
PendingChangeStore
=========================================
*/


/*
=========================================
Service Status
=========================================
*/

const CHANGE_PROPOSAL_SERVICE_STATUS_CREATED =
  "proposal_created";

const CHANGE_PROPOSAL_SERVICE_STATUS_UNSUPPORTED =
  "unsupported";

const CHANGE_PROPOSAL_SERVICE_STATUS_CANDIDATES =
  "candidates";

const CHANGE_PROPOSAL_SERVICE_STATUS_NOT_FOUND =
  "not_found";

const CHANGE_PROPOSAL_SERVICE_STATUS_BLOCKED =
  "blocked";


/*
=========================================
Public API
=========================================
*/

/**
 * Understanding Resultから
 * Confirmation Proposalを生成・保存する。
 *
 * @param {Object} understandingResult
 * @param {Object|null|undefined} metadata
 * @return {Object}
 */
function ChangeProposalService_create(
  understandingResult,
  metadata
) {

  ChangeProposalService_validateUnderstandingResult(
    understandingResult
  );


  const normalizedMetadata =
    ChangeProposalService_normalizeMetadata(
      metadata
    );


  /*
  =========================================
  Input Immutability
  =========================================
  */

  const originalUnderstandingResultJson =
    JSON.stringify(
      understandingResult
    );


  const originalMetadataJson =
    metadata ===
      undefined
      ? undefined
      : JSON.stringify(
          metadata
        );


  /*
  =========================================
  Entity Mutation
  =========================================
  */

  const mutation =
    ProductMutationAdapter_convert(
      understandingResult
    );


  /*
   * 現在のAdapter対応範囲外である場合は、
   * 無理にMutationを生成しない。
   */
  if (
    mutation ===
      null
  ) {

    const unsupportedResult =
      ChangeProposalService_buildUnsupportedResult(
        understandingResult
      );


    ChangeProposalService_assertInputsNotModified(
      understandingResult,
      originalUnderstandingResultJson,
      metadata,
      originalMetadataJson
    );


    return unsupportedResult;

  }


  ChangeProposalService_applyMetadataToMutation(
    mutation,
    normalizedMetadata
  );


  EntityMutationContract_validate(
    mutation
  );


  /*
  =========================================
  Entity Resolution
  =========================================
  */

  const resolutionResult =
    EntityMutationResolutionEngine_resolve(
      mutation
    );


  ChangeProposalService_validateResolutionResult(
    resolutionResult
  );


  /*
  =========================================
  Resolution Branch
  =========================================
  */

  let serviceResult =
    null;


  if (
    resolutionResult.status ===
      "candidates"
  ) {

    serviceResult =
      ChangeProposalService_buildCandidatesResult(
        resolutionResult
      );

  } else if (
    resolutionResult.status ===
      "not_found"
  ) {

    serviceResult =
      ChangeProposalService_buildNotFoundResult(
        resolutionResult
      );

  } else if (
    resolutionResult.status ===
      "resolved"
  ) {

    serviceResult =
      ChangeProposalService_buildResolvedResult(
        resolutionResult
      );

  } else {

    throw new Error(
      "ChangeProposalServiceで未対応のResolution statusです。" +
      " status=" +
      String(
        resolutionResult.status
      )
    );

  }


  /*
  =========================================
  Final Validation
  =========================================
  */

  ChangeProposalService_validateResult(
    serviceResult
  );


  ChangeProposalService_assertInputsNotModified(
    understandingResult,
    originalUnderstandingResultJson,
    metadata,
    originalMetadataJson
  );


  return serviceResult;

}

















/*
=========================================
Understanding Result Validation
=========================================
*/

/**
 * Service入力となるUnderstanding Resultを検証する。
 *
 * @param {Object} understandingResult
 */
function ChangeProposalService_validateUnderstandingResult(
  understandingResult
) {

  ChangeProposalService_assertObject(
    understandingResult,
    "understandingResult"
  );


  UnderstandingResultContract_validate(
    understandingResult
  );


  if (
    !understandingResult.intent ||
    understandingResult.intent.type !==
      "update"
  ) {

    throw new Error(
      "ChangeProposalService Ver.1.0は" +
      "Update Intentだけを受け付けます。"
    );

  }


  if (
    !understandingResult.knowledgeBoundary ||
    understandingResult
      .knowledgeBoundary
      .type !==
        "company_knowledge"
  ) {

    throw new Error(
      "ChangeProposalServiceで扱う更新要求は" +
      "company_knowledgeである必要があります。"
    );

  }

}















/*
=========================================
Mutation Metadata
=========================================
*/

/**
 * Service MetadataをMutationへ反映する。
 *
 * ProductMutationAdapterが生成したMutationへ、
 * 実行要求者と要求日時だけを補完する。
 *
 * @param {Object} mutation
 * @param {Object} metadata
 */
function ChangeProposalService_applyMetadataToMutation(
  mutation,
  metadata
) {

  EntityMutationContract_validate(
    mutation
  );


  ChangeProposalService_assertObject(
    metadata,
    "metadata"
  );


  mutation.metadata.requestedBy =
    ChangeProposalService_resolveMetadataString(
      metadata,
      "requestedBy"
    );


  if (
    mutation.metadata.requestedBy ===
      null
  ) {

    mutation.metadata.requestedBy =
      ChangeProposalService_resolveMetadataString(
        metadata,
        "userId"
      );

  }


  mutation.metadata.requestedAt =
    ChangeProposalService_resolveMetadataString(
      metadata,
      "requestedAt"
    );


  if (
    mutation.metadata.requestedAt ===
      null
  ) {

    mutation.metadata.requestedAt =
      new Date()
        .toISOString();

  }


  /*
   * sourceはAdapterが設定した
   * understanding_resultを維持する。
   */

}














/*
=========================================
Resolution Result Validation
=========================================
*/

/**
 * Entity Mutation Resolution Resultを検証する。
 *
 * @param {Object} resolutionResult
 */
function ChangeProposalService_validateResolutionResult(
  resolutionResult
) {

  ChangeProposalService_assertObject(
    resolutionResult,
    "resolutionResult"
  );


  if (
    resolutionResult.schemaVersion !==
      "1.0"
  ) {

    throw new Error(
      "Entity Mutation Resolution Resultの" +
      "schemaVersionが不正です。"
    );

  }


  const supportedStatuses = [

    "resolved",

    "candidates",

    "not_found"

  ];


  if (
    supportedStatuses.indexOf(
      resolutionResult.status
    ) ===
      -1
  ) {

    throw new Error(
      "未対応のEntity Mutation Resolution statusです。" +
      " status=" +
      String(
        resolutionResult.status
      )
    );

  }


  ChangeProposalService_assertObject(
    resolutionResult.resolution,
    "resolutionResult.resolution"
  );


  if (
    resolutionResult.status ===
      "resolved"
  ) {

    ChangeProposalService_assertObject(
      resolutionResult.mutation,
      "resolutionResult.mutation"
    );


    EntityMutationContract_validate(
      resolutionResult.mutation
    );


    ChangeProposalService_assertObject(
      resolutionResult.resolvedEntity,
      "resolutionResult.resolvedEntity"
    );

  }


  if (
    resolutionResult.status ===
      "candidates"
  ) {

    if (
      !Array.isArray(
        resolutionResult.candidates
      ) ||
      resolutionResult.candidates.length ===
        0
    ) {

      throw new Error(
        "candidates statusには1件以上の候補が必要です。"
      );

    }


    if (
      resolutionResult
        .resolution
        .requiresUserSelection !==
          true
    ) {

      throw new Error(
        "candidates statusでは" +
        "requiresUserSelection=trueである必要があります。"
      );

    }

  }


  if (
    resolutionResult.status ===
      "not_found"
  ) {

    if (
      !Array.isArray(
        resolutionResult.candidates
      ) ||
      resolutionResult.candidates.length !==
        0
    ) {

      throw new Error(
        "not_found statusのcandidatesは空である必要があります。"
      );

    }

  }

}










/*
=========================================
Resolved Result
=========================================
*/

/**
 * 解決済みEntity Mutationから、
 * Change Plan・Confirmation Proposalを生成し、
 * Pending Change Storeへ保存する。
 *
 * @param {Object} resolutionResult
 * @return {Object}
 */
function ChangeProposalService_buildResolvedResult(
  resolutionResult
) {

  ChangeProposalService_validateResolutionResult(
    resolutionResult
  );


  if (
    resolutionResult.status !==
      "resolved"
  ) {

    throw new Error(
      "Resolved Result生成には" +
      "resolutionResult.status=resolvedが必要です。"
    );

  }


  /*
  =========================================
  Change Plan
  =========================================
  */

  const changePlan =
    ChangePlanEngine_build(
      resolutionResult
    );


  ChangePlanContract_validate(
    changePlan
  );


  /*
   * Snapshot情報が不足している場合は、
   * Confirmation Proposalを生成しない。
   */
  if (
    changePlan.status ===
      "blocked"
  ) {

    return ChangeProposalService_buildBlockedResult(
      changePlan,
      resolutionResult
    );

  }


  if (
    changePlan.status !==
      "ready_for_confirmation"
  ) {

    throw new Error(
      "ChangeProposalServiceで未対応のChange Plan statusです。" +
      " status=" +
      String(
        changePlan.status
      )
    );

  }


  /*
  =========================================
  Confirmation Proposal
  =========================================
  */

  const proposal =
    ConfirmationProposalEngine_build(
      changePlan
    );


  ConfirmationProposalContract_validate(
    proposal
  );


  /*
  =========================================
  Pending Change Store
  =========================================
  */

  const storeResult =
    PendingChangeStore_save(
      changePlan,
      proposal
    );


  ChangeProposalService_validateStoreResult(
    storeResult,
    changePlan,
    proposal
  );


  /*
  =========================================
  Service Result
  =========================================
  */

  return {

    schemaVersion:
      "1.0",

    serviceVersion:
      "1.0",

    status:
      CHANGE_PROPOSAL_SERVICE_STATUS_CREATED,

    proposalId:
      proposal.proposalId,

    changePlanId:
      changePlan.changePlanId,

    requiresConfirmation:
      true,

    subject:
      ChangeProposalService_deepCopy(
        proposal.subject
      ),

    presentation: {

      proposalType:
        proposal.presentation.proposalType,

      title:
        proposal.presentation.title,

      message:
        proposal.presentation.message,

      changes:
        ChangeProposalService_deepCopy(
          proposal.changes
        ),

      actions:
        ChangeProposalService_deepCopy(
          proposal.actions
        )

    },

    payload:
      ChangeProposalService_deepCopy(
        proposal.payload
      ),

    pending: {

      status:
        storeResult.status,

      storedAt:
        storeResult.storedAt,

      expiresAt:
        storeResult.expiresAt

    },

    mutation:
      ChangeProposalService_deepCopy(
        resolutionResult.mutation
      ),

    resolutionResult:
      ChangeProposalService_deepCopy(
        resolutionResult
      ),

    changePlan:
      ChangeProposalService_deepCopy(
        changePlan
      ),

    proposal:
      ChangeProposalService_deepCopy(
        proposal
      ),

    candidates:
      [],

    missingFields:
      [],

    message:
      proposal.presentation.message

  };

}












/*
=========================================
Blocked Result
=========================================
*/

/**
 * Change Plan生成に必要な情報が不足した場合の
 * Service Resultを生成する。
 *
 * Blocked Planは保存せず、
 * Confirmation Proposalも生成しない。
 *
 * @param {Object} changePlan
 * @param {Object} resolutionResult
 * @return {Object}
 */
function ChangeProposalService_buildBlockedResult(
  changePlan,
  resolutionResult
) {

  ChangePlanContract_validate(
    changePlan
  );


  ChangeProposalService_validateResolutionResult(
    resolutionResult
  );


  if (
    changePlan.status !==
      "blocked"
  ) {

    throw new Error(
      "Blocked Result生成には" +
      "changePlan.status=blockedが必要です。"
    );

  }


  if (
    !Array.isArray(
      changePlan.missingFields
    ) ||
    changePlan.missingFields.length ===
      0
  ) {

    throw new Error(
      "blocked Change Planには" +
      "1件以上のmissingFieldsが必要です。"
    );

  }


  return {

    schemaVersion:
      "1.0",

    serviceVersion:
      "1.0",

    status:
      CHANGE_PROPOSAL_SERVICE_STATUS_BLOCKED,

    proposalId:
      null,

    changePlanId:
      changePlan.changePlanId,

    requiresConfirmation:
      false,

    subject:
      ChangeProposalService_buildResolutionSubject(
        resolutionResult
      ),

    presentation:
      null,

    payload:
      null,

    pending:
      null,

    mutation:
      ChangeProposalService_deepCopy(
        resolutionResult.mutation
      ),

    resolutionResult:
      ChangeProposalService_deepCopy(
        resolutionResult
      ),

    changePlan:
      ChangeProposalService_deepCopy(
        changePlan
      ),

    proposal:
      null,

    candidates:
      [],

    missingFields:
      ChangeProposalService_deepCopy(
        changePlan.missingFields
      ),

    message:
      "変更案を作成するために必要な情報が不足しています。"

  };

}









/*
=========================================
Candidates Result
=========================================
*/

/**
 * Entity候補の選択が必要な場合の
 * Service Resultを生成する。
 *
 * @param {Object} resolutionResult
 * @return {Object}
 */
function ChangeProposalService_buildCandidatesResult(
  resolutionResult
) {

  ChangeProposalService_validateResolutionResult(
    resolutionResult
  );


  if (
    resolutionResult.status !==
      "candidates"
  ) {

    throw new Error(
      "Candidates Result生成には" +
      "resolutionResult.status=candidatesが必要です。"
    );

  }


  return {

    schemaVersion:
      "1.0",

    serviceVersion:
      "1.0",

    status:
      CHANGE_PROPOSAL_SERVICE_STATUS_CANDIDATES,

    proposalId:
      null,

    changePlanId:
      null,

    requiresConfirmation:
      false,

    subject:
      ChangeProposalService_buildResolutionSubject(
        resolutionResult
      ),

    presentation:
      null,

    payload:
      null,

    pending:
      null,

    mutation:
      ChangeProposalService_deepCopy(
        resolutionResult.unresolvedMutation
      ),

    resolutionResult:
      ChangeProposalService_deepCopy(
        resolutionResult
      ),

    changePlan:
      null,

    proposal:
      null,

    candidates:
      ChangeProposalService_deepCopy(
        resolutionResult.candidates
      ),

    missingFields:
      [],

    message:
      "変更対象の候補が複数あります。対象を選択してください。"

  };

}








/*
=========================================
Not Found Result
=========================================
*/

/**
 * 対象Entityが見つからない場合の
 * Service Resultを生成する。
 *
 * @param {Object} resolutionResult
 * @return {Object}
 */
function ChangeProposalService_buildNotFoundResult(
  resolutionResult
) {

  ChangeProposalService_validateResolutionResult(
    resolutionResult
  );


  if (
    resolutionResult.status !==
      "not_found"
  ) {

    throw new Error(
      "Not Found Result生成には" +
      "resolutionResult.status=not_foundが必要です。"
    );

  }


  return {

    schemaVersion:
      "1.0",

    serviceVersion:
      "1.0",

    status:
      CHANGE_PROPOSAL_SERVICE_STATUS_NOT_FOUND,

    proposalId:
      null,

    changePlanId:
      null,

    requiresConfirmation:
      false,

    subject:
      ChangeProposalService_buildResolutionSubject(
        resolutionResult
      ),

    presentation:
      null,

    payload:
      null,

    pending:
      null,

    mutation:
      ChangeProposalService_deepCopy(
        resolutionResult.unresolvedMutation
      ),

    resolutionResult:
      ChangeProposalService_deepCopy(
        resolutionResult
      ),

    changePlan:
      null,

    proposal:
      null,

    candidates:
      [],

    missingFields:
      [],

    message:
      "変更対象のEntityが見つかりませんでした。"

  };

}









/*
=========================================
Resolution Subject
=========================================
*/

/**
 * Resolution Resultから表示用Subjectを構成する。
 *
 * resolvedEntityが存在する場合はCanonical情報を使い、
 * 未解決の場合はunresolvedMutationのSubjectを使う。
 *
 * @param {Object} resolutionResult
 * @return {Object|null}
 */
function ChangeProposalService_buildResolutionSubject(
  resolutionResult
) {

  ChangeProposalService_validateResolutionResult(
    resolutionResult
  );


  if (
    resolutionResult.resolvedEntity &&
    typeof resolutionResult.resolvedEntity ===
      "object" &&
    !Array.isArray(
      resolutionResult.resolvedEntity
    )
  ) {

    return {

      entityType:
        resolutionResult
          .resolvedEntity
          .entityType,

      entityId:
        resolutionResult
          .resolvedEntity
          .entityId,

      entityQuery:
        resolutionResult
          .resolvedEntity
          .label,

      displayName:
        resolutionResult
          .resolvedEntity
          .label

    };

  }


  const unresolvedMutation =
    resolutionResult.unresolvedMutation;


  if (
    !unresolvedMutation ||
    typeof unresolvedMutation !==
      "object" ||
    Array.isArray(
      unresolvedMutation
    ) ||
    !unresolvedMutation.subject
  ) {

    return null;

  }


  return {

    entityType:
      unresolvedMutation.subject.entityType,

    entityId:
      unresolvedMutation.subject.entityId,

    entityQuery:
      unresolvedMutation.subject.entityQuery,

    displayName:
      unresolvedMutation.subject.entityQuery

  };

}










/*
=========================================
Pending Store Validation
=========================================
*/

/**
 * PendingChangeStoreの保存結果を検証する。
 *
 * @param {Object} storeResult
 * @param {Object} changePlan
 * @param {Object} proposal
 */
function ChangeProposalService_validateStoreResult(
  storeResult,
  changePlan,
  proposal
) {

  ChangeProposalService_assertObject(
    storeResult,
    "storeResult"
  );


  ChangePlanContract_validate(
    changePlan
  );


  ConfirmationProposalContract_validate(
    proposal
  );


  if (
    storeResult.status !==
      "stored"
  ) {

    throw new Error(
      "Pending Changeの保存に失敗しました。" +
      " status=" +
      String(
        storeResult.status
      )
    );

  }


  if (
    storeResult.proposalId !==
      proposal.proposalId
  ) {

    throw new Error(
      "Pending Change StoreのproposalIdが一致しません。"
    );

  }


  if (
    storeResult.changePlanId !==
      changePlan.changePlanId
  ) {

    throw new Error(
      "Pending Change StoreのchangePlanIdが一致しません。"
    );

  }


  ChangeProposalService_requireNonEmptyString(
    storeResult.storedAt,
    "storeResult.storedAt"
  );


  ChangeProposalService_requireNonEmptyString(
    storeResult.expiresAt,
    "storeResult.expiresAt"
  );

}











/*
=========================================
Service Result Validation
=========================================
*/

/**
 * Change Proposal Service Resultを検証する。
 *
 * @param {Object} serviceResult
 * @return {boolean}
 */
function ChangeProposalService_validateResult(
  serviceResult
) {

  ChangeProposalService_assertObject(
    serviceResult,
    "serviceResult"
  );


  if (
    serviceResult.schemaVersion !==
      "1.0"
  ) {

    throw new Error(
      "Change Proposal Service Resultの" +
      "schemaVersionが不正です。"
    );

  }


  if (
    serviceResult.serviceVersion !==
      "1.0"
  ) {

    throw new Error(
      "Change Proposal Service Resultの" +
      "serviceVersionが不正です。"
    );

  }


  const supportedStatuses = [

    CHANGE_PROPOSAL_SERVICE_STATUS_CREATED,

    CHANGE_PROPOSAL_SERVICE_STATUS_UNSUPPORTED,

    CHANGE_PROPOSAL_SERVICE_STATUS_CANDIDATES,

    CHANGE_PROPOSAL_SERVICE_STATUS_NOT_FOUND,

    CHANGE_PROPOSAL_SERVICE_STATUS_BLOCKED

  ];


  if (
    supportedStatuses.indexOf(
      serviceResult.status
    ) ===
      -1
  ) {

    throw new Error(
      "Change Proposal Service Resultのstatusが不正です。" +
      " status=" +
      String(
        serviceResult.status
      )
    );

  }


  /*
  =========================================
  Proposal Created
  =========================================
  */

  if (
    serviceResult.status ===
      CHANGE_PROPOSAL_SERVICE_STATUS_CREATED
  ) {

    ChangeProposalService_requireNonEmptyString(
      serviceResult.proposalId,
      "serviceResult.proposalId"
    );


    ChangeProposalService_requireNonEmptyString(
      serviceResult.changePlanId,
      "serviceResult.changePlanId"
    );


    if (
      serviceResult.requiresConfirmation !==
        true
    ) {

      throw new Error(
        "proposal_created Resultでは" +
        "requiresConfirmation=trueである必要があります。"
      );

    }


    ChangeProposalService_assertObject(
      serviceResult.presentation,
      "serviceResult.presentation"
    );


    ChangeProposalService_assertObject(
      serviceResult.pending,
      "serviceResult.pending"
    );


    ChangeProposalService_assertObject(
      serviceResult.changePlan,
      "serviceResult.changePlan"
    );


    ChangeProposalService_assertObject(
      serviceResult.proposal,
      "serviceResult.proposal"
    );


    ChangePlanContract_validate(
      serviceResult.changePlan
    );


    ConfirmationProposalContract_validate(
      serviceResult.proposal
    );


    if (
      serviceResult.proposalId !==
        serviceResult.proposal.proposalId
    ) {

      throw new Error(
        "Service ResultとProposalのproposalIdが一致しません。"
      );

    }


    if (
      serviceResult.changePlanId !==
        serviceResult.changePlan.changePlanId
    ) {

      throw new Error(
        "Service ResultとChange PlanのchangePlanIdが一致しません。"
      );

    }


    if (
      serviceResult.changePlanId !==
        serviceResult.proposal.changePlanId
    ) {

      throw new Error(
        "Change PlanとProposalのchangePlanIdが一致しません。"
      );

    }


    return true;

  }


  /*
  =========================================
  Non-Created Results
  =========================================
  */

  if (
    serviceResult.proposalId !==
      null
  ) {

    throw new Error(
      "proposal_created以外のResultでは" +
      "proposalId=nullである必要があります。"
    );

  }


  if (
    serviceResult.requiresConfirmation !==
      false
  ) {

    throw new Error(
      "proposal_created以外のResultでは" +
      "requiresConfirmation=falseである必要があります。"
    );

  }


  if (
    serviceResult.status ===
      CHANGE_PROPOSAL_SERVICE_STATUS_CANDIDATES
  ) {

    if (
      !Array.isArray(
        serviceResult.candidates
      ) ||
      serviceResult.candidates.length ===
        0
    ) {

      throw new Error(
        "candidates Resultには1件以上の候補が必要です。"
      );

    }

  }


  if (
    serviceResult.status ===
      CHANGE_PROPOSAL_SERVICE_STATUS_NOT_FOUND
  ) {

    if (
      !Array.isArray(
        serviceResult.candidates
      ) ||
      serviceResult.candidates.length !==
        0
    ) {

      throw new Error(
        "not_found Resultのcandidatesは空である必要があります。"
      );

    }

  }


  if (
    serviceResult.status ===
      CHANGE_PROPOSAL_SERVICE_STATUS_BLOCKED
  ) {

    ChangeProposalService_requireNonEmptyString(
      serviceResult.changePlanId,
      "serviceResult.changePlanId"
    );


    if (
      !Array.isArray(
        serviceResult.missingFields
      ) ||
      serviceResult.missingFields.length ===
        0
    ) {

      throw new Error(
        "blocked Resultには1件以上のmissingFieldsが必要です。"
      );

    }


    ChangeProposalService_assertObject(
      serviceResult.changePlan,
      "serviceResult.changePlan"
    );


    ChangePlanContract_validate(
      serviceResult.changePlan
    );

  }


  return true;

}













/*
=========================================
Unsupported Result
=========================================
*/

/**
 * Adapter未対応時のResultを生成する。
 *
 * @param {Object} understandingResult
 * @return {Object}
 */
function ChangeProposalService_buildUnsupportedResult(
  understandingResult
) {

  ChangeProposalService_validateUnderstandingResult(
    understandingResult
  );


  return {

    schemaVersion:
      "1.0",

    serviceVersion:
      "1.0",

    status:
      CHANGE_PROPOSAL_SERVICE_STATUS_UNSUPPORTED,

    proposalId:
      null,

    changePlanId:
      null,

    requiresConfirmation:
      false,

    presentation:
      null,

    candidates:
      [],

    message:
      "この変更要求は、現在のEntity Mutation Adapterでは対応していません。"

  };

}

















/*
=========================================
Metadata
=========================================
*/

/**
 * Metadataを正規化する。
 *
 * @param {Object|null|undefined} metadata
 * @return {Object}
 */
function ChangeProposalService_normalizeMetadata(
  metadata
) {

  if (
    metadata ===
      null ||
    metadata ===
      undefined
  ) {

    return {};

  }


  ChangeProposalService_assertObject(
    metadata,
    "metadata"
  );


  return ChangeProposalService_deepCopy(
    metadata
  );

}


/**
 * Metadata内の空でないstringを取得する。
 *
 * @param {Object} metadata
 * @param {string} key
 * @return {string|null}
 */
function ChangeProposalService_resolveMetadataString(
  metadata,
  key
) {

  ChangeProposalService_assertObject(
    metadata,
    "metadata"
  );


  const value =
    metadata[
      key
    ];


  if (
    typeof value !==
      "string"
  ) {

    return null;

  }


  const normalized =
    value.trim();


  return normalized ===
    ""
    ? null
    : normalized;

}















/*
=========================================
Input Immutability
=========================================
*/

/**
 * Service実行によって入力原本が
 * 変更されていないことを確認する。
 *
 * @param {Object} understandingResult
 * @param {string} originalUnderstandingResultJson
 * @param {Object|null|undefined} metadata
 * @param {string|undefined} originalMetadataJson
 */
function ChangeProposalService_assertInputsNotModified(
  understandingResult,
  originalUnderstandingResultJson,
  metadata,
  originalMetadataJson
) {

  if (
    JSON.stringify(
      understandingResult
    ) !==
      originalUnderstandingResultJson
  ) {

    throw new Error(
      "ChangeProposalServiceによって" +
      "Understanding Result原本が変更されました。"
    );

  }


  if (
    originalMetadataJson !==
      undefined &&
    JSON.stringify(
      metadata
    ) !==
      originalMetadataJson
  ) {

    throw new Error(
      "ChangeProposalServiceによって" +
      "Metadata原本が変更されました。"
    );

  }

}













/*
=========================================
Utility
=========================================
*/

/**
 * JSON互換値をDeep Copyする。
 *
 * @param {*} value
 * @return {*}
 */
function ChangeProposalService_deepCopy(
  value
) {

  return JSON.parse(
    JSON.stringify(
      value
    )
  );

}














/*
=========================================
Assertion
=========================================
*/

/**
 * Objectであることを確認する。
 *
 * @param {*} value
 * @param {string} label
 */
function ChangeProposalService_assertObject(
  value,
  label
) {

  if (
    value ===
      null ||
    typeof value !==
      "object" ||
    Array.isArray(
      value
    )
  ) {

    throw new Error(
      label +
      "はObjectである必要があります。"
    );

  }

}




/**
 * 空でないstringを返す。
 *
 * @param {*} value
 * @param {string} label
 * @return {string}
 */
function ChangeProposalService_requireNonEmptyString(
  value,
  label
) {

  if (
    typeof value !==
      "string" ||
    value.trim() ===
      ""
  ) {

    throw new Error(
      label +
      "は空でないstringである必要があります。"
    );

  }


  return value.trim();

}


