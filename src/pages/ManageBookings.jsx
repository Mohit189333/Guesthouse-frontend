import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import "../css/ManageBookings.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Loader from "../components/Loader";
  import {ToastContainer,toast} from 'react-toastify'


function ManageBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [searchQuery, setSearchQuery] = useState("");
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [logsError, setLogsError] = useState("");
  const [logStatusFilter, setLogStatusFilter] = useState("ALL");
  const [actionLoadingId, setActionLoadingId] = useState(null); // booking id which is being processed
  const navigate = useNavigate();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        const response = await axios.get(
          "http://localhost:5050/api/bookings/pending",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
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

  // Fetch logs for all bookings (audit logs)
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const token = localStorage.getItem("jwtToken");
        setLogsLoading(true);
        const response = await axios.get(
          "http://localhost:5050/api/admin/booking-logs",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setLogs(response.data);
        setLogsLoading(false);
      } catch (err) {
        setLogsError("Failed to fetch booking logs. Please try again later.");
        setLogsLoading(false);
        console.error("Fetch booking logs error:", err);

        if (err.response?.status === 401) {
          localStorage.removeItem("jwtToken");
          navigate("/login");
        }
      }
    };

    fetchLogs();
  }, [navigate]);

  const filteredBookings = bookings.filter((booking) => {
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

  const filteredLogs = logs.filter((log) => {
    if (logStatusFilter !== "ALL" && log.status !== logStatusFilter) {
      return false;
    }
    return true;
  });

  const handleApprove = async (bookingId) => {
      setActionLoadingId(bookingId); // show loader for this booking
    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axios.post(
        `http://localhost:5050/api/bookings/${bookingId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookings(
        bookings.map((b) => (b.id === bookingId ? response.data : b))
      );
    } catch (err) {
      console.error("Approve booking error:", err);
      toast.error("Failed to approve booking. Please try again.");
    }finally {
    setActionLoadingId(null); // hide loader
  }
  };

  const handleReject = async (bookingId) => {
    const reason = prompt("Please enter rejection reason:");
    if (!reason) return;

      setActionLoadingId(bookingId); // show loader for this booking

    try {
      const token = localStorage.getItem("jwtToken");
      const response = await axios.post(
        `http://localhost:5050/api/bookings/${bookingId}/reject`,
        null,
        {
          params: { reason },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setBookings(
        bookings.map((b) => (b.id === bookingId ? response.data : b))
      );
    } catch (err) {
      console.error("Reject booking error:", err);
      toast.error("Failed to reject booking. Please try again.");
    }finally {
    setActionLoadingId(null); // hide loader
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
        <ToastContainer
          position="bottom-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
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
                {filteredBookings.map((booking) => (
                  <tr key={booking.id}>
                    <td>{booking.id}</td>
                    <td>{booking.userName || "N/A"}</td>
                    <td>{booking.roomName || "N/A"}</td>
                    <td>
                      {new Date(booking.checkInDate).toLocaleDateString()}
                    </td>
                    <td>
                      {new Date(booking.checkOutDate).toLocaleDateString()}
                    </td>
                    <td>
                      <span className={getStatusBadgeClass(booking.status)}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="actions-cell">
                      {actionLoadingId === booking.id ? (
    <Loader />
  ) :booking.status === "PENDING" && (
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
                          onClick={() =>
                            navigate(`/room-details/${booking.roomId}`)
                          }
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

        {/* --- BOOKINGS LOGS SECTION --- */}
        <div className="booking-logs-section">
          <h2>Booking Logs</h2>
          <div
            className="filter-group"
            style={{ maxWidth: 250, margin: "0 auto 1rem auto" }}
          >
            <label>Filter by Status:</label>
            <select
              value={logStatusFilter}
              onChange={(e) => setLogStatusFilter(e.target.value)}
              className="status-filter"
            >
              <option value="ALL">All Statuses</option>
              <option value="PENDING">Pending</option>
              <option value="APPROVED">Approved</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          {logsLoading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading booking logs...</p>
            </div>
          ) : logsError ? (
            <div className="error-container">
              <div className="error-icon">!</div>
              <h3>Error Loading Booking Logs</h3>
              <p>{logsError}</p>
              <button
                onClick={() => window.location.reload()}
                className="retry-button"
              >
                Try Again
              </button>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="no-bookings">
              <p>No booking logs found.</p>
            </div>
          ) : (
            <div className="bookings-table-container">
              <table className="bookings-table bookings-logs-table">
                <thead>
                  <tr>
                    <th>Log ID</th>
                    <th>Booking ID</th>
                    <th>User</th>
                    <th>User Email</th>
                    <th>Room</th>
                    <th>Status</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Action</th>
                    <th>Action Time</th>
                    <th>Rejection Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLogs.map((log) => (
                    <tr key={log.logId || `${log.bookingId}-${log.actionTime}`}>
                      <td>{log.logId}</td>
                      <td>{log.bookingId}</td>
                      <td>{log.username || "N/A"}</td>
                      <td>{log.userEmail || "N/A"}</td>
                      <td>{log.roomName || "N/A"}</td>
                      <td>
                        <span className={getStatusBadgeClass(log.status)}>
                          {log.status}
                        </span>
                      </td>
                      <td>
                        {log.checkInDate
                          ? new Date(log.checkInDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>
                        {log.checkOutDate
                          ? new Date(log.checkOutDate).toLocaleDateString()
                          : "N/A"}
                      </td>
                      <td>{log.action}</td>
                      <td>
                        {log.actionTime
                          ? new Date(log.actionTime).toLocaleString()
                          : "N/A"}
                      </td>
                      <td>{log.rejectionReason || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default ManageBookings;
