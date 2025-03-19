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
      
      console.log('Fetched Notifications:', response.data); // Log notification data
      
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
  async ({ notificationId, traineeId }, { getState, rejectWithValue }) => {
    try {
      const response = await axios.put(
        `${BASE_URL}/messages/${notificationId}/read`,
        { traineeId },
        getHeaders(getState)
      );
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

export const fetchNotificationStatus = createAsyncThunk(
  'notifications/status',
  async (traineeId, { getState, rejectWithValue }) => {
    try {
      const response = await axios.get(
        `${BASE_URL}/notifications/status/${traineeId}`,
        getHeaders(getState)
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch notification status' });
    }
  }
);

export const notifyAbsentTrainees = createAsyncThunk(
  'notifications/notifyAbsent',
  async (absenceData, { getState, rejectWithValue }) => {
    try {
      const response = await axios.post(
        `${BASE_URL}/notifications/absent`,
        absenceData,
        getHeaders(getState)
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to notify absent trainees' });
    }
  }
);

export const submitAbsenceProof = createAsyncThunk(
  'notifications/submitAbsenceProof',
  async (proofData, { getState, rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(proofData).forEach(key => formData.append(key, proofData[key]));
      
      const response = await axios.post(
        `${BASE_URL}/absence/proof`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${getState().auth.token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || { message: 'Failed to submit absence proof' });
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
  },
  extraReducers: (builder) => {
    // FCM Token Handling
    builder.addCase(generateFCMToken.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(generateFCMToken.fulfilled, (state, action) => {
      state.loading = false;
      state.fcmToken = action.payload;
      state.fcmEnabled = true;
    });
    builder.addCase(generateFCMToken.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.fcmEnabled = false;
    });

    // Notification Fetching
    builder.addCase(fetchNotifications.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchNotifications.fulfilled, (state, action) => {
      state.loading = false;
      state.notifications = action.payload;
      state.unreadCount = action.payload.filter(n => !n.read).length;
    });
    builder.addCase(fetchNotifications.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload;
    });

    // Unread Count Handling
    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload;
    });

    // Mark as Read
    builder.addCase(markAsRead.fulfilled, (state, action) => {
      const updated = action.payload;
      state.notifications = state.notifications.map(n => 
        n.id === updated.id ? { ...n, read: true } : n
      );
      state.unreadCount = state.notifications.filter(n => !n.read).length;
    });

    // Create Notification
    builder.addCase(createNotification.fulfilled, (state, action) => {
      state.notifications.unshift(action.payload);
    });

    // Delete Notification
    builder.addCase(deleteNotification.fulfilled, (state, action) => {
      state.notifications = state.notifications.filter(n => n.id !== action.payload);
      state.unreadCount = state.notifications.filter(n => !n.read).length;
    });

    // Notification Status
    builder.addCase(fetchNotificationStatus.fulfilled, (state, action) => {
      state.notificationStatus = action.payload;
    });

    // Absent Notifications
    builder.addCase(notifyAbsentTrainees.fulfilled, (state, action) => {
      state.absentTraineeNotification = action.payload;
    });
    builder.addCase(notifyAbsentTrainees.rejected, (state, action) => {
      state.error = action.payload;
    });

    // Absence Proof
    builder.addCase(submitAbsenceProof.fulfilled, (state, action) => {
      state.absenceProof = action.payload;
    });
    builder.addCase(submitAbsenceProof.rejected, (state, action) => {
      state.error = action.payload;
    });
  },
});

export const { clearNotificationsError, toggleFCMEnabled } = notificationsSlice.actions;
export default notificationsSlice.reducer;