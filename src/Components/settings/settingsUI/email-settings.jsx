const EmailSettings = () => {
    return (
      <div>
        <div className="settings-section">
          <h3 className="settings-section-title">SMTP Configuration</h3>
          <div className="settings-form-group">
            <label className="settings-label" htmlFor="smtpHost">
              SMTP Host
            </label>
            <input
              type="text"
              id="smtpHost"
              className="settings-input"
              placeholder="smtp.example.com"
              defaultValue="smtp.gmail.com"
            />
          </div>
          <div className="settings-form-group">
            <label className="settings-label" htmlFor="smtpPort">
              SMTP Port
            </label>
            <input type="number" id="smtpPort" className="settings-input" placeholder="587" defaultValue="587" />
          </div>
          <div className="settings-form-group">
            <label className="settings-label" htmlFor="smtpUsername">
              SMTP Username
            </label>
            <input
              type="text"
              id="smtpUsername"
              className="settings-input"
              placeholder="username@example.com"
              defaultValue="notifications@yourcompany.com"
            />
          </div>
          <div className="settings-form-group">
            <label className="settings-label" htmlFor="smtpPassword">
              SMTP Password
            </label>
            <input
              type="password"
              id="smtpPassword"
              className="settings-input"
              placeholder="••••••••••••"
              defaultValue="••••••••••••"
            />
          </div>
          <div className="settings-form-group">
            <div className="settings-checkbox-group">
              <input type="checkbox" id="smtpSsl" className="settings-checkbox" defaultChecked />
              <label className="settings-label" htmlFor="smtpSsl">
                Use SSL/TLS
              </label>
            </div>
          </div>
          <button className="settings-save-button" style={{ backgroundColor: "#4b5563" }}>
            Test Connection
          </button>
        </div>
  
        <div className="settings-divider"></div>
  
        <div className="settings-section">
          <h3 className="settings-section-title">Email Sender</h3>
          <div className="settings-form-group">
            <label className="settings-label" htmlFor="senderName">
              Sender Name
            </label>
            <input
              type="text"
              id="senderName"
              className="settings-input"
              placeholder="Your Company Name"
              defaultValue="CMS Admin"
            />
          </div>
          <div className="settings-form-group">
            <label className="settings-label" htmlFor="senderEmail">
              Sender Email
            </label>
            <input
              type="email"
              id="senderEmail"
              className="settings-input"
              placeholder="noreply@example.com"
              defaultValue="noreply@yourcompany.com"
            />
          </div>
        </div>
  
        <div className="settings-divider"></div>
  
        <div className="settings-section">
          <h3 className="settings-section-title">Email Templates</h3>
          <div className="settings-grid">
            <div className="settings-card">
              <h4 className="settings-card-title">Welcome Email</h4>
              <p className="settings-card-description">Sent to new users when they register</p>
              <button
                className="settings-save-button"
                style={{ backgroundColor: "#4b5563", fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
              >
                Edit Template
              </button>
            </div>
            <div className="settings-card">
              <h4 className="settings-card-title">Password Reset</h4>
              <p className="settings-card-description">Sent when users request a password reset</p>
              <button
                className="settings-save-button"
                style={{ backgroundColor: "#4b5563", fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
              >
                Edit Template
              </button>
            </div>
            <div className="settings-card">
              <h4 className="settings-card-title">Content Published</h4>
              <p className="settings-card-description">Notification when content is published</p>
              <button
                className="settings-save-button"
                style={{ backgroundColor: "#4b5563", fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
              >
                Edit Template
              </button>
            </div>
            <div className="settings-card">
              <h4 className="settings-card-title">Comment Notification</h4>
              <p className="settings-card-description">Sent when someone comments on content</p>
              <button
                className="settings-save-button"
                style={{ backgroundColor: "#4b5563", fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
              >
                Edit Template
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  export default EmailSettings
  
  