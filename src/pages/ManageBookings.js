import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import "../css/ManageBookings.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await axios.get("http://localhost:5050/api/bookings/pending", {
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
          localStorage.removeItem("jwtToken");
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
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        booking.user?.username?.toLowerCase().includes(query) ||
        booking.room?.name?.toLowerCase().includes(query) ||
        booking.id.toString().includes(query)
      );
    }
    
    return true;
  });

  const handleApprove = async (bookingId) => {
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axios.post(
        `http://localhost:5050/api/bookings/${bookingId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setBookings(bookings.map(b => 
        b.id === bookingId ? response.data : b
      ));
    } catch (err) {
      console.error("Approve booking error:", err);
      setError("Failed to approve booking. Please try again.");
    }
  };

  const handleReject = async (bookingId) => {
    const reason = prompt("Please enter rejection reason:");
    if (!reason) return;

    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axios.post(
        `http://localhost:5050/api/bookings/${bookingId}/reject`,
        null,
        {
          params: { reason },
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setBookings(bookings.map(b => 
        b.id === bookingId ? response.data : b
      ));
    } catch (err) {
      console.error("Reject booking error:", err);
      setError("Failed to reject booking. Please try again.");
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "APPROVED":
        return "status-badge approved";
      case "PENDING":
        return "status-badge pending";
      case "REJECTED":
        return "status-badge rejected";
      case "CANCELLED":
        return "status-badge cancelled";
      default:
        return "status-badge";
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading bookings...</p>
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
      <div className="manage-bookings-container">
        <h1>Manage Bookings</h1>
        
        <div className="booking-filters">
          <div className="filter-group">
            <label>Filter by Status:</label>
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="status-filter"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
            </select>
          </div>
          
          <div className="filter-group">
            <label>Filter by Date Range:</label>
            <DatePicker
              selectsRange={true}
              startDate={startDate}
              endDate={endDate}
              onChange={(update) => setDateRange(update)}
              placeholderText="Select date range"
              className="date-range-picker"
            />
            {startDate && (
              <button 
                onClick={() => setDateRange([null, null])}
                className="clear-date-btn"
              >
                Clear
              </button>
            )}
          </div>
          
          <div className="filter-group search-group">
            <label>Search:</label>
            <input
              type="text"
              placeholder="Search by user, room, or ID"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <div className="no-bookings">
            <p>No bookings found matching your criteria.</p>
            <button 
              onClick={() => {
                setFilterStatus("ALL");
                setDateRange([null, null]);
                setSearchQuery("");
              }}
              className="reset-filters-btn"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="bookings-table-container">
            <table className="bookings-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>User</th>
                  <th>Room</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map(booking => (
                  <tr key={booking.id}>
                    <td>{booking.id}</td>
                    <td>{booking.user?.username || 'N/A'}</td>
                    <td>{booking.room?.name || 'N/A'}</td>
                    <td>{new Date(booking.checkInDate).toLocaleDateString()}</td>
                    <td>{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                    <td>
                      <span className={getStatusBadgeClass(booking.status)}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      {booking.status === "PENDING" && (
                        <>
                          <button 
                            onClick={() => handleApprove(booking.id)}
                            className="approve-btn"
                          >
                            Approve
                          </button>
                          <button 
                            onClick={() => handleReject(booking.id)}
                            className="reject-btn"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {booking.status === "APPROVED" && (
                        <button 
                          onClick={() => navigate(`/room-details/${booking.room?.id}`)}
                          className="view-btn"
                        >
                          View Room
                        </button>
                      )}
                      {booking.rejectionReason && (
                        <div className="rejection-reason">
                          <strong>Reason:</strong> {booking.rejectionReason}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Layout>
  );
}

export default ManageBookings;