import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import "../css/UpdateRoom.css";
import { ToastContainer, toast } from 'react-toastify';

function UpdateRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [guestHouses, setGuestHouses] = useState([]);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const token = localStorage.getItem("jwtToken");

  useEffect(() => {
    fetchGuestHouses();
    fetchRoomDetails();
    // eslint-disable-next-line
  }, []);

  const fetchGuestHouses = async () => {
    try {
      const response = await axios.get("http://localhost:5050/api/guest-houses", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setGuestHouses(response.data);
    } catch (error) {
      toast.error("Failed to load guest houses");
    }
  };

  const fetchRoomDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:5050/api/rooms/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRoom(response.data);
      if (response.data.imageUrl) {
        setImagePreview(response.data.imageUrl);
      }
      setLoading(false);
    } catch (error) {
      showMessage("Failed to load room details", "error");
      setLoading(false);
    }
  };

  const showMessage = (text, type) => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setRoom((prevRoom) => ({
      ...prevRoom,
      [name]: value,
    }));
  };

  const handleGuestHouseChange = (e) => {
    setRoom((prevRoom) => ({
      ...prevRoom,
      guestHouseId: e.target.value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", room.name);
      formData.append("description", room.description);
      formData.append("pricePerNight", parseFloat(room.pricePerNight));
      formData.append("isAvailable", room.isAvailable);
      formData.append("amenities", room.amenities);
      formData.append("roomType", room.roomType.toUpperCase());
      formData.append("bedCount", room.bedCount);

      // Include guest house ID (for moving the room to a different guest house)
      if (room.guestHouseId) {
        formData.append("guestHouseId", room.guestHouseId);
      }

      if (imageFile) {
        formData.append("file", imageFile);
      }

      await axios.put(`http://localhost:5050/api/rooms/update/${id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Room updated successfully!");
      setTimeout(() => navigate("/manage-rooms"), 2000);
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update room. Please try again.");
    }
  };

  const handleDeleteRoom = async () => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        await axios.delete(`http://localhost:5050/api/rooms/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Room deleted successfully!");
        setTimeout(() => navigate("/manage-rooms"), 2000);
      } catch (error) {
        toast.error("Failed to delete room. Please try again.");
      }
    }
  };

  if (loading || !room) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading room details...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="update-room-page">
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
          <h1>Update Room</h1>
          <p>Edit the details of this room</p>
        </div>

        {message.text && (
          <div className={`message ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="form-container">
          <form onSubmit={handleUpdateRoom}>
            <div className="form-grid">
              {/* Guest House selection */}
              <div className="form-group">
                <label>Guest House</label>
                <select
                  name="guestHouseId"
                  value={room.guestHouseId || ""}
                  onChange={handleGuestHouseChange}
                  required
                >
                  <option value="">Select Guest House</option>
                  {guestHouses.map((gh) => (
                    <option key={gh.id} value={gh.id}>
                      {gh.location} – {gh.name}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Room Name */}
              <div className="form-group">
                <label>Room Name</label>
                <input
                  type="text"
                  name="name"
                  value={room.name || ""}
                  onChange={handleInputChange}
                  required
                  placeholder="Deluxe Suite"
                />
              </div>
              
              {/* Room Type */}
              <div className="form-group">
                <label>Room Type</label>
                <select
                  name="roomType"
                  value={room.roomType || ""}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="STANDARD">Standard</option>
                  <option value="FAMILY">Family</option>
                  <option value="SUITE">Suite</option>
                  <option value="DELUXE">Deluxe</option>
                </select>
              </div>
              
              {/* Price Per Night */}
              <div className="form-group">
                <label>Price Per Night ($)</label>
                <input
                  type="number"
                  name="pricePerNight"
                  value={room.pricePerNight || ""}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                />
              </div>
              
              {/* Bed Count */}
              <div className="form-group">
                <label>Bed Count</label>
                <input
                  type="number"
                  name="bedCount"
                  value={room.bedCount || 1}
                  onChange={handleInputChange}
                  required
                  min="1"
                  max="10"
                />
              </div>
              
              {/* Available */}
              <div className="form-group">
                <label>Available</label>
                <select
                  name="isAvailable"
                  value={room.isAvailable}
                  onChange={(e) =>
                    setRoom((prevRoom) => ({
                      ...prevRoom,
                      isAvailable: e.target.value === "true",
                    }))
                  }
                >
                  <option value="true">Yes</option>
                  <option value="false">No</option>
                </select>
              </div>
              
              {/* Description */}
              <div className="form-group full-width">
                <label>Description</label>
                <textarea
                  name="description"
                  value={room.description || ""}
                  onChange={handleInputChange}
                  required
                  rows="4"
                />
              </div>
              
              {/* Amenities */}
              <div className="form-group full-width">
                <label>Amenities (comma separated)</label>
                <textarea
                  name="amenities"
                  value={Array.isArray(room.amenities) ? room.amenities.join(', ') : room.amenities || ""}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder="WiFi, TV, Air Conditioning, etc."
                />
              </div>
              
              {/* Room Image */}
              <div className="form-group full-width">
                <label>Room Image</label>
                <div className="image-upload-container">
                  {imagePreview && (
                    <div className="image-preview">
                      <img src={imagePreview} alt="Room preview" />
                    </div>
                  )}
                  <input
                    type="file"
                    id="image-upload"
                    onChange={handleImageChange}
                    accept="image/*"
                    className="image-upload-input"
                  />
                  <label htmlFor="image-upload" className="image-upload-label">
                    {imagePreview ? "Change Image" : "Upload Image"}
                  </label>
                </div>
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="update-button">
                Update Room
              </button>
              <button
                type="button"
                className="delete-button"
                onClick={handleDeleteRoom}
              >
                Delete Room
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default UpdateRoom;