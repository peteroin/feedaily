import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  FiCheckCircle, 
  FiArrowRight, 
  FiHome, 
  FiUser,
  FiClock,
  FiGift
} from "react-icons/fi";

export default function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [paymentDetails, setPaymentDetails] = useState(null);

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
      .then(data => {
        console.log(data.message);
        if (data.paymentDetails) {
          setPaymentDetails(data.paymentDetails);
        }
      })
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
    <div className="payment-success-container">
      {/* Animated Background */}
      <div className="background-animation">
        <div className="floating-circle circle-1"></div>
        <div className="floating-circle circle-2"></div>
        <div className="floating-circle circle-3"></div>
      </div>

      {/* Main Content */}
      <div className="success-card">
        {/* Success Icon */}
        <div className="success-icon">
          <div className="icon-circle">
            <FiCheckCircle />
          </div>
          <div className="confetti">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="confetti-piece"></div>
            ))}
          </div>
        </div>

        {/* Success Message */}
        <div className="success-content">
          <h1>Payment Successful!</h1>
          <p className="success-message">
            Thank you for your payment. Your delivery has been confirmed and is being processed.
          </p>

          {/* Payment Details */}
          {paymentDetails && (
            <div className="payment-details">
              <div className="detail-item">
                <span className="detail-label">Amount Paid:</span>
                <span className="detail-value">₹{paymentDetails.amount}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Transaction ID:</span>
                <span className="detail-value">{paymentDetails.transactionId}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Date:</span>
                <span className="detail-value">
                  {new Date(paymentDetails.date).toLocaleDateString()}
                </span>
              </div>
            </div>
          )}

          {/* Delivery Info */}
          <div className="delivery-info">
            <div className="info-card">
              <FiGift className="info-icon" />
              <div className="info-content">
                <h3>Delivery Scheduled</h3>
                <p>Your food will be delivered within 24 hours</p>
              </div>
            </div>
          </div>

          {/* Countdown */}
          <div className="countdown">
            <FiClock className="countdown-icon" />
            <span>
              Redirecting in <strong>{secondsLeft}</strong> second{secondsLeft !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="action-buttons">
            <button
              onClick={() => navigate("/profile")}
              className="primary-button"
            >
              <FiUser />
              View My Profile
              <FiArrowRight />
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="secondary-button"
            >
              <FiHome />
              Go to Dashboard
            </button>
          </div>

          {/* Support Info */}
          <div className="support-info">
            <p>Need help? Contact support@feedaily.com</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .payment-success-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          position: relative;
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }

        .background-animation {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
        }

        .floating-circle {
          position: absolute;
          border-radius: 50%;
          opacity: 0.1;
          animation: float 6s ease-in-out infinite;
        }

        .circle-1 {
          width: 200px;
          height: 200px;
          background: #4f46e5;
          top: 10%;
          left: 10%;
          animation-delay: 0s;
        }

        .circle-2 {
          width: 150px;
          height: 150px;
          background: #10b981;
          top: 60%;
          right: 15%;
          animation-delay: 2s;
        }

        .circle-3 {
          width: 100px;
          height: 100px;
          background: #f59e0b;
          bottom: 20%;
          left: 20%;
          animation-delay: 4s;
        }

        .success-card {
          background: white;
          border-radius: 24px;
          padding: 48px;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
          text-align: center;
          max-width: 500px;
          width: 100%;
          position: relative;
          z-index: 2;
          animation: slideUp 0.6s ease-out;
        }

        .success-icon {
          position: relative;
          margin-bottom: 32px;
        }

        .icon-circle {
          width: 100px;
          height: 100px;
          background: linear-gradient(135deg, #10b981 0%, #34d399 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto;
          color: white;
          font-size: 3rem;
          position: relative;
          z-index: 2;
        }

        .confetti {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 120px;
          height: 120px;
          z-index: 1;
        }

        .confetti-piece {
          position: absolute;
          width: 8px;
          height: 8px;
          background: linear-gradient(45deg, #f59e0b, #ef4444, #8b5cf6, #3b82f6);
          border-radius: 1px;
          animation: confetti 1s ease-out forwards;
        }

        ${[...Array(12)].map((_, i) => `
          .confetti-piece:nth-child(${i + 1}) {
            transform: rotate(${i * 30}deg);
            animation-delay: ${i * 0.1}s;
          }
        `).join('')}

        .success-content h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1f2937;
          margin: 0 0 16px 0;
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .success-message {
          font-size: 1.1rem;
          color: #6b7280;
          line-height: 1.6;
          margin: 0 0 32px 0;
        }

        .payment-details {
          background: #f9fafb;
          border-radius: 16px;
          padding: 24px;
          margin: 0 0 24px 0;
          border: 1px solid #e5e7eb;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .detail-item:last-child {
          margin-bottom: 0;
        }

        .detail-label {
          font-weight: 600;
          color: #374151;
        }

        .detail-value {
          color: #4f46e5;
          font-weight: 700;
        }

        .delivery-info {
          margin: 0 0 24px 0;
        }

        .info-card {
          display: flex;
          align-items: center;
          gap: 16px;
          background: #f0f9ff;
          border: 1px solid #bae6fd;
          border-radius: 12px;
          padding: 16px;
        }

        .info-icon {
          color: #0369a1;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .info-content h3 {
          margin: 0 0 4px 0;
          color: #0369a1;
          font-size: 1rem;
        }

        .info-content p {
          margin: 0;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .countdown {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #6b7280;
          margin: 0 0 32px 0;
          font-size: 1rem;
        }

        .countdown-icon {
          color: #f59e0b;
        }

        .countdown strong {
          color: #4f46e5;
          font-weight: 700;
        }

        .action-buttons {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin: 0 0 24px 0;
        }

        .primary-button, .secondary-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 16px 24px;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .primary-button {
          background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
          color: white;
        }

        .primary-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(79, 70, 229, 0.3);
        }

        .secondary-button {
          background: white;
          color: #4f46e5;
          border: 2px solid #4f46e5;
        }

        .secondary-button:hover {
          background: #4f46e5;
          color: white;
        }

        .support-info {
          border-top: 1px solid #e5e7eb;
          padding-top: 24px;
        }

        .support-info p {
          margin: 0;
          color: #9ca3af;
          font-size: 0.9rem;
        }

        /* Animations */
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }

        @keyframes slideUp {
          0% { transform: translateY(30px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }

        @keyframes confetti {
          0% { 
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 0;
          }
          50% { 
            transform: translate(var(--tx), var(--ty)) rotate(var(--r)) scale(1.2);
            opacity: 1;
          }
          100% { 
            transform: translate(var(--tx), var(--ty)) rotate(var(--r)) scale(1);
            opacity: 0;
          }
        }

        ${[...Array(12)].map((_, i) => {
          const angle = (i * 30) * (Math.PI / 180);
          const distance = 60;
          const tx = Math.cos(angle) * distance;
          const ty = Math.sin(angle) * distance;
          const rotation = (i % 2 === 0 ? 180 : -180);
          
          return `
            .confetti-piece:nth-child(${i + 1}) {
              --tx: ${tx}px;
              --ty: ${ty}px;
              --r: ${rotation}deg;
            }
          `;
        }).join('')}

        /* Responsive Design */
        @media (max-width: 640px) {
          .payment-success-container {
            padding: 16px;
          }

          .success-card {
            padding: 32px 24px;
          }

          .success-content h1 {
            font-size: 2rem;
          }

          .icon-circle {
            width: 80px;
            height: 80px;
            font-size: 2.5rem;
          }

          .confetti {
            width: 100px;
            height: 100px;
          }

          .action-buttons {
            flex-direction: column;
          }
        }

        @media (max-width: 480px) {
          .success-card {
            padding: 24px 16px;
          }

          .payment-details {
            padding: 16px;
          }

          .info-card {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}