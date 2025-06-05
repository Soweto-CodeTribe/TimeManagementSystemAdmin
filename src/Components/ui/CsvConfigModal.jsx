/* eslint-disable react/prop-types */
import { useEffect, useRef } from 'react';

const CsvConfigModal = ({ 
  columns: columnsProp, 
  setColumns, 
  onClose, 
  onExport, 
  exportStatus 
}) => {
  const selectAllRef = useRef(null);

  // Check if all columns are selected
  const areAllColumnsSelected = () => Object.values(columnsProp).every(Boolean);

  // Indeterminate state for select all
  useEffect(() => {
    if (selectAllRef.current) {
      const values = Object.values(columnsProp);
      selectAllRef.current.indeterminate = values.some(Boolean) && !values.every(Boolean);
    }
  }, [columnsProp]);

  // Handle select all
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const updated = {};
    Object.keys(columnsProp).forEach(key => {
      updated[key] = isChecked;
    });
    setColumns(updated);
  };

  // Handle individual column change
  const handleColumnChange = (e) => {
    const { id, checked } = e.target;
    setColumns({ ...columnsProp, [id]: checked });
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
              ref={selectAllRef}
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
                      checked={!!columnsProp[col]} 
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
            disabled={!Object.values(columnsProp).some(Boolean)}
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
            Processing {Object.keys(columnsProp).filter(key => columnsProp[key]).length} columns of data
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
            Included {Object.keys(columnsProp).filter(key => columnsProp[key]).length} columns of data
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