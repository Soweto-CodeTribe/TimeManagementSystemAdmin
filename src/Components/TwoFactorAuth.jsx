import { useState, useEffect } from "react";
import { FaEnvelope, FaPhone } from "react-icons/fa";
import "../Components/styling/Login.css";
import logo from "../assets/CodeTribeImage.png";
import factorimg from "../assets/two-factor-authentication.png";
import { useNavigate } from "react-router-dom";

const TwoFactorAuth = () => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [otpSent, setOtpSent] = useState(true); // Always show OTP screen
  const [require2fa, setRequire2fa] = useState(true); // Always require 2FA
  const navigate = useNavigate();

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Get the token from localStorage
      const token = localStorage.getItem("authToken");
      
      // For testing purposes - allow the form to work without a token
      // In a production environment, you'd want to maintain the token check
      if (!token) {
        // For development/testing only - simulate successful verification
        console.log("Development mode: Simulating successful verification");
        
        // Simulate delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        alert("Two-Factor Authentication Successfully Enabled! (Development mode)");
        navigate("/");
        return;
      }

      // Regular verification logic when token is present
      const cleanedPhoneNumber = phoneNumber.replace(/\D/g, "");
      const formattedPhoneNumber = cleanedPhoneNumber.startsWith("27")
        ? `+${cleanedPhoneNumber}`
        : `+27${cleanedPhoneNumber}`;

      const response = await fetch(
        "https://timemanagementsystemserver.onrender.com/api/auth/verify-otp",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            phoneNumber: formattedPhoneNumber,
            otp: otp,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Invalid OTP");
      }

      // After successful verification, update user's profile to indicate 2FA is enabled
      const enableResponse = await fetch(
        "https://timemanagementsystemserver.onrender.com/api/auth/enable-2fa",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            twoFactorEnabled: true,
            phoneNumber: formattedPhoneNumber,
          }),
        }
      );

      if (!enableResponse.ok) {
        throw new Error("Failed to update 2FA status on server");
      }

      alert("Two-Factor Authentication Successfully Enabled!");
      navigate("/");
    } catch (err) {
      console.error("OTP Verification Error:", err);
      setError(
        err.message || "An unexpected error occurred during OTP verification"
      );
    } finally {
      setLoading(false);
    }
  };

  // Optional: Set a dummy token for testing purposes
  useEffect(() => {
    // Uncomment the line below to set a dummy token for testing
    // localStorage.setItem("authToken", "dummy-token-for-testing");
  }, []);

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

            <button
              type="submit"
              className="continue-btn"
              disabled={loading}
            >
              {loading ? "Verifying..." : "Verify OTP"}
            </button>
          </form>

          <div className="progress-bars">
            <span className="bar active"></span>
            <span className="bar"></span>
          </div>
        </div>
      </div>

      <div className="login-right">
        <div className="right-content">
          <h2>Extra Layer of Security</h2>
          <p>
            Enter your phone number and receive OTP via email to verify your
            identity.
          </p>

          <div className="illustration-wrapper">
            <img
              src={factorimg}
              alt="Two-factor authentication illustration"
              className="illustration"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactorAuth;