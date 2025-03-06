import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styling/AddUserForm.css'; // Import the CSS

const AddUserForm = () => {
    const navigate = useNavigate();
    const [currentScreen, setCurrentScreen] = useState('basic-info');

    // State for basic info
    const [fullName, setFullName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [idNumber, setIdNumber] = useState(''); // State for ID Number
    const [location, setLocation] = useState(''); // State for Location
    const [role, setRole] = useState(''); // State for user role

    // State for address
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState(''); // State for feedback message

    const handleContinue = () => {
        if (currentScreen === 'basic-info') {
            setCurrentScreen('physical-address');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Prepare the user data to send
        const userData = { 
            fullName, 
            surname, 
            email, 
            phoneNumber, 
            idNumber, 
            street, 
            city, 
            postalCode,
            location 
        };

        console.log("User Data:", userData); // Log the user data being sent

        const token = localStorage.getItem("authToken");
        console.log("Authorization Token:", token); // Log the token for debugging

        // Check if the token is present
        if (!token) {
            setFeedbackMessage("No authorization token found. Please log in again.");
            return;
        }

        try {
            // Determine the correct endpoint based on the role
            let endpoint = '';
            switch (role) {
                case 'Trainee':
                    endpoint = '/api/trainees';
                    break;
                case 'Facilitator':
                    endpoint = '/api/facilitators';
                    break;
                case 'Stakeholder':
                    endpoint = '/api/stakeholder';
                    break;
                default:
                    setFeedbackMessage("Please select a role.");
                    return; // Stop execution if the role is not selected
            }

            // Send the user data to the selected endpoint
            const response = await axios.post(`https://timemanagementsystemserver.onrender.com${endpoint}`, userData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Handle the response from the server
            if (response.status === 201 || response.status === 200) {
                setFeedbackMessage("User saved successfully!"); // Show success message
                navigate('/user-management', { state: { userData } }); // Navigate to UserManagement
            }
        } catch (error) {
            console.error('Error saving user:', error);

            // Enhanced error logging
            if (error.response) {
                console.error('Response data:', error.response.data);
                const errorMessage = error.response.data.error || error.response.data || "An unknown error occurred.";
                setFeedbackMessage("Failed to save user: " + errorMessage); // Show specific error message
            } else {
                setFeedbackMessage("Failed to save user: " + error.message); // Show network or other errors
            }
        }
    };

    // Render physical address screen
    if (currentScreen === 'physical-address') {
        return (
            <div className="add-user-form-container">
                <h1>Add New User</h1>
                <p>Easily register trainees, guests, or facilitators with the required details.</p>

                <div className="navigation">
                    <span className="nav-item">Basic Information</span>
                    {' > '}
                    <span className="nav-item active">Physical Address</span>
                    {' > '}
                    <span className="nav-item">Additional Info</span>
                </div>

                <h2>Physical Address <span className="info-icon">ⓘ</span></h2>

                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="street">Street</label>
                        <input 
                            type="text" 
                            id="street" 
                            placeholder="Enter Street"
                            value={street}
                            onChange={(e) => setStreet(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="city">City</label>
                        <input 
                            type="text" 
                            id="city" 
                            placeholder="Enter City"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="postalCode">Postal Code</label>
                        <input 
                            type="text" 
                            id="postalCode" 
                            placeholder="Enter postal code"
                            value={postalCode}
                            onChange={(e) => setPostalCode(e.target.value)}
                        />
                    </div>

                    <div className="form-group checkbox-group">
                        <input 
                            type="checkbox" 
                            id="confirm" 
                            checked={isConfirmed}
                            onChange={(e) => setIsConfirmed(e.target.checked)}
                        />
                        <label htmlFor="confirm">
                            I confirm that all the information provided is accurate and agree to the system's terms and conditions.
                        </label>
                    </div>

                    <button 
                        type="submit" 
                        className="submit-btn"
                        disabled={!isConfirmed}
                    >
                        Submit
                    </button>

                    {feedbackMessage && (
                        <p className={`feedback-message ${feedbackMessage.includes("Failed") ? 'error' : 'success'}`}>
                            {feedbackMessage}
                        </p>
                    )}
                </form>
            </div>
        );
    }

    // Render basic information screen
    return (
        <div className="add-user-form-container">
            <h1>Add New User</h1>
            <p>Easily register trainees, guests, or facilitators with the required details.</p>

            <div className="navigation">
                <span className="nav-item active">Basic Information</span>
                {' > '}
                <span className="nav-item">Physical Address</span>
                {' > '}
                <span className="nav-item">Additional Info</span>
            </div>

            <h2>Basic Information <span className="info-icon">ⓘ</span></h2>

            <form onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                    <label htmlFor="fullName">Full Name</label>
                    <input 
                        type="text" 
                        id="fullName" 
                        placeholder="Enter full name" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)} 
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="surname">Surname</label>
                    <input 
                        type="text" 
                        id="surname" 
                        placeholder="Enter surname" 
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email</label>
                    <input 
                        type="email" 
                        id="email" 
                        placeholder="Enter email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phoneNumber">Phone number</label>
                    <input 
                        type="tel" 
                        id="phoneNumber" 
                        placeholder="Enter phone number" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                    />
                </div>

                {/* New ID Number input field */}
                <div className="form-group">
                    <label htmlFor="idNumber">ID Number</label>
                    <input 
                        type="text" 
                        id="idNumber" 
                        placeholder="Enter ID Number" 
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                    />
                </div>

                {/* Conditional Location input field */}
                {(role === 'Trainee' || role === 'Facilitator') && (
                    <div className="form-group">
                        <label htmlFor="location">Location</label>
                        <input 
                            type="text" 
                            id="location" 
                            placeholder="Enter Location" 
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                        />
                    </div>
                )}

                <div className="form-group">
                    <label htmlFor="role">Role</label>
                    <select 
                        id="role" 
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value="" disabled>Select role</option>
                        <option value="Trainee">Trainee</option>
                        <option value="Facilitator">Facilitator</option>
                        <option value="Stakeholder">Stakeholder</option>
                    </select>
                </div>

                <button type="button" onClick={handleContinue}>Continue</button>
            </form>

            {feedbackMessage && (
                <p className={`feedback-message ${feedbackMessage.includes("Failed") ? 'error' : 'success'}`}>
                    {feedbackMessage}
                </p>
            )}
        </div>
    );
};

export default AddUserForm;