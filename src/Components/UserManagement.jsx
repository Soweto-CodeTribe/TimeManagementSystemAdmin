import React, { useState, useEffect } from "react";
import { Search, Filter, Download, Upload, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import './styling/UserManagement.css';
import jsPDF from "jspdf"; 
import Papa from 'papaparse';
import Modal from './Modal'; // Import Modal

const UserManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Initial Users from localStorage or fallback to an empty array
  const getInitialUsers = () => {
    const storedUsers = localStorage.getItem('users');
    return storedUsers ? JSON.parse(storedUsers) : [];
  };

  const [users, setUsers] = useState(getInitialUsers());
  const [guests, setGuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Load new user data from location state if available
  useEffect(() => {
    if (location.state && location.state.userData) {
      const newUser = location.state.userData;

      // Check for duplicate user based on email
      const userExists = users.some(user => user.email === newUser.email);

      if (!userExists) {
        const updatedUsers = [...users, { ...newUser, id: Date.now() }]; // Ensure to add unique ID
        setUsers(updatedUsers);
        localStorage.setItem('users', JSON.stringify(updatedUsers)); // Save to localStorage
      } else {
        console.warn("User already exists");
      }
    }
  }, [location.state, users]);

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text("User Management", 10, 10);
    doc.text("Name, Email, Role, Last Check-In", 10, 20);
    users.forEach((user, index) => {
      doc.text(`${user.name}, ${user.email}, ${user.role}, ${user.lastCheckIn}`, 10, 30 + index * 10);
    });
    doc.save("UserManagement.pdf");
  };

  const exportCSV = () => {
    const csvContent = users.map(user => `${user.name},${user.email},${user.role},${user.lastCheckIn}`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'users.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    Papa.parse(file, {
      complete: (results) => {
        results.data.forEach((row, index) => {
          const { name, email, phone, status, lastCheckIn } = row;

          // Check for duplicates before adding guests
          const guestExists = guests.some(guest => guest.email === email);

          if (!guestExists) { // Only add if not exists
            const newGuest = { id: guests.length + index + 1, name, email, phone, status, lastCheckIn };
            setGuests((prevGuests) => [...prevGuests, newGuest]);
          } else {
            console.warn("Guest already exists");
          }
        });
      },
      header: true, 
      skipEmptyLines: true,
    });
  };

  const handleTakeAction = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleDeleteUser = () => {
    if (selectedUser) {
      const updatedUsers = users.filter(user => user.id !== selectedUser.id); // Correct filtering
      setUsers(updatedUsers);
      setModalOpen(false);
      localStorage.setItem('users', JSON.stringify(updatedUsers)); // Update localStorage
      setSelectedUser(null); // Clear the selected user
    }
  };

  // Filter users based on search term
  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter guests based on search term
  const filteredGuests = guests.filter(guest =>
    guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.phone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="user-management-container">
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onView={() => console.log("View user", selectedUser)}
        onExportCSV={exportCSV}
        onExportPDF={() => exportPDF(selectedUser)}
        onDelete={handleDeleteUser} // Making sure the delete function is passed correctly
        user={selectedUser} // Pass the selected user if you need to show in the modal
      />

      <div className="header">
        <div className="title-section">
          <h1>User Management</h1>
          <p className="subtitle">Manage your trainees and guests and control permissions here</p>
        </div>
        <button className="add-user-btn" onClick={() => navigate('/add-user')}>
          <Plus size={16} />
          <span>Add user</span>
        </button>
      </div>

      <div className="table-section">
        <div className="table-header">
          <h2>
            Trainees <span className="count">{filteredUsers.length}</span>
          </h2>
        </div>
        <div className="table-controls">
          <div className="left-controls">
            <button className="filter-btn">
              <Filter size={14} />
              <span>Filter</span>
            </button>
            <div className="search-container">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <div className="right-controls">
            <button className="export-btn" onClick={exportPDF}>
              <Download size={14} />
              <span>Export PDF</span>
            </button>
            <input type="file" accept=".csv" onChange={handleFileChange} style={{ display: "none" }} id="csvInput" />
            <label htmlFor="csvInput" className="import-btn">
              <Upload size={14} />
              <span>Import CSV</span>
            </label>
          </div>
        </div>
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Last Check-in</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.lastCheckIn}</td>
                  <td>
                    <button className="action-btn" onClick={() => handleTakeAction(user)}>
                      <span>Take action</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Second Table Section for Guests */}
      {/* The guest section and logic can remain similar to the user section */}
      <div className="table-section">
        <div className="table-header">
          <h2>
            Guests <span className="count">{filteredGuests.length}</span>
          </h2>
        </div>
        <div className="table-controls">
          <div className="left-controls">
            <button className="filter-btn">
              <Filter size={14} />
              <span>Filter</span>
            </button>
            <div className="search-container">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm} // Use the same searchTerm state for guest filtering
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <div className="right-controls">
            <button className="export-btn" onClick={exportPDF}>
              <Download size={14} />
              <span>Export PDF</span>
            </button>
            <input type="file" accept=".csv" onChange={handleFileChange} style={{ display: "none" }} id="csvInput2" />
            <label htmlFor="csvInput2" className="import-btn">
              <Upload size={14} />
              <span>Import CSV</span>
            </label>
          </div>
        </div>
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((guest) => (
                <tr key={guest.id}>
                  <td>{guest.name}</td>
                  <td>{guest.email}</td>
                  <td>{guest.phone}</td>
                  <td>
                    {guest.status === "active" && <span className="status-badge active">Active</span>}
                    {!guest.status && guest.lastCheckIn && <span>{guest.lastCheckIn}</span>}
                  </td>
                  <td>
                    <button className="action-btn">
                      <span>Manage</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;