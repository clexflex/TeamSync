import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Container, Typography, Grid, Paper, Breadcrumbs, Link,
  List, ListItem, ListItemText, ListItemIcon, Divider, TextField,
  InputAdornment, Chip, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, useTheme, useMediaQuery,
  Collapse, IconButton, Tabs, Tab,
  Avatar
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Description as DocumentIcon,
  VerifiedUser as AdminIcon,
  SupervisorAccount as ManagerIcon,
  Person as EmployeeIcon,
  Check as CheckIcon,
  Clear as ClearIcon,
  Email as EmailIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  ContentCopy as CopyIcon,
  AccessTime as AttendanceIcon,
  EventNote as LeaveIcon,
  AttachMoney as SalaryIcon,
  Group as TeamIcon,
  Celebration as HolidayIcon,
  Folder as DocumentsIcon,
  AssignmentTurnedIn as TicketIcon,
  ExitToApp as ResignationIcon,
  People as UsersIcon,
  Settings as SettingsIcon,
  Category as CategoryIcon,
  Lock as LockIcon,
  Forum as ForumIcon,
  AttachFile as AttachFileIcon,
  AssignmentInd as AssignmentIndIcon,
  Assignment as AssignmentIcon,
  Folder,
  Notifications,
  Download,
  Assessment,
  Business,
  Group,
  AssessmentRounded,
  Layers,
  GroupAdd,
  SupervisorAccount,
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

// Define the sidebar sections
const documentationSections = {
  "getting-started": {
    id: "getting-started",
    title: "Getting Started",
    icon: <DocumentIcon />,
    subsections: [
      { id: "introduction", title: "Introduction to TeamSync" },
      { id: "system-requirements", title: "System Requirements" },
      { id: "navigation", title: "Navigating the Interface" },
      { id: "first-login", title: "First Login and Setup" }
    ]
  },
  "user-roles": {
    id: "user-roles",
    title: "User Roles and Permissions",
    icon: <UsersIcon />,
    subsections: [
      { id: "admin-role", title: "Administrator Role" },
      { id: "manager-role", title: "Manager Role" },
      { id: "employee-role", title: "Employee Role" },
      { id: "permissions-matrix", title: "Permissions Matrix" }
    ]
  },
  "department-module": {
    id: "department-module",
    title: "Department Management",
    icon: <TeamIcon />,
    subsections: [
      { id: "department-overview", title: "Module Overview" },
      { id: "creating-departments", title: "Creating Departments" },
      { id: "editing-departments", title: "Editing Departments" },
      { id: "deleting-departments", title: "Deleting Departments" }
    ]
  },
  "team-module": {
    id: "team-module",
    title: "Team Management",
    icon: <TeamIcon />,
    subsections: [
      { id: "team-overview", title: "Module Overview" },
      { id: "creating-teams", title: "Creating Teams" },
      { id: "managing-members", title: "Managing Team Members" },
      { id: "team-workflows", title: "Team-based Workflows" }
    ]
  },
  "user-profile-module": {
    id: "user-profile-module",
    title: "User Profile Management",
    icon: <EmployeeIcon />,
    subsections: [
      { id: "profile-overview", title: "Module Overview" },
      { id: "creating-profiles", title: "Creating User Profiles" },
      { id: "editing-profiles", title: "Editing User Profiles" },
      { id: "profile-fields", title: "Profile Fields Reference" }
    ]
  },
  "attendance-module": {
    id: "attendance-module",
    title: "Attendance Management",
    icon: <AttendanceIcon />,
    subsections: [
      { id: "attendance-overview", title: "Module Overview" },
      { id: "clock-in-out", title: "Clock In/Out Process" },
      { id: "geolocation", title: "Geolocation Verification" },
      { id: "attendance-approval", title: "Attendance Approval Workflow" },
      { id: "attendance-reports", title: "Attendance Reports" },
      { id: "credit-system", title: "Credit System Explained" }
    ]
  },
  "leave-module": {
    id: "leave-module",
    title: "Leave Management",
    icon: <LeaveIcon />,
    subsections: [
      { id: "leave-overview", title: "Module Overview" },
      { id: "leave-policies", title: "Leave Policies" },
      { id: "leave-application", title: "Leave Application Process" },
      { id: "leave-approval", title: "Leave Approval Workflow" },
      { id: "leave-balances", title: "Leave Balance Management" }
    ]
  },
  "holiday-module": {
    id: "holiday-module",
    title: "Holiday Management",
    icon: <HolidayIcon />,
    subsections: [
      { id: "holiday-overview", title: "Module Overview" },
      { id: "managing-holidays", title: "Managing Holidays" },
      { id: "holiday-types", title: "Company-wide vs. Department Holidays" }
    ]
  },
  "salary-module": {
    id: "salary-module",
    title: "Salary Management",
    icon: <SalaryIcon />,
    subsections: [
      { id: "salary-overview", title: "Module Overview" },
      { id: "salary-calculation", title: "Salary Calculation" },
      { id: "salary-generation", title: "Generating Salary Records" },
      { id: "salary-approval", title: "Salary Approval Workflow" },
      { id: "payslip", title: "Payslip Generation" }
    ]
  },
  "document-module": {
    id: "document-module",
    title: "Document Management",
    icon: <DocumentsIcon />,
    subsections: [
      { id: "document-overview", title: "Module Overview" },
      { id: "document-categories", title: "Document Categories" },
      { id: "uploading-documents", title: "Uploading Documents" },
      { id: "managing-documents", title: "Managing Documents" }
    ]
  },
  "ticket-module": {
    id: "ticket-module",
    title: "Ticket System",
    icon: <TicketIcon />,
    subsections: [
      { id: "ticket-overview", title: "Module Overview" },
      { id: "creating-tickets", title: "Creating Support Tickets" },
      { id: "managing-tickets", title: "Managing Tickets" },
      { id: "ticket-workflow", title: "Ticket Workflow" }
    ]
  },
  "resignation-module": {
    id: "resignation-module",
    title: "Resignation Management",
    icon: <ResignationIcon />,
    subsections: [
      { id: "resignation-overview", title: "Module Overview" },
      { id: "resignation-process", title: "Resignation Process" },
      { id: "clearance-checklist", title: "Clearance Process" }
    ]
  },
  "settings": {
    id: "settings",
    title: "System Settings",
    icon: <SettingsIcon />,
    subsections: [
      { id: "account-settings", title: "Account Settings" },
      { id: "security-settings", title: "Security Settings" },
      { id: "notification-settings", title: "Notification Settings" }
    ]
  }
};

