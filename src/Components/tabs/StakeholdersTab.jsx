import React from "react";
import UserTable from "../UserTable";

const StakeholdersTab = ({ 
  stakeholders, 
  isLoading, 
  searchTerm, 
  onToggleUserStatus, 
  onTakeAction 
}) => {
  const filteredStakeholders = stakeholders.filter(stakeholder => 
    stakeholder.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    stakeholder.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <UserTable 
      data={filteredStakeholders} 
      type="stakeholders"
      isLoading={isLoading}
      onToggleUserStatus={onToggleUserStatus}
      onTakeAction={onTakeAction}
    />
  );
};

export default StakeholdersTab;