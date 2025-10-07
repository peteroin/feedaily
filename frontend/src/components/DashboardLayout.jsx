import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FiHome,
  FiBarChart2,
  FiUser,
  FiAward,
  FiTruck,
  FiLogOut,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import "./DashboardLayout.css";
import useTheme from "../hooks/useTheme";

export default function DashboardLayout({ children }) {
  const { theme, setTheme, themeClasses } = useTheme();
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

  // Only allow dark/light toggling on the dashboard and stats pages.
  const savedThemeRef = useRef(null);
  useEffect(() => {
    const path = location.pathname || "/";
    const isThemeable = path === "/dashboard" || path === "/stats" || path.startsWith("/dashboard/");

    if (!isThemeable) {
      // leaving a themeable page: save current theme and force light
      if (theme === "dark") {
        savedThemeRef.current = "dark";
      }
      if (theme !== "light") {
        setTheme("light");
      }
    } else {
      // entering a themeable page: restore saved theme if any
      if (savedThemeRef.current) {
        setTheme(savedThemeRef.current);
        savedThemeRef.current = null;
      }
    }
  }, [location.pathname]);

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
    <div className={`dashboard-container ${themeClasses.page}`}>
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
                >
                  <span className="nav-icon">{icon}</span>
                  <span className="nav-label">{label}</span>
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <button 
              className="logout-btn"
              onClick={handleLogout}
            >
              <FiLogOut />
            </button>
          {(location.pathname === "/dashboard" || location.pathname === "/stats") && (
          <button
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              className={`theme-toggle-btn px-2 py-2 rounded transition border ${themeClasses.border}`}
              aria-label="Toggle theme"
              style={{cursor:'pointer', background: "none", color: theme === "dark" ? "#fff" : "#222" }}
            >
              {theme === "light" ? <FiMoon className="text-lg" /> : <FiSun className="text-lg text-yellow-400" />}
            </button>
          )}
          </div>
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
