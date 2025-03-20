import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAsRead } from '../Slices/notificationsSlice';
import './styling/Notifications.css';
const Notifications = () => {
  const dispatch = useDispatch();
  const { notifications, loading, error } = useSelector((state) => state.notifications);
  const traineeId = 'lqEizK0FRVMkjxazH74yfQseIK62'; // Use dynamic ID, just for now using hardcoded value
  useEffect(() => {
    dispatch(fetchNotifications(traineeId));
  }, [dispatch, traineeId]);
  const handleMarkAsRead = (notificationId) => {
    dispatch(markAsRead({ notificationId, traineeId }));
  };
  if (loading) return <p>Loading notifications...</p>;
  if (error) return <p>Error: {error}</p>;
  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      <ul className="notification-list">
        {notifications.map((notification) => (
          <li
            key={notification.id}
            className={`notification-item ${notification.read ? 'read' : 'unread'}`}
          >
            <div className="notification-title">{notification.title}</div>
            <div className="notification-content">{notification.content}</div>
            <div className="notification-meta">
              <span>{notification.category}</span> | <span>{notification.priority}</span>
            </div>
            {!notification.read && (
              <button
                className="mark-read-btn"
                onClick={() => handleMarkAsRead(notification.id)}
              >
                Mark as Read
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};
export default Notifications;