import React from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
import "../css/Layout.css";

function Layout({ children }) {
  return (
    <div className="layout-container">
      <Navbar />
      <main className="layout-content">{children}</main>
      <Footer />
    </div>
  );
}

export default Layout;