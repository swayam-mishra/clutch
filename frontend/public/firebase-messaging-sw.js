// Firebase Messaging Service Worker
// Uses compat CDN scripts — module imports are not supported in SW context
// without a bundler. The config is injected via URL search params by the
// registration call in useNotifications.ts.

importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js");

// Config is passed via the service worker's URL query string so we don't
// hard-code credentials in the public file.
function getConfig() {
  const params = new URL(self.location.href).searchParams;
  return {
    apiKey: params.get("apiKey"),
    authDomain: params.get("authDomain"),
    projectId: params.get("projectId"),
    storageBucket: params.get("storageBucket"),
    messagingSenderId: params.get("messagingSenderId"),
    appId: params.get("appId"),
  };
}

const config = getConfig();

if (config.apiKey) {
  firebase.initializeApp(config);
  const messaging = firebase.messaging();

  // Handle background push messages
  messaging.onBackgroundMessage((payload) => {
    const { title = "Clutch", body = "" } = payload.notification ?? {};
    self.registration.showNotification(title, {
      body,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      data: payload.data,
    });
  });
}
