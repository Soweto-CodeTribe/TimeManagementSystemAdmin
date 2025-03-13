// // Components/Tickets.jsx
// import { useState, useEffect } from 'react';
// import { useSelector } from 'react-redux';
// import './styling/Tickets.css';

// const Tickets = () => {
//   const [tickets, setTickets] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(5);
//   const [newTicketModal, setNewTicketModal] = useState(false);
//   const [statusFilter, setStatusFilter] = useState('');
//   const [priorityFilter, setStatusPriority] = useState('');
  
//   // New ticket form state
//   const [newTicket, setNewTicket] = useState({
//     title: '',
//     description: '',
//     category: 'technical_issue',
//     priority: 'medium'
//   });
  
//   const token = useSelector(state => state.auth.token);
//   const userRole = useSelector(state => state.auth.role);
//   const baseUrl = 'https://timemanagementsystemserver.onrender.com/api';
  
//   useEffect(() => {
//     fetchTickets();
//   }, [token, statusFilter, priorityFilter]);
  
//   const fetchTickets = async () => {
//     setLoading(true);
//     try {
//       // Determine which endpoint to use based on user role
//       const endpoint = userRole === 'facilitator' || userRole === 'super_admin' 
//         ? '/tickets' 
//         : '/tickets/my-tickets';
      
//       // Build query parameters for filtering
//       let queryParams = '';
//       if (statusFilter) queryParams += `status=${statusFilter}&`;
//       if (priorityFilter) queryParams += `priority=${priorityFilter}&`;
//       if (queryParams) queryParams = '?' + queryParams.slice(0, -1); // Remove trailing &
      
//       const response = await fetch(`${baseUrl}${endpoint}${queryParams}`, {
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to fetch tickets');
//       }
      
//       const data = await response.json();
//       setTickets(data);
//       setError(null);
//     } catch (err) {
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };
  
//   // Create a new ticket
//   const handleCreateTicket = async (e) => {
//     e.preventDefault();
//     try {
//       const response = await fetch(`${baseUrl}/tickets`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(newTicket)
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to create ticket');
//       }
      
//       // Refresh tickets and close modal
//       fetchTickets();
//       setNewTicketModal(false);
//       setNewTicket({
//         title: '',
//         description: '',
//         category: 'technical_issue',
//         priority: 'medium'
//       });
//     } catch (err) {
//       setError(err.message);
//     }
//   };
  
//   // Update ticket status/priority (for facilitators)
//   const handleUpdateTicketStatus = async (id, newStatus) => {
//     try {
//       const endpoint = userRole === 'facilitator' || userRole === 'super_admin'
//         ? `/tickets/${id}`
//         : `/tickets/my-tickets/${id}`;
        
//       const response = await fetch(`${baseUrl}${endpoint}`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json'
//         },
//         body: JSON.stringify({ status: newStatus })
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to update ticket');
//       }
      
//       fetchTickets();
//     } catch (err) {
//       setError(err.message);
//     }
//   };
  
//   // Cancel a ticket (for trainees)
//   const handleCancelTicket = async (id) => {
//     try {
//       const response = await fetch(`${baseUrl}/tickets/my-tickets/${id}/cancel`, {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`
//         }
//       });
      
//       if (!response.ok) {
//         throw new Error('Failed to cancel ticket');
//       }
      
//       fetchTickets();
//     } catch (err) {
//       setError(err.message);
//     }
//   };
  
//   // Calculate metrics
//   const totalTickets = tickets.length;
//   const openTickets = tickets.filter(ticket => ticket.status === 'open').length;
//   const closedTickets = tickets.filter(ticket => ticket.status === 'closed').length;
//   const highPriorityTickets = tickets.filter(ticket => ticket.priority === 'high').length;
  
//   // Filter tickets based on search term
//   const filteredTickets = tickets.filter(ticket => 
//     (ticket.title && ticket.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
//     (ticket.description && ticket.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
//     (ticket.status && ticket.status.toLowerCase().includes(searchTerm.toLowerCase())) ||
//     (ticket.priority && ticket.priority.toLowerCase().includes(searchTerm.toLowerCase())) ||
//     (ticket.category && ticket.category.toLowerCase().includes(searchTerm.toLowerCase()))
//   );
  
