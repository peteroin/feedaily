import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiCheck, FiPackage } from "react-icons/fi";
import "./MerchandiseSuccessPage.css";

export default function MerchandiseSuccessPage() {
  const navigate = useNavigate();
  const [orderSaved, setOrderSaved] = useState(false);

  useEffect(() => {
    // Save order to database after successful payment
    const saveOrder = async () => {
      const pendingOrder = localStorage.getItem("pendingMerchandiseOrder");
      const user = localStorage.getItem("user");

      if (pendingOrder && user) {
        const orderDetails = JSON.parse(pendingOrder);
        const userData = JSON.parse(user);

        try {
          const res = await fetch(
            "http://localhost:5000/api/merchandise/orders",
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                userId: userData.id,
                orderData: orderDetails.items,
                shippingAddress: orderDetails.shippingAddress,
                totalAmount: orderDetails.total,
              }),
            }
          );

          if (res.ok) {
            // Clear cart and pending order
            localStorage.removeItem("merchandiseCart");
            localStorage.removeItem("pendingMerchandiseOrder");
            setOrderSaved(true);
          }
        } catch (error) {
          console.error("Error saving order:", error);
        }
      }
    };

    saveOrder();
  }, []);

  return (
    <div className="merchandise-success-page">
      <div className="success-container">
        <div className="success-icon">
          <FiCheck />
        </div>

        <h1>Order Placed Successfully!</h1>
        <p>
          Thank you for your purchase. Your order has been confirmed and will be
          delivered soon.
        </p>

        {orderSaved && (
          <div className="order-info">
            <FiPackage className="info-icon" />
            <p>
              You'll receive an email confirmation with order details shortly.
            </p>
          </div>
        )}

        <div className="success-actions">
          <button
            onClick={() => navigate("/merchandise")}
            className="btn-secondary"
          >
            Continue Shopping
          </button>
          <button onClick={() => navigate("/")} className="btn-primary">
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
