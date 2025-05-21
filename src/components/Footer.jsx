import React from "react";
import "../css/Footer.css"; // Footer-specific styles

function Footer() {
  // Read token and determine user role (like in your Navbar)
  const token = localStorage.getItem("jwtToken");
  const payload = token ? JSON.parse(atob(token.split(".")[1])) : null;
  const role = payload?.roles ? payload.roles[0] : null;

  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>About Us</h3>
          <p>
            Welcome to our guest house management system. Manage bookings, rooms, and profiles with ease.
          </p>
        </div>
        <div className="footer-section">
          <h3>Quick Links</h3>
          <ul>
            {role === "ADMIN" ? (
              <>
                <li><a href="/dashboard">Dashboard</a></li>
                <li><a href="/manage-rooms">Manage Rooms</a></li>
                <li><a href="/manage-beds">Manage Beds</a></li>
                <li><a href="/manage-bookings">Manage Bookings</a></li>
                <li><a href="/admin-profile">Admin Profile</a></li>
              </>
            ) : (
              <>
                <li><a href="/dashboard">Home</a></li>
                <li><a href="/all-rooms">All Rooms</a></li>
                <li><a href="/book-room">Book a Room</a></li>
                <li><a href="/user-profile">User Profile</a></li>
              </>
            )}
          </ul>
        </div>
        <div className="footer-section">
          <h3>Contact Us</h3>
          <p>Email: mohitbajaj189@gmail.com</p>
          <p>Phone: +91 8320651753</p>
          <p>Address: Vadodara, Gujarat, India</p>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; {new Date().getFullYear()} Guest House Management. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;