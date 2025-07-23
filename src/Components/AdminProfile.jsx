import { useState, useEffect } from 'react';
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
    email: '',
    profileImageUrl: '' // Add this field
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
    document.body.classList.add('no-scroll');
    return () => {
      document.body.classList.remove('no-scroll');
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
        
        // Set images from backend data
        const profileImageUrl = response.data.profileImageUrl || '';
        setSelectedImage(profileImageUrl);
        setTempImage(profileImageUrl);
        
        // Optional: Still cache in localStorage for faster loading
        if (profileImageUrl) {
          localStorage.setItem(`profileImage_${userId}`, profileImageUrl);
          if (response.data.email) {
            localStorage.setItem(`profileImage_${response.data.email}`, profileImageUrl);
          }
        }
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
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

  // Updated function to save image to backend
  const saveProfileImage = async () => {
    if (!tempImage) {
      setImageMessage('No image selected to save.');
      setTimeout(() => setImageMessage(''), 3000);
      return;
    }

    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    
    if (!token || !userId) {
      setImageMessage('Authentication information missing. Please log in again.');
      return;
    }

    setIsImageLoading(true);
    setImageMessage('Saving profile image...');

    try {
      // Save image URL to backend
      const response = await axios.put(
        `https://timemanagementsystemserver.onrender.com/api/facilitators/${userId}`,
        { profileImageUrl: tempImage },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data) {
        // Update local state
        setSelectedImage(tempImage);
        setUserData(prev => ({
          ...prev,
          profileImageUrl: tempImage
        }));

        // Update localStorage cache
        localStorage.setItem(`profileImage_${userId}`, tempImage);
        if (userData.email) {
          localStorage.setItem(`profileImage_${userData.email}`, tempImage);
        }

        // Dispatch event for other components
        window.dispatchEvent(new Event('profileImageUpdated'));
        
        setImageMessage('Profile image saved successfully!');
        setTimeout(() => {
          setImageMessage('');
          setIsImageLoading(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving profile image:', error);
      setImageMessage('Failed to save profile image. Please try again.');
      setTimeout(() => {
        setImageMessage('');
        setIsImageLoading(false);
      }, 3000);
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
    // Remove authentication-related items
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    
    // Optional: Keep profile images in cache or remove them
    // localStorage.removeItem(`profileImage_${localStorage.getItem('userId')}`);
    
    window.location.href = '/login';
  };

  const userRole = localStorage.getItem('role');

  return (
    <div className="profile-container">
      <div className="profile-sidebar">
        <div className="avatar-section">
          <div className="avatar-placeholder">
            {selectedImage || tempImage ? (
              <img src={tempImage || selectedImage} alt="Profile" className="uploaded-image"/>
            ) : (
              <FaUser size={50} />
            )}
          </div>
          <div className="image-controls">
            <label htmlFor="file-input" className="upload-btn">Upload</label>
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
              disabled={isImageLoading || !tempImage}
            >
              {isImageLoading ? 'Saving...' : 'Save'}
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
                value={userData.name || userData.fullName || ''}
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
                value={userData.IdNumber || userData.idNumber || ''}
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
                value={userData.role}
                readOnly={userRole !== 'super_admin'}
                disabled={userRole !== 'super_admin'}
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
                value={userData.City || userData.city || ''}
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