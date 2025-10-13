import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiFilter,
  FiSearch,
  FiUser,
  FiCalendar,
  FiFileText,
  FiSend,
} from "react-icons/fi";
import "./AdminComplaintsPage.css";

export default function AdminComplaintsPage() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({
    status: "",
    response: "",
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Check admin authentication
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/admin-login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    if (parsedUser.type !== "Admin") {
      navigate("/");
      return;
    }

    fetchComplaints();
  }, [navigate]);

  useEffect(() => {
    filterComplaints();
  }, [filterStatus, searchQuery, complaints]);

  const fetchComplaints = async () => {
    try {
      const response = await fetch("http://localhost:5000/api/complaints");
      if (response.ok) {
        const data = await response.json();
        setComplaints(data);
        setFilteredComplaints(data);
      }
    } catch (error) {
      console.error("Error fetching complaints:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterComplaints = () => {
    let filtered = [...complaints];

    // Filter by status
    if (filterStatus !== "all") {
      filtered = filtered.filter((c) => c.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.complaintNumber.toLowerCase().includes(query) ||
          c.userName.toLowerCase().includes(query) ||
          c.details.toLowerCase().includes(query)
      );
    }

    setFilteredComplaints(filtered);
  };

  const openUpdateModal = (complaint) => {
    setSelectedComplaint(complaint);
    setModalData({
      status: complaint.status,
      response: complaint.adminResponse || "",
    });
    setShowModal(true);
  };

  const handleUpdateComplaint = async () => {
    if (!modalData.status) {
      alert("Please select a status");
      return;
    }

    if (
      (modalData.status === "resolved" || modalData.status === "rejected") &&
      !modalData.response.trim()
    ) {
      alert("Please provide a response");
      return;
    }

    setIsUpdating(true);

    try {
      const response = await fetch(
        `http://localhost:5000/api/complaints/${selectedComplaint.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: modalData.status,
            adminResponse: modalData.response,
          }),
        }
      );

      if (response.ok) {
        alert("Complaint updated successfully");
        setShowModal(false);
        fetchComplaints();
      } else {
        const data = await response.json();
        alert(data.message || "Failed to update complaint");
      }
    } catch (error) {
      console.error("Error updating complaint:", error);
      alert("An error occurred. Please try again.");
    } finally {
      setIsUpdating(false);
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
        return "Initiated";
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

  const getStats = () => {
    return {
      total: complaints.length,
      initiated: complaints.filter((c) => c.status === "initiated").length,
      inProgress: complaints.filter((c) => c.status === "in_progress").length,
      resolved: complaints.filter((c) => c.status === "resolved").length,
      rejected: complaints.filter((c) => c.status === "rejected").length,
    };
  };

  const stats = getStats();

  return (
    <div className="admin-complaints-page">
      <div className="admin-header">
        <div>
          <h1>
            <FiAlertCircle /> Complaint Management
          </h1>
          <p>Manage and resolve user complaints</p>
        </div>
        <button
          onClick={() => navigate("/admin/delivery-requests")}
          className="back-btn"
        >
          Back to Admin Dashboard
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon all">
            <FiFileText />
          </div>
          <div className="stat-info">
            <p className="stat-label">Total Complaints</p>
            <p className="stat-value">{stats.total}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon initiated">
            <FiClock />
          </div>
          <div className="stat-info">
            <p className="stat-label">Initiated</p>
            <p className="stat-value">{stats.initiated}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon progress">
            <FiAlertCircle />
          </div>
          <div className="stat-info">
            <p className="stat-label">In Progress</p>
            <p className="stat-value">{stats.inProgress}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon resolved">
            <FiCheckCircle />
          </div>
          <div className="stat-info">
            <p className="stat-label">Resolved</p>
            <p className="stat-value">{stats.resolved}</p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="controls-section">
        <div className="filter-group">
          <FiFilter />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Complaints</option>
            <option value="initiated">Initiated</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        <div className="search-group">
          <FiSearch />
          <input
            type="text"
            placeholder="Search by complaint number, user name, or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Complaints Table */}
      <div className="complaints-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading complaints...</p>
          </div>
        ) : filteredComplaints.length === 0 ? (
          <div className="empty-state">
            <FiFileText className="empty-icon" />
            <h3>No Complaints Found</h3>
            <p>There are no complaints matching your filters</p>
          </div>
        ) : (
          <table className="complaints-table">
            <thead>
              <tr>
                <th>Complaint #</th>
                <th>User</th>
                <th>Type</th>
                <th>Against</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredComplaints.map((complaint) => (
                <tr key={complaint.id}>
                  <td className="complaint-num">{complaint.complaintNumber}</td>
                  <td>
                    <div className="user-cell">
                      <FiUser />
                      <div>
                        <p className="user-name">{complaint.userName}</p>
                        <p className="user-email">{complaint.userEmail}</p>
                      </div>
                    </div>
                  </td>
                  <td>{getComplaintTypeText(complaint.complaintType)}</td>
                  <td>{complaint.againstPersonName || "-"}</td>
                  <td>
                    <div className="date-cell">
                      <FiCalendar />
                      {formatDate(complaint.createdAt)}
                    </div>
                  </td>
                  <td>
                    <span
                      className={`status-badge ${getStatusClass(
                        complaint.status
                      )}`}
                    >
                      {getStatusIcon(complaint.status)}
                      {getStatusText(complaint.status)}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => openUpdateModal(complaint)}
                      className="action-btn"
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Update Modal */}
      {showModal && selectedComplaint && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Review Complaint</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">
                <FiXCircle />
              </button>
            </div>

            <div className="modal-body">
              {/* Complaint Details */}
              <div className="complaint-info">
                <div className="info-row">
                  <label>Complaint Number</label>
                  <p className="complaint-num">
                    {selectedComplaint.complaintNumber}
                  </p>
                </div>

                <div className="info-row">
                  <label>User</label>
                  <p>
                    {selectedComplaint.userName} ({selectedComplaint.userEmail})
                  </p>
                </div>

                <div className="info-row">
                  <label>Type</label>
                  <p>{getComplaintTypeText(selectedComplaint.complaintType)}</p>
                </div>

                {selectedComplaint.againstPersonName && (
                  <div className="info-row">
                    <label>Against</label>
                    <p>{selectedComplaint.againstPersonName}</p>
                  </div>
                )}

                <div className="info-row">
                  <label>Filed On</label>
                  <p>{formatDate(selectedComplaint.createdAt)}</p>
                </div>

                <div className="info-row full-width">
                  <label>Details</label>
                  <p className="detail-text">{selectedComplaint.details}</p>
                </div>

                {selectedComplaint.proof && (
                  <div className="info-row full-width">
                    <label>Proof</label>
                    <img
                      src={selectedComplaint.proof}
                      alt="Proof"
                      className="proof-image"
                      onClick={() =>
                        window.open(selectedComplaint.proof, "_blank")
                      }
                    />
                  </div>
                )}
              </div>

              {/* Update Form */}
              <div className="update-form">
                <div className="form-group">
                  <label>Update Status *</label>
                  <select
                    value={modalData.status}
                    onChange={(e) =>
                      setModalData({ ...modalData, status: e.target.value })
                    }
                    className="status-select"
                  >
                    <option value="initiated">Initiated</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>
                    Admin Response{" "}
                    {(modalData.status === "resolved" ||
                      modalData.status === "rejected") &&
                      "*"}
                  </label>
                  <textarea
                    value={modalData.response}
                    onChange={(e) =>
                      setModalData({ ...modalData, response: e.target.value })
                    }
                    placeholder="Provide a detailed response to the user..."
                    rows="4"
                    className="response-textarea"
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowModal(false)}
                className="btn-secondary"
                disabled={isUpdating}
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateComplaint}
                className="btn-primary"
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <span className="spinner"></span>
                    Updating...
                  </>
                ) : (
                  <>
                    <FiSend /> Update Complaint
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
