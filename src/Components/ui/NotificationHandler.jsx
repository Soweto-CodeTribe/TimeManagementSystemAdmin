import { useEffect } from 'react';
import { 
  initializeMessaging, 
  requestFCMToken, 
  setupForegroundMessageListener 
} from '../../firebaseConfig';

function NotificationHandler() {
  useEffect(() => {
    async function setupNotifications() {
      try {
        await initializeMessaging();
        const token = await requestFCMToken();
        setupForegroundMessageListener();
      } catch (error) {
        console.error("Notification setup error:", error);
      }
    }

    setupNotifications();
  }, []);

  return null;
}

export default NotificationHandler;
;