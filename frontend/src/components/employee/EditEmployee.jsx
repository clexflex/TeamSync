import React, { useEffect, useState } from 'react';
import { fetchDepartments } from '../../utils/EmployeeHelper';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import config from "../../config";

const EditEmployee = () => {
    const [employee, setEmployee] = useState({
        name: '',
        email: '',
        employeeId: '',
        dob: '',
        gender: '',
        maritalStatus: '',
        designation: '',
        department: '',
        salary: 0,
        role: '',
        password: ''
    });
    const [departments, setDepartments] = useState(null);
    const [originalEmployee, setOriginalEmployee] = useState(null);
    const [changedFields, setChangedFields] = useState({});
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const getDepartments = async () => {
            const departments = await fetchDepartments();
            setDepartments(departments);
        };
        getDepartments();
    }, []);

    useEffect(() => {
        const fetchEmployee = async () => {
            try {
                const response = await axios.get(`${config.API_URL}/api/employee/${id}`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.data.success) {
                    const employeeData = response.data.employee;
                    const formattedEmployee = {
                        name: employeeData.userId.name,
                        email: employeeData.userId.email,
                        employeeId: employeeData.employeeId,
                        dob: employeeData.dob?.split('T')[0] || '',
                        gender: employeeData.gender,
                        maritalStatus: employeeData.maritalStatus,
                        designation: employeeData.designation,
                        department: employeeData.department._id,
                        salary: employeeData.salary,
                        role: employeeData.userId.role,
                        password: ''
                    };
                    setEmployee(formattedEmployee);
                    setOriginalEmployee(formattedEmployee);
                }
            } catch (error) {
                if (error.response && !error.response.data.success) {
                    alert(error.response.data.error);
                }
            }
        };
        fetchEmployee();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setEmployee(prev => ({ ...prev, [name]: value }));
        
        if (originalEmployee[name] !== value) {
            setChangedFields(prev => ({ ...prev, [name]: true }));
        } else {
            setChangedFields(prev => {
                const newFields = { ...prev };
                delete newFields[name];
                return newFields;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const updateData = {};
        Object.keys(changedFields).forEach(field => {
            updateData[field] = employee[field];
        });

        if (!updateData.password) {
            delete updateData.password;
        }

        try {
            const response = await axios.put(
                `${config.API_URL}/api/employee/${id}`,
                updateData,
                {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (response.data.success) {
                navigate("/admin-dashboard/employees");
            }
        } catch (error) {
            if (error.response && !error.response.data.error) {
                alert(error.response.data.error);
            }
        }
    };

    return (
        <>
            <div className="flex items-center gap-2 text-gray-600 mb-8 cursor-pointer group"
                onClick={() => navigate('/admin-dashboard/employees')}>
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
                <span>Back to Employees</span>
            </div>

            <div className="bg-white rounded-lg shadow-sm max-w-4xl mx-auto">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Edit Employee</h2>
                    <p className="text-sm text-gray-500 mt-1">Modify the employee profile details</p>
                </div>

                {departments && employee ? (
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {Object.keys(employee).map((field) => {
                                if (field === 'department') {
                                    return (
                                        <div key={field}>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Department
                                            </label>
                                            <select
                                                name={field}
                                                value={employee[field]}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                                required
                                            >
                                                <option value="">Select Department</option>
                                                {departments.map(dep => (
                                                    <option key={dep._id} value={dep._id}>{dep.dep_name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    );
                                }

                                return (
                                    <div key={field}>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            {field.charAt(0).toUpperCase() + field.slice(1)}
                                        </label>
                                        <input
                                            type="text"
                                            name={field}
                                            value={employee[field]}
                                            onChange={handleChange}
                                            placeholder={`Enter ${field}`}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        <div className="flex items-center gap-4 mt-8">
                            <button
                                type="submit"
                                className={`px-6 py-2 bg-blue-600 text-white rounded-lg ${
                                    Object.keys(changedFields).length === 0
                                        ? 'opacity-50 cursor-not-allowed'
                                        : 'hover:bg-blue-700 transition-colors duration-200'
                                }`}
                                disabled={Object.keys(changedFields).length === 0}
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
                    </form>
                ) : (
                    <div className="p-6 text-center text-gray-600">Loading...</div>
                )}
            </div>
        </>
    );
};

export default EditEmployee;
