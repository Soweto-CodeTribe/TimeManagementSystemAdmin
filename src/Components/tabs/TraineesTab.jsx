import React, { useState } from "react";

// Local implementation of toggleUserStatus (if utils file is missing)
const toggleUserStatus = async (userId, fetchData) => {
  try {
    console.log(`Toggling status for user ID: ${userId}`);
    await fetchData(); // Refetch data after toggling
  } catch (error) {
    console.error("Error toggling user status:", error);
  }
};

const TraineesTab = ({ data, searchTerm, fetchData }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Filter and paginate data
  const filteredData = data.filter(
    (trainee) =>
      trainee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trainee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedData = filteredData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <table className="users-table">
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {paginatedData.map((trainee) => (
            <tr key={trainee.id}>
              <td>{trainee.fullName}</td>
              <td>{trainee.email}</td>
              <td>
                <span
                  className={`status-badge ${trainee.status}`}
                  onClick={() => toggleUserStatus(trainee.id, fetchData)}
                >
                  {trainee.status === "deactive" ? "Deactive" : "Active"}
                </span>
              </td>
              <td>
                <button
                  className="action-btn"
                  onClick={() => console.log("Take action for:", trainee.fullName)}
                >
                  Take Action
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination-controls">
        <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage - 1)}>
          {"<"}
        </button>
        <span>
          Page {currentPage} of {Math.ceil(filteredData.length / itemsPerPage)}
        </span>
        <button
          disabled={currentPage === Math.ceil(filteredData.length / itemsPerPage)}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          {">"}
        </button>
      </div>
    </div>
  );
};

export default TraineesTab;