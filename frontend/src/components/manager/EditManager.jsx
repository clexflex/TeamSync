import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import config from "../../config";

const EditManager = () => {
    const [manager, setManager] = useState({
        name: '',
        email: '',
        managerId: '',
        department: '',
        designation: '',
        password: ''
    });
    const [departments, setDepartments] = useState([]);
    const [originalManager, setOriginalManager] = useState(null);
    const [changedFields, setChangedFields] = useState({});
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const fetchManager = async () => {
            try {
                const response = await axios.get(`${config.API_URL}/api/manager/${id}`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.data.success) {
                    const managerData = response.data.manager;
                    const formattedManager = {
                        name: managerData.userId.name,
                        email: managerData.userId.email,
                        managerId: managerData.managerId,
                        department: managerData.department._id,
                        designation: managerData.designation,
                        password: ''
                    };
                    setManager(formattedManager);
                    setOriginalManager(formattedManager);
                }
            } catch (error) {
                console.error("Error fetching manager:", error);
            }
        };

        const fetchDepartments = async () => {
            try {
                const response = await axios.get(`${config.API_URL}/api/department`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.data.success) {
                    setDepartments(response.data.departments);
                }
            } catch (error) {
                console.error("Error fetching departments:", error);
            }
        };

        fetchManager();
        fetchDepartments();
    }, [id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setManager(prev => ({ ...prev, [name]: value }));
        
        if (originalManager[name] !== value) {
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
            updateData[field] = manager[field];
        });

        if (!updateData.password) {
            delete updateData.password;
        }

        try {
            const response = await axios.put(
                `${config.API_URL}/api/manager/${id}`,
                updateData,
                {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );
            if (response.data.success) {
                navigate("/admin-dashboard/managers");
            }
        } catch (error) {
            if (error.response && error.response.data.error) {
                alert(error.response.data.error);
            }
        }
    };

    return (
        <>
            <div className="flex items-center gap-2 text-gray-600 mb-8 cursor-pointer group"
                onClick={() => navigate('/admin-dashboard/managers')}>
                <FaArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
                <span>Back to Managers</span>
            </div>

            <div className="bg-white rounded-lg shadow-sm max-w-4xl mx-auto">
                <div className="p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-800">Edit Manager</h2>
                    <p className="text-sm text-gray-500 mt-1">Modify the manager profile details</p>
                </div>

                {departments && manager ? (
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={manager.name}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    value={manager.email}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Manager ID
                                </label>
                                <input
                                    type="text"
                                    name="managerId"
                                    value={manager.managerId}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Department
                                </label>
                                <select
                                    name="department"
                                    value={manager.department}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                >
                                    <option value="">Select Department</option>
                                    {departments.map(dep => (
                                        <option key={dep._id} value={dep._id}>{dep.dep_name}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Designation
                                </label>
                                <input
                                    type="text"
                                    name="designation"
                                    value={manager.designation}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    New Password (optional)
                                </label>
                                <input
                                    type="password"
                                    name="password"
                                    value={manager.password}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                                />
                            </div>
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
                                onClick={() => navigate('/admin-dashboard/managers')}
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

export default EditManager;