import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FaTachometerAlt,
  FaUsers,
  FaClock,
  FaChartBar,
  FaCogs,
  FaSignOutAlt,
  FaBars,
  FaTimes,
  FaComment 
} from 'react-icons/fa';
import Modal from 'react-modal';
import { useDispatch } from 'react-redux';
import { logout } from '../Slices/authSlice'; // Adjust the import path as needed
import Logo from '../assets/CodeTribeImage.png';
import Navbar from './Navbar';
import "./styling/Sidebar.css";
import { VscFeedback } from "react-icons/vsc";

// Set app element for accessibility
Modal.setAppElement('#root');

// Sidebar component
const Sidebar = ({ activeScreen }) => {
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  
  const openLogoutModal = () => setIsLogoutModalOpen(true);
  const closeLogoutModal = () => setIsLogoutModalOpen(false);
  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]); // Updated to only depend on pathname

  // Handle logout
  const handleLogout = () => {
    dispatch(logout()); // Dispatch logout to clear state
    navigate("/login"); // Redirect to login page
  };
  
  const navigateTo = (route) => {
    navigate(route);
  };

  const getClassNames = (route) => {
    return location.pathname === route ? 'active' : '';
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: <FaTachometerAlt style={{ fontSize: '20px', color: "gray"}} />, route: '/' },
    { name: 'User Management', icon: <FaUsers style={{ fontSize: '20px' }} />, route: '/user-management' },
    { name: 'Session Monitoring', icon: <FaClock style={{ fontSize: '20px' }} />, route: '/session' },
    { name: 'Reports', icon: <FaChartBar style={{ fontSize: '20px' }} />, route: '/reports' },
    {name:'Tickets', icon: <FaComment style={{ fontSize: '20px' }} />, route: '/tickets'},
    {name:'Feedback', icon: <VscFeedback style={{ fontSize: '20px' }} />, route: '/feedback'},
    {name : 'Other', icon:null, route:null},
    { name: 'Settings', icon: <FaCogs style={{ fontSize: '20px' }} />, route: '/settings' },
  ];
  
  return (
    <div className="sidebar-container">
      {/* Mobile Menu Toggle Button */}
      <div className="mobile-toggle" onClick={toggleMobileMenu}>
        {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
      </div>

      {/* Navbar Section */}
      <nav className="navbar">
        <Navbar />
      </nav>

      {/* Sidebar Section */}
      <div className={`sidebar ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
        {/* Logo at the top */}
        <div className="logo-container">
          <img src={Logo || "/placeholder.svg"} alt="CodeTribe Logo" className="logo" />
        </div>

        <ul>
        
          <ul>
          <li className="general-header">General</li>
            {sidebarItems.map((item) => (
              <li
                key={item.name}
                onClick={item.route ? () => navigateTo(item.route) : null} // Only clickable if route exists
                className={item.route ? getClassNames(item.route) : 'other-item'} // Apply other-item class if no route
              >
                {item.icon ? item.icon : null} {item.name}
              </li>
            ))}
          </ul>
          <button className="logout-btn" onClick={openLogoutModal}>
            <FaSignOutAlt className="icon" /> Logout
          </button>
        </ul>

        {/* Logout Modal */}
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
