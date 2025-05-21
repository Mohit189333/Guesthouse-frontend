import React from "react";
import { Navigate } from "react-router-dom";
import { isLoggedIn, getUserRole } from "./AuthService";

const PrivateRoute = ({ children, allowedRoles }) => {
  if (!isLoggedIn()) return <Navigate to="/login" />;
  const userRoles = getUserRole();
  if (!allowedRoles.some((role) => userRoles.includes(role))) {
    return <Navigate to="/" />;
  }
  return children;
};

export default PrivateRoute;