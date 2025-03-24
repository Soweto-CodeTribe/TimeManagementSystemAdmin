/* eslint-disable react/prop-types */
import { useState } from 'react'

const CsvConfigModal = ({ onClose }) => {
  // Add a state to track the current modal view
  const [exportStatus, setExportStatus] = useState('configuring'); // 'configuring', 'generating', 'completed'
      
  const [columns, setColumns] = useState({
    // Core Trainee Information
    fullName: false,
    surname: false,
    codeTribeId: false,
    idNumber: false,
    cohortYear: false,
    
    // Contact & Profile Information
    emailAddress: false,
    phoneNumber: false,
    linkedinProfileUrl: false,
    
    // Employment & Career Data
    currentEmployer: false,
    jobTitle: false,
    startDate: false,
    
    // Attendance & Activity Tracking
    lastCheckInDate: false,
    missedCheckIns: false
  });

  // Function to check if all columns are selected
  const areAllColumnsSelected = () => {
    return Object.values(columns).every(value => value === true);
  };

  // Handle select all functionality
  const handleSelectAll = (e) => {
    const isChecked = e.target.checked;
    const updatedColumns = {};
    
    // Set all columns to the same checked state
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

  // Handle export button click
  const handleExport = () => {
    setExportStatus('generating');
    // Simulate export process
    setTimeout(() => {
      setExportStatus('completed');
    }, 2000);
  };

  // Render configuration view
  const renderConfigView = () => {
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
          <div className="columnCategory">
            <h3>Core Trainee Information</h3>
            <div className="columnOptions">
              <div className="checkboxContainer">
                <input type="checkbox" id="fullName" checked={columns.fullName} onChange={handleColumnChange} />
                <label htmlFor="fullName">Full Name</label>
              </div>
              <div className="checkboxContainer">
                <input type="checkbox" id="surname" checked={columns.surname} onChange={handleColumnChange} />
                <label htmlFor="surname">Surname</label>
              </div>
              <div className="checkboxContainer">
                <input type="checkbox" id="codeTribeId" checked={columns.codeTribeId} onChange={handleColumnChange} />
                <label htmlFor="codeTribeId">CodeTribe ID</label>
              </div>
              <div className="checkboxContainer">
                <input type="checkbox" id="idNumber" checked={columns.idNumber} onChange={handleColumnChange} />
                <label htmlFor="idNumber">ID Number</label>
              </div>
              <div className="checkboxContainer">
                <input type="checkbox" id="cohortYear" checked={columns.cohortYear} onChange={handleColumnChange} />
                <label htmlFor="cohortYear">Cohort Year</label>
              </div>
            </div>
          </div>
          
          <div className="columnCategory">
            <h3>Contact & Profile Information</h3>
            <div className="columnOptions">
              <div className="checkboxContainer">
                <input type="checkbox" id="emailAddress" checked={columns.emailAddress} onChange={handleColumnChange} />
                <label htmlFor="emailAddress">Email Address</label>
              </div>
              <div className="checkboxContainer">
                <input type="checkbox" id="phoneNumber" checked={columns.phoneNumber} onChange={handleColumnChange} />
                <label htmlFor="phoneNumber">Phone Number</label>
              </div>
              <div className="checkboxContainer">
                <select>
                    <option>Soweto</option>
                    <option>Ga Rankuwa</option>
                    <option>Kimberly</option>
                    <option>Limpopo</option>
                    <option>Imbali</option>
                </select>
                <p> </p>
              
                <label htmlFor="linkedinProfileUrl">{' Location'}</label>
              </div>
            </div>
          </div>
          
          {/* <div className="columnCategory">
            <h3>Employment & Career Data</h3>
            <div className="columnOptions">
              <div className="checkboxContainer">
                <input type="checkbox" id="currentEmployer" checked={columns.currentEmployer} onChange={handleColumnChange} />
                <label htmlFor="currentEmployer">Current Employer</label>
              </div>
              <div className="checkboxContainer">
                <input type="checkbox" id="jobTitle" checked={columns.jobTitle} onChange={handleColumnChange} />
                <label htmlFor="jobTitle">Job Title</label>
              </div>
              <div className="checkboxContainer">
                <input type="checkbox" id="startDate" checked={columns.startDate} onChange={handleColumnChange} />
                <label htmlFor="startDate">Start Date</label>
              </div>
            </div>
          </div> */}
          
          {/* <div className="columnCategory">
            <h3>Attendance & Activity Tracking</h3>
            <div className="columnOptions">
              <div className="checkboxContainer">
                <input type="checkbox" id="lastCheckInDate" checked={columns.lastCheckInDate} onChange={handleColumnChange} />
                <label htmlFor="lastCheckInDate">Last Check-in Date</label>
              </div>
              <div className="checkboxContainer">
                <input type="checkbox" id="missedCheckIns" checked={columns.missedCheckIns} onChange={handleColumnChange} />
                <label htmlFor="missedCheckIns">Missed Check-ins</label>
              </div>
            </div>
          </div> */}
        </div>
        
        <div className="modalActions">
          <button className="cancelButton" onClick={onClose}>Cancel</button>
          <button className="exportButton" onClick={handleExport}>
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
          <p className="exportDetail">Processing {Object.keys(columns).filter(key => columns[key]).length} columns of data</p>
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
          <p className="exportDetail">Included {Object.keys(columns).filter(key => columns[key]).length} columns of data</p>
        </div>
        <div className="modalActions">
          <button className="cancelButton" onClick={onClose}>Close</button>
          <button className="downloadButton">
            <span>Download CSV</span>
          </button>
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