import React, { useEffect, useState } from "react";
import { FiUsers, FiFileText, FiCheck, FiX } from "react-icons/fi";
import "./AdminCollaborationRequestsPage.css";

export default function AdminCollaborationRequestsPage() {
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("Available");

  useEffect(() => {
    fetchCollaborations();
  }, []);

  const fetchCollaborations = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/collaborations");
      if (response.ok) {
        const data = await response.json();
        setCollaborations(data);
      } else {
        setError("Failed to fetch collaboration requests");
      }
    } catch (error) {
      console.error("Error fetching collaborations:", error);
      setError("Network error while fetching collaborations");
    } finally {
      setLoading(false);
    }
  };

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
        setActiveTab(status);
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      alert("Error updating status.");
    }
  };

  const CollabTableHeader = () => (
    <thead>
      <tr>
        <th>ID</th>
        <th>Type</th>
        <th>Form Data</th>
        <th>File</th>
        {activeTab === "Available" && <th>Action</th>}
        {activeTab !== "Available" && <th>Status</th>}
      </tr>
    </thead>
  );

  if (loading) {
    return (
      <div className="admin-collaboration-page">
        <div className="admin-page-header">
          <h1>🤝 Collaboration Requests Management</h1>
          <p>Manage partnership and collaboration requests</p>
        </div>
        <div className="loading">Loading collaboration requests...</div>
      </div>
    );
  }

  return (
    <div className="admin-collaboration-page">
      <div className="admin-page-header">
        <h1>🤝 Collaboration Requests Management</h1>
        <p>Manage partnership and collaboration requests</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Collaboration Tabs */}
      <div className="admin-tabs">
        {collabTabs.map((tab) => (
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

      {/* Collaboration Table */}
      {collabTabs.map((tab) => (
        <div
          key={tab.label}
          style={{
            display: activeTab === tab.label ? "block" : "none",
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
                            className="admin-action-btn accept-btn"
                            onClick={() => updateCollabStatus(req.id, "Accepted")}
                          >
                            <FiCheck size={16} />
                            Accept
                          </button>
                          <button
                            className="admin-action-btn reject-btn"
                            onClick={() => updateCollabStatus(req.id, "Rejected")}
                          >
                            <FiX size={16} />
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
  );
}
