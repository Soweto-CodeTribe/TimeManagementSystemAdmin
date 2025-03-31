import { useEffect, useState } from 'react';
import { subscribeToNotifications, subscribeToStatusChanges } from './socketClient';

const NotificationListener = () => {
  const [notifications, setNotifications] = useState([]);
  const [statusChanges, setStatusChanges] = useState([]);

  useEffect(() => {
    // Subscribe to notifications
    const unsubscribeNotifications = subscribeToNotifications((data) => {
      setNotifications(prev => [data, ...prev].slice(0, 5)); // Keep last 5 notifications
    });
    
    // Subscribe to status changes
    const unsubscribeStatusChanges = subscribeToStatusChanges((data) => {
      setStatusChanges(prev => [data, ...prev].slice(0, 3)); // Keep last 3 status changes
    });
    
    // Clean up subscriptions
    return () => {
      unsubscribeNotifications();
      unsubscribeStatusChanges();
    };
  }, []);

  // If no notifications yet, don't render
  if (notifications.length === 0 && statusChanges.length === 0) return null;

  return (
    <div className="notification-sidebar">
      <h3>Recent Updates</h3>
      
      {notifications.length > 0 && (
        <div className="notification-section">
          <h4>Notifications</h4>
          <ul className="notification-list">
            {notifications.map((notification, index) => (
              <li key={`notification-${index}`} className="notification-item">
                <span className="notification-subject">{notification.subject}</span>
                <div className="notification-message">{notification.message}</div>
                <div className="notification-time">
                  {new Date(notification.timestamp).toLocaleTimeString()}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {statusChanges.length > 0 && (
        <div className="status-section">
          <h4>Status Changes</h4>
          <ul className="status-list">
            {statusChanges.map((status, index) => (
              <li key={`status-${index}`} className="status-item">
                <span className={`status-badge ${status.status}`}>{status.status}</span>
                <div className="status-message">{status.message}</div>
                {status.endDate && (
                  <div className="status-end-date">
                    Until: {new Date(status.endDate).toLocaleDateString()}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationListener;