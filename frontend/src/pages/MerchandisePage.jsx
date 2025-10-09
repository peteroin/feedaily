import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiShoppingCart,
  FiPlus,
  FiMinus,
  FiShoppingBag,
  FiX,
  FiArrowLeft,
  FiHeart,
} from "react-icons/fi";
import "./MerchandisePage.css";

// Sample products data with minimalist design
const PRODUCTS = [
  {
    id: 1,
    name: "Feedaily T-Shirt",
    description: "Premium organic cotton with minimalist logo",
    price: 599,
    image:
      "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    category: "Apparel",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: 2,
    name: "Eco Canvas Bag",
    description: "Sustainable tote bag for daily use",
    price: 399,
    image:
      "https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=400&h=400&fit=crop",
    category: "Accessories",
    sizes: ["One Size"],
  },
  {
    id: 3,
    name: "Minimalist Poster",
    description: "Inspirational wall art for your space",
    price: 299,
    image:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop",
    category: "Art",
    sizes: ["A3", "A2"],
  },
  {
    id: 4,
    name: "Water Bottle",
    description: "Stainless steel eco-friendly bottle",
    price: 499,
    image:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop",
    category: "Accessories",
    sizes: ["500ml", "750ml"],
  },
  {
    id: 5,
    name: "Feedaily Hoodie",
    description: "Comfortable hooded sweatshirt",
    price: 999,
    image:
      "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop",
    category: "Apparel",
    sizes: ["S", "M", "L", "XL", "XXL"],
  },
  {
    id: 6,
    name: "Notebook Set",
    description: "Eco-friendly recycled paper notebooks",
    price: 249,
    image:
      "https://images.unsplash.com/photo-1517842645767-c639042777db?w=400&h=400&fit=crop",
    category: "Stationery",
    sizes: ["A5"],
  },
  {
    id: 7,
    name: "Coffee Mug",
    description: "Ceramic mug with Feedaily branding",
    price: 349,
    image:
      "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=400&h=400&fit=crop",
    category: "Accessories",
    sizes: ["300ml"],
  },
  {
    id: 8,
    name: "Canvas Art Print",
    description: "Limited edition canvas print",
    price: 799,
    image:
      "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=400&h=400&fit=crop",
    category: "Art",
    sizes: ["Medium", "Large"],
  },
];

