// TraineeReportModal.js
import React, { useState } from "react";
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

  React.useEffect(() => {
    if (selectedTrainee) {
      fetchTraineeReport(selectedTrainee.traineeId);
    }
  }, [selectedTrainee, selectedMonth, selectedYear]);

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>{`${selectedTrainee?.name}'s Report`}</h2>
        <button className="close-modal" onClick={onClose}>
          Close
        </button>
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
          </>
        ) : null}
      </div>
    </div>
  );
};

export default TraineeReportModal;