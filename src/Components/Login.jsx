"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock } from "react-icons/fa";
import "../Components/styling/Login.css";
import logo from "../assets/CodeTribeImage.png"; // Adjust the path as needed


const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(
        "https://timemanagementsystemserver.onrender.com/api/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      const data = await response.json();
      setIsLoading(false);

      if (response.ok) {
        setIsAuthenticated(true);
        navigate("/");
      } else {
        alert(data.message || "Invalid credentials!");
      }
    } catch (error) {
      console.error("Error during login:", error);
      setIsLoading(false);
      alert("An error occurred while logging in. Please try again later.");
    }
  };

  return (
    <div className="login-container">
      {/* Left Section - Login Form */}
      <div className="login-left">
        <div className="login-content">
        <img src={logo} alt="Brand Logo" className="brand-logo" />

          <div className="login-header">
            <h2>Secure Access to Your Account</h2>
            <p>Sign in with your email and password to continue.</p>
          </div>

          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter email address"
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div className="password-header">
                <label htmlFor="password">Password</label>
                <a href="#" className="forgot-link">
                  Forgot password?
                </a>
              </div>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
            </div>

            <button type="submit" className="continue-btn" disabled={isLoading}>
              {isLoading ? "Please wait..." : "Continue"}
            </button>

            <div className="progress-dots">
              <span className="dot active"></span>
              <span className="dot"></span>
            </div>
          </form>
        </div>
      </div>

      {/* Right Section - Illustration */}
      <div className="login-right">
        <div className="right-content">
          <h2>Track Attendance with Ease</h2>
          <p>Monitor trainee check-ins, manage sessions, and generate reports—all in one place.</p>

          <div className="illustration-wrapper">
            <img
              src="../src/assets/loginImg.png"
              alt="Attendance tracking illustration"
              className="illustration"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
