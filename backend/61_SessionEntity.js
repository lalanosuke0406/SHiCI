/*
=========================================
SHiCI
61_SessionEntity.js

役割：
・Session Entity生成
=========================================
*/


function SessionEntity_create(
  userId
) {

  const now =
    Date.now();

  return {

    sessionId:
      Utilities.getUuid(),

    userId:
      userId,

    createdAt:
      now,

    lastAccessAt:
      now,

    expiresAt:
      now + (
        24 * 60 * 60 * 1000
      ),

    status:
      "ACTIVE"

  };

}

