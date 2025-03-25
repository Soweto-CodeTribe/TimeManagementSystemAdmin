/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
"use client";
import { useState, useEffect } from "react";
import { Search, Filter, Download, Upload, UserPlus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import "./styling/UserManagement.css";
import jsPDF from "jspdf";
import Modal from "./Modal";
import axios from "axios";
import DataLoader from "./dataLoader";
import CsvConfigModal from "./ui/CsvConfigModal";

const UserManagement = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [guests, setGuests] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState("");
  const [activeTab, setActiveTab] = useState("Trainees");
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const [exportStatus, setExportStatus] = useState("configuring");
  const [openCsvConfig, setOpenCsvConfig] = useState(false);
  const [fetchError, setFetchError] = useState(null);
  
  // Get authentication data from localStorage
  const token = localStorage.getItem("authToken");
  const userRole = localStorage.getItem("role");
  const userLocation = localStorage.getItem("userLocation");
  
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

  // Debounce search term to avoid excessive filtering
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearchTerm(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Check authentication on component mount
  useEffect(() => {
    if (!token) {
      setFeedbackMessage("Authentication required. Please log in.");
      navigate("/login");
    } else {
      fetchAllData();
    }
  }, []);

  // Handle new user addition from navigation state
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

  // Main function to fetch all necessary data
  // In fetchAllData function:
  // Main function to fetch all necessary data
  const fetchAllData = async () => {
    setIsLoading(true);
    setFetchError(null);

    try {
      // Fetch users based on role.  Always fetch users, but the endpoint changes.
      await fetchUsers();

      // Fetch guests data - conditionally based on role.
      if (userRole === "super_admin" || userRole === "admin" || userRole === "facilitator") {
        await fetchGuests();
      } else {
        console.warn("User role does not have permission to access guest data.");
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

  // Fetch guest data
  const fetchGuests = async () => {
    try {
      const response = await axios.get(
        "https://timemanagementsystemserver.onrender.com/api/guests/getGuests",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const guestsData = response.data.eventsWithGuests || [];

      // Add check to ensure we have some guestsData
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
        // Handle the case where there are no guests.
        setGuests([]);
        console.warn("No guest data found.");
      }
    } catch (error) {
      console.error("Error fetching guests:", error);
      setFeedbackMessage("Failed to fetch guests data.");
    }
  };

  // Fetch users (trainees, facilitators, stakeholders) based on role
  const fetchUsers = async () => {
    const headers = { Authorization: `Bearer ${token}` };
    let allUserResults = [];

    try {
      let traineesData = [];

      if (userRole === "facilitator") {
        try {
          const traineesUrl = userLocation
            ? `https://timemanagementsystemserver.onrender.com/api/trainees/location?location=${userLocation}`
            : "https://timemanagementsystemserver.onrender.com/api/my-trainees";

          const traineesResponse = await axios.get(traineesUrl, { headers });
          traineesData = traineesResponse.data?.allTrainees || traineesResponse.data?.trainees || [];
        } catch (error) {
          console.error("Failed to fetch trainees for facilitator:", error);
          setFeedbackMessage("Failed to fetch trainees for facilitator.");
        }
      } else if (userRole === "super_admin" || userRole === "admin") {
        try {
          const traineesResponse = await axios.get(
            "https://timemanagementsystemserver.onrender.com/api/trainees",
            { headers }
          );

          traineesData = traineesResponse.data?.trainees || [];
        } catch (error) {
          console.error("Failed to fetch trainees for admin:", error);
          setFeedbackMessage("Failed to fetch trainees for admin.");
        }
      }

      const formattedTrainees = traineesData.map((trainee) => ({
        id: trainee._id || trainee.id || `trainee-${crypto.randomUUID()}`,
        fullName: trainee.fullName || `${trainee.name || ""} ${trainee.surname || ""}`.trim(),
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

          const facilitatorsData = facilitatorsResponse.data?.facilitators || [];
          const formattedFacilitators = facilitatorsData.map((facilitator) => ({
            id: facilitator._id || facilitator.id || `facilitator-${crypto.randomUUID()}`,
            fullName: facilitator.fullName || `${facilitator.name || ""} ${facilitator.surname || ""}`.trim(),
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

          const stakeholdersData = stakeholdersResponse.data?.stakeholders || [];
          const formattedStakeholders = stakeholdersData.map((stakeholder) => ({
            id: stakeholder._id || stakeholder.id || `stakeholder-${crypto.randomUUID()}`,
            fullName: stakeholder.fullName || `${stakeholder.name || ""} ${stakeholder.surname || ""}`.trim(),
            email: stakeholder.email || stakeholder.emailAddress || "N/A",
            phoneNumber: stakeholder.phone || stakeholder.phone || "N/A",
            role: "Stakeholder",
            status: stakeholder.status || "active",
          }));

          allUserResults = [...allUserResults, ...formattedStakeholders];
        } catch (error) {
          // Check if it's a permission error
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


  // Fetch guests data
  // const fetchGuests = async () => {
  //   try {
  //     const response = await axios.get(
  //       "https://timemanagementsystemserver.onrender.com/api/guests/getGuests",
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );

  //     const guestsData = response.data.eventsWithGuests || [];
  //     const formattedGuests = guestsData.flatMap((event) =>
  //       (event.guestDetails || []).map((guest) => ({
  //         id: guest.id || guest._id || `guest-${crypto.randomUUID()}`,
  //         fullName: guest.fullNames || "N/A",
  //         email: guest.email || "N/A",
  //         phoneNumber: guest.cellPhone || "N/A",
  //         lastVisit: guest.lastVisit || event.date || "N/A",
  //         role: "Guest", // Ensure role is explicitly set to 'Guest'
  //         status: "active",
  //       }))
  //     );

  //     setGuests(formattedGuests);
  //   } catch (error) {
  //     console.error("Error fetching guests:", error);
  //     throw new Error("Failed to fetch guests data");
  //   }
  // };

  // // Fetch users (trainees, facilitators, stakeholders) based on role
  // const fetchUsers = async () => {
  //   const headers = { Authorization: `Bearer ${token}` };
  //   let allUserResults = [];

  //   try {
  //     // === 1. Fetch trainees based on role ===
  //     let traineesData = [];

  //     if (userRole === "facilitator") {
  //       try {
  //         let traineesUrl = userLocation
  //           ? `https://timemanagementsystemserver.onrender.com/api/trainees/location?location=${userLocation}`
  //           : "https://timemanagementsystemserver.onrender.com/api/my-trainees";

  //         const traineesResponse = await axios.get(traineesUrl, { headers });
  //         traineesData = traineesResponse.data?.allTrainees || traineesResponse.data?.trainees || [];
  //       } catch (error) {
  //         console.error("Failed to fetch trainees for facilitator:", error);
  //         throw new Error("Failed to fetch trainees");
  //       }
  //     } else if (userRole === "super_admin" || userRole === "admin") {
  //       try {
  //         const traineesResponse = await axios.get(
  //           "https://timemanagementsystemserver.onrender.com/api/trainees",
  //           { headers }
  //         );
  //         traineesData = traineesResponse.data?.trainees || [];
  //       } catch (error) {
  //         console.error("Failed to fetch trainees for admin:", error);
  //         throw new Error("Failed to fetch trainees");
  //       }
  //     }

  //     const formattedTrainees = traineesData.map((trainee) => ({
  //       id: trainee._id || trainee.id || `trainee-${crypto.randomUUID()}`,
  //       fullName: trainee.fullName || `${trainee.name || ""} ${trainee.surname || ""}`.trim(),
  //       email: trainee.email || trainee.emailAddress || "N/A",
  //       phoneNumber: trainee.phoneNumber || trainee.phone || "N/A",
  //       role: "Trainee", // Ensure role is explicitly set
  //       status: trainee.status || "active",
  //       lastCheckIn: trainee.lastCheckInDate || "N/A",
  //     }));

  //     allUserResults = [...formattedTrainees];

  //     if (userRole === "super_admin" || userRole === "admin") {
  //       try {
  //         const facilitatorsResponse = await axios.get(
  //           "https://timemanagementsystemserver.onrender.com/api/facilitators",
  //           { headers }
  //         );

  //         const facilitatorsData = facilitatorsResponse.data?.facilitators || [];
  //         const formattedFacilitators = facilitatorsData.map((facilitator) => ({
  //           id: facilitator._id || facilitator.id || `facilitator-${crypto.randomUUID()}`,
  //           fullName: facilitator.fullName || `${facilitator.name || ""} ${facilitator.surname || ""}`.trim(),
  //           email: facilitator.email || facilitator.emailAddress || "N/A",
  //           phoneNumber: facilitator.phoneNumber || facilitator.phone || "N/A",
  //           role: "Facilitator", // Ensure role is explicitly set
  //           status: facilitator.status || "active",
  //         }));

  //         allUserResults = [...allUserResults, ...formattedFacilitators];
  //       } catch (error) {
  //         console.error("Failed to fetch facilitators:", error);
  //       }

  //       try {
  //         const stakeholdersResponse = await axios.get(
  //           "https://timemanagementsystemserver.onrender.com/api/stakeholder/all",
  //           { headers }
  //         );

  //         const stakeholdersData = stakeholdersResponse.data?.stakeholders || [];
  //         const formattedStakeholders = stakeholdersData.map((stakeholder) => ({
  //           id: stakeholder._id || stakeholder.id || `stakeholder-${crypto.randomUUID()}`,
  //           fullName: stakeholder.fullName || `${stakeholder.name || ""} ${stakeholder.surname || ""}`.trim(),
  //           email: stakeholder.email || stakeholder.emailAddress || "N/A",
  //           phoneNumber: stakeholder.phoneNumber || stakeholder.phone || "N/A",
  //           role: "Stakeholder", // Ensure role is explicitly set
  //           status: stakeholder.status || "active",
  //         }));

  //         allUserResults = [...allUserResults, ...formattedStakeholders];
  //       } catch (error) {
  //         if (error.response?.status === 403) {
  //           console.warn("User doesn't have permission to access stakeholders");
  //         } else {
  //           console.error("Failed to fetch stakeholders:", error);
  //         }
  //       }
  //     }

  //     setUsers(allUserResults);
  //   } catch (error) {
  //     console.error("Error in fetchUsers:", error);
  //     throw error;
  //   }
  // };

//   const fetchGuests = async () => {
//     try {
//         const response = await axios.get(
//             "https://timemanagementsystemserver.onrender.com/api/guests/getGuests",
//             { headers: { Authorization: `Bearer ${token}` } }
//         );

//         const guestsData = response.data.eventsWithGuests || [];
//         const formattedGuests = guestsData.flatMap((event) =>
//             (event.guestDetails || []).map((guest) => ({
//                 id: guest.id || guest._id || `guest-${crypto.randomUUID()}`, //this line might be creating issues, ideally the id should be unique at the database
//                 fullName: guest.fullNames || "N/A",
//                 email: guest.email || "N/A",
//                 phoneNumber: guest.cellPhone || "N/A",
//                 lastVisit: guest.lastVisit || event.date || "N/A",
//                 role: "Guest",
//                 status: "active",
//             }))
//         );

//         setGuests(formattedGuests);
//     } catch (error) {
//         console.error("Error fetching guests:", error);
//         throw new Error("Failed to fetch guests data");
//     }
// };

// // Fetch users (trainees, facilitators, stakeholders) based on role
// const fetchUsers = async () => {
//     const headers = { Authorization: `Bearer ${token}` };
//     let allUserResults = [];

//     try {
//         // === 1. Fetch trainees based on role ===
//         let traineesData = [];

//         if (userRole === "facilitator") {
//             // Facilitators can see their trainees or trainees at their location
//             try {
//                 let traineesUrl = userLocation
//                     ? `https://timemanagementsystemserver.onrender.com/api/trainees/location?location=${userLocation}`
//                     : "https://timemanagementsystemserver.onrender.com/api/my-trainees";

//                 const traineesResponse = await axios.get(traineesUrl, { headers });

//                 // Extract trainees from response based on API structure
//                 traineesData = traineesResponse.data?.allTrainees || traineesResponse.data?.trainees || [];
//             } catch (error) {
//                 console.error("Failed to fetch trainees for facilitator:", error);
//                 throw new Error("Failed to fetch trainees");
//             }
//         }
//         else if (userRole === "super_admin" || userRole === "admin") {
//             // Admins can see all trainees
//             try {
//                 const traineesResponse = await axios.get(
//                     "https://timemanagementsystemserver.onrender.com/api/trainees",
//                     { headers }
//                 );

//                 traineesData = traineesResponse.data?.trainees || [];
//             } catch (error) {
//                 console.error("Failed to fetch trainees for admin:", error);
//                 throw new Error("Failed to fetch trainees");
//             }
//         }

//         // Map trainees to common format
//         const formattedTrainees = traineesData.map(trainee => ({
//             id: trainee._id || trainee.id || `trainee-${crypto.randomUUID()}`, //this line might be creating issues, ideally the id should be unique at the database
//             fullName: trainee.fullName || `${trainee.name || ""} ${trainee.surname || ""}`.trim(),
//             email: trainee.email || trainee.emailAddress || "N/A",
//             phoneNumber: trainee.phoneNumber || trainee.phone || "N/A",
//             role: "Trainee",
//             status: trainee.status || "active",
//             lastCheckIn: trainee.lastCheckInDate || "N/A"
//         }));

//         allUserResults = [...formattedTrainees];

//         // === 2. Fetch facilitators and stakeholders if user has appropriate role ===
//         if (userRole === "super_admin" || userRole === "admin") {
//             // Fetch facilitators
//             try {
//                 const facilitatorsResponse = await axios.get(
//                     "https://timemanagementsystemserver.onrender.com/api/facilitators",
//                     { headers }
//                 );

//                 const facilitatorsData = facilitatorsResponse.data?.facilitators || [];
//                 const formattedFacilitators = facilitatorsData.map(facilitator => ({
//                     id: facilitator._id || facilitator.id || `facilitator-${crypto.randomUUID()}`,  //this line might be creating issues, ideally the id should be unique at the database
//                     fullName: facilitator.fullName || `${facilitator.name || ""} ${facilitator.surname || ""}`.trim(),
//                     email: facilitator.email || facilitator.emailAddress || "N/A",
//                     phoneNumber: facilitator.phoneNumber || facilitator.phone || "N/A",
//                     role: "Facilitator",
//                     status: facilitator.status || "active"
//                 }));

//                 allUserResults = [...allUserResults, ...formattedFacilitators];
//             } catch (error) {
//                 console.error("Failed to fetch facilitators:", error);
//                 // Don't throw error, just continue with what we have
//             }

//             // Fetch stakeholders
//             try {
//                 const stakeholdersResponse = await axios.get(
//                     "https://timemanagementsystemserver.onrender.com/api/stakeholder/all",
//                     { headers }
//                 );

//                 const stakeholdersData = stakeholdersResponse.data?.stakeholders || [];
//                 const formattedStakeholders = stakeholdersData.map(stakeholder => ({
//                     id: stakeholder._id || stakeholder.id || `stakeholder-${crypto.randomUUID()}`, //this line might be creating issues, ideally the id should be unique at the database
//                     fullName: stakeholder.fullName || `${stakeholder.name || ""} ${stakeholder.surname || ""}`.trim(),
//                     email: stakeholder.email || stakeholder.emailAddress || "N/A",
//                     phoneNumber: stakeholder.phoneNumber || stakeholder.phone || "N/A",
//                     role: "Stakeholder",
//                     status: stakeholder.status || "active"
//                 }));

//                 allUserResults = [...allUserResults, ...formattedStakeholders];
//             } catch (error) {
//                 // Check if it's a permission error
//                 if (error.response?.status === 403) {
//                     console.warn("User doesn't have permission to access stakeholders");
//                 } else {
//                     console.error("Failed to fetch stakeholders:", error);
//                 }
//                 // Don't throw error, just continue with what we have
//             }
//         }

//         // Update state with all user data
//         setUsers(allUserResults);

//     } catch (error) {
//         console.error("Error in fetchUsers:", error);
//         throw error;
//     }
// };


  // Fetch guest data
  // const fetchGuests = async () => {
  //   try {
  //     const response = await axios.get(
  //       "https://timemanagementsystemserver.onrender.com/api/guests/getGuests",
  //       { headers: { Authorization: `Bearer ${token}` } }
  //     );
      
  //     const guestsData = response.data.eventsWithGuests || [];
  //     const formattedGuests = guestsData.flatMap((event) =>
  //       (event.guestDetails || []).map((guest) => ({
  //         id: guest.id || guest._id || `guest-${crypto.randomUUID()}`,
  //         fullName: guest.fullNames || "N/A",
  //         email: guest.email || "N/A",
  //         phoneNumber: guest.cellPhone || "N/A",
  //         lastVisit: guest.lastVisit || event.date || "N/A",
  //         role: "Guest",
  //         status: "active",
  //       }))
  //     );
      
  //     setGuests(formattedGuests);
  //   } catch (error) {
  //     console.error("Error fetching guests:", error);
  //     throw new Error("Failed to fetch guests data");
  //   }
  // };

  // Fetch users (trainees, facilitators, stakeholders) based on role
  // const fetchUsers = async () => {
  //   const headers = { Authorization: `Bearer ${token}` };
  //   let allUserResults = [];
    
  //   try {
  //     // === 1. Fetch trainees based on role ===
  //     let traineesData = [];
      
  //     if (userRole === "facilitator") {
  //       // Facilitators can see their trainees or trainees at their location
  //       try {
  //         let traineesUrl = userLocation 
  //           ? `https://timemanagementsystemserver.onrender.com/api/trainees/location?location=${userLocation}`
  //           : "https://timemanagementsystemserver.onrender.com/api/my-trainees";
          
  //         const traineesResponse = await axios.get(traineesUrl, { headers });
          
  //         // Extract trainees from response based on API structure
  //         traineesData = traineesResponse.data?.allTrainees || traineesResponse.data?.trainees || [];
  //       } catch (error) {
  //         console.error("Failed to fetch trainees for facilitator:", error);
  //         throw new Error("Failed to fetch trainees");
  //       }
  //     } 
  //     else if (userRole === "super_admin" || userRole === "admin") {
  //       // Admins can see all trainees
  //       try {
  //         const traineesResponse = await axios.get(
  //           "https://timemanagementsystemserver.onrender.com/api/trainees",
  //           { headers }
  //         );
          
  //         traineesData = traineesResponse.data?.trainees || [];
  //       } catch (error) {
  //         console.error("Failed to fetch trainees for admin:", error);
  //         throw new Error("Failed to fetch trainees");
  //       }
  //     }
      
  //     // Map trainees to common format
  //     const formattedTrainees = traineesData.map(trainee => ({
  //       id: trainee._id || trainee.id || `trainee-${crypto.randomUUID()}`,
  //       fullName: trainee.fullName || `${trainee.name || ""} ${trainee.surname || ""}`.trim(),
  //       email: trainee.email || trainee.emailAddress || "N/A",
  //       phoneNumber: trainee.phoneNumber || trainee.phone || "N/A",
  //       role: "Trainee",
  //       status: trainee.status || "active",
  //       lastCheckIn: trainee.lastCheckInDate || "N/A"
  //     }));
      
  //     allUserResults = [...formattedTrainees];
      
  //     // === 2. Fetch facilitators and stakeholders if user has appropriate role ===
  //     if (userRole === "super_admin" || userRole === "admin") {
  //       // Fetch facilitators
  //       try {
  //         const facilitatorsResponse = await axios.get(
  //           "https://timemanagementsystemserver.onrender.com/api/facilitators",
  //           { headers }
  //         );
          
  //         const facilitatorsData = facilitatorsResponse.data?.facilitators || [];
  //         const formattedFacilitators = facilitatorsData.map(facilitator => ({
  //           id: facilitator._id || facilitator.id || `facilitator-${crypto.randomUUID()}`,
  //           fullName: facilitator.fullName || `${facilitator.name || ""} ${facilitator.surname || ""}`.trim(),
  //           email: facilitator.email || facilitator.emailAddress || "N/A",
  //           phoneNumber: facilitator.phoneNumber || facilitator.phone || "N/A",
  //           role: "Facilitator",
  //           status: facilitator.status || "active"
  //         }));
          
  //         allUserResults = [...allUserResults, ...formattedFacilitators];
  //       } catch (error) {
  //         console.error("Failed to fetch facilitators:", error);
  //         // Don't throw error, just continue with what we have
  //       }
        
  //       // Fetch stakeholders
  //       try {
  //         const stakeholdersResponse = await axios.get(
  //           "https://timemanagementsystemserver.onrender.com/api/stakeholder/all",
  //           { headers }
  //         );
          
  //         const stakeholdersData = stakeholdersResponse.data?.stakeholders || [];
  //         const formattedStakeholders = stakeholdersData.map(stakeholder => ({
  //           id: stakeholder._id || stakeholder.id || `stakeholder-${crypto.randomUUID()}`,
  //           fullName: stakeholder.fullName || `${stakeholder.name || ""} ${stakeholder.surname || ""}`.trim(),
  //           email: stakeholder.email || stakeholder.emailAddress || "N/A",
  //           phoneNumber: stakeholder.phoneNumber || stakeholder.phone || "N/A",
  //           role: "Stakeholder",
  //           status: stakeholder.status || "active"
  //         }));
          
  //         allUserResults = [...allUserResults, ...formattedStakeholders];
  //       } catch (error) {
  //         // Check if it's a permission error
  //         if (error.response?.status === 403) {
  //           console.warn("User doesn't have permission to access stakeholders");
  //         } else {
  //           console.error("Failed to fetch stakeholders:", error);
  //         }
  //         // Don't throw error, just continue with what we have
  //       }
  //     }
      
  //     // Update state with all user data
  //     setUsers(allUserResults);
      
  //   } catch (error) {
  //     console.error("Error in fetchUsers:", error);
  //     throw error;
  //   }
  // };

  // Toggle user status (active/deactive)
  const toggleUserStatus = async (userId) => {
    try {
      // Here we would typically make an API call to update the user status
      // For now, we'll just update the local state
      setUsers(prevUsers => 
        prevUsers.map(user =>
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

  // Delete user
  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    try {
      // Here we would typically make an API call to delete the user
      // For now, we'll just update the local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== selectedUser.id));
      setModalOpen(false);
      setFeedbackMessage("User deleted successfully.");
    } catch (error) {
      console.error("Error deleting user:", error);
      setFeedbackMessage("Failed to delete user.");
    }
  };

  // Handle "Take Action" button
  const handleTakeAction = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  // Filter data based on search term
  // const filteredUsersData = users.filter(
  //   (user) =>
  //     user.fullName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
  //     user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
  //     user.role.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  // );

  // const filteredGuestsData = guests.filter(
  //   (guest) =>
  //     guest.fullName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
  //     guest.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
  //     (guest.phoneNumber && guest.phoneNumber.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
  // );


  const filteredUsersData = users.filter(
    (user) =>
      user.fullName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      user.role.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  const filteredGuestsData = guests.filter(
    (guest) =>
      guest.fullName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      guest.email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      (guest.phoneNumber && guest.phoneNumber.toLowerCase().includes(debouncedSearchTerm.toLowerCase()))
  );

  // Get tab-specific data
// Update the getTabData function to ensure guests only appear in the Guests tab

// const getTabData = (tabName) => {
//   switch (tabName) {
//     case "Trainees":
//       return filteredUsersData.filter((u) => u.role === "Trainee");
//     case "Facilitators":
//       return filteredUsersData.filter((u) => u.role === "Facilitator");
//     case "Stakeholders":
//       return filteredUsersData.filter((u) => u.role === "Stakeholder");
//     case "Guests":
//       // Only return the guest data for this tab - do not filter users
//       return filteredGuestsData;
//     default:
//       return [];
//   }
// };

const getTabData = (tabName) => {
  switch (tabName) {
    case "Trainees":
      return filteredUsersData.filter((u) => u.role === "Trainee");
    case "Facilitators":
      return filteredUsersData.filter((u) => u.role === "Facilitator");
    case "Stakeholders":
      return filteredUsersData.filter((u) => u.role === "Stakeholder");
    case "Guests":
      return filteredGuestsData; // Only return guests data here
    default:
      return [];
  }
};


  // Pagination logic
  const paginate = (data) => {
    const start = (currentPage - 1) * itemsPerPage;
    return data.slice(start, start + itemsPerPage);
  };

  // Determine which tabs to show based on user role
  const getAvailableTabs = () => {
    if (userRole === "super_admin" || userRole === "admin") {
      return ["Trainees", "Facilitators", "Stakeholders", "Guests"];
    } else {
      return ["Trainees", "Guests"];
    }
  };

  // Export as CSV with configured columns
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
                  return (user.fullName?.split(" ").pop()) || "";
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

  // Export as PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    const data = getTabData(activeTab);
    doc.text(`${activeTab} Management`, 10, 10);
    doc.text("Full Name, Email, Role", 10, 20);
    data.forEach((user, index) => {
      // Limit the number of entries to prevent PDF overflow
      if (index < 30) {
        doc.text(
          `${user.fullName?.substring(0, 30) || ""}, ${user.email?.substring(0, 30) || ""}, ${user.role || ""}`,
          10,
          30 + index * 10
        );
      }
    });
    doc.save(`${activeTab.toLowerCase()}Management.pdf`);
  };

  // Import CSV
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

  // Render table with pagination
  const renderTable = (tabName) => {
    const data = getTabData(tabName);
    const paginatedData = paginate(data);

    if (paginatedData.length === 0) {
      return <div className="no-data-message">No {tabName.toLowerCase()} found.</div>;
    }

    return (
      <>
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
            {paginatedData.map((item) => (
              console.log('item',item.id),
              <tr key={item.id.toString()}>
                {tabName === "Guests" ? (
                  <>
                    <td>{item.fullName}</td>
                    <td>{item.email}</td>
                    <td>{item.phoneNumber}</td>
                    <td>{item.lastVisit}</td>
                  </>
                ) : (
                  <>
                    <td>{item.fullName}</td>
                    <td>{item.email}</td>
                    <td>{item.role}</td>
                    <td>
                      <span
                        className={`status-badge ${item.status}`}
                        onClick={() => toggleUserStatus(item.id)}
                      >
                        {item.status === "deactive" ? "Deactive" : "Active"}
                      </span>
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
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {renderPagination(tabName, data.length)}
      </>
    );
  };

  // Pagination controls
  const renderPagination = (tabName, totalItems) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    return (
      <div className="pagination-controls">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
        >
          {'<'}
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
        >
          {">"}
        </button>
      </div>
    );
  };

  // Get available tabs based on user role
  const availableTabs = getAvailableTabs();

  return (
    <div className="user-management-container">
      {/* Action Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onView={() => console.log("View user:", selectedUser)}
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
            {`Manage trainees${userRole === 'facilitator' ? '' : ', facilitators, stakeholders'} and guests`}
          </p>
          {feedbackMessage && (
            <p className="feedback-message">{feedbackMessage}</p>
          )}
          {fetchError && (
            <p className="error-message">{fetchError}</p>
          )}
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
                setCurrentPage(1); // Reset to first page when changing tabs
              }}
            >
              {tab} <span className="tab-count">{getTabData(tab).length}</span>
            </button>
          ))}
        </div>

        <div className="table-controls">
          <div className="left-controls">
            {/* <button className="filter-btn">
              <Filter size={14} />
              <span>Filter</span>
            </button> */}
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
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              style={{ display: "none" }}
              id="csvInput"
            />
            <label htmlFor="csvInput" className="import-btn">
              <Upload size={14} />
              <span>Import CSV</span>
            </label>
          </div>
        </div>

        {/* Tab Content */}
        <div className="tabContentContainer">
          {isLoading ? (
            <DataLoader />
          ) : (
            <div className="tab-content active">
              {renderTable(activeTab)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserManagement;