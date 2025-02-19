import React, { useState } from 'react';
import './App.css';
import Navbar from './Components/Navbar';
import Sidebar from './Components/Sidebar';
import Dashboard from './Components/Dashboard';
import UserManagement from './Components/UserManagement';
import Session from './Components/Session';
import Reports from './Components/Reports';
import SystemSettings from './Components/SystemSettings';
import Alerts from './Components/Alerts';
import AuditLogs from './Components/AuditLogs';
import Logout from './Components/Logout';

function App() {
  const [activeScreen, setActiveScreen] = useState('Dashboard');

  const renderScreen = () => {
    switch (activeScreen) {
      case 'Dashboard':
        return <Dashboard />;
      case 'UserManagement':
        return <UserManagement />;
      case 'Session':
        return <Session />;
      case 'Reports':
        return <Reports />;
      case 'SystemSettings':
        return <SystemSettings />;
      case 'Alerts':
        return <Alerts />;
      case 'AuditLogs':
        return <AuditLogs />;
      case 'Logout':
        return <Logout />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="app-container">
      <Navbar />
      <Sidebar setActiveScreen={setActiveScreen} />
      <div className="content">
        {renderScreen()}
      </div>
    </div>
  );
}

export default App;
