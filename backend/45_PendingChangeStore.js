/*
=========================================
SHiCI
45_PendingChangeStore.js

Pending Change Store
Version 1.0

役割：
・確認待ちのChange Planを一時保存する
・Confirmation Proposalを一時保存する
・proposalIdとchangePlanIdの対応を保持する
・確認時に保存済みデータを復元する
・キャンセル時または実行後に削除する

保存先：
・Apps Script CacheService
・Script Cache
・有効期限30分

禁止：
・Spreadsheetを更新しない
・Change Planを実行しない
・標準条件を切り替えない
・条件IDを採番しない
・Proposalの内容を変更しない
・フロントエンドから送られた業務値を信用しない
・LLMを呼び出さない
=========================================
*/


/*
=========================================
定数
=========================================
*/

const PENDING_CHANGE_STORE_VERSION =
  "1.0";


/**
 * Cache上の保存時間。
 *
 * 30分。
 */
const PENDING_CHANGE_STORE_EXPIRATION_SECONDS =
  30 * 60;


/**
 * Cache Keyの接頭辞。
 */
const PENDING_CHANGE_STORE_KEY_PREFIX =
  "SHICI_PENDING_CHANGE_";


/*
=========================================
Public API
=========================================
*/

/**
 * Change PlanとConfirmation Proposalを
 * 確認待ちデータとして保存する。
 *
 * @param {Object} changePlan
 * @param {Object} proposal
 * @return {Object}
 */
function PendingChangeStore_save(
  changePlan,
  proposal
) {

  PendingChangeStore_validateSaveInput(
    changePlan,
    proposal
  );


  const storedAt =
    PendingChangeStore_getCurrentTimestamp();


  const expiresAt =
    PendingChangeStore_calculateExpirationTimestamp(
      PENDING_CHANGE_STORE_EXPIRATION_SECONDS
    );


  const entry = {

    schemaVersion:
      "1.0",

    storeVersion:
      PENDING_CHANGE_STORE_VERSION,

    status:
      "pending",

    proposalId:
      proposal.proposalId,

    changePlanId:
      changePlan.changePlanId,

    changePlan:
      PendingChangeStore_deepCopy(
        changePlan
      ),

    proposal:
      PendingChangeStore_deepCopy(
        proposal
      ),

    storedAt:
      storedAt,

    expiresAt:
      expiresAt

  };


  PendingChangeStore_validateEntry(
    entry
  );


  const key =
    PendingChangeStore_buildCacheKey(
      proposal.proposalId
    );


  const serialized =
    JSON.stringify(
      entry
    );


  PendingChangeStore_assertCacheSize(
    serialized
  );


  const cache =
    PendingChangeStore_getCache();


  cache.put(
    key,
    serialized,
    PENDING_CHANGE_STORE_EXPIRATION_SECONDS
  );


  return {

    status:
      "stored",

    proposalId:
      proposal.proposalId,

    changePlanId:
      changePlan.changePlanId,

    storedAt:
      storedAt,

    expiresAt:
      expiresAt

  };

}


/**
 * 保存済みの確認待ちデータを取得する。
 *
 * proposalIdだけでなく、
 * changePlanIdも必ず照合する。
 *
 * @param {string} proposalId
 * @param {string} changePlanId
 * @return {Object}
 */
