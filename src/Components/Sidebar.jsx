/* eslint-disable react/prop-types */
/* eslint-disable no-unused-vars */
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
import { RxDashboard } from "react-icons/rx";
import { HiUsers } from "react-icons/hi2";
import { WiTime4 } from "react-icons/wi";
import { MdEvent } from "react-icons/md";
import { CgFileDocument } from "react-icons/cg";
import { LuTicketSlash } from "react-icons/lu";
import { IoSettingsOutline } from "react-icons/io5";
import { AiOutlineLogout } from "react-icons/ai";
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
  const [activeItem, setActiveItem] = useState("");

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
  const handleItemClick = (item) => {
    setActiveItem(item);
  };
  const getClassNames = (route) => {
    return location.pathname === route ? 'active' : '';
  };

  const sidebarItems = [
    { name: 'Dashboard', icon: <RxDashboard style={{ fontSize: '20px', color: "gray"}} />, route: '/dashboard' },
    { name: 'User Management', icon: <HiUsers style={{ fontSize: '20px' }} />, route: '/user-management' },
    { name: 'Session Monitoring', icon: <WiTime4 style={{ fontSize: '20px' }} />, route: '/session' },
    {name:'Event Management', icon: <MdEvent style={{ fontSize: '20px' }} />, route:'/EventManagement'},
    { name: 'Reports', icon: <CgFileDocument style={{ fontSize: '20px' }} />, route: '/reports' },
    {name:'Tickets', icon: <LuTicketSlash style={{ fontSize: '20px' }} />, route: '/tickets'},
    {name:'Feedback', icon: <VscFeedback style={{ fontSize: '20px' }} />, route: '/feedback'},
    {name : 'Other', icon:null, route:null},
    { name: 'Settings', icon: <IoSettingsOutline style={{ fontSize: '20px' }} />, route: '/settings' },
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
            <AiOutlineLogout className="icon" /> Sign out
          </button>
        </ul>

        {/* Logout Modal */}
        <Modal
          isOpen={isLogoutModalOpen}
          onRequestClose={closeLogoutModal}
          contentLabel="Logout Confirmation"
          className="logout-modal sleek-modal"
          overlayClassName="modal-overlay"
        >
          <div className="logout-modal-content">
            <div className="logout-modal-icon">
              <AiOutlineLogout size={48} style={{ color: '#000' }} />
            </div>
            <h2 className="logout-modal-title">Sign Out</h2>
            <p className="logout-modal-message">Are you sure you want to sign out?</p>
            <div className="modal-actions">
              <button onClick={handleLogout} className="confirm-btn sleek-btn">Yes, Sign Out</button>
              <button onClick={closeLogoutModal} className="cancel-btn sleek-btn">Cancel</button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default Sidebar;