import { useState } from 'react'
import { Users, UserCheck, BarChart2, AlertCircle, MoreHorizontal } from 'lucide-react'
import { Bar, BarChart as RechartsBarChart, ResponsiveContainer, XAxis, YAxis } from "recharts"
import './styling/Dashboard.css'

const data = [
  { name: "Mon", value: 80 },
  { name: "Tue", value: 45 },
  { name: "Wed", value: 30 },
  { name: "Thu", value: 85 },
  { name: "Fri", value: 65 },
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
    name: "Sophie Anderson",
    email: "sophie@example.com",
    phone: "0123456789",
    lastCheckIn: "25 Feb, 09:30",
    attendanceRate: "95%",
  },
  {
    name: "Marcus Johnson",
    email: "marcus@example.com", 
    phone: "0123456789",
    lastCheckIn: "25 Feb, 09:45",
    attendanceRate: "90%",
  },

]

function Dashboard() {
  const [name] = useState("Xoli")
  const currentDate = "Monday, February 25, 2025"

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h3>Good Morning {name}</h3>
        <p>{currentDate}</p>
      </div>

      <div className="stats-container">
        <div className="stat-card">
          <div className="stat-header">
            <h4>Total Trainees</h4>
            <Users className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-value">400</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h4>Total Facilitators</h4>
            <UserCheck className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-value">400</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h4>Daily Attendance Rate</h4>
            <BarChart2 className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-value">85%</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h4>Missed Check-Ins</h4>
            <AlertCircle className="stat-icon" />
          </div>
          <div className="stat-content">
            <div className="stat-value">15</div>
          </div>
        </div>
      </div>

      <div className="chart-grid">
        <div className="chart-card">
          <div className="card-header">
            <h4>Attendance Summary</h4>
          </div>
          <div className="card-content">
            <ResponsiveContainer width="100%" height={350}>
              <RechartsBarChart data={data}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}%`}
                />
                <Bar
                  dataKey="value"
                  fill="#82CD47"
                  radius={[4, 4, 0, 0]}
                />
              </RechartsBarChart>
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
                  <td>{trainee.attendanceRate}</td>
                  <td>
                    <button className="action-button">
                      <MoreHorizontal className="action-icon" />
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

export default Dashboard
