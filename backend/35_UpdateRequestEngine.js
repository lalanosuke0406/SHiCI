/*
=========================================
SHiCI
UpdateRequestEngine.js

役割：
・更新案の生成
・更新案の一時保存
・確定前の安全な確認情報を構成
=========================================
*/


/*
=========================================
設定
=========================================
*/

/**
 * 更新案の有効時間
 *
 * 30分
 */
const UPDATE_REQUEST_EXPIRATION_SECONDS =
  30 * 60;


/**
 * 更新案キャッシュのキー接頭辞
 */
const UPDATE_REQUEST_CACHE_PREFIX =
  "SHICI_UPDATE_REQUEST_";


/*
=========================================
内部共通関数
=========================================
*/

/**
 * 更新案IDを生成する
 *
 * @return {string}
 */
function UpdateRequestEngine_generateRequestId() {

  return (
    "UPDATE-" +
    Utilities
      .getUuid()
      .replace(
        /-/g,
        ""
      )
      .toUpperCase()
  );

}


/**
 * 更新案用のキャッシュキーを作る
 *
 * @param {string} requestId
 * @return {string}
 */
function UpdateRequestEngine_buildCacheKey(
  requestId
) {

  const normalizedRequestId =
    String(
      requestId || ""
    ).trim();

  if (!normalizedRequestId) {

    throw new Error(
      "更新案IDがありません。"
    );

  }

  return (
    UPDATE_REQUEST_CACHE_PREFIX +
    normalizedRequestId
  );

}


/**
 * 更新案を一時保存する
 *
 * @param {Object} updateRequest
 * @return {Object}
 */
function UpdateRequestEngine_save(
  updateRequest
) {

  if (
    !updateRequest ||
    typeof updateRequest !==
      "object"
  ) {

    throw new Error(
      "保存する更新案がありません。"
    );

  }

  const requestId =
    String(
      updateRequest.requestId || ""
    ).trim();

  if (!requestId) {

    throw new Error(
      "更新案IDがありません。"
    );

  }

  const cacheKey =
    UpdateRequestEngine_buildCacheKey(
      requestId
    );

  const serialized =
    JSON.stringify(
      updateRequest
    );

  CacheService
    .getScriptCache()
    .put(
      cacheKey,
      serialized,
      UPDATE_REQUEST_EXPIRATION_SECONDS
    );

  return {

    status:
      "success",

    requestId:
      requestId,

    expiresInSeconds:
      UPDATE_REQUEST_EXPIRATION_SECONDS

  };

}


/*
=========================================
金型温度更新案
=========================================
*/

/**
 * 金型温度の更新案を生成する
 *
 * この関数では、
 * マスターデータの書き込みは行わない。
 *
 * @param {string} productId
 * @param {string} expectedCurrentConditionId
 * @param {number|string} newMoldTemperature
 * @param {Object} user
 * @return {Object}
 */
