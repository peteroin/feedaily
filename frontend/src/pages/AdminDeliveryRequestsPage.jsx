import React, { useEffect, useState } from "react";
import { FiLogOut } from "react-icons/fi";
import MapModal from "../components/MapModal";
import "./AdminDeliveryRequestsPage.css";

export default function AdminDeliveryRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Available");
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [mapModalUrl, setMapModalUrl] = useState('');
  const [expireModalOpenFor, setExpireModalOpenFor] = useState(null);
  const [expirationReason, setExpirationReason] = useState("");
  const expirationReasons = ["Spoiled", "Not picked up", "Other"];

  useEffect(() => {
    fetch("http://localhost:5000/api/donations")
      .then((res) => res.json())
      .then((data) => {
        const filtered = data.filter(
          (d) =>
            d.status === "Available" ||
            d.status === "Delivering" ||
            d.status === "Delivered"
        );
        setRequests(filtered);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load delivery requests.");
        setLoading(false);
      });
  }, []);

  const requested = requests.filter((r) => r.status === "Available");
  const delivering = requests.filter((r) => r.status === "Delivering");
  const delivered = requests.filter((r) => r.status === "Delivered");

  const tabs = [
    { label: "Available", data: requested },
    { label: "Delivering", data: delivering },
    { label: "Delivered", data: delivered },
  ];

  const handleLogout = () => {
    localStorage.removeItem("adminUser");
    window.location.href = "/admin-login";
  };

  const handleOpenMap = (url) => {
    setMapModalUrl(url);
    setIsMapModalOpen(true);
  };

  const handleCloseMap = () => {
    setIsMapModalOpen(false);
    setMapModalUrl('');
  };

  const TableHeader = () => (
    <thead>
      <tr>
        <th>ID</th>
        <th>Donor</th>

        {activeTab === "Available" && (
          <>
            <th>Donor Location</th>
            <th>Donor Contact</th>
            <th>Donated At</th>
          </>
        )}

        {(activeTab === "Delivering" || activeTab === "Delivered") && (
          <>
            <th>Requester</th>
            <th>Delivery Method</th>
            <th>Route Map</th>
          </>
        )}

        <th>Food</th>
        <th>Quantity</th>
        <th>Status</th>

        {(activeTab === "Delivering" || activeTab === "Delivered") && (
          <th>Requested At</th>
        )}

        <th>
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
      <tr
        key={req.id}
        className={req.status === "Delivered" ? "delivered-row" : ""}
      >
        <td>{req.id}</td>
        <td>
          {req.donorName}
          <br />
          {req.contact}
        </td>

        {currentTab === "Available" && (
          <>
            <td>
              {req.locationLat && req.locationLng ? (
                <button className="admin-action-btn" onClick={() => handleOpenMap(`https://www.google.com/maps?q=${req.locationLat},${req.locationLng}&output=embed`)}>
                  View
                </button>
              ) : ( "N/A" )}
            </td>
            <td>{req.contact || "N/A"}</td>
            <td>
              {req.createdAt
                ? new Date(req.createdAt).toLocaleString()
                : "N/A"}
            </td>
          </>
        )}

        {(currentTab === "Delivering" || currentTab === "Delivered") && (
          <>
            <td>
              {req.requesterName || "N/A"}
              <br />
              {req.requesterContact || "N/A"}
            </td>
            <td>{req.deliveryMethod || "N/A"}</td>
            <td>
              {req.locationLat && req.locationLng && req.requesterLat && req.requesterLng ? (
                <button className="admin-action-btn" onClick={() => handleOpenMap(`https://www.google.com/maps?saddr=${req.requesterLat},${req.requesterLng}&daddr=${req.locationLat},${req.locationLng}&output=embed`)}>
                  View Route
                </button>
              ) : ( "N/A" )}
            </td>
          </>
        )}

        <td>{req.foodType}</td>
        <td>{req.quantity}</td>
        <td className="capitalize">{req.status}</td>

        {(currentTab === "Delivering" || currentTab === "Delivered") && (
          <td>
            {req.requestedAt
              ? new Date(req.requestedAt).toLocaleString()
              : "N/A"}
          </td>
        )}

        <td>
          {currentTab === "Delivering" ? (
            <button className="admin-action-btn">Allocate</button>
          ) : currentTab === "Available" ? (
            <button
              className="admin-action-btn admin-expire-btn"
              onClick={() => setExpireModalOpenFor(req.id)}
            >
              Expire
            </button>
          ) : req.deliveredAt ? (
            new Date(req.deliveredAt).toLocaleString()
          ) : (
            "N/A"
          )}
        </td>
      </tr>
    ));

  return (
    <div className="admin-delivery-container">
      {/* Header */}
      <div className="admin-header">
        <h1>📋 Admin: Delivery Requests</h1>
        <button onClick={handleLogout} className="admin-logout-btn">
          <FiLogOut size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div className="admin-tabs">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            className={`admin-tab-btn ${tab.label.toLowerCase()} ${
              activeTab === tab.label ? "active" : ""
            }`}
          >
            {tab.label} ({tab.data.length})
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <p>Loading delivery requests...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : requests.length === 0 ? (
        <p>No delivery requests found.</p>
      ) : (
        <>
          {tabs.map((tab) => (
            <div
              key={tab.label}
              style={{ display: activeTab === tab.label ? "block" : "none" }}
            >
              {tab.data.length > 0 ? (
                <div className="admin-table-container">
                  <table className="admin-table">
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

      {/* Expire Modal */}
      {expireModalOpenFor && (
        <div className="admin-expire-modal-overlay">
          <div className="admin-expire-modal">
            <h3>Expire Food Donation</h3>
            <label htmlFor="reason">Select Reason</label>
            <select
              id="reason"
              value={expirationReason}
              onChange={(e) => setExpirationReason(e.target.value)}
            >
              <option value="">-- Select --</option>
              {expirationReasons.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
            <div className="admin-expire-modal-actions">
              <button
                className="admin-confirm-btn"
                disabled={!expirationReason}
                onClick={async () => {
                  try {
                    const response = await fetch(
                      `http://localhost:5000/api/expire-donation/${expireModalOpenFor}`,
                      {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ reason: expirationReason }),
                      }
                    );
                    if (response.ok) {
                      alert("Donation expired successfully");
                      setExpireModalOpenFor(null);
                      setExpirationReason("");
                      const res = await fetch("http://localhost:5000/api/donations");
                      const data = await res.json();
                      const filtered = data.filter(
                        (d) =>
                          d.status === "Available" ||
                          d.status === "Delivering" ||
                          d.status === "Delivered"
                      );
                      setRequests(filtered);
                    } else {
                      alert("Failed to expire donation.");
                    }
                  } catch (err) {
                    alert("Error expiring donation.");
                  }
                }}
              >
                Confirm
              </button>
              <button
                className="admin-cancel-btn"
                onClick={() => setExpireModalOpenFor(null)}
              >
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