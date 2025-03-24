/* eslint-disable no-undef */
// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/10.8.0/firebase-messaging.js');

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

if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
        scope: '/',
      });
      console.log('Service Worker Registered:', registration);
    } catch (error) {
      console.error('Failed to register service worker:', error);
    }
  });
}