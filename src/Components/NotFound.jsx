import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="not-found-container" style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100%',
      backgroundColor: '#f8f9fa',
      fontFamily: 'Arial, sans-serif',
      padding: '20px',
      paddingTop:'0'
    }}>
      <div style={{
        maxWidth: '600px',
        backgroundColor: '#ffffff',
        borderRadius: '10px',
        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
        padding: '30px',
        margin: '20px',
        textAlign: 'center'
      }}>
        <h1 style={{
          fontSize: '3rem',
          color: '#dc3545',
          marginBottom: '10px'
        }}>404</h1>
        
        <h2 style={{
          fontSize: '1.5rem',
          color: '#343a40',
          marginBottom: '20px'
        }}>Page Not Found</h2>
        
        <div style={{
          backgroundColor: '#f1f3f5',
          borderRadius: '8px',
          padding: '20px',
          marginBottom: '25px'
        }}>
          <h3 style={{
            fontSize: '1.2rem',
            color: '#495057',
            marginBottom: '15px'
          }}>Why you might see this page:</h3>
          
          <ul style={{
            listStyleType: 'none',
            padding: '0',
            textAlign: 'left'
          }}>
            <li style={{
              padding: '8px 0',
              borderBottom: '1px solid #dee2e6',
              color: '#6c757d'
            }}>• The page you are looking for does not exist</li>
            <li style={{
              padding: '8px 0',
              borderBottom: '1px solid #dee2e6',
              color: '#6c757d'
            }}>• You need to login to gain access</li>
            <li style={{
              padding: '8px 0',
              borderBottom: '1px solid #dee2e6',
              color: '#6c757d'
            }}>• You do not have permission to view this page</li>
            
          </ul>
        </div>
        
        <div style={{
          backgroundColor: '#e9f7ef',
          borderRadius: '8px',
          padding: '20px'
        }}>
          <h3 style={{
            fontSize: '1.2rem',
            color: '#2e7d32',
            marginBottom: '15px'
          }}>How to fix this:</h3>
          
          <ul style={{
            listStyleType: 'none',
            padding: '0',
            textAlign: 'left'
          }}>
            <li style={{
              padding: '8px 0',
              borderBottom: '1px solid #c8e6c9',
              color: '#4caf50'
            }}>• Check the URL and try again</li>
            <li style={{
              padding: '8px 0',
              borderBottom: '1px solid #c8e6c9',
              color: '#4caf50'
            }}>• Try to <Link to="/login" style={{color: '#1976d2', textDecoration: 'none',padding:'5px'}}> LOGIN </Link>Again</li>
            <li style={{
              padding: '8px 0',
              borderBottom: '1px solid #c8e6c9',
              color: '#4caf50'
            }}>• Check your internet connection</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default NotFound;