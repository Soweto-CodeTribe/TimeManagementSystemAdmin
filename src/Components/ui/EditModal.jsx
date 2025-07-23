import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import '../styling/UserActionModal.css';
import CustomDropdown from './CustomDropdown';

const BASE_URL2 = 'https://timemanagementsystemserver.onrender.com'; // Use localhost for all endpoints

const EditModal = ({ isOpen, onClose, user, userType, onActionComplete, setFeedbackMessage }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Edit user states
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    surname: user?.surname || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    idNumber: user?.idNumber || '',
    role: user?.role || '',
    location: user?.location || '',
    street: user?.street || '',
    city: user?.city || '',
    postalCode: user?.postalCode || ''
  });

  const token = localStorage.getItem('authToken');

  // Reset form when user changes or modal opens
  useEffect(() => {
    setFormData({
      fullName: user?.fullName || '',
      surname: user?.surname || '',
      email: user?.email || '',
      phoneNumber: user?.phoneNumber || '',
      idNumber: user?.idNumber || '',
      role: user?.role || '',
      location: user?.location || '',
      street: user?.street || '',
      city: user?.city || '',
      postalCode: user?.postalCode || ''
    });
    
    setError('');
    setSuccess('');
  }, [user, isOpen]);

  // Comprehensive Error Handling
  const handleAxiosError = (error, defaultMessage) => {
    if (error.response) {
      const errorMsg = error.response.data.msg || 
                       error.response.data.message || 
                       defaultMessage;
      setFeedbackMessage(errorMsg, 'error');
    } else if (error.request) {
      setFeedbackMessage("No response received from server", 'error');
    } else {
      setFeedbackMessage(defaultMessage, 'error');
    }
  };

  // Edit user handler
  const handleEditUser = async (e) => {
    // console.log('handleEditUser called');
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    // Token validation
    const token = localStorage.getItem('authToken');
    if (!token) {
      console.error('No auth token found');
      setError('Authentication required');
      setLoading(false);
      return;
    }

    // Form validation
    if (!formData.fullName || !formData.email) {
      setError('Full name and email are required');
      setLoading(false);
      return;
    }

    try {
      let endpoint = '';
      let idToUse;
      // Determine endpoint and ID based on user type
      // console.log('User type received:', userType);
      switch (userType) {
        case 'Trainee':
          idToUse = user.id;
          endpoint = `${BASE_URL2}/api/trainees/${idToUse}`;
          break;
        case 'Online_Trainee':
          idToUse = user.id;
          endpoint = `${BASE_URL2}/api/online-trainees/${idToUse}`;
          break;
        case 'Facilitator':
          idToUse = user.id;
          endpoint = `${BASE_URL2}/api/facilitators/${idToUse}`;
          break;
        case 'Stakeholder':
          idToUse = user.firebaseId;
          endpoint = `${BASE_URL2}/api/stakeholder/${idToUse}`;
          break;
        case 'Guest':
          idToUse = user.id;
          endpoint = `${BASE_URL2}/api/guests/${idToUse}`;
          break;
        default:
          console.log('Unknown user type:', userType);
          setError('Unknown user type');
          setLoading(false);
          return;
      }

      // console.log('Endpoint:', endpoint);
      // console.log('Form data being sent:', formData);
      // console.log('User type:', userType);

      const response = await axios.put(
        endpoint,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      // console.log('API Response:', response.data);
      
      setSuccess(`${userType} updated successfully!`);
      if (setFeedbackMessage) setFeedbackMessage(`${userType} updated successfully!`);
      setTimeout(() => {
        setSuccess('');
        setLoading(false);
        if (onActionComplete) onActionComplete();
        onClose();
      }, 1000);
    } catch (err) {
      console.error('Update error:', err);
      console.error('Error response:', err.response?.data);
      setError(err.response?.data?.error || `Failed to update ${userType.toLowerCase()}`);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="action-modal-overlay" onClick={onClose}>
      <div className="action-modal-content wide" onClick={e => e.stopPropagation()}>
        <button className="action-modal-close" onClick={onClose} aria-label="Close modal">×</button>
        <h2 className="modal-title">Edit <span className="highlighted">{user?.fullName}</span></h2>
        
        <div className="action-modal-body">
          {error && <div className="modal-feedback error-message">{error}</div>}
          {success && <div className="modal-feedback success-message">{success}</div>}
          
          <form onSubmit={handleEditUser} className="edit-form">
            <div className="section-header">Edit {userType} Information</div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Surname</label>
                <input
                  type="text"
                  name="surname"
                  value={formData.surname}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>ID Number</label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <CustomDropdown
                  options={[
                    { value: '', label: 'Select Role', disabled: true },
                    { value: 'Trainee', label: 'Trainee' },
                    { value: 'Facilitator', label: 'Facilitator' },
                    { value: 'Stakeholder', label: 'Stakeholder' },
                    { value: 'SuperAdmin', label: 'Super Admin' },
                  ]}
                  value={formData.role}
                  onChange={val => handleChange({ target: { name: 'role', value: val } })}
                  placeholder="Select Role"
                />
              </div>
            </div>
            
            {(formData.role === 'Trainee' || formData.role === 'facilitator') && (
              <div className="form-row">
                <div className="form-group">
                  <label>Location</label>
                  <CustomDropdown
                    options={[
                      { value: '', label: 'Select Location', disabled: true },
                      ...["Soweto", "Ga-rankuwa", "KZN", "Limpopo", "Tembisa", "TIH", "Kimberly"].map(loc => ({ value: loc, label: loc }))
                    ]}
                    value={formData.location}
                    onChange={val => handleChange({ target: { name: 'location', value: val } })}
                    placeholder="Select Location"
                  />
                </div>
              </div>
            )}
            
            <div className="form-row">
              <div className="form-group">
                <label>Street</label>
                <input
                  type="text"
                  name="street"
                  value={formData.street}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label>Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>
            
            <div className="form-actions">
              <button type="submit" className="myBtns primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

EditModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  user: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    fullName: PropTypes.string,
    surname: PropTypes.string,
    email: PropTypes.string,
    phoneNumber: PropTypes.string,
    idNumber: PropTypes.string,
    role: PropTypes.string,
    location: PropTypes.string,
    street: PropTypes.string,
    city: PropTypes.string,
    postalCode: PropTypes.string,
  }),
  userType: PropTypes.string.isRequired,
  onActionComplete: PropTypes.func,
  setFeedbackMessage: PropTypes.func.isRequired,
};

export default EditModal; 