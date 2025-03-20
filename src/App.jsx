// import React, { useEffect, useState } from "react";
// import { Routes, Route, Navigate, useLocation } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { checkAuthStatus } from "./Slices/authSlice";
// import "./App.css";
// import Navbar from "./Components/Navbar";
// import Sidebar from "./Components/Sidebar";
// import Dashboard from "./Components/Dashboard";
// import UserManagement from "./Components/UserManagement";
// import Session from "./Components/Session";
// import Reports from "./Components/Reports";
// import SystemSettings from "./Components/SystemSettings";
// import Alerts from "./Components/Alerts";
// import AuditLogs from "./Components/AuditLogs";
// import Logout from "./Components/Logout";
// import Login from "./Components/Login";
// import AddUserForm from "./Components/AddUserForm";
// import ForgotPassword from "./Components/ForgotPassword";
// import AdminProfile from "./Components/AdminProfile";
// import TwoFactorAuth from "./Components/TwoFactorAuth";
// import Tickets from "./Components/Tickets";
// import NotFound from "./Components/NotFound";
// import Loader from "./Components/Loader";
// import Notifications from "./Components/Notifications";
// import Feedback from "./Components/Feedback";

// function App() {
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
//   const [authChecked, setAuthChecked] = useState(false);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(
//     localStorage.getItem("sidebarState") === "true"
//   );

//   // List of routes that should show NotFound instead of redirecting to login
//   const showNotFoundRoutes = [
//     "/admin-only", 
//     "/settings/advanced",
//     "/restricted-area"
//     // Add more routes that should show NotFound for unauthenticated users
//   ];

//   // Initial auth check on app load
//   useEffect(() => {
//     const verifyAuth = async () => {
//       try {
//         const token = localStorage.getItem("authToken");
//         if (token) {
//           await dispatch(checkAuthStatus());
//         }
//       } finally {
//         setAuthChecked(true);
//       }
//     };

//     verifyAuth();
//   }, [dispatch]);

//   // Persist sidebar state in local storage
//   useEffect(() => {
//     localStorage.setItem("sidebarState", isSidebarOpen);
//   }, [isSidebarOpen]);

//   // Show loading state until auth check completes
//   if (isLoading || !authChecked) {
//     return (
//       <div className="loading-overlay">
//         <Loader />
//       </div>
//     );
//   }
  
//   // Determine current screen name for Navbar
//   const getScreenName = (path) => {
//     switch (path) {
//       case "/":
//         return "Dashboard";
//       case "/TwoFactorAuth":
//         return "Two Factor Authentication";
//       case "/user-management":
//         return "User Management";
//       case "/session":
//         return "Session Monitoring";
//       case "/reports":
//         return "Reports";
//       case "/settings":
//         return "System Settings";
//       case "/AdminProfile":
//         return "Admin Profile";
//       case "/alerts":
//         return "Alerts";
//       case "/audit-logs":
//         return "Audit Logs";
//       case "/Tickets":
//         return "Tickets";
//       case "/Feedback":
//         return "Feedback";
//       default:
//         return "NotFound";
//     }
//   };

//   // Check if current path should show NotFound for unauthenticated users
//   const shouldShowNotFound = () => {
//     return showNotFoundRoutes.some(route => 
//       location.pathname === route || location.pathname.startsWith(`${route}/`)
//     );
//   };

//   const currentScreen = getScreenName(location.pathname);

//   // Global loading overlay while auth status is pending
//   if (isLoading) {
//     return (
//       <div className="loading-overlay">
//         <Loader />
//       </div>
//     );
//   }

//   // For protected routes, decide whether to show NotFound or redirect to login
//   const handleProtectedRoutes = () => {
//     if (isAuthenticated) {
//       return (
//         <div className="app-container">
//           <div className="main-content">
//             <Sidebar isOpen={isSidebarOpen} />
//             <div className="content">
//               <Navbar
//                 currentScreen={currentScreen}
//                 toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
//               />
//               <Routes>
//                 <Route path="/" element={<Dashboard />} />
//                 <Route path="/user-management" element={<UserManagement />} />
//                 <Route path="/session" element={<Session />} />
//                 <Route path="/reports" element={<Reports />} />
//                 <Route path="/settings" element={<SystemSettings />} />
//                 <Route path="/AdminProfile" element={<AdminProfile />} />
//                 <Route path="/notifications" element={<Notifications />} />
//                 <Route path="/alerts" element={<Alerts />} />
//                 <Route path="/audit-logs" element={<AuditLogs />} />
//                 <Route path="/Tickets" element={<Tickets />} />
//                 <Route path="/Feedback" element={<Feedback />} />
//                 <Route path="/logout" element={<Logout />} />
//                 <Route path="/add-user" element={<AddUserForm />} />
//                 <Route path="*" element={<NotFound />} />
//               </Routes>
//             </div>
//           </div>
//         </div>
//       );
//     } else if (shouldShowNotFound()) {
//       return <NotFound />;
//     } else {
//       return <Navigate to="/login" state={{ from: location }} />;
//     }
//   };

