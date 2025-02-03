// This will serve as the main entry point for the manager's dashboard.

import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/dashboard/Navbar';
import ManagerSidebar from '../components/ManagerDashboard/ManagerSidebar'; 
import DashboardLayout from '../components/layout/DashboardLayout';

const ManagerDashboard = () => {
  return (
    <div className="flex">
      <ManagerSidebar />
      <div className="flex-1 ml-64">
        <Navbar />
        <DashboardLayout>
          <Outlet />
        </DashboardLayout>
      </div>
    </div>
  );
};

export default ManagerDashboard;
