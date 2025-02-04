import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import config from "../../config";
import { FaArrowLeft } from 'react-icons/fa';

const ViewEmployee = () => {
    const { id } = useParams();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate()

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const response = await axios.get(`${config.API_URL}/api/employee/${id}`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.data.success) {
                    setEmployee(response.data.employee);
                }
            } catch (error) {
                setError(error.response?.data?.error || 'Failed to fetch employee data');
            } finally {
                setLoading(false);
            }
        };
        fetchEmployee();
    }, [id]);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                    {error}
                </div>
            </div>
        );
    }

    if (!employee) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-gray-600">No employee data found</div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto mt-8 px-4">
             <div className="flex items-center gap-2 text-gray-600 mb-8 cursor-pointer group"
                onClick={() => navigate('/admin-dashboard/employees')}>
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
                <span>Back to Employees</span>
            </div>
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
                    <div className="flex items-center space-x-4">
                        <div className="relative">
                            <img
                                src={employee.userId.profileImage 
                                    ? `${config.API_URL}/uploads/${employee.userId.profileImage}`
                                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(employee.userId.name)}&background=random`}
                                alt={employee.userId.name}
                                className="w-24 h-24 rounded-full border-4 border-white object-cover"
                            />
                            <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${employee.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                        </div>
                        <div className="text-white">
                            <h1 className="text-2xl font-bold">{employee.userId.name}</h1>
                            <p className="text-blue-100">{employee.designation}</p>
                        </div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
                    {/* Personal Information */}
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Personal Information</h2>
                            <div className="space-y-3">
                                <InfoRow label="Employee ID" value={employee.employeeId} />
                                <InfoRow label="Email" value={employee.userId.email} />
                                <InfoRow label="Date of Birth" value={new Date(employee.dob).toLocaleDateString()} />
                                <InfoRow label="Gender" value={employee.gender} />
                                <InfoRow label="Marital Status" value={employee.maritalStatus} />
                            </div>
                        </div>
                    </div>

                    {/* Professional Information */}
                    <div className="space-y-6">
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <h2 className="text-lg font-semibold text-gray-800 mb-4">Professional Information</h2>
                            <div className="space-y-3">
                                <InfoRow label="Department" value={employee.department.dep_name} />
                                <InfoRow label="Role" value={employee.userId.role} />
                                <InfoRow label="Status" value={employee.status} customStyle={`capitalize ${employee.status === 'active' ? 'text-green-600' : 'text-red-600'}`} />
                                <InfoRow label="Joined Date" value={new Date(employee.createdAt).toLocaleDateString()} />
                                <InfoRow label="Last Updated" value={new Date(employee.updatedAt).toLocaleDateString()} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InfoRow = ({ label, value, customStyle = "" }) => (
    <div className="flex justify-between items-center py-2">
        <span className="text-gray-600">{label}:</span>
        <span className={`font-medium ${customStyle}`}>{value}</span>
    </div>
);

export default ViewEmployee;