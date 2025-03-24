// /* eslint-disable react-hooks/exhaustive-deps */
// /* eslint-disable no-unused-vars */
// "use client"

// import { useState, useEffect } from "react"
// import { Search, Filter, Download, Upload, UserPlus } from "lucide-react"
// import { useLocation, useNavigate } from "react-router-dom"
// import "./styling/UserManagement.css"
// import jsPDF from "jspdf"
// import Modal from "./Modal"
// import axios from "axios"
// import DataLoader from "./dataLoader"
// import CsvConfigModal from "./ui/CsvConfigModal"
// import './styling/UserManagement.css'

// const UserManagement = () => {
//   const location = useLocation()
//   const navigate = useNavigate()

//   const [users, setUsers] = useState([])
//   const [guests, setGuests] = useState([])
//   const [searchTerm, setSearchTerm] = useState("")
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
//   const [modalOpen, setModalOpen] = useState(false)
//   const [selectedUser, setSelectedUser] = useState(null)
//   const [feedbackMessage, setFeedbackMessage] = useState("")
//   const [activeTab, setActiveTab] = useState("Trainees") // Default active tab
//   const token = localStorage.getItem("authToken")
//   const userRole = localStorage.getItem("role")
//   const userLocation = localStorage.getItem("userLocation")
//   const [isLoading, setIsLoading] = useState(true)
//   const [exportStatus, setExportStatus] = useState('configuring'); // 'configuring', 'generating', 'completed'
//   const [openCsvConfig, setOpenCsvConfig] = useState(false);
//   const [columns, setColumns] = useState({
//     // Core Trainee Information
//     fullName: true,
//     surname: true,
//     codeTribeId: false,
//     idNumber: true,
//     cohortYear: false,
    
//     // Contact & Profile Information
//     emailAddress: true,
//     phoneNumber: true,
//     linkedinProfileUrl: true,
    
//     // Employment & Career Data
//     currentEmployer: true,
//     jobTitle: true,
//     startDate: false,
    
//     // Attendance & Activity Tracking
//     lastCheckInDate: true,
//     missedCheckIns: false
//   });

//   // Debounce logic for search
//   useEffect(() => {
//     const debounceTimer = setTimeout(() => {
//       setDebouncedSearchTerm(searchTerm)
//     }, 500)

//     return () => clearTimeout(debounceTimer)
//   }, [searchTerm])

//   const fetchGuests = async () => {
//     try {
//       const response = await fetch('https://timemanagementsystemserver.onrender.com/api/guests/getGuests', {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
//       const data = await response.json();
  
//       const guests = data.eventsWithGuests.flatMap(event =>
//         event.guestDetails.map(guest => ({
//           name: guest.fullNames,
//           email: guest.email,
//           lastVisit: guest.lastVisit,
//           phoneNumber: guest.cellPhone,
//           setGuests(guests) {
//             setGuests(prevGuests => [...prevGuests, ...guests]);
//           }
//         }))
//       );
  
//       console.log('my guests',guests);
//       return guests;
//     } catch (error) {
//       console.error('Error fetching guests:', error);
//     }
//   };

//   const fetchData = async () => {
//     setIsLoading(true)
//     fetchGuests()
//     if (!token) {
//       setFeedbackMessage("No authorization token found. Please log in again.")
//       setIsLoading(false)
//       return
//     }
  
//     try {
//       const headers = { Authorization: `Bearer ${token}` }
  
//       // Fetch trainees based on role
//       let traineesResponse
//       if (userRole === "facilitator") {
//         if (userLocation) {
//           traineesResponse = await axios.get(
//             `https://timemanagementsystemserver.onrender.com/api/trainees/location?location=${userLocation}`,
//             { headers }
//           )
//         } else {
//           traineesResponse = await axios.get(
//             "https://timemanagementsystemserver.onrender.com/api/my-trainees",
//             { headers }
//           )
//         }
//       } else if (userRole === "super_admin") {
//         traineesResponse = await axios.get(
//           "https://timemanagementsystemserver.onrender.com/api/trainees",
//           { headers }
//         )
//       }
  
//       // Extract the trainees array based on role
//       let traineesArray
//       if (userRole === "facilitator") {
//         traineesArray = traineesResponse?.data?.allTrainees || []
//       } else if (userRole === "super_admin") {
//         traineesArray = traineesResponse?.data?.trainees || []
//       }
  
//       // Fetch facilitators only if the role is not a facilitator
//       let facilitatorsResponse
//       if (userRole !== "facilitator") {
//         try {
//           facilitatorsResponse = await axios.get(
//             "https://timemanagementsystemserver.onrender.com/api/facilitators",
//             { headers }
//           )
//         } catch (error) {
//           console.error("Error fetching facilitators:", error)
//           setFeedbackMessage("Error fetching facilitators. Please try again later.")
//         }
//       }
  
