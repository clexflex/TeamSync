// AdminLeaveList.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaSearch } from 'react-icons/fa';
import config from "../../config";

const AdminLeaveList = () => {
    const [leaves, setLeaves] = useState([]);
    const [filteredLeaves, setFilteredLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    let sno = 1;

    const fetchLeaves = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${config.API_URL}/api/leave`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (response.data.success) {
                const leavesWithUserData = response.data.leaves.filter(leave => leave.userId);
                setLeaves(leavesWithUserData);
                setFilteredLeaves(leavesWithUserData);
            }
        } catch (error) {
            setError(error.response?.data?.error || error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaves();
    }, []);

    const handleSearch = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = leaves.filter(leave => 
            leave.userId?.name?.toLowerCase().includes(searchTerm) ||
            leave.leaveType?.toLowerCase().includes(searchTerm) ||
            leave.reason?.toLowerCase().includes(searchTerm) ||
            leave.status?.toLowerCase().includes(searchTerm) ||
            leave.userId?.role?.toLowerCase().includes(searchTerm)
        );
        setFilteredLeaves(filtered);
    };

    const handleStatusUpdate = async (leaveId, newStatus) => {
        try {
            const response = await axios.put(
                `${config.API_URL}/api/leave/${leaveId}`,
                { status: newStatus },
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                }
            );

            if (response.data.success) {
                await fetchLeaves();
            }
        } catch (error) {
            setError(error.response?.data?.error || error.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-red-500">Error: {error}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-800">Leave Applications</h3>
            </div>

            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-4 border-b">
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                onChange={handleSearch}
                                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                type="text"
                                placeholder="Search by employee name, leave type, status..."
                            />
                        </div>
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 uppercase bg-gray-50 border border-gray-200">
                            <tr>
                                <th className="px-6 py-3">SNO</th>
                                <th className="px-6 py-3">Employee</th>
                                <th className="px-6 py-3">Role</th>
                                <th className="px-6 py-3">Leave Type</th>
                                <th className="px-6 py-3">From</th>
                                <th className="px-6 py-3">To</th>
                                <th className="px-6 py-3">Description</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLeaves.map((leave) => (
                                <tr key={leave._id} className="bg-white border-b hover:bg-gray-50">
                                    <td className="px-6 py-3">{sno++}</td>
                                    <td className="px-6 py-3">{leave.userId?.name || 'N/A'}</td>
                                    <td className="px-6 py-3 capitalize">{leave.userId?.role || 'N/A'}</td>
                                    <td className="px-6 py-3">{leave.leaveType}</td>
                                    <td className="px-6 py-3">{new Date(leave.startDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-3">{new Date(leave.endDate).toLocaleDateString()}</td>
                                    <td className="px-6 py-3">{leave.reason}</td>
                                    <td className="px-6 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium
                                            ${leave.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                                            leave.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                                            'bg-red-100 text-red-800'}`}>
                                            {leave.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-3">
                                        {leave.status === 'Pending' && (
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleStatusUpdate(leave._id, 'Approved')}
                                                    className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 text-xs transition-colors duration-200"
                                                >
                                                    Approve
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(leave._id, 'Rejected')}
                                                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs transition-colors duration-200"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminLeaveList;