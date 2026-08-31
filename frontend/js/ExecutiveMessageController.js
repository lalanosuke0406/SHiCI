/*
=========================================
SHiCI
ExecutiveMessageController.js

役員限定1対1メッセージ画面
=========================================
*/

let executiveMessageView = null;
let executivePeerList = null;
let executiveConversation = null;
let executiveMessageForm = null;
let executiveMessageInput = null;
let executivePeerTitle = null;
let executivePrivacySensorButton = null;

let executiveSessionToken = null;
let executivePeers = [];
let executiveActivePeerUserId = null;
let executivePollTimer = null;
let executiveIdleTimer = null;
let executiveHandshakeNodes = [];

let executiveTouchStartX = null;
let executiveTouchStartY = null;
let executiveTouchStartAt = null;

let executiveMotionPermissionRequested = false;
let executiveMotionBaselineSign = null;
let executiveMotionFaceDownStartedAt = null;

const EXECUTIVE_MESSAGE_POLL_INTERVAL_MS = 5000;
const EXECUTIVE_MESSAGE_IDLE_LOCK_MS = 180000;

function initializeExecutiveMessage() {

  executiveMessageView =
    document.getElementById(
      "executiveMessageView"
    );

  executivePeerList =
    document.getElementById(
      "executivePeerList"
    );

  executiveConversation =
    document.getElementById(
      "executiveConversation"
    );

  executiveMessageForm =
    document.getElementById(
      "executiveMessageForm"
    );

  executiveMessageInput =
    document.getElementById(
      "executiveMessageInput"
    );

  executivePeerTitle =
    document.getElementById(
      "executivePeerTitle"
    );

  executivePrivacySensorButton =
    document.getElementById(
      "executivePrivacySensorButton"
    );

  if (
    !executiveMessageView ||
    !executivePeerList ||
    !executiveConversation ||
    !executiveMessageForm ||
    !executiveMessageInput ||
    !executivePeerTitle
  ) {
    return;
  }

  executiveMessageForm.addEventListener(
    "submit",
    ExecutiveMessageController_handleSend
  );

  executiveMessageView.addEventListener(
    "touchstart",
    ExecutiveMessageController_handleTouchStart,
    {
      passive: true
    }
  );

  executiveMessageView.addEventListener(
    "touchend",
    ExecutiveMessageController_handleTouchEnd,
    {
      passive: true
    }
  );

  executiveMessageView.addEventListener(
    "pointerdown",
    ExecutiveMessageController_resetIdleTimer
  );

  executiveMessageView.addEventListener(
    "keydown",
    ExecutiveMessageController_resetIdleTimer
  );

  if (executivePrivacySensorButton) {

    executivePrivacySensorButton.addEventListener(
      "click",
      ExecutiveMessageController_enablePrivacySensor
    );

  }

  document.addEventListener(
    "visibilitychange",
    function() {

      if (
        document.hidden &&
        ExecutiveMessageController_isOpen()
      ) {

        ExecutiveMessageController_emergencyClose();

      }

    }
  );

  window.addEventListener(
    "pagehide",
    function() {

      if (
        ExecutiveMessageController_isOpen()
      ) {

        ExecutiveMessageController_emergencyClose();

      }

    }
  );

  document.addEventListener(
    "keydown",
    function(event) {

      if (
        event.key === "Escape" &&
        ExecutiveMessageController_isOpen()
      ) {

        ExecutiveMessageController_emergencyClose();

      }

    }
  );

}

function ExecutiveMessageController_handleChallenge(
  userMessageNode,
  loadingNode,
  result
) {

  executiveHandshakeNodes =
    executiveHandshakeNodes.filter(
      function(node) {
        return node && node.isConnected;
      }
    );

  executiveHandshakeNodes.push(
    userMessageNode,
    loadingNode
  );

  updateMessage(
    loadingNode,
    result.answer || ""
  );

}