//       // Fetch stakeholders only if the role is not a facilitator
//       let stakeholdersResponse
//       if (userRole !== "facilitator") {
//         try {
//           stakeholdersResponse = await axios.get(
//             "https://timemanagementsystemserver.onrender.com/api/stakeholder/all",
//             { headers }
//           )
//         } catch (error) {
//           if (error.response?.status === 403) {
//             console.error("Access denied to stakeholders endpoint.")
//             setFeedbackMessage("You do not have permission to access stakeholders.")
//           } else {
//             console.error("Error fetching stakeholders:", error)
//             setFeedbackMessage("Error fetching stakeholders. Please try again later.")
//           }
//         }
//       }

   
      
  
//       // Extract the facilitators and stakeholders arrays from the API responses
//       const facilitatorsArray = facilitatorsResponse?.data?.facilitators || []
//       const stakeholdersArray = stakeholdersResponse?.data?.stakeholders || []
  
//       const mapUser = (user, role) => ({
//         id: user._id || user.id || crypto.randomUUID(),
//         fullName: user.fullName || `${user.name || ""} ${user.surname || ""}`.trim(),
//         email: user.email || "N/A",
//         role: role,
//         status: user.status || "active",
//       })
  
//       const trainees = traineesArray.map((user) => mapUser(user, "Trainee"))
//       const facilitators = facilitatorsArray.map((user) => mapUser(user, "Facilitator"))
//       const stakeholders = stakeholdersArray.map((user) => mapUser(user, "Stakeholder"))
  
//       const allUsers = [...stakeholders, ...trainees, ...facilitators, ...guests]
  
//       setUsers(allUsers)
//       setFeedbackMessage("Data fetched successfully.")
//     } catch (error) {
//       console.error("Error fetching data:", error)
//       setFeedbackMessage("Error fetching data. Please try again later.")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   useEffect(() => {
//     fetchData(),
//     fetchGuests()
//   }, [])

//   useEffect(() => {
//     if (location.state && location.state.userData) {
//       const newUser = location.state.userData
//       const userExists = users.some((user) => user.email === newUser.email)
//       if (!userExists) {
//         const updatedUsers = [
//           ...users,
//           { ...newUser, id: `new-${Date.now()}`, status: "active" },
//         ]
//         setUsers(updatedUsers)
//         localStorage.setItem("users", JSON.stringify(updatedUsers))
//       } else {
//         alert("User Successfully Added.")
//       }
//     }
//   }, [location.state, users])

//   const toggleUserStatus = (userId) => {
//     const updatedUsers = users.map((user) => {
//       if (user.id === userId) {
//         return {
//           ...user,
//           status: user.status === "active" ? "deactive" : "active",
//         }
//       }
//       return user
//     })
//     setUsers(updatedUsers)
//     localStorage.setItem("users", JSON.stringify(updatedUsers))
//   }



// const areAllSelected = Object.values(columns).every(value => value === true);

// const handleExportCSV = () => {
//   // Change status to generating
//   setExportStatus('generating');
  
//   // Get selected columns
//   const selectedColumns = Object.keys(columns).filter(key => columns[key]);
//   console.log("Exporting columns:", selectedColumns);
  
//   // Simulate export process with timeout
//   setTimeout(() => {
//     try {
//       // Filter users based on active tab
//       const selectedUsers = users.filter(user => user.role === activeTab.slice(0, -1));
      
//       // Create CSV content with only selected columns
//       let csvContent = '';
      
//       // Add header row with selected columns
//       const headers = selectedColumns.map(col => {
//         // Convert camelCase to Title Case
//         return col.replace(/([A-Z])/g, ' $1')
//           .replace(/^./, str => str.toUpperCase());
//       }).join(',');
      
//       csvContent += headers + '\n';
      
//       // Add data rows
//       selectedUsers.forEach(user => {
//         const row = selectedColumns.map(col => {
//           // Map column names to user properties
//           switch(col) {
//             case 'fullName': return user.fullName || '';
//             case 'surname': return (user.fullName || '').split(' ').pop() || '';
//             case 'codeTribeId': return user.id || '';
//             case 'idNumber': return user.idNumber || '';
//             case 'cohortYear': return user.cohortYear || '';
//             case 'emailAddress': return user.email || '';
//             case 'phoneNumber': return user.phone || '';
//             case 'linkedinProfileUrl': return user.linkedinUrl || '';
//             case 'currentEmployer': return user.employer || '';
//             case 'jobTitle': return user.jobTitle || '';
//             case 'startDate': return user.startDate || '';
//             case 'lastCheckInDate': return user.lastCheckIn || '';
//             case 'missedCheckIns': return user.missedCheckIns || '0';
//             default: return '';
//           }
//         }).join(',');
        
