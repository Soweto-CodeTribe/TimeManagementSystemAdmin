// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';

// // API base URL
// const BASE_URL = 'https://timemanagementsystemserver.onrender.com/api';

// // Notifications State Interface
// const initialState = {
//   notifications: [],
//   unreadCount: 0,
//   loading: false,
//   error: null,
//   notificationStatus: null,
// };

// // Fetch All Messages
// export const fetchNotifications = createAsyncThunk(
//   'notifications/fetchAll',
//   async (traineeId, { getState, rejectWithValue }) => {
//     try {
//       const { auth } = getState();
//       const response = await axios.get(`${BASE_URL}/messages/trainee/${traineeId}`, {
//         headers: {
//           'Authorization': `Bearer ${auth.token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       return response.data;
//     } catch (error) {
//       console.error('Fetch Notifications Error:', error);
//       return rejectWithValue(error.response?.data || { message: 'Failed to fetch notifications' });
//     }
//   }
// );

// // Get Unread Message Count
// export const fetchUnreadCount = createAsyncThunk(
//   'notifications/unreadCount',
//   async (traineeId, { getState, rejectWithValue }) => {
//     try {
//       const { auth } = getState();
//       const response = await axios.get(`${BASE_URL}/messages/unread/${traineeId}`, {
//         headers: {
//           'Authorization': `Bearer ${auth.token}`,
//           'Content-Type': 'application/json'
//         }
//       });
      
//       return response.data;
//     } catch (error) {
//       console.error('Fetch Unread Count Error:', error);
//       return rejectWithValue(error.response?.data || { message: 'Failed to fetch unread count' });
//     }
//   }
// );

// // Mark Notification as Read
// export const markAsRead = createAsyncThunk(
//   'notifications/markAsRead',
//   async ({ notificationId, traineeId }, { getState, rejectWithValue }) => {
//     try {
//       const { auth } = getState();
//       const response = await axios.put(
//         `${BASE_URL}/messages/${notificationId}/read`, 
//         { traineeId },
//         {
//           headers: {
//             'Authorization': `Bearer ${auth.token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
      
//       return response.data;
//     } catch (error) {
//       console.error('Mark Notification Read Error:', error);
//       return rejectWithValue(error.response?.data || { message: 'Failed to mark notification as read' });
//     }
//   }
// );

// // Create New Message (Facilitator Only)
// export const createNotification = createAsyncThunk(
//   'notifications/create',
//   async (messageData, { getState, rejectWithValue }) => {
//     try {
//       const { auth } = getState();
//       const response = await axios.post(
//         `${BASE_URL}/messages`, 
//         messageData,
//         {
//           headers: {
//             'Authorization': `Bearer ${auth.token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
      
//       return response.data;
//     } catch (error) {
//       console.error('Create Notification Error:', error);
//       return rejectWithValue(error.response?.data || { message: 'Failed to create notification' });
//     }
//   }
// );

// // Delete Message (Facilitator Only)
// export const deleteNotification = createAsyncThunk(
//   'notifications/delete',
//   async (notificationId, { getState, rejectWithValue }) => {
//     try {
//       const { auth } = getState();
//       await axios.delete(
//         `${BASE_URL}/messages/${notificationId}`, 
//         {
//           headers: {
//             'Authorization': `Bearer ${auth.token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
      
//       return notificationId;
//     } catch (error) {
//       console.error('Delete Notification Error:', error);
//       return rejectWithValue(error.response?.data || { message: 'Failed to delete notification' });
//     }
//   }
// );

// // Get Trainee Notification Status
// export const fetchNotificationStatus = createAsyncThunk(
//   'notifications/status',
//   async (traineeId, { getState, rejectWithValue }) => {
//     try {
//       const { auth } = getState();
//       const response = await axios.get(
//         `${BASE_URL}/notifications/status/${traineeId}`, 
//         {
//           headers: {
//             'Authorization': `Bearer ${auth.token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
      
