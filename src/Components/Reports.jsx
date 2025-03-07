import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "./styling/ReportsScreen.css";

const ReportsScreen = () => {
  const token = useSelector((state) => state.auth.token);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const maxVisiblePages = 5; // Maximum number of pagination buttons to show

  const fetchData = async (page) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://timemanagementsystemserver.onrender.com/api/super-admin/daily?page=${page}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setData(response.data);
      setCurrentPage(page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [token]);

  const handlePageChange = (page) => {
    if (page !== currentPage) {
      fetchData(page);
    }
  };

  // Generate page numbers for pagination
  const renderPaginationNumbers = () => {
    if (!data) return null;

    const { totalPages } = data;
    const pageNumbers = [];
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-number ${currentPage === i ? 'active' : ''}`}
        >
          {i}
        </button>
      );
    }

    return pageNumbers;
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!data) return <p>No data available</p>;

  return (
    <div className="reports-container">
      <h1 className="reports-title">Daily Reports</h1>

      {/* Summary Metrics */}
      <div className="metrics-grid">
        <div className="metric-card" onClick={() => setSelectedTrainee(null)}>
          <span>Total Trainees</span>
          <strong>{data.summary.totalTrainees}</strong>
        </div>
        <div className="metric-card">
          <span>Present</span>
          <strong>{data.summary.presentCount}</strong>
        </div>
        <div className="metric-card">
          <span>Absent</span>
          <strong>{data.summary.absentCount}</strong>
        </div>
        <div className="metric-card">
          <span>Late</span>
          <strong>{data.summary.lateCount}</strong>
        </div>
        <div className="metric-card">
          <span>Avg Hours Worked</span>
          <strong>{data.summary.averageHoursWorked}</strong>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="table-section">
        <h2 className="table-title">Attendance Records</h2>
        <table className="reports-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Hours Worked</th>
              <th>Lunch (Minutes)</th>
            </tr>
          </thead>
          <tbody>
            {data.reports.map((report) => (
              <tr key={report.traineeId} onClick={() => setSelectedTrainee(report)}>
                <td>{report.name}</td>
                <td className={report.status === "Absent" ? "absent" : "present"}>{report.status}</td>
                <td>{report.totalHoursWorked}</td>
                <td>{report.totalLunchMinutes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="pagination">
        <button 
          onClick={() => handlePageChange(currentPage - 1)} 
          disabled={currentPage === 1}
        >
          Prev
        </button>
        
        {renderPaginationNumbers()}

        <button 
          onClick={() => handlePageChange(currentPage + 1)} 
          disabled={currentPage === data.totalPages}
        >
          Next
        </button>
      </div>

      {/* Modal for Trainee Details */}
      {selectedTrainee && (
        <div className="modal-overlay" onClick={() => setSelectedTrainee(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedTrainee(null)}>✖</button>
            <h2>{selectedTrainee.name}'s Report</h2>
            <p><strong>Status:</strong> {selectedTrainee.status}</p>
            <p><strong>Total Hours Worked:</strong> {selectedTrainee.totalHoursWorked}</p>
            <p><strong>Lunch Break:</strong> {selectedTrainee.totalLunchMinutes} minutes</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsScreen;
