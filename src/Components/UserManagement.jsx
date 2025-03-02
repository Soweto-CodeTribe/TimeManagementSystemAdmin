import { useState } from "react"
import { Search, Filter, Download, Upload, Plus } from "lucide-react"
import './styling/UserManagement.css'
import { useNavigate } from "react-router-dom"
const UserManagement = () => {
  const navigate = useNavigate()
  // Sample data for the tables
  const [users] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", role: "Trainee", lastCheckIn: "3 days ago", status: "" },
    { id: 2, name: "Jane Doe", email: "jane@example.com", role: "Trainee", lastCheckIn: "5 days ago", status: "" },
    { id: 3, name: "John Smith", email: "smith@example.com", role: "Trainee", lastCheckIn: "2 days ago", status: "" },
    { id: 4, name: "Jane Smith", email: "jsmith@example.com", role: "Trainee", lastCheckIn: "3 days ago", status: "" },
    { id: 5, name: "John Brown", email: "jbrown@example.com", role: "Trainee", lastCheckIn: "5 days ago", status: "" },
  ])
  const [guests] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", phone: "01234567890", status: "active", lastCheckIn: "" },
    { id: 2, name: "Jane Doe", email: "jane@example.com", phone: "Trainee", status: "", lastCheckIn: "5 days ago" },
    { id: 3, name: "John Smith", email: "smith@example.com", phone: "Trainee", status: "", lastCheckIn: "2 days ago" },
    { id: 4, name: "Jane Smith", email: "jsmith@example.com", phone: "Trainee", status: "", lastCheckIn: "3 days ago" },
    { id: 5, name: "John Brown", email: "jbrown@example.com", phone: "Trainee", status: "", lastCheckIn: "5 days ago" },
  ])
  const [searchTerm, setSearchTerm] = useState("")
  // const [userForm, setUserForm] = useState(false)
  return (
    <div className="user-management-container">
      <div className="header">
        <div className="title-section">
          <h1>User management</h1>
          <p className="subtitle">Manage your trainees and guests and control permissions here</p>
        </div>
        <button className="add-user-btn" onClick={()=> navigate('/add-user')}>
          <Plus size={16} />
          <span>Add user</span>
        </button>
      </div>
      {/* First Table Section */}
      <div className="table-section">
        <div className="table-header">
          <h2>
            Trainees and Guests <span className="count">100</span>
          </h2>
        </div>
        <div className="table-controls">
          <div className="left-controls">
            <button className="filter-btn">
              <Filter size={14} />
              <span>Filter</span>
            </button>
            <div className="search-container">
              <Search size={14} className="search-icon" />
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <div className="right-controls">
            <button className="export-btn">
              <Download size={14} />
              <span>Export PDF</span>
            </button>
            <button className="import-btn">
              <Upload size={14} />
              <span>Import CSV</span>
            </button>
          </div>
        </div>
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Last Check-in</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role}</td>
                  <td>{user.lastCheckIn}</td>
                  <td>
                    <button className="action-btn">
                      <span>Manage</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/* Second Table Section */}
      <div className="table-section">
        <div className="table-header">
          <h2>
            Trainees and Guests <span className="count">100</span>
          </h2>
        </div>
        <div className="table-controls">
          <div className="left-controls">
            <button className="filter-btn">
              <Filter size={14} />
              <span>Filter</span>
            </button>
            <div className="search-container">
              <Search size={14} className="search-icon" />
              <input type="text" placeholder="Search" className="search-input" />
            </div>
          </div>
          <div className="right-controls">
            <button className="export-btn">
              <Download size={14} />
              <span>Export PDF</span>
            </button>
            <button className="import-btn">
              <Upload size={14} />
              <span>Import CSV</span>
            </button>
          </div>
        </div>
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {guests.map((guest) => (
                <tr key={guest.id}>
                  <td>{guest.name}</td>
                  <td>{guest.email}</td>
                  <td>{guest.phone}</td>
                  <td>
                    {guest.status === "active" && <span className="status-badge active">Active</span>}
                    {!guest.status && guest.lastCheckIn && <span>{guest.lastCheckIn}</span>}
                  </td>
                  <td>
                    <button className="action-btn">
                      <span>Manage</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
export default UserManagement