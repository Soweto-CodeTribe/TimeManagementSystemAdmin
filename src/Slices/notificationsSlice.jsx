import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { initializeMessaging, requestFCMToken, onForegroundMessage } from '../firebaseConfig';

// API Configuration
const BASE_URL = 'https://timemanagementsystemserver.onrender.com/api';

// Initial State
const initialState = {
  notifications: [],
  unreadNotifications: [], // Added for storing unread notifications
  unreadCount: 0,
  loading: false,
  error: null,
  notificationStatus: null,
  absentTraineeNotification: null,
  absenceProof: null,
  fcmToken: null,
  fcmEnabled: false,
};

// Helper function for authorization headers
const getHeaders = (getState) => ({
  headers: {
    Authorization: `Bearer ${getState().auth.token}`,
    'Content-Type': 'application/json',
  },
});

// FCM Token Generation
export const generateFCMToken = createAsyncThunk(
  'notifications/generateFCMToken',
  async (_, { getState, rejectWithValue }) => {
    try {
      await initializeMessaging();
      const token = await requestFCMToken();
      
      if (getState().auth.token && getState().auth.user?.id) {
        await axios.post(
          `${BASE_URL}/users/fcm-token`, 
          { 
            userId: getState().auth.user.id,
            fcmToken: token,
            deviceType: 'web'
          }, 
          getHeaders(getState)
        );
      }
      return token;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to generate FCM token');
    }
  }
);

// FCM Message Listener Setup
export const setupFCMListener = createAsyncThunk(
  'notifications/setupFCMListener',
  async (_, { dispatch, getState }) => {
    onForegroundMessage().then((payload) => {
      if (payload.data?.notificationType === 'newMessage') {
        const traineeId = getState().auth.user?.id;
        if (traineeId) {
          dispatch(fetchNotifications(traineeId));
          dispatch(fetchUnreadCount(traineeId));
          dispatch(fetchUnreadNotifications(traineeId)); // Added to also refresh unread notifications
        }
      }
    });
  }
);

// Core Notification Operations
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (traineeId, { getState, rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/messages/trainee/${traineeId}`,
        getHeaders(getState)
      );

      if(response.data.ok) {
        console.log("Fetched Notifications:", response.data);
      }
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch notifications' });
    }
  }
);

// New thunk for fetching only unread notifications
export const fetchUnreadNotifications = createAsyncThunk(
  'notifications/fetchUnread',
  async (traineeId, { getState, rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/messages/trainee/${traineeId}`,
        getHeaders(getState)
      );
      
      // Filter only unread notifications from the response
      const unreadNotifications = response.data.filter(notification => !notification.read);
      return unreadNotifications;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch unread notifications' });
    }
  }
);

export const fetchUnreadCount = createAsyncThunk(
  'notifications/unreadCount',
  async (traineeId, { getState, rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/messages/unread/${traineeId}`,
        getHeaders(getState)
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch unread count' });
    }
  }
);

export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async ({ notificationId, traineeId }, { getState, rejectWithValue, dispatch }) => {
    try {
      // First, optimistically update the UI by decrementing the unread count
      dispatch(decrementUnreadCount());
      
      // Then make the API call to update the server
      const response = await axios.put(
        `${BASE_URL}/messages/${notificationId}/read`,
        { traineeId },
        getHeaders(getState)
      );
      
      return { ...response.data, id: notificationId }; // Ensure id is returned
    } catch (error) {
      // If the API call fails, we should restore the unread count
      // You could add another action to increment the count back
      return rejectWithValue(error.response?.data || { message: 'Failed to mark notification as read' });
    }
  }
);

export const createNotification = createAsyncThunk(
  'notifications/create',
  async (messageData, { getState, rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/messages`,
        messageData,
        getHeaders(getState)
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to create notification' });
    }
  }
);



export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async ({ notificationId, traineeId }, { getState, rejectWithValue }) => { // Accept traineeId
    try {
      await axios.delete(
        `${BASE_URL}/messages/${notificationId}`, // URL is correct
        {
          headers: getHeaders(getState),
          data: { traineeId } // Include traineeId in the request body
        }
      );
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data || 'Failed to delete notification');
    }
  }
);

// Slice Definition
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationsError: (state) => {
      state.error = null;
    },
    toggleFCMEnabled: (state, action) => {
      state.fcmEnabled = action.payload;
    },
    decrementUnreadCount: (state) => {
      if (state.unreadCount > 0) {
        state.unreadCount -= 1;
      }
    },
    // Add an increment action in case we need to restore the count after a failed API call
    incrementUnreadCount: (state) => {
      state.unreadCount += 1;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(generateFCMToken.pending, (state) => { state.loading = true; })
      .addCase(generateFCMToken.fulfilled, (state, action) => {
        state.loading = false;
        state.fcmToken = action.payload;
        state.fcmEnabled = true;
      })
      .addCase(generateFCMToken.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.fcmEnabled = false;
      })
      .addCase(fetchNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.notifications = action.payload;
        // Only update unread count if we don't have specific unread count from API
        if (!state.unreadCount) {
          state.unreadCount = action.payload.filter(n => !n.read).length;
        }
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch notifications';
      })
      // Handle the new fetchUnreadNotifications thunk
      .addCase(fetchUnreadNotifications.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUnreadNotifications.fulfilled, (state, action) => {
        state.loading = false;
        state.unreadNotifications = action.payload;
        // Update unread count based on the length of unread notifications
        state.unreadCount = action.payload.length;
      })
      .addCase(fetchUnreadNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch unread notifications';
      })
      .addCase(fetchUnreadCount.fulfilled, (state, action) => {
        state.unreadCount = action.payload;
      })
      .addCase(markAsRead.fulfilled, (state, action) => {
        // Find the notification and update its read status
        const notification = state.notifications.find(n => n.id === action.payload.id);
        if (notification) {
          notification.read = true;
        }
        
        // Update the notifications array to reflect the change
        state.notifications = state.notifications.map(n => 
          n.id === action.payload.id ? { ...n, read: true } : n
        );
        
        // Also remove from unreadNotifications array
        state.unreadNotifications = state.unreadNotifications.filter(
          n => n.id !== action.payload.id
        );
        
        // Note: We don't need to recalculate unreadCount here since we've already
        // decremented it optimistically in the decrementUnreadCount action
      })
      .addCase(markAsRead.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to mark notification as read';
        // You could increment the count back here if the API call fails
        // But this would require tracking which notification failed
      })
      .addCase(createNotification.fulfilled, (state, action) => {
        state.notifications.unshift(action.payload);
        // If the new notification is unread, add it to unreadNotifications as well
        if (!action.payload.read) {
          state.unreadNotifications.unshift(action.payload);
          state.unreadCount += 1;
        }
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        // Check if the deleted notification was unread before removing
        const deletedNotification = state.notifications.find(n => n.id === action.payload);
        const wasUnread = deletedNotification && !deletedNotification.read;
        
        // Remove the notification from both arrays
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
        state.unreadNotifications = state.unreadNotifications.filter(n => n.id !== action.payload);
        
        // Decrement unread count if the deleted notification was unread
        if (wasUnread && state.unreadCount > 0) {
          state.unreadCount -= 1;
        }
      });
  },
});

export const { clearNotificationsError, toggleFCMEnabled, decrementUnreadCount, incrementUnreadCount } = notificationsSlice.actions;
export default notificationsSlice.reducer;