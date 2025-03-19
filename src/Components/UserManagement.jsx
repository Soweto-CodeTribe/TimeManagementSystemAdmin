"use client"

import { useState, useEffect } from "react"
import { Search, Filter, Download, Upload, Plus } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"
import "./styling/UserManagement.css"
import jsPDF from "jspdf"
import Modal from "./Modal"
import axios from "axios"

const UserManagement = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [users, setUsers] = useState([])
  const [guests, setGuests] = useState([])
  const [searchTerm, setSearchTerm] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [feedbackMessage, setFeedbackMessage] = useState("")

  const fetchData = async () => {
    const token = localStorage.getItem("authToken")
    const userRole = localStorage.getItem("userRole") // Fetch user role from localStorage
    const userLocation = localStorage.getItem("userLocation"); // Assuming you also store location

    if (!token) {
      setFeedbackMessage("No authorization token found. Please log in again.")
      return
    }

    try {
      const headers = { Authorization: `Bearer ${token}` }
      
      // Make API calls based on user role
      let traineesResponse;
      if (userRole === 'Facilitator' && userLocation) {
        traineesResponse = await axios.get(`https://timemanagementsystemserver.onrender.com/api/trainees/location?location=${userLocation}`, {
          headers,
        });
      } else {
        traineesResponse = await axios.get("https://timemanagementsystemserver.onrender.com/api/trainees", {
          headers,
        });
      }

      const facilitatorsResponse = await axios.get("https://timemanagementsystemserver.onrender.com/api/facilitators", {
        headers,
      });
      const stakeholdersResponse = await axios.get(
        "https://timemanagementsystemserver.onrender.com/api/stakeholder/all",
        { headers },
      );

      const traineesArray = traineesResponse.data.trainees || [];
      const facilitatorsArray = facilitatorsResponse.data.facilitators || facilitatorsResponse.data || [];
      const stakeholdersArray = stakeholdersResponse.data || [];

      const trainees = traineesArray.map((user) => ({
        id: user._id || user.id || `trainee-${Date.now()}-${Math.random()}`,
        fullName: user.fullName || user.name || `${user.name || ""} ${user.surname || ""}`.trim(),
        email: user.email,
        role: "Trainee",
        status: user.status || "active", // Default status to active if not provided
      }));

      const facilitators = Array.isArray(facilitatorsArray)
        ? facilitatorsArray.map((user) => ({
            id: user._id || user.id || `facilitator-${Date.now()}-${Math.random()}`,
            fullName: user.fullName || user.name || `${user.name || ""} ${user.surname || ""}`.trim(),
            email: user.email,
            role: "Facilitator",
          }))
        : [];

      const stakeholders = Array.isArray(stakeholdersArray)
        ? stakeholdersArray.map((user) => ({
            id: user._id || user.id || `stakeholder-${Date.now()}-${Math.random()}`,
            fullName: user.fullName || user.name || `${user.name || ""} ${user.surname || ""}`.trim(),
            email: user.email,
            role: "Stakeholder",
          }))
        : [];

      const allUsers = [...stakeholders, ...trainees, ...facilitators]

      setUsers(allUsers)
      setFeedbackMessage("Data fetched successfully.")
    } catch (error) {
      console.error("Error fetching data from the server", error)
      setFeedbackMessage("Error fetching data. Please try again later.")
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  useEffect(() => {
    if (location.state && location.state.userData) {
      const newUser = location.state.userData
      const userExists = users.some((user) => user.email === newUser.email)
      if (!userExists) {
        const updatedUsers = [
          ...users,
          { ...newUser, id: `new-${Date.now()}`, status: "active" }, // Add default status
        ]
        setUsers(updatedUsers)
        localStorage.setItem("users", JSON.stringify(updatedUsers))
      } else {
        alert("User Successfully Added.")
      }
    }
  }, [location.state, users])

  const toggleUserStatus = (userId) => {
    const updatedUsers = users.map((user) => {
      if (user.id === userId) {
        return {
          ...user,
          status: user.status === "active" ? "deactive" : "active",
        }
      }
      return user
    })
    setUsers(updatedUsers)
    localStorage.setItem("users", JSON.stringify(updatedUsers))
  }

  const exportPDF = () => {
    const doc = new jsPDF()
    doc.text("User Management", 10, 10)
    doc.text("Full Name, Email, Role", 10, 20)
    users.forEach((user, index) => {
      doc.text(`${user.fullName}, ${user.email}, ${user.role}`, 10, 30 + index * 10)
    })
    doc.save("UserManagement.pdf")
  }

  const exportCSV = () => {
    const csvContent = users.map((user) => `${user.fullName},${user.email},${user.role}`).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.setAttribute("download", "users.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileChange = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const token = localStorage.getItem("authToken")
    if (!token) {
      setFeedbackMessage("No authorization token found. Please log in again.")
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    try {
      setFeedbackMessage("Uploading CSV file...")
      const response = await axios.post(
        "https://timemanagementsystemserver.onrender.com/api/csv/csv-upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
          transformResponse: [(data) => data],
        },
      )

      if (response.status === 202) {
        console.error("response:", response.data)
        try {
          const firstChunk = JSON.parse(response.data)
          setFeedbackMessage(`Processing ${firstChunk.totalTrainees || "unknown number of"} trainees from CSV...`)
        } catch (parseError) {
          setFeedbackMessage("Upload started, processing trainees...")
        }

        setTimeout(() => {
          setFeedbackMessage("Upload complete! Refreshing user list...")
          fetchData()
        }, 5000)
      }
    } catch (error) {
      console.error("Error uploading CSV file:", error)
      setFeedbackMessage(`Upload error: ${error.response?.data?.message || error.message}`)
    }
  }

  const handleTakeAction = (user) => {
    setSelectedUser(user)
    setModalOpen(true)
  }

  const handleDeleteUser = () => {
    if (selectedUser) {
      const updatedUsers = users.filter((user) => user.id !== selectedUser.id)
      setUsers(updatedUsers)
      setModalOpen(false)
      localStorage.setItem("users", JSON.stringify(updatedUsers))
      setSelectedUser(null)
    }
  }

  const exportTraineesCSV = async () => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      setFeedbackMessage("No authorization token found. Please log in again.")
      return
    }

    try {
      const response = await axios.get("https://timemanagementsystemserver.onrender.com/api/csv/export-trainees", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "text/csv",
        },
        responseType: "blob",
      })

      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement("a")
      link.href = url
      link.setAttribute("download", "trainees.csv")
      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      setFeedbackMessage("Trainees CSV exported successfully.")
    } catch (error) {
      console.error("Error exporting trainees CSV:", error)
      setFeedbackMessage(`Export failed: ${error.response?.data?.message || error.message}`)
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      (user.fullName && user.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.role && user.role.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const filteredGuests = guests.filter(
    (guest) =>
      (guest.name && guest.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (guest.fullName && guest.fullName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (guest.email && guest.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (guest.phone && guest.phone.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (guest.phoneNumber && guest.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  return (
    <div className="user-management-container">
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onView={() => console.log("View user", selectedUser)}
        onExportCSV={exportCSV}
        onExportPDF={() => exportPDF(selectedUser)}
        onDelete={handleDeleteUser}
        user={selectedUser}
      />

      <div className="header">
        <div className="title-section">
          <h1>User Management</h1>
          <p className="subtitle">Manage your trainees, facilitators, and guests here</p>
          {feedbackMessage && <p className="feedback-message">{feedbackMessage}</p>}
        </div>
        <button className="add-user-btn" onClick={() => navigate("/add-user")}>
          <Plus size={16} />
          <span>Add user</span>
        </button>
      </div>

      {/* Table Section for Facilitators */}
      <div className="table-section">
        <div className="table-header">
          <h2>
            Facilitators{" "}
            <span className="count">{filteredUsers.filter((user) => user.role === "Facilitator").length}</span>
          </h2>
        </div>

        {/* Move Search and Filter Controls Above Facilitators */}
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
        </div>

        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers
                .filter((user) => user.role === "Facilitator")
                .map((user) => (
                  <tr key={user.id || user.email || `user-${Math.random()}`}>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <button className="action-btn" onClick={() => handleTakeAction(user)}>
                        <span>Take action</span>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table Section for Trainees */}
      <div className="table-section">
        <div className="table-header">
          <h2>
            Trainees <span className="count">{filteredUsers.filter((user) => user.role === "Trainee").length}</span>
          </h2>
        </div>

        {/* PDF and CSV Export Buttons on the right side */}
        <div className="table-controls" style={{ display: "flex", justifyContent: "flex-end" }}>
          <div className="right-controls">
            <button className="export-btn" onClick={exportPDF}>
              <Download size={14} />
              <span>Export PDF</span>
            </button>
            <input type="file" accept=".csv" onChange={handleFileChange} style={{ display: "none" }} id="csvInput2" />
            <label htmlFor="csvInput2" className="import-btn">
              <Upload size={14} />
              <span>Import CSV</span>
            </label>
          </div>
        </div>

        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers
                .filter((user) => user.role === "Trainee")
                .map((user) => (
                  <tr key={user.id || user.email || `user-${Math.random()}`}>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <span
                        className={`status-badge ${user.status || "active"}`}
                        onClick={() => toggleUserStatus(user.id)}
                        style={{ cursor: "pointer" }}
                      >
                        {user.status === "deactive" ? "Deactive" : "Active"}
                      </span>
                    </td>
                    <td>
                      <button className="action-btn" onClick={() => handleTakeAction(user)}>
                        <span>Take action</span>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table Section for Stakeholders */}
      <div className="table-section">
        <div className="table-header">
          <h2>
            Stakeholders{" "}
            <span className="count">{filteredUsers.filter((user) => user.role === "Stakeholder").length}</span>
          </h2>
        </div>

        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers
                .filter((user) => user.role === "Stakeholder")
                .map((user) => (
                  <tr key={user.id || user.email || `user-${Math.random()}`}>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>
                      <button className="action-btn" onClick={() => handleTakeAction(user)}>
                        <span>Take action</span>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Table Section for Guests */}
      <div className="table-section">
        <div className="table-header">
          <h2>
            Guests <span className="count">{filteredGuests.length}</span>
          </h2>
        </div>
        <div className="table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredGuests.map((guest) => (
                <tr key={guest.id || guest.email || `guest-${Math.random()}`}>
                  <td>{guest.name || guest.fullName || "N/A"}</td>
                  <td>{guest.email || "N/A"}</td>
                  <td>{guest.phone || guest.phoneNumber || "N/A"}</td>
                  <td>
                    {guest.status === "active" && <span className="status-badge active">Active</span>}
                    {!guest.status && guest.lastCheckIn && <span>{guest.lastCheckIn}</span>}
                    {!guest.status && !guest.lastCheckIn && <span>N/A</span>}
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

      {/* Add CSS for status badges */}
      <style jsx>{`
        .status-badge {
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          text-transform: capitalize;
          display: inline-block;
        }
        
        .status-badge.active {
          background-color: #e6f7e6;
          color: #2e7d32;
          border: 1px solid #2e7d32;
        }
        
        .status-badge.deactive {
          background-color: #ffebee;
          color: #c62828;
          border: 1px solid #c62828;
        }
      `}</style>
    </div>
  )
}

export default UserManagement


