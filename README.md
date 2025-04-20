# TeamSync - Employee Management System

TeamSync is a comprehensive employee management system developed for Maximize Market Research to streamline HR processes, improve efficiency, and enhance the employee experience.

## Features

- **Attendance Management**: Real-time attendance tracking with geolocation verification
- **Leave Management**: Digital leave application, approval, and balance tracking
- **Payroll Processing**: Automated salary calculations based on attendance
- **Document Center**: Centralized document repository for company and employee files
- **Ticket System**: Internal support ticket system for employee requests
- **Team Management**: Create and manage departments and teams with hierarchy
- **Notifications**: Real-time updates for all system activities

## Technologies Used

### Frontend
- React.js
- Material UI
- Vite
- React Router
- Context API
- Axios

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication
- Socket.io for real-time updates
- Winston for logging

## Installation

### Prerequisites
- Node.js (v16+)
- MongoDB
- npm or yarn

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with the following content:
   ```
   VITE_API_URL=http://localhost:3000
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Backend Setup
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file with necessary environment variables (refer to `.env.example`)
4. Start the server:
   ```bash
   npm start
   ```

## Project Structure

```
TeamSync/
├─ frontend/           # Frontend React application
│  ├─ public/          # Static assets
│  └─ src/             # Source files
│     ├─ components/   # React components
│     ├─ context/      # Context providers
│     ├─ hooks/        # Custom hooks
│     ├─ pages/        # Page components
│     └─ utils/        # Utility functions
│
└─ server/             # Backend Node.js application
   ├─ config/          # Configuration files
   ├─ controllers/     # Route controllers
   ├─ middleware/      # Express middleware
   ├─ models/          # Mongoose models
   ├─ routes/          # Express routes
   └─ utils/           # Utility functions
```

## User Roles

- **Admin**: Full system access and management
- **Manager**: Team and department management
- **Employee**: Self-service portal

## Deployment

The project is deployed at [mmrems.com](https://mmrems.com) with a CI/CD pipeline configured for automatic deployments from the main branch.

## License

This project is proprietary and designed specifically for Maximize Market Research.

## Acknowledgments

- Developed by Yashraj Ghosalkar
- Special thanks to the MMR technical team for their feedback and support
- Icons provided by Material Icons