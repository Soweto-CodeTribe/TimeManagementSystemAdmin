// NotificationManager.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  generateFCMToken, 
  setupFCMListener, 
  fetchNotifications, 
  fetchUnreadCount, 
  toggleFCMEnabled 
} from '../Slices/notificationsSlice';
import { BellIcon, BellOffIcon, LoaderCircle } from 'lucide-react';
import './styling/NotificationManager.css';

const NotificationManager = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { fcmEnabled, fcmToken, loading } = useSelector((state) => state.notifications);
  const [showBanner, setShowBanner] = useState(false);
  const [message, setMessage] = useState(null);

  // Initialize Firebase Messaging when component mounts
  useEffect(() => {
    if (user?.id && !fcmToken && 'serviceWorker' in navigator) {
      // Ask for notification permission and setup FCM
      setupNotifications();
    }
  }, [user]);

  // Setup FCM notifications
  const setupNotifications = async () => {
    try {
      // Generate FCM token
      await dispatch(generateFCMToken()).unwrap();
      
      // Setup message listener
      dispatch(setupFCMListener());
      
      // Fetch initial notifications
      dispatch(fetchNotifications(user.id));
      dispatch(fetchUnreadCount(user.id));
      
      showNotificationBanner('Notifications enabled successfully!', 'success');
    } catch (error) {
      console.error('Failed to setup notifications:', error);
      showNotificationBanner('Failed to enable notifications. Please try again.', 'error');
    }
  };

  // Toggle notifications on/off
  const handleToggleNotifications = async () => {
    if (fcmEnabled) {
      // Disable notifications
      dispatch(toggleFCMEnabled(false));
      showNotificationBanner('Notifications disabled', 'info');
    } else {
      // Enable notifications
      await setupNotifications();
    }
  };

  // Show notification banner
  const showNotificationBanner = (msg, type = 'info') => {
    setMessage({ text: msg, type });
    setShowBanner(true);
    
    // Auto hide after 5 seconds
    setTimeout(() => {
      setShowBanner(false);
    }, 5000);
  };

  return (
    <div className="notification-manager">
      {/* Notification Toggle Button */}
      <button
        onClick={handleToggleNotifications}
        disabled={loading}
        title={fcmEnabled ? "Disable notifications" : "Enable notifications"}
      >
        {loading ? (
          <LoaderCircle className="animate-spin" />
        ) : fcmEnabled ? (
          <BellIcon className="text-blue-600" />
        ) : (
          <BellOffIcon className="text-gray-600" />
        )}
      </button>

      {/* Notification Banner */}
      {showBanner && message && (
        <div className={`notification-banner ${message.type}`}>
          <p>{message.text}</p>
          <button 
            className="close"
            onClick={() => setShowBanner(false)}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationManager;