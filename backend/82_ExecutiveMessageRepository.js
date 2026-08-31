/*
=========================================
SHiCI
82_ExecutiveMessageRepository.js

Executive Message Repository
Version 1.0

役割：
・役員メッセージ専用Spreadsheetとの入出力
・利用許可アカウントの取得
・1対1メッセージの保存 / 取得 / 既読化
=========================================
*/

function ExecutiveMessageRepository_getSpreadsheet() {

  return SpreadsheetApp.openById(
    Config_getExecutiveMessageSpreadsheetId()
  );

}

function ExecutiveMessageRepository_getRequiredSheet(
  sheetName
) {

  const sheet =
    ExecutiveMessageRepository_getSpreadsheet()
      .getSheetByName(
        sheetName
      );

  if (!sheet) {

    throw new Error(
      sheetName +
      "シートがありません。"
    );

  }

  return sheet;

}

function ExecutiveMessageRepository_createHeaderMap(
  headers
) {

  const map = {};

  headers.forEach(
    function(header, index) {

      map[
        String(header || "").trim()
      ] = index;

    }
  );

  return map;

}

function ExecutiveMessageRepository_requireHeaders(
  headerMap,
  requiredHeaders,
  sheetName
) {

  requiredHeaders.forEach(
    function(header) {

      if (
        !Object.prototype.hasOwnProperty.call(
          headerMap,
          header
        )
      ) {

        throw new Error(
          sheetName +
          "に必要なHeaderがありません: " +
          header
        );

      }

    }
  );

}

function ExecutiveMessageRepository_findAccessByEmail(
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
    ExecutiveMessageRepository_getRequiredSheet(
      "ExecutiveAccess"
    );

  const values =
    sheet
      .getDataRange()
      .getValues();

  if (values.length < 2) {
    return null;
  }

  const headerMap =
    ExecutiveMessageRepository_createHeaderMap(
      values[0]
    );

  ExecutiveMessageRepository_requireHeaders(
    headerMap,
    [
      "email",
      "displayName",
      "status",
      "sortOrder"
    ],
    "ExecutiveAccess"
  );

  for (
    let rowIndex = 1;
    rowIndex < values.length;
    rowIndex++
  ) {

    const row = values[rowIndex];

    const storedEmail =
      String(
        row[
          headerMap.email
        ] || ""
      )
        .trim()
        .toLowerCase();

    if (
      storedEmail ===
      normalizedEmail
    ) {

      return {

        email:
          storedEmail,

        displayName:
          String(
            row[
              headerMap.displayName
            ] || ""
          ).trim(),

        status:
          String(
            row[
              headerMap.status
            ] || ""
          )
            .trim()
            .toUpperCase(),

        sortOrder:
          Number(
            row[
              headerMap.sortOrder
            ] || 0
          )

      };

    }

  }

  return null;

}

function ExecutiveMessageRepository_listActiveAccess() {

  const sheet =
    ExecutiveMessageRepository_getRequiredSheet(
      "ExecutiveAccess"
    );

  const values =
    sheet
      .getDataRange()
      .getValues();

  if (values.length < 2) {
    return [];
  }

  const headerMap =
    ExecutiveMessageRepository_createHeaderMap(
      values[0]
    );

  ExecutiveMessageRepository_requireHeaders(
    headerMap,
    [
      "email",
      "displayName",
      "status",
      "sortOrder"
    ],
    "ExecutiveAccess"
  );

  return values
    .slice(1)
    .map(
      function(row) {

        return {

          email:
            String(
              row[
                headerMap.email
              ] || ""
            )
              .trim()
              .toLowerCase(),

          displayName:
            String(
              row[
                headerMap.displayName
              ] || ""
            ).trim(),

          status:
            String(
              row[
                headerMap.status
              ] || ""
            )
              .trim()
              .toUpperCase(),

          sortOrder:
            Number(
              row[
                headerMap.sortOrder
              ] || 0
            )

        };

      }
    )
    .filter(
      function(access) {

        return (
          access.email &&
          access.status ===
            "ACTIVE"
        );

      }
    )
    .sort(
      function(a, b) {

        if (
          a.sortOrder !==
          b.sortOrder
        ) {

          return (
            a.sortOrder -
            b.sortOrder
          );

        }

        return a.displayName.localeCompare(
          b.displayName,
          "ja"
        );

      }
    );

}

