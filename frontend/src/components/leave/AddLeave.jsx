import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/authContext';
import config from "../../config";


const AddLeave = () => {
    const {user} = useAuth();
    const [leave, setLeave] = useState({
        userId: user._id,

    })
    const navigate = useNavigate();

    const handleChange = (e) => {
        const {name, value} =e.target
        setLeave((prevState) => ({...prevState, [name] : value}))
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await axios.post(`${config.API_URL}/api/leave/add`, leave,
            {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                }
            })
            if (response.data.success) {
                navigate(`/employee-dashboard/leaves/${user._id}`)
            }
        } catch (error) {
            if (error.response && !error.response.data.success) {
                alert(error.response.data.error)
            }
        }
    }

    return (
        <>

                <div className="bg-white rounded-lg shadow-sm max-w-4xl mx-auto">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-800">Request For Leave</h2>
                    </div>

                    <form  onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Leave Type */}
                            <div > 
                                <label className=" block text-sm font-medium text-gray-700 mb-2">
                                    Leave Type
                                </label>
                                <select
                                    name="leaveType"
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                    required
                                >
                                    <option value="">Select Leave Type</option>
                                    <option value="Sick Leave"> Sick Leave</option>
                                    <option value="Casual Leave"> Casual Leave</option>
                                    <option value="Annual Leave"> Annual Leave</option>
                                    
                                </select>
                            </div>
                            
                            {/* From Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Start Date
                                </label>
                                <input
                                    type="date"
                                    name="startDate"
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                    required
                                />
                            </div>
                            {/* To Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    End Date
                                </label>
                                <input
                                    type="date"
                                    name="endDate"
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                    required
                                />
                            </div>
                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                 Description
                                </label>
                                <textarea
                                    name="reason"
                                    placeholder="reason"
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                    required
                                >
                                </textarea>
                            </div>

                            <div className="flex items-center gap-4 mt-8">
                                <button
                                    type="submit"
                                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Save Changes
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate('/admin-dashboard/employees')}
                                    className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
           
        </>
    );
};

export default AddLeave;
