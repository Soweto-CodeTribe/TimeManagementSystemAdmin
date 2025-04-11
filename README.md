# Time Management System Admin

A modern web-based application designed for administrators to efficiently manage trainee attendance tracking and program management. This system replaces traditional paper timesheets with a fully automated digital solution, improving efficiency, accuracy, and transparency.

---

## Table of Contents
1. [Overview](#overview)
2. [Repository Structure](#repository-structure)
3. [Technology Stack](#technology-stack)
4. [Installation](#installation)
5. [Configuration](#configuration)
6. [Key Features](#key-features)
7. [Usage Guide](#usage-guide)
8. [Branch Management](#branch-management)
9. [API Documentation](#api-documentation)
10. [Troubleshooting](#troubleshooting)
11. [Contributing](#contributing)
12. [Team](#team)
13. [License](#license)

---

## Overview

The **Time Management System Admin** is a comprehensive solution built by a collaborative team of 4 frontend developers, 4 backend developers, and 2 UX/UI designers. It provides tools for user management, attendance tracking, reporting, and event management, all within a single platform.

Repository: [https://github.com/Soweto-CodeTribe/TimeManagementSystemAdmin](https://github.com/Soweto-CodeTribe/TimeManagementSystemAdmin)

---

## Repository Structure

This repository contains **6 branches**, each serving a specific purpose in the development lifecycle:

| Branch Name     | Purpose                                                 |
|-----------------|--------------------------------------------------------|
| `main`          | Main production branch with stable release code         |
| `DevBranch`     | Integration branch for development and testing          |
| `Xoli`          | Developer-specific branch for Xoli's tasks              |
| `Eunice`        | Developer-specific branch for Eunice's tasks            |
| `Prince`        | Developer-specific branch for Prince's tasks            |
| `Nhlakanipho`   | Developer-specific branch for Nhlakanipho's tasks       |

---

## Technology Stack

### Frontend
- **Framework**: React 19.0.0
- **Build Tool**: Vite 6.1.0
- **State Management**: Redux Toolkit
- **UI Libraries**: Material UI (v6.4.6), Framer Motion, Recharts
- **Authentication**: Firebase Authentication
- **API Handling**: Axios
- **PDF Generation**: jsPDF
- **CSV Parsing**: PapaParse
- **Notifications**: React-Toastify
- **Real-time Communication**: Socket.io

### Backend
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **API Framework**: Node.js with Express
- **Real-time Updates**: Socket.io

---

## Installation

### Prerequisites
- Node.js v18.x or higher
- npm v9.x or Yarn v1.22+
- Git installed on your system
- Firebase account for authentication
- Code editor (VS Code recommended)

### Setup Instructions

1. **Clone Repository**
   ```bash
   git clone https://github.com/Soweto-CodeTribe/TimeManagementSystemAdmin.git
   cd TimeManagementSystemAdmin
   ```

2. **Select Branch**
   
   By default, you'll be on the `main` branch (production code). To switch to a development branch:
   
   ```bash
   # To use the integration branch with all features
   git checkout DevBranch
   
   # Or to work on a specific developer branch
   git checkout Xoli
   git checkout Eunice
   git checkout Prince
   git checkout Nhlakanipho
   ```

3. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

4. **Environment Configuration**
   
   Create a `.env` file in the project root and add your Firebase credentials:
   ```env
   # Firebase Configuration
   VITE_API_KEY=your_firebase_api_key
   VITE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_PROJECT_ID=your_firebase_project_id
   VITE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_APP_ID=your_firebase_app_id

   # Backend API
   VITE_API_URL=your_backend_api_url
   ```
   
   > **Note:** You'll need to replace the placeholder values with your actual Firebase credentials from your Firebase project settings.

5. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   
   This will start the development server on `http://localhost:5173`. Open this URL in your browser to access the application.

6. **Build for Production**
   ```bash
   npm run build
   # or
   yarn build
   ```
   
   This creates optimized production files in the `dist` directory for deployment.

---

## Configuration

### Firebase Setup for Non-Technical Users
1. Create a Firebase account at [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" and follow the setup wizard
3. Once your project is created:
   - Click "Authentication" in the left sidebar and enable Email/Password sign-in
   - Click "Firestore Database" in the sidebar and create a database
   - Click the web icon (</>) on the project overview page to register your app
   - Copy the configuration values provided and paste them into your `.env` file

### Firebase Setup for Technical Users
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable **Email/Password Authentication**:
   - Navigate to Authentication > Sign-in methods
   - Enable Email/Password provider
3. Set up a **Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Start in production mode
4. Configure security rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /{document=**} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```
5. Add a web app to your Firebase project and copy the configuration values into your `.env` file

### System Settings
Accessible through the `/settings` route after login:
- **Business Hours**: Define workday start/end times
- **Attendance Radius**: Set geofencing parameters (meters)
- **Session Timeout**: Configure inactivity limits (15/30/60 minutes)
- **Program Dates**: Set valid training periods

---

## Key Features

### User Management
- Add, edit, and delete users (trainees, facilitators, admins, guests)
- Bulk import/export user data via CSV or PDF
- Role-based access control

### Attendance Tracking
- Real-time session monitoring
- Manual override for attendance records
- Daily logs and attendance analytics

### Reporting System
- Generate attendance and performance reports
- Export reports in PDF or CSV formats

### Event Management
- Schedule and manage special events
- Send notifications to trainees about upcoming events

---

## Usage Guide

### For Non-Technical Users

#### Getting Started
1. Access the application using the provided URL
2. Log in with your email and password
3. Complete the two-factor authentication (check your email for the code)
4. You'll be directed to the dashboard showing system overview

#### Common Tasks
- **Adding a User**: Click "Users" in the sidebar → "Add New User" → Fill in the form → Submit
- **Viewing Attendance**: Click "Attendance" in the sidebar → Select date range → View report
- **Exporting Reports**: Click "Reports" in the sidebar → Select report type → Click "Export" (PDF or CSV)
- **Managing Events**: Click "Events" in the sidebar → "Add Event" or select existing event to modify

### For Technical Users

#### Authentication Flow
1. **Login**:
   - Email/Password authentication
   - Two-Factor Authentication (2FA) via email OTP
2. **Password Recovery**:
   - OTP validation required
   - Temporary password expiration (24 hours)

#### Dashboard Navigation
- Quick stats display total active users, real-time attendance, and system health
- Shortcut actions for user search, report generation, and event creation

#### User Management
1. **Add User**:
   - Navigate to `/users/create`
   - Required fields: Name, Email, Role
2. **Bulk Import**:
   - Use the provided CSV template (`/templates/users.csv`)
   - System validates for duplicates and missing fields

---

## Branch Management

### For Non-Technical Users
- The `main` branch contains the stable, production-ready version
- The `DevBranch` contains features being tested before release
- Developer branches contain work-in-progress features

### For Technical Users
1. Always create a new branch from `DevBranch` for new features:
   ```bash
   git checkout DevBranch
   git pull origin DevBranch
   git checkout -b your-branch-name
   ```
2. Push your changes to the remote branch:
   ```bash
   git push origin your-branch-name
   ```
3. Create a Pull Request targeting the `DevBranch` branch

### Merging to `main`
- Only merge stable, tested code into `main`
- All PRs to `main` require approval from at least one team lead

---

## Screenshots

Here are key screens from the application:

![Dashboard Overview](https://github.com/user-attachments/assets/5ce16cfe-2050-410f-97b8-36cdb352fe3c)
![User Management](https://github.com/user-attachments/assets/d3bb326b-05be-4903-aedf-6b2e780cad72)
![Attendance Tracking](https://github.com/user-attachments/assets/824fb5bc-e958-4ac7-b439-c0dbb13e7ea4)
![Reporting Interface](https://github.com/user-attachments/assets/a908ed5f-f96d-49af-9a36-29c1fefe02e6)
![Settings Panel](https://github.com/user-attachments/assets/49b0557b-d29b-4123-b0d0-8380fb464303)
![Mobile View](https://github.com/user-attachments/assets/2ebcc9a7-dde6-4fa9-b36a-b7f8e98df6b2)

---

## API Documentation

### Main Endpoints

| Category       | Endpoint                | Description                         |
|----------------|-------------------------|-------------------------------------|
| Authentication | `/api/auth/login`       | Log in with credentials             |
|                | `/api/auth/verify-otp`  | Verify two-factor code              |
|                | `/api/auth/logout`      | End user session                    |
| Users          | `/api/users`            | Get/create users                    |
|                | `/api/users/:id`        | Update/delete specific user         |
| Attendance     | `/api/attendance`       | Get/create attendance records       |
|                | `/api/attendance/:id`   | Update specific attendance record   |
| Settings       | `/api/settings`         | Get/update system settings          |

---

## Troubleshooting

### For Non-Technical Users

#### Common Issues
1. **Can't Log In**
   - Check that you're using the correct email and password
   - Look in your spam folder for the verification code
   - Contact an administrator if your account might be suspended

2. **Can't Export Reports**
   - Check that you have selected a valid date range
   - Try exporting a smaller date range if dealing with large datasets
   - Make sure you have sufficient permissions

3. **System Runs Slowly**
   - Try refreshing the page
   - Clear your browser cache
   - Use Chrome or Firefox for best performance

### For Technical Users

#### Installation Issues
- Clear npm cache: `npm cache clean --force`
- Check Node.js version: `node -v` (should be v18.x or higher)
- For dependency issues: `npm install --legacy-peer-deps`

#### Firebase Connection Problems
- Verify `.env` variables are correctly formatted
- Check Firebase console for service disruptions
- Ensure your IP is not blocked in Firebase security rules

#### Build Failures
- Check for JavaScript syntax errors
- Verify import/export statements
- Look for missing dependencies in `package.json`

#### Error Codes
| Code | Meaning            | Action                          |
|------|--------------------|----------------------------------|
| 401  | Unauthorized       | Re-authenticate                 |
| 403  | Forbidden          | Check user permissions          |
| 500  | Server Error       | Contact support team            |
| E001 | Database Connection| Verify Firebase credentials     |
| E002 | Invalid Input      | Check form validation           |
| E003 | Rate Limited       | Wait and retry later            |

---

## Contributing

### For Non-Technical Contributors
- Report bugs through the issue tracker
- Suggest features and improvements via email
- Participate in user testing when requested

### For Technical Contributors
1. Fork the repository
2. Create a feature branch from `DevBranch`
3. Commit changes using descriptive messages
4. Push to your branch
5. Open a Pull Request targeting the `DevBranch`

### Code Review Process
1. All PRs require at least one review
2. Code must pass all automated tests
3. Documentation must be updated for new features

### Coding Standards
- Follow [Airbnb JavaScript Style Guide](https://airbnb.io/javascript/react/)
- Write unit tests for all components
- Maintain minimum 80% test coverage
- Run linter before committing: `npm run lint`

---

## Team

### Frontend Developers
- [Xoli Nxiweni](https://github.com/Xoli-Nxiweni)
- [Prince Mashumu](https://github.com/Princemashumu)
- [Eunice](https://github.com/eungobs)
- [Alson Africa](https://github.com/AlsonAfrica)

### Backend Developers
- [Siphelele Zulu](https://github.com/sphllzulu)
- [Comfort](https://github.com/ComfortN)
- [Mandlakhe](https://github.com/MandlakheM)
- [Edward](https://github.com/EdwardCodeTriber)

### UX/UI Designers
- Wireframing and Component Design Team (2 members)

---

## License

Copyright © 2025 Codetribe. All rights reserved.

This project is proprietary software. Unauthorized copying, modification, or distribution is prohibited.
