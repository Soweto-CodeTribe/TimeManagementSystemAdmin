import { useState, useEffect } from "react";
import axios from "axios";

const useFacilitatorCount = () => {
  const [facilitatorCount, setFacilitatorCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFacilitatorCount = async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setError("No authorization token found. Please log in again.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const headers = { Authorization: `Bearer ${token}` };

      // Fetch facilitator data
      const response = await axios.get(
        "https://timemanagementsystemserver.onrender.com/api/facilitators",
        { headers }
      );

      // Extract facilitator count
      const facilitatorsArray = response.data.facilitators || response.data || [];
      const count = Array.isArray(facilitatorsArray) ? facilitatorsArray.length : 0;

      setFacilitatorCount(count);
    } catch (error) {
      console.error("Error fetching facilitator count:", error);
      setError("Error fetching facilitator count. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFacilitatorCount();
  }, []);

  return { facilitatorCount, loading, error };
};

export default useFacilitatorCount;