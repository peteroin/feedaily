import React, { useEffect, useState } from "react";
import { FiLogOut } from "react-icons/fi";
import "./AdminDeliveryRequestsPage.css";

export default function AdminDeliveryRequestsPage() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Available");
  const [expireModalOpenFor, setExpireModalOpenFor] = useState(null);
  const [expirationReason, setExpirationReason] = useState("");
  const expirationReasons = ["Spoiled", "Not picked up", "Other"];
  const [collaborations, setCollaborations] = useState([]);
  const [collabActiveTab, setCollabActiveTab] = useState("Available");

  useEffect(() => {
    fetch("http://localhost:5000/api/collaborations")
      .then((res) => res.json())
      .then((data) => setCollaborations(data))
      .catch(() => console.error("Failed to fetch collaborations"));
  }, []);
  const collabAvailable = collaborations.filter(
    (c) => c.acceptedByAdmin === null
  );
  const collabAccepted = collaborations.filter(
    (c) => c.acceptedByAdmin === "Accepted"
  );
  const collabRejected = collaborations.filter(
    (c) => c.acceptedByAdmin === "Rejected"
  );

  const collabTabs = [
    { label: "Available", data: collabAvailable },
    { label: "Accepted", data: collabAccepted },
    { label: "Rejected", data: collabRejected },
  ];

  const CollabTableHeader = () => (
    <thead>
      <tr>
        <th>ID</th>
        <th>Type</th>
        <th>Form Data</th>
        <th>File</th>
        {collabActiveTab === "Available" && <th>Action</th>}
        {collabActiveTab !== "Available" && <th>Status</th>}
      </tr>
    </thead>
  );

  // Function to update status
  const updateCollabStatus = async (id, status) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/collaborations/${id}/status`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ acceptedByAdmin: status }),
        }
      );
      if (res.ok) {
        setCollaborations((prev) =>
          prev.map((r) => (r.id === id ? { ...r, acceptedByAdmin: status } : r))
        );
        // Move it out of Available automatically
        setCollabActiveTab(status);
      } else alert("Failed to update status.");
    } catch (err) {
      alert("Error updating status.");
    }
  };

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
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${req.locationLat},${req.locationLng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View
                </a>
              ) : (
                "N/A"
              )}
            </td>
            <td>{req.contact || "N/A"}</td>
            <td>
              {req.createdAt ? new Date(req.createdAt).toLocaleString() : "N/A"}
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
              {req.locationLat &&
              req.locationLng &&
              req.requesterLat &&
              req.requesterLng ? (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&origin=${req.locationLat},${req.locationLng}&destination=${req.requesterLat},${req.requesterLng}&travelmode=driving`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View Route on Map
                </a>
              ) : (
                "N/A"
              )}
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
                      const res = await fetch(
                        "http://localhost:5000/api/donations"
                      );
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

      {/* Collaboration Requests */}
      <div style={{ marginTop: "80px" }} className="admin-collab-section">
        <h2>📋 Admin: Collaboration Requests</h2>

        {/* Collaboration Tabs */}
        <div className="admin-tabs">
          {collabTabs.map((tab) => (
            <button
              key={tab.label}
              onClick={() => setCollabActiveTab(tab.label)}
              className={`admin-tab-btn ${tab.label.toLowerCase()} ${
                collabActiveTab === tab.label ? "active" : ""
              }`}
            >
              {tab.label} ({tab.data.length})
            </button>
          ))}
        </div>

        {/* Collaboration Table */}
        {collabTabs.map((tab) => (
          <div
            key={tab.label}
            style={{
              display: collabActiveTab === tab.label ? "block" : "none",
            }}
          >
            {tab.data.length > 0 ? (
              <div className="admin-table-container">
                <table className="admin-table">
                  <CollabTableHeader />
                  <tbody>
                    {tab.data.map((req) => (
                      <tr key={req.id}>
                        <td>{req.id}</td>
                        <td>{req.type}</td>

                        {/* Structured Form Data */}
                        <td>
                          <table className="nested-table mx-auto">
                            <tbody>
                              {Object.entries(JSON.parse(req.formData)).map(
                                ([key, value]) => (
                                  <tr key={key}>
                                    <td>
                                      <b>{key}</b>
                                    </td>
                                    <td>{value}</td>
                                  </tr>
                                )
                              )}
                            </tbody>
                          </table>
                        </td>

                        <td>
                          <div className="flex justify-center items-center w-full">
                            {req.filePath ? (
                              <img
                                src={req.filePath}
                                alt="Uploaded"
                                style={{ width: "120px", borderRadius: "8px" }}
                              />
                            ) : (
                              "N/A"
                            )}
                          </div>
                        </td>

                        {/* Action or Status */}
                        {tab.label === "Available" ? (
                          <td>
                            <button
                              className="text-white border-0 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors duration-200 hover:bg-blue-700 bg-green-600 mr-2"
                              onClick={() =>
                                updateCollabStatus(req.id, "Accepted")
                              }
                            >
                              Accept
                            </button>
                            <button
                              className="bg-red-600 text-white border-0 px-3 py-1.5 rounded-md text-sm cursor-pointer transition-colors duration-200 hover:bg-blue-700"
                              onClick={() =>
                                updateCollabStatus(req.id, "Rejected")
                              }
                            >
                              Reject
                            </button>
                          </td>
                        ) : (
                          <td
                            style={{
                              color:
                                tab.label === "Accepted"
                                  ? "green"
                                  : tab.label === "Rejected"
                                  ? "red"
                                  : "black",
                            }}
                          >
                            {req.acceptedByAdmin}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No {tab.label.toLowerCase()} collaboration requests.</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
