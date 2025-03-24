import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { verifyOTP, resend2FA } from "../Slices/authSlice";
import { useNavigate } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";
import "../Components/styling/Login.css";
import logo from "../assets/CodeTribeImage.png";
import factorimg from "../assets/two-factor-authentication.png";

const TwoFactorAuth = () => {
  const [otp, setOtp] = useState("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0); // Timer state
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);

  useEffect(() => {
    let timer;
    if (resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const verificationId = localStorage.getItem("verificationID");
    
    if (!verificationId) {
      alert("No verification ID found.");
      return;
    }

    dispatch(verifyOTP({ verificationId, verificationCode: otp }))
      .unwrap()
      .then(() => navigate("/")) // Redirect on success
      .catch((err) => console.error("Verification failed:", err));
  };

  const handleResendOTP = async () => {
    if (resendCooldown > 0) return; // Prevent multiple clicks
    setResendLoading(true);
    setResendSuccess(false);
    setResendMessage("");

    try {
      const result = await dispatch(resend2FA()).unwrap();
      setResendSuccess(true);
      setResendMessage(result?.message || "OTP sent successfully! Check your email.");
      alert("OTP has been resent to your email successfully!");
      setResendCooldown(30); // Set cooldown to 30 seconds
    } catch (err) {
      console.error("Failed to resend OTP:", err);
      setResendMessage(err || "Failed to resend OTP. Please try again.");
      alert("Failed to resend OTP: " + (err || "Please try again."));
    } finally {
      setResendLoading(false);
    }
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
            {resendSuccess && <p className="success-message">{resendMessage}</p>}

            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Verify OTP"}
            </button>

            <button
              type="button"
              className="auth-btn"
              onClick={handleResendOTP}
              disabled={resendLoading || resendCooldown > 0}
            >
              {resendLoading
                ? "Sending..."
                : resendCooldown > 0
                ? `Resend OTP (${resendCooldown}s)`
                : "Resend OTP"}
            </button>
          </form>
        </div>

        <div className="progress-dotsAuth">
              <span className="dot"></span>
              <span className="dot active"></span>
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
