/*
=========================================
SHiCI
85_ExecutivePushService.js

Executive Push Service
Version 1.0

役割：
・Cloudflare Push Workerへ通知要求を送る
・通知本文は送らない
・Push失敗でメッセージ送信を失敗させない
=========================================
*/


/**
 * 指定Push Subscriptionへ通知要求を送る。
 *
 * @param {Object} subscription
 * @return {Object}
 */
function ExecutivePushService_send(
  subscription
) {

  const workerUrl =
    Config_getExecutivePushWorkerUrl();

  const sharedSecret =
    Config_getExecutivePushSharedSecret();


  const payload = {

    subscription: {

      endpoint:
        subscription.endpoint,

      keys: {

        p256dh:
          subscription.p256dh,

        auth:
          subscription.auth

      }

    }

  };


  try {

    const response =
      UrlFetchApp.fetch(
        workerUrl,
        {

          method:
            "post",

          contentType:
            "application/json",

          payload:
            JSON.stringify(
              payload
            ),

          headers: {

            Authorization:
              "Bearer " +
              sharedSecret

          },

          muteHttpExceptions:
            true

        }
      );


    const statusCode =
      response.getResponseCode();


    let body = null;


    try {

      body =
        JSON.parse(
          response.getContentText()
        );

    } catch (error) {

      body =
        null;

    }


    return {

      success:
        statusCode >= 200 &&
        statusCode < 300,

      statusCode:
        statusCode,

      body:
        body

    };

  } catch (error) {

    return {

      success:
        false,

      statusCode:
        null,

      body:
        null,

      error:
        String(
          error &&
          error.message
            ? error.message
            : error
        )

    };

  }

}


/**
 * 複数Subscriptionへbest-effortで通知する。
 *
 * @param {Array<Object>} subscriptions
 * @return {Array<Object>}
 */
function ExecutivePushService_sendAll(
  subscriptions
) {

  if (
    !Array.isArray(
      subscriptions
    ) ||
    subscriptions.length === 0
  ) {

    return [];

  }


  return subscriptions.map(
    function(subscription) {

      return ExecutivePushService_send(
        subscription
      );

    }
  );

}