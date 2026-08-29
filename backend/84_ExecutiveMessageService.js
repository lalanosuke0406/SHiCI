/*
=========================================
SHiCI
84_ExecutiveMessageService.js

Executive Message Service
Version 1.0

役割：
・役員限定1対1メッセージ機能
・専用Sessionの認証
・相手一覧 / メッセージ取得 / 送信 / Lock
=========================================
*/

const EXECUTIVE_MESSAGE_MAX_BODY_LENGTH =
  2000;

function ExecutiveMessageService_listPeers(
  normalSessionId,
  executiveSessionToken
) {

  const context =
    ExecutiveMessageSessionEngine_requireExecutiveSession(
      normalSessionId,
      executiveSessionToken
    );

  return {

    status:
      "success",

    peers:
      ExecutiveMessageService_listPeersForUser(
        context.user
      )

  };

}

function ExecutiveMessageService_listPeersForUser(
  user
) {

  const currentEmail =
    String(
      user && user.email
        ? user.email
        : ""
    )
      .trim()
      .toLowerCase();

  return ExecutiveMessageRepository_listActiveAccess()
    .filter(
      function(access) {

        return (
          access.email !==
          currentEmail
        );

      }
    )
    .map(
      function(access) {

        const peerUser =
          UserEngine_findByEmail(
            access.email
          );

        if (
          !peerUser ||
          String(
            peerUser.status || ""
          )
            .trim()
            .toUpperCase() !==
              "ACTIVE"
        ) {
          return null;
        }

        return {

          userId:
            peerUser.userId,

          displayName:
            access.displayName ||
            peerUser.nickName ||
            peerUser.name ||
            peerUser.email

        };

      }
    )
    .filter(
      function(peer) {
        return !!peer;
      }
    );

}

function ExecutiveMessageService_listMessages(
  normalSessionId,
  executiveSessionToken,
  peerUserId
) {

  const context =
    ExecutiveMessageSessionEngine_requireExecutiveSession(
      normalSessionId,
      executiveSessionToken
    );

  const peer =
    ExecutiveMessageService_requirePeer(
      context.user,
      peerUserId
    );

  ExecutiveMessageRepository_markRead(
    context.user.userId,
    peer.userId
  );

  return {

    status:
      "success",

    currentUserId:
      context.user.userId,

    peer: {

      userId:
        peer.userId,

      displayName:
        peer.displayName

    },

    messages:
      ExecutiveMessageRepository_listConversation(
        context.user.userId,
        peer.userId,
        150
      )

  };

}

function ExecutiveMessageService_sendMessage(
  normalSessionId,
  executiveSessionToken,
  recipientUserId,
  body
) {

  const context =
    ExecutiveMessageSessionEngine_requireExecutiveSession(
      normalSessionId,
      executiveSessionToken
    );

  const recipient =
    ExecutiveMessageService_requirePeer(
      context.user,
      recipientUserId
    );

  const normalizedBody =
    String(body || "").trim();

  if (!normalizedBody) {

    throw new Error(
      "メッセージ本文がありません。"
    );

  }

  if (
    normalizedBody.length >
      EXECUTIVE_MESSAGE_MAX_BODY_LENGTH
  ) {

    throw new Error(
      "メッセージは2000文字以内にしてください。"
    );

  }

  const message = {

    messageId:
      Utilities.getUuid(),

    senderUserId:
      context.user.userId,

    recipientUserId:
      recipient.userId,

    body:
      normalizedBody,

    sentAt:
      new Date()
        .toISOString(),

    readAt:
      null,

    status:
      "ACTIVE"

  };

  ExecutiveMessageRepository_insertMessage(
    message
  );

  return {

    status:
      "success",

    message

  };

}

function ExecutiveMessageService_lock(
  normalSessionId,
  executiveSessionToken
) {

  const normalizedToken =
    String(
      executiveSessionToken || ""
    ).trim();

  if (!normalizedToken) {

    return {
      status: "success"
    };

  }

  try {

    const context =
      ExecutiveMessageSessionEngine_requireExecutiveSession(
        normalSessionId,
        normalizedToken
      );

    if (context) {

      ExecutiveMessageSessionEngine_deleteExecutiveSession(
        normalizedToken
      );

    }

  } catch (error) {

    ExecutiveMessageSessionEngine_deleteExecutiveSession(
      normalizedToken
    );

  }

  return {
    status: "success"
  };

}

function ExecutiveMessageService_requirePeer(
  currentUser,
  peerUserId
) {

  const normalizedPeerUserId =
    String(peerUserId || "").trim();

  if (!normalizedPeerUserId) {

    throw new Error(
      "相手ユーザーがありません。"
    );

  }

  if (
    normalizedPeerUserId ===
      currentUser.userId
  ) {

    throw new Error(
      "自分自身には送信できません。"
    );

  }

  const peerUser =
    UserEngine_findById(
      normalizedPeerUserId
    );

  if (
    !peerUser ||
    String(
      peerUser.status || ""
    )
      .trim()
      .toUpperCase() !==
        "ACTIVE"
  ) {

    throw new Error(
      "相手ユーザーを利用できません。"
    );

  }

  const peerAccess =
    ExecutiveMessageRepository_findAccessByEmail(
      peerUser.email
    );

  if (
    !peerAccess ||
    peerAccess.status !==
      "ACTIVE"
  ) {

    throw new Error(
      "相手ユーザーを利用できません。"
    );

  }

  return {

    userId:
      peerUser.userId,

    displayName:
      peerAccess.displayName ||
      peerUser.nickName ||
      peerUser.name ||
      peerUser.email

  };

}
