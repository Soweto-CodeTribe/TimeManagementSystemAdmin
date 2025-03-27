import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styling/AdminProfile.css';
import { FaUser } from 'react-icons/fa';
import DataLoader from "./dataLoader";

const AdminProfile = () => {
  const [selectedImage, setSelectedImage] = useState('');
  const [tempImage, setTempImage] = useState('');
  const [userData, setUserData] = useState({
    fullName: '',
    surname: '',
    role: '',
    email: ''
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [imageMessage, setImageMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);

  // Cloudinary configuration
  const CLOUDINARY_UPLOAD_PRESET = 'uploads';
  const CLOUDINARY_CLOUD_NAME = 'dpjxrzgwq';
  const CLOUDINARY_UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

  // Disable scrolling when the component mounts
  useEffect(() => {
    document.body.classList.add('no-scroll'); // Add class to disable scrolling

    return () => {
      document.body.classList.remove('no-scroll'); // Remove class to re-enable scrolling
    };
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    console.log("User-id:", userId);
    console.log("Authorization Token:", token);
    if (!token || !userId) {
      setFeedbackMessage('Authentication information missing. Please log in again.');
      return;
    }
    setIsLoading(true);
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
        console.log("User id:", response.data.uid);
        
        // Load profile image after we have user data
        loadProfileImage(response.data.email);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // New function to load profile image with fallbacks
  const loadProfileImage = (email) => {
    const userId = localStorage.getItem('userId');
    
    // Try to get image by userId first
    let storedImage = localStorage.getItem(`profileImage_${userId}`);
    
    // If not found and we have email, try that
    if (!storedImage && email) {
      storedImage = localStorage.getItem(`profileImage_${email}`);
      
      // If found via email, also set it for the current userId for future use
      if (storedImage && userId) {
        localStorage.setItem(`profileImage_${userId}`, storedImage);
      }
    }
    
    setTempImage(storedImage || '');
    setSelectedImage(storedImage || '');
  };

  useEffect(() => {
    fetchUserData();
  }, []);

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
      setIsImageLoading(true);
      setImageMessage('Uploading image to Cloudinary...');
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      const userId = localStorage.getItem('userId');
      formData.append('tags', `user_${userId}`);
      axios.post(CLOUDINARY_UPLOAD_URL, formData)
        .then(response => {
          console.log('Cloudinary upload response:', response.data);
          const imageUrl = response.data.secure_url;
          setTempImage(imageUrl);
          setImageMessage('Image uploaded successfully! Click "Save Image" to update your profile.');
          setIsImageLoading(false);
        })
        .catch(error => {
          console.error('Cloudinary upload error:', error);
          setImageMessage('Failed to upload image. Please try again.');
          setIsImageLoading(false);
        });
    }
  };

  const saveProfileImage = () => {
    if (tempImage) {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setImageMessage('User ID not found. Please log in again.');
        return;
      }
      setIsImageLoading(true);

      // Store with both userId and email for cross-session persistence
      localStorage.setItem(`profileImage_${userId}`, tempImage);
      
      // If we have email, store with that too for persistence after logout
      if (userData.email) {
        localStorage.setItem(`profileImage_${userData.email}`, tempImage);
      }
      
      window.dispatchEvent(new Event('profileImageUpdated'));
      setImageMessage('Profile image saved successfully! Refreshing...');
      setSelectedImage(tempImage);
      setTimeout(() => {
        setIsImageLoading(false);
        setImageMessage('');
      }, 1500);
    } else {
      setImageMessage('No image selected to save.');
      setTimeout(() => setImageMessage(''), 3000);
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
    setIsLoading(true);
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
        await fetchUserData();
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    // Only remove authentication-related items
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    
    // Note: We're NOT removing any profileImage_* items
    // This allows profile images to persist across sessions
    
    window.location.href = '/login';
  };

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <div className="avatar-section">
          <div className="avatar-placeholder">
            {tempImage ? (
              <img src={tempImage} alt="Profile" className="uploaded-image"/>
            ) : (
              <FaUser size={50} />
            )}
          </div>
          <div className="image-controls">
            <label htmlFor="file-input" className="upload-btn">Upload </label>
            <input
              type="file"
              id="file-input"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            <button
              type="button"
              className="save-image-btn"
              onClick={saveProfileImage}
              disabled={isImageLoading}
            >
              {isImageLoading ? 'Saving...' : 'Save '}
            </button>
          </div>
          {isImageLoading && (
            <div className="loader-container">
              <DataLoader />
            </div>
          )}
          {imageMessage && <p className="image-message">{imageMessage}</p>}
        </div>
      </div>
      <div className="profile-main">
        {isLoading && !isImageLoading ? (
          <div className="loader-container">
            <DataLoader />
            <p>Loading profile data...</p>
          </div>
        ) : (
          <>
          <form className="profile-form" onSubmit={handleUpdate}>
            <h1>Basic Information</h1>
            <label>Name:</label>
            <input
              type="text"
              name="fullname"
              value={userData.name || ''}
              onChange={handleInputChange}
            />
            <label>Surname:</label>
            <input
              type="text"
              name="surname"
              value={userData.surname || ''}
              onChange={handleInputChange}
            />
             <label>ID Number:</label>
            <input
              type="text"
              name="IdNumber"
              value={userData.IdNumber || ''}
              onChange={handleInputChange}
             
            />
             <label>Phone Number:</label>
            <input
              type="text"
              name="phoneNumber"
              value={userData.phoneNumber || ''}
              onChange={handleInputChange}
             
            />
            <label>Role:</label>
            <input
              type="text"
              name="role"
              value={userData.role || ''}
              onChange={handleInputChange}
              readOnly
            />
            <label>Email:</label>
            <input
              type="text"
              name="email"
              value={userData.email || ''}
              onChange={handleInputChange}
         
            />
          </form>

          <form className="profile-form" onSubmit={handleUpdate}>
            <h1>Physical address</h1>

            <label>Street:</label>
            <input
              type="text"
              name="street"
              value={userData.street || ''}
              onChange={handleInputChange}
            />
            <label>City:</label>
            <input
              type="text"
              name="City"
              value={userData.City || ''}
              onChange={handleInputChange}
            />
            <label>Postal Code:</label>
            <input
              type="text"
              name="postalCode"
              value={userData.postalCode || ''}
              onChange={handleInputChange}
            />
            <button
              className="update-btn"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Information'}
            </button>
          </form>
          </>
        )}
        {successMessage && <p className="success-message">{successMessage}</p>}
        {feedbackMessage && <p className="error-message">{feedbackMessage}</p>}
      </div>
    </div>
  );
};

export default AdminProfile;