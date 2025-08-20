// LandingPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { 
  FiArrowRight, 
  FiUsers, 
  FiHeart, 
  FiGlobe, 
  FiAward,
  FiShield,
  FiTrendingUp
} from "react-icons/fi";
import "./LandingPage.css";

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

export default function LandingPage({ onLoginClick, onGetStartedClick }) {
  const containerRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // Refs for animations
  const leftHalfRef = useRef(null);
  const rightHalfRef = useRef(null);
  const brandLogoRef = useRef(null);
  const buttonsRef = useRef(null);
  const centerImageRef = useRef(null);
  const featuresRef = useRef(null);

  // Safe GSAP animation with error handling
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!containerRef.current) return;
      
      setIsAnimating(true);
      
      try {
        // Main animation timeline
        const tl = gsap.timeline({
          onComplete: () => setIsAnimating(false)
        });

        // Split screen animation
        tl.fromTo([leftHalfRef.current, rightHalfRef.current], 
          { width: 0, opacity: 0 },
          {
            duration: 1.2,
            width: "50%",
            opacity: 1,
            stagger: 0.2,
            ease: "power3.inOut"
          }
        )
        .fromTo(brandLogoRef.current, 
          { y: -50, opacity: 0 },
          {
            duration: 0.8,
            y: 0,
            opacity: 1,
            ease: "back.out(1.7)"
          }, 
          "-=0.5"
        )
        .fromTo(buttonsRef.current.children, 
          { y: 30, opacity: 0 },
          {
            duration: 0.6,
            y: 0,
            opacity: 1,
            stagger: 0.15,
            ease: "power2.out"
          }, 
          "-=0.3"
        );

        // Center image animation
        if (centerImageRef.current) {
          tl.fromTo(centerImageRef.current, 
            { scale: 0, rotation: -15, opacity: 0 },
            {
              duration: 1,
              scale: 1,
              rotation: 0,
              opacity: 1,
              ease: "back.out(1.7)"
            }, 
            "-=0.5"
          );
        }

        // Features animation
        if (featuresRef.current) {
          gsap.fromTo(featuresRef.current.children, 
            {
              y: 50,
              opacity: 0
            },
            {
              y: 0,
              opacity: 1,
              duration: 0.8,
              stagger: 0.2,
              ease: "power2.out",
              scrollTrigger: {
                trigger: featuresRef.current,
                start: "top 80%",
                toggleActions: "play none none reverse"
              }
            }
          );
        }

      } catch (error) {
        console.error("Animation error:", error);
        setIsAnimating(false);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  const handleButtonHover = (e) => {
    if (isAnimating) return;
    
    gsap.to(e.target, {
      duration: 0.3,
      scale: 1.05,
      boxShadow: "0 10px 25px rgba(0, 0, 0, 0.15)",
      ease: "power1.out"
    });
  };

  const handleButtonLeave = (e) => {
    if (isAnimating) return;
    
    gsap.to(e.target, {
      duration: 0.3,
      scale: 1,
      boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
      ease: "power1.out"
    });
  };

  const features = [
    { icon: <FiUsers />, title: "Community Driven", desc: "Join thousands fighting food waste" },
    { icon: <FiHeart />, title: "Make an Impact", desc: "Every meal saved makes a difference" },
    { icon: <FiGlobe />, title: "Eco Friendly", desc: "Reduce your carbon footprint" },
    { icon: <FiAward />, title: "Earn Recognition", desc: "Climb the leaderboards" },
    { icon: <FiShield />, title: "Safe & Verified", desc: "Quality assured donations" },
    { icon: <FiTrendingUp />, title: "Track Progress", desc: "Monitor your impact in real-time" }
  ];

  return (
    <div className="landing-container" ref={containerRef}>
      {/* Animated background elements */}
      <div className="floating-element floating-element-1"></div>
      <div className="floating-element floating-element-2"></div>
      <div className="floating-element floating-element-3"></div>
      
      {/* Top section split black/white */}
      <div className="top-section">
        <div className="left-half center-content" ref={leftHalfRef}>
          <div className="hero-content">
            <h1 className="brand-logo" ref={brandLogoRef}>feedaily</h1>
            <p className="tagline">Rescue food, reduce waste</p>
            <p className="hero-description">
              Join the movement to eliminate food waste and feed communities in need. 
              Every plate matters in our mission to create a sustainable future.
            </p>
          </div>
        </div>
        
        <div className="right-half center-content" ref={rightHalfRef}>
          <div className="auth-buttons" ref={buttonsRef}>
            <button 
              className="login-btn" 
              onClick={onLoginClick}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
              disabled={isAnimating}
            >
              Login
            </button>
            <button 
              className="register-btn" 
              onClick={onGetStartedClick}
              onMouseEnter={handleButtonHover}
              onMouseLeave={handleButtonLeave}
              disabled={isAnimating}
            >
              Get Started
              <FiArrowRight className="btn-icon" />
            </button>
          </div>
        </div>

        {/* Image centered between black and white halves */}
        <img
          ref={centerImageRef}
          src="https://static.vecteezy.com/system/resources/thumbnails/016/733/232/small_2x/hand-drawn-fried-chicken-rice-or-thai-food-illustration-png.png"
          alt="Delicious food illustration"
          className="center-image"
          onError={(e) => {
            e.target.style.display = 'none';
          }}
        />
      </div>

      {/* Features Section */}
      <div className="features-section">
        <div className="container">
          <div className="section-header">
            <h2>Why Choose Feedaily?</h2>
            <p>Join a platform that makes saving food simple and rewarding</p>
          </div>
          
          <div className="features-grid" ref={featuresRef}>
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">10K+</span>
              <span className="stat-label">Meals Saved</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">2K+</span>
              <span className="stat-label">Active Users</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">Partners</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">50+</span>
              <span className="stat-label">Communities</span>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <div className="container">
          <h2>Ready to Make a Difference?</h2>
          <p>Join thousands of users fighting food waste today</p>
          <button 
            className="cta-button"
            onClick={onGetStartedClick}
          >
            Start Your Journey
            <FiArrowRight className="btn-icon" />
          </button>
        </div>
      </div>

      {/* Loading indicator */}
      {isAnimating && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
        </div>
      )}
    </div>
  );
}