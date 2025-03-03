"use client"

import { useState } from "react"
import { Users, UserCheck, BarChart2, AlertCircle } from "lucide-react"
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import "./styling/Dashboard.css"

const data = [
  { name: "M", value: 60 },
  { name: "T", value: 40 },
  { name: "W", value: 30 },
  { name: "T", value: 70 },
  { name: "F", value: 50 },
  { name: "S", value: 40 },
  { name: "S", value: 30 },
]

const checkIns = [
  { name: "John Doe", time: "08:30" },
  { name: "Jane Smith", time: "08:45" },
  { name: "Bob Wilson", time: "09:00" },
  { name: "Alice Brown", time: "09:15" },
  { name: "Charlie Davis", time: "09:30" },
]

const trainees = [
  {
    name: "Karabo Mokoena",
    email: "karabo@example.com",
    phone: "083 456 7890",
    lastCheckIn: "25 Feb, 09:30",
    attendanceRate: 95,
  },
  {
    name: "Tumi Mokgatlhe",
    email: "tumi@example.com",
    phone: "072 345 6789",
    lastCheckIn: "25 Feb, 09:45",
    attendanceRate: 90,
  },
  {
    name: "Sipho Mabaso",
    email: "sipho@example.com",
    phone: "060 234 5678",
    lastCheckIn: "25 Feb, 10:00",
    attendanceRate: 85,
  },
  {
    name: "Lerato Molefe",
    email: "lerato@example.com",
    phone: "076 123 4567",
    lastCheckIn: "25 Feb, 10:15",
    attendanceRate: 80,
  },
  {
    name: "Thabo Nkosi",
    email: "thabo@example.com",
    phone: "082 345 6789",
    lastCheckIn: "25 Feb, 10:30",
    attendanceRate: 75,
  },
]

const totalTrainees = trainees.length;
const totalFacilitators = 20;
const dailyAttendanceRate = Math.round(
  trainees.reduce((sum, trainee) => sum + trainee.attendanceRate, 0) / trainees.length
);
const missedCheckIns = 100 - dailyAttendanceRate;

function Dashboard() {
  const [name] = useState("Super Admin")
  const currentDate = new Date().toDateString()

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h3>Howzit, {name}</h3>
        <p>{currentDate}</p>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-header">
            <h4>Total Trainees</h4>
            <Users className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalTrainees}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h4>Total Facilitators</h4>
            <UserCheck className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{totalFacilitators}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h4>Daily Attendance Rate</h4>
            <BarChart2 className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{dailyAttendanceRate}%</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h4>Missed Check-Ins</h4>
            <AlertCircle className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-value">{missedCheckIns}</div>
          </div>
        </div>
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

        <div className="chart-card">
          <div className="card-header">
            <h4>Check-ins for today</h4>
          </div>
          <div className="card-content">
            <table className="check-ins-table">
              <tbody>
                {checkIns.map((checkIn) => (
                  <tr key={checkIn.name}>
                    <td>{checkIn.name}</td>
                    <td className="time">{checkIn.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
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
                <th>Email</th>
                <th>Phone</th>
                <th>Last Check-in</th>
                <th>Attendance Rate</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trainees.map((trainee) => (
                <tr key={trainee.email}>
                  <td>{trainee.name}</td>
                  <td>{trainee.email}</td>
                  <td>{trainee.phone}</td>
                  <td>{trainee.lastCheckIn}</td>
                  <td>{trainee.attendanceRate}%</td>
                  <td>
                    <button className="action-button">Take Action</button>
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

export default Dashboard;