import React from 'react';
import { CgProfile } from "react-icons/cg";
import './styling/Navbar.css';
import Logo from '../assets/CodeTribeImage.png';

const Navbar = () => {
  return (
    <nav className="navbar">
      {/* Logo */}
      <div className="logo-container">
        <img src={Logo} alt="CodeTribe Logo" className="logo" />
      </div>

      {/* Profile Icon */}
      <div className="profile-icon">
        <CgProfile size={36}
        style={{
            color:"#8cc151"
        }}
        />
      </div>
    </nav>
  );
};

export default Navbar;
