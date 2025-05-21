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
  const [message, setMessage] = useState({ text: "", type: "" });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const token = localStorage.getItem("jwtToken");

  useEffect(() => {
    fetchRoomDetails();
  }, []);

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
    formData.append("amenities", room.amenities); // comma separated string
    formData.append("roomType", room.roomType.toUpperCase()); // match backend enum

    if (imageFile) {
      formData.append("file", imageFile);
    }

    await axios.put(`http://localhost:5050/api/rooms/update/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    toast.success("Room updated successfully!", "success");
    setTimeout(() => navigate("/manage-rooms"), 2000);
  } catch (error) {
    toast.error("Failed to update room. Please try again.", "error");
  }
};

  const handleDeleteRoom = async () => {
    if (window.confirm("Are you sure you want to delete this room?")) {
      try {
        await axios.delete(`http://localhost:5050/api/rooms/delete/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        toast.success("Room deleted successfully!", "success");
        setTimeout(() => navigate("/manage-rooms"), 2000);
      } catch (error) {
        toast.error("Failed to delete room. Please try again.", "error");
      }
    }
  };

  if (loading) {
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

              <div className="form-group">
                <label>Room Type</label>
                <select
                  name="roomType"
                  value={room.roomType || ""}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Type</option>
                  <option value="Standard">Standard</option>
                  <option value="Family">Family</option>
                  <option value="Suite">Suite</option>
                  <option value="Deluxe">Deluxe</option>
                </select>
              </div>

              <div className="form-group">
                <label>Price Per Night ($)</label>
                <input
                  type="number"
                  name="pricePerNight"
                  value={room.pricePerNight || ""}
                  onChange={handleInputChange}
                  required
                  min="0"
                />
              </div>

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

              <div className="form-group full-width">
                <label>Amenities (comma separated)</label>
                <textarea
                  name="amenities"
                  value={room.amenities || ""}
                  onChange={handleInputChange}
                  required
                  rows="3"
                  placeholder="WiFi, TV, Air Conditioning, etc."
                />
              </div>

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