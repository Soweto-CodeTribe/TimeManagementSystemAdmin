import React, { useState, useEffect } from "react";
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
import Notifications from "./Components/Notifications";

function App() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const [isSidebarOpen, setIsSidebarOpen] = useState(
    localStorage.getItem("sidebarState") === "true"
  );
  const [initialAuthCheckDone, setInitialAuthCheckDone] = useState(false);

  // Check authentication on initial load
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        // Only check if we have a token to avoid unnecessary API calls
        if (localStorage.getItem('authToken')) {
          await dispatch(checkAuthStatus());
        }
      } finally {
        // Mark auth check as done regardless of result
        setInitialAuthCheckDone(true);
      }
    };
    
    verifyAuth();
  }, [dispatch]);

  // Persist sidebar state
  useEffect(() => {
    localStorage.setItem("sidebarState", isSidebarOpen);
  }, [isSidebarOpen]);

  const getScreenName = (path) => {
    switch (path) {
      case "/":
        return "Dashboard";
      case "/user-management":
        return "User Management";
      case "/session":
        return "Session Monitoring";
      case "/reports":
        return "Reports";
      case "/settings":
        return "System Settings";
      case "/Profile":
        return "Profile";
      case "/alerts":
        return "Alerts";
      case "/audit-logs":
        return "Audit Logs";
      default:
        return "";
    }
  };

  const currentScreen = getScreenName(location.pathname);

  // Show a loading spinner until the initial auth check is complete
  // This prevents flickering between login and dashboard screens
  if (!initialAuthCheckDone) {
    return (
      <div className="loading-container" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Loading application...</p>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <div className="app-container">
              <div className="main-content">
                <Sidebar isOpen={isSidebarOpen} />
                <div className="content">
                  {isLoading ? (
                    <div className="loading-spinner">Loading...</div>
                  ) : (
                    <Routes>
                      <Route path="/" element={<Dashboard />} />
                      <Route path="/user-management" element={<UserManagement />} />
                      <Route path="/session" element={<Session />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/settings" element={<SystemSettings />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/alerts" element={<Alerts />} />
                      <Route path="/audit-logs" element={<AuditLogs />} />
                      <Route path="/logout" element={<Logout />} />
                      <Route path="/add-user" element={<AddUserForm />} />
                    </Routes>
                  )}
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