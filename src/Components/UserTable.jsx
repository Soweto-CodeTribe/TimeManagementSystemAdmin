/* eslint-disable react/prop-types */
import { useState } from "react";
import { MoreVertical } from "lucide-react";

const UserTable = ({ 
  data, 
  type, 
  isLoading, 
  onToggleUserStatus, 
  onTakeAction 
}) => {
  const [expandedRow, setExpandedRow] = useState(null);

  const renderTableContent = () => {
    if (isLoading) {
      return (
        <tr>
          <td colSpan="5" className="text-center">Loading...</td>
        </tr>
      );
    }

    if (data.length === 0) {
      return (
        <tr>
          <td colSpan="5" className="text-center">No {type} found</td>
        </tr>
      );
    }

    return data.map((item) => {
      const isRowExpanded = expandedRow === item.id;

      return (
        <tr key={item.id}>
          {type === "guests" ? (
            <>
              <td>{item.fullName}</td>
              <td>{item.email}</td>
              <td>{item.phoneNumber}</td>
              <td>{item.lastVisit || 'N/A'}</td>
            </>
          ) : (
            <>
              <td>{item.fullName}</td>
              <td>{item.email}</td>
              <td>{type.charAt(0).toUpperCase() + type.slice(1)}</td>
              <td>
                <span 
                  className={`status-badge ${item.status}`}
                  onClick={() => onToggleUserStatus && onToggleUserStatus(item.id)}
                >
                  {item.status}
                </span>
              </td>
              <td className="relative">
                <button 
                  onClick={() => {
                    setExpandedRow(isRowExpanded ? null : item.id);
                    onTakeAction && onTakeAction(item);
                  }}
                  className="action-btn"
                >
                  <MoreVertical size={20} />
                </button>
                {isRowExpanded && (
                  <div className="absolute right-0 top-full z-10 bg-white shadow-lg rounded">
                    {/* Dropdown actions */}
                    <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                      View Details
                    </button>
                    <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                      Edit
                    </button>
                    <button className="block w-full text-left px-4 py-2 hover:bg-gray-100">
                      Delete
                    </button>
                  </div>
                )}
              </td>
            </>
          )}
        </tr>
      );
    });
  };

  return (
    <div className="users-table-wrapper">
      <table className="users-table w-full">
        <thead>
          <tr>
            {type === "guests" ? (
              <>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Last Visit</th>
              </>
            ) : (
              <>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {renderTableContent()}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;