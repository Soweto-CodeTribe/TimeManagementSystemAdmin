// "use client";

// import { useEffect, useState } from "react";
// import { Users, UserCheck, BarChart2, AlertCircle } from "lucide-react";
// import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
// import axios from "axios";
// import { useSelector } from "react-redux";
// import fetchReports from "../utils/fetchReports";
// import DataLoader from "./dataLoader";
// import "./styling/Dashboard.css"; 
// import fetchSessions from "../utils/fetchSessions";
// import { set } from "firebase/database";

// const data = [
//   { name: "Mon", value: 60 },
//   { name: "Tue", value: 40 },
//   { name: "Wed", value: 30 },
//   { name: "Thu", value: 70 },
//   { name: "Fri", value: 50 },
// ];

// // Pagination settings
// const ITEMS_PER_PAGE = 5;

// function Dashboard() {
//   const name = localStorage.getItem('name');
//   const currentDate = new Date().toDateString();
//   const [summaryData, setSummaryData] = useState([]);
//   const role = localStorage.getItem('role')
//   const [loading, setLoading] = useState(true);
//   const [allTrainees, setAllTrainees] = useState([]);
//   const [currentPage, setCurrentPage] = useState(1); // State for current page
//   const [superAdminCheckIns, setSuperAdminCheckIns] = useState(null);
//   const [facilitatorAdminCheckIns, setFacilitatorAdminCheckIns] = useState([]);
//   const BASE_URL = 'https://timemanagementsystemserver.onrender.com';
//   const token = useSelector((state) => state.auth.token);
//   const [Overview, setOverview] = useState([]);
//   const [dashboardStats, setDashboardStats] = useState([]);


//   useEffect(() => {
//     const fetchOverViews = async () => {
//       try {
//         const overviewResponse = await axios.get('https://timemanagementsystemserver.onrender.com/api/trainee-overview', {
//           headers: {
//             'Authorization': `Bearer ${token}`,
//             'Content-Type': 'application/json',
//           }
//         });

//         // Extracting the programStats array from the response data
//         const { programStats } = overviewResponse.data;
        
//         if (Array.isArray(programStats)) {
//           setOverview(programStats); // Store the array directly
//           console.log('Overview Stats as Array:', programStats);
//         } else {
//           console.error('Program stats is not an array:', programStats);
//         }
        
//       } catch (error) {
//         console.error('Error fetching overview stats:', error);
//       }
//     };
    
//     fetchOverViews();
//   }, []);
  

//   // Fetch trainees data
//   const fetchTrainees = async () => {
//     try {
//       const response = await axios.get(`${BASE_URL}/api/trainees`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-type': 'application/json'
//         }
//       });
//       return response.data;
//     } catch (error) {
//       console.log("Error fetching trainees", error);
//     }
//   };

//   // Fetch session check-ins for super_admin
//   const fetchCheckIns = async () => {
//     setLoading(true);
//     try {
//       const response = await axios.get(`${BASE_URL}/api/session/all-session-status`, {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         }
//       });
//       const superAdminSessionsArray = Object.values(response.data);
//       setSuperAdminCheckIns(superAdminSessionsArray);
//       console.log('DAILY CHECKInS', superAdminSessionsArray); // Log the raw response instead
//     } catch (error) {
//       console.error('Error fetching check-ins:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Fetch facilitator check-ins
//   // const fetchFacilitatorCheckIns = async () => {
//   //   setLoading(true);
//   //   try {
//   //     const response = await axios.get(`${BASE_URL}/api/facilitator/daily`, {
//   //       headers: {
//   //         'Authorization': `Bearer ${token}`,
//   //         'Content-Type': 'application/json'
//   //       }
//   //     });
//   //     const facilitatorSessionsArray = Object.values(response.data);
//   //     setFacilitatorAdminCheckIns(facilitatorSessionsArray);
//   //   } catch (error) {
//   //     console.error('Error fetching check-ins:', error);
//   //   } finally {
//   //     setLoading(false);
//   //   }
//   // };

