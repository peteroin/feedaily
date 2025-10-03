import React, { useState, useEffect } from "react";
import { 
  FiTruck, 
  FiFilter, 
  FiRefreshCw, 
  FiUser, 
  FiPackage, 
  FiCalendar,
  FiClock,
  FiCheckCircle,
  FiXCircle,
  FiMapPin,
  FiEdit,
  FiSearch
} from "react-icons/fi";
import "./DeliveryPage.css";

const STATUS_OPTIONS = ["pending", "in-transit", "delivered", "cancelled"];

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [editForm, setEditForm] = useState({});

  const fetchDeliveries = async () => {
    try {
      let url = "http://localhost:5000/api/deliveries";
      if (filterStatus) {
        url += `?status=${filterStatus}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      setDeliveries(data);
    } catch (err) {
      console.error("Failed to fetch deliveries:", err);
      setDeliveries([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchDeliveries();
  }, [filterStatus]);

  const updateDeliveryStatus = async (id, newStatus) => {
    try {
      const res = await fetch(`http://localhost:5000/api/deliveries/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Delivery updated");
        fetchDeliveries();
      } else {
        alert(data.message || "Failed to update delivery");
      }
    } catch (err) {
      console.error("Error updating delivery status:", err);
      alert("Error updating delivery status");
    }
  };

  const updateDeliveryDetails = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/deliveries/${editingDelivery}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message || "Delivery details updated");
        setEditingDelivery(null);
        setEditForm({});
        fetchDeliveries();
      } else {
        alert(data.message || "Failed to update delivery details");
      }
    } catch (err) {
      console.error("Error updating delivery details:", err);
      alert("Error updating delivery details");
    }
  };

  const filteredDeliveries = deliveries.filter(delivery =>
    delivery.donorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.receiverName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.foodType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.deliveryPerson?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    delivery.id?.toString().includes(searchTerm)
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <FiClock className="status-icon" />;
      case 'in-transit': return <FiTruck className="status-icon" />;
      case 'delivered': return <FiCheckCircle className="status-icon" />;
      case 'cancelled': return <FiXCircle className="status-icon" />;
      default: return <FiClock className="status-icon" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'pending': return 'pending';
      case 'in-transit': return 'in-transit';
      case 'delivered': return 'delivered';
      case 'cancelled': return 'cancelled';
      default: return 'pending';
    }
  };

  return (
    <div className="delivery-container">
      {/* Header Section */}
      <div className="delivery-header">
        <div className="header-content">
          <div className="header-text">
            <h1>Delivery Management</h1>
            <p>Track and manage all food deliveries</p>
          </div>
          <div className="header-icon">
            <FiTruck />
          </div>
        </div>
      </div>

      {/* Controls Section */}
      <div className="controls-section">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search deliveries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <FiFilter className="filter-icon" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="status-filter"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <button onClick={fetchDeliveries} className="refresh-btn">
            <FiRefreshCw />
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">
            <FiTruck />
          </div>
          <div className="stat-content">
            <h3>{deliveries.length}</h3>
            <p>Total Deliveries</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiClock />
          </div>
          <div className="stat-content">
            <h3>{deliveries.filter(d => d.status === 'pending').length}</h3>
            <p>Pending</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiTruck />
          </div>
          <div className="stat-content">
            <h3>{deliveries.filter(d => d.status === 'in-transit').length}</h3>
            <p>In Transit</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{deliveries.filter(d => d.status === 'delivered').length}</h3>
            <p>Delivered</p>
          </div>
        </div>
      </div>

      {/* Deliveries List */}
      <div className="deliveries-section">
        {loading ? (
          <div className="loading-state">
            <FiRefreshCw className="spinner" />
            <p>Loading deliveries...</p>
          </div>
        ) : filteredDeliveries.length === 0 ? (
          <div className="empty-state">
            <FiTruck className="empty-icon" />
            <h3>No deliveries found</h3>
            <p>{searchTerm || filterStatus ? "Try adjusting your search or filter" : "No deliveries have been scheduled yet"}</p>
          </div>
        ) : (
          <div className="deliveries-grid">
            {filteredDeliveries.map((delivery) => (
              <div key={delivery.id} className="delivery-card">
                <div className="card-header">
                  <div className="delivery-id">Order #{delivery.id}</div>
                  <div className={`status-badge ${getStatusClass(delivery.status)}`}>
                    {getStatusIcon(delivery.status)}
                    <span>{delivery.status.charAt(0).toUpperCase() + delivery.status.slice(1)}</span>
                  </div>
                </div>

                <div className="card-content">
                  <div className="delivery-parties">
                    <div className="party-info">
                      <FiUser className="party-icon" />
                      <div>
                        <div className="party-label">From</div>
                        <div className="party-name">{delivery.donorName || "Unknown"}</div>
                      </div>
                    </div>
                    <div className="party-info">
                      <FiUser className="party-icon" />
                      <div>
                        <div className="party-label">To</div>
                        <div className="party-name">{delivery.receiverName || "Unknown"}</div>
                      </div>
                    </div>
                  </div>

                  <div className="food-details">
                    <div className="food-info">
                      <FiPackage className="food-icon" />
                      <div>
                        <div className="food-type">{delivery.foodType}</div>
                        <div className="food-quantity">{delivery.quantity}</div>
                      </div>
                    </div>
                  </div>

                  <div className="delivery-info">
                    {delivery.deliveryPerson && (
                      <div className="info-item">
                        <span className="info-label">Delivery Person:</span>
                        <span className="info-value">{delivery.deliveryPerson}</span>
                      </div>
                    )}
                    
                    {delivery.estimatedDeliveryDate && (
                      <div className="info-item">
                        <span className="info-label">Estimated Delivery:</span>
                        <span className="info-value">
                          {new Date(delivery.estimatedDeliveryDate).toLocaleString()}
                        </span>
                      </div>
                    )}
                    
                    {delivery.deliveredAt && (
                      <div className="info-item">
                        <span className="info-label">Delivered At:</span>
                        <span className="info-value">
                          {new Date(delivery.deliveredAt).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="card-actions">
                  <select
                    value={delivery.status}
                    onChange={(e) => updateDeliveryStatus(delivery.id, e.target.value)}
                    className="status-select"
                  >
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt.charAt(0).toUpperCase() + opt.slice(1)}
                      </option>
                    ))}
                  </select>

                  <button 
                    onClick={() => {
                      setEditingDelivery(delivery.id);
                      setEditForm({
                        deliveryPerson: delivery.deliveryPerson || "",
                        estimatedDeliveryDate: delivery.estimatedDeliveryDate || ""
                      });
                    }}
                    className="edit-btn"
                  >
                    <FiEdit />
                    Edit Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      {editingDelivery && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Delivery Details</h2>
              <button 
                onClick={() => {
                  setEditingDelivery(null);
                  setEditForm({});
                }}
                className="modal-close"
              >
                <FiXCircle />
              </button>
            </div>

            <form onSubmit={updateDeliveryDetails} className="edit-form">
              <div className="form-group">
                <label>Delivery Person</label>
                <input
                  type="text"
                  value={editForm.deliveryPerson || ""}
                  onChange={(e) => setEditForm({...editForm, deliveryPerson: e.target.value})}
                  placeholder="Enter delivery person name"
                />
              </div>

              <div className="form-group">
                <label>Estimated Delivery Date</label>
                <input
                  type="datetime-local"
                  value={editForm.estimatedDeliveryDate ? new Date(editForm.estimatedDeliveryDate).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setEditForm({...editForm, estimatedDeliveryDate: e.target.value})}
                />
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => {
                  setEditingDelivery(null);
                  setEditForm({});
                }} className="cancel-btn">
                  Cancel
                </button>
                <button type="submit" className="save-btn">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}