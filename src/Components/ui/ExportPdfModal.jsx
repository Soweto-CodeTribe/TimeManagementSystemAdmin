import React, { useState, useEffect } from 'react';
import CustomDropdown from './CustomDropdown';
import './ExportPdfModal.css';

const FUN_QUOTES = [
  "Success is the sum of small efforts, repeated day in and day out!",
  "Every accomplishment starts with the decision to try.",
  "Great things never come from comfort zones!",
  "Progress, not perfection!",
  "You are capable of amazing things!",
  "Learning never exhausts the mind!",
  "The best way to get started is to quit talking and begin doing!"
];

const ExportPdfModal = ({
  isOpen,
  onClose,
  trainees = [],
  onExportOne,
  onExportAll,
  loading
}) => {
  const [mode, setMode] = useState('one'); // 'one' or 'all'
  const [selectedTrainee, setSelectedTrainee] = useState(null);
  const [funQuote, setFunQuote] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFunQuote(FUN_QUOTES[Math.floor(Math.random() * FUN_QUOTES.length)]);
      setMode('one');
      setSelectedTrainee(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="export-pdf-modal-overlay" onClick={onClose}>
      <div className="export-pdf-modal" onClick={e => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        <h2>Export PDF Report</h2>
        <div className="mode-toggle">
          <label>
            <input
              type="radio"
              checked={mode === 'one'}
              onChange={() => setMode('one')}
            />
            One Trainee
          </label>
          <label>
            <input
              type="radio"
              checked={mode === 'all'}
              onChange={() => setMode('all')}
            />
            Everyone
          </label>
        </div>
        {mode === 'one' && (
          <div className="trainee-select-section">
            <label>Select Trainee:</label>
            <CustomDropdown
              options={trainees.map(t => ({ label: t.fullName, value: t.id }))}
              value={selectedTrainee}
              onChange={setSelectedTrainee}
              placeholder="Choose a trainee"
            />
            <button
              className="export-btn"
              disabled={!selectedTrainee || loading}
              onClick={() => onExportOne(selectedTrainee)}
            >
              {loading ? 'Generating...' : 'Download PDF'}
            </button>
          </div>
        )}
        {mode === 'all' && (
          <div className="all-section">
            <p>This will generate a PDF report for all trainees currently in the report list.</p>
            <button
              className="export-btn"
              disabled={loading}
              onClick={onExportAll}
            >
              {loading ? 'Generating...' : 'Download All as PDF'}
            </button>
          </div>
        )}
        <div className="fun-quote">
          <span role="img" aria-label="party">🎉</span> {funQuote}
        </div>
      </div>
    </div>
  );
};

export default ExportPdfModal; 