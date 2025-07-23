/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useMemo } from "react";
import {
  Search,
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
import UserActionModal from "./ui/UserActionModal";
import EditModal from "./ui/EditModal";
import axios from "axios";
import DataLoader from "./dataLoader";
import CsvConfigModal from "./ui/CsvConfigModal";
import ImportCsvModal from "./ui/ImportCsvConfig";
import CustomDropdown from './ui/CustomDropdown';

const LOCATIONS = [
  "TIH",
  "Tembisa",
  "Soweto",
  "Ga-rankuwa",
  "Limpopo",
  "KZN",
  "Kimberly"
];

// Utility function to format a user object consistently
function formatUser(user, role = "Trainee") {
  let surname = user.surname || "";
  let fullName = user.fullName || `${user.name || ""} ${surname}`.trim();
  if (!surname && user.fullName) {
    const nameParts = user.fullName.trim().split(" ");
    surname = nameParts.length > 1 ? nameParts.slice(-1)[0] : "";
  }
  return {
    id: user._id || user.id || `${role.toLowerCase()}-${crypto.randomUUID()}`,
    firebaseId: user._id || user.firebaseId || user.id, 
    idNumber: user.idNumber || "", // Editable User ID
    fullName,
    surname,
    email: user.email || user.emailAddress || "N/A",
    phoneNumber: user.phoneNumber || user.phone || "N/A",
    role,
    status: user.status || "active",
    lastCheckIn: user.lastCheckInDate || "N/A",
    location: user.location || "",
  };
}

const UserManagement = () => {
  // Location and Navigation Hooks
  const location = useLocation();
  const navigate = useNavigate();
  // State Management
  const [users, setUsers] = useState([]);
  const [facilitators, setFacilitators] = useState([]); // New: paginated facilitators
  const [facilitatorsPagination, setFacilitatorsPagination] = useState({ currentPage: 1, totalPages: 1, totalItems: 0, pageSize: 10 });
  const [facilitatorsLoading, setFacilitatorsLoading] = useState(false); // New: loading state for facilitators
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
  const [selectedLocation, setSelectedLocation] = useState("");
  const [locations, setLocations] = useState([]);

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
      // console.log('response', response.data);
  
      // Access the data array directly
      setOnlinePeople(response.data.data);
    } catch (error) {
      console.error("Error fetching online trainees:", error);
      setFeedbackMessage("Failed to fetch online trainees data.");
    }
  };

