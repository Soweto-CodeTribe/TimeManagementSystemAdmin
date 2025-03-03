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

    const endpoint = formData.role === 'Trainee' 
      ? '/api/trainee' 
      : '/api/facilitator';

    const token = localStorage.getItem("token"); // Get the stored token

    try {
      // First save the user to the backend
      const response = await axios.post(`${BASE_URL}${endpoint}`, formData, {
          headers: {
              Authorization: `Bearer ${token}` // Include the token in the request
          }
      });
      
      // If the save was successful
      if (response.data) {
        // Log the success
        console.log('Response:', response.data);
        
        // Alert the user about successful save
        alert('User saved successfully!');
        
        // Extract just the required data for UserManagement
        const userManagementData = {
          name: formData.name,
          surname: formData.surname,
          email: formData.email,
          role: formData.role,
          id: response.data.id || response.data._id
        };
        
        // Reset form after successful submission
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
        
        // Navigate to User Management with the new user data
        navigate('/user-management', { 
          state: { userData: userManagementData } 
        });
      }
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Failed to save user. Check the console for details.');
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
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '5px' }}>
                Name *
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter name"
                value={formData.name}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  outline: 'none',
                  height: '45px',
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '5px' }}>
                Email *
              </label>
              <input
                type="email"
                name="email"
                placeholder="Enter email"
                value={formData.email}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  outline: 'none',
                  height: '45px',
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '5px' }}>
                Phone *
              </label>
              <input
                type="tel"
                name="phone"
                placeholder="Enter phone number"
                value={formData.phone}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  outline: 'none',
                  height: '45px',
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '5px' }}>
                Role *
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  outline: 'none',
                  height: '45px',
                  boxSizing: 'border-box',
                }}
                required
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
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '5px' }}>
                Zip Code *
              </label>
              <input
                type="text"
                name="zipCode"
                placeholder="Enter zip code"
                value={formData.zipCode}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  outline: 'none',
                  height: '45px',
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '5px' }}>
                Surname *
              </label>
              <input
                type="text"
                name="surname"
                placeholder="Enter surname"
                value={formData.surname}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  outline: 'none',
                  height: '45px',
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '5px' }}>
                Date of Birth *
              </label>
              <input
                type="date"
                name="dateOfBirth"
                value={formData.dateOfBirth}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  outline: 'none',
                  height: '45px',
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '5px' }}>
                Location *
              </label>
              <input
                type="text"
                name="location"
                placeholder="Enter location"
                value={formData.location}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  outline: 'none',
                  height: '45px',
                  boxSizing: 'border-box',
                }}
                required
              />
            </div>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '5px' }}>
                Address *
              </label>
              <input
                type="text"
                name="address"
                placeholder="Enter address"
                value={formData.address}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px',
                  fontSize: '14px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  outline: 'none',
                  height: '45px',
                  boxSizing: 'border-box',
                }}
                required
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

