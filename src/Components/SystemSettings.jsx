import React, { useState } from 'react';
import './styling/SystemSettings.css'; // Ensure to have .css extension
import { FiSettings, FiEye } from 'react-icons/fi';

function SystemSettings() {
  const [isDarkMode, setIsDarkMode] = useState(false); // State for dark mode
  const [emailNotifications, setEmailNotifications] = useState(true); // State for email notifications

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode); // Toggle the dark mode state
  };

  const toggleEmailNotifications = () => {
    setEmailNotifications(!emailNotifications); // Toggle email notifications
  };

  return (
    <div className={`settings-container ${isDarkMode ? 'dark' : 'light'}`}>
      <header className={isDarkMode ? 'dark' : ''}>
        <h1>Settings</h1>
        <p>Manage system preferences, user roles, and security settings.</p>
      </header>

      <main className={`settings-content ${isDarkMode ? 'dark' : ''}`}>
        <nav className={`settings-nav ${isDarkMode ? 'dark' : ''}`}>
          <div className="nav-item active">
            <FiSettings className="nav-icon" />
            General
          </div>
          <div className="nav-item" onClick={toggleDarkMode}>
            <FiEye className="nav-icon" />
            Appearance
          </div>
        </nav>

        <section className={`settings-panel ${isDarkMode ? 'dark' : ''}`}>
          <div className="setting-row">
            <label htmlFor="emailNotifications">Email and Push notification</label>
            <Toggle id="emailNotifications" checked={emailNotifications} onChange={toggleEmailNotifications} />
          </div>
        </section>
      </main>
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