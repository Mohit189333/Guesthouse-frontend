import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../css/Dashboard.css";
import Layout from "../components/Layout";
import {
  FiCalendar,
  FiHome,
  FiBookmark,
  FiDollarSign,
  FiClock,
  FiPlusCircle,
  FiSearch,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiX
} from "react-icons/fi";
import RoomCard from "../components/RoomCard";
import axios from "axios";

function Dashboard() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [roomsLoading, setRoomsLoading] = useState(false);
  const [roomsError, setRoomsError] = useState("");

  // State for admin guest house form
  const [ghName, setGhName] = useState("");
  const [ghLocation, setGhLocation] = useState("");
  const [ghDescription, setGhDescription] = useState("");
  const [ghContact, setGhContact] = useState("");
  const [addGHErr, setAddGHErr] = useState("");
  const [addGHLoading, setAddGHLoading] = useState(false);
  const [addGHSuccess, setAddGHSuccess] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);

  // State for manage guest houses (admin)
  const [guestHouses, setGuestHouses] = useState([]);
  const [ghLoading, setGhLoading] = useState(false);
  const [ghError, setGhError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({ name: "", location: "", description: "", contactInfo: "" });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [deleteLoadingId, setDeleteLoadingId] = useState(null);

const [userBookings, setUserBookings] = useState([]);
const [bookingsLoading, setBookingsLoading] = useState(false);
const [bookingsError, setBookingsError] = useState("");


  
  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.roles ? decodedToken.roles[0] : null;
      setRole(userRole);
    } catch (error) {
      console.error("Invalid token");
      localStorage.removeItem("jwtToken");
      navigate("/login");
    }
  }, [navigate]);


  useEffect(() => {
  if (role === "USER") {
    fetchUserBookings();
  }
}, [role]);

const fetchUserBookings = async () => {
  setBookingsLoading(true);
  setBookingsError("");
  try {
    const token = localStorage.getItem("jwtToken");
    const response = await axios.get("http://localhost:5050/api/bookings/my", {
      headers: { Authorization: `Bearer ${token}` }
    });
    setUserBookings(response.data);
  } catch (err) {
    setBookingsError("Failed to load your bookings.");
    console.error("Error fetching bookings:", err);
  } finally {
    setBookingsLoading(false);
  }
};

// Helper functions to calculate the stats
const getUpcomingBookings = () => {
  const today = new Date();
  return userBookings.filter(booking => {
    const checkInDate = new Date(booking.checkInDate);
    return (
      (booking.status === "APPROVED" || booking.status === "PENDING") && 
      checkInDate >= today
    );
  });
};

const getCompletedStays = () => {
  const today = new Date();
  return userBookings.filter(booking => {
    const checkOutDate = new Date(booking.checkOutDate);
    return (
      booking.status === "APPROVED" && 
      checkOutDate < today
    );
  });
};

const getNextBookingDate = () => {
  const upcoming = getUpcomingBookings();
  if (upcoming.length === 0) return null;
  
  // Sort by check-in date ascending
  upcoming.sort((a, b) => new Date(a.checkInDate) - new Date(b.checkInDate));
  return new Date(upcoming[0].checkInDate);
};

