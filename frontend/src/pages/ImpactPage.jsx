import React, { useEffect, useRef, useState } from "react";
import {
  FiClock,
  FiDroplet,
  FiHeart,
  FiMail,
  FiRefreshCw,
  FiTarget,
  FiThermometer,
  FiTrendingUp,
  FiUsers,
  FiZap,
} from "react-icons/fi";
import "./ImpactPage.css";

export const ImpactPage = () => {
  const [environmentalData, setEnvironmentalData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [animatedMetrics, setAnimatedMetrics] = useState({
    foodWasteAvoided: 0,
    carbonAvoided: 0,
    waterSaved: 0,
    energySaved: 0,
    deliveryEfficiency: 0,
    diversionRate: 0,
    avgDistance: 0,
    communityIndex: 0,
  });
  const [inView, setInView] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);
  const metricsRef = useRef(null);

  // console.log("Debug - environmentalData:", environmentalData);
  // console.log("Debug - animatedMetrics:", animatedMetrics);
  // console.log("Debug - inView:", inView, "hasAnimated:", hasAnimated);

  // Fetch environmental impact data
  useEffect(() => {
    const fetchEnvironmentalData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          "http://localhost:5000/api/environmental-impact"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch environmental impact data");
        }

        const result = await response.json();
        // console.log("Environmental impact data:", result);

        if (result.success && result.data) {
          setEnvironmentalData(result.data);
        } else {
          throw new Error("Invalid response format");
        }

        setLoading(false);
      } catch (err) {
        console.error("Error fetching environmental impact:", err);
        setError(err.message || "Failed to load environmental impact data");
        setLoading(false);
      }
    };

    fetchEnvironmentalData();
  }, []);

  // Intersection Observer for animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        console.log(
          "Debug - Intersection observer triggered:",
          entry.isIntersecting,
          "hasAnimated:",
          hasAnimated
        );
        if (entry.isIntersecting && !hasAnimated) {
          console.log("Debug - Setting inView to true");
          setInView(true);
          setHasAnimated(true);
        }
      },
      { threshold: 0.1, rootMargin: "0px 0px -10px 0px" } // More aggressive settings
    );

    if (metricsRef.current) {
      observer.observe(metricsRef.current);
      console.log("Debug - Observer attached to metricsRef");
    } else {
      console.log("Debug - metricsRef.current is null");
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  // Fallback: trigger animation after data loads and a short delay
  useEffect(() => {
    if (environmentalData && !hasAnimated && !inView) {
      console.log(
        "Debug - Fallback trigger: setting inView to true after 1 second"
      );
      const timer = setTimeout(() => {
        setInView(true);
        setHasAnimated(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [environmentalData, hasAnimated, inView]);

  // Animate metrics when in view - using homepage pattern
  useEffect(() => {
    if (inView && environmentalData) {
      const targets = [
        environmentalData.foodWaste?.wasteAvoided || 0,
        environmentalData.carbonImpact?.emissionAvoided || 0,
        environmentalData.resourceSaving?.waterSaved || 0,
        environmentalData.resourceSaving?.energySaved || 0,
        environmentalData.efficiency?.delivery || 0,
        environmentalData.wasteManagement?.diversionRate || 0,
        environmentalData.community?.avgDeliveryDistance || 0,
        environmentalData.community?.sustainabilityIndex || 0,
      ];

      // console.log("Debug - Animation starting with targets:", targets);

      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOutQuad = 1 - Math.pow(1 - progress, 3);

        const newMetrics = {
          foodWasteAvoided: Math.floor(targets[0] * easeOutQuad),
          carbonAvoided: Math.floor(targets[1] * easeOutQuad),
          waterSaved: Math.floor(targets[2] * easeOutQuad),
          energySaved: Math.floor(targets[3] * easeOutQuad),
          deliveryEfficiency: Math.floor(targets[4] * easeOutQuad),
          diversionRate: Math.floor(targets[5] * easeOutQuad),
          avgDistance: parseFloat((targets[6] * easeOutQuad).toFixed(1)),
          communityIndex: Math.floor(targets[7] * easeOutQuad),
        };

        // console.log(
        //   `Debug - Step ${currentStep}/${steps}, progress: ${progress.toFixed(
        //     2
        //   )}, metrics:`,
        //   newMetrics
        // );

        setAnimatedMetrics(newMetrics);

        if (currentStep >= steps) {
          const finalMetrics = {
            foodWasteAvoided: Math.floor(targets[0]),
            carbonAvoided: Math.floor(targets[1]),
            waterSaved: Math.floor(targets[2]),
            energySaved: Math.floor(targets[3]),
            deliveryEfficiency: Math.floor(targets[4]),
            diversionRate: Math.floor(targets[5]),
            avgDistance: parseFloat(targets[6].toFixed(1)),
            communityIndex: Math.floor(targets[7]),
          };
          // console.log(
          //   "Debug - Animation completed, final metrics:",
          //   finalMetrics
          // );
          setAnimatedMetrics(finalMetrics);
          clearInterval(interval);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }
  }, [inView, environmentalData]);

  if (loading) {
    return (
      <div className="ip-loading">
        <div className="ip-loading-spinner"></div>
        <p>Loading environmental impact data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="ip-loading">
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

  const environmentalMetrics = [
    {
      icon: <FiHeart className="w-8 h-8" />,
      title: "Food Waste Prevented",
      value: animatedMetrics.foodWasteAvoided || 0,
      unit: "kg",
      color: "from-green-500 to-green-600",
      description: "Total food rescued from going to waste",
    },
    {
      icon: <FiThermometer className="w-8 h-8" />,
      title: "CO₂ Emissions Avoided",
      value: animatedMetrics.carbonAvoided || 0,
      unit: "kg CO₂",
      color: "from-blue-500 to-blue-600",
      description: "Carbon footprint reduced by preventing food waste",
    },
    {
      icon: <FiDroplet className="w-8 h-8" />,
      title: "Water Footprint Saved",
      value: animatedMetrics.waterSaved || 0,
      unit: "L",
      color: "from-cyan-500 to-cyan-600",
      description: "Water conserved by rescuing surplus food",
    },
    {
      icon: <FiZap className="w-8 h-8" />,
      title: "Energy Conserved",
      value: animatedMetrics.energySaved || 0,
      unit: "MJ",
      color: "from-yellow-500 to-yellow-600",
      description: "Energy saved by not producing replacement food",
    },
    {
      icon: <FiRefreshCw className="w-8 h-8" />,
      title: "Waste Diversion Rate",
      value: animatedMetrics.diversionRate || 0,
      unit: "%",
      color: "from-emerald-500 to-emerald-600",
      description: "Food successfully diverted from landfills",
    },
    {
      icon: <FiUsers className="w-8 h-8" />,
      title: "Community Engagement",
      value: animatedMetrics.communityIndex || 0,
      unit: "%",
      color: "from-pink-500 to-pink-600",
      description: "Community participation in sustainability efforts",
    },
  ];

  return (
    <div className="ip-container">
      {/* Hero Section */}
      <div className="ip-hero">
        <div className="ip-hero-background">
          <div className="ip-hero-overlay"></div>
        </div>
        <div className="ip-hero-content">
          <h1 className="ip-hero-title">
            Environmental <span className="ip-hero-highlight">Impact</span>
          </h1>
          <p className="ip-hero-subtitle">
            Measuring our contribution to a sustainable future through
            data-driven insights
          </p>
          <div className="ip-hero-stats">
            <div className="ip-hero-stat">
              <FiHeart className="ip-hero-stat-icon" />
              <span className="ip-hero-stat-text">
                {environmentalData?.foodWaste?.wasteAvoided?.toFixed(1) || "0"}{" "}
                kg Food Rescued
              </span>
            </div>
            <div className="ip-hero-stat">
              <FiThermometer className="ip-hero-stat-icon" />
              <span className="ip-hero-stat-text">
                {environmentalData?.carbonImpact?.emissionAvoided?.toFixed(1) ||
                  "0"}{" "}
                kg CO₂ Avoided
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Environmental Metrics */}
      <section className="ip-metrics" ref={metricsRef}>
        <div className="ip-section-header">
          <h2 className="ip-section-title">Environmental Impact Metrics</h2>
          <p className="ip-section-subtitle">
            Real environmental benefits from our food rescue operations
          </p>
        </div>

        <div className="ip-metrics-grid">
          {environmentalMetrics.map((metric, index) => (
            <div
              key={index}
              className="ip-metric-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`ip-metric-icon bg-gradient-to-r ${metric.color}`}
              >
                {metric.icon}
              </div>
              <div className="ip-metric-content">
                <div className="ip-metric-value">
                  {metric.value.toLocaleString()}
                  <span className="ip-metric-unit">{metric.unit}</span>
                </div>
                <h3 className="ip-metric-title">{metric.title}</h3>
                <p className="ip-metric-description">{metric.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Efficiency Insights */}
      {environmentalData?.efficiency && (
        <section className="ip-insights">
          <div className="ip-section-header">
            <h2 className="ip-section-title">Efficiency Insights</h2>
            <p className="ip-section-subtitle">
              How we're optimizing our environmental impact
            </p>
          </div>

          <div className="ip-insights-grid">
            <div className="ip-insight-card">
              <div className="ip-insight-icon">
                <FiClock className="w-6 h-6" />
              </div>
              <div className="ip-insight-content">
                <h3>Freshness Efficiency</h3>
                <div className="ip-insight-value">
                  {environmentalData.efficiency.freshness?.toFixed(1) || "0"}{" "}
                  hrs avg
                </div>
                <p>Average freshness of delivered food</p>
              </div>
            </div>

            <div className="ip-insight-card">
              <div className="ip-insight-icon">
                <FiTarget className="w-6 h-6" />
              </div>
              <div className="ip-insight-content">
                <h3>Locality Optimization</h3>
                <div className="ip-insight-value">
                  {(environmentalData.efficiency.localityScore * 100)?.toFixed(
                    0
                  ) || "0"}
                  %
                </div>
                <p>Efficiency in local food distribution</p>
              </div>
            </div>

            <div className="ip-insight-card">
              <div className="ip-insight-icon">
                <FiMail className="w-6 h-6" />
              </div>
              <div className="ip-insight-content">
                <h3>Digital Footprint</h3>
                <div className="ip-insight-value">
                  {environmentalData.carbonImpact?.digitalFootprint?.toFixed(
                    3
                  ) || "0"}{" "}
                  kg CO₂
                </div>
                <p>Carbon cost of digital notifications</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Call to Action */}
      <section className="ip-cta">
        <div className="ip-cta-content">
          <h2 className="ip-cta-title">Join the Environmental Movement</h2>
          <p className="ip-cta-subtitle">
            Every food rescue contributes to a healthier planet. Start making a
            difference today through sustainable food sharing.
          </p>
          <div className="ip-cta-buttons">
            <button
              className="ip-cta-primary"
              onClick={() => (window.location.href = "/dashboard")}
            >
              <FiHeart className="ip-btn-icon" />
              Start Rescuing Food
            </button>
            <button
              className="ip-cta-secondary"
              onClick={() => (window.location.href = "/stats")}
            >
              <FiTrendingUp className="ip-btn-icon" />
              View Detailed Stats
            </button>
          </div>
        </div>
        <div className="ip-cta-visual">
          <div className="ip-impact-circles">
            <div className="ip-circle ip-circle-1"></div>
            <div className="ip-circle ip-circle-2"></div>
            <div className="ip-circle ip-circle-3"></div>
          </div>
        </div>
      </section>
    </div>
  );
};
