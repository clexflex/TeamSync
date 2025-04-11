
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
│  │  │  │  ├─ AddAttendanceForm.jsx
│  │  │  │  ├─ AdminAttendanceApproval.jsx
│  │  │  │  ├─ AdminAttendanceManagement.jsx
│  │  │  │  ├─ AdminAttendanceReport.jsx
│  │  │  │  ├─ AdminSummary.jsx
│  │  │  │  └─ HolidayManagement.jsx
│  │  │  ├─ department
│  │  │  │  ├─ AddDepartment.jsx
│  │  │  │  ├─ DepartmentList.jsx
│  │  │  │  └─ EditDepartment.jsx
│  │  │  ├─ document
│  │  │  │  ├─ DocumentCenter.jsx
│  │  │  │  └─ UserDocumentCenter.jsx
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
   │        ├─ payslip_Aksh_February_2025_1744028045069.pdf
   │        ├─ payslip_Aksh_February_2025_1744028085319.pdf
   │        ├─ payslip_Aksh_February_2025_1744028085371.pdf
   │        ├─ payslip_Aksh_February_2025_1744028151434.pdf
   │        ├─ payslip_Aksh_February_2025_1744028151478.pdf
   │        ├─ payslip_Aksh_February_2025_1744029121513.pdf
   │        ├─ payslip_Aksh_February_2025_1744029121544.pdf
   │        ├─ payslip_Aksh_February_2025_1744031317318.pdf
   │        ├─ payslip_Aksh_February_2025_1744031317382.pdf
   │        ├─ payslip_Aksh_February_2025_1744031759119.pdf
   │        ├─ payslip_Aksh_February_2025_1744031759188.pdf
   │        ├─ payslip_Aksh_February_2025_1744032153101.pdf
   │        ├─ payslip_Aksh_February_2025_1744032153158.pdf
   │        ├─ payslip_Aksh_February_2025_1744032661513.pdf
   │        ├─ payslip_Aksh_February_2025_1744032661575.pdf
   │        ├─ payslip_Aksh_February_2025_1744032705870.pdf
   │        ├─ payslip_Aksh_February_2025_1744032705915.pdf
   │        ├─ payslip_Aksh_February_2025_1744033094816.pdf
   │        ├─ payslip_Aksh_February_2025_1744033094878.pdf
   │        ├─ payslip_Aksh_February_2025_1744033133229.pdf
   │        ├─ payslip_Aksh_February_2025_1744033133267.pdf
   │        ├─ payslip_Aksh_February_2025_1744098466157.pdf
   │        ├─ payslip_Aksh_February_2025_1744098466166.pdf
   │        ├─ payslip_Aksh_February_2025_1744103037702.pdf
   │        ├─ payslip_Aksh_February_2025_1744103037763.pdf
   │        ├─ payslip_Aksh_February_2025_1744103083356.pdf
   │        ├─ payslip_Aksh_February_2025_1744103083402.pdf
   │        ├─ payslip_Aksh_February_2025_1744103107083.pdf
   │        ├─ payslip_Aksh_February_2025_1744103107129.pdf
   │        ├─ payslip_Aksh_February_2025_1744103151364.pdf
   │        ├─ payslip_Aksh_February_2025_1744103151405.pdf
   │        ├─ payslip_Aksh_February_2025_1744103235567.pdf
   │        ├─ payslip_Aksh_February_2025_1744103235613.pdf
   │        ├─ payslip_Aksh_February_2025_1744108518107.pdf
   │        ├─ payslip_Aksh_February_2025_1744108518143.pdf
   │        ├─ payslip_Aksh_February_2025_1744110525526.pdf
   │        ├─ payslip_Aksh_February_2025_1744110525589.pdf
   │        ├─ payslip_Vikas_Kumar_February_2025_1744309618012.pdf
   │        ├─ payslip_Vikas_Kumar_March_2025_1744026711946.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744025401233.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744031256140.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744031256205.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744031377020.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744031377079.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744032722399.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744032722445.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744096101325.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744096101381.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744097426921.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744097426989.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744098461769.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744098461831.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744098683377.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744098683439.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744099430721.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744099430749.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744099694175.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744099694236.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744099748067.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744099748084.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744100458932.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744100458959.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744102260506.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744102260548.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744110552308.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744110552371.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744111247208.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744111247266.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744111470413.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744111470439.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744111739971.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744111740036.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744112227132.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744112227184.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744112323228.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744112323290.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744112354713.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744112354781.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744112378003.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744112378062.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744112531428.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744112531472.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744114174740.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744114174789.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744114295307.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744114295339.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744114334537.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744114334584.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744114343009.pdf
   │        ├─ payslip_Vishwas_Dhoga_February_2025_1744114343025.pdf
   │        ├─ payslip_Vishwas_Dhoga_March_2025_1744117883894.pdf
   │        ├─ payslip_Vishwas_Dhoga_March_2025_1744118201504.pdf
   │        ├─ payslip_Vishwas_Dhoga_March_2025_1744118201575.pdf
   │        ├─ payslip_Vishwas_Dhoga_March_2025_1744118990157.pdf
   │        ├─ payslip_Vishwas_Dhoga_March_2025_1744118990181.pdf
   │        ├─ payslip_Vishwas_Dhoga_March_2025_1744178468574.pdf
   │        ├─ payslip_ram_charan_February_2025_1744026087018.pdf
   │        ├─ payslip_ram_charan_February_2025_1744026140106.pdf
   │        ├─ payslip_ram_charan_February_2025_1744026238565.pdf
   │        ├─ payslip_ram_charan_February_2025_1744026298537.pdf
   │        ├─ payslip_ram_charan_February_2025_1744031296259.pdf
   │        ├─ payslip_ram_charan_February_2025_1744031296276.pdf
   │        ├─ payslip_ram_charan_February_2025_1744095967914.pdf
   │        ├─ payslip_ram_charan_February_2025_1744095967980.pdf
   │        ├─ payslip_ram_charan_February_2025_1744096001222.pdf
   │        ├─ payslip_ram_charan_February_2025_1744096001246.pdf
   │        ├─ payslip_ram_charan_February_2025_1744111217166.pdf
   │        ├─ payslip_ram_charan_February_2025_1744111217225.pdf
   │        ├─ payslip_{
  _id: new ObjectId('67ce8d9a738340c12972ae38'),
  name: 'Vishwas Dhoga',
  email: 'dhoga@gmail.com',
  role: 'employee'
}_March_2025_1743970890828.pdf
   │        ├─ payslip_{
  _id: new ObjectId('67ce8d9a738340c12972ae38'),
  name: 'Vishwas Dhoga',
  email: 'dhoga@gmail.com',
  role: 'employee'
}_March_2025_1743970890858.pdf
   │        ├─ payslip_{
  _id: new ObjectId('67ce8d9a738340c12972ae38'),
  name: 'Vishwas Dhoga',
  email: 'dhoga@gmail.com',
  role: 'employee'
}_March_2025_1743970895351.pdf
   │        ├─ payslip_{
  _id: new ObjectId('67ce8d9a738340c12972ae38'),
  name: 'Vishwas Dhoga',
  email: 'dhoga@gmail.com',
  role: 'employee'
}_March_2025_1743970895366.pdf
   │        ├─ payslip_{
  _id: new ObjectId('67ce8d9a738340c12972ae38'),
  name: 'Vishwas Dhoga',
  email: 'dhoga@gmail.com',
  role: 'employee'
}_March_2025_1743972459187.pdf
   │        ├─ payslip_{
  _id: new ObjectId('67ce8d9a738340c12972ae38'),
  name: 'Vishwas Dhoga',
  email: 'dhoga@gmail.com',
  role: 'employee'
}_March_2025_1743972459217.pdf
   │        └─ payslip_{  _id: new ObjectId('67ce8d9a738340c12972ae38'),  name: 'Vishwas Dhoga',  email: 'dhoga@gmail.com',  role: 'employee'}_March_2025_1743970094431.pdf
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
   │  ├─ setting.js
   │  ├─ team.js
   │  ├─ ticket.js
   │  └─ userProfile.js
   ├─ socket.js
   ├─ userSeed.js
   ├─ utils
   │  └─ logger.js
   └─ vercel.json

```