useEffect(() => {
  const timer = setInterval(() => {
    setFeedbackMessage(null);
  }, 5000);

  return () => clearTimeout(timer); // Always clean up timers in useEffect
}, []);



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
            surname: guest.surname || "", // <-- add this line
            email: guest.email || "N/A",
            location: guest.location || "N/A",
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
      
      // Fetch trainees based on user role
      if (userRole === "facilitator") {
        try {
          const traineesUrl = userLocation
            ? `https://timemanagementsystemserver.onrender.com/api/trainees/location?location=${userLocation}&limit=1000`
            : `https://timemanagementsystemserver.onrender.com/api/my-trainees?limit=1000`;
          const traineesResponse = await axios.get(traineesUrl, { headers });
          traineesData =
            traineesResponse.data?.allTrainees ||
            traineesResponse.data?.trainees ||
            [];
          // Debug log
          // console.log('Fetched trainees (facilitator):', traineesData);
        } catch (error) {
          console.error("Failed to fetch trainees for facilitator:", error);
          setFeedbackMessage("Failed to fetch trainees for facilitator.");
        }
      } else if (userRole === "super_admin" || userRole === "admin") {
        try {
          // Fetch ALL trainees for client-side pagination
          const traineesResponse = await axios.get(
            "https://timemanagementsystemserver.onrender.com/api/trainees?limit=1000",
            { headers }
          );
          traineesData = traineesResponse.data?.trainees || [];
          // Debug log
          // console.log('Fetched trainees (admin/super_admin):', traineesData);+
        } catch (error) {
          console.error("Failed to fetch trainees for admin:", error);
          setFeedbackMessage("Failed to fetch trainees for admin.");
        }
      }

      const formattedTrainees = traineesData.map(t => formatUser(t, "Trainee"));
      setAllTrainees(formattedTrainees); 
      allUserResults = [...formattedTrainees];

      if (userRole === "super_admin" || userRole === "admin") {
        try {
          const facilitatorsResponse = await axios.get(
            "https://timemanagementsystemserver.onrender.com/api/facilitators",
            { headers }
          );
          const facilitatorsData =
            facilitatorsResponse.data?.facilitators || [];
          const formattedFacilitators = facilitatorsData.map(f => formatUser(f, "Facilitator"));
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
          const formattedStakeholders = stakeholdersData.map(s => formatUser(s, "Stakeholder"));
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

  // Fetch Facilitators with server-side pagination
  const fetchFacilitators = async (page = 1, pageSize = 10) => {
    setFacilitatorsLoading(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const response = await axios.get(
        `https://timemanagementsystemserver.onrender.com/api/facilitators?page=${page}&pageSize=${pageSize}`,
        { headers }
      );
      setFacilitators(response.data.facilitators || []);
      setFacilitatorsPagination(response.data.pagination || { currentPage: 1, totalPages: 1, totalItems: 0, pageSize });
    } catch (error) {
      setFacilitators([]);
      setFacilitatorsPagination({ currentPage: 1, totalPages: 1, totalItems: 0, pageSize });
      setFeedbackMessage("Failed to fetch facilitators.");
    } finally {
      setFacilitatorsLoading(false);
    }
  };

  // Fetch All Data
  const fetchAllData = async () => {
    setIsLoading(true);
    setFetchError(null);
    try {
      await fetchUsers(currentPage); // unchanged for other tabs
      if (userRole === "super_admin" || userRole === "admin" || userRole === "facilitator") {
        await fetchGuests();
      }
      if (userRole === "super_admin") {
        await fetchOnlinePeople();
      }
      // Fetch facilitators for Facilitators tab (server-side pagination)
      if (userRole === "super_admin" || userRole === "admin") {
        await fetchFacilitators(currentPage, itemsPerPage);
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

  // Re-fetch facilitators specifically
  const refetchFacilitators = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const facilitatorsResponse = await axios.get(
        "https://timemanagementsystemserver.onrender.com/api/facilitators",
        { headers }
      );
      const facilitatorsData = facilitatorsResponse.data?.facilitators || [];
      const formattedFacilitators = facilitatorsData.map(f => formatUser(f, "Facilitator"));
      
      // Update the users state to include the refreshed facilitators
      setUsers(prevUsers => {
        const nonFacilitators = prevUsers.filter(user => user.role !== "Facilitator");
        return [...nonFacilitators, ...formattedFacilitators];
      });
    } catch (error) {
      console.error("Failed to re-fetch facilitators:", error);
      setFeedbackMessage("Failed to refresh facilitators data.");
    }
  };

  // Pagination Handler
  const handlePageChange = (page) => {
    if (activeTab === "Facilitators") {
      if (page >= 1 && page <= facilitatorsPagination.totalPages) {
        setCurrentPage(page);
        fetchFacilitators(page, facilitatorsPagination.pageSize);
      }
    } else {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    }
  };

  // Render Pagination Numbers
  const renderPaginationNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let total = activeTab === "Facilitators" ? facilitatorsPagination.totalPages : totalPages;
    let current = activeTab === "Facilitators" ? facilitatorsPagination.currentPage : currentPage;
    let startPage = Math.max(1, current - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(total, startPage + maxVisiblePages - 1);
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-number ${current === i ? "active" : ""}`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
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
    // Only allow super_admin to edit non-trainee users
    if (activeTab !== "Trainees" && activeTab !== "Online Trainees" && userRole !== "super_admin") {
      setFeedbackMessage("Only super administrators can edit facilitators, stakeholders, and guests.");
      return;
    }
    // console.log('UserManagement - user data being passed to modal:', user);
    setSelectedUser(user);
    setModalOpen(true);
  };

  // CSV Export
  const handleExportCSV = () => {
    setExportStatus("generating");
    const selectedColumns = Object.keys(columns).filter((key) => columns[key]);
    setTimeout(() => {
      try {
        // Use filteredAllTrainees for export (all, not just paginated)
        const data = filteredAllTrainees.map((user) => {
          return selectedColumns
            .map((col) => {
              switch (col) {
                case "fullName":
                  return user.fullName || "";
                case "surname":
                  return user.fullName?.split(" ").pop() || "";
                case "codeTribeId":
                  return user.id || "";
                case "email":
                case "emailAddress":
                  return user.email || "";
                case "phoneNumber":
                  return user.phoneNumber || "";
                case "lastCheckInDate":
                  return user.lastCheckIn || "";
                case "location":
                  return user.location || "";
                case "idNumber":
                  return user.idNumber || "";
                case "postalAddress":
                  return user.postalAddress || "";
                case "cohortYear":
                  return user.cohortYear || "";
                default:
                  return user[col] || "";
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
    // Use filteredAllTrainees for export (all, not just paginated)
    const data = filteredAllTrainees;
    doc.text(`${activeTab} Management`, 10, 10);
    doc.text("Full Name, Email, Role", 10, 20);
    data.forEach((user, index) => {
      if (index < 100) {
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

  // Data Filtering (always filter the full list, not just paginated)
  const [allTrainees, setAllTrainees] = useState([]); // Store all trainees for export

  // Data Filtering (for export: always use allTrainees, not paginated)
  const filteredAllTrainees = useMemo(() => {
    // Debug: Log all unique locations
    const uniqueLocations = Array.from(new Set(allTrainees.map(u => (u.location || '').trim().toLowerCase())));
    // console.log('Unique trainee locations:', uniqueLocations);

    let filtered = allTrainees.filter(
      (user) =>
        user.fullName
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    );
    if (
      selectedLocation &&
      activeTab === "Trainees" &&
      userRole === "super_admin"
    ) {
      filtered = filtered.filter(
        (user) => {
          const userLoc = (user.location || '').trim().toLowerCase();
          const selectedLoc = selectedLocation.trim().toLowerCase();
          return userLoc && userLoc === selectedLoc;
        }
      );
    }
    return filtered;
  }, [allTrainees, debouncedSearchTerm, selectedLocation, activeTab, userRole]);

  // Data Filtering (for display)
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



  // getTabData: Use facilitators state for Facilitators tab (no client-side pagination)
  const getTabData = (tabName) => {
    let data = [];
    switch (tabName) {
      case "Trainees":
        data = filteredAllTrainees;
        break;
      case "Facilitators":
        data = facilitators;
        break;
      case "Stakeholders":
        data = filteredUsersData.filter((u) => u.role === "Stakeholder");
        break;
      case "Guests":
        data = filteredGuestsData;
        break;
      case "Online Trainees":
        data = filteredOnlinePeopleData;
        break;
      default:
        data = [];
    }
    // Only apply client-side pagination to non-facilitators
    if (tabName !== "Facilitators") {
      const startIdx = (currentPage - 1) * itemsPerPage;
      const endIdx = startIdx + itemsPerPage;
      return data.slice(startIdx, endIdx);
    }
    return data;
  };



  // Calculate total pages for current tab (skip for Facilitators, use backend pagination)
  useEffect(() => {
    if (activeTab === "Facilitators") return;
    let totalItems = 0;
    switch (activeTab) {
      case "Trainees":
        totalItems = filteredAllTrainees.length;
        break;
      case "Stakeholders":
        totalItems = filteredUsersData.filter((u) => u.role === "Stakeholder").length;
        break;
      case "Guests":
        totalItems = filteredGuestsData.length;
        break;
      case "Online Trainees":
        totalItems = filteredOnlinePeopleData.length;
        break;
      default:
        totalItems = 0;
    }
    const newTotalPages = Math.ceil(totalItems / itemsPerPage);
    setTotalPages(newTotalPages);
  }, [activeTab, filteredAllTrainees, filteredUsersData, filteredGuestsData, filteredOnlinePeopleData, itemsPerPage]);

  // console.log(onlinePeople)

  // Available Tabs
  const getAvailableTabs = () => {
    if (userRole === "super_admin") {
      return ["Facilitators","Trainees", "Online Trainees", "Stakeholders", "Guests",];
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.map((trainee) => (
                <tr key={trainee.id}>
                  <td>{trainee.fullName}</td>
                  <td>{trainee.email}</td>
                  <td>{trainee.phoneNumber}</td>
                  <td>{new Date(trainee.lastActive).toLocaleString()}</td>
                  <td>
                    <button
                      className="action-btn"
                      onClick={() => handleTakeAction(trainee)}
                    >
                      Take action
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    if (tabName === "Facilitators" && facilitatorsLoading) {
      return <div className="users-table-wrapper"><DataLoader /></div>;
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
                  <th>Actions</th>
                </>
              ) : tabName === "Online Trainees" ? (
                <>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Last Active</th>
                  <th>Actions</th>
                </>
              ) : tabName === "Facilitators" ? (
                <>
                  <th>Full Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Actions</th>
                </>
              ) : tabName === "Trainees" ? (
                <>
                  <th>ID</th>
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
                  <th>Status</th>
                  <th>Actions</th>
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
                    <td>
                      {(tabName === "Guests" && (userRole === "super_admin" || userRole === "facilitator" || userRole === "admin")) ? (
                        <button
                          className="action-btn"
                          onClick={() => handleTakeAction(item)}
                        >
                          Take action
                        </button>
                      ) : (
                        userRole === "super_admin" && (
                          <button
                            className="action-btn"
                            onClick={() => handleTakeAction(item)}
                          >
                            Take action
                          </button>
                        )
                      )}
                    </td>
                  </>
                ) : tabName === "Online Trainees" ? (
                  <>
                    <td>{item.fullName}</td>
                    <td>{item.email}</td>
                    <td>{item.phoneNumber}</td>
                    <td>{new Date(item.lastActive).toLocaleString()}</td>
                    <td>
                      <button
                        className="action-btn"
                        onClick={() => handleTakeAction(item)}
                      >
                        Take action
                      </button>
                    </td>
                  </>
                ) : tabName === "Facilitators" ? (
                  <>
                    <td>{item.fullName}</td>
                    <td>{item.email}</td>
                    <td>{item.role}</td>
                    <td>
                      {userRole === "super_admin" && (
                        <button
                          className="action-btn"
                          onClick={() => handleTakeAction(item)}
                        >
                          Take action
                        </button>
                      )}
                    </td>
                  </>
                ) : tabName === "Trainees" ? (
                  <>
                    <td>{item.firebaseId}</td>
                    <td>{item.fullName}</td>
                    <td>{item.email}</td>
                    <td>{item.role}</td>
                    <td>
                      <span
                        className={`status-dot ${item.status === 'active' ? 'active' : 'suspended'}`}
                        title={item.status}
                      />
                    </td>
                    <td>
                      <button
                        className="action-btn"
                        onClick={() => handleTakeAction(item)}
                      >
                        Take action
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td>{item.fullName}</td>
                    <td>{item.email}</td>
                    <td>{item.role}</td>
                    <td>
                      <span
                        className={`status-dot ${item.status === 'active' ? 'active' : 'suspended'}`}
                        title={item.status}
                      />
                    </td>
                    <td>
                      {(tabName === "Trainees" && (userRole === "super_admin" || userRole === "facilitator" || userRole === "admin")) ? (
                        <button
                          className="action-btn"
                          onClick={() => handleTakeAction(item)}
                        >
                          Take action
                        </button>
                      ) : (
                        userRole === "super_admin" && (
                          <button
                            className="action-btn"
                            onClick={() => handleTakeAction(item)}
                          >
                            Take action
                          </button>
                        )
                      )}
                    </td>
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
      {/* Action Modal: Use UserActionModal for trainees, EditModal for others */}
      {activeTab === "Trainees" || activeTab === "Online Trainees" ? (
        <UserActionModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          trainee={selectedUser}
          onActionComplete={fetchAllData}
          setFeedbackMessage={setFeedbackMessage}
          showManualCheckIn={activeTab === "Trainees"}
        />
      ) : (
        <EditModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          user={selectedUser}
          userType={activeTab.slice(0, -1)} // Remove 's' from end (Facilitators -> Facilitator)
          onActionComplete={() => {
            fetchAllData();
            setTimeout(() => {
              setCurrentPage(currentPage);
            }, 100);
          }}
          setFeedbackMessage={setFeedbackMessage}
        />
      )}
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
    {feedbackMessage && <p className="feedback-message">{feedbackMessage}</p>}
    {fetchError && <p className="error-message">{fetchError}</p>}
  </div>
  <button className="add-user-btn" onClick={() => navigate("/add-user")}>
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
              {tab} <span className="tab-count">{
                tab === "Trainees" ? filteredAllTrainees.length :
                tab === "Facilitators" ? facilitators.length :
                tab === "Stakeholders" ? filteredUsersData.filter((u) => u.role === "Stakeholder").length :
                tab === "Guests" ? filteredGuestsData.length :
                tab === "Online Trainees" ? filteredOnlinePeopleData.length : 0
              }</span>
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
            {/* Location filter for super admin on Trainees tab */}
            {activeTab === "Trainees" && userRole === "super_admin" && (
              <div style={{ marginLeft: '1rem', minWidth: 180 }}>
                <CustomDropdown
                  options={[{ label: 'All Locations', value: '' }, ...LOCATIONS.map(loc => ({ label: loc, value: loc }))]}
                  value={selectedLocation}
                  onChange={setSelectedLocation}
                  placeholder="Filter by location"
                />
              </div>
            )}
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
              {totalPages > 1 && (
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
      {feedbackMessage && (
        <div className="snackbar-message">{feedbackMessage}</div>
      )}
    </div>
  );
};

export default UserManagement; 