function ExecutiveMessageController_handleChallengeFailed(
  userMessageNode,
  loadingNode,
  result
) {

  executiveHandshakeNodes.push(
    userMessageNode,
    loadingNode
  );

  ExecutiveMessageController_clearHandshakeNodes();

  addMessage(
    result.answer ||
      "確認できませんでした。",
    "shici"
  );

}

function ExecutiveMessageController_handleUnlocked(
  userMessageNode,
  loadingNode,
  result
) {

  executiveHandshakeNodes.push(
    userMessageNode,
    loadingNode
  );

  ExecutiveMessageController_clearHandshakeNodes();

  const token =
    String(
      result.executiveSessionToken || ""
    ).trim();

  if (!token) {

    throw new Error(
      "役員メッセージSessionを取得できませんでした。"
    );

  }

  executiveSessionToken = token;

  ExecutivePushController_setSessionToken(
    token
  );

  executivePeers = Array.isArray(result.peers)
    ? result.peers
    : [];

  ExecutiveMessageController_openView();

  ExecutivePushController_refreshButton();

}

function ExecutiveMessageController_openView() {

  const appView =
    document.getElementById(
      "appView"
    );

  if (
    !appView ||
    !executiveMessageView
  ) {

    throw new Error(
      "役員メッセージ画面を表示できません。"
    );

  }

  appView.hidden = true;
  executiveMessageView.hidden = false;

  ExecutiveMessageController_renderPeers();
  ExecutiveMessageController_clearConversation();
  ExecutiveMessageController_resetIdleTimer();
  ExecutiveMessageController_startPolling();

  if (
    executivePeers.length === 1
  ) {

    ExecutiveMessageController_selectPeer(
      executivePeers[0].userId
    );

  }

}

function ExecutiveMessageController_renderPeers() {

  executivePeerList.innerHTML = "";

  executivePeers.forEach(
    function(peer) {

      const button =
        document.createElement(
          "button"
        );

      button.type = "button";
      button.className =
        "executive-peer-button";

      button.textContent =
        peer.displayName || "";

      button.dataset.userId =
        peer.userId;

      button.addEventListener(
        "click",
        function() {

          ExecutiveMessageController_selectPeer(
            peer.userId
          );

        }
      );

      executivePeerList.appendChild(
        button
      );

    }
  );

}

async function ExecutiveMessageController_selectPeer(
  peerUserId
) {

  executiveActivePeerUserId =
    String(
      peerUserId || ""
    ).trim();

  const peer =
    executivePeers.find(
      function(item) {
        return item.userId ===
          executiveActivePeerUserId;
      }
    );

  executivePeerTitle.textContent =
    peer
      ? peer.displayName
      : "";

  Array.from(
    executivePeerList.children
  ).forEach(
    function(button) {

      button.classList.toggle(
        "active",
        button.dataset.userId ===
          executiveActivePeerUserId
      );

    }
  );

  await ExecutiveMessageController_refreshConversation();

  executiveMessageInput.focus();

}

async function ExecutiveMessageController_refreshConversation() {

  if (
    !ExecutiveMessageController_isOpen() ||
    !executiveSessionToken ||
    !executiveActivePeerUserId
  ) {
    return;
  }

  try {

    const result =
      await listExecutiveMessages(
        executiveSessionToken,
        executiveActivePeerUserId
      );

    if (
      !result ||
      result.status !== "success"
    ) {

      throw new Error(
        result && result.message
          ? result.message
          : "メッセージを取得できませんでした。"
      );

    }

    ExecutiveMessageController_renderMessages(
      result.messages || [],
      result.currentUserId || null
    );

  } catch (error) {

    ExecutiveMessageController_emergencyClose();

  }

}

