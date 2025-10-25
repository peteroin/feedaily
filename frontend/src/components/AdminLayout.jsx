import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiTruck,
  FiBell,
  FiAlertCircle,
  FiUsers,
  FiLogOut,
  FiShield,
} from "react-icons/fi";
import "./AdminLayout.css";

export default function AdminLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const adminNavItems = [
    { path: "/admin/delivery-requests", label: "Delivery Requests", icon: <FiTruck /> },
    { path: "/admin/collaboration-requests", label: "Collaboration Requests", icon: <FiUsers /> },
    { path: "/admin/event-notifications", label: "Event Notifications", icon: <FiBell /> },
    { path: "/admin/complaints", label: "Complaints", icon: <FiAlertCircle /> },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    const mainElement = document.querySelector('.admin-main-content');
    if (mainElement) {
      mainElement.style.opacity = '0';
      mainElement.style.transform = 'scale(0.98)';
    }
    
    setTimeout(() => {
      navigate("/admin-login");
    }, 200);
  };

  return (
    <div className="admin-container">
      <header className={`admin-header ${scrolled ? 'header-scrolled' : ''}`}>
        <div className="admin-header-content">
          <div className="admin-logo">
            <FiShield size={24} />
            <span>Feedaily Admin</span>
          </div>
          
          <nav className="admin-nav">
            {adminNavItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`admin-nav-link ${
                  location.pathname === item.path ? 'admin-nav-link-active' : ''
                }`}
              >
                <span className="admin-nav-icon">{item.icon}</span>
                <span className="admin-nav-label">{item.label}</span>
              </Link>
            ))}
          </nav>

          <button onClick={handleLogout} className="admin-logout-btn">
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="admin-main-content">
        <div className="admin-content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
}
