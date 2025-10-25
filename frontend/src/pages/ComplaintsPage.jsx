import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiAlertCircle,
  FiUser,
  FiPhone,
  FiMail,
  FiFileText,
  FiUpload,
  FiCheck,
  FiX,
  FiSearch,
} from "react-icons/fi";
import "./ComplaintsPage.css";

export default function ComplaintsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact: "",
    complaintType: "",
    againstPerson: "",
    details: "",
    proof: null,
  });
  const [donors, setDonors] = useState([]);
  const [deliveryBuddies, setDeliveryBuddies] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [complaintNumber, setComplaintNumber] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    // Check authentication
    const userData = localStorage.getItem("user");
    if (!userData) {
      navigate("/login");
      return;
    }

    const parsedUser = JSON.parse(userData);
    setUser(parsedUser);

    // Auto-fill user details
    setFormData((prev) => ({
      ...prev,
      name: parsedUser.name || "",
      email: parsedUser.email || "",
      contact: parsedUser.contact || "",
    }));

    // Fetch donors and delivery buddies
    fetchDonorsAndDeliveryBuddies(parsedUser.id);
  }, [navigate]);

  const fetchDonorsAndDeliveryBuddies = async (userId) => {
    try {
      const donorsRes = await fetch(
        `http://localhost:5000/api/complaints/donors/${userId}`
      );
      if (donorsRes.ok) {
        const donorsData = await donorsRes.json();
        setDonors(donorsData);
      }

      const deliveryRes = await fetch(
        `http://localhost:5000/api/complaints/delivery-buddies/${userId}`
      );
      if (deliveryRes.ok) {
        const deliveryData = await deliveryRes.json();
        setDeliveryBuddies(deliveryData);
      }
    } catch (error) {
      console.error("Error fetching complaint data:", error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (name === "complaintType") {
      setFormData((prev) => ({ ...prev, againstPerson: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({
          ...prev,
          proof: "File size must be less than 5MB",
        }));
        return;
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "application/pdf",
      ];
      if (!allowedTypes.includes(file.type)) {
        setErrors((prev) => ({
          ...prev,
          proof: "Only JPG, PNG, and PDF files are allowed",
        }));
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, proof: reader.result }));
        if (file.type.startsWith("image/")) {
          setPreviewImage(reader.result);
        } else {
          setPreviewImage(null);
        }
      };
      reader.readAsDataURL(file);

      setErrors((prev) => ({ ...prev, proof: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.complaintType) {
      newErrors.complaintType = "Please select a complaint type";
    }

    if (
      (formData.complaintType === "donor" ||
        formData.complaintType === "delivery_buddy") &&
      !formData.againstPerson
    ) {
      newErrors.againstPerson = "Please select a person";
    }

    if (!formData.details.trim()) {
      newErrors.details = "Please provide complaint details";
    } else if (formData.details.trim().length < 20) {
      newErrors.details = "Please provide at least 20 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("http://localhost:5000/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          complaintType: formData.complaintType,
          againstPerson: formData.againstPerson || null,
          details: formData.details,
          proof: formData.proof || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setComplaintNumber(data.complaintNumber);
        setShowSuccess(true);
      } else {
        setErrors({ submit: data.message || "Failed to submit complaint" });
      }
    } catch (error) {
      console.error("Error submitting complaint:", error);
      setErrors({ submit: "An error occurred. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNewComplaint = () => {
    setShowSuccess(false);
    setComplaintNumber("");
    setFormData((prev) => ({
      ...prev,
      complaintType: "",
      againstPerson: "",
      details: "",
      proof: null,
    }));
    setPreviewImage(null);
    setErrors({});
  };

  const getPersonList = () => {
    if (formData.complaintType === "donor") {
      return donors;
    } else if (formData.complaintType === "delivery_buddy") {
      return deliveryBuddies;
    }
    return [];
  };

  if (showSuccess) {
    return (
      <div className="cp-page">
        <div className="cp-success-container">
          <div className="cp-success-icon">
            <FiCheck />
          </div>
          <h1>Complaint Submitted Successfully!</h1>
          <div className="cp-complaint-number-box">
            <p className="cp-complaint-label">Your Complaint Number</p>
            <p className="cp-complaint-number">{complaintNumber}</p>
            <p className="cp-complaint-note">Please save this number for tracking</p>
          </div>
          <div className="cp-status-badge cp-initiated">
            <FiAlertCircle />
            <span>Status: Complaint Initiated</span>
          </div>
          <p className="cp-success-message">
            Your complaint has been registered and sent to our admin team. You will receive updates via email.
          </p>
          <div className="cp-success-actions">
            <button onClick={handleNewComplaint} className="cp-btn-secondary">
              Submit Another Complaint
            </button>
            <button
              onClick={() => navigate("/complaints/track")}
              className="cp-btn-primary"
            >
              <FiSearch /> Track Complaint
            </button>
            <button onClick={() => navigate("/")} className="cp-btn-ghost">
              Go to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cp-page">
      <div className="cp-container">
        <div className="cp-header">
          <button onClick={() => navigate("/")} className="cp-back-btn">
            <FiX /> Close
          </button>
          <div>
            <h1>
              <FiAlertCircle /> File a Complaint
            </h1>
            <p>We take your concerns seriously and will address them promptly</p>
          </div>
          <button
            onClick={() => navigate("/complaints/track")}
            className="cp-track-btn"
          >
            <FiSearch /> Track Complaint
          </button>
        </div>

        <form onSubmit={handleSubmit} className="cp-complaints-form">
          {/* User Information (Read-only) */}
          <div className="cp-form-section">
            <h2>Your Information</h2>
            <div className="cp-form-grid">
              <div className="cp-form-group">
                <label>
                  <FiUser /> Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  readOnly
                  className="cp-readonly-input"
                />
              </div>

              <div className="cp-form-group">
                <label>
                  <FiMail /> Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  readOnly
                  className="cp-readonly-input"
                />
              </div>

              <div className="cp-form-group">
                <label>
                  <FiPhone /> Contact
                </label>
                <input
                  type="text"
                  value={formData.contact}
                  readOnly
                  className="cp-readonly-input"
                />
              </div>
            </div>
          </div>

          {/* Complaint Type Selection */}
          <div className="cp-form-section">
            <h2>Complaint Type *</h2>
            <p className="cp-section-subtitle">What is your complaint about?</p>

            <div className="cp-complaint-type-grid">
              <label
                className={`cp-complaint-type-card ${
                  formData.complaintType === "donor" ? "cp-selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="complaintType"
                  value="donor"
                  checked={formData.complaintType === "donor"}
                  onChange={handleInputChange}
                />
                <div className="cp-card-content">
                  <FiUser className="cp-card-icon" />
                  <h3>Donor</h3>
                  <p>Issue with food donor</p>
                </div>
              </label>

              <label
                className={`cp-complaint-type-card ${
                  formData.complaintType === "delivery_buddy" ? "cp-selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="complaintType"
                  value="delivery_buddy"
                  checked={formData.complaintType === "delivery_buddy"}
                  onChange={handleInputChange}
                />
                <div className="cp-card-content">
                  <FiUser className="cp-card-icon" />
                  <h3>Delivery Buddy</h3>
                  <p>Issue with delivery person</p>
                </div>
              </label>

              <label
                className={`cp-complaint-type-card ${
                  formData.complaintType === "platform" ? "cp-selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="complaintType"
                  value="platform"
                  checked={formData.complaintType === "platform"}
                  onChange={handleInputChange}
                />
                <div className="cp-card-content">
                  <FiAlertCircle className="cp-card-icon" />
                  <h3>Platform</h3>
                  <p>Technical or service issue</p>
                </div>
              </label>

              <label
                className={`cp-complaint-type-card ${
                  formData.complaintType === "other" ? "cp-selected" : ""
                }`}
              >
                <input
                  type="radio"
                  name="complaintType"
                  value="other"
                  checked={formData.complaintType === "other"}
                  onChange={handleInputChange}
                />
                <div className="cp-card-content">
                  <FiFileText className="cp-card-icon" />
                  <h3>Other</h3>
                  <p>Any other concern</p>
                </div>
              </label>
            </div>
            {errors.complaintType && (
              <span className="cp-error-message">{errors.complaintType}</span>
            )}
          </div>

          {/* Select Person (for Donor or Delivery Buddy) */}
          {(formData.complaintType === "donor" ||
            formData.complaintType === "delivery_buddy") && (
            <div className="cp-form-section">
              <h2>Select Person *</h2>
              <p className="cp-section-subtitle">
                {formData.complaintType === "donor"
                  ? "Select the donor you want to complain about"
                  : "Select the delivery buddy you want to complain about"}
              </p>

              {getPersonList().length === 0 ? (
                <div className="cp-empty-state">
                  <p>
                    No{" "}
                    {formData.complaintType === "donor"
                      ? "donors"
                      : "delivery buddies"}{" "}
                    found in your history
                  </p>
                </div>
              ) : (
                <div className="cp-person-list">
                  {getPersonList().map((person) => (
                    <label
                      key={person.id}
                      className={`cp-person-card ${
                        formData.againstPerson === person.id.toString()
                          ? "cp-selected"
                          : ""
                      }`}
                    >
                      <input
                        type="radio"
                        name="againstPerson"
                        value={person.id}
                        checked={formData.againstPerson === person.id.toString()}
                        onChange={handleInputChange}
                      />
                      <div className="cp-person-info">
                        <h4>{person.name}</h4>
                        <p>{person.contact}</p>
                        {person.donationInfo && (
                          <span className="cp-donation-info">
                            {person.donationInfo}
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
              {errors.againstPerson && (
                <span className="cp-error-message">{errors.againstPerson}</span>
              )}
            </div>
          )}

          {/* Complaint Details */}
          <div className="cp-form-section">
            <h2>Complaint Details *</h2>
            <p className="cp-section-subtitle">
              Please provide detailed information about your complaint
            </p>

            <div className="cp-form-group">
              <textarea
                name="details"
                value={formData.details}
                onChange={handleInputChange}
                placeholder="Describe your complaint in detail (minimum 20 characters)..."
                rows="6"
                className={errors.details ? "cp-error" : ""}
              />
              <div className="cp-char-count">{formData.details.length} characters</div>
              {errors.details && (
                <span className="cp-error-message">{errors.details}</span>
              )}
            </div>
          </div>

          {/* Upload Proof */}
          <div className="cp-form-section">
            <h2>Upload Proof (Optional)</h2>
            <p className="cp-section-subtitle">
              Upload any supporting documents or images (Max 5MB, JPG/PNG/PDF)
            </p>

            <div className="cp-upload-container">
              <input
                type="file"
                id="proof-upload"
                accept="image/jpeg,image/jpg,image/png,application/pdf"
                onChange={handleFileChange}
                className="cp-file-input"
              />
              <label htmlFor="proof-upload" className="cp-upload-btn">
                <FiUpload />
                <span>Choose File</span>
              </label>

              {previewImage && (
                <div className="cp-preview-container">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="cp-preview-image"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({ ...prev, proof: null }));
                      setPreviewImage(null);
                    }}
                    className="cp-remove-preview"
                  >
                    <FiX />
                  </button>
                </div>
              )}

              {formData.proof && !previewImage && (
                <div className="cp-file-uploaded">
                  <FiCheck /> File uploaded successfully
                </div>
              )}

              {errors.proof && (
                <span className="cp-error-message">{errors.proof}</span>
              )}
            </div>
          </div>

          {/* Submit Error */}
          {errors.submit && (
            <div className="cp-submit-error">
              <FiAlertCircle /> {errors.submit}
            </div>
          )}

          {/* Submit Button */}
          <div className="cp-form-actions">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="cp-btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cp-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="cp-spinner"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <FiCheck /> Submit Complaint
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
