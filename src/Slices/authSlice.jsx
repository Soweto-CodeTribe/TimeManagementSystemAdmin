import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Existing login thunk for regular users
export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch('https://timemanagementsystemserver.onrender.com/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store token in localStorage for persistence across page refreshes
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userType', data.facilitator.role);
        }
        return data; // Return the data to be stored in the state
      } else {
        return rejectWithValue(data.message || 'Invalid credentials!');
      }
    } catch (error) {
      console.error('Login error:', error);
      return rejectWithValue('Network error during login. Please try again.');
    }
  }
);

// New thunk for facilitator login
export const loginFacilitator = createAsyncThunk(
  'auth/loginFacilitator',
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const response = await fetch('https://timemanagementsystemserver.onrender.com/api/facilitators/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Store token and role in localStorage
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('userType', 'facilitator'); // Store role information
        }
        return data;
      } else {
        return rejectWithValue(data.message || 'Invalid facilitator credentials!');
      }
    } catch (error) {
      console.error('Facilitator login error:', error);
      return rejectWithValue('Network error during facilitator login. Please try again.');
    }
  }
);

export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      const userType = localStorage.getItem('userType') || 'user'; // Default to user if not set

      if (!token) {
        return rejectWithValue('No token found');
      }

      // Use different endpoints based on role
      const endpoint = userType === 'facilitator' 
        ? 'https://timemanagementsystemserver.onrender.com/api/facilitators/verify'
        : 'https://timemanagementsystemserver.onrender.com/api/auth/verify';

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Check if the response is a valid JSON
      let data;
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text(); // Get the raw response text in case of non-JSON response
      }

      if (response.ok) {
        return { ...data, userType }; // Include role in the response
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('authToken');
        localStorage.removeItem('userType');
        return rejectWithValue(data.message || 'Session expired');
      }
    } catch (error) {
      console.error('Auth verification error:', error);
      return rejectWithValue('Error verifying authentication');
    }
  }
);


const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: false,
    user: null,
    token: localStorage.getItem('authToken') || null,
    userType: localStorage.getItem('userType') || null, // Add role to state
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.userType = null;
      localStorage.removeItem('authToken');
      localStorage.removeItem('userType');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases for regular users
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.userType = 'user';
        state.error = null;
        
        // Store user data and token properly
        if (action.payload.user) {
          state.user = action.payload.user;
        } else {
          // If the API returns user data directly
          const { token, ...userData } = action.payload;
          state.user = userData;
        }
        
        // Store token in state
        if (action.payload.token) {
          state.token = action.payload.token;
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload || 'Login failed';
      })
      
      // Login cases for facilitators
      .addCase(loginFacilitator.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginFacilitator.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.userType = 'facilitator';
        state.error = null;
        
        // Store facilitator data and token
        if (action.payload.facilitator) {
          state.user = action.payload.facilitator;
        } else {
          // If the API returns facilitator data directly
          const { token, ...facilitatorData } = action.payload;
          state.user = facilitatorData;
        }
        
        // Store token in state
        if (action.payload.token) {
          state.token = action.payload.token;
        }
      })
      .addCase(loginFacilitator.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.error = action.payload || 'Facilitator login failed';
      })
      
      // Check auth status cases
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user || action.payload;
        state.userType = action.payload.userType || 'user';
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.userType = null;
        // Don't set error here to avoid showing error messages when just checking status
      });
  },
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;