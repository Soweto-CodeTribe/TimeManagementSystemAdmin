"use client"
import { useState, useEffect } from "react"
import { FileText, Search, Filter, Info, ChevronLeft, ChevronRight } from "lucide-react"
import "./styling/Session.css"
import { useSelector } from 'react-redux'
import axios from "axios"
import DataLoader from "./dataLoader"

const SessionMonitoring = () => {
  const BASE_URL = "https://timemanagementsystemserver.onrender.com/"
  const token = useSelector((state) => state.auth.token)

  // State for API data
  const [summaryData, setSummaryData] = useState(null)
  const [reports, setReports] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState("") // User input
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("") // Debounced search term
  const [filterStatus, setFilterStatus] = useState("") // State for status filter
  const [filterDate, setFilterDate] = useState("") // State for date filter
  const [isFilterOpen, setIsFilterOpen] = useState(false) // State for filter visibility

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Debounce logic
  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm) // Update debounced search term after 500ms
    }, 1400)

    return () => clearTimeout(debounceTimer) // Clear timer on re-render
  }, [searchTerm])

  useEffect(() => {
    fetchData(currentPage)
  }, [token, currentPage, itemsPerPage, debouncedSearchTerm, filterStatus, filterDate])

  const fetchData = async (page = 1) => {
    setIsLoading(true)
    try {
      const response = await axios.get(`${BASE_URL}api/super-admin/daily`, {
        params: {
          page: page,
          limit: itemsPerPage,
          search: debouncedSearchTerm, // Use debounced search term
          status: filterStatus || undefined,
          date: filterDate || undefined,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const { summary = {}, reports: apiReports = [], currentPage: apiCurrentPage, totalPages: apiTotalPages } = response.data

      setSummaryData(summary)
      setReports(apiReports)
      setCurrentPage(Number(apiCurrentPage) || 1)
      setTotalPages(Number(apiTotalPages) || 1)
    } catch (error) {
      console.error("Error fetching daily report:", error)
      setError("Failed to load attendance data")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchTerm, filterStatus, filterDate])

  const formatTime = (timeString) => {
    if (!timeString) return "-"
    try {
      const [hours, minutes] = timeString.split(":")
      return `${hours.padStart(2, "0")}:${minutes.padStart(2, "0")}`
    } catch (error) {
      console.error("Error formatting time:", error)
      return "-"
    }
  }

  const renderPaginationNumbers = () => {
    const pageNumbers = []
    const maxVisiblePages = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
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
      )
    }
    return pageNumbers
  }

  const renderDate = () => {
    if (!summaryData?.date) return ""
    try {
      return new Date(summaryData.date).toLocaleDateString()
    } catch (error) {
      console.error("Error formatting date:", error)
      return ""
    }
  }

  if (isLoading) return <DataLoader />

  return (
    <div className="session-container">
      <h1 className="session-title">Session Monitoring</h1>
      <p className="session-description">
        Monitor check-ins, check-outs, and lunch breaks. Add time logs, update session attendance and activity.
      </p>

      <div className="metrics-grid">
        {[
          { label: 'Present', value: summaryData?.presentCount, color: 'blue' },
          { label: 'Total Trainees', value: summaryData?.totalTrainees, color: 'green' },
          { label: 'Absent', value: summaryData?.absentCount, color: 'red' },
          { label: 'Late Check-Ins', value: summaryData?.lateCount, color: 'yellow' }
        ].map((metric, index) => (
          <div className={`metric-card ${metric.color}`} key={index}>
            <div className="metric-header">
              <div className={`metric-icon ${metric.color}`}>
                <div className={`metric-dot ${metric.color}`}></div>
              </div>
              <span className="metric-label">{metric.label}</span>
            </div>
            <div className={`metric-value ${metric.color}`}>{metric.value || 0}</div>
          </div>
        ))}
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2 className="table-title">
            Daily Attendance Log
            {summaryData && <span className="table-date"> - {renderDate()}</span>}
          </h2>
          <div className="table-actions">
            {/* Filter Button */}
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
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="">All</option>
                      <option value="present">Present</option>
                      <option value="absent">Absent</option>
                      <option value="late">Late</option>
                    </select>
                  </div>
                  <div className="filter-group">
                    <label>Date:</label>
                    <input
                      type="date"
                      value={filterDate}
                      onChange={(e) => setFilterDate(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Search Input */}
            <div className="search-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search by ID or Name"
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
                  <th>ID</th>
                  <th>Name</th>
                  <th>Date</th>
                  <th>Check-In</th>
                  <th>Lunch Start</th>
                  <th>Lunch End</th>
                  <th>Check-Out</th>
                  <th>Status</th>
                  <th>Hours Worked</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report, index) => (
                  <tr key={index}>
                    <td>{report.traineeId || "-"}</td>
                    <td>{report.name || "N/A"}</td>
                    <td>{new Date(report.date).toLocaleDateString()}</td>
                    <td>{formatTime(report.checkInTime)}</td>
                    <td>{formatTime(report.lunchStartTime)}</td>
                    <td>{formatTime(report.lunchEndTime)}</td>
                    <td>{formatTime(report.checkOutTime)}</td>
                    <td className={`status-${report.status?.toLowerCase()}`}>{report.status || "-"}</td>
                    <td>{report.totalHoursWorked || "0"}</td>
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
    </div>
  )
}

export default SessionMonitoring