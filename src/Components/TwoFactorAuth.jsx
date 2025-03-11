import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { verifyOTP } from "../Slices/authSlice"; // Import the Redux action
import { useNavigate } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";
import "../Components/styling/Login.css";
import logo from "../assets/CodeTribeImage.png";
import factorimg from "../assets/two-factor-authentication.png";

const TwoFactorAuth = () => {
  const [otp, setOtp] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    
    const verificationId = localStorage.getItem("verificationID");
    
    if (!verificationId) {
      alert("No verification ID found.");
      return;
    }

    dispatch(verifyOTP({ verificationId, verificationCode: otp }))
      .unwrap()
      .then(() => {
        navigate("/"); // Redirect after successful verification
      })
      .catch((err) => {
        console.error("Verification failed:", err);
      });
  };

  return (
    <div className="login-container">
      <div className="login-left">
        <div className="login-content">
          <img src={logo} alt="Brand Logo" className="brand-logo" />
          <div className="login-header">
            <h2>Enter OTP</h2>
            <p>Enter the OTP sent to your registered email.</p>
          </div>
          <form onSubmit={handleVerifyOTP} className="login-form">
            <div className="form-group">
              <label htmlFor="otp">Enter OTP</label>
              <div className="input-wrapper">
                <FaEnvelope className="input-icon" />
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter OTP from your email"
                  required
                />
              </div>
            </div>
            {error && <p className="error-message">{error}</p>}
            <button type="submit" className="continue-btn" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>
        </div>
      </div>
      <div className="login-right">
        <div className="right-content">
          <h2>Extra Layer of Security</h2>
          <p>Enter your phone number and receive OTP via email to verify your identity.</p>
          <div className="illustration-wrapper">
            <img src={factorimg} alt="Two-factor authentication illustration" className="illustration" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;
