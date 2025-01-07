import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { FaPlus, FaSearch } from 'react-icons/fa'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../../context/authContext';
import config from "../../config";


const LeaveList = () => {
    const [leaves, setLeaves] = useState([]);
    let sno = 1;
    const { id } = useParams()
    const { user } = useAuth()
    const fetchLeaves = async () => {
        try {
            const response = await axios.get(`${config.API_URL}/api/leave/${id}/${user.role}`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (response.data.success) {
                setLeaves(response.data.leaves);
            }
        } catch (error) {
            alert(error.message);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    if (!leaves) {
        return (<div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>)
    }

    return (
        <>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-800">Manage Leaves</h3>
                    {user.role === "employee" && (
                        <Link
                        to="/employee-dashboard/add-leave"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                        <FaPlus className="text-sm" />
                        <span>Add New Leave</span>
                    </Link>
                    )}
                    
                </div>

                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-4 border-b">
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                    type="text"
                                    placeholder="Search by name, ID, department..."
                                />
                            </div>
                        </div>
                    </div>
                    <div>

                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 border border-gray-200">
                                <tr>
                                    <th className="px-6 py-3">SNO</th>
                                    <th className="px-6 py-3">Leave Type</th>
                                    <th className="px-6 py-3">From</th>
                                    <th className="px-6 py-3">To</th>
                                    <th className="px-6 py-3">Description</th>
                                    {/* <th className="px-6 py-3">Applied Date</th> */}
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {leaves.map((leave) => (
                                    <tr
                                        key={leave._id}
                                        className="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
                                    >
                                        <td className="px-6 py-3">{sno++}</td>
                                        <td className="px-6 py-3">{leave.leaveType}</td>
                                        <td className="px-6 py-3">{new Date(leave.startDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-3">{new Date(leave.endDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-3">{leave.reason}</td>
                                        <td className="px-6 py-3">{leave.status}</td>
                                        {/* <td className="px-6 py-3"> {new Date(leave.appliedAt).toLocaleDateString()}</td> */}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                </div>
            </div>

        </>
    )
}

export default LeaveList