
import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom"
import { FaPlus, FaSearch } from 'react-icons/fa'
import DataTable from "react-data-table-component"
import axios from 'axios'
import { columns, EmployeeButtons } from '../../utils/EmployeeHelper'

const EmployeeList = () => {
    const [employees, setEmployees] = useState([])
    const [empLoading, setEmpLoading] = useState(false)
    const [filteredEmployees, setFilteredEmployees] = useState([])
    useEffect(() => {
        const fetchEmployees = async () => {
            setEmpLoading(true)
            try {
                const response = await axios.get('http://localhost:3000/api/employee', {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                })
                if (response.data.success) {
                    let sno = 1;
                    const data = await response.data.employees.map((emp) => ({
                        _id: emp._id,
                        sno: sno++,
                        dep_name: emp.department.dep_name,
                        name: emp.userId.name,
                        dob: new Date(emp.dob).toLocaleDateString(),
                        profileImage: <img width={50} className='rounded-full' src={`http://localhost:3000/${emp.userId.profileImage}`} />,
                        action: (<EmployeeButtons Id={emp._id} />),
                    }));
                    setEmployees(data);
                    setFilteredEmployees(data);
                }
            } catch (error) {
                if (error.response && !error.response.data.success) {
                    alert(error.response.data.error)
                }
            } finally {
                setEmpLoading(false)
            }
        };
        fetchEmployees();
    }, []);

    const handleFilter = (e) => {
        const records = employees.filter((emp) =>
          emp.name.toLowerCase().includes(e.target.value.toLowerCase()))
        setFilteredEmployees(records)
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

        <>{empLoading ? (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        ) : (
            <>
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-2xl font-bold text-gray-800">Manage Employees</h3>
                        <Link
                            to="/admin-dashboard/add-employee"
                            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                            <FaPlus className="text-sm" />
                            <span>Add New Employee</span>
                        </Link>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm">
                        <div className="p-4 border-b">
                            <div className="relative">
                                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    onChange={handleFilter}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                    type="text"
                                    placeholder="Search departments..."
                                />
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
            </>
        )}</>
    )
}

export default EmployeeList