import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import '../styling/UserActionModal.css';
import CustomDropdown from './CustomDropdown';

const BASE_URL = 'https://timemanagementsystemserver.onrender.com';
const SESSION_API_BASE = 'https://timemanagementsystemserver.onrender.com/api/session';
const TRAINEE_ACTIONS_API = 'https://timemanagementsystemserver.onrender.com/api/trainee-actions';

const UserActionModal = ({ isOpen, onClose, trainee, onActionComplete, setFeedbackMessage, showManualCheckIn }) => {
  const [activeTab, setActiveTab] = useState('manual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Manual check-in states
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [lunchStartTime, setLunchStartTime] = useState('');
  const [lunchEndTime, setLunchEndTime] = useState('');

  // Trainee management states
  const [notification, setNotification] = useState({ 
    message: "",
    traineeId: null 
  });
  const [suspensionData, setSuspensionData] = useState({ 
    traineeId: null,
    days: 7, 
    reason: "" 
  });
  const [reinstatementData, setReinstatementData] = useState({
    traineeId: null,
    notes: ""
  });

  // Edit trainee states
  const [formData, setFormData] = useState({
    fullName: trainee?.fullName || '',
    surname: trainee?.surname || '',
    email: trainee?.email || '',
    phoneNumber: trainee?.phoneNumber || '',
    idNumber: trainee?.idNumber || '',
    role: trainee?.role || '',
    location: trainee?.location || '',
    street: trainee?.street || '',
    city: trainee?.city || '',
    postalCode: trainee?.postalCode || ''
  });

  const token = localStorage.getItem('authToken');
  // Use 'user' as the generic variable for the selected user
  const user = trainee;

  // Reset tab and form when trainee changes or modal opens
  useEffect(() => {
    // console.log('UserActionModal - trainee data received:', trainee);
    setActiveTab('manual');
    
    // Try to extract surname from fullName if surname is not available
    let surname = trainee?.surname || '';
    if (!surname && trainee?.fullName) {
      const nameParts = trainee.fullName.trim().split(' ');
      surname = nameParts.length > 1 ? nameParts.slice(-1)[0] : '';
      console.log('Extracted surname from fullName:', surname);
    }
    
    setFormData({
      fullName: trainee?.fullName || '',
      surname: surname,
      email: trainee?.email || '',
      phoneNumber: trainee?.phoneNumber || '',
      idNumber: trainee?.idNumber || '',
      role: trainee?.role || '',
      location: trainee?.location || '',
      street: trainee?.street || '',
      city: trainee?.city || '',
      postalCode: trainee?.postalCode || ''
    });
    // console.log('UserActionModal - formData set to:', {
    //   fullName: trainee?.fullName || '',
    //   surname: surname,
    // });
    
    // Reset trainee management states
    setNotification({ message: "", traineeId: trainee?.id || null });
    setSuspensionData({ traineeId: trainee?.id || null, days: 7, reason: "" });
    setReinstatementData({ traineeId: trainee?.id || null, notes: "" });
    
    setError('');
    setSuccess('');
    setCheckInTime('');
    setCheckOutTime('');
    setLunchStartTime('');
    setLunchEndTime('');
  }, [trainee, isOpen]);

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

  // Send Notification Operation
  const sendNotification = async () => {
    if (!notification.message?.trim()) {
      setFeedbackMessage("Notification message cannot be empty.", 'error');
      return;
    }
    
    if (!notification.traineeId) {
      setFeedbackMessage("No trainee selected. Please select a trainee first.", 'error');
      return;
    }
    
    setLoading(true);
    try {
      const response = await axios.post(
        `${TRAINEE_ACTIONS_API}/notify`,
        { 
          traineeId: notification.traineeId, 
          message: notification.message,
          subject: "Notification from Administrator"
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json" 
          } 
        }
      );
      
      setFeedbackMessage(response.data.msg || "Notification sent successfully!");
      setNotification({ message: "", traineeId: trainee?.id || null });
      if (onActionComplete) onActionComplete();
    } catch (error) {
      handleAxiosError(error, "Failed to send notification");
    } finally {
      setLoading(false);
    }
  };

  // Suspend Trainee Operation
  const suspendTrainee = async () => {
    if (!suspensionData.traineeId) {
      setFeedbackMessage("No trainee selected for suspension", 'error');
      return;
    }

    if (suspensionData.days < 1 || suspensionData.days > 30) {
      setFeedbackMessage("Suspension duration must be between 1 and 30 days", 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${TRAINEE_ACTIONS_API}/suspend`,
        { 
          traineeId: suspensionData.traineeId,
          days: suspensionData.days,
          reason: suspensionData.reason || `Suspended for ${suspensionData.days} days`
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json" 
          } 
        }
      );
      
      setFeedbackMessage(response.data.msg || "Trainee suspended successfully!");
      setSuspensionData({ traineeId: trainee?.id || null, days: 7, reason: "" });
      if (onActionComplete) onActionComplete();
    } catch (error) {
      handleAxiosError(error, "Failed to suspend trainee");
    } finally {
      setLoading(false);
    }
  };

  // Reinstate Trainee Operation
  const reinstateTrainee = async () => {
    if (!reinstatementData.traineeId) {
      setFeedbackMessage("No trainee selected for reinstatement", 'error');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        `${TRAINEE_ACTIONS_API}/reinstate`,
        { 
          traineeId: reinstatementData.traineeId,
          notes: reinstatementData.notes || "Reinstated by administrator"
        },
        { 
          headers: { 
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json" 
          } 
        }
      );
      
      setFeedbackMessage(response.data.msg || "Trainee reinstated successfully!");
      setReinstatementData({ traineeId: trainee?.id || null, notes: "" });
      if (onActionComplete) onActionComplete();
    } catch (error) {
      handleAxiosError(error, "Failed to reinstate trainee");
    } finally {
      setLoading(false);
    }
  };

  // Manual operation handlers (real API calls)
  const handleManualOperation = async (type) => {
    setSuccess('');
    setError('');
    setLoading(true);
    try {
      let endpoint = '';
      let payload = { traineeId: trainee.id, date: new Date().toISOString().split('T')[0] };
      switch (type) {
        case 'Check-in':
          endpoint = `${SESSION_API_BASE}/check-in`;
          payload = { ...payload, name: trainee.fullName, checkInTime, location: 'Manual' };
          break;
        case 'Check-out':
          endpoint = `${SESSION_API_BASE}/check-out`;
          payload = { ...payload, checkOutTime };
          break;
        case 'Lunch Start':
          endpoint = `${SESSION_API_BASE}/lunch-start`;
          payload = { ...payload, lunchStartTime };
          break;
        case 'Lunch End':
          endpoint = `${SESSION_API_BASE}/lunch-end`;
          payload = { ...payload, lunchEndTime };
          break;
        default:
          setError('Unknown operation');
          setLoading(false);
          return;
      }
      await axios.post(endpoint, payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setFeedbackMessage(`${type} successful!`);
      setTimeout(() => {
        setSuccess('');
        setLoading(false);
        if (onActionComplete) onActionComplete();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || `${type} failed`);
      setLoading(false);
    }
  };

  // Edit user handler (was handleEditTrainee)
  const handleEditUser = async (e) => {
    // console.log('handleEditUser called');
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    
    const updateData = {
      fullName: formData.fullName,
      surname: formData.surname,
      email: formData.email,
      phoneNumber: formData.phoneNumber,
      idNumber: formData.idNumber,
      role: formData.role,
      location: formData.location,
      street: formData.street,
      city: formData.city,
      postalCode: formData.postalCode,
    };
    
    // console.log('UserActionModal - sending update data:', updateData);
    
    try {
      let endpoint;
      const role = formData.role?.toLowerCase();
      if (role === 'online_trainee') {
        endpoint = '/online-trainees';
      } else if (role === 'trainee') {
        endpoint = '/trainees';
      } else if (role === 'facilitator') {
        endpoint = '/facilitators';
      } else if (role === 'stakeholder') {
        endpoint = '/stakeholders';
      } else if (role === 'guest') {
        endpoint = '/guests';
      } else {
        setError('Unknown user role, cannot determine endpoint!');
        setLoading(false);
        return;
      }
      // Always use user.id for all user types
      const url = `${BASE_URL}/api${endpoint}/${user.id}`;
      // console.log('Using endpoint:', url);
      const token = localStorage.getItem('authToken');
      await axios.put(url, updateData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      setFeedbackMessage('User updated successfully!');
      setTimeout(() => {
        setSuccess('');
        setLoading(false);
        if (onActionComplete) onActionComplete();
        onClose();
      }, 1000);
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.response?.data?.message || `Failed to update ${formData.role}`;
      setError(errorMsg);
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  // If not showing manual check-in, only show edit form
  if (!showManualCheckIn) {
    return (
      <div className="action-modal-overlay" onClick={onClose}>
        <div className="action-modal-content wide" onClick={e => e.stopPropagation()}>
          <button className="action-modal-close" onClick={onClose} aria-label="Close modal">×</button>
          <h2 className="modal-title">Edit User</h2>
          <form className="edit-form" onSubmit={handleEditUser}>
            <div className="section-header">Edit User Details</div>
            <div className="form-grid">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="form-input"
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
              {(formData.role === 'Trainee' || formData.role === 'Facilitator') && (
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
            </div>
            <div className="form-actions">
              <button type="submit" className="myBtns primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
              <button type="button" className="myBtns" onClick={onClose} disabled={loading}>Cancel</button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="action-modal-overlay" onClick={onClose}>
      <div className="action-modal-content wide" onClick={e => e.stopPropagation()}>
        <button className="action-modal-close" onClick={onClose} aria-label="Close modal">×</button>
        <h2 className="modal-title">Manage <span className="highlighted">{trainee?.fullName}</span></h2>
        <div className="action-modal-tabs">
          <button className={`modal-tab-btn${activeTab === 'manual' ? ' active' : ''}`} onClick={() => setActiveTab('manual')}>Manual Operations</button>
          <button className={`modal-tab-btn${activeTab === 'edit' ? ' active' : ''}`} onClick={() => setActiveTab('edit')}>Manage Trainee</button>
          <button className={`modal-tab-btn${activeTab === 'manage' ? ' active' : ''}`} onClick={() => setActiveTab('manage')}>Notify Trainee</button>
        </div>
        <div className="action-modal-body">
          {error && <div className="modal-feedback error-message">{error}</div>}
          {success && <div className="modal-feedback success-message">{success}</div>}
          
          {activeTab === 'manual' && (
            <div className="manual-form">
              <div className="section-header">Attendance Actions</div>
              {showManualCheckIn && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Check-in Time</label>
                      <input type="time" className="form-input" value={checkInTime} onChange={e => setCheckInTime(e.target.value)} />
                      <button className="myBtns primary" onClick={() => handleManualOperation('Check-in')} disabled={loading}>Check-in</button>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Check-out Time</label>
                      <input type="time" className="form-input" value={checkOutTime} onChange={e => setCheckOutTime(e.target.value)} />
                      <button className="myBtns" onClick={() => handleManualOperation('Check-out')} disabled={loading}>Check-out</button>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">Lunch Start</label>
                      <input type="time" className="form-input" value={lunchStartTime} onChange={e => setLunchStartTime(e.target.value)} />
                      <button className="myBtns" onClick={() => handleManualOperation('Lunch Start')} disabled={loading}>Lunch Start</button>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Lunch End</label>
                      <input type="time" className="form-input" value={lunchEndTime} onChange={e => setLunchEndTime(e.target.value)} />
                      <button className="myBtns" onClick={() => handleManualOperation('Lunch End')} disabled={loading}>Lunch End</button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          {activeTab === 'edit' && (
            <form className="edit-form" onSubmit={handleEditUser}>
              <div className="section-header">Edit User Details</div>
              <div className="form-grid">
                <div className="form-row">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="form-input"
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
                {(formData.role === 'Trainee' || formData.role === 'Facilitator') && (
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
              </div>
              <div className="form-actions">
                <button type="submit" className="myBtns primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
          )}
          
          {activeTab === 'manage' && (
            <div className="manage-trainee">
              <div className="section-header">Trainee Management Actions</div>
              
              {/* Send Notification Section */}
              <div className="management-section">
                <h4>Send Notification</h4>
                <div className="form-group">
                  <label>Message</label>
                  <textarea
                    value={notification.message}
                    onChange={(e) => setNotification(prev => ({ 
                      ...prev, 
                      message: e.target.value 
                    }))}
                    placeholder="Enter notification message"
                    rows={4}
                    className="form-input"
                  />
                </div>
                <button 
                  className="myBtns primary" 
                  onClick={sendNotification}
                  disabled={loading || !notification.message.trim()}
                >
                  Send Notification
                </button>
              </div>

              {/* Suspend Trainee Section */}
              <div className="management-section">
                <h4>Suspend Trainee</h4>
                <div className="form-row">
                  <div className="form-group">
                    <label>Days (1-30)</label>
                    <input
                      type="number"
                      value={suspensionData.days}
                      onChange={(e) => {
                        const days = parseInt(e.target.value, 10);
                        setSuspensionData(prev => ({ 
                          ...prev, 
                          days: isNaN(days) ? 1 : days
                        }));
                      }}
                      min={1}
                      max={30}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Reason (Optional)</label>
                  <textarea
                    value={suspensionData.reason}
                    onChange={(e) => setSuspensionData(prev => ({ 
                      ...prev, 
                      reason: e.target.value 
                    }))}
                    placeholder="Enter reason for suspension"
                    rows={3}
                    className="form-input"
                  />
                </div>
                <button 
                  className="myBtns danger" 
                  onClick={suspendTrainee}
                  disabled={loading}
                >
                  Suspend Trainee
                </button>
              </div>

              {/* Reinstate Trainee Section */}
              <div className="management-section">
                <h4>Reinstate Trainee</h4>
                <div className="form-group">
                  <label>Reinstatement Notes (Optional)</label>
                  <textarea
                    value={reinstatementData.notes}
                    onChange={(e) => setReinstatementData(prev => ({ 
                      ...prev, 
                      notes: e.target.value
                    }))}
                    placeholder="Enter reinstatement notes"
                    rows={3}
                    className="form-input"
                  />
                </div>
                <button 
                  className="myBtns success" 
                  onClick={reinstateTrainee}
                  disabled={loading}
                  style={{backgroundColor: 'green', color: 'white'}}
                >
                  Reinstate Trainee
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

UserActionModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  trainee: PropTypes.shape({
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
  onActionComplete: PropTypes.func,
  setFeedbackMessage: PropTypes.func.isRequired,
  showManualCheckIn: PropTypes.bool,
};

export default UserActionModal;