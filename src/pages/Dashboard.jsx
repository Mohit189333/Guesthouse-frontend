import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import "../css/Dashboard.css";
import Layout from "../components/Layout";
import { FiCalendar, FiHome, FiBookmark, FiDollarSign, FiClock, FiPlusCircle, FiSearch } from "react-icons/fi";
import RoomCard from "../components/RoomCard"; // You'll need to create this component

function Dashboard() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);
  const [checkInDate, setCheckInDate] = useState("");
  const [checkOutDate, setCheckOutDate] = useState("");
  const [availableRooms, setAvailableRooms] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      // navigate("/login");
      return;
    }

    try {
      const decodedToken = jwtDecode(token);
      const userRole = decodedToken.roles ? decodedToken.roles[0] : null;
      setRole(userRole);
    } catch (error) {
      console.error("Invalid token");
      localStorage.removeItem("jwtToken");
      // navigate("/login");
    }
  }, [navigate]);

  const handleDateChange = (event) => {
    const { name, value } = event.target;
    if (name === "checkIn") {
      setCheckInDate(value);
    } else if (name === "checkOut") {
      setCheckOutDate(value);
    }
  };

  const handleSearch = async () => {
    if (!checkInDate || !checkOutDate) {
      alert("Please select both check-in and check-out dates");
      return;
    }

    setIsSearching(true);
    try {
      // Replace with actual API call to fetch available rooms
      // const response = await axios.get(`/api/rooms/available?checkIn=${checkInDate}&checkOut=${checkOutDate}`);
      // setAvailableRooms(response.data);
      
      // Mock data for demonstration
      const mockRooms = [
        {
          id: 1,
          name: "Deluxe Room",
          description: "Spacious room with king-size bed and city view",
          pricePerNight: 150,
          imageUrl: "https://example.com/room1.jpg",
          amenities: ["WiFi", "AC", "TV", "Minibar"]
        },
        {
          id: 2,
          name: "Standard Room",
          description: "Comfortable room with queen-size bed",
          pricePerNight: 100,
          imageUrl: "https://example.com/room2.jpg",
          amenities: ["WiFi", "AC"]
        }
      ];
      setAvailableRooms(mockRooms);
    } catch (error) {
      console.error("Error fetching available rooms:", error);
      alert("Failed to fetch available rooms");
    } finally {
      setIsSearching(false);
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
        {availableRooms.length > 0 && (
          <div className="available-rooms-section">
            <h2 className="section-title">Available Rooms</h2>
            <div className="rooms-grid">
              {availableRooms.slice(0, 3).map(room => (
                <RoomCard 
                  key={room.id}
                  room={room}
                  checkInDate={checkInDate}
                  checkOutDate={checkOutDate}
                />
              ))}
            </div>
            {availableRooms.length > 3 && (
              <div className="view-more-container">
                <button 
                  className="view-more-button"
                  onClick={() => navigate("/all-rooms", { 
                    state: { 
                      checkInDate, 
                      checkOutDate 
                    } 
                  })}
                >
                  View More Rooms
                </button>
              </div>
            )}
          </div>
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
                  <button className="action-button" onClick={() => navigate("/manage-rooms")}>
                    <FiHome className="button-icon" />
                    Manage Rooms
                  </button>
                  <button className="action-button" onClick={() => navigate("/manage-bookings")}>
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
                  <p>2 Bookings</p>
                  <span className="stat-trend">Next: May 20</span>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <FiBookmark />
                  </div>
                  <h3>Total Stays</h3>
                  <p>5 Completed</p>
                  <span className="stat-trend">Since 2023</span>
                </div>
              </div>
              <div className="quick-actions">
                <h3 className="section-title">Quick Actions</h3>
                <div className="action-buttons">
                  <button className="action-button" onClick={() => navigate("/all-rooms")}>
                    <FiHome className="button-icon" />
                    Browse Rooms
                  </button>
                  <button className="action-button" onClick={() => navigate("/book-room")}>
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