"use client"

import { useState } from "react"
import { Save, User, Bell, Shield, Palette, Database, Mail, FileText, HelpCircle } from "lucide-react"
import ProfileSettings from "./components/profile-settings"
import NotificationSettings from "./components/notification-settings"
import SecuritySettings from "./components/security-settings"
import AppearanceSettings from "./components/appearance-settings"
import ApiSettings from "./components/api-settings"
import EmailSettings from "./components/email-settings"
import ContentSettings from "./components/content-settings"
import HelpSettings from "./components/help-settings"
import "../styling/Settings.css"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [isSaving, setIsSaving] = useState(false)
  const [saveSuccess, setSaveSuccess] = useState(false)

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
    <div className="settings-container">
      <div className="settings-sidebar">
        <h2 className="settings-sidebar-title">Settings</h2>
        <nav className="settings-nav">
          <button
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
          </button>
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
            {saveSuccess && <div className="settings-save-success">Settings saved successfully!</div>}
            <button className="settings-save-button" onClick={handleSave} disabled={isSaving}>
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
    </div>
  )
}

