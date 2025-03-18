import React from 'react';
import { Link } from 'react-router-dom';
import './styling/NotFound.css';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-content">
        <h1 className="error-code">404</h1>
        <h2 className="error-message">Page Not Found</h2>
        
        <div className="reason-box">
          <h3>Why you might see this page:</h3>
          <ul className="reason-list">
            <li>The page you are looking for does not exist</li>
            <li>You need to login to gain access</li>
            <li>You do not have permission to view this page</li>
          </ul>
        </div>
        
        <div className="solution-box">
          <h3>How to fix this:</h3>
          <ul className="solution-list">
            <li>Check the URL and try again</li>
            <li>Try to <Link to="/login" className="login-link">LOGIN</Link> Again</li>
            <li>Check your internet connection</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotFound;