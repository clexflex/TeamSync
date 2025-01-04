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



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/admin-dashboard" />}></Route>
        <Route path="/login" element={<Login />}></Route>
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
          <Route path="/admin-dashboard/employees/salary/:id" element={<ViewSalary />} ></Route>
          
          <Route path="/admin-dashboard/salary/add" element={<AddSalary />} ></Route>


        </Route>
        <Route path="/employee-dashboard" element={<EmployeeDashboard />}></Route>
      </Routes>
    </BrowserRouter>

  )
}

export default App
