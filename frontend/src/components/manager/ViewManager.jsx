import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import config from "../../config";

const ViewManager = () => {
    const { id } = useParams();
    const [manager, setManager] = useState(null);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchManager = async () => {
            try {
                const response = await axios.get(`${config.API_URL}/api/manager/${id}`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem('token')}`
                    }
                });
                
                if (response.data.success) {
                    setManager(response.data.manager);
                }
            } catch (error) {
                if (error.response && !error.response.data.success) {
                    alert(error.response.data.error);
                }
            } finally {
                setLoading(false);
            }
        };

        fetchManager();
    }, [id]);

    if (loading) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="text-xl">Loading...</div>
        </div>;
    }

    if (!manager) {
        return <div className="flex items-center justify-center min-h-screen">
            <div className="text-xl text-red-500">Manager not found</div>
        </div>;
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="bg-blue-600 text-white px-6 py-4">
                    <h1 className="text-2xl font-bold">Manager Details</h1>
                </div>

                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Basic Information */}
                        <div className="space-y-4">
                            <div className="flex flex-col">
                                <span className="text-gray-600 font-semibold">Name:</span>
                                <span className="text-gray-900">{manager.userId.name}</span>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-gray-600 font-semibold">Manager ID:</span>
                                <span className="text-gray-900">{manager.managerId}</span>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-gray-600 font-semibold">Email:</span>
                                <span className="text-gray-900">{manager.userId.email}</span>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-gray-600 font-semibold">Department:</span>
                                <span className="text-gray-900">{manager.department.dep_name}</span>
                            </div>

                            <div className="flex flex-col">
                                <span className="text-gray-600 font-semibold">Designation:</span>
                                <span className="text-gray-900">{manager.designation}</span>
                            </div>
                        </div>

                        {/* Profile Image */}
                        <div className="flex justify-center md:justify-end">
                            {manager.userId.profileImage ? (
                                <img 
                                    src={`${config.API_URL}/uploads/${manager.userId.profileImage}`}
                                    alt="Profile"
                                    className="w-48 h-48 rounded-full object-cover border-4 border-blue-600"
                                />
                            ) : (
                                <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500 text-xl">No Image</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Teams Section */}
                    {manager.teams && manager.teams.length > 0 && (
                        <div className="mt-8">
                            <h2 className="text-xl font-semibold mb-4">Teams Under Management</h2>
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {manager.teams.map((team) => (
                                        <div key={team._id} className="bg-white p-4 rounded shadow">
                                            <h3 className="font-semibold">{team.name}</h3>
                                            <p className="text-sm text-gray-600">Members: {team.members?.length || 0}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-8 flex justify-end space-x-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
                        >
                            Back
                        </button>
                        <button
                            onClick={() => navigate(`/manager/edit/${manager._id}`)}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                        >
                            Edit Manager
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ViewManager;