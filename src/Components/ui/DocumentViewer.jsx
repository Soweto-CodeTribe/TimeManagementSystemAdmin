/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { FaFilePdf, FaFileWord, FaFileExcel, FaFileImage, FaFile, FaEye } from "react-icons/fa";

// Document Viewer Component to handle different file types
const DocumentViewer = ({ documentUrl, fileName }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [fileType, setFileType] = useState(null);
  const token = useSelector((state) => state.auth.token);
  
  useEffect(() => {
    if (!documentUrl) return;
    
    // Determine file type from URL or extension
    const determineFileType = () => {
      const url = documentUrl.toLowerCase();
      if (url.endsWith('.pdf')) return 'pdf';
      if (url.endsWith('.doc') || url.endsWith('.docx')) return 'word';
      if (url.endsWith('.xls') || url.endsWith('.xlsx')) return 'excel';
      if (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png') || url.endsWith('.gif')) return 'image';
      return 'other';
    };
    
    setFileType(determineFileType());
  }, [documentUrl]);

  const getFileIcon = () => {
    switch (fileType) {
      case 'pdf':
        return <FaFilePdf className="document-icon pdf" size={24} />;
      case 'word':
        return <FaFileWord className="document-icon docx" size={24} />;
      case 'excel':
        return <FaFileExcel className="document-icon xlsx" size={24} />;
      case 'image':
        return <FaFileImage className="document-icon image" size={24} />;
      default:
        return <FaFile className="document-icon other" size={24} />;
    }
  };

  const viewFile = () => {
    if (fileType === 'pdf') {
      // If it's a direct URL
      if (documentUrl.startsWith('http')) {
        return (
          <iframe 
            src={documentUrl} 
            width="100%" 
            height="500px" 
            title="PDF Document"
            className="document-iframe"
          />
        );
      } else {
        // If it's an asset ID that needs to be fetched
        const fileId = documentUrl.split('/').pop();
        return (
          <iframe 
            src={`https://codetribe-admin.mlab.co.za/assets/${fileId}`}
            width="100%" 
            height="500px" 
            title="PDF Document"
            className="document-iframe"
          />
        );
      }
    } else if (fileType === 'image') {
      // For images, render them directly
      if (documentUrl.startsWith('http')) {
        return <img src={documentUrl} alt="Document" className="document-image" />;
      } else {
        const fileId = documentUrl.split('/').pop();
        return <img src={`https://codetribe-admin.mlab.co.za/assets/${fileId}`} alt="Document" className="document-image" />;
      }
    } else {
      // For other file types, just show view option message
      return (
        <div className="document-view-prompt">
          <p>Click the View button above to open this document in a new tab.</p>
          {getFileIcon()}
        </div>
      );
    }
  };

  return (
    <div className="document-viewer">
      <div className="document-viewer-header">
        <div className="document-info">
          {getFileIcon()}
          <span className="document-name">{fileName || "Document"}</span>
        </div>
        <div className="document-actions">
          <a 
            href={documentUrl.startsWith('http') ? documentUrl : `https://codetribe-admin.mlab.co.za/assets/${documentUrl.split('/').pop()}`}
            target="_blank" 
            rel="noopener noreferrer" 
            className="view-button"
          >
            <FaEye /> View
          </a>
        </div>
      </div>
      
      {loading ? (
        <div className="loading-spinner">Loading document...</div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <div className="document-preview-container">
          {viewFile()}
        </div>
      )}
    </div>
  );
};

export default DocumentViewer;