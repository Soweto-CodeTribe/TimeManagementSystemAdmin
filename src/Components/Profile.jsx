import React, { useState } from 'react';
import './styling/Profile.css';
import { FaUser, FaChartBar, FaCog, FaSignOutAlt } from 'react-icons/fa';

const Profile = () => {
  const [selectedImage, setSelectedImage] = useState(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl); // Set the state to the image URL
    }
  };

  return (
    <div className="profile-container">
      {/* Sidebar */}
      <div className="profile-sidebar">
        <h2>PROFILE</h2>
        <div className="avatar-section">
          <div className="avatar-placeholder">
            {selectedImage ? (
              <img src={selectedImage} alt="Uploaded" className="uploaded-image" style={{ display: 'block' }} />
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
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="profile-main">
        <form className="profile-form">
          <label>Username:</label>
          <input type="text" value="Asenkrekmanov" readOnly />

          <label>Email:</label>
          <input type="email" value="azkrekmanov@gmail.com" readOnly />

          <label>Password:</label>
          <input type="password" value="bigbigworld123" readOnly />

          <label>Repeat Password:</label>
          <input type="password" value="bigbigworld123" readOnly />

          <label>About Me:</label>
          <textarea value="I am Asen Krekmanov and I am dedicated UI/UX Designer from Sofia, Bulgaria." readOnly />

          <button className="update-btn">Update Information</button>
        </form>

        {/* Right Sidebar */}
        <div className="right-sidebar">
          <button><FaUser /> Profile</button>
          <button><FaChartBar /> Statistics</button>
          <button><FaCog /> Settings</button>
          <button><FaSignOutAlt /> Sign Out</button>
        </div>
      </div>
    </div>
  );
};

export default Profile;

  