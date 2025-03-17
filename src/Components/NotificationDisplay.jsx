import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAsRead, fetchUnreadCount } from '../Slices/notificationsSlice';
import { Bell, X, Check, Clock, ExternalLink } from 'lucide-react';
import './styling/NotificationDisplay.css';
import './styling/Notifications.css';

const CombinedNotifications = () => {
  const dispatch = useDispatch();
  const { notifications, unreadCount, loading, error } = useSelector((state) => state.notifications);
  const { user } = useSelector((state) => state.auth);
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState('panel'); // 'panel' or 'full'

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
    // If closing panel and in full view mode, switch back to panel mode
    if (isOpen && viewMode === 'full') {
      setViewMode('panel');
    }
  };

  const switchToFullView = () => {
    setViewMode('full');
  };

  const switchToPanelView = () => {
    setViewMode('panel');
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

      {/* Notification Panel or Full View */}
      {isOpen && (
        <div className={`${viewMode === 'panel' ? 'notification-panel' : 'notifications-container'}`}>
          <div className="panel-header">
            <h3 className="panel-title">Notifications</h3>
            <div className="panel-controls">
              {viewMode === 'panel' ? (
                <button onClick={switchToFullView} className="view-mode-button">
                  Show Full View
                </button>
              ) : (
                <button onClick={switchToPanelView} className="view-mode-button">
                  Show Panel View
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="close-button"
              >
                <X className="close-icon" />
              </button>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Loading notifications...</div>
          ) : error ? (
            <div className="error-state">Error: {error}</div>
          ) : notifications?.length > 0 ? (
            viewMode === 'panel' ? (
              // Panel View (compact)
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
                    <p className="notification-message">{notification.message || notification.content}</p>
                    
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
              // Full View
              <ul className="notification-list">
                {notifications.map((notification) => (
                  <li
                    key={notification.id}
                    className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                  >
                    <div className="notification-title">{notification.title || 'Notification'}</div>
                    <div className="notification-content">{notification.content || notification.message}</div>
                    <div className="notification-meta">
                      {notification.category && <span>{notification.category}</span>}
                      {notification.priority && <span> | {notification.priority}</span>}
                      <span className="notification-date">
                        <Clock className="clock-icon" />
                        {formatDate(notification.createdAt)}
                      </span>
                    </div>
                    {!notification.read && (
                      <button
                        className="mark-read-btn"
                        onClick={() => handleMarkAsRead(notification.id)}
                      >
                        Mark as Read
                      </button>
                    )}
                    {notification.link && (
                      <a
                        href={notification.link}
                        className="view-details-link"
                      >
                        <ExternalLink className="external-icon" />
                        View details
                      </a>
                    )}
                  </li>
                ))}
              </ul>
            )
          ) : (
            <div className="empty-state">No notifications</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CombinedNotifications;