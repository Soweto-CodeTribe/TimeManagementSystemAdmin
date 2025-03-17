import React from 'react';

const NotFound = () => {
  return (
    <div className="not-found-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1>404 - Page Not Found</h1>
      <p>Sorry, the page you are looking for does not exist or you don't have permission to access it.</p>
      <a 
        href="/login" 
        style={{
          marginTop: '20px',
          padding: '10px 20px',
          backgroundColor: '#007bff',
          color: 'white',
          borderRadius: '5px',
          textDecoration: 'none',
          fontWeight: 'bold'
        }}
      >
        Return to Login
      </a>
    </div>
  );
};

export default NotFound;