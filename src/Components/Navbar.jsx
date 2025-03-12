import React from "react";
import { IoMdNotificationsOutline } from "react-icons/io"; // Notification icon
import { FiSettings } from "react-icons/fi"; // Settings icon
import { useNavigate } from "react-router-dom"; // To handle navigation
import { Avatar } from '@mui/material'; // Importing MUI Avatar component
import "./styling/Navbar.css";
import imgAvater from '../assets/hacker.png'; // Avatar image
import NotificationManager from "./NotificationManager";
import NotificationDisplay from "./NotificationDisplay";

const Navbar = ({ activeScreen }) => {
  const navigate = useNavigate();

  // Handle profile click
  const handleProfileClick = () => {
    navigate("/profile"); // Navigate to the profile page
  };

  // Handle settings click
  const handleSettingsClick = () => {
    navigate("/settings"); // Navigate to the settings page
  };

  // Handle notifications click
  const handleNotificationsClick = () => {
    navigate("/notifications"); // Navigate to the settings page
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
          <IoMdNotificationsOutline
            size={30}  // Set size to 30px to match the Avatar size
            className="icon"
            onClick={handleNotificationsClick} // Notification icon click
          /> 
          <NotificationManager />
          <NotificationDisplay />         
          {/* Avatar for Profile */}
          <Avatar
            alt="Profile Avatar"
            src={imgAvater} // Using the image for the avatar
            sx={{
              width: 24,  // Set size to 30px to match the icons
              height: 24, // Set size to 30px to match the icons
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
