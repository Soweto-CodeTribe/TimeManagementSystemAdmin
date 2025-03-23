import React, { useState, useEffect } from "react";
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

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];
const STATUS_COLORS = {
  Early: "#00C49F",
  "On time": "#0088FE",
  "Within grace period": "#FFBB28",
  Late: "#FF8042",
  Absent: "#FF4842",
};

const UPLOAD_STATUS_COLORS = {
  pending: "#FFBB28",
  approved: "#00C49F",
  rejected: "#FF4842",
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

const TraineeReportModal = ({ selectedTrainee, onClose }) => {
  const token = useSelector((state) => state.auth.token);
  const [reportData, setReportData] = useState(null);
  const [reportLoading, setReportLoading] = useState(false);
  const [reportError, setReportError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  
  // New state for absenteeism uploads
  const [uploadsData, setUploadsData] = useState([]);
  const [uploadsLoading, setUploadsLoading] = useState(false);
  const [uploadsError, setUploadsError] = useState(null);
  const [selectedUpload, setSelectedUpload] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  
  // Fetch trainee attendance report
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

  // New function to fetch trainee's absenteeism proofs
  const fetchTraineeUploads = async (traineeId) => {
    setUploadsLoading(true);
    setUploadsError(null);
    try {
      const response = await axios.get(
        `https://timemanagementsystemserver.onrender.com/api/trainee/${traineeId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setUploadsData(response.data);
    } catch (err) {
      setUploadsError(err.message);
    } finally {
      setUploadsLoading(false);
    }
  };

  // New function to update upload status
  const updateUploadStatus = async (uploadId, status) => {
    try {
      await axios.put(
        `https://timemanagementsystemserver.onrender.com/api/update-uploads/${uploadId}/status`,
        {
          status,
          reviewNotes
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local state to reflect changes
      setUploadsData(prev => 
        prev.map(upload => 
          upload.id === uploadId ? { ...upload, status, reviewNotes } : upload
        )
      );
      
      // Close detail view
      setSelectedUpload(null);
      setReviewNotes("");
      
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const prepareAttendanceData = () => {
    if (!reportData) return [];
    const { monthlyStats } = reportData;
    const attendanceRate = parseFloat(monthlyStats.attendanceRate.replace("%", ""));
    return [
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

  // Load both reports and uploads when trainee is selected or filters change
  useEffect(() => {
    if (selectedTrainee) {
      fetchTraineeReport(selectedTrainee.traineeId);
      fetchTraineeUploads(selectedTrainee.traineeId);
    }
  }, [selectedTrainee, selectedMonth, selectedYear]);

  // Format date helper
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (err) {
      console.error("Error formatting date:", err);
      return "-";
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

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{`${selectedTrainee?.name}'s Report`}</h2>
        <button className="close-modal" onClick={onClose}>
          Close
        </button>
        {(reportLoading || uploadsLoading) && tabValue !== 4 ? (
          <DataLoader />
        ) : reportError && tabValue !== 4 ? (
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
                onClick={() => {
                  fetchTraineeReport(selectedTrainee.traineeId);
                  fetchTraineeUploads(selectedTrainee.traineeId);
                }}
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
                Absenteeism Proofs
              </button>
            </div>
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
            {tabValue === 4 && (
              <div className="absenteeism-container">
                {uploadsLoading ? (
                  <DataLoader />
                ) : uploadsError ? (
                  <div className="error-message">Error loading uploads: {uploadsError}</div>
                ) : selectedUpload ? (
                  <div className="upload-details">
                    <div className="upload-details-header">
                      <h3>Absenteeism Proof Details</h3>
                      <button className="back-button" onClick={handleCloseUploadDetails}>
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
                      <div className="document-preview">
                        <h4>Document</h4>
                        <a href={selectedUpload.documentUrl} target="_blank" rel="noopener noreferrer" className="document-link">
                          View Document
                        </a>
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
                                  className="view-button"
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