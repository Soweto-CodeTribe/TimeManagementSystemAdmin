import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DataLoader from './dataLoader';
import './styling/Tickets.css'; // Updated CSS file with prefixed class names
import axios from 'axios';
import { Search, RotateCcw  } from 'lucide-react'

const Tickets = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [updateMode, setUpdateMode] = useState(false);
  const [updatedTicketData, setUpdatedTicketData] = useState({
    status: '',
    priority: ''
  });
  const [ticketStats, setTicketStats] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [closeNote, setCloseNote] = useState('');
  const [reassignTarget, setReassignTarget] = useState('');
  const [facilitators, setFacilitators] = useState([]);
  
  const token = useSelector(state => state.auth.token);
  const API_BASE_URL = 'https://timemanagementsystemserver.onrender.com/api';

  useEffect(() => {
    fetchTickets();
    fetchTicketStats();
    
  }, [token]);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setTickets(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      setLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTicketStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setTicketStats(response.data);
    } catch (err) {
      console.error("Error fetching ticket stats:", err);
    }
  };


  const fetchTicketDetails = async (ticketId) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets/${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setSelectedTicket(response.data);
      setUpdatedTicketData({
        status: response.data.status,
        priority: response.data.priority
      });
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTicket = async () => {
    if (!selectedTicket) return;
    setIsLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/tickets/${selectedTicket.id}`,
        updatedTicketData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket.id === selectedTicket.id ? { ...ticket, ...response.data } : ticket
        )
      );
      setSelectedTicket({ ...selectedTicket, ...response.data });
      setUpdateMode(false);
      fetchTickets();
      fetchTicketStats();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const resolveTicket = async () => {
    if (!selectedTicket) return;
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/tickets/${selectedTicket.id}/resolve`,
        { resolution: resolutionNote },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket.id === selectedTicket.id ? { ...ticket, status: 'resolved' } : ticket
        )
      );
      setSelectedTicket({ ...selectedTicket, status: 'resolved' });
      setResolutionNote('');
      fetchTickets();
      fetchTicketStats();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const closeTicket = async () => {
    if (!selectedTicket) return;
    setIsLoading(true);
    try {
      const response = await axios.post(
        `${API_BASE_URL}/tickets/${selectedTicket.id}/close`,
        { notes: closeNote },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket.id === selectedTicket.id ? { ...ticket, status: 'closed' } : ticket
        )
      );
      setSelectedTicket({ ...selectedTicket, status: 'closed' });
      setCloseNote('');
      fetchTickets();
      fetchTicketStats();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  
  const handleDeleteTicket = async () => {
    if (!selectedTicket) return;
    if (!window.confirm('Are you sure you want to delete this ticket? This action cannot be undone.')) {
      return;
    }
    
    setIsLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/tickets/${selectedTicket.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setTickets(prevTickets => prevTickets.filter(ticket => ticket.id !== selectedTicket.id));
      closeDetailView();
      fetchTicketStats();
    } catch (error) {
      setError(error.response?.data?.error || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdatedTicketData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Calculate metrics from tickets or use stats from API
  const totalTickets = ticketStats?.total || tickets.length;
  const openTickets = ticketStats?.byStatus?.open || tickets.filter(ticket => ticket.status === 'open').length;
  const closedTickets = ticketStats?.byStatus?.closed || tickets.filter(ticket => ticket.status === 'closed').length;
  const highPriorityTickets = ticketStats?.byPriority?.high || tickets.filter(ticket => ticket.priority === 'high').length;

  // Filter tickets based on search term
  const filteredTickets = tickets.filter(ticket =>
    ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.priority?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.traineeName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTickets.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Format date to be more readable
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const handleRowClick = (ticket) => {
    fetchTicketDetails(ticket.id);
  };

  const closeDetailView = () => {
    setSelectedTicket(null);
    setUpdateMode(false);
    setResolutionNote('');
    setCloseNote('');
    setReassignTarget('');
  };

  if (loading && !selectedTicket) return <DataLoader />;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="tickets-session-container">
      {/* Metrics Section */}
      <div className="tickets-metrics-grid">
        <div className="tickets-metric-card blue">
          <div className="tickets-metric-header">
            <div className="tickets-metric-icon blue">
              <div className="tickets-metric-dot blue"></div>
            </div>
            <span className="tickets-metric-label blue">Total Tickets</span>
          </div>
          <div className="tickets-metric-value blue">{totalTickets}</div>
        </div>
        <div className="tickets-metric-card green">
          <div className="tickets-metric-header">
            <div className="tickets-metric-icon green">
              <div className="tickets-metric-dot green"></div>
            </div>
            <span className="tickets-metric-label green">Open Tickets</span>
          </div>
          <div className="tickets-metric-value green">{openTickets}</div>
        </div>
        <div className="tickets-metric-card red">
          <div className="tickets-metric-header">
            <div className="tickets-metric-icon red">
              <div className="tickets-metric-dot red"></div>
            </div>
            <span className="tickets-metric-label red">Closed Tickets</span>
          </div>
          <div className="tickets-metric-value red">{closedTickets}</div>
        </div>
        <div className="tickets-metric-card yellow">
          <div className="tickets-metric-header">
            <div className="tickets-metric-icon yellow">
              <div className="tickets-metric-dot yellow"></div>
            </div>
            <span className="tickets-metric-label yellow">High Priority</span>
          </div>
          <div className="tickets-metric-value yellow">{highPriorityTickets}</div>
        </div>
      </div>

      {/* Detail View */}
      {selectedTicket && (
        <div className="tickets-ticket-detail-overlay">
          <div className="tickets-ticket-detail-container">
            <div className="tickets-ticket-detail-header">
              <h3>Ticket Details</h3>
              <button onClick={closeDetailView} className="tickets-close-button">X</button>
            </div>
            {isLoading ? (
              <div className="tickets-detail-loading"><DataLoader /></div>
            ) : (
              <div className="tickets-ticket-detail-content">
                {updateMode ? (
                  <div className="tickets-update-form">
                    <h4>Update Ticket</h4>
                    <div className="tickets-form-group">
                      <label>Status:</label>
                      <select
                        name="status"
                        value={updatedTicketData.status}
                        onChange={handleInputChange}
                        className="tickets-form-select"
                      >
                        <option value="open">Open</option>
                        <option value="inProgress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </div>
                    <div className="tickets-form-group">
                      <label>Priority:</label>
                      <select
                        name="priority"
                        value={updatedTicketData.priority}
                        onChange={handleInputChange}
                        className="tickets-form-select"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                    <div className="tickets-form-group">
                      <label>Notes:</label>
                      <textarea
                        name="notes"
                        value={updatedTicketData.notes || ''}
                        onChange={handleInputChange}
                        className="tickets-form-textarea"
                        placeholder="Add notes..."
                      ></textarea>
                    </div>
                    <div className="tickets-form-actions">
                      <button onClick={() => setUpdateMode(false)} className="tickets-cancel-button">
                        Cancel
                      </button>
                      <button onClick={updateTicket} className="tickets-save-button">
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="tickets-detail-row">
                      <strong>ID:</strong> {selectedTicket.id}
                    </div>
                    <div className="tickets-detail-row">
                      <strong>Title:</strong> {selectedTicket.title}
                    </div>
                    <div className="tickets-detail-row">
                      <strong>Description:</strong> {selectedTicket.description}
                    </div>
                    <div className="tickets-detail-row">
                      <strong>Status:</strong>
                      <span
                        className={`tickets-status-badge ${selectedTicket.status}`}
                      >
                        {selectedTicket.status}
                      </span>
                    </div>
                    <div className="tickets-detail-row">
                      <strong>Priority:</strong>
                      <span
                        className={`tickets-priority-badge ${selectedTicket.priority}`}
                      >
                        {selectedTicket.priority}
                      </span>
                    </div>
                    <div className="tickets-detail-row">
                      <strong>Category:</strong> {selectedTicket.category?.replace('_', ' ')}
                    </div>
                    <div className="tickets-detail-row">
                      <strong>Submitted By:</strong> {selectedTicket.traineeDetails?.name || selectedTicket.submittedBy || selectedTicket.traineeName}
                    </div>
                    
                    <div className="tickets-detail-row">
                      <strong>Created:</strong> {formatDate(selectedTicket.createdAt)}
                    </div>
                    <div className="tickets-detail-row">
                      <strong>Updated:</strong> {formatDate(selectedTicket.updatedAt)}
                    </div>
                    
                    {/* Ticket History Section */}
                    {selectedTicket.history && selectedTicket.history.length > 0 && (
                      <div className="tickets-history-section">
                        <h4>Ticket History</h4>
                        <div className="tickets-history-list">
                          {selectedTicket.history.map((entry, index) => (
                            <div key={index} className="tickets-history-item">
                              <div className="tickets-history-timestamp">
                                {formatDate(entry.timestamp)}
                              </div>
                              <div className="tickets-history-facilitator">
                                {entry.facilitatorName}
                              </div>
                              <div className="tickets-history-changes">
                                {Object.entries(entry.changes).map(([field, change], i) => (
                                  <div key={i} className="tickets-history-change">
                                    <span className="tickets-change-field">{field}:</span> 
                                    <span className="tickets-change-from">{change.from || 'none'}</span> → 
                                    <span className="tickets-change-to">{change.to}</span>
                                  </div>
                                ))}
                                {entry.resolution && (
                                  <div className="tickets-history-resolution">
                                    Resolution: {entry.resolution}
                                  </div>
                                )}
                                {entry.closingNotes && (
                                  <div className="tickets-history-closing-notes">
                                    Closing Notes: {entry.closingNotes}
                                  </div>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {/* Action Tabs */}
                    <div className="tickets-action-tabs">
                      <div className="tickets-tab-container">
                        <button className="tickets-tab-button" onClick={() => setUpdateMode(true)}>
                          Update
                        </button>
                        
                        {/* Resolve Ticket Section */}
                        {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                          <div className="tickets-action-section">
                            <h4>Resolve Ticket</h4>
                            <div className="tickets-form-group">
                              <textarea
                                placeholder="Resolution notes..."
                                value={resolutionNote}
                                onChange={(e) => setResolutionNote(e.target.value)}
                                className="tickets-form-textarea"
                              ></textarea>
                            </div>
                            <button onClick={resolveTicket} className="tickets-resolve-button">
                              Mark as Resolved
                            </button>
                          </div>
                        )}
                        
                        {/* Close Ticket Section */}
                        {selectedTicket.status !== 'closed' && (
                          <div className="tickets-action-section">
                            <h4>Close Ticket</h4>
                            <div className="tickets-form-group">
                              <textarea
                                placeholder="Closing notes..."
                                value={closeNote}
                                onChange={(e) => setCloseNote(e.target.value)}
                                className="tickets-form-textarea"
                              ></textarea>
                            </div>
                            <button onClick={closeTicket} className="tickets-close-ticket-button">
                              Close Ticket
                            </button>
                          </div>
                        )}
                        
                        
                        {/* Delete Button */}
                        <div className="tickets-action-section">
                          <button onClick={handleDeleteTicket} className="tickets-delete-button">
                            Delete Ticket
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="tickets-table-container">
        <div className="tickets-table-header">
          <h3 className="tickets-table-title">Support Tickets</h3>
          <div className="tickets-table-actions">
            <div className="tickets-search-wrapper">
            <Search className="search-icon" />
              <input
                type="text"
                className="tickets-search-input"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            {/* <button className="tickets-btn" onClick={() => fetchTickets()}>
              <RotateCcw />
              Refresh
            </button> */}
          </div>
        </div>
        <div className="tickets-table-wrapper">
          <table className="tickets-attendance-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Category</th>
                <th>Created</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.length > 0 ? (
                currentItems.map((ticket) => (
                  <tr
                    key={ticket.id}
                    onClick={() => handleRowClick(ticket)}
                    className="tickets-clickable-row"
                  >
                    <td>{ticket.traineeDetails?.name || ticket.traineeName}</td>
                    <td>{ticket.title}</td>
                    <td>
                      <span
                        className={`tickets-status-badge ${ticket.status}`}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: (() => {
                            switch(ticket.status) {
                              case 'open': return '#e6fff0';
                              case 'inProgress': return '#e6f7ff';
                              case 'resolved': return '#fff9e6';
                              case 'closed': return '#ffe6e6';
                              default: return '#e6fff0';
                            }
                          })(),
                          color: (() => {
                            switch(ticket.status) {
                              case 'open': return '#34a853';
                              case 'inProgress': return '#4285f4';
                              case 'resolved': return '#fbbc05';
                              case 'closed': return '#ea4335';
                              default: return '#34a853';
                            }
                          })(),
                        }}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`tickets-priority-badge ${ticket.priority}`}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: (() => {
                            switch(ticket.priority) {
                              case 'low': return '#e6f0ff';
                              case 'medium': return '#e6f7ff';
                              case 'high': return '#fff9e6';
                              case 'urgent': return '#ffe6e6';
                              default: return '#e6f0ff';
                            }
                          })(),
                          color: (() => {
                            switch(ticket.priority) {
                              case 'low': return '#4285f4';
                              case 'medium': return '#34a853';
                              case 'high': return '#fbbc05';
                              case 'urgent': return '#ea4335';
                              default: return '#4285f4';
                            }
                          })(),
                        }}
                      >
                        {ticket.priority}
                      </span>
                    </td>
                    <td>{ticket.category?.replace('_', ' ')}</td>
                    <td>{formatDate(ticket.createdAt)}</td>
                    <td>{formatDate(ticket.updatedAt)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="tickets-no-data">
                    {isLoading ? "Loading tickets..." : "No tickets found"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="tickets-pagination-container">
            <div className="tickets-pagination-controls">
              <button
                className="tickets-pagination-arrow"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                ◀
              </button>
              {[...Array(totalPages).keys()].map(number => (
                <button
                  key={number + 1}
                  onClick={() => paginate(number + 1)}
                  className={`tickets-pagination-number ${currentPage === number + 1 ? 'active' : ''}`}
                >
                  {number + 1}
                </button>
              ))}
              <button
                className="tickets-pagination-arrow"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                ▶
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tickets;