"use client"

import { useState } from "react"
import { Save, User, Bell, Shield, Palette, Database, Mail, FileText, HelpCircle } from "lucide-react"
import ProfileSettings from "./settings/settingsUI/profile-settings"
import NotificationSettings from "./settings/settingsUI/notification-settings"
import SecuritySettings from "./settings/settingsUI/security-settings"
import AppearanceSettings from "./settings/settingsUI/appearance-settings"
import ApiSettings from "./settings/settingsUI/api-settings"
import EmailSettings from "./settings/settingsUI/email-settings"
import ContentSettings from "./settings/settingsUI/content-settings"
import HelpSettings from "./settings/settingsUI/help-settings"
import './styling/Settings.css'

function SystemSettings() {
  // State management
  const [activeTab, setActiveTab] = useState("security")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState(true)
  const [showModal, setShowModal] = useState(false)

  // Theme and color state from AppearanceSettings
  const [theme, setTheme] = useState("light")
  const [primaryColor, setPrimaryColor] = useState("#2563eb")

  // Event handlers
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
    setTheme(isDarkMode ? "light" : "dark")
  }

  const toggleEmailNotifications = () => {
    setEmailNotifications(!emailNotifications)
  }

  const openModal = () => {
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
  }

  const handleManageTrainees = () => {
    closeModal()
    // Navigate to manage trainees (using client-side navigation)
    window.location.href = '/manage-trainees'
  }

  const handleLocationManagement = () => {
    closeModal()
    // Navigate to location management (using client-side navigation)
    window.location.href = '/location-management'
  }

  const handleSave = () => {
    setIsSaving(true)
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    }, 1000)
  }

  return (
    <div className={`settings-container ${isDarkMode ? 'dark' : 'light'}`}>
      <div className="settings-sidebar">
        <h2 className="settings-sidebar-title">Settings</h2>
        <nav className="settings-nav">
          <button 
            className={`settings-nav-item ${activeTab === "general" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("general")
              openModal()
            }}
          >
            {/* <Settings size={18} /> */}
            <span>General</span>
          </button>
          {/* <button 
            className={`settings-nav-item ${activeTab === "profile" ? "active" : ""}`}
            onClick={() => setActiveTab("profile")}
          >
            <User size={18} />
            <span>Profile</span>
          </button>
          <button 
            className={`settings-nav-item ${activeTab === "notifications" ? "active" : ""}`}
            onClick={() => setActiveTab("notifications")}
          >
            <Bell size={18} />
            <span>Notifications</span>
          </button> */}
          <button 
            className={`settings-nav-item ${activeTab === "security" ? "active" : ""}`}
            onClick={() => setActiveTab("security")}
          >
            <Shield size={18} />
            <span>Security</span>
          </button>
          <button 
            className={`settings-nav-item ${activeTab === "appearance" ? "active" : ""}`}
            onClick={() => setActiveTab("appearance")}
          >
            <Palette size={18} />
            <span>Appearance</span>
          </button>
          <button 
            className={`settings-nav-item ${activeTab === "api" ? "active" : ""}`}
            onClick={() => setActiveTab("api")}
          >
            <Database size={18} />
            <span>API</span>
          </button>
          <button 
            className={`settings-nav-item ${activeTab === "email" ? "active" : ""}`}
            onClick={() => setActiveTab("email")}
          >
            <Mail size={18} />
            <span>Email</span>
          </button>
          <button 
            className={`settings-nav-item ${activeTab === "content" ? "active" : ""}`}
            onClick={() => setActiveTab("content")}
          >
            <FileText size={18} />
            <span>Content</span>
          </button>
          <button 
            className={`settings-nav-item ${activeTab === "help" ? "active" : ""}`}
            onClick={() => setActiveTab("help")}
          >
            <HelpCircle size={18} />
            <span>Help & Support</span>
          </button>
        </nav>
      </div>
      <div className="settings-content">
        <div className="settings-header">
          <h1 className="settings-title">
            {activeTab === "general" && "General Settings"}
            {activeTab === "profile" && "Profile Settings"}
            {activeTab === "notifications" && "Notification Preferences"}
            {activeTab === "security" && "Security Settings"}
            {activeTab === "appearance" && "Appearance Settings"}
            {activeTab === "api" && "API Configuration"}
            {activeTab === "email" && "Email Settings"}
            {activeTab === "content" && "Content Management"}
            {activeTab === "help" && "Help & Support"}
          </h1>
          <div className="settings-actions">
            {saveSuccess && (
              <div className="settings-save-success">
                Settings saved successfully!
              </div>
            )}
            <button 
              className="settings-save-button"
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="settings-spinner"></div>
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        <div className="settings-body">
          {activeTab === "general" && (
            <div className="settings-section">
              <h3 className="settings-section-title">General Settings</h3>
              <div className="settings-form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <label className="settings-label">Email and Push Notifications</label>
                    <p className="settings-help-text">Receive email and push notifications for important updates</p>
                  </div>
                  <label className="settings-toggle">
                    <input 
                      type="checkbox" 
                      checked={emailNotifications} 
                      onChange={toggleEmailNotifications} 
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>
              </div>
              <div className="settings-form-group">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <label className="settings-label">Dark Mode</label>
                    <p className="settings-help-text">Switch between light and dark theme</p>
                  </div>
                  <label className="settings-toggle">
                    <input 
                      type="checkbox" 
                      checked={isDarkMode} 
                      onChange={toggleDarkMode} 
                    />
                    <span className="settings-toggle-slider"></span>
                  </label>
                </div>
              </div>
              <div className="settings-form-group">
                <button 
                  className="settings-button"
                  onClick={handleManageTrainees}
                >
                  Manage Trainees
                </button>
              </div>
              <div className="settings-form-group">
                <button 
                  className="settings-button"
                  onClick={handleLocationManagement}
                >
                  Location Management
                </button>
              </div>
            </div>
          )}
          {activeTab === "profile" && <ProfileSettings />}
          {activeTab === "notifications" && <NotificationSettings />}
          {activeTab === "security" && <SecuritySettings />}
          {activeTab === "appearance" && <AppearanceSettings />}
          {activeTab === "api" && <ApiSettings />}
          {activeTab === "email" && <EmailSettings />}
          {activeTab === "content" && <ContentSettings />}
          {activeTab === "help" && <HelpSettings />}
        </div>
      </div>

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
    </div>
  )
}

export default SystemSettings