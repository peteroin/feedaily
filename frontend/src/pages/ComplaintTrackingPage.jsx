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
    // Check authentication
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Fetch user's complaints
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
        return "status-initiated";
      case "in_progress":
        return "status-progress";
      case "resolved":
        return "status-resolved";
      case "rejected":
        return "status-rejected";
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
    <div className="tracking-page">
      <div className="tracking-container">
        <div className="tracking-header">
          <button onClick={() => navigate("/")} className="back-btn">
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
        <div className="search-section">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-input-group">
              <FiSearch className="search-icon" />
              <input
                type="text"
                placeholder="Enter Complaint Number (e.g., CMP-2025-001)"
                value={complaintNumber}
                onChange={(e) =>
                  setComplaintNumber(e.target.value.toUpperCase())
                }
                className="search-input"
              />
              <button type="submit" className="search-btn" disabled={loading}>
                {loading ? "Searching..." : "Track"}
              </button>
            </div>
            {error && (
              <div className="search-error">
                <FiAlertCircle /> {error}
              </div>
            )}
          </form>
        </div>

        {/* Complaint Details */}
        {complaint && (
          <div className="complaint-details">
            <div className="detail-card">
              <div className="card-header">
                <h2>Complaint Details</h2>
                <span
                  className={`status-badge ${getStatusClass(complaint.status)}`}
                >
                  {getStatusIcon(complaint.status)}
                  {getStatusText(complaint.status)}
                </span>
              </div>

              <div className="detail-grid">
                <div className="detail-item">
                  <label>Complaint Number</label>
                  <p className="complaint-num">{complaint.complaintNumber}</p>
                </div>

                <div className="detail-item">
                  <label>Filed On</label>
                  <p>
                    <FiCalendar /> {formatDate(complaint.createdAt)}
                  </p>
                </div>

                <div className="detail-item">
                  <label>Complaint Type</label>
                  <p>{getComplaintTypeText(complaint.complaintType)}</p>
                </div>

                {complaint.againstPersonName && (
                  <div className="detail-item">
                    <label>Against</label>
                    <p>
                      <FiUser /> {complaint.againstPersonName}
                    </p>
                  </div>
                )}

                <div className="detail-item full-width">
                  <label>Complaint Details</label>
                  <p className="detail-text">{complaint.details}</p>
                </div>

                {complaint.proof && (
                  <div className="detail-item full-width">
                    <label>Attached Proof</label>
                    <img
                      src={complaint.proof}
                      alt="Proof"
                      className="proof-image"
                      onClick={() => window.open(complaint.proof, "_blank")}
                    />
                  </div>
                )}

                {complaint.adminResponse && (
                  <div className="detail-item full-width">
                    <label>Admin Response</label>
                    <div className="admin-response">
                      <p>{complaint.adminResponse}</p>
                      {complaint.resolvedAt && (
                        <span className="response-date">
                          Responded on {formatDate(complaint.resolvedAt)}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Status Timeline */}
            <div className="timeline-card">
              <h3>Status Timeline</h3>
              <div className="timeline">
                <div
                  className={`timeline-item ${
                    complaint.status === "initiated" ? "active" : "completed"
                  }`}
                >
                  <div className="timeline-icon">
                    <FiClock />
                  </div>
                  <div className="timeline-content">
                    <h4>Complaint Initiated</h4>
                    <p>{formatDate(complaint.createdAt)}</p>
                  </div>
                </div>

                {(complaint.status === "in_progress" ||
                  complaint.status === "resolved" ||
                  complaint.status === "rejected") && (
                  <div
                    className={`timeline-item ${
                      complaint.status === "in_progress"
                        ? "active"
                        : "completed"
                    }`}
                  >
                    <div className="timeline-icon">
                      <FiAlertCircle />
                    </div>
                    <div className="timeline-content">
                      <h4>Under Review</h4>
                      <p>Admin is reviewing your complaint</p>
                    </div>
                  </div>
                )}

                {complaint.status === "resolved" && (
                  <div className="timeline-item completed">
                    <div className="timeline-icon">
                      <FiCheckCircle />
                    </div>
                    <div className="timeline-content">
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
                  <div className="timeline-item rejected">
                    <div className="timeline-icon">
                      <FiXCircle />
                    </div>
                    <div className="timeline-content">
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
          <div className="user-complaints-section">
            <h2>Your Recent Complaints</h2>
            <div className="complaints-list">
              {userComplaints.map((comp) => (
                <div
                  key={comp.id}
                  className="complaint-item"
                  onClick={() => {
                    setComplaintNumber(comp.complaintNumber);
                    setComplaint(comp);
                  }}
                >
                  <div className="complaint-item-header">
                    <span className="complaint-number">
                      {comp.complaintNumber}
                    </span>
                    <span
                      className={`status-badge ${getStatusClass(comp.status)}`}
                    >
                      {getStatusIcon(comp.status)}
                      {getStatusText(comp.status)}
                    </span>
                  </div>
                  <p className="complaint-type">
                    {getComplaintTypeText(comp.complaintType)}
                  </p>
                  <p className="complaint-date">
                    <FiCalendar /> {formatDate(comp.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!complaint && !loading && userComplaints.length === 0 && (
          <div className="empty-state">
            <FiFileText className="empty-icon" />
            <h3>No Complaints Yet</h3>
            <p>You haven't filed any complaints yet</p>
            <button
              onClick={() => navigate("/complaints")}
              className="btn-primary"
            >
              File a Complaint
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
