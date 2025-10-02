import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  FiHome, 
  FiBarChart2, 
  FiUser, 
  FiAward, 
  FiTruck,
  FiMenu,
  FiX,
  FiLogOut
} from "react-icons/fi";
import "./DashboardLayout.css";

export default function DashboardLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate(); // Add useNavigate hook

  const menuItems = [
    { path: "/dashboard", label: "Dashboard", icon: <FiHome /> },
    { path: "/stats", label: "Stats", icon: <FiBarChart2 /> },
    { path: "/profile", label: "My Profile", icon: <FiUser /> },
    { path: "/sender-rankings", label: "Sender Rankings", icon: <FiAward /> },
    { path: "/delivery", label: "Delivery", icon: <FiTruck /> },
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  // Add logout handler function
  const handleLogout = () => {
    // Clear the user data from localStorage
    localStorage.removeItem("user");
    // Navigate to login page
    navigate("/login");
  };

  return (
    <div className="dashboard-layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="menu-toggle" onClick={toggleMobileMenu}>
          {isMobileMenuOpen ? <FiX /> : <FiMenu />}
        </button>
        <h2 className="logo">🍽 Feedaily</h2>
        <div className="placeholder"></div>
      </div>

      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <h2 className="logo">🍽 Feedaily</h2>
          <p className="tagline">Zero Waste Starts Here</p>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? "active" : ""}`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          {/* Add onClick handler to the logout button */}
          <button className="logout-btn" onClick={handleLogout}>
            <FiLogOut />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile when menu is open */}
      {isMobileMenuOpen && (
        <div className="sidebar-overlay" onClick={toggleMobileMenu}></div>
      )}

      {/* Main Content */}
      <main className="main-content">
        <div className="content-container">{children}</div>
      </main>
    </div>
  );
}
