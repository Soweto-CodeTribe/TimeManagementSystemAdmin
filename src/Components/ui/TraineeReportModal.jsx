/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useSelector } from "react-redux";
import DataLoader from "../dataLoader";
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
import { FaTimes, FaFilePdf, FaFileWord, FaFileExcel } from "react-icons/fa";
import '../styling/TraineeReportModal.css';

// Constants
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
const STATUS_COLORS = {
  Early: "#00C49F",
  "On time": "#0088FE",
  "Within grace period": "#FFBB28",
  Late: "#FF8042",
  Absent: "#FF4842",
};

// Performance color thresholds
const PERFORMANCE_COLORS = {
  attendance: {
    good: 90, // >= 90% is good (green)
    average: 75, // >= 75% is average (orange)
    // Below 75% is poor (red)
  },
  punctuality: {
    good: 90, // >= 90% on time is good
    average: 75, // >= 75% on time is average
    // Below 75% is poor
  }
};

const RADIAN = Math.PI / 180;

// Helper Functions
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    return new Date(dateString).toLocaleDateString();
  } catch (err) {
    console.error("Error formatting date:", err);
    return "-";
  }
};

const getPerformanceColor = (type, value) => {
  const thresholds = PERFORMANCE_COLORS[type];
  if (value >= thresholds.good) return "#4CAF50"; // Good - Green
  if (value >= thresholds.average) return "#FF9800"; // Average - Orange
  return "#F44336"; // Poor - Red
};

const getDocumentIcon = (type) => {
  switch (type) {
    case "pdf":
      return <FaFilePdf className="document-icon pdf" />;
    case "docx":
      return <FaFileWord className="document-icon docx" />;
    case "xlsx":
      return <FaFileExcel className="document-icon xlsx" />;
    default:
      return null;
  }
};