//   return (
//     <Routes>
//       <Route path="/login" element={isAuthenticated ? <Navigate to="/TwoFactorAuth" /> : <Login />} />
//       <Route path="/forgotPassword" element={<ForgotPassword />} />
//       <Route path="/TwoFactorAuth" element={<TwoFactorAuth />} />
//       <Route path="/*" element={handleProtectedRoutes()} />
//     </Routes>
//   );
// }

// export default App;



// import React, { useEffect, useState } from "react";
// import { Routes, Route, Navigate, useLocation } from "react-router-dom";
// import { useDispatch, useSelector } from "react-redux";
// import { checkAuthStatus } from "./Slices/authSlice";
// import "./App.css";
// import Navbar from "./Components/Navbar";
// import Sidebar from "./Components/Sidebar";
// import Dashboard from "./Components/Dashboard";
// import UserManagement from "./Components/UserManagement";
// import Session from "./Components/Session";
// import Reports from "./Components/Reports";
// import SystemSettings from "./Components/SystemSettings";
// import Alerts from "./Components/Alerts";
// import AuditLogs from "./Components/AuditLogs";
// import Logout from "./Components/Logout";
// import Login from "./Components/Login";
// import AddUserForm from "./Components/AddUserForm";
// import ForgotPassword from "./Components/ForgotPassword";
// import AdminProfile from "./Components/AdminProfile";
// import TwoFactorAuth from "./Components/TwoFactorAuth";
// import Tickets from "./Components/Tickets";
// import NotFound from "./Components/NotFound";
// import Loader from "./Components/Loader";
// import Notifications from "./Components/Notifications";
// import Feedback from "./Components/Feedback";

// function App() {
//   const location = useLocation();
//   const dispatch = useDispatch();
//   const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
//   const [authChecked, setAuthChecked] = useState(false);
//   const [isSidebarOpen, setIsSidebarOpen] = useState(
//     localStorage.getItem("sidebarState") === "true"
//   );

//   // Initial auth check on app load
//   useEffect(() => {
//     const verifyAuth = async () => {
//       try {
//         const token = localStorage.getItem("authToken");
//         if (token) {
//           await dispatch(checkAuthStatus());
//         }
//       } finally {
//         setAuthChecked(true);
//       }
//     };

//     verifyAuth();
//   }, [dispatch]);

//   // Persist sidebar state in local storage
//   useEffect(() => {
//     localStorage.setItem("sidebarState", isSidebarOpen);
//   }, [isSidebarOpen]);

//   // Show loading state until auth check completes
//   if (isLoading || !authChecked) {
//     return (
//       <div className="loading-overlay">
//         <Loader />
//       </div>
//     );
//   }
  
//   // Determine current screen name for Navbar
//   const getScreenName = (path) => {
//     switch (path) {
//       case "/":
//         return "Dashboard";
//       case "/TwoFactorAuth":
//         return "Two Factor Authentication";
//       case "/user-management":
//         return "User Management";
//       case "/session":
//         return "Session Monitoring";
//       case "/reports":
//         return "Reports";
//       case "/settings":
//         return "System Settings";
//       case "/AdminProfile":
//         return "Admin Profile";
//       case "/alerts":
//         return "Alerts";
//       case "/audit-logs":
//         return "Audit Logs";
//       case "/Tickets":
//         return "Tickets";
//       case "/Feedback":
//         return "Feedback";
//       default:
//         return "";
//     }
//   };

//   const currentScreen = getScreenName(location.pathname);

//   // Global loading overlay while auth status is pending
//   if (isLoading) {
//     return (
//       <div className="loading-overlay">
//         <Loader />
//       </div>
//     );
//   }

//   // Define public routes that should be accessible without authentication
//   const publicRoutes = ["/login", "/forgotPassword", "/TwoFactorAuth"];
//   const isPublicRoute = publicRoutes.includes(location.pathname);

//   return (
//     <Routes>
//       {/* Public routes */}
//       <Route path="/login" element={isAuthenticated ? <Navigate to="/TwoFactorAuth" /> : <Login />} />
//       <Route path="/forgotPassword" element={<ForgotPassword />} />
//       <Route path="/TwoFactorAuth" element={<TwoFactorAuth />} />
      
