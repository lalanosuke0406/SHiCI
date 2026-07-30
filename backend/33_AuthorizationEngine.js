/*
=========================================
SHiCI
33_AuthorizationEngine.js

役割：
・認証済みユーザーの取得
・ユーザー状態の確認
・書き込み権限の確認
=========================================
*/


/**
 * セッションから認証済みユーザーを取得する
 */
function AuthorizationEngine_getAuthenticatedUser(
  sessionId
) {

  const normalizedSessionId =
    String(
      sessionId || ""
    ).trim();

  if (!normalizedSessionId) {

    throw new Error(
      "セッションIDがありません。"
    );

  }

  const session =
    SessionEngine_getSession(
      normalizedSessionId
    );

  if (!session) {

    throw new Error(
      "セッションが無効です。再度ログインしてください。"
    );

  }

  if (
    session.status !==
    "ACTIVE"
  ) {

    throw new Error(
      "セッションが無効です。再度ログインしてください。"
    );

  }

  if (
    Date.now() >
    Number(
      session.expiresAt || 0
    )
  ) {

    throw new Error(
      "セッションの有効期限が切れています。再度ログインしてください。"
    );

  }

  const user =
    UserEngine_findById(
      session.userId
    );

  if (!user) {

    throw new Error(
      "ユーザー情報が見つかりません。"
    );

  }

  const status =
    String(
      user.status || ""
    )
      .trim()
      .toUpperCase();

  if (
    status !==
    "ACTIVE"
  ) {

    throw new Error(
      "このユーザーは現在利用できません。"
    );

  }

  return user;

}


/**
 * C・U操作が可能なユーザーか確認する
 */
function AuthorizationEngine_requireWritePermission(
  sessionId
) {

  const user =
    AuthorizationEngine_getAuthenticatedUser(
      sessionId
    );

  const role =
    String(
      user.role || ""
    )
      .trim()
      .toUpperCase();

  const writableRoles = [
    "EDITOR",
    "ADMIN"
  ];

  if (
    !writableRoles.includes(
      role
    )
  ) {

    throw new Error(
      "この操作を行う権限がありません。"
    );

  }

  return user;

}