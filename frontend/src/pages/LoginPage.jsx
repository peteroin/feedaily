// LoginPage.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight } from "react-icons/fi";
import "./AuthPages.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (data.message === "Login successful") {
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background">
        <div className="auth-pattern"></div>
        <div className="auth-overlay"></div>
      </div>

      {/* Debug logging for layout inspection */}
      {console.log("Auth container dimensions:", {
        container: document
          .querySelector(".auth-container")
          ?.getBoundingClientRect(),
        content: document
          .querySelector(".auth-content")
          ?.getBoundingClientRect(),
        card: document.querySelector(".auth-card")?.getBoundingClientRect(),
        hero: document.querySelector(".auth-hero")?.getBoundingClientRect(),
        stats: document.querySelector(".hero-stats")?.getBoundingClientRect(),
      })}

      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <span>🍽</span>
              <h1>Feedaily</h1>
            </div>
            <h2>Welcome back</h2>
            <p>Sign in to continue your zero-waste journey</p>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            {error && <div className="auth-error">{error}</div>}

            <div className="input-group">
              <FiMail className="input-icon" />
              <input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="auth-input"
              />
            </div>

            <div className="input-group">
              <FiLock className="input-icon" />
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
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <button type="submit" className="auth-button" disabled={isLoading}>
              {isLoading ? (
                <div className="spinner"></div>
              ) : (
                <>
                  Sign In
                  <FiArrowRight />
                </>
              )}
            </button>

            <div className="auth-footer">
              <p>
                Don't have an account?{" "}
                <Link to="/register" className="auth-link">
                  Sign up now
                </Link>
              </p>
              <a href="#" className="forgot-link">
                Forgot password?
              </a>
              <div className="admin-login-link">
                <Link to="/admin-login" className="auth-link">
                  Login as Admin
                </Link>
              </div>
            </div>
          </form>
        </div>

        <div className="auth-hero">
          <div className="hero-content">
            <h3>Every Plate Matters</h3>
            <p>
              Join thousands of users fighting food waste one meal at a time
            </p>
            <div className="hero-stats">
              <div className="stat">
                <span className="stat-number">10K+</span>
                <span className="stat-label">Meals Saved</span>
              </div>
              <div className="stat">
                <span className="stat-number">2K+</span>
                <span className="stat-label">Active Users</span>
              </div>
              <div className="stat">
                <span className="stat-number">500+</span>
                <span className="stat-label">Partners</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