function ExecutiveMessageRepository_insertMessage(
  message
) {

  const sheet =
    ExecutiveMessageRepository_getRequiredSheet(
      "ExecutiveMessages"
    );

  const values =
    sheet
      .getDataRange()
      .getValues();

  if (values.length < 1) {

    throw new Error(
      "ExecutiveMessagesのHeaderがありません。"
    );

  }

  const headers = values[0];

  const headerMap =
    ExecutiveMessageRepository_createHeaderMap(
      headers
    );

  ExecutiveMessageRepository_requireHeaders(
    headerMap,
    [
      "messageId",
      "senderUserId",
      "recipientUserId",
      "body",
      "sentAt",
      "readAt",
      "status"
    ],
    "ExecutiveMessages"
  );

  const row =
    headers.map(
      function(header) {

        const normalizedHeader =
          String(header || "").trim();

        if (
          normalizedHeader ===
          "messageId"
        ) {
          return message.messageId;
        }

        if (
          normalizedHeader ===
          "senderUserId"
        ) {
          return message.senderUserId;
        }

        if (
          normalizedHeader ===
          "recipientUserId"
        ) {
          return message.recipientUserId;
        }

        if (
          normalizedHeader ===
          "body"
        ) {
          return message.body;
        }

        if (
          normalizedHeader ===
          "sentAt"
        ) {
          return new Date(
            message.sentAt
          );
        }

        if (
          normalizedHeader ===
          "readAt"
        ) {
          return message.readAt
            ? new Date(
                message.readAt
              )
            : "";
        }

        if (
          normalizedHeader ===
          "status"
        ) {
          return message.status;
        }

        return "";

      }
    );

  const lock =
    LockService.getScriptLock();

  lock.waitLock(10000);

  try {

    sheet.appendRow(
      row
    );

  } finally {

    lock.releaseLock();

  }

  return message;

}

function ExecutiveMessageRepository_listConversation(
  userIdA,
  userIdB,
  limit
) {

  const normalizedUserIdA =
    String(userIdA || "").trim();

  const normalizedUserIdB =
    String(userIdB || "").trim();

  const normalizedLimit =
    Math.min(
      Math.max(
        Number(limit || 100),
        1
      ),
      200
    );

  const sheet =
    ExecutiveMessageRepository_getRequiredSheet(
      "ExecutiveMessages"
    );

  const values =
    sheet
      .getDataRange()
      .getValues();

  if (values.length < 2) {
    return [];
  }

  const headerMap =
    ExecutiveMessageRepository_createHeaderMap(
      values[0]
    );

  ExecutiveMessageRepository_requireHeaders(
    headerMap,
    [
      "messageId",
      "senderUserId",
      "recipientUserId",
      "body",
      "sentAt",
      "readAt",
      "status"
    ],
    "ExecutiveMessages"
  );

  return values
    .slice(1)
    .map(
      function(row) {

        return {

          messageId:
            String(
              row[
                headerMap.messageId
              ] || ""
            ).trim(),

          senderUserId:
            String(
              row[
                headerMap.senderUserId
              ] || ""
            ).trim(),

          recipientUserId:
            String(
              row[
                headerMap.recipientUserId
              ] || ""
            ).trim(),

          body:
            String(
              row[
                headerMap.body
              ] || ""
            ),

          sentAt:
            ExecutiveMessageRepository_toIsoString(
              row[
                headerMap.sentAt
              ]
            ),

          readAt:
            ExecutiveMessageRepository_toIsoString(
              row[
                headerMap.readAt
              ]
            ),

          status:
            String(
              row[
                headerMap.status
              ] || ""
            )
              .trim()
              .toUpperCase()

        };

      }
    )
    .filter(
      function(message) {

        if (
          message.status &&
          message.status !==
            "ACTIVE"
        ) {
          return false;
        }

        return (
          (
            message.senderUserId ===
              normalizedUserIdA &&
            message.recipientUserId ===
              normalizedUserIdB
          ) ||
          (
            message.senderUserId ===
              normalizedUserIdB &&
            message.recipientUserId ===
              normalizedUserIdA
          )
        );

      }
    )
    .sort(
      function(a, b) {

        return (
          new Date(a.sentAt).getTime() -
          new Date(b.sentAt).getTime()
        );

      }
    )
    .slice(
      -normalizedLimit
    );

}

