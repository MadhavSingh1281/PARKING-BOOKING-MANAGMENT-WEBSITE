import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import parkingImg from "../assets/parking.png";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      toast.error("Enter email and password");
      return;
    }

    try {
      const res = await axios.post(
        "https://parksafe-backend-19x3.onrender.com/api/auth/login",
        {
          email,
          password,
        }
      );

      // Save login data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("email", res.data.email);

      console.log("TOKEN:", localStorage.getItem("token"));
      console.log("ROLE:", localStorage.getItem("role"));
      console.log("RESPONSE:", res.data);

      toast.success("Login Successful");

      // Redirect
      if (res.data.role === "admin") {
        window.location.replace("/admin");
      } else {
        window.location.replace("/");
      }

    } catch (err) {
      console.log(err);
      toast.error(err?.response?.data?.message || "Login Failed");
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">

        <div className="login-image">
          <img src={parkingImg} alt="parking" />
        </div>

        <div className="login-form">

          <h2 className="login-title">User Login</h2>

          <input
            className="login-input"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="login-input"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <div className="login-actions">
            <button
              className="login-btn"
              onClick={handleLogin}
            >
              LOGIN
            </button>

            <span className="reset-text">
              Reset
            </span>
          </div>

          <p className="signup-text">
            Don't have an account?{" "}
            <span onClick={() => navigate("/signup")}>
              Signup
            </span>
          </p>

        </div>

      </div>
    </div>
  );
}