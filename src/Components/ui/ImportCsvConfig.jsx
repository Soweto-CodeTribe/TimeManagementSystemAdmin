/* eslint-disable react/prop-types */
// ImportCsvModal.jsx
import { useState } from 'react';
import axios from 'axios';

const ImportCsvModal = ({ 
  isOpen, 
  onClose, 
  token, 
  fetchAllData, 
  setFeedbackMessage 
}) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedType, setSelectedType] = useState('trainees');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      setErrorMessage('Only CSV files are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage('File size exceeds 10MB limit');
      return;
    }

    setSelectedFile(file);
    setErrorMessage('');
  };

  const handleSubmit = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('file', selectedFile);
    
    // Append correct parameter based on selection
    if (selectedType === 'onlineTrainees') {
      formData.append('onlineTrainee', 'true');
    } else {
      formData.append('trainees', 'true');
    }

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const response = await axios.post(
        'https://timemanagementsystemserver.onrender.com/api/csv/csv-upload',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(percent);
          },
        }
      );

      if (response.status === 202) {
        setFeedbackMessage('Upload successful! Data will refresh shortly.');
        fetchAllData();
        onClose();
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message || 'Upload failed';
      setErrorMessage(errorMsg);
      setFeedbackMessage(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="import-modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Import CSV</h3>
        
        {errorMessage && <div className="error-message">{errorMessage}</div>}

        <div className="file-type-selector">
          <button 
            className={selectedType === 'trainees' ? 'active' : ''}
            onClick={() => setSelectedType('trainees')}
          >
            Regular Trainees
          </button>
          <button 
            className={selectedType === 'onlineTrainees' ? 'active' : ''}
            onClick={() => setSelectedType('onlineTrainees')}
          >
            Online Trainees
          </button>
        </div>

        <div className="file-input-container">
          <input
            type="file"
            id="csvInput"
            accept=".csv"
            onChange={handleFileChange}
          />
          <label htmlFor="csvInput" className="file-label">
            {selectedFile ? selectedFile.name : 'Choose CSV file'}
          </label>
        </div>

        {isUploading && (
          <div className="progress-container">
            <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
            <p>{uploadProgress}%</p>
          </div>
        )}

        <div className="button-group">
          <button onClick={onClose} disabled={isUploading}>
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            disabled={!selectedFile || isUploading}
            className="primary"
          >
            {isUploading ? 'Uploading...' : 'Import'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImportCsvModal;