// firebase-messaging-sw.js

// Import Firebase using importScripts (service worker way)
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js");

// Initialize Firebase with static configuration
// Environment variables aren't available in service workers
firebase.initializeApp({
  apiKey: "AIzaSyCltEFK2aUwxWcIndfvq7UBaS90S_MaQso",
  authDomain: "backend-120a2.firebaseapp.com",
  projectId: "backend-120a2", 
  storageBucket: "backend-120a2.appspot.com",
  messagingSenderId: "716730184259",
  appId: "1:716730184259:web:34e5ff40f354e6fd19daf6",
  measurementId: "G-4PW7H66TVX",
  databaseURL: "https://backend-120a2-default-rtdb.firebaseio.com",
});

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log("📩 Background message received:", payload);
  
  // Extract notification data
  const notificationTitle = payload.notification.title || "New Notification";
  const notificationOptions = {
    body: payload.notification.body || "",
    icon: payload.notification.icon || "/firebase-logo.png",
    badge: "/badge-icon.png",
    tag: "notification",
    vibrate: [200, 100, 200],
    data: payload.data
  };

  // Show notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Optional: Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log("🖱️ Notification clicked:", event);
  
  event.notification.close();
  
  // This looks to see if the current is already open and focuses if it is
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus();
          }
        }
        
        if (clients.openWindow) {
          return clients.openWindow('/');
        }
      })
  );
});