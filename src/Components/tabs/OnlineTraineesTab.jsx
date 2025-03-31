import React, { useState, useEffect } from "react";
import axios from "axios";
import UserTable from '../UserTable'

const OnlineTraineesTab = ({ searchTerm }) => {
  const [onlineTrainees, setOnlineTrainees] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchOnlineTrainees = async () => {
    const token = localStorage.getItem("authToken");

    try {
      const response = await axios.get(
        "https://timemanagementsystemserver.onrender.com/api/trainees/online",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const formattedTrainees = response.data?.onlineTrainees.map((trainee) => ({
        id: trainee._id || trainee.id,
        fullName: trainee.fullName || `${trainee.name || ""} ${trainee.surname || ""}`.trim(),
        email: trainee.email || trainee.emailAddress,
        phoneNumber: trainee.phoneNumber || trainee.phone,
        status: "online",
        lastCheckIn: trainee.lastOnlineTimestamp || "N/A"
      }));

      setOnlineTrainees(formattedTrainees);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching online trainees:", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOnlineTrainees();
  }, []);

  const filteredOnlineTrainees = onlineTrainees.filter(trainee => 
    trainee.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trainee.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <UserTable 
      data={filteredOnlineTrainees} 
      type="online-trainees"
      isLoading={isLoading}
    />
  );
};

export default OnlineTraineesTab;