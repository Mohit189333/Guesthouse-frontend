import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import "../css/BookRoom.css";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Loader from "../components/Loader";
function BookRoom() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedBeds, setSelectedBeds] = useState(1);
  const [formData, setFormData] = useState({
    checkInDate: null,
    checkOutDate: null,
    specialRequests: ""
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchRoomDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:5050/api/rooms/${id}`);
        setRoom(response.data);
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch room details. Please try again later.");
        setLoading(false);
      }
    };

    fetchRoomDetails();
  }, [id]);

  const handleDateChange = (date, field) => {
    setFormData({
      ...formData,
      [field]: date
    });

    // Clear validation errors when user selects a date
    if (validationErrors[field]) {
      setValidationErrors({
        ...validationErrors,
        [field]: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.checkInDate) {
      errors.checkInDate = "Check-in date is required";
    }
    
    if (!formData.checkOutDate) {
      errors.checkOutDate = "Check-out date is required";
    } else if (formData.checkInDate && formData.checkOutDate <= formData.checkInDate) {
      errors.checkOutDate = "Check-out date must be after check-in date";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  
  if (!validateForm()) return;

  setIsSubmitting(true);

  try {
    // Get token from local storage
    const token = localStorage.getItem("jwtToken");
    
    // If no token exists, throw an error
    if (!token) {
      throw new Error("No authentication token found. Please log in.");
    }

    const bookingData = {
      roomId: room.id,
      // userName:user.username,
      roomName: room.name,
      checkInDate: formData.checkInDate.toLocaleDateString('en-CA'), // yyyy-mm-dd format
      checkOutDate: formData.checkOutDate.toLocaleDateString('en-CA'),
      specialRequests: formData.specialRequests,
      bedCount: selectedBeds 
    };

    const response = await axios.post(
      "http://localhost:5050/api/bookings",
      bookingData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      }
    );

    navigate("/booking-confirmation", { 
      state: { 
        booking: response.data, 
        room: room 
      } 
    });
  } catch (err) {
  console.error("Booking error:", err);

  if (err.message.includes("No authentication token")) {
    navigate("/login", { 
      state: { 
        from: `/book-room/${id}`,
        message: "Please log in to book a room" 
      } 
    });
  } else {
    setError(
      typeof err.response?.data === "string"
        ? err.response.data
        : err.response?.data?.message || "Failed to create booking. Please try again."
    );
  }
} finally {
  setIsSubmitting(false);
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

  if (error) {
    return (
      <Layout>
        <div className="error-container">
          <div className="error-icon">!</div>
          <h3>Error Loading Room</h3>
          <p>{error}</p>
          <button 
  onClick={() => navigate(`/room-details/${id}`)} 
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
      <div className="book-room-container">
        <div className="book-room-header">
          <h1>Book {room.name}</h1>
          <p className="room-type">{room.roomType}</p>
        </div>

        <div className="book-room-content">
          <div className="room-summary">
            <div className="room-image">
              <img 
                src={room.imageUrl || "/default-room.jpg"} 
                alt={room.name}
                onError={(e) => {
                  e.target.src = "/default-room.jpg";
                }}
              />
            </div>
            <div className="room-details">
              <h3>Room Details</h3>
              <p className="price">${room.pricePerNight} <span>per night</span></p>
              <div className="amenities-preview">
                {room.amenities?.slice(0, 3).map((amenity, index) => (
                  <span key={index} className="amenity-tag">
                    {amenity}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="booking-form">
            <div className="form-group">
              <label htmlFor="checkInDate">Check-in Date</label>
              <DatePicker
                id="checkInDate"
                selected={formData.checkInDate}
                onChange={(date) => handleDateChange(date, "checkInDate")}
                minDate={new Date()}
                className={validationErrors.checkInDate ? "error" : ""}
                placeholderText="Select check-in date"
              />
              {validationErrors.checkInDate && (
                <p className="error-message">{validationErrors.checkInDate}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="checkOutDate">Check-out Date</label>
              <DatePicker
                id="checkOutDate"
                selected={formData.checkOutDate}
                onChange={(date) => handleDateChange(date, "checkOutDate")}
                minDate={formData.checkInDate || new Date()}
                className={validationErrors.checkOutDate ? "error" : ""}
                placeholderText="Select check-out date"
              />
              {validationErrors.checkOutDate && (
                <p className="error-message">{validationErrors.checkOutDate}</p>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="bedCount">Number of Beds</label>
              <select
                id="bedCount"
                value={selectedBeds}
                onChange={(e) => setSelectedBeds(Number(e.target.value))}
                required
              >
                {room && Array.from({ length: room.bedCount }, (_, i) => i + 1).map((count) => (
                  <option key={count} value={count}>
                    {count}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="specialRequests">Special Requests (Optional)</label>
              <textarea
                id="specialRequests"
                value={formData.specialRequests}
                onChange={(e) => 
                  setFormData({...formData, specialRequests: e.target.value})
                }
                placeholder="Any special requirements?"
                rows="4"
              />
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="cancel-button"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="submit-button"
                disabled={isSubmitting}
              >
                {isSubmitting ? <Loader /> : "Confirm Booking"}
              </button>
            </div>

            {error && <p className="form-error">{error}</p>}
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default BookRoom;