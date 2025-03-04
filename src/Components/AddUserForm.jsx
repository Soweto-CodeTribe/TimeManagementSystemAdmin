import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Base URL for all API requests
const BASE_URL = 'https://timemanagementsystemserver.onrender.com';

const AddUserForm = () => {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        role: '',
        zipCode: '',
        surname: '',
        dateOfBirth: '',
        location: '',
        address: '',
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Determine the endpoint based on the selected role
        const endpoint = formData.role === 'Trainee' 
            ? '/api/trainee' 
            : formData.role === 'Facilitator' 
            ? '/api/facilitator' 
            : '/api/stakeholder';

        const token = localStorage.getItem("token");

        try {
            // Send the POST request to the server
            const response = await axios.post(`${BASE_URL}${endpoint}`, formData, {
                headers: {
                    Authorization: `Bearer ${token}` // Sending the JWT token for authentication
                }
            });

            if (response.data) {
                console.log('Response:', response.data);
                alert('User saved successfully!');

                const userManagementData = {
                    name: formData.name,
                    surname: formData.surname,
                    email: formData.email,
                    role: formData.role,
                    id: response.data.id || response.data._id, // Ensure you're capturing the correct ID
                };

                // Clear the form
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    role: '',
                    zipCode: '',
                    surname: '',
                    dateOfBirth: '',
                    location: '',
                    address: '',
                });

                // Redirect to user management with user data
                navigate('/user-management', { 
                    state: { userData: userManagementData } 
                });
            }
        } catch (error) {
            if (error.response && error.response.status === 400) {
                alert('User already registered'); // Notify the user about existing user
            } else {
                console.error('Error saving user:', error);
                alert('Failed to save user. Check the console for details.');
            }
        }
    };

    return (
        <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            backgroundColor: '#f5f5f5',
            borderRadius: '8px',
            width: '100%',
            height: '100vh',
            boxSizing: 'border-box',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            overflow: 'hidden',
        }}>
            <h1 style={{
                fontSize: '24px',
                fontWeight: 'bold',
                color: '#333',
                marginBottom: '20px',
                width: '100%',
                textAlign: 'center',
            }}>
                Add a User
            </h1>

            <form
                onSubmit={handleSubmit}
                style={{
                    width: '100%',
                    maxWidth: '1200px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <div
                    style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '20px',
                        width: '100%',
                    }}
                >
                    <div>
                        {/* Input fields are created for each attribute as needed */}
                        <div style={{ marginBottom: '15px' }}>
                            <label htmlFor="name">Name *</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '12px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label htmlFor="email">Email *</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '12px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label htmlFor="phone">Phone *</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '12px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label htmlFor="role">Role *</label>
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '12px' }}
                            >
                                <option value="">Select a role</option>
                                <option value="Trainee">Trainee</option>
                                <option value="Facilitator">Facilitator</option>
                                <option value="Stakeholder">Stakeholder</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <div style={{ marginBottom: '15px' }}>
                            <label htmlFor="zipCode">Zip Code *</label>
                            <input
                                type="text"
                                name="zipCode"
                                value={formData.zipCode}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '12px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label htmlFor="surname">Surname *</label>
                            <input
                                type="text"
                                name="surname"
                                value={formData.surname}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '12px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label htmlFor="dateOfBirth">Date of Birth *</label>
                            <input
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '12px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '15px' }}>
                            <label htmlFor="location">Location *</label>
                            <input
                                type="text"
                                name="location"
                                value={formData.location}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '12px' }}
                            />
                        </div>
                        <div style={{ marginBottom: '20px' }}>
                            <label htmlFor="address">Address *</label>
                            <input
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                required
                                style={{ width: '100%', padding: '12px' }}
                            />
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    style={{
                        width: '200px',
                        padding: '14px',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#fff',
                        backgroundColor: '#4caf50',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        transition: 'background-color 0.3s ease',
                        marginTop: '20px',
                    }}
                    onMouseEnter={(e) => (e.target.style.backgroundColor = '#45a049')}
                    onMouseLeave={(e) => (e.target.style.backgroundColor = '#4caf50')}
                >
                    Save
                </button>
            </form>
        </div>
    );
};

export default AddUserForm;