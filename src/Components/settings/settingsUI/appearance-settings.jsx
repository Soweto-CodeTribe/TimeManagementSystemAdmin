"use client"

import { useState } from "react"

const AppearanceSettings = () => {
  const [theme, setTheme] = useState("light")
  const [primaryColor, setPrimaryColor] = useState("#2563eb")

  const colors = [
    { name: "Blue", value: "#2563eb" },
    { name: "Purple", value: "#7c3aed" },
    { name: "Pink", value: "#db2777" },
    { name: "Red", value: "#dc2626" },
    { name: "Orange", value: "#ea580c" },
    { name: "Green", value: "#16a34a" },
  ]

  return (
    <div>
      <div className="settings-section">
        <h3 className="settings-section-title">Theme</h3>
        <div className="settings-form-group">
          <div style={{ display: "flex", gap: "1rem" }}>
            <div
              onClick={() => setTheme("light")}
              style={{
                cursor: "pointer",
                border: `2px solid ${theme === "light" ? primaryColor : "#e5e7eb"}`,
                borderRadius: "0.5rem",
                padding: "0.5rem",
                width: "150px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  height: "80px",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.375rem",
                  marginBottom: "0.5rem",
                }}
              />
              <div style={{ fontSize: "0.875rem", marginTop: "0.5rem", fontWeight: "500" }}>Light</div>
            </div>

            <div
              onClick={() => setTheme("dark")}
              style={{
                cursor: "pointer",
                border: `2px solid ${theme === "dark" ? primaryColor : "#e5e7eb"}`,
                borderRadius: "0.5rem",
                padding: "0.5rem",
                width: "150px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  height: "80px",
                  backgroundColor: "#1f2937",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.375rem",
                  marginBottom: "0.5rem",
                }}
              />
              <div
                style={{
                  fontSize: "0.875rem",
                  marginTop: "0.5rem",
                  fontWeight: "500",
                  color: theme === "dark" ? "#fff" : "inherit",
                }}
              >
                Dark
              </div>
            </div>

            <div
              onClick={() => setTheme("system")}
              style={{
                cursor: "pointer",
                border: `2px solid ${theme === "system" ? primaryColor : "#e5e7eb"}`,
                borderRadius: "0.5rem",
                padding: "0.5rem",
                width: "150px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  height: "80px",
                  background: "linear-gradient(to right, #ffffff 50%, #1f2937 50%)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "0.375rem",
                  marginBottom: "0.5rem",
                }}
              />
              <div style={{ fontSize: "0.875rem", marginTop: "0.5rem", fontWeight: "500" }}>System</div>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-divider"></div>

      <div className="settings-section">
        <h3 className="settings-section-title">Primary Color</h3>
        <div className="settings-form-group">
          <label className="settings-label">Select a primary color</label>
          <div className="settings-color-picker">
            {colors.map((color) => (
              <div
                key={color.value}
                className={`settings-color-option ${primaryColor === color.value ? "active" : ""}`}
                style={{ backgroundColor: color.value }}
                onClick={() => setPrimaryColor(color.value)}
                title={color.name}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="settings-divider"></div>

      <div className="settings-section">
        <h3 className="settings-section-title">Font Size</h3>
        <div className="settings-form-group">
          <label className="settings-label" htmlFor="fontSize">
            Default Font Size
          </label>
          <select id="fontSize" className="settings-select" defaultValue="medium">
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option value="xlarge">Extra Large</option>
          </select>
          <p className="settings-help-text">This affects the base font size throughout the CMS</p>
        </div>
      </div>

      <div className="settings-divider"></div>

      <div className="settings-section">
        <h3 className="settings-section-title">Layout</h3>
        <div className="settings-form-group">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <label className="settings-label">Compact Mode</label>
              <p className="settings-help-text">Reduce spacing and padding throughout the interface</p>
            </div>
            <label className="settings-toggle">
              <input type="checkbox" />
              <span className="settings-toggle-slider"></span>
            </label>
          </div>
        </div>
        <div className="settings-form-group">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <label className="settings-label">Show Quick Actions</label>
              <p className="settings-help-text">Display quick action buttons in the dashboard</p>
            </div>
            <label className="settings-toggle">
              <input type="checkbox" defaultChecked />
              <span className="settings-toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AppearanceSettings

