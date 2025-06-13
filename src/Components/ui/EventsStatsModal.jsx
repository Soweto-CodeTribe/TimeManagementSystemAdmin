import { Clock, RotateCcw, UserPlus, Users, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import DataLoader from "../dataLoader";
import '../styling/EventStatsModal.css'

const EventStatsModal = ({ event, onClose }) => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

  useEffect(() => {
    calculateStats();
  }, [event]);

  const calculateStats = () => {
    if (!event.guestDetails || event.guestDetails.length === 0) {
      setStats({
        totalGuests: 0,
        genderStats: [],
        returnVsNew: [],
        checkInTimeStats: [],
        ageStats: []
      });
      setLoading(false);
      return;
    }

    const guests = event.guestDetails;
    const totalGuests = guests.length;

    // Gender statistics from form data
    const genderStats = calculateGenderStats(guests);

    // Return vs New visitors
    const returnCount = guests.filter(g => g.returnVisit).length;
    const newCount = totalGuests - returnCount;
    const returnVsNew = [
      { name: 'New Visitors', value: newCount, percentage: ((newCount / totalGuests) * 100).toFixed(1) },
      { name: 'Return Visitors', value: returnCount, percentage: ((returnCount / totalGuests) * 100).toFixed(1) }
    ];

    // Check-in time patterns
    const checkInTimeStats = calculateCheckInTimeStats(guests);

    // Age demographics
    const ageStats = calculateAgeStats(guests);

    setStats({
      totalGuests,
      genderStats,
      returnVsNew,
      checkInTimeStats,
      ageStats
    });
    setLoading(false);
  };

  const calculateGenderStats = (guests) => {
    const genderCounts = { male: 0, female: 0, other: 0, 'prefer not to say': 0 };
    
    guests.forEach(guest => {
      const gender = guest.gender?.toLowerCase() || 'prefer not to say';
      genderCounts[gender] = (genderCounts[gender] || 0) + 1;
    });

    return Object.entries(genderCounts)
      .filter(([_, count]) => count > 0)
      .map(([gender, count]) => ({
        name: gender.charAt(0).toUpperCase() + gender.slice(1),
        value: count,
        percentage: ((count / guests.length) * 100).toFixed(1)
      }));
  };

  const formatHourTo12Hour = (hour) => {
    const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${hour12}:00 ${ampm}`;
  };

  const calculateCheckInTimeStats = (guests) => {
    const timeSlots = {};
    
    guests.forEach(guest => {
      if (guest.checkInTime) {
        const hour = parseInt(guest.checkInTime.split(':')[0]);
        const startTime = formatHourTo12Hour(hour);
        const endTime = formatHourTo12Hour((hour + 1) % 24);
        const timeSlot = `${startTime}-${endTime}`;
        timeSlots[timeSlot] = (timeSlots[timeSlot] || 0) + 1;
      }
    });

    return Object.entries(timeSlots).map(([time, count]) => ({
      time,
      count,
      percentage: ((count / guests.length) * 100).toFixed(1)
    })).sort((a, b) => {
      // Sort by the starting hour for proper chronological order
      const aHour = parseInt(a.time.split(':')[0]);
      const aAmPm = a.time.includes('PM') ? 'PM' : 'AM';
      const bHour = parseInt(b.time.split(':')[0]);
      const bAmPm = b.time.includes('PM') ? 'PM' : 'AM';
      
      // Convert to 24-hour for proper sorting
      const a24Hour = aAmPm === 'AM' ? (aHour === 12 ? 0 : aHour) : (aHour === 12 ? 12 : aHour + 12);
      const b24Hour = bAmPm === 'AM' ? (bHour === 12 ? 0 : bHour) : (bHour === 12 ? 12 : bHour + 12);
      
      return a24Hour - b24Hour;
    });
  };

  const calculateAgeStats = (guests) => {
    const ageGroups = {
      'Under 18': 0,
      '18-24': 0,
      '25-34': 0,
      '35-44': 0,
      '45-54': 0,
      '55 and above': 0,
      'Not specified': 0
    };

    guests.forEach(guest => {
      // Use the ageGroup field from the form data
      const ageGroup = guest.ageGroup;
      
      if (ageGroup && ageGroups.hasOwnProperty(ageGroup)) {
        ageGroups[ageGroup]++;
      } else {
        ageGroups['Not specified']++;
      }
    });

    return Object.entries(ageGroups).map(([range, count]) => ({
      range,
      count,
      percentage: count > 0 ? ((count / guests.length) * 100).toFixed(1) : '0'
    })).filter(item => item.count > 0);
  };

  if (loading) {
    return <DataLoader />;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-container">
        <div className="sticky-header">
          <h2 className="header-title">Event Analytics: {event.title}</h2>
          <button onClick={onClose} className="close-button">
            <X size={24} />
          </button>
        </div>

        <div className="eventStatesContent">
          {stats.totalGuests === 0 ? (
            <div className="no-data-message">
              <p className="no-data-text">No guest data available for analytics</p>
            </div>
          ) : (
            <div>
              {/* Key Metrics */}
              <div className="stats-grid">
                <div className="stat-card total-attendees">
                  <div className="stat-card-header">
                    <Users size={24} className="stat-card-icon total" />
                    <h3 className="stat-card-title total">Total Attendees</h3>
                  </div>
                  <p className="stat-card-value total">{stats.totalGuests}</p>
                </div>
                <div className="stat-card new-attendees">
                  <div className="stat-card-header">
                    <UserPlus size={24} className="stat-card-icon new" />
                    <h3 className="stat-card-title new">New Attendees</h3>
                  </div>
                  <p className="stat-card-value new">
                    {stats.returnVsNew.find(item => item.name === 'New Visitors')?.value || 0}
                  </p>
                </div>
                <div className="stat-card return-attendees">
                  <div className="stat-card-header">
                    <RotateCcw size={24} className="stat-card-icon return" />
                    <h3 className="stat-card-title return">Return Attendees</h3>
                  </div>
                  <p className="stat-card-value return">
                    {stats.returnVsNew.find(item => item.name === 'Return Visitors')?.value || 0}
                  </p>
                </div>
                <div className="stat-card peak-attendance">
                  <div className="stat-card-header">
                    <Clock size={24} className="stat-card-icon peak" />
                    <h3 className="stat-card-title peak">Peak Attendance</h3>
                  </div>
                  <p className="stat-card-value peak">
                    {stats.checkInTimeStats.length > 0 
                      ? stats.checkInTimeStats.reduce((max, current) => max.count > current.count ? max : current).time
                      : 'N/A'
                    }
                  </p>
                </div>
              </div>

              {/* Charts Grid */}
              <div className="charts-grid">
                {/* Gender Distribution */}
                {stats.genderStats.length > 0 && (
                  <div className="chart-card">
                    <h3 className="chart-title">Gender Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={stats.genderStats}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percentage }) => `${name}: ${percentage}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {stats.genderStats.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Check-in Time Distribution */}
                {stats.checkInTimeStats.length > 0 && (
                  <div className="chart-card">
                    <h3 className="chart-title">Attendance Pattern</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats.checkInTimeStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" angle={-45} textAnchor="end" height={100} />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#FF8042" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}

                {/* Age Demographics */}
                {stats.ageStats.length > 0 && (
                  <div className="chart-card">
                    <h3 className="chart-title">Age Demographics</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={stats.ageStats}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill="#00C49F" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventStatsModal;