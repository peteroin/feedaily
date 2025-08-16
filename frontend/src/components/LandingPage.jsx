import React from "react";
import "./LandingPage.css";

export default function LandingPage({ onLoginClick, onGetStartedClick }) {
  return (
    <div className="landing-container">
      {/* Top section split black/white */}
      <div className="top-section">
        <div className="left-half center-content">
          <h1 className="brand-logo">feedaily</h1>
        </div>
        <div className="right-half center-content">
          <div className="auth-buttons">
            <button className="login-btn" onClick={onLoginClick}>
              Login
            </button>
            <button className="register-btn" onClick={onGetStartedClick}>
              Get Started
            </button>
          </div>
        </div>

        {/* Image centered between black and white halves */}
        <img
          src="https://static.vecteezy.com/system/resources/thumbnails/016/733/232/small_2x/hand-drawn-fried-chicken-rice-or-thai-food-illustration-png.png" // Replace with the actual image link you want to use
          alt="Black and white donut"
          className="center-image"
        />
      </div>

      {/* Bottom Section */}
      <div className="bottom-section">
        <div className="bottom-black">
          <p className="food-text">Save Food. Save Planet.</p>
        </div>
        <div className="bottom-white">
          <p className="food-text-black">Reduce Waste. Feed People.</p>
        </div>
      </div>
    </div>
  );
}
