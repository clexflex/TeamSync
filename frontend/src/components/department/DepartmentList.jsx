import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom"
import DataTable from "react-data-table-component"
import { columns, DepartmentButtons } from '../../utils/DepartmentHelper'
import { FaPlus, FaSearch } from 'react-icons/fa'
import axios from 'axios'
import config from "../../config";

const DepartmentList = () => {

  const [departments, setDepartments] = useState([]);
  const [depLoading, setDepLoading] = useState(false);
  const [filteredDepartments, setFilteredDepartments] = useState([])

  const onDepartmentDelete = async (_id) => {
    try {
      const response = await axios.delete(`${config.API_URL}/api/department/${_id}`, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        // Fetch departments again
        const fetchResponse = await axios.get(`${config.API_URL}/api/department`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (fetchResponse.data.success) {
          let sno = 1;
          const newData = fetchResponse.data.departments.map((dep) => ({
            _id: dep._id,
            sno: sno++,
            dep_name: dep.dep_name,
            action: (<DepartmentButtons _id={dep._id} onDepartmentDelete={onDepartmentDelete} />),
          }));
          setDepartments(newData);
          setFilteredDepartments(newData);
        }
      }
    } catch (error) {
      if (error.response && !error.response.data.success) {
        alert(error.response.data.error)
      }
    }
  }

  useEffect(() => {
    const fetchDepartments = async () => {
      setDepLoading(true)
      try {
        const response = await axios.get(`${config.API_URL}/api/department`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        })
        if (response.data.success) {
          let sno = 1;
          const data = await response.data.departments.map((dep) => ({
            _id: dep._id,
            sno: sno++,
            dep_name: dep.dep_name,
            action: (<DepartmentButtons _id={dep._id} onDepartmentDelete={onDepartmentDelete} />),
          }));
          setDepartments(data);
          setFilteredDepartments(data);
        }
      } catch (error) {
        if (error.response && !error.response.data.success) {
          alert(error.response.data.error)
        }
      } finally {
        setDepLoading(false)
      }
    };
    fetchDepartments();
  }, [])

  const filterDepartments = (e) => {
    const records = departments.filter((dep) =>
      dep.dep_name.toLowerCase().includes(e.target.value.toLowerCase()))
    setFilteredDepartments(records)


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
    <>{depLoading ? (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    ) : (
      <>
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-2xl font-bold text-gray-800">Manage Departments</h3>
          <Link 
            to="/admin-dashboard/add-department"
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
          >
            <FaPlus className="text-sm" />
            <span>Add Department</span>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 border-b">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                onChange={filterDepartments}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500 transition-colors duration-200"
                type="text"
                placeholder="Search departments..."
              />
            </div>
          </div>

          <DataTable
            columns={columns}
            data={filteredDepartments}
            pagination
            customStyles={customStyles}
            highlightOnHover
            pointerOnHover
            responsive
          />
        </div>
      </>
    )}</>
  )
}

export default DepartmentList