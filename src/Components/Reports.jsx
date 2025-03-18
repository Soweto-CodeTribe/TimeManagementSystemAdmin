"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import "./styling/ReportsScreen.css";
import DataLoader from "./dataLoader";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
const STATUS_COLORS = {
  Early: "#00C49F",
  "On time": "#0088FE",
  "Within grace period": "#FFBB28",
  Late: "#FF8042",
  Absent: "#FF4842",
};

// ReportsScreen Component
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

  // States for modal and report data
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  // States for dynamic month and year selection in modal
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // Fetch data for the table
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

  const fetchTraineeReport = async (traineeId) => {
    setReportLoading(true);
    setReportError(null);
    const month = selectedMonth || String(new Date().getMonth() + 1).padStart(2, "0");
    const year = selectedYear || new Date().getFullYear();
    try {
      const response = await axios.get(
        `https://timemanagementsystemserver.onrender.com/api/session/monthly-stats?traineeId=${traineeId}&month=${month}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReportData(response.data);
    } catch (err) {
      setReportError(err.message);
    } finally {
      setReportLoading(false);
    }
  };

  const handleTraineeSelect = (trainee) => {
    setSelectedTrainee(trainee);
    fetchTraineeReport(trainee.traineeId);
  };

  // const handleTabChange = (event, newValue) => {
  //   setTabValue(newValue);
  // };

  const prepareAttendanceData = () => {
    if (!reportData) return [];
    const { monthlyStats } = reportData;
    const attendanceRate = parseFloat(monthlyStats.attendanceRate.replace("%", ""));
    const attendedColor =
      attendanceRate >= 90
        ? "#00C49F" // Green
        : attendanceRate >= 75 && attendanceRate < 90
        ? "#FFBB28" // Orange
        : "#FF4842"; // Red
    return [
      // { name: "Attended", value: monthlyStats.attendedDays, fill: attendedColor },
      { name: "Absent", value: monthlyStats.absentDays, fill: "#FF4842" },
      { name: "Late", value: monthlyStats.lateDays, fill: "#FF8042" },
    ];
  };

  const prepareHoursWorkedData = () => {
    if (!reportData) return [];
    return reportData.attendedDates.map((day) => ({
      date: new Date(day.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      hours: day.hoursWorked,
      status: day.status,
    }));
  };

  const prepareStatusData = () => {
    if (!reportData) return [];
    const statusCounts = reportData.attendedDates.reduce((acc, day) => {
      acc[day.status] = (acc[day.status] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
    }));
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    );
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
      {/* Page Header */}
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Reports and Issues</h1>
          <p className="page-subtitle">View and manage reports and issues</p>
        </div>
        {/* Issue Management Table */}
        <div className="card">
          <div className="card-header">
            <h2 className="card-title">Issue Management Table</h2>
            <div className="card-actions">
              {/* Search Input */}
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search..."
                  className="search-input"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              {/* Filter Button and Dropdown */}
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
          {/* Table */}
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
          {/* Pagination */}
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
      {/* Modal for Trainee Report */}
      {selectedTrainee && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{`${selectedTrainee?.name}'s Report`}</h2>
            <button className="close-modal" onClick={() => setSelectedTrainee(null)}>
              Close
            </button>
            {reportLoading ? (
              <DataLoader />
            ) : reportError ? (
              <div className="error-message">Error loading report: {reportError}</div>
            ) : reportData ? (
              <>
                {/* Month and Year Selector */}
                <div className="filters">
                  <div className="filter-item">
                    <label htmlFor="month-select">Month:</label>
                    <select
                      id="month-select"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                      <option value="">All Months</option>
                      {[...Array(12).keys()].map((month) => (
                        <option key={month + 1} value={String(month + 1).padStart(2, "0")}>
                          {new Date(0, month).toLocaleString("default", { month: "long" })}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="filter-item">
                    <label htmlFor="year-select">Year:</label>
                    <select id="year-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
                      <option value="">All Years</option>
                      {[...Array(10).keys()].map((i) => {
                        const year = 2020 + i;
                        return (
                          <option key={year} value={year}>
                            {year}
                          </option>
                        );
                      })}
                    </select>
                  </div>
                  <button
                    className="apply-filters"
                    onClick={() => fetchTraineeReport(selectedTrainee.traineeId)}
                  >
                    Apply
                  </button>
                </div>
                {/* Report Summary */}
                <div className="report-summary">
                  <h3>
                    {`${reportData.monthlyStats.monthName} ${reportData.monthlyStats.year}`}
                  </h3>
                  <div className="summary-grid">
                    <div className="summary-item">
                      <p className="summary-label">Attendance Rate</p>
                      <p className="summary-value">{reportData.monthlyStats.attendanceRate}</p>
                    </div>
                    <div className="summary-item">
                      <p className="summary-label">Total Working Hours</p>
                      <p className="summary-value">{reportData.monthlyStats.totalWorkingHours} hrs</p>
                    </div>
                    <div className="summary-item">
                      <p className="summary-label">Average Daily Hours</p>
                      <p className="summary-value">{reportData.monthlyStats.averageDailyHours} hrs</p>
                    </div>
                  </div>
                </div>
                {/* Tabs for Charts */}
                <div className="tabs">
                  <button
                    className={`tab-button ${tabValue === 0 ? "active" : ""}`}
                    onClick={() => setTabValue(0)}
                  >
                    Attendance Overview
                  </button>
                  <button
                    className={`tab-button ${tabValue === 1 ? "active" : ""}`}
                    onClick={() => setTabValue(1)}
                  >
                    Hours Worked
                  </button>
                  <button
                    className={`tab-button ${tabValue === 2 ? "active" : ""}`}
                    onClick={() => setTabValue(2)}
                  >
                    Status Distribution
                  </button>
                  <button
                    className={`tab-button ${tabValue === 3 ? "active" : ""}`}
                    onClick={() => setTabValue(3)}
                  >
                    Attendance Records
                  </button>
                </div>
                {/* Attendance Overview */}
                {tabValue === 0 && (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={prepareAttendanceData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {prepareAttendanceData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {/* Hours Worked */}
                {tabValue === 1 && (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={prepareHoursWorkedData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="hours" fill="#00C49F" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
                {/* Status Distribution */}
                {tabValue === 2 && (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={prepareStatusData()}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={renderCustomizedLabel}
                        outerRadius={100}
                        dataKey="value"
                      >
                        {prepareStatusData().map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
                {/* Attendance Records */}
                {tabValue === 3 && (
                  <div className="table-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Check-In</th>
                          <th>Check-Out</th>
                          <th>Hours Worked</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportData.attendedDates.map((day, index) => (
                          <tr key={index} className={index % 2 === 0 ? "even-row" : "odd-row"}>
                            <td>{new Date(day.date).toLocaleDateString()}</td>
                            <td>{day.checkInTime}</td>
                            <td>{day.checkOutTime}</td>
                            <td>{day.hoursWorked.toFixed(2)}</td>
                            <td className={day.status.toLowerCase().replace(/\s+/g, "-")}>{day.status}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsScreen;