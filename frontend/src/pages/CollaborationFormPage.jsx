import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FiArrowRight } from "react-icons/fi";
import "./CollaborationFormPage.css";
import HomeButton from "../components/HomeButton.jsx";

export default function CollaborationFormPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const type = queryParams.get("type"); // 'ngo' or 'event'

  const [formData, setFormData] = useState({});
  const [file, setFile] = useState(null); // for event pamphlet

  // Reset form if type changes
  useEffect(() => {
    setFormData({});
    setFile(null);
  }, [type]);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
    });
    if (file) formDataToSend.append("file", file);
    formDataToSend.append("type", type);

    try {
      const res = await fetch("http://localhost:5000/api/collaborate", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await res.json();
      if (res.ok) {
        alert("Collaboration submitted successfully!");
        console.log("Response:", data);
      } else {
        alert(data.message || "Submission failed!");
      }
    } catch (err) {
      console.error("Error submitting form:", err);
      alert("An error occurred while submitting.");
    }

    navigate("/"); // redirect after submission
  };

  return (
    <div className="auth-container">
      <HomeButton />
      <img src="/img/authBackground.png" alt="" className="auth-illustration" />
      <div className="auth-content">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-logo">
              <span>🍽</span>
              <h1>Feedaily</h1>
            </div>
            <h2>
              {type === "ngo"
                ? "Collaborate as NGO / Partner"
                : "Request a Social Event"}
            </h2>
            <p>
              Fill out the form below to start your{" "}
              {type === "ngo" ? "collaboration" : "event request"} with
              Feedaily.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            {type === "ngo" ? (
              <>
                <div className="input-group">
                  <input
                    type="text"
                    name="NGOName"
                    placeholder="NGO / Organization Name"
                    value={formData.NGOName || ""}
                    onChange={handleChange}
                    required
                    className="auth-input"
                  />
                </div>

                <div className="input-group">
                  <input
                    type="text"
                    name="NGO_Register_Number"
                    placeholder="NGO Registration Number"
                    value={formData.NGO_Register_Number || ""}
                    onChange={handleChange}
                    required
                    className="auth-input"
                  />
                </div>

                <div className="input-group">
                  <textarea
                    name="Purpose"
                    placeholder="Purpose / Mission of NGO"
                    value={formData.Purpose || ""}
                    onChange={handleChange}
                    required
                    className="auth-input"
                    rows={3}
                  />
                </div>

                <div className="input-group">
                  <input
                    type="date"
                    name="Collab_Date"
                    value={formData.Collab_Date || ""}
                    onChange={handleChange}
                    required
                    className="auth-input"
                  />
                </div>

                <div className="input-group">
                  <input
                    type="text"
                    name="Venue"
                    placeholder="Venue / Location"
                    value={formData.Venue || ""}
                    onChange={handleChange}
                    required
                    className="auth-input"
                  />
                </div>

                <div className="input-group">
                  <input
                    type="text"
                    name="Organizer_Name"
                    placeholder="Organizing Head / Contact Person"
                    value={formData.Organizer_Name || ""}
                    onChange={handleChange}
                    required
                    className="auth-input"
                  />
                </div>

                <div className="input-group">
                  <input
                    type="tel"
                    name="Organizer_Contact"
                    placeholder="Organizer Contact Number"
                    value={formData.Organizer_Contact || ""}
                    onChange={handleChange}
                    required
                    className="auth-input"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="input-group">
                  <textarea
                    name="Event_name"
                    placeholder="Event Title"
                    value={formData.Event_name || ""}
                    onChange={handleChange}
                    required
                    className="auth-input"
                    rows={1}
                  />
                </div>

                <div className="input-group">
                  <textarea
                    name="Purpose"
                    placeholder="Purpose of Event"
                    value={formData.Purpose || ""}
                    onChange={handleChange}
                    required
                    className="auth-input"
                    rows={2}
                  />
                </div>

                <div className="input-group">
                  <input
                    type="text"
                    name="Venue"
                    placeholder="Venue / Location"
                    value={formData.Venue || ""}
                    onChange={handleChange}
                    required
                    className="auth-input"
                  />
                </div>

                <div className="input-group">
                  <input
                    type="Date"
                    name="Event_Date"
                    value={formData.Event_Date || ""}
                    onChange={handleChange}
                    required
                    className="auth-input"
                  />
                </div>

                <div className="input-group">
                  <input
                    type="time"
                    name="Event_Time"
                    placeholder="Event Time"
                    value={formData.Event_Time || ""}
                    onChange={handleChange}
                    required
                    className="auth-input"
                  />
                </div>

                <div className="input-group">
                  <input
                    type="number"
                    name="Expected_Persons"
                    placeholder="Expected Number of Attendees"
                    value={formData.Expected_Persons || ""}
                    onChange={handleChange}
                    required
                    className="auth-input"
                  />
                </div>

                <div className="input-group">
                  <input
                    type="text"
                    name="Organizer_Name"
                    placeholder="Organizing Head / Contact Person"
                    value={formData.Organizer_Name || ""}
                    onChange={handleChange}
                    required
                    className="auth-input"
                  />
                </div>

                <div className="input-group">
                  <input
                    type="tel"
                    name="Organizer_Contact"
                    placeholder="Organizer Contact Number"
                    value={formData.Organizer_Contact || ""}
                    onChange={handleChange}
                    required
                    className="auth-input"
                  />
                </div>

                <div className="input-group">
                  <label className="file-label">
                    Upload Pamphlet / Event Advertisement
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      onChange={handleFileChange}
                      className="auth-input"
                    />
                  </label>
                </div>
              </>
            )}

            <button type="submit" className="auth-button">
              Submit <FiArrowRight />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
