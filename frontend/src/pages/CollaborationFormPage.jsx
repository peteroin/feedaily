import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiArrowRight, FiArrowLeft } from "react-icons/fi";
import "./CollaborationFormPage.css";
import HomeButton from "../components/HomeButton.jsx";

export default function CollaborationFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get("type"); // 'ngo' or 'event'

  const [formData, setFormData] = useState({});
  const [file, setFile] = useState(null);
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({}); // track errors for fields

  useEffect(() => {
    setFormData({});
    setFile(null);
    setStep(1);
    setErrors({});
  }, [type]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "Purpose" && value.length > 500) {
      setErrors((prev) => ({
        ...prev,
        Purpose: "Cannot exceed 500 characters",
      }));
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error on input change
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && !selectedFile.type.startsWith("image/")) {
      e.target.value = "";
      setErrors((prev) => ({ ...prev, file: "Only image files are allowed" }));
      return;
    }
    setFile(selectedFile);
    setErrors((prev) => ({ ...prev, file: "" }));
  };

  // Validate fields for current step
  const validateStep = () => {
    let requiredFields = [];
    if (type === "ngo") {
      if (step === 1)
        requiredFields = ["NGOName", "NGO_Register_Number", "Purpose"];
      else if (step === 2) requiredFields = ["Collab_Date", "Venue"];
      else if (step === 3)
        requiredFields = ["Organizer_Name", "Organizer_Contact"];
    } else if (type === "event") {
      if (step === 1) requiredFields = ["Event_name", "Purpose"];
      else if (step === 2)
        requiredFields = [
          "Venue",
          "Event_Date",
          "Event_Time",
          "Expected_Persons",
        ];
      else if (step === 3)
        requiredFields = ["Organizer_Name", "Organizer_Contact"];
    }

    const newErrors = {};
    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        newErrors[field] = "This field is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setStep((prev) => prev - 1);
  };

  const compressToTargetSize = (base64Str, targetKB = 70, maxWidth = 800, maxHeight = 800) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;

    img.onload = () => {
      let { width, height } = img;

      // Scale down proportionally if bigger than maxWidth/maxHeight
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width = width * ratio;
        height = height * ratio;
      }

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);

      let quality = 0.8; // start compression quality
      let compressed = canvas.toDataURL("image/jpeg", quality);

      // Iteratively reduce quality until size <= targetKB
      const targetBytes = targetKB * 1024;
      while ((compressed.length * 0.75) > targetBytes && quality > 0.1) {
        quality -= 0.05;
        compressed = canvas.toDataURL("image/jpeg", quality);
      }

      resolve(compressed);
    };

    img.onerror = () => {
      console.warn("Image load failed, returning original");
      resolve(base64Str);
    };
  });
};