const TraineeReportModal = ({ selectedTrainee, onClose }) => {
  const modalRef = useRef(null);
  const token = useSelector((state) => state.auth.token);

  // State Management
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState(String(new Date().getMonth() + 1).padStart(2, "0"));
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);

  // Handle click outside to close modal
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const fetchTraineeReport = async (traineeId) => {
    setReportLoading(true);
    setReportError(null);
    const month = selectedMonth || String(new Date().getMonth() + 1).padStart(2, "0");
    const year = selectedYear || new Date().getFullYear();
    try {
      const response = await fetchFunction();
      setData(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // const fetchTraineeReport = () =>
  //   axios.get(
  //     `https://timemanagementsystemserver.onrender.com/api/session/monthly-stats?traineeId=${selectedTrainee.traineeId}&month=${selectedMonth}&year=${selectedYear}`,
  //     { headers: { Authorization: `Bearer ${token}` } }
  //   );

  const fetchTraineeUploads = () =>
    axios.get(`https://timemanagementsystemserver.onrender.com/api/trainee/${selectedTrainee.traineeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

  const fetchTraineeDocuments = () =>
    new Promise((resolve) =>
      setTimeout(() => resolve({ data: MOCK_DOCUMENTS }), 800)
    );

  // Handlers
  const handleViewUpload = (upload) => setSelectedUpload(upload);
  const handleCloseUploadDetails = () => {
    setSelectedUpload(null);
    setReviewNotes("");
  };

  const updateUploadStatus = async (uploadId, status) => {
    try {
      await axios.put(
        `https://timemanagementsystemserver.onrender.com/api/update-uploads/${uploadId}/status`,
        { status, reviewNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Sort attended dates by date
      if (response.data.attendedDates) {
        response.data.attendedDates.sort((a, b) => new Date(a.date) - new Date(b.date));
      }
      
      // Ensure numeric values for calculations
      if (response.data.monthlyStats) {
        const stats = response.data.monthlyStats;
        stats.totalWorkingHours = parseFloat(stats.totalWorkingHours) || 0;
        stats.averageDailyHours = parseFloat(stats.averageDailyHours) || 0;
        stats.attendanceRate = stats.attendanceRate ? stats.attendanceRate.replace("%", "") : "0";
        stats.attendanceRateNumber = parseFloat(stats.attendanceRate) || 0;
        
        // Calculate punctuality rate
        const totalDays = response.data.attendedDates.length;
        if (totalDays > 0) {
          const onTimeDays = response.data.attendedDates.filter(
            day => day.status === "Early" || day.status === "On time"
          ).length;
          stats.punctualityRate = (onTimeDays / totalDays * 100).toFixed(1);
        } else {
          stats.punctualityRate = "0";
        }
      }
      
      setReportData(response.data);
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  // const fetchTraineeDocuments = async (traineeId) => {
  //   // Commented out actual API call
  //   /*
  //   setDocumentsLoading(true);
  //   try {
  //     const response = await axios.get(
  //       `https://timemanagementsystemserver.onrender.com/api/documents?traineeId=${traineeId}`,
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
  //     setDocuments(response.data);
  //   } catch (err) {
  //     console.error("Error fetching documents:", err);
  //     setDocuments([]);
  //   } finally {
  //     setDocumentsLoading(false);
  //   }
  //   */
    
  //   // Mock data
  //   setDocumentsLoading(true);
  //   setTimeout(() => {
  //     setDocuments([
  //       { id: 1, name: "Monthly Report.pdf", type: "pdf", uploadDate: "2025-03-01", size: "2.4 MB" },
  //       { id: 2, name: "Training Certificate.docx", type: "docx", uploadDate: "2025-02-15", size: "1.1 MB" },
  //       { id: 3, name: "Performance Review.xlsx", type: "xlsx", uploadDate: "2025-03-10", size: "0.8 MB" },
  //       { id: 4, name: "Attendance Summary.pdf", type: "pdf", uploadDate: "2025-03-15", size: "1.5 MB" },
  //       { id: 5, name: "Project Documentation.docx", type: "docx", uploadDate: "2025-02-28", size: "3.2 MB" },
  //     ]);
  //     setDocumentsLoading(false);
  //   }, 800);
  // };

  const getPerformanceColor = (type, value) => {
    const thresholds = PERFORMANCE_COLORS[type];
    if (value >= thresholds.good) return "#4CAF50"; // Good - Green
    if (value >= thresholds.average) return "#FF9800"; // Average - Orange
    return "#F44336"; // Poor - Red
  };

  // Data Preparation
  const prepareAttendanceData = () => {
    if (!reportData) return [];
    const { monthlyStats } = reportData;
    const presentDays = monthlyStats.presentDays || (monthlyStats.totalWorkingDays - monthlyStats.absentDays);
    return [
      { name: "Present", value: presentDays, fill: "#00C49F" },
      { name: "Absent", value: monthlyStats.absentDays, fill: "#FF4842" },
    ];
  };

  const prepareHoursWorkedData = () => {
    if (!reportData) return [];
    // Sort by date and format
    return reportData.attendedDates
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((day) => {
        const hours = parseFloat(day.hoursWorked) || 0;
        let barColor;
        
        // Color code based on hours worked
        if (hours >= 8) barColor = "#4CAF50"; // Good - Green
        else if (hours >= 6) barColor = "#FF9800"; // Average - Orange
        else barColor = "#F44336"; // Poor - Red
        
        return {
          date: new Date(day.date).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          }),
          hours: parseFloat(hours.toFixed(2)),
          status: day.status,
          barColor
        };
      });
  };

  const prepareStatusData = () => {
    if (!reportData) return [];
    const statusCounts = reportData.attendedDates.reduce((acc, day) => {
      acc[day.status] = (acc[day.status] || 0) + 1;
      return acc;
    }, {});
    
    // Sort status by priority
    const statusPriority = ["Early", "On time", "Within grace period", "Late", "Absent"];
    return Object.entries(statusCounts)
      .map(([status, count]) => ({
        name: status,
        value: count,
        fill: STATUS_COLORS[status],
      }))
      .sort((a, b) => statusPriority.indexOf(a.name) - statusPriority.indexOf(b.name));
  };

  const getDocumentIcon = (type) => {
    switch (type) {
      case "pdf":
        return <FaFilePdf className="document-icon pdf" />;
      case "docx":
        return <FaFileWord className="document-icon docx" />;
      case "xlsx":
        return <FaFileExcel className="document-icon xlsx" />;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (selectedTrainee) {
      fetchTraineeReport(selectedTrainee.traineeId);
    }
  }, [selectedTrainee]); // Re-run when selectedTrainee changes

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <h2>{`${selectedTrainee?.name}'s Report`}</h2>
          <button className="close-modal" onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        {reportLoading ? (
          <DataLoader />
        ) : reportError ? (
          <div className="error-message">Error loading report: {reportError}</div>
        ) : reportData ? (
          <>
            <div className="filters">
              <div className="filter-item">
                <label htmlFor="month-select">Month:</label>
                <select
                  id="month-select"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
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
                  {[...Array(10).keys()].map((i) => {
                    const year = new Date().getFullYear() - 5 + i;
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
            <div className="report-summary">
              <h3>
                {`${reportData.monthlyStats.monthName} ${reportData.monthlyStats.year}`}
              </h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <p className="summary-label">Attendance Rate</p>
                  <p 
                    className="summary-value" 
                    style={{ 
                      color: getPerformanceColor(
                        'attendance', 
                        parseFloat(reportData.monthlyStats.attendanceRateNumber)
                      ) 
                    }}
                  >
                    {reportData.monthlyStats.attendanceRate}%
                  </p>
                </div>
                <div className="summary-item">
                  <p className="summary-label">Punctuality Rate</p>
                  <p 
                    className="summary-value"
                    style={{ 
                      color: getPerformanceColor(
                        'punctuality', 
                        parseFloat(reportData.monthlyStats.punctualityRate)
                      ) 
                    }}
                  >
                    {reportData.monthlyStats.punctualityRate}%
                  </p>
                </div>
                <div className="summary-item">
                  <p className="summary-label">Total Working Hours</p>
                  <p className="summary-value">
                    {parseFloat(reportData.monthlyStats.totalWorkingHours).toFixed(1)} hrs
                  </p>
                </div>
                <div className="summary-item">
                  <p className="summary-label">Average Daily Hours</p>
                  <p className="summary-value">
                    {parseFloat(reportData.monthlyStats.averageDailyHours).toFixed(1)} hrs
                  </p>
                </div>
                <div className="summary-item">
                  <p className="summary-label">Absent Days</p>
                  <p 
                    className="summary-value"
                    style={{ 
                      color: reportData.monthlyStats.absentDays > 0 ? "#F44336" : "#4CAF50" 
                    }}
                  >
                    {reportData.monthlyStats.absentDays}
                  </p>
                </div>
              </div>
            </div>
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
              <button
                className={`tab-button ${tabValue === 4 ? "active" : ""}`}
                onClick={() => setTabValue(4)}
              >
                Documents
              </button>
            </div>
            {tabValue === 0 && (
              <div className="chart-container">
                <h4>Present vs. Absent Days</h4>
                {/* <div className="performance-indicator">
                  <div className="indicator-label">
                    Attendance Performance: 
                  </div>
                  <div 
                    className="indicator-status"
                    style={{ 
                      backgroundColor: getPerformanceColor(
                        'attendance', 
                        parseFloat(reportData.monthlyStats.attendanceRateNumber)
                      ) 
                    }}
                  >
                    {
                      parseFloat(reportData.monthlyStats.attendanceRateNumber) >= PERFORMANCE_COLORS.attendance.good
                        ? "GOOD"
                        : parseFloat(reportData.monthlyStats.attendanceRateNumber) >= PERFORMANCE_COLORS.attendance.average
                          ? "AVERAGE"
                          : "POOR"
                    }
                  </div>
                </div> */}
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
                    <Tooltip formatter={(value) => [`${value} days`, null]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {tabValue === 1 && (
              <div className="chart-container">
                <h4>Daily Hours Worked</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={prepareHoursWorkedData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 'dataMax + 1']} label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                    <Tooltip formatter={(value) => [`${value} hours`, 'Hours Worked']} />
                    <Legend />
                    <Bar 
                      dataKey="hours" 
                      name="Hours Worked" 
                      radius={[4, 4, 0, 0]}
                      fill="#00C49F"
                    >
                      {prepareHoursWorkedData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.barColor} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="chart-legend">
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: "#4CAF50" }}></span>
                    <span>8+ hours (Good)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: "#FF9800" }}></span>
                    <span>6-8 hours (Average)</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color" style={{ backgroundColor: "#F44336" }}></span>
                    <span>&lt;6 hours (Poor)</span>
                  </div>
                </div>
              </div>
            )}
            {tabValue === 2 && (
              <div className="chart-container">
                <h4>Attendance Status Distribution</h4>
                <div className="performance-indicator">
                  <div className="indicator-label">
                    Punctuality Performance: 
                  </div>
                  <div 
                    className="indicator-status"
                    style={{ 
                      backgroundColor: getPerformanceColor(
                        'punctuality', 
                        parseFloat(reportData.monthlyStats.punctualityRate)
                      ) 
                    }}
                  >
                    {
                      parseFloat(reportData.monthlyStats.punctualityRate) >= PERFORMANCE_COLORS.punctuality.good
                        ? "GOOD"
                        : parseFloat(reportData.monthlyStats.punctualityRate) >= PERFORMANCE_COLORS.punctuality.average
                          ? "AVERAGE"
                          : "POOR"
                    }
                  </div>
                </div>
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
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} days`, null]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
            {tabValue === 3 && (
              <div className="table-container">
                <h4>Daily Attendance Records</h4>
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
                    {reportData.attendedDates
                      .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort by most recent
                      .map((day, index) => {
                        const hours = parseFloat(day.hoursWorked) || 0;
                        let hoursColor;
                        
                        // Color code based on hours worked
                        if (hours >= 8) hoursColor = "#4CAF50"; // Good - Green
                        else if (hours >= 6) hoursColor = "#FF9800"; // Average - Orange
                        else hoursColor = "#F44336"; // Poor - Red
                        
                        return (
                          <tr key={index} className={index % 2 === 0 ? "even-row" : "odd-row"}>
                            <td>{new Date(day.date).toLocaleDateString("en-US", { weekday: 'short', month: 'short', day: 'numeric' })}</td>
                            <td>{day.checkInTime || "N/A"}</td>
                            <td>{day.checkOutTime || "N/A"}</td>
                            <td style={{ color: hoursColor, fontWeight: 'bold' }}>
                              {hours.toFixed(2)}
                            </td>
                            <td>
                              <span 
                                className="status-badge"
                                style={{ backgroundColor: STATUS_COLORS[day.status] || "#ccc" }}
                              >
                                {day.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            )}
            {tabValue === 4 && (
              <div className="documents-container">
                <h4>Trainee Documents</h4>
                {documentsLoading ? (
                  <DataLoader />
                ) : documents.length > 0 ? (
                  <table className="documents-table">
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Document Name</th>
                        <th>Upload Date</th>
                        <th>Size</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {documents
                        .sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate))
                        .map((doc) => (
                          <tr key={doc.id} className={doc.id % 2 === 0 ? "even-row" : "odd-row"}>
                            <td>{getDocumentIcon(doc.type)}</td>
                            <td>{doc.name}</td>
                            <td>{new Date(doc.uploadDate).toLocaleDateString()}</td>
                            <td>{doc.size}</td>
                            <td>
                              <button className="view-document">View</button>
                              <button className="download-document">Download</button>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="no-documents">
                    <p>No documents available for this trainee.</p>
                  </div>
                )}
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
};

export default TraineeReportModal;