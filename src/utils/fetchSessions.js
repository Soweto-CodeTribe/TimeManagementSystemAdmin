import axios from "axios";

const BASE_URL = "https://timemanagementsystemserver.onrender.com/";

/**
 * Fetches daily session data from the API using query parameters directly in the URL.
 * 
 * @param {string} token - The authentication token for the API request.
 * @param {number} page - The page number for pagination (default: 1).
 * @param {number} itemsPerPage - The number of items per page (default: 10).
 * @param {string} searchTerm - Optional search term for filtering results.
 * @param {string} filterStatus - Optional status filter for the reports.
 * @param {string} filterDate - Optional date filter for the reports.
 * @returns {Promise<Object>} - An object containing summary, reports, and pagination data.
 */
const fetchSessions = async (
  token,
  page = 1,
  itemsPerPage = 10,
  searchTerm = "",
  filterStatus = "",
  filterDate = ""
) => {
  try {
    // Construct the URL with query parameters
    const url = `${BASE_URL}api/super-admin/daily?page=${page}&limit=${itemsPerPage}${
      searchTerm ? `&search=${encodeURIComponent(searchTerm)}` : ""
    }${filterStatus ? `&status=${encodeURIComponent(filterStatus)}` : ""}${
      filterDate ? `&date=${encodeURIComponent(filterDate)}` : ""
    }`;

    // Make the API request
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    // Extract relevant data from the response
    const data = response?.data || {};
    return {
      summaryData: data.summary || {},
      reports: data.paginatedReports || [],
      pagination: data.pagination || {},
    };
  } catch (error) {
    console.error("Error fetching daily report:", error);
    throw new Error(error?.response?.data?.message || "Failed to load reports");
  }
};

export default fetchSessions;
