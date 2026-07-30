/*
=========================================
SHiCI
81_UserAdapter.js

役割：
・Usersシートとの入出力
=========================================
*/


function UserAdapter_findByEmail(
  email
) {

  const normalizedEmail =
    String(email || "")
      .trim()
      .toLowerCase();

  if (!normalizedEmail) {

    return null;

  }

  const sheet =
    SpreadsheetApp
        .openById(
            SPREADSHEET_ID
        )
        .getSheetByName(
            "Users"
        );

  if (!sheet) {

    throw new Error(
      "Usersシートがありません。"
    );

  }

  const values =
    sheet
      .getDataRange()
      .getValues();

  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const storedEmail =
      String(values[i][1] || "")
        .trim()
        .toLowerCase();

    if (
      storedEmail ===
      normalizedEmail
    ) {

      return {

        userId:
          values[i][0],

        email:
          values[i][1],

        name:
          values[i][2],

        nickName:
          values[i][3],

        role:
          values[i][4],

        status:
          values[i][5],

        createdAt:
          values[i][6],

        lastLoginAt:
          values[i][7]

      };

    }

  }

  return null;

}



/**
 * userIdからユーザーを取得する
 */
function UserAdapter_findById(
  userId
) {

  const normalizedUserId =
    String(
      userId || ""
    ).trim();

  if (!normalizedUserId) {

    return null;

  }

  const sheet =
    SpreadsheetApp
      .openById(
        SPREADSHEET_ID
      )
      .getSheetByName(
        "Users"
      );

  if (!sheet) {

    throw new Error(
      "Usersシートがありません。"
    );

  }

  const values =
    sheet
      .getDataRange()
      .getValues();

  for (
    let i = 1;
    i < values.length;
    i++
  ) {

    const storedUserId =
      String(
        values[i][0] || ""
      ).trim();

    if (
      storedUserId ===
      normalizedUserId
    ) {

      return {

        userId:
          values[i][0],

        email:
          values[i][1],

        name:
          values[i][2],

        nickName:
          values[i][3],

        role:
          values[i][4],

        status:
          values[i][5],

        createdAt:
          values[i][6],

        lastLoginAt:
          values[i][7]

      };

    }

  }

  return null;

}



function UserAdapter_insert(
  user
) {

  if (
    !user ||
    !user.userId ||
    !user.email
  ) {

    throw new Error(
      "登録するユーザー情報が不正です。"
    );

  }

  const sheet =
    SpreadsheetApp
        .openById(
            SPREADSHEET_ID
        )
        .getSheetByName(
            "Users"
        );

  if (!sheet) {

    throw new Error(
      "Usersシートがありません。"
    );

  }

  sheet.appendRow([
    user.userId,
    user.email,
    user.name,
    user.nickName,
    user.role,
    user.status,
    new Date(
      user.createdAt
    ),
    user.lastLoginAt
      ? new Date(
          user.lastLoginAt
        )
      : ""
  ]);

  return user;

}

