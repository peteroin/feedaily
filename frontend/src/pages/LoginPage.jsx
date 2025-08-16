import React, { useState } from "react";
import "./AuthPages.css";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    setError("");

    const res = await fetch("http://localhost:5000/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    if (data.message === "Login successful") {
      alert("Login successful!");
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="auth-bg">
      <div className="auth-container">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLogin();
          }}
          className="auth-form"
        >
          <h2>Login</h2>

          {error && <div className="auth-error">{error}</div>}

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit">Login</button>
        </form>
      </div>
    </div>
  );
}
