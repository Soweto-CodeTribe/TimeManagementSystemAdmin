"use client";
import { useEffect, useState } from "react";
import { Users, UserCheck, BarChart2, AlertCircle } from "lucide-react";
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
import fetchReports from "../utils/fetchReports";
import DataLoader from "./dataLoader";
import fetchSessions from "../utils/fetchSessions";
import TraineeOverview from "./ui/TraineeOverview";
import "./styling/Dashboard.css";

function Dashboard() {
  const name = localStorage.getItem("name");
  const currentDate = new Date().toDateString();
  const [summaryData, setSummaryData] = useState([]);
  const role = localStorage.getItem("role");
  const [loading, setLoading] = useState(true);
  const [checkIns, setCheckIns] = useState([]);
  const BASE_URL = "https://timemanagementsystemserver.onrender.com";
  const token = useSelector((state) => state.auth.token);
  const [dashboardStats, setDashboardStats] = useState([]);

  // Mock data for attendance chart
  const data = [
    { name: "Mon", value: 60 },
    { name: "Tue", value: 40 },
    { name: "Wed", value: 30 },
    { name: "Thu", value: 70 },
    { name: "Fri", value: 50 },
  ];

  // Fetch facilitator check-ins
  const fetchFacilitatorCheckIns = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${BASE_URL}/api/facilitator/daily`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      const checkInsArray = Object.values(response.data);
      setCheckIns(checkInsArray);
    } catch (error) {
      console.error("Error fetching check-ins:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async (
    page = 1,
    itemsPerPage = 10,
    searchTerm = "",
    filterStatus = "",
    filterDate = ""
  ) => {
    setLoading(true);
    try {
      const statsResponse = await fetchSessions(
        token,
        page,
        itemsPerPage,
        searchTerm,
        filterStatus,
        filterDate
      );
      setDashboardStats(statsResponse.summaryData);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilitatorCheckIns();
    fetchDashboardStats();
  }, []);

  // If loading, show loader
  if (loading) return <DataLoader message="Loading dashboard..." />;

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
            <div className="stat-value">{dashboardStats.totalTrainees}</div>
          </div>
        </div>
        {role === "super_admin" && (
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
        <>
          <div className="stat-card">
            <div className="stat-header">
              <h4>Daily Attendance Rate</h4>
              <BarChart2 className="stat-icon" />
            </div>
            <div className="stat-content">
              <div className="stat-value">{dashboardStats.attendancePercentage}</div>
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
        {role !== "super_admin" && (
          <div className="chart-card">
            <div className="card-header">
              <h4>Check-ins for today</h4>
            </div>
            <div className="card-content">
              <table className="check-ins-table">
                <tbody>
                  {checkIns.map((checkIn) => (
                    <tr key={checkIn.id}>
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

      {/* Render the TraineeOverview component */}
      <TraineeOverview token={token} />
    </div>
  );
}

export default Dashboard;