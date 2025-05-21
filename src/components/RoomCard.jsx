// components/RoomCard.js
import React from "react";
import { FiStar } from "react-icons/fi";

const RoomCard = ({ room, checkInDate, checkOutDate }) => {
  return (
    <div className="room-card">
      <div className="room-image-container">
        <img 
          src={room.imageUrl} 
          alt={room.name}
          className="room-image"
        />
      </div>
      <div className="room-details">
        <h3 className="room-name">{room.name}</h3>
        <p className="room-description">{room.description}</p>
        <div className="room-amenities">
          {room.amenities.map((amenity, index) => (
            <span key={index} className="amenity-tag">{amenity}</span>
          ))}
        </div>
        <div className="room-footer">
          <div className="room-price">
            ${room.pricePerNight} <span className="price-label">/ night</span>
          </div>
          <button 
            className="book-button"
            onClick={() => {
              // Navigate to booking page with room and dates
              // You'll need to implement this navigation
            }}
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomCard;