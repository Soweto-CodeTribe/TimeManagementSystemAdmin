"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, BarChart2, AlertCircle } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import axios from "axios";
import { useSelector } from "react-redux";
import fetchReports from "../utils/fetchReports";
import DataLoader from "./dataLoader";
import "./styling/Dashboard.css"; 

const data = [
  { name: "Mon", value: 60 },
  { name: "Tue", value: 40 },
  { name: "Wed", value: 30 },
  { name: "Thu", value: 70 },
  { name: "Fri", value: 50 },
];

// Pagination settings
const ITEMS_PER_PAGE = 5;

function Dashboard() {
  const name = localStorage.getItem('name');
  const currentDate = new Date().toDateString();
  const [summaryData, setSummaryData] = useState([]);
  const role = useSelector((state) => state.auth.role);
  const [loading, setLoading] = useState(true);
  const [allTrainees, setAllTrainees] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // State for current page
  const [superAdminCheckIns, setSuperAdminCheckIns] = useState([]);
  const [facilitatorAdminCheckIns, setFacilitatorAdminCheckIns] = useState([]);
  const BASE_URL = 'https://timemanagementsystemserver.onrender.com';
  const token = useSelector((state) => state.auth.token);
  const [Overview, setOverview] = useState([]);

  useEffect(() => {
    const fetchOverViews = async () => {
      try {
        const overviewResponse = await axios.get('https://timemanagementsystemserver.onrender.com/api/trainees-overview', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          }
        });

        // Extracting the programStats array from the response data
        const { programStats } = overviewResponse.data;
        
        if (Array.isArray(programStats)) {
          setOverview(programStats); // Store the array directly
          console.log('Overview Stats as Array:', programStats);
        } else {
          console.error('Program stats is not an array:', programStats);
        }
        
      } catch (error) {
        console.error('Error fetching overview stats:', error);
      }
    };
    
    fetchOverViews();
  }, []);

  // Fetch trainees data
  const fetchTrainees = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/trainees`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-type': 'application/json'
        }
      });
      return response.data;
    } catch (error) {
      console.log("Error fetching trainees", error);
    }
  };

  // Fetch session check-ins for super_admin
  const fetchCheckIns = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/session/all-session-status`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const superAdminSessionsArray = Object.values(response.data);
      setSuperAdminCheckIns(superAdminSessionsArray);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch facilitator check-ins
  const fetchFacilitatorCheckIns = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/facilitator/daily`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      const facilitatorSessionsArray = Object.values(response.data);
      setFacilitatorAdminCheckIns(facilitatorSessionsArray);
    } catch (error) {
      console.error('Error fetching check-ins:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch reports summary
  const loadOtherData = async () => {
    try {
      const { summaryData } = await fetchReports(token, 1, 20);
      setSummaryData(summaryData);
    } catch (error) {
      console.error(error.message);
    }
  };

  useEffect(() => {
    const getTrainees = async () => {
      const trainees = await fetchTrainees();
      setAllTrainees(trainees);
    };
    getTrainees();
  }, []);

  useEffect(() => {
    fetchCheckIns();
    fetchFacilitatorCheckIns();
    loadOtherData();
  }, [token]);

  // Pagination logic
  const indexOfLastItem = currentPage * ITEMS_PER_PAGE;
  const indexOfFirstItem = indexOfLastItem - ITEMS_PER_PAGE;
  const currentItems = Overview.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const totalPages = Math.ceil(Overview.length / ITEMS_PER_PAGE);

  

  // If loading, show loader
  if (loading) return <DataLoader message="Loading dashboard..." />;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h3>Hi, {name || 'User'}</h3>
        <p>{currentDate}</p>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-header">
            <h4>Total Trainees</h4>
            <Users className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{summaryData?.totalTrainees}</div>
          </div>
        </div>

        {role !== 'facilitator' && (
          <div className="stat-card">
            <div className="stat-header">
              <h4>Total Facilitators</h4>
              <UserCheck className="stat-icon" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{15}</div>
            </div>
          </div>
        )}

        {role !== 'facilitator' && (
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
            <div className="stat-value">{100 - 75}%</div>
          </div>
        </div>
          </>
        )}
      </div>

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

        {role !== 'facilitator' && (
          <div className="chart-card">
          <div className="card-header">
            <h4>Check-ins for today</h4>
          </div>
          <div className="card-content">
            <table className="check-ins-table">
              <tbody>
                {superAdminCheckIns.map((checkIn) => (
                  <tr key={checkIn.name}>
                    <td>{checkIn.name}</td>
                    <td className="time">{checkIn.checkInTime}</td>
                  </tr>
                ))}
                {facilitatorAdminCheckIns.map((checkIn) => (
                  <tr key={checkIn.name}>
                    <td>{checkIn.name}</td>
                    <td className="time">{checkIn.checkInTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>  
        )}
      </div>

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
              {console.log(currentItems, 'current overview stats')}
              {currentItems.map((trainee) => (
                <tr key={trainee.email}>
                  <td>{trainee.traineeName}</td>
                  <td>{trainee.traineeLocation}</td>
                  <td>{trainee.traineeEmail}</td>
                  <td>{trainee.traineePhoneNumber}</td>
                  <td>{trainee.attendancePercentage}</td>
                  <td>{trainee.attendanceLevel}</td>

                  <td>
                    <button className="action-button">Take Action</button>
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
                className={`page-button ${currentPage === index + 1 ? 'active' : ''}`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
