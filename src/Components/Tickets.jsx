/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Search, X, Send, Ticket, FolderClosed, FolderOpen, Flag } from 'lucide-react';
import axios from 'axios';
import DataLoader from './dataLoader';
import './styling/Tickets.css';

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
  const [updatedTicketData, setUpdatedTicketData] = useState({});
  const [ticketStats, setTicketStats] = useState(null);
  const [resolutionNote, setResolutionNote] = useState('');
  const [closeNote, setCloseNote] = useState('');
  const [responseType, setResponseType] = useState('reply');
  const [responseMessage, setResponseMessage] = useState('');
  const token = useSelector(state => state.auth.token);
  const API_BASE_URL = 'https://timemanagementsystemserver.onrender.com/api';

  useEffect(() => {
    fetchTickets();
    fetchTicketStats();
  }, [token]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchTickets = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(response.data);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  const fetchTicketStats = useCallback(async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTicketStats(response.data);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    }
  }, [token]);

  const fetchTicketDetails = useCallback(async (ticketId) => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/tickets/${ticketId}`, {
        headers: { Authorization: `Bearer ${token}` }
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
  }, [token]);

  const updateTicket = useCallback(async () => {
    if (!selectedTicket) return;
    setIsLoading(true);
    try {
      const response = await axios.put(
        `${API_BASE_URL}/tickets/${selectedTicket.id}`,
        updatedTicketData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setTickets(prev => prev.map(t => 
        t.id === selectedTicket.id ? { ...t, ...response.data } : t
      ));
      setSelectedTicket(prev => ({ ...prev, ...response.data }));
      setUpdateMode(false);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTicket, updatedTicketData, token]);

  const resolveTicket = useCallback(async () => {
    if (!selectedTicket) return;
    setIsLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/tickets/${selectedTicket.id}/resolve`,
        { resolution: resolutionNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTickets(prev => prev.map(t => 
        t.id === selectedTicket.id ? { ...t, status: 'resolved' } : t
      ));
      setSelectedTicket(prev => ({ ...prev, status: 'resolved' }));
      setResolutionNote('');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTicket, resolutionNote, token]);

  const closeTicket = useCallback(async () => {
    if (!selectedTicket) return;
    setIsLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/tickets/${selectedTicket.id}/close`,
        { notes: closeNote },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTickets(prev => prev.map(t => 
        t.id === selectedTicket.id ? { ...t, status: 'closed' } : t
      ));
      setSelectedTicket(prev => ({ ...prev, status: 'closed' }));
      setCloseNote('');
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTicket, closeNote, token]);

  const deleteTicket = useCallback(async () => {
    if (!selectedTicket) return;
    if (!window.confirm('Are you sure? This cannot be undone.')) return;
    
    setIsLoading(true);
    try {
      await axios.delete(`${API_BASE_URL}/tickets/${selectedTicket.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTickets(prev => prev.filter(t => t.id !== selectedTicket.id));
      closeDetailView();
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTicket, token]);

  const sendResponse = useCallback(async () => {
    if (!selectedTicket || !responseMessage.trim()) return;
    
    setIsLoading(true);
    try {
      await axios.post(
        `${API_BASE_URL}/tickets/${selectedTicket.id}/respond`,
        { type: responseType, message: responseMessage },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setResponseMessage('');
      fetchTicketDetails(selectedTicket.id);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedTicket, responseType, responseMessage, token]);

  const handleInputChange = useCallback((e) => {
    setUpdatedTicketData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }, []);

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket =>
      Object.values(ticket).some(val => 
        String(val).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [tickets, searchTerm]);

  const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  const currentItems = useMemo(() => 
    filteredTickets.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    ), [filteredTickets, currentPage, itemsPerPage]
  );

  const handleRowClick = useCallback((ticket) => {
    fetchTicketDetails(ticket.id);
  }, [fetchTicketDetails]);

  const closeDetailView = useCallback(() => {
    setSelectedTicket(null);
    setUpdateMode(false);
    setResolutionNote('');
    setCloseNote('');
    setResponseType('reply');
    setResponseMessage('');
  }, []);

  if (loading && !selectedTicket) return <DataLoader />;
  if (error) return <div className="error-message">Error: {error}</div>;

  return (
    <div className="tickets-session-container">
      {/* Metrics Section */}
      <div className="UM-title-section">
        <h1>Tickets</h1>
        <p>Manage support tickets and track resolutions</p>
      </div>
      
      {/* Ticket Metrics */}
      <div className="tickets-metrics-grid">
        <div className="tickets-metric-card blue">
          <div className="tickets-metric-header">
            <div className="tickets-metric-icon blue">
              {/* <div className="tickets-metric-dot blue"> */}
                <Ticket size={16} color="#4285f4" />
              </div>
            {/* </div> */}
            <span className="tickets-metric-label">Total Tickets</span>
          </div>
          <div className="tickets-metric-value">{ticketStats?.total || tickets.length}</div>
        </div>
        <div className="tickets-metric-card green">
          <div className="tickets-metric-header">
            <div className="tickets-metric-icon green">
              {/* <div className="tickets-metric-dot green"></div> */}
              <FolderOpen size={16} color="#34a853" />
            </div>
            <span className="tickets-metric-label">Open Tickets</span>
          </div>
          <div className="tickets-metric-value">{ticketStats?.byStatus?.open || tickets.filter(t => t.status === 'open').length}</div>
        </div>
        <div className="tickets-metric-card red">
          <div className="tickets-metric-header">
            <div className="tickets-metric-icon yellow">
              {/* <div className="tickets-metric-dot red"></div> */}
              <FolderClosed size={16} color="#fbbc05" />
            </div>
            <span className="tickets-metric-label">Closed Tickets</span>
          </div>
          <div className="tickets-metric-value">{ticketStats?.byStatus?.closed || tickets.filter(t => t.status === 'closed').length}</div>
        </div>
        <div className="tickets-metric-card yellow">
          <div className="tickets-metric-header">
            <div className="tickets-metric-icon red">
              {/* <div className="tickets-metric-dot yellow"></div> */}
              <Flag size={16} color="#ea4335" />
            </div>
            <span className="tickets-metric-label">High Priority</span>
          </div>
          <div className="tickets-metric-value">{ticketStats?.byPriority?.high || tickets.filter(t => t.priority === 'high').length}</div>
        </div>
      </div>

      {/* Detail View */}
      {selectedTicket && (
        <div className="tickets-ticket-detail-overlay">
          <div className="tickets-ticket-detail-container">
            <div className="tickets-ticket-detail-header">
              <h3>Ticket #{selectedTicket.id}</h3>
              <button onClick={closeDetailView} className="tickets-close-button">
                <X size={20} />
              </button>
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
                      <span className={`tickets-status-badge ${selectedTicket.status}`}>
                        {selectedTicket.status}
                      </span>
                    </div>
                    <div className="tickets-detail-row">
                      <strong>Priority:</strong>
                      <span className={`tickets-priority-badge ${selectedTicket.priority}`}>
                        {selectedTicket.priority}
                      </span>
                    </div>
                    <div className="tickets-detail-row">
                      <strong>Category:</strong> {selectedTicket.category?.replace('_', ' ')}
                    </div>
                    <div className="tickets-detail-row">
                      <strong>Submitted By:</strong> {selectedTicket.traineeDetails?.name || selectedTicket.traineeName}
                    </div>
                    <div className="tickets-detail-row">
                      <strong>Created:</strong> {formatDate(selectedTicket.createdAt)}
                    </div>
                    <div className="tickets-detail-row">
                      <strong>Updated:</strong> {formatDate(selectedTicket.updatedAt)}
                    </div>
                    <div className="tickets-action-tabs">
                      <div className="tickets-tab-container">
                        <button className="tickets-tab-button" onClick={() => setUpdateMode(true)}>
                          Update
                        </button>
                        {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                          <div className="tickets-action-section">
                            <h4>Resolve Ticket</h4>
                            <textarea
                              placeholder="Resolution notes..."
                              value={resolutionNote}
                              onChange={(e) => setResolutionNote(e.target.value)}
                              className="tickets-form-textarea"
                            />
                            <button onClick={resolveTicket} className="tickets-resolve-button">
                              Mark as Resolved
                            </button>
                          </div>
                        )}
                        {selectedTicket.status !== 'closed' && (
                          <div className="tickets-action-section">
                            <h4>Close Ticket</h4>
                            <textarea
                              placeholder="Closing notes..."
                              value={closeNote}
                              onChange={(e) => setCloseNote(e.target.value)}
                              className="tickets-form-textarea"
                            />
                            <button onClick={closeTicket} className="tickets-close-ticket-button">
                              Close Ticket
                            </button>
                          </div>
                        )}
                        <div className="tickets-action-section">
                          <button onClick={deleteTicket} className="tickets-delete-button">
                            Delete Ticket
                          </button>
                        </div>
                        <div className="tickets-action-section">
                          <h4>Respond</h4>
                          <div className="tickets-form-group">
                            <select
                              value={responseType}
                              onChange={(e) => setResponseType(e.target.value)}
                              className="tickets-form-select"
                            >
                              <option value="reply">Reply</option>
                              <option value="escalate">Escalate</option>
                              <option value="note">Internal Note</option>
                              <option value="request_info">Request Info</option>
                            </select>
                          </div>
                          <textarea
                            placeholder="Type your response..."
                            value={responseMessage}
                            onChange={(e) => setResponseMessage(e.target.value)}
                            className="tickets-form-textarea"
                          />
                          <button 
                            onClick={sendResponse} 
                            className="tickets-respond-button"
                            disabled={!responseMessage.trim()}
                          >
                            <Send size={16} /> Send
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
                          backgroundColor: {
                            open: '#e6fff0',
                            inProgress: '#e6f7ff',
                            resolved: '#fff9e6',
                            closed: '#ffe6e6'
                          }[ticket.status] || '#e6fff0',
                          color: {
                            open: '#34a853',
                            inProgress: '#4285f4',
                            resolved: '#fbbc05',
                            closed: '#ea4335'
                          }[ticket.status] || '#34a853'
                        }}
                      >
                        {ticket.status}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`tickets-priority-badge ${ticket.priority}`}
                        style={{
                          backgroundColor: {
                            low: '#e6f0ff',
                            medium: '#e6f7ff',
                            high: '#fff9e6',
                            urgent: '#ffe6e6'
                          }[ticket.priority] || '#e6f0ff',
                          color: {
                            low: '#4285f4',
                            medium: '#34a853',
                            high: '#fbbc05',
                            urgent: '#ea4335'
                          }[ticket.priority] || '#4285f4'
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
        {totalPages > 1 && (
          <div className="pagination-container">
            <div className="pagination-controls">
              <button
                className="pagination-arrow"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                ‹
              </button>
              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`pagination-number ${currentPage === i + 1 ? 'active' : ''}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                className="pagination-arrow"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                ›
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tickets;