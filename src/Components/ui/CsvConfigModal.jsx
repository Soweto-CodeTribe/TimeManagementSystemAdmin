/* eslint-disable react/prop-types */
// import { useState } from 'react'

const CsvConfigModal = ({ 
  columns, 
  setColumns, 
  onClose, 
  onExport, 
  exportStatus 
}) => {
  // Function to check if all columns are selected
  const areAllColumnsSelected = () => {
    return Object.values(columns).every(value => value === true);
  };

  // Handle select all functionality
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const updatedColumns = {};
    
    Object.keys(columns).forEach(key => {
      updatedColumns[key] = isChecked;
    });
    
    setColumns(updatedColumns);
  };
  
  // Handle individual column change
  const handleColumnChange = (e) => {
    const { id, checked } = e.target;
    setColumns({
      ...columns,
      [id]: checked
    });
  };

  // Render configuration view
  const renderConfigView = () => {
    // Define column categories
    const columnCategories = [
      {
        title: "Core Trainee Information",
        columns: ["fullName", "surname",  "Location", "idNumber", "cohortYear"]
      },
      {
        title: "Contact & Profile Information",
        columns: ["emailAddress", "phoneNumber", "postalAddress"]
      },
      // {
      //   title: "Employment & Career Data",
      //   columns: ["currentEmployer", "jobTitle", "startDate"]
      // },
      // {
      //   title: "Attendance & Activity Tracking",
      //   columns: ["lastCheckInDate", "missedCheckIns"]
      // }
    ];

    return (
      <>
        <div className="csvModalHeader">
          <h2>Customize Exported Data</h2>
          <button onClick={onClose} className="closeButton">×</button>
        </div>
        <p className="csvDescription">Select the columns you want to include in your CSV file. You can adjust the selection based on your needs.</p>
        
        <div className="selectAllColumns">
          <h3>Select Columns</h3>
          <div className="checkboxContainer">
            <input 
              type="checkbox" 
              id="selectAll" 
              checked={areAllColumnsSelected()}
              onChange={handleSelectAll}
            />
            <label htmlFor="selectAll">Select all</label>
          </div>
        </div>
        
        <div className="columnsContainer">
          {columnCategories.map((category) => (
            <div key={category.title} className="columnCategory">
              <h3>{category.title}</h3>
              <div className="columnOptions">
                {category.columns.map((col) => (
                  <div key={col} className="checkboxContainer">
                    <input 
                      type="checkbox" 
                      id={col} 
                      checked={columns[col]} 
                      onChange={handleColumnChange} 
                    />
                    <label htmlFor={col}>
                      {col.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        <div className="modalActions">
          <button className="cancelButton" onClick={onClose}>Cancel</button>
          <button 
            className="exportButton" 
            onClick={onExport}
            disabled={!Object.values(columns).some(value => value)}
          >
            <span>Export CSV</span>
          </button>
        </div>
      </>
    );
  };

  // Render generating view
  const renderGeneratingView = () => {
    return (
      <>
        <div className="csvModalHeader">
          <h2>Generating CSV</h2>
          <button onClick={onClose} className="closeButton">×</button>
        </div>
        <div className="exportProgress">
          <div className="progressIndicator">
            <div className="spinner"></div>
          </div>
          <p>Please wait while we generate your CSV file...</p>
          <p className="exportDetail">
            Processing {Object.keys(columns).filter(key => columns[key]).length} columns of data
          </p>
        </div>
      </>
    );
  };

  // Render completed view
  const renderCompletedView = () => {
    return (
      <>
        <div className="csvModalHeader">
          <h2>Export Complete</h2>
          <button onClick={onClose} className="closeButton">×</button>
        </div>
        <div className="exportComplete">
          <div className="successIcon">✓</div>
          <p>Your CSV file has been successfully generated!</p>
          <p className="exportDetail">
            Included {Object.keys(columns).filter(key => columns[key]).length} columns of data
          </p>
        </div>
        <div className="modalActions">
          <button className="cancelButton" onClick={onClose}>Close</button>
        </div>
      </>
    );
  };

  // Determine which view to render based on export status
  const renderModalContent = () => {
    switch (exportStatus) {
      case 'generating':
        return renderGeneratingView();
      case 'completed':
        return renderCompletedView();
      default:
        return renderConfigView();
    }
  };

  return (
    <div className="csvConfigModal">
      <div className="csvOverlay">
        <div className="csvModal">
          {renderModalContent()}
        </div>
      </div>
    </div>
  );
};

export default CsvConfigModal;