function ExecutiveMessageController_renderMessages(
  messages,
  currentUserId
) {

  executiveConversation.innerHTML = "";

  const sessionUserId =
    String(
      currentUserId || ""
    ).trim();

  messages.forEach(
    function(message) {

      const element =
        document.createElement(
          "div"
        );

      element.className =
        "executive-message-bubble";

      if (
        sessionUserId &&
        message.senderUserId ===
          sessionUserId
      ) {

        element.classList.add(
          "mine"
        );

      } else {

        element.classList.add(
          "theirs"
        );

      }

      const body =
        document.createElement(
          "div"
        );

      body.className =
        "executive-message-body";

      body.textContent =
        String(
          message.body || ""
        );

      const time =
        document.createElement(
          "div"
        );

      time.className =
        "executive-message-time";

      time.textContent =
        ExecutiveMessageController_formatTime(
          message.sentAt
        );

      element.appendChild(
        body
      );

      element.appendChild(
        time
      );

      executiveConversation.appendChild(
        element
      );

    }
  );

  executiveConversation.scrollTop =
    executiveConversation.scrollHeight;

}

async function ExecutiveMessageController_handleSend(
  event
) {

  event.preventDefault();

  if (
    !executiveSessionToken ||
    !executiveActivePeerUserId
  ) {
    return;
  }

  const body =
    executiveMessageInput.value.trim();

  if (!body) {
    return;
  }

  executiveMessageInput.value = "";

  ExecutiveMessageController_resetIdleTimer();

  try {

    const result =
      await sendExecutiveMessage(
        executiveSessionToken,
        executiveActivePeerUserId,
        body
      );

    if (
      !result ||
      result.status !== "success"
    ) {

      throw new Error(
        result && result.message
          ? result.message
          : "送信できませんでした。"
      );

    }

    await ExecutiveMessageController_refreshConversation();

  } catch (error) {

    ExecutiveMessageController_emergencyClose();

  }

}

function ExecutiveMessageController_startPolling() {

  ExecutiveMessageController_stopPolling();

  executivePollTimer =
    setInterval(
      function() {

        ExecutiveMessageController_refreshConversation();

      },
      EXECUTIVE_MESSAGE_POLL_INTERVAL_MS
    );

}

function ExecutiveMessageController_stopPolling() {

  if (executivePollTimer) {

    clearInterval(
      executivePollTimer
    );

    executivePollTimer = null;

  }

}

function ExecutiveMessageController_resetIdleTimer() {

  if (
    !ExecutiveMessageController_isOpen()
  ) {
    return;
  }

  if (executiveIdleTimer) {

    clearTimeout(
      executiveIdleTimer
    );

  }

  executiveIdleTimer =
    setTimeout(
      ExecutiveMessageController_emergencyClose,
      EXECUTIVE_MESSAGE_IDLE_LOCK_MS
    );

}

function ExecutiveMessageController_handleTouchStart(
  event
) {

  if (
    !ExecutiveMessageController_isOpen() ||
    !event.touches ||
    event.touches.length !== 1
  ) {
    return;
  }

  const touch = event.touches[0];

  executiveTouchStartX = touch.clientX;
  executiveTouchStartY = touch.clientY;
  executiveTouchStartAt = Date.now();

}

function ExecutiveMessageController_handleTouchEnd(
  event
) {

  if (
    executiveTouchStartX === null ||
    executiveTouchStartY === null ||
    !event.changedTouches ||
    event.changedTouches.length !== 1
  ) {
    return;
  }

  const touch = event.changedTouches[0];

  const deltaX =
    touch.clientX -
    executiveTouchStartX;

  const deltaY =
    touch.clientY -
    executiveTouchStartY;

  const duration =
    Date.now() -
    executiveTouchStartAt;

  const isHorizontalSwipe =
    Math.abs(deltaX) >= 100 &&
    Math.abs(deltaX) >
      Math.abs(deltaY) &&
    duration <= 700;

  executiveTouchStartX = null;
  executiveTouchStartY = null;
  executiveTouchStartAt = null;

  if (isHorizontalSwipe) {

    ExecutiveMessageController_emergencyClose();

  }

}

