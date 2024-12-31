import React from 'react'
import SummaryCard from './SummaryCard'
import { FaBuilding, FaCheckCircle, FaFileAlt, FaHourglassHalf, FaMoneyBillWave, FaTimesCircle, FaUsers } from 'react-icons/fa'

const AdminSummary = () => {
  return (
    
        <div>
            <h3 className='text-2xl font-bold text-gray-800 mb-8'>Dashboard Overview</h3>
            
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <SummaryCard icon={<FaUsers />} text="Total Employees" number={13} color="bg-blue-600"/>
                <SummaryCard icon={<FaBuilding />} text="Total Departments" number={5} color="bg-yellow-600"/>
                <SummaryCard icon={<FaMoneyBillWave />} text="Monthly Salary" number="$6543" color="bg-green-600"/>
            </div>

            <div className="mt-12">
                <h4 className='text-2xl font-bold text-gray-800 mb-8'>Leave Details</h4>

                <div className='grid grid-cols-1 md:grid-cols-4 gap-6'>
                    <SummaryCard icon={<FaFileAlt />} text="Leave Applied" number={5} color="bg-purple-600"/>
                    <SummaryCard icon={<FaCheckCircle />} text="Leave Approved" number={7} color="bg-green-600"/>
                    <SummaryCard icon={<FaHourglassHalf />} text="Leave Pending" number={3} color="bg-yellow-600"/>
                    <SummaryCard icon={<FaTimesCircle />} text="Leave Rejected" number={1} color="bg-red-600"/>
                </div>
            </div>
        </div>
   
  )
}

export default AdminSummary