// Sample content for a specific section (Getting Started > Introduction)
const sampleContent = {
  "introduction": {
    title: "Introduction to TeamSync",
    lastUpdated: "April 10, 2025",
    content: (
      <>
        <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom>
          Introduction to TeamSync
        </Typography>

        <Typography variant="body1" paragraph>
          TeamSync is a comprehensive workforce management solution designed to streamline HR operations,
          enhance employee experience, and provide powerful tools for administrators and managers. This guide
          will help you understand TeamSync's core functionality and how to make the most of its features.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Key Modules and Features
        </Typography>

        <Box sx={{ mb: 4 }}>
          <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell><strong>Module</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Primary Users</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Department Management</TableCell>
                  <TableCell>Create and manage organizational departments</TableCell>
                  <TableCell>Administrators</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Team Management</TableCell>
                  <TableCell>Organize employees into teams under managers</TableCell>
                  <TableCell>Administrators, Managers</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>User Profile</TableCell>
                  <TableCell>Manage employee information and records</TableCell>
                  <TableCell>Administrators</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Attendance</TableCell>
                  <TableCell>Track and manage employee attendance</TableCell>
                  <TableCell>All Users</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Leave Management</TableCell>
                  <TableCell>Handle leave applications and approvals</TableCell>
                  <TableCell>All Users</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Salary Management</TableCell>
                  <TableCell>Process payroll and generate payslips</TableCell>
                  <TableCell>Administrators</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Document Center</TableCell>
                  <TableCell>Store and manage important documents</TableCell>
                  <TableCell>All Users</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Ticket System</TableCell>
                  <TableCell>Handle support requests and issues</TableCell>
                  <TableCell>All Users</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Resignation</TableCell>
                  <TableCell>Process employee resignations</TableCell>
                  <TableCell>All Users</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Role-Based Access Control
        </Typography>

        <Typography variant="body1" paragraph>
          TeamSync implements role-based access control with three primary user roles:
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%', borderTop: 5, borderColor: 'error.main' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AdminIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6">Administrator</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Full system access with ability to manage all aspects of the platform,
                  including departments, teams, users, approvals, and system settings.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%', borderTop: 5, borderColor: 'warning.main' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ManagerIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">Manager</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Team management capabilities including creating teams, managing team members,
                  approving attendance and leave requests for team members.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%', borderTop: 5, borderColor: 'info.main' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmployeeIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">Employee</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Self-service functions including clock in/out, leave applications, viewing documents,
                  accessing personal information and submitting support tickets.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          System Architecture
        </Typography>

        <Typography variant="body1" paragraph>
          TeamSync is built using a modern technology stack:
        </Typography>

        <Box sx={{ mb: 4 }}>
          <ul>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Frontend:</strong> React.js with Material UI components for a responsive and intuitive user interface
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Backend:</strong> Node.js with Express.js for a robust API layer
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Database:</strong> MongoDB for flexible and scalable data storage
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Authentication:</strong> JWT (JSON Web Tokens) for secure user authentication
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>File Storage:</strong> Firebase Storage for secure document management
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Real-time Features:</strong> Socket.io for notifications and live updates
              </Typography>
            </li>
          </ul>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Getting Started
        </Typography>

        <Typography variant="body1" paragraph>
          To begin using TeamSync:
        </Typography>

        <Box sx={{ mb: 4 }}>
          <ol>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Login to the system</strong> using your provided credentials
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Explore your role-specific dashboard</strong> to familiarize yourself with available features
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Review your profile information</strong> to ensure it's accurate and complete
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Set up your notification preferences</strong> to stay informed about important updates
              </Typography>
            </li>
          </ol>
        </Box>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.soft', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="medium">
            Need Additional Help?
          </Typography>
          <Typography variant="body2">
            If you need assistance with specific features or encounter any issues, please check the Help Center
            or submit a support ticket through the Ticket System module.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color="primary"
              component={RouterLink}
              to="/help-center"
              sx={{ mr: 2 }}
            >
              Visit Help Center
            </Button>
            <Button
              variant="contained"
              color="primary"
              component={RouterLink}
              to="/employee-dashboard/add-ticket"
            >
              Submit a Ticket
            </Button>
          </Box>
        </Box>
      </>
    )
  },

  // Sample content for Credit System section
  "credit-system": {
    title: "Credit System Explained",
    lastUpdated: "April 12, 2025",
    content: (
      <>
        <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom>
          Attendance Credit System Explained
        </Typography>

        <Typography variant="body1" paragraph>
          The credit system is a core component of TeamSync's attendance and payroll management.
          This guide explains how credits are assigned, calculated, and used in salary processing.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          What Are Attendance Credits?
        </Typography>

        <Typography variant="body1" paragraph>
          Attendance credits are numerical values assigned to each day based on an employee's attendance status.
          These credits determine salary calculations by providing a standardized way to handle various attendance
          scenarios like regular working days, leaves, holidays, and partial attendance.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Credit Values by Attendance Status
        </Typography>

        <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell><strong>Attendance Status</strong></TableCell>
                <TableCell><strong>Credits</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Present</TableCell>
                <TableCell>1.0</TableCell>
                <TableCell>Complete attendance with clock-in and clock-out</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Absent</TableCell>
                <TableCell>0.0</TableCell>
                <TableCell>No attendance record for a working day</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Paid Leave</TableCell>
                <TableCell>1.0</TableCell>
                <TableCell>Approved leave using leave balance</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Unpaid Leave</TableCell>
                <TableCell>0.0</TableCell>
                <TableCell>Approved leave without using leave balance</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Paid Half Leave</TableCell>
                <TableCell>0.5</TableCell>
                <TableCell>Half-day leave using leave balance (without attendance)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Paid Half Leave + Attendance</TableCell>
                <TableCell>1.0</TableCell>
                <TableCell>Half-day leave using leave balance with attendance for other half</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Unpaid Half Leave</TableCell>
                <TableCell>0.0</TableCell>
                <TableCell>Half-day leave without using leave balance (without attendance)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Unpaid Half Leave + Attendance</TableCell>
                <TableCell>0.5</TableCell>
                <TableCell>Half-day leave without using leave balance with attendance for other half</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Incomplete Attendance</TableCell>
                <TableCell>0.5</TableCell>
                <TableCell>Clock-in without clock-out</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Weekly Off</TableCell>
                <TableCell>1.0</TableCell>
                <TableCell>Weekend or holiday with no attendance record</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Extra Work</TableCell>
                <TableCell>1.0</TableCell>
                <TableCell>Attendance on weekend or holiday</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          How Credits Affect Salary Calculation
        </Typography>

        <Typography variant="body1" paragraph>
          Credits directly impact salary calculation through the attendance adjustment formula:
        </Typography>

        <Paper sx={{ p: 3, bgcolor: 'background.default', mb: 3 }}>
          <Typography variant="body1" fontWeight="medium">
            Attendance Adjustment = (Total Days in Period - Total Credits) × (Gross Pay/30)
          </Typography>
        </Paper>

        <Typography variant="body1" paragraph>
          This adjustment is then deducted from the employee's gross salary:
        </Typography>

        <Paper sx={{ p: 3, bgcolor: 'background.default', mb: 4 }}>
          <Typography variant="body1" fontWeight="medium">
            Net Salary = Gross Salary - Deductions - Attendance Adjustment
          </Typography>
        </Paper>

        <Typography variant="h6" gutterBottom>
          Example Scenarios
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Scenario 1: Perfect Attendance
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              An employee with a monthly gross salary of ₹30,000 works all weekdays in a 30-day month with 22 working days.
            </Typography>
            <ul>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Working days: 22 days × 1 credit = 22 credits
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Weekly offs/Holidays: 8 days × 1 credit = 8 credits
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Total credits: 30
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Attendance adjustment: (30 - 30) × (30,000/30) = 0 × 1,000 = ₹0
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary" fontWeight="medium">
                  Net salary (before other deductions): ₹30,000
                </Typography>
              </li>
            </ul>
          </Paper>

          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Scenario 2: Some Absences
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              An employee with a monthly gross salary of ₹30,000 has 2 absent days and 1 day of incomplete attendance in a 30-day month.
            </Typography>
            <ul>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Working days with attendance: 19 days × 1 credit = 19 credits
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Incomplete attendance: 1 day × 0.5 credit = 0.5 credits
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Absent days: 2 days × 0 credit = 0 credits
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Weekly offs/Holidays: 8 days × 1 credit = 8 credits
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Total credits: 27.5
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Attendance adjustment: (30 - 27.5) × (30,000/30) = 2.5 × 1,000 = ₹2,500
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary" fontWeight="medium">
                  Net salary (before other deductions): ₹30,000 - ₹2,500 = ₹27,500
                </Typography>
              </li>
            </ul>
          </Paper>

          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Scenario 3: Mixed Attendance Types
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              An employee with a monthly gross salary of ₹30,000 has 1 paid leave, 1 unpaid leave, 1 paid half-leave with attendance for other half, and 1 day of extra work on a weekend.
            </Typography>
            <ul>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Working days with attendance: 20 days × 1 credit = 20 credits
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Paid leave: 1 day × 1 credit = 1 credit
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Unpaid leave: 1 day × 0 credit = 0 credits
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Paid half-leave with attendance: 1 day × 1 credit = 1 credit
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Weekly offs/Holidays: 7 days × 1 credit = 7 credits
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Extra work on weekend: 1 day × 1 credit = 1 credit
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Total credits: 30
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary">
                  Attendance adjustment: (30 - 30) × (30,000/30) = 0 × 1,000 = ₹0
                </Typography>
              </li>
              <li>
                <Typography variant="body2" color="text.secondary" fontWeight="medium">
                  Net salary (before other deductions): ₹30,000
                </Typography>
              </li>
            </ul>
          </Paper>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Special Considerations
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Sandwich Leave Rule
          </Typography>
          <Typography variant="body1" paragraph>
            When an unpaid leave spans across weekends or holidays (e.g., Friday through Monday),
            the weekend days in between are also treated as unpaid leave (0 credits), effectively
            "sandwiching" the weekend between unpaid leave days. This rule does not apply to paid leaves.
          </Typography>

          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Credit Caps
          </Typography>
          <Typography variant="body1" paragraph>
            The total credits for a period cannot exceed the total days in that period. Extra work
            on weekends provides additional credits, but these are balanced by any absent days or
            unpaid leaves.
          </Typography>

          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Approvals and Credits
          </Typography>
          <Typography variant="body1" paragraph>
            Attendance records must be approved before their credits are counted in salary calculations.
            Rejected attendance records receive 0 credits regardless of their status.
          </Typography>
        </Box>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'error.soft', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="medium" color="error.main">
            Important Notice
          </Typography>
          <Typography variant="body2">
            Always verify your attendance records and credit calculations before salary processing.
            Report any discrepancies to your manager or HR administrator promptly to ensure accurate salary calculation.
          </Typography>
        </Box>
      </>
    )
  },

  // Salary Management section
  "salary-overview": {
    title: "Salary Module Overview",
    lastUpdated: "April 12, 2025",
    content: (
      <>
        <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom>
          Salary Module Overview
        </Typography>

        <Typography variant="body1" paragraph>
          The Salary Module is a comprehensive system that automates the complete payroll process, from calculating
          attendance-based salaries to generating payslips and tracking payments. This module integrates with the
          Attendance and Leave modules to ensure accurate compensation based on employee work records.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Key Components
        </Typography>

        <Box sx={{ mb: 4 }}>
          <ul>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Salary Dashboard:</strong> Overview of all salary data and statistics
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Salary Generation:</strong> Generate individual or batch salary drafts
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Salary Management:</strong> Review, approve, and process salary records
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Payslip Generation:</strong> Create and distribute official payslips to employees
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Salary History:</strong> Track salary records over time for all employees
              </Typography>
            </li>
          </ul>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Integration with Other Modules
        </Typography>

        <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell><strong>Module</strong></TableCell>
                <TableCell><strong>Integration Points</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Attendance</TableCell>
                <TableCell>
                  <ul>
                    <li>Attendance records must be approved before generating salary</li>
                    <li>Credits from attendance directly affect salary calculation</li>
                    <li>Attendance edits require salary regeneration</li>
                  </ul>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Leave</TableCell>
                <TableCell>
                  <ul>
                    <li>Paid leaves count as 1 credit per day (no salary deduction)</li>
                    <li>Unpaid leaves count as 0 credits (salary deduction)</li>
                    <li>Half-day leaves have proportional credit allocation</li>
                  </ul>
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Holiday</TableCell>
                <TableCell>
                  <ul>
                    <li>Holidays automatically count as 1 credit (no deduction)</li>
                    <li>Working on holidays counts as Extra Work (additional credit)</li>
                    <li>Holiday configuration must be completed before salary generation</li>
                  </ul>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          User Access by Role
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%', borderTop: 5, borderColor: 'error.main' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AdminIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6">Administrator</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  <ul>
                    <li>Generate salary drafts</li>
                    <li>Review and edit salary records</li>
                    <li>Approve/reject salaries</li>
                    <li>Mark salaries as paid</li>
                    <li>Generate payslips</li>
                    <li>Access all salary statistics</li>
                  </ul>
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%', borderTop: 5, borderColor: 'warning.main' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ManagerIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">Manager</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  <ul>
                    <li>View their own salary history</li>
                    <li>Access their detailed salary records</li>
                    <li>Download their payslips</li>
                    <li>Cannot view other users' salary information</li>
                  </ul>
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 2, height: '100%', borderTop: 5, borderColor: 'info.main' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmployeeIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">Employee</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  <ul>
                    <li>View their own salary history</li>
                    <li>Access their detailed salary records</li>
                    <li>Download their payslips</li>
                    <li>Cannot view other users' salary information</li>
                  </ul>
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.soft', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="medium">
            Need to Understand the Salary Calculation Process?
          </Typography>
          <Typography variant="body2">
            For a detailed explanation of how salaries are calculated, including the credit system and attendance adjustments,
            check out the Salary Calculation section of the documentation.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => document.querySelector('#salary-calculation').scrollIntoView({ behavior: 'smooth' })}
            >
              View Salary Calculation
            </Button>
          </Box>
        </Box>
      </>
    )
  },

  // Salary Calculation section
  "salary-calculation": {
    title: "Salary Calculation",
    lastUpdated: "April 12, 2025",
    content: (
      <>
        <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom id="salary-calculation">
          Salary Calculation
        </Typography>

        <Typography variant="body1" paragraph>
          Salary calculation in TeamSync follows a formula that considers attendance, leave, and preset salary components.
          Understanding this process is key to ensuring accurate payroll processing.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Salary Formula
        </Typography>

        <Paper sx={{ p: 3, bgcolor: 'background.default', mb: 3 }}>
          <Typography variant="body1" fontWeight="medium">
            Net Salary = [Gross Pay - Deductions] - Attendance Adjustment
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Where:
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" color="text.secondary">
                Gross Pay = Basic Salary + Allowances
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                Deductions = PF + ESI + PT + TDS + MLWF + Advances + Others
              </Typography>
            </li>
            <li>
              <Typography variant="body2" color="text.secondary">
                Attendance Adjustment = (Total Days in Period - Total Credits) × (Gross Pay/30)
              </Typography>
            </li>
          </ul>
        </Paper>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Credit System and Attendance
        </Typography>

        <Typography variant="body1" paragraph>
          The credit system is at the heart of attendance-based salary calculation. Each day is assigned a credit value based on
          attendance status:
        </Typography>

        <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell><strong>Day Type</strong></TableCell>
                <TableCell><strong>Attendance Status</strong></TableCell>
                <TableCell><strong>Credits Awarded</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Weekday</TableCell>
                <TableCell>Present</TableCell>
                <TableCell>1</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Weekday</TableCell>
                <TableCell>Absent</TableCell>
                <TableCell>0</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Weekday</TableCell>
                <TableCell>Paid Leave</TableCell>
                <TableCell>1</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Weekday</TableCell>
                <TableCell>Unpaid Leave</TableCell>
                <TableCell>0</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Weekday</TableCell>
                <TableCell>Paid Half Leave without attendance</TableCell>
                <TableCell>0.5</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Weekday</TableCell>
                <TableCell>Paid Half Leave with attendance</TableCell>
                <TableCell>1</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Weekday</TableCell>
                <TableCell>Unpaid Half Leave without attendance</TableCell>
                <TableCell>0</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Weekday</TableCell>
                <TableCell>Unpaid Half Leave with attendance</TableCell>
                <TableCell>0.5</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Weekday</TableCell>
                <TableCell>Incomplete Attendance</TableCell>
                <TableCell>0.5</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Weekend/Holiday</TableCell>
                <TableCell>No Attendance</TableCell>
                <TableCell>1 (Weekly Off)</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Weekend/Holiday</TableCell>
                <TableCell>Present</TableCell>
                <TableCell>1 (Extra Work)</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Calculation Example
        </Typography>

        <Paper sx={{ p: 3, mb: 4, borderLeft: 5, borderColor: 'primary.main' }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Scenario: Employee with Some Absences
          </Typography>
          <Typography variant="body2" paragraph>
            Let's look at an example calculation for an employee with a monthly gross salary of ₹30,000 who has 2 absent days
            and 1 day of incomplete attendance in a 30-day month.
          </Typography>

          <Typography variant="subtitle2" gutterBottom>Step 1: Calculate Credits</Typography>
          <ul>
            <li>Working days with attendance: 19 days × 1 credit = 19 credits</li>
            <li>Incomplete attendance: 1 day × 0.5 credit = 0.5 credits</li>
            <li>Absent days: 2 days × 0 credit = 0 credits</li>
            <li>Weekly offs/Holidays: 8 days × 1 credit = 8 credits</li>
            <li>Total credits: 27.5</li>
          </ul>

          <Typography variant="subtitle2" gutterBottom>Step 2: Calculate Attendance Adjustment</Typography>
          <Box sx={{ pl: 3 }}>
            <Typography variant="body2">
              Attendance adjustment = (30 - 27.5) × (30,000/30) = 2.5 × 1,000 = ₹2,500
            </Typography>
          </Box>

          <Typography variant="subtitle2" gutterBottom>Step 3: Calculate Net Salary</Typography>
          <Box sx={{ pl: 3 }}>
            <Typography variant="body2">
              Net salary (before other deductions) = ₹30,000 - ₹2,500 = ₹27,500
            </Typography>
          </Box>

          <Typography variant="subtitle2" gutterBottom>Step 4: Apply Additional Deductions</Typography>
          <Box sx={{ pl: 3 }}>
            <Typography variant="body2">
              Assuming other deductions (PF, ESI, etc.) total ₹3,000:
            </Typography>
            <Typography variant="body2" fontWeight="medium">
              Final Net Salary = ₹27,500 - ₹3,000 = ₹24,500
            </Typography>
          </Box>
        </Paper>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Salary Generation Process
        </Typography>

        <Box sx={{ mb: 4 }}>
          <ol>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Attendance Verification:</strong> Ensure all attendance records for the period are approved
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Generate Draft:</strong> Admin generates salary draft for individual or batch employees
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Review & Edit:</strong> Admin reviews and makes any necessary adjustments
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Approval:</strong> Admin approves the salary record
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Payment Processing:</strong> Admin marks the salary as paid and enters payment details
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Payslip Generation:</strong> System generates official payslips for employees
              </Typography>
            </li>
          </ol>
        </Box>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'error.soft', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="medium" color="error.main">
            Important Notice
          </Typography>
          <Typography variant="body2">
            If there are any discrepancies in salary calculation, employees should first verify their attendance records
            for the pay period, as these directly impact the credits and resulting attendance adjustment. For any unresolved
            issues, please submit a support ticket through the Ticket System.
          </Typography>
        </Box>
      </>
    )
  },

  // Leave Policy section
  "leave-policies": {
    title: "Leave Policies",
    lastUpdated: "April 15, 2025",
    content: (
      <>
        <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom>
          Leave Policies
        </Typography>

        <Typography variant="body1" paragraph>
          The Leave Policy Management module allows administrators to create and configure leave policies for different
          types of employees. These policies define how many leave days employees are entitled to, which types of leave
          they can take, and other important rules like carry-forward options.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Leave Policy Components
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Policy Configuration
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      <strong>Policy Name:</strong> Clear, descriptive name for the policy
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      <strong>Description:</strong> Details about the policy's purpose or applicable employees
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      <strong>Applicable Roles:</strong> Which roles (employee, manager, or both) this policy applies to
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      <strong>Active Status:</strong> Whether the policy is currently active
                    </Typography>
                  </li>
                </ul>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Leave Types Configuration
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      <strong>Type:</strong> Casual Leave, Sick Leave, Paid Leave, or Half Leave
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      <strong>Days Allowed:</strong> Number of days granted annually
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      <strong>Paid Leave:</strong> Whether this type counts as paid leave
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      <strong>Carry Forward:</strong> Whether unused days can carry to the next year
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      <strong>Max Carry Forward:</strong> Maximum days that can carry over
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      <strong>Probation Period:</strong> Months of employment before leave is available
                    </Typography>
                  </li>
                </ul>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Available Leave Types
        </Typography>

        <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell><strong>Leave Type</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
                <TableCell><strong>Common Usage</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Casual Leave</TableCell>
                <TableCell>Short-term leave for personal matters</TableCell>
                <TableCell>Family events, personal errands, short breaks</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Sick Leave</TableCell>
                <TableCell>Leave for health-related issues</TableCell>
                <TableCell>Illness, medical appointments, recovery</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Paid Leave</TableCell>
                <TableCell>General leave with pay</TableCell>
                <TableCell>Vacation, planned personal time off</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Half Leave</TableCell>
                <TableCell>Partial day leave (half day)</TableCell>
                <TableCell>Appointments, partial day absences</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Assigning Leave Policies to Users
        </Typography>

        <Typography variant="body1" paragraph>
          Once a leave policy is created, administrators can assign it to users through the following process:
        </Typography>

        <Box sx={{ mb: 4 }}>
          <ol>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Access the policy assignment page</strong> from the policy list or directly from a specific policy
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Select the leave policy</strong> from the dropdown (if not already selected)
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Filter users by role</strong> (employee, manager, or all) to narrow down the list
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Select the users</strong> you want to assign this policy to
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Confirm the assignment</strong> to apply the policy to selected users
              </Typography>
            </li>
          </ol>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Annual Leave Balance Reset
        </Typography>

        <Typography variant="body1" paragraph>
          Leave balances are typically reset at the beginning of each year through the following process:
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Paper sx={{ p: 3, borderLeft: 5, borderColor: 'primary.main' }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Reset Process
            </Typography>
            <ol>
              <li>
                <Typography variant="body2" gutterBottom>
                  <strong>Navigate to "Reset Leave Balances"</strong> from the Leave Policies page
                </Typography>
              </li>
              <li>
                <Typography variant="body2" gutterBottom>
                  <strong>Select users</strong> for balance reset (individual users or all users)
                </Typography>
              </li>
              <li>
                <Typography variant="body2" gutterBottom>
                  <strong>Choose whether to apply carry forward rules</strong> based on policy settings
                </Typography>
              </li>
              <li>
                <Typography variant="body2" gutterBottom>
                  <strong>Review the list</strong> of selected users and their current balances
                </Typography>
              </li>
              <li>
                <Typography variant="body2" gutterBottom>
                  <strong>Confirm the reset operation</strong> to update balances for the new year
                </Typography>
              </li>
            </ol>

            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              What Happens During Reset:
            </Typography>
            <ul>
              <li>
                <Typography variant="body2" gutterBottom>
                  All selected users' leave balances are reset to their policy's standard allowance
                </Typography>
              </li>
              <li>
                <Typography variant="body2" gutterBottom>
                  If carry forward is enabled, unused days (up to the max limit) are added to the new balance
                </Typography>
              </li>
              <li>
                <Typography variant="body2" gutterBottom>
                  The system logs the reset date for each user
                </Typography>
              </li>
              <li>
                <Typography variant="body2" gutterBottom>
                  Users receive notifications about their updated balances
                </Typography>
              </li>
            </ul>
          </Paper>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Best Practices
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Policy Design
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      Create policies that align with your organization's HR guidelines and legal requirements
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      Consider different employee categories (probation, regular, management) when designing policies
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      Use clear, consistent naming conventions for policies
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      Include detailed descriptions explaining who each policy applies to
                    </Typography>
                  </li>
                </ul>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Balance Management
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      Plan annual leave balance resets in advance
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      Communicate reset schedules to employees
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      Consider sending notifications before resets so employees can use expiring leave
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      Keep records of previous balances for reference
                    </Typography>
                  </li>
                </ul>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.soft', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="medium">
            Next Step: Leave Application Process
          </Typography>
          <Typography variant="body2">
            Now that you understand leave policies, learn about the leave application process to see how employees
            request time off and how these policies are applied.
          </Typography>
          <Box sx={{ mt: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => document.querySelector('#leave-application').scrollIntoView({ behavior: 'smooth' })}
            >
              View Leave Application Process
            </Button>
          </Box>
        </Box>
      </>
    )
  },

  // Leave Application section
  "leave-application": {
    title: "Leave Application Process",
    lastUpdated: "April 15, 2025",
    content: (
      <>
        <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom id="leave-application">
          Leave Application Process
        </Typography>

        <Typography variant="body1" paragraph>
          The Leave Application process allows employees and managers to request time off through a structured workflow
          that tracks leave balances, manages approvals, and integrates with attendance tracking.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Leave Application Steps
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      width: 36,
                      height: 36,
                      mr: 2
                    }}
                  >
                    1
                  </Avatar>
                  <Typography variant="h6">Access Leave Form</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Navigate to "Apply Leave" from your dashboard or Leave section to open the leave application form.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      width: 36,
                      height: 36,
                      mr: 2
                    }}
                  >
                    2
                  </Avatar>
                  <Typography variant="h6">Select Leave Type</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Choose the appropriate leave type from the available options based on your leave policy.
                  Each type has different rules and balance implications.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      width: 36,
                      height: 36,
                      mr: 2
                    }}
                  >
                    3
                  </Avatar>
                  <Typography variant="h6">Select Date Range</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Choose start and end dates for your leave. For Half Leave, both start and end dates must be the same day.
                  The system automatically calculates the total days based on working days in the range.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      width: 36,
                      height: 36,
                      mr: 2
                    }}
                  >
                    4
                  </Avatar>
                  <Typography variant="h6">Provide Reason</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Enter a clear, concise reason for your leave request. This information helps managers make
                  informed approval decisions.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      width: 36,
                      height: 36,
                      mr: 2
                    }}
                  >
                    5
                  </Avatar>
                  <Typography variant="h6">Choose Leave Balance Option</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Select whether to use your leave balance (Paid Leave) or not (Unpaid Leave). This choice
                  affects credit assignment and salary calculation.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      width: 36,
                      height: 36,
                      mr: 2
                    }}
                  >
                    6
                  </Avatar>
                  <Typography variant="h6">Attach Supporting Documents</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Optionally upload relevant documents (e.g., medical certificates) to support your leave request,
                  especially for medical or emergency leaves.
                </Typography>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      width: 36,
                      height: 36,
                      mr: 2
                    }}
                  >
                    7
                  </Avatar>
                  <Typography variant="h6">Submit Application</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Review all information for accuracy and submit your application. The system will validate your leave
                  balance, check for overlapping leave requests, and ensure compliance with leave policies before submission.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          System Validations
        </Typography>

        <Typography variant="body1" paragraph>
          The leave application system performs several validations before allowing submission:
        </Typography>

        <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell><strong>Validation</strong></TableCell>
                <TableCell><strong>Description</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>Leave Balance</TableCell>
                <TableCell>Ensures you have sufficient leave balance if applying for paid leave</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Overlapping Leaves</TableCell>
                <TableCell>Checks for existing leave requests that overlap with the requested dates</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Approved Attendance</TableCell>
                <TableCell>Cannot request leave for days with approved attendance records</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Half Leave Validation</TableCell>
                <TableCell>For Half Leave, ensures start and end dates are the same day</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Weekend/Holiday Check</TableCell>
                <TableCell>Automatically excludes weekends and holidays from leave count</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Leave Statuses
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={4}>
              <Paper
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: 'warning.main',
                  borderRadius: 2,
                  bgcolor: 'warning.soft'
                }}
              >
                <Typography variant="h6" color="warning.main">Pending</Typography>
                <Typography variant="body2">
                  Your application has been submitted but not yet reviewed or decided upon
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: 'success.main',
                  borderRadius: 2,
                  bgcolor: 'success.soft'
                }}
              >
                <Typography variant="h6" color="success.main">Approved</Typography>
                <Typography variant="body2">
                  Your leave request has been approved and will be reflected in attendance records
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper
                sx={{
                  p: 2,
                  border: 1,
                  borderColor: 'error.main',
                  borderRadius: 2,
                  bgcolor: 'error.soft'
                }}
              >
                <Typography variant="h6" color="error.main">Rejected</Typography>
                <Typography variant="body2">
                  Your leave request has been denied with a reason provided by the approver
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Canceling a Leave Application
        </Typography>

        <Typography variant="body1" paragraph>
          If your plans change, you can cancel a leave application through the following process:
        </Typography>

        <Box sx={{ mb: 4 }}>
          <ol>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Navigate to your Leave list</strong> from your dashboard
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Locate the leave application</strong> you wish to cancel
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Click "Cancel"</strong> next to the pending application
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Provide a reason for cancellation</strong> if required
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Confirm your cancellation</strong> in the dialog
              </Typography>
            </li>
          </ol>
        </Box>

        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
          Important Notes on Cancellation:
        </Typography>
        <Box sx={{ mb: 4, pl: 3 }}>
          <ul>
            <li>
              <Typography variant="body1" gutterBottom>
                You can only cancel leave applications that are still in "Pending" status
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                Approved leave can be canceled only if the start date is in the future
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                Canceling an approved leave will restore the deducted leave balance
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                You cannot cancel leave applications that have already started
              </Typography>
            </li>
          </ul>
        </Box>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'warning.soft', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="medium" color="warning.main">
            Reminder
          </Typography>
          <Typography variant="body2">
            Apply for leave in advance whenever possible to allow managers sufficient time for review.
            For emergency leaves, follow up with your manager directly to ensure prompt processing.
          </Typography>
        </Box>
      </>
    )
  },

  // Resignation Process section
  "resignation-process": {
    title: "Resignation Process",
    lastUpdated: "April 14, 2025",
    content: (
      <>
        <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom>
          Resignation Process
        </Typography>

        <Typography variant="body1" paragraph>
          The Resignation Module provides a structured process for employees and managers to submit their
          resignations and for administrators to manage these requests. This ensures a smooth transition
          during an employee's departure from the organization.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Resignation Workflow
        </Typography>

        <Box sx={{ mb: 5 }}>
          <Paper sx={{ p: 0, overflow: 'hidden', borderRadius: 2 }}>
            <Grid container>
              <Grid item xs={12} md={4} sx={{ bgcolor: 'primary.main', color: 'white', p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="medium">
                  Submission Phase
                </Typography>
                <ol>
                  <li>
                    <Typography variant="body2" gutterBottom sx={{ color: 'white' }}>
                      Employee navigates to the Resignation page
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom sx={{ color: 'white' }}>
                      Completes the resignation form with reason
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom sx={{ color: 'white' }}>
                      Selects notice period (15-90 days)
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom sx={{ color: 'white' }}>
                      Reviews last working day (auto-calculated)
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom sx={{ color: 'white' }}>
                      Submits resignation request
                    </Typography>
                  </li>
                </ol>
              </Grid>
              <Grid item xs={12} md={4} sx={{ bgcolor: 'grey.100', p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="medium" color="text.primary">
                  Review Phase
                </Typography>
                <ol>
                  <li>
                    <Typography variant="body2" gutterBottom color="text.secondary">
                      HR/Admin reviews the resignation request
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom color="text.secondary">
                      Initiates clearance checklist process
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom color="text.secondary">
                      Manages knowledge transfer planning
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom color="text.secondary">
                      Verifies notice period requirements
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom color="text.secondary">
                      Makes decision on resignation
                    </Typography>
                  </li>
                </ol>
              </Grid>
              <Grid item xs={12} md={4} sx={{ bgcolor: 'secondary.main', color: 'white', p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="medium">
                  Completion Phase
                </Typography>
                <ol>
                  <li>
                    <Typography variant="body2" gutterBottom sx={{ color: 'white' }}>
                      Clearance items are completed and verified
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom sx={{ color: 'white' }}>
                      Exit interview is conducted
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom sx={{ color: 'white' }}>
                      Final settlement is processed
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom sx={{ color: 'white' }}>
                      System access is deactivated after last day
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom sx={{ color: 'white' }}>
                      Records are preserved for future reference
                    </Typography>
                  </li>
                </ol>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          For Employees and Managers
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Submitting a Resignation
                </Typography>
                <ol>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      <strong>Access the Resignation Page</strong> from your dashboard
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      <strong>Fill the Resignation Form</strong> with a clear and professional reason
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      <strong>Select your notice period</strong> based on your employment terms
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      <strong>Review the calculated last working day</strong> which is based on your notice period
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      <strong>Submit your resignation</strong> to initiate the process
                    </Typography>
                  </li>
                </ol>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  After Submission
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      <strong>Track resignation status</strong> on your dashboard (Pending, Approved, Rejected)
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      <strong>Continue working normally</strong> during your notice period
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      <strong>Complete assigned clearance tasks</strong> as directed by HR
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      <strong>Participate in knowledge transfer</strong> to ensure smooth transition
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom>
                      <strong>Complete exit interview</strong> when scheduled by HR
                    </Typography>
                  </li>
                </ul>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Resignation Statuses
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderTop: 5,
                  borderColor: 'warning.main',
                  height: '100%'
                }}
              >
                <Typography variant="h6" color="warning.main">Pending</Typography>
                <Typography variant="body2" color="text.secondary">
                  Submitted but not yet reviewed
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderTop: 5,
                  borderColor: 'success.main',
                  height: '100%'
                }}
              >
                <Typography variant="h6" color="success.main">Approved</Typography>
                <Typography variant="body2" color="text.secondary">
                  Accepted, notice period active
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderTop: 5,
                  borderColor: 'error.main',
                  height: '100%'
                }}
              >
                <Typography variant="h6" color="error.main">Rejected</Typography>
                <Typography variant="body2" color="text.secondary">
                  Declined with reason provided
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={3}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderTop: 5,
                  borderColor: 'grey.500',
                  height: '100%'
                }}
              >
                <Typography variant="h6" color="text.secondary">Withdrawn</Typography>
                <Typography variant="body2" color="text.secondary">
                  Canceled by employee
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Withdrawing a Resignation
        </Typography>

        <Typography variant="body1" paragraph>
          If you change your mind, you can withdraw your resignation under certain conditions:
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Paper sx={{ p: 3, borderLeft: 4, borderColor: 'info.main' }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Withdrawal Process
            </Typography>
            <ol>
              <li>
                <Typography variant="body2" gutterBottom>
                  Navigate to your resignation status page
                </Typography>
              </li>
              <li>
                <Typography variant="body2" gutterBottom>
                  Click the "Withdraw Resignation" button (only visible for Pending resignations)
                </Typography>
              </li>
              <li>
                <Typography variant="body2" gutterBottom>
                  Provide a reason for withdrawing your resignation
                </Typography>
              </li>
              <li>
                <Typography variant="body2" gutterBottom>
                  Confirm the withdrawal
                </Typography>
              </li>
            </ol>

            <Typography variant="subtitle2" gutterBottom sx={{ mt: 2 }}>
              Important Limitations:
            </Typography>
            <ul>
              <li>
                <Typography variant="body2" gutterBottom fontWeight="medium">
                  You can only withdraw a resignation that is still in "Pending" status
                </Typography>
              </li>
              <li>
                <Typography variant="body2" gutterBottom>
                  Once a resignation is approved, it cannot be withdrawn through the system
                </Typography>
              </li>
              <li>
                <Typography variant="body2" gutterBottom>
                  If circumstances change after approval, contact HR directly to discuss options
                </Typography>
              </li>
            </ul>
          </Paper>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          System Impact of Resignation
        </Typography>

        <Typography variant="body1" paragraph>
          When a resignation is processed and completed:
        </Typography>

        <Box sx={{ mb: 4 }}>
          <ul>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Account Status:</strong> Your account will be automatically changed to "inactive" after your last working day
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>System Access:</strong> You will no longer be able to log in after your account is deactivated
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Data Preservation:</strong> Your historical data (attendance, leave, salary records) remains in the system
              </Typography>
            </li>
            <li>
              <Typography variant="body1" gutterBottom>
                <strong>Team Assignment:</strong> You will be removed from any team assignments
              </Typography>
            </li>
          </ul>
        </Box>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'error.soft', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="medium" color="error.main">
            Important Rules and Limitations
          </Typography>
          <Typography variant="body2">
            <ul>
              <li>You can only have one active resignation request at a time</li>
              <li>All clearance items must be completed before your final settlement</li>
              <li>Make sure to complete all assigned tasks and knowledge transfer during your notice period</li>
              <li>Attendance and leave policies continue to apply during your notice period</li>
            </ul>
          </Typography>
        </Box>
      </>
    )
  },

  // Clearance Process section
  "clearance-checklist": {
    title: "Clearance Process",
    lastUpdated: "April 14, 2025",
    content: (
      <>
        <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom>
          Clearance Process
        </Typography>

        <Typography variant="body1" paragraph>
          The clearance process is an essential part of the resignation workflow that ensures all company assets are returned,
          knowledge is transferred, and all administrative procedures are completed before an employee's departure.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Clearance Checklist Items
        </Typography>

        <Box sx={{ mb: 4 }}>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell><strong>Clearance Item</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Responsible Department</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>Company Assets</TableCell>
                  <TableCell>Return of all company property including laptop, mobile devices, ID card, access cards, etc.</TableCell>
                  <TableCell>IT / Administration</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Access Keys/Cards</TableCell>
                  <TableCell>Return of physical keys, security cards, and disabling of electronic access</TableCell>
                  <TableCell>Administration / Security</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Knowledge Transfer</TableCell>
                  <TableCell>Documentation and handover of current responsibilities, projects, and key information</TableCell>
                  <TableCell>Department Manager</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Exit Interview</TableCell>
                  <TableCell>Completion of formal exit interview with HR</TableCell>
                  <TableCell>Human Resources</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Project Handover</TableCell>
                  <TableCell>Formal transfer of all ongoing projects to designated colleagues</TableCell>
                  <TableCell>Department Manager</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>Final Settlement</TableCell>
                  <TableCell>Processing of final salary, benefits, and any outstanding payments</TableCell>
                  <TableCell>Finance / Payroll</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Clearance Process Flow
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'primary.main' }}>
                <Typography variant="h6" gutterBottom>Phase 1: Initiation</Typography>
                <Typography variant="body2" paragraph color="text.secondary">
                  Begins immediately after resignation approval:
                </Typography>
                <ol>
                  <li>
                    <Typography variant="body2" gutterBottom color="text.secondary">
                      HR initiates clearance process in system
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom color="text.secondary">
                      Employee receives clearance checklist notification
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom color="text.secondary">
                      Department managers are notified
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom color="text.secondary">
                      Initial clearance tasks are assigned
                    </Typography>
                  </li>
                </ol>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'primary.main' }}>
                <Typography variant="h6" gutterBottom>Phase 2: Execution</Typography>
                <Typography variant="body2" paragraph color="text.secondary">
                  Occurs during the notice period:
                </Typography>
                <ol>
                  <li>
                    <Typography variant="body2" gutterBottom color="text.secondary">
                      Employee completes assigned clearance tasks
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom color="text.secondary">
                      Managers verify task completion
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom color="text.secondary">
                      HR tracks overall clearance progress
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom color="text.secondary">
                      Exit interview is scheduled and conducted
                    </Typography>
                  </li>
                </ol>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'primary.main' }}>
                <Typography variant="h6" gutterBottom>Phase 3: Completion</Typography>
                <Typography variant="body2" paragraph color="text.secondary">
                  Finalized on or after last working day:
                </Typography>
                <ol>
                  <li>
                    <Typography variant="body2" gutterBottom color="text.secondary">
                      All clearance items verified as complete
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom color="text.secondary">
                      Final settlement processing initiated
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom color="text.secondary">
                      System access deactivation scheduled
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom color="text.secondary">
                      Clearance process marked as complete
                    </Typography>
                  </li>
                </ol>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          For Administrators
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Managing the Clearance Process
            </Typography>
            <ol>
              <li>
                <Typography variant="body2" gutterBottom>
                  <strong>Access the resignation detail page</strong> from the Admin Dashboard
                </Typography>
              </li>
              <li>
                <Typography variant="body2" gutterBottom>
                  <strong>Click "Update Clearance Items"</strong> to view and manage the checklist
                </Typography>
              </li>
              <li>
                <Typography variant="body2" gutterBottom>
                  <strong>For each clearance item:</strong>
                  <ul>
                    <li>Check the box when the item is completed</li>
                    <li>Add any relevant notes about completion</li>
                    <li>Record the completion date</li>
                  </ul>
                </Typography>
              </li>
              <li>
                <Typography variant="body2" gutterBottom>
                  <strong>Save changes</strong> to update the clearance status
                </Typography>
              </li>
              <li>
                <Typography variant="body2" gutterBottom>
                  <strong>Ensure all items are completed</strong> before finalizing the resignation process
                </Typography>
              </li>
            </ol>

            <Divider sx={{ my: 2 }} />

            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Important Administrative Guidelines:
            </Typography>
            <ul>
              <li>
                <Typography variant="body2" gutterBottom>
                  Always verify clearance item completion by checking with respective departments
                </Typography>
              </li>
              <li>
                <Typography variant="body2" gutterBottom>
                  Document any exceptions or special arrangements in the notes section
                </Typography>
              </li>
              <li>
                <Typography variant="body2" gutterBottom>
                  Ensure the exit interview is conducted and feedback is recorded
                </Typography>
              </li>
              <li>
                <Typography variant="body2" gutterBottom>
                  Final settlement should only be processed after all clearance items are completed
                </Typography>
              </li>
            </ul>
          </Paper>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          For Employees
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Paper sx={{ p: 3, borderLeft: 4, borderColor: 'warning.main' }}>
            <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
              Your Responsibilities During Clearance
            </Typography>
            <ul>
              <li>
                <Typography variant="body2" gutterBottom>
                  <strong>Monitor your clearance checklist</strong> through your resignation status page
                </Typography>
              </li>
              <li>
                <Typography variant="body2" gutterBottom>
                  <strong>Complete each assigned task</strong> in a timely manner
                </Typography>
              </li>
              <li>
                <Typography variant="body2" gutterBottom>
                  <strong>Document knowledge transfer</strong> thoroughly for your successor
                </Typography>
              </li>
              <li>
                <Typography variant="body2" gutterBottom>
                  <strong>Return all company assets</strong> in good condition
                </Typography>
              </li>
              <li>
                <Typography variant="body2" gutterBottom>
                  <strong>Attend the exit interview</strong> and provide constructive feedback
                </Typography>
              </li>
              <li>
                <Typography variant="body2" gutterBottom>
                  <strong>Follow up with HR</strong> if any clearance items remain pending close to your last working day
                </Typography>
              </li>
            </ul>
          </Paper>
        </Box>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.soft', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="medium">
            Best Practices for a Smooth Clearance Process
          </Typography>
          <Typography variant="body2">
            <ul>
              <li>Start the clearance process as early as possible during your notice period</li>
              <li>Create comprehensive documentation for knowledge transfer</li>
              <li>Maintain a professional attitude throughout the resignation process</li>
              <li>Address any pending issues before your last working day</li>
              <li>Keep copies of your clearance documentation for your records</li>
            </ul>
          </Typography>
        </Box>
      </>
    )
  },

  // Document Management
  "document-overview": {
    title: "Document Management Module Overview",
    lastUpdated: "April 15, 2025",
    content: (
      <>
        <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom>
          Document Management Module Overview
        </Typography>

        <Typography variant="body1" paragraph>
          The Document Module provides a centralized repository for storing, managing, and accessing important documents
          across the organization. It allows for secure document sharing, categorization, and access control based on user roles.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Key Features
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <Paper sx={{ p: 3, height: '100%', boxShadow: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      mr: 2
                    }}
                  >
                    <Folder />
                  </Avatar>
                  <Typography variant="h6">Secure Storage</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Documents are securely stored in Firebase Storage with controlled access and encrypted transmission.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Paper sx={{ p: 3, height: '100%', boxShadow: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      mr: 2
                    }}
                  >
                    <CategoryIcon />
                  </Avatar>
                  <Typography variant="h6">Categorization</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Documents are organized into logical categories and subcategories for easy navigation and retrieval.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Paper sx={{ p: 3, height: '100%', boxShadow: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      mr: 2
                    }}
                  >
                    <LockIcon />
                  </Avatar>
                  <Typography variant="h6">Access Control</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Documents can be assigned to specific users or marked as globally available, ensuring proper information access.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Paper sx={{ p: 3, height: '100%', boxShadow: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      mr: 2
                    }}
                  >
                    <SearchIcon />
                  </Avatar>
                  <Typography variant="h6">Search Functionality</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Powerful search capabilities allow users to quickly find documents by title, category, or content.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Paper sx={{ p: 3, height: '100%', boxShadow: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      mr: 2
                    }}
                  >
                    <Notifications />
                  </Avatar>
                  <Typography variant="h6">Notifications</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Users receive notifications when new documents are uploaded or when existing documents are updated.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Paper sx={{ p: 3, height: '100%', boxShadow: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      mr: 2
                    }}
                  >
                    <Download />
                  </Avatar>
                  <Typography variant="h6">Easy Downloads</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Simple one-click downloads for authorized users with secure, time-limited download links.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          User Access by Role
        </Typography>

        <Box sx={{ mb: 4 }}>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell><strong>User Role</strong></TableCell>
                  <TableCell><strong>Access Level</strong></TableCell>
                  <TableCell><strong>Capabilities</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AdminIcon color="error" sx={{ mr: 1 }} />
                      <Typography>Administrator</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>Full access</TableCell>
                  <TableCell>
                    <ul>
                      <li>Upload new documents</li>
                      <li>Assign documents to users</li>
                      <li>Update existing documents</li>
                      <li>Delete documents</li>
                      <li>Set global availability</li>
                      <li>View all documents</li>
                    </ul>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <ManagerIcon color="warning" sx={{ mr: 1 }} />
                      <Typography>Manager</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>Limited access</TableCell>
                  <TableCell>
                    <ul>
                      <li>View assigned documents</li>
                      <li>View global documents</li>
                      <li>Download documents</li>
                      <li>Cannot upload or modify documents</li>
                    </ul>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <EmployeeIcon color="info" sx={{ mr: 1 }} />
                      <Typography>Employee</Typography>
                    </Box>
                  </TableCell>
                  <TableCell>Basic access</TableCell>
                  <TableCell>
                    <ul>
                      <li>View assigned documents</li>
                      <li>View global documents</li>
                      <li>Download documents</li>
                      <li>Cannot upload or modify documents</li>
                    </ul>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Document Center Interface
        </Typography>

        <Typography variant="body1" paragraph>
          The Document Center is organized into tabs that help users navigate different document types:
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 2, borderLeft: 5, borderColor: 'primary.main' }}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Personal Documents
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Documents assigned specifically to you, such as appointment letters, salary slips, and personal certificates.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 2, borderLeft: 5, borderColor: 'primary.main' }}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Company Policies
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Organization-wide policies, procedures, guidelines, and employee handbooks.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 2, borderLeft: 5, borderColor: 'primary.main' }}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Form 16
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tax-related documents and annual tax statements for your reference and financial planning.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 2, borderLeft: 5, borderColor: 'primary.main' }}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Forms
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Standard forms used in the organization for various processes and requests.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Paper sx={{ p: 2, borderLeft: 5, borderColor: 'primary.main' }}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  PaySlips
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Links to your monthly salary slips for easy access and reference.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'warning.soft', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="medium" color="warning.main">
            Document Security Notice
          </Typography>
          <Typography variant="body2">
            All documents are securely stored and transmitted. However, users should follow these security practices:
            <ul>
              <li>Do not share your login credentials with others</li>
              <li>Log out when accessing the system from shared computers</li>
              <li>Do not download sensitive documents to public or shared devices</li>
              <li>Report any suspicious document access or anomalies to IT security</li>
            </ul>
          </Typography>
        </Box>
      </>
    )
  },

  // Document Categories
  "document-categories": {
    title: "Document Categories",
    lastUpdated: "April 15, 2025",
    content: (
      <>
        <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom>
          Document Categories
        </Typography>

        <Typography variant="body1" paragraph>
          TeamSync organizes documents into specific categories to help users easily locate and manage their files.
          Each category serves a particular purpose and contains relevant document types.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Primary Document Categories
        </Typography>

        <Box sx={{ mb: 5 }}>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell><strong>Category</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Example Documents</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Typography fontWeight="medium">Address</Typography>
                  </TableCell>
                  <TableCell>
                    Proof of residence documents and address verification
                  </TableCell>
                  <TableCell>
                    <Chip label="Rental agreements" size="small" sx={{ m: 0.5 }} />
                    <Chip label="Utility bills" size="small" sx={{ m: 0.5 }} />
                    <Chip label="Address proof" size="small" sx={{ m: 0.5 }} />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography fontWeight="medium">Qualification</Typography>
                  </TableCell>
                  <TableCell>
                    Educational certificates and qualifications
                  </TableCell>
                  <TableCell>
                    <Chip label="Degree certificates" size="small" sx={{ m: 0.5 }} />
                    <Chip label="Training completions" size="small" sx={{ m: 0.5 }} />
                    <Chip label="Course certifications" size="small" sx={{ m: 0.5 }} />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography fontWeight="medium">Previous Employment</Typography>
                  </TableCell>
                  <TableCell>
                    Documents from prior jobs and employment history
                  </TableCell>
                  <TableCell>
                    <Chip label="Experience letters" size="small" sx={{ m: 0.5 }} />
                    <Chip label="Relieving letters" size="small" sx={{ m: 0.5 }} />
                    <Chip label="Reference documents" size="small" sx={{ m: 0.5 }} />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography fontWeight="medium">Accounts & Statutory</Typography>
                  </TableCell>
                  <TableCell>
                    Financial and legal documents required for compliance
                  </TableCell>
                  <TableCell>
                    <Chip label="Bank documents" size="small" sx={{ m: 0.5 }} />
                    <Chip label="Tax forms" size="small" sx={{ m: 0.5 }} />
                    <Chip label="PAN/Aadhaar" size="small" sx={{ m: 0.5 }} />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography fontWeight="medium">Company Policies</Typography>
                  </TableCell>
                  <TableCell>
                    Organizational guidelines and procedures
                  </TableCell>
                  <TableCell>
                    <Chip label="HR policies" size="small" sx={{ m: 0.5 }} />
                    <Chip label="Code of conduct" size="small" sx={{ m: 0.5 }} />
                    <Chip label="Employee handbook" size="small" sx={{ m: 0.5 }} />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography fontWeight="medium">Form 16</Typography>
                  </TableCell>
                  <TableCell>
                    Tax-related documents and statements
                  </TableCell>
                  <TableCell>
                    <Chip label="Annual tax statements" size="small" sx={{ m: 0.5 }} />
                    <Chip label="TDS certificates" size="small" sx={{ m: 0.5 }} />
                    <Chip label="Investment proofs" size="small" sx={{ m: 0.5 }} />
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Typography fontWeight="medium">Forms</Typography>
                  </TableCell>
                  <TableCell>
                    Standard organizational forms and templates
                  </TableCell>
                  <TableCell>
                    <Chip label="Leave application templates" size="small" sx={{ m: 0.5 }} />
                    <Chip label="Reimbursement forms" size="small" sx={{ m: 0.5 }} />
                    <Chip label="Request templates" size="small" sx={{ m: 0.5 }} />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Document Access Control
        </Typography>

        <Typography variant="body1" paragraph>
          Documents are assigned access levels to ensure information is available only to appropriate users:
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', borderLeft: 4, borderColor: 'primary.main' }}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  User-Specific Documents
                </Typography>
                <Typography variant="body2" paragraph color="text.secondary">
                  Documents assigned to individual users only:
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body2" gutterBottom color="text.secondary">
                      <strong>Personal Records:</strong> Documents specific to an individual employee
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom color="text.secondary">
                      <strong>Confidential Information:</strong> Sensitive data like salary details or performance reviews
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom color="text.secondary">
                      <strong>Individual Correspondence:</strong> Personal communications and notices
                    </Typography>
                  </li>
                </ul>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 3, height: '100%', borderLeft: 4, borderColor: 'success.main' }}>
                <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                  Global Documents
                </Typography>
                <Typography variant="body2" paragraph color="text.secondary">
                  Documents available to all users within the organization:
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body2" gutterBottom color="text.secondary">
                      <strong>Company Policies:</strong> HR policies, code of conduct, employee handbook
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom color="text.secondary">
                      <strong>Organizational Communications:</strong> Company announcements, newsletters
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom color="text.secondary">
                      <strong>Standard Forms:</strong> Leave application templates, reimbursement forms
                    </Typography>
                  </li>
                </ul>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Supported File Types
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'error.light', mb: 1 }}>PDF</Avatar>
                  <Typography variant="body2">PDF Files</Typography>
                  <Typography variant="caption" color="text.secondary">.pdf</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'primary.light', mb: 1 }}>DOC</Avatar>
                  <Typography variant="body2">Word Documents</Typography>
                  <Typography variant="caption" color="text.secondary">.doc, .docx</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'success.light', mb: 1 }}>XLS</Avatar>
                  <Typography variant="body2">Excel Files</Typography>
                  <Typography variant="caption" color="text.secondary">.xls, .xlsx</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'warning.light', mb: 1 }}>IMG</Avatar>
                  <Typography variant="body2">Image Files</Typography>
                  <Typography variant="caption" color="text.secondary">.jpg, .png, .gif</Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <Avatar sx={{ bgcolor: 'info.light', mb: 1 }}>TXT</Avatar>
                  <Typography variant="body2">Text Files</Typography>
                  <Typography variant="caption" color="text.secondary">.txt</Typography>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'info.soft', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="medium" color="info.main">
            Document Size Limits
          </Typography>
          <Typography variant="body2">
            Individual document uploads are limited to 5MB per file to ensure optimal system performance.
            For larger files, consider compressing the document or breaking it into smaller, logical sections.
          </Typography>
        </Box>
      </>
    )
  },

  // Ticket System - Module Overview
  "ticket-overview": {
    title: "Ticket System Overview",
    lastUpdated: "April 16, 2025",
    content: (
      <>
        <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom>
          Ticket System Overview
        </Typography>

        <Typography variant="body1" paragraph>
          The Ticket Module allows employees and managers to submit support tickets for various issues they encounter,
          and provides administrators with tools to manage and resolve these tickets efficiently. This centralized
          system ensures that all support requests are properly tracked, assigned, and resolved.
        </Typography>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Key Features
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6} lg={4}>
              <Paper sx={{ p: 3, height: '100%', boxShadow: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      mr: 2
                    }}
                  >
                    <CategoryIcon />
                  </Avatar>
                  <Typography variant="h6">Categorized Tickets</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Tickets are categorized by type (IT, HR, Payroll, Facility, etc.) for proper routing and prioritization.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Paper sx={{ p: 3, height: '100%', boxShadow: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      mr: 2
                    }}
                  >
                    <AssignmentIcon />
                  </Avatar>
                  <Typography variant="h6">Priority Levels</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Multiple priority levels (Low, Medium, High, Critical) help sort and address the most urgent issues first.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Paper sx={{ p: 3, height: '100%', boxShadow: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      mr: 2
                    }}
                  >
                    <ForumIcon />
                  </Avatar>
                  <Typography variant="h6">Two-way Communication</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Ongoing communication between users and support staff through ticket responses and updates.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Paper sx={{ p: 3, height: '100%', boxShadow: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      mr: 2
                    }}
                  >
                    <AttachFileIcon />
                  </Avatar>
                  <Typography variant="h6">File Attachments</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Support for file attachments allows users to include screenshots, documents, or other relevant files.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Paper sx={{ p: 3, height: '100%', boxShadow: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      mr: 2
                    }}
                  >
                    <AssignmentIndIcon />
                  </Avatar>
                  <Typography variant="h6">Ticket Assignment</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Administrators can assign tickets to specific team members for resolution based on expertise.
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6} lg={4}>
              <Paper sx={{ p: 3, height: '100%', boxShadow: 2, borderRadius: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar
                    sx={{
                      bgcolor: 'primary.main',
                      color: 'white',
                      mr: 2
                    }}
                  >
                    <Assessment />
                  </Avatar>
                  <Typography variant="h6">Status Tracking</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Comprehensive status tracking from ticket creation to resolution with clear status indicators.
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Ticket Workflow
        </Typography>

        <Box sx={{ mb: 5 }}>
          <Paper sx={{ p: 0, overflow: 'hidden', borderRadius: 2 }}>
            <Grid container>
              <Grid item xs={12} md={3} sx={{ bgcolor: 'primary.main', color: 'white', p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="medium">
                  Creation
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body2" gutterBottom sx={{ color: 'white' }}>
                      User submits a new ticket
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom sx={{ color: 'white' }}>
                      Fills in ticket details and priority
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom sx={{ color: 'white' }}>
                      Adds attachments if needed
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom sx={{ color: 'white' }}>
                      Ticket status set to "Open"
                    </Typography>
                  </li>
                </ul>
              </Grid>
              <Grid item xs={12} md={3} sx={{ bgcolor: 'primary.dark', color: 'white', p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="medium">
                  Assignment
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body2" gutterBottom sx={{ color: 'white' }}>
                      Admin reviews the ticket
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom sx={{ color: 'white' }}>
                      Assigns to appropriate support staff
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom sx={{ color: 'white' }}>
                      Updates priority if needed
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom sx={{ color: 'white' }}>
                      Status changes to "In Progress"
                    </Typography>
                  </li>
                </ul>
              </Grid>
              <Grid item xs={12} md={3} sx={{ bgcolor: 'secondary.main', color: 'white', p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="medium">
                  Resolution
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body2" gutterBottom sx={{ color: 'white' }}>
                      Support staff works on the issue
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom sx={{ color: 'white' }}>
                      Communicates with user as needed
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom sx={{ color: 'white' }}>
                      Implements solution
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom sx={{ color: 'white' }}>
                      Status changes to "Resolved"
                    </Typography>
                  </li>
                </ul>
              </Grid>
              <Grid item xs={12} md={3} sx={{ bgcolor: 'success.main', color: 'white', p: 3 }}>
                <Typography variant="h6" gutterBottom fontWeight="medium">
                  Closure
                </Typography>
                <ul>
                  <li>
                    <Typography variant="body2" gutterBottom sx={{ color: 'white' }}>
                      User confirms issue is resolved
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom sx={{ color: 'white' }}>
                      Ticket status set to "Closed"
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom sx={{ color: 'white' }}>
                      Ticket stored for future reference
                    </Typography>
                  </li>
                  <li>
                    <Typography variant="body2" gutterBottom sx={{ color: 'white' }}>
                      Can be reopened if issue recurs
                    </Typography>
                  </li>
                </ul>
              </Grid>
            </Grid>
          </Paper>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Ticket Statuses Explained
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={2}>
            <Grid item xs={6} md={2.4}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderTop: 5,
                  borderColor: 'info.main',
                  height: '100%'
                }}
              >
                <Typography variant="h6" color="info.main">Open</Typography>
                <Typography variant="body2" color="text.secondary">
                  Newly submitted and awaiting review
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={2.4}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderTop: 5,
                  borderColor: 'warning.main',
                  height: '100%'
                }}
              >
                <Typography variant="h6" color="warning.main">In Progress</Typography>
                <Typography variant="body2" color="text.secondary">
                  Being actively worked on
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={2.4}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderTop: 5,
                  borderColor: 'success.main',
                  height: '100%'
                }}
              >
                <Typography variant="h6" color="success.main">Resolved</Typography>
                <Typography variant="body2" color="text.secondary">
                  Solution implemented, awaiting confirmation
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={2.4}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderTop: 5,
                  borderColor: 'grey.500',
                  height: '100%'
                }}
              >
                <Typography variant="h6" color="text.secondary">Closed</Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed and confirmed by user
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6} md={2.4}>
              <Paper
                sx={{
                  p: 2,
                  textAlign: 'center',
                  borderTop: 5,
                  borderColor: 'error.main',
                  height: '100%'
                }}
              >
                <Typography variant="h6" color="error.main">Reopened</Typography>
                <Typography variant="body2" color="text.secondary">
                  Previously closed but issue recurred
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          Ticket Priority Levels
        </Typography>

        <Box sx={{ mb: 4 }}>
          <TableContainer component={Paper} variant="outlined">
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: 'background.default' }}>
                  <TableCell><strong>Priority</strong></TableCell>
                  <TableCell><strong>Description</strong></TableCell>
                  <TableCell><strong>Response Time</strong></TableCell>
                  <TableCell><strong>Example Issues</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip label="Low" color="success" size="small" sx={{ mr: 1 }} />
                    </Box>
                  </TableCell>
                  <TableCell>Minor issues that don't impact work</TableCell>
                  <TableCell>Within 48 hours</TableCell>
                  <TableCell>General inquiries, minor UI issues, documentation requests</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip label="Medium" color="info" size="small" sx={{ mr: 1 }} />
                    </Box>
                  </TableCell>
                  <TableCell>Standard issues needing attention</TableCell>
                  <TableCell>Within 24 hours</TableCell>
                  <TableCell>Access problems, minor system errors, configuration changes</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip label="High" color="warning" size="small" sx={{ mr: 1 }} />
                    </Box>
                  </TableCell>
                  <TableCell>Urgent issues affecting work</TableCell>
                  <TableCell>Within 4-8 hours</TableCell>
                  <TableCell>Major system errors, data issues, critical function failures</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Chip label="Critical" color="error" size="small" sx={{ mr: 1 }} />
                    </Box>
                  </TableCell>
                  <TableCell>Severe issues requiring immediate attention</TableCell>
                  <TableCell>Within 1-2 hours</TableCell>
                  <TableCell>System outages, security breaches, complete loss of functionality</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
          User Roles and Permissions
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'error.main' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AdminIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="h6">Administrator</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  <ul>
                    <li>View all tickets in the system</li>
                    <li>Assign tickets to support staff</li>
                    <li>Update ticket status and priority</li>
                    <li>Delete tickets (with caution)</li>
                    <li>Generate ticket statistics and reports</li>
                    <li>Respond to any ticket</li>
                  </ul>
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'warning.main' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <ManagerIcon color="warning" sx={{ mr: 1 }} />
                  <Typography variant="h6">Manager</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  <ul>
                    <li>Create and submit tickets</li>
                    <li>View only their own tickets</li>
                    <li>Respond to their ticket threads</li>
                    <li>Attach files to tickets (up to 5 per ticket)</li>
                    <li>Mark resolved tickets as closed</li>
                    <li>Reopen tickets if issues recur</li>
                  </ul>
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'info.main' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <EmployeeIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="h6">Employee</Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  <ul>
                    <li>Create and submit tickets</li>
                    <li>View only their own tickets</li>
                    <li>Respond to their ticket threads</li>
                    <li>Attach files to tickets (up to 5 per ticket)</li>
                    <li>Mark resolved tickets as closed</li>
                    <li>Reopen tickets if issues recur</li>
                  </ul>
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </Box>

        <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.soft', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="medium">
            Best Practices for Ticket Creation
          </Typography>
          <Typography variant="body2">
            <ul>
              <li>Be specific and detailed in your ticket description</li>
              <li>Include steps to reproduce the issue if applicable</li>
              <li>Attach screenshots or relevant files to aid in troubleshooting</li>
              <li>Set appropriate priority based on the impact of the issue</li>
              <li>Check existing solutions before submitting a new ticket</li>
              <li>Respond promptly to requests for additional information</li>
            </ul>
          </Typography>
        </Box>
      </>
    )
  },
