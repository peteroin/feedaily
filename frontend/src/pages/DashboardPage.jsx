// DashboardPage.jsx
import React, { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import TMImagePredictor from '../components/TMImagePredictor';
import Carousel from "react-multi-carousel";
import MapModal from '../components/MapModal';
import "react-multi-carousel/lib/styles.css";
import { 
  FiCamera, 
  FiRefreshCw, 
  FiMapPin, 
  FiClock, 
  FiUser, 
  FiPhone,
  FiPlus,
  FiCheck,
  FiTruck,
  FiPackage,
  FiCreditCard,
  FiX
} from "react-icons/fi";
import "./DashboardPage.css";

const responsive = {
  desktop: { breakpoint: { max: 3000, min: 1024 }, items: 3, partialVisibilityGutter: 40 },
  tablet: { breakpoint: { max: 1024, min: 768 }, items: 2, partialVisibilityGutter: 30 },
  mobile: { breakpoint: { max: 768, min: 0 }, items: 1, partialVisibilityGutter: 30 }
};

export default function DashboardPage() {
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapModalUrl, setMapModalUrl] = useState('');
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
  const [currentStep, setCurrentStep] = useState(1);

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
    
    if (currentStep < 4) {
      // Validate current step
      if (currentStep === 1 && (!donorName || !contact)) {
        setMessage("Please fill all required fields.");
        return;
      }
      if (currentStep === 2 && (!foodType || !quantity || !freshness)) {
        setMessage("Please fill all required fields.");
        return;
      }
      // Move to next step
      setCurrentStep(currentStep + 1);
      setMessage("");
      return;
    }
    
    // Final submission on step 4
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
          // Reset form fields but keep user info from localStorage
          const storedUser = JSON.parse(localStorage.getItem("user"));
          setDonorName(storedUser?.name || "");
          setContact(storedUser?.contact || "");
          setFoodType("");
          setQuantity("");
          setFreshness("");
          setNotes("");
          setCapturedImage(null);
          setLocation(null);
          setCurrentStep(1);
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

  const handleOpenMap = (donation) => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const requesterLat = position.coords.latitude;
        const requesterLng = position.coords.longitude;
        
        const donorLat = donation.locationLat;
        const donorLng = donation.locationLng;

        const url = `https://www.google.com/maps?saddr=${requesterLat},${requesterLng}&daddr=${donorLat},${donorLng}&output=embed`;
        
        setMapModalUrl(url);
        setIsMapModalOpen(true);
      },
      () => {
        alert("Could not get your location. Please enable location services to view the route.");
      }
    );
  };

  const handleCloseMap = () => {
    setIsMapModalOpen(false);
    setMapModalUrl(''); 
  };

  return (
    <div className="dashboard-page">
      <div className="content-grid-swiper">
        {/* Form Section */}
        <div className="form-section-swiper">
          <div className="section-header">
            <h2 className="section-title">Add Donation</h2>
            <p className="section-subtitle">Share surplus food with your community</p>
          </div>

          {/* Step Indicator */}
          <div className="step-indicator">
            <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
              <div className="step-circle">{currentStep > 1 ? <FiCheck /> : '1'}</div>
              <span className="step-label">Contact</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
              <div className="step-circle">{currentStep > 2 ? <FiCheck /> : '2'}</div>
              <span className="step-label">Food Info</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${currentStep >= 3 ? 'active' : ''} ${currentStep > 3 ? 'completed' : ''}`}>
              <div className="step-circle">{currentStep > 3 ? <FiCheck /> : '3'}</div>
              <span className="step-label">Image</span>
            </div>
            <div className="step-line"></div>
            <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>
              <div className="step-circle">4</div>
              <span className="step-label">Review</span>
            </div>
          </div>

          {message && (
            <div className={`alert ${message.includes("success") ? "alert-success" : "alert-error"}`}>
              {message}
            </div>
          )}

            <form onSubmit={handleSubmit} className="donation-form">
              {/* Step 1: Contact Information */}
              {currentStep === 1 && (
                <div className="form-step">
                  <div className="form-group">
                    <label><FiUser className="label-icon" /> Your Name *</label>
                    <input 
                      type="text" 
                      value={donorName} 
                      readOnly 
                      className="form-input readonly-input"
                    />
                  </div>

                  <div className="form-group">
                    <label><FiPhone className="label-icon" /> Contact Information *</label>
                    <input 
                      type="text" 
                      value={contact} 
                      readOnly 
                      className="form-input readonly-input"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Food Details */}
              {currentStep === 2 && (
                <div className="form-step">
                  <div className="form-group">
                    <label><FiPackage className="label-icon" /> Food Type *</label>
                    <input
                      type="text"
                      placeholder="e.g., Pizza, Rice, Sandwiches"
                      value={foodType}
                      onChange={(e) => setFoodType(e.target.value)}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label><FiPackage className="label-icon" /> Quantity *</label>
                      <input
                        type="text"
                        placeholder="e.g., 5 plates, 2kg"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="form-input"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label><FiClock className="label-icon" /> Freshness (hours) *</label>
                      <input
                        type="number"
                        placeholder="Hours"
                        value={freshness}
                        onChange={(e) => setFreshness(e.target.value)}
                        className="form-input"
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
                      className="form-textarea"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Image Capture */}
              {currentStep === 3 && (
                <div className="form-step">
                  <div className="form-group">
                    <label><FiCamera className="label-icon" /> Food Image</label>
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
                              className="btn btn-primary"
                            >
                              <FiCamera />
                              Capture Image
                            </button>
                          </div>
                        ) : (
                          <button 
                            type="button" 
                            onClick={() => setIsCameraOn(true)}
                            className="btn btn-secondary btn-block"
                          >
                            <FiCamera />
                            Open Camera
                          </button>
                        )
                      ) : (
                        <div className="captured-content">
                          <img src={capturedImage} alt="Captured" className="captured-image" />
                          <button
                            type="button"
                            onClick={() => {
                              setCapturedImage(null);
                              setIsCameraOn(true);
                            }}
                            className="btn btn-secondary"
                          >
                            <FiRefreshCw />
                            Retake Photo
                          </button>
                        </div>
                      )}
                    </div>
                    <TMImagePredictor imageSrc={capturedImage} />
                  </div>
                </div>
              )}

              {/* Step 4: Review & Submit */}
              {currentStep === 4 && (
                <div className="form-step review-step">
                  <h3 className="review-title">Review Your Donation</h3>
                  
                  <div className="review-section">
                    <h4 className="review-section-title"><FiUser /> Contact Information</h4>
                    <div className="review-item">
                      <span className="review-label">Name:</span>
                      <span className="review-value">{donorName}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">Contact:</span>
                      <span className="review-value">{contact}</span>
                    </div>
                  </div>

                  <div className="review-section">
                    <h4 className="review-section-title"><FiPackage /> Food Details</h4>
                    <div className="review-item">
                      <span className="review-label">Food Type:</span>
                      <span className="review-value">{foodType}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">Quantity:</span>
                      <span className="review-value">{quantity}</span>
                    </div>
                    <div className="review-item">
                      <span className="review-label">Freshness:</span>
                      <span className="review-value">{freshness} hours</span>
                    </div>
                    {notes && (
                      <div className="review-item">
                        <span className="review-label">Notes:</span>
                        <span className="review-value">{notes}</span>
                      </div>
                    )}
                  </div>

                  {capturedImage && (
                    <div className="review-section">
                      <h4 className="review-section-title"><FiCamera /> Food Image</h4>
                      <img src={capturedImage} alt="Food" className="review-image" />
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="form-navigation">
                {currentStep > 1 && (
                  <button 
                    type="button"
                    onClick={() => {
                      setCurrentStep(currentStep - 1);
                      setMessage("");
                    }}
                    className="btn btn-secondary"
                  >
                    Back
                  </button>
                )}
                
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="spinner"></div>
                  ) : currentStep === 4 ? (
                    <>
                      <FiPlus />
                      Submit Donation
                    </>
                  ) : (
                    'Next'
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Donations List */}
                  <div className="list-section-swiper">
          <div className="section-header">
            <h2 className="section-title">Available Donations</h2>
            <button onClick={fetchDonations} className="btn btn-ghost btn-sm"><FiRefreshCw /> Refresh</button>
          </div>

          {isLoading ? (
            <div className="empty-state">
              <span className="spinner"></span>
              <p className="empty-text">Loading donations...</p>
            </div>
          ) : donations.length === 0 ? (
            <div className="empty-state">
              <FiPackage className="empty-icon" />
              <h3 className="empty-title">No donations yet</h3>
              <p className="empty-text">Be the first to share food!</p>
            </div>
          ) : (
            <Carousel
              responsive={responsive}
              infinite={false}
              containerClass="carousel-container"
              itemClass="carousel-item-padding-40-px"
              swipeable={true}
              draggable={true}
              showDots={true}
              keyBoardControl={true}
            >
              {donations.filter(d => d.status !== "Expired").map(donation => (
                <div key={donation.id} className="donation-card-carousel">
                  <div className="card-header">
                    <h3 className="card-title">{donation.foodType}</h3>
                    <span className={`badge badge-${donation.status?.toLowerCase()}`}>{donation.status}</span>
                  </div>
                  <div className="card-details">
                    <div className="detail-row"><FiPackage className="detail-icon" /><span>{donation.quantity}</span></div>
                    <div className="detail-row"><FiClock className="detail-icon" /><span>Fresh for {donation.freshness}h</span></div>
                    <div className="detail-row"><FiUser className="detail-icon" /><span>{donation.donorName}</span></div>
                    <div className="detail-row"><FiPhone className="detail-icon" /><span>{donation.contact}</span></div>
                  </div>
                  {donation.notes && <div className="card-notes"><p>{donation.notes}</p></div>}
                  {donation.image && <img src={donation.image} alt="Food" className="card-image" />}
                  <div className="card-location">
                    <div className="detail-row">
                      <FiMapPin className="detail-icon" />
                      {donation.locationName ? donation.locationName : donation.locationLat && donation.locationLng ? `${donation.locationLat.toFixed(4)}, ${donation.locationLng.toFixed(4)}` : "Location not provided"}
                    </div>
                    {donation.locationLat && donation.locationLng && (
                      <button onClick={() => handleOpenMap(donation)} className="btn btn-ghost btn-xs">
                        <FiMapPin /> View Route
                      </button>
                    )}
                  </div>
                  <div className="card-footer">
                    <span className="card-date">{new Date(donation.createdAt).toLocaleDateString()}</span>
                    {donation.status === "Expired" ? (
                      <span className="status-text expired">Expired</span>
                    ) : donation.status === "Available" ? (
                      <button onClick={() => openRequestChoice(donation.id)} className="btn btn-primary btn-sm">Request</button>
                    ) : (
                      <span className="status-text requested">Requested</span>
                    )}
                  </div>
                </div>
              ))}
            </Carousel>
          )}
        </div>
      </div>

      {/* Stats Overview - Moved to Bottom */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"><FiPackage /></div>
          <div className="stat-info"><div className="stat-value">{donations.length}</div><div className="stat-label">Active Donations</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FiUser /></div>
          <div className="stat-info"><div className="stat-value">{donations.filter(d => d.status === "Requested").length}</div><div className="stat-label">Requests Made</div></div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><FiCheck /></div>
          <div className="stat-info"><div className="stat-value">{donations.filter(d => d.status === "Completed").length}</div><div className="stat-label">Completed</div></div>
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

      <MapModal 
        isOpen={isMapModalOpen} 
        onClose={handleCloseMap} 
        mapUrl={mapModalUrl} 
      />

    </div>
  );
}