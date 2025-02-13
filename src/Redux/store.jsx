import { configureStore } from "@reduxjs/toolkit";
import authSlice from "../Slices/authSlice";


const store = configureStore({
    reducer:{
        // Add the authSlice reducer to the store
        auth: authSlice,    
    }
})


export default store