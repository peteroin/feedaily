import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FiUser,
  FiMail,
  FiLock,
  FiEye,
  FiEyeOff,
  FiPhone,
  FiMapPin,
  FiArrowRight,
  FiArrowLeft,
} from "react-icons/fi";
import "./AuthCommon.css";
import "./RegisterPage.css";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    type: "Student",
    email: "",
    password: "",
    confirmPassword: "",
    contact: "",
    address: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Current step of the form (1 to 3)
  const [currentStep, setCurrentStep] = useState(1);

  const totalSteps = 3;

  // Handle input field changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  // Validation for each step
  const validateStep = () => {
    if (currentStep === 1) {
      // Step 1: name, type, contact required + contact validation
      if (!formData.name || !formData.type || !formData.contact) {
        setError("Please fill in all fields in this step.");
        return false;
      }
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(formData.contact)) {
        setError("Please enter a valid 10-digit phone number.");
        return false;
      }
      setError("");
      return true;
    }
    if (currentStep === 2) {
      // Step 2: email, address required + valid email check
      if (!formData.email || !formData.address) {
        setError("Please fill in all fields in this step.");
        return false;
      }
      // simple email regex
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email.");
        return false;
      }
      setError("");
      return true;
    }
    if (currentStep === 3) {
      // Step 3: password & confirmPassword validation
      if (!formData.password || !formData.confirmPassword) {
        setError("Please fill in all fields in this step.");
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match!");
        return false;
      }
      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters.");
        return false;
      }
      setError("");
      return true;
    }
    return false;
  };

  // Move to next step if valid
  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((step) => Math.min(step + 1, totalSteps));
    }
  };

  // Move to previous step
  const handlePrev = () => {
    setError("");
    setCurrentStep((step) => Math.max(step - 1, 1));
  };

  // Final submission of full form
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!validateStep()) return;
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
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

  // Classes to animate step visibility
  const stepClass = (step) =>
    step === currentStep ? "form-step active" : "form-step";

  return (
    <div className="auth-container">
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

          <form
            onSubmit={handleRegister}
            className="auth-form"
            noValidate
          >
            {error && <div className="auth-error">{error}</div>}

            {/* Step 1 */}
            <div className={stepClass(1)}>
              <div className="input-group">
                <FiUser className="input-icon" />
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={formData.name}
                  onChange={handleChange}
                  className="auth-input"
                />
              </div>
              <div className="input-group">
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
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
                  className="auth-input"
                />
              </div>
            </div>

            {/* Step 2 */}
            <div className={stepClass(2)}>
              <div className="input-group">
                <FiMail className="input-icon" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
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
                  className="auth-input"
                />
              </div>
            </div>

            {/* Step 3 */}
            <div className={stepClass(3)} style={{ position: "relative" }}>
              <div className="input-group">
                <FiLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="auth-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              <div className="input-group" style={{ position: "relative" }}>
                <FiLock className="input-icon" />
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="auth-input"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(!showConfirmPassword)
                  }
                  tabIndex={-1}
                  aria-label={
                    showConfirmPassword ? "Hide password" : "Show password"
                  }
                >
                  {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            {/* Navigation buttons */}
           {/* Navigation buttons */}
<div className="nav-buttons">
  {currentStep > 1 ? (
    <button
      type="button"
      className="nav-button"
      onClick={handlePrev}
    >
      <FiArrowLeft />
    </button>
  ) : (
    <div />
  )}

  {currentStep < totalSteps ? (
    <button
      type="button"
      className="nav-button"
      onClick={handleNext}
      disabled={isLoading}
    >
      <FiArrowRight />
    </button>
  ) : (
    <button
      type="submit"
      className="auth-button"
      disabled={isLoading}
      aria-busy={isLoading}
    >
      {isLoading ? (
        <div className="spinner" aria-hidden="true"></div>
      ) : (
        <>
          Create Account
          <FiArrowRight style={{ marginLeft: "0.3rem" }} />
        </>
      )}
    </button>
  )}
</div>


            <div className="auth-footer" style={{ gridColumn: "1 / -1", marginTop: "1rem" }}>
              <p>
                Already have an account?{" "}
                <Link to="/login" className="auth-link">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Inline styles for animation */}
      <style>{`
        .form-step {
          display: none;
          opacity: 0;
          transform: translateX(50px);
          transition: opacity 0.4s ease, transform 0.4s ease;
          grid-column: 1 / -1;
        }
        .form-step.active {
          display: block;
          opacity: 1;
          transform: translateX(0);
        }
        /* Button tweaks */
        .auth-button.prev {
          background: #6c757d;
          color: white;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          padding: 0.85rem 1.2rem;
          border: none;
          display: flex;
          align-items: center;
          transition: background 0.3s ease;
        }
        .auth-button.prev:hover {
          background: #5a6268;
        }
      `}</style>
    </div>
  );
}
