/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import "./styling/SystemSettings.css"; // Ensure to have .css extension
import { FiSettings, FiClock, FiMapPin } from "react-icons/fi"; // Importing icons, added FiMapPin for location

function SystemSettings() {
  const navigate = useNavigate(); // Get the navigate function for navigation
  const [isDarkMode, setIsDarkMode] = useState(false); // State for dark mode
  const [emailNotifications, setEmailNotifications] = useState(true); // State for email notifications

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode); // Toggle the dark mode state
  };

  const toggleEmailNotifications = () => {
    setEmailNotifications(!emailNotifications); // Toggle email notifications
  };

  const handleManageTrainees = () => {
    navigate("/manage-trainees"); // Directly navigate to ManageTrainees
  };

  const handleLocationManagement = () => {
    navigate("/location-management"); // Navigate to LocationManagement
  };

  const handleTimeManagement = () => {
    navigate("/time-management"); // Navigate to Time Management
  };

  return (
    <div className={`settings-container ${isDarkMode ? "dark" : "light"}`}>
      <header className={isDarkMode ? "dark" : ""}>
        <h1 style={{ color: isDarkMode ? "white" : "black", fontWeight: "bold" }}>Settings</h1>
        <p style={{ color: isDarkMode ? "white" : "black", fontWeight: "bold" }}>
          Manage system preferences, user roles, and security settings.
        </p>
      </header>

      <main className={`settings-content ${isDarkMode ? "dark" : ""}`}>
        <nav className={`settings-nav ${isDarkMode ? "dark" : ""}`}>
          <div className="nav-item" onClick={handleTimeManagement}>
            {" "}
            {/* Time Management Item */}
            <FiClock className="nav-icon" />
            <span style={{ color: isDarkMode ? "white" : "black", fontWeight: "bold" }}>Time Management</span>
          </div>
          <div className="nav-item" onClick={handleLocationManagement}>
            {" "}
            {/* Location Item */}
            <FiMapPin className="nav-icon" />
            <span style={{ color: isDarkMode ? "white" : "black", fontWeight: "bold" }}>Location</span>
          </div>
          <div className="nav-item active" onClick={handleManageTrainees}>
            <FiSettings className="nav-icon" />
            <span style={{ color: isDarkMode ? "white" : "black", fontWeight: "bold" }}>Manage Trainees</span>
          </div>
        </nav>

        <section className={`settings-panel ${isDarkMode ? "dark" : ""}`}>
          <div className="setting-row">
            <label htmlFor="emailNotifications" style={{ color: isDarkMode ? "white" : "black", fontWeight: "bold" }}>
              Email and Push notification
            </label>
            <Toggle id="emailNotifications" checked={emailNotifications} onChange={toggleEmailNotifications} />
          </div>
        </section>
      </main>

      {/* Modal Styles (Removed since modal is no longer used) */}
      <style jsx>{`
        .dark {
          background-color: #121212; /* Dark mode background */
          color: white; /* Default text color in dark mode */
        }

        .light {
          color: black; /* Default text color in light mode */
        }
      `}</style>
    </div>
  );
}

const Toggle = ({ id, checked, onChange }) => {
  return (
    <label className="switch">
      <input type="checkbox" id={id} checked={checked} onChange={onChange} />
      <span className="slider round"></span>
    </label>
  );
};

export default SystemSettings;