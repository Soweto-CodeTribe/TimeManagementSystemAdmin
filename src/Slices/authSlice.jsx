// import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// // Existing login thunk for regular users
// export const loginUser = createAsyncThunk(
//   'auth/loginUser',
//   async ({ email, password }, { rejectWithValue }) => {
//     try {
//       const response = await fetch('https://timemanagementsystemserver.onrender.com/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });
      
//       const data = await response.json();
      
//       if (response.ok) {
//         // Store token in localStorage for persistence across page refreshes
//         if (data.token) {
//           localStorage.setItem('authToken', data.token);
//           localStorage.setItem('role', data.facilitator?.role || 'user');
//         }
//         return data; // Return the data to be stored in the state

//       } else {
//         return rejectWithValue(data.message || 'Invalid credentials!');
//       }
//     } catch (error) {
//       console.error('Login error:', error);
//       return rejectWithValue('Network error during login. Please try again.');
//     }
//   }
// );

// // New thunk for facilitator login
// export const loginFacilitator = createAsyncThunk(
//   'auth/loginFacilitator',
//   async ({ email, password }, { rejectWithValue }) => {
//     try {
//       const response = await fetch('https://timemanagementsystemserver.onrender.com/api/auth/login', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ email, password }),
//       });
      
//       const data = await response.json();
      
//       if (response.ok) {
//         // Store token and role in localStorage
//         if (data.token) {
//           localStorage.setItem('authToken', data.token);
//           localStorage.setItem('role', data.facilitator?.role );
//         }
//         return data;

//       } else {
//         return rejectWithValue(data.message || 'Invalid facilitator credentials!');
//       }
//     } catch (error) {
//       console.error('Facilitator login error:', error);
//       return rejectWithValue('Network error during facilitator login. Please try again.');
//     }
//   }
// );

// export const checkAuthStatus = createAsyncThunk(
//   'auth/checkStatus',
//   async (_, { rejectWithValue }) => {
//     try {
//       const token = localStorage.getItem('authToken');
//       const role = localStorage.getItem('role'); // Default to user if not set

//       if (!token) {
//         return rejectWithValue('No token found');
//       }

//       // Use the correct verification endpoint based on role
//       const endpoint = role === 'facilitator' 
//         ? 'https://timemanagementsystemserver.onrender.com/api/auth/verify'
//         : 'https://timemanagementsystemserver.onrender.com/api/auth/verify';

//       const response = await fetch(endpoint, {
//         method: 'GET',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       // Check if the response is a valid JSON
//       let data;
//       const contentType = response.headers.get('Content-Type');
//       if (contentType && contentType.includes('application/json')) {
//         data = await response.json();
//       } else {
//         data = await response.text(); // Get the raw response text in case of non-JSON response
//       }

//       if (response.ok) {
//         return { ...data, role }; // Include role in the response
//       } else {
//         // Token is invalid, clear it
//         localStorage.removeItem('authToken');
//         localStorage.removeItem('role');
//         return rejectWithValue(data.message || 'Session expired');
//       }
//     } catch (error) {
//       console.error('Auth verification error:', error);
//       return rejectWithValue('Error verifying authentication');
//     }
//   }
// );


// const authSlice = createSlice({
//   name: 'auth',
//   initialState: {
//     isAuthenticated: false,
//     user: null,
//     token: localStorage.getItem('authToken') || null,
//     role: localStorage.getItem('role') || null, // Add role to state
//     isLoading: false,
//     error: null,
//   },
//   reducers: {
//     logout: (state) => {
//       state.isAuthenticated = false;
//       state.user = null;
//       state.token = null;
//       state.role = null;
//       localStorage.removeItem('authToken');
//       localStorage.removeItem('role');
//     },
//     clearError: (state) => {
//       state.error = null;
//     }
//   },
//   extraReducers: (builder) => {
//     builder
//       // Login cases for regular users
//       .addCase(loginUser.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(loginUser.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.isAuthenticated = true;
//         state.role = action.payload.facilitator?.role || 'user';
//         state.error = null;
        
//         // Store user data and token properly
//         if (action.payload.user) {
//           state.user = action.payload.user;
//         } else {
//           // If the API returns user data directly
//           const { token, ...userData } = action.payload;
//           state.user = userData;
//         }
        
//         // Store token in state
//         if (action.payload.token) {
//           state.token = action.payload.token;
//         }
//       })
//       .addCase(loginUser.rejected, (state, action) => {
//         state.isLoading = false;
//         state.isAuthenticated = false;
//         state.error = action.payload || 'Login failed';
//       })
      
//       // Login cases for facilitators
//       .addCase(loginFacilitator.pending, (state) => {
//         state.isLoading = true;
//         state.error = null;
//       })
//       .addCase(loginFacilitator.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.isAuthenticated = true;
//         state.role = action.payload.facilitator?.role || 'facilitator';
//         state.error = null;
        