//         csvContent += row + '\n';
//       });
      
//       // Create and download the CSV file
//       const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
//       const link = document.createElement("a");
//       link.href = URL.createObjectURL(blob);
//       link.setAttribute("download", `${activeTab.toLowerCase()}.csv`);
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
      
//       // Change status to completed
//       setExportStatus('completed');
      
//       // Close modal after showing completion message
//       setTimeout(() => {
//         setExportStatus('configuring');
//         setOpenCsvConfig(false);
//       }, 2000);
//     } catch (error) {
//       console.error("Error exporting CSV:", error);
//       setFeedbackMessage(`Export failed: ${error.message}`);
//       setExportStatus('configuring');
//     }
//   }, 1500); // Simulate 1.5 second export process
// };

//   const exportPDF = () => {
//     const selectedUsers = users.filter(user => user.role === activeTab.slice(0, -1))
    
//     const doc = new jsPDF()
//     doc.text(`${activeTab} Management`, 10, 10)
//     doc.text("Full Name, Email, Role", 10, 20)
    
//     selectedUsers.forEach((user, index) => {
//       doc.text(`${user.fullName}, ${user.email}, ${user.role}`, 10, 30 + index * 10)
//     })
    
//     doc.save(`${activeTab}Management.pdf`)
//   }

//   const exportCSV = () => {
//     const selectedUsers = users.filter(user => user.role === activeTab.slice(0, -1))
    
//     const csvContent = selectedUsers.map((user) => `${user.fullName},${user.email},${user.role}`).join("\n")
//     const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
//     const link = document.createElement("a")
//     link.href = URL.createObjectURL(blob)
//     link.setAttribute("download", `${activeTab.toLowerCase()}.csv`)
//     document.body.appendChild(link)
//     link.click()
//     document.body.removeChild(link)
//   }

//   const handleFileChange = async (event) => {
//     const file = event.target.files[0]
//     if (!file) return

//     const token = localStorage.getItem("authToken")
//     if (!token) {
//       setFeedbackMessage("No authorization token found. Please log in again.")
//       return
//     }

//     const formData = new FormData()
//     formData.append("file", file)

//     try {
//       setFeedbackMessage("Uploading CSV file...")
//       const response = await axios.post(
//         "https://timemanagementsystemserver.onrender.com/api/csv/csv-upload",
//         formData,
//         {
//           headers: {
//             Authorization: `Bearer ${token}`,
//             "Content-Type": "multipart/form-data",
//           },
//           transformResponse: [(data) => data],
//         },
//       )

//       if (response.status === 202) {
//         try {
//           const firstChunk = JSON.parse(response.data)
//           setFeedbackMessage(`Processing ${firstChunk.totalTrainees || "unknown number of"} trainees from CSV...`)
//         } catch (parseError) {
//           setFeedbackMessage("Upload started, processing trainees...")
//         }

//         setTimeout(() => {
//           setFeedbackMessage("Upload complete! Refreshing user list...")
//           fetchData()
//         }, 5000)
//       }
//     } catch (error) {
//       console.error("Error uploading CSV file:", error)
//       setFeedbackMessage(`Upload error: ${error.response?.data?.message || error.message}`)
//     }
//   }

//   const handleTakeAction = (user) => {
//     setSelectedUser(user)
//     setModalOpen(true)
//   }

//   const handleDeleteUser = () => {
//     if (selectedUser) {
//       const updatedUsers = users.filter((user) => user.id !== selectedUser.id)
//       setUsers(updatedUsers)
//       setModalOpen(false)
//       localStorage.setItem("users", JSON.stringify(updatedUsers))
//       setSelectedUser(null)
//     }
//   }

//   const csvConfig = ( ) => {
//     setOpenCsvConfig(true)
//   }

//   const exportTraineesCSV = async () => {
//     const token = localStorage.getItem("authToken")
//     if (!token) {
//       setFeedbackMessage("No authorization token found. Please log in again.")
//       return
//     }

//     try {
//       const response = await axios.get("https://timemanagementsystemserver.onrender.com/api/csv/export-trainees", {
//         headers: {
//           Authorization: `Bearer ${token}`,
//           "Content-Type": "text/csv",
//         },
//         responseType: "blob",
//       })

//       const url = window.URL.createObjectURL(new Blob([response.data]))
//       const link = document.createElement("a")
//       link.href = url
//       link.setAttribute("download", "trainees.csv")
//       document.body.appendChild(link)
//       link.click()

//       document.body.removeChild(link)
//       window.URL.revokeObjectURL(url)

//       setFeedbackMessage("Trainees CSV exported successfully.")
//     } catch (error) {
//       console.error("Error exporting trainees CSV:", error)
//       setFeedbackMessage(`Export failed: ${error.response?.data?.message || error.message}`)
//     }
//   }

