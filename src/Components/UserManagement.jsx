/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
  Filter,
  Download,
  Upload,
  UserPlus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import "./styling/UserManagement.css";
import jsPDF from "jspdf";
import Modal from "./Modal";
import axios from "axios";
import DataLoader from "./dataLoader";
import CsvConfigModal from "./ui/CsvConfigModal";
import ImportCsvModal from "./ui/ImportCsvConfig";

const UserManagement = () => {
  // Location and Navigation Hooks
  const location = useLocation();
  const navigate = useNavigate();
  // State Management
  const [users, setUsers] = useState([]);
  const [guests, setGuests] = useState([]);
  const [onlinePeople, setOnlinePeople] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [activeTab, setActiveTab] = useState("Trainees");
  const [isLoading, setIsLoading] = useState(true);
  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  // Export and Import States
  const [exportStatus, setExportStatus] = useState("configuring");
  const [openCsvConfig, setOpenCsvConfig] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false); // New state for import modal
  const [selectedFileType, setSelectedFileType] = useState("trainees"); // To track file type selection
  const [fetchError, setFetchError] = useState(null);
  // Authentication Details
  const token = localStorage.getItem("authToken");
  const userRole = localStorage.getItem("role");
  const userLocation = localStorage.getItem("userLocation");
  // Columns for CSV Export
  const [columns, setColumns] = useState({
    fullName: true,
    surname: true,
    email: true,
    phoneNumber: true,
    location: true,
    idNumber: true,
    postalAddress: true,
    cohortYear: false,
  });

  // Debounce Search Term
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Authentication Check
  useEffect(() => {
    if (!token) {
      setFeedbackMessage("Authentication required. Please log in.");
      navigate("/login");
    } else {
      fetchAllData();
    }
  }, []);

  // Handle New User Addition from Navigation State
  useEffect(() => {
    if (location.state?.userData) {
      const newUser = location.state.userData;
      const exists = users.some((u) => u.email === newUser.email);
      if (!exists) {
        setUsers((prev) => [
          ...prev,
          { ...newUser, id: `new-${Date.now()}`, status: "active" },
        ]);
      }
    }
  }, [location.state]);

  // Fetch Online People
  const fetchOnlinePeople = async () => {
    try {
      const response = await axios.get(
        "https://timemanagementsystemserver.onrender.com/api/online-trainees",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const onlineTrainees = response.data.map((trainee) => ({
        id: trainee.traineeId,
        fullName: trainee.fullName,
        email: trainee.email,
        phoneNumber: trainee.phoneNumber || "N/A",
        role: "Online Trainee",
        lastActive: trainee.createdAt || new Date().toISOString(),
      }));

      setOnlinePeople(onlineTrainees);
    } catch (error) {
      console.error("Error fetching online trainees:", error);
      setFeedbackMessage("Failed to fetch online trainees data.");
    }
  };

  // Fetch Guests
  const fetchGuests = async () => {
    try {
      const response = await axios.get(
        "https://timemanagementsystemserver.onrender.com/api/guests/getGuests",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const guestsData = response.data.eventsWithGuests || [];
      if (guestsData.length > 0) {
        const formattedGuests = guestsData.flatMap((event) =>
          (event.guestDetails || []).map((guest) => ({
            id: guest.id || guest._id || `guest-${crypto.randomUUID()}`,
            fullName: guest.fullNames || "N/A",
            email: guest.email || "N/A",
            phoneNumber: guest.cellPhone || "N/A",
            lastVisit: guest.lastVisit || event.date || "N/A",
            role: "Guest",
            status: "active",
          }))
        );
        setGuests(formattedGuests);
      } else {
        setGuests([]);
        console.warn("No guest data found.");
      }
    } catch (error) {
      console.error("Error fetching guests:", error);
      setFeedbackMessage("Failed to fetch guests data.");
    }
  };

  // Fetch Users
  const fetchUsers = async (page = 1) => {
    const headers = { Authorization: `Bearer ${token}` };
    let allUserResults = [];
    try {
      let traineesData = [];
      if (userRole === "facilitator") {
        try {
          const traineesUrl = userLocation
            ? `https://timemanagementsystemserver.onrender.com/api/trainees/location?location=${userLocation}&page=${page}&limit=${itemsPerPage}`
            : `https://timemanagementsystemserver.onrender.com/api/my-trainees?page=${page}&limit=${itemsPerPage}`;
          const traineesResponse = await axios.get(traineesUrl, { headers });
          traineesData =
            traineesResponse.data?.allTrainees ||
            traineesResponse.data?.trainees ||
            [];
          if (traineesResponse.data.pagination) {
            setTotalPages(traineesResponse.data.pagination.totalPages);
            setCurrentPage(traineesResponse.data.pagination.currentPage);
          }
        } catch (error) {
          console.error("Failed to fetch trainees for facilitator:", error);
          setFeedbackMessage("Failed to fetch trainees for facilitator.");
        }
      } else if (userRole === "super_admin" || userRole === "admin") {
        try {
          const traineesResponse = await axios.get(
            `https://timemanagementsystemserver.onrender.com/api/trainees?page=${page}&limit=${itemsPerPage}`,
            { headers }
          );
          traineesData = traineesResponse.data?.trainees || [];
          if (traineesResponse.data.pagination) {
            setTotalPages(traineesResponse.data.pagination.totalPages);
            setCurrentPage(traineesResponse.data.pagination.currentPage);
          }
        } catch (error) {
          console.error("Failed to fetch trainees for admin:", error);
          setFeedbackMessage("Failed to fetch trainees for admin.");
        }
      }

      const formattedTrainees = traineesData.map((trainee) => ({
        id: trainee._id || trainee.id || `trainee-${crypto.randomUUID()}`,
        fullName:
          trainee.fullName ||
          `${trainee.name || ""} ${trainee.surname || ""}`.trim(),
        email: trainee.email || trainee.emailAddress || "N/A",
        phoneNumber: trainee.phoneNumber || trainee.phone || "N/A",
        role: "Trainee",
        status: trainee.status || "active",
        lastCheckIn: trainee.lastCheckInDate || "N/A",
      }));
      allUserResults = [...formattedTrainees];

      if (userRole === "super_admin" || userRole === "admin") {
        try {
          const facilitatorsResponse = await axios.get(
            "https://timemanagementsystemserver.onrender.com/api/facilitators",
            { headers }
          );
          const facilitatorsData =
            facilitatorsResponse.data?.facilitators || [];
          const formattedFacilitators = facilitatorsData.map((facilitator) => ({
            id:
              facilitator._id ||
              facilitator.id ||
              `facilitator-${crypto.randomUUID()}`,
            fullName:
              facilitator.fullName ||
              `${facilitator.name || ""} ${facilitator.surname || ""}`.trim(),
            email: facilitator.email || facilitator.emailAddress || "N/A",
            phoneNumber: facilitator.phoneNumber || facilitator.phone || "N/A",
            role: "Facilitator",
            status: facilitator.status || "active",
          }));
          allUserResults = [...allUserResults, ...formattedFacilitators];
        } catch (error) {
          console.error("Failed to fetch facilitators:", error);
          setFeedbackMessage("Failed to fetch facilitators.");
        }

        try {
          const stakeholdersResponse = await axios.get(
            "https://timemanagementsystemserver.onrender.com/api/stakeholder/all",
            { headers }
          );
          const stakeholdersData =
            stakeholdersResponse.data?.stakeholders || [];
          const formattedStakeholders = stakeholdersData.map((stakeholder) => ({
            id:
              stakeholder._id ||
              stakeholder.id ||
              `stakeholder-${crypto.randomUUID()}`,
            fullName:
              stakeholder.fullName ||
              `${stakeholder.name || ""} ${stakeholder.surname || ""}`.trim(),
            email: stakeholder.email || stakeholder.emailAddress || "N/A",
            phoneNumber: stakeholder.phone || stakeholder.phone || "N/A",
            role: "Stakeholder",
            status: stakeholder.status || "active",
          }));
          allUserResults = [...allUserResults, ...formattedStakeholders];
        } catch (error) {
          if (error.response?.status === 403) {
            console.warn("User doesn't have permission to access stakeholders");
          } else {
            console.error("Failed to fetch stakeholders:", error);
          }
          setFeedbackMessage("Failed to fetch stakeholders.");
        }
      }
      setUsers(allUserResults);
    } catch (error) {
      console.error("Error in fetchUsers:", error);
    }
  };

  // Fetch All Data
  const fetchAllData = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      await fetchUsers(currentPage);
      if (userRole === "super_admin" || userRole === "admin" || userRole === "facilitator") {
        await fetchGuests();
      }
      if (userRole === "super_admin") {
        await fetchOnlinePeople(); // Ensure this is called for super admins
      }
      setFeedbackMessage("Data loaded successfully");
    } catch (error) {
      console.error("Error loading data:", error);
      setFetchError("Failed to load all required data. Please try again.");
      setFeedbackMessage("Error fetching data. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  // Pagination Handler
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchUsers(page);
    }
  };

  // Render Pagination Numbers
  const renderPaginationNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-number ${currentPage === i ? "active" : ""}`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  // Toggle User Status
  const toggleUserStatus = async (userId) => {
    try {
      setUsers((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId
            ? { ...user, status: user.status === "active" ? "deactive" : "active" }
            : user
        )
      );
      setFeedbackMessage("User status updated successfully.");
    } catch (error) {
      console.error("Error updating user status:", error);
      setFeedbackMessage("Failed to update user status.");
    }
  };

  // Delete User
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    try {
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== selectedUser.id));
      setModalOpen(false);
      setFeedbackMessage("User deleted successfully.");
    } catch (error) {
      console.error("Error deleting user:", error);
      setFeedbackMessage("Failed to delete user.");
    }
  };

  // Take Action on User
  const handleTakeAction = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  // CSV Export
  const handleExportCSV = () => {
    setExportStatus("generating");
    const selectedColumns = Object.keys(columns).filter((key) => columns[key]);
    setTimeout(() => {
      try {
        const data = getTabData(activeTab).map((user) => {
          return selectedColumns
            .map((col) => {
              switch (col) {
                case "fullName":
                  return user.fullName || "";
                case "surname":
                  return user.fullName?.split(" ").pop() || "";
                case "codeTribeId":
                  return user.id || "";
                case "emailAddress":
                  return user.email || "";
                case "phoneNumber":
                  return user.phoneNumber || "";
                case "lastCheckInDate":
                  return user.lastCheckIn || "";
                default:
                  return "";
              }
            })
            .join(",");
        });
        const csvContent = `data:text/csv;charset=utf-8,${[
          selectedColumns.join(","),
          ...data,
        ].join("\n")}`;
        const link = document.createElement("a");
        link.href = encodeURI(csvContent);
        link.download = `${activeTab.toLowerCase()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setExportStatus("completed");
        setTimeout(() => {
          setExportStatus("configuring");
          setOpenCsvConfig(false);
        }, 2000);
      } catch (error) {
        console.error("CSV Export Error:", error);
        setFeedbackMessage("CSV export failed. Check console for details.");
      }
    }, 1500);
  };

  // PDF Export
  const exportPDF = () => {
    const doc = new jsPDF();
    const data = getTabData(activeTab);
    doc.text(`${activeTab} Management`, 10, 10);
    doc.text("Full Name, Email, Role", 10, 20);
    data.forEach((user, index) => {
      if (index < 30) {
        doc.text(
          `${user.fullName?.substring(0, 30) || ""}, ${
            user.email?.substring(0, 30) || ""
          }, ${user.role || ""}`,
          10,
          30 + index * 10
        );
      }
    });
    doc.save(`${activeTab.toLowerCase()}Management.pdf`);
  };

  // CSV Import
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file || !token) return;
    const formData = new FormData();
    formData.append("file", file);
    try {
      setFeedbackMessage("Uploading CSV...");
      const response = await axios.post(
        "https://timemanagementsystemserver.onrender.com/api/csv/csv-upload",
        formData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 202) {
        setFeedbackMessage("Upload complete! Refreshing data...");
        fetchAllData();
      }
    } catch (error) {
      setFeedbackMessage(`Upload failed: ${error.message}`);
    }
  };

  // Data Filtering
  const filteredUsersData = useMemo(() => {
    return users.filter(
      (user) =>
        user.fullName
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
  }, [users, debouncedSearchTerm]);

  const filteredGuestsData = useMemo(() => {
    return guests.filter(
      (guest) =>
        guest.fullName
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        guest.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (guest.phoneNumber &&
          guest.phoneNumber
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()))
    );
  }, [guests, debouncedSearchTerm]);

  const filteredOnlinePeopleData = useMemo(() => {
    return onlinePeople.filter(
      (person) =>
        person.fullName
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        person.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        (person.phoneNumber &&
          person.phoneNumber
            .toLowerCase()
            .includes(debouncedSearchTerm.toLowerCase()))
    );
  }, [onlinePeople, debouncedSearchTerm]);

  // Get Tab Data
  const getTabData = (tabName) => {
    switch (tabName) {
      case "Trainees":
        return filteredUsersData.filter((u) => u.role === "Trainee");
      case "Facilitators":
        return filteredUsersData.filter((u) => u.role === "Facilitator");
      case "Stakeholders":
        return filteredUsersData.filter((u) => u.role === "Stakeholder");
      case "Guests":
        return filteredGuestsData;
      case "Online Trainees":
        return filteredOnlinePeopleData;
      default:
        return [];
    }
  };

  // Available Tabs
  const getAvailableTabs = () => {
    if (userRole === "super_admin") {
      return ["Trainees", "Facilitators", "Stakeholders", "Guests", "Online Trainees"];
    } else if (userRole === "admin") {
      return ["Trainees", "Facilitators", "Stakeholders", "Guests"];
    } else {
      return ["Trainees", "Guests"];
    }
  };

  // Render Table
  const renderTable = (tabName) => {
    const data = getTabData(tabName);

    if (tabName === "Online Trainees") {
      return (
        <div className="users-table-wrapper">
          <table className="users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Last Active</th>
              </tr>
            </thead>
            <tbody>
              {onlinePeople.map((trainee) => (
                <tr key={trainee.id}>
                  <td>{trainee.fullName}</td>
                  <td>{trainee.email}</td>
                  <td>{trainee.phoneNumber}</td>
                  <td>{new Date(trainee.lastActive).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (data.length === 0) {
      return <div className="no-data-message">No {tabName.toLowerCase()} found.</div>;
    }

    return (
      <div className="users-table-wrapper">
        <table className="users-table">
          <thead>
            <tr>
              {tabName === "Guests" ? (
                <>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Last Visit</th>
                </>
              ) : tabName === "Online People" ? (
                <>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Last Active</th>
                </>
              ) : tabName === "Trainees" ? (
                <>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </>
              ) : (
                <>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  {/* <th>Location</th> */}
                  <th>Status</th>
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id.toString()}>
                {tabName === "Guests" ? (
                  <>
                    <td>{item.fullName}</td>
                    <td>{item.email}</td>
                    <td>{item.phoneNumber}</td>
                    <td>{item.lastVisit}</td>
                  </>
                ) : tabName === "Online People" ? (
                  <>
                    <td>{item.fullName}</td>
                    <td>{item.email}</td>
                    <td>{item.phoneNumber}</td>
                    <td>{new Date(item.lastActive).toLocaleString()}</td>
                  </>
                ) : (
                  <>
                    <td>{item.fullName}</td>
                    <td>{item.email}</td>
                    <td>{item.role}</td>
                    {/* <td>{item.location}</td> */}
                    <td>
                      <span
                        className={`status-badge ${item.status}`}
                        onClick={() => toggleUserStatus(item.id)}
                      >
                        {item.status === "deactive" ? "Deactive" : "Active"}
                      </span>
                    </td>
                    {tabName === "Trainees" && (
                      <td>
                        <button
                          className="action-btn"
                          onClick={() => handleTakeAction(item)}
                        >
                          Take action
                        </button>
                      </td>
                    )}
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  // Available Tabs
  const availableTabs = getAvailableTabs();

  // Import CSV Modal Logic
  const handleImportModalOpen = () => {
    setIsImportModalOpen(true);
  };

  const handleFileTypeChange = (type) => {
    setSelectedFileType(type);
  };

  const handleImportSubmit = async () => {
    const fileInput = document.getElementById("csvInput");
    const file = fileInput.files[0];
    if (!file) {
      setFeedbackMessage("Please select a CSV file.");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    formData.append("trainees", selectedFileType === "trainees"); // Send 'true' for trainees
    try {
      setFeedbackMessage("Uploading CSV...");
      const response = await axios.post(
        "https://timemanagementsystemserver.onrender.com/api/csv/csv-upload",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      if (response.status === 202) {
        setFeedbackMessage("Upload complete! Refreshing data...");
        fetchAllData();
        setIsImportModalOpen(false); // Close the modal after successful upload
      }
    } catch (error) {
      setFeedbackMessage(`Upload failed: ${error.message}`);
    }
  };

  return (
    <div className="user-management-container">
      {/* Action Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onExportCSV={handleExportCSV}
        onExportPDF={exportPDF}
        onDelete={handleDeleteUser}
        user={selectedUser}
      />
      {/* CSV Configuration Modal */}
      {openCsvConfig && (
        <CsvConfigModal
          columns={columns}
          setColumns={setColumns}
          onClose={() => setOpenCsvConfig(false)}
          onExport={handleExportCSV}
          exportStatus={exportStatus}
        />
      )}
      {/* Header */}
      <div className="header">
        <div className="UM-title-section">
          <h1>User Management</h1>
          <p className="UM-subtitle">
            {`Manage trainees${
              userRole === "facilitator" ? "" : ", facilitators, stakeholders"
            } and guests`}
          </p>
          {feedbackMessage && (
            <p className="feedback-message">{feedbackMessage}</p>
          )}
          {fetchError && <p className="error-message">{fetchError}</p>}
        </div>
        <button
          className="add-user-btn"
          onClick={() => navigate("/add-user")}
        >
          <UserPlus size={16} />
          <span>Add user</span>
        </button>
      </div>
      {/* Tabs and Controls */}
      <div className="UMtabs-container">
        <div className="UMtabs-navigation">
          {availableTabs.map((tab) => (
            <button
              key={tab}
              className={`UMtab-button ${activeTab === tab ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
            >
              {tab} <span className="tab-count">{getTabData(tab).length}</span>
            </button>
          ))}
        </div>
        <div className="table-controls">
          <div className="left-controls">
            <div className="search-container">
              <Search className="search-icon" />
              <input
                type="text"
                placeholder="Search by email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
          <div className="right-controls">
            <button className="export-btn" onClick={exportPDF}>
              <Download size={14} />
              <span>Export PDF</span>
            </button>
            <button className="export-btn" onClick={() => setOpenCsvConfig(true)}>
              <Download size={14} />
              <span>Export CSV</span>
            </button>
            <button 
              className="import-btn" 
              onClick={() => setIsImportModalOpen(true)}
            >
              <Upload size={14} />
              <span>Import CSV</span>
            </button>
          </div>
        </div>
        {/* Tab Content */}
        <div className="tabContentContainer">
          {isLoading ? (
            <DataLoader />
          ) : (
            <>
              <div className="tab-content active">
                {renderTable(activeTab)}
              </div>
              {totalPages > 1 && activeTab === "Trainees" && (
                <div className="pagination-container">
                  <div className="pagination-controls">
                    <button
                      className="pagination-arrow"
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                    >
                      <ChevronLeft size={18} />
                    </button>
                    {renderPaginationNumbers()}
                    <button
                      className="pagination-arrow"
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      {/* Import CSV Modal */}
      {isImportModalOpen ? (
        <ImportCsvModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          token={token}
          fetchAllData={fetchAllData}
          setFeedbackMessage={setFeedbackMessage}
        />
      ) : (
        <></>
      )}
    </div>
  );
};

export default UserManagement;