//         // Store facilitator data and token
//         if (action.payload.facilitator) {
//           state.user = action.payload.facilitator;
//         } else {
//           // If the API returns facilitator data directly
//           const { token, ...facilitatorData } = action.payload;
//           state.user = facilitatorData;
//         }
        
//         // Store token in state
//         if (action.payload.token) {
//           state.token = action.payload.token;
//         }
//       })
//       .addCase(loginFacilitator.rejected, (state, action) => {
//         state.isLoading = false;
//         state.isAuthenticated = false;
//         state.error = action.payload || 'Facilitator login failed';
//       })
      
//       // Check auth status cases
//       .addCase(checkAuthStatus.pending, (state) => {
//         state.isLoading = true;
//       })
//       .addCase(checkAuthStatus.fulfilled, (state, action) => {
//         state.isLoading = false;
//         state.isAuthenticated = true;
//         state.user = action.payload.user || action.payload;
//         state.role = action.payload.role || 'Facilitator';
//         state.error = null;
//       })
//       .addCase(checkAuthStatus.rejected, (state) => {
//         state.isLoading = false;
//         state.isAuthenticated = false;
//         state.user = null;
//         state.token = null;
//         state.role = null;
//         // Don't set error here to avoid showing error messages when just checking status
//       });
//   },
// });

// export const { logout, clearError } = authSlice.actions;

// export default authSlice.reducer;



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
        // Store token and user data in localStorage for persistence across page refreshes
        if (data.token) {
          localStorage.setItem('authToken', data.token);
          localStorage.setItem('role', data.facilitator?.role || 'user');
          
          // Store requires2FA status
          if (data.requires2FA !== undefined) {
            localStorage.setItem('requires2FA', data.requires2FA.toString());
          } else if (data.user?.requires2FA !== undefined) {
            localStorage.setItem('requires2FA', data.user.requires2FA.toString());
          }
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
      const response = await fetch('https://timemanagementsystemserver.onrender.com/api/auth/login', {
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
          localStorage.setItem('role', data.facilitator?.role);
          
          // Store requires2FA status for facilitator
          if (data.requires2FA !== undefined) {
            localStorage.setItem('requires2FA', data.requires2FA.toString());
          } else if (data.facilitator?.requires2FA !== undefined) {
            localStorage.setItem('requires2FA', data.facilitator.requires2FA.toString());
          }
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
      const role = localStorage.getItem('role'); // Default to user if not set

      if (!token) {
        return rejectWithValue('No token found');
      }

      // Use the correct verification endpoint based on role
      const endpoint = role === 'facilitator' 
        ? 'https://timemanagementsystemserver.onrender.com/api/auth/verify'
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
        // Update requires2FA status from verification response if present
        if (data.requires2FA !== undefined) {
          localStorage.setItem('requires2FA', data.requires2FA.toString());
        } else if (data.user?.requires2FA !== undefined) {
          localStorage.setItem('requires2FA', data.user.requires2FA.toString());
        }
        
        return { ...data, role }; // Include role in the response
      } else {
        // Token is invalid, clear it
        localStorage.removeItem('authToken');
        localStorage.removeItem('role');
        localStorage.removeItem('requires2FA');
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
    role: localStorage.getItem('role') || null,
    requires2FA: localStorage.getItem('requires2FA') === 'true' || false, // Add requires2FA to state
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.role = null;
      state.requires2FA = false;
      localStorage.removeItem('authToken');
      localStorage.removeItem('role');
      localStorage.removeItem('requires2FA');
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
        state.role = action.payload.facilitator?.role || 'user';
        state.error = null;
        
        // Store requires2FA status in state
        if (action.payload.requires2FA !== undefined) {
          state.requires2FA = action.payload.requires2FA;
        } else if (action.payload.user?.requires2FA !== undefined) {
          state.requires2FA = action.payload.user.requires2FA;
        }
        
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
        state.role = action.payload.facilitator?.role || 'facilitator';
        state.error = null;
        
        // Store requires2FA status in state
        if (action.payload.requires2FA !== undefined) {
          state.requires2FA = action.payload.requires2FA;
        } else if (action.payload.facilitator?.requires2FA !== undefined) {
          state.requires2FA = action.payload.facilitator.requires2FA;
        }
        
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
        state.role = action.payload.role || 'Facilitator';
        
        // Update requires2FA status in state
        if (action.payload.requires2FA !== undefined) {
          state.requires2FA = action.payload.requires2FA;
        } else if (action.payload.user?.requires2FA !== undefined) {
          state.requires2FA = action.payload.user.requires2FA;
        }
        
        state.error = null;
      })
      .addCase(checkAuthStatus.rejected, (state) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.role = null;
        state.requires2FA = false;
        // Don't set error here to avoid showing error messages when just checking status
      });
  },
});

export const { logout, clearError } = authSlice.actions;

export default authSlice.reducer;