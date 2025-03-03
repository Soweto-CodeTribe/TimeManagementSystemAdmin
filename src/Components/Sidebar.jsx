import { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Import useNavigate
import {
  FaTachometerAlt,
  FaUsers,
  FaClock,
  FaChartBar,
  FaCogs,
  // FaBell,
  // FaClipboardList,
  FaSignOutAlt,
  // FaUserPlus, 
} from 'react-icons/fa';
import Modal from 'react-modal';
import "../Components/styling/Sidebar.css";
import Logo from '../assets/CodeTribeImage.png';
import navbar from './Navbar';

// Set app element for accessibility
Modal.setAppElement('#root');

const Sidebar = () => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const navigate = useNavigate(); // <-- Initialize navigate

  const openLogoutModal = () => setIsLogoutModalOpen(true);
  const closeLogoutModal = () => setIsLogoutModalOpen(false);
  const handleLogout = () => {
    console.log("User logged out"); // Replace with actual logout logic
    closeLogoutModal();
  };

  // Define a function to navigate to the respective route
  const navigateTo = (screen) => {
    switch (screen) {
      case 'Dashboard':
        navigate('/');
        break;
      case 'UserManagement':
        navigate('/user-management');
        break;
      case 'Session':
        navigate('/session');
        break;
      case 'Reports':
        navigate('/reports');
        break;
      case 'SystemSettings':
        navigate('/settings');
        break;
      case 'Alerts':
        navigate('/alerts');
        break;
      case 'AuditLogs':
        navigate('/audit-logs');
        break;
      case 'AddUserForm': // <-- Add case for AddUserForm
        navigate('/add-user');
        break;
      default:
        break;
    }
  };

  return (
    <div className="sidebar">
      {/* Logo Section */}
      <div className="logo-container">
        <img src={Logo} alt="CodeTribe Logo" className="logo" />
      </div>

      {/* Sidebar Menu */}
      <ul>
        <li onClick={() => navigateTo('Dashboard')}>
          <FaTachometerAlt className="icon" /> Dashboard
        </li>
        <li onClick={() => navigateTo('UserManagement')}>
          <FaUsers className="icon" /> User Management
        </li>
        <li onClick={() => navigateTo('Session')}>
          <FaClock className="icon" /> Session Monitoring
        </li>
        <li onClick={() => navigateTo('Reports')}>
          <FaChartBar className="icon" /> Reports
        </li>
        <li onClick={() => navigateTo('SystemSettings')}>
          <FaCogs className="icon" /> System Settings
        </li>
      </ul>

      {/* Logout Button */}
      <button className="logout-btn" onClick={openLogoutModal}>
        <FaSignOutAlt className="icon" /> Logout
      </button>

      {/* Logout Confirmation Modal */}
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
  );
};

export default Sidebar;