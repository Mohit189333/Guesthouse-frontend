import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import "../css/BookingConfirmation.css";

function BookingConfirmation() {
  const { state } = useLocation();
  const navigate = useNavigate();

  if (!state?.booking) {
    navigate("/");
    return null;
  }

  const { booking, room } = state;

  return (
    <Layout>
      <div className="confirmation-container">
        <div className="confirmation-card">
          <div className="confirmation-header">
            <div className="confirmation-icon">✓</div>
            <h1>Booking Confirmed!</h1>
            <p>Your reservation has been successfully submitted for approval.</p>
          </div>

          <div className="confirmation-details">
            <h2>Booking Details</h2>
            <div className="detail-row">
              <span className="detail-label">Booking ID:</span>
              <span className="detail-value">{booking.id}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Room:</span>
              <span className="detail-value">{room.name}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Check-in:</span>
              <span className="detail-value">
                {new Date(booking.checkInDate).toLocaleDateString()}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Check-out:</span>
              <span className="detail-value">
                {new Date(booking.checkOutDate).toLocaleDateString()}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status:</span>
              <span className={`status-badge ${booking.status.toLowerCase()}`}>
                {booking.status}
              </span>
            </div>
          </div>

          <div className="confirmation-actions">
            <button 
              className="view-bookings-btn"
              onClick={() => navigate("/my-bookings")}
            >
              View My Bookings
            </button>
            <button 
              className="home-btn"
              onClick={() => navigate("/")}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default BookingConfirmation;