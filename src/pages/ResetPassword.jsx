import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FiLock, FiCheckCircle, FiArrowRight } from "react-icons/fi";

function validatePassword(password) {
  if (password.length < 8) {
    return "Password must be at least 8 characters.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must include at least one number.";
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return "Password must include at least one special character.";
  }
  return "";
}

function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate password strength
    const pwdError = validatePassword(password);
    if (pwdError) {
      setMessage({ text: pwdError, type: "error" });
      return;
    }

    // Validate passwords match
    if (password !== confirmPassword) {
      setMessage({ text: "Passwords do not match.", type: "error" });
      return;
    }

    setMessage({ text: "", type: "" });
    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5050/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({
          text: "Password reset successfully! Redirecting to login...",
          type: "success"
        });
        setSuccess(true);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setMessage({
          text: data.message || "Error resetting password. Please try again.",
          type: "error"
        });
      }
    } catch (error) {
      setMessage({
        text: "Network error. Please check your connection and try again.",
        type: "error"
      });
      console.error("Reset password error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Reset Your Password</h2>
          <p>Create a new secure password for your account</p>
        </div>

        {!success ? (
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="password">New Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters, 1 uppercase, 1 number, 1 special char"
                  required
                  minLength="8"
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password</label>
              <div className="input-with-icon">
                <FiLock className="input-icon" />
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your new password"
                  required
                  minLength="8"
                />
              </div>
            </div>

            {message.text && (
              <div className={`auth-message ${message.type}`}>
                {message.text}
              </div>
            )}

            <button
              type="submit"
              className="btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Processing..."
              ) : (
                <>
                  Reset Password <FiArrowRight className="btn-icon" />
                </>
              )}
            </button>
          </form>
        ) : (
          <div className="success-state">
            <FiCheckCircle className="success-icon" />
            <p className="success-message">{message.text}</p>
          </div>
        )}

        <div className="auth-footer">
          <p>
            Remember your password? <a href="/login">Sign in</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;