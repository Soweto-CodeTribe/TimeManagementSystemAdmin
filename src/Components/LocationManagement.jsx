import { useState, useEffect } from 'react';
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
    <div className="location-management">
      <button className="back" onClick={() => navigate('/settings')}>
       <ChevronLeft /> <span style={{ fontSize: ".5em"}}>Back To Settings</span>
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
          </div>
          <button
            type="button"
            onClick={getCurrentLocation}
            className="location-btn"
            disabled={isGettingLocation}
          >
            {isGettingLocation ? 'Getting Location...' : 'Use Current Location'}
          </button>
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
                    {Number(location.latitude).toFixed(6)}, {Number(location.longitude).toFixed(6)}
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