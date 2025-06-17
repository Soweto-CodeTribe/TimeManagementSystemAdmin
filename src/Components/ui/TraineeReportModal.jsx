/* eslint-disable react-hooks/exhaustive-deps */
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
import "../styling/TraineeReportModal.css";
import DocumentViewer from "./DocumentViewer";

// Constants
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
const STATUS_COLORS = {
  Early: "#00C49F",
  "On time": "#0088FE",
  "Within grace period": "#FFBB28",
  Late: "#FF8042",
  Absent: "#FF4842",
};
const PERFORMANCE_COLORS = {
  attendance: { good: 90, average: 75 },
  punctuality: { good: 90, average: 75 },
};

const UPLOAD_STATUS_COLORS = {
  pending: "#FFBB28",
  approved: "#00C49F",
  rejected: "#FF4842",
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
  const [selectedMonth, setSelectedMonth] = useState(
    String(new Date().getMonth() + 1).padStart(2, "0")
  );
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [documents, setDocuments] = useState([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  
  // New state for absenteeism uploads
  const [uploadsData, setUploadsData] = useState([]);
  const [uploadsLoading, setUploadsLoading] = useState(false);
  const [uploadsError, setUploadsError] = useState(null);

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

  // Fetch Trainee Report
  const fetchTraineeReport = async () => {
    setReportLoading(true);
    setReportError(null);
    try {
      const response = await axios.get(
        `https://timemanagementsystemserver.onrender.com/api/session/monthly-stats?traineeId=${selectedTrainee.traineeId}&month=${selectedMonth}&year=${selectedYear}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReportData(response.data);
    } catch (err) {
      setReportError(err.message);
    } finally {
      setReportLoading(false);
    }
  };

  // Fetch Trainee Documents
  const fetchTraineeDocuments = async () => {
    setDocumentsLoading(true);
    try {
      const response = await axios.get(
        `https://timemanagementsystemserver.onrender.com/api/documents?traineeId=${selectedTrainee.traineeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setDocuments(response.data);
    } catch (err) {
      console.error("Error fetching documents:", err);
      setDocuments([]);
    } finally {
      setDocumentsLoading(false);
    }
  };

  // Fetch Trainee Uploads (Absenteeism Proofs)
  const fetchTraineeUploads = async () => {
    setUploadsLoading(true);
    setUploadsError(null);
    try {
      const response = await axios.get(
        `https://timemanagementsystemserver.onrender.com/api/trainee/${selectedTrainee.traineeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUploadsData(response.data);
    } catch (err) {
      setUploadsError(err.message);
      setUploadsData([]);
    } finally {
      setUploadsLoading(false);
    }
  };

  // Update Upload Status
  const updateUploadStatus = async (uploadId, status) => {
    try {
      await axios.put(
        `https://timemanagementsystemserver.onrender.com/api/update-uploads/${uploadId}/status`,
        { status, reviewNotes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state to reflect changes
      setUploadsData(prev => 
        prev.map(upload => 
          upload.id === uploadId ? { ...upload, status, reviewNotes } : upload
        )
      );
      
      setSelectedUpload(null);
      setReviewNotes("");
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  // View specific upload
  const handleViewUpload = (upload) => {
    setSelectedUpload(upload);
  };

  // Close upload details
  const handleCloseUploadDetails = () => {
    setSelectedUpload(null);
    setReviewNotes("");
  };

  // Data Preparation
  const prepareAttendanceData = () => {
    if (!reportData) return [];
    const { monthlyStats } = reportData;
    const presentDays =
      monthlyStats.presentDays || monthlyStats.totalWorkingDays - monthlyStats.absentDays;
    return [
      { name: "Present", value: presentDays, fill: "#00C49F" },
      { name: "Absent", value: monthlyStats.absentDays, fill: "#FF4842" },
    ];
  };

  const prepareHoursWorkedData = () => {
    if (!reportData) return [];
    return reportData.attendedDates
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .map((day) => {
        const hours = parseFloat(day.hoursWorked) || 0;
        let barColor;
        if (hours >= 8) barColor = "#4CAF50"; // Good - Green
        else if (hours >= 6) barColor = "#FF9800"; // Average - Orange
        else barColor = "#F44336"; // Poor - Red
        return {
          date: new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          hours: parseFloat(hours.toFixed(2)),
          status: day.status,
          barColor,
        };
      });
  };

  const prepareStatusData = () => {
    if (!reportData) return [];
    const statusCounts = reportData.attendedDates.reduce((acc, day) => {
      acc[day.status] = (acc[day.status] || 0) + 1;
      return acc;
    }, {});
    const statusPriority = ["Early", "On time", "Within grace period", "Late", "Absent"];
    return Object.entries(statusCounts)
      .map(([status, count]) => ({
        name: status,
        value: count,
        fill: STATUS_COLORS[status],
      }))
      .sort((a, b) => statusPriority.indexOf(a.name) - statusPriority.indexOf(b.name));
  };

  // Effects
  useEffect(() => {
    if (selectedTrainee) {
      fetchTraineeReport();
      fetchTraineeDocuments();
      fetchTraineeUploads();
    }
  }, [selectedTrainee, selectedMonth, selectedYear]);

  // Ensure tabValue is always valid
  useEffect(() => {
    if (tabValue > 3) setTabValue(0);
  }, [tabValue]);

  return (
    <div className="modal-overlay">
      <div className="modal-content" ref={modalRef}>
        <div className="modal-header">
          <h2>{`${selectedTrainee?.name}'s Report`}</h2>
          <button className="close-modal" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        {reportLoading && tabValue !== 3 ? (
          <DataLoader />
        ) : reportError && tabValue !== 3 ? (
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
                <select
                  id="year-select"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
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
              <button className="apply-filters" onClick={fetchTraineeReport}>
                Apply
              </button>
            </div>

            <div className="report-summary">
              <h3>{`${reportData.monthlyStats.monthName} ${reportData.monthlyStats.year}`}</h3>
              <div className="summary-grid">
                <div className="summary-item">
                  <p className="summary-label">Attendance Rate</p>
                  <p
                    className="summary-value"
                    style={{
                      color: getPerformanceColor(
                        "attendance",
                        parseFloat(reportData.monthlyStats.attendanceRateNumber)
                      ),
                    }}
                  >
                    {reportData.monthlyStats.attendanceRate}%
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
                  <p className="summary-value">{reportData.monthlyStats.averageDailyHours} hrs</p>
                </div>
              </div>
            </div>

            <div className="tabs">
              <button
                className={`tab-button ${tabValue === 0 ? "active" : ""}`}
                onClick={() => setTabValue(0)}
              >
                Hours Worked
              </button>
              <button
                className={`tab-button ${tabValue === 1 ? "active" : ""}`}
                onClick={() => setTabValue(1)}
              >
                Status Distribution
              </button>
              <button
                className={`tab-button ${tabValue === 2 ? "active" : ""}`}
                onClick={() => setTabValue(2)}
              >
                Attendance Records
              </button>
              <button
                className={`tab-button ${tabValue === 3 ? "active" : ""}`}
                onClick={() => setTabValue(3)}
              >
                Absenteeism Proofs
              </button>
            </div>

            {tabValue === 0 && (
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

            {tabValue === 1 && (
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

            {tabValue === 2 && (
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
                    {reportData.attendedDates.map((day, index) => {
                      const hours = parseFloat(day.hoursWorked) || 0;
                      const hoursColor = hours >= 8 ? "#4CAF50" : hours >= 6 ? "#FF9800" : "#F44336";
                      return (
                        <tr key={index} className={index % 2 === 0 ? "even-row" : "odd-row"}>
                          <td>
                            {new Date(day.date).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                            })}
                          </td>
                          <td>{day.checkInTime || "N/A"}</td>
                          <td>{day.checkOutTime || "N/A"}</td>
                          <td style={{ color: hoursColor, fontWeight: "bold" }}>{hours.toFixed(2)}</td>
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

            {tabValue === 3 && (
              <div className="absenteeism-container">
                {uploadsLoading ? (
                  <DataLoader />
                ) : uploadsError ? (
                  <div className="error-message">Error loading uploads: {uploadsError}</div>
                ) : selectedUpload ? (
                  <div className="upload-details">
                    <div className="upload-details-header">
                      <h3>Absenteeism Proof Details</h3>
                      <button className="backs-button" onClick={handleCloseUploadDetails}>
                        Back to List
                      </button>
                    </div>
                    <div className="upload-details-content">
                      <div className="detail-row">
                        <span className="detail-label">Date:</span>
                        <span className="detail-value">{formatDate(selectedUpload.date)}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Reason:</span>
                        <span className="detail-value">{selectedUpload.reason}</span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Status:</span>
                        <span className={`detail-value status-${selectedUpload.status}`}>
                          {selectedUpload.status}
                        </span>
                      </div>
                      <div className="detail-row">
                        <span className="detail-label">Submitted:</span>
                        <span className="detail-value">{formatDate(selectedUpload.createdAt)}</span>
                      </div>
                      {selectedUpload.reviewedAt && (
                        <div className="detail-row">
                          <span className="detail-label">Reviewed:</span>
                          <span className="detail-value">{formatDate(selectedUpload.reviewedAt)}</span>
                        </div>
                      )}
                      {selectedUpload.reviewNotes && (
                        <div className="detail-row">
                          <span className="detail-label">Review Notes:</span>
                          <span className="detail-value">{selectedUpload.reviewNotes}</span>
                        </div>
                      )}
                       <div className="document-preview-section">
        <h4>Document</h4>
        <DocumentViewer 
          documentUrl={selectedUpload.documentUrl} 
          fileName={`Absence-proof-${formatDate(selectedUpload.date)}`} 
        />
      </div>
                      <div className="update-status">
                        <h4>Update Status</h4>
                        <div className="status-form">
                          <div className="form-group">
                            <label>Review Notes:</label>
                            <textarea
                              value={reviewNotes}
                              onChange={(e) => setReviewNotes(e.target.value)}
                              placeholder="Enter review notes..."
                              rows={4}
                            />
                          </div>
                          <div className="status-buttons">
                            <button
                              className="status-button approve"
                              onClick={() => updateUploadStatus(selectedUpload.id, "approved")}
                            >
                              Approve
                            </button>
                            <button
                              className="status-button reject"
                              onClick={() => updateUploadStatus(selectedUpload.id, "rejected")}
                            >
                              Reject
                            </button>
                            <button
                              className="status-button pending"
                              onClick={() => updateUploadStatus(selectedUpload.id, "pending")}
                            >
                              Mark as Pending
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <h3>Absenteeism Proofs</h3>
                    {uploadsData.length === 0 ? (
                      <div className="no-uploads">
                        <p>No absenteeism proofs found for this trainee.</p>
                      </div>
                    ) : (
                      <table className="data-table uploads-table">
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Submitted</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {uploadsData.map((upload) => (
                            <tr key={upload.id} className={upload.status}>
                              <td>{formatDate(upload.date)}</td>
                              <td>{upload.reason}</td>
                              <td>
                                <span className={`status-badge ${upload.status}`}>
                                  {upload.status}
                                </span>
                              </td>
                              <td>{formatDate(upload.createdAt)}</td>
                              <td>
                                <button
                                  className="views-button"
                                  onClick={() => handleViewUpload(upload)}
                                >
                                  View & Review
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </>
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