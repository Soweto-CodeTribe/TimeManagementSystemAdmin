"use client"

import { useState, useEffect } from "react"
import { FileText, Search, Filter, Info, ChevronLeft, ChevronRight } from "lucide-react"
import "./styling/Session.css"
import { useSelector } from 'react-redux'
import axios from "axios"

const SessionMonitoring = () => {
  const BASE_URL = "https://timemanagementsystemserver.onrender.com/"
  const token = useSelector((state) => state.auth.token);
  
  // State for API data
  const [summaryData, setSummaryData] = useState(null);
  const [reports, setReports] = useState([]);
  const [data, setData] = useState([])
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("")
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(10); // Default items per page

  useEffect(() => {
    fetchData(currentPage);
  }, [token, currentPage]);

  const fetchData = async (page = 1) => {
    setIsLoading(true);
  
    try {
      const response = await axios.get(`${BASE_URL}api/session/daily-report?pages`, {
        params: {
          pages: page,
          limit: itemsPerPage
        },
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
  
      // Store API data in state - separate summary from reports
      const { summary = {}, paginatedReports = [], pagination = {} } = response.data;
  
      setSummaryData(summary);
      setReports(paginatedReports);
      setData(response.data);
  
      console.log('my summary data', summary);  // Log the response directly
  
      // Set pagination data
      if (pagination) {
        setCurrentPage(pagination.currentPage);
        setTotalPages(pagination.totalPages);
        setTotalItems(pagination.totalItems);
      }
  
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching daily report:", error);
      setError("Failed to load attendance data");
      setIsLoading(false);
    }
  };
  

  // Handle page change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Reset to first page when searching
  useEffect(() => {
    if (searchTerm) {
      setCurrentPage(1);
    }
  }, [searchTerm]);

  // Filter employees based on search term - only if we have reports
  const filteredReports = reports.length > 0 
    ? reports.filter(report => 
        report.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    : [];

  const formatTime = (timeString) => {
    if (!timeString) return "-";
    
    try {
      // Assuming timeString is in ISO format or a standard format
      const date = new Date(timeString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error(error)
      return timeString; // Return as is if parsing fails
    }
  };

  // Generate page numbers for pagination
  const renderPaginationNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5; // Maximum number of page buttons to show
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    // Adjust start page if end range is too small
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

  return (
    <div className="session-container">
      <h1>Session Monitoring</h1>
      <p className="session-description">
        Monitor check-ins, check-outs, and lunch breaks. Add time logs, update session attendance and activity.
      </p>

      {/* Metrics Cards */}
      <div className="metrics-grid">
        <div className="metric-card blue">
          <div className="metric-header">
            <div className="metric-icon blue">
              <div className="metric-dot blue"></div>
            </div>
            <span className="metric-label">Present</span>
          </div>
          <div className="metric-value blue">{isLoading ? "-" :  summaryData?.presentCount || 0}</div>
        </div>

        <div className="metric-card green">
          <div className="metric-header">
            <div className="metric-icon green">
              <div className="metric-dot green"></div>
            </div>
            <span className="metric-label">Total Trainees</span>
          </div>
          <div className="metric-value green">{isLoading ? "-" : summaryData?.totalTrainees || 0}</div>
        </div>

        <div className="metric-card red">
          <div className="metric-header">
            <div className="metric-icon red">
              <div className="metric-dot red"></div>
            </div>
            <span className="metric-label">Absent</span>
          </div>
          <div className="metric-value red">{isLoading ? "-" : summaryData?.absentCount || 0}</div>
        </div>

        <div className="metric-card yellow">
          <div className="metric-header">
            <div className="metric-icon yellow">
              <div className="metric-dot yellow"></div>
            </div>
            <span className="metric-label">Late Check-Ins</span>
          </div>
          <div className="metric-value yellow">{isLoading ? "-" : summaryData?.lateCount || 0}</div>
        </div>
      </div>

      {/* Daily Attendance Log */}
      <div className="table-container">
        <div className="table-header">
          <h2 className="table-title">
            Daily Attendance Log
            {summaryData && <span className="table-date"> - {new Date(summaryData.date).toLocaleDateString()}</span>}
          </h2>
          <div className="table-actions">
            <button className="btn filter-btn">
              <Filter className="btn-icon" />
              <span>Filter</span>
            </button>
            <div className="search-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search by name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                disabled={reports.length === 0 || isLoading}
              />
            </div>
          </div>
        </div>

        <div className="export-actions">
          <button className="btn export-btn" disabled={reports.length === 0 || isLoading}>
            <FileText className="btn-icon" />
            <span>Export PDF</span>
          </button>
        </div>

        {isLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading attendance data...</p>
          </div>
        ) : error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="no-data-container">
            <Info size={48} />
            <h3>No Attendance Records</h3>
            <p>
              {summaryData?.isWorkingDay === false 
                ? "Today is not a working day. No attendance data is available."
                : "No attendance records found for today. Check back later."}
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>ID</th>
                  <th>Check-In</th>
                  <th>Lunch Start</th>
                  <th>Lunch End</th>
                  <th>Check-Out</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredReports.length > 0 ? (
                  filteredReports.map((report, index) => (
                    <tr key={index}>
                      <td>{report.name || "-"}</td>
                      <td>{report.traineeId}</td>
                      <td>{report.checkInTime || "-"}</td>
                      <td>{report.lunchStartTime || "-"}</td>
                      <td>{report.lunchEndTime || "-"}</td>
                      <td>{report.checkOutTime || "-"}</td>
                      <td>{report.status || "-"}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="no-results">
                    <td colSpan="7">No results match your search. Try a different name.</td>
                  </tr>
                )}
              </tbody>
            </table>
            
            {/* Pagination controls */}
            {!searchTerm && filteredReports.length > 0 && totalPages > 1 && (
              <div className="pagination-container">
                {/* <div className="pagination-info">
                  Showing {reports.length} of {totalItems} entries
                </div> */}
                <div className="pagination-controls">
                  <button 
                    className="pagination-arrow" 
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft size={18} />
                  </button>
                  
                  {renderPaginationNumbers()}
                  
                  <button 
                    className="pagination-arrow" 
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default SessionMonitoring