import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './styling/AddUserForm.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import CustomDropdown from './ui/CustomDropdown';

const AddUserForm = () => {
    const navigate = useNavigate();
    const [currentScreen, setCurrentScreen] = useState('basic-info');

    // State for basic info
    const [fullName, setFullName] = useState('');
    const [surname, setSurname] = useState('');
    const [email, setEmail] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [idNumber, setIdNumber] = useState('');
    const [location, setLocation] = useState('');
    const [role, setRole] = useState('');
    const userRole = localStorage.getItem('role');

    // State for address
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [isConfirmed, setIsConfirmed] = useState(false);

    // Locations array
    const locations = [
        'Soweto', 
        'Ga-rankuwa', 
        'KZN', 
        'Limpopo', 
        'Tembisa', 
        'TIH', 
        'Kimberly'
    ];

    // Toast configuration
    const notifySuccess = (message) => {
        toast.success(message, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            closeButton: false
        });
    };

    const notifyError = (message) => {
        toast.error(message, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            closeButton: false,
            style: { boxShadow: 'none' }, // Removes shadow overlay
            // You can also add this if needed:
            // className: 'no-overlay' // Add a custom class to further style it via CSS
        });
    };

    const handleContinue = () => {
        // Validate basic information fields
        if (!fullName || !surname || !email || !phoneNumber || !idNumber || !role) {
            notifyError("Please fill in all required fields");
            return;
        }

        // Email validation
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(email)) {
            notifyError("Please enter a valid email address");
            return;
        }

        // Phone number validation (basic)
        const phonePattern = /^\d{10}$/;
        if (!phonePattern.test(phoneNumber.replace(/\D/g, ''))) {
            notifyError("Please enter a valid 10-digit phone number");
            return;
        }

        // Additional validation for location when required
        if ((role === 'Trainee' || role === 'Facilitator') && !location) {
            notifyError("Please select a location");
            return;
        }

        // If all validations pass, proceed to next screen
        setCurrentScreen('physical-address');
        notifySuccess("Basic information saved");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate physical address fields
        if (!street || !city || !postalCode) {
            notifyError("Please fill in all address fields");
            return;
        }

        // Validate confirmation checkbox
        if (!isConfirmed) {
            notifyError("Please confirm the information is accurate");
            return;
        }

        const token = localStorage.getItem('authToken');

        // Check if token exists
        if (!token) {
            notifyError("No authorization token found. Please log in again.");
            return;
        }

        // Prepare user data
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

        console.log("User Data:", userData);
        console.log("Authorization Token:", token);

        try {
            // Determine endpoint based on role
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
                case 'SuperAdmin':
                    endpoint = '/api/super-admin/create';
                    break;
                default:
                    notifyError("Please select a valid role");
                    return;
            }

            // API request
            const response = await axios.post(
                `https://timemanagementsystemserver.onrender.com${endpoint}`, 
                userData, 
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Handle successful response
            if (response.status === 201 || response.status === 200) {
                notifySuccess("User saved successfully!");
                
                // Delay navigation to allow toast to be seen
                setTimeout(() => {
                    navigate('/user-management', { state: { userData } });
                }, 1500);
            }
        } catch (error) {
            console.error('Error saving user:', error);
            
            // Enhanced error handling
            if (error.response) {
                console.error('Response data:', error.response.data);
                const errorMessage = error.response.data.error || error.response.data.message || "An unknown error occurred";
                notifyError(`Failed to save user: ${errorMessage}`);
            } else if (error.request) {
                notifyError("Network error. Please check your connection and try again.");
            } else {
                notifyError(`Error: ${error.message}`);
            }
        }
    };

    // Render physical address screen
    if (currentScreen === 'physical-address') {
        return (
            <div className="add-user-form-container">
                <ToastContainer />
                <h1>Add New User</h1>
                <p>Easily register trainees, guests, or facilitators with the required details.</p>

                {/* <div className="navigation">
                    <span className="nav-item">Basic Information</span>
                    <span className="nav-item active">Physical Address</span>
                    <span className="nav-item">Additional Info</span>
                </div> */}

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
                            required
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
                            required
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
                            required
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
                            {`I confirm that all the information provided is accurate and agree to the system's terms and conditions.`}
                        </label>
                    </div>

                    <div className="form-buttons">
                        <button 
                            type="button" 
                            className="back-btn"
                            onClick={() => setCurrentScreen('basic-info')}
                        >
                            Back
                        </button>
                        <button 
                            type="submit" 
                            className="submit-btn"
                            disabled={!isConfirmed}
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        );
    }

    // Render basic information screen
    return (
        <div className="add-user-form-container">
            <ToastContainer />
            <h1>Add New User</h1>
            <p>Easily register trainees, guests, or facilitators with the required details.</p>

            {/* <div className="navigation">
                <span className="nav-item active">Basic Information</span>
                <span className="nav-item">Physical Address</span>
                <span className="nav-item">Additional Info</span>
            </div> */}

            <h2>Basic Information <span className="info-icon">ⓘ</span></h2>

            <form onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                    <label htmlFor="fullName">Full Name <span className="required">*</span></label>
                    <input 
                        type="text" 
                        id="fullName" 
                        placeholder="Enter full name" 
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="surname">Surname <span className="required">*</span></label>
                    <input 
                        type="text" 
                        id="surname" 
                        placeholder="Enter surname" 
                        value={surname}
                        onChange={(e) => setSurname(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="email">Email <span className="required">*</span></label>
                    <input 
                        type="email" 
                        id="email" 
                        placeholder="Enter email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="phoneNumber">Phone number <span className="required">*</span></label>
                    <input 
                        type="tel" 
                        id="phoneNumber" 
                        placeholder="Enter phone number" 
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="idNumber">ID Number <span className="required">*</span></label>
                    <input 
                        type="text" 
                        id="idNumber" 
                        placeholder="Enter ID Number" 
                        value={idNumber}
                        onChange={(e) => setIdNumber(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="role">Role <span className="required">*</span></label>
                    <CustomDropdown
                        options={[
                            ...(userRole === 'super_admin' ? [
                                { value: 'SuperAdmin', label: 'Super Admin' },
                                { value: 'Stakeholder', label: 'Stakeholder' },
                                { value: 'Facilitator', label: 'Facilitator' },
                            ] : []),
                            { value: 'Trainee', label: 'Trainee' },
                        ]}
                        value={role}
                        onChange={setRole}
                        placeholder="Select role"
                    />
                </div>

                {(role === 'Trainee' || role === 'Facilitator') && (
                    <div className="form-group">
                        <label htmlFor="location">Location <span className="required">*</span></label>
                        <CustomDropdown
                            options={[
                                { value: '', label: 'Select Location', disabled: true },
                                ...locations.map(loc => ({ value: loc, label: loc }))
                            ]}
                            value={location}
                            onChange={setLocation}
                            placeholder="Select Location"
                        />
                    </div>
                )}

                <button type="button" className="continue-btn" onClick={handleContinue}>Continue</button>
            </form>
        </div>
    );
};

export default AddUserForm;