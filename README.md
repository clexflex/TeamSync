# TeamSync Employee Management System

## Overview
TeamSync is an Employee Management System designed to streamline workforce management processes. It provides features for managing employees, departments, leaves, and salaries while offering role-based dashboards for administrators, employees, and team leaders. The system is built with a modern tech stack, ensuring reliability, scalability, and ease of use.

---

## Features
1. **User Roles and Access Control**:
   - Admin: Full control over departments, employees, leaves, salaries, and system settings.
   - Employee: Personal dashboard for viewing profile, applying for leaves, and tracking salaries.
   - Team Leader: Manages and approves attendance and leaves for employees within their department.

2. **Modules**:
   - **Authentication**: Secure login system with role-based access.
   - **Employee Management**: Add, edit, and view employee details.
   - **Department Management**: Manage departments and associate employees with specific departments.
   - **Leave Management**: Employees can apply for leaves, and administrators/team leaders can approve or reject them.
   - **Attendance Management** (Planned):
     - Employees can check in/out and submit daily tasks.
     - Team leaders/admins can review and approve attendance logs.
   - **Salary Management**: Track and manage employee salaries, including allowances and deductions.

3. **Role-Based Dashboards**:
   - Separate dashboards for admins, employees, and team leaders with features tailored to their roles.

4. **Scalable Backend**:
   - RESTful API architecture.
   - MongoDB for data persistence.

5. **Responsive Frontend**:
   - Built with React and styled for modern usability.
   - Works seamlessly across devices.

---

## Project Structure

### Backend
- **Technologies**:
  - Node.js with Express.js
  - MongoDB with Mongoose ORM
- **Directory Structure**:
  ```
  server/
  ├── controllers/        # Handles business logic for each module
  ├── middleware/         # Authentication and request validation
  ├── models/             # Mongoose schemas for database collections
  ├── routes/             # API endpoints
  ├── db/                 # Database connection setup
  ├── .env                # Environment variables
  └── index.js            # Server entry point
  ```

### Frontend
- **Technologies**:
  - React.js
  - Tailwind CSS
  - Vite for bundling
- **Directory Structure**:
  ```
  frontend/
  ├── src/
  │   ├── components/     # Reusable React components
  │   ├── context/        # React context for state management
  │   ├── pages/          # Dashboard and login pages
  │   ├── utils/          # Helper functions
  │   ├── App.jsx         # Application entry point
  │   └── index.css       # Global styles
  ├── .env                # Environment variables for the frontend
  └── vite.config.js      # Vite configuration
  ```

---

## Environment Variables

### Backend
Create a `.env` file in the `server/` directory with the following:
```env
PORT=3000
MONGODB_URL=mongodb://localhost:27017/teamsync
JWT_KEY=jwtSecreteKeyCCCLLLEEXXFFLEEXX@@@1133300066
```

### Frontend
Create a `.env` file in the `frontend/` directory with the following:
```env
VITE_API_URL=http://localhost:3000
```

---

## Installation and Setup

### Prerequisites
1. Node.js and npm installed.
2. MongoDB installed and running.
3. Git for version control.

### Steps
1. Clone the repository:
   ```bash
   git clone <repository_url>
   cd TeamSync
   ```

2. Set up the backend:
   ```bash
   cd server
   npm install
   node index.js
   ```

3. Set up the frontend:
   ```bash
   cd ../frontend
   npm install
   npm run dev
   ```

4. Access the application at `http://localhost:3000` (backend) and `http://localhost:5173` (frontend).

---

## Planned Improvements
1. **Attendance Module**:
   - Employee check-in/out with task submission.
   - Team leader and admin approval for attendance logs.

2. **Enhanced Security**:
   - Implement refresh tokens.
   - Add rate-limiting for API endpoints.

3. **User Analytics**:
   - Generate reports for attendance, leaves, and salaries.

4. **Automated Tests**:
   - Add unit and integration tests for API endpoints.

---

## Contributing
1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/<feature_name>
   ```
3. Commit your changes:
   ```bash
   git commit -m "Add <feature>"
   ```
4. Push to the branch:
   ```bash
   git push origin feature/<feature_name>
   ```
5. Create a Pull Request.

---

## License
This project is licensed under the MIT License.

---

## Contact
For queries or suggestions, contact us at yashrajjghosalkar@gmail.com

