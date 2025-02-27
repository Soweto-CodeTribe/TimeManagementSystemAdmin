import React from "react";
import { CgProfile } from "react-icons/cg";
import { IoMdNotificationsOutline } from "react-icons/io"; // Notification icon
import { FiSettings } from "react-icons/fi"; // Settings icon
import { useNavigate } from "react-router-dom"; // To handle navigation
import "./styling/Navbar.css";

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
    alert("You have new notifications!"); // Placeholder for notifications (can be expanded)
  };

  return (
    <nav className="navbar">
      <div className="navbar-content">
        {/* Left: Screen Name */}
        <div className="screen-container">
          <span className="screen-name">{activeScreen}</span>
        </div>

        {/* Right: Icons */}
        <div className="icon-container">
          <IoMdNotificationsOutline
            size={28}
            className="icon"
            onClick={handleNotificationsClick} // Notification icon click
          />
          <FiSettings
            size={38}
            className="icon"
            onClick={handleSettingsClick} // Settings icon click
          />
          <CgProfile
            size={18}
            className="profile-icon"
            onClick={handleProfileClick} // Profile icon click
          />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
