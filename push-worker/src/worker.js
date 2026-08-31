import {
  sendNotification
} from "web-push-neo";


export default {

  async fetch(
    request,
    env
  ) {

    if (
      request.method !==
        "POST"
    ) {

      return new Response(
        "Not Found",
        {
          status:
            404
        }
      );

    }


    const authHeader =
      String(
        request.headers.get(
          "Authorization"
        ) || ""
      );


    const expectedAuth =
      "Bearer " +
      env.SHICI_PUSH_SHARED_SECRET;


    if (
      authHeader !==
        expectedAuth
    ) {

      return Response.json(
        {
          status:
            "unauthorized"
        },
        {
          status:
            401
        }
      );

    }


    let body;


    try {

      body =
        await request.json();

    } catch (error) {

      return Response.json(
        {
          status:
            "invalid_json"
        },
        {
          status:
            400
        }
      );

    }


    const subscription =
      body &&
      body.subscription;


    if (
      !subscription ||
      !subscription.endpoint ||
      !subscription.keys ||
      !subscription.keys.p256dh ||
      !subscription.keys.auth
    ) {

      return Response.json(
        {
          status:
            "invalid_subscription"
        },
        {
          status:
            400
        }
      );

    }


    const payload =
      JSON.stringify(
        {
          type:
            "shici_update",

          title:
            "SHiCI",

          body:
            "確認事項があります"
        }
      );


    try {

      const result =
        await sendNotification(
          subscription,
          payload,
          {

            vapidDetails: {

              subject:
                env.VAPID_SUBJECT,

              publicKey:
                env.VAPID_PUBLIC_KEY,

              privateKey:
                env.VAPID_PRIVATE_KEY

            },

            TTL:
              300,

            urgency:
              "high"

          }
        );


      return Response.json(
        {
          status:
            "success",

          pushStatus:
            result.statusCode
        }
      );

    } catch (error) {

      const statusCode =
        error &&
        error.statusCode
          ? Number(
              error.statusCode
            )
          : 500;


      return Response.json(
        {
          status:
            "push_failed",

          pushStatus:
            statusCode

        },
        {
          status:
            statusCode >= 400 &&
            statusCode <= 599
              ? statusCode
              : 500
        }
      );

    }

  }

};