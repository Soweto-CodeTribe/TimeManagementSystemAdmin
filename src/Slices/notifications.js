import axios from 'axios';

const API_URL = 'https://your-api-endpoint.com/notifications'; // Replace with your actual API endpoint

export const fetchNotificationsAPI = async () => {
  try {
    const response = await axios.get(API_URL);
    return response;
  } catch (error) {
    throw error;
  }
};

export const markNotificationAsReadAPI = async (notificationId) => {
  try {
    await axios.patch(`${API_URL}/${notificationId}`, { read: true });
  } catch (error) {
    throw error;
  }
};
