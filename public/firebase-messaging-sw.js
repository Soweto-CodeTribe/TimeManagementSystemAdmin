// In your app initialization file (e.g., index.js or App.js)
import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase config (same as in your service worker)
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

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request permission and get token
export const requestNotificationPermission = async () => {
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      // Get token and save it (you might want to store this in your backend)
      const token = await getToken(messaging, {
        vapidKey: "YOUR_VAPID_KEY_HERE" // Get this from Firebase console
      });
      console.log("Notification token:", token);
      return token;
    }
  } catch (error) {
    console.error("Notification permission error:", error);
  }
};

// Handle foreground messages
export const setupForegroundNotifications = (callback) => {
  return onMessage(messaging, (payload) => {
    console.log("Foreground message received:", payload);
    callback(payload);
  });
};