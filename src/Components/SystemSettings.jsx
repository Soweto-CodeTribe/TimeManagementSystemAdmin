/* eslint-disable react/no-unknown-property */
/* eslint-disable react/prop-types */
"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./styling/SystemSettings.css";
import { FiMapPin, FiBell, FiUserCheck, FiUsers } from "react-icons/fi";
import { ChevronRight } from "lucide-react";

function SystemSettings() {
  const navigate = useNavigate();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  const handleManageTrainees = () => {
    navigate("/manage-trainees");
  };
  const handleLocationManagement = () => {
    navigate("/location-management");
  };

  return (
    <div className="settings-root">
      <div className="settings-card">
        <header className="settings-header">
          <h1>Settings</h1>
          <p>Manage system preferences, notifications, and navigation.</p>
        </header>
        <section className="settings-section">
          <h2 className="settings-section-title">
            <FiBell className="settings-section-icon" /> Notifications
          </h2>
          <div className="settings-row">
            <span className="settings-label">Email Notifications</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={() => setEmailNotifications(!emailNotifications)}
              />
              <span className="slider round"></span>
            </label>
          </div>
          <div className="settings-row">
            <span className="settings-label">Push Notifications</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={pushNotifications}
                onChange={() => setPushNotifications(!pushNotifications)}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </section>
        <section className="settings-section">
          <h2 className="settings-section-title">
            <FiMapPin className="settings-section-icon" /> Navigation
          </h2>
          <div className="settings-nav-list">
            <button
              className="settings-nav-btn"
              onClick={handleLocationManagement}
            >
              <FiMapPin className="nav-icon" />
              <span>Location Management</span>
              <ChevronRight className="myIcon"/>
            </button>
            <button className="settings-nav-btn" onClick={handleManageTrainees}>
              <FiUsers className="nav-icon" />
              <span>Manage Trainees</span>
              <ChevronRight className="myIcon"/>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default SystemSettings;