// System section
"system-requirements": {
  title: "System Requirements",
  lastUpdated: "April 17, 2025",
  content: (
    <>
      <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom>
        System Requirements
      </Typography>

      <Typography variant="body1" paragraph>
        TeamSync is a web-based application that works across devices and platforms. Here are the minimum 
        requirements to access and use the system effectively.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Web Browser Requirements
      </Typography>

      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell><strong>Browser</strong></TableCell>
              <TableCell><strong>Minimum Version</strong></TableCell>
              <TableCell><strong>Recommended Version</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Google Chrome</TableCell>
              <TableCell>100+</TableCell>
              <TableCell>Latest version</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Mozilla Firefox</TableCell>
              <TableCell>100+</TableCell>
              <TableCell>Latest version</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Microsoft Edge</TableCell>
              <TableCell>100+</TableCell>
              <TableCell>Latest version</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Safari</TableCell>
              <TableCell>15+</TableCell>
              <TableCell>Latest version</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Device Requirements
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'primary.main' }}>
              <Typography variant="h6" gutterBottom>Desktop/Laptop</Typography>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>Operating System:</strong> Windows 10+, macOS 10.15+, Linux (modern distributions)
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>RAM:</strong> 4GB minimum (8GB recommended)
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>Screen Resolution:</strong> 1366x768 or higher
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>Internet Connection:</strong> 1 Mbps or faster
                  </Typography>
                </li>
              </ul>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'primary.main' }}>
              <Typography variant="h6" gutterBottom>Mobile Devices</Typography>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>Operating System:</strong> iOS 15+ or Android 10+
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>Screen Size:</strong> 5.5" or larger recommended
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>RAM:</strong> 2GB minimum
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>Internet Connection:</strong> 3G/4G/5G or WiFi
                  </Typography>
                </li>
              </ul>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'primary.main' }}>
              <Typography variant="h6" gutterBottom>Tablets</Typography>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>Operating System:</strong> iPadOS 15+, Android 10+
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>Screen Size:</strong> 7" or larger
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>RAM:</strong> 2GB minimum
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>Internet Connection:</strong> 3G/4G/5G or WiFi
                  </Typography>
                </li>
              </ul>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Network Requirements
      </Typography>

      <Box sx={{ mb: 4 }}>
        <ul>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Internet Connection:</strong> Reliable internet connection of at least 1 Mbps
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Firewall Configuration:</strong> Ensure your network allows access to the following domains:
              <ul>
                <li>Main application domain (teamsync.yourdomain.com)</li>
                <li>*.firebaseio.com (for document storage)</li>
                <li>*.googleapis.com (for various services)</li>
              </ul>
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Ports:</strong> Standard HTTPS port (443) should be open
            </Typography>
          </li>
        </ul>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Geolocation Requirements
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, borderLeft: 4, borderColor: 'warning.main' }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Location Services
          </Typography>
          <Typography variant="body2" paragraph>
            TeamSync uses geolocation for attendance verification for onsite employees. For this feature to work properly:
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" gutterBottom>
                Location services must be enabled on your device
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                You must grant location permissions to the browser
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                GPS functionality should be working on your device
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                For best accuracy, enable "high accuracy" mode in your device's location settings
              </Typography>
            </li>
          </ul>
        </Paper>
      </Box>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'error.soft', borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium" color="error.main">
          Important Note
        </Typography>
        <Typography variant="body2">
          TeamSync requires cookies to be enabled for authentication and session management. Please ensure that your browser allows cookies from the TeamSync domain.
        </Typography>
      </Box>
    </>
  )
},

