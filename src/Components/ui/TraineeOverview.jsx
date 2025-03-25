/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import axios from "axios";
import { initializeSocket, subscribeToNotifications, subscribeToStatusChanges } from "../../utils/socketClient";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../styling/TraineeOverview.css'
import DataLoader from "../dataLoader";

const ITEMS_PER_PAGE = 10;
const API_BASE_URL = "https://timemanagementsystemserver.onrender.com";

const TraineeOverview = ({ token }) => {
  const [overviewData, setOverviewData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  
  // Comprehensive State Management
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

  // Modal Visibility States
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [showReinstatementModal, setShowReinstatementModal] = useState(false);

  // Socket and Initial Data Fetching
  useEffect(() => {
    if (token) {
      initializeSocket(token);

      const unsubscribeNotifications = subscribeToNotifications((data) => {
        toast.info(`New Notification: ${data.message}`);
      });

      const unsubscribeStatusChanges = subscribeToStatusChanges((data) => {
        toast.info(`Status Change: ${data.message}`);
        fetchOverviewData();
      });

      // Initial data fetch
      fetchOverviewData();

      return () => {
        unsubscribeNotifications();
        unsubscribeStatusChanges();
      };
    }
  }, [token]);

  // Enhanced Fetch Overview Data
  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/trainee-overview?page=${currentPage}&limit=${ITEMS_PER_PAGE}`, 
        {
          headers: { 
            Authorization: `Bearer ${token}`, 
            "Content-Type": "application/json" 
          }
        }
      );
      
      const { programStats } = response.data;
      if (Array.isArray(programStats)) {
        setOverviewData(programStats);
      } else {
        console.error("Program stats is not an array:", programStats);
        toast.error("Invalid data format received");
      }
    } catch (error) {
      console.error("Error fetching overview stats:", error);
      toast.error("Failed to fetch trainee overview");
    } finally {
      setLoading(false);
    }
  };

  // Comprehensive Error Handling
  const handleAxiosError = (error, defaultMessage) => {
    if (error.response) {
      // The request was made and the server responded with a status code
      const errorMsg = error.response.data.msg || 
                       error.response.data.message || 
                       defaultMessage;
      toast.error(errorMsg);
    } else if (error.request) {
      // The request was made but no response was received
      toast.error("No response received from server");
    } else {
      // Something happened in setting up the request
      toast.error(defaultMessage);
    }
  };

  // Comprehensive Suspend Trainee Operation
  const suspendTrainee = async () => {
    // Robust Input Validation
    if (!suspensionData.traineeId) {
      toast.error("No trainee selected for suspension");
      return;
    }

    if (suspensionData.days < 1 || suspensionData.days > 30) {
      toast.error("Suspension duration must be between 1 and 30 days");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/trainee-actions/suspend`,
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
      
      toast.success(response.data.msg || "Trainee suspended successfully!");
      setShowSuspendModal(false);
      
      // Reset and refresh
      setSuspensionData({ traineeId: null, days: 7, reason: "" });
      fetchOverviewData();
    } catch (error) {
      handleAxiosError(error, "Failed to suspend trainee");
    }
  };

  // Comprehensive Reinstate Trainee Operation
  const reinstateTrainee = async () => {
    if (!reinstatementData.traineeId) {
      toast.error("No trainee selected for reinstatement");
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/trainee-actions/reinstate`,
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
      
      toast.success(response.data.msg || "Trainee reinstated successfully!");
      setShowReinstatementModal(false);
      
      // Reset and refresh
      setReinstatementData({ traineeId: null, notes: "" });
      fetchOverviewData();
    } catch (error) {
      handleAxiosError(error, "Failed to reinstate trainee");
    }
  };

  // Send Notification Operation
  const sendNotification = async () => {
    // Enhanced Validation
    if (!notification.message?.trim()) {
      toast.error("Notification message cannot be empty.");
      return;
    }
    
    if (!notification.traineeId) {
      toast.error("No trainee selected. Please select a trainee first.");
      return;
    }
    
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/trainee-actions/notify`,
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
      
      toast.success(response.data.msg || "Notification sent successfully!");
      setShowNotificationModal(false);
      setNotification({ message: "", traineeId: null });
    } catch (error) {
      handleAxiosError(error, "Failed to send notification");
    }
  };

  // Modal Opener Functions with Corrected ID Reference
  const openNotificationModal = (trainee) => {
    setSelectedTrainee(trainee);
    setNotification({
      message: "",
      traineeId: trainee.traineeId  // Corrected from trainee.id
    });
    setShowNotificationModal(true);
  };

  const openSuspendModal = (trainee) => {
    setSelectedTrainee(trainee);
    setSuspensionData({
      traineeId: trainee.traineeId,  // Corrected from trainee.id
      days: 7,
      reason: ""
    });
    setShowSuspendModal(true);
  };

  const openReinstatementModal = (trainee) => {
    setSelectedTrainee(trainee);
    setReinstatementData({
      traineeId: trainee.traineeId,  // Corrected from trainee.id
      notes: ""
    });
    setShowReinstatementModal(true);
  };

  // Pagination Logic
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = overviewData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(overviewData.length / ITEMS_PER_PAGE);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Sync page change with data fetch
  useEffect(() => {
    fetchOverviewData();
  }, [currentPage]);

  // Loading State
  if (loading) return <DataLoader />;

  return (
    <div className="overview-card">
      <ToastContainer style={{zIndex: '99999'}} />
      
      <div className="card-header">
        <h4>Trainee Management Overview</h4>
      </div>
      
      <div className="card-content">
        <table className="overview-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Location</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Attendance Rate</th>
              {/* <th>Status</th> */}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((trainee) => (
              <tr key={trainee.traineeId}>
                <td>{trainee.traineeName}</td>
                <td>{trainee.traineeLocation}</td>
                <td>{trainee.traineeEmail}</td>
                <td>{trainee.traineePhoneNumber}</td>
                <td>{trainee.attendancePercentage}</td>
                {/* <td>{trainee.status}</td> */}
                <td>
                  <div className="action-dropdown">
                    <button className="action-btn">Take Action</button>
                    <div className="dropdown-content">
                      <button onClick={() => openNotificationModal(trainee)}>
                        Send Notification
                      </button>
                      {trainee.status !== "suspended" ? (
                        <button onClick={() => openSuspendModal(trainee)}>
                          Suspend Trainee
                        </button>
                      ) : (
                        <button onClick={() => openReinstatementModal(trainee)}>
                          Reinstate Trainee
                        </button>
                      )}
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div className="pagination">
          {Array.from({ length: totalPages }, (_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`page-button ${currentPage === index + 1 ? "active" : ""}`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Notification Modal */}
      {showNotificationModal && (
        <div className="action-modal">
          <div className="action-modal-content">
            <h3>Send Notification to {selectedTrainee?.traineeName}</h3>
            <textarea
              value={notification.message}
              onChange={(e) => setNotification(prev => ({ 
                ...prev, 
                message: e.target.value 
              }))}
              placeholder="Enter notification message"
              rows={5}
              cols={56}
              className="action-textarea"
            />
            <div className="action-modal-actions">
              <button onClick={() => setShowNotificationModal(false)}>Cancel</button>
              <button onClick={sendNotification}>Send</button>
            </div>
          </div>
        </div>
      )}

      {/* Suspension Modal */}
      {showSuspendModal && (
        <div className="action-modal">
          <div className="action-modal-content">
            <h3>Suspend {selectedTrainee?.traineeName}</h3>
            <div className="form-field">
              <label>Days (1-30):</label>
              <input
                type="number"
                value={suspensionData.days}
                onChange={(e) => {
                  const days = parseInt(e.target.value, 10);
                  setSuspensionData(prev => ({ 
                    ...prev, 
                    days: days 
                  }));
                }}
                min={1}
                max={30}
              />
            </div>
            <div className="form-field">
              <label>Reason (Optional):</label>
              <textarea
                value={suspensionData.reason}
                onChange={(e) => setSuspensionData(prev => ({ 
                  ...prev, 
                  reason: e.target.value 
                }))}
                placeholder="Enter reason for suspension"
                rows={3}
                className='action-textarea'
              />
            </div>
            <div className="action-modal-actions">
              <button onClick={() => setShowSuspendModal(false)}>Cancel</button>
              <button onClick={suspendTrainee}>Suspend</button>
            </div>
          </div>
        </div>
      )}

      {/* Reinstatement Modal */}
      {showReinstatementModal && (
        <div className="action-modal">
          <div className="action-modal-content">
            <h3>Reinstate {selectedTrainee?.traineeName}</h3>
            <div className="form-field">
              <label>Reinstatement Notes (Optional):</label>
              <textarea
                value={reinstatementData.notes}
                onChange={(e) => setReinstatementData(prev => ({ 
                  ...prev, 
                  notes: e.target.value 
                }))}
                placeholder="Enter reinstatement notes"
                rows={3}
                className='action-textarea'
              />
            </div>
            <div className="action-modal-actions">
              <button onClick={() => setShowReinstatementModal(false)}>Cancel</button>
              <button onClick={reinstateTrainee}>Reinstate</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TraineeOverview;