function UpdateRequestEngine_createMoldTemperatureProposal(
  productId,
  expectedCurrentConditionId,
  newMoldTemperature,
  user
) {

  /*
  =========================================
  更新者の確認
  =========================================
  */

  if (
    !user ||
    !user.userId
  ) {

    throw new Error(
      "更新者情報がありません。"
    );

  }

  const normalizedUserId =
    String(
      user.userId || ""
    ).trim();

  if (!normalizedUserId) {

    throw new Error(
      "更新者のユーザーIDがありません。"
    );

  }


  /*
  =========================================
  書き込み前検証
  =========================================

  既に作成した検証関数を再利用する。

  この検証関数は、
  スプレッドシートへの書き込みを行わない。
  */

  const validation =
    ConditionUpdateEngine_validateMoldTemperatureUpdate(
      productId,
      expectedCurrentConditionId,
      newMoldTemperature
    );


  /*
  =========================================
  更新案情報の生成
  =========================================
  */

  const requestId =
    UpdateRequestEngine_generateRequestId();

  const createdAt =
    new Date();

  const expiresAt =
    new Date(
      createdAt.getTime() +
      (
        UPDATE_REQUEST_EXPIRATION_SECONDS *
        1000
      )
    );

  const changeReason =
    "金型温度を" +
    validation.oldMoldTemperature +
    "℃から" +
    validation.newMoldTemperature +
    "℃へ変更";

  const updateRequest = {

    requestId:
      requestId,

    requestType:
      "MOLD_TEMPERATURE_UPDATE",

    status:
      "PENDING",

    createdAt:
      createdAt.toISOString(),

    expiresAt:
      expiresAt.toISOString(),

    requestedBy: {

      userId:
        normalizedUserId,

      name:
        String(
          user.name ||
          user.displayName ||
          ""
        ).trim(),

      email:
        String(
          user.email || ""
        ).trim()

    },

    target: {

      entityType:
        "PRODUCT",

      productId:
        validation.productId,

      productName:
        validation.productName,

      drawingNumber:
        validation.drawingNumber

    },

    expectedState: {

      currentConditionId:
        validation.sourceConditionId,

      moldTemperature:
        validation.oldMoldTemperature

    },

    proposedState: {

      moldTemperature:
        validation.newMoldTemperature

    },

    changeReason:
      changeReason,

    confirmation: {

      title:
        "金型温度の変更",

      message:
        UpdateRequestEngine_buildMoldTemperatureConfirmationMessage(
          validation
        ),

      confirmLabel:
        "この内容で確定",

      cancelLabel:
        "キャンセル"

    }

  };


  /*
  =========================================
  一時保存
  =========================================
  */

  UpdateRequestEngine_save(
    updateRequest
  );


  /*
  =========================================
  フロントエンドへ返す情報
  =========================================

  sourceConditionやconditionDetailなど、
  内部データ全体は返さない。

  確認画面に必要な情報だけを返す。
  */

  return {

    status:
      "success",

    action:
      "createUpdateProposal",

    requiresConfirmation:
      true,

    requestId:
      requestId,

    requestType:
      updateRequest.requestType,

    expiresAt:
      updateRequest.expiresAt,

    productId:
      validation.productId,

    productName:
      validation.productName,

    drawingNumber:
      validation.drawingNumber,

    currentConditionId:
      validation.sourceConditionId,

    oldMoldTemperature:
      validation.oldMoldTemperature,

    newMoldTemperature:
      validation.newMoldTemperature,

    changeReason:
      changeReason,

    confirmation:
      updateRequest.confirmation

  };

}


/**
 * 金型温度変更の確認メッセージを作る
 *
 * @param {Object} validation
 * @return {string}
 */
function UpdateRequestEngine_buildMoldTemperatureConfirmationMessage(
  validation
) {

  const productLabel =
    validation.productName
      ? validation.productName
      : validation.productId;

  let message =
    productLabel +
    "の金型温度を、" +
    validation.oldMoldTemperature +
    "℃から" +
    validation.newMoldTemperature +
    "℃へ変更します。";

  if (
    validation.drawingNumber
  ) {

    message +=
      "\n図番：" +
      validation.drawingNumber;

  }

  message +=
    "\nこの内容で確定しますか？";

  return message;

}



/*
=========================================
更新案の取得
=========================================
*/

/**
 * 保存済みの更新案を取得する
 *
 * @param {string} requestId
 * @return {Object}
 */
function UpdateRequestEngine_get(
  requestId
) {

  const normalizedRequestId =
    String(
      requestId || ""
    ).trim();

  if (!normalizedRequestId) {

    throw new Error(
      "更新案IDがありません。"
    );

  }

  const cacheKey =
    UpdateRequestEngine_buildCacheKey(
      normalizedRequestId
    );

  const serialized =
    CacheService
      .getScriptCache()
      .get(
        cacheKey
      );

  if (!serialized) {

    throw new Error(
      "更新案が見つからないか、有効期限が切れています。もう一度変更内容を入力してください。"
    );

  }

  let updateRequest;

  try {

    updateRequest =
      JSON.parse(
        serialized
      );

  } catch (error) {

    throw new Error(
      "保存されている更新案を読み取れませんでした。"
    );

  }

  if (
    !updateRequest ||
    typeof updateRequest !==
      "object"
  ) {

    throw new Error(
      "保存されている更新案の形式が正しくありません。"
    );

  }

  const storedRequestId =
    String(
      updateRequest.requestId || ""
    ).trim();

  if (
    storedRequestId !==
    normalizedRequestId
  ) {

    throw new Error(
      "保存されている更新案IDが一致しません。"
    );

  }

  return updateRequest;

}



/**
 * 更新案の有効期限を確認する
 *
 * @param {Object} updateRequest
 * @return {Object}
 */
