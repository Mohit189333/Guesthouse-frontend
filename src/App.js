import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard"; // Unified Dashboard component
import AllRooms from "./pages/AllRooms";
import ManageRooms from "./pages/ManageRooms";
import UpdateRoom from "./pages/UpdateRoom";
import RoomDetails from "./pages/RoomDetails";
import AdminProfile from "./pages/AdminProfile";
import UserProfile from "./pages/UserProfile";
// import ManageBeds from "./pages/ManageBeds";
import BookRoom from "./pages/BookRoom";
import BookingConfirmation from "./pages/BookingConfirmation";
import MyBookings from "./pages/MyBookings";
import ManageBookings from "./pages/ManageBookings";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

function App() {
  const PrivateRoute = ({ children }) => {
    const token = localStorage.getItem("jwtToken");
    if (!token) {
      return <Navigate to="/login" />;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1])); // Decode JWT payload
      const roles = payload.roles;

      // Allow access if the user has either ADMIN or USER roles
      if (roles.includes("ADMIN") || roles.includes("USER")) {
        return children;
      } else {
        return <Navigate to="/login" />;
      }
    } catch (error) {
      console.error("Invalid token");
      localStorage.removeItem("jwtToken");
      return <Navigate to="/login" />;
    }
  };

  return (
    <Router>
      <Routes>
        <Route path="/Register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        
        <Route
          path="/"
          element={
            
<PrivateRoute>
              <Dashboard />
              </PrivateRoute>
          }
        />
        <Route 
          path="/dashboard" 
          element={
            <PrivateRoute>
            
                <Dashboard />
            
            </PrivateRoute>
          } 
        />
        <Route path="/all-rooms" element={<AllRooms />} />
        <Route path="/manage-rooms" element={<ManageRooms />} />
        <Route path="/update-room/:id" element={<UpdateRoom />} />
        <Route path="/room-details/:id" element={<RoomDetails />} />
         <Route path="/admin-profile" element={<AdminProfile />} />
        <Route path="/user-profile" element={<UserProfile />} />
        {/* <Route path="/manage-beds" element={<ManageBeds />} /> */}

        <Route 
          path="/book-room/:id" 
          element={
            <PrivateRoute>
              <BookRoom />
            </PrivateRoute>
          } 
        />        
        <Route path="/booking-confirmation" element={<BookingConfirmation />} />
        <Route path="/my-bookings" element={<MyBookings />} />

        <Route path="/forgot-password" element={<ForgotPassword />} />
    <Route path="/reset-password/:token" element={<ResetPassword />} />
    <Route path="/reset-password" element={<ResetPassword />} />

        // In your router configuration
        <Route 
          path="/manage-bookings" 
          element={
            <PrivateRoute allowedRoles={["ADMIN"]}>
              <ManageBookings />
            </PrivateRoute>
          } 
        />

      </Routes>
      
    </Router>
  );
}

export default App;