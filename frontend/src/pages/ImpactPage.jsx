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
  FiAlertCircle,
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

  // Fetch environmental impact data with better error handling
  const fetchEnvironmentalData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("Fetching environmental impact data...");
      
      const response = await fetch("http://localhost:5000/api/environmental-impact");
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Fetched data:", result);

      if (result.success && result.data) {
        setEnvironmentalData(result.data);
        
        // Initialize animated metrics with actual data
        const data = result.data;
        setAnimatedMetrics({
          foodWasteAvoided: data.foodWaste?.wasteAvoided || 0,
          carbonAvoided: data.carbonImpact?.emissionAvoided || 0,
          waterSaved: data.resourceSaving?.waterSaved || 0,
          energySaved: data.resourceSaving?.energySaved || 0,
          deliveryEfficiency: data.efficiency?.delivery || 0,
          diversionRate: data.wasteManagement?.diversionRate || 0,
          avgDistance: data.community?.avgDeliveryDistance || 0,
          communityIndex: data.community?.sustainabilityIndex || 0,
        });
      } else {
        throw new Error("Invalid response format: " + JSON.stringify(result));
      }
    } catch (err) {
      console.error("Error fetching environmental impact:", err);
      setError(err.message || "Failed to load environmental impact data");
      
      // Set fallback data for development
      setEnvironmentalData(getFallbackData());
    } finally {
      setLoading(false);
    }
  };

  // Fallback data for development
  const getFallbackData = () => {
    return {
      foodWaste: { wasteAvoided: 1250 },
      carbonImpact: { emissionAvoided: 320, digitalFootprint: 0.025 },
      resourceSaving: { waterSaved: 50000, energySaved: 1200 },
      efficiency: { 
        delivery: 85, 
        freshness: 24.5, 
        localityScore: 0.78 
      },
      wasteManagement: { diversionRate: 92 },
      community: { 
        avgDeliveryDistance: 3.2, 
        sustainabilityIndex: 88,
        totalParticipants: 156,
        completedDonations: 423
      }
    };
  };

  useEffect(() => {
    fetchEnvironmentalData();
  }, []);

  // Simplified Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated && environmentalData) {
          console.log("Starting animation...");
          setInView(true);
          setHasAnimated(true);
        }
      },
      { threshold: 0.3 }
    );

    const currentRef = metricsRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [hasAnimated, environmentalData]);

  // Improved animation logic
  useEffect(() => {
    if (inView && environmentalData) {
      console.log("Animating metrics with data:", environmentalData);
      
      const targets = {
        foodWasteAvoided: environmentalData.foodWaste?.wasteAvoided || 0,
        carbonAvoided: environmentalData.carbonImpact?.emissionAvoided || 0,
        waterSaved: environmentalData.resourceSaving?.waterSaved || 0,
        energySaved: environmentalData.resourceSaving?.energySaved || 0,
        deliveryEfficiency: environmentalData.efficiency?.delivery || 0,
        diversionRate: environmentalData.wasteManagement?.diversionRate || 0,
        avgDistance: environmentalData.community?.avgDeliveryDistance || 0,
        communityIndex: environmentalData.community?.sustainabilityIndex || 0,
      };

      const duration = 1500;
      const frameRate = 60;
      const totalFrames = Math.floor(duration / (1000 / frameRate));
      let frame = 0;

      const animate = () => {
        frame++;
        const progress = Math.min(frame / totalFrames, 1);
        const easeOut = 1 - Math.pow(1 - progress, 3);

        setAnimatedMetrics({
          foodWasteAvoided: Math.floor(targets.foodWasteAvoided * easeOut),
          carbonAvoided: Math.floor(targets.carbonAvoided * easeOut),
          waterSaved: Math.floor(targets.waterSaved * easeOut),
          energySaved: Math.floor(targets.energySaved * easeOut),
          deliveryEfficiency: Math.floor(targets.deliveryEfficiency * easeOut),
          diversionRate: Math.floor(targets.diversionRate * easeOut),
          avgDistance: parseFloat((targets.avgDistance * easeOut).toFixed(1)),
          communityIndex: Math.floor(targets.communityIndex * easeOut),
        });

        if (frame < totalFrames) {
          requestAnimationFrame(animate);
        } else {
          // Ensure final values are exact
          setAnimatedMetrics(targets);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [inView, environmentalData]);

  // Manual refresh function
  const handleRefresh = () => {
    setHasAnimated(false);
    setInView(false);
    fetchEnvironmentalData();
  };

  if (loading) {
    return (
      <div className="impact-loading">
        <FiRefreshCw className="spin" />
        Loading environmental impact data...
      </div>
    );
  }

  if (error) {
    return (
      <div className="impact-error">
        <FiAlertCircle className="error-icon" />
        <h2>Error Loading Impact Data</h2>
        <p>{error}</p>
        <div className="error-actions">
          <button onClick={handleRefresh} className="retry-btn">
            <FiRefreshCw />
            Try Again
          </button>
          <button 
            onClick={() => setEnvironmentalData(getFallbackData())} 
            className="retry-btn secondary"
          >
            Use Demo Data
          </button>
        </div>
      </div>
    );
  }

  const environmentalMetrics = [
    {
      icon: <FiHeart />,
      title: "Food Waste Prevented",
      value: animatedMetrics.foodWasteAvoided,
      unit: "kg",
      color: "metric-green",
      description: "Total food rescued from going to waste",
    },
    {
      icon: <FiThermometer />,
      title: "CO₂ Emissions Avoided",
      value: animatedMetrics.carbonAvoided,
      unit: "kg CO₂",
      color: "metric-blue",
      description: "Carbon footprint reduced by preventing food waste",
    },
    {
      icon: <FiDroplet />,
      title: "Water Footprint Saved",
      value: animatedMetrics.waterSaved,
      unit: "L",
      color: "metric-cyan",
      description: "Water conserved by rescuing surplus food",
    },
    {
      icon: <FiZap />,
      title: "Energy Conserved",
      value: animatedMetrics.energySaved,
      unit: "MJ",
      color: "metric-orange",
      description: "Energy saved by not producing replacement food",
    },
    {
      icon: <FiRefreshCw />,
      title: "Waste Diversion Rate",
      value: animatedMetrics.diversionRate,
      unit: "%",
      color: "metric-emerald",
      description: "Food successfully diverted from landfills",
    },
    {
      icon: <FiUsers />,
      title: "Community Engagement",
      value: animatedMetrics.communityIndex,
      unit: "%",
      color: "metric-pink",
      description: "Community participation in sustainability efforts",
    },
  ];

  return (
    <div className="impact-container">
      {/* Header with refresh button */}
      <div className="impact-header">
        <div className="impact-header-content">
          <div>
            <h1>Environmental Impact</h1>
            <p>Track your contribution to sustainability and food rescue efforts</p>
          </div>
          <div className="header-actions">
            <div className="impact-summary-badges">
              <div className="impact-badge">
                <FiHeart />
                <span>{animatedMetrics.foodWasteAvoided.toLocaleString()}kg Saved</span>
              </div>
              <div className="impact-badge">
                <FiThermometer />
                <span>{animatedMetrics.carbonAvoided.toLocaleString()}kg CO₂</span>
              </div>
            </div>
            <button onClick={handleRefresh} className="refresh-btn">
              <FiRefreshCw />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <div className="impact-content">
        {/* Main Metrics Grid */}
        <section className="impact-metrics-section" ref={metricsRef}>
          <div className="section-header">
            <h2>Environmental Impact Metrics</h2>
            <p>Real-time tracking of your sustainability contributions</p>
          </div>

          <div className="impact-metrics-grid">
            {environmentalMetrics.map((metric, index) => (
              <div
                key={index}
                className="impact-metric-card"
              >
                <div className="metric-card-header">
                  <div className={`metric-icon-wrapper ${metric.color}`}>
                    {metric.icon}
                  </div>
                </div>
                <div className="metric-card-content">
                  <div className="metric-value">
                    {metric.value.toLocaleString()}
                    <span className="metric-unit">{metric.unit}</span>
                  </div>
                  <h3 className="metric-title">{metric.title}</h3>
                  <p className="metric-description">{metric.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Efficiency & Community Insights */}
        <div className="impact-insights-grid">
          <section className="impact-insight-section">
            <div className="section-header">
              <h3>Efficiency Metrics</h3>
              <p>Optimization and performance insights</p>
            </div>
            <div className="insight-cards">
              <div className="insight-card">
                <div className="insight-icon">
                  <FiClock />
                </div>
                <div className="insight-content">
                  <div className="insight-value">
                    {environmentalData?.efficiency?.freshness?.toFixed(1) || "0"} hrs
                  </div>
                  <div className="insight-label">Avg Freshness</div>
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-icon">
                  <FiTarget />
                </div>
                <div className="insight-content">
                  <div className="insight-value">
                    {((environmentalData?.efficiency?.localityScore || 0) * 100)?.toFixed(0)}%
                  </div>
                  <div className="insight-label">Locality Score</div>
                </div>
              </div>

              <div className="insight-card">
                <div className="insight-icon">
                  <FiMail />
                </div>
                <div className="insight-content">
                  <div className="insight-value">
                    {(environmentalData?.carbonImpact?.digitalFootprint || 0)?.toFixed(3)} kg
                  </div>
                  <div className="insight-label">Digital Footprint</div>
                </div>
              </div>
            </div>
          </section>

          <section className="impact-insight-section">
            <div className="section-header">
              <h3>Community Impact</h3>
              <p>Your role in the larger ecosystem</p>
            </div>
            <div className="community-stats">
              <div className="community-stat">
                <div className="stat-value">
                  {environmentalData?.community?.totalParticipants || "0"}
                </div>
                <div className="stat-label">Active Participants</div>
              </div>
              <div className="community-stat">
                <div className="stat-value">
                  {environmentalData?.community?.completedDonations || "0"}
                </div>
                <div className="stat-label">Successful Donations</div>
              </div>
              <div className="community-stat">
                <div className="stat-value">
                  {animatedMetrics.avgDistance} km
                </div>
                <div className="stat-label">Avg Delivery Distance</div>
              </div>
            </div>
          </section>
        </div>

        {/* Call to Action */}
        <section className="impact-cta">
          <div className="cta-content">
            <FiHeart className="cta-icon" />
            <div className="cta-text">
              <h3>Continue Making an Impact</h3>
              <p>Your next donation could save even more resources and help build a sustainable community</p>
            </div>
            <button
              className="cta-button"
              onClick={() => (window.location.href = "/dashboard")}
            >
              Make Another Donation
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
