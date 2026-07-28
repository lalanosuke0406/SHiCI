/*
=========================================
SHiCI
32_UserEngine.js

役割：
・ユーザー管理
=========================================
*/


function UserEngine_findByEmail(
  email
) {

  return UserAdapter_findByEmail(
    email
  );

}


function UserEngine_createUser(
  email,
  name,
  nickName
) {

  const user =
    UserEntity_create(
      email,
      name,
      nickName
    );

  UserAdapter_insert(
    user
  );

  return user;

}




function UserEngine_canLogin(
  user
) {

  if (!user) {

    return false;

  }

  return (
    user.status ===
    "ACTIVE"
  );

}