import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styling/ManageTrainees.css';

const ManageTrainees = () => {
  const navigate = useNavigate();
  const [trainees, setTrainees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [programStartDate, setProgramStartDate] = useState('');
  const [programEndDate, setProgramEndDate] = useState('');
  const [selectedTrainees, setSelectedTrainees] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [message, setMessage] = useState('');
  const [isSingleUpdate, setIsSingleUpdate] = useState(false);
  const [currentTrainee, setCurrentTrainee] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMessage, setPopupMessage] = useState('');
  const [popupType, setPopupType] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalTrainees, setTotalTrainees] = useState(0);
  const [limit, setLimit] = useState(50); // Increased from default 10 to load more at once
  const [loadingMore, setLoadingMore] = useState(false);
  const [allTraineesLoaded, setAllTraineesLoaded] = useState(false);
  
  const API_BASE_URL = 'https://timemanagementsystemserver.onrender.com/api/trainees';
  const API_BASE_URLS = 'https://timemanagementsystemserver.onrender.com/api';

  // Fetch trainees when component mounts
  useEffect(() => {
    fetchTrainees(1, true);
  }, []);

  const fetchTrainees = async (page = 1, resetList = false) => {
    try {
      if (resetList) {
        setLoading(true);
        setTrainees([]);
      } else {
        setLoadingMore(true);
      }
      
      const token = localStorage.getItem("authToken");

      if (!token) {
        setMessage('Access Denied: No token found. Please log in again.');
        return;
      }

      const response = await axios.get(`${API_BASE_URL}`, {
        params: {
          page: page,
          limit: limit
        },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log("Trainees page data:", response.data);
      
      // Update pagination information
      const { pagination } = response.data;
      setCurrentPage(pagination.currentPage);
      setTotalPages(pagination.totalPages);
      setTotalTrainees(pagination.totalTrainees);
      
      // Update trainees list
      if (resetList) {
        setTrainees(response.data.trainees);
      } else {
        setTrainees(prevTrainees => [...prevTrainees, ...response.data.trainees]);
      }
      
      // Check if all trainees have been loaded
      if (pagination.currentPage >= pagination.totalPages) {
        setAllTraineesLoaded(true);
      } else {
        setAllTraineesLoaded(false);
      }
      
    } catch (error) {
      console.error("Error fetching trainees:", error);
      if (error.response && error.response.status === 401) {
        setMessage('Unauthorized: Please check your credentials and login again.');
      } else {
        setMessage('Failed to fetch trainees: ' + (error.response?.data?.message || error.message));
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Load all trainees via pagination
  const loadAllTrainees = async () => {
    try {
      setLoading(true);
      setTrainees([]);
      
      const token = localStorage.getItem("authToken");
      if (!token) {
        setMessage('Access Denied: No token found. Please log in again.');
        return;
      }

      // First request to get total count and pages
      const initialResponse = await axios.get(`${API_BASE_URL}`, {
        params: { page: 1, limit: 10 },
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const { totalTrainees, totalPages } = initialResponse.data.pagination;
      setTotalTrainees(totalTrainees);
      
      // If there are a lot of trainees, show a loading popup
      if (totalTrainees > 100) {
        showNotification(`Loading all ${totalTrainees} trainees. This may take a moment...`, 'info');
      }
      
      let allTrainees = [...initialResponse.data.trainees];
      
      // Fetch all remaining pages in parallel
      if (totalPages > 1) {
        const pagePromises = [];
        for (let page = 2; page <= totalPages; page++) {
          pagePromises.push(
            axios.get(`${API_BASE_URL}`, {
              params: { page, limit: 100 }, // Use larger limit for faster loading
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            })
          );
        }
        
        const pageResponses = await Promise.all(pagePromises);
        
        // Combine all trainee data
        pageResponses.forEach(response => {
          allTrainees = [...allTrainees, ...response.data.trainees];
        });
      }
      
      setTrainees(allTrainees);
      setAllTraineesLoaded(true);
      
      if (totalTrainees > 100) {
        showNotification(`All ${totalTrainees} trainees loaded successfully!`, 'success');
      }
      
    } catch (error) {
      console.error("Error loading all trainees:", error);
      showNotification('Failed to load all trainees. Try again or refresh the page.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && !allTraineesLoaded) {
      fetchTrainees(currentPage + 1, false);
    }
  };

  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    setSelectAll(isChecked);
    setSelectedTrainees(isChecked ? trainees.map(trainee => trainee.id) : []);
    setIsSingleUpdate(false);
    setCurrentTrainee(null);
  };

  const handleTraineeSelect = (traineeId) => {
    if (isSingleUpdate && currentTrainee && currentTrainee.id === traineeId) {
      setIsSingleUpdate(false);
      setCurrentTrainee(null);
      setSelectedTrainees([]);
      return;
    }

    // If selecting a single trainee for individual update
    const trainee = trainees.find(t => t.id === traineeId);
    setCurrentTrainee(trainee);
    setIsSingleUpdate(true);
    setSelectedTrainees([traineeId]);
    setSelectAll(false);
    
    // Pre-fill dates if the trainee has them
    if (trainee.programStartDate) {
      const startDate = new Date(trainee.programStartDate);
      setProgramStartDate(formatDateForInput(startDate));
    } else {
      setProgramStartDate('');
    }
    
    if (trainee.programEndDate) {
      const endDate = new Date(trainee.programEndDate);
      setProgramEndDate(formatDateForInput(endDate));
    } else {
      setProgramEndDate('');
    }
  };

  // Format date for input fields (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    return date.toISOString().split('T')[0];
  };

  const showNotification = (message, type) => {
    setPopupMessage(message);
    setPopupType(type);
    setShowPopup(true);
    
    // Auto-hide the popup after 5 seconds
    setTimeout(() => {
      setShowPopup(false);
    }, 5000);
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
      setSubmitting(true);
      setLoading(true);
      const token = localStorage.getItem("authToken");

      if (!token) {
        setMessage('Access Denied: No token found. Please log in again.');
        showNotification('Access Denied: No token found. Please log in again.', 'error');
        return;
      }

      let response;

      if (isSingleUpdate && selectedTrainees.length === 1) {
        // Single trainee update
        const traineeId = selectedTrainees[0];
        
        response = await axios.post(
          `${API_BASE_URLS}/session/set-program-date`,
          {
            traineeId: traineeId,
            programStartDate: new Date(programStartDate).getTime(),
            programEndDate: programEndDate ? new Date(programEndDate).getTime() : null
          },
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log("Response from Setting Single Date:", response.data);
        const successMsg = `Successfully updated program dates for trainee ${currentTrainee.name} ${currentTrainee.surname}`;
        setMessage(successMsg);
        showNotification(successMsg, 'success');
      } else {
        // Bulk update
        response = await axios.post(
          `${API_BASE_URLS}/session/set-bulk-program-date`,
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
        
        console.log("Response from Setting Bulk Dates:", response.data);
        const successMsg = `Successfully updated ${response.data.totalUpdated} trainees`;
        setMessage(successMsg);
        showNotification(successMsg, 'success');
      }

      // Refresh the trainees data
      loadAllTrainees();
      
      // Reset selection
      setSelectedTrainees([]);
      setSelectAll(false);
      setIsSingleUpdate(false);
      setCurrentTrainee(null);
    } catch (error) {
      const errorMsg = 'Error updating program dates: ' + (error.response?.data?.message || error.message);
      setMessage(errorMsg);
      showNotification(errorMsg, 'error');
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleClearSelection = () => {
    setSelectedTrainees([]);
    setSelectAll(false);
    setIsSingleUpdate(false);
    setCurrentTrainee(null);
    setProgramStartDate('');
    setProgramEndDate('');
  };

  return (
    <div className="program-manager-container">
      <button className="back-arrow" onClick={() => navigate('/settings')}>
        ← {/* This can be replaced with an icon if desired */}
      </button>
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

      {/* Pagination Summary */}
      <div className="pagination-summary">
        <span>
          Showing {trainees.length} of {totalTrainees} trainees
        </span>
        {!allTraineesLoaded && (
          <button 
            className="load-all-button" 
            onClick={loadAllTrainees}
            disabled={loading || loadingMore}
          >
            Load All Trainees
          </button>
        )}
      </div>

      {/* Mode indicator */}
      <div className="update-mode-indicator">
        {isSingleUpdate && currentTrainee ? (
          <p className="single-update-indicator">
            Setting dates for: {currentTrainee.name} {currentTrainee.surname}
            {currentTrainee.traineeId ? ` (ID: ${currentTrainee.traineeId})` : ` (ID: ${currentTrainee.id})`}
          </p>
        ) : (
          <p className="bulk-update-indicator">
            Bulk update: {selectedTrainees.length} trainees selected
          </p>
        )}
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
            disabled={isSingleUpdate}
          />
          <label htmlFor="select-all-trainees" className="select-all-label">
            Select All Trainees ({trainees.length})
          </label>
        </div>
        
        {loading && !submitting ? (
          <div className="loading-container">
            <div className="loader"></div>
            <p className="loading-text">Loading trainees...</p>
          </div>
        ) : (
          <div className="trainees-list">
            {trainees.length > 0 ? (
              trainees.map((trainee) => (
                <div
                  key={trainee.id}
                  className={`trainee-item ${
                    selectedTrainees.includes(trainee.id) 
                      ? isSingleUpdate && currentTrainee && currentTrainee.id === trainee.id
                        ? 'single-selected'
                        : 'selected'
                      : ''
                  }`}
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
                    {trainee.programStartDate && (
                      <span className="program-date-info">
                        Start: {new Date(trainee.programStartDate).toLocaleDateString()}
                        {trainee.programEndDate && ` | End: ${new Date(trainee.programEndDate).toLocaleDateString()}`}
                      </span>
                    )}
                  </label>
                </div>
              ))
            ) : (
              <p className="no-results">No trainees available</p>
            )}
            
            {/* Load More Button */}
            {!loading && !allTraineesLoaded && trainees.length > 0 && (
              <div className="load-more-container">
                <button 
                  className="load-more-button" 
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                >
                  {loadingMore ? (
                    <span className="button-content">
                      <span className="button-loader"></span>
                      <span>Loading More...</span>
                    </span>
                  ) : (
                    `Load More (${trainees.length}/${totalTrainees})`
                  )}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="actions-container">
        <button
          onClick={handleClearSelection}
          className="clear-button"
          disabled={loading || selectedTrainees.length === 0}
        >
          Clear
        </button>
        <button
          onClick={handleSetProgramDates}
          disabled={loading || selectedTrainees.length === 0 || !programStartDate}
          className={`set-date-button ${loading ? 'button-disabled' : ''} ${isSingleUpdate ? 'single-update-button' : 'bulk-update-button'}`}
        >
          {submitting ? (
            <span className="button-content">
              <span className="button-loader"></span>
              <span>Updating...</span>
            </span>
          ) : (
            isSingleUpdate ? 'Set Date for Selected Trainee' : 'Set Dates for Selected Trainees'
          )}
        </button>
      </div>

      {/* Message Display */}
      {message && (
        <div className={`message ${message.includes('Successfully') ? 'success-message' : 'error-message'}`}>
          {message}
        </div>
      )}

      {/* Popup Notification */}
      {showPopup && (
        <div className={`popup-notification ${popupType}-popup`}>
          <div className="popup-content">
            <span className="popup-icon">
              {popupType === 'success' ? '✓' : popupType === 'info' ? 'ℹ' : '⚠'}
            </span>
            <p>{popupMessage}</p>
            <button className="close-popup" onClick={() => setShowPopup(false)}>×</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTrainees;