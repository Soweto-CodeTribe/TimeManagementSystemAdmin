// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, serverTimestamp } from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getMessaging, getToken, onMessage } from "firebase/messaging";
import { setDoc, doc } from "firebase/firestore";
// Firebase configuration
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
// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);
export const messaging = getMessaging(app)
// VAPID key for web push notifications
const vapidKey = 'BDsqPLmY25EV2VmocEZn5KKZxb8-M49AtnJW8AQG-2s7q9uGpkMsBlyoXXbQ5F9Dg0IgSf5wRj_gk8QooevAd74';
// Store the messaging instance
let messagingInstance = null;
/**
* Initialize Firebase Messaging
* This registers the service worker and sets up messaging
*/
export const initializeMessaging = async () => {
  try {
    // Register service worker first
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/'
    });
    console.log(":white_tick: Service Worker Registered:", registration);
    // Initialize messaging once service worker is registered
    messagingInstance = getMessaging(app);
    console.log(":white_tick: Firebase Messaging Initialized");
    return messagingInstance;
  } catch (error) {
    console.error(":x: Failed to initialize messaging:", error);
    throw error;
  }
};
/**
* Request FCM token for push notifications
* @returns {Promise<string>} FCM token
*/
export const requestFCMToken = async () => {
  try {
    // Ensure messaging is initialized
    if (!messagingInstance) {
      await initializeMessaging();
    }
    // Request notification permission
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      throw new Error(":x: Notification permission denied");
    }
    // Get FCM token
    const token = await getToken(messagingInstance, { vapidKey });
    console.log(":calling: FCM Token:", token);
    // Save token to database or server
    await saveTokenToDatabase(token);
    return token;
  } catch (error) {
    console.error(":x: Error getting FCM token:", error);
    throw error;
  }
};
/**
* Save FCM token to database
* @param {string} token - FCM token
*/
const saveTokenToDatabase = async (token) => {
  try {
    console.log(":satellite_antenna: Saving FCM Token:", token);
    // Example: Save to Firestore under current user
    const user = auth.currentUser;
    if (user) {
      await setDoc(doc(db, "deviceTokens", user.uid), {
        fcmToken: token,
        tokenLastUpdated: serverTimestamp()
      }, { merge: true });
    }
  } catch (error) {
    console.error(":x: Error saving token:", error);
  }
};
/**
* Listen for foreground messages
* @returns {Promise} Resolves with the message payload
*/
export const onForegroundMessage = () => {
  // eslint-disable-next-line no-async-promise-executor
  return new Promise(async (resolve) => {
    try {
      // Ensure messaging is initialized
      if (!messagingInstance) {
        await initializeMessaging();
      }
      // Set up message handler
      onMessage(messagingInstance, (payload) => {
        console.log(":envelope_with_arrow: Foreground Message Received:", payload);
        resolve(payload);
      });
    } catch (error) {
      console.error(":x: Error setting up message listener:", error);
    }
  });
};
// Initialize Firebase Messaging on module load
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    initializeMessaging().then(() => {
      console.log(":rocket: Firebase messaging ready");
      requestFCMToken();
    });
  });
}
// Export Firebase Timestamp
export { serverTimestamp };