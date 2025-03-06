import React, { useState } from 'react';
import './styling/SystemSettings.css'; // Ensure to have .css extension
import { FiSettings, FiEye } from 'react-icons/fi';

function SystemSettings() {
  const [isDarkMode, setIsDarkMode] = useState(false); // State for dark mode

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode); // Toggle the dark mode state
  };

  return (
    <div className={`settings-container ${isDarkMode ? 'dark' : 'light'}`}>
      <header>
        <h1>Settings</h1>
        <p>Manage system preferences, user roles, and security settings.</p>
      </header>

      <main className="settings-content">
        <nav className="settings-nav">
          <div className="nav-item active">
            <FiSettings className="nav-icon" />
            General
          </div>
          <div className="nav-item" onClick={toggleDarkMode}>
            <FiEye className="nav-icon" />
            Appearance
          </div>
        </nav>

        <section className="settings-panel">
          <div className="setting-row">
            <label htmlFor="emailNotifications">Email and Push notification</label>
            <Toggle id="emailNotifications" />
          </div>
        </section>
      </main>
    </div>
  );
}

const Toggle = () => {
  return (
    <label className="switch">
      <input type="checkbox" defaultChecked />
      <span className="slider round"></span>
    </label>
  );
};

export default SystemSettings;