import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Layout from "../components/Layout";
import "../css/RoomDetails.css";

function RoomDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState(null);
   // NEW: store beds
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(0);
  const [showAllAmenities, setShowAllAmenities] = useState(false);

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

  const handleBookNow = () => {
    navigate(`/book-room/${id}`);
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
            onClick={() => window.location.reload()} 
            className="retry-button"
          >
            Try Again
          </button>
        </div>
      </Layout>
    );
  }

  // Handle amenities - check if it's an array or convert from string
  let amenities = [];
  if (room.amenities) {
    if (Array.isArray(room.amenities)) {
      amenities = room.amenities;
    } else if (typeof room.amenities === 'string') {
      amenities = room.amenities.split(',');
    }
  }

  const displayedAmenities = showAllAmenities 
    ? amenities 
    : amenities.slice(0, 5);

  // Handle images - ensure we always have an array
  const images = room.imageUrl 
    ? (Array.isArray(room.imageUrl) ? room.imageUrl : [room.imageUrl])
    : ["/default-room.jpg"];

  // ---- NEW: Compute bed count and bed types ----

  return (
    <Layout>
      <div className="room-details-page">
        <div className="room-gallery">
          <div className="main-image-container">
            <img 
              src={images[selectedImage]} 
              alt={room.name} 
              className="main-image"
              onError={(e) => {
                e.target.src = "/default-room.jpg";
              }}
            />
          </div>
          {images.length > 1 && (
            <div className="thumbnail-container">
              {images.map((img, index) => (
                <div 
                  key={index}
                  className={`thumbnail ${index === selectedImage ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img 
                    src={img} 
                    alt={`Thumbnail ${index + 1}`} 
                    onError={(e) => {
                      e.target.src = "/default-room.jpg";
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="room-content">
          <div className="room-header">
            <h1>{room.name}</h1>
            <div className="room-meta">
              <span className="room-type">{room.roomType}</span>
              <span className="room-availability">
                {room.isAvailable ? (
                  <span className="available">Available</span>
                ) : (
                  <span className="unavailable">Booked</span>
                )}
              </span>
            </div>
          </div>


          <div className="room-description">
            <h3>Description</h3>
            <p>{room.description || 'No description available.'}</p>
          </div>

          <div className="room-amenities">
            <h3>Amenities</h3>
            {amenities.length > 0 ? (
              <>
                <div className="amenities-grid">
                  {displayedAmenities.map((amenity, index) => (
                    <div key={index} className="amenity-item">
                      <span className="amenity-icon">✓</span>
                      <span>{typeof amenity === 'string' ? amenity.trim() : amenity}</span>
                    </div>
                  ))}
                </div>
                {amenities.length > 5 && (
                  <button 
                    className="show-more-btn"
                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                  >
                    {showAllAmenities ? 'Show Less' : `Show All (${amenities.length})`}
                  </button>
                )}
              </>
            ) : (
              <p>No amenities listed.</p>
            )}
          </div>

          <div className="room-pricing">
            <div className="price-container">
              <span className="price-amount">${room.pricePerNight || 'N/A'}</span>
              <span className="price-label">per night</span>
            </div>
            <button 
              className="book-now-button"
              onClick={handleBookNow}
              disabled={!room.isAvailable}
            >
              {room.isAvailable ? 'Book Now' : 'Not Available'}
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default RoomDetails;