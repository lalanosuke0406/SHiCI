const CACHE_NAME = "shici-pwa-v1";
const ASSETS = [
  "./",
  "index.html",
  "style.css",
  "script.js",
  "manifest.json"
];

self.addEventListener("install", function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener("fetch", function(event) {
  event.respondWith(
    caches.match(event.request).then(function(cached) {
      return cached || fetch(event.request);
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