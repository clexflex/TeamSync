import React, { useEffect, useState } from 'react'
import { FaPlus, FaSearch } from 'react-icons/fa'
import { columns, LeaveButtons } from '../../utils/LeaveHelper'
import DataTable from 'react-data-table-component'
import axios from 'axios'
import config from "../../config";


const AdminLeaveList = () => {
    const [leaves, setLeaves] = useState(null)
    const [filteredLeaves, setFilteredLeaves] = useState(null)

    const fetchLeaves = async () => {
        try {
            const response = await axios.get(`${config.API_URL}/api/leave`, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                }
            });
            console.log(response.data)
            if (response.data.success) {
                let sno = 1;
                const data = response.data.leaves.map((leave) => ({
                    _id: leave._id,
                    sno: sno++,
                    employeeId: leave.employeeId.employeeId,
                    name: leave.employeeId.userId.name,
                    leaveType: leave.leaveType,
                    department: leave.employeeId.department.dep_name,
                    days:
                        new Date(leave.endDate).getDate() -
                        new Date(leave.startDate).getDate(),
                    status: leave.status,
                    action: <LeaveButtons Id={leave._id} />,
                }));
                setLeaves(data)
                setFilteredLeaves(data)

            }
        } catch (error) {
            if (error.response && !error.response.data.success) {
                alert(error.response.data.error);
            }
        }
    }

    useEffect(() => {
        fetchLeaves()
    }, [])

    const filterByInput = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = leaves.filter((leave) =>
            leave.employeeId.toLowerCase().includes(searchTerm) ||
            leave.name.toLowerCase().includes(searchTerm) ||
            leave.department.toLowerCase().includes(searchTerm)
        );
        setFilteredLeaves(filtered);
    }
    const filterByButton = (status) => {
        const filtered = leaves.filter((leave) =>
            leave.status.toLowerCase().includes(status.toLowerCase())
        );
        setFilteredLeaves(filtered);
    }

    const customStyles = {
        headRow: {
            style: {
                backgroundColor: '#f8fafc',
                borderBottomWidth: '1px',
            },
        },
        headCells: {
            style: {
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#1e293b',
                paddingLeft: '1rem',
                paddingRight: '1rem',
            },
        },
        cells: {
            style: {
                paddingLeft: '1rem',
                paddingRight: '1rem',
            },
        },
    };
    return (
        <>{filteredLeaves ? (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-800">Manage Leaves</h3>
                    <div className="flex items-center gap-4 mt-8">
                        <button
                            onClick={() => filterByButton("Pending")}
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                            <FaPlus className="text-sm" />
                            <span>Pending</span>
                        </button>
                        <button
                            onClick={() => filterByButton("Approved")}
                            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                            <FaPlus className="text-sm" />
                            <span>Approved</span>
                        </button>
                        <button
                            onClick={() => filterByButton("Rejected")}
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                            <FaPlus className="text-sm" />
                            <span>Rejected</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-4 border-b">
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    onChange={filterByInput}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                    type="text"
                                    placeholder="Search by name, ID, department..."
                                />
                            </div>
                        </div>
                    </div>
                    <div>
                        <DataTable
                            columns={columns}
                            data={filteredLeaves}
                            pagination
                            highlightOnHover
                            pointerOnHover
                            responsive
                            customStyles={customStyles}
                        />

                    </div>

                </div>
            </div>
        ) : (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        )}</>



    )
}

export default AdminLeaveList