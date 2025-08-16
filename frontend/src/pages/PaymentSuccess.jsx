import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [secondsLeft, setSecondsLeft] = useState(200);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const sessionId = params.get('session_id');

    if (sessionId) {
      fetch("http://localhost:5000/api/payment-success", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      })
      .then(res => res.json())
      .then(data => console.log(data.message))
      .catch(err => console.error("Payment success error:", err));
    }

    const interval = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          navigate("/profile");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [location, navigate]);

  return (
    <div style={{
      textAlign: "center",
      marginTop: 80,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      color: "#333",
      padding: "20px",
      maxWidth: 400,
      marginLeft: "auto",
      marginRight: "auto",
      borderRadius: 10,
      boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
      backgroundColor: "#f7f9fc"
    }}>
      <h1 style={{ fontSize: "2.5rem", color: "#4caf50" }}>✅ Payment Successful!</h1>
      <p style={{ fontSize: "1.2rem", margin: "15px 0" }}>Thank you for your payment.</p>
      <p style={{ fontSize: "1rem", marginBottom: "20px" }}>
        Redirecting to the Dashboard in <strong>{secondsLeft}</strong> second{secondsLeft !== 1 ? "s" : ""}.
      </p>
      <button
        onClick={() => navigate("/profile")}
        style={{
          padding: "12px 30px",
          fontSize: "1rem",
          borderRadius: 25,
          border: "none",
          backgroundColor: "#4caf50",
          color: "white",
          cursor: "pointer",
          boxShadow: "0 4px 12px rgba(76, 175, 80, 0.3)",
          transition: "background-color 0.3s ease"
        }}
        onMouseEnter={e => (e.target.style.backgroundColor = "#43a047")}
        onMouseLeave={e => (e.target.style.backgroundColor = "#4caf50")}
      >
        Go to Dashboard Now
      </button>
    </div>
  );
}
