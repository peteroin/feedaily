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
  FiX
} from "react-icons/fi";
import './UserProfilePage.css';

export default function UserProfilePage() {
  const [user, setUser] = useState(null);
  const [userDonations, setUserDonations] = useState([]);
  const [requestedDonations, setRequestedDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [otpInputs, setOtpInputs] = useState({});
  const [activeTab, setActiveTab] = useState("donated");
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});

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
      setEditForm(storedUser);
      fetchDonations();
      
      fetch(`http://localhost:5000/api/donations?userId=${storedUser.id}`)
        .then(res => res.json())
        .then(data => setUserDonations(data))
        .catch(err => {
          console.error("Error fetching user donations:", err);
          setUserDonations([]);
        });

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

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm)
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
            {isEditing ? <><FiX /> Cancel</> : <><FiEdit /> Edit Profile</>}
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
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  required
                />
              </div>

              <div className="form-group">
                <label>Contact</label>
                <input
                  type="text"
                  value={editForm.contact || ''}
                  onChange={(e) => setEditForm({...editForm, contact: e.target.value})}
                />
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={editForm.email || ''}
                  onChange={(e) => setEditForm({...editForm, email: e.target.value})}
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
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
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
                    <div className="stat-number">{requestedDonations.length}</div>
                    <div className="stat-label">Requests</div>
                  </div>
                </div>
              </div>
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
              className={activeTab === "requested" ? "tab-btn active" : "tab-btn"}
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
                  {userDonations.map(donation => (
                    <div key={donation.id} className="donation-card">
                      <div className={`status-badge status-${donation.status.toLowerCase()}`}>
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
                            <span className="quantity"> - {donation.quantity}</span>
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
                            Donated on: {new Date(donation.createdAt).toLocaleString()}
                          </div>

                          {donation.status === "Delivered" && (
                            <div className="delivery-info">
                              <FiCheckCircle />
                              Delivered on: {donation.deliveredAt ? new Date(donation.deliveredAt).toLocaleString() : "Date unknown"}
                            </div>
                          )}

                          {donation.status === "Requested" && donation.deliveryMethod === "pickup" && (
                            <div className="otp-section">
                              <h4>Confirm Pickup</h4>
                              <form onSubmit={(e) => handleOtpSubmit(donation.id, e)}>
                                <div className="otp-form">
                                  <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    maxLength={6}
                                    value={otpInputs[donation.id] || ""}
                                    onChange={e => setOtpInputs(inputs => ({ ...inputs, [donation.id]: e.target.value }))}
                                    className="otp-input"
                                    required
                                  />
                                  <button type="submit" className="otp-submit-btn">
                                    Confirm
                                  </button>
                                </div>
                                <div className="otp-help">
                                  Receiver will provide OTP from confirmation email
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
                  {requestedDonations.map(donation => (
                    <div key={donation.id} className="donation-card">
                      <div className={`status-badge status-${donation.status.toLowerCase()}`}>
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
                            <span className="quantity"> - {donation.quantity}</span>
                          </h3>
                          
                          <div className="donation-details">
                            <div className="detail">
                              <FiClock />
                              <span>Fresh for {donation.freshness} hours</span>
                            </div>
                            
                            <div className="detail">
                              <strong>Donor:</strong> {donation.donorName || "Anonymous"}
                            </div>
                            
                            {donation.donorContact && (
                              <div className="detail">
                                <strong>Contact:</strong> {donation.donorContact}
                              </div>
                            )}
                            
                            {donation.notes && (
                              <div className="detail">
                                <strong>Notes:</strong> {donation.notes}
                              </div>
                            )}
                          </div>
                          
                          <div className="donation-date">
                            Requested on: {donation.requestedAt ? new Date(donation.requestedAt).toLocaleString() : "N/A"}
                          </div>

                          {donation.status === "Delivered" && (
                            <div className="delivery-info">
                              <FiCheckCircle />
                              Delivered on: {donation.deliveredAt ? new Date(donation.deliveredAt).toLocaleString() : "Date unknown"}
                            </div>
                          )}

                          {(donation.locationLat && donation.locationLng) && (
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