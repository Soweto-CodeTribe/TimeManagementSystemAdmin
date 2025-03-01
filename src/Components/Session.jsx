"use client"

import { useState } from "react"
import { FileText, Search, Filter } from "lucide-react"
import "./styling/Session.css"

const SessionMonitoring = () => {

  /*
    const BASE_URL = "https://timemanagementsystemserver.onrender.com/"
  const token = useSelector((state) => state.auth.token);
  
  // Create state to store API data
  const [employees, setEmployees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const response = await axios.get(`${BASE_URL}/api/session/daily-report`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        // Store API data in state
        setEmployees(response.data);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching daily report:", error);
        setError("Failed to load employee data");
        setIsLoading(false);
      }
    };

    if (token) {
      fetchData();
    }
  }, [token]);
  */
  // Sample data with the specified columns
  const employees = [
    {
      name: "Nqobile",
      id: "564641568",
      status: "Present",
      checkInTime: "10:02am",
      lunchIn: "12:30pm",
      lunchOut: "01:30pm",
      checkOutTime: "06:12pm",
      date: "20-02-2023",
    },
    {
      name: "Gloria",
      id: "1568564964",
      status: "Present",
      checkInTime: "10:10am",
      lunchIn: "12:35pm",
      lunchOut: "01:35pm",
      checkOutTime: "06:15pm",
      date: "20-02-2023",
    },
    {
      name: "Martin",
      id: "1416584651",
      status: "Present",
      checkInTime: "10:08am",
      lunchIn: "12:30pm",
      lunchOut: "01:30pm",
      checkOutTime: "06:30pm",
      date: "20-02-2023",
    },
    {
      name: "Busisiwe",
      id: "8641648",
      status: "Present",
      checkInTime: "10:12am",
      lunchIn: "12:40pm",
      lunchOut: "01:40pm",
      checkOutTime: "06:24pm",
      date: "20-02-2023",
    },
    {
      name: "Nhlakanipho",
      id: "634855",
      status: "Present",
      checkInTime: "10:08am",
      lunchIn: "12:30pm",
      lunchOut: "01:30pm",
      checkOutTime: "06:18pm",
      date: "20-02-2023",
    },
  ]

  const [searchTerm, setSearchTerm] = useState("")

  // Filter employees based on search term
  const filteredEmployees = employees.filter((employee) =>
    employee.name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="session-container">
      <h1 className="session-title">Session Monitoring</h1>
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
            <span className="metric-label">Total Check-Ins</span>
          </div>
          <div className="metric-value blue">5</div>
        </div>

        <div className="metric-card green">
          <div className="metric-header">
            <div className="metric-icon green">
              <div className="metric-dot green"></div>
            </div>
            <span className="metric-label">Total Check-Outs</span>
          </div>
          <div className="metric-value green">0</div>
        </div>

        <div className="metric-card red">
          <div className="metric-header">
            <div className="metric-icon red">
              <div className="metric-dot red"></div>
            </div>
            <span className="metric-label">Missed Check-Ins</span>
          </div>
          <div className="metric-value red">0%</div>
        </div>

        <div className="metric-card yellow">
          <div className="metric-header">
            <div className="metric-icon yellow">
              <div className="metric-dot yellow"></div>
            </div>
            <span className="metric-label">Late Check-Ins</span>
          </div>
          <div className="metric-value yellow">0</div>
        </div>
      </div>

      {/* Daily Attendance Log */}
      <div className="table-container">
        <div className="table-header">
          <h2 className="table-title">Daily Attendance Log</h2>
          <div className="table-actions">
            <button className="btn filter-btn">
              <Filter className="btn-icon" />
              <span>Filter</span>
            </button>
            <div className="search-wrapper">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div>

        <div className="export-actions">
          <button className="btn export-btn">
            <FileText className="btn-icon" />
            <span>Export PDF</span>
          </button>
          {/* <button className="btn export-btn">
            <Download className="btn-icon" />
            <span>Import CSV</span>
          </button> */}
        </div>

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
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.map((employee, index) => (
                <tr key={index}>
                  <td>{employee.name}</td>
                  <td>{employee.id}</td>
                  <td>{employee.checkInTime}</td>
                  <td>{employee.lunchIn}</td>
                  <td>{employee.lunchOut}</td>
                  <td>{employee.checkOutTime}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {/* <div className="pagination">
          <div className="pagination-list">
            {[1, 2, 3, 4, 5].map((page) => (
              <button key={page} className={`pagination-item ${page === 5 ? "active" : ""}`}>
                {page}
              </button>
            ))}
          </div>
        </div> */}
      </div>
    </div>
  )
}

export default SessionMonitoring

