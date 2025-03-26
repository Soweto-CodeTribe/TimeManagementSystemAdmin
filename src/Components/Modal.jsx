/* eslint-disable react/prop-types */
import { AiOutlineClose } from 'react-icons/ai'; // Close icon
import React, { useState } from 'react';
import { BiExport } from 'react-icons/bi'; // Export icon
import { MdDelete, MdVisibility } from 'react-icons/md'; // View and delete icons
import './styling/Modal.css'; // Import the CSS file
import axios from 'axios'

const Modal = ({ 
    isOpen, 
    onClose, 
    user 
}) => {
    const [checkInTime, setCheckInTime] = useState('');
    const [checkOutTime, setCheckOutTime] = useState('');
    const [lunchStartTime, setLunchStartTime] = useState('');
    const [lunchEndTime, setLunchEndTime] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const token = localStorage.getItem('authToken');

    const handleCheckIn = async () => {
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            console.log('Check-in Payload:', {
                traineeId: user.id,
                name: user.fullName,
                checkInTime: checkInTime,
                location: 'Manual',
                date: date
            });

            const response = await axios.post(
                'https://timemanagementsystemserver.onrender.com/api/session/check-in',
                {
                    traineeId: user.id,
                    name: user.fullName,
                    checkInTime: checkInTime,
                    location: 'Manual',
                    date: date
                },
                { 
                    headers: { 
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    } 
                }
            );

            console.log('Check-in Response:', response.data);
            setSuccessMessage(response.data.message || 'Check-in successful');
            setLoading(false);
        } catch (error) {
            console.error('Check-in Error:', {
                errorResponse: error.response,
                errorMessage: error.message,
                errorConfig: error.config
            });

            const errorMsg = error.response?.data?.error || 
                             error.response?.message || 
                             error.message || 
                             'Check-in failed';
            
            setErrorMessage(errorMsg);
            setLoading(false);
        }
    };

    const handleLunchStart = async () => {
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await axios.post(
                'https://timemanagementsystemserver.onrender.com/api/session/lunch-start',
                {
                    traineeId: user.id,
                    lunchStartTime: lunchStartTime,
                    date: date
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccessMessage('Lunch start recorded');
            setLoading(false);
        } catch (error) {
            setErrorMessage(error.response?.data?.error || 'Lunch start failed');
            setLoading(false);
        }
    };

    const handleLunchEnd = async () => {
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await axios.post(
                'https://timemanagementsystemserver.onrender.com/api/session/lunch-end',
                {
                    traineeId: user.id,
                    lunchEndTime: lunchEndTime,
                    date: date
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccessMessage('Lunch end recorded');
            setLoading(false);
        } catch (error) {
            setErrorMessage(error.response?.data?.error || 'Lunch end failed');
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        setLoading(true);
        setErrorMessage('');
        setSuccessMessage('');

        try {
            const response = await axios.post(
                'https://timemanagementsystemserver.onrender.com/api/session/check-out',
                {
                    traineeId: user.id,
                    checkOutTime: checkOutTime,
                    date: date
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setSuccessMessage('Check-out successful');
            setLoading(false);
        } catch (error) {
            setErrorMessage(error.response?.data?.error || 'Check-out failed');
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modalContent" onClick={(e) => e.stopPropagation()}>
                <button className="close-button" onClick={onClose}>
                    <AiOutlineClose />
                </button>
                <h2>Manual Attendance for {user.fullName}</h2>
                
                {/* Date Selection */}
                <div className="form-group">
                    <label>Date</label>
                    <input 
                        type="date" 
                        value={date} 
                        onChange={(e) => setDate(e.target.value)}
                        className="date-input"
                    />
                </div>

                {/* Check-In Section */}
                <div className="form-group">
                    <label>Check-In Time</label>
                    <div className="input-group">
                        <input 
                            type="time" 
                            value={checkInTime}
                            onChange={(e) => setCheckInTime(e.target.value)}
                        />
                        <button 
                            onClick={handleCheckIn} 
                            disabled={loading}
                            className="actions-button"
                        >
                            Check In
                        </button>
                    </div>
                </div>

                {/* Lunch Start Section */}
                <div className="form-group">
                    <label>Lunch Start Time</label>
                    <div className="input-group">
                        <input 
                            type="time" 
                            value={lunchStartTime}
                            onChange={(e) => setLunchStartTime(e.target.value)}
                        />
                        <button 
                            onClick={handleLunchStart} 
                            disabled={loading}
                            className="actions-button"
                        >
                            Start Lunch
                        </button>
                    </div>
                </div>

                {/* Lunch End Section */}
                <div className="form-group">
                    <label>Lunch End Time</label>
                    <div className="input-group">
                        <input 
                            type="time" 
                            value={lunchEndTime}
                            onChange={(e) => setLunchEndTime(e.target.value)}
                        />
                        <button 
                            onClick={handleLunchEnd} 
                            disabled={loading}
                            className="actions-button"
                        >
                            End Lunch
                        </button>
                    </div>
                </div>

                {/* Check-Out Section */}
                <div className="form-group">
                    <label>Check-Out Time</label>
                    <div className="input-group">
                        <input 
                            type="time" 
                            value={checkOutTime}
                            onChange={(e) => setCheckOutTime(e.target.value)}
                        />
                        <button 
                            onClick={handleCheckOut} 
                            disabled={loading}
                            className="actions-button"
                        >
                            Check Out
                        </button>
                    </div>
                </div>

                {/* Feedback Messages */}
                {errorMessage && (
                    <div className="error-message">{errorMessage}</div>
                )}
                {successMessage && (
                    <div className="success-message">{successMessage}</div>
                )}
            </div>
        </div>
    );
};

export default Modal;