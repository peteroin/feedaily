import React, { useState, useEffect } from "react";

const STATUS_OPTIONS = ["pending", "in-transit", "delivered", "cancelled"];

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("");

  // Fetch deliveries (with optional status filter)
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

  // Update delivery status
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

  return (
    <div style={{ maxWidth: 1000, margin: "auto", padding: 20 }}>
      <h1>🚚 Delivery Management</h1>

      <div style={{ marginBottom: 20 }}>
        <label htmlFor="statusFilter" style={{ marginRight: 10, fontWeight: "bold" }}>
          Filter by Status:
        </label>
        <select
          id="statusFilter"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          style={{ padding: "5px", fontSize: "1rem" }}
        >
          <option value="">All</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Loading deliveries...</p>
      ) : deliveries.length === 0 ? (
        <p>No deliveries found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Order ID</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Donor</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Receiver</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Food Details</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Status</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Delivery Person</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Estimated Delivery Date</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Delivered At</th>
              <th style={{ border: "1px solid #ddd", padding: 8 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map(
              ({
                id,
                donorName,
                receiverName,
                foodType,
                quantity,
                status,
                deliveryPerson,
                estimatedDeliveryDate,
                deliveredAt,
              }) => (
                <tr key={id}>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{id}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>{donorName || "Unknown"}</td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    {receiverName || "Unknown"}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    {foodType} - {quantity}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8, textTransform: "capitalize" }}>
                    {status}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    {deliveryPerson || "-"}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    {estimatedDeliveryDate
                      ? new Date(estimatedDeliveryDate).toLocaleString()
                      : "-"}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    {deliveredAt ? new Date(deliveredAt).toLocaleString() : "-"}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: 8 }}>
                    <select
                      value={status}
                      onChange={(e) => updateDeliveryStatus(id, e.target.value)}
                      style={{ padding: "4px" }}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt.charAt(0).toUpperCase() + opt.slice(1)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
