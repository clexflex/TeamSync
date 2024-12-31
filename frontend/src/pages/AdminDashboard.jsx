import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/dashboard/Navbar'
import AdminSidebar from '../components/dashboard/AdminSidebar'
import DashboardLayout from '../components/layout/DashboardLayout'

const AdminDashboard = () => {
  return (
    <div className="flex">
      <AdminSidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <DashboardLayout>
          <Outlet />
        </DashboardLayout>
      </div>
    </div>
  )
}

export default AdminDashboard