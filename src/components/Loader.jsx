import React from "react";
import "../css/Loader.css";

const Loader = () => (
  <div className="fullscreen-loader-overlay">
    <div className="fullscreen-loader-spinner"></div>
    <p>Processing your booking...</p>
  </div>
);

export default Loader;