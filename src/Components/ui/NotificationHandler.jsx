import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUnreadCount, fetchUnreadNotifications } from '../../Slices/notificationsSlice';

const NotificationHandler = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);

  // Polling for unread notifications every 15 seconds
  useEffect(() => {
    if (!user?.id) return;
    // Fetch immediately on mount
    dispatch(fetchUnreadCount(user.id));
    dispatch(fetchUnreadNotifications(user.id));
    const interval = setInterval(() => {
      dispatch(fetchUnreadCount(user.id));
      dispatch(fetchUnreadNotifications(user.id));
    }, 15000); // 15 seconds
    return () => clearInterval(interval);
  }, [user, dispatch]);

  // --- SOCKET/FCM LOGIC DISABLED FOR NOW ---
  // (Commented out to prevent WebSocket error spam)
  // useEffect(() => {
  //   let socketUnsubscribe;
  //   if (token && user?.id) {
  //     try {
  //       const socket = initializeSocket(token);
  //       if (socket) {
  //         socketUnsubscribe = subscribeToNotifications(() => {
  //           dispatch(fetchUnreadCount(user.id));
  //           dispatch(fetchUnreadNotifications(user.id));
  //         });
  //       }
  //     } catch (error) {
  //       // Suppress errors
  //     }
  //   }
  //   return () => {
  //     if (socketUnsubscribe) socketUnsubscribe();
  //   };
  // }, [token, user, dispatch]);

  return null; // No rendering
};

export default NotificationHandler;