//       return response.data;
//     } catch (error) {
//       console.error('Fetch Notification Status Error:', error);
//       return rejectWithValue(error.response?.data || { message: 'Failed to fetch notification status' });
//     }
//   }
// );

// // Notifications Slice
// const notificationsSlice = createSlice({
//   name: 'notifications',
//   initialState,
//   reducers: {
//     clearNotificationsError: (state) => {
//       state.error = null;
//     }
//   },
//   extraReducers: (builder) => {
//     // Fetch Notifications
//     builder.addCase(fetchNotifications.pending, (state) => {
//       state.loading = true;
//       state.error = null;
//     });
//     builder.addCase(fetchNotifications.fulfilled, (state, action) => {
//       state.loading = false;
//       state.notifications = action.payload;
//       state.unreadCount = action.payload.filter(n => !n.read).length;
//     });
//     builder.addCase(fetchNotifications.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload;
//     });

//     // Fetch Unread Count
//     builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
//       state.unreadCount = action.payload;
//     });

//     // Mark As Read
//     builder.addCase(markAsRead.fulfilled, (state, action) => {
//       const updatedNotification = action.payload;
//       state.notifications = state.notifications.map(notification => 
//         notification.id === updatedNotification.id 
//           ? { ...notification, read: true } 
//           : notification
//       );
//       state.unreadCount = state.notifications.filter(n => !n.read).length;
//     });

//     // Create Notification
//     builder.addCase(createNotification.fulfilled, (state, action) => {
//       state.notifications.unshift(action.payload);
//     });

//     // Delete Notification
//     builder.addCase(deleteNotification.fulfilled, (state, action) => {
//       state.notifications = state.notifications.filter(
//         notification => notification.id !== action.payload
//       );
//       state.unreadCount = state.notifications.filter(n => !n.read).length;
//     });

//     // Fetch Notification Status
//     builder.addCase(fetchNotificationStatus.fulfilled, (state, action) => {
//       state.notificationStatus = action.payload;
//     });
//   }
// });

// export const { clearNotificationsError } = notificationsSlice.actions;
// export default notificationsSlice.reducer;


// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
// import axios from 'axios';

// // API base URL
// const BASE_URL = 'https://timemanagementsystemserver.onrender.com/api';

// // Notifications State Interface
// const initialState = {
//   notifications: [],
//   unreadCount: 0,
//   loading: false,
//   error: null,
//   notificationStatus: null,
//   absentTraineeNotification: null,
//   absenceProof: null,
// };

// // Previous thunks remain the same...

// // Notify Absent Trainees (Facilitator Only)
// export const notifyAbsentTrainees = createAsyncThunk(
//   'notifications/notifyAbsent',
//   async (absenceData, { getState, rejectWithValue }) => {
//     try {
//       const { auth } = getState();
//       const response = await axios.post(
//         `${BASE_URL}/notifications/absent`, 
//         absenceData,
//         {
//           headers: {
//             'Authorization': `Bearer ${auth.token}`,
//             'Content-Type': 'application/json'
//           }
//         }
//       );
      
//       return response.data;
//     } catch (error) {
//       console.error('Notify Absent Trainees Error:', error);
//       return rejectWithValue(error.response?.data || { message: 'Failed to notify absent trainees' });
//     }
//   }
// );

// // Submit Absence Proof
// export const submitAbsenceProof = createAsyncThunk(
//   'notifications/submitAbsenceProof',
//   async (proofData, { getState, rejectWithValue }) => {
//     try {
//       const { auth } = getState();
//       const formData = new FormData();
      
//       // Append all proof data to FormData
//       Object.keys(proofData).forEach(key => {
//         formData.append(key, proofData[key]);
//       });

//       const response = await axios.post(
//         `${BASE_URL}/absence/proof`, 
//         formData,
//         {
//           headers: {
//             'Authorization': `Bearer ${auth.token}`,
//             'Content-Type': 'multipart/form-data'
//           }
//         }
//       );
      
