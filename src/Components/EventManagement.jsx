/* eslint-disable react/prop-types */
"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import "./styling/EventManagement.css"
import DataLoader from "./dataLoader"

const role = localStorage.getItem('role')
// Alert Component for confirmations
const AlertDialog = ({ title, message, onConfirm, onCancel }) => {
  return (
    <div className="modal-overlay">
      <div className="alert-dialog">
        <div className="alert-header">
          <h3>{title}</h3>
        </div>
        <div className="alert-content">
          <p>{message}</p>
        </div>
        <div className="alert-actions">
          <button className="button-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="button-danger" onClick={onConfirm}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

// Event Modal Component (used for both Add and Edit)
const EventModal = ({ event = null, onClose, onSave }) => {
  const isEditMode = !!event

  const [eventInfo, setEventInfo] = useState({
    title: event?.title || "",
    date: event?.date || "",
    time: event?.time || "",
    location: event?.location || "",
    description: event?.description || "",
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(eventInfo, isEditMode ? event.eventId : null)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{isEditMode ? "Edit Event" : "Add Event"}</h2>
          <button className="modal-close-button" onClick={onClose}>
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-field">
            <label htmlFor="title">Event Title</label>
            <input
              id="title"
              type="text"
              placeholder="Enter event title"
              value={eventInfo.title}
              onChange={(e) => setEventInfo({ ...eventInfo, title: e.target.value })}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="date">Date</label>
            <input
              id="date"
              type="date"
              value={eventInfo.date}
              onChange={(e) => setEventInfo({ ...eventInfo, date: e.target.value })}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="time">Time</label>
            <input
              id="time"
              type="time"
              value={eventInfo.time}
              onChange={(e) => setEventInfo({ ...eventInfo, time: e.target.value })}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              type="text"
              placeholder="Enter location"
              value={eventInfo.location}
              onChange={(e) => setEventInfo({ ...eventInfo, location: e.target.value })}
              required
            />
          </div>

          <div className="form-field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              placeholder="Enter event description"
              value={eventInfo.description}
              onChange={(e) => setEventInfo({ ...eventInfo, description: e.target.value })}
              rows="3"
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="button-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="button-primary">
              {isEditMode ? "Update Event" : "Save Event"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 3000)

    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`toast ${type}`}>
      <div className="toast-content">
        <span>{message}</span>
      </div>
      <button className="toast-close" onClick={onClose}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"></path>
        </svg>
      </button>
    </div>
  )
}

// Event Table Component
const EventTable = ({ data, refreshData }) => {
  const [expandedEventId, setExpandedEventId] = useState(null)
  const [showEventModal, setShowEventModal] = useState(false)
  const [currentEvent, setCurrentEvent] = useState(null)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [eventToDelete, setEventToDelete] = useState(null)
  const [toast, setToast] = useState(null)

  if (!data || !Array.isArray(data.eventsWithGuests)) {
    return <div className="error-message">No data available or data format is incorrect.</div>
  }

  const toggleExpand = (eventId, e) => {
    // Prevent toggling when clicking action buttons
    if (e.target.closest(".event-actions")) {
      e.stopPropagation()
      return
    }
    setExpandedEventId(expandedEventId === eventId ? null : eventId)
  }

  const handleAddEvent = () => {
    setCurrentEvent(null)
    setShowEventModal(true)
  }

  const handleEditEvent = (event, e) => {
    e.stopPropagation()
    setCurrentEvent(event)
    setShowEventModal(true)
  }

  // const handleDeleteEvent = (event, e) => {
  //   e.stopPropagation()
  //   setEventToDelete(event)
  //   setShowDeleteAlert(true)
  // }

  const confirmDeleteEvent = async () => {
    try {
      const token = localStorage.getItem("authToken")
      await axios.delete(`https://timemanagementsystemserver.onrender.com/api/events/${eventToDelete.eventId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      setToast({
        message: "Event deleted successfully",
        type: "success",
      })

      refreshData()
    } catch (error) {
      setToast({
        message: `Error deleting event: ${error.message}`,
        type: "error",
      })
    } finally {
      setShowDeleteAlert(false)
      setEventToDelete(null)
    }
  }

  const handleSaveEvent = async (eventInfo, eventId) => {
    try {
      const token = localStorage.getItem("authToken")
      const isEditMode = !!eventId

      if (isEditMode) {
        // Update existing event
        await axios.put(`https://timemanagementsystemserver.onrender.com/api/events/${eventId}`, eventInfo, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setToast({
          message: "Event updated successfully",
          type: "success",
        })
      } else {
        // Create new event
        await axios.post("https://timemanagementsystemserver.onrender.com/api/guests/generate-event-QR", eventInfo, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        setToast({
          message: "Event created successfully",
          type: "success",
        })
      }

      refreshData()
    } catch (error) {
      setToast({
        message: `Error ${eventId ? "updating" : "creating"} event: ${error.message}`,
        type: "error",
      })
    }
  }

  return (
    <div className="event-table-container">
      <div className="event-table-header">
        <h2>
          Planned Events
        </h2>
        {role !== 'facilitator' && (
          <button className="add-event-button" onClick={handleAddEvent}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"></path>
          </svg>
          Add Event
        </button>
        )}
      </div>

      <div className="accordion">
        {data.eventsWithGuests.map((event) => (
          <div key={event.eventId} className={`accordion-item ${expandedEventId === event.eventId ? "expanded" : ""}`}>
            <div
              className="accordion-header"
              onClick={(e) => toggleExpand(event.eventId, e)}
              aria-expanded={expandedEventId === event.eventId}
              aria-controls={`event-${event.eventId}-content`}
              id={`event-${event.eventId}-header`}
            >
              <div className="accordion-header-content">
                <div className="accordion-title">{event.title}</div>
                <div className="accordion-subtitle">{event.guestDetails?.length || 0} guests registered</div>
              </div>
              <div className="event-actions">
                {role !== 'facilitator' && (
                  <>
                  <button
                  className="action-button edit-button"
                  onClick={(e) => handleEditEvent(event, e)}
                  aria-label="Edit event"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"></path>
                  </svg>
                </button>
                {/* <button
                  className="action-button delete-button"
                  onClick={(e) => handleDeleteEvent(event, e)}
                  aria-label="Delete event"
                >
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"></path>
                  </svg>
                </button> */}
                  </>
                )}
                <div className="accordion-icon">
                  <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                    <path d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"></path>
                  </svg>
                </div>
              </div>
            </div>

            <div
              className="accordion-details"
              id={`event-${event.eventId}-content`}
              aria-labelledby={`event-${event.eventId}-header`}
            >
              <div className="accordion-content">
                <div className="event-details">
                  {event.date && (
                    <div className="event-detail">
                      <strong>Date:</strong> {event.date}
                    </div>
                  )}
                  {event.time && (
                    <div className="event-detail">
                      <strong>Time:</strong> {event.time}
                    </div>
                  )}
                  {event.location && (
                    <div className="event-detail">
                      <strong>Location:</strong> {event.location}
                    </div>
                  )}
                  {event.description && (
                    <div className="event-detail">
                      <strong>Description:</strong> {event.description}
                    </div>
                  )}
                </div>

                <h3 className="guest-list-title">Guest List</h3>
                {event.guestDetails && event.guestDetails.length > 0 ? (
                  <div className="guest-table-wrapper">
                    <table className="guest-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Email</th>
                          <th>Phone</th>
                          {role !== 'facilitator' && (<th>ID Number</th>)}
                          {role !== 'facilitator' && (<th>Check-In Date</th>)}
                          <th>Check-In Time</th>
                          <th>Last Visit</th>
                        </tr>
                      </thead>
                      <tbody>
                        {event.guestDetails.map((guest) => (
                          <tr key={guest.guestId}>
                            <td>{guest.fullNames}</td>
                            <td>{guest.email}</td>
                            <td>{guest.cellPhone}</td>
                            {role !== 'facilitator' && (<td>{guest.idNumber}</td>)}
                            {role !== 'facilitator' && (<td>{guest.checkInDate}</td>)}
                            <td>{guest.checkInTime}</td>
                            <td>{guest.lastVisit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="no-guests">No guest details available.</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {showEventModal && (
        <EventModal event={currentEvent} onClose={() => setShowEventModal(false)} onSave={handleSaveEvent} />
      )}

      {showDeleteAlert && (
        <AlertDialog
          title="Confirm Delete"
          message={`Are you sure you want to delete the event "${eventToDelete.title}"? This action cannot be undone.`}
          onConfirm={confirmDeleteEvent}
          onCancel={() => setShowDeleteAlert(false)}
        />
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  )
}

const EventManagement = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchData = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("authToken")
      const response = await axios.get("https://timemanagementsystemserver.onrender.com/api/guests/getGuests", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setData(response.data)
      setError(null)
    } catch (error) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading)
    return (
      <DataLoader/>
    )
  if (error) return <div className="error">Error: {error}</div>

  return <EventTable data={data} refreshData={fetchData} />
}

export default EventManagement



/*
For adding an event: api/guests/generate-event-QR

For closing an event: api/guests/events/close

Post method 

Body {eventId: "pass the event id here "}
*/