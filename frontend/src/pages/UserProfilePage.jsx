import React, { useState, useEffect } from "react";
import './UserProfilePage.css';

export default function UserProfilePage() {
  const [user, setUser] = useState(null);
  const [userDonations, setUserDonations] = useState([]);
  const [requestedDonations, setRequestedDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otpInputs, setOtpInputs] = useState({});
  const fetchDonations = async () => {
    try {
      if (!user) return;

      // Fetch donations made by user
      const donationsRes = await fetch(`http://localhost:5000/api/donations?userId=${user.id}`);
      const donationsData = await donationsRes.json();
      setUserDonations(donationsData);

      // Fetch donations requested by user
      const requestedRes = await fetch(`http://localhost:5000/api/donations/requested?requesterId=${user.id}`);
      const requestedData = await requestedRes.json();
      setRequestedDonations(requestedData);
    } catch (error) {
      console.error("Error fetching donations:", error);
      setUserDonations([]);
      setRequestedDonations([]);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      fetchDonations();
      // Fetch donations made by user
      fetch(`http://localhost:5000/api/donations?userId=${storedUser.id}`)
        .then(res => res.json())
        .then(data => setUserDonations(data))
        .catch(err => {
          console.error("Error fetching user donations:", err);
          setUserDonations([]);
        });

      // Fetch donations requested by user with robust JSON parse
      fetch(`http://localhost:5000/api/donations/requested?requesterId=${storedUser.id}`)
        .then(async res => {
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            setRequestedDonations(data);
          } catch (e) {
            console.error("Error parsing requested donations JSON:", e, "Raw:", text);
            setRequestedDonations([]);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error("Error fetching requested donations:", err);
          setRequestedDonations([]);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="loading">Loading your profile and donations...</div>;
  }

  if (!user) {
    return <div className="no-user">Please login to view your profile.</div>;
  }

  return (
    <div className="profile-container">
      <h1>User Profile</h1>
      <div className="user-info">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Contact:</strong> {user.contact || "Not provided"}</p>
        <p><strong>Email:</strong> {user.email || "Not provided"}</p>
      </div>

      <h2>Your Donations</h2>
      {userDonations.length === 0 ? (
        <p className="no-donations">No donations found.</p>
      ) : (
        <div className="donations-cards">
          {userDonations.map(donation => (
            <div key={donation.id} className="donation-card">
              {donation.image && (
                <div className="donation-image-wrapper">
                  <img src={donation.image} alt="Donation" className="donation-image" />
                </div>
              )}
              <div className="donation-info">
                <span className="food-type">{donation.foodType}</span>
                <span className="quantity"> - {donation.quantity}</span>
                <div><strong>Freshness:</strong> {donation.freshness}</div>
                <div><strong>Notes:</strong> {donation.notes || "None"}</div>
                <div>
                  <strong>Status:</strong>{" "}
                  {donation.status === "Delivered"
                    ? `Delivered on: ${donation.deliveredAt ? new Date(donation.deliveredAt).toLocaleString() : "Date unknown"}`
                    : donation.status}
                </div>
                <div className="donation-date">
                  Donated on: {new Date(donation.createdAt).toLocaleString()}
                </div>
                {donation.status === "Requested" && donation.deliveryMethod === "pickup" && (
                  <div style={{ marginTop: "12px", padding: "8px", background: "#eef", borderRadius: "7px" }}>
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        const enteredOtp = otpInputs[donation.id] || "";
                        if (!enteredOtp) {
                          alert("Please enter the OTP from the receiver’s email.");
                          return;
                        }
                        const res = await fetch("http://localhost:5000/api/confirm-pickup", {
                          method: "POST",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({
                            donationId: donation.id,
                            otp: enteredOtp.trim(),
                          }),
                        });
                        const data = await res.json();
                        alert(data.message);
                        if (res.ok) fetchDonations(); // Refresh list after delivery
                      }}
                    >
                      <label>
                        Please enter OTP<br />
                        <input
                          type="text"
                          name="otp"
                          maxLength={6}
                          value={otpInputs[donation.id] || ""}
                          onChange={e =>
                            setOtpInputs(inputs => ({ ...inputs, [donation.id]: e.target.value }))
                          }
                          style={{ width: "100px", fontSize: "1.1rem", marginTop: "4px" }}
                          required
                        />
                      </label>
                      <button type="submit" style={{ marginLeft: "10px" }}>Confirm Pickup</button>
                    </form>
                    <small style={{ color: "#555" }}>
                      (Receiver will give you an OTP from their confirmation email)
                    </small>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <h2>Donations You Requested</h2>
      {requestedDonations.length === 0 ? (
        <p className="no-donations">You haven't requested any donations.</p>
      ) : (
        <div className="donations-cards">
          {requestedDonations.map(donation => (
            <div key={donation.id} className="donation-card">
              {donation.image && (
                <div className="donation-image-wrapper">
                  <img src={donation.image} alt="Donation" className="donation-image" />
                </div>
              )}
              <div className="donation-info">
                <span className="food-type">{donation.foodType}</span>
                <span className="quantity"> - {donation.quantity}</span>
                <div><strong>Freshness:</strong> {donation.freshness}</div>
                <div><strong>Notes:</strong> {donation.notes || "None"}</div>
                <div><strong>Donor:</strong> {donation.donorName || "Anonymous"}</div>
                <div><strong>Donor Contact:</strong> {donation.donorContact || "Not provided"}</div>
                <div>
                  <strong>Status:</strong>{" "}
                  {donation.status === "Delivered"
                    ? `Delivered on: ${donation.deliveredAt ? new Date(donation.deliveredAt).toLocaleString() : "Date unknown"}`
                    : donation.status}
                </div>
                <div className="donation-date">
                  Requested on: {donation.requestedAt ? new Date(donation.requestedAt).toLocaleString() : "N/A"}
                </div>
                {(donation.locationLat && donation.locationLng) && (
                  <p>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${donation.locationLat},${donation.locationLng}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View Pickup Location
                    </a>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
