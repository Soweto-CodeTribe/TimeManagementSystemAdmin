// ReportsScreen.js
"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "./styling/ReportsScreen.css";
import DataLoader from "../Components/dataLoader";
import TraineeReportModal from "../Components/ui/TraineeReportModal";

const ReportsScreen = () => {
  const token = useSelector((state) => state.auth.token);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const maxVisiblePages = 5;

  const fetchData = async (page) => {
    setLoading(true);
    try {
      let url = `https://timemanagementsystemserver.onrender.com/api/super-admin/daily?page=${page}`;
      if (filterDate) url += `&date=${filterDate}`;
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } });
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, currentPage, filterDate]);

  const handlePageChange = (page) => {
    if (page !== currentPage) {
      fetchData(page);
    }
  };

  const renderPaginationNumbers = () => {
    if (!data) return null;
    const { totalPages } = data;
    const pageNumbers = [];
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
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

  const filteredReports =
    data?.reports
      ?.filter((report) => report.name?.trim())
      .filter(
        (report) =>
          report.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.traineeId?.toString().includes(searchTerm) ||
          report.status?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter((report) => {
        if (!filterDate) return true;
        const reportDate = new Date(report.date).toLocaleDateString();
        return reportDate === filterDate;
      }) || [];

  const handleTraineeSelect = (trainee) => {
    setSelectedTrainee(trainee);
  };

  if (loading) return <DataLoader />;
  if (error)
    return (
      <div className="error-container">
        <p>Error: {error}</p>
      </div>
    );
  if (!data || filteredReports.length === 0)
    return (
      <div className="no-data-container">
        <p>No matching records found</p>
      </div>
    );

  return (
    <div className="wrapper-content">
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Reports and Issues</h1>
          <p className="page-subtitle">View and manage reports and issues</p>
        </div>
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Issue Management Table</h2>
            <div className="card-actions">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="filter-wrapper">
                <button className="filter-button" onClick={() => setIsFilterOpen(!isFilterOpen)}>
                  <span>Filter</span>
                </button>
                {isFilterOpen && (
                  <div className="filter-dropdown">
                    <label htmlFor="filter-date">Filter by Date:</label>
                    <input
                      type="date"
                      id="filter-date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
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
                {filteredReports.map((report, index) => (
                  <tr key={report.traineeId} onClick={() => handleTraineeSelect(report)}>
                    <td>{report.traineeId || `REP-${index + 1}`}</td>
                    <td>{report.name || "N/A"}</td>
                    <td className={report.status.toLowerCase()}>{report.status || "N/A"}</td>
                    <td>{new Date(report.date).toLocaleDateString()}</td>
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
            ></button>
            {renderPaginationNumbers()}
            <button
              className="pagination-arrow"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === data.totalPages}
            ></button>
          </div>
        </div>
      </div>
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