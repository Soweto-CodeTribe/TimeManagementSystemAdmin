import { useState } from 'react';
import CodeTribeImage from '../assets/CodeTribeImage.png';
import './styling/forgotPassword.css';

const ForgotPassword = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '' });

  const token = useSelector((state) => state.auth.token);
  const BASE_URL = 'https://timemanagementsystemserver.onrender.com';
  const handleForgotPassword = async () => {
    if (!email) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post(`${BASE_URL}/api/auth/forgot-password`, 
        { email },
        { 
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          } 
        }
      );
      
      setLoading(false);
      
      if (response.data.message === "Password reset link sent successfully") {
        navigation.navigate('PasswordEmailScreen', { email });
      } else {
        setError(response.data.message || 'An error occurred');
      }
    } catch (error) {
      setLoading(false); 
      if (error.response) {
        // Server responded with an error
        setError(error.response.data.message || 'Server error');
      } else if (error.request) {
        // No response received
        setError('Network error. Please check your connection.');
      } else {
        // Request setup error
        setError('Failed to send request');
      }
      console.error('Error:', error);
    }
  };

  const showNotification = (message) => {
    setNotification({ show: true, message });
    setTimeout(() => {
      setNotification({ show: false, message: '' });
    }, 3000);
  };

  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (!email) {
      showNotification('Please enter your email address');
      return;
    }
    showNotification('Verification email sent');
    setCurrentStep(2);
  };

  const handleVerifyIdentity = (e) => {
    e.preventDefault();
    showNotification('Identity verified successfully');
    setCurrentStep(3);
  };

  const handleResetPassword = (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) {
      showNotification('Please fill in all fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      showNotification('Passwords do not match');
      return;
    }
    showNotification('Password reset successfully');
    // Redirect to login page after 2 seconds
    setTimeout(() => {
      window.location.href = '/login'; // Change this to your login route
    }, 2000);
  };

  return (
    <div className="forgot-password-container">
      <div className="forgot-password-card">
        <div className="logo-container">
          <img src={CodeTribeImage || "/placeholder.svg"} alt="CodeTribe Logo" className="logo" />
        </div>

        {notification.show && (
          <div className="notification">
            {notification.message}
          </div>
        )}

        {currentStep === 1 && (
          <div className="step-container">
            <h2>Forgot Your Password?</h2>
            <p className='step-container-text'>Enter your email to receive a password reset code.</p>
            <form onSubmit={handleEmailSubmit}>
              <div className="form-group">
                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-field"
                />
              </div>
              <button type="submit" className="submit-button">
                Submit
              </button>
            </form>
          </div>
        )}

        {currentStep === 2 && (
          <div className="step-container">
            <h2>Verify Your Identity</h2>
            <div className="checkmark-container">
              <div className="checkmark">✓</div>
            </div>
            <p>{`We've sent a verification code to your email`}</p>
            <form onSubmit={handleVerifyIdentity}>
              <button type="submit" className="submit-button">
                Continue
              </button>
            </form>
          </div>
        )}

        {currentStep === 3 && (
          <div className="step-container">
            <h2>Set a New Password</h2>
            <form onSubmit={handleResetPassword}>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="input-field"
                />
              </div>
              <div className="form-group">
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-field"
                />
              </div>
              <button type="submit" className="submit-button">
                Reset Password
              </button>
            </form>
          </div>
        )}

        <div className="progress-dots">
          <span className={`dot ${currentStep === 1 ? 'active' : ''}`}></span>
          <span className={`dot ${currentStep === 2 ? 'active' : ''}`}></span>
          <span className={`dot ${currentStep === 3 ? 'active' : ''}`}></span>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;