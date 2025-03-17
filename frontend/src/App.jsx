import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import PrivateRoutes from "./utils/PrivateRoutes";
import RoleBaseRoutes from "./utils/RoleBaseRoutes";
import AdminSummary from "./components/dashboard/AdminSummary";
import DepartmentList from "./components/department/DepartmentList";
import AddDepartment from "./components/department/AddDepartment";
import EditDepartment from "./components/department/EditDepartment";
import EmployeeList from "./components/employee/EmployeeList";
import AddEmployee from "./components/employee/AddEmployee";
import ViewEmployee from "./components/employee/ViewEmployee";
import EditEmployee from "./components/employee/EditEmployee";
import AddSalary from "./components/salary/AddSalary";
import ViewSalary from "./components/salary/ViewSalary";
import EmployeeSummary from "./components/EmployeeDashboard/EmployeeSummary";
import ViewProfile from "./components/EmployeeDashboard/ViewProfile";
import LeaveList from "./components/leave/LeaveList";
import AddLeave from "./components/leave/AddLeave";
import AdminLeaveList from "./components/leave/AdminLeaveList";
import Unauthorized from "./Unauthorized";
import NotFound from "./pages/NotFound";
import TeamMembers from "./components/TeamManagement/TeamMembers";
import TeamList from "./components/TeamManagement/TeamList";
import ManagerSummary from "./components/ManagerDashboard/ManagerSummary";
import ManagerDashboard from "./pages/ManagerDashboard";
import ManagersList from "./components/manager/ManagersList";
import AddManager from "./components/manager/AddManager";
import EditManager from "./components/manager/EditManager";
import ViewManager from "./components/manager/ViewManager";
import AddTeam from "./components/TeamManagement/AddTeam";
import EditTeam from "./components/TeamManagement/EditTeam";
import HolidayManagement from "./components/dashboard/HolidayManagement";
import EmployeeAttendanceForm from "./components/EmployeeDashboard/EmployeeAttendanceForm";
import TeamAttendanceApproval from "./components/ManagerDashboard/TeamAttendanceApproval";
import AdminAttendanceApproval from "./components/dashboard/AdminAttendanceApproval";
import AdminAttendanceReport from "./components/dashboard/AdminAttendanceReport";
import CreateUserProfile from "./components/userProfile/CreateUserProfile";
import UserProfileList from "./components/userProfile/UserProfileList";
import ViewUserProfile from "./components/userProfile/ViewUserProfile";
import EditUserProfile from "./components/userProfile/EditUserProfile";
import LeavePolicyList from "./components/leavePolicy/LeavePolicyList";
import ViewLeavePolicy from "./components/leavePolicy/ViewLeavePolicy";
import CreateLeavePolicy from "./components/leavePolicy/CreateLeavePolicy";
import EditLeavePolicy from "./components/leavePolicy/EditLeavePolicy";
import AssignLeavePolicy from "./components/leavePolicy/AssignLeavePolicy";


const DEFAULT_REDIRECT = "/admin-dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to={DEFAULT_REDIRECT} />} />
        <Route path="/login" element={<Login />} />

        {/* Admin Dashboard */}
        <Route
          path="/admin-dashboard"
          element={
            <PrivateRoutes>
              <RoleBaseRoutes requiredRole={["admin"]}>
                <AdminDashboard />
              </RoleBaseRoutes>
            </PrivateRoutes>
          }
        >
          <Route index element={<AdminSummary />} />
          <Route path="departments" element={<DepartmentList />} />
          <Route path="add-department" element={<AddDepartment />} />
          <Route path="department/:id" element={<EditDepartment />} />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="add-employee" element={<AddEmployee />} />
          <Route path="employees/:id" element={<ViewEmployee />} />
          <Route path="employees/edit/:id" element={<EditEmployee />} />
          <Route path="leaves" element={<AdminLeaveList />} />
          <Route path="employees/leaves/:id" element={<LeaveList />} />
          <Route path="employees/salary/:id" element={<ViewSalary />} />
          <Route path="salary/add" element={<AddSalary />} />
          <Route path="holidays" element={<HolidayManagement />} />

          <Route path="attendance-approval" element={<AdminAttendanceApproval />} />
          <Route path="attendance/reports" element={<AdminAttendanceReport />} />
          <Route path="managers" element={<ManagersList />} />
          <Route path="add-manager" element={<AddManager />} />
          <Route path="managers/edit/:id" element={<EditManager />} />
          <Route path="manager/:id" element={<ViewManager />} />

          <Route path="team" element={<TeamList />} />
          <Route path="team/create" element={<AddTeam />} />
          <Route path="team/edit/:teamId" element={<EditTeam />} />
          <Route path="team/members/:teamId" element={<TeamMembers />} />

          <Route path="user-profiles" element={<UserProfileList />} />
          <Route path="user-profile/create" element={<CreateUserProfile />} />
          <Route path="user-profile/:id" element={<ViewUserProfile />} />
          <Route path="user-profile/edit/:id" element={<EditUserProfile />} />

          <Route path="leave-policies" element={<LeavePolicyList />} />
          <Route path="leave-policy/:id" element={<ViewLeavePolicy />} />
          <Route path="leave-policy/create" element={<CreateLeavePolicy />} />
          <Route path="leave-policy/edit/:id" element={<EditLeavePolicy />} />
          <Route path="leave-policy/assign/:id" element={<AssignLeavePolicy />} />
        </Route>

        {/* Employee Dashboard */}
        <Route
          path="/employee-dashboard"
          element={
            <PrivateRoutes>
              <RoleBaseRoutes requiredRole={["employee"]}>
                <EmployeeDashboard />
              </RoleBaseRoutes>
            </PrivateRoutes>
          }
        >
          <Route index element={<EmployeeSummary />} />
          <Route path="profile/:id" element={<ViewProfile />} />
          <Route path="leaves/:id" element={<LeaveList />} />
          <Route path="add-leave" element={<AddLeave />} />
          <Route path="salary/:id" element={<ViewSalary />} />
          <Route path="attendance-form" element={<EmployeeAttendanceForm />} />
          <Route path="user-profile/:id" element={<ViewUserProfile />} />
        </Route>

        {/* Manager Dashboard */}
        <Route
          path="/manager-dashboard"
          element={
            <PrivateRoutes>
              <RoleBaseRoutes requiredRole={["manager"]}>
                <ManagerDashboard />
              </RoleBaseRoutes>
            </PrivateRoutes>
          }
        >
          <Route index element={<ManagerSummary />} />

          <Route path="team" element={<TeamList />} />
          <Route path="team/create" element={<AddTeam />} />
          <Route path="team/edit/:teamId" element={<EditTeam />} />
          <Route path="team/members/:teamId" element={<TeamMembers />} />
          <Route path="attendance-approval" element={<TeamAttendanceApproval />} />
          <Route path="attendance-form" element={<EmployeeAttendanceForm />} />
          <Route path="leaves/:id" element={<LeaveList />} />
          <Route path="add-leave" element={<AddLeave />} />
          <Route path="salary/:id" element={<ViewSalary />} />
          <Route path="user-profile/:id" element={<ViewUserProfile />} />
        </Route>

        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
