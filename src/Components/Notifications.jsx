import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchNotifications, markAsRead, deleteNotification } from '../Slices/notificationsSlice';
import { FiMoreVertical, FiSearch, FiX } from 'react-icons/fi';
import './styling/NotificationsPanel.css'; 

const NotificationsPanel = () => {
  const dispatch = useDispatch();
  const { notifications, loading, error } = useSelector((state) => state.notifications);
  const traineeId = localStorage.getItem('userId');

  const [selectedNotification, setSelectedNotification] = useState(null);
  const [menuOpen, setMenuOpen] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // Default to showing all notifications
  const [localNotifications, setLocalNotifications] = useState([]);
  const [readHistory, setReadHistory] = useState([]); // Track which notifications were read
  const [confirmDelete, setConfirmDelete] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await dispatch(fetchNotifications(traineeId));
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchData();
    
    // Load read history from localStorage if available
    const savedReadHistory = localStorage.getItem('readNotifications');
    if (savedReadHistory) {
      setReadHistory(JSON.parse(savedReadHistory));
    }
  }, [dispatch, traineeId]);

  // Update local notifications when redux state changes
  useEffect(() => {
    if (notifications) {
      // Apply read status from both the server and local read history
      const updatedNotifications = notifications.map(notification => {
        const wasReadLocally = readHistory.includes(notification.id);
        return {
          ...notification,
          read: notification.read || wasReadLocally
        };
      });
      setLocalNotifications(updatedNotifications);
    }
  }, [notifications, readHistory]);

  const handleNotificationClick = (notification) => {
    setSelectedNotification(notification);
    if (!notification.read) {
      // Mark as read in the backend
      dispatch(markAsRead({ 
        notificationId: notification.id, 
        traineeId 
      }));
      
      // Update local read history
      const updatedReadHistory = [...readHistory, notification.id];
      setReadHistory(updatedReadHistory);
      
      // Save to localStorage
      localStorage.setItem('readNotifications', JSON.stringify(updatedReadHistory));
      
      // Update local state
      setLocalNotifications(prevNotifications => 
        prevNotifications.map(item => 
          item.id === notification.id ? { ...item, read: true } : item
        )
      );
    }
  };

  const handleClosePopup = () => setSelectedNotification(null);

  const toggleMenu = (notificationId, event) => {
    event.stopPropagation();
    setMenuOpen(menuOpen === notificationId ? null : notificationId);
  };

  const handleMarkAsRead = (notification, event) => {
    event.stopPropagation(); // Prevent notification click
    
    // Only process if not already read
    if (!notification.read) {
      // Mark as read in the backend
      dispatch(markAsRead({ 
        notificationId: notification.id, 
        traineeId 
      }));
      
      // Update local read history
      const updatedReadHistory = [...readHistory, notification.id];
      setReadHistory(updatedReadHistory);
      
      // Save to localStorage
      localStorage.setItem('readNotifications', JSON.stringify(updatedReadHistory));
      
      // Update local state
      setLocalNotifications(prevNotifications => 
        prevNotifications.map(item => 
          item.id === notification.id ? { ...item, read: true } : item
        )
      );
    }
    
    setMenuOpen(null);
  };
  
  const handleMarkAsUnread = (notification, event) => {
    event.stopPropagation(); // Prevent notification click
    
    // Only process if already read
    if (notification.read) {
      // Update local read history by removing this notification ID
      const updatedReadHistory = readHistory.filter(id => id !== notification.id);
      setReadHistory(updatedReadHistory);
      
      // Save to localStorage
      localStorage.setItem('readNotifications', JSON.stringify(updatedReadHistory));
      
      // Update local state
      setLocalNotifications(prevNotifications => 
        prevNotifications.map(item => 
          item.id === notification.id ? { ...item, read: false } : item
        )
      );
      
      // You would also need to update your backend if it tracks read status
      // This would require a new action in your slice, like markAsUnread
    }
    
    setMenuOpen(null);
  };

  // New function to start the deletion process
  const initiateDelete = (notificationId, event) => {
    event.stopPropagation(); // Prevent notification click
    setConfirmDelete(notificationId); // Set the ID of notification to be deleted
    setMenuOpen(null); // Close the menu
  };

  // Function to confirm deletion
  const confirmDeleteNotification = () => {
    if (confirmDelete) {
      dispatch(deleteNotification({ 
        notificationId: confirmDelete,
        traineeId: localStorage.getItem('userId') // ✅ Correct
      }));
      // Update local state to remove the notification
      setLocalNotifications(prevNotifications => 
        prevNotifications.filter(item => item.id !== confirmDelete)
      );
      
      // Close the notification popup if it was selected
      if (selectedNotification && selectedNotification.id === confirmDelete) {
        setSelectedNotification(null);
      }
      
      // Reset confirmation state
      setConfirmDelete(null);
    }
  };

  // Function to cancel deletion
  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (timestamp && timestamp._seconds !== undefined) {
      const date = new Date(timestamp._seconds * 1000);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return timestamp || 'N/A';
  };

  // Filter notifications based on search query and active tab
  const filteredNotifications = localNotifications.filter(notification => {
    const matchesSearch = 
      notification.title?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      notification.content?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      notification.senderName?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesTab = activeTab === 'all' || (activeTab === 'unread' && !notification.read);
    
    return matchesSearch && matchesTab;
  });

  // Separate read and unread notifications
  const readNotifications = filteredNotifications.filter(n => n.read);
  const unreadNotifications = filteredNotifications.filter(n => !n.read);
  
  // Combine so unread appear at the top
  const sortedNotifications = [...unreadNotifications, ...readNotifications];

  if (loading) return <p>Loading notifications...</p>;
  if (error) return <p>Error: {error}</p>;

  const unreadCount = localNotifications.filter(n => !n.read).length;
  const hasUnread = unreadCount > 0;

  return (
    <div className="notifications-panel">
      <div className="notifications-header">
        <h2>Notifications {unreadCount > 0 && <span className="unread-count">({unreadCount})</span>}</h2>
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'unread' ? 'active' : ''}`}
            onClick={() => setActiveTab('unread')}
          >
            Unread
          </button>
          <button 
            className={`tab-button ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All
          </button>
        </div>
      </div>

      <div className="search-bar">
        <div className="search-icon">
          <FiSearch />
        </div>
        <input
          type="text"
          className="search-input"
          placeholder="Search notifications..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <div className="clear-search" onClick={clearSearch}>
            <FiX />
          </div>
        )}
      </div>

      {sortedNotifications.length === 0 ? (
        <div className="empty-state">
          {activeTab === 'unread' && !hasUnread 
            ? "No unread notifications found." 
            : "No matching notifications found."}
        </div>
      ) : (
        <>
          {activeTab === 'all' && readNotifications.length > 0 && (
            <div className="section-divider">
              <h3>Previously Read</h3>
            </div>
          )}
          <ul className="notifications-list">
            {sortedNotifications.map((notification) => (
              <li
                key={notification.id}
                className={`notification-item ${!notification.read ? 'unread' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-content">
                  <div className="notification-title">
                    {notification.title}
                    {!notification.read && <span className="unread-indicator"></span>}
                  </div>
                  <p className="notification-message">{notification.content}</p>
                  <div className="notification-meta">
                    <span>{notification.senderName || 'System'}</span>
                    <span>{formatTime(notification.createdAt)}</span>
                  </div>
                </div>
                <div className="notification-actions">
                  <button onClick={(e) => toggleMenu(notification.id, e)} className="more-actions">
                    <FiMoreVertical />
                  </button>
                  {menuOpen === notification.id && (
                    <div className="actions-menu">
                      {notification.read ? (
                        <button onClick={(e) => handleMarkAsUnread(notification, e)}>
                          Mark as Unread
                        </button>
                      ) : (
                        <button onClick={(e) => handleMarkAsRead(notification, e)}>
                          Mark as Read
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </>
      )}

      {selectedNotification && (
        <div className="notification-popup">
          <div className="popup-content">
            {/* Header */}
            <div className="popup-header">
              <h3>{selectedNotification.title}</h3>
              <button onClick={handleClosePopup} className="popup-close">
                <FiX size={20} />
              </button>
            </div>
        
            {/* Meta Information */}
            <div className="popup-meta">
              From: {selectedNotification.senderName || 'System'} • {formatTime(selectedNotification.createdAt)}
            </div>
        
            {/* Notification Body */}
            <div className="popup-body">
              <p>{selectedNotification.content}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationsPanel;