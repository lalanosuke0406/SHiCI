const CACHE_NAME = "shici-pwa-v2";
const ASSETS = [
  "./",
  "index.html",
  "css/main.css",
  "js/SessionStore.js",
  "js/UIRenderer.js?v=20260806-1",
  "js/ApiClient.js",
  "js/TextareaController.js",
  "js/AuthController.js",
  "js/ChatController.js",
  "js/ExecutiveMessageController.js",
  "js/ExecutivePushController.js",
  "js/app.js",
  "manifest.json"
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener("activate", function(event) {
  event.waitUntil(caches.delete("shici-pwa-v1"));
});

self.addEventListener("fetch", function(event) {
  if (event.request.method !== "GET" ||
      new URL(event.request.url).origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    fetch(event.request).catch(async function(error) {
      const cache = await caches.open(CACHE_NAME);
      const cached = await cache.match(event.request);
      if (cached) return cached;
      throw error;
    })
  );
});




/*
=========================================
Executive Push Notification
=========================================
*/

self.addEventListener(
  "push",
  function(event) {

    /*
     * Push payloadに依存せず、
     * 通知内容はService Worker側で固定する。
     *
     * 秘密メッセージ機能の存在を
     * 通知上から推測されにくくする。
     */

    const options = {

      body:
        "確認事項があります。",

      icon:
        "./SHiCI_icon_192.png",

      badge:
        "./SHiCI_icon_192.png",

      tag:
        "shici-notice",

      renotify:
        false,

      data: {

        url:
          "./"

      }

    };


    event.waitUntil(
      self.registration.showNotification(
        "SHiCI",
        options
      )
    );

  }
);


self.addEventListener(
  "notificationclick",
  function(event) {

    event.notification.close();


    event.waitUntil(

      clients
        .matchAll(
          {
            type:
              "window",

            includeUncontrolled:
              true
          }
        )
        .then(
          function(clientList) {

            for (
              let index = 0;
              index < clientList.length;
              index++
            ) {

              const client =
                clientList[index];


              if (
                "focus" in client
              ) {

                return client.focus();

              }

            }


            if (
              clients.openWindow
            ) {

              return clients.openWindow(
                "./"
              );

            }


            return null;

          }
        )

    );

  }
);