function UpdateRequestEngine_validateExpiration(
  updateRequest
) {

  if (
    !updateRequest ||
    typeof updateRequest !==
      "object"
  ) {

    throw new Error(
      "確認する更新案がありません。"
    );

  }

  const expiresAtText =
    String(
      updateRequest.expiresAt || ""
    ).trim();

  if (!expiresAtText) {

    throw new Error(
      "更新案に有効期限がありません。"
    );

  }

  const expiresAt =
    new Date(
      expiresAtText
    );

  if (
    Number.isNaN(
      expiresAt.getTime()
    )
  ) {

    throw new Error(
      "更新案の有効期限が正しくありません。"
    );

  }

  const now =
    new Date();

  if (
    now.getTime() >=
    expiresAt.getTime()
  ) {

    throw new Error(
      "更新案の有効期限が切れています。もう一度変更内容を入力してください。"
    );

  }

  return {

    status:
      "success",

    expiresAt:
      expiresAt.toISOString(),

    remainingSeconds:
      Math.max(
        0,
        Math.floor(
          (
            expiresAt.getTime() -
            now.getTime()
          ) /
          1000
        )
      )

  };

}


/**
 * 更新案が確定待ち状態であることを確認する
 *
 * @param {Object} updateRequest
 * @return {Object}
 */
function UpdateRequestEngine_validatePendingStatus(
  updateRequest
) {

  if (
    !updateRequest ||
    typeof updateRequest !==
      "object"
  ) {

    throw new Error(
      "確認する更新案がありません。"
    );

  }

  const requestStatus =
    String(
      updateRequest.status || ""
    ).trim();

  if (
    requestStatus !==
    "PENDING"
  ) {

    if (
      requestStatus ===
      "CONFIRMED"
    ) {

      throw new Error(
        "この更新案はすでに確定されています。"
      );

    }

    if (
      requestStatus ===
      "CANCELLED"
    ) {

      throw new Error(
        "この更新案はキャンセルされています。"
      );

    }

    throw new Error(
      "この更新案は確定できる状態ではありません。"
    );

  }

  return {

    status:
      "success",

    requestStatus:
      requestStatus

  };

}


/**
 * 更新案を作成したユーザー本人か確認する
 *
 * @param {Object} updateRequest
 * @param {Object} user
 * @return {Object}
 */
function UpdateRequestEngine_validateRequester(
  updateRequest,
  user
) {

  if (
    !updateRequest ||
    typeof updateRequest !==
      "object"
  ) {

    throw new Error(
      "確認する更新案がありません。"
    );

  }

  if (
    !user ||
    !user.userId
  ) {

    throw new Error(
      "現在のユーザー情報がありません。"
    );

  }

  const requestedByUserId =
    String(
      updateRequest
        .requestedBy &&
      updateRequest
        .requestedBy
        .userId
        ? updateRequest
            .requestedBy
            .userId
        : ""
    ).trim();

  const currentUserId =
    String(
      user.userId || ""
    ).trim();

  if (!requestedByUserId) {

    throw new Error(
      "更新案に作成者情報がありません。"
    );

  }

  if (!currentUserId) {

    throw new Error(
      "現在のユーザーIDがありません。"
    );

  }

  if (
    requestedByUserId !==
    currentUserId
  ) {

    throw new Error(
      "この更新案は別のユーザーが作成したため、確定できません。"
    );

  }

  return {

    status:
      "success",

    userId:
      currentUserId

  };

}



/*
=========================================
更新案の状態変更
=========================================
*/

/**
 * 更新案の状態を変更して再保存する
 *
 * @param {Object} updateRequest
 * @param {string} newStatus
 * @param {string=} expectedCurrentStatus
 * @return {Object}
 */
