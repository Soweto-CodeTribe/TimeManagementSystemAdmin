const SecuritySettings = () => {
    return (
      <div>
        <div className="settings-section">
          <h3 className="settings-section-title">Password</h3>
          <div className="settings-form-group">
            <label className="settings-label" htmlFor="currentPassword">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              className="settings-input"
              placeholder="Enter your current password"
            />
          </div>
          <div className="settings-form-group">
            <label className="settings-label" htmlFor="newPassword">
              New Password
            </label>
            <input type="password" id="newPassword" className="settings-input" placeholder="Enter new password" />
            <p className="settings-help-text">
              Password must be at least 8 characters long and include a number and a special character
            </p>
          </div>
          <div className="settings-form-group">
            <label className="settings-label" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <input type="password" id="confirmPassword" className="settings-input" placeholder="Confirm new password" />
          </div>
        </div>
  
        <div className="settings-divider"></div>
  
        <div className="settings-section">
          <h3 className="settings-section-title">Two-Factor Authentication</h3>
          <div className="settings-form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <label className="settings-label">Enable Two-Factor Authentication</label>
                <p className="settings-help-text">Add an extra layer of security to your account</p>
              </div>
              <label className="settings-toggle">
                <input type="checkbox" />
                <span className="settings-toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
  
        <div className="settings-divider"></div>
  
        <div className="settings-section">
          <h3 className="settings-section-title">Login Sessions</h3>
          <div className="settings-form-group">
            <div
              style={{
                padding: "1rem",
                backgroundColor: "#f9fafb",
                borderRadius: "0.375rem",
                marginBottom: "1rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: "500" }}>Current Session</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Chrome on Windows • New York, USA</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                    Started: Today at 10:23 AM
                  </div>
                </div>
                <div
                  style={{
                    backgroundColor: "#d1fae5",
                    color: "#065f46",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "0.25rem",
                    fontSize: "0.75rem",
                    height: "fit-content",
                  }}
                >
                  Active
                </div>
              </div>
            </div>
  
            <div
              style={{
                padding: "1rem",
                backgroundColor: "#f9fafb",
                borderRadius: "0.375rem",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ fontWeight: "500" }}>Previous Session</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280" }}>Safari on macOS • Boston, USA</div>
                  <div style={{ fontSize: "0.75rem", color: "#6b7280", marginTop: "0.25rem" }}>
                    Last active: Yesterday at 3:42 PM
                  </div>
                </div>
                <button
                  style={{
                    backgroundColor: "#ef4444",
                    color: "white",
                    border: "none",
                    padding: "0.25rem 0.5rem",
                    borderRadius: "0.25rem",
                    fontSize: "0.75rem",
                    cursor: "pointer",
                  }}
                >
                  Revoke
                </button>
              </div>
            </div>
          </div>
          <button
            style={{
              backgroundColor: "#ef4444",
              color: "white",
              border: "none",
              padding: "0.5rem 1rem",
              borderRadius: "0.375rem",
              fontSize: "0.875rem",
              cursor: "pointer",
            }}
          >
            Sign Out of All Sessions
          </button>
        </div>
      </div>
    )
  }
  
  export default SecuritySettings
  
  