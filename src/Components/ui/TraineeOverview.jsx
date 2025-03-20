import React, { useState } from "react";
import axios from "axios";

const ITEMS_PER_PAGE = 5;

// eslint-disable-next-line react/prop-types
const TraineeOverview = ({ token }) => {
  const [overviewData, setOverviewData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch trainee overview data
  const fetchOverviewData = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        "https://timemanagementsystemserver.onrender.com/api/trainee-overview",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
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

  // Pagination logic
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = overviewData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(overviewData.length / ITEMS_PER_PAGE);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Fetch data on component mount
  React.useEffect(() => {
    fetchOverviewData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // If loading, show loader
  if (loading) return <div>Loading trainee overview...</div>;

  return (
    <div className="overview-card">
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
                <td>{trainee.attendancePercentage}</td>
                <td>
                  {/* Take Action Button with Dropdown */}
                  <div className="action-dropdown">
                    <button className="action-button">Take Action</button>
                    <div className="dropdown-content">
                      {/* Example actions */}
                      <button onClick={() => alert("Send Notification")}>
                        Send Notification
                      </button>
                      <button onClick={() => alert("Suspend for 7 Days")}>
                        Suspend for 7 Days
                      </button>
                      <button onClick={() => alert("Reinstate Trainee")}>
                        Reinstate Trainee
                      </button>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {/* Pagination Controls */}
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
    </div>
  );
};

export default TraineeOverview;