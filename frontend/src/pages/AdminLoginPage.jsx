import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import "./AdminLoginPage.css";
import HomeButton from "../components/HomeButton.jsx";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/admin-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (data.message === "Admin login successful") {
        localStorage.setItem("adminUser", JSON.stringify(data.user)); 
        localStorage.removeItem("user"); 
        navigate("/admin/delivery-requests");
      } else {
        setError(data.message || "Admin login failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
      <div className="auth-container">
        <HomeButton/>
        <img src="/img/authBackground.png" alt="" className="auth-illustration"/>
        <div className="auth-background">
          <div className="auth-pattern"></div>
          <div className="auth-overlay"></div>
        </div>

        <div className="auth-content">
          <div className="auth-card">
            <div className="auth-header">
              <div className="auth-logo">
                <FiLock size={24}/>
                <h1>Feedaily Admin</h1>
              </div>
              <h2>Admin Login</h2>
              <p>Access admin dashboard for delivery management</p>
            </div>

            <form onSubmit={handleAdminLogin} className="auth-form">
              {error && <div className="auth-error">{error}</div>}

              <div className="input-group">
                <FiMail className="input-icon"/>
                <input
                    type="email"
                    placeholder="Admin Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="auth-input"
                />
              </div>

              <div className="input-group">
                <FiLock className="input-icon"/>
                <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="auth-input"
                />
                <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FiEyeOff/> : <FiEye/>}
                </button>
              </div>

              <button
                  type="submit"
                  className="auth-button"
                  disabled={isLoading}
              >
                {isLoading ? (
                    <div className="spinner"></div>
                ) : (
                    <>
                      Admin Sign In
                      <FiArrowRight/>
                    </>
                )}
              </button>

              <div className="auth-footer">
                <p>
                  Back to regular login?{" "}
                  <Link to="/login" className="auth-link">
                    User Login
                  </Link>
                </p>
              </div>
            </form>
          </div>


        </div>
      </div>
  );
}