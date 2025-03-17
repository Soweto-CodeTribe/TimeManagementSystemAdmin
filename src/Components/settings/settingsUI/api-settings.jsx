import { Copy, RefreshCw } from "lucide-react"

const ApiSettings = () => {
  return (
    <div>
      <div className="settings-section">
        <h3 className="settings-section-title">API Access</h3>
        <div className="settings-form-group">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <label className="settings-label">Enable API Access</label>
              <p className="settings-help-text">Allow external applications to access your CMS data</p>
            </div>
            <label className="settings-toggle">
              <input type="checkbox" defaultChecked />
              <span className="settings-toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>

      <div className="settings-divider"></div>

      <div className="settings-section">
        <h3 className="settings-section-title">API Keys</h3>
        <div className="settings-form-group">
          <label className="settings-label">Production API Key</label>
          <div className="settings-api-key">
            <span>sk_live_51NzQwEGjk8uuB7hO2p9iFMzk8JKVYFGm</span>
            <button className="settings-copy-button" title="Copy API key">
              <Copy size={16} />
            </button>
          </div>
          <p className="settings-help-text">Use this key for production environments</p>
        </div>

        <div className="settings-form-group">
          <label className="settings-label">Test API Key</label>
          <div className="settings-api-key">
            <span>sk_test_51NzQwEGjk8uuB7hO2p9iFMzk8JKVYFGm</span>
            <button className="settings-copy-button" title="Copy API key">
              <Copy size={16} />
            </button>
          </div>
          <p className="settings-help-text">Use this key for testing and development</p>
        </div>

        <button
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            backgroundColor: "#4b5563",
            color: "white",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
            cursor: "pointer",
          }}
        >
          <RefreshCw size={16} />
          Regenerate API Keys
        </button>
      </div>

      <div className="settings-divider"></div>

      <div className="settings-section">
        <h3 className="settings-section-title">Webhooks</h3>
        <div className="settings-form-group">
          <label className="settings-label" htmlFor="webhookUrl">
            Webhook URL
          </label>
          <input type="url" id="webhookUrl" className="settings-input" placeholder="https://your-app.com/webhook" />
          <p className="settings-help-text">We'll send POST requests to this URL when events occur</p>
        </div>

        <div className="settings-form-group">
          <label className="settings-label">Webhook Events</label>
          <div style={{ marginTop: "0.5rem" }}>
            <div className="settings-checkbox-group">
              <input type="checkbox" id="eventContentCreated" className="settings-checkbox" defaultChecked />
              <label className="settings-label" htmlFor="eventContentCreated">
                Content Created
              </label>
            </div>
            <div className="settings-checkbox-group">
              <input type="checkbox" id="eventContentUpdated" className="settings-checkbox" defaultChecked />
              <label className="settings-label" htmlFor="eventContentUpdated">
                Content Updated
              </label>
            </div>
            <div className="settings-checkbox-group">
              <input type="checkbox" id="eventContentDeleted" className="settings-checkbox" defaultChecked />
              <label className="settings-label" htmlFor="eventContentDeleted">
                Content Deleted
              </label>
            </div>
            <div className="settings-checkbox-group">
              <input type="checkbox" id="eventUserCreated" className="settings-checkbox" />
              <label className="settings-label" htmlFor="eventUserCreated">
                User Created
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-divider"></div>

      <div className="settings-section">
        <h3 className="settings-section-title">Rate Limiting</h3>
        <div className="settings-form-group">
          <label className="settings-label" htmlFor="rateLimit">
            API Rate Limit
          </label>
          <select id="rateLimit" className="settings-select" defaultValue="1000">
            <option value="100">100 requests per minute</option>
            <option value="500">500 requests per minute</option>
            <option value="1000">1,000 requests per minute</option>
            <option value="5000">5,000 requests per minute</option>
          </select>
          <p className="settings-help-text">Maximum number of API requests allowed per minute</p>
        </div>
      </div>
    </div>
  )
}

export default ApiSettings

