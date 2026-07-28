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

}


