const ProfileSettings = () => {
    return (
      <div>
        <div className="settings-section">
          <h3 className="settings-section-title">Personal Information</h3>
          <div className="settings-form-group">
            <label className="settings-label" htmlFor="fullName">
              Full Name
            </label>
            <input type="text" id="fullName" className="settings-input" defaultValue="John Doe" />
          </div>
          <div className="settings-form-group">
            <label className="settings-label" htmlFor="email">
              Email Address
            </label>
            <input type="email" id="email" className="settings-input" defaultValue="john.doe@example.com" />
          </div>
          <div className="settings-form-group">
            <label className="settings-label" htmlFor="role">
              Role
            </label>
            <select id="role" className="settings-select" defaultValue="admin">
              <option value="admin">Administrator</option>
              <option value="editor">Editor</option>
              <option value="author">Author</option>
              <option value="contributor">Contributor</option>
            </select>
          </div>
        </div>
  
        <div className="settings-divider"></div>
  
        <div className="settings-section">
          <h3 className="settings-section-title">Profile Picture</h3>
          <div className="settings-form-group">
            <div className="settings-profile-picture">
              <img
                src="/placeholder.svg?height=100&width=100"
                alt="Profile"
                style={{
                  width: "100px",
                  height: "100px",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid #e5e7eb",
                }}
              />
              <div style={{ marginTop: "1rem" }}>
                <button className="settings-save-button" style={{ backgroundColor: "#4b5563" }}>
                  Change Picture
                </button>
              </div>
            </div>
          </div>
        </div>
  
        <div className="settings-divider"></div>
  
        <div className="settings-section">
          <h3 className="settings-section-title">Bio</h3>
          <div className="settings-form-group">
            <label className="settings-label" htmlFor="bio">
              About Me
            </label>
            <textarea
              id="bio"
              className="settings-textarea"
              defaultValue="Content management professional with 5+ years of experience in digital publishing and web content strategy."
            ></textarea>
            <p className="settings-help-text">Brief description that appears on your public profile</p>
          </div>
        </div>
  
        <div className="settings-divider"></div>
  
        <div className="settings-section">
          <h3 className="settings-section-title">Contact Information</h3>
          <div className="settings-form-group">
            <label className="settings-label" htmlFor="phone">
              Phone Number
            </label>
            <input type="tel" id="phone" className="settings-input" defaultValue="+1 (555) 123-4567" />
          </div>
          <div className="settings-form-group">
            <label className="settings-label" htmlFor="location">
              Location
            </label>
            <input type="text" id="location" className="settings-input" defaultValue="New York, NY" />
          </div>
        </div>
      </div>
    )
  }
  
  export default ProfileSettings
  
  