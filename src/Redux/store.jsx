import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../Slices/authSlice";
import notificationsReducer from '../Slices/notificationsSlice'
import reportsReducer from '../Slices/reportsSlice'


const store = configureStore({
    reducer:{
        // Add the authSlice reducer to the store
        auth: authReducer,   
        notifications: notificationsReducer,
        reports: reportsReducer,
    }
})


export default store