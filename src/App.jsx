import React, { useEffect, useState } from "react";
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
import AdminProfile from "./Components/AdminProfile";
import TwoFactorAuth from "./Components/TwoFactorAuth";
import Tickets from "./Components/Tickets";
import NotFound from "./Components/NotFound";
import Loader from "./Components/Loader";
import Notifications from "./Components/Notifications";
import Feedback from "./Components/Feedback";
import LocationManagement from "./Components/LocationManagement"; // Added import
import ManageTrainees from "./Components/ManageTrainees"; // Added import
import TimeManagement from "./Components/TimeManagement"; // Added import

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
      try {
        const token = localStorage.getItem("authToken");
        if (token) {
          await dispatch(checkAuthStatus());
        }
      } finally {
        setAuthChecked(true);
      }
    };

    verifyAuth();
  }, [dispatch]);

  // Persist sidebar state in local storage
  useEffect(() => {
    localStorage.setItem("sidebarState", isSidebarOpen);
  }, [isSidebarOpen]);

  // Show loading state until auth check completes
  if (isLoading || !authChecked) {
    return (
      <div className="loading-overlay">
        <Loader />
      </div>
    );
  }

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
      case "/AdminProfile":
        return "Admin Profile";
      case "/alerts":
        return "Alerts";
      case "/audit-logs":
        return "Audit Logs";
      case "/Tickets":
        return "Tickets";
      case "/Feedback":
        return "Feedback";
      case "/location-management": // New case for Location Management
        return "Location Management"; // New screen name
      case "/manage-trainees": // New case for Manage Trainees
        return "Manage Trainees"; // New screen name
      case "/time-management": // New case for Time Management
        return "Time Management"; // New screen name
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
                    <Route path="/AdminProfile" element={<AdminProfile />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/alerts" element={<Alerts />} />
                    <Route path="/audit-logs" element={<AuditLogs />} />
                    <Route path="/Tickets" element={<Tickets />} />
                    <Route path="/Feedback" element={<Feedback />} />
                    <Route path="/location-management" element={<LocationManagement />} /> {/* New route */}
                    <Route path="/manage-trainees" element={<ManageTrainees />} /> {/* New route */}
                    <Route path="/time-management" element={<TimeManagement />} /> {/* New route for Time Management */}
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/add-user" element={<AddUserForm />} />
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