import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FiCalendar, FiFilter, FiX, FiArrowRight, FiInfo } from "react-icons/fi";
import "../css/MyBookings.css";
import Loader from "../components/Loader"; // <-- Import Loader

function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLoader, setShowLoader] = useState(false); // <-- Add this
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        if (!token) {
          navigate("/login");
          return;
        }

        const response = await axios.get("http://localhost:5050/api/bookings/my", {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setBookings(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch bookings. Please try again later.");
        setLoading(false);
        console.error("Fetch bookings error:", err);
        
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    fetchBookings();
  }, [navigate]);

  const filteredBookings = bookings.filter(booking => {
    // Filter by status
    if (filterStatus !== "ALL" && booking.status !== filterStatus) {
      return false;
    }
    
    // Filter by date range
    if (startDate && endDate) {
      const bookingDate = new Date(booking.checkInDate);
      return bookingDate >= startDate && bookingDate <= endDate;
    }
    
    return true;
  });

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    setShowLoader(true); // <-- Show the loader

    try {
      const token = localStorage.getItem("jwtToken");
      await axios.delete(`http://localhost:5050/api/bookings/${bookingId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      });

      // Update local state optimistically
      setBookings(bookings.map(b => 
        b.id === bookingId ? {...b, status: "CANCELLED"} : b
      ));
      
      // Show success message
      alert("Booking cancelled successfully!");
    } catch (err) {
      console.error("Cancel booking error:", err);
      
      const errorMessage = err.response?.data?.message || 
        (err.response?.status === 403 
          ? "You can only cancel your own bookings" 
          : "Failed to cancel booking. Please try again.");
      
      alert(errorMessage);
    } finally {
      setShowLoader(false); // <-- Hide the loader
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "APPROVED":
        return "status-badge status-approved";
      case "PENDING":
        return "status-badge status-pending";
      case "REJECTED":
        return "status-badge status-rejected";
      case "CANCELLED":
        return "status-badge status-cancelled";
      default:
        return "status-badge";
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading your bookings...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="error-container">
          <div className="error-icon">!</div>
          <h3>Error Loading Bookings</h3>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="my-bookings-container">
        <div className="bookings-header">
          <h1>My Bookings</h1>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="filter-toggle-btn"
          >
            <FiFilter /> {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>
        
        {showFilters && (
          <div className="booking-filters">
            <div className="filter-group">
              <label>Status</label>
              <select 
                value={filterStatus} 
                onChange={(e) => setFilterStatus(e.target.value)}
                className="status-filter"
              >
                <option value="ALL">All Statuses</option>
                <option value="PENDING">Pending</option>
                <option value="APPROVED">Approved</option>
                <option value="REJECTED">Rejected</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label>Date Range</label>
              <div className="date-picker-wrapper">
                <DatePicker
                  selectsRange={true}
                  startDate={startDate}
                  endDate={endDate}
                  onChange={(update) => setDateRange(update)}
                  placeholderText="Select date range"
                  className="date-range-picker"
                  calendarClassName="booking-calendar"
                />
                {startDate && (
                  <button 
                    onClick={() => setDateRange([null, null])}
                    className="clear-date-btn"
                  >
                    <FiX />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {filteredBookings.length === 0 ? (
          <div className="no-bookings">
            <div className="no-bookings-icon">
              <FiInfo size={48} />
            </div>
            <h3>No bookings found</h3>
            <p>No bookings match your current filter criteria.</p>
            <button 
              onClick={() => {
                setFilterStatus("ALL");
                setDateRange([null, null]);
              }}
              className="reset-filters-btn"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="bookings-list">
            {filteredBookings.map(booking => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <h3>Booking #{booking.id}</h3>
                  <span className={getStatusBadgeClass(booking.status)}>
                    {booking.status}
                  </span>
                </div>
                
                <div className="booking-details">
                  <div className="detail-row">
                    <span className="detail-label">Room:</span>
                    <span className="detail-value">{booking.roomName || 'N/A'}</span>
                  </div>
                  
                  <div className="date-range">
                    <div className="date-item">
                      <span className="date-label">Check-in</span>
                      <span className="date-value">{formatDate(booking.checkInDate)}</span>
                    </div>
                    <FiArrowRight className="date-arrow" />
                    <div className="date-item">
                      <span className="date-label">Check-out</span>
                      <span className="date-value">{formatDate(booking.checkOutDate)}</span>
                    </div>
                  </div>
                  
                  {booking.rejectionReason && (
                    <div className="detail-row rejection-reason">
                      <span className="detail-label">Rejection Reason:</span>
                      <span className="detail-value">{booking.rejectionReason}</span>
                    </div>
                  )}
                </div>
                
                <div className="booking-actions">
                  {booking.status === "PENDING" && (
                    <button 
                      onClick={() => handleCancelBooking(booking.id)}
                      className="cancel-btn"
                    >
                      Cancel Booking
                    </button>
                  )}
                  <button 
                    onClick={() => navigate(`/room-details/${booking.roomId}`)}
                    className="view-room-btn"
                  >
                    View Room Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {showLoader && <Loader />} {/* Fullscreen loader overlays everything */}
    </Layout>
  );
}

export default MyBookings;