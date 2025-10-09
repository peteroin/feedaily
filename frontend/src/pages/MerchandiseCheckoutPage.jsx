import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiMapPin,
  FiPhone,
  FiMail,
  FiUser,
  FiHome,
  FiArrowLeft,
  FiCreditCard,
  FiCheck,
} from "react-icons/fi";
import "./MerchandiseCheckoutPage.css";

export default function MerchandiseCheckoutPage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load cart
    const savedCart = localStorage.getItem("merchandiseCart");
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCart(parsedCart);
      if (parsedCart.length === 0) {
        navigate("/merchandise");
      }
    } else {
      navigate("/merchandise");
    }

    // Load user data
    const userData = localStorage.getItem("user");
    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setFormData((prev) => ({
        ...prev,
        fullName: parsedUser.name || "",
        email: parsedUser.email || "",
        phone: parsedUser.contact || "",
      }));
    } else {
      navigate("/login");
    }
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!/^\d{10}$/.test(formData.phone.replace(/\s/g, ""))) {
      newErrors.phone = "Phone must be 10 digits";
    }
    if (!formData.address.trim()) newErrors.address = "Address is required";
    if (!formData.city.trim()) newErrors.city = "City is required";
    if (!formData.state.trim()) newErrors.state = "State is required";
    if (!formData.pincode.trim()) {
      newErrors.pincode = "Pincode is required";
    } else if (!/^\d{6}$/.test(formData.pincode)) {
      newErrors.pincode = "Invalid pincode";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getShippingCharge = () => {
    const subtotal = getTotalPrice();
    return subtotal > 1000 ? 0 : 50;
  };

  const getFinalTotal = () => {
    return getTotalPrice() + getShippingCharge();
  };

  const handlePayment = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate payment processing
      const res = await fetch(
        "http://localhost:5000/api/create-checkout-session",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: getFinalTotal(),
            productName: "Merchandise Order",
            receiverEmail: formData.email,
            orderDetails: {
              items: cart,
              shippingAddress: formData,
            },
          }),
        }
      );

      const data = await res.json();

      if (data.url) {
        // Save order details before redirecting
        localStorage.setItem(
          "pendingMerchandiseOrder",
          JSON.stringify({
            items: cart,
            shippingAddress: formData,
            total: getFinalTotal(),
          })
        );
        window.location = data.url;
      } else {
        alert("Could not start payment. Try again.");
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("An error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (orderPlaced) {
    return (
      <div className="checkout-page">
        <div className="order-success">
          <div className="success-icon">
            <FiCheck />
          </div>
          <h1>Order Placed Successfully!</h1>
          <p>Thank you for your purchase. Your order will be delivered soon.</p>
          <button
            onClick={() => navigate("/merchandise")}
            className="btn-primary"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-header">
        <button
          onClick={() => navigate("/merchandise")}
          className="back-button"
        >
          <FiArrowLeft /> Back to Products
        </button>
        <h1>Checkout</h1>
      </div>

      <div className="checkout-container">
        {/* Shipping Information */}
        <div className="checkout-form-section">
          <div className="section-card">
            <h2 className="section-title">
              <FiMapPin /> Shipping Information
            </h2>

            <div className="form-grid">
              <div className="form-group full-width">
                <label>
                  <FiUser /> Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className={errors.fullName ? "error" : ""}
                />
                {errors.fullName && (
                  <span className="error-message">{errors.fullName}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  <FiMail /> Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className={errors.email ? "error" : ""}
                />
                {errors.email && (
                  <span className="error-message">{errors.email}</span>
                )}
              </div>

              <div className="form-group">
                <label>
                  <FiPhone /> Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="10-digit number"
                  className={errors.phone ? "error" : ""}
                />
                {errors.phone && (
                  <span className="error-message">{errors.phone}</span>
                )}
              </div>

              <div className="form-group full-width">
                <label>
                  <FiHome /> Address *
                </label>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  placeholder="House no., Street, Area"
                  rows="3"
                  className={errors.address ? "error" : ""}
                />
                {errors.address && (
                  <span className="error-message">{errors.address}</span>
                )}
              </div>

              <div className="form-group">
                <label>City *</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="City"
                  className={errors.city ? "error" : ""}
                />
                {errors.city && (
                  <span className="error-message">{errors.city}</span>
                )}
              </div>

              <div className="form-group">
                <label>State *</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="State"
                  className={errors.state ? "error" : ""}
                />
                {errors.state && (
                  <span className="error-message">{errors.state}</span>
                )}
              </div>

              <div className="form-group">
                <label>Pincode *</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleInputChange}
                  placeholder="6-digit pincode"
                  className={errors.pincode ? "error" : ""}
                />
                {errors.pincode && (
                  <span className="error-message">{errors.pincode}</span>
                )}
              </div>

              <div className="form-group">
                <label>Landmark (Optional)</label>
                <input
                  type="text"
                  name="landmark"
                  value={formData.landmark}
                  onChange={handleInputChange}
                  placeholder="Nearby landmark"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Order Summary */}
        <div className="checkout-summary-section">
          <div className="section-card">
            <h2 className="section-title">Order Summary</h2>

            <div className="order-items">
              {cart.map((item, index) => (
                <div
                  key={`${item.id}-${item.size}-${index}`}
                  className="order-item"
                >
                  <img src={item.image} alt={item.name} />
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <p className="item-size">Size: {item.size}</p>
                    <p className="item-quantity">Qty: {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            <div className="price-breakdown">
              <div className="price-row">
                <span>Subtotal</span>
                <span>₹{getTotalPrice()}</span>
              </div>
              <div className="price-row">
                <span>Shipping</span>
                <span
                  className={getShippingCharge() === 0 ? "free-shipping" : ""}
                >
                  {getShippingCharge() === 0
                    ? "FREE"
                    : `₹${getShippingCharge()}`}
                </span>
              </div>
              {getShippingCharge() > 0 && (
                <p className="shipping-note">
                  Add ₹{1000 - getTotalPrice()} more for free shipping!
                </p>
              )}
              <div className="price-row total">
                <span>Total</span>
                <span>₹{getFinalTotal()}</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={isSubmitting}
              className="payment-btn"
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  <FiCreditCard /> Proceed to Payment
                </>
              )}
            </button>

            <p className="payment-note">Secure payment powered by Stripe</p>
          </div>
        </div>
      </div>
    </div>
  );
}
