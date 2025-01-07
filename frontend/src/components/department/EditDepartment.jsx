import axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { FaArrowLeft } from 'react-icons/fa'
import config from "../..//config";

const EditDepartment = () => {
    const { id } = useParams()
    const [department, setDepartment] = useState([])
    const [depLoading, setDepLoading] = useState(false)

    const navigate = useNavigate();
    useEffect(() => {
        const fetchDepartments = async () => {
            setDepLoading(true)
            try {
                const response = await axios.get(`${config.API_URL}/api/department/${id}`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                })
                if (response.data.success) {
                    setDepartment(response.data.department)
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
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setDepartment({ ...department, [name]: value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            const response = await axios.put(`${config.API_URL}/api/department/${id}`, department, {
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`
                }
            })
            if (response.data.success) {
                navigate("/admin-dashboard/departments")
            }
        } catch (error) {
            if (error.response && !error.response.data.success) {
                alert(error.response.data.error)
            }
        }
    }

    return (
        <>{depLoading ? (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        ) : (
            <>
                <div className="flex items-center gap-2 text-gray-600 mb-8 cursor-pointer group"
                     onClick={() => navigate('/admin-dashboard/departments')}>
                    <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
                    <span>Back to Departments</span>
                </div>

                <div className="bg-white rounded-lg shadow-sm max-w-2xl mx-auto">
                    <div className="p-6 border-b">
                        <h2 className="text-xl font-semibold text-gray-800">Edit Department</h2>
                        <p className="text-sm text-gray-500 mt-1">Update department information</p>
                    </div>

                    <form onSubmit={handleSubmit} className="p-6 space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="dep_name">
                                Department Name
                            </label>
                            <input 
                                onChange={handleChange}
                                value={department.dep_name}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200"
                                id="dep_name"
                                name="dep_name"
                                type="text"
                                placeholder="Enter department name"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2" htmlFor="description">
                                Description
                            </label>
                            <textarea 
                                onChange={handleChange}
                                value={department.description}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 transition-colors duration-200 min-h-[100px]"
                                id="description"
                                name="description"
                                placeholder="Enter department description"
                            ></textarea>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <button 
                                type="submit"
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                                Update Department
                            </button>
                            <button 
                                type="button"
                                onClick={() => navigate('/admin-dashboard/departments')}
                                className="px-6 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </>
        )}</>
    )
}

export default EditDepartment