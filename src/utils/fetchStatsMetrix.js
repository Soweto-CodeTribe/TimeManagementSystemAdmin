import axios from "axios";

const BASE_URL = "https://timemanagementsystemserver.onrender.com";

export const fetchWeeklyStats = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/super-admin/weekly`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching weekly stats:", error);
    throw error;
  }
};

export const fetchFacilitatorsStats = async (token) => {
  try {
    const response = await axios.get(`${BASE_URL}/api/facilitators`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data;
  } catch (error) {
    console.error("Error fetching facilitators stats:", error);
    throw error;
  }
};
