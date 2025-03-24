import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './styling/NotFound.css'; // You can rename this to ErrorPage.css if you prefer

const ErrorPage = ({ errorType = '404' }) => {
  const location = useLocation();
  
  // Check if error type is in the URL (e.g., /error/500)
  const pathParts = location.pathname.split('/');
  const pathErrorType = pathParts[pathParts.length - 1];
  
  // Use URL error type if it's valid, otherwise use the prop
  const currentErrorType = ['404', '500', '403'].includes(pathErrorType) 
    ? pathErrorType 
    : errorType;

  // Content configuration for different error types
  const errorContent = {
    '404': {
      code: '404',
      message: 'Page Not Found',
      reasons: [
        'The page you are looking for does not exist',
        'The URL might have been changed',
        'The page might have been removed'
      ],
      solutions: [
        'Check the URL and try again',
        'Return to the previous page',
        <Link to="/" className="login-link">Go to Dashboard</Link>
      ]
    },
    '500': {
      code: '500',
      message: 'Server Error',
      reasons: [
        'The server encountered an unexpected error',
        'There might be a temporary issue with our systems',
        'The service you\'re trying to access is unavailable'
      ],
      solutions: [
        'Try refreshing the page',
        'Try again in a few minutes',
        'Contact support if the problem persists'
      ]
    },
    '403': {
      code: '403',
      message: 'Access Forbidden',
      reasons: [
        'You need to login to gain access',
        'You do not have permission to view this page',
        'Your session might have expired'
      ],
      solutions: [
        <Link to="/login" className="login-link">LOGIN</Link>,
        'Contact your administrator if you need access',
        'Check your internet connection'
      ]
    }
  };

  const { code, message, reasons, solutions } = errorContent[currentErrorType];

  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="error-code">{code}</h1>
        <h2 className="error-message">{message}</h2>
        
        <div className="reason-box">
          <h3>Why you might see this page:</h3>
          <ul className="reason-list">
            {reasons.map((reason, index) => (
              <li key={index}>{reason}</li>
            ))}
          </ul>
        </div>
        
        <div className="solution-box">
          <h3>How to fix this:</h3>
          <ul className="solution-list">
            {solutions.map((solution, index) => (
              <li key={index}>{solution}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ErrorPage;