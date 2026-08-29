/*
=========================================
SHiCI
83_ExecutiveMessageSessionEngine.js

Executive Message Session Engine
Version 1.0

役割：
・役員メッセージ入口の合言葉Challenge
・通常Sessionとは独立した短時間Sessionの管理
=========================================
*/

const EXECUTIVE_MESSAGE_CHALLENGE_PREFIX =
  "EXECUTIVE_MESSAGE_CHALLENGE:";

const EXECUTIVE_MESSAGE_SESSION_PREFIX =
  "EXECUTIVE_MESSAGE_SESSION:";

const EXECUTIVE_MESSAGE_CHALLENGE_TTL_SECONDS =
  90;

const EXECUTIVE_MESSAGE_SESSION_TTL_SECONDS =
  900;

function ExecutiveMessageSessionEngine_tryHandleChat(
  sessionId,
  text
) {

  const normalizedText =
    String(text || "").trim();

  if (!normalizedText) {
    return null;
  }

  const challenge =
    ExecutiveMessageSessionEngine_getChallenge(
      sessionId
    );

  if (challenge) {

    return ExecutiveMessageSessionEngine_handleChallengeResponse(
      sessionId,
      normalizedText,
      challenge
    );

  }

  if (
    !ExecutiveMessageSessionEngine_secretMatches(
      normalizedText,
      Config_getExecutiveMessageTrigger()
    )
  ) {
    return null;
  }

  const user =
    AuthorizationEngine_getAuthenticatedUser(
      sessionId
    );

  if (
    !ExecutiveMessageSessionEngine_isAuthorizedUser(
      user
    )
  ) {

    return null;

  }

  const now = Date.now();

  const challengeState = {

    userId:
      user.userId,

    normalSessionId:
      String(sessionId || "").trim(),

    createdAt:
      now,

    expiresAt:
      now +
      EXECUTIVE_MESSAGE_CHALLENGE_TTL_SECONDS *
      1000

  };

  CacheService
    .getScriptCache()
    .put(
      EXECUTIVE_MESSAGE_CHALLENGE_PREFIX +
        String(sessionId || "").trim(),
      JSON.stringify(
        challengeState
      ),
      EXECUTIVE_MESSAGE_CHALLENGE_TTL_SECONDS
    );

  return {

    status:
      "success",

    messageType:
      "executive_challenge",

    answer:
      Config_getExecutiveMessageChallenge(),

    expiresInSeconds:
      EXECUTIVE_MESSAGE_CHALLENGE_TTL_SECONDS

  };

}

function ExecutiveMessageSessionEngine_handleChallengeResponse(
  sessionId,
  text,
  challenge
) {

  ExecutiveMessageSessionEngine_deleteChallenge(
    sessionId
  );

  const user =
    AuthorizationEngine_getAuthenticatedUser(
      sessionId
    );

  if (
    !challenge ||
    challenge.userId !==
      user.userId ||
    challenge.normalSessionId !==
      String(sessionId || "").trim() ||
    Date.now() >
      Number(
        challenge.expiresAt || 0
      ) ||
    !ExecutiveMessageSessionEngine_isAuthorizedUser(
      user
    ) ||
    !ExecutiveMessageSessionEngine_secretMatches(
      text,
      Config_getExecutiveMessageResponse()
    )
  ) {

    return {

      status:
        "error",

      messageType:
        "executive_challenge_failed",

      answer:
        "確認できませんでした。"

    };

  }

  const executiveSession =
    ExecutiveMessageSessionEngine_createExecutiveSession(
      sessionId,
      user.userId
    );

  return {

    status:
      "success",

    messageType:
      "executive_message_unlocked",

    executiveSessionToken:
      executiveSession.token,

    expiresAt:
      executiveSession.expiresAt,

    peers:
      ExecutiveMessageService_listPeersForUser(
        user
      )

  };

}

