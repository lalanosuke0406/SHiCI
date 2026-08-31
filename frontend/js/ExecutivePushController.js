/*
=========================================
SHiCI
ExecutivePushController.js

Executive Push Controller
Version 1.0

役割：
・Service Worker登録
・役員本人操作による通知許可
・Push Subscription生成
・BackendへのSubscription登録／解除
・役員Session Tokenを秘密画面表示中だけ保持
=========================================
*/


let executivePushRegistration =
  null;

let executivePushSessionToken =
  null;

let executivePushButton =
  null;


/**
 * Push機能を初期化する。
 *
 * この時点では通知許可を要求しない。
 */
async function initializeExecutivePush() {

  executivePushButton =
    document.getElementById(
      "executivePushButton"
    );


  if (
    executivePushButton
  ) {

    executivePushButton.addEventListener(
      "click",
      ExecutivePushController_handleButtonClick
    );

  }

  if (
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {

    return;

  }


  try {

    executivePushRegistration =
      await navigator.serviceWorker.register(
        "./sw.js"
      );

  } catch (error) {

    executivePushRegistration =
      null;

  }

}


/**
 * 役員Session Tokenを設定する。
 *
 * @param {string} executiveSessionToken
 */
function ExecutivePushController_setSessionToken(
  executiveSessionToken
) {

  executivePushSessionToken =
    String(
      executiveSessionToken || ""
    ).trim();

}


/**
 * 役員Session Tokenを破棄する。
 */
function ExecutivePushController_clearSessionToken() {

  executivePushSessionToken =
    null;

}


/**
 * Push通知を有効にする。
 *
 * 必ずユーザー操作（button click等）から呼び出す。
 *
 * @return {Object}
 */
async function ExecutivePushController_enable() {

  if (
    !executivePushSessionToken
  ) {

    throw new Error(
      "Executive session is not available."
    );

  }


  if (
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {

    throw new Error(
      "Push notification is not supported."
    );

  }


  if (
    !executivePushRegistration
  ) {

    executivePushRegistration =
      await navigator.serviceWorker.register(
        "./sw.js"
      );

  }


  const permission =
    await Notification.requestPermission();


  if (
    permission !==
      "granted"
  ) {

    return {

      status:
        "permission_denied"

    };

  }


  const configuration =
    await getExecutivePushConfiguration(
      executivePushSessionToken
    );


  if (
    !configuration ||
    configuration.status !==
      "success" ||
    !configuration.vapidPublicKey
  ) {

    throw new Error(
      "VAPID public key could not be loaded."
    );

  }


  let subscription =
    await executivePushRegistration
      .pushManager
      .getSubscription();


  if (
    !subscription
  ) {

    subscription =
      await executivePushRegistration
        .pushManager
        .subscribe(
          {

            userVisibleOnly:
              true,

            applicationServerKey:
              ExecutivePushController_urlBase64ToUint8Array(
                configuration.vapidPublicKey
              )

          }
        );

  }


  const subscriptionJson =
    subscription.toJSON();


  const result =
    await registerExecutivePushSubscription(
      executivePushSessionToken,
      subscriptionJson
    );


  return result;

}


/**
 * Push通知を停止する。
 *
 * @return {Object}
 */
async function ExecutivePushController_disable() {

  if (
    !executivePushSessionToken
  ) {

    throw new Error(
      "Executive session is not available."
    );

  }


  if (
    !executivePushRegistration
  ) {

    executivePushRegistration =
      await navigator.serviceWorker.ready;

  }


  const subscription =
    await executivePushRegistration
      .pushManager
      .getSubscription();


  if (
    !subscription
  ) {

    return {

      status:
        "success",

      deactivated:
        false

    };

  }


  const endpoint =
    subscription.endpoint;


  /*
   * Backendを先にINACTIVEにする。
   */
  const result =
    await unregisterExecutivePushSubscription(
      executivePushSessionToken,
      endpoint
    );


  /*
   * その後ブラウザ側の購読を解除する。
   */
  await subscription.unsubscribe();


  return result;

}


/**
 * 現在のPush状態を取得する。
 *
 * @return {Object}
 */
async function ExecutivePushController_getStatus() {

  if (
    !("Notification" in window) ||
    !("serviceWorker" in navigator) ||
    !("PushManager" in window)
  ) {

    return {

      supported:
        false,

      permission:
        "unsupported",

      subscribed:
        false

    };

  }


  if (
    !executivePushRegistration
  ) {

    try {

      executivePushRegistration =
        await navigator.serviceWorker.ready;

    } catch (error) {

      return {

        supported:
          true,

        permission:
          Notification.permission,

        subscribed:
          false

      };

    }

  }


  const subscription =
    await executivePushRegistration
      .pushManager
      .getSubscription();


  return {

    supported:
      true,

    permission:
      Notification.permission,

    subscribed:
      !!subscription

  };

}


/**
 * VAPID公開鍵を
 * PushManager.subscribe()用Uint8Arrayへ変換する。
 *
 * @param {string} base64String
 * @return {Uint8Array}
 */
function ExecutivePushController_urlBase64ToUint8Array(
  base64String
) {

  const padding =
    "=".repeat(
      (
        4 -
        base64String.length % 4
      ) % 4
    );


  const base64 =
    (
      base64String +
      padding
    )
      .replace(
        /-/g,
        "+"
      )
      .replace(
        /_/g,
        "/"
      );


  const rawData =
    window.atob(
      base64
    );


  const outputArray =
    new Uint8Array(
      rawData.length
    );


  for (
    let index = 0;
    index < rawData.length;
    index++
  ) {

    outputArray[index] =
      rawData.charCodeAt(
        index
      );

  }


  return outputArray;

}



/**
 * 通知設定ボタンが押されたときの処理。
 */
async function ExecutivePushController_handleButtonClick() {

  if (
    !executivePushButton ||
    executivePushButton.disabled
  ) {
    return;
  }


  executivePushButton.disabled =
    true;


  try {

    const status =
      await ExecutivePushController_getStatus();


    if (
      !status.supported
    ) {

      executivePushButton.textContent =
        "通知：非対応";

      return;

    }


    if (
      status.subscribed
    ) {

      await ExecutivePushController_disable();

    } else {

      await ExecutivePushController_enable();

    }


    await ExecutivePushController_refreshButton();

  } catch (error) {

    executivePushButton.textContent =
      "通知：エラー";

  } finally {

    executivePushButton.disabled =
      false;

  }

}


/**
 * 現在のPush購読状態をボタンへ反映する。
 */
async function ExecutivePushController_refreshButton() {

  if (
    !executivePushButton
  ) {
    return;
  }


  const status =
    await ExecutivePushController_getStatus();


  if (
    !status.supported
  ) {

    executivePushButton.textContent =
      "通知：非対応";

    return;

  }


  if (
    status.subscribed
  ) {

    executivePushButton.textContent =
      "通知：ON";

    return;

  }


  if (
    status.permission ===
      "denied"
  ) {

    executivePushButton.textContent =
      "通知：拒否";

    return;

  }


  executivePushButton.textContent =
    "通知：OFF";

}