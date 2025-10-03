import React, { useState, useEffect } from "react";
import { 
  FiArrowRight, 
  FiUsers, 
  FiHeart, 
  FiGlobe, 
  FiAward,
  FiShield,
  FiTrendingUp,
  FiMail,
  FiPhone,
  FiMapPin
} from "react-icons/fi";
import "./LandingPage.css";

export default function LandingPage({ onLoginClick, onGetStartedClick }) {
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const features = [
    { icon: <FiUsers />, title: "Community Driven", desc: "Join thousands fighting food waste" },
    { icon: <FiHeart />, title: "Make an Impact", desc: "Every meal saved makes a difference" },
    { icon: <FiGlobe />, title: "Eco Friendly", desc: "Reduce your carbon footprint" },
    { icon: <FiAward />, title: "Earn Recognition", desc: "Climb the leaderboards" },
    { icon: <FiShield />, title: "Safe & Verified", desc: "Quality assured donations" },
    { icon: <FiTrendingUp />, title: "Track Progress", desc: "Monitor your impact in real-time" }
  ];

  const stats = [
    { number: "10K+", label: "Meals Saved" },
    { number: "2K+", label: "Active Users" },
    { number: "500+", label: "Partners" },
    { number: "50+", label: "Communities" }
  ];

  const partners = [
    "World Food Programme",
    "Akshay Patra Foundation",
    "Feeding India",
    "Robin Hood Army"
  ];

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className={`landing-nav ${scrollY > 50 ? 'scrolled' : ''}`}>
        <div className="nav-container">
          <div className="brand-name">feedaily</div>
          
          <div className="nav-buttons">
            <button onClick={onLoginClick} className="btn-login">
              Login
            </button>
            <button onClick={onGetStartedClick} className="btn-primary">
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Rescue food,<br />
              <span className="hero-highlight">reduce waste</span>
            </h1>
            
            <p className="hero-description">
              Join the movement to eliminate food waste and feed communities in need. 
              Every plate matters in our mission to create a sustainable future.
            </p>

            <div className="hero-buttons">
              <button onClick={onGetStartedClick} className="btn-hero-primary">
                Start Your Journey
                <FiArrowRight className="btn-icon" />
              </button>
              <button onClick={onLoginClick} className="btn-hero-secondary">
                Learn More
              </button>
            </div>
          </div>

          <div className="hero-image-container">
            <div className="hero-image-wrapper">
              <img
                src="https://static.vecteezy.com/system/resources/thumbnails/016/733/232/small_2x/hand-drawn-fried-chicken-rice-or-thai-food-illustration-png.png"
                alt="Food illustration"
                className="hero-image"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="section-divider">
        <div className="divider-line" />
      </div>

      {/* About Us Section */}
      <section className="about-section">
        <div className="about-container">
          <h2 className="section-title">About Feedaily</h2>
          <div className="about-content">
            <p className="about-text">
              Feedaily is a registered NGO dedicated to rescuing surplus food and redistributing it to those in need. Our mission is to build a sustainable ecosystem by connecting communities, donors, and partners, and making a lasting impact on hunger and the environment.
            </p>
            <p className="about-meta">
              Registration No: NGO/2023/IND/09845 &nbsp; | &nbsp; Established 2023
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-container">
          <div className="section-header">
            <h2 className="section-title">Why Choose Feedaily?</h2>
            <p className="section-subtitle">
              Join a platform that makes saving food simple and rewarding
            </p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={`feature-card ${hoveredFeature === index ? 'hovered' : ''}`}
              >
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partners Section */}
      <section className="partners-section">
        <div className="partners-container">
          <h2 className="partners-title">Our Trusted Partners</h2>
          <div className="partners-grid">
            {partners.map((partner, i) => (
              <span key={i} className="partner-badge">
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="section-container">
          <div className="stats-grid">
            {stats.map((stat, index) => (
              <div key={index} className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-container">
          <h2 className="cta-title">Ready to Make a Difference?</h2>
          <p className="cta-description">
            Join thousands of users fighting food waste today
          </p>

          <button onClick={onGetStartedClick} className="btn-cta">
            Start Your Journey
            <FiArrowRight className="btn-icon" />
          </button>
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="contact-container">
          <h2 className="contact-title">Contact Us</h2>
          <div className="contact-grid">
            <div className="contact-item">
              <FiMail className="contact-icon" />
              <span>contact@feedaily.org</span>
            </div>
            <div className="contact-item">
              <FiPhone className="contact-icon" />
              <span>+91 98765 43210</span>
            </div>
            <div className="contact-item">
              <FiMapPin className="contact-icon" />
              <span>Feedaily NGO, Bengaluru, India</span>
            </div>
          </div>
          <div className="social-links">
            Follow us: 
            <a href="#" className="social-link">Instagram</a> | 
            <a href="#" className="social-link">Twitter</a> | 
            <a href="#" className="social-link">Facebook</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <p className="footer-text">
            © 2025 Feedaily. Making a difference, one meal at a time.
          </p>
          <p className="footer-subtext">
            Registered NGO | All donations eligible for tax exemption under Section 80G, Government of India.
          </p>
        </div>
      </footer>
    </div>
  );
}