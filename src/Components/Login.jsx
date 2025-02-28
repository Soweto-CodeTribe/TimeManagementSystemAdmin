import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../Components/styling/Login.css"; // Make sure to style your loader in the CSS file

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false); // New state for loader
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    // Set loading state to true
    setIsLoading(true);

    try {
      const response = await fetch("https://timemanagementsystemserver.onrender.com/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }), // Send credentials in the request body
      });

      const data = await response.json();
      console.log("user: ", data)
      // Set loading state to false
      setIsLoading(false);

      if (response.ok) {
        // Assuming the response contains a JWT or user data for authentication
        setIsAuthenticated(true);
        console.log("user: ", response)
        navigate("/"); // Redirect to Dashboard after successful login
      } else {
        alert(data.message || "Invalid credentials!"); // Show message from the server
      }
    } catch (error) {
      console.error("Error during login:", error);
      setIsLoading(false); // Stop loading on error
      alert("An error occurred while logging in. Please try again later.");
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" disabled={isLoading}>Login</button>
      </form>

      {/* Show the loader when isLoading is true */}
      {isLoading && <div className="loader"></div>}
    </div>
  );
};

export default Login;