// Example usage
// const compressedBase64 = await compressToTargetSize(originalBase64, 70);



  const handleSubmit = async (e) => {
  e.preventDefault();

  let base64Image = null;
  if (file) {
    base64Image = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (err) => reject(err);
    });
  }

  const body = { ...formData, type, file: base64Image };

  const submitBody = async (bodyToSend) => {
    const res = await fetch("http://localhost:5000/api/collaborate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(bodyToSend),
    });
    return res;
  };

  try {
    // Try sending first
    let res = await submitBody(body);
    if (!res.ok && base64Image) {
      // If failed, resize and try again
      const resizedImage = await compressToTargetSize(base64Image, 70);
      const newBody = { ...formData, type, file: resizedImage };
      res = await submitBody(newBody);
    }

    const data = await res.json();
    if (res.ok) {
      alert("Collaboration submitted successfully!");
      navigate("/");
    } else {
      alert(data.message || "Submission failed!");
    }
  } catch (err) {
    console.error("Error submitting form:", err);
    alert("An error occurred while submitting.");
  }
};

  // Progress bar width based on step
  const progress = type === "ngo" ? (step / 3) * 100 : (step / 3) * 100;

  // Render input with error
  const renderInput = (props) => (
    <div className="input-wrapper">
      {props.type !== "textarea" ? (
        <input {...props} />
      ) : (
        <textarea {...props} rows={props.rows || 3} />
      )}
      {errors[props.name] && (
        <div className="error-msg">{errors[props.name]}</div>
      )}
    </div>
  );

  return (
    <div className="collab-page">
      <HomeButton />
      <div className="collab-bg"></div>

      <div className="collab-container">
        <div className="collab-card">
          <div className="collab-header">
            <div className="collab-logo">
              <span>🍽</span>
              <h1>Feedaily</h1>
            </div>
            <h2>
              {type === "ngo"
                ? "Collaborate as NGO / Partner"
                : "Request a Social Event"}
            </h2>
            <p>
              Step {step} of 3 •{" "}
              {type === "ngo" ? "NGO Collaboration" : "Event Collaboration"}{" "}
              Form
            </p>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="collab-form">
            {/* NGO */}
            {type === "ngo" && (
              <>
                {step === 1 && (
                  <>
                    {renderInput({
                      type: "text",
                      name: "NGOName",
                      placeholder: "NGO / Organization Name",
                      value: formData.NGOName || "",
                      onChange: handleChange,
                    })}
                    {renderInput({
                      type: "text",
                      name: "NGO_Register_Number",
                      placeholder: "NGO Registration Number",
                      value: formData.NGO_Register_Number || "",
                      onChange: handleChange,
                    })}
                    {renderInput({
                      type: "textarea",
                      name: "Purpose",
                      placeholder: "Purpose / Mission of NGO",
                      value: formData.Purpose || "",
                      onChange: handleChange,
                    })}
                  </>
                )}
                {step === 2 && (
                  <>
                    {renderInput({
                      type: "date",
                      name: "Collab_Date",
                      value: formData.Collab_Date || "",
                      onChange: handleChange,
                    })}
                    {renderInput({
                      type: "text",
                      name: "Venue",
                      placeholder: "Venue / Location",
                      value: formData.Venue || "",
                      onChange: handleChange,
                    })}
                  </>
                )}
                {step === 3 && (
                  <>
                    {renderInput({
                      type: "text",
                      name: "Organizer_Name",
                      placeholder: "Organizing Head / Contact Person",
                      value: formData.Organizer_Name || "",
                      onChange: handleChange,
                    })}
                    {renderInput({
                      type: "tel",
                      name: "Organizer_Contact",
                      placeholder: "Organizer Contact Number",
                      value: formData.Organizer_Contact || "",
                      onChange: handleChange,
                    })}
                  </>
                )}
              </>
            )}

            {/* Event */}
            {type === "event" && (
              <>
                {step === 1 && (
                  <>
                    {renderInput({
                      type: "text",
                      name: "Event_name",
                      placeholder: "Event Title",
                      value: formData.Event_name || "",
                      onChange: handleChange,
                    })}
                    {renderInput({
                      type: "textarea",
                      name: "Purpose",
                      placeholder: "Purpose of Event",
                      value: formData.Purpose || "",
                      onChange: handleChange,
                    })}
                  </>
                )}
                {step === 2 && (
                  <>
                    {renderInput({
                      type: "text",
                      name: "Venue",
                      placeholder: "Venue / Location",
                      value: formData.Venue || "",
                      onChange: handleChange,
                    })}
                    {renderInput({
                      type: "date",
                      name: "Event_Date",
                      value: formData.Event_Date || "",
                      onChange: handleChange,
                    })}
                    {renderInput({
                      type: "time",
                      name: "Event_Time",
                      value: formData.Event_Time || "",
                      onChange: handleChange,
                    })}
                    {renderInput({
                      type: "number",
                      name: "Expected_Persons",
                      placeholder: "Expected Number of Attendees",
                      value: formData.Expected_Persons || "",
                      onChange: handleChange,
                    })}
                  </>
                )}
                {step === 3 && (
                  <>
                    {renderInput({
                      type: "text",
                      name: "Organizer_Name",
                      placeholder: "Organizing Head / Contact Person",
                      value: formData.Organizer_Name || "",
                      onChange: handleChange,
                    })}
                    {renderInput({
                      type: "tel",
                      name: "Organizer_Contact",
                      placeholder: "Organizer Contact Number",
                      value: formData.Organizer_Contact || "",
                      onChange: handleChange,
                    })}
                    <div className="input-wrapper">
                      <label className="file-upload">
                        Upload Pamphlet / Event Poster
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                        />
                      </label>
                      {errors.file && (
                        <div className="error-msg">{errors.file}</div>
                      )}
                    </div>
                  </>
                )}
              </>
            )}

            {/* Step Button */}
            <div className="step-controls center">
              {step > 1 && (
                <button
                  type="button"
                  onClick={handleBack}
                  className="collab-btn back"
                >
                  <FiArrowLeft /> Back
                </button>
              )}
              {step < 3 && (
                <button
                  type="button"
                  onClick={handleNext}
                  className="collab-btn next"
                >
                  Next <FiArrowRight />
                </button>
              )}
              {step === 3 && (
                <button type="submit" className="collab-btn submit">
                  Submit <FiArrowRight />
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
