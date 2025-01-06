import React from 'react'
import { FaUser } from 'react-icons/fa'
import { useAuth } from '../../context/authContext'

const EmployeeSummary = () => {
const{user} = useAuth()
    return (

        <div>
            <h3 className='text-2xl font-bold text-gray-800 mb-8'>Dashboard Overview</h3>

            <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center space-x-4">
                    <div className="bg-blue-600bg-opacity-10 rounded-full p-3">
                        <span className="bg-blue-600">
                           <FaUser />
                        </span>
                    </div>
                    <div>
                        <p className="text-gray-600 font-medium">Welcome Back</p>
                        <p className="text-2xl font-bold text-gray-800 mt-1">{user.name}</p>
                    </div>
                </div>
            </div>

        </div>

    )
}

export default EmployeeSummary