"navigation": {
  title: "Navigating the Interface",
  lastUpdated: "April 17, 2025",
  content: (
    <>
      <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom>
        Navigating the Interface
      </Typography>

      <Typography variant="body1" paragraph>
        TeamSync features an intuitive, user-friendly interface designed to make navigation simple across all user roles. 
        This guide will help you understand the core navigation elements and how to efficiently move around the system.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Main Interface Components
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            1. Top Navigation Bar
          </Typography>
          <Typography variant="body2" paragraph>
            Located at the top of every page, this bar contains:
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Application Logo:</strong> Click to return to your dashboard
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Menu Toggle:</strong> (Mobile only) Expands/collapses the sidebar menu
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Page Title:</strong> Displays the current page name
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Notification Bell:</strong> Shows unread notifications with a count badge
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>User Menu:</strong> Access your profile, settings, and logout options
              </Typography>
            </li>
          </ul>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            2. Sidebar Navigation
          </Typography>
          <Typography variant="body2" paragraph>
            The primary navigation panel on the left side of the screen:
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Main Modules:</strong> Dashboard, Attendance, Leave, etc.
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Visual Indicators:</strong> Active section is highlighted
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Collapsible:</strong> Automatically collapses on smaller screens
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Role-Based:</strong> Shows only modules relevant to your role
              </Typography>
            </li>
          </ul>
        </Paper>

        <Paper sx={{ p: 3, borderRadius: 2, mb: 3 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            3. Main Content Area
          </Typography>
          <Typography variant="body2" paragraph>
            The center section where primary content is displayed:
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Dashboard Cards:</strong> Summary statistics and quick links
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Data Tables:</strong> Lists and grids showing records
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Forms:</strong> Input fields for creating/editing records
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Detail Views:</strong> Comprehensive information about specific items
              </Typography>
            </li>
          </ul>
        </Paper>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Role-Based Navigation
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'error.main' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AdminIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Administrator Navigation</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Administrators have access to all modules including:
                <ul>
                  <li>Dashboard with organization-wide statistics</li>
                  <li>Department and Team management</li>
                  <li>User Profile management</li>
                  <li>Attendance approvals and reports</li>
                  <li>Leave policy management</li>
                  <li>Salary management</li>
                  <li>Holiday management</li>
                  <li>Document center</li>
                  <li>Ticket management</li>
                  <li>Resignation management</li>
                </ul>
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'warning.main' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ManagerIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Manager Navigation</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Managers have access to:
                <ul>
                  <li>Manager dashboard with team statistics</li>
                  <li>Team management</li>
                  <li>Team attendance approval</li>
                  <li>Leave applications</li>
                  <li>Document center (view only)</li>
                  <li>Ticket submission and tracking</li>
                  <li>Resignation submission</li>
                  <li>Personal profile and history</li>
                </ul>
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'info.main' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmployeeIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Employee Navigation</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Employees have access to:
                <ul>
                  <li>Employee dashboard</li>
                  <li>Attendance clock-in/out</li>
                  <li>Leave applications</li>
                  <li>Salary history</li>
                  <li>Document center (view only)</li>
                  <li>Ticket submission and tracking</li>
                  <li>Resignation submission</li>
                  <li>Personal profile</li>
                </ul>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Common Navigation Elements
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, mb: 3, borderLeft: 4, borderColor: 'primary.main' }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Action Buttons
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Button variant="contained" color="primary" sx={{ mb: 1 }}>Create/Add</Button>
                <Typography variant="caption" display="block">
                  Add new records
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Button variant="outlined" color="primary" sx={{ mb: 1 }}>View</Button>
                <Typography variant="caption" display="block">
                  View details
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Button variant="outlined" color="warning" sx={{ mb: 1 }}>Edit</Button>
                <Typography variant="caption" display="block">
                  Edit records
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} md={3}>
              <Box sx={{ textAlign: 'center', p: 1 }}>
                <Button variant="outlined" color="error" sx={{ mb: 1 }}>Delete</Button>
                <Typography variant="caption" display="block">
                  Remove records
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 3, mb: 3, borderLeft: 4, borderColor: 'primary.main' }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Data Table Controls
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box>
              <Typography variant="body2" gutterBottom>
                <strong>Search:</strong> Filter records by keywords
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" gutterBottom>
                <strong>Filter Chips:</strong> Quick filters for common categories
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" gutterBottom>
                <strong>Pagination:</strong> Navigate between pages of data
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" gutterBottom>
                <strong>Export Options:</strong> Download data in various formats
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Mobile Navigation
      </Typography>

      <Box sx={{ mb: 4 }}>
        <ul>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Responsive Design:</strong> The interface adapts automatically to screen size
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Hamburger Menu:</strong> Click the menu icon in the top-left to expand the sidebar
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Collapsible Sections:</strong> Tables and cards collapse for easier mobile viewing
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Touch Optimization:</strong> Larger touch targets for buttons and links
            </Typography>
          </li>
        </ul>
      </Box>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.soft', borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium">
          Navigation Tips
        </Typography>
        <Typography variant="body2">
          <ul>
            <li>Use the breadcrumbs at the top of pages to understand your current location and navigate backward</li>
            <li>Dashboard cards provide quick access to commonly used features</li>
            <li>Check the notification bell regularly for important updates</li>
            <li>Use the search function in data tables to quickly find specific records</li>
            <li>On mobile devices, use the browser's back button to navigate to previous screens</li>
          </ul>
        </Typography>
      </Box>
    </>
  )
},

"first-login": {
  title: "First Login and Setup",
  lastUpdated: "April 17, 2025",
  content: (
    <>
      <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom>
        First Login and Setup
      </Typography>

      <Typography variant="body1" paragraph>
        This guide walks you through the process of accessing TeamSync for the first time and setting up your account.
        Following these steps will ensure you're ready to use the system efficiently.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Initial Login Process
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    mr: 2
                  }}
                >
                  1
                </Avatar>
                <Typography variant="h6">Receive Credentials</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Your system administrator will provide you with initial login credentials:
                <ul>
                  <li>Login URL: The web address to access TeamSync</li>
                  <li>Username: Usually your company email address</li>
                  <li>Temporary Password: A one-time password for first login</li>
                </ul>
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    mr: 2
                  }}
                >
                  2
                </Avatar>
                <Typography variant="h6">Access Login Page</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <ol>
                  <li>Open a web browser (Chrome, Firefox, Edge, or Safari recommended)</li>
                  <li>Navigate to the TeamSync URL provided in your welcome email</li>
                  <li>Bookmark this page for easy access in the future</li>
                </ol>
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    mr: 2
                  }}
                >
                  3
                </Avatar>
                <Typography variant="h6">Enter Credentials</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <ol>
                  <li>Enter your email address in the Email field</li>
                  <li>Enter the temporary password provided to you</li>
                  <li>Click the "Login" button</li>
                </ol>
                If you enter incorrect credentials three times, you may be temporarily locked out. Contact your administrator if you're having trouble.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    mr: 2
                  }}
                >
                  4
                </Avatar>
                <Typography variant="h6">Change Password</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                On your first login, you'll be prompted to change your password:
                <ol>
                  <li>Enter the temporary password in the "Current Password" field</li>
                  <li>Create a new password following the security requirements</li>
                  <li>Confirm your new password</li>
                  <li>Click "Save Changes"</li>
                </ol>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Password Requirements
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, borderLeft: 4, borderColor: 'info.main' }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Security Guidelines
          </Typography>
          <Typography variant="body2" paragraph>
            Your password must meet the following requirements:
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" gutterBottom>
                Minimum 8 characters length
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                At least one uppercase letter (A-Z)
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                At least one lowercase letter (a-z)
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                At least one number (0-9)
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                At least one special character (!@#$%^&*)
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                Cannot be the same as your previous 3 passwords
              </Typography>
            </li>
          </ul>
        </Paper>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Initial Setup Steps
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', borderLeft: 4, borderColor: 'success.main' }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                1. Review Your Profile
              </Typography>
              <Typography variant="body2" paragraph>
                After your first login, you should:
              </Typography>
              <ol>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Access your profile by clicking on your name in the top right corner and selecting "Edit Profile"
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Review your personal information for accuracy (name, email, department, etc.)
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Note that some information can only be updated by administrators
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Contact your administrator if you notice any incorrect information
                  </Typography>
                </li>
              </ol>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', borderLeft: 4, borderColor: 'success.main' }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                2. Set Up Notification Preferences
              </Typography>
              <Typography variant="body2" paragraph>
                Customize how you receive system notifications:
              </Typography>
              <ol>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Click on your name in the top right corner
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Select "Notification Settings"
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Choose which notifications you want to receive via email versus in-app only
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Set your preferred notification frequency
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Save your changes
                  </Typography>
                </li>
              </ol>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Browser Permissions
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, bgcolor: 'warning.soft', borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="medium" color="warning.main" gutterBottom>
            Required Permissions
          </Typography>
          <Typography variant="body2" paragraph>
            TeamSync will request the following browser permissions:
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Location Access:</strong> Required for attendance verification through geofencing
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Notifications:</strong> Allows system to send you browser notifications
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Cookies:</strong> Required for authentication and session management
              </Typography>
            </li>
          </ul>
          <Typography variant="body2" paragraph sx={{ mt: 2 }}>
            When prompted, select "Allow" for these permissions for full system functionality.
          </Typography>
        </Paper>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Mobile Access Setup
      </Typography>

      <Box sx={{ mb: 4 }}>
        <ul>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Responsive Web App:</strong> TeamSync works as a responsive web application on mobile devices
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Add to Home Screen:</strong> For easy access, add the TeamSync webpage to your home screen
              <ul>
                <li>
                  <Typography variant="body2">
                    <strong>iOS:</strong> Open in Safari → Share icon → Add to Home Screen
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2">
                    <strong>Android:</strong> Open in Chrome → Menu (three dots) → Add to Home Screen
                  </Typography>
                </li>
              </ul>
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Allow Permissions:</strong> When prompted, allow permissions for location, notifications, and camera access
            </Typography>
          </li>
        </ul>
      </Box>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'error.soft', borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium" color="error.main">
          Important Security Notes
        </Typography>
        <Typography variant="body2">
          <ul>
            <li>Never share your password with anyone, including administrators</li>
            <li>Always log out when accessing TeamSync from shared or public devices</li>
            <li>Your session will automatically time out after 30 minutes of inactivity</li>
            <li>If you suspect unauthorized access to your account, change your password immediately and notify IT security</li>
          </ul>
        </Typography>
      </Box>
    </>
  )
},

