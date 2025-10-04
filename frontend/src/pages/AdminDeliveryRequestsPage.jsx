import React, { useEffect, useState } from "react";
import MapModal from "../components/MapModal";

export default function AdminDeliveryRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Available");
  const [expireModalOpenFor, setExpireModalOpenFor] = useState(null); // donation/request id for expiration
  const [expirationReason, setExpirationReason] = useState("");
  
  // Map modal states
  const [showMapModal, setShowMapModal] = useState(false);
  const [mapModalData, setMapModalData] = useState({
    latitude: null,
    longitude: null,
    title: "Location",
    showDirections: false,
    destinationLat: null,
    destinationLng: null,
    destinationTitle: "Destination"
  });
  
  const expirationReasons = [
    "Spoiled",
    "Not picked up",
    "Other",
  ];

  useEffect(() => {
    fetch("http://localhost:5000/api/donations")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter(d =>
          d.status === "Available" || d.status === "Delivering" || d.status === "Delivered"
        );
        setRequests(filtered);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load delivery requests.");
        setLoading(false);
      });
  }, []);

  const requested = requests.filter(r => r.status === "Available");
  const delivering = requests.filter(r => r.status === "Delivering");
  const delivered = requests.filter(r => r.status === "Delivered");

  const tabs = [
    { label: "Available", data: requested, color: "#007BFF" },
    { label: "Delivering", data: delivering, color: "#FFA500" },
    { label: "Delivered", data: delivered, color: "#28a745" },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    window.location.href = "/admin-login"; // Or navigate
  };

  const openMapModal = (latitude, longitude, title = "Location") => {
    setMapModalData({
      latitude,
      longitude,
      title,
      showDirections: false,
      destinationLat: null,
      destinationLng: null,
      destinationTitle: "Destination"
    });
    setShowMapModal(true);
  };

  const openRouteModal = (originLat, originLng, destLat, destLng, originTitle = "Origin", destTitle = "Destination") => {
    setMapModalData({
      latitude: originLat,
      longitude: originLng,
      title: originTitle,
      showDirections: true,
      destinationLat: destLat,
      destinationLng: destLng,
      destinationTitle: destTitle
    });
    setShowMapModal(true);
  };

  const closeMapModal = () => {
    setShowMapModal(false);
    setMapModalData({
      latitude: null,
      longitude: null,
      title: "Location",
      showDirections: false,
      destinationLat: null,
      destinationLng: null,
      destinationTitle: "Destination"
    });
  };

  const TableHeader = () => (
  <thead style={{ backgroundColor: "#f2f2f2" }}>
    <tr>
      <th style={{ width: "4%", padding: "8px", border: "1px solid #ddd" }}>ID</th>
      <th style={{ width: "14%", padding: "8px", border: "1px solid #ddd" }}>Donor</th>

      {activeTab === "Available" && (
        <>
          <th style={{ width: "14%", padding: "8px", border: "1px solid #ddd" }}>Donor Location</th>
          <th style={{ width: "12%", padding: "8px", border: "1px solid #ddd" }}>Donor Contact</th>
          <th style={{ width: "10%", padding: "8px", border: "1px solid #ddd" }}>Donated At</th>
        </>
      )}

      {(activeTab === "Delivering" || activeTab === "Delivered") && (
        <>
          <th style={{ width: "14%", padding: "8px", border: "1px solid #ddd" }}>Requester</th>
          <th style={{ width: "8%", padding: "8px", border: "1px solid #ddd" }}>Delivery Method</th>
          <th style={{ width: "12%", padding: "8px", border: "1px solid #ddd" }}>Route Map</th>
        </>
      )}

      <th style={{ width: "10%", padding: "8px", border: "1px solid #ddd" }}>Food</th>
      <th style={{ width: "6%", padding: "8px", border: "1px solid #ddd" }}>Quantity</th>

      <th style={{ width: "8%", padding: "8px", border: "1px solid #ddd" }}>Status</th>

      {(activeTab === "Delivering" || activeTab === "Delivered") && (
        <th style={{ width: "12%", padding: "8px", border: "1px solid #ddd" }}>Requested At</th>
      )}

      <th style={{ width: "12%", padding: "8px", border: "1px solid #ddd" }}>
        {activeTab === "Delivering"
          ? "Allocate Delivery Buddy"
          : activeTab === "Available"
          ? "Expire Food"
          : "Delivered At"}
      </th>
    </tr>
  </thead>
);




  const renderRows = (list, currentTab) =>
  list.map((req) => (
    <tr key={req.id} style={{ backgroundColor: req.status === "Delivered" ? "#e6ffe6" : "white" }}>
      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>{req.id}</td>
      <td style={{ padding: "8px", border: "1px solid #ddd", whiteSpace: "normal", wordBreak: "break-word" }}>
        {req.donorName}
        <br />
        {req.contact}
      </td>
      {currentTab === "Available" && (
        <>
          <td style={{ padding: "8px", border: "1px solid #ddd", whiteSpace: "normal", wordBreak: "break-word" }}>
            {req.locationLat && req.locationLng ? (
              <button
                onClick={() => openMapModal(req.locationLat, req.locationLng, `${req.donorName}'s Location`)}
                style={{ 
                  color: "#007bff", 
                  cursor: "pointer", 
                  textDecoration: "underline",
                  background: "none",
                  border: "none",
                  padding: 0,
                  font: "inherit"
                }}
              >
                View Location
              </button>
            ) : (
              <span style={{ color: "#999" }}>N/A</span>
            )}
          </td>
          <td style={{ padding: "8px", border: "1px solid #ddd", whiteSpace: "normal", wordBreak: "break-word" }}>
            {req.contact || "N/A"}
          </td>
          <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
            {req.createdAt ? new Date(req.createdAt).toLocaleString() : "N/A"}
          </td>
        </>
      )}

      {(currentTab === "Delivering" || currentTab === "Delivered") && (
        <>
          <td style={{ padding: "8px", border: "1px solid #ddd", whiteSpace: "normal", wordBreak: "break-word" }}>
            {req.requesterName || "N/A"}
            <br />
            {req.requesterContact || "N/A"}
          </td>
          <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
            {req.deliveryMethod || "N/A"}
          </td>
          <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
            {req.locationLat && req.locationLng && req.requesterLat && req.requesterLng ? (
              <button
                onClick={() => openRouteModal(
                  req.locationLat, 
                  req.locationLng, 
                  req.requesterLat, 
                  req.requesterLng,
                  `${req.donorName}'s Location`,
                  `${req.requesterName}'s Location`
                )}
                style={{ 
                  color: "#007bff", 
                  cursor: "pointer", 
                  textDecoration: "underline",
                  background: "none",
                  border: "none",
                  padding: 0,
                  font: "inherit"
                }}
              >
                View Route on Map
              </button>
            ) : (
              "N/A"
            )}
          </td>
        </>
      )}

      <td style={{ padding: "8px", border: "1px solid #ddd" }}>{req.foodType}</td>
      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>{req.quantity}</td>

      <td
        style={{
          padding: "8px",
          border: "1px solid #ddd",
          textAlign: "center",
          textTransform: "capitalize",
        }}
      >
        {req.status}
      </td>

      {(currentTab === "Delivering" || currentTab === "Delivered") && (
        <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
          {req.requestedAt ? new Date(req.requestedAt).toLocaleString() : "N/A"}
        </td>
      )}

      <td style={{ padding: "8px", border: "1px solid #ddd", textAlign: "center" }}>
        {currentTab === "Delivering" ? (
          <button>Allocate</button>
        ) : currentTab === "Available" ? (
          <button onClick={() => setExpireModalOpenFor(req.id)}>Expire</button>
        ) : req.deliveredAt ? (
          new Date(req.deliveredAt).toLocaleString()
        ) : (
          "N/A"
        )}
      </td>
    </tr>
  ));




  return (
    <div style={{ maxWidth: 1100, margin: "2rem auto", background: "#fff", padding: "2rem", borderRadius: 10, fontFamily: "Arial, sans-serif" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1>📋 Admin: Delivery Requests</h1>
        <button onClick={handleLogout} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '8px 16px', borderRadius: 4, cursor:'pointer' }}>
          Logout
        </button>
      </div>

      {/* Tab Navigation */}
      <div style={{ display: "flex", marginBottom: 20, borderBottom: "2px solid #ddd" }}>
        {tabs.map(tab => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            style={{
              padding: "10px 20px",
              cursor: "pointer",
              border: "none",
              borderBottom: activeTab === tab.label ? `4px solid ${tab.color}` : "4px solid transparent",
              backgroundColor: activeTab === tab.label ? "#f9f9f9" : "transparent",
              fontWeight: activeTab === tab.label ? "bold" : "normal",
              color: activeTab === tab.label ? tab.color : "#444",
              outline: "none",
            }}
          >
            {tab.label} ({tab.data.length})
          </button>
        ))}
      </div>

      {loading ? (
        <p>Loading delivery requests...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : requests.length === 0 ? (
        <p>No delivery requests found.</p>
      ) : (
        <>
          {tabs.map(tab => (
            <div key={tab.label} style={{ display: activeTab === tab.label ? "block" : "none" }}>
              {tab.data.length > 0 ? (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 900 }}>
                    <TableHeader />
                    <tbody>{renderRows(tab.data, tab.label)}</tbody>
                  </table>
                </div>
              ) : (
                <p>No {tab.label.toLowerCase()} deliveries.</p>
              )}
            </div>
          ))}
        </>
      )}
      {expireModalOpenFor && (
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
    <div style={{ backgroundColor: "white", padding: 20, borderRadius: 8, width: 320 }}>
      <h3>Expire Food Donation</h3>
      <label htmlFor="reason">Select Reason</label>
      <select
        id="reason"
        value={expirationReason}
        onChange={(e) => setExpirationReason(e.target.value)}
        style={{ width: "100%", padding: 8, marginTop: 8, marginBottom: 16 }}
      >
        <option value="">-- Select --</option>
        {expirationReasons.map((reason) => (
          <option key={reason} value={reason}>
            {reason}
          </option>
        ))}
      </select>
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          disabled={!expirationReason}
          onClick={async () => {
            try {
              const response = await fetch(`http://localhost:5000/api/expire-donation/${expireModalOpenFor}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ reason: expirationReason }),
              });
              if (response.ok) {
                alert("Donation expired successfully");
                setExpireModalOpenFor(null);
                setExpirationReason("");
                // Refresh list
                const res = await fetch("http://localhost:5000/api/donations");
                const data = await res.json();
                const filtered = data.filter(
                  (d) => d.status === "Available" || d.status === "Delivering" || d.status === "Delivered"
                );
                setRequests(filtered);
              } else {
                alert("Failed to expire donation.");
              }
            } catch (err) {
              alert("Error expiring donation.");
            }
          }}
          style={{ marginRight: 8 }}
        >
          Confirm
        </button>
        <button onClick={() => setExpireModalOpenFor(null)}>Cancel</button>
      </div>
    </div>
  </div>
)}

      {/* Map Modal */}
      <MapModal
        isOpen={showMapModal}
        onClose={closeMapModal}
        latitude={mapModalData.latitude}
        longitude={mapModalData.longitude}
        title={mapModalData.title}
        showDirections={mapModalData.showDirections}
        destinationLat={mapModalData.destinationLat}
        destinationLng={mapModalData.destinationLng}
        destinationTitle={mapModalData.destinationTitle}
      />
    </div>
  );
}