function UpdateRequestEngine_updateStatus(
  updateRequest,
  newStatus,
  expectedCurrentStatus
) {

  if (
    !updateRequest ||
    typeof updateRequest !==
      "object"
  ) {

    throw new Error(
      "状態を変更する更新案がありません。"
    );

  }

  const requestId =
    String(
      updateRequest.requestId || ""
    ).trim();

  if (!requestId) {

    throw new Error(
      "更新案IDがありません。"
    );

  }

  const normalizedNewStatus =
    String(
      newStatus || ""
    ).trim();

  const normalizedExpectedStatus =
    expectedCurrentStatus ===
    undefined
      ? null
      : String(
          expectedCurrentStatus || ""
        ).trim();

  const allowedStatuses = [
    "PENDING",
    "PROCESSING",
    "CONFIRMED",
    "CANCELLED",
    "FAILED"
  ];

  if (
    !allowedStatuses.includes(
      normalizedNewStatus
    )
  ) {

    throw new Error(
      "更新案の状態が正しくありません。"
    );

  }

  const currentStatus =
    String(
      updateRequest.status || ""
    ).trim();

  if (
    normalizedExpectedStatus !== null &&
    currentStatus !== normalizedExpectedStatus
  ) {

    throw new Error(
      "更新案の状態が想定した状態から変更されています。"
    );

  }

  const now =
    new Date();

  updateRequest.status =
    normalizedNewStatus;

  updateRequest.updatedAt =
    now.toISOString();

  switch (
    normalizedNewStatus
  ) {

    case "PROCESSING":

      updateRequest.processingAt =
        now.toISOString();

      break;

    case "CONFIRMED":

      updateRequest.confirmedAt =
        now.toISOString();

      break;

    case "CANCELLED":

      updateRequest.cancelledAt =
        now.toISOString();

      break;

    case "FAILED":

      updateRequest.failedAt =
        now.toISOString();

      break;

  }

  UpdateRequestEngine_save(
    updateRequest
  );

  return {

    status:
      "success",

    requestId:
      requestId,

    oldStatus:
      currentStatus,

    newStatus:
      normalizedNewStatus,

    updatedAt:
      updateRequest.updatedAt

  };

}



/**
 * 更新案を失敗状態にし、エラー情報を保存する
 *
 * @param {Object} updateRequest
 * @param {*} error
 * @return {Object}
 */
function UpdateRequestEngine_markFailed(
  updateRequest,
  error
) {

  if (
    !updateRequest ||
    typeof updateRequest !==
      "object"
  ) {

    throw new Error(
      "失敗状態にする更新案がありません。"
    );

  }

  const errorMessage =
    error &&
    error.message
      ? String(
          error.message
        )
      : String(
          error ||
          "更新処理に失敗しました。"
        );

  updateRequest.failure = {

    message:
      errorMessage,

    recordedAt:
      new Date().toISOString()

  };

  return UpdateRequestEngine_updateStatus(
    updateRequest,
    "FAILED"
  );

}



/*
=========================================
更新案の確定
=========================================
*/

/**
 * 保存済みの更新案を確定する
 *
 * @param {string} requestId
 * @param {Object} user
 * @return {Object}
 */
