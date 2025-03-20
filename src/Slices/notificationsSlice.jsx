import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import { initializeMessaging, requestFCMToken, onForegroundMessage } from '../firebaseConfig';

// API Configuration
const BASE_URL = 'https://timemanagementsystemserver.onrender.com/api';

// Initial State
const initialState = {
  notifications: [],
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

      if(response.data.ok)
        {
          console.log("Fetched Notifications:", response.data);
        }
      return response.data;

      
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch notifications' });
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
      const response = await axios.put(
        `${BASE_URL}/messages/${notificationId}/read`,
        { traineeId },
        getHeaders(getState)
      );
      
      // If the notification was successfully marked as read, update the unread count
      if (response.data) {
        dispatch(fetchUnreadCount(traineeId));
        
      }
      
      return response.data;
    } catch (error) {
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
  async (notificationId, { getState, rejectWithValue }) => {
    try {
      await axios.delete(
        `${BASE_URL}/messages/${notificationId}`,
        getHeaders(getState)
      );
      return notificationId;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to delete notification' });
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
        state.unreadCount = action.payload.filter(n => !n.read).length;
      })
      .addCase(fetchNotifications.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch notifications';
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
  
  // Recalculate the unread count
  state.unreadCount = state.notifications.filter(n => !n.read).length;
})

.addCase(markAsRead.pending, (state) => {
  state.loading = true;
})
.addCase(markAsRead.rejected, (state, action) => {
  state.loading = false;
  state.error = action.payload || 'Failed to mark notification as read';
})
      .addCase(createNotification.fulfilled, (state, action) => {
        state.notifications.unshift(action.payload);
      })
      .addCase(deleteNotification.fulfilled, (state, action) => {
        state.notifications = state.notifications.filter(n => n.id !== action.payload);
        state.unreadCount = state.notifications.filter(n => !n.read).length;
      });
  },
});

export const { clearNotificationsError, toggleFCMEnabled } = notificationsSlice.actions;
export const { decrementUnreadCount } = notificationsSlice.actions;
export default notificationsSlice.reducer;