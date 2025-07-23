import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import './styling/LocationManagement.css';
import { ArrowLeft, ChevronLeft } from 'lucide-react';

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
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });
  const formRef = useRef(null);

  // Fetch all locations when component mounts
  useEffect(() => {
    fetchLocations();
  }, []);

  useEffect(() => {
    if (editingId && formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [editingId]);

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

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setMessage({ text: 'Geolocation is not supported by your browser', type: 'error' });
      return;
    }

    setIsGettingLocation(true);
    setMessage({ text: 'Fetching your current location...', type: 'info' });

    navigator.geolocation.getCurrentPosition(
      (position) => {
        // Convert strings to numbers
        const latitude = Number(position.coords.latitude);
        const longitude = Number(position.coords.longitude);
        
        setFormData({
          ...formData,
          latitude: latitude,
          longitude: longitude
        });
        setIsGettingLocation(false);
        setMessage({ text: 'Location successfully retrieved!', type: 'success' });
      },
      (error) => {
        setIsGettingLocation(false);
        let errorMessage = 'Unknown error occurred';
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'User denied the request for geolocation';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information is unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'The request to get user location timed out';
            break;
        }
        setMessage({ text: errorMessage, type: 'error' });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // For latitude and longitude, convert string values to numbers
    if (name === 'latitude' || name === 'longitude' || name === 'radius') {
      setFormData({
        ...formData,
        [name]: value === '' ? '' : Number(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : value
      });
    }
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
      // Ensure latitude, longitude and radius are numbers before submitting
      const dataToSubmit = {
        ...formData,
        latitude: Number(formData.latitude),
        longitude: Number(formData.longitude),
        radius: Number(formData.radius)
      };

      const method = editingId ? 'PUT' : 'POST';
      const url = editingId
        ? `https://timemanagementsystemserver.onrender.com/api/locations/${editingId}`
        : 'https://timemanagementsystemserver.onrender.com/api/locations';
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSubmit)
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
      // Ensure these are stored as numbers
      latitude: Number(location.latitude),
      longitude: Number(location.longitude),
      radius: Number(location.radius),
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
    <div className="location-management-root">
      <div className="location-management-card">
        <button className="back desktop-back" onClick={() => navigate('/settings')}>
          <ChevronLeft /> <span style={{ fontSize: ".95em", marginLeft: 6 }}>Back To Settings</span>
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
          <form ref={formRef} onSubmit={handleSubmit} className="location-form">
            <div className="form-row">
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
                  placeholder="Enter latitude (e.g. 51.509865)"
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
                  placeholder="Enter longitude (e.g. -0.118092)"
                />
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
                  step="any"
                  placeholder="Enter radius"
                />
              </div>
              <div className="form-group checkbox-group">
                <label htmlFor="active">
                  <input
                    type="checkbox"
                    id="active"
                    name="active"
                    checked={formData.active}
                    onChange={handleInputChange}
                  />
                  Active
                </label>
              </div>
            </div>
            <div className="form-buttons">
              <button type="submit" className="submit-btn green-btn">
                {editingId ? 'Update' : 'Add'}
              </button>
              <button type="button" className="cancel-btn" onClick={resetForm}>
                Cancel
              </button>
              <button type="button" className="location-btn green-btn" onClick={getCurrentLocation} disabled={isGettingLocation}>
                {isGettingLocation ? 'Getting...' : 'Get Location'}
              </button>
            </div>
          </form>
        </div>
        <div className="locations-list">
          <h2 style={{marginBottom: '1rem'}}>Locations</h2>
          {isLoading ? (
            <div className="loading">Loading...</div>
          ) : locations.length === 0 ? (
            <div className="no-locations">No locations found.</div>
          ) : (
            <table className="locations-table desktop-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                  <th>Radius</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {locations.map((location) => (
                  <tr key={location.id || location._id} className={location.active === false ? 'inactive' : ''}>
                    <td>{location.name}</td>
                    <td>{location.latitude}</td>
                    <td>{location.longitude}</td>
                    <td>{location.radius}</td>
                    <td>
                      <span className={`status-badge ${location.active !== false ? 'active' : 'inactive'}`}>{location.active !== false ? 'Active' : 'Inactive'}</span>
                    </td>
                    <td className="action-buttons">
                      <button className="edit-btn green-btn" onClick={() => handleEdit(location)}>
                        Edit
                      </button>
                      <button className="delete-btn" onClick={() => handleDelete(location.id || location._id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default LocationManagement;