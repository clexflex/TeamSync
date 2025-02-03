import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/authContext";
import config from "../../config";
import { getBasePath } from '../../utils/RoleHelper';

const EditTeam = () => {
    const { teamId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const basePath = getBasePath();
    
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        managerId: '',
        department: '',
        members: [] // We'll keep this but won't modify it
    });

    useEffect(() => {
        fetchTeamData();
    }, [teamId]);

    const fetchTeamData = async () => {
        try {
            setIsLoading(true);
            setError("");
            
            const response = await axios.get(`${config.API_URL}/api/team/${teamId}`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });
            
            const team = response.data.team;
            setFormData({
                name: team.name,
                description: team.description,
                managerId: team.managerId._id,
                department: team.department._id,
                members: team.members || []
            });
            
        } catch (error) {
            console.error('Error fetching team data:', error);
            setError(error.response?.data?.error || "Failed to fetch team data");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.name.trim()) {
            setError("Team name is required");
            return;
        }

        try {
            setIsLoading(true);
            setError("");
            setSuccess("");

            await axios.put(`${config.API_URL}/api/team/${teamId}`, formData, {
                headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
            });

            setSuccess("Team updated successfully");
            setTimeout(() => {
                navigate(`${basePath}/team`);
            }, 1500);

        } catch (error) {
            console.error('Error updating team:', error);
            setError(error.response?.data?.error || "Failed to update team");
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Edit Team</h2>
                <button
                    onClick={() => navigate(`${basePath}/team`)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                    Back to Teams
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                    {error}
                </div>
            )}

            {success && (
                <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700">Team Name</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                        required
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        rows="4"
                        className="mt-1 block w-full rounded-md border border-gray-300 shadow-sm p-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={() => navigate(`${basePath}/team`)}
                        className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Updating...' : 'Update Team'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default EditTeam;