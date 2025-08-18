import React, { useState, useEffect, useRef, useCallback } from "react";
import Webcam from "react-webcam";
import TMImagePredictor from '../components/TMImagePredictor';
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
      const res = await fetch(`http://localhost:5000/api/donations`);
      const data = await res.json();
      setDonations(data);
    } catch (err) {
      console.error("Failed to fetch donations:", err);
    }
  };

  useEffect(() => {
    fetchDonations();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!donorName || !contact || !foodType || !quantity || !freshness) {
      setMessage("Please fill all required fields.");
      return;
    }

    if (!navigator.geolocation) {
      setMessage("Geolocation is not supported by your browser.");
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
            freshness,
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
      },
      () => {
        setMessage("Location permission denied or error getting location.");
      }
    );
  };

  // Modal & payment logic unchanged...
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
        amount: deliveryCharge, // INR rupees
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
      <h1 className="dashboard-title">🍽 Feedaily Dashboard</h1>
      <div className="dashboard-sections">
        {/* Form Section */}
        <div className="form-section">
          <h2>Add a Food Donation</h2>
          {message && <p className="msg">{message}</p>}

          <form onSubmit={handleSubmit} className="donation-form">
            <input type="text" value={donorName} readOnly />
            <input type="text" value={contact} readOnly />

            <input
              type="text"
              placeholder="Food Type*"
              value={foodType}
              onChange={(e) => setFoodType(e.target.value)}
              required
            />

            <input
              type="text"
              placeholder="Quantity* (e.g., 5 plates, 2kg)"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              required
            />

            <select value={freshness} onChange={(e) => setFreshness(e.target.value)} required>
              <option value="">-- Freshness --</option>
              <option value="Safe to eat now">Safe to eat now</option>
              <option value="Safe for 2 hours">Safe for 2 hours</option>
              <option value="Safe for 4 hours">Safe for 4 hours</option>
              <option value="Others">Others</option>
            </select>

            <textarea
              placeholder="Additional Notes (pickup info, etc.)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />

            <div className="webcam-container">
              {!capturedImage ? (
                isCameraOn ? (
                  <>
                    <Webcam
                      audio={false}
                      height={240}
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      width={320}
                      videoConstraints={videoConstraints}
                      mirrored
                    />
                    <button
                      type="button"
                      onClick={capture}
                      className="capture-btn"
                    >
                      Capture Image
                    </button>
                  </>
                ) : (
                  <button type="button" onClick={() => setIsCameraOn(true)} className="capture-btn">
                    Capture Image
                  </button>
                )
              ) : (
                <>
                  <img src={capturedImage} alt="Captured" className="captured-image" />
                  <button
                    type="button"
                    onClick={() => {
                      setCapturedImage(null);
                      setIsCameraOn(true);
                    }}
                    className="capture-btn"
                  >
                    Retake
                  </button>
                </>
              )}

              {/* Pass captured image to predictor (shows prediction below webcam) */}
              <TMImagePredictor imageSrc={capturedImage} />
            </div>
            <button type="submit">Submit Donation</button>
          </form>
        </div>

        {/* Donations List */}
        <div className="list-section">
          <h2>All Donations</h2>
          {donations.length === 0 ? (
            <p>No donations yet.</p>
          ) : (
            <ul className="donations-list">
              {donations.map((donation) => (
                <li key={donation.id}>
                  <strong>{donation.foodType}</strong> — {donation.quantity}
                  <br />
                  <small>{donation.freshness}</small>
                  <p><b>Donor:</b> {donation.donorName}</p>
                  <p><b>Contact:</b> {donation.contact}</p>
                  {donation.notes && <p>{donation.notes}</p>}
                  {donation.image && (
                    <img src={donation.image} alt="Donation" className="donation-image" />
                  )}
                  {donation.locationName ? (
                    <div><b>Location:</b> {donation.locationName}</div>
                  ) : donation.locationLat && donation.locationLng ? (
                    <div>
                      <b>Location:</b> Lat {donation.locationLat.toFixed(4)}, Lng {donation.locationLng.toFixed(4)}
                    </div>
                  ) : (
                    <div><b>Location:</b> Not provided</div>
                  )}
                  {donation.locationLat && donation.locationLng && (
                    <button
                      onClick={() => {
                        const url = `https://www.google.com/maps/search/?api=1&query=${donation.locationLat},${donation.locationLng}`;
                        window.open(url, "_blank");
                      }}
                      className="view-map-button"
                    >
                      View on Map
                    </button>
                  )}
                  <span className="date">{new Date(donation.createdAt).toLocaleString()}</span>
                  <br />
                  {donation.status === "Available" ? (
                    <button onClick={() => openRequestChoice(donation.id)}>
                      Request This Food
                    </button>
                  ) : (
                    <span style={{ color: "red" }}>Already Requested</span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Delivery selection modal */}
      {currentRequestDonationId && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "10px",
              textAlign: "center",
              width: "300px",
            }}
          >
            <h3>Please choose delivery method</h3>
            <label>
              <input
                type="radio"
                name="deliveryMethod"
                value="delivery"
                checked={deliveryMethodChoice === "delivery"}
                onChange={() => setDeliveryMethodChoice("delivery")}
              />
              Delivery
            </label>
            <label style={{ marginLeft: 15 }}>
              <input
                type="radio"
                name="deliveryMethod"
                value="pickup"
                checked={deliveryMethodChoice === "pickup"}
                onChange={() => setDeliveryMethodChoice("pickup")}
              />
              In-person Pickup
            </label>
            <div style={{ marginTop: 20 }}>
              <button
                disabled={!deliveryMethodChoice}
                onClick={confirmRequest}
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setCurrentRequestDonationId(null);
                  setDeliveryMethodChoice(null);
                }}
                style={{ marginLeft: 10 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {showPayment && (
        <div style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: "white",
            padding: "30px",
            borderRadius: 8,
            maxWidth: 340,
            width: "95%"
          }}>
            <h3>Pay Delivery Charge</h3>
            <p>Amount: ₹{deliveryCharge}</p>
            <button onClick={handleStripePayment} style={{ marginTop: 16 }}>
              Pay Now
            </button>
            <button
              onClick={() => setShowPayment(false)}
              style={{ marginTop: 20, marginLeft: 10 }}
            >Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