function UpdateRequestEngine_confirm(
  requestId,
  user
) {

  const normalizedRequestId =
    String(
      requestId || ""
    ).trim();

  if (!normalizedRequestId) {

    throw new Error(
      "更新案IDがありません。"
    );

  }

  if (
    !user ||
    !user.userId
  ) {

    throw new Error(
      "現在のユーザー情報がありません。"
    );

  }


  /*
  =========================================
  更新案をPROCESSINGへ移す
  =========================================

  同じ確定ボタンが連続して押された場合でも、
  二重更新されないようにする。

  ここではScriptLockを取得するが、
  ConditionUpdateEngineの実行前に必ず解放する。

  ConditionUpdateEngine側もScriptLockを使用するため、
  ロックを保持したまま呼び出すと
  二重ロックになる可能性がある。
  */

  const requestLock =
    LockService.getScriptLock();

  let requestLockAcquired =
    false;

  let updateRequest =
    null;

  try {

    requestLock.waitLock(
      30000
    );

    requestLockAcquired =
      true;


    /*
    保存済み更新案を取得
    */

    updateRequest =
      UpdateRequestEngine_get(
        normalizedRequestId
      );


    /*
    有効期限を確認
    */

    UpdateRequestEngine_validateExpiration(
      updateRequest
    );


    /*
    更新案を作成した本人か確認
    */

    UpdateRequestEngine_validateRequester(
      updateRequest,
      user
    );


    /*
    PENDING状態であることを確認
    */

    UpdateRequestEngine_validatePendingStatus(
      updateRequest
    );


    /*
    更新案の種類を確認
    */

    const requestType =
      String(
        updateRequest.requestType || ""
      ).trim();

    if (
      requestType !==
      "MOLD_TEMPERATURE_UPDATE"
    ) {

      throw new Error(
        "この更新案の種類には対応していません。"
      );

    }


    /*
    更新に必要な内容を確認
    */

    const productId =
      String(
        updateRequest.target &&
        updateRequest.target.productId
          ? updateRequest.target.productId
          : ""
      ).trim();

    const expectedCurrentConditionId =
      String(
        updateRequest.expectedState &&
        updateRequest
          .expectedState
          .currentConditionId
          ? updateRequest
              .expectedState
              .currentConditionId
          : ""
      ).trim();

    const newMoldTemperature =
      updateRequest.proposedState
        ? updateRequest
            .proposedState
            .moldTemperature
        : undefined;

    if (!productId) {

      throw new Error(
        "更新案に対象製品IDがありません。"
      );

    }

    if (!expectedCurrentConditionId) {

      throw new Error(
        "更新案に現在標準条件IDがありません。"
      );

    }

    const numericMoldTemperature =
      Number(
        newMoldTemperature
      );

    if (
      !Number.isFinite(
        numericMoldTemperature
      )
    ) {

      throw new Error(
        "更新案の金型温度が数値ではありません。"
      );

    }


    /*
    PENDINGからPROCESSINGへ変更
    */

    UpdateRequestEngine_updateStatus(
      updateRequest,
      "PROCESSING",
      "PENDING"
    );

  } finally {

    if (
      requestLockAcquired
    ) {

      requestLock.releaseLock();

    }

  }


  /*
  =========================================
  マスターデータの更新
  =========================================

  上のScriptLockはすでに解放している。

  ConditionUpdateEngine内で、
  改めてScriptLockを取得して更新する。
  */

  let executionResult;

  try {

    const productId =
      String(
        updateRequest.target.productId
      ).trim();

    const expectedCurrentConditionId =
      String(
        updateRequest
          .expectedState
          .currentConditionId
      ).trim();

    const newMoldTemperature =
      Number(
        updateRequest
          .proposedState
          .moldTemperature
      );

    executionResult =
      ConditionUpdateEngine_executeMoldTemperatureUpdate(
        productId,
        expectedCurrentConditionId,
        newMoldTemperature,
        user
      );

  } catch (error) {

    /*
    =========================================
    更新失敗を記録
    =========================================

    マスターデータ側のロールバックは、
    ConditionUpdateEngine内部で実行される。
    */

    let statusUpdateError =
      null;

    try {

      UpdateRequestEngine_markFailed(
        updateRequest,
        error
      );

    } catch (
      markFailedError
    ) {

      statusUpdateError =
        markFailedError;

    }

    const originalMessage =
      error &&
      error.message
        ? String(
            error.message
          )
        : "金型温度の更新に失敗しました。";

    if (
      statusUpdateError
    ) {

      throw new Error(
        originalMessage +
        "\n更新案の失敗状態も保存できませんでした：" +
        (
          statusUpdateError.message ||
          String(
            statusUpdateError
          )
        )
      );

    }

    throw new Error(
      originalMessage
    );

  }


  /*
  =========================================
  更新結果を更新案へ保存
  =========================================
  */

  updateRequest.result = {

    productId:
      executionResult.productId,

    productName:
      executionResult.productName,

    drawingNumber:
      executionResult.drawingNumber,

    oldConditionId:
      executionResult.oldConditionId,

    newConditionId:
      executionResult.newConditionId,

    oldMoldTemperature:
      executionResult.oldMoldTemperature,

    newMoldTemperature:
      executionResult.newMoldTemperature,

    version:
      executionResult.version,

    changedBy:
      executionResult.changedBy,

    changeReason:
      executionResult.changeReason,

    completedAt:
      new Date().toISOString()

  };


  /*
  =========================================
  CONFIRMED状態を保存
  =========================================

  マスター更新はすでに成功している。

  そのため、ここでキャッシュ保存だけが失敗しても、
  更新処理そのものをFAILEDにはしない。
  */

  let confirmationStatusSaved =
    true;

  let confirmationStatusWarning =
    "";

  try {

    UpdateRequestEngine_updateStatus(
      updateRequest,
      "CONFIRMED",
      "PROCESSING"
    );

  } catch (error) {

    confirmationStatusSaved =
      false;

    confirmationStatusWarning =
      error &&
      error.message
        ? String(
            error.message
          )
        : String(
            error
          );

  }


  /*
  =========================================
  正常終了
  =========================================
  */

  return {

    status:
      "success",

    action:
      "confirmUpdateRequest",

    requestId:
      normalizedRequestId,

    requestType:
      updateRequest.requestType,

    message:
      executionResult.message,

    productId:
      executionResult.productId,

    productName:
      executionResult.productName,

    drawingNumber:
      executionResult.drawingNumber,

    oldConditionId:
      executionResult.oldConditionId,

    newConditionId:
      executionResult.newConditionId,

    oldMoldTemperature:
      executionResult.oldMoldTemperature,

    newMoldTemperature:
      executionResult.newMoldTemperature,

    version:
      executionResult.version,

    changedBy:
      executionResult.changedBy,

    changeReason:
      executionResult.changeReason,

    requestStatus:
      confirmationStatusSaved
        ? "CONFIRMED"
        : "PROCESSING",

    statusPersistenceWarning:
      confirmationStatusWarning

  };

}



