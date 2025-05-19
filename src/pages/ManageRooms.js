import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import "../css/ManageRooms.css";

function ManageRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [newRoom, setNewRoom] = useState({
    name: "",
    description: "",
    pricePerNight: "",
    amenities: "",
    roomType: "",
    isAvailable: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get("http://localhost:5050/api/rooms/available");
      setRooms(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      showMessage("Error fetching rooms. Please try again.", "error");
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const handleEditRoom = (roomId) => {
    navigate(`/update-room/${roomId}`);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewRoom((prevRoom) => ({
      ...prevRoom,
      [name]: value,
    }));
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("jwtToken");

      // Convert amenities string to array
      const amenitiesArray = newRoom.amenities
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0);

      const formData = new FormData();
      formData.append("room", JSON.stringify({
        name: newRoom.name,
        description: newRoom.description,
        pricePerNight: parseFloat(newRoom.pricePerNight),
        amenities: amenitiesArray, // send as array
        roomType: newRoom.roomType,
        isAvailable: newRoom.isAvailable
      }));

      if (imageFile) {
        formData.append("file", imageFile);
      }

      const response = await axios.post("http://localhost:5050/api/rooms/add", formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      showMessage("Room added successfully!", "success");
      resetForm();
      fetchRooms();
    } catch (error) {
      console.error("Full error details:", error);
      console.error("Error response:", error.response?.data);
      showMessage(
        error.response?.data?.message || 
        "Error adding room. Please check console for details.", 
        "error"
      );
    }
  };

  const resetForm = () => {
    setNewRoom({
      name: "",
      description: "",
      pricePerNight: "",
      amenities: "",
      roomType: "",
      isAvailable: true
    });
    setImageFile(null);
    setIsFormOpen(false);
  };

  return (
    <Layout>
      <div className="manage-rooms-page">
        <div className="page-header">
          <h1>Room Management</h1>
          <p>Add, edit, and manage your property's rooms</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="content-container">
          <div className="rooms-section">
            <div className="section-header">
              <h2>Existing Rooms</h2>
              <button 
                className="add-room-toggle"
                onClick={() => setIsFormOpen(!isFormOpen)}
              >
                {isFormOpen ? 'Cancel' : '+ Add New Room'}
              </button>
            </div>

            {isFormOpen && (
              <div className="add-room-section">
                <form className="add-room-form" onSubmit={handleAddRoom}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Room Name</label>
                      <input
                        type="text"
                        name="name"
                        value={newRoom.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Deluxe Suite"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Room Type</label>
                      <select
                        name="roomType"
                        value={newRoom.roomType}
                        onChange={handleInputChange}
                        required
                      >
                        <option value="">Select Type</option>
                        <option value="Single">Single</option>
                        <option value="Double">Double</option>
                        <option value="Suite">Suite</option>
                        <option value="Deluxe">Deluxe</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Price Per Night ($)</label>
                      <input
                        type="number"
                        name="pricePerNight"
                        value={newRoom.pricePerNight}
                        onChange={handleInputChange}
                        required
                        min="0"
                        step="0.01"
                      />
                    </div>
                    
                    <div className="form-group">
                      <label>Available</label>
                      <select
                        name="isAvailable"
                        value={newRoom.isAvailable}
                        onChange={(e) =>
                          setNewRoom((prevRoom) => ({
                            ...prevRoom,
                            isAvailable: e.target.value === "true",
                          }))
                        }
                      >
                        <option value="true">Yes</option>
                        <option value="false">No</option>
                      </select>
                    </div>
                    
                    <div className="form-group">
                      <label>Room Image</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setImageFile(e.target.files[0])}
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label>Description</label>
                      <textarea
                        name="description"
                        value={newRoom.description}
                        onChange={handleInputChange}
                        required
                        rows="3"
                      />
                    </div>
                    
                    <div className="form-group full-width">
                      <label>Amenities (comma separated)</label>
                      <textarea
                        name="amenities"
                        value={newRoom.amenities}
                        onChange={handleInputChange}
                        required
                        rows="2"
                        placeholder="WiFi, TV, Air Conditioning, etc."
                      />
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="submit-button">
                      Add Room
                    </button>
                  </div>
                </form>
              </div>
            )}

            {loading ? (
              <div className="loading-indicator">
                <div className="spinner"></div>
                <p>Loading rooms...</p>
              </div>
            ) : rooms.length === 0 ? (
              <div className="empty-state">
                <p>No rooms found. Add your first room!</p>
              </div>
            ) : (
              <div className="rooms-grid">
                {rooms.map((room) => (
                  <div className="room-card" key={room.id}>
                    <div className="card-image">
                      <img 
                        src={room.imageUrl || "/default-room.jpg"} 
                        alt={room.name}
                        onError={(e) => {
                          e.target.src = "/default-room.jpg";
                        }}
                      />
                      <div className="room-type">{room.roomType}</div>
                    </div>
                    <div className="card-content">
                      <h3>{room.name}</h3>
                      <div className="room-meta">
                        <span>${room.pricePerNight}/night</span>
                        <span className={`availability ${room.isAvailable ? 'available' : 'unavailable'}`}>
                          {room.isAvailable ? 'Available' : 'Booked'}
                        </span>
                      </div>
                      <p className="room-description">{room.description}</p>
                      <div className="room-amenities">
                        <strong>Amenities:</strong> {Array.isArray(room.amenities) ? room.amenities.join(', ') : room.amenities}
                      </div>
                      <button
                        className="edit-button"
                        onClick={() => handleEditRoom(room.id)}
                      >
                        Edit Room
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ManageRooms;