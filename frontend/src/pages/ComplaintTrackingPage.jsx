import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiSearch,
  FiAlertCircle,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiFileText,
  FiUser,
  FiCalendar,
  FiArrowLeft,
} from "react-icons/fi";
import "./ComplaintTrackingPage.css";

export default function ComplaintTrackingPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [complaintNumber, setComplaintNumber] = useState("");
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userComplaints, setUserComplaints] = useState([]);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    fetchUserComplaints(parsedUser.id);
  }, [navigate]);

  const fetchUserComplaints = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/complaints/user/${userId}`
      );
      if (response.ok) {
        const data = await response.json();
        setUserComplaints(data);
      }
    } catch (error) {
      console.error("Error fetching user complaints:", error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!complaintNumber.trim()) {
      setError("Please enter a complaint number");
      return;
    }

    setLoading(true);
    setError("");
    setComplaint(null);

    try {
      const response = await fetch(
        `http://localhost:5000/api/complaints/track/${complaintNumber}`
      );
      const data = await response.json();

      if (response.ok) {
        setComplaint(data);
      } else {
        setError(data.message || "Complaint not found");
      }
    } catch (error) {
      console.error("Error tracking complaint:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "initiated":
        return <FiClock />;
      case "in_progress":
        return <FiAlertCircle />;
      case "resolved":
        return <FiCheckCircle />;
      case "rejected":
        return <FiXCircle />;
      default:
        return <FiFileText />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "initiated":
        return "ctp-status-initiated";
      case "in_progress":
        return "ctp-status-progress";
      case "resolved":
        return "ctp-status-resolved";
      case "rejected":
        return "ctp-status-rejected";
      default:
        return "";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "initiated":
        return "Complaint Initiated";
      case "in_progress":
        return "In Progress";
      case "resolved":
        return "Resolved";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  const getComplaintTypeText = (type) => {
    switch (type) {
      case "donor":
        return "Donor";
      case "delivery_buddy":
        return "Delivery Buddy";
      case "platform":
        return "Platform";
      case "other":
        return "Other";
      default:
        return type;
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="ctp-page">
      <div className="ctp-container">
        <div className="ctp-header">
          <button onClick={() => navigate("/")} className="ctp-back-btn">
            <FiArrowLeft /> Back to Home
          </button>
          <div>
            <h1>
              <FiSearch /> Track Complaint
            </h1>
            <p>Enter your complaint number to track its status</p>
          </div>
        </div>

        {/* Search Form */}
        <div className="ctp-search-section">
          <form onSubmit={handleSearch} className="ctp-search-form">
            <div className="ctp-search-input-group">
              <FiSearch className="ctp-search-icon" />
              <input
                type="text"
                placeholder="Enter Complaint Number (e.g., CMP-2025-001)"
                value={complaintNumber}
                onChange={(e) =>
                  setComplaintNumber(e.target.value.toUpperCase())
                }
                className="ctp-search-input"
              />
              <button type="submit" className="ctp-search-btn" disabled={loading}>
                {loading ? "Searching..." : "Track"}
              </button>
            </div>
            {error && (
              <div className="ctp-search-error">
                <FiAlertCircle /> {error}
              </div>
            )}
          </form>
        </div>

        {/* Complaint Details */}
        {complaint && (
          <div className="ctp-complaint-details">
            <div className="ctp-detail-card">
              <div className="ctp-card-header">
                <h2>Complaint Details</h2>
                <span className={`ctp-status-badge ${getStatusClass(complaint.status)}`}>
                  {getStatusIcon(complaint.status)}
                  {getStatusText(complaint.status)}
                </span>
              </div>

              <div className="ctp-detail-grid">
                <div className="ctp-detail-item">
                  <label>Complaint Number</label>
                  <p className="ctp-complaint-num">{complaint.complaintNumber}</p>
                </div>

                <div className="ctp-detail-item">
                  <label>Filed On</label>
                  <p>
                    <FiCalendar /> {formatDate(complaint.createdAt)}
                  </p>
                </div>

                <div className="ctp-detail-item">
                  <label>Complaint Type</label>
                  <p>{getComplaintTypeText(complaint.complaintType)}</p>
                </div>

                {complaint.againstPersonName && (
                  <div className="ctp-detail-item">
                    <label>Against</label>
                    <p>
                      <FiUser /> {complaint.againstPersonName}
                    </p>
                  </div>
                )}

                <div className="ctp-detail-item full-width">
                  <label>Complaint Details</label>
                  <p className="ctp-detail-text">{complaint.details}</p>
                </div>

                {complaint.proof && (
                  <div className="ctp-detail-item full-width">
                    <label>Attached Proof</label>
                    <img
                      src={complaint.proof}
                      alt="Proof"
                      className="ctp-proof-image"
                      onClick={() => window.open(complaint.proof, "_blank")}
                    />
                  </div>
                )}

                {complaint.adminResponse && (
                  <div className="ctp-detail-item full-width">
                    <label>Admin Response</label>
                    <div className="ctp-admin-response">
                      <p>{complaint.adminResponse}</p>
                      {complaint.resolvedAt && (
                        <span className="ctp-response-date">
                          Responded on {formatDate(complaint.resolvedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Timeline */}
            <div className="ctp-timeline-card">
              <h3>Status Timeline</h3>
              <div className="ctp-timeline">
                <div
                  className={`ctp-timeline-item ${
                    complaint.status === "initiated" ? "active" : "completed"
                  }`}
                >
                  <div className="ctp-timeline-icon">
                    <FiClock />
                  </div>
                  <div className="ctp-timeline-content">
                    <h4>Complaint Initiated</h4>
                    <p>{formatDate(complaint.createdAt)}</p>
                  </div>
                </div>

                {(complaint.status === "in_progress" ||
                  complaint.status === "resolved" ||
                  complaint.status === "rejected") && (
                  <div
                    className={`ctp-timeline-item ${
                      complaint.status === "in_progress" ? "active" : "completed"
                    }`}
                  >
                    <div className="ctp-timeline-icon">
                      <FiAlertCircle />
                    </div>
                    <div className="ctp-timeline-content">
                      <h4>Under Review</h4>
                      <p>Admin is reviewing your complaint</p>
                    </div>
                  </div>
                )}

                {complaint.status === "resolved" && (
                  <div className="ctp-timeline-item completed">
                    <div className="ctp-timeline-icon">
                      <FiCheckCircle />
                    </div>
                    <div className="ctp-timeline-content">
                      <h4>Resolved</h4>
                      <p>
                        {complaint.resolvedAt
                          ? formatDate(complaint.resolvedAt)
                          : "Recently"}
                      </p>
                    </div>
                  </div>
                )}

                {complaint.status === "rejected" && (
                  <div className="ctp-timeline-item rejected">
                    <div className="ctp-timeline-icon">
                      <FiXCircle />
                    </div>
                    <div className="ctp-timeline-content">
                      <h4>Rejected</h4>
                      <p>
                        {complaint.resolvedAt
                          ? formatDate(complaint.resolvedAt)
                          : "Recently"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* User's All Complaints */}
        {userComplaints.length > 0 && (
          <div className="ctp-user-complaints-section">
            <h2>Your Recent Complaints</h2>
            <div className="ctp-complaints-list">
              {userComplaints.map((comp) => (
                <div
                  key={comp.id}
                  className="ctp-complaint-item"
                  onClick={() => {
                    setComplaintNumber(comp.complaintNumber);
                    setComplaint(comp);
                  }}
                >
                  <div className="ctp-complaint-item-header">
                    <span className="ctp-complaint-number">{comp.complaintNumber}</span>
                    <span className={`ctp-status-badge ${getStatusClass(comp.status)}`}>
                      {getStatusIcon(comp.status)}
                      {getStatusText(comp.status)}
                    </span>
                  </div>
                  <p className="ctp-complaint-type">{getComplaintTypeText(comp.complaintType)}</p>
                  <p className="ctp-complaint-date">
                    <FiCalendar /> {formatDate(comp.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!complaint && !loading && userComplaints.length === 0 && (
          <div className="ctp-empty-state">
            <FiFileText className="ctp-empty-icon" />
            <h3>No Complaints Yet</h3>
            <p>You haven't filed any complaints yet</p>
            <button
              onClick={() => navigate("/complaints")}
              className="ctp-btn-primary"
            >
              File a Complaint
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
