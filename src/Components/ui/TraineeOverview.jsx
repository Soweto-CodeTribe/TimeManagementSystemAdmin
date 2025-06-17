/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect } from "react";
import axios from "axios";
import { initializeSocket, subscribeToNotifications, subscribeToStatusChanges } from "../../utils/socketClient";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../styling/TraineeOverview.css'
import DataLoader from "../dataLoader";
import UserActionModal from "./UserActionModal";

const ITEMS_PER_PAGE = 10;
const API_BASE_URL = "https://timemanagementsystemserver.onrender.com";

const TraineeOverview = ({ token }) => {
  const [overviewData, setOverviewData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [showUserActionModal, setShowUserActionModal] = useState(false);

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

  // Open User Action Modal
  const openUserActionModal = (trainee) => {
    // Transform trainee data to match UserActionModal expected format
    const transformedTrainee = {
      id: trainee.traineeId,
      fullName: trainee.traineeName,
      email: trainee.traineeEmail,
      phoneNumber: trainee.traineePhoneNumber,
      location: trainee.traineeLocation,
      // Add other fields as needed or available in your data
    };
    
    setSelectedTrainee(transformedTrainee);
    setShowUserActionModal(true);
  };

  // Handle action completion callback
  const handleActionComplete = () => {
    fetchOverviewData(); // Refresh the data
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
              {/* <th>Actions</th> */}
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
                {/* <td>
                  <button 
                    className="action-btn" 
                    onClick={() => openUserActionModal(trainee)}
                  >
                    Manage Trainee
                  </button>
                </td> */}
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

      {/* User Action Modal */}
      <UserActionModal
        isOpen={showUserActionModal}
        onClose={() => setShowUserActionModal(false)}
        trainee={selectedTrainee}
        onActionComplete={handleActionComplete}
      />
    </div>
  );
};

export default TraineeOverview;