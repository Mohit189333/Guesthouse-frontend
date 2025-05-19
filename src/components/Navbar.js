import React, { useState } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import "../css/Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const [mobileMenuActive, setMobileMenuActive] = useState(false);
  const token = localStorage.getItem("jwtToken");
  const payload = token ? JSON.parse(atob(token.split(".")[1])) : null;
  const role = payload?.roles ? payload.roles[0] : null;

  const handleLogout = () => {
    localStorage.removeItem("jwtToken");
    navigate("/login");
  };

  const toggleMobileMenu = () => {
    setMobileMenuActive(!mobileMenuActive);
  };

  return (
    <nav className="navbar">
      <NavLink to="/dashboard" className="navbar-brand">
        {role === "ADMIN" ? "Admin Dashboard" : "Guest House"}
      </NavLink>
      
      <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
        ☰
      </button>
      
      <ul className={`navbar-links ${mobileMenuActive ? "active" : ""}`}>
        {role === "ADMIN" ? (
          <>
            <li>
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => isActive ? "active" : ""}
                end
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/manage-rooms" 
                className={({ isActive }) => isActive ? "active" : ""}
              >
                Manage Rooms
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/manage-beds" 
                className={({ isActive }) => isActive ? "active" : ""}
              >
                Manage Beds
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/manage-bookings" 
                className={({ isActive }) => isActive ? "active" : ""}
              >
                Manage Bookings
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/admin-profile" 
                className={({ isActive }) => isActive ? "active" : ""}
              >
                Admin Profile
              </NavLink>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink 
                to="/dashboard" 
                className={({ isActive }) => isActive ? "active" : ""}
                end
              >
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/all-rooms" 
                className={({ isActive }) => isActive ? "active" : ""}
              >
                Available Rooms
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/my-bookings" 
                className={({ isActive }) => isActive ? "active" : ""}
              >
                My Bookings
              </NavLink>
            </li>
            <li>
              <NavLink 
                to="/user-profile" 
                className={({ isActive }) => isActive ? "active" : ""}
              >
                My Profile
              </NavLink>
            </li>
          </>
        )}
        <li>
          <a onClick={handleLogout}>Logout</a>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar;