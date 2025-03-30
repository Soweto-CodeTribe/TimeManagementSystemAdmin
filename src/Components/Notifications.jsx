// import React, { useEffect, useState } from 'react';
// import { FiSearch, FiX } from 'react-icons/fi';
// import './styling/NotificationsPanel.css';

// const NotificationsPanel = () => {
//   const [activities, setActivities] = useState([]); // State to store live activities
//   const [loading, setLoading] = useState(true); // State to track loading
//   const [error, setError] = useState(null); // State to track errors
//   const [searchQuery, setSearchQuery] = useState(''); // State for search input

//   // Fetch live activities from the backend
//   useEffect(() => {
//     const fetchLiveActivities = async () => {
//       try {
//         setLoading(true);
//         setError(null);

//         const response = await fetch('https://timemanagementsystemserver.onrender.com/api/session/live-trainees'); // Replace with your backend endpoint
//         if (!response.ok) {
//           throw new Error('Failed to fetch live activities');
//         }

//         const data = await response.json();
//         setActivities(data.activities || []); // Set activities or an empty array if none
//       } catch (err) {
//         setError(err.message);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchLiveActivities();
//   }, []); // Empty dependency array ensures this runs once when the component mounts

//   // Clear the search query
//   const clearSearch = () => {
//     setSearchQuery('');
//   };

//   // Format timestamp
//   const formatTime = (timestamp) => {
//     if (timestamp) {
//       const date = new Date(timestamp);
//       return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
//     }
//     return 'N/A';
//   };

//   // Filter activities based on the search query
//   const filteredActivities = activities.filter((activity) => {
//     return (
//       activity.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       activity.location?.toLowerCase().includes(searchQuery.toLowerCase())
//     );
//   });

//   if (loading) return <p>Loading live activities...</p>;
//   if (error) return <p>Error: {error}</p>;

//   return (
//     <div className="notifications-panel">
//       <div className="notifications-header">
//         <h2>Live Activities</h2>
//       </div>

//       <div className="search-bar">
//         <div className="search-icon">
//           <FiSearch />
//         </div>
//         <input
//           type="text"
//           className="search-input"
//           placeholder="Search activities..."
//           value={searchQuery}
//           onChange={(e) => setSearchQuery(e.target.value)}
//         />
//         {searchQuery && (
//           <div className="clear-search" onClick={clearSearch}>
//             <FiX />
//           </div>
//         )}
//       </div>

//       {filteredActivities.length === 0 ? (
//         <div className="empty-state">No live activities found.</div>
//       ) : (
//         <ul className="notifications-list">
//           {filteredActivities.map((activity) => (
//             <li key={activity.traineeId} className="notification-item">
//               <div className="notification-content">
//                 <div className="notification-title">
//                   {activity.name} - {activity.location}
//                 </div>
//                 <p className="notification-message">
//                   {activity.lunchStatus || 'Working'} at {formatTime(activity.lastUpdated)}
//                 </p>
//                 <div className="notification-meta">
//                   <span>{activity.currentDate}</span>
//                 </div>
//               </div>
//             </li>
//           ))}
//         </ul>
//       )}
//     </div>
//   );
// };

// export default NotificationsPanel;

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiSearch, FiX } from 'react-icons/fi';
import './styling/NotificationsPanel.css';

const NotificationsPanel = () => {
  const [activities, setActivities] = useState([]); // State to store live activities
  const [loading, setLoading] = useState(true); // State to track loading
  const [error, setError] = useState(null); // State to track errors
  const [searchQuery, setSearchQuery] = useState(''); // State for search input

  // Fetch live activities from the backend
  useEffect(() => {
    const fetchLiveActivities = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get location from localStorage
        const location = localStorage.getItem('Location');

        // Determine the endpoint based on location
        const endpoint = location
          ? `https://timemanagementsystemserver.onrender.com/api/session/trainees-by-location?location=${encodeURIComponent(location)}`
          : 'https://timemanagementsystemserver.onrender.com/api/session/live-trainees';

        // Fetch data using axios
        const response = await axios.get(endpoint);
        setActivities(response.data.activities || []); // Set activities or an empty array if none
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch live activities');
      } finally {
        setLoading(false);
      }
    };

    fetchLiveActivities();
  }, []); // Empty dependency array ensures this runs once when the component mounts

  // Clear the search query
  const clearSearch = () => {
    setSearchQuery('');
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    if (timestamp) {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return 'N/A';
  };

  // Filter activities based on the search query
  const filteredActivities = activities.filter((activity) => {
    return (
      activity.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.location?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  if (loading) return <p>Loading live activities...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="notifications-panel">
      <div className="notifications-header">
        <h2>Live Activities</h2>
      </div>

      <div className="search-bar">
        <div className="search-icon">
          <FiSearch />
        </div>
        <input
          type="text"
          className="search-input"
          placeholder="Search activities..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        {searchQuery && (
          <div className="clear-search" onClick={clearSearch}>
            <FiX />
          </div>
        )}
      </div>

      {filteredActivities.length === 0 ? (
        <div className="empty-state">No live activities found.</div>
      ) : (
        <ul className="notifications-list">
          {filteredActivities.map((activity) => (
            <li key={activity.traineeId} className="notification-item">
              <div className="notification-content">
                <div className="notification-title">
                  {activity.name} - {activity.location}
                </div>
                <p className="notification-message">
                  {activity.lunchStatus || 'Working'} at {formatTime(activity.lastUpdated)}
                </p>
                <div className="notification-meta">
                  <span>{activity.currentDate}</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default NotificationsPanel;