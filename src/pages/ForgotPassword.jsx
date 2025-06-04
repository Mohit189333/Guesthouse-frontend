import React, { useState } from "react";
import { FiMail, FiArrowRight } from "react-icons/fi";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setIsSubmitting(true);
    
    try {
      const response = await fetch("http://localhost:5050/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setMessage("Password reset link has been sent to your email address.");
      } else {
        setMessage(data.message || "Error sending reset link. Please try again.");
      }
    } catch (error) {
      setMessage("Network error. Please check your connection and try again.");
      console.error("Forgot password error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          {/* <img src={logo} alt="Company Logo" className="auth-logo" /> */}
          {/* <h1><b>Guest House Booking System</b></h1> */}
          <h2>Forgot Password</h2>
          <p>Enter your email to receive a password reset link</p>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <FiMail className="input-icon" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your.email@example.com"
                required
                autoFocus
              />
            </div>
          </div>

          <button 
            type="submit" 
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              "Sending..."
            ) : (
              <>
                Send Reset Link <FiArrowRight className="btn-icon" />
              </>
            )}
          </button>

          {message && (
            <div className={`auth-message ${message.includes("sent") ? "success" : "error"}`}>
              {message}
            </div>
          )}
        </form>

        <div className="auth-footer">
          <p>
            Remember your password? <Link to="/login">Sign in</Link>
          </p>
          <p>
            Don't have an account? <Link to="/register">Create account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;