async function ExecutiveMessageController_enablePrivacySensor() {

  if (executiveMotionPermissionRequested) {
    return;
  }

  executiveMotionPermissionRequested = true;

  try {

    if (
      typeof DeviceMotionEvent !==
        "undefined" &&
      typeof DeviceMotionEvent.requestPermission ===
        "function"
    ) {

      const permission =
        await DeviceMotionEvent.requestPermission();

      if (
        permission !==
          "granted"
      ) {
        return;
      }

    }

    window.addEventListener(
      "devicemotion",
      ExecutiveMessageController_handleDeviceMotion
    );

    if (executivePrivacySensorButton) {

      executivePrivacySensorButton.textContent =
        "伏せて閉じる：有効";

      executivePrivacySensorButton.disabled = true;

    }

  } catch (error) {

    executiveMotionPermissionRequested = false;

  }

}

function ExecutiveMessageController_handleDeviceMotion(
  event
) {

  if (
    !ExecutiveMessageController_isOpen()
  ) {
    return;
  }

  const acceleration =
    event.accelerationIncludingGravity;

  if (
    !acceleration ||
    typeof acceleration.z !==
      "number"
  ) {
    return;
  }

  const z = acceleration.z;

  if (
    Math.abs(z) < 6.5
  ) {

    executiveMotionFaceDownStartedAt = null;
    return;

  }

  const sign =
    Math.sign(z);

  if (
    executiveMotionBaselineSign === null
  ) {

    executiveMotionBaselineSign = sign;
    return;

  }

  if (
    sign ===
      -executiveMotionBaselineSign &&
    Math.abs(z) >= 7.5
  ) {

    if (
      executiveMotionFaceDownStartedAt ===
        null
    ) {

      executiveMotionFaceDownStartedAt =
        Date.now();

      return;

    }

    if (
      Date.now() -
        executiveMotionFaceDownStartedAt >=
          250
    ) {

      ExecutiveMessageController_emergencyClose();

    }

    return;

  }

  executiveMotionFaceDownStartedAt = null;

}

function ExecutiveMessageController_emergencyClose() {

  if (
    !ExecutiveMessageController_isOpen()
  ) {
    return;
  }

  const token =
    executiveSessionToken;

  executiveSessionToken = null;

  ExecutivePushController_clearSessionToken();

  executiveActivePeerUserId = null;
  executivePeers = [];

  ExecutiveMessageController_stopPolling();

  if (executiveIdleTimer) {

    clearTimeout(
      executiveIdleTimer
    );

    executiveIdleTimer = null;

  }

  ExecutiveMessageController_clearConversation();
  executivePeerList.innerHTML = "";
  executivePeerTitle.textContent = "";
  executiveMessageInput.value = "";

  executiveMessageView.hidden = true;

  const appView =
    document.getElementById(
      "appView"
    );

  if (appView) {
    appView.hidden = false;
  }

  executiveMotionBaselineSign = null;
  executiveMotionFaceDownStartedAt = null;

  if (token) {

    lockExecutiveMessageBestEffort(
      token
    );

  }

}

function ExecutiveMessageController_clearConversation() {

  if (executiveConversation) {
    executiveConversation.innerHTML = "";
  }

}

function ExecutiveMessageController_clearHandshakeNodes() {

  executiveHandshakeNodes.forEach(
    function(node) {

      if (
        node &&
        node.remove
      ) {
        node.remove();
      }

    }
  );

  executiveHandshakeNodes = [];

}

function ExecutiveMessageController_isOpen() {

  return !!(
    executiveMessageView &&
    !executiveMessageView.hidden &&
    executiveSessionToken
  );

}

function ExecutiveMessageController_formatTime(
  isoString
) {

  if (!isoString) {
    return "";
  }

  const date =
    new Date(
      isoString
    );

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date.toLocaleString(
    "ja-JP",
    {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    }
  );

}
