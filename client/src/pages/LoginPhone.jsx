

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyPhone } from "../services/auth";

function LoginPhone() {
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");

  const navigate = useNavigate();

  const handleNext = () => {
    if (!phone.trim()) {
      alert("Please enter phone number");
      return;
    }

    const user = verifyPhone(countryCode, phone);

    if (!user) {
      alert("Phone Number Not Found");
      return;
    }

    localStorage.setItem("phone", phone);

    navigate("/password");
  };

  const handleForgotPassword = () => {
    if (!phone.trim()) {
      alert("Please enter phone number first");
      return;
    }

    const confirmAction = window.confirm(
      "user credentials updated Successful. Continue?"
    );

    if (!confirmAction) return;

    localStorage.clear();

    alert("credentials changed Successful!");

    navigate("/");
    window.location.reload();
  };

  return (
    <div className="login-container">
      <div className="login-card">

        <h1 className="app-title">
          VIDEO CALL APP
        </h1>

        <p className="subtitle">
          Secure Real-Time Communication
        </p>

        <input
          value={countryCode}
          onChange={(e) =>
            setCountryCode(e.target.value)
          }
          placeholder="+91"
          className="input-box"
        />
        <br />
        <br />

        <input
          value={phone}
          onChange={(e) =>
            setPhone(e.target.value)
          }
          placeholder="Enter Phone Number"
          className="input-box"
        />
        <br />
        <br />
        <br />
        <br />

        <button
          onClick={handleNext}
          className="primary-btn"
        >
          Next
        </button>
        <br />
        <br />
        <br />
        <br />

        <button
          onClick={handleForgotPassword}
          className="forgot-btn"
        >
          Forgot Password?
        </button>

      </div>
    </div>
  );
}

export default LoginPhone;

