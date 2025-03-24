import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './styling/NotFound.css';

const ErrorPage = ({ errorType = '404' }) => {
  const location = useLocation();
  
  // Get error type from URL if present (e.g., /error/500)
  const pathErrorType = location.pathname.split('/').pop();
  
  // Use URL error type if it's valid, otherwise use the prop
  const currentErrorType = ['404', '500', '403'].includes(pathErrorType) 
    ? pathErrorType 
    : errorType;

  // Define content for each error type
  const errorContent = {
    '404': {
      code: '404',
      message: 'Page Not Found',
      reasons: [
        'The page you are looking for does not exist',
        'You need to login to gain access',
        'You do not have permission to view this page'
      ],
      solutions: [
        'Check the URL and try again',
        <>Try to <Link to="/login" className="login-link">LOGIN</Link> Again</>,
        'Check your internet connection'
      ]
    },
    '500': {
      code: '500',
      message: 'Server Error',
      reasons: [
        'The server encountered an unexpected error',
        'There might be a temporary issue with our systems',
        'The service you\'re trying to access is currently unavailable'
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
        'You do not have permission to access this resource',
        'Your account might not have the necessary privileges',
        'The content might be restricted to certain user roles'
      ],
      solutions: [
        <>Try to <Link to="/login" className="login-link">LOGIN</Link> with different credentials</>,
        'Contact your administrator for access',
        'Return to the previous page'
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