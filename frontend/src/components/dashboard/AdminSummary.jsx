import React, { useEffect, useState } from 'react'
import SummaryCard from './SummaryCard'
import { FaBuilding, FaCheckCircle, FaFileAlt, FaHourglassHalf, FaMoneyBillWave, FaTimesCircle, FaUsers } from 'react-icons/fa'
import axios from 'axios'
import config from "../../config";

const AdminSummary = () => {

    const [summary, setSummary] = useState(null)

    useEffect(() => {
        const fetchSummary = async () => {
            try {
                const summary = await axios.get(`${config.API_URL}/api/dashboard/summary`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                })

                setSummary(summary.data)
            } catch (error) {
                if (error.response && !error.response.data.success) {
                    alert(error.response.data.error)
                }
            }
        }
        fetchSummary()
    }, [])

    if (!summary) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>)
    }

    return (
        <div>
            <h3 className='text-2xl font-bold text-gray-800 mb-8'>Dashboard Overview</h3>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                <SummaryCard icon={<FaUsers />} text="Total Employees" number={summary.totalEmployees} color="bg-blue-600" />
                <SummaryCard icon={<FaBuilding />} text="Total Departments" number={summary.totalDepartments} color="bg-yellow-600" />
                <SummaryCard icon={<FaMoneyBillWave />} text="Monthly Salary" number={summary.totalSalary} color="bg-green-600" />
            </div>
            <div className="mt-12">
                <h4 className='text-2xl font-bold text-gray-800 mb-8'>Leave Details</h4>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <SummaryCard icon={<FaFileAlt />} text="Leave Applied" number={summary.leaveSummary.appliedFor} color="bg-purple-600" />
                    <SummaryCard icon={<FaCheckCircle />} text="Leave Approved" number={summary.leaveSummary.approved} color="bg-green-600" />
                    <SummaryCard icon={<FaHourglassHalf />} text="Leave Pending" number={summary.leaveSummary.pending} color="bg-yellow-600" />
                    <SummaryCard icon={<FaTimesCircle />} text="Leave Rejected" number={summary.leaveSummary.rejected} color="bg-red-600" />
                </div>
            </div>
        </div>

    )
}

export default AdminSummary