// User Roles section
"admin-role": {
  title: "Administrator Role",
  lastUpdated: "April 17, 2025",
  content: (
    <>
      <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom>
        Administrator Role
      </Typography>

      <Typography variant="body1" paragraph>
        The Administrator role in TeamSync has comprehensive system access with the ability to manage all aspects of 
        the platform. This guide outlines the responsibilities, capabilities, and limitations of Administrators.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Administrator Responsibilities
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'primary.main' }}>
              <Typography variant="h6" gutterBottom>System Management</Typography>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Configure system settings
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Manage departments and teams
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Define organization structure
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Monitor system performance
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Respond to support tickets
                  </Typography>
                </li>
              </ul>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'primary.main' }}>
              <Typography variant="h6" gutterBottom>User Management</Typography>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Create and maintain user accounts
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Assign appropriate roles and permissions
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Manage employee and manager profiles
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Reset passwords when needed
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Deactivate accounts for departing employees
                  </Typography>
                </li>
              </ul>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'primary.main' }}>
              <Typography variant="h6" gutterBottom>Policy Administration</Typography>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Create and manage leave policies
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Define attendance rules
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Configure holidays and working days
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Set up notification rules
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Manage document categories and access
                  </Typography>
                </li>
              </ul>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Module-Specific Capabilities
      </Typography>

      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell><strong>Module</strong></TableCell>
              <TableCell><strong>Administrator Capabilities</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Department Management</TableCell>
              <TableCell>
                <ul>
                  <li>Create, edit, and delete departments</li>
                  <li>View department statistics and reports</li>
                  <li>Manage department structure</li>
                </ul>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>User Profile Management</TableCell>
              <TableCell>
                <ul>
                  <li>Create and edit user profiles</li>
                  <li>Assign users to departments and teams</li>
                  <li>Set salary information</li>
                  <li>Manage employment details</li>
                  <li>Activate/deactivate accounts</li>
                </ul>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Attendance Management</TableCell>
              <TableCell>
                <ul>
                  <li>View all attendance records</li>
                  <li>Approve or reject attendance</li>
                  <li>Generate attendance reports</li>
                  <li>Manually add or edit attendance records</li>
                  <li>Monitor real-time attendance</li>
                </ul>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Leave Management</TableCell>
              <TableCell>
                <ul>
                  <li>Create and assign leave policies</li>
                  <li>Approve or reject leave requests</li>
                  <li>Manage leave balances</li>
                  <li>Reset leave balances annually</li>
                  <li>View leave reports and statistics</li>
                </ul>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Salary Management</TableCell>
              <TableCell>
                <ul>
                  <li>Generate salary drafts</li>
                  <li>Review and edit salary records</li>
                  <li>Approve salaries</li>
                  <li>Mark salaries as paid</li>
                  <li>Generate payslips</li>
                </ul>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Team Management</TableCell>
              <TableCell>
                <ul>
                  <li>Create and configure teams</li>
                  <li>Assign managers to teams</li>
                  <li>Add or remove team members</li>
                  <li>Modify team structures</li>
                </ul>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Document Management</TableCell>
              <TableCell>
                <ul>
                  <li>Upload and categorize documents</li>
                  <li>Assign documents to specific users</li>
                  <li>Manage global documents</li>
                  <li>Delete or archive documents</li>
                </ul>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Ticket Management</TableCell>
              <TableCell>
                <ul>
                  <li>View all support tickets</li>
                  <li>Assign tickets to team members</li>
                  <li>Change ticket status and priority</li>
                  <li>Generate ticket reports</li>
                </ul>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Resignation Management</TableCell>
              <TableCell>
                <ul>
                  <li>Process resignation requests</li>
                  <li>Manage clearance checklists</li>
                  <li>Approve or reject resignations</li>
                  <li>Handle final settlements</li>
                </ul>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Admin Dashboard
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Dashboard Components
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Summary Statistics:</strong> Overview of employees, departments, attendance, and leave
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Recent Activity:</strong> Latest attendance records, leave requests, and tickets
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Pending Approvals:</strong> All items requiring administrator attention
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>System Health:</strong> Indicators of system performance and issues
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Quick Links:</strong> Direct access to frequently used functions
              </Typography>
            </li>
          </ul>
        </Paper>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Administrative Reports
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, borderLeft: 5, borderColor: 'primary.main' }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Attendance Reports
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Detailed attendance statistics by employee, department, or date range. Includes present/absent counts, leave statistics, and working hours analysis.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, borderLeft: 5, borderColor: 'primary.main' }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Leave Reports
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Leave utilization reports, leave balance summaries, and leave pattern analysis.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, borderLeft: 5, borderColor: 'primary.main' }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Salary Reports
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Department-wise salary expenditures, salary components breakdown, and payment status summaries.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, borderLeft: 5, borderColor: 'primary.main' }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Employee Reports
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Employee demographics, department distribution, and role-based reports.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, borderLeft: 5, borderColor: 'primary.main' }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Ticket Analytics
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Support ticket metrics, resolution times, and issue categorization statistics.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, borderLeft: 5, borderColor: 'primary.main' }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                System Logs
              </Typography>
              <Typography variant="body2" color="text.secondary">
                User activity logs, login history, and system event records.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Administrator Best Practices
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, borderLeft: 4, borderColor: 'warning.main' }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Security Guidelines
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" gutterBottom>
                Use strong, unique passwords for administrator accounts
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                Change administrator passwords regularly (recommended every 90 days)
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                Always log out when stepping away from your device
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                Avoid accessing administration features from public networks
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                Regularly review access logs for unusual activity
              </Typography>
            </li>
          </ul>
        </Paper>
      </Box>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, borderLeft: 4, borderColor: 'info.main' }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Data Management Practices
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" gutterBottom>
                Regularly archive old records to maintain system performance
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                Review and clean up document storage periodically
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                Implement a clear naming convention for departments, teams, and policies
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                Document all system configurations and changes
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                Maintain consistent data entry standards
              </Typography>
            </li>
          </ul>
        </Paper>
      </Box>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'error.soft', borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium" color="error.main">
          Important Cautions
        </Typography>
        <Typography variant="body2">
          <ul>
            <li>Deleting departments will automatically delete all associated employees, leave records, and salary records</li>
            <li>Salary information changes directly impact payroll processing</li>
            <li>User deactivation prevents login but preserves all historical data</li>
            <li>Leave policy changes affect all users assigned to that policy</li>
            <li>System-wide notification broadcasts should be used sparingly to avoid alert fatigue</li>
          </ul>
        </Typography>
      </Box>
    </>
  )
},

"manager-role": {
  title: "Manager Role",
  lastUpdated: "April 17, 2025",
  content: (
    <>
      <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom>
        Manager Role
      </Typography>

      <Typography variant="body1" paragraph>
        The Manager role in TeamSync provides team management capabilities including creating teams, managing team members, 
        and approving attendance and leave requests. This guide outlines the responsibilities, capabilities, and 
        limitations of Managers in the system.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Manager Responsibilities
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'warning.main' }}>
              <Typography variant="h6" gutterBottom>Team Management</Typography>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Create and configure teams
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Add or remove team members
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Monitor team performance
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Coordinate team activities
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Review team analytics
                  </Typography>
                </li>
              </ul>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'warning.main' }}>
              <Typography variant="h6" gutterBottom>Attendance Oversight</Typography>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Approve team members' attendance
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Review attendance patterns
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Monitor work hours and productivity
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Ensure attendance policy compliance
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Address attendance issues
                  </Typography>
                </li>
              </ul>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'warning.main' }}>
              <Typography variant="h6" gutterBottom>Team Member Support</Typography>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Review and approve leave requests
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Address team member concerns
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Provide performance feedback
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Coordinate resource allocation
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Facilitate team communications
                  </Typography>
                </li>
              </ul>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Module-Specific Capabilities
      </Typography>

      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell><strong>Module</strong></TableCell>
              <TableCell><strong>Manager Capabilities</strong></TableCell>
              <TableCell><strong>Limitations</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Team Management</TableCell>
              <TableCell>
                <ul>
                  <li>Create new teams in their department</li>
                  <li>Add/remove team members from their department</li>
                  <li>View team performance metrics</li>
                  <li>Edit team details and descriptions</li>
                </ul>
              </TableCell>
              <TableCell>
                <ul>
                  <li>Can only manage teams in their department</li>
                  <li>Cannot add employees already in other teams</li>
                  <li>Cannot delete teams (admin only)</li>
                </ul>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Attendance Management</TableCell>
              <TableCell>
                <ul>
                  <li>Approve attendance for team members</li>
                  <li>View team attendance reports</li>
                  <li>Monitor real-time attendance status</li>
                  <li>View attendance history for team members</li>
                </ul>
              </TableCell>
              <TableCell>
                <ul>
                  <li>Cannot approve attendance for non-team members</li>
                  <li>Cannot modify approved attendance records</li>
                  <li>Cannot manually create attendance records</li>
                </ul>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Leave Management</TableCell>
              <TableCell>
                <ul>
                  <li>View leave requests from team members</li>
                  <li>Provide recommendations on leave approval</li>
                  <li>Monitor team leave balances</li>
                  <li>Plan team coverage during leaves</li>
                </ul>
              </TableCell>
              <TableCell>
                <ul>
                  <li>Cannot modify leave policies</li>
                  <li>Cannot adjust leave balances</li>
                  <li>Final leave approval comes from admin</li>
                </ul>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Document Center</TableCell>
              <TableCell>
                <ul>
                  <li>View assigned documents</li>
                  <li>View global documents</li>
                  <li>Download documents</li>
                </ul>
              </TableCell>
              <TableCell>
                <ul>
                  <li>Cannot upload new documents</li>
                  <li>Cannot modify document permissions</li>
                  <li>Cannot delete documents</li>
                </ul>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Ticket System</TableCell>
              <TableCell>
                <ul>
                  <li>Create and submit support tickets</li>
                  <li>Track status of submitted tickets</li>
                  <li>Respond to ticket threads</li>
                </ul>
              </TableCell>
              <TableCell>
                <ul>
                  <li>Cannot view other users' tickets</li>
                  <li>Cannot change ticket status (admin only)</li>
                  <li>Cannot assign tickets to support staff</li>
                </ul>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Manager Dashboard
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Dashboard Components
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Team Performance:</strong> Overview of team attendance, leave patterns, and productivity
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Pending Approvals:</strong> Attendance records and leave requests awaiting approval
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Team Calendar:</strong> View of team schedules and availability
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Recent Activity:</strong> Latest attendance and leave actions by team members
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Quick Links:</strong> Direct access to frequently used management functions
              </Typography>
            </li>
          </ul>
        </Paper>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Attendance Approval Workflow
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, borderLeft: 4, borderColor: 'warning.main' }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Approval Process
          </Typography>
          <ol>
            <li>
              <Typography variant="body2" gutterBottom>
                Navigate to <strong>Manager Dashboard → Attendance Approval</strong>
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                Select the date using the date picker
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                Review attendance records grouped by team
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                For each attendance record:
                <ul>
                  <li>Click the task icon to view details</li>
                  <li>Review clock-in/out times</li>
                  <li>Check tasks completed</li>
                  <li>Verify location data</li>
                  <li>Click the checkmark to approve</li>
                  <li>Click the X to reject with comment</li>
                </ul>
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                Manager approval is required before admin approval
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                Approved attendance affects salary calculation
              </Typography>
            </li>
          </ol>
        </Paper>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Team Creation Process
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, borderLeft: 4, borderColor: 'warning.main' }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Creating a New Team
          </Typography>
          <ol>
            <li>
              <Typography variant="body2" gutterBottom>
                Navigate to <strong>Manager Dashboard → Team → Create Team</strong>
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                Enter team details:
                <ul>
                  <li>Team Name: Choose a clear, descriptive name</li>
                  <li>Description: Provide information about the team's purpose</li>
                </ul>
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                Select Team Members:
                <ul>
                  <li>Only employees from your department can be added</li>
                  <li>Employees can belong to only one team at a time</li>
                  <li>The system will prevent adding employees already in other teams</li>
                </ul>
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                Click "Create Team" to save
              </Typography>
            </li>
          </ol>
        </Paper>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Personal Capabilities
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" paragraph>
          In addition to team management responsibilities, managers also have access to their own personal functions:
        </Typography>
        <ul>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Clock In/Out:</strong> Record personal attendance
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Apply for Leave:</strong> Submit personal leave requests
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>View Salary:</strong> Access personal salary history and payslips
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Submit Resignation:</strong> Initiate resignation process if needed
            </Typography>
          </li>
          <li>
            <Typography variant="body1" gutterBottom>
              <strong>Update Profile:</strong> Manage personal contact information
            </Typography>
          </li>
        </ul>
      </Box>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'warning.soft', borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium" color="warning.main">
          Best Practices for Managers
        </Typography>
        <Typography variant="body2">
          <ul>
            <li>Review attendance records daily to ensure timely approvals</li>
            <li>Coordinate team leave schedules to maintain adequate coverage</li>
            <li>Create clear team structures with logical member assignments</li>
            <li>Communicate regularly with team members about attendance expectations</li>
            <li>Use team performance metrics to identify trends and address issues proactively</li>
            <li>Ensure fair and consistent application of attendance and leave policies</li>
          </ul>
        </Typography>
      </Box>
    </>
  )
},

"employee-role": {
  title: "Employee Role",
  lastUpdated: "April 17, 2025",
  content: (
    <>
      <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom>
        Employee Role
      </Typography>

      <Typography variant="body1" paragraph>
        The Employee role in TeamSync provides self-service functions for managing attendance, leave applications, 
        document access, and other personal workplace needs. This guide outlines the capabilities and responsibilities 
        of users with the Employee role.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Employee Responsibilities
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'info.main' }}>
              <Typography variant="h6" gutterBottom>Attendance Management</Typography>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Clock in at the start of work day
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Record tasks completed during the day
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Clock out at the end of work day
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Ensure attendance records are accurate
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Monitor personal attendance history
                  </Typography>
                </li>
              </ul>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'info.main' }}>
              <Typography variant="h6" gutterBottom>Leave Management</Typography>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Submit leave applications as needed
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Provide accurate leave reasons
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Attach required documentation
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Track leave balances and usage
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Monitor leave application status
                  </Typography>
                </li>
              </ul>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'info.main' }}>
              <Typography variant="h6" gutterBottom>Profile Maintenance</Typography>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Keep personal information updated
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Maintain secure login credentials
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Review profile for accuracy
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Request corrections for inaccurate data
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Update communication preferences
                  </Typography>
                </li>
              </ul>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Module-Specific Capabilities
      </Typography>

      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell><strong>Module</strong></TableCell>
              <TableCell><strong>Employee Capabilities</strong></TableCell>
              <TableCell><strong>Limitations</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Attendance</TableCell>
              <TableCell>
                <ul>
                  <li>Clock in and out daily</li>
                  <li>Record completed tasks</li>
                  <li>View personal attendance history</li>
                  <li>Monitor attendance status</li>
                </ul>
              </TableCell>
              <TableCell>
                <ul>
                  <li>Cannot modify submitted attendance</li>
                  <li>Cannot approve attendance</li>
                  <li>Cannot view others' attendance</li>
                </ul>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Leave Management</TableCell>
              <TableCell>
                <ul>
                  <li>Submit leave applications</li>
                  <li>Track leave application status</li>
                  <li>View leave balance</li>
                  <li>Cancel pending leave applications</li>
                </ul>
              </TableCell>
              <TableCell>
                <ul>
                  <li>Cannot approve leaves</li>
                  <li>Cannot modify approved leaves</li>
                  <li>Cannot adjust leave balances</li>
                </ul>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Salary</TableCell>
              <TableCell>
                <ul>
                  <li>View salary history</li>
                  <li>Access salary details</li>
                  <li>Download payslips</li>
                </ul>
              </TableCell>
              <TableCell>
                <ul>
                  <li>Cannot modify salary information</li>
                  <li>Cannot view others' salary details</li>
                  <li>Cannot generate salary records</li>
                </ul>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Document Center</TableCell>
              <TableCell>
                <ul>
                  <li>View assigned documents</li>
                  <li>View global documents</li>
                  <li>Download documents</li>
                </ul>
              </TableCell>
              <TableCell>
                <ul>
                  <li>Cannot upload documents</li>
                  <li>Cannot modify documents</li>
                  <li>Cannot delete documents</li>
                </ul>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Ticket System</TableCell>
              <TableCell>
                <ul>
                  <li>Create and submit support tickets</li>
                  <li>Track ticket status</li>
                  <li>Respond to ticket threads</li>
                  <li>Upload attachments to tickets</li>
                </ul>
              </TableCell>
              <TableCell>
                <ul>
                  <li>Cannot view others' tickets</li>
                  <li>Cannot change ticket status</li>
                  <li>Cannot assign tickets</li>
                </ul>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Resignation</TableCell>
              <TableCell>
                <ul>
                  <li>Submit resignation request</li>
                  <li>Track resignation status</li>
                  <li>Complete clearance checklist items</li>
                  <li>Withdraw pending resignation</li>
                </ul>
              </TableCell>
              <TableCell>
                <ul>
                  <li>Cannot approve resignation</li>
                  <li>Cannot withdraw approved resignation</li>
                  <li>Cannot see others' resignations</li>
                </ul>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Employee Dashboard
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Dashboard Components
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Attendance Status:</strong> Current attendance status and clock-in/out buttons
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Leave Balance:</strong> Overview of available leave days by type
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Upcoming Holidays:</strong> Calendar of upcoming holidays and events
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Recent Activity:</strong> Latest attendance records and leave applications
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Quick Links:</strong> Direct access to frequently used functions
              </Typography>
            </li>
          </ul>
        </Paper>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Attendance Process
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, borderLeft: 4, borderColor: 'info.main' }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Daily Attendance Workflow
          </Typography>
          <ol>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Start of Day:</strong>
                <ul>
                  <li>Navigate to Employee Dashboard → Real-Time Attendance</li>
                  <li>Select work location (Onsite or Remote)</li>
                  <li>For Onsite, ensure you are within geofencing area</li>
                  <li>Click "Clock In Now" to record your attendance</li>
                </ul>
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>End of Day:</strong>
                <ul>
                  <li>Navigate to Employee Dashboard → Real-Time Attendance</li>
                  <li>Enter detailed description of tasks completed during the day</li>
                  <li>Click "Clock Out" to complete your attendance record</li>
                  <li>Verify that your attendance status shows as "Completed"</li>
                </ul>
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Attendance Verification:</strong>
                <ul>
                  <li>Monitor approval status of your attendance records</li>
                  <li>Attendance requires both manager and admin approval</li>
                  <li>Approved attendance directly affects salary calculation</li>
                </ul>
              </Typography>
            </li>
          </ol>
        </Paper>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Leave Application Process
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, borderLeft: 4, borderColor: 'info.main' }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Applying for Leave
          </Typography>
          <ol>
            <li>
              <Typography variant="body2" gutterBottom>
                Navigate to <strong>Employee Dashboard → Add Leave</strong>
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                Complete the leave application form:
                <ul>
                  <li>Select leave type (Casual, Sick, Paid, Half)</li>
                  <li>Choose start and end dates</li>
                  <li>Provide a clear reason for leave</li>
                  <li>Select whether to use leave balance (paid vs. unpaid)</li>
                  <li>Attach supporting documents if required (medical certificates, etc.)</li>
                </ul>
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                Submit the application and monitor its status
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                For Half Leave, both start and end date must be the same day
              </Typography>
            </li>
          </ol>
        </Paper>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Document Access
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="body1" paragraph>
          Employees can access documents through the Document Center:
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, borderTop: 3, borderColor: 'info.main' }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Personal Documents
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Documents specifically assigned to you, including appointment letters and personal certificates.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, borderTop: 3, borderColor: 'info.main' }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Company Policies
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Organization-wide policies, procedures, and employee handbooks.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Paper sx={{ p: 2, borderTop: 3, borderColor: 'info.main' }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Forms & Templates
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Standard forms and templates for various organizational processes.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'info.soft', borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium" color="info.main">
          Important Employee Guidelines
        </Typography>
        <Typography variant="body2">
          <ul>
            <li>Always clock in and out daily - forgetting to clock out results in incomplete attendance (only 0.5 credits)</li>
            <li>Apply for leave in advance whenever possible - last-minute leave requests may be rejected</li>
            <li>Provide detailed task descriptions when clocking out to facilitate approval</li>
            <li>Keep track of your leave balances to plan time off effectively</li>
            <li>For onsite work, ensure you are within the geofencing area before attempting to clock in</li>
            <li>Regularly check notifications for important updates regarding leave approvals and attendance</li>
          </ul>
        </Typography>
      </Box>
    </>
  )
},

