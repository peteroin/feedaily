// src/components/DeliveryMethodModal.jsx
import React from "react";

export default function DeliveryMethodModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  selectedMethod, 
  setSelectedMethod 
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      top:0, left:0, right:0, bottom:0,
      backgroundColor: "rgba(0,0,0,0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: "white",
        padding: 20,
        borderRadius: 8,
        maxWidth: 320,
        width: "90%",
        textAlign: "center"
      }}>
        <h3>Choose delivery method</h3>

        <label>
          <input
            type="radio"
            name="deliveryMethod"
            value="delivery"
            checked={selectedMethod === "delivery"}
            onChange={() => setSelectedMethod("delivery")}
          />
          Delivery
        </label>

        <label style={{ marginLeft: 20 }}>
          <input
            type="radio"
            name="deliveryMethod"
            value="pickup"
            checked={selectedMethod === "pickup"}
            onChange={() => setSelectedMethod("pickup")}
          />
          In-person Pickup
        </label>

        <div style={{ marginTop: 20 }}>
          <button onClick={onConfirm} disabled={!selectedMethod}>
            Confirm
          </button>

          <button onClick={onClose} style={{ marginLeft: 10 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
