import { createSlice } from "@reduxjs/toolkit";

// createSlice() function generates action creators and action types for the reducers
const authSlice = createSlice({
    name: "auth",
    initialState:{
        value: 0
    },

    // reducers are functions that take the current state and an action, and return a new state
    reducers:{
        increment: (state) => {
            state.value += 1;
        },
        decrement: (state) => {
            state.value -= 1;
        },
    }
})

// Export action creators
export const { increment, decrement } = authSlice.actions;

// Export the reducer
export default authSlice.reducer;