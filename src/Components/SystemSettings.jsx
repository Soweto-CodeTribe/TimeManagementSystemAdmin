import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import './styling/SystemSettings.css'; // Ensure to have .css extension
import { FiSettings, FiEye } from 'react-icons/fi';

function SystemSettings() {
  const navigate = useNavigate(); // Get the navigate function for navigation
  const [isDarkMode, setIsDarkMode] = useState(false); // State for dark mode
  const [emailNotifications, setEmailNotifications] = useState(true); // State for email notifications
  const [showModal, setShowModal] = useState(false); // State to control modal visibility

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode); // Toggle the dark mode state
  };

  const toggleEmailNotifications = () => {
    setEmailNotifications(!emailNotifications); // Toggle email notifications
  };

  const openModal = () => {
    setShowModal(true); // Show the modal
  };

  const closeModal = () => {
    setShowModal(false); // Hide the modal
  };

  const handleManageTrainees = () => {
    closeModal(); // Close the modal
    navigate('/manage-trainees'); // Navigate to ManageTrainees
  };

  const handleLocationManagement = () => {
    closeModal(); // Close the modal
    navigate('/location-management'); // Navigate to LocationManagement
  };

  return (
    <div className={`settings-container ${isDarkMode ? 'dark' : 'light'}`}>
      <header className={isDarkMode ? 'dark' : ''}>
        <h1>Settings</h1>
        <p>Manage system preferences, user roles, and security settings.</p>
      </header>

      <main className={`settings-content ${isDarkMode ? 'dark' : ''}`}>
        <nav className={`settings-nav ${isDarkMode ? 'dark' : ''}`}>
          <div className="nav-item active" onClick={openModal}>
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

        {/* Modal Component */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Manage Options</h2>
              <button onClick={handleManageTrainees}>Manage Trainees</button>
              <button onClick={handleLocationManagement}>Location Management</button>
              <button onClick={closeModal}>Close</button>
            </div>
          </div>
        )}
      </main>

      {/* Modal Styles */}
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 5px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .modal-content button {
          margin: 10px;
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