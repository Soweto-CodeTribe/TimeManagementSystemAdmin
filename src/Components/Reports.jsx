"use client";
import { useState, useEffect } from "react";
import { FileText, Search, Filter, Info, ChevronLeft, ChevronRight } from "lucide-react";
import "./styling/ReportsScreen.css";
import { useSelector } from "react-redux";
import axios from "axios";
import DataLoader from "../Components/dataLoader";
import TraineeReportModal from "../Components/ui/TraineeReportModal";

const ReportsScreen = () => {
  const BASE_URL = "https://timemanagementsystemserver.onrender.com/";
  const token = useSelector((state) => state.auth.token);
  const userRole = useSelector((state) => state.auth.role);
  const userLocation = localStorage.getItem('Location');

  // State for API data
  const [summaryData, setSummaryData] = useState(null);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Filter States
  const [searchTerm, setSearchTerm] = useState(""); // User input
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(""); // Debounced search term
  const [filterStatus, setFilterStatus] = useState(""); // Status filter
  const [filterDate, setFilterDate] = useState(""); // Date filter
  const [filterLocation, setFilterLocation] = useState("") // State for location filter
  const [isFilterOpen, setIsFilterOpen] = useState(false); // Filter visibility

  // Locations array
  const LOCATIONS = [
    "TIH", 
    "Tembisa", 
    "Soweto", 
    "Ga-rankuwa", 
    "Limpopo", 
    "KZN", 
    "Kimberly"
  ]


  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage] = useState(10);

  // State for selected trainee
  const [selectedTrainee, setSelectedTrainee] = useState(null);

  // Computed statistics from all reports (not just paginated ones)
  const [allReports, setAllReports] = useState([]);

  // Debounce Logic
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm); // Update debounced search term after 1400ms
    }, 1400);
    return () => clearTimeout(debounceTimer); // Clear timer on re-render
  }, [searchTerm]);

  // Fetch Data from API
  useEffect(() => {
    fetchData(currentPage);
    // Fetch all reports for accurate statistics once on component mount
    if (allReports.length === 0) {
      fetchAllReportsForStats();
    }
  }, [token, currentPage, itemsPerPage, debouncedSearchTerm, filterStatus, filterDate, 
    ...(userRole === 'super_admin' ?  [filterLocation]: [])]);

  // Function to fetch all reports for accurate statistics calculation
  const fetchAllReportsForStats = async () => {
    try {
      const response = await axios.get(`${BASE_URL}api/super-admin/daily`, {
        params: {
          limit: 1000, // Fetch a large number to get most/all reports
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.data && response.data.reports) {
        setAllReports(response.data.reports);
      }
    } catch (err) {
      console.error("Error fetching all reports for stats:", err);
      // This is a silent failure - we'll still try to calculate stats from paginated data
    }
  };

  // Calculate metrics dynamically based on available reports
  const calculateMetrics = () => {
    // Use all reports if available, otherwise use current page reports
    const dataSource = allReports.length > 0 ? allReports : reports;
    
    // If we have API-provided summary, use it
    if (summaryData && Object.keys(summaryData).length > 0) {
      return {
        totalReports: summaryData.totalReports || dataSource.length,
        resolvedReports: summaryData.resolvedReports || dataSource.filter(r => r.status?.toLowerCase() === 'resolved').length,
        pendingReports: summaryData.pendingReports || dataSource.filter(r => r.status?.toLowerCase() === 'pending').length,
        rejectedReports: summaryData.rejectedReports || dataSource.filter(r => r.status?.toLowerCase() === 'rejected').length
      };
    }
    
    // Otherwise calculate from available data
    return {
      totalReports: dataSource.length,
      resolvedReports: dataSource.filter(r => r.status?.toLowerCase() === 'resolved').length,
      pendingReports: dataSource.filter(r => r.status?.toLowerCase() === 'pending').length,
      rejectedReports: dataSource.filter(r => r.status?.toLowerCase() === 'rejected').length
    };
  };

  const fetchData = async (page = 1) => {
    setIsLoading(true);
    try {
      // Determine location filter based on user role
      const locationFilter = 
        userRole === 'super_admin' 
          ? (filterLocation || undefined)
          : userLocation; // For facilitators, use their own location
        
      const response = await axios.get(`${BASE_URL}api/super-admin/daily`, {
        params: {
          page: page,
          limit: itemsPerPage,
          search: debouncedSearchTerm, // Use debounced search term
          status: filterStatus || undefined,
          date: filterDate || undefined,
          // location: filterLocation || undefined,
          location: locationFilter,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { summary = {}, reports: apiReports = [], currentPage: apiCurrentPage, totalPages: apiTotalPages } = response.data;
      setSummaryData(summary);
      setReports(apiReports);
      setCurrentPage(Number(apiCurrentPage) || 1);
      setTotalPages(Number(apiTotalPages) || 1);
    } catch (err) {
      console.error("Error fetching reports:", err);
      setError("Failed to load reports data");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Page Change
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // Handle Status Filter Change
  const handleStatusChange = (value) => {
    setFilterStatus(value);
    setIsFilterOpen(false);
  };

  // Handle Date Filter Change
  const handleDateChange = (value) => {
    setFilterDate(value);
    setIsFilterOpen(false);
  };

  // Handle Location Filter Change
  const handleLocationChange = (value) => {
    setFilterLocation(value);
    setIsFilterOpen(false);
  };

  // Reset Pagination on Filter Change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, filterStatus, filterDate]);

  // Format Date Helper
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (err) {
      console.error("Error formatting date:", err);
      return "-";
    }
  };

  // Render Pagination Numbers
  const renderPaginationNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
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
          className={`pagination-number ${currentPage === i ? "active" : ""}`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  // Get current metrics
  const metrics = calculateMetrics();

  // Loading State
  if (isLoading) return <DataLoader />;

  return (
    <div className="session-container">
      {/* Title and Description */}
      <h1 className="session-title">Reports and Issues Monitoring</h1>
      <p className="session-description">
        Monitor and manage reports and issues submitted by trainees.
      </p>

      {/* Table Container */}
      <div className="table-container">
        <div className="table-header">
          <h2 className="table-title">Issue Management Table</h2>
          <div className="table-actions">
            {/* Filter Dropdown */}
            <div className="filter-wrapper">
              <button
                className="btn filter-btn"
                onClick={() => setIsFilterOpen(!isFilterOpen)}
              >
                <Filter className="btn-icon" />
                <span>Filter</span>
              </button>
              {isFilterOpen && (
                <div className="filter-dropdown">
                  <div className="filter-group">
                    <label>Status:</label>
                    <select
                      value={filterStatus}
                      // onChange={(e) => setFilterStatus(e.target.value)}
                      onChange={(e) => handleStatusChange(e.target.value)}
                    >
                      <option value="">All</option>
                      <option value="resolved">Resolved</option>
                      <option value="pending">Pending</option>
                      <option value="rejected">Rejected</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Date:</label>
                    <input
                      type="date"
                      value={filterDate}
                      // onChange={(e) => setFilterDate(e.target.value)}
                      onChange={(e) => handleDateChange(e.target.value)}
                    />
                  </div>
                  {/* Location Filter */}
                  {userRole === 'super_admin' && (
                  <div className="filter-group">
                    <label>Location:</label>
                    <select
                      value={filterLocation}
                      // onChange={(e) => setFilterLocation(e.target.value)}
                      onChange={(e) => handleLocationChange(e.target.value)}
                    >
                      <option value="">All Locations</option>
                      {LOCATIONS.map((location) => (
                        <option key={location} value={location}>
                          {location}
                        </option>
                      ))}
                    </select>
                  </div>
                  )}
                </div>
              )}
            </div>
            {/* Search Input */}
            <div className="search-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search by ID, Name, or Status"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
                disabled={reports.length === 0}
              />
            </div>
          </div>
        </div>
        <div className="export-actions">
          <button className="btn export-btn" disabled={reports.length === 0}>
            <FileText className="btn-icon" />
            <span>Export PDF</span>
          </button>
        </div>
        {error ? (
          <div className="error-container">
            <p className="error-message">{error}</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="noDataContainer">
            <Info size={48} />
            <h3>No Reports Available</h3>
            <p>
              {!error
                ? "No reports found for the selected filters. Adjust your search or filters."
                : "An error occurred while fetching data."}
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="attendance-table">
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
                {reports.map((report, index) => (
                  <tr key={index} onClick={() => setSelectedTrainee(report)}>
                    <td>{report.traineeId || "-"}</td>
                    <td>{report.name || "N/A"}</td>
                    <td className={`status-${report.status?.toLowerCase()}`}>{report.status || "-"}</td>
                    <td>{formatDate(report.date)}</td>
                    <td>
                      <button className="view-button">View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {totalPages > 1 && (
              <div className="pagination-container">
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
      {/* Modal for Viewing Report Details */}
      {selectedTrainee && (
        <TraineeReportModal
          selectedTrainee={selectedTrainee}
          onClose={() => setSelectedTrainee(null)}
        />
      )}
    </div>
  );
};

export default ReportsScreen;