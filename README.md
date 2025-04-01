
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
│  │  │  │  ├─ AdminAttendanceApproval.jsx
│  │  │  │  ├─ AdminAttendanceReport.jsx
│  │  │  │  ├─ AdminSummary.jsx
│  │  │  │  └─ HolidayManagement.jsx
│  │  │  ├─ department
│  │  │  │  ├─ AddDepartment.jsx
│  │  │  │  ├─ DepartmentList.jsx
│  │  │  │  └─ EditDepartment.jsx
│  │  │  ├─ employee
│  │  │  │  ├─ .DS_Store
│  │  │  │  ├─ AddEmployee.jsx
│  │  │  │  ├─ EditEmployee Backup.js
│  │  │  │  ├─ EditEmployee.jsx
│  │  │  │  ├─ EmployeeList.jsx
│  │  │  │  └─ ViewEmployee.jsx
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
│  │  │  ├─ manager
│  │  │  │  ├─ AddManager.jsx
│  │  │  │  ├─ EditManager.jsx
│  │  │  │  ├─ ManagersList.jsx
│  │  │  │  └─ ViewManager.jsx
│  │  │  ├─ modal
│  │  │  │  └─ TaskDetailsModal.jsx
│  │  │  ├─ salary
│  │  │  │  ├─ AddSalary.jsx
│  │  │  │  └─ ViewSalary.jsx
│  │  │  ├─ shared
│  │  │  │  └─ AttendanceTable.jsx
│  │  │  └─ userProfile
│  │  │     ├─ CreateUserProfile.jsx
│  │  │     ├─ EditUserProfile.jsx
│  │  │     ├─ UserProfileList.jsx
│  │  │     └─ ViewUserProfile.jsx
│  │  ├─ config.js
│  │  ├─ context
│  │  │  └─ authContext.jsx
│  │  ├─ hooks
│  │  │  └─ useAttendanceTracking.js
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
   ├─ controllers
   │  ├─ attendanceController.js
   │  ├─ authController.js
   │  ├─ dashboardController.js
   │  ├─ departmentController.js
   │  ├─ employeeController.js
   │  ├─ holidayController.js
   │  ├─ leaveController.js
   │  ├─ managerController.js
   │  ├─ salaryController.js
   │  ├─ settingController.js
   │  ├─ teamController.js
   │  └─ userProfileController.js
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
   │  ├─ Employee.js
   │  ├─ Holiday.js
   │  ├─ Leave.js
   │  ├─ LeavePolicy.js
   │  ├─ Manager.js
   │  ├─ Salary.js
   │  ├─ Team.js
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
   │     └─ leave-documents
   │        ├─ 1735902074948.jpeg
   │        ├─ leave-1741773189991-18241470.jpeg
   │        ├─ leave-1741856751401-449084875.png
   │        ├─ leave-1741856751402-559934109.pdf
   │        └─ leave-1741856751403-778803972.docx
   ├─ routes
   │  ├─ attendance.js
   │  ├─ auth.js
   │  ├─ dashboard.js
   │  ├─ department.js
   │  ├─ employee.js
   │  ├─ holiday.js
   │  ├─ leave.js
   │  ├─ manager.js
   │  ├─ salary.js
   │  ├─ setting.js
   │  ├─ team.js
   │  └─ userProfile.js
   ├─ userSeed.js
   ├─ utils
   │  └─ logger.js
   └─ vercel.json

```