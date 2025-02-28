import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

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

// Add a thunk to check if user is already logged in
export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        return rejectWithValue('No token found');
      }
      
      const response = await fetch('https://timemanagementsystemserver.onrender.com/api/auth/verify', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      
      if (response.ok) {
        return data;
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('authToken');
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
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      localStorage.removeItem('authToken');
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
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
      
      // Check auth status cases
      .addCase(checkAuthStatus.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user || action.payload;
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        // Don't set error here to avoid showing error messages when just checking status
      });
  },
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;