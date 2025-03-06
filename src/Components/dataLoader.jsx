// dataLoader.jsx
import './styling/dataLoader.css'
const DataLoader = () => {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading attendance data...</p>
      </div>
    );
  };
  
  export default DataLoader;