import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { 
  auth, 
  initializeMessaging, 
  requestNotificationPermission, 
  onMessageListener 
} from '../../firebaseConfig';
import { initializeSocket, subscribeToNotifications } from '../../utils/socketClient';
import { fetchUnreadCount, fetchUnreadNotifications } from '../../Slices/notificationsSlice';

const NotificationHandler = () => {
  const dispatch = useDispatch();
  const token = useSelector((state) => state.auth.token);
  const user = useSelector((state) => state.auth.user);

  // Add authentication check before initializing notifications
  useEffect(() => {
    let authUnsubscribe;
    let isComponentMounted = true;

    const setupNotifications = async () => {
      try {
        // Listen for authentication state changes
        authUnsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
          if (firebaseUser && user && isComponentMounted) {
            try {
              console.log('Setting up notifications for authenticated user');

              // Initialize Firebase Messaging
              await initializeMessaging();

              // Request notification permission and get FCM token
              const fcmToken = await requestNotificationPermission();
              if (fcmToken) {
                console.log('FCM token obtained successfully');
              }
            } catch (error) {
              console.error('Notification setup failed:', error);
            }
          } else {
            console.log('No user signed in. Skipping notification setup.');
          }
        });

        // Set up foreground message listener
        if (user) {
          try {
            onMessageListener()
              .then((payload) => {
                console.log('Foreground notification received:', payload);
              })
              .catch((error) => {
                console.error('Error in foreground message listener:', error);
              });
          } catch (error) {
            console.error('Error setting up message listener:', error);
          }
        }
      } catch (error) {
        console.error('Error in setupNotifications:', error);
      }
    };

    setupNotifications();

    return () => {
      isComponentMounted = false;
      if (authUnsubscribe) authUnsubscribe();
    };
  }, [user]);

  // --- SOCKET NOTIFICATION HANDLING ---
  useEffect(() => {
    let socketUnsubscribe;

    if (token && user?.id) {
      try {
        // Initialize socket with error handling
        const socket = initializeSocket(token);
        
        if (socket) {
          // Subscribe to socket notifications
          socketUnsubscribe = subscribeToNotifications(() => {
            // On any socket notification, update unread count and notifications
            dispatch(fetchUnreadCount(user.id));
            dispatch(fetchUnreadNotifications(user.id));
          });
        } else {
          console.warn('Failed to initialize socket connection');
        }
      } catch (error) {
        console.error('Socket setup error:', error);
      }
    }

    return () => {
      if (socketUnsubscribe) {
        socketUnsubscribe();
      }
    };
  }, [token, user, dispatch]);

  return null; // No rendering
};

export default NotificationHandler;