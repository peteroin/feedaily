// RegisterPage.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser, FiMail, FiLock, FiEye, FiEyeOff,
  FiPhone, FiMapPin, FiArrowRight
} from "react-icons/fi";
import "./AuthPages.css";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    type: "Student",
    email: "",
    password: "",
    confirmPassword: "",
    contact: "",
    address: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const { name, email, password, confirmPassword, contact, address } = formData;

    if (!name || !email || !password || !confirmPassword || !contact || !address) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(contact)) {
    setError("Please enter a valid 10-digit phone number");
    return;
    }

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (data.message === "Registration successful") {
        alert("Registration successful!");
        navigate("/login");
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      setError("Network error. Please try again.");
      console.log(error);
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

      <div className="auth-content">
        <div className="auth-card register-card">
          <div className="auth-header">
            <div className="auth-logo">
              <span>🍽</span>
              <h1>Feedaily</h1>
            </div>
            <h2>Join the movement</h2>
            <p>Create your account and start making a difference</p>
          </div>

          <form onSubmit={handleRegister} className="auth-form">
            {error && <div className="auth-error">{error}</div>}

            <div className="input-group">
              <FiUser className="input-icon" />
              <input
                type="text"
                name="name"
                placeholder="Full Name"
                value={formData.name}
                onChange={handleChange}
                required
                className="auth-input"
              />
            </div>

            <div className="input-group">
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                required
                className="auth-select"
              >
                <option value="Student">Student</option>
                <option value="Individual">Individual</option>
                <option value="Organisation">Organisation</option>
                <option value="NGO">NGO</option>
                <option value="Others">Others</option>
              </select>
            </div>

            <div className="input-group">
              <FiPhone className="input-icon" />
              <input
                type="text"
                name="contact"
                placeholder="Contact Number"
                value={formData.contact}
                onChange={handleChange}
                required
                className="auth-input"
              />
            </div>

            <div className="input-group">
              <FiMail className="input-icon" />
              <input
                type="email"
                name="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                className="auth-input"
              />
            </div>

            <div className="input-group">
              <FiMapPin className="input-icon" />
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                required
                className="auth-input"
              />
            </div>

            <div className="input-group">
              <FiLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
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

            <div className="input-group">
              <FiLock className="input-icon" />
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="auth-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
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
                  Create Account
                  <FiArrowRight />
                </>
              )}
            </button>

            <div className="auth-footer">
              <p>
                Already have an account?{" "}
                <Link to="/login" className="auth-link">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>

        <div className="auth-hero">
          <div className="hero-content">
            <h3>Start Your Impact Journey</h3>
            <p>Join our community dedicated to reducing food waste and feeding those in need</p>
            <div className="benefits-list">
              <div className="benefit">
                <span className="benefit-icon">♻️</span>
                <span>Reduce food waste</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">🤝</span>
                <span>Connect with local community</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">📊</span>
                <span>Track your impact</span>
              </div>
              <div className="benefit">
                <span className="benefit-icon">🏆</span>
                <span>Earn recognition</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}