"permissions-matrix": {
  title: "Permissions Matrix",
  lastUpdated: "April 17, 2025",
  content: (
    <>
      <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom>
        Permissions Matrix
      </Typography>

      <Typography variant="body1" paragraph>
        TeamSync implements role-based access control with three primary user roles: Administrator, Manager, and Employee.
        This comprehensive permissions matrix outlines what each role can access and modify across all system modules.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Role Legend
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <AdminIcon color="error" sx={{ mr: 1 }} />
              <Typography variant="body1" fontWeight="medium">Administrator</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Full system access with ability to manage all aspects of the platform
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <ManagerIcon color="warning" sx={{ mr: 1 }} />
              <Typography variant="body1" fontWeight="medium">Manager</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Team management capabilities and limited administrative functions
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <EmployeeIcon color="info" sx={{ mr: 1 }} />
              <Typography variant="body1" fontWeight="medium">Employee</Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Self-service functions and personal record management
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Action Legend
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, bgcolor: 'success.soft', borderRadius: 2 }}>
              <Typography variant="body1" align="center" fontWeight="medium">
                ✓ Full Access
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, bgcolor: 'warning.soft', borderRadius: 2 }}>
              <Typography variant="body1" align="center" fontWeight="medium">
                ◐ Limited Access
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, bgcolor: 'info.soft', borderRadius: 2 }}>
              <Typography variant="body1" align="center" fontWeight="medium">
                ○ View Only
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Paper sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 2 }}>
              <Typography variant="body1" align="center" fontWeight="medium">
                ✕ No Access
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Detailed Permissions Matrix
      </Typography>

      <Box sx={{ mb: 5, overflowX: 'auto' }}>
        <TableContainer component={Paper} variant="outlined">
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell><strong>Module</strong></TableCell>
                <TableCell><strong>Action</strong></TableCell>
                <TableCell align="center"><AdminIcon color="error" /></TableCell>
                <TableCell align="center"><ManagerIcon color="warning" /></TableCell>
                <TableCell align="center"><EmployeeIcon color="info" /></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Department Module */}
              <TableRow>
                <TableCell rowSpan={4} sx={{ backgroundColor: 'background.default' }}>
                  <Typography fontWeight="medium">Department Management</Typography>
                </TableCell>
                <TableCell>Create Departments</TableCell>
                <TableCell align="center">✓</TableCell>
                <TableCell align="center">✕</TableCell>
                <TableCell align="center">✕</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>View Departments</TableCell>
                <TableCell align="center">✓</TableCell>
                <TableCell align="center">○</TableCell>
                <TableCell align="center">○</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Edit Departments</TableCell>
                <TableCell align="center">✓</TableCell>
                <TableCell align="center">✕</TableCell>
                <TableCell align="center">✕</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Delete Departments</TableCell>
                <TableCell align="center">✓</TableCell>
                <TableCell align="center">✕</TableCell>
                <TableCell align="center">✕</TableCell>
              </TableRow>

              {/* User Profiles */}
              <TableRow>
                <TableCell rowSpan={4} sx={{ backgroundColor: 'background.default' }}>
                  <Typography fontWeight="medium">User Profile Management</Typography>
                </TableCell>
                <TableCell>Create User Profiles</TableCell>
                <TableCell align="center">✓</TableCell>
                <TableCell align="center">✕</TableCell>
                <TableCell align="center">✕</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>View User Profiles</TableCell>
                <TableCell align="center">✓</TableCell>
                <TableCell align="center">◐</TableCell>
                <TableCell align="center">○</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Edit User Profiles</TableCell>
                <TableCell align="center">✓</TableCell>
                <TableCell align="center">✕</TableCell>
                <TableCell align="center">✕</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Delete User Profiles</TableCell>
                <TableCell align="center">✓</TableCell>
                <TableCell align="center">✕</TableCell>
                <TableCell align="center">✕</TableCell>
              </TableRow>

              {/* Team Management */}
              <TableRow>
                <TableCell rowSpan={4} sx={{ backgroundColor: 'background.default' }}>
                  <Typography fontWeight="medium">Team Management</Typography>
                </TableCell>
                <TableCell>Create Teams</TableCell>
                <TableCell align="center">✓</TableCell>
                <TableCell align="center">◐</TableCell>
                <TableCell align="center">✕</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>View Teams</TableCell>
                <TableCell align="center">✓</TableCell>
                <TableCell align="center">◐</TableCell>
                <TableCell align="center">○</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Manage Team Members</TableCell>
                <TableCell align="center">✓</TableCell>
                <TableCell align="center">◐</TableCell>
                <TableCell align="center">✕</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Delete Teams</TableCell>
                <TableCell align="center">✓</TableCell>
                <TableCell align="center">◐</TableCell>
                <TableCell align="center">✕</TableCell>
              </TableRow>

              {/* Attendance */}
              <TableRow>
                <TableCell rowSpan={5} sx={{ backgroundColor: 'background.default' }}>
                  <Typography fontWeight="medium">Attendance Management</Typography>
                </TableCell>
                <TableCell>Clock In/Out</TableCell>
                <TableCell align="center">✓</TableCell>
                <TableCell align="center">✓</TableCell>
                <TableCell align="center">✓</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>View Personal Attendance</TableCell>
                <TableCell align="center">✓</TableCell>
                <TableCell align="center">✓</TableCell>
                <TableCell align="center">✓</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>View Team Attendance</TableCell>
                <TableCell align="center">✓</TableCell>
                <TableCell align="center">◐</TableCell>
                <TableCell align="center">✕</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Approve Attendance</TableCell>
                <TableCell align="center">✓</TableCell>
                <TableCell align="center">◐</TableCell>
                <TableCell align="center">✕</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Generate Reports</TableCell>
                <TableCell align="center">✓</TableCell>
                <TableCell align="center">◐</TableCell>
                <TableCell align="center">✕</TableCell>
              </TableRow>

              {/* Leave Management */}
              <TableRow>
                <TableCell rowSpan={6} sx={{ backgroundColor: 'background.default' }}>
                  <Typography fontWeight="medium">Leave Management</Typography>
                </TableCell>
                <TableCell>Create Leave Policies</TableCell>
                <TableCell align="center">✓</TableCell>
                <TableCell align="center">✕</TableCell>
                <TableCell align="center">✕</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Apply For Leave</TableCell>
                <TableCell align="center">✓</TableCell>
                <TableCell align="center">✓</TableCell>
                <TableCell align="center">✓</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>View Personal Leaves</TableCell>
                <TableCell align="center">✓</TableCell>
                <TableCell align="center">✓</TableCell>
                <TableCell align="center">✓</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>View Team Leaves</TableCell>
                <TableCell align="center">✓</TableCell>
                <TableCell align="center">◐</TableCell>
                <TableCell align="center">✕</TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Approve/Reject Leaves</TableCell>
                <TableCell align="center">✓</TableCell>
                // Continue the permissions-matrix section
              <TableCell align="center">◐</TableCell>
              <TableCell align="center">✕</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Adjust Leave Balances</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✕</TableCell>
              <TableCell align="center">✕</TableCell>
            </TableRow>

            {/* Salary Management */}
            <TableRow>
              <TableCell rowSpan={5} sx={{ backgroundColor: 'background.default' }}>
                <Typography fontWeight="medium">Salary Management</Typography>
              </TableCell>
              <TableCell>Generate Salary Records</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✕</TableCell>
              <TableCell align="center">✕</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>View Personal Salary</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✓</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>View All Salaries</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✕</TableCell>
              <TableCell align="center">✕</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Approve Salary</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✕</TableCell>
              <TableCell align="center">✕</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Generate Payslips</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✕</TableCell>
              <TableCell align="center">✕</TableCell>
            </TableRow>

            {/* Holiday Management */}
            <TableRow>
              <TableCell rowSpan={3} sx={{ backgroundColor: 'background.default' }}>
                <Typography fontWeight="medium">Holiday Management</Typography>
              </TableCell>
              <TableCell>Create Holidays</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✕</TableCell>
              <TableCell align="center">✕</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>View Holidays</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✓</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Delete Holidays</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✕</TableCell>
              <TableCell align="center">✕</TableCell>
            </TableRow>

            {/* Document Management */}
            <TableRow>
              <TableCell rowSpan={4} sx={{ backgroundColor: 'background.default' }}>
                <Typography fontWeight="medium">Document Management</Typography>
              </TableCell>
              <TableCell>Upload Documents</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✕</TableCell>
              <TableCell align="center">✕</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>View Personal Documents</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✓</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>View Global Documents</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✓</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Delete Documents</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✕</TableCell>
              <TableCell align="center">✕</TableCell>
            </TableRow>

            {/* Ticket System */}
            <TableRow>
              <TableCell rowSpan={4} sx={{ backgroundColor: 'background.default' }}>
                <Typography fontWeight="medium">Ticket System</Typography>
              </TableCell>
              <TableCell>Create Tickets</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✓</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>View Personal Tickets</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✓</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>View All Tickets</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✕</TableCell>
              <TableCell align="center">✕</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Manage Ticket Status</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✕</TableCell>
              <TableCell align="center">✕</TableCell>
            </TableRow>

            {/* Resignation Management */}
            <TableRow>
              <TableCell rowSpan={4} sx={{ backgroundColor: 'background.default' }}>
                <Typography fontWeight="medium">Resignation Management</Typography>
              </TableCell>
              <TableCell>Submit Resignation</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✓</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>View Own Resignation</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✓</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>View All Resignations</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✕</TableCell>
              <TableCell align="center">✕</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Approve/Reject Resignations</TableCell>
              <TableCell align="center">✓</TableCell>
              <TableCell align="center">✕</TableCell>
              <TableCell align="center">✕</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>
    </Box>

    <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
      Additional Permissions Notes
    </Typography>

    <Box sx={{ mb: 4 }}>
      <Paper sx={{ p: 3, mb: 3, borderLeft: 4, borderColor: 'error.main' }}>
        <Typography variant="subtitle1" color="error.main" fontWeight="medium" gutterBottom>
          Administrator Special Privileges
        </Typography>
        <ul>
          <li>
            <Typography variant="body2" gutterBottom>
              Reset user passwords
            </Typography>
          </li>
          <li>
            <Typography variant="body2" gutterBottom>
              Change user roles
            </Typography>
          </li>
          <li>
            <Typography variant="body2" gutterBottom>
              Configure system settings
            </Typography>
          </li>
          <li>
            <Typography variant="body2" gutterBottom>
              Create global notifications
            </Typography>
          </li>
          <li>
            <Typography variant="body2" gutterBottom>
              Access system logs and audit trails
            </Typography>
          </li>
        </ul>
      </Paper>

      <Paper sx={{ p: 3, mb: 3, borderLeft: 4, borderColor: 'warning.main' }}>
        <Typography variant="subtitle1" color="warning.main" fontWeight="medium" gutterBottom>
          Manager Constraints
        </Typography>
        <ul>
          <li>
            <Typography variant="body2" gutterBottom>
              Team management limited to assigned department
            </Typography>
          </li>
          <li>
            <Typography variant="body2" gutterBottom>
              Attendance approval only for team members
            </Typography>
          </li>
          <li>
            <Typography variant="body2" gutterBottom>
              Reports limited to team data
            </Typography>
          </li>
          <li>
            <Typography variant="body2" gutterBottom>
              Cannot make organization-wide changes
            </Typography>
          </li>
        </ul>
      </Paper>

      <Paper sx={{ p: 3, borderLeft: 4, borderColor: 'info.main' }}>
        <Typography variant="subtitle1" color="info.main" fontWeight="medium" gutterBottom>
          Employee Self-Service Focus
        </Typography>
        <ul>
          <li>
            <Typography variant="body2" gutterBottom>
              Primarily focused on personal data management
            </Typography>
          </li>
          <li>
            <Typography variant="body2" gutterBottom>
              Limited to viewing own records only
            </Typography>
          </li>
          <li>
            <Typography variant="body2" gutterBottom>
              Cannot modify data requiring approval
            </Typography>
          </li>
          <li>
            <Typography variant="body2" gutterBottom>
              Can request changes that require admin approval
            </Typography>
          </li>
        </ul>
      </Paper>
    </Box>

    <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.soft', borderRadius: 2 }}>
      <Typography variant="subtitle1" fontWeight="medium">
        Role Assignment Guidelines
      </Typography>
      <Typography variant="body2">
        <ul>
          <li>Assign the Administrator role only to trusted HR staff and system administrators</li>
          <li>Assign the Manager role to department heads and team leaders</li>
          <li>Assign the Employee role to regular staff members</li>
          <li>Review role assignments periodically, especially after organizational changes</li>
          <li>Consider implementing additional security measures for administrator accounts</li>
        </ul>
      </Typography>
    </Box>
  </>
  )
},

// Department Management sections
"department-overview": {
  title: "Department Management Module Overview",
  lastUpdated: "April 17, 2025",
  content: (
    <>
      <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom>
        Department Management Module Overview
      </Typography>

      <Typography variant="body1" paragraph>
        The Department Management module is the foundation of your organizational structure in TeamSync. Departments help organize
        employees and managers into logical business units, making it easier to manage teams, track attendance, and process payroll.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Key Features
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    mr: 2
                  }}
                >
                  <Business />
                </Avatar>
                <Typography variant="h6">Department Structure</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Create and manage your organizational hierarchy with flexible department structures that reflect your business needs.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    mr: 2
                  }}
                >
                  <Group />
                </Avatar>
                <Typography variant="h6">Employee Organization</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Logically group employees and managers for efficient management, reporting, and administrative functions.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    mr: 2
                  }}
                >
                  <AssessmentRounded />
                </Avatar>
                <Typography variant="h6">Department Analytics</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Access department-specific reports and metrics for attendance, leave, and performance tracking.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Module Architecture
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Department Data Structure
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Department Name:</strong> Unique identifier for the department
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Description:</strong> Details about the department's function and purpose
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Creation Date:</strong> When the department was added to the system
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Last Updated:</strong> When the department information was last modified
              </Typography>
            </li>
          </ul>
        </Paper>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Department Relationships
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderLeft: 4, borderColor: 'primary.main' }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Department → Employees
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                Each department can have multiple employees:
              </Typography>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    Employees are assigned to exactly one department
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    Department changes affect reporting structure
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    Deleting a department affects all assigned employees
                  </Typography>
                </li>
              </ul>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderLeft: 4, borderColor: 'primary.main' }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Department → Teams
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                Departments can contain multiple teams:
              </Typography>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    Teams are created within departments
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    Teams can only include members from the same department
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    Department deletion affects all associated teams
                  </Typography>
                </li>
              </ul>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderLeft: 4, borderColor: 'primary.main' }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Department → Managers
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                Departments have management relationships:
              </Typography>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    Managers are assigned to specific departments
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    Managers can create teams within their department
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    Managers have oversight of department employees
                  </Typography>
                </li>
              </ul>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Department Management Interface
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Department List View
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Department Table:</strong> Lists all departments with name and action buttons
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Search Function:</strong> Quickly find specific departments
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Total Count:</strong> Shows the number of departments in the system
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Add Department Button:</strong> Creates new departments
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Action Buttons:</strong> Edit and delete options for each department
              </Typography>
            </li>
          </ul>
        </Paper>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Integration with Other Modules
      </Typography>

      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell><strong>Module</strong></TableCell>
              <TableCell><strong>Integration Points</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Employee Management</TableCell>
              <TableCell>
                <ul>
                  <li>Employees are assigned to departments</li>
                  <li>Department changes affect employee reporting structure</li>
                  <li>Department-based filtering of employee lists</li>
                </ul>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Team Management</TableCell>
              <TableCell>
                <ul>
                  <li>Teams are created within specific departments</li>
                  <li>Team members must belong to the same department</li>
                  <li>Department structure informs team organization</li>
                </ul>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Attendance & Leave</TableCell>
              <TableCell>
                <ul>
                  <li>Department-based attendance reporting</li>
                  <li>Leave approvals follow department hierarchy</li>
                  <li>Department-specific holidays can be assigned</li>
                </ul>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Salary Management</TableCell>
              <TableCell>
                <ul>
                  <li>Department-wise salary budgeting</li>
                  <li>Salary reports filtered by department</li>
                  <li>Department-based payroll processing</li>
                </ul>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'warning.soft', borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium" color="warning.main">
          Important Considerations
        </Typography>
        <Typography variant="body2">
          <ul>
            <li>Plan your department structure carefully before implementation</li>
            <li>Consistent naming conventions improve organization and reporting</li>
            <li>Department changes have system-wide implications</li>
            <li>Deleting departments will cascade to employees, teams, and related records</li>
            <li>Regular audits of department structure help maintain organizational accuracy</li>
          </ul>
        </Typography>
      </Box>
    </>
  )
},

