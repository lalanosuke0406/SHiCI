const CACHE_NAME = "shici-shell-v7";
const ASSETS = [
  "./",
  "index.html",
  "css/main.css",
  "manifest.json",
  "js/SessionStore.js", "js/UIRenderer.js?v=20260806-1", "js/ApiClient.js",
  "js/TextareaController.js", "js/AuthController.js", "js/ChatController.js",
  "js/ExecutivePrivateController.js",
  "js/ExecutivePushController.js", "js/app.js"
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener("activate", function(event) {
  event.waitUntil(caches.keys().then(function(names) {
    return Promise.all(names.filter(function(name) {
      return name === "shici-pwa-v1" || (name.startsWith("shici-shell-") && name !== CACHE_NAME);
    }).map(function(name) { return caches.delete(name); }));
  }));
});

self.addEventListener("fetch", function(event) {
  // Cache only the explicitly listed public shell. API responses, messages,
  // tokens, cross-origin media and authenticated requests never enter this cache.
  const request = event.request;
  if (request.method !== "GET" || request.headers.has("Authorization")) return;
  const allowed = ASSETS.map(function(asset) { return new URL(asset, self.registration.scope).href; });
  if (!allowed.includes(request.url)) return;
  event.respondWith(
    fetch(request).then(function(response) {
      if (response.ok) {
        const copy = response.clone();
        event.waitUntil(caches.open(CACHE_NAME).then(function(cache) { return cache.put(request, copy); }));
      }
      return response;
    }).catch(function() { return caches.match(request); })
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

                client.postMessage({type: "shici-notification-open"});
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
