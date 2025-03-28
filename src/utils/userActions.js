// src/utils/userActions.js
export const toggleUserStatus = async (userId, fetchData) => {
    try {
      // Simulate an API call to toggle user status
      console.log(`Toggling status for user ID: ${userId}`);
      // Optionally, refetch data after toggling
      await fetchData();
    } catch (error) {
      console.error("Error toggling user status:", error);
    }
  };