//   // Fetch reports summary
//   const loadOtherData = async () => {
//     try {
//       const { summaryData } = await fetchReports(token, 1, 20);
//       setSummaryData(summaryData);
//     } catch (error) {
//       console.error(error.message);
//     }
//   };

//   const fetchDashboardStats = async (page = 1, itemsPerPage = 10, searchTerm = "", filterStatus = "", filterDate = "") => {
//     setLoading(true);
//     try{
//       const statsResponse = await fetchDashboardStats(token, page, itemsPerPage, searchTerm, filterStatus, filterDate);
//       setDashboardStats(statsResponse.summaryData);
    
//     }catch(error){
//       console.log(error.message)
//     }
//     finally{
      
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     const getTrainees = async () => {
//       const trainees = await fetchTrainees();
//       setAllTrainees(trainees);
//     };
//     getTrainees();
//   }, []);

//   useEffect(() => {
//     fetchCheckIns();
//     // fetchFacilitatorCheckIns();
//     fetchDashboardStats();
//     loadOtherData();
//     console.log('dashboardStats' , dashboardStats)
//   }, []);

//   // Pagination logic
//   const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
//   const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
//   const currentItems = Overview.slice(indexOfFirstItem, indexOfLastItem);

//   const handlePageChange = (pageNumber) => {
//     setCurrentPage(pageNumber);
//   };

//   const totalPages = Math.ceil(Overview.length / ITEMS_PER_PAGE);

  

//   // If loading, show loader
//   if (loading) return <DataLoader message="Loading dashboard..." />;

//   return (
//     <div className="dashboard">
//       <div className="dashboard-header">
//         <h3>Hi, {name || 'User'}</h3>
//         <p>{currentDate}</p>
//       </div>

//       <div className="stats-container">
//         <div className="stat-card">
//           <div className="stat-header">
//             <h4>Total Trainees</h4>
//             <Users className="stat-icon" />
//           </div>
//           <div className="stat-content">
//             <div className="stat-value">{summaryData?.totalTrainees}</div>
//           </div>
//         </div>

        
//           {role !== 'facilitator' && (
//             <div className="stat-card">
//             <div className="stat-header">
//               <h4>Total Facilitators</h4>
//               <UserCheck className="stat-icon" />
//             </div>
//             <div className="stat-content">
//               <div className="stat-value">{15}</div>
//             </div>
//           </div>
//           )}
        

      
//           <>
//             <div className="stat-card">
//           <div className="stat-header">
//             <h4>Daily Attendance Rate</h4>
//             <BarChart2 className="stat-icon" />
//           </div>
//           <div className="stat-content">
//             <div className="stat-value">75%</div>
//           </div>
//         </div>

//         <div className="stat-card">
//           <div className="stat-header">
//             <h4>Missed Check-Ins</h4>
//             <AlertCircle className="stat-icon" />
//           </div>
//           <div className="stat-content">
//             <div className="stat-value">{100 - 75}%</div>
//           </div>
//         </div>
//           </>
      
//       </div>

//       <div className="chart-grid">
//         <div className="chart-card">
//           <div className="card-header">
//             <h4>Attendance Summary</h4>
//           </div>
//           <div className="card-content">
//             <ResponsiveContainer width="100%" height={200}>
//               <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
//                 <defs>
//                   <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#82CD47" stopOpacity={0.8} />
//                     <stop offset="95%" stopColor="#82CD47" stopOpacity={0.1} />
//                   </linearGradient>
//                 </defs>
//                 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
//                 <YAxis
//                   axisLine={false}
//                   tickLine={false}
//                   tick={{ fontSize: 10 }}
//                   domain={[0, 100]}
//                   ticks={[0, 20, 40, 60, 80, 100]}
//                 />
//                 <CartesianGrid vertical={false} stroke="#eee" />
//                 <Tooltip />
//                 <Area type="monotone" dataKey="value" stroke="#82CD47" fillOpacity={1} fill="url(#colorValue)" />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

        
//           <div className="chart-card">
//           <div className="card-header">
//             <h4>Check-ins for today</h4>
//           </div>
//           <div className="card-content">
//             <table className="check-ins-table">
// <tbody>
//   {superAdminCheckIns.map((checkIn, index) => ( // Correct order: item, index
//     <tr key={`super-admin-${index}`}>
//       <td>{checkIn.name}</td>
//       <td className="time">{checkIn.checkInTime}</td>
//     </tr>
//   ))}
//   {facilitatorAdminCheckIns.map((checkIn, index) => (
//     <tr key={`facilitator-${index}`}>
//       <td>{checkIn.name}</td>
//       <td className="time">{checkIn.checkInTime}</td>
//     </tr>
//   ))}
// </tbody>
//             </table>
//           </div>
//         </div>  
//         {/* )} */}
//       </div>

//       <div className="overview-card">
//         <div className="card-header">
//           <h4>Trainee Management Overview</h4>
//         </div>
//         <div className="card-content">
//           <table className="overview-table">
//             <thead>
//               <tr>
//                 <th>Name</th>
//                 <th>Location</th>
//                 <th>Email</th>
//                 <th>Phone</th>
//                 <th>Attendance Rate</th>
//                 <th>Level</th>
//                 <th>Actions</th>

//               </tr>
//             </thead>
//             <tbody key={Date.now().toString()}>
//               {console.log(currentItems, 'current overview stats')}
//               {currentItems.map((trainee) => (
//                 <tr key={trainee.id}>
//                   <td>{trainee.traineeName}</td>
//                   <td>{trainee.traineeLocation}</td>
//                   <td>{trainee.traineeEmail}</td>
//                   <td>{trainee.traineePhoneNumber}</td>
//                   <td>{trainee.attendancePercentage}</td>
//                   <td>{trainee.attendanceLevel}</td>

//                   <td>
//                     <button className="action-button">Take Action</button>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>

//           {/* Pagination Controls */}
//           <div className="pagination">
//             {Array.from({ length: totalPages }, (_, index) => (
//               <button
//                 key={index + 1}
//                 onClick={() => handlePageChange(index + 1)}
//                 className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
//               >
//                 {index + 1}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
"use client"
import { useEffect, useState } from "react"
import { Users, UserCheck, BarChart2, AlertCircle } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import axios from "axios"
import { useSelector } from "react-redux"
import fetchReports from "../utils/fetchReports"
import DataLoader from "./dataLoader"
import fetchSessions from "../utils/fetchSessions"
import "./styling/Dashboard.css"

// Pagination settings
const ITEMS_PER_PAGE = 5

// StatusBadge component
const StatusBadge = ({ status, suspensionEndDate }) => {
  const isSuspended = status === "suspended" && suspensionEndDate > new Date().toISOString()
  let badgeText = status
  if (isSuspended) {
    badgeText = "suspended"
  } else if (status === "revoked") {
    badgeText = "revoked"
  } else if (status === "active") {
    badgeText = "active"
  } else if (status === "pending") {
    badgeText = "pending"
  }

  let badgeClass = `status-badge ${badgeText.toLowerCase()}`

  return <span className={badgeClass}>{badgeText}</span>
}

function Dashboard() {
  const name = localStorage.getItem("name")
  const currentDate = new Date().toDateString()
  const [summaryData, setSummaryData] = useState([])
  const role = useSelector((state) => state.auth.role)
  const [loading, setLoading] = useState(true)
  const [allTrainees, setAllTrainees] = useState([])
  const [currentPage, setCurrentPage] = useState(1) // State for current page
  const BASE_URL = "https://timemanagementsystemserver.onrender.com"
  const token = useSelector((state) => state.auth.token)
  const [Overview, setOverview] = useState([])
  const [dashboardStats, setDashboardStats] = useState([])

  // Mock data for attendance chart
  const data = [
    { name: "Mon", value: 60 },
    { name: "Tue", value: 40 },
    { name: "Wed", value: 30 },
    { name: "Thu", value: 70 },
    { name: "Fri", value: 50 },
  ]

  // Fetch dashboard statistics
  const fetchDashboardStats = async (
    page = 1,
    itemsPerPage = 10,
    searchTerm = "",
    filterStatus = "",
    filterDate = "",
  ) => {
    setLoading(true)
    try {
      const statsResponse = await fetchSessions(token, page, itemsPerPage, searchTerm, filterStatus, filterDate)
      setDashboardStats(statsResponse.summaryData)
    } catch (error) {
      console.error("Error fetching dashboard stats:", error.message)
    } finally {
      setLoading(false)
    }
  }

  // Fetch trainee overview data
  const fetchOverViews = async () => {
    try {
      const overviewResponse = await axios.get(`${BASE_URL}/api/trainee-overview`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })
      const { programStats } = overviewResponse.data
      if (Array.isArray(programStats)) {
        setOverview(programStats)
      } else {
        console.error("Program stats is not an array:", programStats)
      }
    } catch (error) {
      console.error("Error fetching overview stats:", error)
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      await fetchOverViews();
      await fetchDashboardStats();
    };

    fetchData();
  }, [token]); // Added token as a dependency for useEffect

  // Fetch all trainees
  const fetchTrainees = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/trainees`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-type": "application/json",
        },
      })
      return response.data
    } catch (error) {
      console.log("Error fetching trainees", error)
    }
  }

  // Fetch reports summary
  const loadOtherData = async () => {
    try {
      const { summaryData } = await fetchReports(token, 1, 20)
      setSummaryData(summaryData)
    } catch (error) {
      console.error(error.message)
    }
  }

  useEffect(() => {
    const getTrainees = async () => {
      const trainees = await fetchTrainees()
      setAllTrainees(trainees)
    }
    getTrainees()
  }, [])

  useEffect(() => {
    loadOtherData()
  }, [token])

  // Pagination logic
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE
  const currentItems = Overview.slice(indexOfFirstItem, indexOfLastItem)

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const totalPages = Math.ceil(Overview.length / ITEMS_PER_PAGE)

  // If loading, show loader
  if (loading) return <DataLoader message="Loading dashboard..." />

  // Function to send a notification/message to the trainee
  const sendNotification = async (traineeEmail) => {
    try {
      await axios.post(
        `${BASE_URL}/api/notifications`,
        { recipient: traineeEmail, message: "Your account requires attention." },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )
      alert("Notification sent successfully!")
    } catch (error) {
      console.error("Error sending notification:", error)
      alert("Failed to send notification.")
    }
  }

  // Function to suspend credentials (hibernate trainee)
  const suspendCredentials = async (traineeId, durationInDays) => {
    try {
      const suspensionEndDate = new Date()
      suspensionEndDate.setDate(suspensionEndDate.getDate() + durationInDays)

      await axios.patch(
        `${BASE_URL}/api/trainees/${traineeId}/suspend`,
        { suspensionEndDate },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )
      alert(`Trainee suspended for ${durationInDays} days.`)

      // Refresh trainee data
      const trainees = await fetchTrainees()
      setAllTrainees(trainees)
      await fetchOverViews(); // Call function to refresh overview after suspension
    } catch (error) {
      console.error("Error suspending credentials:", error)
      alert("Failed to suspend credentials.")
    }
  }

  const reinstateTrainee = async (traineeId) => {
    try {
      await axios.patch(
        `${BASE_URL}/api/trainees/${traineeId}/reinstate`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )
      alert("Trainee reinstated successfully!")
      const trainees = await fetchTrainees()
      setAllTrainees(trainees)
      await fetchOverViews(); // Call function to refresh overview after reinstatement
    } catch (error) {
      console.error("Error reinstating trainee:", error)
      alert("Failed to reinstate trainee.")
    }
  }

  const revokeAccess = async (traineeId) => {
    try {
      await axios.patch(
        `${BASE_URL}/api/trainees/${traineeId}/revoke-access`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )
      alert("Trainee access revoked successfully!")
      const trainees = await fetchTrainees()
      setAllTrainees(trainees)
      await fetchOverViews(); // Call function to refresh overview after revocation
    } catch (error) {
      console.error("Error revoking access:", error)
      alert("Failed to revoke access.")
    }
  }

  const restoreAccess = async (traineeId) => {
    try {
      await axios.patch(
        `${BASE_URL}/api/trainees/${traineeId}/restore-access`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )
      alert("Trainee access restored successfully!")
      const trainees = await fetchTrainees()
      setAllTrainees(trainees)
      await fetchOverViews(); // Call function to refresh overview after restoration
    } catch (error) {
      console.error("Error restoring access:", error)
      alert("Failed to restore access.")
    }
  }

  return (
    <div className="dashboard">
      {/* Header Section */}
      <div className="dashboard-header">
        <h3>Hi, {name || "User"}</h3>
        <p>{currentDate}</p>
      </div>

      {/* Statistics Section */}
      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-header">
            <h4>Total Trainees</h4>
            <Users className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{summaryData?.totalTrainees || 0}</div>
          </div>
        </div>

        {role !== "facilitator" && (
          <div className="stat-card">
            <div className="stat-header">
              <h4>Total Facilitators</h4>
              <UserCheck className="stat-icon" />
            </div>
            <div className="stat-content">
              <div className="stat-value">15</div>
            </div>
          </div>
        )}

        {role !== "facilitator" && (
          <>
            <div className="stat-card">
              <div className="stat-header">
                <h4>Daily Attendance Rate</h4>
                <BarChart2 className="stat-icon" />
              </div>
              <div className="stat-content">
                <div className="stat-value">75%</div>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-header">
                <h4>Missed Check-Ins</h4>
                <AlertCircle className="stat-icon" />
              </div>
              <div className="stat-content">
                <div className="stat-value">25%</div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="chart-grid">
        <div className="chart-card">
          <div className="card-header">
            <h4>Attendance Summary</h4>
          </div>
          <div className="card-content">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82CD47" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#82CD47" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10 }} />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                  domain={[0, 100]}
                  ticks={[0, 20, 40, 60, 80, 100]}
                />
                <CartesianGrid vertical={false} stroke="#eee" />
                <Tooltip />
                <Area type="monotone" dataKey="value" stroke="#82CD47" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Trainee Management Overview Section */}
      <div className="overview-card">
        <div className="card-header">
          <h4>Trainee Management Overview</h4>
        </div>
        <div className="card-content">
          <table className="overview-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Location</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Attendance Rate</th>
                <th>Level</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((trainee) => (
                <tr key={trainee.id || trainee.traineeEmail}>
                  <td>{trainee.traineeName}</td>
                  <td>{trainee.traineeLocation}</td>
                  <td>{trainee.traineeEmail}</td>
                  <td>{trainee.traineePhoneNumber}</td>
                  <td>{trainee.attendancePercentage}%</td>
                  <td>{trainee.attendanceLevel}</td>
                  <td>
                    {/* Take Action Button with Dropdown */}
                    <div className="action-dropdown">
                      <button className="action-button">Take Action</button>
                      <div className="dropdown-content">
                        {/* Send Notification */}
                        <button onClick={() => sendNotification(trainee.traineeEmail)}>
                          Send Notification
                        </button>

                        {/* Suspension Options */}
                        <button onClick={() => suspendCredentials(trainee.id, 7)}>
                          Suspend for 7 Days
                        </button>
                        <button onClick={() => suspendCredentials(trainee.id, 30)}>
                          Suspend for 30 Days
                        </button>
                        <button onClick={() => suspendCredentials(trainee.id, 90)}>
                          Suspend for 90 Days
                        </button>
                        
                        {/* Reinstatement Options */}
                        <button onClick={() => reinstateTrainee(trainee.id)}>
                          Reinstate Trainee
                        </button>
                        <button onClick={() => revokeAccess(trainee.id)}>
                          Revoke Access
                        </button>
                        <button onClick={() => restoreAccess(trainee.id)}>
                          Restore Access
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="pagination">
            {Array.from({ length: totalPages }, (_, index) => (
              <button
                key={index + 1}
                onClick={() => handlePageChange(index + 1)}
                className={`page-button ${currentPage === index + 1 ? "active" : ""}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard