import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import "bootstrap/dist/css/bootstrap.min.css";
import "../css/ForgottenPassword.css"; // Import custom styles if needed

const ForgottenPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add logic to handle password reset here
    // For now, let's simulate a success message
    if (email) {
      setMessage("Password reset link sent to your email.");
      setError("");
    } else {
      setError("Please enter a valid email address.");
      setMessage("");
    }
  };

  return (
    <div className="forgotten-password-container container mt-5 shadow-lg p-4 rounded">
      <img
        src="/chick.png"
        alt="Logo"
        className="mb-4"
        style={{ height: "50px", width: "50px" }}
      />
      <h2 className="mb-4">Forgot Password</h2>
      <p className="text-muted mb-4">
        Please enter your email address to receive a password reset link.
      </p>
      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            type="email"
            className="form-control forgotten-password-input"
            id="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="btn btn-primary forgotten-password-button"
          style={{ width: "100%" }} // Same width for button as input
        >
          Submit
        </button>
      </form>
      <div className="text-center mt-3">
        <Link to="/" className="text-decoration-none text-primary">
          &lt; Return to Login Page
        </Link>
      </div>
    </div>
  );
};

export default ForgottenPassword;
