// src/screens/ReportsScreen.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "./styling/ReportsScreen.css";
import DataLoader from "./dataLoader";

const ReportsScreen = () => {
  const token = useSelector((state) => state.auth.token);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const maxVisiblePages = 5; 

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
  }, [token, currentPage]);

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

  if (loading) return <DataLoader />; // Use the Loader component here

  if (error) return (
    <div className="error-container">
      <p>Error: {error}</p>
    </div>
  );
  
  if (!data) return (
    <div className="no-data-container">
      <p>No data available</p>
    </div>
  );

  return (
    <div className="WrapperContent">
      {/* Rest of your component remains unchanged */}
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Reports and Issues</h1>
          <p className="page-subtitle">View and manage reports and issues</p>
        </div>

        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Issue Management Table</h2>
            <div className="card-actions">
              <button className="filter-button">
                <FilterIcon className="filter-icon" />
                <span>Filter</span>
              </button>
              <div className="search-container">
                <SearchIcon className="search-icon" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="search-input"
                />
              </div>
            </div>
          </div>

          <div className="export-actions">
            <button className="export-button">
              <PDFIcon className="export-icon" />
              <span>Export PDF</span>
            </button>
            <button className="export-button">
              <CSVIcon className="export-icon" />
              <span>Export CSV</span>
            </button>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Trainee Name</th>
                  <th>Status</th>
                  <th>Date Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.reports.map((report, index) => (
                  <tr key={report.traineeId} onClick={() => setSelectedTrainee(report)}>
                    <td>{report.traineeId || `REP-${index + 1}`}</td>
                    <td>{report.name || report.fullName}</td>
                    <td className={report.status.toLowerCase()}>
                      {report.status}
                    </td>
                    <td>{new Date().toLocaleDateString()}</td>
                    <td>
                      <button className="view-button">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pagination">
            <button 
              className="pagination-arrow"
              onClick={() => handlePageChange(currentPage - 1)} 
              disabled={currentPage === 1}
            >
              <ChevronLeftIcon />
            </button>
            
            {renderPaginationNumbers()}

            <button 
              className="pagination-arrow"
              onClick={() => handlePageChange(currentPage + 1)} 
              disabled={currentPage === data.totalPages}
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      </div>

      {/* Modal for Trainee Details */}
      {selectedTrainee && (
        <div className="modal-overlay" onClick={() => setSelectedTrainee(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedTrainee(null)}>✖</button>
            <h2>{`${selectedTrainee.name}'s Report`}</h2>
            <p><strong>Status:</strong> {selectedTrainee.status}</p>
            <p><strong>Total Hours Worked:</strong> {selectedTrainee.totalHoursWorked}</p>
            <p><strong>Lunch Break:</strong> {selectedTrainee.totalLunchMinutes} minutes</p>
          </div>
        </div>
      )}
    </div>
  );
};

// Icon Components (keep them here for now)
const SearchIcon = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="11" cy="11" r="8"></circle>
    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
  </svg>
);

const FilterIcon = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    {...props}
  >
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
  </svg>
);

const PDFIcon = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    {...props}
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
    <polyline points="14 2 14 8 20 8"></polyline>
    <line x1="16" y1="13" x2="8" y2="13"></line>
    <line x1="16" y1="17" x2="8" y2="17"></line>
    <polyline points="10 9 9 9 8 9"></polyline>
  </svg>
);

const CSVIcon = (props) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="7 10 12 15 17 10"></polyline>
    <line x1="12" y1="15" x2="12" y2="3"></line>
  </svg>
);

const ChevronLeftIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6"></polyline>
  </svg>
);

const ChevronRightIcon = () => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6"></polyline>
  </svg>
);

export default ReportsScreen;