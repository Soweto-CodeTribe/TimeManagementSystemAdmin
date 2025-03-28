import React from "react";
import UserTable from "../UserTable";

const GuestsTab = ({ 
  guests, 
  isLoading, 
  searchTerm 
}) => {
  const filteredGuests = guests.filter(guest => 
    guest.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    guest.phoneNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <UserTable 
      data={filteredGuests} 
      type="guests"
      isLoading={isLoading}
    />
  );
};

export default GuestsTab;