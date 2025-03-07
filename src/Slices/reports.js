import axios from 'axios';

const API_URL = 'https://your-api-endpoint.com/reports'; // Replace with your actual API endpoint

export const fetchReportsAPI = async () => {
  return await axios.get(API_URL);
};

export const deleteReportAPI = async (reportId) => {
  return await axios.delete(`${API_URL}/${reportId}`);
};
