import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import './styling/EventManagement.css';
import axios from 'axios';

const EventAccordion = ({ data }) => {
  const [activeEventId, setActiveEventId] = useState(null);

  if (!data || !Array.isArray(data.eventsWithGuests)) {
    return <div className="error-message">No data available or data format is incorrect.</div>;
  }

  const toggleAccordion = (eventId) => {
    setActiveEventId(activeEventId === eventId ? null : eventId);
  };

  return (
    <div className="accordion-container">
      {data.eventsWithGuests.map((event) => (
        <div key={event.eventId} className={`accordion-item ${activeEventId === event.eventId ? 'active' : ''}`}>
          <div 
            className="accordion-title" 
            onClick={() => toggleAccordion(event.eventId)}
          >
            {event.title} {activeEventId === event.eventId ? '🔽' : '▶️'}
          </div>
          {activeEventId === event.eventId && event.guestDetails?.length > 0 && (
            <div className="accordion-content">
              {event.guestDetails.map((guest) => (
                <div key={guest.guestId} className="guest-details">
                  <p><strong>Name:</strong> {guest.fullNames}</p>
                  <p><strong>Email:</strong> {guest.email}</p>
                  <p><strong>Phone:</strong> {guest.cellPhone}</p>
                  <p><strong>ID Number:</strong> {guest.IDNumber}</p>
                  <p><strong>Check-In Date:</strong> {guest.checkInDate}</p>
                  <p><strong>Check-In Time:</strong> {guest.checkInTime}</p>
                  <p><strong>Last Visit:</strong> {guest.lastVisit}</p>
                </div>
              ))}
            </div>
          )}
          {activeEventId === event.eventId && (!event.guestDetails || event.guestDetails.length === 0) && (
            <div className="no-guests">No guest details available.</div>
          )}
        </div>
      ))}
    </div>
  );
};

EventAccordion.propTypes = {
  data: PropTypes.shape({
    eventsWithGuests: PropTypes.arrayOf(
      PropTypes.shape({
        eventId: PropTypes.number.isRequired,
        title: PropTypes.string.isRequired,
        guestDetails: PropTypes.arrayOf(
          PropTypes.shape({
            guestId: PropTypes.number.isRequired,
            fullNames: PropTypes.string.isRequired,
            email: PropTypes.string,
            cellPhone: PropTypes.string,
            IDNumber: PropTypes.string,
            checkInDate: PropTypes.string,
            checkInTime: PropTypes.string,
            lastVisit: PropTypes.string,
          })
        )
      })
    )
  })
};

const EventManagement = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const token = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('https://timemanagementsystemserver.onrender.com/api/guests/getGuests', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setData(response.data); 
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="event-management-body">
      <h2>📅 Upcoming Events</h2>
      <EventAccordion data={data} />
    </div>
  );
};

export default EventManagement;
