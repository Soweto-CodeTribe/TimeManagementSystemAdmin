import React, { useState, useEffect } from "react";
import { Search, Filter, Download, Upload, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import './styling/UserManagement.css';
import jsPDF from "jspdf"; 
import Papa from 'papaparse';
import Modal from './Modal';
import axios from 'axios'; // Import Axios

const UserManagement = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [users, setUsers] = useState([]); // Initialize with an empty array
    const [guests, setGuests] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [feedbackMessage, setFeedbackMessage] = useState(""); // State for feedback messages

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("authToken");
            console.log("Authorization Token:", token); // Log the token for debugging

            // Check if the token is present
            if (!token) {
                setFeedbackMessage("No authorization token found. Please log in again.");
                return; // Exit the function if no token is found
            }

            try {
                const headers = { Authorization: `Bearer ${token}` }; // Use the token in the headers
                const traineesResponse = await axios.get("https://timemanagementsystemserver.onrender.com/api/trainees", { headers });
                const facilitatorsResponse = await axios.get("https://timemanagementsystemserver.onrender.com/api/facilitators", { headers });
                const stakeholdersResponse = await axios.get("https://timemanagementsystemserver.onrender.com/api/stakeholder", { headers });
                
                // Combine fetched data with stakeholders, if needed
                const allUsers = [...traineesResponse.data, ...facilitatorsResponse.data, ...stakeholdersResponse.data];
                setUsers(allUsers);
            } catch (error) {
                console.error("Error fetching data from the server", error);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        // Local storage manipulation only if there is new data from location state
        if (location.state && location.state.userData) {
            const newUser = location.state.userData;
            const userExists = users.some(user => user.email === newUser.email);
            if (!userExists) {
                const updatedUsers = [...users, { ...newUser, id: Date.now(), lastCheckIn: null }];
                setUsers(updatedUsers);
                localStorage.setItem('users', JSON.stringify(updatedUsers));
            } else {
                alert("User with this email already exists.");
            }
        }
    }, [location.state, users]);

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("User Management", 10, 10);
        doc.text("fullName, Email, Role, Last Check-In", 10, 20);
        users.forEach((user, index) => {
            doc.text(`${user.name}, ${user.email}, ${user.role}, ${user.lastCheckIn || 'N/A'}`, 10, 30 + index * 10);
        });
        doc.save("UserManagement.pdf");
    };

    const exportCSV = () => {
        const csvContent = users.map(user => `${user.name},${user.email},${user.role},${user.lastCheckIn || 'N/A'}`).join('\n');
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
                    const { fullName, email, phone, status, lastCheckIn } = row;

                    const guestExists = guests.some(guest => guest.email === email);
                    if (!guestExists) {
                        const newGuest = { id: guests.length + index + 1, name: fullName, email, phone, status, lastCheckIn };
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
            const updatedUsers = users.filter(user => user.id !== selectedUser.id);
            setUsers(updatedUsers);
            setModalOpen(false);
            localStorage.setItem('users', JSON.stringify(updatedUsers));
            setSelectedUser(null);
        }
    };

    const filteredUsers = users.filter(user =>
        (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredGuests = guests.filter(guest =>
        (guest.name && guest.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (guest.email && guest.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (guest.phone && guest.phone.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="user-management-container">
            <Modal
                isOpen={modalOpen}
                onClose={() => setModalOpen(false)}
                onView={() => console.log("View user", selectedUser)}
                onExportCSV={exportCSV}
                onExportPDF={() => exportPDF(selectedUser)}
                onDelete={handleDeleteUser}
                user={selectedUser}
            />

            <div className="header">
                <div className="title-section">
                    <h1>User Management</h1>
                    <p className="subtitle">Manage your trainees and guests and control permissions here</p>
                    {feedbackMessage && <p className="feedback-message">{feedbackMessage}</p>} {/* Display feedback message */}
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
                                <th>fullName</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Last Check-in</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id}>
                                    <td>{user.fullName}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
                                    <td>{user.lastCheckIn || 'N/A'}</td>
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