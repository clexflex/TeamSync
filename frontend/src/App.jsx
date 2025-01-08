import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import Login from "./pages/Login"
import AdminDashboard from "./pages/AdminDashboard"
import EmployeeDashboard from "./pages/EmployeeDashboard"
import PrivateRoutes from "./utils/PrivateRoutes"
import RoleBaseRoutes from "./utils/RoleBaseRoutes"
import AdminSummary from "./components/dashboard/AdminSummary"
import DepartmentList from "./components/department/DepartmentList"
import AddDepartment from "./components/department/AddDepartment"
import EditDepartment from "./components/department/EditDepartment"
import EmployeeList from "./components/employee/EmployeeList"
import AddEmployee from "./components/employee/AddEmployee"
import ViewEmployee from "./components/employee/ViewEmployee"
import EditEmployee from "./components/employee/EditEmployee"
import AddSalary from "./components/salary/AddSalary"
import ViewSalary from "./components/salary/ViewSalary"
import EmployeeSummary from "./components/EmployeeDashboard/EmployeeSummary"
import ViewProfile from "./components/EmployeeDashboard/ViewProfile"
import LeaveList from "./components/leave/LeaveList"
import AddLeave from "./components/leave/AddLeave"
import EmployeeSetting from "./components/EmployeeDashboard/EmployeeSetting"
import AdminSetting from "./components/dashboard/AdminSetting"
import AdminLeaveList from "./components/leave/AdminLeaveList"
import AdminLeaveDetail from "./components/leave/AdminLeaveDetail"
import Unauthorized from "./Unauthorized"

function App() {
  
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin-dashboard" />}></Route>
        <Route path="/login" element={<Login />}></Route>
        {/* Admin Dashboard */}
        <Route path="/admin-dashboard" element={
          <PrivateRoutes>
            <RoleBaseRoutes requiredRole={["admin"]}>
              <AdminDashboard />
            </RoleBaseRoutes>
          </PrivateRoutes>

        }>
          <Route index element={<AdminSummary />} ></Route>

          <Route path="/admin-dashboard/departments" element={<DepartmentList />} ></Route>
          <Route path="/admin-dashboard/add-department" element={<AddDepartment />} ></Route>
          <Route path="/admin-dashboard/department/:id" element={<EditDepartment />} ></Route>

          <Route path="/admin-dashboard/employees" element={<EmployeeList />} ></Route>
          <Route path="/admin-dashboard/add-employee" element={<AddEmployee />} ></Route>
          <Route path="/admin-dashboard/employees/:id" element={<ViewEmployee />} ></Route>
          <Route path="/admin-dashboard/employees/edit/:id" element={<EditEmployee />} ></Route>
          
          <Route path="/admin-dashboard/leaves" element={<AdminLeaveList />} ></Route>
          <Route path="/admin-dashboard/leaves/:id" element={<AdminLeaveDetail />} ></Route>
          <Route path="/admin-dashboard/employees/leaves/:id" element={<LeaveList />} ></Route>

          <Route path="/admin-dashboard/employees/salary/:id" element={<ViewSalary />} ></Route>
          <Route path="/admin-dashboard/salary/add" element={<AddSalary />} ></Route>

          <Route path="/admin-dashboard/setting" element={<AdminSetting /> } ></Route>

        </Route>
        {/* Employee Dashboard */}
        <Route path="/employee-dashboard" element={
          <PrivateRoutes>
            <RoleBaseRoutes requiredRole={["employee","admin"]}>
              <EmployeeDashboard />
            </RoleBaseRoutes>
          </PrivateRoutes>

        }>
          <Route index element={<EmployeeSummary />} ></Route>
          
          <Route path="/employee-dashboard/profile/:id" element={<ViewProfile /> } ></Route>
          <Route path="/employee-dashboard/leaves/:id" element={<LeaveList /> } ></Route>
          <Route path="/employee-dashboard/add-leave" element={<AddLeave /> } ></Route>
          <Route path="/employee-dashboard/salary/:id" element={<ViewSalary /> } ></Route>
          <Route path="/employee-dashboard/setting" element={<EmployeeSetting /> } ></Route>


        </Route>
        <Route path="/unauthorized" element={<Unauthorized />} />

      </Routes>
    </BrowserRouter>

  )
}

export default App