//   // Pagination logic
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentItems = filteredTickets.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);
  
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);
  
//   // Format date to be more readable
//   const formatDate = (dateString) => {
//     if (!dateString) return 'N/A';
//     const date = new Date(dateString);
//     return date.toLocaleDateString('en-US', { 
//       year: 'numeric', 
//       month: 'short', 
//       day: 'numeric'
//     });
//   };
  
//   // Format category name (replace underscores with spaces and capitalize)
//   const formatCategory = (category) => {
//     if (!category) return 'N/A';
//     return category
//       .split('_')
//       .map(word => word.charAt(0).toUpperCase() + word.slice(1))
//       .join(' ');
//   };
  
//   // Get assignee name if available
//   const getAssigneeName = (ticket) => {
//     if (ticket.assignee && ticket.assignee.name) {
//       return ticket.assignee.name;
//     } else if (ticket.assignedTo) {
//       return ticket.assignedTo.substring(0, 8) + '...';
//     }
//     return 'Unassigned';
//   };
  
//   // Determine if user can edit the ticket
//   const canEditTicket = (ticket) => {
//     if (userRole === 'facilitator' || userRole === 'super_admin') return true;
//     // return ticket.submittedBy === useSelector(state => state.auth.uid);
//   };
  
//   if (loading && tickets.length === 0) return <div className="loading-container">Loading tickets...</div>;
  
//   return (
//     <div className="session-container">
//       {/* Metrics Section */}
//       <div className="metrics-grid">
//         <div className="metric-card blue">
//           <div className="metric-header">
//             <div className="metric-icon blue">
//               <div className="metric-dot blue"></div>
//             </div>
//             <span className="metric-label blue">Total Tickets</span>
//           </div>
//           <div className="metric-value blue">{totalTickets}</div>
//         </div>
        
//         <div className="metric-card green">
//           <div className="metric-header">
//             <div className="metric-icon green">
//               <div className="metric-dot green"></div>
//             </div>
//             <span className="metric-label green">Open Tickets</span>
//           </div>
//           <div className="metric-value green">{openTickets}</div>
//         </div>
        
//         <div className="metric-card red">
//           <div className="metric-header">
//             <div className="metric-icon red">
//               <div className="metric-dot red"></div>
//             </div>
//             <span className="metric-label red">Closed Tickets</span>
//           </div>
//           <div className="metric-value red">{closedTickets}</div>
//         </div>
        
//         <div className="metric-card yellow">
//           <div className="metric-header">
//             <div className="metric-icon yellow">
//               <div className="metric-dot yellow"></div>
//             </div>
//             <span className="metric-label yellow">High Priority</span>
//           </div>
//           <div className="metric-value yellow">{highPriorityTickets}</div>
//         </div>
//       </div>
      
//       {/* Table Section */}
//       <div className="table-container">
//         <div className="table-header">
//           <h3 className="table-title">Support Tickets</h3>
          
//           <div className="table-actions">
//             <div className="search-wrapper">
//               <span className="search-icon">🔍</span>
//               <input 
//                 type="text" 
//                 className="search-input" 
//                 placeholder="Search tickets..." 
//                 value={searchTerm}
//                 onChange={(e) => setSearchTerm(e.target.value)}
//               />
//             </div>
            
//             <div className="filter-controls">
//               <select 
//                 className="filter-select"
//                 value={statusFilter}
//                 onChange={(e) => setStatusFilter(e.target.value)}
//               >
//                 <option value="">All Statuses</option>
//                 <option value="open">Open</option>
//                 <option value="closed">Closed</option>
//               </select>
              
//               <select 
//                 className="filter-select"
//                 value={priorityFilter}
//                 onChange={(e) => setStatusPriority(e.target.value)}
//               >
//                 <option value="">All Priorities</option>
//                 <option value="low">Low</option>
//                 <option value="medium">Medium</option>
//                 <option value="high">High</option>
//               </select>
//             </div>
            
//             <button 
//               className="btn"
//               onClick={() => setNewTicketModal(true)}
//             >
//               <span className="btn-icon">➕</span>
//               New Ticket
//             </button>
//           </div>
//         </div>
        
//         {error && <div className="error-message">{error}</div>}
        
