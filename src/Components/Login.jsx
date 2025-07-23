/* eslint-disable no-unused-vars */
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, loginStakeholder, clearError } from "../Slices/authSlice";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import "../Components/styling/Login.css";
import logo from "../assets/CodeTribeImage.png";
import loginImg from "../assets/loginImg.png";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [debugInfo, setDebugInfo] = useState("");
  const [userType, setUserType] = useState("user"); 
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const navigate = useNavigate();


  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }
  
    dispatch(clearError());
    localStorage.setItem("Email", email);
  
    try {
      const loginAction = userType === "stakeholder" ? loginStakeholder : loginUser;
      
      const resultAction = await dispatch(loginAction({ email, password }));
      
      if (loginAction.fulfilled.match(resultAction)) {
        setDebugInfo("Login successful!");
        navigate("/TwoFactorAuth");
        
        // Store verification ID only once, from the payload
        if (resultAction.payload.verificationId) {
          localStorage.setItem("verificationID", resultAction.payload.verificationId);
          console.log('login results' , resultAction)
        }
      } else if (loginAction.rejected.match(resultAction)) {
        const errorMessage = resultAction.payload || resultAction.error.message || "Unknown error";
        setDebugInfo(`Login failed: ${errorMessage}`);
        console.error("Login rejected:", errorMessage);
      }
    } catch (err) {
      const errorMessage = err.message || "Unknown error";
      setDebugInfo(`Login error: ${errorMessage}`);
      console.error("Login error:", err);
    }
  };


  return (
    <div className="login-container">
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
                <a
                  href="/forgot-password"
                  className="forgot-link"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/forgotPassword");
                  }}
                >
                  Forgot password?
                </a>
              </div>
              <div className="input-wrapper">
                <FaLock className="input-icon" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
                <span
                  className="visibility-icon"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </span>
              </div>
            </div>

            {error && <p className="error-message">{`Oops! Something went wrong, please check credentials and try again!`}</p>}
            {debugInfo && <p className="debug-info" style={{ fontSize: "12px", color: "#666" }}>{debugInfo}</p>}

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

      <div className="login-right">
        <div className="right-content">
          <h2>Track Attendance with Ease</h2>
          <p>Monitor trainee check-ins, manage sessions, and generate reports—all in one place.</p>

          <div className="illustration-wrapper">
            <img
              src={loginImg}
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