function PendingChangeStore_get(
  proposalId,
  changePlanId
) {

  PendingChangeStore_assertNonEmptyString(
    proposalId,
    "proposalId"
  );


  PendingChangeStore_assertNonEmptyString(
    changePlanId,
    "changePlanId"
  );


  const key =
    PendingChangeStore_buildCacheKey(
      proposalId
    );


  const cache =
    PendingChangeStore_getCache();


  const serialized =
    cache.get(
      key
    );


  if (
    serialized ===
      null
  ) {

    throw new Error(
      "確認待ちデータが見つかりません。期限切れ、削除済み、またはCacheから消失した可能性があります。"
    );

  }


  const entry =
    PendingChangeStore_parseEntry(
      serialized
    );


  PendingChangeStore_validateEntry(
    entry
  );


  /*
   * proposalId照合
   */
  if (
    entry.proposalId !==
      proposalId
  ) {

    throw new Error(
      "保存済みデータのproposalIdが一致しません。"
    );

  }


  /*
   * changePlanId照合
   */
  if (
    entry.changePlanId !==
      changePlanId
  ) {

    throw new Error(
      "保存済みデータのchangePlanIdが一致しません。"
    );

  }


  /*
   * 内部データ同士のID照合
   */
  if (
    entry.changePlan.changePlanId !==
      changePlanId
  ) {

    throw new Error(
      "保存済みChange PlanのchangePlanIdが一致しません。"
    );

  }


  if (
    entry.proposal.proposalId !==
      proposalId
  ) {

    throw new Error(
      "保存済みConfirmation ProposalのproposalIdが一致しません。"
    );

  }


  if (
    entry.proposal.changePlanId !==
      changePlanId
  ) {

    throw new Error(
      "保存済みConfirmation ProposalのchangePlanIdが一致しません。"
    );

  }


  if (
    entry.status !==
      "pending"
  ) {

    throw new Error(
      "保存済みデータは確認待ち状態ではありません。"
    );

  }


  return PendingChangeStore_deepCopy(
    entry
  );

}


/**
 * 保存済みデータが存在するか確認する。
 *
 * Cacheの性質上、falseの場合は
 * 期限切れまたは早期消失の可能性がある。
 *
 * @param {string} proposalId
 * @return {boolean}
 */
function PendingChangeStore_exists(
  proposalId
) {

  PendingChangeStore_assertNonEmptyString(
    proposalId,
    "proposalId"
  );


  const key =
    PendingChangeStore_buildCacheKey(
      proposalId
    );


  const cache =
    PendingChangeStore_getCache();


  return (
    cache.get(
      key
    ) !==
      null
  );

}


/**
 * 保存済みの確認待ちデータを削除する。
 *
 * 削除前にproposalIdとchangePlanIdを照合する。
 *
 * @param {string} proposalId
 * @param {string} changePlanId
 * @return {Object}
 */
function PendingChangeStore_remove(
  proposalId,
  changePlanId
) {

  /*
   * ID照合を行うため、
   * 先に保存データを取得する。
   */
  const entry =
    PendingChangeStore_get(
      proposalId,
      changePlanId
    );


  const key =
    PendingChangeStore_buildCacheKey(
      proposalId
    );


  const cache =
    PendingChangeStore_getCache();


  cache.remove(
    key
  );


  return {

    status:
      "removed",

    proposalId:
      entry.proposalId,

    changePlanId:
      entry.changePlanId,

    removedAt:
      PendingChangeStore_getCurrentTimestamp()

  };

}


/*
=========================================
Save Input Validation
=========================================
*/

/**
 * 保存対象を検証する。
 *
 * Storeは処理境界であるため、
 * 両方のContractによる正式検証を行う。
 *
 * @param {Object} changePlan
 * @param {Object} proposal
 */
function PendingChangeStore_validateSaveInput(
  changePlan,
  proposal
) {

  PendingChangeStore_assertObject(
    changePlan,
    "changePlan"
  );


  PendingChangeStore_assertObject(
    proposal,
    "proposal"
  );


  ChangePlanContract_validate(
    changePlan
  );


  ConfirmationProposalContract_validate(
    proposal
  );


  if (
    changePlan.status !==
      "ready_for_confirmation"
  ) {

    throw new Error(
      "保存対象のChange Planはready_for_confirmationである必要があります。"
    );

  }


  if (
    !changePlan.confirmation ||
    changePlan.confirmation.required !==
      true
  ) {

    throw new Error(
      "保存対象のChange Planには確認要求が必要です。"
    );

  }


  if (
    changePlan.confirmation.status !==
      "pending"
  ) {

    throw new Error(
      "保存対象のChange Planのconfirmation.statusはpendingである必要があります。"
    );

  }


  if (
    changePlan.executable !==
      false
  ) {

    throw new Error(
      "確認前のChange Planはexecutable=falseである必要があります。"
    );

  }


  if (
    proposal.status !==
      "pending"
  ) {

    throw new Error(
      "保存対象のConfirmation Proposalはpendingである必要があります。"
    );

  }


  if (
    proposal.changePlanId !==
      changePlan.changePlanId
  ) {

    throw new Error(
      "Change PlanとConfirmation ProposalのchangePlanIdが一致しません。"
    );

  }


  if (
    !proposal.payload ||
    proposal.payload.proposalId !==
      proposal.proposalId
  ) {

    throw new Error(
      "Confirmation Proposalのpayload.proposalIdが一致しません。"
    );

  }


  if (
    proposal.payload.changePlanId !==
      changePlan.changePlanId
  ) {

    throw new Error(
      "Confirmation Proposalのpayload.changePlanIdが一致しません。"
    );

  }

}


