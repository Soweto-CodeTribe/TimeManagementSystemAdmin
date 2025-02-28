import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
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
import AddUserForm from "./Components/AddUserForm"; // Import the AddUserForm component

function App() {
  const location = useLocation(); // Get the current route
  const { isAuthenticated } = useSelector((state) => state.auth);
  
  console.log("App rendering, auth state:", isAuthenticated);

  // Function to get the screen name from the route path
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
      case "/alerts":
        return "Alerts";
      case "/audit-logs":
        return "Audit Logs";
      case "/add-user":
        return "Add User"; // Add a new case for the AddUserForm route
      default:
        return "Unknown Screen";
    }
  };

  const currentScreen = getScreenName(location.pathname); // Get the current screen name based on the path

  return (
    <Routes>
      {/* Login Route */}
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" /> : <Login />
      } />

      {/* Protected Routes */}
      <Route
        path="/*"
        element={
          isAuthenticated ? (
            <div className="app-container">
              <Navbar activeScreen={currentScreen} /> {/* Pass currentScreen as a prop */}
              <div className="main-content">
                <Sidebar />
                <div className="content">
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/user-management" element={<UserManagement />} />
                    <Route path="/session" element={<Session />} />
                    <Route path="/reports" element={<Reports />} />
                    <Route path="/settings" element={<SystemSettings />} />
                    <Route path="/alerts" element={<Alerts />} />
                    <Route path="/audit-logs" element={<AuditLogs />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/add-user" element={<AddUserForm />} /> {/* Add the new route for AddUserForm */}
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