import React, { useState, useEffect } from "react";
import axios from "axios";
import { initializeSocket, subscribeToNotifications, subscribeToStatusChanges } from "../../utils/socketClient";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../styling/TraineeOverview.css'

const ITEMS_PER_PAGE = 5;
const API_BASE_URL = "https://timemanagementsystemserver.onrender.com";
// const API_BASE_URL2 = "http://localhost:6070";

const TraineeOverview = ({ token }) => {
  const [overviewData, setOverviewData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [notification, setNotification] = useState({ message: "" });
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showSuspendModal, setShowSuspendModal] = useState(false);
  const [suspensionData, setSuspensionData] = useState({ days: 7, reason: "" });

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

      return () => {
        unsubscribeNotifications();
        unsubscribeStatusChanges();
      };
    }
  }, [token]);

  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/api/trainee-overview?page=${currentPage}&limit=${ITEMS_PER_PAGE}`, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const { programStats } = response.data;
      if (Array.isArray(programStats)) {
        setOverviewData(programStats);
      } else {
        console.error("Program stats is not an array:", programStats);
      }
    } catch (error) {
      console.error("Error fetching overview stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAxiosError = (error, defaultMessage) => {
    if (error.response && error.response.data && error.response.data.msg) {
      toast.error(error.response.data.msg);
    } else {
      toast.error(defaultMessage);
    }
  };

  const suspendTrainee = async () => {
    try {
      await axios.post(
        `${API_BASE_URL}/api/trainee-actions/suspend`,
        { 
          traineeId: selectedTrainee.id, 
          days: suspensionData.days,
          message: suspensionData.reason // Include the reason as message
        },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      toast.success("Trainee suspended successfully!");
      setShowSuspendModal(false);
      setSuspensionData({ days: 7, reason: "" });
      fetchOverviewData();
    } catch (error) {
      handleAxiosError(error, "Failed to suspend trainee");
    }
  };
  
  const reinstateTrainee = async (traineeId, notes = "") => {
    if (!confirm("Are you sure you want to reinstate this trainee?")) return;
    
    // Optionally collect notes dynamically or use a default if not provided
    const reinstatementNotes = notes || "Reinstated by administrator";
    
    try {
      await axios.post(
        `${API_BASE_URL}/api/trainee-actions/reinstate`,
        { traineeId, notes: reinstatementNotes },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      toast.success("Trainee reinstated successfully!");
      fetchOverviewData();
    } catch (error) {
      handleAxiosError(error, "Failed to reinstate trainee");
    }
  };
  
  const sendNotification = async () => {
    // More thorough validation
    if (!notification.message?.trim()) {
      toast.error("Notification message cannot be empty.");
      return;
    }
    
    if (!selectedTrainee?.id) {
      toast.error("No trainee selected. Please select a trainee first.");
      return;
    }
    
    // For debugging
    console.log("Sending notification with data:", {
      traineeId: selectedTrainee.id,
      message: notification.message
    });
    
    try {
      await axios.post(
        `${API_BASE_URL}/api/trainee-actions/notify`,
        { 
          traineeId: selectedTrainee.id, 
          message: notification.message
        },
        { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
      );
      toast.success("Notification sent successfully!");
      setShowNotificationModal(false);
      setNotification({ message: "" });
    } catch (error) {
      // Enhanced error handling to see what's going wrong
      console.error("Notification error details:", error.response?.data);
      handleAxiosError(error, "Failed to send notification");
    }
  };

  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = overviewData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(overviewData.length / ITEMS_PER_PAGE);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  useEffect(() => {
    fetchOverviewData();
  }, [currentPage]);

  if (loading) return <div>Loading trainee overview...</div>;

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
              <tr key={trainee.id || trainee.traineeEmail}>
                <td>{trainee.traineeName}</td>
                <td>{trainee.traineeLocation}</td>
                <td>{trainee.traineeEmail}</td>
                <td>{trainee.traineePhoneNumber}</td>
                <td>{trainee.attendancePercentage}%</td>
                {/* <td>{trainee.status}</td> */}
                <td>
                  <div className="action-dropdown">
                    <button className="action-btn">Take Action</button>
                    <div className="dropdown-content">
                      <button
                        onClick={() => {
                          setSelectedTrainee(trainee);
                          setShowNotificationModal(true);
                        }}
                      >
                        Send Notification
                      </button>
                      {trainee.status !== "suspended" ? (
                        <button
                          onClick={() => {
                            setSelectedTrainee(trainee);
                            setShowSuspendModal(true);
                          }}
                        >
                          Suspend Trainee
                        </button>
                      ) : (
                        <button onClick={() => reinstateTrainee(trainee.id)}>Reinstate Trainee</button>
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
      {showNotificationModal && (
        <div className="action-modal">
          <div className="action-modal-content">
            <h3>Send Notification to {selectedTrainee?.traineeName}</h3>
            <textarea
              value={notification.message}
              onChange={(e) => setNotification({ ...notification, message: e.target.value })}
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
      {showSuspendModal && (
        <div className="action-modal">
          <div className="action-modal-content">
            <h3>Suspend {selectedTrainee?.traineeName}</h3>
            <div className="form-field">
              <label>Days:</label>
              <input
                type="number"
                value={suspensionData.days}
                onChange={(e) => {
                  const days = parseInt(e.target.value, 10);
                  if (days >= 1 && days <= 30) {
                    setSuspensionData({ ...suspensionData, days });
                  } else {
                    toast.error("Days must be between 1 and 30.");
                  }
                }}
                min={1}
                max={30}
              />
            </div>
            <div className="form-field">
              <label>Reason:</label>
              <textarea
                value={suspensionData.reason}
                onChange={(e) => setSuspensionData({ ...suspensionData, reason: e.target.value })}
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
    </div>
  );
};

export default TraineeOverview;