/*
=========================================
更新案のキャンセル
=========================================
*/

/**
 * 保存済みの更新案をキャンセルする
 *
 * マスターデータの更新は行わない。
 *
 * @param {string} requestId
 * @param {Object} user
 * @return {Object}
 */
function UpdateRequestEngine_cancel(
  requestId,
  user
) {

  const normalizedRequestId =
    String(
      requestId || ""
    ).trim();

  if (!normalizedRequestId) {

    throw new Error(
      "更新案IDがありません。"
    );

  }

  if (
    !user ||
    !user.userId
  ) {

    throw new Error(
      "現在のユーザー情報がありません。"
    );

  }

  const lock =
    LockService.getScriptLock();

  let lockAcquired =
    false;

  try {

    /*
    =========================================
    排他ロック
    =========================================
    */

    lock.waitLock(
      30000
    );

    lockAcquired =
      true;


    /*
    =========================================
    更新案を取得
    =========================================
    */

    const updateRequest =
      UpdateRequestEngine_get(
        normalizedRequestId
      );


    /*
    =========================================
    更新案を作成した本人か確認
    =========================================
    */

    UpdateRequestEngine_validateRequester(
      updateRequest,
      user
    );


    /*
    =========================================
    PENDING状態であることを確認
    =========================================

    キャンセルできるのは、
    まだ確定処理を開始していない更新案だけ。
    */

    UpdateRequestEngine_validatePendingStatus(
      updateRequest
    );


    /*
    =========================================
    有効期限の扱い
    =========================================

    キャンセルでは、
    有効期限切れでもマスター更新は起こらない。

    ただし、すでにCacheServiceから消えている場合は、
    UpdateRequestEngine_get()の時点で取得できない。

    キャッシュ内に残っている更新案については、
    明示的にCANCELLEDへ変更できる。
    */


    /*
    =========================================
    更新案の種類を確認
    =========================================
    */

    const requestType =
      String(
        updateRequest.requestType || ""
      ).trim();

    if (!requestType) {

      throw new Error(
        "更新案の種類がありません。"
      );

    }


    /*
    =========================================
    CANCELLEDへ変更
    =========================================
    */

    UpdateRequestEngine_updateStatus(
      updateRequest,
      "CANCELLED",
      "PENDING"
    );


    /*
    =========================================
    正常終了
    =========================================
    */

    return {

      status:
        "success",

      action:
        "cancelUpdateRequest",

      requestId:
        normalizedRequestId,

      requestType:
        requestType,

      requestStatus:
        "CANCELLED",

      message:
        "変更をキャンセルしました。",

      productId:
        updateRequest.target &&
        updateRequest.target.productId
          ? String(
              updateRequest
                .target
                .productId
            ).trim()
          : "",

      productName:
        updateRequest.target &&
        updateRequest.target.productName
          ? String(
              updateRequest
                .target
                .productName
            ).trim()
          : "",

      drawingNumber:
        updateRequest.target &&
        updateRequest.target.drawingNumber
          ? String(
              updateRequest
                .target
                .drawingNumber
            ).trim()
          : "",

      oldMoldTemperature:
        updateRequest.expectedState &&
        updateRequest
          .expectedState
          .moldTemperature !==
            undefined
          ? updateRequest
              .expectedState
              .moldTemperature
          : "",

      newMoldTemperature:
        updateRequest.proposedState &&
        updateRequest
          .proposedState
          .moldTemperature !==
            undefined
          ? updateRequest
              .proposedState
              .moldTemperature
          : ""

    };

  } finally {

    if (
      lockAcquired
    ) {

      lock.releaseLock();

    }

  }

}







