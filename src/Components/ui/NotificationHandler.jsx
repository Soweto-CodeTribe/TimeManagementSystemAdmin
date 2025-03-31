import React, { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, initializeMessaging } from '../../firebaseConfig';

const NotificationHandler = () => {
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        // Listen for authentication state changes
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            try {
              // Request notification permission for authenticated users
              await initializeMessaging.requestNotificationPermission();
            } catch (error) {
              console.error('Notification setup failed:', error);
            }
          } else {
            console.log('No user signed in. Skipping notification setup.');
          }
        });

        // Optional: Set up foreground message listener
        initializeMessaging.onMessageListener()
          .then((payload) => {
            // Handle foreground notifications
            if (payload?.notification) {
              // Example: show desktop notification
              new Notification(
                payload.notification.title, 
                { body: payload.notification.body }
              );
            }
          })
          .catch(error => console.error('Message listener error:', error));

      } catch (error) {
        console.error('Notification initialization error:', error);
      }
    };

    setupNotifications();

    // Cleanup function
    return () => {
      // Any cleanup logic if needed
    };
  }, []);

  return null; // No rendering
};

export default NotificationHandler;