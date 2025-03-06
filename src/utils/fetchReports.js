import axios from "axios";

const BASE_URL = "https://timemanagementsystemserver.onrender.com/"
// const token = useSelector((state) => state.auth.token);
const fetchReports = async (token, page = 1, itemsPerPage = 10) => {
  try {
    const response = await axios.get(`${BASE_URL}api/session/daily-report`, {
      params: { page, limit: itemsPerPage },
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

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

export default fetchReports;
