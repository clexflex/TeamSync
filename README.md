
```
TeamSync
├─ .DS_Store
├─ README.md
├─ frontend
│  ├─ .DS_Store
│  ├─ README.md
│  ├─ eslint.config.js
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ postcss.config.js
│  ├─ public
│  │  └─ images
│  │     ├─ android-chrome-192x192.png
│  │     ├─ android-chrome-512x512.png
│  │     ├─ apple-touch-icon.png
│  │     ├─ favicon-16x16.png
│  │     ├─ favicon-32x32.png
│  │     ├─ favicon.ico
│  │     └─ site.webmanifest
│  ├─ src
│  │  ├─ .DS_Store
│  │  ├─ App.jsx
│  │  ├─ Unauthorized.jsx
│  │  ├─ assets
│  │  ├─ components
│  │  │  ├─ .DS_Store
│  │  │  ├─ EmployeeDashboard
│  │  │  │  ├─ AttendanceCalendar.jsx
│  │  │  │  ├─ AttendanceHistoryModal.jsx
│  │  │  │  ├─ EmployeeAttendanceForm.jsx
│  │  │  │  ├─ EmployeeSummary.jsx
│  │  │  │  ├─ RealTimeAttendanceForm.jsx
│  │  │  │  └─ ViewProfile.jsx
│  │  │  ├─ ManagerDashboard
│  │  │  │  ├─ ManagerSummary.jsx
│  │  │  │  └─ TeamAttendanceApproval.jsx
│  │  │  ├─ TeamManagement
│  │  │  │  ├─ AddTeam.jsx
│  │  │  │  ├─ EditTeam.jsx
│  │  │  │  ├─ TeamList.jsx
│  │  │  │  └─ TeamMembers.jsx
│  │  │  ├─ dashboard
│  │  │  │  ├─ AddAttendanceForm.jsx
│  │  │  │  ├─ AdminAttendanceAnalytics.jsx
│  │  │  │  ├─ AdminAttendanceAnalytics2.jsx
│  │  │  │  ├─ AdminAttendanceApproval.jsx
│  │  │  │  ├─ AdminAttendanceManagement.jsx
│  │  │  │  ├─ AdminAttendanceReport.jsx
│  │  │  │  ├─ AdminSummary.jsx
│  │  │  │  ├─ HolidayManagement.jsx
│  │  │  │  └─ LiveAttendanceDashboard.jsx
│  │  │  ├─ department
│  │  │  │  ├─ AddDepartment.jsx
│  │  │  │  ├─ DepartmentList.jsx
│  │  │  │  └─ EditDepartment.jsx
│  │  │  ├─ document
│  │  │  │  ├─ DocumentCenter.jsx
│  │  │  │  └─ UserDocumentCenter.jsx
│  │  │  ├─ leave
│  │  │  │  ├─ AddLeave.jsx
│  │  │  │  ├─ AdminLeaveList.jsx
│  │  │  │  └─ LeaveList.jsx
│  │  │  ├─ leavePolicy
│  │  │  │  ├─ AssignLeavePolicy.jsx
│  │  │  │  ├─ CreateLeavePolicy.jsx
│  │  │  │  ├─ EditLeavePolicy.jsx
│  │  │  │  ├─ LeaveBalanceReset.jsx
│  │  │  │  ├─ LeavePolicyList.jsx
│  │  │  │  └─ ViewLeavePolicy.jsx
│  │  │  ├─ modal
│  │  │  │  └─ TaskDetailsModal.jsx
│  │  │  ├─ notifications
│  │  │  │  ├─ NotificationBell.jsx
│  │  │  │  ├─ NotificationCreator.jsx
│  │  │  │  ├─ NotificationList.jsx
│  │  │  │  └─ NotificationsPage.jsx
│  │  │  ├─ resignation
│  │  │  │  ├─ ResignationDetail.jsx
│  │  │  │  ├─ ResignationList.jsx
│  │  │  │  └─ SubmitResignationForm.jsx
│  │  │  ├─ salary
│  │  │  │  ├─ AdminSalaryDashboard.jsx
│  │  │  │  ├─ SalaryDetail.jsx
│  │  │  │  ├─ SalaryGeneration.jsx
│  │  │  │  ├─ SalaryList.jsx
│  │  │  │  └─ UserSalaryHistory.jsx
│  │  │  ├─ shared
│  │  │  │  └─ AttendanceTable.jsx
│  │  │  ├─ ticket
│  │  │  │  ├─ AddTicket.jsx
│  │  │  │  ├─ AdminTicketDashboard.jsx
│  │  │  │  ├─ TicketList.jsx
│  │  │  │  └─ ViewTicket.jsx
│  │  │  └─ userProfile
│  │  │     ├─ CreateUserProfile.jsx
│  │  │     ├─ EditUserProfile.jsx
│  │  │     ├─ UserProfileList.jsx
│  │  │     └─ ViewUserProfile.jsx
│  │  ├─ config.js
│  │  ├─ context
│  │  │  ├─ authContext.jsx
│  │  │  └─ notificationContext.jsx
│  │  ├─ hooks
│  │  │  ├─ useAttendanceTracking.js
│  │  │  └─ useSocket.js
│  │  ├─ index.css
│  │  ├─ main.jsx
│  │  ├─ pages
│  │  │  ├─ AdminDashboard.jsx
│  │  │  ├─ EmployeeDashboard.jsx
│  │  │  ├─ Login.jsx
│  │  │  ├─ ManagerDashboard.jsx
│  │  │  ├─ NotFound.jsx
│  │  │  └─ UserMenu.jsx
│  │  └─ utils
│  │     ├─ PrivateRoutes.jsx
│  │     ├─ RoleBaseRoutes.jsx
│  │     └─ logger.js
│  ├─ tailwind.config.js
│  ├─ vercel.json
│  └─ vite.config.js
└─ server
   ├─ .DS_Store
   ├─ config
   │  └─ firebase.js
   ├─ controllers
   │  ├─ attendanceController.js
   │  ├─ authController.js
   │  ├─ dashboardController.js
   │  ├─ departmentController.js
   │  ├─ documentController.js
   │  ├─ employeeController.js
   │  ├─ holidayController.js
   │  ├─ leaveController.js
   │  ├─ managerController.js
   │  ├─ notificationController.js
   │  ├─ resignationController.js
   │  ├─ salaryController.js
   │  ├─ settingController.js
   │  ├─ teamController.js
   │  ├─ ticketController.js
   │  └─ userProfileController.js
   ├─ cron.js
   ├─ db
   │  └─ db.js
   ├─ index.js
   ├─ logs
   ├─ middleware
   │  ├─ authMiddleware.js
   │  └─ loggerMiddleware.js
   ├─ models
   │  ├─ Attendance.js
   │  ├─ Department.js
   │  ├─ Document.js
   │  ├─ Employee.js
   │  ├─ Holiday.js
   │  ├─ Leave.js
   │  ├─ LeavePolicy.js
   │  ├─ Manager.js
   │  ├─ Notification.js
   │  ├─ ResignationRequest.js
   │  ├─ Salary.js
   │  ├─ Team.js
   │  ├─ Ticket.js
   │  ├─ User.js
   │  └─ UserProfile.js
   ├─ package-lock.json
   ├─ package.json
   ├─ public
   │  ├─ .DS_Store
   │  └─ uploads
   │     ├─ .DS_Store
   │     ├─ 1735802768253.jpg
   │     ├─ 1735802774978.jpg
   │     ├─ 1735897601209.png
   │     ├─ 1735902074948.jpeg
   │     ├─ 1735902089229.jpeg
   │     ├─ 1735902460547.png
   │     ├─ 1735902521421.png
   │     ├─ 1735984112939.jpeg
   │     ├─ 1735984259909.jpeg
   │     ├─ 1735984329393.jpeg
   │     ├─ 1736507958874.jpeg
   │     ├─ 1736508089507.jpeg
   │     ├─ 1736508102378.jpeg
   │     ├─ 1736508231700.jpeg
   │     ├─ 1736509112170.jpeg
   │     ├─ 1736509357407.jpeg
   │     ├─ 1738229686735.jpeg
   │     ├─ 1738229839505.jpeg
   │     ├─ 1738318197007.jpeg
   │     ├─ documents
   │     │  ├─ doc-1744012265062-549387387.pdf
   │     │  └─ doc-1744012439609-77932150.pdf
   │     ├─ leave-documents
   │     │  ├─ 1735902074948.jpeg
   │     │  ├─ leave-1741773189991-18241470.jpeg
   │     │  ├─ leave-1741856751401-449084875.png
   │     │  ├─ leave-1741856751402-559934109.pdf
   │     │  └─ leave-1741856751403-778803972.docx
   │     └─ payslips
   │        ├─ payslip_Vishwas_Dhoga_March_2025_1744608313426.pdf
   │        └─ payslip_Vishwas_Dhoga_March_2025_1744608313472.pdf
   ├─ routes
   │  ├─ attendance.js
   │  ├─ auth.js
   │  ├─ dashboard.js
   │  ├─ department.js
   │  ├─ document.js
   │  ├─ employee.js
   │  ├─ holiday.js
   │  ├─ leave.js
   │  ├─ manager.js
   │  ├─ notification.js
   │  ├─ resignation.js
   │  ├─ salary.js
   │  ├─ seedAdmin.js
   │  ├─ setting.js
   │  ├─ team.js
   │  ├─ ticket.js
   │  └─ userProfile.js
   ├─ socket.js
   ├─ userSeed.js
   ├─ utils
   │  ├─ cloudinary.js
   │  ├─ firebase-multer.js
   │  └─ logger.js
   └─ vercel.json

```