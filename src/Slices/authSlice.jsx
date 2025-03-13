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

// Function to get the auth token from localStorage
const getAuthToken = () => {
  const token = localStorage.getItem('authToken');
  return token || null; // Return null if token doesn't exist
};

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
      
      localStorage.setItem('role', data.facilitator?.role);


      console.log('Role set during user login:', data);


      console.log("data",data);
      if (response.ok) {
        if (data.token) {
          console.log("LoginUser: Token received from API:", data.token); // Debugging
          localStorage.setItem('authToken', data.token);

          if (data.requires2FA !== undefined) {
            localStorage.setItem('requires2FA', data.requires2FA.toString());
          } 
          
          else if (data.user?.requires2FA !== undefined) {
            localStorage.setItem('requires2FA', data.user.requires2FA.toString());
          }
        }
        return data;
      } else {
        return rejectWithValue(data.message || 'Invalid credentials!');
      }
    } catch (error) {
      return rejectWithValue('Network error during login. Please try again.');
    }
  }
);

// Facilitator login thunk
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
      localStorage.setItem('role', data.facilitator.role);
      console.log('Role set during user login:', data.facilitator?.role);


      if (response.ok) {
        if (data.token) {
          console.log("LoginFacilitator: Token received from API:", data.token); // Debugging
          localStorage.setItem('authToken', data.token);
          
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
      return rejectWithValue('Network error during facilitator login. Please try again.');
    }
  }
);



// OTP verification
export const verifyOTP = createAsyncThunk(
  'auth/verifyOTP',
  async ({ verificationId, verificationCode }, { rejectWithValue }) => {
    try {
      const response = await fetch('https://timemanagementsystemserver.onrender.com/api/auth/verify-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationId, verificationCode }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log("verifyOTP: Token received from API:", data.token); // Debugging
        console.log("Data",data);
        console.log("Role:",data.role);
        console.log("Name:",data.facilitator?.name || data.facilitator?.fullName);
        console.log("Location:",data.location);
        console.log("Email:",data.facilitator?.email);

        localStorage.setItem('authToken', data.token);
        localStorage.setItem('role',data.role);
        localStorage.setItem('name',data.facilitator?.name || data.facilitator?.fullName)
        localStorage.setItem('Location',data.location)
        localStorage.setItem('Email',data.facilitator?.email)

        return data.token;
      } else {
        return rejectWithValue(data.error || 'Verification failed');
      }
    } catch (error) {
      return rejectWithValue('An error occurred while verifying OTP.');
    }
  }
);

// Add this to your authSlice.js file
// Updated resend2FA thunk that gets data from localStorage directly
export const resend2FA = createAsyncThunk(
  'auth/resend2FA',
  async (_, { rejectWithValue }) => {
    try {
      // Get values directly from localStorage
      const verificationId = localStorage.getItem("verificationID");
      const email = localStorage.getItem("Email");
      console.log("The Verification ID:", verificationId);
      console.log("The Email:", email);
      
      // Check if both values exist
      if (!verificationId || !email) {
        return rejectWithValue('Missing verification details. Please try logging in again.');
      }
      
      const response = await fetch('https://timemanagementsystemserver.onrender.com/api/auth/resend-2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verificationId, email }),
      });
      
      if (response.ok) {
        console.log("Response:", response);
        const data = await response.json();
        // Return success message or data
        return data;
      } else {
        const errorData = await response.json();
        return rejectWithValue(errorData.error || 'Failed to resend OTP');
      }
    } catch (error) {
      console.error('Resend OTP error:', error);
      return rejectWithValue('An error occurred while resending OTP.');
    }
  }
);


// Authentication status check
export const checkAuthStatus = createAsyncThunk(
  'auth/checkStatus',
  async (_, { rejectWithValue }) => {
    try {
      const token = localStorage.getItem('authToken');
      console.log("checkAuthStatus: Token from localStorage:", token); // Debugging
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

      let data;
      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      console.log("checkAuthStatus: Response from API:", data);  // Debugging

      if (response.ok) {
        if (data.requires2FA !== undefined) {
          localStorage.setItem('requires2FA', data.requires2FA.toString());
        } else if (data.user?.requires2FA !== undefined) {
          localStorage.setItem('requires2FA', data.user.requires2FA.toString());
        }
        return { ...data, token, role: localStorage.getItem('role') }; // Include token and role in the returned data
      } else {
        localStorage.clear();
        return rejectWithValue(data.message || 'Session expired');
      }
    } catch (error) {
      return rejectWithValue('Error verifying authentication');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    isAuthenticated: true,
    user: null,
    token: getAuthToken(), // Use the function here
    role: localStorage.getItem('role') || null,
    requires2FA: localStorage.getItem('requires2FA') === 'true' || false,
    isLoading: false,
    error: null,
  },
  reducers: {
    logout: (state) => {
      localStorage.clear();
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
      state.role = null;
      state.requires2FA = false;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.role = action.payload.facilitator?.role || 'user';
        state.requires2FA = action.payload.requires2FA || false;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(loginFacilitator.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(loginFacilitator.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.user = action.payload.facilitator;
        state.token = action.payload.token;
        state.role = action.payload.facilitator?.role;
        state.requires2FA = action.payload.requires2FA || action.payload.facilitator?.requires2FA || false;
      })
      .addCase(loginFacilitator.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(verifyOTP.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(verifyOTP.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = true;
        state.token = action.payload; // set the token in state
      })
       .addCase(verifyOTP.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(checkAuthStatus.pending, (state) => { state.isLoading = true; state.error = null; })
      .addCase(checkAuthStatus.fulfilled, (state, action) => {
          state.isLoading = false;
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token; // Make sure to update the token
          state.role = action.payload.role;
        })
      .addCase(checkAuthStatus.rejected, (state, action) => {
        state.isLoading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
        state.role = null;
        state.requires2FA = false;
        localStorage.clear();
        state.error = action.payload;
      })
      .addCase(resend2FA.pending, (state) => { 
        state.isLoading = true; 
        state.error = null; 
      })
      .addCase(resend2FA.fulfilled, (state) => {
        state.isLoading = false;
        // You could add a success message here if needed
      })
      .addCase(resend2FA.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  }
});

export const { logout, clearError } = authSlice.actions;
export default authSlice.reducer;