/*
=========================================
Stored Entry Validation
=========================================
*/

/**
 * Cacheへ保存するEntry、
 * またはCacheから復元したEntryを検証する。
 *
 * @param {Object} entry
 */
function PendingChangeStore_validateEntry(
  entry
) {

  PendingChangeStore_assertObject(
    entry,
    "entry"
  );


  PendingChangeStore_assertNonEmptyString(
    entry.schemaVersion,
    "entry.schemaVersion"
  );


  if (
    entry.schemaVersion !==
      "1.0"
  ) {

    throw new Error(
      "未対応のPending Change Entry schemaVersionです。"
    );

  }


  PendingChangeStore_assertNonEmptyString(
    entry.storeVersion,
    "entry.storeVersion"
  );


  if (
    entry.storeVersion !==
      PENDING_CHANGE_STORE_VERSION
  ) {

    throw new Error(
      "未対応のPending Change Store Versionです。"
    );

  }


  if (
    entry.status !==
      "pending"
  ) {

    throw new Error(
      "Pending Change Entryのstatusはpendingである必要があります。"
    );

  }


  PendingChangeStore_assertNonEmptyString(
    entry.proposalId,
    "entry.proposalId"
  );


  PendingChangeStore_assertNonEmptyString(
    entry.changePlanId,
    "entry.changePlanId"
  );


  PendingChangeStore_assertObject(
    entry.changePlan,
    "entry.changePlan"
  );


  PendingChangeStore_assertObject(
    entry.proposal,
    "entry.proposal"
  );


  PendingChangeStore_assertNonEmptyString(
    entry.storedAt,
    "entry.storedAt"
  );


  PendingChangeStore_assertNonEmptyString(
    entry.expiresAt,
    "entry.expiresAt"
  );


  /*
   * 復元後もContract検証を行う。
   */
  ChangePlanContract_validate(
    entry.changePlan
  );


  ConfirmationProposalContract_validate(
    entry.proposal
  );


  if (
    entry.changePlan.changePlanId !==
      entry.changePlanId
  ) {

    throw new Error(
      "EntryとChange PlanのchangePlanIdが一致しません。"
    );

  }


  if (
    entry.proposal.proposalId !==
      entry.proposalId
  ) {

    throw new Error(
      "EntryとConfirmation ProposalのproposalIdが一致しません。"
    );

  }


  if (
    entry.proposal.changePlanId !==
      entry.changePlanId
  ) {

    throw new Error(
      "EntryとConfirmation ProposalのchangePlanIdが一致しません。"
    );

  }


  if (
    !entry.proposal.payload ||
    entry.proposal.payload.proposalId !==
      entry.proposalId
  ) {

    throw new Error(
      "EntryとProposal PayloadのproposalIdが一致しません。"
    );

  }


  if (
    entry.proposal.payload.changePlanId !==
      entry.changePlanId
  ) {

    throw new Error(
      "EntryとProposal PayloadのchangePlanIdが一致しません。"
    );

  }

}


/*
=========================================
Cache
=========================================
*/

/**
 * Pending Change Storeで使用するCacheを取得する。
 *
 * Ver.1.0ではScript Cacheを使用する。
 *
 * @return {Cache}
 */
