// NotificationDisplay.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAsRead, fetchUnreadCount } from '../Slices/notificationsSlice';
import { Bell, X, Check, Clock, ExternalLink } from 'lucide-react';
import './styling/NotificationDisplay.css';

const NotificationDisplay = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading } = useSelector((state) => state.notifications);
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (user?.id) {
      dispatch(fetchNotifications(user.id));
      dispatch(fetchUnreadCount(user.id));
    }
  }, [dispatch, user?.id]);

  const handleMarkAsRead = (notificationId) => {
    if (user?.id) {
      dispatch(markAsRead({ notificationId, traineeId: user.id }));
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const toggleNotifications = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="notification-display">
      {/* Notification Bell */}
      <button
        onClick={toggleNotifications}
        className="notification-bell"
      >
        <Bell className="bell-icon" />
        {unreadCount > 0 && (
          <span className="notification-badge">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <div className="notification-panel">
          <div className="panel-header">
            <h3 className="panel-title">Notifications</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="close-button"
            >
              <X className="close-icon" />
            </button>
          </div>

          {loading ? (
            <div className="loading-state">Loading notifications...</div>
          ) : notifications?.length > 0 ? (
            <div className="notifications-list">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`notification-item ${!notification.read ? 'unread' : ''}`}
                >
                  <div className="notification-header">
                    <h4 className="notification-title">{notification.title || 'Notification'}</h4>
                    <span className="notification-date">
                      <Clock className="clock-icon" />
                      {formatDate(notification.createdAt)}
                    </span>
                  </div>
                  <p className="notification-message">{notification.message}</p>
                  
                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="action-button"
                    >
                      <Check className="check-icon" />
                      Mark as read
                    </button>
                  )}
                  
                  {notification.link && (
                    <a
                      href={notification.link}
                      className="action-button"
                    >
                      <ExternalLink className="external-icon" />
                      View details
                    </a>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">No notifications</div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationDisplay;