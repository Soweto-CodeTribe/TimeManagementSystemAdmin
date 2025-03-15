import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styling/AdminProfile.css';
import { FaUser } from 'react-icons/fa';

const AdminProfile = () => {
  const [selectedImage, setSelectedImage] = useState(() => {
    return localStorage.getItem('profileImage') || null;
  });

  const [userData, setUserData] = useState({
    firstName: '',
    lastName: '',
    role: '',
    email: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');

  const fetchUserData = async () => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    console.log("Authorization Token:", token);

    if (!token || !userId) {
      setFeedbackMessage('Authentication information missing. Please log in again.');
      return;
    }

    try {
      const response = await axios.get(
        `https://timemanagementsystemserver.onrender.com/api/facilitators/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setUserData(response.data);
        console.log("Fetched User Data:", response.data);
      }
    } catch (error) {
      handleError(error);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  useEffect(() => {
    if (selectedImage) {
      localStorage.setItem('profileImage', selectedImage);
    }
  }, [selectedImage]);

  const handleError = (error) => {
    if (error.response) {
      setFeedbackMessage(error.response.data.message || 'An error occurred while fetching data.');
    } else if (error.request) {
      setFeedbackMessage('No response from server. Please check your connection.');
    } else {
      setFeedbackMessage('Error: ' + error.message);
    }
    console.error('Error:', error);
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setSelectedImage(base64String);
        localStorage.setItem('profileImage', base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdate = async (event) => {
    event.preventDefault();
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');

    console.log("User Data:", userData);
    console.log("Authorization Token:", token);

    if (!token || !userId) {
      setFeedbackMessage('Authentication information missing. Please log in again.');
      return;
    }

    try {
      const response = await axios.put(
        `https://timemanagementsystemserver.onrender.com/api/facilitators/${userId}`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        setSuccessMessage('Profile updated successfully!');
        setTimeout(() => setSuccessMessage(''), 3000);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleLogout = () => {
    // Only remove authentication-related data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    window.location.href = '/login';
  };

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <h2>PROFILE</h2>
        <div className="avatar-section">
          <div className="avatar-placeholder">
            {selectedImage ? (
              <img src={selectedImage} alt="Profile" className="uploaded-image" />
            ) : (
              <FaUser size={50} />
            )}
          </div>
          <label htmlFor="file-input" className="upload-btn">
            Choose File
          </label>
          <input 
            type="file" 
            id="file-input" 
            accept="image/*"
            onChange={handleImageUpload} 
            style={{ display: 'none' }}
          />
        </div>
      </div>

      <div className="profile-main">
        <form className="profile-form" onSubmit={handleUpdate}>
          <label>First Name:</label>
          <input 
            type="text" 
            name="firstName"
            value={userData.firstName} 
            onChange={handleInputChange} 
          />

          <label>Last Name:</label>
          <input 
            type="text" 
            name="lastName"
            value={userData.lastName} 
            onChange={handleInputChange} 
          />

          <label>Role:</label>
          <input 
            type="text" 
            name="role"
            value={userData.role} 
            onChange={handleInputChange} 
            readOnly
          />

          <label>Email:</label>
          <input 
            type="email" 
            name="email"
            value={userData.email} 
            onChange={handleInputChange} 
          />

          <button className="update-btn" type="submit">Update Information</button>
        </form>

        {successMessage && <p className="success-message">{successMessage}</p>}
        {feedbackMessage && <p className="error-message">{feedbackMessage}</p>}

        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
    </div>
  );
};

export default AdminProfile;