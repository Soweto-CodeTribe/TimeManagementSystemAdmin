import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DataLoader from './dataLoader';
import './styling/Tickets.css'; // Updated CSS file with prefixed class names
import axios from 'axios';

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
  const token = useSelector(state => state.auth.token);
  const API_BASE_URL = 'https://timemanagementsystemserver.onrender.com/api';

  useEffect(() => {
    fetchTickets();
  }, [token]);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tickets`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch tickets');
      }
      const data = await response.json();
      setTickets(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTicketDetails = async (ticketId) => {
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${ticketId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch ticket details');
      }
      const data = await response.json();
      setSelectedTicket(data);
      setUpdatedTicketData({
        status: data.status,
        priority: data.priority
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateTicket = async () => {
    if (!selectedTicket) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/tickets/${selectedTicket.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updatedTicketData)
      });
      if (!response.ok) {
        throw new Error('Failed to update ticket');
      }
      const updatedTicket = await response.json();
      setTickets(prevTickets =>
        prevTickets.map(ticket =>
          ticket.id === selectedTicket.id ? { ...ticket, ...updatedTicket } : ticket
        )
      );
      setSelectedTicket({ ...selectedTicket, ...updatedTicket });
      setUpdateMode(false);
      fetchTickets();
    } catch (err) {
      setError(err.message);
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

  // Calculate metrics
  const totalTickets = tickets.length;
  const openTickets = tickets.filter(ticket => ticket.status === 'open').length;
  const closedTickets = tickets.filter(ticket => ticket.status === 'closed').length;
  const highPriorityTickets = tickets.filter(ticket => ticket.priority === 'high').length;

  // Filter tickets based on search term
  const filteredTickets = tickets.filter(ticket =>
    ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.status?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.priority?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.category?.toLowerCase().includes(searchTerm.toLowerCase())
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
  };

  const handleDeleteTicket = async () => {
    if (!selectedTicket) return;
    try {
      await axios.delete(`${API_BASE_URL}/tickets/${selectedTicket.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setTickets(prevTickets => prevTickets.filter(ticket => ticket.id !== selectedTicket.id));
      closeDetailView();
    } catch (error) {
      console.error(error);
      setError('Failed to delete ticket. Please try again.');
    }
  };

  if (isLoading && !selectedTicket) return <DataLoader />;
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
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
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
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
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
                      <strong>Submitted By:</strong> {selectedTicket.submitter?.name || selectedTicket.submittedBy}
                    </div>
                    <div className="tickets-detail-row">
                      <strong>Assigned To:</strong> {selectedTicket.assignee?.name || selectedTicket.assignedTo || 'Unassigned'}
                    </div>
                    <div className="tickets-detail-row">
                      <strong>Created:</strong> {formatDate(selectedTicket.createdAt)}
                    </div>
                    <div className="tickets-detail-row">
                      <strong>Updated:</strong> {formatDate(selectedTicket.updatedAt)}
                    </div>
                    <div className="tickets-detail-actions">
                      <button onClick={() => setUpdateMode(true)} className="tickets-update-button">
                        Update Ticket
                      </button>
                      <button onClick={handleDeleteTicket} className="tickets-delete-button">
                        Delete
                      </button>
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
              <span className="tickets-search-icon">🔍</span>
              <input
                type="text"
                className="tickets-search-input"
                placeholder="Search tickets..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="tickets-btn" onClick={() => fetchTickets()}>
              <span className="tickets-btn-icon">🔄</span>
              Refresh
            </button>
          </div>
        </div>
        <div className="tickets-table-wrapper">
          <table className="tickets-attendance-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Category</th>
                <th>Created</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((ticket) => (
                <tr
                  key={ticket.id}
                  onClick={() => handleRowClick(ticket)}
                  className="tickets-clickable-row"
                >
                  <td>{ticket.id?.substring(0, 8)}...</td>
                  <td>{ticket.title}</td>
                  <td>
                    <span
                      className={`tickets-status-badge ${ticket.status}`}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: ticket.status === 'open' ? '#e6fff0' : '#ffe6e6',
                        color: ticket.status === 'open' ? '#34a853' : '#ea4335',
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
                        backgroundColor: ticket.priority === 'high' ? '#fff9e6' : '#e6f0ff',
                        color: ticket.priority === 'high' ? '#fbbc05' : '#4285f4',
                      }}
                    >
                      {ticket.priority}
                    </span>
                  </td>
                  <td>{ticket.category?.replace('_', ' ')}</td>
                  <td>{formatDate(ticket.createdAt)}</td>
                  <td>{formatDate(ticket.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="tickets-pagination-container">
          <div className="tickets-pagination-controls">
            <button
              className="tickets-pagination-arrow"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              
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
              
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tickets;