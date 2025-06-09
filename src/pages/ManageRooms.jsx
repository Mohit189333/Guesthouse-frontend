import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import "../css/ManageRooms.css";
import { ToastContainer, toast } from 'react-toastify';
import { roomSchema } from '../validation/roomSchema'; // <-- import schema

function ManageRooms() {
  const [rooms, setRooms] = useState([]);
  const [guestHouses, setGuestHouses] = useState([]);
  const [selectedGuestHouse, setSelectedGuestHouse] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [newRoom, setNewRoom] = useState({
    name: "",
    description: "",
    pricePerNight: "",
    amenities: "",
    roomType: "",
    isAvailable: true,
    guestHouseId: "",
    bedCount: 1
  });
  const [imageFile, setImageFile] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const navigate = useNavigate();

  // Load Guest Houses on mount
  useEffect(() => {
    fetchGuestHouses();
  }, []);

  // Fetch rooms when selectedGuestHouse changes
  useEffect(() => {
    if (selectedGuestHouse) {
      fetchRooms(selectedGuestHouse);
      setNewRoom(prev => ({ ...prev, guestHouseId: selectedGuestHouse }));
    } else {
      setRooms([]);
      setLoading(false);
    }
  }, [selectedGuestHouse]);

  const fetchGuestHouses = async () => {
    setLoading(true);
    try {
      const res = await axios.get("http://localhost:5050/api/guest-houses");
      setGuestHouses(res.data);
      if (res.data.length > 0) {
        const firstGuestHouseId = res.data[0].id.toString();
        setSelectedGuestHouse(firstGuestHouseId);
        setNewRoom(prev => ({ ...prev, guestHouseId: firstGuestHouseId }));
      }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Error loading guest houses.", "error");
    }
  };

  const fetchRooms = async (guestHouseId) => {
    setLoading(true);
    try {
      const response = await axios.get(`http://localhost:5050/api/guest-houses/${guestHouseId}/rooms`);
      setRooms(response.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast.error("Error fetching rooms. Please try again.", "error");
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
    const { name, value, type } = e.target;
    setNewRoom((prevRoom) => ({
      ...prevRoom,
      [name]: type === "number" ? Number(value) : value,
    }));
    // Clear error for this field
    setFormErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const handleGuestHouseChange = (e) => {
    const selectedId = e.target.value;
    setSelectedGuestHouse(selectedId);
    setNewRoom(prev => ({ ...prev, guestHouseId: selectedId }));
    setFormErrors(prev => ({ ...prev, guestHouseId: undefined }));
  };

  // Validate room form fields using zod
  const validateRoomForm = () => {
    // Convert price and bedCount to numbers for validation
    const validationRoom = {
      ...newRoom,
      pricePerNight: Number(newRoom.pricePerNight),
      bedCount: Number(newRoom.bedCount),
      isAvailable: newRoom.isAvailable === true || newRoom.isAvailable === "true"
    };
    const result = roomSchema.safeParse(validationRoom);
    if (!result.success) {
      const errors = {};
      result.error.errors.forEach(err => {
        errors[err.path[0]] = err.message;
      });
      setFormErrors(errors);
      return false;
    }
    setFormErrors({});
    return true;
  };

  const handleAddRoom = async (e) => {
    e.preventDefault();
    // Validate form with zod
    if (!validateRoomForm()) {
      toast.error("Please fix validation errors in the form.", "error");
      return;
    }

    if (!newRoom.guestHouseId) {
      toast.error("Please select a guest house for this room.", "error");
      return;
    }

    try {
      const token = localStorage.getItem("jwtToken");

      const formData = new FormData();
      formData.append("name", newRoom.name);
      formData.append("description", newRoom.description);
      formData.append("pricePerNight", parseFloat(newRoom.pricePerNight));
      formData.append("isAvailable", newRoom.isAvailable);
      formData.append("amenities", newRoom.amenities);
      formData.append("roomType", newRoom.roomType.toUpperCase());
      formData.append("guestHouseId", newRoom.guestHouseId);
      formData.append("bedCount", newRoom.bedCount);

      if (imageFile) {
        formData.append("file", imageFile);
      }

      await axios.post("http://localhost:5050/api/rooms/add", formData, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });

      toast.success("Room added successfully!", "success");
      resetForm();
      fetchRooms(selectedGuestHouse);
    } catch (error) {
      console.error("Full error details:", error);
      console.error("Error response:", error.response?.data);
      toast.error(
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
      isAvailable: true,
      guestHouseId: selectedGuestHouse || "",
      bedCount: 1
    });
    setImageFile(null);
    setIsFormOpen(false);
    setFormErrors({});
  };

  return (
    <Layout>
      <div className="manage-rooms-page">
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
              <div className="guesthouse-dropdown">
                <label htmlFor="guesthouse-select">Guest House Location:</label>
                <select
                  id="guesthouse-select"
                  value={selectedGuestHouse}
                  onChange={handleGuestHouseChange}
                  disabled={guestHouses.length === 0}
                >
                  {guestHouses.length === 0 && (
                    <option value="">No guest houses found</option>
                  )}
                  {guestHouses.map((gh) => (
                    <option key={gh.id} value={gh.id}>
                      {gh.location}
                    </option>
                  ))}
                </select>
              </div>
              <button
                className="add-room-toggle"
                onClick={() => setIsFormOpen(!isFormOpen)}
                disabled={guestHouses.length === 0}
              >
                {isFormOpen ? 'Cancel' : '+ Add New Room'}
              </button>
            </div>

            {isFormOpen && (
              <div className="add-room-section">
                <form className="add-room-form" onSubmit={handleAddRoom}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Guest House</label>
                      <select
                        name="guestHouseId"
                        value={newRoom.guestHouseId}
                        onChange={handleInputChange}
                        required
                        className={formErrors.guestHouseId ? "error" : ""}
                      >
                        <option value="">Select Guest House</option>
                        {guestHouses.map((gh) => (
                          <option key={gh.id} value={gh.id}>
                            {gh.location} – {gh.name}
                          </option>
                        ))}
                      </select>
                      {formErrors.guestHouseId && (
                        <p className="error-message">{formErrors.guestHouseId}</p>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Room Name</label>
                      <input
                        type="text"
                        name="name"
                        value={newRoom.name}
                        onChange={handleInputChange}
                        required
                        placeholder="Deluxe Suite"
                        className={formErrors.name ? "error" : ""}
                      />
                      {formErrors.name && (
                        <p className="error-message">{formErrors.name}</p>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Room Type</label>
                      <select
                        name="roomType"
                        value={newRoom.roomType}
                        onChange={handleInputChange}
                        required
                        className={formErrors.roomType ? "error" : ""}
                      >
                        <option value="">Select Type</option>
                        <option value="Standard">Standard</option>
                        <option value="Family">Family</option>
                        <option value="Suite">Suite</option>
                        <option value="Deluxe">Deluxe</option>
                      </select>
                      {formErrors.roomType && (
                        <p className="error-message">{formErrors.roomType}</p>
                      )}
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
                        className={formErrors.pricePerNight ? "error" : ""}
                      />
                      {formErrors.pricePerNight && (
                        <p className="error-message">{formErrors.pricePerNight}</p>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Bed Count</label>
                      <input
                        type="number"
                        name="bedCount"
                        value={newRoom.bedCount}
                        onChange={handleInputChange}
                        required
                        min="1"
                        max="10"
                        className={formErrors.bedCount ? "error" : ""}
                      />
                      {formErrors.bedCount && (
                        <p className="error-message">{formErrors.bedCount}</p>
                      )}
                    </div>
                    <div className="form-group">
                      <label>Available</label>
                      <select
                        name="isAvailable"
                        value={String(newRoom.isAvailable)}
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
                        className={formErrors.description ? "error" : ""}
                      />
                      {formErrors.description && (
                        <p className="error-message">{formErrors.description}</p>
                      )}
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
                        className={formErrors.amenities ? "error" : ""}
                      />
                      {formErrors.amenities && (
                        <p className="error-message">{formErrors.amenities}</p>
                      )}
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
                <p>No rooms found for this guest house. Add your first room!</p>
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
                      <span>Beds: {room.bedCount}</span>

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