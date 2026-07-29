/*
=========================================
SHiCI
31_SessionEngine.js

役割：
・セッション管理
=========================================
*/


function SessionEngine_createSession(
    userId
) {

    const session =
        SessionEntity_create(
            userId
        );

    CacheService
        .getScriptCache()
        .put(
            session.sessionId,
            JSON.stringify(session),
            21600
        );

    return session;

}



function SessionEngine_getSession(
  sessionId
) {

  const cache =
    CacheService.getScriptCache();

  const json =
    cache.get(sessionId);

  if (!json) {

    return null;

  }

  return JSON.parse(
    json
  );

}




function SessionEngine_deleteSession(
  sessionId
) {

}




function SessionEngine_isSessionValid(
  sessionId
) {

  const session =
    SessionEngine_getSession(
      sessionId
    );

  if (!session) {

    return false;

  }

  if (
    session.status !==
    "ACTIVE"
  ) {

    return false;

  }

  if (
    Date.now() >
    session.expiresAt
  ) {

    return false;

  }

  return true;

}



