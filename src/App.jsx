import { useEffect, useState } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAuthStatus } from "./Slices/authSlice";
import "./App.css";
import Navbar from "./Components/Navbar";
import Sidebar from "./Components/Sidebar";
import Dashboard from "./Components/Dashboard";
import UserManagement from "./Components/UserManagement";
import Session from "./Components/Session";
import Reports from "./Components/Reports";
import SystemSettings from "./Components/SystemSettings";
import Alerts from "./Components/Alerts";
import AuditLogs from "./Components/AuditLogs";
import Logout from "./Components/Logout";
import Login from "./Components/Login";
import AddUserForm from "./Components/AddUserForm";
import ForgotPassword from "./Components/ForgotPassword";
import Profile from "./Components/Profile";
import TwoFactorAuth from "./Components/TwoFactorAuth";
import Tickets from "./Components/Tickets";
<<<<<<< HEAD
=======
import NotFound from "./Components/NotFound";
>>>>>>> de02c1efd8c29dc344b27ccefc1acb5e68eefd11
import Loader from "./Components/Loader";
import Notifications from "./Components/Notifications";
import { messaging, requestFCMToken } from "./firebaseConfig";
import NotificationManager from "./Components/NotificationManager";
import NotificationDisplay from "./Components/NotificationDisplay";
import { onMessage } from "firebase/messaging";
import ManageTrainees from "./Components/ManageTrainees";
import LocationManagement from "./Components/LocationManagement"; 

function App() {

 
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const [authChecked, setAuthChecked] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    localStorage.getItem("sidebarState") === "true"
  );

  // Initial auth check on app load
  useEffect(() => {
    const verifyAuth = async () => {
<<<<<<< HEAD
      if (localStorage.getItem("authToken")) {
        await dispatch(checkAuthStatus());
=======
      try {
        // Get token from localStorage
        const token = localStorage.getItem("authToken");
        
        if (token) {
          // Only dispatch check if token exists
          await dispatch(checkAuthStatus());
        }
      } finally {
        // Mark auth check as complete regardless of result
        setAuthChecked(true);
>>>>>>> de02c1efd8c29dc344b27ccefc1acb5e68eefd11
      }
    };

    verifyAuth();
  }, [dispatch]);

  // Persist sidebar state in local storage
  useEffect(() => {
    localStorage.setItem("sidebarState", isSidebarOpen);
  }, [isSidebarOpen]);

<<<<<<< HEAD
  useEffect(()=>{
    requestFCMToken();
    onMessage(messaging, (payload)=>{
      console.log(payload)
    })
  },[])
  
  

=======
  // Show loading state until auth check completes
  if (isLoading || !authChecked) {
    return (
      <div className="loading-overlay">
        <Loader />
      </div>
    );
  }
  
>>>>>>> de02c1efd8c29dc344b27ccefc1acb5e68eefd11
  // Determine current screen name for Navbar
  const getScreenName = (path) => {
    switch (path) {
      case "/":
        return "Dashboard";
      case "/TwoFactorAuth":
        return "Two Factor Authentication";
      case "/user-management":
        return "User Management";
      case "/session":
        return "Session Monitoring";
      case "/reports":
        return "Reports";
      case "/settings":
        return "System Settings";
      case "/manage-trainees":
        return "Manage Trainees"; // Corrected to match the route
      case "/location-management": // Added case for Location Management
        return "Location Management";
      case "/profile":
        return "Profile";
      case "/alerts":
        return "Alerts";
      case "/audit-logs":
        return "Audit Logs";
      case "/Tickets":
        return "Tickets";
      default:
        return "";
    }
  };

  const currentScreen = getScreenName(location.pathname);

  // Global loading overlay while auth status is pending
  if (isLoading) {
    return (
      <div className="loading-overlay">
        <Loader />
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/TwoFactorAuth" /> : <Login />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/TwoFactorAuth" element={<TwoFactorAuth />} />
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <div className="app-container">
              <div className="main-content">
                <Sidebar isOpen={isSidebarOpen} />
                <div className="content">
                  <Navbar
                    currentScreen={currentScreen}
                    toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                  />
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/user-management" element={<UserManagement />} />
                    <Route path="/session" element={<Session />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<SystemSettings />} />
                    <Route path="/manage-trainees" element={<ManageTrainees />} /> {/* Added ManageTrainees route */}
                    <Route path="/location-management" element={<LocationManagement />} /> {/* Add Location Management route */}
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/alerts" element={<Alerts />} />
                    <Route path="/audit-logs" element={<AuditLogs />} />
                    <Route path="/Tickets" element={<Tickets />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/add-user" element={<AddUserForm />} />
                    {/* NotFound route that catches any undefined routes */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </div>
              </div>
            </div>
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

export default App;