"creating-departments": {
  title: "Creating Departments",
  lastUpdated: "April 17, 2025",
  content: (
    <>
      <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom>
        Creating Departments
      </Typography>

      <Typography variant="body1" paragraph>
        Adding new departments to TeamSync establishes the foundational organizational structure for your company.
        This guide walks you through the process of creating departments and provides best practices for effective department management.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Department Creation Process
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    mr: 2
                  }}
                >
                  1
                </Avatar>
                <Typography variant="h6">Access Department Management</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <ol>
                  <li>Log in with administrator credentials</li>
                  <li>Navigate to Admin Dashboard</li>
                  <li>Click on "Departments" in the sidebar navigation</li>
                  <li>You'll see the list of existing departments</li>
                </ol>
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    mr: 2
                  }}
                >
                  2
                </Avatar>
                <Typography variant="h6">Initiate Department Creation</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <ol>
                  <li>Click the "Add Department" button in the top-right corner</li>
                  <li>A form dialog will appear with fields to enter department details</li>
                  <li>This form contains two primary fields: Department Name and Description</li>
                </ol>
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    mr: 2
                  }}
                >
                  3
                </Avatar>
                <Typography variant="h6">Enter Department Details</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <ul>
                  <li><strong>Department Name (Required):</strong> Enter a clear, descriptive name for the department</li>
                  <li><strong>Description (Optional):</strong> Provide details about the department's function, location, or other relevant information</li>
                </ul>
                The department name should be unique and easily identifiable within your organization structure.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    mr: 2
                  }}
                >
                  4
                </Avatar>
                <Typography variant="h6">Save the Department</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <ol>
                  <li>After entering all required information, click "Create Department"</li>
                  <li>The system will validate the information and create the department</li>
                  <li>Upon successful creation, you'll be redirected to the department list</li>
                  <li>The new department should now appear in the list</li>
                </ol>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Department Name Guidelines
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, borderLeft: 4, borderColor: 'primary.main' }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Naming Conventions
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Be Consistent:</strong> Use consistent naming patterns across all departments
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Be Descriptive:</strong> Choose names that clearly indicate the department's function
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Keep it Concise:</strong> Avoid overly long department names
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Avoid Abbreviations:</strong> Use full names rather than acronyms when possible
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Consider Hierarchy:</strong> For sub-departments, consider using a prefix or suffix to indicate relationship
              </Typography>
            </li>
          </ul>
        </Paper>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Example Department Structure
      </Typography>

      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell><strong>Department Name</strong></TableCell>
              <TableCell><strong>Description</strong></TableCell>
              <TableCell><strong>Purpose</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Human Resources</TableCell>
              <TableCell>Responsible for recruitment, employee relations, and HR policy management</TableCell>
              <TableCell>Manages employee lifecycle and HR operations</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Finance</TableCell>
              <TableCell>Handles accounting, budgeting, and financial reporting</TableCell>
              <TableCell>Manages company finances and reporting</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Information Technology</TableCell>
              <TableCell>Manages IT infrastructure, support, and development</TableCell>
              <TableCell>Provides technology solutions and support</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Marketing</TableCell>
              <TableCell>Handles brand management, advertising, and communications</TableCell>
              <TableCell>Manages company market positioning and promotion</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Operations</TableCell>
              <TableCell>Oversees day-to-day operational activities</TableCell>
              <TableCell>Ensures efficient business operations</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Sales</TableCell>
              <TableCell>Manages customer relationships and sales processes</TableCell>
              <TableCell>Drives revenue generation</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Research & Development</TableCell>
              <TableCell>Focuses on product innovation and improvement</TableCell>
              <TableCell>Develops new products and enhances existing ones</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Best Practices for Department Creation
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Organizational Considerations
              </Typography>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Align department structure with your organization's actual hierarchy
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Create departments that reflect functional areas rather than temporary projects
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Consider future growth when designing your department structure
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Balance between too many small departments and too few large departments
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Document your organizational design decisions for future reference
                  </Typography>
                </li>
              </ul>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                System Management
              </Typography>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Create all departments before adding employees to the system
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Regularly audit your department structure to ensure it remains current
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Use the description field to provide context about the department's role
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Consider creating a department naming and management policy
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    Test reports and filters after creating new departments to ensure proper integration
                  </Typography>
                </li>
              </ul>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'error.soft', borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium" color="error.main">
          Important Caution
        </Typography>
        <Typography variant="body2">
          Creating departments is a foundational step in setting up your organization structure. Changes to 
          departments later, especially deletions, can have significant system-wide impacts. Take time to plan 
          your department structure thoroughly before implementation.
        </Typography>
      </Box>
    </>
  )
},

"editing-departments": {
  title: "Editing Departments",
  lastUpdated: "April 17, 2025",
  content: (
    <>
      <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom>
        Editing Departments
      </Typography>

      <Typography variant="body1" paragraph>
        As your organization evolves, you may need to update department information to reflect changes in your business structure.
        This guide explains how to edit existing departments and what happens when you make these changes.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Department Editing Process
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    mr: 2
                  }}
                >
                  1
                </Avatar>
                <Typography variant="h6">Access Department List</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <ol>
                  <li>Log in with administrator credentials</li>
                  <li>Navigate to Admin Dashboard</li>
                  <li>Click on "Departments" in the sidebar navigation</li>
                  <li>You'll see the list of all existing departments</li>
                </ol>
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    mr: 2
                  }}
                >
                  2
                </Avatar>
                <Typography variant="h6">Select Department to Edit</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <ol>
                  <li>Locate the department you want to modify in the list</li>
                  <li>Click the edit (pencil) icon next to the department name</li>
                  <li>This will open the Edit Department form with the current information pre-filled</li>
                </ol>
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    mr: 2
                  }}
                >
                  3
                </Avatar>
                <Typography variant="h6">Modify Department Details</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <ul>
                  <li><strong>Department Name:</strong> Update the department name if needed</li>
                  <li><strong>Description:</strong> Modify or add details about the department's function</li>
                </ul>
                Make sure any changes align with your organizational structure and naming conventions.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    mr: 2
                  }}
                >
                  4
                </Avatar>
                <Typography variant="h6">Save Changes</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <ol>
                  <li>After making the necessary changes, click "Update Department"</li>
                  <li>The system will validate the information</li>
                  <li>Upon successful update, you'll return to the department list</li>
                  <li>The department will appear with its updated information</li>
                </ol>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        System Effects When Editing Departments
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, borderLeft: 4, borderColor: 'warning.main' }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Department Name Changes
          </Typography>
          <Typography variant="body2" paragraph>
            When you change a department's name, the following updates occur throughout the system:
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Employee Records:</strong> The department name is updated for all associated employees
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Team Assignments:</strong> All teams under this department will reflect the new name
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Manager Records:</strong> Manager department assignments are updated automatically
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Reports and Analytics:</strong> All reports will use the new department name going forward
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Historical Data:</strong> Even historical records will show the new department name
              </Typography>
            </li>
          </ul>
        </Paper>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        When to Edit Departments
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'success.main' }}>
              <Typography variant="h6" gutterBottom>Appropriate Scenarios</Typography>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>Rebranding:</strong> When a department name changes as part of company rebranding
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>Reorganization:</strong> When departments merge or their functions evolve
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>Clarification:</strong> To improve clarity or fix naming inconsistencies
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>Description Updates:</strong> To add more detailed information about the department
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>Spelling/Grammar:</strong> To correct errors in the original department name
                  </Typography>
                </li>
              </ul>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'error.main' }}>
              <Typography variant="h6" gutterBottom>Scenarios to Avoid</Typography>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>Complete Function Change:</strong> When a department's purpose completely changes (create new department instead)
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>Temporary Projects:</strong> Don't rename departments for temporary initiatives
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>Frequent Changes:</strong> Avoid repeated renaming as it creates confusion
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>Archiving:</strong> Don't use editing to archive old departments (consider a status field instead)
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>Major Restructuring:</strong> For complete reorganizations, consider a more comprehensive approach
                  </Typography>
                </li>
              </ul>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Best Practices for Department Editing
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Edit Management Guidelines
          </Typography>
          <ol>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Plan Changes:</strong> Consider the full impact of department name changes before implementing them
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Communicate:</strong> Inform affected employees about department name changes
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Document:</strong> Keep a record of department name changes for historical reference
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Timing:</strong> Schedule department updates during low-activity periods
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Verify:</strong> After editing, check that the changes appear correctly throughout the system
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Update References:</strong> Ensure any external references to departments are also updated
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Maintain Consistency:</strong> Ensure department naming remains consistent across the organization
              </Typography>
            </li>
          </ol>
        </Paper>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Alternative to Editing: Department Archiving
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, borderLeft: 4, borderColor: 'info.main' }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Using Name Conventions for Archiving
          </Typography>
          <Typography variant="body2" paragraph>
            Instead of deleting obsolete departments, consider using a naming convention to archive them:
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Add a prefix:</strong> Example: "[Archived] Marketing"
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Add a suffix:</strong> Example: "Marketing [Archived]"
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Update the description:</strong> Indicate when and why the department was archived
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Transfer employees:</strong> Move employees to active departments before archiving
              </Typography>
            </li>
          </ul>
          <Typography variant="body2" paragraph sx={{ mt: 2 }}>
            This approach preserves historical data while clearly indicating the department is no longer active.
          </Typography>
        </Paper>
      </Box>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.soft', borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium">
          Remember
        </Typography>
        <Typography variant="body2">
          Editing departments is preferable to deleting them in most cases. When you edit a department name, all historical 
          records are preserved and updated to reflect the new name. This maintains data integrity while allowing your 
          organizational structure to evolve.
        </Typography>
      </Box>
    </>
  )
},

"deleting-departments": {
  title: "Deleting Departments",
  lastUpdated: "April 17, 2025",
  content: (
    <>
      <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom>
        Deleting Departments
      </Typography>

      <Typography variant="body1" paragraph>
        Deleting a department is a critical operation with significant system-wide impacts. This guide explains the department 
        deletion process, its consequences, and recommended alternatives to consider before permanent removal.
      </Typography>

      <Box sx={{ p: 3, mb: 4, bgcolor: 'error.soft', borderRadius: 2 }}>
        <Typography variant="h6" fontWeight="medium" color="error.main" gutterBottom>
          ⚠️ Critical Warning
        </Typography>
        <Typography variant="body1" paragraph>
          Deleting a department triggers a cascading deletion of:
        </Typography>
        <ul>
          <li>
            <Typography variant="body1" fontWeight="medium">
              All employees assigned to this department
            </Typography>
          </li>
          <li>
            <Typography variant="body1" fontWeight="medium">
              All teams within this department
            </Typography>
          </li>
          <li>
            <Typography variant="body1" fontWeight="medium">
              All leave records for these employees
            </Typography>
          </li>
          <li>
            <Typography variant="body1" fontWeight="medium">
              All salary records for these employees
            </Typography>
          </li>
          <li>
            <Typography variant="body1" fontWeight="medium">
              All attendance records associated with these employees
            </Typography>
          </li>
        </ul>
        <Typography variant="body1" fontWeight="medium" paragraph color="error.main">
          This action cannot be undone. Consider alternatives before proceeding.
        </Typography>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Department Deletion Process
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    mr: 2
                  }}
                >
                  1
                </Avatar>
                <Typography variant="h6">Access Department List</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <ol>
                  <li>Log in with administrator credentials</li>
                  <li>Navigate to Admin Dashboard</li>
                  <li>Click on "Departments" in the sidebar navigation</li>
                  <li>You'll see the list of all existing departments</li>
                </ol>
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    mr: 2
                  }}
                >
                  2
                </Avatar>
                <Typography variant="h6">Prepare for Deletion</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <strong>Before proceeding, ensure:</strong>
                <ul>
                  <li>All employees have been reassigned to other departments</li>
                  <li>All teams have been disbanded or moved to other departments</li>
                  <li>You have exported any data you wish to preserve</li>
                  <li>You have communicated the change to all stakeholders</li>
                </ul>
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    mr: 2
                  }}
                >
                  3
                </Avatar>
                <Typography variant="h6">Initiate Department Deletion</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <ol>
                  <li>Locate the department you want to delete in the list</li>
                  <li>Click the delete (trash) icon next to the department</li>
                  <li>A confirmation dialog will appear</li>
                  <li>The dialog will warn you about the consequences of deletion</li>
                </ol>
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    mr: 2
                  }}
                >
                  4
                </Avatar>
                <Typography variant="h6">Confirm Deletion</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <ol>
                  <li>Carefully read the warning message</li>
                  <li>Type "DELETE" in the confirmation field (case-sensitive)</li>
                  <li>Click "Confirm Delete" to permanently remove the department</li>
                  <li>Once confirmed, the deletion process will execute</li>
                </ol>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Technical Background: Deletion Cascade
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, borderLeft: 4, borderColor: 'warning.main' }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            System Implementation Details
          </Typography>
          <Typography variant="body2" paragraph>
            When a department is deleted, the system executes the following steps in sequence:
          </Typography>
          <ol>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Identify Dependencies:</strong> The system finds all employees assigned to the department
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Extract Employee IDs:</strong> Creates a list of all affected employee IDs
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Delete Employees:</strong> Removes all employee records in the department
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Delete Leave Records:</strong> Removes all leave records for these employees
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Delete Salary Records:</strong> Removes all salary records for these employees
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Delete Department:</strong> Finally removes the department record itself
              </Typography>
            </li>
          </ol>
          <Typography variant="body2" paragraph sx={{ mt: 2, fontStyle: 'italic' }}>
            This cascade logic is implemented as a pre-delete hook in the Department model.
          </Typography>
        </Paper>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Alternatives to Department Deletion
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'success.main' }}>
              <Typography variant="h6" gutterBottom>Department Archiving</Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                Rename the department to indicate its archived status:
              </Typography>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    <strong>Example:</strong> Rename "Marketing" to "Marketing [Archived]"
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    <strong>Benefits:</strong> Preserves historical data while indicating inactive status
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    <strong>Process:</strong> Use the department editing function to rename
                  </Typography>
                </li>
              </ul>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'success.main' }}>
              <Typography variant="h6" gutterBottom>Employee Reassignment</Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                Move all employees to other departments before considering deletion:
              </Typography>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    <strong>Process:</strong> Edit each employee to change their department
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    <strong>Benefits:</strong> Preserves employee data and history
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    <strong>Result:</strong> Empty department can then be safely archived or deleted
                  </Typography>
                </li>
              </ul>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'success.main' }}>
              <Typography variant="h6" gutterBottom>Department Merging</Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                Combine multiple departments through reassignment:
              </Typography>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    <strong>Process:</strong> Move all employees to the surviving department
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    <strong>Benefits:</strong> Reorganizes structure while preserving data
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    <strong>Result:</strong> Empty departments can then be archived
                  </Typography>
                </li>
              </ul>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Scenarios Where Deletion Is Appropriate
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="body2" paragraph>
            Despite the risks, there are legitimate scenarios where department deletion may be appropriate:
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Initial System Setup:</strong> When configuring the system and no real data exists yet
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Test Departments:</strong> Removing departments created for testing purposes
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Duplicate Departments:</strong> When exact duplicates were created by mistake
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Complete Organization Restructuring:</strong> When implementing a completely new organizational structure and all data migration has been handled
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Data Cleanup:</strong> Under specific data governance requirements, with appropriate backups
              </Typography>
            </li>
          </ul>
        </Paper>
      </Box>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.soft', borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium">
          Best Practice Recommendation
        </Typography>
        <Typography variant="body2">
          <strong>Instead of deleting departments, consider the following procedure:</strong>
          <ol>
            <li>Reassign all employees to other departments</li>
            <li>Rename the department with an "[Archived]" suffix</li>
            <li>Update the description to indicate when and why it was archived</li>
            <li>Document the change in your organizational records</li>
          </ol>
          This approach preserves historical data while clearly indicating that the department is no longer active,
          avoiding the permanent data loss that comes with deletion.
        </Typography>
      </Box>
    </>
  )
},

// Team module sections
"team-overview": {
  title: "Team Management Module Overview",
  lastUpdated: "April 17, 2025",
  content: (
    <>
      <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom>
        Team Management Module Overview
      </Typography>

      <Typography variant="body1" paragraph>
        The Team Management module allows for organizing employees into functional teams under the supervision of managers.
        Teams provide a flexible layer within the organizational structure, enabling efficient work allocation, attendance management,
        and performance tracking at a granular level.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Key Features
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    mr: 2
                  }}
                >
                  <Layers />
                </Avatar>
                <Typography variant="h6">Team Creation</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Create and configure teams with specific names, descriptions, and assigned managers to reflect your organizational structure.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    mr: 2
                  }}
                >
                  <GroupAdd />
                </Avatar>
                <Typography variant="h6">Member Management</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Assign employees to teams, manage team composition, and ensure appropriate staffing levels for all functional units.
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6} lg={4}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 2, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    mr: 2
                  }}
                >
                  <SupervisorAccount />
                </Avatar>
                <Typography variant="h6">Management Hierarchy</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Establish clear reporting lines with team managers who have oversight and approval capabilities for their team members.
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Module Architecture
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Team Data Structure
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Team Name:</strong> Unique identifier for the team
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Manager ID:</strong> Reference to the assigned team manager
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Department:</strong> The department this team belongs to
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Description:</strong> Details about the team's function and purpose
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Members:</strong> Array of references to employee records
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Creation/Update Dates:</strong> Timestamps for tracking changes
              </Typography>
            </li>
          </ul>
        </Paper>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Team Relationships and Constraints
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderLeft: 4, borderColor: 'primary.main' }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Team → Department
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                Each team must belong to exactly one department:
              </Typography>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    Teams cannot span multiple departments
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    The department provides the context for the team's operations
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    Department changes for a team would require admin intervention
                  </Typography>
                </li>
              </ul>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderLeft: 4, borderColor: 'primary.main' }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Team → Manager
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                Each team must have one designated manager:
              </Typography>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    The manager must belong to the same department
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    A manager can oversee multiple teams
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    Manager changes update all related approvals workflows
                  </Typography>
                </li>
              </ul>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderLeft: 4, borderColor: 'primary.main' }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Team → Members
              </Typography>
              <Typography variant="body2" paragraph color="text.secondary">
                Employee assignment to teams follows specific rules:
              </Typography>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    Employees can only belong to one team at a time
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    Employees must be from the same department as the team
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom color="text.secondary">
                    Adding an employee to a team updates their manager reference
                  </Typography>
                </li>
              </ul>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Team Management Interface
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Team List View
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Team Table:</strong> Lists all teams with their key information
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Team Name:</strong> Displays the team's unique identifier
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Manager:</strong> Shows the assigned team manager
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Department:</strong> Indicates which department the team belongs to
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Member Count:</strong> Shows the number of employees in the team
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Action Buttons:</strong> Options to view members, edit, or delete the team
              </Typography>
            </li>
          </ul>
        </Paper>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Role-Based Access Controls
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'error.main' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AdminIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="h6">Administrator Capabilities</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <ul>
                  <li>Create teams across all departments</li>
                  <li>Assign any manager to any team</li>
                  <li>Add or remove any employee from teams</li>
                  <li>Edit or delete any team</li>
                  <li>View all teams in the organization</li>
                  <li>Override department constraints if needed</li>
                </ul>
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'warning.main' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ManagerIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="h6">Manager Capabilities</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <ul>
                  <li>Create teams within their department</li>
                  <li>Manage teams they are assigned to</li>
                  <li>Add/remove employees from their teams</li>
                  <li>Edit team details for their teams</li>
                  <li>View all teams in their department</li>
                  <li>Cannot access teams outside their department</li>
                </ul>
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, height: '100%', borderTop: 5, borderColor: 'info.main' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <EmployeeIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="h6">Employee Capabilities</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <ul>
                  <li>View their assigned team</li>
                  <li>See who their team manager is</li>
                  <li>View other team members</li>
                  <li>Cannot modify team compositions</li>
                  <li>Cannot create or delete teams</li>
                  <li>Limited to viewing their own team details</li>
                </ul>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Integration with Other Modules
      </Typography>

      <TableContainer component={Paper} variant="outlined" sx={{ mb: 4 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell><strong>Module</strong></TableCell>
              <TableCell><strong>Integration Points</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <TableRow>
              <TableCell>Attendance Management</TableCell>
              <TableCell>
                <ul>
                  <li>Team-based attendance approval workflows</li>
                  <li>Team attendance reports and dashboards</li>
                  <li>Manager approval for team members' attendance</li>
                </ul>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Leave Management</TableCell>
              <TableCell>
                <ul>
                  <li>Manager recommendations for team members' leave requests</li>
                  <li>Team leave calendar visualization</li>
                  <li>Team-based leave reports</li>
                </ul>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Performance Management</TableCell>
              <TableCell>
                <ul>
                  <li>Team-level performance metrics</li>
                  <li>Manager evaluation of team members</li>
                  <li>Team goal setting and tracking</li>
                </ul>
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Reporting & Analytics</TableCell>
              <TableCell>
                <ul>
                  <li>Team-level productivity reports</li>
                  <li>Attendance comparison across teams</li>
                  <li>Team performance dashboards</li>
                </ul>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TableContainer>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.soft', borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium">
          Best Practices for Team Management
        </Typography>
        <Typography variant="body2">
          <ul>
            <li>Create teams that reflect functional work units rather than temporary projects</li>
            <li>Maintain consistent naming conventions for teams across departments</li>
            <li>Keep team sizes manageable for effective supervision (typically 5-10 members)</li>
            <li>Review team compositions regularly to ensure optimal resource allocation</li>
            <li>Document team responsibilities and objectives for clarity</li>
            <li>Consider team balance when assigning new employees</li>
          </ul>
        </Typography>
      </Box>
    </>
  )
},