//         <div className="table-wrapper">
//           <table className="attendance-table">
//             <thead>
//               <tr>
//                 <th>ID</th>
//                 <th>Title</th>
//                 <th>Status</th>
//                 <th>Priority</th>
//                 <th>Category</th>
//                 {(userRole === 'facilitator' || userRole === 'super_admin') && <th>Submitted By</th>}
//                 {(userRole === 'facilitator' || userRole === 'super_admin') && <th>Assigned To</th>}
//                 <th>Created</th>
//                 <th>Updated</th>
//                 <th>Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {loading ? (
//                 <tr>
//                   <td colSpan={userRole === 'facilitator' || userRole === 'super_admin' ? 10 : 8} className="loading-cell">
//                     Loading...
//                   </td>
//                 </tr>
//               ) : currentItems.length === 0 ? (
//                 <tr>
//                   <td colSpan={userRole === 'facilitator' || userRole === 'super_admin' ? 10 : 8} className="empty-cell">
//                     No tickets found
//                   </td>
//                 </tr>
//               ) : (
//                 currentItems.map((ticket) => (
//                   <tr key={ticket.id}>
//                     <td>{ticket.id.substring(0, 8)}...</td>
//                     <td>{ticket.title}</td>
//                     <td>
//                       <span 
//                         className={`status-badge ${ticket.status}`}
//                       >
//                         {ticket.status}
//                       </span>
//                     </td>
//                     <td>
//                       <span 
//                         className={`priority-badge ${ticket.priority}`}
//                       >
//                         {ticket.priority}
//                       </span>
//                     </td>
//                     <td>{formatCategory(ticket.category)}</td>
//                     {(userRole === 'facilitator' || userRole === 'super_admin') && (
//                       <td>
//                         {ticket.submitter ? ticket.submitter.name : 
//                           ticket.submittedBy ? ticket.submittedBy.substring(0, 8) + '...' : 'Unknown'}
//                       </td>
//                     )}
//                     {(userRole === 'facilitator' || userRole === 'super_admin') && (
//                       <td>{getAssigneeName(ticket)}</td>
//                     )}
//                     <td>{formatDate(ticket.createdAt)}</td>
//                     <td>{formatDate(ticket.updatedAt)}</td>
//                     <td>
//                       <div className="action-buttons">
//                         {canEditTicket(ticket) && ticket.status === 'open' && (
//                           <button 
//                             className="action-btn close-btn"
//                             onClick={() => handleUpdateTicketStatus(ticket.id, 'closed')}
//                             title="Close Ticket"
//                           >
//                             ✓
//                           </button>
//                         )}
                        
//                         {userRole !== 'facilitator' && userRole !== 'super_admin' && ticket.status === 'open' && (
//                           <button 
//                             className="action-btn cancel-btn"
//                             onClick={() => handleCancelTicket(ticket.id)}
//                             title="Cancel Ticket"
//                           >
//                             ✕
//                           </button>
//                         )}
                        
//                         <button 
//                           className="action-btn view-btn"
//                           onClick={() => {/* View ticket details */}}
//                           title="View Details"
//                         >
//                           👁️
//                         </button>
//                       </div>
//                     </td>
//                   </tr>
//                 ))
//               )}
//             </tbody>
//           </table>
//         </div>
        
//         {/* Pagination */}
//         {filteredTickets.length > 0 && (
//           <div className="pagination-container">
//             <span className="pagination-info">
//               Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTickets.length)} of {filteredTickets.length} tickets
//             </span>
            
//             <div className="pagination-controls">
//               <button 
//                 className="pagination-arrow" 
//                 onClick={() => paginate(currentPage - 1)}
//                 disabled={currentPage === 1}
//               >
//                 &lt;
//               </button>
              
//               {Array.from({ length: Math.min(totalPages, 5) }).map((_, idx) => {
//                 // Show pagination numbers around current page
//                 let pageNumber;
//                 if (totalPages <= 5) {
//                   pageNumber = idx + 1;
//                 } else if (currentPage <= 3) {
//                   pageNumber = idx + 1;
//                 } else if (currentPage >= totalPages - 2) {
//                   pageNumber = totalPages - 4 + idx;
//                 } else {
//                   pageNumber = currentPage - 2 + idx;
//                 }
                
