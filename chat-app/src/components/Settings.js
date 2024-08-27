// src/components/Settings.js

import React, { useState } from "react";
import "../css/Settings.css"; // Import the updated CSS file

const Settings = ({ onClose }) => {
  const [username, setUsername] = useState("");
  const [theme, setTheme] = useState("light");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const handleSave = () => {
    // Save settings to local storage or send them to the server
    const settings = {
      username,
      theme,
      notificationsEnabled,
    };
    console.log("Settings saved:", settings);
    alert("Settings saved successfully!");
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button
          className="close-button"
          onClick={onClose}
        >
          ×
        </button>
        <h2>Settings</h2>

        <div>
          <label className="settings-label">
            Username:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="settings-input"
            />
          </label>
        </div>

        <div>
          <label className="settings-label">
            Theme:
            <select
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="settings-select"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </label>
        </div>

        <div>
          <label className="settings-label">
            Enable Notifications:
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="settings-checkbox"
            />
          </label>
        </div>

        <button
          onClick={handleSave}
          style={{ padding: "10px 20px", cursor: "pointer" }}
        >
          Save Settings
        </button>
      </div>
    </div>
  );
};

export default Settings;
