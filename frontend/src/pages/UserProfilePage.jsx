// UserProfilePage.jsx
import React, { useState, useEffect } from "react";
import {
  FiUser,
  FiPhone,
  FiMail,
  FiPackage,
  FiTruck,
  FiClock,
  FiMapPin,
  FiCheckCircle,
  FiRefreshCw,
  FiAlertCircle,
  FiEdit,
  FiSave,
  FiX,
} from "react-icons/fi";
import "./UserProfilePage.css";

export default function UserProfilePage() {
  const [user, setUser] = useState(null);
  const [userDonations, setUserDonations] = useState([]);
  const [requestedDonations, setRequestedDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otpInputs, setOtpInputs] = useState({});
  const [activeTab, setActiveTab] = useState("donated");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isProUser, setIsProUser] = useState(false);
  const [showProModal, setShowProModal] = useState(false);

  const fetchDonations = async () => {
    try {
      if (!user) return;

      // Fetch donations made by user
      const donationsRes = await fetch(
        `http://localhost:5000/api/donations?userId=${user.id}`
      );
      const donationsData = await donationsRes.json();
      setUserDonations(donationsData);

      // Fetch donations requested by user
      const requestedRes = await fetch(
        `http://localhost:5000/api/donations/requested?requesterId=${user.id}`
      );
      const requestedData = await requestedRes.json();
      setRequestedDonations(requestedData);
    } catch (error) {
      console.error("Error fetching donations:", error);
      setUserDonations([]);
      setRequestedDonations([]);
    }
  };

  const checkProStatus = async (userId) => {
    try {
      console.log("Checking Pro status for user:", userId);
      const res = await fetch(
        `http://localhost:5000/api/pro-subscriptions/check?userId=${userId}`
      );

      if (!res.ok) {
        console.error("Pro status check failed:", res.status);
        return;
      }

      const data = await res.json();
      console.log("Pro status response:", data);

      // Force state update
      const newProStatus = !!data.isPro;
      setIsProUser(newProStatus);

      // Log the state change
      console.log("Pro status updated to:", newProStatus);

      // If Pro status is true, show additional confirmation
      if (newProStatus) {
        console.log(
          "✅ User is now Pro! UI should update to show Pro Member status."
        );
      }
    } catch (error) {
      console.error("Error checking Pro status:", error);
      // Don't change state on error, keep current state
    }
  };

  const handleCancelSubscription = async () => {
    if (!user?.id) return;

    const confirmed = window.confirm(
      "Are you sure you want to cancel your Pro subscription? You will stop receiving WhatsApp notifications for new donations."
    );

    if (!confirmed) return;

    try {
      const res = await fetch(
        "http://localhost:5000/api/pro-subscription/cancel",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ userId: user.id }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        alert(
          "Pro subscription cancelled successfully. You can renew anytime."
        );
        setIsProUser(false);
      } else {
        alert(`Error cancelling subscription: ${data.message}`);
      }
    } catch (error) {
      console.error("Error cancelling subscription:", error);
      alert("Error cancelling subscription. Please try again.");
    }
  };

  const handleRenewSubscription = () => {
    if (!user?.id) return;
    handleProUpgrade();
  };

  const handleProUpgrade = async () => {
    if (!user || !user.id) {
      alert("Please login first to upgrade to Pro");
      return;
    }

    console.log("Creating Pro checkout for user:", user);

    try {
      const res = await fetch(
        "http://localhost:5000/api/pro-subscription/create-checkout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user.id,
            contact: user.contact,
            email: user.email,
          }),
        }
      );

      console.log("Checkout response status:", res.status);
      const data = await res.json();
      console.log("Checkout response data:", data);

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(
          `Error creating checkout session: ${data.error || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error creating checkout:", error);
      alert(`Error creating checkout session: ${error.message}`);
    }
  };

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      setEditForm(storedUser);
      fetchDonations();
      // Check Pro status after a small delay to ensure user state is set
      setTimeout(() => {
        checkProStatus(storedUser.id);
      }, 100);
    }

    // Handle Pro subscription success/cancel from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const proSuccess = urlParams.get("pro_success");
    const proCancelled = urlParams.get("pro_cancelled");

    if (proSuccess === "true") {
      // Get session_id from URL parameters
      const sessionId = urlParams.get("session_id");

      if (sessionId && storedUser) {
        console.log(
          "Processing Pro subscription payment success for session:",
          sessionId
        );

        // Call backend to process the payment and create Pro subscription
        fetch("http://localhost:5000/api/payment-success", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ sessionId }),
        })
          .then((res) => res.json())
          .then((data) => {
            console.log("Payment success response:", data);
            if (data.isPro) {
              alert(
                "🎉 Pro subscription activated successfully! You will now receive WhatsApp notifications for new donations."
              );
              // Update UI immediately
              setIsProUser(true);
            } else {
              console.error(
                "Payment processed but Pro status not activated:",
                data
              );
              alert(
                "Payment processed but there was an issue activating Pro status. Please contact support."
              );
            }
          })
          .catch((error) => {
            console.error("Error processing payment success:", error);
            alert(
              "There was an error processing your payment. Please contact support."
            );
          });
      } else {
        console.error(
          "Missing session_id or user data for Pro subscription processing"
        );
        alert(
          "Payment success detected but missing required data. Please contact support."
        );
      }

      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (proCancelled === "true") {
      alert("Pro subscription was cancelled. You can try again anytime.");
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    }

    if (storedUser) {
      fetch(`http://localhost:5000/api/donations?userId=${storedUser.id}`)
        .then((res) => res.json())
        .then((data) => setUserDonations(data))
        .catch((err) => {
          console.error("Error fetching user donations:", err);
          setUserDonations([]);
        });

      fetch(
        `http://localhost:5000/api/donations/requested?requesterId=${storedUser.id}`
      )
        .then(async (res) => {
          const text = await res.text();
          try {
            const data = JSON.parse(text);
            setRequestedDonations(data);
          } catch (e) {
            console.error(
              "Error parsing requested donations JSON:",
              e,
              "Raw:",
              text
            );
            setRequestedDonations([]);
          }
          setLoading(false);
        })
        .catch((err) => {
          console.error("Error fetching requested donations:", err);
          setRequestedDonations([]);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  // Check Pro status whenever user changes
  useEffect(() => {
    if (user && user.id) {
      console.log("User changed, checking Pro status...");
      checkProStatus(user.id);
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        const updatedUser = await res.json();
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        setIsEditing(false);
        alert("Profile updated successfully!");
      } else {
        alert("Error updating profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile");
    }
  };

  const handleOtpSubmit = async (donationId, e) => {
    e.preventDefault();
    const enteredOtp = otpInputs[donationId] || "";
    if (!enteredOtp) {
      alert("Please enter the OTP from the receiver's email.");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/confirm-pickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          donationId: donationId,
          otp: enteredOtp.trim(),
        }),
      });
      const data = await res.json();
      alert(data.message);
      if (res.ok) fetchDonations();
    } catch (error) {
      console.error("Error confirming pickup:", error);
      alert("Error confirming pickup");
    }
  };

  if (loading) {
    return (
      <div className="profile-loading">
        <FiRefreshCw className="spin" />
        Loading your profile and donations...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-no-user">
        <FiAlertCircle className="no-user-icon" />
        <h2>Please login to view your profile</h2>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Header Section */}
      <div className="profile-header">
        <div className="header-content">
          <div>
            <h1>Your Profile</h1>
            <p>Manage your donations and requests</p>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="edit-profile-btn"
          >
            {isEditing ? (
              <>
                <FiX /> Cancel
              </>
            ) : (
              <>
                <FiEdit /> Edit Profile
              </>
            )}
          </button>
        </div>
      </div>

      <div className="profile-content">
        {/* Profile Sidebar */}
        <div className="profile-sidebar">
          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="edit-form">
              <div className="form-group">
                <label>Name</label>
                <input
                  type="text"
                  value={editForm.name || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact</label>
                <input
                  type="text"
                  value={editForm.contact || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, contact: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editForm.email || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                />
              </div>

              <button type="submit" className="save-btn">
                <FiSave /> Save Changes
              </button>
            </form>
          ) : (
            <>
              <div className="user-avatar">
                <div className="avatar-circle">
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="avatar-info">
                  <h2>{user.name}</h2>
                  <p>Food Donor & Receiver</p>
                </div>
              </div>

              <div className="user-details">
                <div className="detail-item">
                  <FiUser />
                  <span>{user.name}</span>
                </div>

                <div className="detail-item">
                  <FiPhone />
                  <span>{user.contact || "Not provided"}</span>
                </div>

                <div className="detail-item">
                  <FiMail />
                  <span>{user.email || "Not provided"}</span>
                </div>
              </div>

              <div className="impact-card">
                <h3>Your Impact</h3>
                <div className="impact-stats">
                  <div className="stat-item">
                    <div className="stat-number">{userDonations.length}</div>
                    <div className="stat-label">Donations</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">
                      {requestedDonations.length}
                    </div>
                    <div className="stat-label">Requests</div>
                  </div>
                </div>
              </div>

              {/* Pro Subscription Section */}
              {!isProUser ? (
                <div className="pro-upgrade-card">
                  <div className="pro-icon">⭐</div>
                  <h3>Upgrade to Pro</h3>
                  <p>
                    Get instant WhatsApp notifications for new food donations
                  </p>
                  <ul className="pro-benefits">
                    <li>📱 Real-time WhatsApp alerts</li>
                    <li>🚀 Be first to know about donations</li>
                    <li>💝 Help reduce food waste faster</li>
                  </ul>
                  <button
                    onClick={handleProUpgrade}
                    className="pro-upgrade-btn"
                  >
                    Upgrade to Pro - ₹299
                  </button>
                </div>
              ) : (
                <div className="pro-status-card">
                  <div className="pro-header">
                    <div className="pro-icon">⭐</div>
                    <div className="pro-title-section">
                      <h3>Pro Member</h3>
                      <div className="pro-status-badge">Active</div>
                    </div>
                  </div>

                  <div className="pro-management-actions">
                    <button
                      onClick={handleRenewSubscription}
                      className="pro-renew-btn"
                      title="Renew subscription"
                    >
                      🔄 Renew Subscription
                    </button>
                    <button
                      onClick={handleCancelSubscription}
                      className="pro-cancel-btn"
                      title="Cancel subscription"
                    >
                      ❌ Cancel Subscription
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Main Content */}
        <div className="profile-main">
          {/* Tab Navigation */}
          <div className="tab-navigation">
            <button
              onClick={() => setActiveTab("donated")}
              className={activeTab === "donated" ? "tab-btn active" : "tab-btn"}
            >
              Your Donations ({userDonations.length})
            </button>
            <button
              onClick={() => setActiveTab("requested")}
              className={
                activeTab === "requested" ? "tab-btn active" : "tab-btn"
              }
            >
              Your Requests ({requestedDonations.length})
            </button>
          </div>

          {/* Content based on active tab */}
          {activeTab === "donated" ? (
            <>
              <h2 className="section-title">Your Food Donations</h2>

              {userDonations.length === 0 ? (
                <div className="empty-state">
                  <FiPackage className="empty-icon" />
                  <h3>No donations yet</h3>
                  <p>Start by donating your surplus food</p>
                </div>
              ) : (
                <div className="donations-grid">
                  {userDonations.map((donation) => (
                    <div key={donation.id} className="donation-card">
                      <div
                        className={`status-badge status-${donation.status.toLowerCase()}`}
                      >
                        {donation.status}
                      </div>

                      <div className="donation-content">
                        {donation.image && (
                          <img
                            src={donation.image}
                            alt="Donation"
                            className="donation-image"
                          />
                        )}

                        <div className="donation-info">
                          <h3>
                            {donation.foodType}
                            <span className="quantity">
                              {" "}
                              - {donation.quantity}
                            </span>
                          </h3>

                          <div className="donation-details">
                            <div className="detail">
                              <FiClock />
                              <span>Fresh for {donation.freshness} hours</span>
                            </div>

                            {donation.notes && (
                              <div className="detail">
                                <strong>Notes:</strong> {donation.notes}
                              </div>
                            )}
                          </div>

                          <div className="donation-date">
                            Donated on:{" "}
                            {new Date(donation.createdAt).toLocaleString()}
                          </div>

                          {donation.status === "Delivered" && (
                            <div className="delivery-info">
                              <FiCheckCircle />
                              Delivered on:{" "}
                              {donation.deliveredAt
                                ? new Date(
                                    donation.deliveredAt
                                  ).toLocaleString()
                                : "Date unknown"}
                            </div>
                          )}

                          {donation.status === "Requested" &&
                            donation.deliveryMethod === "pickup" && (
                              <div className="otp-section">
                                <h4>Confirm Pickup</h4>
                                <form
                                  onSubmit={(e) =>
                                    handleOtpSubmit(donation.id, e)
                                  }
                                >
                                  <div className="otp-form">
                                    <input
                                      type="text"
                                      placeholder="Enter OTP"
                                      maxLength={6}
                                      value={otpInputs[donation.id] || ""}
                                      onChange={(e) =>
                                        setOtpInputs((inputs) => ({
                                          ...inputs,
                                          [donation.id]: e.target.value,
                                        }))
                                      }
                                      className="otp-input"
                                      required
                                    />
                                    <button
                                      type="submit"
                                      className="otp-submit-btn"
                                    >
                                      Confirm
                                    </button>
                                  </div>
                                  <div className="otp-help">
                                    Receiver will provide OTP from confirmation
                                    email
                                  </div>
                                </form>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <h2 className="section-title">Your Food Requests</h2>

              {requestedDonations.length === 0 ? (
                <div className="empty-state">
                  <FiPackage className="empty-icon" />
                  <h3>No requests yet</h3>
                  <p>Browse available donations to make your first request</p>
                </div>
              ) : (
                <div className="donations-grid">
                  {requestedDonations.map((donation) => (
                    <div key={donation.id} className="donation-card">
                      <div
                        className={`status-badge status-${donation.status.toLowerCase()}`}
                      >
                        {donation.status}
                      </div>

                      <div className="donation-content">
                        {donation.image && (
                          <img
                            src={donation.image}
                            alt="Donation"
                            className="donation-image"
                          />
                        )}

                        <div className="donation-info">
                          <h3>
                            {donation.foodType}
                            <span className="quantity">
                              {" "}
                              - {donation.quantity}
                            </span>
                          </h3>

                          <div className="donation-details">
                            <div className="detail">
                              <FiClock />
                              <span>Fresh for {donation.freshness} hours</span>
                            </div>

                            <div className="detail">
                              <strong>Donor:</strong>{" "}
                              {donation.donorName || "Anonymous"}
                            </div>

                            {donation.donorContact && (
                              <div className="detail">
                                <strong>Contact:</strong>{" "}
                                {donation.donorContact}
                              </div>
                            )}

                            {donation.notes && (
                              <div className="detail">
                                <strong>Notes:</strong> {donation.notes}
                              </div>
                            )}
                          </div>

                          <div className="donation-date">
                            Requested on:{" "}
                            {donation.requestedAt
                              ? new Date(donation.requestedAt).toLocaleString()
                              : "N/A"}
                          </div>

                          {donation.status === "Delivered" && (
                            <div className="delivery-info">
                              <FiCheckCircle />
                              Delivered on:{" "}
                              {donation.deliveredAt
                                ? new Date(
                                    donation.deliveredAt
                                  ).toLocaleString()
                                : "Date unknown"}
                            </div>
                          )}

                          {donation.locationLat && donation.locationLng && (
                            <a
                              href={`https://www.google.com/maps/search/?api=1&query=${donation.locationLat},${donation.locationLng}`}
                              target="_blank"
                              rel="noreferrer"
                              className="map-link"
                            >
                              <FiMapPin />
                              View Pickup Location
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
