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
import AdminProfile from "./Components/AdminProfile";
import TwoFactorAuth from "./Components/TwoFactorAuth";
import Tickets from "./Components/Tickets";
import ErrorPage from "./Components/ErrorPage";
import Loader from "./Components/Loader";
import Notifications from "./Components/Notifications";
import Feedback from "./Components/Feedback";
import { generateFCMToken, setupFCMListener, fetchUnreadCount } from "./Slices/notificationsSlice";
import EventManagement from "./Components/EventManagement";
import LocationManagement from "./Components/LocationManagement";
import TimeManagement from "./Components/TimeManagement";
import ManageTrainees from "./Components/ManageTrainees";

function App() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading, user } = useSelector((state) => state.auth);
  const [authChecked, setAuthChecked] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(localStorage.getItem("sidebarState") === "true");

  // Get traineeId from localStorage
  const traineeId = localStorage.getItem("userId");

  // Fetch unread notifications count when authenticated and traineeId available
  useEffect(() => {
    if (isAuthenticated && traineeId) {
      dispatch(fetchUnreadCount(traineeId)).catch((error) => {
        console.error("Error fetching unread count:", error);
      });
    }
  }, [dispatch, isAuthenticated, traineeId]);

  // Setup FCM token and listeners on user change
  useEffect(() => {
    if (user?.id) {
      dispatch(generateFCMToken());
      dispatch(setupFCMListener());

      const userId = user.id || localStorage.getItem("userId");
      if (userId) {
        dispatch(fetchUnreadCount(userId));
      }
    }
  }, [dispatch, user]);

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

  // Persist sidebar open state in localStorage
  useEffect(() => {
    localStorage.setItem("sidebarState", isSidebarOpen);
  }, [isSidebarOpen]);

  // Show loading spinner while auth is loading or not yet checked
  if (isLoading || !authChecked) {
    return (
      <div className="loading-overlay">
        <Loader />
      </div>
    );
  }

  // Map pathnames to screen names for Navbar display
  const getScreenName = (path) => {
    switch (path) {
      case "/dashboard":
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
      case "/CombinedNotifications":
        return "CombinedNotifications";
      case "/EventManagement":
        return "EventManagement";
      case "/location-management":
        return "Location Management";
      case "/manage-trainees":
        return "Manage Trainees";
      case "/time-management":
        return "Time Management";
      default:
        return "/dashboard";
    }
  };

  const currentScreen = getScreenName(location.pathname);

  return (
    <Routes>
      {/* Redirect root to login */}
      <Route path="/" element={<Navigate to="/login" />} />

      {/* Public Routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/TwoFactorAuth" element={<TwoFactorAuth />} />

      {/* Error Pages */}
      <Route path="/error/404" element={<ErrorPage errorType="404" />} />
      <Route path="/error/500" element={<ErrorPage errorType="500" />} />

      {/* Protected Routes */}
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <div className="app-container">
              <div className="main-content">
                <Sidebar isOpen={isSidebarOpen} />
                <div className="content">
                  <Navbar currentScreen={currentScreen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
                  <Routes>
                    <Route path="/dashboard" element={<Dashboard />} />
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
                    <Route path="/location-management" element={<LocationManagement />} />
                    <Route path="/time-management" element={<TimeManagement />} />
                    <Route path="/EventManagement" element={<EventManagement />} />
                    <Route path="/manage-trainees" element={<ManageTrainees />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/add-user" element={<AddUserForm />} />

                    {/* Catch-all route for authenticated users */}
                    <Route path="*" element={<ErrorPage errorType="404" />} />
                  </Routes>
                </div>
              </div>
            </div>
          ) : (
            // Redirect unauthenticated users to login
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