//                 return (
//                   <button
//                     key={pageNumber}
//                     onClick={() => paginate(pageNumber)}
//                     className={`pagination-number ${currentPage === pageNumber ? 'active' : ''}`}
//                   >
//                     {pageNumber}
//                   </button>
//                 );
//               })}
              
//               <button 
//                 className="pagination-arrow" 
//                 onClick={() => paginate(currentPage + 1)}
//                 disabled={currentPage === totalPages}
//               >
//                 &gt;
//               </button>
//             </div>
//           </div>
//         )}
//       </div>
      
//       {/* New Ticket Modal */}
//       {newTicketModal && (
//         <div className="modal-overlay">
//           <div className="modal-container">
//             <div className="modal-header">
//               <h3>Create New Ticket</h3>
//               <button 
//                 className="modal-close"
//                 onClick={() => setNewTicketModal(false)}
//               >
//                 ✕
//               </button>
//             </div>
            
//             <form onSubmit={handleCreateTicket} className="ticket-form">
//               <div className="form-group">
//                 <label htmlFor="title">Title</label>
//                 <input
//                   type="text"
//                   id="title"
//                   value={newTicket.title}
//                   onChange={(e) => setNewTicket({...newTicket, title: e.target.value})}
//                   required
//                 />
//               </div>
              
//               <div className="form-group">
//                 <label htmlFor="description">Description</label>
//                 <textarea
//                   id="description"
//                   value={newTicket.description}
//                   onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
//                   required
//                   rows={4}
//                 ></textarea>
//               </div>
              
//               <div className="form-group">
//                 <label htmlFor="category">Category</label>
//                 <select
//                   id="category"
//                   value={newTicket.category}
//                   onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
//                 >
//                   <option value="technical_issue">Technical Issue</option>
//                   <option value="account_access">Account Access</option>
//                   <option value="billing">Billing</option>
//                   <option value="feature_request">Feature Request</option>
//                   <option value="general_question">General Question</option>
//                 </select>
//               </div>
              
//               <div className="form-group">
//                 <label htmlFor="priority">Priority</label>
//                 <select
//                   id="priority"
//                   value={newTicket.priority}
//                   onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
//                 >
//                   <option value="low">Low</option>
//                   <option value="medium">Medium</option>
//                   <option value="high">High</option>
//                 </select>
//               </div>
              
//               <div className="form-actions">
//                 <button 
//                   type="button" 
//                   className="btn cancel"
//                   onClick={() => setNewTicketModal(false)}
//                 >
//                   Cancel
//                 </button>
//                 <button type="submit" className="btn submit">
//                   Create Ticket
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Tickets;

