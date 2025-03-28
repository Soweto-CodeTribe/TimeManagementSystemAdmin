import React from "react";
import UserTable from "../UserTable";

const FacilitatorsTab = ({ 
  facilitators, 
  isLoading, 
  searchTerm, 
  onToggleUserStatus, 
  onTakeAction 
}) => {
  const filteredFacilitators = facilitators.filter(facilitator => 
    facilitator.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    facilitator.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <UserTable 
      data={filteredFacilitators} 
      type="facilitators"
      isLoading={isLoading}
      onToggleUserStatus={onToggleUserStatus}
      onTakeAction={onTakeAction}
    />
  );
};

export default FacilitatorsTab;