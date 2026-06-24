

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyPassword } from "../services/auth";

function LoginPassword() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const phone = localStorage.getItem("phone");

  const handleLogin = () => {
    if (!phone) {
      navigate("/");
      return;
    }

    if (!password.trim()) {
      setError("Please enter password");
      return;
    }

    setLoading(true);
    setError("");

    const user = verifyPassword(phone, password);

    setTimeout(() => {
      setLoading(false);

      if (!user) {
        setError("Wrong Password");
        return;
      }

      localStorage.setItem("user", JSON.stringify(user));
      navigate("/dashboard");
    }, 300);
  };

  return (
    <div className="auth-page">
      <div className="auth-shell single">
        <div className="auth-hero compact">
          <div className="brand-badge">🔒</div>
          <h1>Password Check</h1>
          <p>Enter your password to access the dashboard.</p>
        </div>

        <div className="auth-card glass">
          <h2>Welcome back</h2>
          <p className="auth-subtitle">
            Phone: <b>{phone || "Not found"}</b>
          </p>

          <div className="field-group">
            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
            />
          </div>

          {error ? <div className="auth-error">{error}</div> : null}

          <button
            onClick={handleLogin}
            className="auth-btn primary"
            disabled={loading}
          >
            {loading ? "Verifying..." : "Login"}
          </button>

          <button
            onClick={() => navigate("/")}
            className="auth-btn secondary"
            type="button"
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}

export default LoginPassword;

