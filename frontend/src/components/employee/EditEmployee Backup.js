import React, { useEffect, useState } from 'react';
import { fetchDepartments } from '../../utils/EmployeeHelper';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';

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
        
        // Only track fields that have actually changed from original
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

        // Only send changed fields in the update request
        const updateData = {};
        Object.keys(changedFields).forEach(field => {
            updateData[field] = employee[field];
        });

        // Only include password if it was actually changed
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
        <>{departments && employee ? (
            <div className="bg-white rounded-lg shadow-sm max-w-4xl mx-auto">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Edit Employee</h2>
                    <div className="text-sm text-gray-500 mt-1">
                        {Object.keys(changedFields).length > 0 ? 
                            `Modified fields: ${Object.keys(changedFields).join(', ')}` : 
                            'No changes made yet'}
                    </div>
                </div>
                
                <form onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={employee.name}
                                    onChange={handleChange}
                                    placeholder="Insert Name"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                    
                                />
                            </div>
                            {/* Email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={employee.email}
                                    onChange={handleChange}
                                    placeholder="Insert Email"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                    
                                />
                            </div>
                            {/* Employee ID */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" >
                                    Employee ID
                                </label >
                                <input
                                    type="text"
                                    name="employeeId"
                                    value={employee.employeeId}
                                    onChange={handleChange}
                                    placeholder="Employee ID"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                    
                                />
                            </div>
                            {/* Date of Birth */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    name="dob"
                                    value={employee.dob}
                                    onChange={handleChange}
                                    placeholder="DOB"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                    
                                />
                            </div>
                            {/* Gender */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" >
                                    Gender </label >
                                < select
                                    name="gender"
                                    value={employee.gender}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                    >
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other" >Other</option>
                                </select >
                            </div>
                            {/*  Marital Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" >
                                    Marital Status
                                </label >
                                < select
                                    name="maritalStatus"
                                    value={employee.maritalStatus}
                                    onChange={handleChange}
                                    placeholder="Marital Status"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                    
                                >
                                    <option value="">Select Status</option>
                                    <option value="single">Single</option>
                                    <option value="married">Married</option>
                                </select>
                            </div>

                            {/* Designation */}
                            < div>
                                <label className="block text-sm font-medium text-gray-700 mb-2" >
                                    Designation
                                </label>
                                < input
                                    type="text"
                                    name="designation"
                                    value={employee.designation}
                                    onChange={handleChange}
                                    placeholder="Designation"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                    
                                />
                            </ div>

                            {/* Department */}
                            <div>
                                < label className="block text-sm font-medium text-gray-700 mb-2">
                                    Department
                                </ label>

                                < select
                                    name="department"
                                    value={employee.department}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                    
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(dep => (
                                        <option key={dep._id} value={dep._id}>{dep.dep_name}</option>
                                    ))}
                                </select>
                            </div>
                            {/* Salary */}
                            < div>
                                < label className="block text-sm font-medium text-gray-700 mb-2" >
                                    Salary
                                </label>
                                <input
                                    type="number"
                                    name="salary"
                                    value={employee.salary}
                                    onChange={handleChange}
                                    placeholder="Salary"
                                    className="t-1 p-2 block w-full border border-gray-300 rounded-md"
                                    
                                />
                            </div>

                            {/* Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Password
                                </ label>
                                <input
                                    type="password"
                                    name="password"
                                    value={employee.password}
                                    onChange={handleChange}
                                    placeholder="******"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                    
                                />
                            </div>

                            {/* Role */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Role
                                </label>
                                < select
                                    name="role"
                                    value={employee.role}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                     >

                                    <option value="">Select Role</option>
                                    <option value="admin">Admin</option>
                                    <option value="employee"> Employee</option>
                                </ select>
                            </div>

                            {/* Image Upload */}
                            {/* <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" >
                                Upload Image
                            </label >
                            < input
                                type="file"
                                name="image"

                                onChange={handleChange}
                                placeholder="Upload Image"
                                accept="image/*"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                            />
                        </div> */}

                        </div>
                        
                <button
                    type="submit"
                    disabled={Object.keys(changedFields).length === 0}
                    className={`w-full mt-6 ${
                        Object.keys(changedFields).length === 0 
                        ? 'bg-gray-400 cursor-not-allowed' 
                        : 'bg-teal-600 hover:bg-teal-700'
                    } text-white font-bold py-2 px-4 rounded`}
                >
                    Save Changes
                </button>
                    </form>
                
            </div>
        ) : <div>Loading...</div>}</>
    );
};

export default EditEmployee;