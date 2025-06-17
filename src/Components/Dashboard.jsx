"use client";
import { useEffect, useState } from "react";
import { Users, UserCheck, BarChart2, AlertCircle, Info, GraduationCap, TriangleAlert, ChartColumnBig } from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import axios from "axios";
import { useSelector } from "react-redux";
import DataLoader from "./dataLoader";
import fetchSessions from "../utils/fetchSessions";
import TraineeOverview from "./ui/TraineeOverview";
import "./styling/Dashboard.css";
import useFacilitatorCount from "../utils/fetchFacilitators";
import { fetchWeeklyStats, fetchFacilitatorsStats } from "../utils/fetchStatsMetrix";

function Dashboard() {
  // Get user details from localStorage
  const name = localStorage.getItem("name");
  const role = localStorage.getItem("role");
  const userLocation = localStorage.getItem('Location');
  const currentDate = new Date().toDateString();

  // State for loading, check-ins, dashboard stats, and attendance data
  const [loading, setLoading] = useState(true);
  const [checkIns, setCheckIns] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({
    totalTrainees: 0,
    totalFacilitators: 0,
    attendancePercentage: "0%",
    missedCheckInsPercentage: "0%",
    absentCount: 0,
  });
  const [attendanceData, setAttendanceData] = useState([]);
  const [facilitatorStats, setFacilitatorStats] = useState([]);

  // API configuration
  const BASE_URL = "https://timemanagementsystemserver.onrender.com";
  const token = useSelector((state) => state.auth.token);
  const userRole = useSelector((state) => state.auth.role);

  // Fetch session monitoring data (same as Session Monitoring component)
  const fetchSessionMonitoringData = async () => {
    try {
      // Determine location filter based on user role
      const locationFilter = 
        userRole === 'super_admin' 
          ? undefined // For super admin, get all locations
          : userLocation; // For facilitators, use their own location

      const response = await axios.get(`${BASE_URL}/api/super-admin/daily`, {
        params: {
          page: 1,
          limit: 10,
          location: locationFilter,
        },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { summary = {} } = response.data;

      // Update dashboard stats with session monitoring data
      setDashboardStats(prevStats => ({
        ...prevStats,
        totalTrainees: summary.totalTrainees || 0,
        absentCount: summary.absentCount || 0,
        attendancePercentage: summary.attendancePercentage || "0%",
      }));

    } catch (error) {
      console.error("Error fetching session monitoring data:", error);
      // Set default values on error
      setDashboardStats(prevStats => ({
        ...prevStats,
        totalTrainees: 0,
        absentCount: 0,
        attendancePercentage: "0%",
      }));
    }
  };

  // Fetch facilitator check-ins
  const fetchFacilitatorCheckIns = async () => {
    try {
      if(role === 'facilitator'){
        const response = await axios.get(`${BASE_URL}/api/facilitator/daily`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        // Handle 404 or empty response
        if (response.status === 404 || !response.data) {
          console.error("Check-ins endpoint not found or returned no data");
          setCheckIns([]);
          return;
        }

        // Extract the reports array from response data
        const checkInsArray = response.data.reports || [];

        // Process the check-ins data
        const processedCheckIns = checkInsArray
          .filter((checkIn) => checkIn.checkInTime) // Only include entries with checkInTime
          .map((checkIn) => {
            return {
              id: checkIn.traineeId,
              name: checkIn.name,
              checkInTime: checkIn.checkInTime,
              date: checkIn.date,
              status: checkIn.status,
            };
          })
          .filter((checkIn) => checkIn.name !== "Unknown");

        // Update the state with processed data
        setCheckIns(processedCheckIns);
      }
    } catch (error) {
      console.error("Error fetching check-ins:", error);
      setCheckIns([]);
    }
  };

  const fetchFacilitators = async () => {
    try {
      const token = localStorage.getItem("authToken"); // Ensure the token is retrieved
      if (!token) {
        console.error("No authorization token found.");
        return;
      }

      const response = await axios.get(
        "https://timemanagementsystemserver.onrender.com/api/facilitators",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      // Extract facilitators array from the response
      const facilitatorsArray = response.data.facilitators || response.data || [];

      // Calculate the total number of facilitators
      const totalFacilitators = Array.isArray(facilitatorsArray) ? facilitatorsArray.length : 0;

       setFacilitatorStats(totalFacilitators) 
    } catch (error) {
      console.error("Error fetching facilitators:", error);
      return 0; // Return 0 in case of an error
    }
  };

  // Fetch weekly attendance data for the graph
  const fetchGraphData = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/super-admin/weekly`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      // Process the data for the graph
      if (response.data && response.data.dailyAttendanceRates) {
        const processedData = response.data.dailyAttendanceRates.map((day) => ({
          name: day.dayOfWeek.substring(0, 3), // Use first 3 letters of day name
          value: parseFloat(day.attendanceRate || 0), // Convert attendance rate to number, default to 0
        }));
        
        setAttendanceData(processedData);
      } else {
        console.error("Invalid response format for attendance data");
        setAttendanceData([]);
      }
    } catch (error) {
      console.error("Error fetching weekly attendance data:", error);
      setAttendanceData([]); 
    }
  };

  // Use the useFacilitatorCount hook
  const { facilitatorCount, loading: facilitatorsLoading, error: facilitatorsError } =
    useFacilitatorCount();

  // Update dashboardStats with facilitator count
  useEffect(() => {
    if (facilitatorCount !== null) {
      setDashboardStats((prevStats) => ({
        ...prevStats,
        totalFacilitators: facilitatorCount,
      }));
    }
  }, [facilitatorCount]);

  // Fetch all data on component mount or when token/role changes
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchSessionMonitoringData(), // Use session monitoring data instead
          fetchFacilitatorCheckIns(),
          fetchGraphData(),
          fetchFacilitators(),
        ]);
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadData();
    }
  }, [token, role, userRole, userLocation]);

  // Fetch facilitator stats separately
  useEffect(() => {
    const fetchFacilitatorStats = async () => {
      try {
        const facilitatorsStats = await fetchFacilitatorsStats(token);
        setFacilitatorStats(facilitatorsStats.facilitators.length);
      } catch (error) {
        console.error("Error fetching facilitator stats:", error);
      }
    };

    if (token && role === "super_admin") {
      fetchFacilitatorStats();
    }
  }, [token, role]);

  // Show loader while data is being fetched
  if (loading || facilitatorsLoading) return <DataLoader message="Loading dashboard..." />;

  // Show error message if there's an error fetching facilitator count
  if (facilitatorsError) {
    return <div style={{ color: "red" }}>{facilitatorsError}</div>;
  }

  // Prepare chart data (use real data or fallback to defaults)
  const chartData =
    attendanceData.length > 0
      && attendanceData.map((item) => ({
        name: item.name,
        value: item.value,
      }));

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
            
            <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
            <Users className="stat-icon" style={{color: '#3A86FF', background: '#3A86FF33', padding: '4px', borderRadius: '50%', height: '30px', width: '30px'}} />
            <h4>Total Trainees</h4>
            </div>
            <AlertCircle className="stat-icon" style={{color: '#ccc'}}/>
          </div>
          <div className="stat-content">
            <div className="stat-value">{dashboardStats.totalTrainees}</div>
          </div>
        </div>

        {role === "super_admin" && (
          <div className="stat-card">
            <div className="stat-header">
              
              <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
              <GraduationCap  className="stat-icon" style={{color: '#72FF3A', background: '#72FF3A33', padding: '4px', borderRadius: '50%', height: '30px', width: '30px'}} />
              <h4>Total Facilitators</h4>
              </div>
              <AlertCircle className="stat-icon" style={{color: '#ccc'}}/>
            </div>
            <div className="stat-content">
            <div className="stat-value">{facilitatorStats}</div>
            </div>
          </div>
        )}

        <div className="stat-card">
          <div className="stat-header">
            
            <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
            <ChartColumnBig  className="stat-icon" style={{color: '#494FBF', background: '#494FBF33', padding: '4px', borderRadius: '50%', height: '30px', width: '30px'}} />
            <h4>Daily Attendance Rate</h4>
            </div>
            <AlertCircle className="stat-icon" style={{color: '#ccc'}}/>
          </div>
          <div className="stat-content">
          <div className="stat-value">{dashboardStats.attendancePercentage}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
          <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
          <TriangleAlert  className="stat-icon" style={{color: '#FFC300', background: '#FFC30033', padding: '4px', borderRadius: '50%', height: '30px', width: '30px'}} />
          <h4>Absent Trainees</h4>
          </div>
          <AlertCircle className="stat-icon" style={{color: '#ccc'}}/>
          </div>
          <div className="stat-content">
            <div className="stat-value">{dashboardStats.absentCount}</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="chart-grid">
        <div className="chart-card">
          <div className="card-header">
            <h4>Attendance Summary</h4>
          </div>
          <div className="card-content">
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
              >
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
                <Tooltip formatter={(value) => [`${value}%`, 'Attendance Rate']} />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#82CD47"
                  fillOpacity={1}
                  fill="url(#colorValue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {role !== "super_admin" && checkIns.length > 0 && (
          <div className="check-ins-card-contents">
            <div className="card-header">
              <h4>Check-ins for today</h4>
            </div>
            <div className="checkIns-card-content">
              <table className="check-ins-table">
                <tbody>
                  {checkIns.map((checkIn, index) => (
                    <tr key={checkIn.id || index}>
                      <td>{checkIn.name}</td>
                      <td className="time">{checkIn.checkInTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {role !== "super_admin" && checkIns.length === 0 && (
          <div className="chart-card">
            <div className="card-header">
              <h4>Check-ins for today</h4>
            </div>
            <div className="card-content">
              <Info size={48} />
              <p className="no-data">No check-ins recorded for today</p>
            </div>
          </div>
        )}
      </div>

      {/* Render the TraineeOverview component */}
      <TraineeOverview token={token} />
    </div>
  );
}

export default Dashboard;