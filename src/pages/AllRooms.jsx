import React, { useEffect, useState } from "react";
import axios from "axios";
import Layout from "../components/Layout";
import "../css/Rooms.css";
import { useNavigate } from "react-router-dom";


function AllRooms() {
  const [rooms, setRooms]               = useState([]);
  const [guestHouses, setGuestHouses]   = useState([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState("");
  const [searchTerm, setSearchTerm]     = useState("");
  const [filter, setFilter]             = useState("all");
  const [selectedGuestHouse, setSelectedGuestHouse] = useState("all");
  const navigate = useNavigate();

  /* ------------------------------------------------------------------ */
  /* 1️⃣  GET THE LIST OF GUEST-HOUSES ONCE WHEN THE COMPONENT MOUNTS   */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const loadGuestHouses = async () => {
      try {
        const res = await axios.get("http://localhost:5050/api/guest-houses");
        setGuestHouses(res.data);
      } catch (err) {
        setError("Failed to load guest-houses.");
      }
    };
    loadGuestHouses();
  }, []);

  /* ------------------------------------------------------------------ */
  /* 2️⃣  GET ROOMS EVERY TIME THE SELECTED GUEST-HOUSE CHANGES          */
  /*     (INCLUDING THE FIRST RENDER, WHEN IT IS "all")                 */
  /* ------------------------------------------------------------------ */
  useEffect(() => {
    const loadRooms = async () => {
      try {
        setLoading(true);
        const url =
          selectedGuestHouse === "all"
            ? "http://localhost:5050/api/rooms/available"
            : `http://localhost:5050/api/guest-houses/${selectedGuestHouse}/rooms`;

        const res = await axios.get(url);
        setRooms(res.data);
        setError("");
      } catch (err) {
        setError("Failed to load rooms. Please try again later.");
      } finally {
        setLoading(false);
      }
    };
    loadRooms();
  }, [selectedGuestHouse]);

  /* ------------------------------------------------------------------ */
  /* 3️⃣  HANDLERS & FILTERING                                          */
  /* ------------------------------------------------------------------ */
  const handleGuestHouseChange = (e) => {
    setSelectedGuestHouse(e.target.value);
  };

  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFilter = filter === "all" || room.roomType === filter;

    return matchesSearch && matchesFilter;
  });

  /* ------------------------------------------------------------------ */
  /* 4️⃣  RENDER                                                        */
  /* ------------------------------------------------------------------ */
  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner" />
          <p>Loading rooms…</p>
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
      {/* ——— header, search & filter controls ——— */}
      <div className="rooms-header">
        <h1>Available Rooms</h1>
        <p className="subtitle">Find your perfect accommodation for your stay</p>

        <div className="search-filter-container">
          {/* search box */}
          <div className="search-box">
            <input
              type="text"
              placeholder="Search rooms…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <span className="search-icon">🔍</span>
          </div>

          {/* location dropdown */}
          <div className="filter-dropdown">
            <select value={selectedGuestHouse} onChange={handleGuestHouseChange}>
              <option value="all">All Locations</option>
              {guestHouses.map((gh) => (
                <option key={gh.id} value={gh.id}>
                  {gh.location} – {gh.name}
                </option>
              ))}
            </select>
          </div>

          {/* room-type dropdown */}
          <div className="filter-dropdown">
            <select value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="all">All Room Types</option>
              <option value="STANDARD">Standard</option>
              <option value="FAMILY">Family</option>
              <option value="SUITE">Suite</option>
              <option value="DELUXE">Deluxe</option>
            </select>
          </div>
        </div>
      </div>

      {/* ——— rooms list ——— */}
      {filteredRooms.length === 0 ? (
        <div className="no-results">
          <p>No rooms match your search criteria.</p>
          <button
            className="clear-filters"
            onClick={() => {
              setSearchTerm("");
              setFilter("all");
              setSelectedGuestHouse("all");
            }}
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="rooms-grid">
          {filteredRooms.map((room) => (
            <div className="room-card" key={room.id}>
              <div className="room-image-container">
                <img
                  src={room.imageUrl || "/default-room.jpg"}
                  alt={room.name}
                  className="room-image"
                  onError={(e) => (e.target.src = "/default-room.jpg")}
                />
                <div className="room-type-badge">{room.roomType}</div>
              </div>

              <div className="room-content">
                <h3>{room.name}</h3>
                <p className="room-location">
                  {guestHouses.find((gh) => gh.id === room.guestHouseId)?.name}
                </p>
                <p className="room-description">
                  {room.description.length > 100
                    ? `${room.description.slice(0, 100)}…`
                    : room.description}
                </p>

                <div className="room-footer">
                  <div className="price">
                    <span className="price-amount">${room.pricePerNight}</span>
                    <span className="price-label">/ night</span>
                  </div>
                  <button
  className="view-details-button"
  onClick={() => navigate(`/room-details/${room.id}`)}
>
  View Details
</button>

                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Layout>
  );
}

export default AllRooms;
