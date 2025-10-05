import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import HomeButton from "../components/HomeButton";
import "./LoginPage.css"; // English: reuse existing styles

export default function ForgotPasswordPage() {
    // English: two-step flow -> 1) request OTP  2) submit OTP + new password
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [msg, setMsg] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const requestOtp = async (e) => {
        e.preventDefault();
        setError(""); setMsg(""); setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/api/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });
            await res.json(); // ignore details, always OK
            setMsg("If that email exists, we've sent a code. Check your inbox.");
            setStep(2);
        } catch (e) {
            setError("Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async (e) => {
        e.preventDefault();
        setError(""); setMsg("");
        if (newPassword !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        setLoading(true);
        try {
            const res = await fetch("http://localhost:5000/api/reset-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email, otp, newPassword })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed");
            setMsg("Password updated. You can login now.");
            setTimeout(() => navigate("/login"), 1000);
        } catch (e) {
            setError(e.message || "Invalid code or expired.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <HomeButton />

            {/* English: reuse same card layout */}
            <div className="auth-content">
                <div className="auth-card">
                    <div className="auth-header">
                        <div className="auth-logo">
                            <span>🍽</span>
                            <h1>Feedaily</h1>
                        </div>
                        <h2>{step === 1 ? "Forgot password" : "Enter code & new password"}</h2>
                        <p>{step === 1 ? "We'll email you a 6-digit code." : "Use the code from your email."}</p>
                    </div>

                    {msg && <div className="auth-error" style={{ color:"#16a34a" }}>{msg}</div>}
                    {error && <div className="auth-error">{error}</div>}

                    {step === 1 ? (
                        <form onSubmit={requestOtp} className="auth-form">
                            <input
                                className="auth-input"
                                type="email"
                                placeholder="Your email"
                                value={email}
                                onChange={(e)=>setEmail(e.target.value)}
                                required
                            />
                            <button type="submit" className="auth-button" disabled={loading} aria-busy={loading}>
                                {loading ? <div className="spinner" aria-hidden="true"></div> : "Send Code"}
                            </button>
                            <div className="auth-footer">
                                <Link to="/login" className="auth-link">Back to login</Link>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={resetPassword} className="auth-form">
                            <input
                                className="auth-input"
                                type="text"
                                placeholder="6-digit code"
                                value={otp}
                                onChange={(e)=>setOtp(e.target.value)}
                                required
                            />
                            <input
                                className="auth-input"
                                type="password"
                                placeholder="New password"
                                value={newPassword}
                                onChange={(e)=>setNewPassword(e.target.value)}
                                required
                            />
                            <input
                                className="auth-input"
                                type="password"
                                placeholder="Confirm new password"
                                value={confirmPassword}
                                onChange={(e)=>setConfirmPassword(e.target.value)}
                                required
                            />
                            <button type="submit" className="auth-button" disabled={loading} aria-busy={loading}>
                                {loading ? <div className="spinner" aria-hidden="true"></div> : "Reset Password"}
                            </button>

                            <div className="nav-buttons" style={{ marginTop: "0.75rem" }}>
                                <button
                                    type="button"
                                    className="nav-button"
                                    onClick={() => setStep(1)}
                                    disabled={loading}
                                    aria-busy={loading}
                                >
                                    Back
                                </button>
                                <Link to="/login" className="auth-link">Login</Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>

            {/* background illustration (reuse from Login) */}
            <img
                className="auth-illustration"
                src="/img/authBackground.png"
                alt=""
            />
        </div>
    );
}
