import React from 'react'
import EmployeeSidebar from '../components/EmployeeDashboard/EmployeeSidebar'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/dashboard/Navbar'
import DashboardLayout from '../components/layout/DashboardLayout'
const EmployeeDashboard = () => {
  return (
    <div className="flex">
      <EmployeeSidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <DashboardLayout>
          <Outlet />
        </DashboardLayout>
      </div>
    </div>
  )
}

export default EmployeeDashboard