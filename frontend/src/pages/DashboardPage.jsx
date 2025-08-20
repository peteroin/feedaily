// DashboardPage.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import TMImagePredictor from '../components/TMImagePredictor';
import { 
  FiCamera, 
  FiRefreshCw, 
  FiMapPin, 
  FiClock, 
  FiUser, 
  FiPhone,
  FiMail,
  FiPlus,
  FiCheck,
  FiTruck,
  FiPackage,
  FiCreditCard,
  FiX
} from "react-icons/fi";
import "./DashboardPage.css";

export default function DashboardPage() {
  const [donorName, setDonorName] = useState("");
  const [contact, setContact] = useState("");
  const [foodType, setFoodType] = useState("");
  const [quantity, setQuantity] = useState("");
  const [freshness, setFreshness] = useState("");
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState("");
  const [donations, setDonations] = useState([]);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isCameraOn, setIsCameraOn] = useState(false);
  const webcamRef = useRef(null);
  const [location, setLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Delivery/payment states
  const [deliveryMethodChoice, setDeliveryMethodChoice] = useState(null);
  const [currentRequestDonationId, setCurrentRequestDonationId] = useState(null);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingDeliveryDonId, setPendingDeliveryDonId] = useState(null);
  const [deliveryCharge, setDeliveryCharge] = useState(50);
  const storedUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user"));
      if (storedUser) {
        setDonorName(storedUser.name || "");
        setContact(storedUser.contact || "");
      }
    } catch (error) {
      console.error("Error parsing user from localStorage:", error);
    }
  }, []);

  const videoConstraints = {
    width: 320,
    height: 240,
    facingMode: "user",
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setIsCameraOn(false);
    }
  }, [webcamRef]);

  const fetchDonations = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`http://localhost:5000/api/donations`);
      const data = await res.json();
      setDonations(data);
    } catch (err) {
      console.error("Failed to fetch donations:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (!donorName || !contact || !foodType || !quantity || !freshness) {
      setMessage("Please fill all required fields.");
      setIsLoading(false);
      return;
    }

    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported by your browser.");
      setIsLoading(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const coords = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(coords);
        const storedUser = JSON.parse(localStorage.getItem("user"));
        const res = await fetch("http://localhost:5000/api/donate-food", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: storedUser?.id,
            donorName,
            contact,
            foodType,
            quantity,
            freshness: parseInt(freshness, 10),
            notes,
            image: capturedImage,
            locationLat: coords.lat,
            locationLng: coords.lng,
          }),
        });

        const data = await res.json();
        setMessage(data.message);
        if (res.ok) {
          setDonorName("");
          setContact("");
          setFoodType("");
          setQuantity("");
          setFreshness("");
          setNotes("");
          setCapturedImage(null);
          setLocation(null);
          fetchDonations();
        }
        setIsLoading(false);
      },
      () => {
        setMessage("Location permission denied or error getting location.");
        setIsLoading(false);
      }
    );
  };

  const openRequestChoice = (donationId) => {
    setCurrentRequestDonationId(donationId);
    setDeliveryMethodChoice(null);
  };

  const confirmRequest = async () => {
    if (!deliveryMethodChoice) {
      alert("Please select delivery or pickup.");
      return;
    }

    if (!navigator.geolocation) {
      alert("Geolocation not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const storedUser = JSON.parse(localStorage.getItem("user"));
        if (!storedUser) {
          alert("Please login to request food.");
          return;
        }

        const payload = {
          requesterId: storedUser.id,
          requesterLat: position.coords.latitude,
          requesterLng: position.coords.longitude,
          deliveryMethod: deliveryMethodChoice,
        };

        if (deliveryMethodChoice === "delivery") {
          const res = await fetch(`http://localhost:5000/api/request-food/${currentRequestDonationId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          alert(data.message);
          if (res.ok) {
            setPendingDeliveryDonId(currentRequestDonationId);
            setShowPayment(true);
          }
          setCurrentRequestDonationId(null);
          setDeliveryMethodChoice(null);
          fetchDonations();
          return;
        }

        if (deliveryMethodChoice === "pickup") {
          const res = await fetch(`http://localhost:5000/api/request-food/${currentRequestDonationId}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          const data = await res.json();
          alert(data.message);
          if (res.ok) fetchDonations();
          setCurrentRequestDonationId(null);
          setDeliveryMethodChoice(null);
        }
      },
      () => {
        alert("Location permission denied or error getting location.");
      }
    );
  };

  const handleStripePayment = async () => {
    const res = await fetch("http://localhost:5000/api/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        amount: deliveryCharge,
        productName: "Delivery Charge",
        donationId: pendingDeliveryDonId,
        receiverEmail: storedUser?.email
      }),
    });
    const data = await res.json();
    if (data.url) {
      window.location = data.url;
    } else {
      alert("Could not start payment. Try again.");
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          <span className="dashboard-icon">🍽</span>
          Feedaily Dashboard
        </h1>
        <p className="dashboard-subtitle">Make a difference with every donation</p>
      </div>

      <div className="dashboard-content">
        {/* Stats Overview */}
        <div className="stats-overview">
          <div className="stat-card">
            <div className="stat-icon">
              <FiPackage />
            </div>
            <div className="stat-content">
              <h3>{donations.length}</h3>
              <p>Active Donations</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FiUser />
            </div>
            <div className="stat-content">
              <h3>{donations.filter(d => d.status === "Requested").length}</h3>
              <p>Requests Made</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">
              <FiCheck />
            </div>
            <div className="stat-content">
              <h3>{donations.filter(d => d.status === "Completed").length}</h3>
              <p>Successful Donations</p>
            </div>
          </div>
        </div>

        <div className="dashboard-grid">
          {/* Form Section */}
          <div className="form-section">
            <div className="section-header">
              <h2>Add Food Donation</h2>
              <p>Share your surplus food with those in need</p>
            </div>

            {message && (
              <div className={`message ${message.includes("success") ? "success" : "error"}`}>
                {message}
              </div>
            )}

            <form onSubmit={handleSubmit} className="donation-form">
              <div className="form-group">
                <label>Your Name</label>
                <div className="input-with-icon">
                  <FiUser />
                  <input 
                    type="text" 
                    value={donorName} 
                    readOnly 
                    className="readonly-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Contact Information</label>
                <div className="input-with-icon">
                  <FiPhone />
                  <input 
                    type="text" 
                    value={contact} 
                    readOnly 
                    className="readonly-input"
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Food Type *</label>
                <div className="input-with-icon">
                  <FiPackage />
                  <input
                    type="text"
                    placeholder="e.g., Pizza, Rice, Sandwiches"
                    value={foodType}
                    onChange={(e) => setFoodType(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Quantity *</label>
                  <input
                    type="text"
                    placeholder="e.g., 5 plates, 2kg"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Freshness (hours) *</label>
                  <input
                    type="number"
                    placeholder="Hours"
                    value={freshness}
                    onChange={(e) => setFreshness(e.target.value)}
                    min="0"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Additional Notes</label>
                <textarea
                  placeholder="Pickup instructions, special notes, etc."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Food Image</label>
                <div className="webcam-container">
                  {!capturedImage ? (
                    isCameraOn ? (
                      <div className="camera-active">
                        <Webcam
                          audio={false}
                          height={240}
                          ref={webcamRef}
                          screenshotFormat="image/jpeg"
                          width={320}
                          videoConstraints={videoConstraints}
                          mirrored
                          className="webcam-feed"
                        />
                        <button
                          type="button"
                          onClick={capture}
                          className="capture-btn primary"
                        >
                          <FiCamera />
                          Capture Image
                        </button>
                      </div>
                    ) : (
                      <button 
                        type="button" 
                        onClick={() => setIsCameraOn(true)}
                        className="capture-btn secondary"
                      >
                        <FiCamera />
                        Open Camera
                      </button>
                    )
                  ) : (
                    <div className="captured-content">
                      <img src={capturedImage} alt="Captured" className="captured-image" />
                      <div className="capture-actions">
                        <button
                          type="button"
                          onClick={() => {
                            setCapturedImage(null);
                            setIsCameraOn(true);
                          }}
                          className="capture-btn secondary"
                        >
                          <FiRefreshCw />
                          Retake
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                <TMImagePredictor imageSrc={capturedImage} />
              </div>

              <button 
                type="submit" 
                className="submit-btn"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="loading-spinner"></div>
                ) : (
                  <>
                    <FiPlus />
                    Submit Donation
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Donations List */}
          <div className="list-section">
            <div className="section-header">
              <h2>Available Donations</h2>
              <button onClick={fetchDonations} className="refresh-btn">
                <FiRefreshCw />
                Refresh
              </button>
            </div>

            {isLoading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading donations...</p>
              </div>
            ) : donations.length === 0 ? (
              <div className="empty-state">
                <FiPackage className="empty-icon" />
                <h3>No donations available</h3>
                <p>Be the first to share food with your community!</p>
              </div>
            ) : (
              <div className="donations-grid">
                {donations
                  .filter(donation => donation.status !== "Expired")
                  .map((donation) => (
                    <div key={donation.id} className="donation-card">
                      <div className="donation-header">
                        <h3>{donation.foodType}</h3>
                        <span className={`status-badge ${donation.status?.toLowerCase()}`}>
                          {donation.status}
                        </span>
                      </div>
                      
                      <div className="donation-details">
                        <div className="detail-item">
                          <FiPackage />
                          <span>{donation.quantity}</span>
                        </div>
                        <div className="detail-item">
                          <FiClock />
                          <span>Fresh for {donation.freshness} hours</span>
                        </div>
                        <div className="detail-item">
                          <FiUser />
                          <span>{donation.donorName}</span>
                        </div>
                        <div className="detail-item">
                          <FiPhone />
                          <span>{donation.contact}</span>
                        </div>
                      </div>

                      {donation.notes && (
                        <div className="donation-notes">
                          <p>{donation.notes}</p>
                        </div>
                      )}

                      {donation.image && (
                        <img src={donation.image} alt="Donation" className="donation-image" />
                      )}

                      <div className="donation-location">
                        <div className="detail-item">
                          <FiMapPin />
                          {donation.locationName ? (
                            <span>{donation.locationName}</span>
                          ) : donation.locationLat && donation.locationLng ? (
                            <span>Lat {donation.locationLat.toFixed(4)}, Lng {donation.locationLng.toFixed(4)}</span>
                          ) : (
                            <span>Location not provided</span>
                          )}
                        </div>
                        {donation.locationLat && donation.locationLng && (
                          <button
                            onClick={() => {
                              const url = `https://www.google.com/maps/search/?api=1&query=${donation.locationLat},${donation.locationLng}`;
                              window.open(url, "_blank");
                            }}
                            className="map-btn"
                          >
                            <FiMapPin />
                            View Map
                          </button>
                        )}
                      </div>

                      <div className="donation-footer">
                        <span className="donation-date">
                          {new Date(donation.createdAt).toLocaleString()}
                        </span>
                        
                        {donation.status === "Expired" ? (
                          <span className="expired-text">Expired</span>
                        ) : donation.status === "Available" ? (
                          <button 
                            onClick={() => openRequestChoice(donation.id)}
                            className="request-btn"
                          >
                            Request Food
                          </button>
                        ) : (
                          <span className="requested-text">Already Requested</span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delivery selection modal */}
      {currentRequestDonationId && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Choose Delivery Method</h3>
              <button 
                onClick={() => {
                  setCurrentRequestDonationId(null);
                  setDeliveryMethodChoice(null);
                }}
                className="modal-close"
              >
                <FiX />
              </button>
            </div>
            
            <div className="delivery-options">
              <label className={`delivery-option ${deliveryMethodChoice === "delivery" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="delivery"
                  checked={deliveryMethodChoice === "delivery"}
                  onChange={() => setDeliveryMethodChoice("delivery")}
                />
                <div className="option-content">
                  <FiTruck className="option-icon" />
                  <div>
                    <h4>Delivery</h4>
                    <p>We'll deliver it to you (₹{deliveryCharge})</p>
                  </div>
                </div>
              </label>

              <label className={`delivery-option ${deliveryMethodChoice === "pickup" ? "selected" : ""}`}>
                <input
                  type="radio"
                  name="deliveryMethod"
                  value="pickup"
                  checked={deliveryMethodChoice === "pickup"}
                  onChange={() => setDeliveryMethodChoice("pickup")}
                />
                <div className="option-content">
                  <FiMapPin className="option-icon" />
                  <div>
                    <h4>Pickup</h4>
                    <p>Pick it up yourself (Free)</p>
                  </div>
                </div>
              </label>
            </div>

            <div className="modal-actions">
              <button
                disabled={!deliveryMethodChoice}
                onClick={confirmRequest}
                className="confirm-btn"
              >
                Confirm Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Payment Modal */}
      {showPayment && (
        <div className="modal-overlay">
          <div className="modal-content payment-modal">
            <div className="modal-header">
              <h3>Pay Delivery Charge</h3>
              <button onClick={() => setShowPayment(false)} className="modal-close">
                <FiX />
              </button>
            </div>
            
            <div className="payment-details">
              <FiCreditCard className="payment-icon" />
              <div className="payment-amount">₹{deliveryCharge}</div>
              <p>Secure payment processed by Stripe</p>
            </div>

            <div className="modal-actions">
              <button onClick={handleStripePayment} className="pay-now-btn">
                Pay Now
              </button>
              <button onClick={() => setShowPayment(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}