const HelpSettings = () => {
    return (
      <div>
        <div className="settings-section">
          <h3 className="settings-section-title">Documentation</h3>
          <div className="settings-form-group">
            <p>Access our comprehensive documentation to learn how to use all features of the CMS.</p>
            <div style={{ marginTop: "1rem" }}>
              <a
                href="#"
                style={{
                  display: "inline-block",
                  backgroundColor: "#2563eb",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                }}
              >
                View Documentation
              </a>
            </div>
          </div>
        </div>
  
        <div className="settings-divider"></div>
  
        <div className="settings-section">
          <h3 className="settings-section-title">Support</h3>
          <div className="settings-form-group">
            <p>Need help? Contact our support team or submit a ticket.</p>
            <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
              <a
                href="#"
                style={{
                  display: "inline-block",
                  backgroundColor: "#4b5563",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                }}
              >
                Contact Support
              </a>
              <a
                href="#"
                style={{
                  display: "inline-block",
                  backgroundColor: "#4b5563",
                  color: "white",
                  padding: "0.5rem 1rem",
                  borderRadius: "0.375rem",
                  textDecoration: "none",
                  fontSize: "0.875rem",
                  fontWeight: "500",
                }}
              >
                Submit a Ticket
              </a>
            </div>
          </div>
        </div>
  
        <div className="settings-divider"></div>
  
        <div className="settings-section">
          <h3 className="settings-section-title">Frequently Asked Questions</h3>
          <div className="settings-form-group">
            <div style={{ marginBottom: "1rem" }}>
              <h4 style={{ fontSize: "1rem", fontWeight: "500", margin: "0 0 0.5rem 0" }}>
                How do I create a new content type?
              </h4>
              <p style={{ margin: 0, color: "#4b5563" }}>
                Go to Content Settings, click "Add Content Type", and follow the wizard to define your fields and
                settings.
              </p>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <h4 style={{ fontSize: "1rem", fontWeight: "500", margin: "0 0 0.5rem 0" }}>How do I invite new users?</h4>
              <p style={{ margin: 0, color: "#4b5563" }}>
                Navigate to User Management, click "Invite User", and enter their email address and role.
              </p>
            </div>
            <div style={{ marginBottom: "1rem" }}>
              <h4 style={{ fontSize: "1rem", fontWeight: "500", margin: "0 0 0.5rem 0" }}>
                How do I change my password?
              </h4>
              <p style={{ margin: 0, color: "#4b5563" }}>
                Go to Security Settings, enter your current password and your new password, then click "Save Changes".
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: "1rem", fontWeight: "500", margin: "0 0 0.5rem 0" }}>How do I set up webhooks?</h4>
              <p style={{ margin: 0, color: "#4b5563" }}>
                Navigate to API Settings, enter your webhook URL, select the events you want to trigger the webhook, and
                save.
              </p>
            </div>
          </div>
        </div>
  
        <div className="settings-divider"></div>
  
        <div className="settings-section">
          <h3 className="settings-section-title">System Information</h3>
          <div className="settings-form-group">
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "500" }}>CMS Version:</span>
                <span>3.5.2</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "500" }}>Last Updated:</span>
                <span>October 15, 2023</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "500" }}>Database:</span>
                <span>PostgreSQL 14.5</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontWeight: "500" }}>Server Environment:</span>
                <span>Production</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  export default HelpSettings
  
  