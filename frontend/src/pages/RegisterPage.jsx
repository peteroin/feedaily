import React, { useState } from "react";
import "./AuthPages.css";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [type, setType] = useState("Student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [contact, setContact] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    setError("");

    const res = await fetch("http://localhost:5000/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, type, email, password, contact, address })
    });

    const data = await res.json();

    if (data.message === "Registration successful") {
      alert("Registration successful!");
      // Redirect or further actions here
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="auth-container">
      <form 
        onSubmit={(e) => { e.preventDefault(); handleRegister(); }} 
        className="auth-form"
      >
        <h2>Register</h2>
        
        {error && <div className="auth-error">{error}</div>}

        <input
          type="text"
          placeholder="Full Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          required
        >
          <option value="Student">Student</option>
          <option value="Individual">Individual</option>
          <option value="Organisation">Organisation</option>
          <option value="NGO">NGO</option>
          <option value="Others">Others</option>
        </select>

        <input
          type="text"
          placeholder="Contact Number"
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          required
        />

        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <button type="submit">Register</button>
      </form>
    </div>
  );
}
