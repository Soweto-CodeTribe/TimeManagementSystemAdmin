
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

```
## Repository Structure

This repository contains **6 branches**, each serving a specific purpose in the development lifecycle:

| Branch Name         | Purpose                                                                 |
|---------------------|-------------------------------------------------------------------------|
| `main`              | Production-ready code. Only stable releases are merged here.           |
| `develop`           | Integration branch for all feature branches before merging to `main`. |
| `feature/auth`      | Authentication-related features (e.g., login, 2FA, password reset).    |
| `feature/attendance`| Attendance tracking and reporting functionalities.                    |
| `feature/user-mgmt` | User management features (e.g., CRUD operations, bulk imports).        |
| `bugfixes`          | Dedicated branch for resolving bugs and issues reported by users.      |

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
- Node.js v18.x
- npm v9.x or Yarn v1.22+
- Firebase account for authentication
- Backend API endpoint (provided by backend team)

### Setup Instructions

1. **Clone Repository**
   ```bash
   git clone https://github.com/Soweto-CodeTribe/TimeManagementSystemAdmin
   cd TimeManagementSystemAdmin
   ```

2. **Install Dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Environment Configuration**
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

4. **Start Development Server**
   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Build for Production**
   ```bash
   npm run build
   # or
   yarn build
   ```

---

## Configuration

### Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/).
2. Enable **Email/Password Authentication**.
3. Set up a **Firestore Database** and configure security rules:
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
4. Add a web app to your Firebase project and copy the configuration values into the `.env` file.

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
1. Always create a new branch from `develop` for feature development:
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/your-feature-name
   ```
2. Push your changes to the remote branch:
   ```bash
   git push origin feature/your-feature-name
   ```
3. Create a Pull Request (PR) targeting the `develop` branch.

### Merging to `main`
- Only merge stable, tested code into `main`.
- Ensure all CI/CD pipelines pass before merging.

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

### Error Codes
| Code | Meaning            | Action                          |
|------|--------------------|----------------------------------|
| 401  | Unauthorized       | Re-authenticate                 |
| 403  | Forbidden          | Check user permissions          |
| 500  | Server Error       | Contact support                 |

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
5. Open a Pull Request targeting the `develop` branch.

### Coding Standards
- Follow [Airbnb JavaScript Style Guide](https://airbnb.io/javascript/react/).
- Write unit tests for all components and utilities.
- Maintain minimum 80% test coverage.

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
```

### Key Improvements:
1. **Branch Management Section**: Added detailed information about the 6 branches and their purposes.
2. **Repository-Specific Links**: Included the repository URL for clarity.
3. **Structured Sections**: Organized content into clear, logical sections for easy navigation.
4. **Detailed Instructions**: Provided step-by-step guidance for installation, configuration, and contribution.
5. **Error Handling**: Added troubleshooting tips for common issues.
6. **Professional Tone**: Maintained a formal yet approachable tone throughout the document.