"creating-teams": {
  title: "Creating Teams",
  lastUpdated: "April 17, 2025",
  content: (
    <>
      <Typography variant="h5" component="h2" fontWeight="medium" gutterBottom>
        Creating Teams
      </Typography>

      <Typography variant="body1" paragraph>
        Creating teams in TeamSync allows you to organize employees into functional work units under specific managers.
        This guide walks through the team creation process, provides best practices, and explains the system constraints
        to ensure successful team implementation.
      </Typography>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Team Creation Process
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    mr: 2
                  }}
                >
                  1
                </Avatar>
                <Typography variant="h6">Access Team Management</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <ol>
                  <li>Log in with administrator or manager credentials</li>
                  <li>Navigate to Teams in the sidebar navigation</li>
                  <li>For Administrators: Admin Dashboard → Team</li>
                  <li>For Managers: Manager Dashboard → Team</li>
                </ol>
                The Teams screen displays all teams you have access to view or manage.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    mr: 2
                  }}
                >
                  2
                </Avatar>
                <Typography variant="h6">Initiate Team Creation</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <ol>
                  <li>Click the "Create Team" button or "Add New Team" option</li>
                  <li>A form will appear with fields for team details</li>
                </ol>
                <strong>Note:</strong> Administrators can create teams in any department, while managers can only create teams in their assigned department.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    mr: 2
                  }}
                >
                  3
                </Avatar>
                <Typography variant="h6">Enter Team Details</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                Complete the team creation form with the following information:
                <ul>
                  <li><strong>Team Name (Required):</strong> A clear, descriptive name for the team</li>
                  <li><strong>Manager (Required):</strong> Select a manager who will lead the team</li>
                  <li><strong>Department (Required):</strong> Choose the department this team belongs to</li>
                  <li><strong>Description (Optional):</strong> Details about the team's purpose and function</li>
                </ul>
                For managers, the department field is automatically filled with your assigned department.
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    mr: 2
                  }}
                >
                  4
                </Avatar>
                <Typography variant="h6">Select Team Members</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <ol>
                  <li>Scroll to the "Select Team Members" section</li>
                  <li>View the list of available employees from the selected department</li>
                  <li>Check the boxes next to employees you want to add to this team</li>
                  <li>Note that only employees from the same department will be shown</li>
                  <li>Employees already assigned to other teams will not appear in the list</li>
                </ol>
              </Typography>
            </Paper>
          </Grid>

          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%', boxShadow: 3, borderRadius: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    width: 36,
                    height: 36,
                    mr: 2
                  }}
                >
                  5
                </Avatar>
                <Typography variant="h6">Save the Team</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary">
                <ol>
                  <li>Review all the information for accuracy</li>
                  <li>Click "Create Team" to finalize</li>
                  <li>The system will validate all constraints before saving</li>
                  <li>Upon successful creation, you'll be redirected to the team list</li>
                  <li>The new team will appear in the list</li>
                </ol>
              </Typography>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        System Constraints and Validations
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, borderLeft: 4, borderColor: 'warning.main' }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Team Creation Rules
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Department Constraint:</strong> Teams can only contain employees from the same department
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Manager Requirement:</strong> Each team must have an assigned manager
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Manager Department:</strong> The team manager must belong to the same department as the team
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Team Assignment:</strong> Employees can only belong to one team at a time
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Team Name:</strong> Must be unique within the department
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Employee Department:</strong> Employees must be from the same department as the team
              </Typography>
            </li>
          </ul>
        </Paper>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        What Happens When a Team is Created
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3, borderLeft: 4, borderColor: 'primary.main' }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            System Updates
          </Typography>
          <Typography variant="body2" paragraph>
            When a team is created, several automatic updates occur in the system:
          </Typography>
          <ol>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Employee Records:</strong> All team members are updated with the new team ID
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Manager Assignment:</strong> All team members are assigned the team's manager as their manager
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Manager Record:</strong> The team is added to the manager's list of managed teams
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Attendance Workflow:</strong> The attendance approval path is updated to reflect the new team structure
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Reporting Hierarchy:</strong> Team-based reports and analytics become available
              </Typography>
            </li>
          </ol>
          <Typography variant="body2" paragraph sx={{ mt: 2, fontStyle: 'italic' }}>
            These relationships are automatically maintained by the system through database references and hooks.
          </Typography>
        </Paper>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Team Naming Best Practices
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Effective Team Names
              </Typography>
              <ul>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>Be Descriptive:</strong> Names should clearly indicate the team's function
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>Keep it Concise:</strong> Use short, memorable names when possible
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>Use Consistent Formatting:</strong> Apply the same naming pattern across teams
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>Avoid Acronyms:</strong> Unless they are widely understood in your organization
                  </Typography>
                </li>
                <li>
                  <Typography variant="body2" gutterBottom>
                    <strong>Consider Hierarchy:</strong> Include parent-child relationships if applicable
                  </Typography>
                </li>
              </ul>
            </Paper>
          </Grid>
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: '100%' }}>
              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                Example Team Names
              </Typography>
              <TableContainer>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>Good Examples</strong></TableCell>
                      <TableCell><strong>Poor Examples</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell>Frontend Development</TableCell>
                      <TableCell>FE Team</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Marketing Campaigns</TableCell>
                      <TableCell>Marketing 1</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Sales - Enterprise</TableCell>
                      <TableCell>Team Alpha</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Customer Support - Tier 1</TableCell>
                      <TableCell>Support</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>HR - Recruitment</TableCell>
                      <TableCell>The Recruiters</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      <Typography variant="h6" gutterBottom sx={{ mt: 3 }}>
        Cross-Functional vs. Department-Based Teams
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
            Department Limitation in TeamSync
          </Typography>
          <Typography variant="body2" paragraph>
            TeamSync enforces a strict department-based team model for several important reasons:
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Clear Reporting Lines:</strong> Ensures employees report to managers within their department, maintaining organizational clarity
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Attendance Management:</strong> Simplifies approval workflows by keeping them within departmental boundaries
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Leave Coordination:</strong> Enables more effective leave planning within departments
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                <strong>Simplified Analytics:</strong> Provides cleaner reporting structure for performance metrics
              </Typography>
            </li>
          </ul>
          <Typography variant="body2" paragraph sx={{ mt: 2, fontWeight: 'medium' }}>
            For cross-functional projects that span departments, consider:
          </Typography>
          <ul>
            <li>
              <Typography variant="body2" gutterBottom>
                Creating project task forces outside the TeamSync team structure
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                Using project management tools that integrate with but don't modify the reporting structure
              </Typography>
            </li>
            <li>
              <Typography variant="body2" gutterBottom>
                Maintaining departmental team assignments while collaborating across boundaries
              </Typography>
            </li>
          </ul>
        </Paper>
      </Box>

      <Box sx={{ mt: 4, p: 3, bgcolor: 'primary.soft', borderRadius: 2 }}>
        <Typography variant="subtitle1" fontWeight="medium">
          Planning for Team Creation
        </Typography>
        <Typography variant="body2">
          <strong>Before creating teams, consider:</strong>
          <ol>
            <li>Department structures and how teams will fit within them</li>
            <li>Optimal team sizes (typically 5-10 members for effective management)</li>
            <li>Appropriate manager assignments based on expertise and capacity</li>
            <li>Team member combinations that maximize productivity and collaboration</li>
            <li>Future growth and how teams might need to evolve</li>
          </ol>
          Well-designed teams form the foundation for effective workforce management, smooth approval workflows, and accurate reporting within TeamSync.
        </Typography>
      </Box>
    </>
  )
},

  "managing-members": {
    title: "Managing Team Members",
    lastUpdated: "April 16, 2025",
    content: <Typography>Manage team members here.</Typography>
  },
  "team-workflows": {
    title: "Team-based Workflows",
    lastUpdated: "April 16, 2025",
    content: <Typography>Team workflow details.</Typography>
  },

  // User Profile
  "profile-overview": {
    title: "Profile Overview",
    lastUpdated: "April 16, 2025",
    content: <Typography>User profile module overview.</Typography>
  },
  "creating-profiles": {
    title: "Creating User Profiles",
    lastUpdated: "April 16, 2025",
    content: <Typography>Steps to create profiles.</Typography>
  },
  "editing-profiles": {
    title: "Editing User Profiles",
    lastUpdated: "April 16, 2025",
    content: <Typography>Edit user profile details.</Typography>
  },
  "profile-fields": {
    title: "Profile Fields Reference",
    lastUpdated: "April 16, 2025",
    content: <Typography>Reference for profile fields.</Typography>
  },

  // Attendance
  "attendance-overview": {
    title: "Attendance Overview",
    lastUpdated: "April 16, 2025",
    content: <Typography>Overview of attendance module.</Typography>
  },
  "clock-in-out": {
    title: "Clock In/Out Process",
    lastUpdated: "April 16, 2025",
    content: <Typography>Clock in/out procedures.</Typography>
  },
  "geolocation": {
    title: "Geolocation Verification",
    lastUpdated: "April 16, 2025",
    content: <Typography>Using geolocation in attendance.</Typography>
  },
  "attendance-approval": {
    title: "Attendance Approval Workflow",
    lastUpdated: "April 16, 2025",
    content: <Typography>Approval process for attendance.</Typography>
  },
  "attendance-reports": {
    title: "Attendance Reports",
    lastUpdated: "April 16, 2025",
    content: <Typography>Attendance reports overview.</Typography>
  },

  // Leave
  "leave-overview": {
    title: "Leave Management Overview",
    lastUpdated: "April 16, 2025",
    content: <Typography>Overview of leave system.</Typography>
  },
  "leave-approval": {
    title: "Leave Approval Workflow",
    lastUpdated: "April 16, 2025",
    content: <Typography>Leave approval process explained.</Typography>
  },
  "leave-balances": {
    title: "Leave Balance Management",
    lastUpdated: "April 16, 2025",
    content: <Typography>Manage and view leave balances.</Typography>
  },

  // Holiday
  "holiday-overview": {
    title: "Holiday Overview",
    lastUpdated: "April 16, 2025",
    content: <Typography>Holiday management introduction.</Typography>
  },
  "managing-holidays": {
    title: "Managing Holidays",
    lastUpdated: "April 16, 2025",
    content: <Typography>Add and manage holidays.</Typography>
  },
  "holiday-types": {
    title: "Company-wide vs. Department Holidays",
    lastUpdated: "April 16, 2025",
    content: <Typography>Difference between holiday types.</Typography>
  },

  "salary-generation": {
    title: "Generating Salary Records",
    lastUpdated: "April 16, 2025",
    content: <Typography>Generate and process salary data.</Typography>
  },
  "salary-approval": {
    title: "Salary Approval Workflow",
    lastUpdated: "April 16, 2025",
    content: <Typography>Salary approval process.</Typography>
  },
  "payslip": {
    title: "Payslip Generation",
    lastUpdated: "April 16, 2025",
    content: <Typography>Download and view payslips.</Typography>
  },
  "uploading-documents": {
    title: "Uploading Documents",
    lastUpdated: "April 16, 2025",
    content: <Typography>Steps to upload documents.</Typography>
  },
  "managing-documents": {
    title: "Managing Documents",
    lastUpdated: "April 16, 2025",
    content: <Typography>Manage document storage.</Typography>
  },

  // Ticket
  "creating-tickets": {
    title: "Creating Support Tickets",
    lastUpdated: "April 16, 2025",
    content: <Typography>Create and submit support tickets.</Typography>
  },
  "managing-tickets": {
    title: "Managing Tickets",
    lastUpdated: "April 16, 2025",
    content: <Typography>How to manage tickets.</Typography>
  },
  "ticket-workflow": {
    title: "Ticket Workflow",
    lastUpdated: "April 16, 2025",
    content: <Typography>Support ticket workflow.</Typography>
  },

  // Resignation
  "resignation-overview": {
    title: "Resignation Overview",
    lastUpdated: "April 16, 2025",
    content: <Typography>Overview of resignation process.</Typography>
  },
  // Settings
  "account-settings": {
    title: "Account Settings",
    lastUpdated: "April 16, 2025",
    content: <Typography>Configure your account settings.</Typography>
  },
  "security-settings": {
    title: "Security Settings",
    lastUpdated: "April 16, 2025",
    content: <Typography>Manage password and 2FA settings.</Typography>
  },
  "notification-settings": {
    title: "Notification Settings",
    lastUpdated: "April 16, 2025",
    content: <Typography>Customize your notification preferences.</Typography>
  }

};

const Documentation = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const isTablet = useMediaQuery(theme.breakpoints.down('lg'));

  const [activeSection, setActiveSection] = useState("getting-started");
  const [activeSubsection, setActiveSubsection] = useState("introduction");
  const [expandedSections, setExpandedSections] = useState({
    "getting-started": true
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [mobileView, setMobileView] = useState('toc');

  const contentRef = useRef(null);

  // Handle section click
  const handleSectionClick = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));

    setActiveSection(sectionId);
    // Always expand the clicked section
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: true
    }));

    // Set active subsection to the first one in this section
    if (documentationSections[sectionId].subsections.length > 0) {
      setActiveSubsection(documentationSections[sectionId].subsections[0].id);
    }
  };

  // Handle subsection click
  const handleSubsectionClick = (sectionId, subsectionId) => {
    setActiveSection(sectionId);
    setActiveSubsection(subsectionId);

    // For mobile, switch to content view after selecting subsection
    if (isMobile) {
      setMobileView('content');
    }

    // Scroll to top of content area
    if (contentRef.current) {
      contentRef.current.scrollTop = 0;
    }
  };

  // Handle search query change
  const handleSearchChange = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);

    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    // Search through all sections and subsections
    const results = [];

    Object.values(documentationSections).forEach(section => {
      // Check if the section title matches
      if (section.title.toLowerCase().includes(query)) {
        results.push({
          type: 'section',
          id: section.id,
          title: section.title,
          parent: null
        });
      }

      // Check if any subsection matches
      section.subsections.forEach(subsection => {
        if (subsection.title.toLowerCase().includes(query)) {
          results.push({
            type: 'subsection',
            id: subsection.id,
            title: subsection.title,
            parent: section.id,
            parentTitle: section.title
          });
        }
      });
    });

    setSearchResults(results);
  };

  // Handle search result click
  const handleSearchResultClick = (result) => {
    if (result.type === 'section') {
      handleSectionClick(result.id);
    } else if (result.type === 'subsection') {
      setActiveSection(result.parent);
      setActiveSubsection(result.id);
      setExpandedSections(prev => ({
        ...prev,
        [result.parent]: true
      }));
    }

    setSearchQuery('');
    setSearchResults([]);

    // For mobile, switch to content view after selecting a search result
    if (isMobile) {
      setMobileView('content');
    }
  };

  // Generate Table of Contents
  const renderTableOfContents = () => (
    <Box>
      {/* Search */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search documentation..."
          value={searchQuery}
          onChange={handleSearchChange}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon color="action" />
              </InputAdornment>
            ),
          }}
          size="small"
        />
      </Box>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" gutterBottom>
            Search Results
          </Typography>
          <List disablePadding>
            {searchResults.map((result, index) => (
              <ListItem
                key={index}
                button
                dense
                onClick={() => handleSearchResultClick(result)}
                sx={{
                  borderLeft: 3,
                  borderColor: 'primary.main',
                  pl: 2,
                  mb: 1,
                  bgcolor: 'background.paper',
                  boxShadow: 1,
                  borderRadius: '4px'
                }}
              >
                <ListItemText
                  primary={result.title}
                  secondary={result.type === 'subsection' ? `In: ${result.parentTitle}` : 'Section'}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* Section list */}
      <List component="nav" sx={{ bgcolor: 'background.paper', borderRadius: 1, boxShadow: 1 }}>
        {Object.values(documentationSections).map((section) => (
          <React.Fragment key={section.id}>
            <ListItem
              button
              onClick={() => handleSectionClick(section.id)}
              sx={{
                bgcolor: activeSection === section.id ? 'primary.soft' : 'transparent',
                color: activeSection === section.id ? 'primary.main' : 'text.primary',
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <ListItemIcon sx={{ minWidth: 40, color: activeSection === section.id ? 'primary.main' : 'text.secondary' }}>
                {section.icon}
              </ListItemIcon>
              <ListItemText
                primary={section.title}
                primaryTypographyProps={{ fontWeight: activeSection === section.id ? 'medium' : 'normal' }}
              />
              {expandedSections[section.id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
            </ListItem>
            <Collapse in={expandedSections[section.id]} timeout="auto" unmountOnExit>
              <List component="div" disablePadding>
                {section.subsections.map((subsection) => (
                  <ListItem
                    key={subsection.id}
                    button
                    onClick={() => handleSubsectionClick(section.id, subsection.id)}
                    sx={{
                      pl: 4,
                      bgcolor: (activeSection === section.id && activeSubsection === subsection.id)
                        ? 'primary.lighter'
                        : 'background.default',
                      borderLeft: 3,
                      borderColor: (activeSection === section.id && activeSubsection === subsection.id)
                        ? 'primary.main'
                        : 'transparent'
                    }}
                  >
                    <ListItemText
                      primary={subsection.title}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: (activeSection === section.id && activeSubsection === subsection.id) ? 'medium' : 'normal'
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Collapse>
          </React.Fragment>
        ))}
      </List>
    </Box>
  );

  // Render content based on active section/subsection
  const renderContent = () => {
    // Check if we have sample content for the active subsection
    if (sampleContent[activeSubsection]) {
      const contentData = sampleContent[activeSubsection];

      return (
        <Box>
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'flex-start', sm: 'center' },
            mb: 3
          }}>
            <Box>
              <Breadcrumbs aria-label="breadcrumb">
                <Link
                  underline="hover"
                  color="inherit"
                  onClick={() => handleSectionClick(activeSection)}
                  sx={{ cursor: 'pointer' }}
                >
                  {documentationSections[activeSection].title}
                </Link>
                <Typography color="text.primary">
                  {contentData.title}
                </Typography>
              </Breadcrumbs>
              <Typography variant="caption" color="text.secondary">
                Last updated: {contentData.lastUpdated}
              </Typography>
            </Box>

            <Box sx={{
              display: 'flex',
              gap: 1,
              mt: { xs: 2, sm: 0 }
            }}>
              <Button
                startIcon={<PrintIcon />}
                size="small"
                onClick={() => window.print()}
              >
                Print
              </Button>
              <Button
                startIcon={<DownloadIcon />}
                size="small"
              >
                PDF
              </Button>
              <Button
                startIcon={<CopyIcon />}
                size="small"
                onClick={() => {
                  const content = document.querySelector('.documentation-content');
                  if (content) {
                    navigator.clipboard.writeText(content.innerText);
                    alert('Content copied to clipboard!');
                  }
                }}
              >
                Copy
              </Button>
            </Box>
          </Box>

          <Paper
            sx={{
              p: { xs: 2, md: 4 },
              borderRadius: 2,
              boxShadow: 1,
              mb: 4
            }}
            className="documentation-content"
          >
            {contentData.content}
          </Paper>

          <Paper sx={{ p: 3, borderRadius: 2, bgcolor: 'background.default' }}>
            <Typography variant="subtitle2" gutterBottom>
              Was this documentation helpful?
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
              <Button
                variant="outlined"
                color="success"
                startIcon={<CheckIcon />}
                size="small"
              >
                Yes
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<ClearIcon />}
                size="small"
              >
                No
              </Button>
              <Button
                variant="text"
                color="primary"
                size="small"
                component={RouterLink}
                to="/help-center#contact-form"
              >
                Suggest Improvements
              </Button>
            </Box>
          </Paper>
        </Box>
      );
    }

    // Default content if no sample content is found
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary" gutterBottom>
          Content Coming Soon
        </Typography>
        <Typography variant="body2" color="text.secondary">
          We're still working on this section of the documentation.
        </Typography>
      </Box>
    );
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pt: 3, pb: 8 }}>
      <Container maxWidth="xl">
        {/* Breadcrumbs navigation */}
        <Breadcrumbs sx={{ mb: 3 }}>
          <Link underline="hover" color="inherit" component={RouterLink} to="/">
            Home
          </Link>
          <Typography color="text.primary">Documentation</Typography>
        </Breadcrumbs>

        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h3"
            component="h1"
            gutterBottom
            fontWeight="bold"
          >
            TeamSync Documentation
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
          >
            Comprehensive guides and reference materials for TeamSync users, managers, and administrators.
          </Typography>

          {/* Role filter chips */}
          <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
            <Chip
              icon={<AdminIcon />}
              label="Administrator"
              color="error"
              variant="outlined"
              onClick={() => { }}
            />
            <Chip
              icon={<ManagerIcon />}
              label="Manager"
              color="warning"
              variant="outlined"
              onClick={() => { }}
            />
            <Chip
              icon={<EmployeeIcon />}
              label="Employee"
              color="info"
              variant="outlined"
              onClick={() => { }}
            />
          </Box>
        </Box>

        {/* Mobile view toggler */}
        {isMobile && (
          <Tabs
            value={mobileView}
            onChange={(e, newValue) => setMobileView(newValue)}
            variant="fullWidth"
            sx={{ mb: 2 }}
          >
            <Tab label="Contents" value="toc" />
            <Tab label="Documentation" value="content" />
          </Tabs>
        )}

        {/* Main content */}
        <Grid container spacing={4}>
          {/* Left column - Table of Contents */}
          {(!isMobile || mobileView === 'toc') && (
            <Grid item xs={12} md={3}>
              {renderTableOfContents()}
            </Grid>
          )}

          {/* Right column - Content */}
          {(!isMobile || mobileView === 'content') && (
            <Grid item xs={12} md={9} ref={contentRef}>
              {renderContent()}
            </Grid>
          )}
        </Grid>
      </Container>
    </Box>
  );
};

export default Documentation;