// Format date for display
const formatShortDate = (date) => {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
  // Load guest houses for admin
  useEffect(() => {
    if (role === "ADMIN") {
      fetchGuestHouses();
    }
  }, [role, addGHSuccess]);

  const fetchGuestHouses = async () => {
    setGhLoading(true);
    setGhError("");
    try {
      const token = localStorage.getItem("jwtToken");
      const res = await axios.get("http://localhost:5050/api/guest-houses", {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGuestHouses(res.data);
    } catch (err) {
      setGhError("Failed to load guest houses.");
    } finally {
      setGhLoading(false);
    }
  };

  const handleDateChange = (event) => {
    const { name, value } = event.target;
    if (name === "checkIn") setCheckInDate(value);
    if (name === "checkOut") setCheckOutDate(value);
  };

  const handleSearch = async () => {
    if (!checkInDate || !checkOutDate) {
      alert("Please select both check-in and check-out dates");
      return;
    }
    
    // Validate dates
    const today = new Date().toISOString().split('T')[0];
    if (checkInDate < today) {
      alert("Check-in date cannot be in the past");
      return;
    }
    if (checkOutDate <= checkInDate) {
      alert("Check-out date must be after check-in date");
      return;
    }

    setIsSearching(true);
    setRoomsLoading(true);
    setRoomsError("");
    try {
      const response = await axios.get(
        `http://localhost:5050/api/rooms/available-range?checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`
      );
      setAvailableRooms(response.data);
    } catch (error) {
      console.error("Error fetching available rooms:", error);
      setRoomsError("Failed to fetch available rooms. Please try again later.");
    } finally {
      setIsSearching(false);
      setRoomsLoading(false);
    }
  };

  // Admin: Add Guest House Handler
  const handleAddGuestHouse = async (e) => {
    e.preventDefault();
    setAddGHErr("");
    setAddGHSuccess(false);
    if (!ghName || !ghLocation) {
      setAddGHErr("Name and location are required");
      return;
    }
    setAddGHLoading(true);
    try {
      const token = localStorage.getItem("jwtToken");
      await axios.post(
        "http://localhost:5050/api/guest-houses",
        {
          name: ghName,
          location: ghLocation,
          description: ghDescription,
          contactInfo: ghContact,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setAddGHSuccess(true);
      setGhName("");
      setGhLocation("");
      setGhDescription("");
      setGhContact("");
      setShowAddForm(false);
    } catch (err) {
      setAddGHErr(
        err?.response?.data?.message ||
          "Failed to add guest house. Please check your input and try again."
      );
    } finally {
      setAddGHLoading(false);
    }
  };

  // Admin: Edit Guest House
  const startEditGuestHouse = (gh) => {
    setEditingId(gh.id);
    setEditData({
      name: gh.name,
      location: gh.location,
      description: gh.description || "",
      contactInfo: gh.contactInfo || ""
    });
    setEditError("");
  };

  const handleEditChange = (e) => {
    setEditData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSaveEdit = async (ghId) => {
    if (!editData.name || !editData.location) {
      setEditError("Name and location are required");
      return;
    }
    setEditLoading(true);
    setEditError("");
    try {
      const token = localStorage.getItem("jwtToken");
      await axios.put(
        `http://localhost:5050/api/guest-houses/${ghId}`,
        {
          name: editData.name,
          location: editData.location,
          description: editData.description,
          contactInfo: editData.contactInfo,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setEditingId(null);
      fetchGuestHouses();
    } catch (err) {
      setEditError(
        err?.response?.data?.message ||
          "Failed to update guest house. Please check your input and try again."
      );
    } finally {
      setEditLoading(false);
    }
  };

  // Admin: Delete Guest House
  const handleDeleteGuestHouse = async (ghId) => {
    if (!window.confirm("Are you sure you want to delete this guest house?")) return;
    setDeleteLoadingId(ghId);
    try {
      const token = localStorage.getItem("jwtToken");
      await axios.delete(
        `http://localhost:5050/api/guest-houses/${ghId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchGuestHouses();
    } catch (err) {
      alert("Failed to delete guest house.");
    } finally {
      setDeleteLoadingId(null);
    }
  };

  return (
    <Layout>
      <div className="dashboard-container">
          
        <div className="hero-banner">
          <div className="hero-content">
            <h1>Welcome to {role === "ADMIN" ? "Admin Portal" : "Guest House Booking"}</h1>
            <p className="hero-subtitle">
              {role === "ADMIN"
                ? "Manage properties, bookings, and guest experiences"
                : "Find your perfect stay with our premium accommodations"}
            </p>
          </div>
        </div>

        {role === "ADMIN" ? (
          <>
            {/* Combined Manage and Add Guest Houses Section */}
            <div className="manage-guesthouse-card">
              <div className="manage-guesthouse-header">
                <div className="header-left">
                  <FiHome className="manage-gh-icon" />
                  <h3>Manage Guest Houses</h3>
                </div>
                <button
                  className="add-gh-toggle-button"
                  onClick={() => setShowAddForm(!showAddForm)}
                >
                  <FiPlusCircle className="button-icon" />
                  {showAddForm ? 'Cancel' : 'Add Guest House'}
                </button>
              </div>

              {/* Add Guest House Form (conditionally shown) */}
              {showAddForm && (
                <div className="add-guesthouse-form">
                  <form onSubmit={handleAddGuestHouse}>
                    <div className="form-grid">
                      <div className="form-field">
                        <label htmlFor="ghName">
                          Name <span style={{ color: "#e74c3c" }}>*</span>
                        </label>
                        <input
                          type="text"
                          id="ghName"
                          name="ghName"
                          value={ghName}
                          onChange={(e) => setGhName(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor="ghLocation">
                          Location <span style={{ color: "#e74c3c" }}>*</span>
                        </label>
                        <input
                          type="text"
                          id="ghLocation"
                          name="ghLocation"
                          value={ghLocation}
                          onChange={(e) => setGhLocation(e.target.value)}
                          required
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor="ghDescription">Description</label>
                        <textarea
                          id="ghDescription"
                          name="ghDescription"
                          value={ghDescription}
                          onChange={(e) => setGhDescription(e.target.value)}
                          rows={2}
                        />
                      </div>
                      <div className="form-field">
                        <label htmlFor="ghContact">Contact Info</label>
                        <input
                          type="text"
                          id="ghContact"
                          name="ghContact"
                          value={ghContact}
                          onChange={(e) => setGhContact(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="form-actions">
                      <button
                        type="submit"
                        className="submit-button"
                        disabled={addGHLoading}
                      >
                        {addGHLoading ? "Adding..." : "Add Guest House"}
                      </button>
                    </div>
                    {addGHErr && <div className="error-msg">{addGHErr}</div>}
                    {addGHSuccess && (
                      <div className="success-msg">
                        Guest house added successfully!
                      </div>
                    )}
                  </form>
                </div>
              )}

              {/* Guest Houses List */}
              {ghLoading ? (
                <div className="dashboard-loading">Loading guest houses…</div>
              ) : ghError ? (
                <div className="error-msg">{ghError}</div>
              ) : guestHouses.length === 0 ? (
                <div className="dashboard-empty">No guest houses found.</div>
              ) : (
                <div className="guesthouse-list">
                  {guestHouses.map((gh) =>
                    editingId === gh.id ? (
                      <div className="guesthouse-row editing" key={gh.id}>
                        <input
                          className="gh-edit-input"
                          name="name"
                          value={editData.name}
                          onChange={handleEditChange}
                          placeholder="Name"
                        />
                        <input
                          className="gh-edit-input"
                          name="location"
                          value={editData.location}
                          onChange={handleEditChange}
                          placeholder="Location"
                        />
                        <input
                          className="gh-edit-input"
                          name="description"
                          value={editData.description}
                          onChange={handleEditChange}
                          placeholder="Description"
                        />
                        <input
                          className="gh-edit-input"
                          name="contactInfo"
                          value={editData.contactInfo}
                          onChange={handleEditChange}
                          placeholder="Contact Info"
                        />
                        <button
                          className="gh-action-button gh-save"
                          title="Save"
                          onClick={() => handleSaveEdit(gh.id)}
                          disabled={editLoading}
                        >
                          <FiSave />
                        </button>
                        <button
                          className="gh-action-button gh-cancel"
                          title="Cancel"
                          onClick={() => setEditingId(null)}
                          disabled={editLoading}
                        >
                          <FiX />
                        </button>
                        {editError && (
                          <span className="gh-row-error">{editError}</span>
                        )}
                      </div>
                    ) : (
                      <div className="guesthouse-row" key={gh.id}>
                        <div className="gh-info">
                          <div className="gh-name">{gh.name}</div>
                          <div className="gh-location">{gh.location}</div>
                          <div className="gh-description">{gh.description}</div>
                          <div className="gh-contact">{gh.contactInfo}</div>
                        </div>
                        <div className="gh-actions">
                          <button
                            className="gh-action-button gh-edit"
                            title="Edit"
                            onClick={() => startEditGuestHouse(gh)}
                            disabled={editingId !== null}
                          >
                            <FiEdit2 />
                          </button>
                          <button
                            className="gh-action-button gh-delete"
                            title="Delete"
                            onClick={() => handleDeleteGuestHouse(gh.id)}
                            disabled={deleteLoadingId === gh.id || editingId !== null}
                          >
                            {deleteLoadingId === gh.id ? (
                              <span className="gh-delete-spinner"></span>
                            ) : (
                              <FiTrash2 />
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <div className="date-selection-card">
              <div className="date-selection-header">
                <FiCalendar className="date-icon" />
                <h3>Plan Your Stay</h3>
              </div>
              <form className="date-form" onSubmit={(e) => { e.preventDefault(); handleSearch(); }}>
                <div className="form-field">
                  <label htmlFor="checkIn">Check-in Date</label>
                  <input
                    type="date"
                    id="checkIn"
                    name="checkIn"
                    value={checkInDate}
                    onChange={handleDateChange}
                    min={new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <div className="form-field">
                  <label htmlFor="checkOut">Check-out Date</label>
                  <input
                    type="date"
                    id="checkOut"
                    name="checkOut"
                    value={checkOutDate}
                    onChange={handleDateChange}
                    min={checkInDate || new Date().toISOString().split('T')[0]}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="search-button"
                  disabled={isSearching}
                >
                  <FiSearch className="button-icon" />
                  {isSearching ? "Searching..." : "Search Rooms"}
                </button>
              </form>
            </div>

            {/* Available Rooms Section */}
            {roomsLoading ? (
              <div className="dashboard-loading">Loading available rooms...</div>
            ) : roomsError ? (
              <div className="error-msg">{roomsError}</div>
            ) : availableRooms.length > 0 ? (
              <div className="available-rooms-section">
                <h2 className="section-title">Available Rooms</h2>
                <p className="section-subtitle">
                  Showing rooms available from {new Date(checkInDate).toLocaleDateString()} to {new Date(checkOutDate).toLocaleDateString()}
                </p>
                <div className="rooms-grid">
                  {availableRooms.slice(0, 3).map((room) => (
                    <RoomCard
                      key={room.id}
                      room={room}
                      checkInDate={checkInDate}
                      checkOutDate={checkOutDate}
                      onButtonClick={() => navigate(`/room-details/${room.id}`)}
                    />
                  ))}
                </div>
                {availableRooms.length > 3 && (
                  <div className="view-more-container">
                    <button
                      className="view-more-button"
                      onClick={() =>
                        navigate("/all-rooms", {
                          state: {
                            checkInDate,
                            checkOutDate,
                          },
                        })
                      }
                    >
                      View More Rooms
                    </button>
                  </div>
                )}
              </div>
            ) : isSearching ? (
              <div className="no-rooms-available">
                <h3>No rooms available for the selected dates</h3>
                <p>Please try different dates or check back later.</p>
              </div>
            ) : null}
          </>
        )}

        <div className="dashboard-content">
          {role === "ADMIN" ? (
            <div className="admin-dashboard">
              <h2 className="section-title">Management Overview</h2>
              <div className="dashboard-stats">
                <div className="stat-card">
                  <div className="stat-icon">
                    <FiHome />
                  </div>
                  <h3>Rooms</h3>
                  <p>25 Total Rooms</p>
                  <span className="stat-trend">+2 this month</span>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <FiBookmark />
                  </div>
                  <h3>Bookings</h3>
                  <p>15 Active</p>
                  <span className="stat-trend">78% occupancy</span>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <FiDollarSign />
                  </div>
                  <h3>Revenue</h3>
                  <p>$12,500</p>
                  <span className="stat-trend">This month</span>
                </div>
              </div>
              <div className="quick-actions">
                <h3 className="section-title">Quick Actions</h3>
                <div className="action-buttons">
                  <button
                    className="action-button"
                    onClick={() => navigate("/manage-rooms")}
                  >
                    <FiHome className="button-icon" />
                    Manage Rooms
                  </button>
                  <button
                    className="action-button"
                    onClick={() => navigate("/manage-bookings")}
                  >
                    <FiBookmark className="button-icon" />
                    View Bookings
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="user-dashboard">
  <h2 className="section-title">Your Stay Overview</h2>
  <div className="dashboard-stats">
    <div className="stat-card">
      <div className="stat-icon">
        <FiClock />
      </div>
      <h3>Upcoming</h3>
      <p>{bookingsLoading ? "..." : getUpcomingBookings().length} Booking{getUpcomingBookings().length !== 1 ? "s" : ""}</p>
      {!bookingsLoading && getUpcomingBookings().length > 0 && (
        <span className="stat-trend">
          Next: {formatShortDate(getNextBookingDate())}
        </span>
      )}
      {!bookingsLoading && getUpcomingBookings().length === 0 && (
        <span className="stat-trend">No upcoming stays</span>
      )}
    </div>
    <div className="stat-card">
      <div className="stat-icon">
        <FiBookmark />
      </div>
      <h3>Total Stays</h3>
      <p>{bookingsLoading ? "..." : getCompletedStays().length} Completed</p>
      <span className="stat-trend">
        {bookingsLoading ? "" : `Since ${new Date().getFullYear()}`}
      </span>
    </div>
  </div>
  <div className="quick-actions">
    <h3 className="section-title">Quick Actions</h3>
    <div className="action-buttons">
      <button
        className="action-button"
        onClick={() => navigate("/all-rooms")}
      >
        <FiHome className="button-icon" />
        Browse Rooms
      </button>
      <button
        className="action-button"
        onClick={() => navigate("/book-room")}
      >
        <FiPlusCircle className="button-icon" />
        New Booking
      </button>
    </div>
  </div>
</div>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Dashboard;