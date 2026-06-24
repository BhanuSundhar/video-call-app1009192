

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyPhone } from "../services/auth";

function LoginPhone() {
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleNext = () => {
    const trimmedPhone = phone.trim();

    if (!trimmedPhone) {
      setError("Please enter phone number");
      return;
    }

    setLoading(true);
    setError("");

    const user = verifyPhone(countryCode, trimmedPhone);

    setTimeout(() => {
      setLoading(false);

      if (!user) {
        setError("Phone Number Not Found");
        return;
      }

      localStorage.setItem("phone", trimmedPhone);
      navigate("/password");
    }, 300);
  };

  const handleForgotPassword = () => {
    if (!phone.trim()) {
      setError("Please enter phone number first");
      return;
    }

    const confirmAction = window.confirm(
      "This will clear saved browser data for this app. Continue?"
    );

    if (!confirmAction) return;

    localStorage.clear();
    alert("Saved data cleared successfully");
    navigate("/");
    window.location.reload();
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-hero">
          <div className="brand-badge">VC</div>
          <h1>Video Call App</h1>
          <p>Fast, real-time, secure communication across devices.</p>

          <div className="feature-row">
            <span>Real-time</span>
            <span>Secure</span>
            <span>Responsive</span>
          </div>
        </div>

        <div className="auth-card glass">
          <h2>Login with phone</h2>
          <p className="auth-subtitle">Enter your country code and phone number.</p>

          <div className="field-grid">
            <div className="field-group small">
              <label>Country code</label>
              <input
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                placeholder="+91"
                className="auth-input"
              />
            </div>

            <div className="field-group">
              <label>Phone number</label>
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="auth-input"
                inputMode="numeric"
              />
            </div>
          </div>

          {error ? <div className="auth-error">{error}</div> : null}

          <button
            onClick={handleNext}
            className="auth-btn primary"
            disabled={loading}
          >
            {loading ? "Checking..." : "Next"}
          </button>

          <button
            onClick={handleForgotPassword}
            className="auth-btn secondary"
            type="button"
          >
            Forgot Password?
          </button>

          <div className="auth-note">
            Your credentials are checked locally from the built-in user list.
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPhone;

