/*
=========================================
SHiCI
30_AuthenticationEngine.js

役割：
・Google IDトークンの検証
・認証済みユーザー情報の取得
=========================================
*/


function AuthenticationEngine_verifyGoogleToken(
  idToken
) {

  const normalizedToken =
    String(idToken || "").trim();

  if (!normalizedToken) {

    throw new Error(
      "Google IDトークンがありません。"
    );

  }

  const clientId =
    Config_getGoogleClientId();

  const response =
    UrlFetchApp.fetch(

      "https://oauth2.googleapis.com/tokeninfo?id_token=" +
      encodeURIComponent(
        normalizedToken
      ),

      {
        muteHttpExceptions: true
      }

    );

  if (
    response.getResponseCode() !== 200
  ) {

    Logger.log(
      "Google認証エラー: " +
      response.getContentText()
    );

    throw new Error(
      "Google認証に失敗しました。"
    );

  }

  const payload =
    JSON.parse(
      response.getContentText()
    );

  if (!payload.email) {

    throw new Error(
      "Googleアカウント情報を取得できませんでした。"
    );

  }

  if (
    payload.aud !==
    clientId
  ) {

    throw new Error(
      "Google Client IDが一致しません。"
    );

  }

  return payload;

}



function AuthenticationEngine_login(
    idToken
) {

    const payload =
        AuthenticationEngine_verifyGoogleToken(
            idToken
        );

    let user =
        UserEngine_findByEmail(
            payload.email
        );

    if (!user) {

        user =
            UserEngine_createUser(
                payload.email,
                payload.name,
                payload.given_name || ""
            );

            }

            if (
                !UserEngine_canLogin(user)
            ) {

                throw new Error(
                    "このユーザーは承認待ちです。"
                );

    }

    const session =
        SessionEngine_createSession(
            user.userId
        );

    return {

        status: "success",

        sessionId:
            session.sessionId,

        user

    };

}