function ExecutiveMessageRepository_markRead(
  recipientUserId,
  senderUserId
) {

  const normalizedRecipientUserId =
    String(recipientUserId || "").trim();

  const normalizedSenderUserId =
    String(senderUserId || "").trim();

  const sheet =
    ExecutiveMessageRepository_getRequiredSheet(
      "ExecutiveMessages"
    );

  const range =
    sheet.getDataRange();

  const values =
    range.getValues();

  if (values.length < 2) {
    return 0;
  }

  const headerMap =
    ExecutiveMessageRepository_createHeaderMap(
      values[0]
    );

  ExecutiveMessageRepository_requireHeaders(
    headerMap,
    [
      "senderUserId",
      "recipientUserId",
      "readAt",
      "status"
    ],
    "ExecutiveMessages"
  );

  const now = new Date();
  let changed = 0;

  for (
    let rowIndex = 1;
    rowIndex < values.length;
    rowIndex++
  ) {

    const row = values[rowIndex];

    const rowSender =
      String(
        row[
          headerMap.senderUserId
        ] || ""
      ).trim();

    const rowRecipient =
      String(
        row[
          headerMap.recipientUserId
        ] || ""
      ).trim();

    const readAt =
      row[
        headerMap.readAt
      ];

    const status =
      String(
        row[
          headerMap.status
        ] || ""
      )
        .trim()
        .toUpperCase();

    if (
      rowSender ===
        normalizedSenderUserId &&
      rowRecipient ===
        normalizedRecipientUserId &&
      !readAt &&
      (
        !status ||
        status ===
          "ACTIVE"
      )
    ) {

      sheet
        .getRange(
          rowIndex + 1,
          headerMap.readAt + 1
        )
        .setValue(
          now
        );

      changed++;

    }

  }

  return changed;

}

function ExecutiveMessageRepository_toIsoString(
  value
) {

  if (!value) {
    return null;
  }

  if (
    Object.prototype.toString.call(
      value
    ) === "[object Date]"
  ) {

    return value.toISOString();

  }

  const date = new Date(
    value
  );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date.toISOString();

}




/**
 * Push Subscriptionを登録または更新する。
 *
 * endpointを端末購読の一意キーとして扱う。
 *
 * @param {Object} subscription
 * @return {Object}
 */
function ExecutiveMessageRepository_upsertPushSubscription(
  subscription
) {

  const sheet =
    ExecutiveMessageRepository_getRequiredSheet(
      "ExecutivePushSubscriptions"
    );


  const values =
    sheet
      .getDataRange()
      .getValues();


  if (
    values.length < 1
  ) {

    throw new Error(
      "ExecutivePushSubscriptionsのHeaderがありません。"
    );

  }


  const headers =
    values[0];


  const headerMap =
    ExecutiveMessageRepository_createHeaderMap(
      headers
    );


  ExecutiveMessageRepository_requireHeaders(
    headerMap,
    [
      "subscriptionId",
      "userId",
      "endpoint",
      "p256dh",
      "auth",
      "status",
      "createdAt",
      "updatedAt",
      "lastSuccessAt",
      "failureCount"
    ],
    "ExecutivePushSubscriptions"
  );


  const normalizedEndpoint =
    String(
      subscription.endpoint || ""
    ).trim();


  if (
    !normalizedEndpoint
  ) {

    throw new Error(
      "Push Subscription endpointがありません。"
    );

  }


  const now =
    new Date();


  for (
    let rowIndex = 1;
    rowIndex < values.length;
    rowIndex++
  ) {

    const row =
      values[rowIndex];


    const storedEndpoint =
      String(
        row[
          headerMap.endpoint
        ] || ""
      ).trim();


    if (
      storedEndpoint !==
        normalizedEndpoint
    ) {
      continue;
    }


    sheet
      .getRange(
        rowIndex + 1,
        headerMap.userId + 1
      )
      .setValue(
        subscription.userId
      );


    sheet
      .getRange(
        rowIndex + 1,
        headerMap.p256dh + 1
      )
      .setValue(
        subscription.p256dh
      );


    sheet
      .getRange(
        rowIndex + 1,
        headerMap.auth + 1
      )
      .setValue(
        subscription.auth
      );


    sheet
      .getRange(
        rowIndex + 1,
        headerMap.status + 1
      )
      .setValue(
        "ACTIVE"
      );


    sheet
      .getRange(
        rowIndex + 1,
        headerMap.updatedAt + 1
      )
      .setValue(
        now
      );


    return {

      subscriptionId:
        String(
          row[
            headerMap.subscriptionId
          ] || ""
        ).trim(),

      userId:
        String(
          subscription.userId || ""
        ).trim(),

      endpoint:
        normalizedEndpoint,

      p256dh:
        String(
          subscription.p256dh || ""
        ).trim(),

      auth:
        String(
          subscription.auth || ""
        ).trim(),

      status:
        "ACTIVE"

    };

  }


  const record = {

    subscriptionId:
      Utilities.getUuid(),

    userId:
      String(
        subscription.userId || ""
      ).trim(),

    endpoint:
      normalizedEndpoint,

    p256dh:
      String(
        subscription.p256dh || ""
      ).trim(),

    auth:
      String(
        subscription.auth || ""
      ).trim(),

    status:
      "ACTIVE",

    createdAt:
      now,

    updatedAt:
      now,

    lastSuccessAt:
      "",

    failureCount:
      0

  };


  const newRow =
    headers.map(
      function(header) {

        const normalizedHeader =
          String(
            header || ""
          ).trim();

        if (
          Object.prototype.hasOwnProperty.call(
            record,
            normalizedHeader
          )
        ) {

          return record[
            normalizedHeader
          ];

        }

        return "";

      }
    );


  sheet.appendRow(
    newRow
  );


  return record;

}


