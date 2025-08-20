// src/components/DeliveryMethodModal.jsx
import React from "react";
import { FiTruck, FiMapPin, FiX, FiCheck, FiClock, FiUser, FiDollarSign } from "react-icons/fi";

export default function DeliveryMethodModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  selectedMethod, 
  setSelectedMethod 
}) {
  if (!isOpen) return null;

  const deliveryOptions = [
    {
      value: "delivery",
      label: "Premium Delivery",
      description: "We'll deliver it directly to your location",
      icon: <FiTruck />,
      price: "₹50",
      time: "30-45 mins",
      features: ["Doorstep delivery", "Real-time tracking", "Contactless service", "Priority handling"]
    },
    {
      value: "pickup",
      label: "Self Pickup",
      description: "Pick it up yourself from the donor",
      icon: <FiMapPin />,
      price: "Free",
      time: "Flexible",
      features: ["No delivery fee", "Choose your time", "Meet the donor", "Immediate collection"]
    }
  ];

  // Inline CSS styles
  const styles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.7)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      padding: "1rem",
      backdropFilter: "blur(4px)",
      animation: "fadeIn 0.3s ease forwards"
    },
    modal: {
      background: "white",
      borderRadius: "20px",
      padding: 0,
      maxWidth: "500px",
      width: "100%",
      boxShadow: "0 25px 50px rgba(0, 0, 0, 0.15)",
      animation: "slideUp 0.3s ease forwards",
      overflow: "hidden",
      fontFamily: "'Inter', sans-serif"
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "1.5rem 2rem",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      color: "white"
    },
    headerTitle: {
      margin: 0,
      fontSize: "1.5rem",
      fontWeight: 700
    },
    closeButton: {
      background: "rgba(255, 255, 255, 0.2)",
      border: "none",
      borderRadius: "8px",
      color: "white",
      width: "40px",
      height: "40px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "all 0.3s ease",
      fontSize: "1.2rem"
    },
    content: {
      padding: "2rem"
    },
    description: {
      color: "#718096",
      textAlign: "center",
      margin: "0 0 2rem 0",
      fontSize: "1rem",
      lineHeight: "1.5"
    },
    options: {
      display: "flex",
      flexDirection: "column",
      gap: "1rem"
    },
    option: {
      border: "2px solid #e2e8f0",
      borderRadius: "16px",
      padding: "1.5rem",
      cursor: "pointer",
      transition: "all 0.3s ease",
      position: "relative"
    },
    optionSelected: {
      borderColor: "#667eea",
      background: "linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)",
      boxShadow: "0 8px 25px rgba(102, 126, 234, 0.15)"
    },
    optionHeader: {
      display: "flex",
      alignItems: "center",
      gap: "1rem",
      marginBottom: "1rem"
    },
    optionIcon: {
      width: "50px",
      height: "50px",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      borderRadius: "12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "1.5rem",
      flexShrink: 0
    },
    optionInfo: {
      flex: 1
    },
    optionTitle: {
      margin: "0 0 0.25rem 0",
      fontSize: "1.2rem",
      fontWeight: 700,
      color: "#2d3748"
    },
    optionDescription: {
      margin: 0,
      color: "#718096",
      fontSize: "0.9rem"
    },
    optionMeta: {
      display: "flex",
      gap: "1rem",
      marginTop: "0.5rem"
    },
    metaItem: {
      display: "flex",
      alignItems: "center",
      gap: "0.25rem",
      fontSize: "0.85rem",
      color: "#4a5568"
    },
    optionPrice: {
      fontSize: "1.2rem",
      fontWeight: 700,
      color: "#667eea",
      background: "rgba(102, 126, 234, 0.1)",
      padding: "0.5rem 1rem",
      borderRadius: "20px"
    },
    features: {
      display: "flex",
      flexDirection: "column",
      gap: "0.5rem",
      marginBottom: "1rem"
    },
    featureItem: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      color: "#4a5568",
      fontSize: "0.9rem"
    },
    featureIcon: {
      color: "#48bb78",
      flexShrink: 0
    },
    selector: {
      display: "flex",
      justifyContent: "flex-end"
    },
    radioContainer: {
      position: "relative",
      width: "24px",
      height: "24px"
    },
    radioInput: {
      position: "absolute",
      opacity: 0,
      cursor: "pointer"
    },
    radioCustom: {
      width: "24px",
      height: "24px",
      border: "2px solid #cbd5e0",
      borderRadius: "50%",
      position: "relative",
      transition: "all 0.3s ease"
    },
    radioChecked: {
      borderColor: "#667eea",
      background: "#667eea"
    },
    radioCheckedAfter: {
      content: '""',
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "12px",
      height: "12px",
      background: "white",
      borderRadius: "50%"
    },
    actions: {
      display: "flex",
      gap: "1rem",
      padding: "1.5rem 2rem",
      borderTop: "1px solid #e2e8f0",
      background: "#f7fafc"
    },
    confirmButton: {
      flex: 1,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "0.5rem",
      padding: "1rem 2rem",
      background: "linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.3s ease"
    },
    confirmButtonDisabled: {
      opacity: 0.6,
      cursor: "not-allowed"
    },
    cancelButton: {
      padding: "1rem 1.5rem",
      background: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "12px",
      color: "#4a5568",
      fontWeight: 600,
      cursor: "pointer",
      transition: "all 0.3s ease"
    }
  };

  // Add CSS animations to the document head
  React.useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeIn {
        from { opacity: 0; backdrop-filter: blur(0px); }
        to { opacity: 1; backdrop-filter: blur(4px); }
      }
      
      @keyframes slideUp {
        from { transform: translateY(20px) scale(0.95); opacity: 0; }
        to { transform: translateY(0) scale(1); opacity: 1; }
      }
      
      @keyframes pulse {
        0% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0.4); }
        70% { box-shadow: 0 0 0 10px rgba(102, 126, 234, 0); }
        100% { box-shadow: 0 0 0 0 rgba(102, 126, 234, 0); }
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <h2 style={styles.headerTitle}>Choose Delivery Method</h2>
          <button 
            style={styles.closeButton} 
            onClick={onClose}
            onMouseEnter={(e) => e.target.style.background = "rgba(255, 255, 255, 0.3)"}
            onMouseLeave={(e) => e.target.style.background = "rgba(255, 255, 255, 0.2)"}
          >
            <FiX />
          </button>
        </div>

        <div style={styles.content}>
          <p style={styles.description}>
            Select how you'd like to receive your food donation
          </p>

          <div style={styles.options}>
            {deliveryOptions.map((option) => {
              const isSelected = selectedMethod === option.value;
              const optionStyle = {
                ...styles.option,
                ...(isSelected ? styles.optionSelected : {}),
                borderColor: isSelected ? "#667eea" : "#e2e8f0"
              };
              
              return (
                <div
                  key={option.value}
                  style={optionStyle}
                  onClick={() => setSelectedMethod(option.value)}
                  onMouseEnter={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = "#667eea";
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 8px 25px rgba(102, 126, 234, 0.1)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) {
                      e.currentTarget.style.borderColor = "#e2e8f0";
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                    }
                  }}
                >
                  <div style={styles.optionHeader}>
                    <div style={styles.optionIcon}>{option.icon}</div>
                    <div style={styles.optionInfo}>
                      <h3 style={styles.optionTitle}>{option.label}</h3>
                      <p style={styles.optionDescription}>{option.description}</p>
                      <div style={styles.optionMeta}>
                        <div style={styles.metaItem}>
                          <FiDollarSign />
                          <span>{option.price}</span>
                        </div>
                        <div style={styles.metaItem}>
                          <FiClock />
                          <span>{option.time}</span>
                        </div>
                      </div>
                    </div>
                    <div style={styles.optionPrice}>{option.price}</div>
                  </div>

                  <div style={styles.features}>
                    {option.features.map((feature, index) => (
                      <div key={index} style={styles.featureItem}>
                        <FiCheck style={styles.featureIcon} />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div style={styles.selector}>
                    <div style={styles.radioContainer}>
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value={option.value}
                        checked={isSelected}
                        onChange={() => setSelectedMethod(option.value)}
                        style={styles.radioInput}
                      />
                      <div 
                        style={{
                          ...styles.radioCustom,
                          ...(isSelected ? styles.radioChecked : {})
                        }}
                      >
                        {isSelected && <div style={styles.radioCheckedAfter}></div>}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={styles.actions}>
          <button
            style={{
              ...styles.confirmButton,
              ...(!selectedMethod ? styles.confirmButtonDisabled : {})
            }}
            onClick={onConfirm}
            disabled={!selectedMethod}
            onMouseEnter={(e) => {
              if (selectedMethod) {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 8px 20px rgba(102, 126, 234, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (selectedMethod) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
              }
            }}
          >
            <FiCheck />
            Confirm Selection
          </button>
          <button 
            style={styles.cancelButton}
            onClick={onClose}
            onMouseEnter={(e) => {
              e.target.style.background = "#edf2f7";
              e.target.style.color = "#2d3748";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "white";
              e.target.style.color = "#4a5568";
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}