import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaUsers,
  FaClock,
  FaChartBar,
  FaCogs,
  FaSignOutAlt,
} from 'react-icons/fa';
import { CgProfile } from "react-icons/cg";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FiSettings } from "react-icons/fi";
import Modal from 'react-modal';
import "../Components/styling/Sidebar.css";
import Logo from '../assets/CodeTribeImage.png';

// Set app element for accessibility
Modal.setAppElement('#root');

const Sidebar = ({ activeScreen }) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const openLogoutModal = () => setIsLogoutModalOpen(true);
  const closeLogoutModal = () => setIsLogoutModalOpen(false);
  const handleLogout = () => {
    console.log("User logged out"); // Replace with actual logout logic
    closeLogoutModal();
  };

  const navigateTo = (route) => {
    navigate(route);
  };

  const getClassNames = (route) => {
    return location.pathname === route ? 'active' : '';
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleSettingsClick = () => {
    navigate("/settings");
  };

  const handleNotificationsClick = () => {
    alert("You have new notifications!");
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: <FaTachometerAlt />, route: '/' },
    { name: 'User Management', icon: <FaUsers />, route: '/user-management' },
    { name: 'Session Monitoring', icon: <FaClock />, route: '/session' },
    { name: 'Reports', icon: <FaChartBar />, route: '/reports' },
    { name: 'System Settings', icon: <FaCogs />, route: '/settings' },
  ];

  return (
    <div className="sidebar-container">
      {/* Navbar Section */}
      <nav className="navbar">
        <div className="navbar-content">
          <div className="screen-container">
            <span className="screen-name">{activeScreen}</span>
          </div>
          <div className="icon-container">
            <IoMdNotificationsOutline
              size={28}
              className="icon"
              onClick={handleNotificationsClick}
            />
            <FiSettings
              size={38}
              className="icon"
              onClick={handleSettingsClick}
            />
            <CgProfile
              size={18}
              className="profile-icon"
              onClick={handleProfileClick}
            />
          </div>
        </div>
      </nav>

      {/* Sidebar Section */}
      <div className="sidebar">
        <div className="logo-container">
          <img src={Logo} alt="CodeTribe Logo" className="logo" />
        </div>

        <ul>
          {sidebarItems.map((item) => (
            <li
              key={item.name}
              onClick={() => navigateTo(item.route)}
              className={getClassNames(item.route)}
            >
              {item.icon} {item.name}
            </li>
          ))}
        </ul>

        <button className="logout-btn" onClick={openLogoutModal}>
          <FaSignOutAlt className="icon" /> Logout
        </button>

        <Modal
          isOpen={isLogoutModalOpen}
          onRequestClose={closeLogoutModal}
          contentLabel="Logout Confirmation"
          className="modal"
          overlayClassName="modal-overlay"
        >
          <h2>Are you sure you want to log out?</h2>
          <div className="modal-actions">
            <button onClick={handleLogout} className="confirm-btn">Yes</button>
            <button onClick={closeLogoutModal} className="cancel-btn">No</button>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Sidebar;
