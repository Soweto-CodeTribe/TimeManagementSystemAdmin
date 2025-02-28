import React, { useState } from 'react';
import axios from 'axios';

// Base URL for all API requests
const BASE_URL = 'https://timemanagementsystemserver.onrender.com';

const AddUserForm = () => {
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
    try {
      const response = await axios.post(`${BASE_URL}/api/trainee`, formData);
      alert('Trainee saved successfully!');
      console.log('Response:', response.data);
    } catch (error) {
      console.error('Error saving trainee:', error);
      alert('Failed to save trainee. Check the console for details.');
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post(`${BASE_URL}/api/trainees/upload-csv`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        alert('CSV file uploaded successfully!');
        console.log('Response:', response.data);
      } catch (error) {
        console.error('Error uploading CSV:', error);
        alert('Failed to upload CSV file. Check the console for details.');
      }
    }
  };

  return (
    <div
      style={{
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
      }}
    >
      {/* Upload CSV Button - Now positioned with flexbox instead of absolute */}
      <div
        style={{
          alignSelf: 'flex-end',
          marginBottom: '15px',
        }}
      >
        <label
          htmlFor="csv-upload"
          style={{
            padding: '10px 20px',
            fontSize: '14px',
            fontWeight: 'bold',
            color: '#fff',
            backgroundColor: '#90EE90',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'background-color 0.3s ease',
            display: 'inline-block',
          }}
          onMouseEnter={(e) => (e.target.style.backgroundColor = '#76c776')}
          onMouseLeave={(e) => (e.target.style.backgroundColor = '#90EE90')}
        >
          Upload CSV
        </label>
        <input
          id="csv-upload"
          type="file"
          accept=".csv"
          style={{ display: 'none' }}
          onChange={handleFileUpload}
        />
      </div>

      {/* Title */}
      <h1
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#333',
          marginBottom: '20px',
          width: '100%',
          textAlign: 'center',
        }}
      >
        Add a user
      </h1>

      {/* Form Fields Container */}
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
          {/* Left Column */}
          <div>
            {/* Name Field */}
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
              />
            </div>

            {/* Email Field */}
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
              />
            </div>

            {/* Phone Field */}
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
              />
            </div>

            {/* Role Field */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '5px' }}>
                Role *
              </label>
              <input
                type="text"
                name="role"
                placeholder="Enter role"
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
              />
            </div>
          </div>

          {/* Right Column */}
          <div>
            {/* Zip Code Field */}
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
              />
            </div>

            {/* Surname Field */}
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
              />
            </div>

            {/* Date of Birth Field */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#333', marginBottom: '5px' }}>
                Date of Birth *
              </label>
              <input
                type="text"
                name="dateOfBirth"
                placeholder="DD/MM/YYYY"
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
              />
            </div>

            {/* Location Field */}
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
              />
            </div>

            {/* Address Field */}
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
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          type="submit"
          style={{
            width: '100%',
            maxWidth: '400px',
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