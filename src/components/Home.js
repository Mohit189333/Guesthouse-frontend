import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode"; // Correct the import
import "../css/Dashboard.css"; // Import shared styles

function Dashboard() {
  const navigate = useNavigate();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      navigate("/login"); // Redirect to login if no token
      return;
    }

    try {
      const decodedToken = jwtDecode(token); // Use jwtDecode here
      const userRole = decodedToken.roles ? decodedToken.roles[0] : null; // Assuming roles is an array
      setRole(userRole);
    } catch (error) {
      console.error("Invalid token");
      localStorage.removeItem("jwtToken");
      navigate("/login");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("jwtToken"); // Clear the session
    navigate("/login");
  };

  return (
    <div className="dashboard-container">
      <nav className="navbar">
        <h2 className="navbar-brand">{role === "ADMIN" ? "Admin Dashboard" : "User Dashboard"}</h2>
        <ul className="navbar-links">
          {role === "ADMIN" ? (
            <>
              <li onClick={() => navigate("/admin-dashboard")}>Home</li>
              <li onClick={() => navigate("/manage-rooms")}>Manage Rooms</li>
              <li onClick={() => navigate("/manage-bookings")}>Manage Bookings</li>
              <li onClick={() => navigate("/manage-beds")}>Manage Beds</li>
              <li onClick={() => navigate("/admin-profile")}>Admin Profile</li>
            </>
          ) : (
            <>
              <li onClick={() => navigate("/user-dashboard")}>Home</li>
              <li onClick={() => navigate("/all-rooms")}>All Rooms</li>
              <li onClick={() => navigate("/book-room")}>Book a Room</li>
              <li onClick={() => navigate("/user-profile")}>User Profile</li>
            </>
          )}
          <li onClick={handleLogout}>Logout</li>
        </ul>
      </nav>
      <div className="banner">
        <img
          src="/Banner1.jpeg"
          alt={`${role === "ADMIN" ? "Admin" : "User"} Dashboard Banner`}
          className="banner-image"
        />
        <div className="banner-overlay"></div>
        <div className="banner-text">
          <h2>Welcome to {role === "ADMIN" ? "Admin" : "User"} Dashboard</h2>
          <p>
            {role === "ADMIN"
              ? "Manage your guest house efficiently and effectively."
              : "Explore and manage your bookings easily."}
          </p>
        </div>
      </div>
      <div className="dashboard-content">
        <h2>Welcome to {role === "ADMIN" ? "Admin" : "User"} Dashboard</h2>
        <p>
          {role === "ADMIN"
            ? "Here you can manage rooms, bookings, and beds."
            : "Here you can explore all rooms, book a room, and manage your profile."}
        </p>
      </div>
    </div>
  );
}

export default Dashboard;