//       return response.data;
//     } catch (error) {
//       console.error('Submit Absence Proof Error:', error);
//       return rejectWithValue(error.response?.data || { message: 'Failed to submit absence proof' });
//     }
//   }
// );

// // Notifications Slice
// const notificationsSlice = createSlice({
//   name: 'notifications',
//   initialState,
//   reducers: {
//     clearNotificationsError: (state) => {
//       state.error = null;
//     }
//   },
//   extraReducers: (builder) => {
//     // Previous extraReducers remain the same...

//     // Notify Absent Trainees
//     builder.addCase(notifyAbsentTrainees.pending, (state) => {
//       state.loading = true;
//       state.error = null;
//     });
//     builder.addCase(notifyAbsentTrainees.fulfilled, (state, action) => {
//       state.loading = false;
//       state.absentTraineeNotification = action.payload;
//     });
//     builder.addCase(notifyAbsentTrainees.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload;
//     });

//     // Submit Absence Proof
//     builder.addCase(submitAbsenceProof.pending, (state) => {
//       state.loading = true;
//       state.error = null;
//     });
//     builder.addCase(submitAbsenceProof.fulfilled, (state, action) => {
//       state.loading = false;
//       state.absenceProof = action.payload;
//     });
//     builder.addCase(submitAbsenceProof.rejected, (state, action) => {
//       state.loading = false;
//       state.error = action.payload;
//     });
//   }
// });

// export const { clearNotificationsError } = notificationsSlice.actions;
// export default notificationsSlice.reducer;

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

// API base URL
const BASE_URL = 'https://timemanagementsystemserver.onrender.com/api';

// Initial State for Notifications
const initialState = {
  notifications: [],
  unreadCount: 0,
  loading: false,
  error: null,
  notificationStatus: null,
  absentTraineeNotification: null,
  absenceProof: null,
};

// Helper function to get headers with authorization
const getHeaders = (getState) => {
  const { auth } = getState();
  return {
    headers: {
      'Authorization': `Bearer ${auth.token}`,
      'Content-Type': 'application/json',
    },
  };
};

// Thunks for async operations

// Fetch All Messages
export const fetchNotifications = createAsyncThunk(
  'notifications/fetchAll',
  async (traineeId, { getState, rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/messages/trainee/${traineeId}`, getHeaders(getState));
      return response.data;
    } catch (error) {
      console.error('Fetch Notifications Error:', error);
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch notifications' });
    }
  }
);

// Get Unread Message Count
export const fetchUnreadCount = createAsyncThunk(
  'notifications/unreadCount',
  async (traineeId, { getState, rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/messages/unread/${traineeId}`, getHeaders(getState));
      return response.data;
    } catch (error) {
      console.error('Fetch Unread Count Error:', error);
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch unread count' });
    }
  }
);

// Mark Notification as Read
export const markAsRead = createAsyncThunk(
  'notifications/markAsRead',
  async ({ notificationId, traineeId }, { getState, rejectWithValue }) => {
    try {
      const response = await axios.put(`${BASE_URL}/messages/${notificationId}/read`, { traineeId }, getHeaders(getState));
      return response.data;
    } catch (error) {
      console.error('Mark Notification Read Error:', error);
      return rejectWithValue(error.response?.data || { message: 'Failed to mark notification as read' });
    }
  }
);

