import React, { useEffect, useState } from 'react';
import { fetchDepartments, getEmployees } from '../../utils/EmployeeHelper';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from "../../config";

const AddSalary = () => {
    const [salary, setSalary] = useState({
        employeeId: null,
        basicSalary: 0,
        allowances: 0,
        deductions: 0,
        payDate: null,
    });
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const getDepartments = async () => {
            const departments = await fetchDepartments();
            setDepartments(departments || []);
        };
        getDepartments();
    }, []);

    const handleDepartment = async (e) => {
        const emps = await getEmployees(e.target.value);
        setEmployees(emps || []);
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setSalary((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await axios.post(
                `${config.API_URL}/api/salary/add`,
                salary,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`,
                    },
                }
            );
            if (response.data.success) {
                navigate('/admin-dashboard/employees');
            }
        } catch (error) {
            if (error.response && error.response.data.error) {
                alert(error.response.data.error);
            }
        }
    };

    return (
        <>
            {departments.length > 0 ? (
                <div className="bg-white rounded-lg shadow-sm max-w-4xl mx-auto">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-800">Add Salary</h2>
                    </div>

                    <form className="p-6" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Department */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Department
                                </label>
                                <select
                                    name="department"
                                    onChange={handleDepartment}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((dep) => (
                                        <option key={dep._id} value={dep._id}>
                                            {dep.dep_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Employee */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Employee
                                </label>
                                <select
                                    name="employeeId"
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                >
                                    <option value="">Select Employee</option>
                                    {employees.map((emp) => (
                                        <option key={emp._id} value={emp._id}>
                                            {emp.employeeId}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Basic Salary */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Basic Salary
                                </label>
                                <input
                                    type="number"
                                    name="basicSalary"
                                    onChange={handleChange}
                                    placeholder="Basic Salary"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                    required
                                />
                            </div>
                            {/* Allowances */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Allowances
                                </label>
                                <input
                                    type="number"
                                    name="allowances"
                                    onChange={handleChange}
                                    placeholder="Allowances"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                    required
                                />
                            </div>
                            {/* Deductions */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Deductions
                                </label>
                                <input
                                    type="number"
                                    name="deductions"
                                    onChange={handleChange}
                                    placeholder="Deductions"
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                    required
                                />
                            </div>
                            {/* Pay Date */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Pay Date
                                </label>
                                <input
                                    type="date"
                                    name="payDate"
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                    required
                                />
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
            ) : (
                <div>Loading...</div>
            )}
        </>
    );
};

export default AddSalary;
