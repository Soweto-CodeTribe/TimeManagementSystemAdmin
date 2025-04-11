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

| Branch Name         | Purpose                                                                 |
|---------------------|-------------------------------------------------------------------------|
| `main`              | Main production branch with stable release code                         |
| `DevBranch`         | Integration branch for development and testing                          |
| `Xoli`              | Developer-specific branch for Xoli's tasks                              |
| `Eunice`            | Developer-specific branch for Eunice's tasks                            |
| `Prince`            | Developer-specific branch for Prince's tasks                            |
| `Nhlakanipho Branch`| Developer-specific branch for Nhlakanipho's tasks                       |

---

## Technology Stack

### Frontend
- **Framework**: React 19.0.0
- **Build Tool**: Vite 6.1.0
- **State Management**: Redux Toolkit
- **UI Libraries**:
  - Material UI (v6.4.6)
  - Framer Motion
  - Recharts
- **Authentication**: Firebase Authentication
- **API Handling**: Axios
- **Date Handling**: date-fns
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
- Node.js v18.x or higher (run `node -v` to check version)
- npm v9.x or Yarn v1.22+ (run `npm -v` or `yarn -v` to check)
- Git installed on your system
- Firebase account for authentication
- Backend API endpoint (provided by backend team)
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
   git checkout "Nhlakanipho Branch"  # Note: Use quotes for branch names with spaces
   ```

3. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

4. **Environment Configuration**
   
   Create a `.env` file in the project root and add the following variables:
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
   
   > **Note:** You'll need to replace the placeholder values with your actual Firebase credentials. These can be obtained from your Firebase project settings.

5. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```
   
   This will start the development server on `http://localhost:5173` by default. You can access the application by opening this URL in your browser.

6. **Verify Installation**
   
   Once the development server is running, you should see:
   - Console output indicating successful compilation
   - The login page at `http://localhost:5173`
   - No console errors in your browser's developer tools

7. **Build for Production**
   ```bash
   npm run build
   # or
   yarn build
   ```
   
   This creates optimized production files in the `dist` directory that can be deployed to a web server.

8. **Preview Production Build**
   ```bash
   npm run preview
   # or
   yarn preview
   ```
   
   This serves the production build locally for testing before deployment.

---

## Configuration

### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Email/Password Authentication**:
   - Navigate to Authentication > Sign-in methods
   - Enable Email/Password provider
3. Set up a **Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Start in production mode or test mode (switch to production later)
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
5. Add a web app to your Firebase project:
   - Click the web icon (</>) on the project overview page
   - Register your app with a nickname
   - Copy the configuration values into the `.env` file
6. Install Firebase CLI (optional, for advanced deployments):
   ```bash
   npm install -g firebase-tools
   firebase login
   firebase init
   ```

### System Settings
Accessible through `/settings` route after login:
- **Business Hours**: Define workday start/end times.
- **Attendance Radius**: Set geofencing parameters (meters).
- **Session Timeout**: Configure inactivity limits (15/30/60 minutes).
- **Program Dates**: Set valid training periods.

---

## Key Features

### User Management
- Add, edit, and delete users (trainees, facilitators, admins, guests).
- Bulk import/export user data via CSV or PDF.
- Role-based access control.

### Attendance Tracking
- Real-time session monitoring.
- Manual override for attendance records.
- Daily logs and attendance analytics.

### Reporting System
- Generate attendance and performance reports.
- Export reports in PDF or CSV formats.

### Event Management
- Schedule and manage special events.
- Send notifications to trainees about upcoming events.

---

## Usage Guide

### Authentication Flow
1. **Login**:
   - Email/Password authentication.
   - Two-Factor Authentication (2FA) via email OTP.
2. **Password Recovery**:
   - OTP validation required.
   - Temporary password expiration (24 hours).

### Dashboard Navigation
- Quick stats include total active users, real-time attendance, and system health metrics.
- Shortcut actions for quick user search, report generation, and event creation.

### User Management
1. **Add User**:
   - Navigate to `/users/create`.
   - Required fields: Name, Email, Role.
2. **Bulk Import**:
   - Use the provided CSV template (`/templates/users.csv`).
   - Validate for duplicates and missing fields.

---

## Branch Management

