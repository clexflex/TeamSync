// This component will provide navigation specific to managers, similar to AdminSidebar.
import React from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaUsers, FaCalendarCheck, FaCalendarAlt, FaCogs, FaMoneyBillWave } from 'react-icons/fa';

const ManagerSidebar = () => {
  return (
    <div className="bg-white border-r border-gray-200 h-screen fixed left-0 top-0 bottom-0 w-64 overflow-y-auto">
      <div className="h-16 flex items-center justify-center border-b border-gray-200">
        <h3 className="text-2xl font-bold text-blue-600">TeamSync</h3>
      </div>
      <div className="p-4 space-y-1">
        <NavLink
          to="/manager-dashboard"
          className={({ isActive }) =>
            `${isActive
              ? "bg-blue-50 text-blue-600"
              : "text-gray-600 hover:bg-gray-50"
            } flex items-center space-x-3 py-2.5 px-4 rounded-lg transition-colors duration-200`
          }
        >
          <FaTachometerAlt className="text-lg" />
          <span className="font-medium">Dashboard</span>
        </NavLink>
        <NavLink
          to="/manager-dashboard/team"
          className={({ isActive }) =>
            `${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'} flex items-center space-x-3 py-2.5 px-4 rounded-lg transition-colors duration-200`
          }
        >
          <FaUsers className="text-lg" />
          <span className="font-medium">Manage Teams</span>
        </NavLink>
        <NavLink
          to="/manager-dashboard/attendance-form"
          className={({ isActive }) =>
            `${isActive ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'} flex items-center space-x-3 py-2.5 px-4 rounded-lg transition-colors duration-200`
          }
        >
          <FaCalendarCheck className="text-lg" />
          <span className="font-medium">Attendance</span>
        </NavLink>
        <NavLink to="/manager-dashboard/attendance-approval"
          className={({ isActive }) =>
            `${isActive
              ? "bg-blue-50 text-blue-600"
              : "text-gray-600 hover:bg-gray-50"
            } flex items-center space-x-3 py-2.5 px-4 rounded-lg transition-colors duration-200`
          }>
          <FaCalendarAlt className="text-lg" />
          <span className="font-medium">Employee Attendance</span>
        </NavLink>
        <NavLink to="/manager-dashboard/leaves"
          className={({ isActive }) =>
            `${isActive
              ? "bg-blue-50 text-blue-600"
              : "text-gray-600 hover:bg-gray-50"
            } flex items-center space-x-3 py-2.5 px-4 rounded-lg transition-colors duration-200`
          }>
          <FaCalendarAlt className="text-lg" />
          <span className="font-medium">Leave</span>
        </NavLink>
        <NavLink to="/manager-dashboard/salary/add"
          className={({ isActive }) =>
            `${isActive
              ? "bg-blue-50 text-blue-600"
              : "text-gray-600 hover:bg-gray-50"
            } flex items-center space-x-3 py-2.5 px-4 rounded-lg transition-colors duration-200`
          }>
          <FaMoneyBillWave className="text-lg" />
          <span className="font-medium">Salary</span>
        </NavLink>
        <NavLink to="/manager-dashboard/setting"
          className={({ isActive }) =>
            `${isActive
              ? "bg-blue-50 text-blue-600"
              : "text-gray-600 hover:bg-gray-50"
            } flex items-center space-x-3 py-2.5 px-4 rounded-lg transition-colors duration-200`
          }>
          <FaCogs className="text-lg" />
          <span className="font-medium">Setting</span>
        </NavLink>
      </div>
    </div>
  );
};

export default ManagerSidebar;

