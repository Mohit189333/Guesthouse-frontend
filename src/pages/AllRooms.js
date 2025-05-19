import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import "../css/Rooms.css";

function AllRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const response = await axios.get("http://localhost:5050/api/rooms/available");
        setRooms(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch rooms. Please try again later.");
        setLoading(false);
      }
    };

    fetchRooms();
  }, []);

  const handleRoomClick = (roomId) => {
    navigate(`/room-details/${roomId}`);
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         room.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === "all" || room.roomType === filter;
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading rooms...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button">
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="rooms-page">
        <div className="rooms-header">
          <h1>Available Rooms</h1>
          <p className="subtitle">Find your perfect accommodation for your stay</p>
          
          <div className="search-filter-container">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <span className="search-icon">🔍</span>
            </div>
            
            <div className="filter-dropdown">
              <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                <option value="all">All Room Types</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Suite">Suite</option>
                <option value="Deluxe">Deluxe</option>
              </select>
            </div>
          </div>
        </div>

        {filteredRooms.length === 0 ? (
          <div className="no-results">
            <p>No rooms match your search criteria.</p>
            <button 
              onClick={() => {
                setSearchTerm("");
                setFilter("all");
              }}
              className="clear-filters"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="rooms-grid">
            {filteredRooms.map((room) => (
              <div 
                className="room-card" 
                key={room.id}
                onClick={() => handleRoomClick(room.id)}
              >
                <div className="room-image-container">
                  <img 
                    src={room.imageUrl || "/default-room.jpg"} 
                    alt={room.name} 
                    className="room-image"
                    onError={(e) => {
                      e.target.src = "/default-room.jpg";
                    }}
                  />
                  <div className="room-type-badge">{room.roomType}</div>
                </div>
                
                <div className="room-content">
                  <h3>{room.name}</h3>
                  <p className="room-description">
                    {room.description.length > 100 
                      ? `${room.description.substring(0, 100)}...` 
                      : room.description}
                  </p>
                  
                  <div className="room-features">
                    <div className="feature">
                      <span className="feature-icon">🛏️</span>
                      <span>{room.bedCount} {room.bedCount > 1 ? 'Beds' : 'Bed'}</span>
                    </div>
                    <div className="feature">
                      <span className="feature-icon">👥</span>
                      <span>Max {room.maxOccupancy} {room.maxOccupancy > 1 ? 'Guests' : 'Guest'}</span>
                    </div>
                  </div>
                  
                  <div className="room-footer">
                    <div className="price">
                      <span className="price-amount">${room.pricePerNight}</span>
                      {/* <span className="price-label">/ night</span> */}
                    </div>
                    <button 
                      className="view-details-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRoomClick(room.id);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

export default AllRooms;