export default function MerchandisePage() {
  const navigate = useNavigate();
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const user = localStorage.getItem("user");
    setIsLoggedIn(!!user);

    // Load cart from localStorage
    const savedCart = localStorage.getItem("merchandiseCart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  useEffect(() => {
    // Save cart to localStorage whenever it changes
    localStorage.setItem("merchandiseCart", JSON.stringify(cart));
  }, [cart]);

  const handleBuyNow = (product) => {
    if (!isLoggedIn) {
      setShowLoginPrompt(true);
      return;
    }
    setSelectedProduct(product);
    setSelectedSize(product.sizes[0]);
  };

  const handleAddToCart = () => {
    if (!selectedProduct || !selectedSize) return;

    const existingItem = cart.find(
      (item) => item.id === selectedProduct.id && item.size === selectedSize
    );

    if (existingItem) {
      setCart(
        cart.map((item) =>
          item.id === selectedProduct.id && item.size === selectedSize
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      setCart([
        ...cart,
        { ...selectedProduct, size: selectedSize, quantity: 1 },
      ]);
    }

    setSelectedProduct(null);
    setSelectedSize("");
    setShowCart(true);
  };

  const updateQuantity = (itemId, size, change) => {
    setCart(
      cart
        .map((item) => {
          if (item.id === itemId && item.size === size) {
            const newQuantity = item.quantity + change;
            return newQuantity > 0 ? { ...item, quantity: newQuantity } : item;
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (itemId, size) => {
    setCart(cart.filter((item) => !(item.id === itemId && item.size === size)));
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigate("/merchandise/checkout");
  };

  const handleGoToLogin = () => {
    setShowLoginPrompt(false);
    navigate("/login");
  };

  return (
    <div className="merchandise-page">
      {/* Header */}
      <div className="merchandise-header">
        <button onClick={() => navigate("/")} className="back-button">
          <FiArrowLeft /> Back to Home
        </button>
        <h1 className="merchandise-title">Our Products</h1>
        <button className="cart-button" onClick={() => setShowCart(true)}>
          <FiShoppingCart />
          {getTotalItems() > 0 && (
            <span className="cart-badge">{getTotalItems()}</span>
          )}
        </button>
      </div>

      {/* Hero Banner */}
      <div className="merchandise-hero">
        <div className="hero-content">
          <h2>Support Our Mission</h2>
          <p>Every purchase helps feed communities in need</p>
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-container">
        <div className="products-grid">
          {PRODUCTS.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-wrapper">
                <img
                  src={product.image}
                  alt={product.name}
                  className="product-image"
                />
                <div className="product-overlay">
                  <button
                    className="buy-now-btn"
                    onClick={() => handleBuyNow(product)}
                  >
                    <FiShoppingBag /> Buy Now
                  </button>
                </div>
              </div>
              <div className="product-info">
                <span className="product-category">{product.category}</span>
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-footer">
                  <span className="product-price">₹{product.price}</span>
                  <button className="wishlist-btn" aria-label="Add to wishlist">
                    <FiHeart />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Product Selection Modal */}
      {selectedProduct && (
        <div className="modal-overlay" onClick={() => setSelectedProduct(null)}>
          <div
            className="modal-content product-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedProduct(null)}
            >
              <FiX />
            </button>

            <div className="product-modal-content">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="modal-product-image"
              />
              <div className="modal-product-details">
                <h2>{selectedProduct.name}</h2>
                <p className="modal-product-description">
                  {selectedProduct.description}
                </p>
                <p className="modal-product-price">₹{selectedProduct.price}</p>

                <div className="size-selector">
                  <label>Select Size:</label>
                  <div className="size-options">
                    {selectedProduct.sizes.map((size) => (
                      <button
                        key={size}
                        className={`size-option ${
                          selectedSize === size ? "selected" : ""
                        }`}
                        onClick={() => setSelectedSize(size)}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  className="add-to-cart-btn"
                  onClick={handleAddToCart}
                  disabled={!selectedSize}
                >
                  <FiShoppingCart /> Add to Cart
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div
          className="modal-overlay"
          onClick={() => setShowLoginPrompt(false)}
        >
          <div
            className="modal-content login-prompt-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setShowLoginPrompt(false)}
            >
              <FiX />
            </button>
            <div className="login-prompt-content">
              <FiShoppingCart className="login-prompt-icon" />
              <h2>Login Required</h2>
              <p>
                Please login to purchase products and add items to your cart.
              </p>
              <div className="login-prompt-actions">
                <button className="login-btn" onClick={handleGoToLogin}>
                  Login
                </button>
                <button
                  className="cancel-btn"
                  onClick={() => setShowLoginPrompt(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {showCart && (
        <>
          <div className="cart-overlay" onClick={() => setShowCart(false)} />
          <div className="cart-sidebar">
            <div className="cart-header">
              <h2>Shopping Cart</h2>
              <button onClick={() => setShowCart(false)}>
                <FiX />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="empty-cart">
                <FiShoppingCart className="empty-cart-icon" />
                <p>Your cart is empty</p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item, index) => (
                    <div
                      key={`${item.id}-${item.size}-${index}`}
                      className="cart-item"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="cart-item-image"
                      />
                      <div className="cart-item-details">
                        <h4>{item.name}</h4>
                        <p className="cart-item-size">Size: {item.size}</p>
                        <p className="cart-item-price">₹{item.price}</p>
                        <div className="quantity-controls">
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.size, -1)
                            }
                          >
                            <FiMinus />
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            onClick={() =>
                              updateQuantity(item.id, item.size, 1)
                            }
                          >
                            <FiPlus />
                          </button>
                        </div>
                      </div>
                      <button
                        className="remove-item-btn"
                        onClick={() => removeFromCart(item.id, item.size)}
                      >
                        <FiX />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-footer">
                  <div className="cart-total">
                    <span>Total:</span>
                    <span className="total-price">₹{getTotalPrice()}</span>
                  </div>
                  <button className="checkout-btn" onClick={handleCheckout}>
                    Proceed to Checkout
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