// Components/Tickets.jsx
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import DataLoader from './dataLoader';
import './styling/Tickets.css';
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
      
      // Get the updated ticket data
      const updatedTicket = await response.json();
      
      // Update the tickets list
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket.id === selectedTicket.id ? {...ticket, ...updatedTicket} : ticket
        )
      );
      
      // Update the selected ticket
      setSelectedTicket({...selectedTicket, ...updatedTicket});
      setUpdateMode(false);
      
      // Refresh the tickets list
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
  
  if (isLoading && !selectedTicket) return <DataLoader/>;
  if (error) return <div>Error: {error}</div>;

  const handleDeleteTicket = async ()=>{
    try {
      await axios.delete(`${API_BASE_URL}/tickets/${selectedTicket.id}`, {
        headers:{
          'Authorization': `Bearer ${token}`
        }
      })
    } catch (error) {
      console.error(error)
    }
  }
  
  return (
    <div className="session-container">
      {/* Metrics Section */}
      <div className="metrics-grid">
        <div className="metric-card blue">
          <div className="metric-header">
            <div className="metric-icon blue">
              <div className="metric-dot blue"></div>
            </div>
            <span className="metric-label blue">Total Tickets</span>
          </div>
          <div className="metric-value blue">{totalTickets}</div>
        </div>
        
        <div className="metric-card green">
          <div className="metric-header">
            <div className="metric-icon green">
              <div className="metric-dot green"></div>
            </div>
            <span className="metric-label green">Open Tickets</span>
          </div>
          <div className="metric-value green">{openTickets}</div>
        </div>
        
        <div className="metric-card red">
          <div className="metric-header">
            <div className="metric-icon red">
              <div className="metric-dot red"></div>
            </div>
            <span className="metric-label red">Closed Tickets</span>
          </div>
          <div className="metric-value red">{closedTickets}</div>
        </div>
        
        <div className="metric-card yellow">
          <div className="metric-header">
            <div className="metric-icon yellow">
              <div className="metric-dot yellow"></div>
            </div>
            <span className="metric-label yellow">High Priority</span>
          </div>
          <div className="metric-value yellow">{highPriorityTickets}</div>
        </div>
      </div>
      
      {/* Detail View */}
      {selectedTicket && (
        <div className="ticket-detail-overlay">
          <div className="ticket-detail-container">
            <div className="ticket-detail-header">
              <h3>Ticket Details</h3>
              <button onClick={closeDetailView} className="close-button">X</button>
            </div>
            
            {isLoading ? (
              <div className="detail-loading"><DataLoader /></div>
            ) : (
              <div className="ticket-detail-content">
                {updateMode ? (
                  <div className="update-form">
                    <h4>Update Ticket</h4>
                    <div className="form-group">
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
                    <div className="form-group">
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
                    <div className="form-actions">
                      <button onClick={() => setUpdateMode(false)} className="cancel-button">
                        Cancel
                      </button>
                      <button onClick={updateTicket} className="save-button">
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="detail-row">
                      <strong>ID:</strong> {selectedTicket.id}
                    </div>
                    <div className="detail-row">
                      <strong>Title:</strong> {selectedTicket.title}
                    </div>
                    <div className="detail-row">
                      <strong>Description:</strong> {selectedTicket.description}
                    </div>
                    <div className="detail-row">
                      <strong>Status:</strong> 
                      <span 
                        className={`status-badge ${selectedTicket.status}`}
                      >
                        {selectedTicket.status}
                      </span>
                    </div>
                    <div className="detail-row">
                      <strong>Priority:</strong> 
                      <span 
                        className={`priority-badge ${selectedTicket.priority}`}
                      >
                        {selectedTicket.priority}
                      </span>
                    </div>
                    <div className="detail-row">
                      <strong>Category:</strong> {selectedTicket.category?.replace('_', ' ')}
                    </div>
                    <div className="detail-row">
                      <strong>Submitted By:</strong> {selectedTicket.submitter?.name || selectedTicket.submittedBy}
                    </div>
                    <div className="detail-row">
                      <strong>Assigned To:</strong> {selectedTicket.assignee?.name || selectedTicket.assignedTo || 'Unassigned'}
                    </div>
                    <div className="detail-row">
                      <strong>Created:</strong> {formatDate(selectedTicket.createdAt)}
                    </div>
                    <div className="detail-row">
                      <strong>Updated:</strong> {formatDate(selectedTicket.updatedAt)}
                    </div>
                    <div className="detail-actions">
                      <button onClick={() => setUpdateMode(true)} className="update-button">
                        Update Ticket
                      </button>
                      <button onClick={handleDeleteTicket}>
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
      <div className="table-container">
        <div className="table-header">
          <h3 className="table-title">Support Tickets</h3>
          
          <div className="table-actions">
            <div className="search-wrapper">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                className="search-input" 
                placeholder="Search tickets..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <button className="btn" onClick={() => fetchTickets()}>
              <span className="btn-icon">🔄</span>
              Refresh
            </button>
          </div>
        </div>
        
        <div className="table-wrapper">
          <table className="attendance-table">
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
                  className="clickable-row"
                >
                  <td>{ticket.id?.substring(0, 8)}...</td>
                  <td>{ticket.title}</td>
                  <td>
                    <span 
                      className="status-badge"
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
                      className="priority-badge"
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
        <div className="pagination-container">
          {/* <span className="pagination-info">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredTickets.length)} of {filteredTickets.length} tickets
          </span> */}
          
          <div className="pagination-controls">
            <button 
              className="pagination-arrow" 
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              &lt;
            </button>
            
            {[...Array(totalPages).keys()].map(number => (
              <button
                key={number + 1}
                onClick={() => paginate(number + 1)}
                className={`pagination-number ${currentPage === number + 1 ? 'active' : ''}`}
              >
                {number + 1}
              </button>
            ))}
            
            <button 
              className="pagination-arrow" 
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Tickets;