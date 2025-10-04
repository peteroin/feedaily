import React, { useState, useEffect, useRef } from "react";
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

export default function LandingPage({ onLoginClick, onGetStartedClick }) {
  const [scrollY, setScrollY] = useState(0);
  const [activeFeature, setActiveFeature] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);
  const [statsInView, setStatsInView] = useState(false);
  const [animatedStats, setAnimatedStats] = useState([0, 0, 0, 0]);
  const featuresContainerRef = useRef(null);
  const statsRef = useRef(null);

  // scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
      
      if (featuresContainerRef.current) {
        const rect = featuresContainerRef.current.getBoundingClientRect();
        const containerTop = rect.top;
        const containerHeight = rect.height;
        const windowHeight = window.innerHeight;
        
        const scrollProgress = Math.max(0, Math.min(1, (windowHeight / 2 - containerTop) / (containerHeight / 2)));
        const featureIndex = Math.min(5, Math.floor(scrollProgress * 6));
        setActiveFeature(featureIndex);
      }

      // Check if stats section is in view
      if (statsRef.current && !statsInView) {
        const rect = statsRef.current.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
          setStatsInView(true);
        }
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [statsInView]);

  // Handle image loading transition
  useEffect(() => {
    setImageLoading(true);
    const timer = setTimeout(() => setImageLoading(false), 300);
    return () => clearTimeout(timer);
  }, [activeFeature]);

  // Animate stats numbers when in view
  useEffect(() => {
    if (statsInView) {
      const targets = [10000, 2000, 500, 50];
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;

      let currentStep = 0;
      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOutQuad = 1 - Math.pow(1 - progress, 3);
        
        setAnimatedStats(targets.map(target => Math.floor(target * easeOutQuad)));

        if (currentStep >= steps) {
          setAnimatedStats(targets);
          clearInterval(interval);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }
  }, [statsInView]);

  // load Google Fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&family=Sora:wght@400;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const headingStyle = { fontFamily: "'Sora', 'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif" };

  // Minimalist grayscale colors for icons and borders
  const grayColors = {
    border: 'border-gray-300',
    bgHover: 'hover:bg-gray-100',
    activeBg: 'bg-white',
    inactiveBg: 'bg-gray-50',
    activeText: 'text-gray-900',
    inactiveText: 'text-gray-500',
    iconColor: 'text-gray-700',
    activeIconColor: 'text-gray-900'
  };

  // Feature images - from your public folder
  const featureImages = [
    "/features/community.png",
    "/features/impact.png",
    "/features/eco.png",
    "/features/reward.png",
    "/features/trust.png",
    "/features/progress.png"
  ];

  const features = [
    { 
      icon: <FiUsers className={`${grayColors.iconColor} w-6 h-6`} />, 
      title: "Community Driven", 
      desc: "Join thousands fighting food waste",
      detailDesc: "Connect with a vibrant community of volunteers, donors, and partners committed to eliminating food waste. Share experiences, organize events, and create lasting impact together.",
    },
    { 
      icon: <FiHeart className={`${grayColors.iconColor} w-6 h-6`} />, 
      title: "Make an Impact", 
      desc: "Every meal saved makes a difference",
      detailDesc: "Track your contributions in real-time and see how every meal rescued helps feed families in need. Your actions create ripples of positive change in communities.",
    },
    { 
      icon: <FiGlobe className={`${grayColors.iconColor} w-6 h-6`} />, 
      title: "Eco Friendly", 
      desc: "Reduce your carbon footprint",
      detailDesc: "Food waste is a major contributor to climate change. By rescuing surplus food, you're not just feeding people—you're protecting our planet for future generations.",
    },
    { 
      icon: <FiAward className={`${grayColors.iconColor} w-6 h-6`} />, 
      title: "Earn Recognition", 
      desc: "Climb the leaderboards",
      detailDesc: "Get rewarded for your contributions with badges, certificates, and public recognition. Top contributors gain special privileges and leadership opportunities.",
    },
    { 
      icon: <FiShield className={`${grayColors.iconColor} w-6 h-6`} />, 
      title: "Safe & Verified", 
      desc: "Quality assured donations",
      detailDesc: "All food donations go through strict quality checks and safety protocols. We ensure that every meal meets health standards before distribution.",
    },
    { 
      icon: <FiTrendingUp className={`${grayColors.iconColor} w-6 h-6`} />, 
      title: "Track Progress", 
      desc: "Monitor your impact in real-time",
      detailDesc: "View detailed analytics of your contributions, see trends over time, and measure your environmental impact with comprehensive dashboards and reports.",
    }
  ];

  const stats = [
    { number: "10K+", label: "Meals Saved", value: 10000 },
    { number: "2K+", label: "Active Users", value: 2000 },
    { number: "500+", label: "Partners", value: 500 },
    { number: "50+", label: "Communities", value: 50 }
  ];

  const partners = [
    "World Food Programme",
    "Akshay Patra Foundation",
    "Feeding India",
    "Robin Hood Army"
  ];

  return (
    <div
      className="landing-page bg-white text-gray-900"
      style={{ fontFamily: "'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif" }}
    >
      {/* Navigation */}
      <nav 
        className={`fixed w-full z-50 bg-white/95 backdrop-blur-sm ${scrollY > 50 ? 'shadow-sm' : ''}`}
        style={{ borderBottom: "1px solid #e5e7eb" }}   
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2">
          <div className="brand-name text-2xl sm:text-3xl font-bold tracking-wide text-gray-900">
            feedaily
          </div>

          <div className="nav-buttons flex items-center gap-4">
            <button
              onClick={onLoginClick}
              className={`text-sm sm:text-base px-4 sm:px-5 py-2 sm:py-2.5 rounded-md border ${grayColors.border} bg-white ${grayColors.activeText} hover:bg-gray-900 hover:text-white transition`}
              style={{ cursor: 'pointer' }}
            >
              Login
            </button>

            <button
              onClick={onGetStartedClick}
              className={`text-sm sm:text-base px-4 sm:px-5 py-2 sm:py-2.5 rounded-md bg-gray-900 text-white border ${grayColors.border} hover:bg-white hover:text-gray-900 transition`}
              style={{ cursor: 'pointer' }}
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* CONTENT WRAPPER */}
      <div className="pt-16">
        {/* Hero Section */}
        <section className="hero-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="hero-content">
              <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight" style={headingStyle}>
                Rescue food,<br />
                <span className="hero-highlight text-gray-900">reduce waste</span>
              </h1>

              <p className="hero-description mt-4 text-gray-600 max-w-xl">
                Join the movement to eliminate food waste and feed communities in need. Every plate matters in our mission to create a sustainable future.
              </p>

              <div className="hero-buttons mt-6 flex flex-wrap gap-3">
                <button
                  onClick={onGetStartedClick}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-gray-900 text-white font-medium hover:bg-gray-700 transition"
                  style={{ cursor: 'pointer' }}
                >
                  Start Your Journey <FiArrowRight />
                </button>

                <button
                  onClick={onLoginClick}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-gray-300 bg-white text-gray-900 hover:bg-gray-50 transition"
                  style={{ cursor: 'pointer' }}
                >
                  Learn More
                </button>
              </div>
            </div>

            <div className="hero-image-container flex justify-center lg:justify-end">
              <div 
                className="hero-image-wrapper w-64 sm:w-80 lg:w-96 transition-all duration-300"
                style={{
                  transform: `translateY(${scrollY * 0.3}px) scale(${Math.max(0.85, 1 - scrollY * 0.0003)})`,
                  opacity: Math.max(0.3, 1 - scrollY * 0.002)
                }}
              >
                <img
                  src="https://static.vecteezy.com/system/resources/thumbnails/016/733/232/small_2x/hand-drawn-fried-chicken-rice-or-thai-food-illustration-png.png"
                  alt="Food illustration"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* About Us */}
        <section className="about-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="about-container">
            <h2 className="section-title text-2xl font-semibold" style={headingStyle}>About Feedaily</h2>
            <div className="about-content mt-4">
              <p className="about-text text-gray-600 max-w-3xl">
                Feedaily is a registered NGO dedicated to rescuing surplus food and redistributing it to those in need. Our mission is to build a sustainable ecosystem by connecting communities, donors, and partners, and making a lasting impact on hunger and the environment.
              </p>
              <p className="about-meta mt-3 text-sm text-gray-400">
                Registration No: NGO/2023/IND/09845 &nbsp; | &nbsp; Established 2023
              </p>
            </div>
          </div>
        </section>

        {/* Features Section with Scroll Animation */}
        <section 
          ref={featuresContainerRef}
          className="features-section py-12"
          style={{ minHeight: '0vh' }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold" style={headingStyle}>Why feedaily matters?</h2>
              <p className="text-gray-600 mt-2">our features</p>
            </div>

            {/* Feature display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Left side - Feature cards list */}
              <div className="space-y-2">
                {features.map((feature, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-xl border transition-all duration-300 cursor-pointer ${
                      activeFeature === index
                        ? `${grayColors.activeBg} ${grayColors.border} shadow-lg`
                        : `${grayColors.inactiveBg} border-gray-200 opacity-60`
                    }`}
                    onClick={() => setActiveFeature(index)}
                  >
                    <div className="flex items-center gap-3">
                      {/* Minimalist icon without colored background */}
                      <div className={`w-8 h-8 flex items-center justify-center ${
                        activeFeature === index ? grayColors.activeIconColor : grayColors.iconColor
                      }`}>
                        {feature.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className={`font-semibold text-base ${activeFeature === index ? grayColors.activeText : grayColors.inactiveText}`} style={headingStyle}>{feature.title}</h3>
                        <p className="text-xs text-gray-500">{feature.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right side - Full image display with progress indicator */}
              <div className="rounded-3xl h-[420px] flex flex-col justify-end relative overflow-hidden">
                {/* Loading indicator with dashes */}
                {imageLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                    <div className="flex gap-2">
                      <div className="w-8 h-1 bg-gray-300 rounded animate-pulse" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-8 h-1 bg-gray-300 rounded animate-pulse" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-8 h-1 bg-gray-300 rounded animate-pulse" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                )}
                
                {/* Full cover image - contains within bounds */}
                <img 
                  src={featureImages[activeFeature]} 
                  alt={features[activeFeature].title}
                  className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-500 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={() => setImageLoading(false)}
                  onError={(e) => { 
                    e.target.src = 'https://via.placeholder.com/600x500/e5e5e5/666?text=Image+Not+Found';
                    setImageLoading(false);
                  }}
                />

                {/* Progress indicator at bottom */}
                <div className="relative z-10 pb-4 flex gap-2 justify-center">
                  {features.map((_, index) => (
                    <div
                      key={index}
                      className={`h-0.5 w-8 rounded transition-all duration-500 ${
                        index === activeFeature ? 'bg-gray-900 w-12' : 'bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Partners Section */}
        <section className="partners-section max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h3 className="text-lg font-semibold text-center mb-6" style={headingStyle}>Our Trusted Partners</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
            {partners.map((partner, i) => (
              <div key={i} className="flex items-center justify-center py-4 px-3 bg-white rounded-lg border border-gray-200 shadow-sm text-sm text-gray-700">
                {partner}
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section */}
        <section ref={statsRef} className="stats-section bg-gray-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold" style={headingStyle}>Our Impact</h2>
              <p className="text-gray-600 mt-2">making a difference together</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div 
                  key={idx} 
                  className="bg-white rounded-xl p-6 flex flex-col items-center justify-center min-h-[110px] shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-300"
                >
                  <div className="text-3xl sm:text-4xl font-extrabold text-gray-900" style={headingStyle}>
                    {statsInView ? (
                      idx === 0 ? `${(animatedStats[idx] / 1000).toFixed(1)}K+` :
                      idx === 1 ? `${(animatedStats[idx] / 1000).toFixed(1)}K+` :
                      `${animatedStats[idx]}+`
                    ) : '0'}
                  </div>
                  <div className="text-sm text-gray-600 mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta-section bg-gray-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
            <h2 className="text-2xl font-semibold text-white" style={headingStyle}>Ready to make a difference?</h2>
            <p className="text-gray-300 mt-2">Join thousands of volunteers and partners — rescue food and help communities.</p>
            <div className="mt-4">
              <button 
                onClick={onGetStartedClick} 
                className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-white text-gray-900 font-medium hover:bg-gray-100 transition"
                style={{ cursor: 'pointer' }}
              >
                Start Your Journey <FiArrowRight />
              </button>
            </div>
          </div>
        </section>

        {/* Contact details */}
        <section className="contact-section">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <h3 className="text-center text-xl font-semibold mb-4" style={headingStyle}>Contact Details</h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
              <div className="bg-white p-3 rounded-lg">
                <FiMail className="mx-auto text-xl text-gray-900 mb-2" />
                <div className="text-sm text-gray-700">contact@feedaily.org</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <FiPhone className="mx-auto text-xl text-gray-900 mb-2" />
                <div className="text-sm text-gray-700">+91 98765 43210</div>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <FiMapPin className="mx-auto text-xl text-gray-900 mb-2" />
                <div className="text-sm text-gray-700">Feedaily NGO, Bengaluru, India</div>
              </div>
            </div>

            <div className="text-center mt-4 text-sm text-gray-500">
              Follow us: <a href="#" className="underline">Instagram</a> &nbsp;|&nbsp; <a href="#" className="underline">Twitter</a> &nbsp;|&nbsp; <a href="#" className="underline">Facebook</a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer bg-white border-t border-gray-200">
          <div className="max-w-6xl mx-auto px-6 py-8 text-center">
            <p className="text-sm text-gray-600">© 2025 Feedaily. Making a difference, one meal at a time.</p>
            <p className="text-xs text-gray-400 mt-1">Registered NGO | All donations eligible for tax exemption under Section 80G, Government of India.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}