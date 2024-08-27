import React, { useState } from "react";
import "../css/LoginModal.css";

const LoginModal = ({ onSubmit }) => {
  const [username, setUsername] = useState("");

  const handleUsernameChange = (e) => {
    setUsername(e.target.value);
  };

  const handleSubmit = () => {
    if (username.trim()) {
      onSubmit(username); // Pass only username to the parent
    }
  };

  return (
    <div className="login-modal">
      <div className="login-modal-content">
        <h2>Welcome to ChatApp</h2>
        <label>
          Enter Username:
          <input
            type="text"
            value={username}
            onChange={handleUsernameChange}
            placeholder="Your username"
            required
          />
        </label>
        <button  className ="start-btn" onClick={handleSubmit} disabled={!username.trim()}>
          Start Chat
        </button>
      </div>
    </div>
  );
};

export default LoginModal;
