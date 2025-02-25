import { useState } from 'react';
import { FaTachometerAlt, FaUsers, FaClock, FaChartBar, FaCogs, FaBell, FaClipboardList, FaSignOutAlt } from 'react-icons/fa';
import Modal from 'react-modal';

// Set app element for accessibility
Modal.setAppElement('#root');

// eslint-disable-next-line react/prop-types
const Sidebar = ({ setActiveScreen }) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  const openLogoutModal = () => {
    setIsLogoutModalOpen(true);
  };

  const closeLogoutModal = () => {
    setIsLogoutModalOpen(false);
  };

  const handleLogout = () => {
    console.log("User logged out"); // Replace with actual logout logic
    closeLogoutModal();
  };

  return (
    <div className="sidebar">
      <ul>
        <li onClick={() => setActiveScreen('Dashboard')}>
          <FaTachometerAlt size={24} 
           style={{
            color:"#8cc151"
        }}
          /> Dashboard
        </li>
        <li onClick={() => setActiveScreen('UserManagement')}>
          <FaUsers size={24}
           style={{
            color:"#8cc151"
        }}
          /> User Management
        </li>
        <li onClick={() => setActiveScreen('Session')}>
          <FaClock size={24} 
           style={{
            color:"#8cc151"
        }}
          /> Session Monitoring
        </li>
        <li onClick={() => setActiveScreen('Reports')}>
          <FaChartBar size={24} 
           style={{
            color:"#8cc151"
        }}
          /> Reports
        </li>
        <li onClick={() => setActiveScreen('SystemSettings')}>
          <FaCogs size={24}
           style={{
            color:"#8cc151"
        }}
          /> System Settings
        </li>
        <li onClick={() => setActiveScreen('Alerts')}>
          <FaBell size={24} 
           style={{
            color:"#8cc151"
        }}
          /> Alerts
        </li>
        <li onClick={() => setActiveScreen('AuditLogs')}>
          <FaClipboardList size={24} 
           style={{
            color:"#8cc151"
        }}
          /> Audit Logs
        </li>
      </ul>
      <button className="logout-btn" onClick={openLogoutModal}>
        <FaSignOutAlt size={24} 
         style={{
            color:"#8cc151"
        }}
        /> Logout
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
