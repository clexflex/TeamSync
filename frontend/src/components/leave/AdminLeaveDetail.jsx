import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { FaCheck, FaTrash } from 'react-icons/fa';
import { useNavigate, useParams } from 'react-router-dom'
import config from "../../config";


const AdminLeaveDetail = () => {
    const { id } = useParams()
    const [leave, setLeave] = useState(null)
    const navigate = useNavigate();

    useEffect(() => {
        const fetchLeave = async () => {
            try {
                const response = await axios.get(`${config.API_URL}/api/leave/detail/${id}`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                })
                if (response.data.success) {
                    setLeave(response.data.leave)
                }
            } catch (error) {
                if (error.response && !error.response.data.success) {
                    alert(error.response.data.error)
                }
            }
        };
        fetchLeave();
    }, []);

    const changeStatus = async (id, status) =>{
        try {
            const response = await axios.put(`${config.API_URL}/api/leave/${id}`, {status},
            {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                }
            })
            if (response.data.success) {
                navigate('/admin-dashboard/leaves')
            }
        } catch (error) {
            if (error.response && !error.response.data.success) {
                alert(error.response.data.error)
            }
        }
    }

    return (
        <>{leave ? (
            <div className='max-w-3xl mx-auto mt-10 bg-white p-8 rounded-md shadow-md'>
                <h2 className='text-2xl font-bold mb-8 text-center'>
                    Leave Details
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div>
                        <img
                            src={`${config.API_URL}/${leave.employeeId.userId.profileImage}`}
                            className='rounded-full border w-72'
                        />
                    </div>
                    <div>
                        <div className="flex space-x-3 mb-5">
                            <p className="text-lg font-bold">Name: </p>
                            <p className="font-medium" >{leave.employeeId.userId.name}</p>
                        </div>
                        <div className="flex space-x-3 mb-5" >
                            <p className="text-lg font-bold">Employee ID: </p>
                            <p className="font-medium" >{leave.employeeId.employeeId}</p>
                        </div>

                        <div className="flex space-x-3 mb-5" >
                            <p className="text-lg font-bold">Department: </p>
                            <p className="font-medium" >{leave.employeeId.department.dep_name}</p>
                        </div>
                        <div className="flex space-x-3 mb-5">
                            <p className="text-lg font-bold">Leave Type: </p>
                            <p className="font-medium" >{leave.leaveType}</p>
                        </div>
                        <div className="flex space-x-3 mb-5">
                            <p className="text-lg font-bold">Reason: </p>
                            <p className="font-medium" >{leave.reason}</p>
                        </div>
                        <div className="flex space-x-3 mb-5">
                            <p className="text-lg font-bold">Start Date:</p>
                            <p className="font-medium" >
                                {new Date(leave.startDate).toLocaleDateString()}
                            </p>
                        </ div>
                        <div className="flex space-x-3 mb-5">
                            <p className="text-lg font-bold">End Date:</p>
                            <p className="font-medium" >
                                {new Date(leave.endDate).toLocaleDateString()}
                            </p>
                        </ div>

                        <div className="flex space-x-3 mb-5" >
                            <p className="text-lg font-bold">
                                {leave.status === "Pending" ? "Action:" : "Status"}
                            </p>
                            {leave.status === "Pending" ? (
                                <div className="flex gap-2 ">
                                    <button
                                        onClick={() => changeStatus(leave._id, "Approved")}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-green-700 text-white hover:bg-green-900 rounded transition-colors duration-200"
                                    >
                                        <FaCheck className="text-sm" />
                                        <span>Approve</span>
                                    </button>
                                    <button
                                        onClick={() => changeStatus(leave._id, "Rejected")}
                                        className="flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-600 hover:bg-red-200 rounded transition-colors duration-200"
                                    >
                                        <FaTrash className="text-sm" />
                                        <span>Reject</span>
                                    </button>
                                </div>
                            ) :
                                <p className="font-medium" >{leave.status}</p>}

                        </div>
                    </div>
                </div>
            </div>
        ) : <div> Loading...</div>}</>
    )
}

export default AdminLeaveDetail