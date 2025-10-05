import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiBarChart2,
  FiUser,
  FiAward,
  FiTruck,
  FiLogOut,
} from "react-icons/fi";
import "./DashboardLayout.css";

export default function DashboardLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: <FiHome /> },
    { path: "/stats", label: "Stats", icon: <FiBarChart2 /> },
    { path: "/profile", label: "Profile", icon: <FiUser /> },
    { path: "/sender-rankings", label: "Rankings", icon: <FiAward /> },
    { path: "/delivery", label: "Delivery", icon: <FiTruck /> },
  ];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    const mainElement = document.querySelector('.main-content');
    if (mainElement) {
      mainElement.style.opacity = '0';
      mainElement.style.transform = 'scale(0.98)';
    }
    
    setTimeout(() => {
      navigate("/login");
    }, 200);
  };

  return (
    <div className="dashboard-container">
      <header className={`dashboard-header${scrolled ? " header-scrolled" : ""}`}>
        <div className="header-content">
          <Link to="/" className="logo">
            Feedaily
          </Link>
          
          <nav className="nav">
            {navItems.map(({ path, label, icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`nav-link${isActive ? " nav-link-active" : ""}`}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#000';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#666';
                    }
                  }}
                >
                  <span className="nav-icon">{icon}</span>
                  <span className="nav-label">{label}</span>
                </Link>
              );
            })}
          </nav>
          
          <button 
            className="logout-btn"
            onClick={handleLogout}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#000';
              e.currentTarget.style.transform = 'translateX(2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#666';
              e.currentTarget.style.transform = 'translateX(0)';
            }}
          >
            <FiLogOut />
          </button>
        </div>
      </header>

      <main className="main-content">
        <div className="content-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
}
