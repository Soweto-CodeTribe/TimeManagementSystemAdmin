import React, { useState, useEffect } from "react";
import { Search, Filter, Download, Upload, Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import './styling/UserManagement.css';
import jsPDF from "jspdf"; 
import Papa from 'papaparse';
import Modal from './Modal';
import axios from 'axios';

const UserManagement = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [users, setUsers] = useState([]);
    const [guests, setGuests] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [feedbackMessage, setFeedbackMessage] = useState("");

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem("authToken");
            console.log("Authorization Token:", token);

            if (!token) {
                setFeedbackMessage("No authorization token found. Please log in again.");
                return;
            }

            try {
                const headers = { Authorization: `Bearer ${token}` };
                const traineesResponse = await axios.get("https://timemanagementsystemserver.onrender.com/api/trainees", { headers });
                const facilitatorsResponse = await axios.get("https://timemanagementsystemserver.onrender.com/api/facilitators", { headers });
                const stakeholdersResponse = await axios.get("https://timemanagementsystemserver.onrender.com/api/stakeholder/all", { headers });

                const allUsers = [
                    ...stakeholdersResponse.data.map(user => ({ 
                        id: user._id || `stakeholder-${Date.now()}-${Math.random()}`,
                        fullName: user.fullName || user.name, 
                        email: user.email, 
                        role: "stakeholder" 
                    })),
                    ...traineesResponse.data.map(user => ({ 
                        id: user._id || `trainee-${Date.now()}-${Math.random()}`,
                        fullName: user.fullName || user.name, 
                        email: user.email, 
                        role: "Trainee" 
                    })),
                    ...facilitatorsResponse.data.map(user => ({ 
                        id: user._id || `facilitator-${Date.now()}-${Math.random()}`,
                        fullName: user.fullName || user.name, 
                        email: user.email, 
                        role: "Facilitator" 
                    }))
                ];
                setUsers(allUsers);
                setFeedbackMessage("Data fetched successfully.");
            } catch (error) {
                console.error("Error fetching data from the server", error);
                setFeedbackMessage("Error fetching data. Please try again later.");
                
                const sampleUsers = [
                    { id: "sample-1", fullName: "Sample Trainee", email: "trainee@example.com", role: "Trainee" },
                    { id: "sample-2", fullName: "Sample Facilitator", email: "facilitator@example.com", role: "Facilitator" },
                    { id: "sample-3", fullName: "Sample Stakeholder", email: "stakeholder@example.com", role: "stakeholder" }
                ];
                setUsers(sampleUsers);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        if (location.state && location.state.userData) {
            const newUser = location.state.userData;
            const userExists = users.some(user => user.email === newUser.email);
            if (!userExists) {
                const updatedUsers = [...users, { ...newUser, id: `new-${Date.now()}` }];
                setUsers(updatedUsers);
                localStorage.setItem('users', JSON.stringify(updatedUsers));
            } else {
                alert("User Successfully Added.");
            }
        }
    }, [location.state, users]);

    const exportPDF = () => {
        const doc = new jsPDF();
        doc.text("User Management", 10, 10);
        doc.text("Full Name, Email, Role", 10, 20);
        users.forEach((user, index) => {
            doc.text(`${user.fullName}, ${user.email}, ${user.role}`, 10, 30 + index * 10);
        });
        doc.save("UserManagement.pdf");
    };

    const exportCSV = () => {
        const csvContent = users.map(user => `${user.fullName},${user.email},${user.role}`).join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', 'users.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Parse CSV file correctly
        Papa.parse(file, {
            header: true, // This tells PapaParse to use the first row as headers
            skipEmptyLines: true,
            complete: async (results) => {
                try {
                    // results.data is already an array of objects with the header as keys
                    const csvData = results.data;

                    // Add unique IDs to each item
                    const csvDataWithIds = csvData.map((item, index) => ({
                        ...item,
                        id: `csv-${Date.now()}-${index}`
                    }));

                    console.log("Parsed CSV data:", csvDataWithIds);
                    
                    // Format the data as trainees (without lastCheckIn)
                    const formattedTrainees = csvDataWithIds.map(trainee => ({
                        id: trainee.id,
                        fullName: trainee.fullName || "Unknown",
                        surname: trainee.surname || "",
                        email: trainee.email || "",
                        phoneNumber: trainee.phoneNumber || "",
                        idNumber: trainee.idNumber || "",
                        street: trainee.street || "",
                        city: trainee.city || "",
                        postalCode: trainee.postalCode || "",
                        location: trainee.location || "",
                        role: "Trainee"
                    }));
                    
                    // Add to users for the trainees table
                    setUsers(prevUsers => [...prevUsers, ...formattedTrainees]);
                    setFeedbackMessage("CSV processed locally successfully!");
                } catch (error) {
                    console.error("Error processing CSV file:", error);
                    setFeedbackMessage(`Error: ${error.message}. Please check your CSV format.`);
                }
            },
            error: (error) => {
                console.error("CSV parsing error:", error);
                setFeedbackMessage(`CSV parsing error: ${error.message}`);
            }
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
        (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const filteredGuests = guests.filter(guest =>
        (guest.name && guest.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (guest.fullName && guest.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (guest.email && guest.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (guest.phone && guest.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (guest.phoneNumber && guest.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Function to export trainees CSV from server
    const exportTraineesCSV = async () => {
        const token = localStorage.getItem("authToken");
        if (!token) {
            setFeedbackMessage("No authorization token found. Please log in again.");
            return;
        }
        
        const headers = { Authorization: `Bearer ${token}` };

        try {
            const response = await axios.get("https://timemanagementsystemserver.onrender.com/api/trainees", {
                headers,
                responseType: 'blob'
            });
            
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'trainees.csv');
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            setFeedbackMessage("Trainees CSV exported successfully.");
        } catch (error) {
            console.error("Error exporting trainees CSV:", error);
            setFeedbackMessage("Failed to export trainees CSV. Please try again.");
        }
    };

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
                    <p className="subtitle">Manage your trainees, facilitators, and guests here</p>
                    {feedbackMessage && <p className="feedback-message">{feedbackMessage}</p>}
                </div>
                <button className="add-user-btn" onClick={() => navigate('/add-user')}>
                    <Plus size={16} />
                    <span>Add user</span>
                </button>
            </div>

            <div className="table-section">
                <div className="table-header">
                    <h2>
                        Trainees and Facilitators <span className="count">{filteredUsers.length}</span>
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
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Role</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredUsers.map((user) => (
                                <tr key={user.id || user.email || `user-${Math.random()}`}>
                                    <td>{user.fullName}</td>
                                    <td>{user.email}</td>
                                    <td>{user.role}</td>
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
                        <button className="export-btn" onClick={exportTraineesCSV}>
                            <Download size={14} />
                            <span>Export Trainees CSV</span>
                        </button>
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
                                <tr key={guest.id || guest.email || `guest-${Math.random()}`}>
                                    <td>{guest.name || guest.fullName || 'N/A'}</td>
                                    <td>{guest.email || 'N/A'}</td>
                                    <td>{guest.phone || guest.phoneNumber || 'N/A'}</td>
                                    <td>
                                        {guest.status === "active" && <span className="status-badge active">Active</span>}
                                        {!guest.status && guest.lastCheckIn && <span>{guest.lastCheckIn}</span>}
                                        {!guest.status && !guest.lastCheckIn && <span>N/A</span>}
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