### Workflow Guidelines
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
3. Create a Pull Request (PR) targeting the `DevBranch` branch.

### Merging to `main`
- Only merge stable, tested code into `main`.
- Ensure all CI/CD pipelines pass before merging.
- PRs to `main` require approval from at least one team lead.

---

## API Documentation

### Authentication Endpoints
| Method | Endpoint               | Description                  |
|--------|------------------------|------------------------------|
| POST   | `/api/auth/login`      | Authenticate users           |
| POST   | `/api/auth/verify-otp` | Verify two-factor auth       |
| POST   | `/api/auth/logout`     | End user session             |

### User Management
| Method | Endpoint               | Description                  |
|--------|------------------------|------------------------------|
| GET    | `/api/users`           | Retrieve all users           |
| POST   | `/api/users`           | Create new user              |
| PUT    | `/api/users/:id`       | Update user details          |
| DELETE | `/api/users/:id`       | Remove user                  |

### Attendance
| Method | Endpoint               | Description                  |
|--------|------------------------|------------------------------|
| GET    | `/api/attendance`      | Get attendance records       |
| POST   | `/api/attendance`      | Create attendance record     |
| PUT    | `/api/attendance/:id`  | Update attendance record     |

### Settings
| Method | Endpoint               | Description                  |
|--------|------------------------|------------------------------|
| GET    | `/api/settings`        | Retrieve system settings     |
| PUT    | `/api/settings`        | Update system settings       |

---

## Troubleshooting

### Common Issues
1. **Login Failures**:
   - Verify 2FA code expiration (5 minutes).
   - Check spam folder for OTP emails.
   - Ensure account is not suspended.
   
2. **Data Export Errors**:
   - Check storage permissions.
   - Validate CSV formatting.
   - Ensure sufficient disk space.
   
3. **Installation Issues**:
   - Clear npm cache: `npm cache clean --force`
   - Check Node.js version: `node -v` (should be v18.x or higher)
   - For Vite errors, try: `npm exec vite --version`
   - If you encounter dependency issues, try: `npm install --legacy-peer-deps`
   
4. **Firebase Connection Problems**:
   - Verify `.env` variables are correctly formatted (no spaces or quotes)
   - Check Firebase console for service disruptions
   - Test connectivity with: `curl -X GET https://[YOUR_PROJECT_ID].firebaseio.com/.json`
   - Ensure your IP is not blocked in Firebase security rules
   
5. **Build Failures**:
   - Check for JavaScript syntax errors in your code
   - Verify import/export statements
   - Look for missing dependencies in `package.json`
   - Try building with verbose output: `npm run build -- --debug`

### Error Codes
| Code | Meaning            | Action                          |
|------|--------------------|----------------------------------|
| 401  | Unauthorized       | Re-authenticate                 |
| 403  | Forbidden          | Check user permissions          |
| 500  | Server Error       | Contact support                 |
| E001 | Database Connection| Verify Firebase credentials     |
| E002 | Invalid Input      | Check form validation           |
| E003 | Rate Limited       | Wait and retry later            |

---

## Contributing

### Contribution Workflow
1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit changes using [Conventional Commits](https://www.conventionalcommits.org/):
   ```bash
   git commit -m 'feat(auth): add 2FA verification'
   ```
4. Push to the branch:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a Pull Request targeting the `DevBranch` branch.

### Code Review Process
1. All PRs require at least one review from a team member
2. Code must pass all automated tests
3. Code must meet style guidelines (run `npm run lint` to verify)
4. Documentation must be updated for any new features

### Coding Standards
- Follow [Airbnb JavaScript Style Guide](https://airbnb.io/javascript/react/).
- Write unit tests for all components and utilities.
- Maintain minimum 80% test coverage.
- Run linter before committing: `npm run lint`
- Format code with Prettier: `npm run format`

---

## Team

### Frontend Developers
- Component Architecture
- State Management
- API Integration
- Performance Optimization

### Backend Developers
- Authentication System
- Database Design
- API Development
- Security Implementation

### UX/UI Designers
- Wireframing
- Component Design

---

## License

Copyright © 2025 Codetribe. All rights reserved.

This project is proprietary software. Unauthorized copying, modification, or distribution is prohibited.