// Create New Message (Facilitator Only)
export const createNotification = createAsyncThunk(
  'notifications/create',
  async (messageData, { getState, rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/messages`, messageData, getHeaders(getState));
      return response.data;
    } catch (error) {
      console.error('Create Notification Error:', error);
      return rejectWithValue(error.response?.data || { message: 'Failed to create notification' });
    }
  }
);

// Delete Message (Facilitator Only)
export const deleteNotification = createAsyncThunk(
  'notifications/delete',
  async (notificationId, { getState, rejectWithValue }) => {
    try {
      await axios.delete(`${BASE_URL}/messages/${notificationId}`, getHeaders(getState));
      return notificationId;
    } catch (error) {
      console.error('Delete Notification Error:', error);
      return rejectWithValue(error.response?.data || { message: 'Failed to delete notification' });
    }
  }
);

// Get Trainee Notification Status
export const fetchNotificationStatus = createAsyncThunk(
  'notifications/status',
  async (traineeId, { getState, rejectWithValue }) => {
    try {
      const response = await axios.get(`${BASE_URL}/notifications/status/${traineeId}`, getHeaders(getState));
      return response.data;
    } catch (error) {
      console.error('Fetch Notification Status Error:', error);
      return rejectWithValue(error.response?.data || { message: 'Failed to fetch notification status' });
    }
  }
);

// Notify Absent Trainees (Facilitator Only)
export const notifyAbsentTrainees = createAsyncThunk(
  'notifications/notifyAbsent',
  async (absenceData, { getState, rejectWithValue }) => {
    try {
      const response = await axios.post(`${BASE_URL}/notifications/absent`, absenceData, getHeaders(getState));
      return response.data;
    } catch (error) {
      console.error('Notify Absent Trainees Error:', error);
      return rejectWithValue(error.response?.data || { message: 'Failed to notify absent trainees' });
    }
  }
);

// Submit Absence Proof
export const submitAbsenceProof = createAsyncThunk(
  'notifications/submitAbsenceProof',
  async (proofData, { getState, rejectWithValue }) => {
    try {
      const formData = new FormData();
      Object.keys(proofData).forEach(key => formData.append(key, proofData[key]));

      const response = await axios.post(`${BASE_URL}/absence/proof`, formData, {
        headers: {
          'Authorization': `Bearer ${getState().auth.token}`,
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Submit Absence Proof Error:', error);
      return rejectWithValue(error.response?.data || { message: 'Failed to submit absence proof' });
    }
  }
);

// Notifications Slice
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    clearNotificationsError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Handle Fetch Notifications
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

    // Handle Fetch Unread Count
    builder.addCase(fetchUnreadCount.fulfilled, (state, action) => {
      state.unreadCount = action.payload;
    });

    // Handle Mark As Read
    builder.addCase(markAsRead.fulfilled, (state, action) => {
      const updatedNotification = action.payload;
      state.notifications = state.notifications.map(notification =>
        notification.id === updatedNotification.id
          ? { ...notification, read: true }
          : notification
      );
      state.unreadCount = state.notifications.filter(n => !n.read).length;
    });

    // Handle Create Notification
    builder.addCase(createNotification.fulfilled, (state, action) => {
      state.notifications.unshift(action.payload);
    });

    // Handle Delete Notification
    builder.addCase(deleteNotification.fulfilled, (state, action) => {
      state.notifications = state.notifications.filter(
        notification => notification.id !== action.payload
      );
      state.unreadCount = state.notifications.filter(n => !n.read).length;
    });

    // Handle Fetch Notification Status
    builder.addCase(fetchNotificationStatus.fulfilled, (state, action) => {
      state.notificationStatus = action.payload;
    });

    // Handle Notify Absent Trainees
    builder.addCase(notifyAbsentTrainees.fulfilled, (state, action) => {
      state.absentTraineeNotification = action.payload;
    });
    builder.addCase(notifyAbsentTrainees.rejected, (state, action) => {
      state.error = action.payload;
    });

    // Handle Submit Absence Proof
    builder.addCase(submitAbsenceProof.fulfilled, (state, action) => {
      state.absenceProof = action.payload;
    });
    builder.addCase(submitAbsenceProof.rejected, (state, action) => {
      state.error = action.payload;
    });
  },
});

export const { clearNotificationsError } = notificationsSlice.actions;
export default notificationsSlice.reducer;