function ExecutiveMessageSessionEngine_createExecutiveSession(
  normalSessionId,
  userId
) {

  const now = Date.now();

  const token =
    Utilities.getUuid();

  const executiveSession = {

    token,

    userId:
      String(userId || "").trim(),

    normalSessionId:
      String(
        normalSessionId || ""
      ).trim(),

    createdAt:
      now,

    expiresAt:
      now +
      EXECUTIVE_MESSAGE_SESSION_TTL_SECONDS *
      1000

  };

  CacheService
    .getScriptCache()
    .put(
      EXECUTIVE_MESSAGE_SESSION_PREFIX +
        token,
      JSON.stringify(
        executiveSession
      ),
      EXECUTIVE_MESSAGE_SESSION_TTL_SECONDS
    );

  return executiveSession;

}

function ExecutiveMessageSessionEngine_requireExecutiveSession(
  normalSessionId,
  executiveSessionToken
) {

  const normalizedToken =
    String(
      executiveSessionToken || ""
    ).trim();

  if (!normalizedToken) {

    throw new Error(
      "役員メッセージSessionがありません。"
    );

  }

  const json =
    CacheService
      .getScriptCache()
      .get(
        EXECUTIVE_MESSAGE_SESSION_PREFIX +
          normalizedToken
      );

  if (!json) {

    throw new Error(
      "役員メッセージSessionが無効です。"
    );

  }

  const executiveSession =
    JSON.parse(
      json
    );

  const user =
    AuthorizationEngine_getAuthenticatedUser(
      normalSessionId
    );

  if (
    executiveSession.userId !==
      user.userId ||
    executiveSession.normalSessionId !==
      String(normalSessionId || "").trim() ||
    Date.now() >
      Number(
        executiveSession.expiresAt || 0
      ) ||
    !ExecutiveMessageSessionEngine_isAuthorizedUser(
      user
    )
  ) {

    ExecutiveMessageSessionEngine_deleteExecutiveSession(
      normalizedToken
    );

    throw new Error(
      "役員メッセージSessionが無効です。"
    );

  }

  return {
    session:
      executiveSession,
    user
  };

}

function ExecutiveMessageSessionEngine_deleteExecutiveSession(
  executiveSessionToken
) {

  const normalizedToken =
    String(
      executiveSessionToken || ""
    ).trim();

  if (!normalizedToken) {
    return;
  }

  CacheService
    .getScriptCache()
    .remove(
      EXECUTIVE_MESSAGE_SESSION_PREFIX +
        normalizedToken
    );

}

function ExecutiveMessageSessionEngine_deleteChallenge(
  sessionId
) {

  CacheService
    .getScriptCache()
    .remove(
      EXECUTIVE_MESSAGE_CHALLENGE_PREFIX +
        String(sessionId || "").trim()
    );

}

function ExecutiveMessageSessionEngine_getChallenge(
  sessionId
) {

  const json =
    CacheService
      .getScriptCache()
      .get(
        EXECUTIVE_MESSAGE_CHALLENGE_PREFIX +
          String(sessionId || "").trim()
      );

  if (!json) {
    return null;
  }

  const challenge =
    JSON.parse(
      json
    );

  if (
    Date.now() >
      Number(
        challenge.expiresAt || 0
      )
  ) {

    ExecutiveMessageSessionEngine_deleteChallenge(
      sessionId
    );

    return null;

  }

  return challenge;

}

function ExecutiveMessageSessionEngine_isAuthorizedUser(
  user
) {

  if (
    !user ||
    !user.email
  ) {
    return false;
  }

  const access =
    ExecutiveMessageRepository_findAccessByEmail(
      user.email
    );

  return !!(
    access &&
    access.status ===
      "ACTIVE"
  );

}

function ExecutiveMessageSessionEngine_secretMatches(
  actual,
  expected
) {

  return (
    String(actual || "").trim() ===
    String(expected || "").trim()
  );

}
