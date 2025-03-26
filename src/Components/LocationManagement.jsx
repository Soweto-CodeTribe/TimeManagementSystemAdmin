import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './styling/LocationManagement.css';

const LocationManagement = () => {
  const navigate = useNavigate();
  const [locations, setLocations] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    latitude: '',
    longitude: '',
    radius: '',
    active: true
  });
  const [editingId, setEditingId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Fetch all locations when component mounts
  useEffect(() => {
    fetchLocations();
  }, []);

  const fetchLocations = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://timemanagementsystemserver.onrender.com/api/locations');
      if (!response.ok) throw new Error('Failed to fetch locations');
      const data = await response.json();
      setLocations(data);
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const resetForm = () => {
    setFormData({
      name: '',
      latitude: '',
      longitude: '',
      radius: '',
      active: true
    });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `https://timemanagementsystemserver.onrender.com/api/locations/${editingId}`
        : 'https://timemanagementsystemserver.onrender.com/api/locations';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Operation failed');
      }
      setMessage({
        text: `Location ${editingId ? 'updated' : 'added'} successfully`,
        type: 'success'
      });
      resetForm();
      fetchLocations();
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (location) => {
    setFormData({
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      radius: location.radius,
      active: location.active !== false
    });
    setEditingId(location.id);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this location?')) return;
    setIsLoading(true);
    try {
      const response = await fetch(`https://timemanagementsystemserver.onrender.com/api/locations/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete location');
      setMessage({ text: 'Location deleted successfully', type: 'success' });
      fetchLocations();
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="location-management">
      <button className="back-arrow" onClick={() => navigate('/settings')}>
        ← {/* This can be replaced by a back arrow icon */}
      </button>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
          <button
            onClick={() => setMessage({ text: '', type: '' })}
            className="close-btn"
          >
            ×
          </button>
        </div>
      )}
      <div className="location-form-container">
        <h2>{editingId ? 'Edit Location' : 'Add New Location'}</h2>
        <form onSubmit={handleSubmit} className="location-form">
          <div className="form-group">
            <label htmlFor="name">Location Name*</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter location name"
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="latitude">Latitude*</label>
              <input
                type="number"
                id="latitude"
                name="latitude"
                value={formData.latitude}
                onChange={handleInputChange}
                required
                step="any"
                placeholder="Manually enter latitude (e.g. 51.509865)"
              />
            </div>
            <div className="form-group">
              <label htmlFor="longitude">Longitude*</label>
              <input
                type="number"
                id="longitude"
                name="longitude"
                value={formData.longitude}
                onChange={handleInputChange}
                required
                step="any"
                placeholder="Manually enter longitude (e.g. -0.118092)"
              />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="radius">Radius (meters)*</label>
            <input
              type="number"
              id="radius"
              name="radius"
              value={formData.radius}
              onChange={handleInputChange}
              required
              min="1"
              placeholder="Enter radius in meters (e.g. 500)"
            />
          </div>
          <div className="form-group checkbox-group">
            <label>
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleInputChange}
              />
              Active
            </label>
          </div>
          <div className="form-buttons">
            <button
              type="submit"
              className="submit-btn"
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : editingId ? 'Update Location' : 'Add Location'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="cancel-btn"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
      <div className="locations-list">
        <h2>Allowed Locations</h2>
        {isLoading && <div className="loading">Loading locations...</div>}
        {locations.length === 0 && !isLoading ? (
          <p className="no-locations">No locations added yet.</p>
        ) : (
          <table className="locations-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Co-ordinates</th>
                <th>Radius</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {locations.map((location) => (
                <tr key={location.id} className={location.active ? '' : 'inactive'}>
                  <td>{location.name}</td>
                  <td>
                    {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                  </td>
                  <td>{location.radius}m</td>
                  <td>
                    <span className={`status-badge ${location.active ? 'active' : 'inactive'}`}>
                      {location.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEdit(location)}
                        className="edit-btn"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(location.id)}
                        className="delete-btn"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default LocationManagement;