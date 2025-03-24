"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom" // Import useNavigate
import "./styling/SystemSettings.css" // Ensure to have .css extension
import { FiSettings, FiX, FiClock, FiMapPin } from "react-icons/fi" // Importing icons, added FiMapPin for location

function SystemSettings() {
  const navigate = useNavigate() // Get the navigate function for navigation
  const [isDarkMode, setIsDarkMode] = useState(false) // State for dark mode
  const [emailNotifications, setEmailNotifications] = useState(true) // State for email notifications
  const [showModal, setShowModal] = useState(false) // State to control modal visibility

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode) // Toggle the dark mode state
  }

  const toggleEmailNotifications = () => {
    setEmailNotifications(!emailNotifications) // Toggle email notifications
  }

  const openModal = () => {
    setShowModal(true) // Show the modal
  }

  const closeModal = () => {
    setShowModal(false) // Hide the modal
  }

  const handleManageTrainees = () => {
    closeModal() // Close the modal
    navigate("/manage-trainees") // Navigate to ManageTrainees
  }

  const handleLocationManagement = () => {
    closeModal() // Close the modal
    navigate("/location-management") // Navigate to LocationManagement
  }

  const handleTimeManagement = () => {
    closeModal() // Close the modal
    navigate("/time-management") // Navigate to Time Management
  }

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
          <div className="nav-item active" onClick={openModal}>
            <FiSettings className="nav-icon" />
            <span style={{ color: isDarkMode ? "white" : "black", fontWeight: "bold" }}>General</span>
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

        {/* Modal Component */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <button className="close-button" onClick={closeModal}>
                <FiX />
              </button>
              <h2 style={{ color: isDarkMode ? "white" : "black" }}>Manage Options</h2>
              <div className="modal-button-container">
                <button className="modal-button" onClick={handleManageTrainees}>
                  Manage Trainees
                </button>
              </div>
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
          background: ${isDarkMode ? "#333" : "#fff"};
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          text-align: center;
          position: relative;
          width: 90%;
          max-width: 400px;
        }

        .modal-content h2 {
          margin-bottom: 20px;
          color: ${isDarkMode ? "white" : "black"};
        }

        .modal-button-container {
          display: flex;
          flex-direction: column; /* Ensure buttons stack vertically */
          gap: 10px; /* Space between buttons */
        }

        .modal-button {
          margin: 10px 0;
          padding: 10px 20px;
          border: none;
          border-radius: 5px;
          cursor: pointer;
          background-color: green; /* Button color */
          color: white; /* Button text color */
          font-weight: bold; /* Bold text */
          transition: background 0.3s;
        }

        .modal-button:hover {
          background: #005500; /* Darker green on hover */
        }

        .close-button {
          position: absolute;
          top: 10px;
          right: 10px;
          background: none;
          border: none;
          cursor: pointer;
          color: #888;
          font-size: 24px;
        }

        .close-button:hover {
          color: #f00; /* Change color on hover */
        }

        .dark {
          background-color: #121212; /* Dark mode background */
          color: white; /* Default text color in dark mode */
        }

        .light {
          background-color: #f0f0f0; /* Light mode background */
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
  )
}

export default SystemSettings



