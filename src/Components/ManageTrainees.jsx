import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styling/ManageTrainees.css';

const ManageTrainees = () => {
  const [trainees, setTrainees] = useState([]);
  const [filteredTrainees, setFilteredTrainees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [programStartDate, setProgramStartDate] = useState('');
  const [programEndDate, setProgramEndDate] = useState('');
  const [selectedTrainees, setSelectedTrainees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const API_BASE_URL = 'https://timemanagementsystemserver.onrender.com/api/trainees';

  // Fetch all trainees when component mounts
  useEffect(() => {
    fetchTrainees();
  }, []);

  // Filter trainees based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredTrainees(trainees);
    } else {
      const filtered = trainees.filter(trainee =>
        trainee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trainee.surname.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (trainee.traineeId && trainee.traineeId.toString().includes(searchTerm)) ||
        trainee.id.toString().includes(searchTerm)
      );
      setFilteredTrainees(filtered);
    }
  }, [searchTerm, trainees]);

  const fetchTrainees = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken"); // Changed to exactly your requirement

      // Log the token for debugging
      console.log("Authorization Token:", token); // Log the token for debugging

      if (!token) {
        setMessage('Access Denied: No token found. Please log in again.');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      // Log the fetched trainees data
      console.log("Trainees Data:", response.data); // Log the trainees data being received

      setTrainees(response.data);
      setFilteredTrainees(response.data);
    } catch (error) {
      if (error.response && error.response.status === 401) {
        setMessage('Unauthorized: Please check your credentials and login again.');
      } else {
        setMessage('Failed to fetch trainees: ' + (error.response?.data?.message || error.message));
      }
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    setSelectedTrainees(isChecked ? filteredTrainees.map(trainee => trainee.id) : []);
  };

  const handleTraineeSelect = (traineeId) => {
    setSelectedTrainees(prev =>
      prev.includes(traineeId)
        ? prev.filter(id => id !== traineeId)
        : [...prev, traineeId]
    );
    if (selectedTrainees.includes(traineeId)) {
      setSelectAll(false);
    } else if (selectedTrainees.length + 1 === filteredTrainees.length) {
      setSelectAll(true);
    }
  };

  const handleSetProgramDates = async () => {
    if (!programStartDate) {
      setMessage('Please select a program start date');
      return;
    }
    if (selectedTrainees.length === 0) {
      setMessage('Please select at least one trainee');
      return;
    }
    try {
      setLoading(true);
      const token = localStorage.getItem("authToken"); // Changed to exactly your requirement

      // Log the token and selected trainees for debugging
      console.log("Authorization Token:", token); // Log the token for debugging
      console.log("Selected Trainees:", selectedTrainees); // Log the trainees being updated

      if (!token) {
        setMessage('Access Denied: No token found. Please log in again.');
        return;
      }

      const response = await axios.post(
        `${API_BASE_URL}/session/set-bulk-program-date`,
        {
          programStartDate: new Date(programStartDate).getTime(),
          programEndDate: programEndDate ? new Date(programEndDate).getTime() : null,
          traineeIds: selectedTrainees
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Log the response data from updating program dates
      console.log("Response from Setting Dates:", response.data); // Log the response being received

      setMessage(`Successfully updated ${response.data.totalUpdated} trainees`);
      setSelectedTrainees([]);
      setSelectAll(false);
    } catch (error) {
      setMessage('Error updating program dates: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="program-manager-container">
      <h2 className="program-title">Manage Trainee Program Dates</h2>
      {/* Date Inputs */}
      <div className="date-inputs">
        <div className="date-input-group">
          <label className="date-label">Program Start Date</label>
          <input
            type="date"
            value={programStartDate}
            onChange={(e) => setProgramStartDate(e.target.value)}
            className="date-input"
            required
          />
        </div>
        <div className="date-input-group">
          <label className="date-label">Program End Date (Optional)</label>
          <input
            type="date"
            value={programEndDate}
            onChange={(e) => setProgramEndDate(e.target.value)}
            className="date-input"
          />
        </div>
      </div>
      {/* Search and Selection Stats */}
      <div className="search-container">
        <input
          type="text"
          placeholder="Search trainees by name or ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <div className="selection-stats">
          {selectedTrainees.length} of {trainees.length} trainees selected
        </div>
      </div>
      {/* Trainees Selection */}
      <div className="trainees-selection">
        <div className="select-all-container">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
            className="checkbox"
            id="select-all-trainees"
          />
          <label htmlFor="select-all-trainees" className="select-all-label">
            Select All Visible Trainees ({filteredTrainees.length})
          </label>
        </div>
        {loading ? (
          <p className="loading-text">Loading trainees...</p>
        ) : (
          <div className="trainees-list">
            {filteredTrainees.length > 0 ? (
              filteredTrainees.map((trainee) => (
                <div
                  key={trainee.id}
                  className={`trainee-item ${selectedTrainees.includes(trainee.id) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTrainees.includes(trainee.id)}
                    onChange={() => handleTraineeSelect(trainee.id)}
                    className="checkbox"
                    id={`trainee-${trainee.id}`}
                  />
                  <label
                    htmlFor={`trainee-${trainee.id}`}
                    className="trainee-label"
                  >
                    {trainee.name} {trainee.surname} {trainee.traineeId ? `(ID: ${trainee.traineeId})` : `(ID: ${trainee.id})`}
                  </label>
                </div>
              ))
            ) : (
              <p className="no-results">No trainees match your search</p>
            )}
          </div>
        )}
      </div>
      {/* Actions */}
      <div className="actions-container">
        <button
          onClick={() => {
            setSelectedTrainees([]);
            setSelectAll(false);
            setSearchTerm('');
          }}
          className="clear-button"
          disabled={loading || selectedTrainees.length === 0}
        >
          Clear Selection
        </button>
        <button
          onClick={handleSetProgramDates}
          disabled={loading || selectedTrainees.length === 0}
          className={`action-button ${loading ? 'button-disabled' : ''}`}
        >
          {loading ? 'Updating...' : 'Set Program Dates'}
        </button>
      </div>
      {/* Message Display */}
      {message && (
        <div className={`message ${message.includes('Successfully') ? 'success-message' : 'error-message'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default ManageTrainees;