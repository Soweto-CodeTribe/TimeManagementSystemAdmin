/* eslint-disable no-async-promise-executor */
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { 
  getFirestore, 
  serverTimestamp, 
  doc, 
  setDoc, 
  arrayUnion, 
  arrayRemove 
} from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Firebase configuration (using environment variables for security)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_APIKEY,
  authDomain: import.meta.env.VITE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_PROJECTID,
  storageBucket: import.meta.env.VITE_STORAGEBUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_APPID,
  measurementId: import.meta.env.VITE_MEASUREMENTID,
  databaseURL: import.meta.env.VITE_DATABASEURL,
};

// Initialize Firebase app
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const messaging = getMessaging(app);

// VAPID key for web push notifications
const vapidKey = import.meta.env.VITE_VAPID_KEY;

// Store the messaging instance
let messagingInstance = null;

/**
 * Initialize Firebase Messaging
 */
export const initializeMessaging = async () => {
  try {
    if (!('serviceWorker' in navigator)) {
      throw new Error("❌ Service workers are not supported in this browser");
    }

    // Register the service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
    console.log("✅ Service Worker Registered:", registration);

    // Initialize Firebase Messaging
    messagingInstance = getMessaging(app);
    console.log("✅ Firebase Messaging Initialized");
    return messagingInstance;
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Messaging:", error);
    throw error;
  }
};

/**
 * Register the service worker for Firebase Messaging
 */
export const registerServiceWorker = async () => {
  try {
    if (!('serviceWorker' in navigator)) {
      throw new Error("❌ Service workers are not supported in this browser");
    }

    // Register the service worker
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', { scope: '/' });
    console.log("✅ Service Worker Registered:", registration);
    return registration;
  } catch (error) {
    console.error("❌ Failed to register service worker:", error);
    throw error;
  }
};

/**
 * Request notification permission and retrieve FCM token
 * @returns {Promise<string>} FCM token
 */
export const requestNotificationPermission = async () => {
  try {
    if (!messagingInstance) {
      await initializeMessaging();
    }

    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error("❌ Notification permission denied");
    }

    const token = await getToken(messagingInstance, { vapidKey });
    console.log("📞 FCM Token:", token);

    await saveTokenToDatabase(token);
    return token;
  } catch (error) {
    console.error("❌ Error requesting notification permission:", error);
    throw error;
  }
};

/**
 * Save FCM token to Firestore
 * @param {string} token - FCM token
 */
const saveTokenToDatabase = async (token) => {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("❌ No authenticated user found");
    }

    const userRef = doc(db, "users", user.uid);
    await setDoc(
      userRef,
      {
        fcmTokens: arrayUnion(token),
        tokenLastUpdated: serverTimestamp(),
      },
      { merge: true }
    );
    console.log("📡 FCM Token saved successfully");
  } catch (error) {
    console.error("❌ Error saving FCM token to database:", error);
  }
};

/**
 * Listen for foreground messages
 * @returns {Promise} Resolves with the message payload
 */
export const onMessageListener = () => {
  return new Promise((resolve) => {
    try {
      if (!messagingInstance) {
        throw new Error("❌ Messaging instance not initialized");
      }

      onMessage(messagingInstance, (payload) => {
        console.log("📨 Foreground Message Received:", payload);
        resolve(payload);
      });
    } catch (error) {
      console.error("❌ Error setting up foreground message listener:", error);
    }
  });
};

// Export server timestamp utility
export { serverTimestamp };