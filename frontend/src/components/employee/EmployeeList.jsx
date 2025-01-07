import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { FaPlus, FaSearch, FaFilter } from 'react-icons/fa';
import DataTable from "react-data-table-component";
import axios from 'axios';
import { columns, EmployeeButtons } from '../../utils/EmployeeHelper';
import config from "../../config";


const EmployeeList = () => {
    const [employees, setEmployees] = useState([]);
    const [empLoading, setEmpLoading] = useState(false);
    const [filteredEmployees, setFilteredEmployees] = useState([]);

    useEffect(() => {
        const fetchEmployees = async () => {
            setEmpLoading(true);
            try {
                const response = await axios.get(`${config.API_URL}/api/employee`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (response.data.success) {
                    let sno = 1;
                    const data = response.data.employees.map((emp) => ({
                        _id: emp._id,
                        sno: sno++,
                        name: emp.userId.name,
                        employeeId: emp.employeeId,
                        dep_name: emp.department.dep_name,
                        status: 'Active', // You'll need to add this field in your backend
                        profileImage: <img alt={emp.userId.name} className='w-full h-full object-cover' 
                        src={`${config.API_URL}/${emp.userId.profileImage}`} />,
                        action: <EmployeeButtons Id={emp._id} />,
                    }));
                    setEmployees(data);
                    setFilteredEmployees(data);
                }
            } catch (error) {
                if (error.response && !error.response.data.success) {
                    alert(error.response.data.error);
                }
            } finally {
                setEmpLoading(false);
            }
        };
        fetchEmployees();
    }, []);

    const handleFilter = (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filtered = employees.filter((emp) => 
            emp.name.toLowerCase().includes(searchTerm) ||
            emp.employeeId.toLowerCase().includes(searchTerm) ||
            emp.dep_name.toLowerCase().includes(searchTerm) 
                );
        setFilteredEmployees(filtered);
    };

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
        <>{empLoading ? (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        ) : (
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h3 className="text-2xl font-bold text-gray-800">Manage Employees</h3>
                    <Link
                        to="/admin-dashboard/add-employee"
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                        <FaPlus className="text-sm" />
                        <span>Add Employee</span>
                    </Link>
                </div>

                <div className="bg-white rounded-lg shadow-sm">
                    <div className="p-4 border-b">
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    onChange={handleFilter}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                    type="text"
                                    placeholder="Search by name, ID, department..."
                                />
                            </div>
                        </div>
                    </div>

                    <DataTable
                        columns={columns}
                        data={filteredEmployees}
                        pagination
                        customStyles={customStyles}
                        highlightOnHover
                        pointerOnHover
                        responsive
                    />
                </div>
            </div>
        )}</>
    );
};

export default EmployeeList;