//   const filteredUsers = users.filter(
//     (user) =>
//       (user.fullName && user.fullName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
//       (user.email && user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
//       (user.role && user.role.toLowerCase().includes(debouncedSearchTerm.toLowerCase())),
//   )

//   const filteredGuests = guests.filter(
//     (guest) =>
//       (guest.name && guest.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
//       (guest.fullName && guest.fullName.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
//       (guest.email && guest.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
//       (guest.phone && guest.phone.toLowerCase().includes(debouncedSearchTerm.toLowerCase())) ||
//       (guest.phoneNumber && guest.phoneNumber.toLowerCase().includes(debouncedSearchTerm.toLowerCase())),
//   )

//   // Helper function to get tab count
//   const getTabCount = (tabName) => {
//     if (tabName === "Trainees") {
//       return filteredUsers.filter((user) => user.role === "Trainee").length
//     } else if (tabName === "Facilitators") {
//       return filteredUsers.filter((user) => user.role === "Facilitator").length
//     } else if (tabName === "Stakeholders") {
//       return filteredUsers.filter((user) => user.role === "Stakeholder").length
//     } else if (tabName === "Guests") {
//       return filteredGuests.length
//     }
//     return 0
//   }

//   // Available tabs based on user role
//   const availableTabs = () => {
//     if (userRole === 'super_admin') {
//       return ["Trainees", "Facilitators", "Stakeholders", "Guests"]
//     } else {
//       return ["Trainees", "Guests"]
//     }
//   }

//   if(isLoading) return <DataLoader />

//   return (
//     <div className="user-management-container">
//       <Modal
//         isOpen={modalOpen}
//         onClose={() => setModalOpen(false)}
//         onView={() => console.log("View user", selectedUser)}
//         onExportCSV={exportCSV}
//         onExportPDF={() => exportPDF(selectedUser)}
//         onDelete={handleDeleteUser}
//         user={selectedUser}
//       />

//       <div className="header">
//         <div className="title-section">
//           <h1>User Management</h1>
//           <p className="subtitle">Manage your trainees, facilitators, and guests here</p>
//           {feedbackMessage && <p className="feedback-message">{feedbackMessage}</p>}
//         </div>
//         <button className="add-user-btn" onClick={() => navigate("/add-user")}>
//           <UserPlus size={16} />
//           <span>Add user</span>
//         </button>
//       </div>

//       {/* Tabs Navigation */}
//       <div className="UMtabs-container">
//         <div className="UMtabs-navigation">
//           {availableTabs().map((tab) => (
//             <button
//               key={tab}
//               className={`UMtab-button ${activeTab === tab ? 'active' : ''}`}
//               onClick={() => setActiveTab(tab)}
//             >
//               {tab} <span className="tab-count">{getTabCount(tab)}</span>
//             </button>
//           ))}
//         </div>

//         {/* Search and Controls */}
//         <div className="table-controls">
//           <div className="left-controls">
//             <button className="filter-btn">
//               <Filter size={14} />
//               <span>Filter</span>
//             </button>
//             <div className="search-container">
//               <Search size={14} className="search-icon" />
//               <input
//                 type="text"
//                 placeholder="Search by name, email, or role"
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//                 className="search-input"
//               />
//             </div>
//           </div>
//           <div className="right-controls">
//             <button className="export-btn" onClick={exportPDF}>
//               <Download size={14} />
//               <span>Export PDF</span>
//             </button>
//             <button className="export-btn" onClick={()=> setOpenCsvConfig(true)}>
//               <Download size={14} />
//               <span>Export CSV</span>
//             </button>
//             <input 
//               type="file" 
//               accept=".csv" 
//               onChange={handleFileChange} 
//               style={{ display: "none" }} 
//               id="csvInput"
//             />
//             <label htmlFor="csvInput" className="import-btn">
//               <Upload size={14} />
//               <span>Import CSV</span>
//             </label>
//           </div>
//         </div>

//         {/* Tab Content with Animation */}
//         <div className="tab-content-container">
//           <div className={`tab-content ${activeTab === "Trainees" ? 'active' : ''}`}>
//               <table className="users-table">
//                 <thead>
//                   <tr>
//                     <th>Full Name</th>
//                     <th>Email</th>
//                     <th>Role</th>
//                     <th>Status</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredUsers
//                     .filter((user) => user.role === "Trainee")
//                     .map((user) => (
//                       <tr key={user.id || user.email || `user-${Math.random()}`}>
//                         <td>{user.fullName}</td>
//                         <td>{user.email}</td>
//                         <td>{user.role}</td>
//                         <td>
//                           <span
//                             className={`status-badge ${user.status || "active"}`}
//                             onClick={() => toggleUserStatus(user.id)}
//                             style={{ cursor: "pointer" }}
//                           >
//                             {user.status === "deactive" ? "Deactive" : "Active"}
//                           </span>
//                         </td>
//                         <td>
//                           <button className="action-btn" onClick={() => handleTakeAction(user)}>
//                             <span>Take action</span>
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                 </tbody>
//               </table>
            