/**
 * 指定Userの有効なPush Subscriptionを取得する。
 *
 * @param {string} userId
 * @return {Array<Object>}
 */
function ExecutiveMessageRepository_listActivePushSubscriptionsByUserId(
  userId
) {

  const normalizedUserId =
    String(
      userId || ""
    ).trim();


  if (
    !normalizedUserId
  ) {
    return [];
  }


  const sheet =
    ExecutiveMessageRepository_getRequiredSheet(
      "ExecutivePushSubscriptions"
    );


  const values =
    sheet
      .getDataRange()
      .getValues();


  if (
    values.length < 2
  ) {
    return [];
  }


  const headerMap =
    ExecutiveMessageRepository_createHeaderMap(
      values[0]
    );


  ExecutiveMessageRepository_requireHeaders(
    headerMap,
    [
      "subscriptionId",
      "userId",
      "endpoint",
      "p256dh",
      "auth",
      "status"
    ],
    "ExecutivePushSubscriptions"
  );


  return values
    .slice(1)
    .map(
      function(row) {

        return {

          subscriptionId:
            String(
              row[
                headerMap.subscriptionId
              ] || ""
            ).trim(),

          userId:
            String(
              row[
                headerMap.userId
              ] || ""
            ).trim(),

          endpoint:
            String(
              row[
                headerMap.endpoint
              ] || ""
            ).trim(),

          p256dh:
            String(
              row[
                headerMap.p256dh
              ] || ""
            ).trim(),

          auth:
            String(
              row[
                headerMap.auth
              ] || ""
            ).trim(),

          status:
            String(
              row[
                headerMap.status
              ] || ""
            )
              .trim()
              .toUpperCase()

        };

      }
    )
    .filter(
      function(subscription) {

        return (
          subscription.userId ===
            normalizedUserId &&
          subscription.status ===
            "ACTIVE" &&
          subscription.endpoint &&
          subscription.p256dh &&
          subscription.auth
        );

      }
    );

}


/**
 * Push Subscriptionを無効化する。
 *
 * @param {string} endpoint
 * @return {boolean}
 */
function ExecutiveMessageRepository_deactivatePushSubscription(
  endpoint
) {

  const normalizedEndpoint =
    String(
      endpoint || ""
    ).trim();


  if (
    !normalizedEndpoint
  ) {
    return false;
  }


  const sheet =
    ExecutiveMessageRepository_getRequiredSheet(
      "ExecutivePushSubscriptions"
    );


  const values =
    sheet
      .getDataRange()
      .getValues();


  if (
    values.length < 2
  ) {
    return false;
  }


  const headerMap =
    ExecutiveMessageRepository_createHeaderMap(
      values[0]
    );


  ExecutiveMessageRepository_requireHeaders(
    headerMap,
    [
      "endpoint",
      "status",
      "updatedAt"
    ],
    "ExecutivePushSubscriptions"
  );


  for (
    let rowIndex = 1;
    rowIndex < values.length;
    rowIndex++
  ) {

    const storedEndpoint =
      String(
        values[
          rowIndex
        ][
          headerMap.endpoint
        ] || ""
      ).trim();


    if (
      storedEndpoint !==
        normalizedEndpoint
    ) {
      continue;
    }


    sheet
      .getRange(
        rowIndex + 1,
        headerMap.status + 1
      )
      .setValue(
        "INACTIVE"
      );


    sheet
      .getRange(
        rowIndex + 1,
        headerMap.updatedAt + 1
      )
      .setValue(
        new Date()
      );


    return true;

  }


  return false;

}