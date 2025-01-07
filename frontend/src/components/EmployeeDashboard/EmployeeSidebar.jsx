import React from 'react'
import { NavLink } from "react-router-dom"
import { FaBuilding, FaCalendarAlt, FaCogs, FaMoneyBillWave, FaTachometerAlt, FaUsers } from 'react-icons/fa'
import { useAuth } from '../../context/authContext'

const EmployeeSidebar = () => {
    const {user} = useAuth();

    return (
        <div className="bg-white border-r border-gray-200 h-screen fixed left-0 top-0 bottom-0 w-64 overflow-y-auto">
            <div className='h-16 flex items-center justify-center border-b border-gray-200'>
                <h3 className='text-2xl font-bold text-blue-600'>TeamSync</h3>
            </div>
            <div className="p-4 space-y-1">
                <NavLink to="/employee-dashboard"
                    className={({ isActive }) =>
                        `${isActive
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-600 hover:bg-gray-50"
                        } flex items-center space-x-3 py-2.5 px-4 rounded-lg transition-colors duration-200`
                    } end>
                    <FaTachometerAlt className="text-lg" />
                    <span className="font-medium">Dashboard</span>
                    
                </NavLink>
                <NavLink to={`/employee-dashboard/profile/${user._id}`}
                    className={({ isActive }) =>
                        `${isActive
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-600 hover:bg-gray-50"
                        } flex items-center space-x-3 py-2.5 px-4 rounded-lg transition-colors duration-200`
                    }>
                    <FaUsers className="text-lg" />
                    <span className="font-medium">My Profile</span>
                </NavLink>
                <NavLink to={`/employee-dashboard/leaves/${user._id}`}
                    className={({ isActive }) =>
                        `${isActive
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-600 hover:bg-gray-50"
                        } flex items-center space-x-3 py-2.5 px-4 rounded-lg transition-colors duration-200`
                    }>
                    <FaBuilding className="text-lg" />
                    <span className="font-medium">Leaves</span>
                </NavLink>
                <NavLink to={`/employee-dashboard/salary/${user._id}`}
                    className={({ isActive }) =>
                        `${isActive
                            ? "bg-blue-50 text-blue-600"
                            : "text-gray-600 hover:bg-gray-50"
                        } flex items-center space-x-3 py-2.5 px-4 rounded-lg transition-colors duration-200`
                    }>
                    <FaMoneyBillWave className="text-lg" />
                    <span className="font-medium">Salary</span>
                </NavLink>
                <NavLink to="/employee-dashboard/setting"
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
    )
}

export default EmployeeSidebar