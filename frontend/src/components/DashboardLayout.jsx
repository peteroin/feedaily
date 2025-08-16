import React from "react";
import { Link } from "react-router-dom";

export default function DashboardLayout({ children }) {
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <aside
        style={{
          width: "200px",
          background: "#2f3542",
          color: "white",
          padding: "20px",
          boxSizing: "border-box",
        }}
      >
        <h2>🍽 Feedaily</h2>
        <nav style={{ display: "flex", flexDirection: "column" }}>
          <Link
            to="/dashboard"
            style={{ color: "white", marginBottom: "10px", textDecoration: "none" }}
          >
            🏠 Dashboard
          </Link>
          <Link
            to="/stats"
            style={{ color: "white", marginBottom: "10px", textDecoration: "none" }}
          >
            📊 Stats
          </Link>
          <Link
            to="/profile"
            style={{ color: "white", marginBottom: "10px", textDecoration: "none" }}
          >
            👤 My Profile
          </Link>
          <Link
            to="/sender-rankings"
            style={{ color: "white", marginBottom: "10px", textDecoration: "none" }}
          >
            📈 Sender Rankings
          </Link>
          <Link
            to="/delivery"
            style={{ color: "white", marginBottom: "10px", textDecoration: "none" }}
          >
            🚚 Delivery
          </Link>
        </nav>
      </aside>

      <main style={{ flex: 1, padding: "20px", overflowY: "auto" }}>{children}</main>
    </div>
  );
}
