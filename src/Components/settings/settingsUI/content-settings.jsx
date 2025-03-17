const ContentSettings = () => {
    return (
      <div>
        <div className="settings-section">
          <h3 className="settings-section-title">Content Types</h3>
          <div className="settings-grid">
            <div className="settings-card">
              <h4 className="settings-card-title">Articles</h4>
              <p className="settings-card-description">Long-form content with rich text</p>
              <button
                className="settings-save-button"
                style={{ backgroundColor: "#4b5563", fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
              >
                Edit Fields
              </button>
            </div>
            <div className="settings-card">
              <h4 className="settings-card-title">Pages</h4>
              <p className="settings-card-description">Static website pages</p>
              <button
                className="settings-save-button"
                style={{ backgroundColor: "#4b5563", fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
              >
                Edit Fields
              </button>
            </div>
            <div className="settings-card">
              <h4 className="settings-card-title">Products</h4>
              <p className="settings-card-description">E-commerce product listings</p>
              <button
                className="settings-save-button"
                style={{ backgroundColor: "#4b5563", fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
              >
                Edit Fields
              </button>
            </div>
            <div className="settings-card">
              <h4 className="settings-card-title">Events</h4>
              <p className="settings-card-description">Calendar events and schedules</p>
              <button
                className="settings-save-button"
                style={{ backgroundColor: "#4b5563", fontSize: "0.75rem", padding: "0.25rem 0.5rem" }}
              >
                Edit Fields
              </button>
            </div>
          </div>
          <div style={{ marginTop: "1rem" }}>
            <button className="settings-save-button" style={{ backgroundColor: "#4b5563" }}>
              Add Content Type
            </button>
          </div>
        </div>
  
        <div className="settings-divider"></div>
  
        <div className="settings-section">
          <h3 className="settings-section-title">Media Settings</h3>
          <div className="settings-form-group">
            <label className="settings-label" htmlFor="maxUploadSize">
              Maximum Upload Size
            </label>
            <select id="maxUploadSize" className="settings-select" defaultValue="10">
              <option value="2">2 MB</option>
              <option value="5">5 MB</option>
              <option value="10">10 MB</option>
              <option value="20">20 MB</option>
              <option value="50">50 MB</option>
            </select>
          </div>
          <div className="settings-form-group">
            <label className="settings-label" htmlFor="allowedFileTypes">
              Allowed File Types
            </label>
            <div style={{ marginTop: "0.5rem" }}>
              <div className="settings-checkbox-group">
                <input type="checkbox" id="fileTypeImages" className="settings-checkbox" defaultChecked />
                <label className="settings-label" htmlFor="fileTypeImages">
                  Images (jpg, png, gif, webp)
                </label>
              </div>
              <div className="settings-checkbox-group">
                <input type="checkbox" id="fileTypeDocuments" className="settings-checkbox" defaultChecked />
                <label className="settings-label" htmlFor="fileTypeDocuments">
                  Documents (pdf, doc, docx, xls, xlsx)
                </label>
              </div>
              <div className="settings-checkbox-group">
                <input type="checkbox" id="fileTypeAudio" className="settings-checkbox" defaultChecked />
                <label className="settings-label" htmlFor="fileTypeAudio">
                  Audio (mp3, wav, ogg)
                </label>
              </div>
              <div className="settings-checkbox-group">
                <input type="checkbox" id="fileTypeVideo" className="settings-checkbox" defaultChecked />
                <label className="settings-label" htmlFor="fileTypeVideo">
                  Video (mp4, webm, mov)
                </label>
              </div>
            </div>
          </div>
        </div>
  
        <div className="settings-divider"></div>
  
        <div className="settings-section">
          <h3 className="settings-section-title">Comments</h3>
          <div className="settings-form-group">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <label className="settings-label">Enable Comments</label>
                <p className="settings-help-text">Allow users to comment on content</p>
              </div>
              <label className="settings-toggle">
                <input type="checkbox" defaultChecked />
                <span className="settings-toggle-slider"></span>
              </label>
            </div>
          </div>
          <div className="settings-form-group">
            <label className="settings-label" htmlFor="commentModeration">
              Comment Moderation
            </label>
            <select id="commentModeration" className="settings-select" defaultValue="approve">
              <option value="none">No moderation (publish immediately)</option>
              <option value="approve">Require approval before publishing</option>
              <option value="registered">Only allow comments from registered users</option>
            </select>
          </div>
        </div>
  
        <div className="settings-divider"></div>
  
        <div className="settings-section">
          <h3 className="settings-section-title">SEO Settings</h3>
          <div className="settings-form-group">
            <label className="settings-label" htmlFor="defaultMetaTitle">
              Default Meta Title
            </label>
            <input type="text" id="defaultMetaTitle" className="settings-input" defaultValue="Your Company Name | CMS" />
          </div>
          <div className="settings-form-group">
            <label className="settings-label" htmlFor="defaultMetaDescription">
              Default Meta Description
            </label>
            <textarea
              id="defaultMetaDescription"
              className="settings-textarea"
              defaultValue="Your company's content management system for publishing and managing digital content."
            ></textarea>
          </div>
        </div>
      </div>
    )
  }
  
  export default ContentSettings
  
  