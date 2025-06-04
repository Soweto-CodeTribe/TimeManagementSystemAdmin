import React, { useState } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import '../styling/UserActionModal.css';

const API_BASE_URL = 'https://timemanagementsystemserver.onrender.com/api/trainees';
const SESSION_API_BASE = 'https://timemanagementsystemserver.onrender.com/api/session';

const UserActionModal = ({ isOpen, onClose, trainee, onActionComplete }) => {
  const [activeTab, setActiveTab] = useState('manual');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Manual check-in states
  const [checkInTime, setCheckInTime] = useState('');
  const [checkOutTime, setCheckOutTime] = useState('');
  const [lunchStartTime, setLunchStartTime] = useState('');
  const [lunchEndTime, setLunchEndTime] = useState('');

  // Edit trainee states
  const [editData, setEditData] = useState({
    fullName: trainee?.fullName || '',
    email: trainee?.email || '',
    status: trainee?.status || '',
  });

  const token = localStorage.getItem('authToken');

  // Reset tab and form when trainee changes or modal opens
  React.useEffect(() => {
    setActiveTab('manual');
    setEditData({
      fullName: trainee?.fullName || '',
      email: trainee?.email || '',
      status: trainee?.status || '',
    });
    setError('');
    setSuccess('');
    setCheckInTime('');
    setCheckOutTime('');
    setLunchStartTime('');
    setLunchEndTime('');
  }, [trainee, isOpen]);

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
      setSuccess(`${type} successful!`);
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

  // Edit trainee handler
  const handleEditTrainee = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.put(
        `${API_BASE_URL}/${trainee.id}`,
        editData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      setSuccess('Trainee updated successfully!');
      setTimeout(() => {
        setSuccess('');
        setLoading(false);
        if (onActionComplete) onActionComplete();
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update trainee');
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="action-modal-overlay" onClick={onClose}>
      <div className="action-modal-content wide" onClick={e => e.stopPropagation()}>
        <button className="action-modal-close" onClick={onClose} aria-label="Close modal">×</button>
        <h2 className="modal-title">Manage <span className="highlighted">{trainee?.fullName}</span></h2>
        <div className="action-modal-tabs">
          <button className={`modal-tab-btn${activeTab === 'manual' ? ' active' : ''}`} onClick={() => setActiveTab('manual')}>Manual Operations</button>
          <button className={`modal-tab-btn${activeTab === 'edit' ? ' active' : ''}`} onClick={() => setActiveTab('edit')}>Edit Trainee</button>
        </div>
        <div className="action-modal-body">
          {error && <div className="modal-feedback error-message">{error}</div>}
          {success && <div className="modal-feedback success-message">{success}</div>}
          {activeTab === 'manual' && (
            <div className="manual-form">
              <div className="section-header">Attendance Actions</div>
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
            </div>
          )}
          {activeTab === 'edit' && (
            <form className="edit-form" onSubmit={handleEditTrainee}>
              <div className="section-header">Edit Trainee Details</div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editData.fullName}
                    onChange={e => setEditData({ ...editData, fullName: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editData.email}
                    onChange={e => setEditData({ ...editData, email: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select
                    className="form-input"
                    value={editData.status}
                    onChange={e => setEditData({ ...editData, status: e.target.value })}
                    required
                  >
                    <option value="active">Active</option>
                    <option value="deactive">Deactive</option>
                  </select>
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="myBtns primary" disabled={loading}>{loading ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </form>
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
    email: PropTypes.string,
    status: PropTypes.string,
  }),
  onActionComplete: PropTypes.func,
};

export default UserActionModal;