function PendingChangeStore_getCache() {

  if (
    typeof CacheService ===
      "undefined" ||
    !CacheService ||
    typeof CacheService.getScriptCache !==
      "function"
  ) {

    throw new Error(
      "CacheServiceを利用できません。"
    );

  }


  return CacheService
    .getScriptCache();

}


/**
 * proposalIdからCache Keyを生成する。
 *
 * @param {string} proposalId
 * @return {string}
 */
function PendingChangeStore_buildCacheKey(
  proposalId
) {

  PendingChangeStore_assertNonEmptyString(
    proposalId,
    "proposalId"
  );


  const key =
    PENDING_CHANGE_STORE_KEY_PREFIX +
    proposalId.trim();


  /*
   * CacheServiceのKey上限を超えないようにする。
   */
  if (
    key.length >
      250
  ) {

    throw new Error(
      "Pending Change StoreのCache Keyが長すぎます。"
    );

  }


  return key;

}


/**
 * Cacheへ保存する文字列のサイズを確認する。
 *
 * CacheServiceでは1件100KBが上限。
 *
 * UTF-8の厳密なバイト数を確認する。
 *
 * @param {string} serialized
 */
function PendingChangeStore_assertCacheSize(
  serialized
) {

  PendingChangeStore_assertNonEmptyString(
    serialized,
    "serialized"
  );


  let byteLength =
    null;


  if (
    typeof Utilities !==
      "undefined" &&
    Utilities &&
    typeof Utilities.newBlob ===
      "function"
  ) {

    byteLength =
      Utilities
        .newBlob(
          serialized
        )
        .getBytes()
        .length;

  } else {

    /*
     * Apps Script外のテスト環境用Fallback。
     */
    byteLength =
      unescape(
        encodeURIComponent(
          serialized
        )
      ).length;

  }


  const maximumBytes =
    100 * 1024;


  if (
    byteLength >
      maximumBytes
  ) {

    throw new Error(
      "Pending Change EntryがCacheServiceの100KB上限を超えています。byteLength=" +
      byteLength
    );

  }

}


/*
=========================================
Serialization
=========================================
*/

/**
 * JSON文字列をEntryへ変換する。
 *
 * @param {string} serialized
 * @return {Object}
 */
function PendingChangeStore_parseEntry(
  serialized
) {

  PendingChangeStore_assertNonEmptyString(
    serialized,
    "serialized"
  );


  try {

    const entry =
      JSON.parse(
        serialized
      );


    PendingChangeStore_assertObject(
      entry,
      "entry"
    );


    return entry;

  } catch (error) {

    throw new Error(
      "確認待ちデータのJSON復元に失敗しました。" +
      (
        error &&
        error.message
          ? " " + error.message
          : ""
      )
    );

  }

}


/**
 * ObjectをJSON変換によって複製する。
 *
 * @param {*} value
 * @return {*}
 */
function PendingChangeStore_deepCopy(
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
Timestamp
=========================================
*/

/**
 * 現在日時をISO 8601形式で取得する。
 *
 * @return {string}
 */
function PendingChangeStore_getCurrentTimestamp() {

  return new Date()
    .toISOString();

}


/**
 * 現在時刻から有効期限を計算する。
 *
 * @param {number} expirationSeconds
 * @return {string}
 */
function PendingChangeStore_calculateExpirationTimestamp(
  expirationSeconds
) {

  if (
    typeof expirationSeconds !==
      "number" ||
    !isFinite(
      expirationSeconds
    ) ||
    expirationSeconds <=
      0
  ) {

    throw new Error(
      "expirationSecondsは0より大きいnumberである必要があります。"
    );

  }


  const expirationMilliseconds =
    expirationSeconds *
    1000;


  return new Date(
    new Date().getTime() +
    expirationMilliseconds
  ).toISOString();

}


/*
=========================================
Assertion
=========================================
*/

function PendingChangeStore_assertObject(
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


function PendingChangeStore_assertNonEmptyString(
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

}


