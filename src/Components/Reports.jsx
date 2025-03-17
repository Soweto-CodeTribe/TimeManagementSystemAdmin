"use client"

import { useEffect, useState } from "react"
import axios from "axios"
import { useSelector } from "react-redux"
import "./styling/ReportsScreen.css"
import DataLoader from "./dataLoader"
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Tabs,
  Tab,
  CircularProgress,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Paper,
} from "@mui/material"
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
} from "recharts"

// Colors for charts
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"]
const STATUS_COLORS = {
  Early: "#00C49F",
  "On time": "#0088FE",
  "Within grace period": "#FFBB28",
  Late: "#FF8042",
  Absent: "#FF4842",
}

function TabPanel(props) {
  const { children, value, index, ...other } = props
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`chart-tabpanel-${index}`}
      aria-labelledby={`chart-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  )
}

const ReportsScreen = () => {
  const token = useSelector((state) => state.auth.token)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedTrainee, setSelectedTrainee] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterDate, setFilterDate] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const maxVisiblePages = 5

  // States for modal and report data
  const [reportData, setReportData] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState(null)
  const [tabValue, setTabValue] = useState(0)

  // States for dynamic month and year selection in modal
  const [selectedMonth, setSelectedMonth] = useState("")
  const [selectedYear, setSelectedYear] = useState("")

  // Fetch data for the table
  const fetchData = async (page) => {
    setLoading(true)
    try {
      let url = `https://timemanagementsystemserver.onrender.com/api/super-admin/daily?page=${page}`
      if (filterDate) url += `&date=${filterDate}`
      const response = await axios.get(url, { headers: { Authorization: `Bearer ${token}` } })
      setData(response.data)
      setCurrentPage(page)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(currentPage)
  }, [token, currentPage, filterDate])

  const handlePageChange = (page) => {
    if (page !== currentPage) {
      fetchData(page)
    }
  }

  const renderPaginationNumbers = () => {
    if (!data) return null
    const { totalPages } = data
    const pageNumbers = []
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-number ${currentPage === i ? "active" : ""}`}
        >
          {i}
        </button>,
      )
    }
    return pageNumbers
  }

  const filteredReports =
    data?.reports
      ?.filter((report) => report.name?.trim())
      .filter(
        (report) =>
          report.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          report.traineeId?.toString().includes(searchTerm) ||
          report.status?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
      .filter((report) => {
        if (!filterDate) return true
        const reportDate = new Date(report.date).toLocaleDateString()
        return reportDate === filterDate
      }) || []

  const fetchTraineeReport = async (traineeId) => {
    setReportLoading(true)
    setReportError(null)
    const month = selectedMonth || String(new Date().getMonth() + 1).padStart(2, "0")
    const year = selectedYear || new Date().getFullYear()
    try {
      const response = await axios.get(
        `https://timemanagementsystemserver.onrender.com/api/session/monthly-stats?traineeId=${traineeId}&month=${month}&year=${year}`,
        { headers: { Authorization: `Bearer ${token}` } },
      )
      setReportData(response.data)
    } catch (err) {
      setReportError(err.message)
    } finally {
      setReportLoading(false)
    }
  }

  const handleTraineeSelect = (trainee) => {
    setSelectedTrainee(trainee)
    fetchTraineeReport(trainee.traineeId)
  }

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  const prepareAttendanceData = () => {
    if (!reportData) return []
    const { monthlyStats } = reportData
    return [
      { name: "Attended", value: monthlyStats.attendedDays },
      { name: "Absent", value: monthlyStats.absentDays },
      { name: "Late", value: monthlyStats.lateDays },
    ]
  }

  const prepareHoursWorkedData = () => {
    if (!reportData) return []
    return reportData.attendedDates.map((day) => ({
      date: new Date(day.date).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      hours: day.hoursWorked,
      status: day.status,
    }))
  }

  const prepareStatusData = () => {
    if (!reportData) return []
    const statusCounts = reportData.attendedDates.reduce((acc, day) => {
      acc[day.status] = (acc[day.status] || 0) + 1
      return acc
    }, {})
    return Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count,
    }))
  }

  const RADIAN = Math.PI / 180
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + radius * Math.cos(-midAngle * RADIAN)
    const y = cy + radius * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? "start" : "end"} dominantBaseline="central">
        {`${name} ${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  if (loading) return <DataLoader />

  if (error)
    return (
      <div className="error-container">
        <p>Error: {error}</p>
      </div>
    )

  if (!data || filteredReports.length === 0)
    return (
      <div className="no-data-container">
        <p>No matching records found</p>
      </div>
    )

  return (
    <div className="WrapperContent">
      <div className="page-content">
        <div className="page-header">
          <h1 className="page-title">Reports and Issues</h1>
          <p className="page-subtitle">View and manage reports and issues</p>
        </div>
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

      {/* Modal for Trainee Report */}
      <Dialog open={!!selectedTrainee} onClose={() => setSelectedTrainee(null)} maxWidth="md" fullWidth>
        <DialogTitle>{`${selectedTrainee?.name}'s Report`}</DialogTitle>
        <DialogContent>
          {reportLoading ? (
            <DataLoader />
          ) : reportError ? (
            <div className="error-message">Error loading report: {reportError}</div>
          ) : reportData ? (
            <>
              {/* Month and Year Selector - Redesigned to be side by side */}
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={5}>
                  <FormControl fullWidth>
                    <InputLabel id="month-select-label">Month</InputLabel>
                    <Select
                      labelId="month-select-label"
                      id="month-select"
                      value={selectedMonth}
                      label="Month"
                      onChange={(e) => setSelectedMonth(e.target.value)}
                    >
                      <MenuItem value="">All Months</MenuItem>
                      {[...Array(12).keys()].map((month) => (
                        <MenuItem key={month + 1} value={String(month + 1).padStart(2, "0")}>
                          {new Date(0, month).toLocaleString("default", { month: "long" })}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={5}>
                  <FormControl fullWidth>
                    <InputLabel id="year-select-label">Year</InputLabel>
                    <Select
                      labelId="year-select-label"
                      id="year-select"
                      value={selectedYear}
                      label="Year"
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      <MenuItem value="">All Years</MenuItem>
                      {[...Array(10).keys()].map((i) => {
                        const year = 2020 + i
                        return (
                          <MenuItem key={year} value={year}>
                            {year}
                          </MenuItem>
                        )
                      })}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={2}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => fetchTraineeReport(selectedTrainee.traineeId)}
                    sx={{ height: "100%", width: "100%" }}
                  >
                    Apply
                  </Button>
                </Grid>
              </Grid>

              {/* Report Summary */}
              <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: "#f5f5f5" }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {`${reportData.monthlyStats.monthName} ${reportData.monthlyStats.year}`}
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={4}>
                    <Paper elevation={0} sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Attendance Rate
                      </Typography>
                      <Typography variant="h6">{reportData.monthlyStats.attendanceRate}</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper elevation={0} sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Total Working Hours
                      </Typography>
                      <Typography variant="h6">{reportData.monthlyStats.totalWorkingHours} hrs</Typography>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <Paper elevation={0} sx={{ p: 2, textAlign: "center" }}>
                      <Typography variant="subtitle2" color="textSecondary">
                        Average Daily Hours
                      </Typography>
                      <Typography variant="h6">{reportData.monthlyStats.averageDailyHours} hrs</Typography>
                    </Paper>
                  </Grid>
                </Grid>
              </Paper>

              {/* Tabs for Charts */}
              <Box sx={{ width: "100%", mt: 2 }}>
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="report charts"
                  variant="scrollable"
                  scrollButtons="auto"
                >
                  <Tab label="Attendance Overview" />
                  <Tab label="Hours Worked" />
                  <Tab label="Status Distribution" />
                  <Tab label="Attendance Records" />
                </Tabs>
              </Box>

              {/* Attendance Overview */}
              <TabPanel value={tabValue} index={0}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={prepareAttendanceData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {prepareAttendanceData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </TabPanel>

              {/* Hours Worked */}
              <TabPanel value={tabValue} index={1}>
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
              </TabPanel>

              {/* Status Distribution */}
              <TabPanel value={tabValue} index={2}>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={prepareStatusData()}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={renderCustomizedLabel}
                      outerRadius={100}
                      fill="#8884d8"
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
              </TabPanel>

              {/* Attendance Records */}
              <TabPanel value={tabValue} index={3}>
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
              </TabPanel>
            </>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTrainee(null)}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  )
}

export default ReportsScreen