//       {/* Protected routes */}
//       <Route
//         path="/*"
//         element={
//           isAuthenticated ? (
//             <div className="app-container">
//               <div className="main-content">
//                 <Sidebar isOpen={isSidebarOpen} />
//                 <div className="content">
//                   <Navbar
//                     currentScreen={currentScreen}
//                     toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
//                   />
//                   <Routes>
//                     <Route path="/" element={<Dashboard />} />
//                     <Route path="/user-management" element={<UserManagement />} />
//                     <Route path="/session" element={<Session />} />
//                     <Route path="/reports" element={<Reports />} />
//                     <Route path="/settings" element={<SystemSettings />} />
//                     <Route path="/AdminProfile" element={<AdminProfile />} />
//                     <Route path="/notifications" element={<Notifications />} />
//                     <Route path="/alerts" element={<Alerts />} />
//                     <Route path="/audit-logs" element={<AuditLogs />} />
//                     <Route path="/Tickets" element={<Tickets />} />
//                     <Route path="/Feedback" element={<Feedback />} />
//                     <Route path="/logout" element={<Logout />} />
//                     <Route path="/add-user" element={<AddUserForm />} />
//                     <Route path="*" element={<NotFound />} />
//                   </Routes>
//                 </div>
//               </div>
//             </div>
//           ) : (
//             // Show NotFound page instead of redirecting to login
//             <NotFound />
//           )
//         }
//       />
//     </Routes>
//   );
// }

// export default App;


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
import ErrorPage from "./Components/ErrorPage"; // Renamed from NotFound to ErrorPage
import Loader from "./Components/Loader";
import Notifications from "./Components/Notifications";
import Feedback from "./Components/Feedback";
import { generateFCMToken, setupFCMListener,fetchNotifications } from './Slices/notificationsSlice';
import NotificationsPage from "./Components/Notifications"
import EventManagement from "./Components/EventManagement"


function App() {
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated, isLoading } = useSelector((state) => state.auth);
  const [authChecked, setAuthChecked] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(localStorage.getItem("sidebarState") === "true");
  const { user } = useSelector(state => state.auth);
  
  // Get traineeId from localStorage
  const traineeId = localStorage.getItem('userId');

  // Fetch notifications when app starts
  useEffect(() => {
    if (isAuthenticated && traineeId) {
      dispatch(fetchNotifications(traineeId));
    }
  }, [dispatch, isAuthenticated, traineeId]);
  


   // Fetch notifications count  
  useEffect(() => {
    if (user?.id) {
      // Initialize FCM
      dispatch(generateFCMToken());
      dispatch(setupFCMListener());

      // Fetch notifications count
      const userId = user.id || localStorage.getItem('userId');
      if (userId) {
        dispatch(fetchNotifications(userId));
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
      case "/CombinedNotifications":
        return "CombinedNotifications";
      case "/EventManagement":
        return "EventManagement";
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

  // Define public routes that should be accessible without authentication
  const publicRoutes = ["/login", "/forgotPassword", "/TwoFactorAuth"];
  const isPublicRoute = publicRoutes.includes(location.pathname);

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={isAuthenticated ? <Navigate to="/TwoFactorAuth" /> : <Login />} />
      <Route path="/forgotPassword" element={<ForgotPassword />} />
      <Route path="/TwoFactorAuth" element={<TwoFactorAuth />} />
      
      {/* Error page routes */}
      <Route path="/error/404" element={<ErrorPage errorType="404" />} />
      <Route path="/error/500" element={<ErrorPage errorType="500" />} />
      <Route path="/error/403" element={<ErrorPage errorType="403" />} />
      
      {/* Protected routes */}
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
                    <Route path="/alerts" element={<Alerts />} />
                    <Route path="/audit-logs" element={<AuditLogs />} />
                    <Route path="/Tickets" element={<Tickets />} />
                    <Route path="/notifications" element={<NotificationsPage />} />
                    <Route path="/Feedback" element={<Feedback />} />
                    <Route path="/EventManagement" element={<EventManagement/>} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/add-user" element={<AddUserForm />} />
                    
                    {/* Catch-all route for authenticated users */}
                    <Route path="*" element={<ErrorPage errorType="404" />} />
                  </Routes>
                </div>
              </div>
            </div>
          ) : (
            // For unauthenticated users trying to access protected routes
            <ErrorPage errorType="403" />
          )
        }
      />
    </Routes>
  );
}

export default App;