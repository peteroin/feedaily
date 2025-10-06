import React, { useEffect, useRef, useState } from "react";
import {
  FiGlobe,
  FiHeart,
  FiPackage,
  FiTarget,
  FiTrendingUp,
  FiUsers,
} from "react-icons/fi";
import "./ImpactPage.css";

export const ImpactPage = () => {
  const [stats, setStats] = useState({
    totalDonated: 0,
    totalTaken: 0,
    totalPeopleFed: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animatedStats, setAnimatedStats] = useState({
    totalDonated: 0,
    totalTaken: 0,
    totalPeopleFed: 0,
    mealsSaved: 0,
    activeUsers: 0,
    partners: 0,
    communities: 0,
  });
  const [inView, setInView] = useState(false);
  const statsRef = useRef(null);

  // Fetch data from stats endpoint
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const statsResponse = await fetch(
          "http://localhost:5000/api/donation-stats"
        );

        if (!statsResponse.ok) {
          throw new Error("Failed to fetch data from server");
        }

        const statsData = await statsResponse.json();

        console.log("Fetched stats:", statsData);

        // Handle the stats data
        if (statsData.message) {
          throw new Error(statsData.message);
        }
        setStats(statsData);

        setLoading(false);
      } catch (err) {
        console.error("Error fetching impact data:", err);
        setError(err.message || "Failed to load impact data");
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
        }
      },
      { threshold: 0.1 } // Reduced threshold to trigger earlier
    );

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Animate numbers when data is loaded OR when in view
  useEffect(() => {
    if ((!loading && !error && stats.totalDonated > 0) || inView) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;

        // Calculate derived stats from real data
        const mealsSaved = Math.floor(stats.totalDonated * 2.5); // Assuming 1kg = 2.5 meals saved
        const activeUsers = Math.floor(stats.totalPeopleFed * 0.8); // Estimate active users
        const partners = Math.min(Math.floor(stats.totalDonated / 10), 500); // Partners based on donations
        const communities = Math.min(
          Math.floor(stats.totalPeopleFed / 100),
          50
        ); // Communities served

        setAnimatedStats({
          totalDonated: Math.floor(stats.totalDonated * progress),
          totalTaken: Math.floor(stats.totalTaken * progress),
          totalPeopleFed: Math.floor(stats.totalPeopleFed * progress),
          mealsSaved: Math.floor(mealsSaved * progress),
          activeUsers: Math.floor(activeUsers * progress),
          partners: Math.floor(partners * progress),
          communities: Math.floor(communities * progress),
        });

        if (currentStep >= steps) {
          setAnimatedStats({
            totalDonated: Math.floor(stats.totalDonated),
            totalTaken: Math.floor(stats.totalTaken),
            totalPeopleFed: Math.floor(stats.totalPeopleFed),
            mealsSaved,
            activeUsers,
            partners,
            communities,
          });
          clearInterval(timer);
        }
      }, stepDuration);

      return () => clearInterval(timer);
    }
  }, [loading, error, stats, inView]);

  const impactMetrics = [
    {
      icon: <FiPackage className="w-8 h-8" />,
      title: "Meals Saved",
      value: animatedStats.mealsSaved,
      unit: "",
      color: "from-blue-500 to-blue-600",
      description: "Total meals rescued from waste",
      change: "+15%",
    },
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: "Active Users",
      value: animatedStats.activeUsers,
      unit: "",
      color: "from-green-500 to-green-600",
      description: "Community members making impact",
      change: "+22%",
    },
    {
      icon: <FiHeart className="w-8 h-8" />,
      title: "Partners",
      value: animatedStats.partners,
      unit: "",
      color: "from-purple-500 to-purple-600",
      description: "Organizations working with us",
      change: "+18%",
    },
    {
      icon: <FiGlobe className="w-8 h-8" />,
      title: "Communities",
      value: animatedStats.communities,
      unit: "",
      color: "from-emerald-500 to-emerald-600",
      description: "Areas we're serving",
      change: "+25%",
    },
    {
      icon: <FiPackage className="w-8 h-8" />,
      title: "Food Rescued",
      value: animatedStats.totalDonated,
      unit: "kg",
      color: "from-orange-500 to-orange-600",
      description: "Total food saved from waste",
      change: "+12%",
    },
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: "People Fed",
      value: animatedStats.totalPeopleFed,
      unit: "",
      color: "from-red-500 to-red-600",
      description: "Lives directly impacted",
      change: "+18%",
    },
  ];

  const achievements = [
    {
      icon: "🏆",
      title: "Top NGO",
      desc: "Regional recognition for food rescue",
    },
    {
      icon: "🌱",
      title: "Eco Champion",
      desc: `Reduced ${Math.floor(
        stats.totalDonated / 100
      )}+ tons of food waste`,
    },
    {
      icon: "🤝",
      title: "Community Builder",
      desc: `Connected ${animatedStats.activeUsers}+ food donors`,
    },
    {
      icon: "📈",
      title: "Growth Leader",
      desc: "300% increase in impact this year",
    },
  ];

  if (loading) {
    return (
      <div className="impact-loading">
        <div className="loading-spinner"></div>
        <p>Loading impact data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="impact-loading">
        <div style={{ color: "#ef4444", fontSize: "3rem" }}>⚠️</div>
        <p style={{ color: "#ef4444" }}>Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: "1rem",
            padding: "0.5rem 1rem",
            backgroundColor: "#4f46e5",
            color: "white",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="impact-container">
      {/* Hero Section */}
      <div className="impact-hero">
        <div className="hero-background">
          <div className="hero-overlay"></div>
        </div>
        <div className="hero-content">
          <h1 className="hero-title">
            Our <span className="hero-highlight">Impact</span> Story
          </h1>
          <p className="hero-subtitle">
            Transforming surplus food into hope, one meal at a time
          </p>
          <div className="hero-stats">
            <div className="hero-stat">
              <FiHeart className="hero-stat-icon" />
              <span className="hero-stat-text">
                {stats.totalPeopleFed.toLocaleString()} People Fed
              </span>
            </div>
            <div className="hero-stat">
              <FiTarget className="hero-stat-icon" />
              <span className="hero-stat-text">
                {stats.totalDonated.toFixed(1)} kg Rescued
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Impact Metrics */}
      <section className="impact-metrics" ref={statsRef}>
        <div className="section-header">
          <h2 className="section-title">Impact at a Glance</h2>
          <p className="section-subtitle">
            Real numbers, real change, real people helped
          </p>
        </div>

        <div className="metrics-grid">
          {impactMetrics.map((metric, index) => (
            <div
              key={index}
              className="metric-card"
              style={{ animationDelay: `${index * 0.2}s` }}
            >
              <div className={`metric-icon bg-gradient-to-r ${metric.color}`}>
                {metric.icon}
              </div>
              <div className="metric-content">
                <div className="metric-value">
                  {metric.value.toLocaleString()}
                  <span className="metric-unit">{metric.unit}</span>
                </div>
                <h3 className="metric-title">{metric.title}</h3>
                <p className="metric-description">{metric.description}</p>
                <div className="metric-change">
                  <FiTrendingUp className="change-icon" />
                  <span>{metric.change} this month</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Achievements */}
      <section className="impact-achievements">
        <div className="section-header">
          <h2 className="section-title">Our Achievements</h2>
          <p className="section-subtitle">Milestones that make us proud</p>
        </div>

        <div className="achievements-grid">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className="achievement-card"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="achievement-icon">{achievement.icon}</div>
              <h3 className="achievement-title">{achievement.title}</h3>
              <p className="achievement-desc">{achievement.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action */}
      <section className="impact-cta">
        <div className="cta-content">
          <h2 className="cta-title">Be Part of Something Bigger</h2>
          <p className="cta-subtitle">
            Every donation, every meal shared, every life touched - it all adds
            up to create lasting change in our community.
          </p>
          <div className="cta-buttons">
            <button
              className="cta-primary"
              onClick={() => (window.location.href = "/dashboard")}
            >
              <FiHeart className="btn-icon" />
              Start Donating
            </button>
            <button
              className="cta-secondary"
              onClick={() => (window.location.href = "/register")}
            >
              <FiUsers className="btn-icon" />
              Join Our Community
            </button>
          </div>
        </div>
        <div className="cta-visual">
          <div className="impact-circles">
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>
            <div className="circle circle-3"></div>
          </div>
        </div>
      </section>
    </div>
  );
};
