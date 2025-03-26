/* eslint-disable no-undef */
// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging-compat.js');

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCltEFK2aUwxWcIndfvq7UBaS90S_MaQso",
  authDomain: "backend-120a2.firebaseapp.com",
  projectId: "backend-120a2", 
  storageBucket: "backend-120a2.appspot.com",
  messagingSenderId: "716730184259",
  appId: "1:716730184259:web:34e5ff40f354e6fd19daf6",
  measurementId: "G-4PW7H66TVX",
  databaseURL: "https://backend-120a2-default-rtdb.firebaseio.com",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Get messaging instance
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationTitle = payload.notification.title || 'New Notification';
  const notificationOptions = {
    body: payload.notification.body || 'You have a new message',
    icon: payload.notification.icon || '/default-icon.png'
  };

  // Show the notification
  self.registration.showNotification(notificationTitle, notificationOptions);
});