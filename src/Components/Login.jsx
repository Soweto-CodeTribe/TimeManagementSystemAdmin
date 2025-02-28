import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, clearError } from "../Slices/authSlice";
import { FaEnvelope, FaLock } from "react-icons/fa";
import "../Components/styling/Login.css";
import logo from "../assets/CodeTribeImage.png";
import loginImg from "../assets/loginImg.png";
import { useNavigate } from 'react-router-dom'; // Make sure to import useNavigate if you're using React Router

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [debugInfo, setDebugInfo] = useState("");
  const dispatch = useDispatch();
  const { isLoading, error } = useSelector((state) => state.auth);
  const navigate = useNavigate(); // Initialize useNavigate for redirection

  console.log("Login component rendering");

  const handleLogin = async (e) => {
    e.preventDefault();
    setDebugInfo(""); // Clear previous debug info
    
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    // Clear any previous errors
    dispatch(clearError());

    try {
      const response = await fetch("https://timemanagementsystemserver.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }), // Send credentials in the request body
      });

      const data = await response.json();
      console.log("user: ", data);

      if (response.ok) {
        // Assuming the response contains a JWT or user data for authentication
        // You might want to store it in localStorage or context/state depending on your app's needs
        // localStorage.setItem("token", data.token); // Example if you receive a token
        console.log("user: ", data);
        navigate("/"); // Redirect to Dashboard after successful login
      } else {
        alert(data.message || "Invalid credentials!"); // Show message from the server
      }

      setDebugInfo("Attempting login...");
      console.log("Login attempt with:", { email, password: "********" });

      const resultAction = await dispatch(loginUser({ email, password }));
      console.log("Login result:", resultAction);
      
      if (loginUser.fulfilled.match(resultAction)) {
        setDebugInfo("Login successful!");
        console.log("Login successful:", resultAction.payload);
        // No need to navigate here - App.js will handle redirection
      } else if (loginUser.rejected.match(resultAction)) {
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

            {error && <p className="error-message">{error}</p>}
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