

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyPhone } from "../services/auth";

function LoginPhone() {
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");

  const navigate = useNavigate();

  const handleNext = () => {
    const user = verifyPhone(countryCode, phone);

    if (!user) {
      alert("Phone Number Not Found");
      return;
    }

    localStorage.setItem("phone", phone);

    navigate("/password");
  };

  return (
    <div className="container">
      <h1>VIDEO CALL APP</h1>

      <input
        value={countryCode}
        onChange={(e) => setCountryCode(e.target.value)}
        placeholder="+91"
      />

      <input
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        placeholder="Phone Number"
      />

      <button onClick={handleNext}>
        Next
      </button>
    </div>
  );
}

export default LoginPhone;

