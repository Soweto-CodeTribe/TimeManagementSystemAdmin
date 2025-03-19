import React from "react";
import { FiSettings } from "react-icons/fi"; // Settings icon
import { useNavigate, Link } from "react-router-dom"; // To handle navigation
import { Avatar } from '@mui/material'; // Importing MUI Avatar component
import { Bell } from "lucide-react"; // For notification bell icon
import { useSelector } from "react-redux"; // To access unread count
import "./styling/Navbar.css";
import imgAvater from '../assets/hacker.png'; // Avatar image

const Navbar = ({ activeScreen }) => {
  const navigate = useNavigate();
  // Get unread count from redux store
  const { unreadCount } = useSelector((state) => state.notifications);

  // Handle profile click
  const handleProfileClick = () => {
    navigate("/AdminProfile"); // Navigate to the profile page
  };

  // Handle settings click
  const handleSettingsClick = () => {
    navigate("/settings"); // Navigate to the settings page
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
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </Link>
          
          {/* Avatar for Profile */}
          <Avatar
            alt="Profile Avatar"
            src={imgAvater} // Using the image for the avatar
            sx={{
              width: 24,  // Set size to 24px
              height: 24, // Set size to 24px
              cursor: 'pointer',
            }}
            onClick={handleProfileClick} // Profile icon click
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;