//           </div>

//           <div className={`tab-content ${activeTab === "Facilitators" ? 'active' : ''}`}>
//             {isLoading ? (
//               <div className="loading-spinner">Loading users...</div>
//             ) : (
//               <table className="users-table">
//                 <thead>
//                   <tr>
//                     <th>Full Name</th>
//                     <th>Email</th>
//                     <th>Role</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredUsers
//                     .filter((user) => user.role === "Facilitator")
//                     .map((user) => (
//                       <tr key={user.id || user.email || `user-${Math.random()}`}>
//                         <td>{user.fullName}</td>
//                         <td>{user.email}</td>
//                         <td>{user.role}</td>
//                         <td>
//                           <button className="action-btn" onClick={() => handleTakeAction(user)}>
//                             <span>Take action</span>
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                 </tbody>
//               </table>
//             )}
//           </div>

//           <div className={`tab-content ${activeTab === "Stakeholders" ? 'active' : ''}`}>
//             {isLoading ? (
//               <div className="loading-spinner">Loading users...</div>
//             ) : (
//               <table className="users-table">
//                 <thead>
//                   <tr>
//                     <th>Full Name</th>
//                     <th>Email</th>
//                     <th>Role</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {filteredUsers
//                     .filter((user) => user.role === "Stakeholder")
//                     .map((user) => (
//                       <tr key={user.id || user.email || `user-${Math.random()}`}>
//                         <td>{user.fullName}</td>
//                         <td>{user.email}</td>
//                         <td>{user.role}</td>
//                         <td>
//                           <button className="action-btn" onClick={() => handleTakeAction(user)}>
//                             <span>Take action</span>
//                           </button>
//                         </td>
//                       </tr>
//                     ))}
//                 </tbody>
//               </table>
//             )}
//           </div>

//           <div className={`tab-content ${activeTab === "Guests" ? 'active' : ''}`}>
//             {isLoading ? (
//               <div className="loading-spinner">Loading guests...</div>
//             ) : (
//               <table className="users-table">
//                 <thead>
//                   <tr>
//                     <th>Name</th>
//                     <th>Email</th>
//                     <th>Phone</th>
//                     <th>Status</th>
//                     <th>Actions</th>
//                   </tr>
//                 </thead>
//                 <tbody>
//                   {guests.map((guest) => (
//                     <tr key={guest.id || guest.email || `guest-${Math.random()}`}>
//                       <td>{guest.name || guest.fullName || "N/A"}</td>
//                       <td>{guest.email || "N/A"}</td>
//                       <td>{guest.phone || guest.phoneNumber || "N/A"}</td>
//                       <td>
//                         {guest.status === "active" && <span className="status-badge active">Active</span>}
//                         {!guest.status && guest.lastCheckIn && <span>{guest.lastCheckIn}</span>}
//                         {!guest.status && !guest.lastCheckIn && <span>N/A</span>}
//                       </td>
//                       <td>
//                         <button className="action-btn">
//                           <span>Manage</span>
//                         </button>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             )}
//           </div>
//         </div>
//       </div>

