import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { FaUserCircle } from "react-icons/fa"; // Import the fallback icon
import { useSelector } from "react-redux";
import "./styling/Navbar.css";

const Navbar = ({ activeScreen }) => {
  const navigate = useNavigate();
  const { unreadCount } = useSelector((state) => state.notifications);

  // State to hold the profile image
  const [profileImage, setProfileImage] = useState("");

  // Function to update the profile image from localStorage with multiple fallbacks
  const updateProfileImage = () => {
    const userId = localStorage.getItem('userId');
    const userEmail = localStorage.getItem('userEmail'); // Assuming you store email in localStorage

    // First try by userId
    let savedImage = userId ? localStorage.getItem(`profileImage_${userId}`) : null;
    
    // If no image found and we have email, try by email
    if (!savedImage && userEmail) {
      savedImage = localStorage.getItem(`profileImage_${userEmail}`);
    }
    
    // If still no image, check if we have a hardcoded default from Cloudinary
    if (!savedImage) {
      // You can use this as a fallback if needed
      const cloudinaryDefault = "https://res.cloudinary.com/dpjxrzgwq/image/upload/v1742798375/vvwycpqz2cfbitwlbqui.png";
      
      // Decide if you want to set it to localStorage for future use
      if (userId) {
        localStorage.setItem(`profileImage_${userId}`, cloudinaryDefault);
      }
      
      savedImage = cloudinaryDefault;
    }
    
    if (savedImage) {
      setProfileImage(savedImage);
    }
  };

  // Load the profile image on component mount
  useEffect(() => {
    updateProfileImage();

    // Listen for storage events to detect changes to localStorage
    window.addEventListener("storage", updateProfileImage);

    // Listen for custom event for same-page updates
    window.addEventListener("profileImageUpdated", updateProfileImage);

    // Cleanup event listeners on unmount
    return () => {
      window.removeEventListener("storage", updateProfileImage);
      window.removeEventListener("profileImageUpdated", updateProfileImage);
    };
  }, []);

  const handleProfileClick = () => {
    navigate("/AdminProfile");
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Left: Screen Name */}
        <div className="screen-container">
          <span className="screen-name">{activeScreen}</span>
        </div>

        {/* Right: Icons */}
        <div className="navicon-container">
          {/* Notification Indicator - links to notifications page */}
          <Link to="/notifications" className="notification-indicator">
            <Bell className="bell-icon" />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </Link>

          {/* Profile image - using div instead of Avatar */}
          <div
            className="profile-image"
            onClick={handleProfileClick}
            style={{
              width: "30px",
              height: "30px",
              borderRadius: "50%",
              backgroundImage: profileImage ? `url(${profileImage})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: profileImage ? "transparent" : "#f0f0f0", // Fallback background color
            }}
          >
            {!profileImage && (
              <FaUserCircle
                style={{
                  fontSize: "24px",
                  color: "#666", // Fallback icon color
                }}
              />
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;