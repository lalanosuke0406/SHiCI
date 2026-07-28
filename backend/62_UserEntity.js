/*
=========================================
SHiCI
62_UserEntity.js

役割：
・User Entity生成
=========================================
*/

function UserEntity_create(
  email,
  name,
  nickName
) {

  const now =
    Date.now();

  return {

    userId:
      Utilities.getUuid(),

    email:
      String(email).trim(),

    name:
      String(name).trim(),

    nickName:
      String(
        nickName || ""
      ).trim(),

    role:
      "USER",

    status:
      "PENDING",

    createdAt:
      now,

    lastLoginAt:
      null

  };

}


