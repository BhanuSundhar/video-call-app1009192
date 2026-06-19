

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { verifyPassword } from "../services/auth";

function LoginPassword() {
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const phone = localStorage.getItem("phone");

  const handleLogin = () => {
    const user = verifyPassword(phone, password);

    if (!user) {
      alert("Wrong Password");
      return;
    }

    localStorage.setItem(
      "user",
      JSON.stringify(user)
    );

    navigate("/dashboard");
  };

  return (
    <div className="container">
      <h2>Password</h2>

      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) =>
          setPassword(e.target.value)
        }
      />

      <button onClick={handleLogin}>
        Login
      </button>
    </div>
  );
}

export default LoginPassword;