//             {openCsvConfig && (
//               <CsvConfigModal onClose={() => setOpenCsvConfig(false)}/>
//             )}
//     </div>
//   )
// }
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
"use client";
import { useState, useEffect } from "react";
import { Search, Filter, Download, Upload, UserPlus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import "./styling/UserManagement.css";
import jsPDF from "jspdf";
import Modal from "./Modal";
import axios from "axios";
import DataLoader from "./dataLoader";
import CsvConfigModal from "./ui/CsvConfigModal";

const UserManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [guests, setGuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [activeTab, setActiveTab] = useState("Trainees");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [exportStatus, setExportStatus] = useState("configuring");
  const [openCsvConfig, setOpenCsvConfig] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  
  // Get authentication data from localStorage
  const token = localStorage.getItem("authToken");
  const userRole = localStorage.getItem("role");
  const userLocation = localStorage.getItem("userLocation");
  
  const [columns, setColumns] = useState({
    fullName: true,
    surname: true,
    codeTribeId: false,
    idNumber: true,
    cohortYear: false,
    emailAddress: true,
    phoneNumber: true,
    linkedinProfileUrl: true,
    currentEmployer: true,
    jobTitle: true,
    startDate: false,
    lastCheckInDate: true,
    missedCheckIns: false,
  });

  // Debounce search term to avoid excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Check authentication on component mount
  useEffect(() => {
    if (!token) {
      setFeedbackMessage("Authentication required. Please log in.");
      navigate("/login");
    } else {
      fetchAllData();
    }
  }, []);

  // Handle new user addition from navigation state
  useEffect(() => {
    if (location.state?.userData) {
      const newUser = location.state.userData;
      const exists = users.some((u) => u.email === newUser.email);
      if (!exists) {
        setUsers((prev) => [
          ...prev,
          { ...newUser, id: `new-${Date.now()}`, status: "active" },
        ]);
      }
    }
  }, [location.state]);

  // Main function to fetch all necessary data
  const fetchAllData = async () => {
    setIsLoading(true);
    setFetchError(null);
    
    try {
      // Fetch users based on role
      await fetchUsers();
      // Fetch guests data
      await fetchGuests();
      
      setFeedbackMessage("Data loaded successfully");
    } catch (error) {
      console.error("Error loading data:", error);
      setFetchError("Failed to load all required data. Please try again.");
      setFeedbackMessage("Error fetching data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch guest data
  const fetchGuests = async () => {
    try {
      const response = await axios.get(
        "https://timemanagementsystemserver.onrender.com/api/guests/getGuests",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      const guestsData = response.data.eventsWithGuests || [];
      const formattedGuests = guestsData.flatMap((event) =>
        (event.guestDetails || []).map((guest) => ({
          id: guest.id || guest._id || `guest-${crypto.randomUUID()}`,
          fullName: guest.fullNames || "N/A",
          email: guest.email || "N/A",
          phoneNumber: guest.cellPhone || "N/A",
          lastVisit: guest.lastVisit || event.date || "N/A",
          role: "Guest",
          status: "active",
        }))
      );
      
      setGuests(formattedGuests);
    } catch (error) {
      console.error("Error fetching guests:", error);
      throw new Error("Failed to fetch guests data");
    }
  };

  // Fetch users (trainees, facilitators, stakeholders) based on role
  const fetchUsers = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    let allUserResults = [];
    
    try {
      // === 1. Fetch trainees based on role ===
      let traineesData = [];
      
      if (userRole === "facilitator") {
        // Facilitators can see their trainees or trainees at their location
        try {
          let traineesUrl = userLocation 
            ? `https://timemanagementsystemserver.onrender.com/api/trainees/location?location=${userLocation}`
            : "https://timemanagementsystemserver.onrender.com/api/my-trainees";
          
          const traineesResponse = await axios.get(traineesUrl, { headers });
          
          // Extract trainees from response based on API structure
          traineesData = traineesResponse.data?.allTrainees || traineesResponse.data?.trainees || [];
        } catch (error) {
          console.error("Failed to fetch trainees for facilitator:", error);
          throw new Error("Failed to fetch trainees");
        }
      } 
      else if (userRole === "super_admin" || userRole === "admin") {
        // Admins can see all trainees
        try {
          const traineesResponse = await axios.get(
            "https://timemanagementsystemserver.onrender.com/api/trainees",
            { headers }
          );
          
          traineesData = traineesResponse.data?.trainees || [];
        } catch (error) {
          console.error("Failed to fetch trainees for admin:", error);
          throw new Error("Failed to fetch trainees");
        }
      }
      
      // Map trainees to common format
      const formattedTrainees = traineesData.map(trainee => ({
        id: trainee._id || trainee.id || `trainee-${crypto.randomUUID()}`,
        fullName: trainee.fullName || `${trainee.name || ""} ${trainee.surname || ""}`.trim(),
        email: trainee.email || trainee.emailAddress || "N/A",
        phoneNumber: trainee.phoneNumber || trainee.phone || "N/A",
        role: "Trainee",
        status: trainee.status || "active",
        lastCheckIn: trainee.lastCheckInDate || "N/A"
      }));
      
      allUserResults = [...formattedTrainees];
      
      // === 2. Fetch facilitators and stakeholders if user has appropriate role ===
      if (userRole === "super_admin" || userRole === "admin") {
        // Fetch facilitators
        try {
          const facilitatorsResponse = await axios.get(
            "https://timemanagementsystemserver.onrender.com/api/facilitators",
            { headers }
          );
          
          const facilitatorsData = facilitatorsResponse.data?.facilitators || [];
          const formattedFacilitators = facilitatorsData.map(facilitator => ({
            id: facilitator._id || facilitator.id || `facilitator-${crypto.randomUUID()}`,
            fullName: facilitator.fullName || `${facilitator.name || ""} ${facilitator.surname || ""}`.trim(),
            email: facilitator.email || facilitator.emailAddress || "N/A",
            phoneNumber: facilitator.phoneNumber || facilitator.phone || "N/A",
            role: "Facilitator",
            status: facilitator.status || "active"
          }));
          
          allUserResults = [...allUserResults, ...formattedFacilitators];
        } catch (error) {
          console.error("Failed to fetch facilitators:", error);
          // Don't throw error, just continue with what we have
        }
        
        // Fetch stakeholders
        try {
          const stakeholdersResponse = await axios.get(
            "https://timemanagementsystemserver.onrender.com/api/stakeholder/all",
            { headers }
          );
          
          const stakeholdersData = stakeholdersResponse.data?.stakeholders || [];
          const formattedStakeholders = stakeholdersData.map(stakeholder => ({
            id: stakeholder._id || stakeholder.id || `stakeholder-${crypto.randomUUID()}`,
            fullName: stakeholder.fullName || `${stakeholder.name || ""} ${stakeholder.surname || ""}`.trim(),
            email: stakeholder.email || stakeholder.emailAddress || "N/A",
            phoneNumber: stakeholder.phoneNumber || stakeholder.phone || "N/A",
            role: "Stakeholder",
            status: stakeholder.status || "active"
          }));
          
          allUserResults = [...allUserResults, ...formattedStakeholders];
        } catch (error) {
          // Check if it's a permission error
          if (error.response?.status === 403) {
            console.warn("User doesn't have permission to access stakeholders");
          } else {
            console.error("Failed to fetch stakeholders:", error);
          }
          // Don't throw error, just continue with what we have
        }
      }
      
      // Update state with all user data
      setUsers(allUserResults);
      
    } catch (error) {
      console.error("Error in fetchUsers:", error);
      throw error;
    }
  };

  // Toggle user status (active/deactive)
  const toggleUserStatus = async (userId) => {
    try {
      // Here we would typically make an API call to update the user status
      // For now, we'll just update the local state
      setUsers(prevUsers => 
        prevUsers.map(user =>
          user.id === userId
            ? { ...user, status: user.status === "active" ? "deactive" : "active" }
            : user
        )
      );
      setFeedbackMessage("User status updated successfully.");
    } catch (error) {
      console.error("Error updating user status:", error);
      setFeedbackMessage("Failed to update user status.");
    }
  };

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      // Here we would typically make an API call to delete the user
      // For now, we'll just update the local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
      setModalOpen(false);
      setFeedbackMessage("User deleted successfully.");
    } catch (error) {
      console.error("Error deleting user:", error);
      setFeedbackMessage("Failed to delete user.");
    }
  };

  // Handle "Take Action" button
  const handleTakeAction = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  // Filter data based on search term
  const filteredUsersData = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const filteredGuestsData = guests.filter(
    (guest) =>
      guest.fullName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (guest.phoneNumber && guest.phoneNumber.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
  );

  // Get tab-specific data
// Update the getTabData function to ensure guests only appear in the Guests tab

const getTabData = (tabName) => {
  switch (tabName) {
    case "Trainees":
      return filteredUsersData.filter((u) => u.role === "Trainee");
    case "Facilitators":
      return filteredUsersData.filter((u) => u.role === "Facilitator");
    case "Stakeholders":
      return filteredUsersData.filter((u) => u.role === "Stakeholder");
    case "Guests":
      // Only return the guest data for this tab - do not filter users
      return filteredGuestsData;
    default:
      return [];
  }
};

  // Pagination logic
  const paginate = (data) => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  };

  // Determine which tabs to show based on user role
  const getAvailableTabs = () => {
    if (userRole === "super_admin" || userRole === "admin") {
      return ["Trainees", "Facilitators", "Stakeholders", "Guests"];
    } else {
      return ["Trainees", "Guests"];
    }
  };

  // Export as CSV with configured columns
  const handleExportCSV = () => {
    setExportStatus("generating");
    const selectedColumns = Object.keys(columns).filter((key) => columns[key]);

    setTimeout(() => {
      try {
        const data = getTabData(activeTab).map((user) => {
          return selectedColumns
            .map((col) => {
              switch (col) {
                case "fullName":
                  return user.fullName || "";
                case "surname":
                  return (user.fullName?.split(" ").pop()) || "";
                case "codeTribeId":
                  return user.id || "";
                case "emailAddress":
                  return user.email || "";
                case "phoneNumber":
                  return user.phoneNumber || "";
                case "lastCheckInDate":
                  return user.lastCheckIn || "";
                default:
                  return "";
              }
            })
            .join(",");
        });

        const csvContent = `data:text/csv;charset=utf-8,${[
          selectedColumns.join(","),
          ...data,
        ].join("\n")}`;
        const link = document.createElement("a");
        link.href = encodeURI(csvContent);
        link.download = `${activeTab.toLowerCase()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        setExportStatus("completed");
        setTimeout(() => {
          setExportStatus("configuring");
          setOpenCsvConfig(false);
        }, 2000);
      } catch (error) {
        console.error("CSV Export Error:", error);
        setFeedbackMessage("CSV export failed. Check console for details.");
      }
    }, 1500);
  };

  // Export as PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    const data = getTabData(activeTab);
    doc.text(`${activeTab} Management`, 10, 10);
    doc.text("Full Name, Email, Role", 10, 20);
    data.forEach((user, index) => {
      // Limit the number of entries to prevent PDF overflow
      if (index < 30) {
        doc.text(
          `${user.fullName?.substring(0, 30) || ""}, ${user.email?.substring(0, 30) || ""}, ${user.role || ""}`,
          10,
          30 + index * 10
        );
      }
    });
    doc.save(`${activeTab.toLowerCase()}Management.pdf`);
  };

  // Import CSV
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !token) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setFeedbackMessage("Uploading CSV...");
      const response = await axios.post(
        "https://timemanagementsystemserver.onrender.com/api/csv/csv-upload",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 202) {
        setFeedbackMessage("Upload complete! Refreshing data...");
        fetchAllData();
      }
    } catch (error) {
      setFeedbackMessage(`Upload failed: ${error.message}`);
    }
  };

  // Render table with pagination
  const renderTable = (tabName) => {
    const data = getTabData(tabName);
    const paginatedData = paginate(data);

    if (paginatedData.length === 0) {
      return <div className="no-data-message">No {tabName.toLowerCase()} found.</div>;
    }

    return (
      <>
        <table className="users-table">
          <thead>
            <tr>
              {tabName === "Guests" ? (
                <>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Last Visit</th>
                </>
              ) : (
                <>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((item) => (
              <tr key={item.id}>
                {tabName === "Guests" ? (
                  <>
                    <td>{item.fullName}</td>
                    <td>{item.email}</td>
                    <td>{item.phoneNumber}</td>
                    <td>{item.lastVisit}</td>
                  </>
                ) : (
                  <>
                    <td>{item.fullName}</td>
                    <td>{item.email}</td>
                    <td>{item.role}</td>
                    <td>
                      <span
                        className={`status-badge ${item.status}`}
                        onClick={() => toggleUserStatus(item.id)}
                      >
                        {item.status === "deactive" ? "Deactive" : "Active"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="action-btn"
                        onClick={() => handleTakeAction(item)}
                      >
                        Take action
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {renderPagination(tabName, data.length)}
      </>
    );
  };

  // Pagination controls
  const renderPagination = (tabName, totalItems) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    return (
      <div className="pagination-controls">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          {'<'}
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          {">"}
        </button>
      </div>
    );
  };

  // Get available tabs based on user role
  const availableTabs = getAvailableTabs();

  return (
    <div className="user-management-container">
      {/* Action Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onView={() => console.log("View user:", selectedUser)}
        onExportCSV={handleExportCSV}
        onExportPDF={exportPDF}
        onDelete={handleDeleteUser}
        user={selectedUser}
      />

      {/* CSV Configuration Modal */}
      {openCsvConfig && (
        <CsvConfigModal
          columns={columns}
          setColumns={setColumns}
          onClose={() => setOpenCsvConfig(false)}
          onExport={handleExportCSV}
          exportStatus={exportStatus}
        />
      )}

      {/* Header */}
      <div className="header">
        <div className="title-section">
          <h1>User Management</h1>
          <p className="subtitle">
            Manage trainees, facilitators, stakeholders, and guests
          </p>
          {feedbackMessage && (
            <p className="feedback-message">{feedbackMessage}</p>
          )}
          {fetchError && (
            <p className="error-message">{fetchError}</p>
          )}
        </div>
        <button
          className="add-user-btn"
          onClick={() => navigate("/add-user")}
        >
          <UserPlus size={16} />
          <span>Add user</span>
        </button>
      </div>

      {/* Tabs and Controls */}
      <div className="UMtabs-container">
        <div className="UMtabs-navigation">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              className={`UMtab-button ${activeTab === tab ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1); // Reset to first page when changing tabs
              }}
            >
              {tab} <span className="tab-count">{getTabData(tab).length}</span>
            </button>
          ))}
        </div>

        <div className="table-controls">
          <div className="left-controls">
            {/* <button className="filter-btn">
              <Filter size={14} />
              <span>Filter</span>
            </button> */}
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <div className="right-controls">
            <button className="export-btn" onClick={exportPDF}>
              <Download size={14} />
              <span>Export PDF</span>
            </button>
            <button className="export-btn" onClick={() => setOpenCsvConfig(true)}>
              <Download size={14} />
              <span>Export CSV</span>
            </button>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="csvInput"
            />
            <label htmlFor="csvInput" className="import-btn">
              <Upload size={14} />
              <span>Import CSV</span>
            </label>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tabContentContainer">
          {isLoading ? (
            <DataLoader />
          ) : (
            <div className="tab-content active">
              {renderTable(activeTab)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;