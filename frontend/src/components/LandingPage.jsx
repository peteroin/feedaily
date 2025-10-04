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

export default function LandingPage({ onLoginClick, onGetStartedClick }) {
  const [hoveredFeature, setHoveredFeature] = useState(null);
  const [scrollY, setScrollY] = useState(0);

  // scroll listener (unchanged)
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // load Google Fonts (Poppins for body, Sora for headings in future we can move this section to index.html) 
  // body font =Poppins and headings = Sora
  
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&family=Sora:wght@400;600;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  // small helper style for headings (Sora)
  const headingStyle = { fontFamily: "'Sora', 'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif" };

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
    
    <div
      className="landing-page bg-white text-slate-900"
      style={{ fontFamily: "'Poppins', system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif" }}
    >

      {/* Navigation */}
      <nav 
  className={`fixed w-full z-50 bg-white/95 backdrop-blur-sm ${scrollY > 50 ? 'shadow-sm' : ''}`}
  style={{ borderBottom: "1px solid #e5e7eb" }}   
>

        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 py-2">
          <div className="brand-name text-2xl sm:text-3xl font-bold tracking-wide text-black">
            feedaily
          </div>

          <div className="nav-buttons flex items-center gap-4">
            <button
              onClick={onLoginClick}
              className="text-sm sm:text-base px-4 sm:px-5 py-2 sm:py-2.5 rounded-md border border-black bg-white text-black hover:bg-black hover:text-white transition"
            >
              Login
            </button>

            <button
              onClick={onGetStartedClick}
              className="text-sm sm:text-base px-4 sm:px-5 py-2 sm:py-2.5 rounded-md bg-black text-white border border-black hover:bg-white hover:text-black transition"
            >
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* CONTENT WRAPPER (offset for fixed nav) */}
      <div className="pt-16">

        {/* Hero Section */}
        <section className="hero-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            {/* Left: text */}
            <div className="hero-content">
              <h1 className="hero-title text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight" style={headingStyle}>
                Rescue food,<br />
                <span className="hero-highlight text-slate-900">reduce waste</span>
              </h1>

              <p className="hero-description mt-4 text-slate-600 max-w-xl">
                Join the movement to eliminate food waste and feed communities in need. Every plate matters in our mission to create a sustainable future.
              </p>

              <div className="hero-buttons mt-6 flex flex-wrap gap-3">
                <button
                  onClick={onGetStartedClick}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-black text-white font-medium hover:bg-slate-800 transition"
                >
                  Start Your Journey <FiArrowRight />
                </button>

                <button
                  onClick={onLoginClick}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-slate-200 bg-white text-slate-900 hover:bg-slate-50 transition"
                >
                  Learn More
                </button>
              </div>
            </div>

            {/* Right: image - stays on right on large screens, centered on small screens */}
            <div className="hero-image-container flex justify-center lg:justify-end">
              <div className="hero-image-wrapper w-64 sm:w-80 lg:w-96">
                <img
                  src="https://static.vecteezy.com/system/resources/thumbnails/016/733/232/small_2x/hand-drawn-fried-chicken-rice-or-thai-food-illustration-png.png"
                  alt="Food illustration"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="section-divider max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border-b border-slate-100" />
        </div>

        {/* About Us */}
        <section className="about-section max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="about-container">
            <h2 className="section-title text-2xl font-semibold" style={headingStyle}>About Feedaily</h2>
            <div className="about-content mt-4">
              <p className="about-text text-slate-600 max-w-3xl">
                Feedaily is a registered NGO dedicated to rescuing surplus food and redistributing it to those in need. Our mission is to build a sustainable ecosystem by connecting communities, donors, and partners, and making a lasting impact on hunger and the environment.
              </p>
              <p className="about-meta mt-3 text-sm text-slate-400">
                Registration No: NGO/2023/IND/09845 &nbsp; | &nbsp; Established 2023
              </p>
            </div>
          </div>
        </section>

        {/* Features Section - centered, cards with slightly grey background */}
        <section className="features-section max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold" style={headingStyle}>Why Choose Feedaily?</h2>
            <p className="text-slate-600 mt-2">A simple, secure, and community-first platform to rescue surplus food.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 place-items-center">
            {features.map((feature, index) => (
              <div
                key={index}
                onMouseEnter={() => setHoveredFeature(index)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={`w-full max-w-xs p-6 rounded-xl bg-slate-50 border border-slate-100 text-center transform transition-all ${hoveredFeature === index ? 'scale-105 shadow-xl' : 'shadow-sm'}`}
              >
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-white mx-auto mb-4 text-2xl text-slate-900">
                  {feature.icon}
                </div>
                <h3 className="font-semibold mb-2" style={headingStyle}>{feature.title}</h3>
                <p className="text-sm text-slate-500">{feature.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Partners Section */}
        <section className="partners-section max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <h3 className="text-lg font-semibold text-center mb-6" style={headingStyle}>Our Trusted Partners</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 items-center">
            {partners.map((partner, i) => (
              <div key={i} className="flex items-center justify-center py-4 px-3 bg-white rounded-lg border border-slate-100 shadow-sm text-sm text-slate-700">
                {partner}
              </div>
            ))}
          </div>
        </section>

        {/* Stats Section  */}
        <section className="stats-section bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, idx) => (
                <div key={idx} className="bg-white rounded-xl p-6 flex flex-col items-center justify-center min-h-[110px] shadow-sm border border-slate-100">
                  <div className="text-3xl sm:text-4xl font-extrabold text-black">{stat.number}</div>
                  <div className="text-sm text-slate-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section*/}
        <section className="cta-section bg-slate-900">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 text-center">
            <h2 className="text-2xl font-semibold text-white" style={headingStyle}>Ready to make a difference?</h2>
            <p className="text-slate-300 mt-2">Join thousands of volunteers and partners — rescue food and help communities.</p>
            <div className="mt-4">
              <button onClick={onGetStartedClick} className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-white text-slate-900 font-medium">
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
              <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                <FiMail className="mx-auto text-xl text-slate-900 mb-2" />
                <div className="text-sm text-slate-700">contact@feedaily.org</div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                <FiPhone className="mx-auto text-xl text-slate-900 mb-2" />
                <div className="text-sm text-slate-700">+91 98765 43210</div>
              </div>
              <div className="bg-white p-3 rounded-lg shadow-sm border border-slate-100">
                <FiMapPin className="mx-auto text-xl text-slate-900 mb-2" />
                <div className="text-sm text-slate-700">Feedaily NGO, Bengaluru, India</div>
              </div>
            </div>

            <div className="text-center mt-4 text-sm text-slate-500">
              Follow us: <a href="#" className="underline">Instagram</a> &nbsp;|&nbsp; <a href="#" className="underline">Twitter</a> &nbsp;|&nbsp; <a href="#" className="underline">Facebook</a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="landing-footer bg-white border-t border-slate-100">
          <div className="max-w-6xl mx-auto px-6 py-8 text-center">
            <p className="text-sm text-slate-600">© 2025 Feedaily. Making a difference, one meal at a time.</p>
            <p className="text-xs text-slate-400 mt-1">Registered NGO | All donations eligible for tax exemption under Section 80G, Government of India.</p>
          </div>
        </footer>

      </div>
    </div>
  );
}
