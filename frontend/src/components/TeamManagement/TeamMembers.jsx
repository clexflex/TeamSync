import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import DataTable from "../shared/DataTable";
import { useAuth } from "../../context/authContext";
import config from "../../config";
import { getBasePath } from '../../utils/RoleHelper';

const TeamMembers = () => {
  const { teamId } = useParams();
  const [members, setMembers] = useState([]);
  const [team, setTeam] = useState(null);
  const [availableEmployees, setAvailableEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const { user } = useAuth();
  const navigate = useNavigate();
  const basePath = getBasePath();

  useEffect(() => {
    fetchTeamData();
  }, [teamId]);

  const fetchTeamData = async () => {
    try {
      setIsLoading(true);
      setError("");

      // Fetch team and member data in parallel
      const [teamResponse, membersResponse] = await Promise.all([
        axios.get(`${config.API_URL}/api/team/${teamId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }),
        axios.get(`${config.API_URL}/api/team/${teamId}/members`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        })
      ]);

      const teamData = teamResponse.data.team;
      setTeam(teamData);
      setMembers(membersResponse.data.employees);

      // Only fetch available employees if user has permission to add members
      if (user.role === 'admin' || (user.role === 'manager' && teamData.managerId._id === user._id)) {
        const availableResponse = await axios.get(
          `${config.API_URL}/api/employee/department/${teamData.department._id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
        );

        // Filter out employees who are already in a team
        const availableEmps = availableResponse.data.employees.filter(
          emp => !emp.teamId || emp.teamId === teamId
        );
        setAvailableEmployees(availableEmps);
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
      setError(error.response?.data?.error || "Failed to fetch team data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedEmployee) {
      setError("Please select an employee to add");
      return;
    }
    
    try {
      setIsLoading(true);
      setError("");
      
      await axios.post(
        `${config.API_URL}/api/team/${teamId}/members`,
        { employeeId: selectedEmployee },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      setSuccess("Team member added successfully");
      setSelectedEmployee("");
      await fetchTeamData(); // Refresh data
    } catch (error) {
      setError(error.response?.data?.error || "Failed to add team member");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!window.confirm("Are you sure you want to remove this member from the team?")) return;
    
    try {
      setIsLoading(true);
      setError("");
      
      await axios.delete(
        `${config.API_URL}/api/team/${teamId}/members/${memberId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      
      setSuccess("Team member removed successfully");
      await fetchTeamData(); // Refresh data
    } catch (error) {
      setError(error.response?.data?.error || "Failed to remove team member");
    } finally {
      setIsLoading(false);
    }
  };

  const columns = [
    { 
      name: "Employee ID",
      selector: row => row.employeeId,
      sortable: true 
    },
    { 
      name: "Name",
      selector: row => row.userId?.name,
      sortable: true 
    },
    { 
      name: "Email",
      selector: row => row.userId?.email 
    },
    { 
      name: "Department",
      selector: row => row.department?.dep_name 
    },
    {
      name: "Actions",
      cell: row => {
        const canModifyTeam = user.role === 'admin' || 
          (user.role === 'manager' && team?.managerId?._id === user._id);
        
        return canModifyTeam ? (
          <button
            onClick={() => handleRemoveMember(row._id)}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Remove
          </button>
        ) : null;
      },
    },
  ];

  if (isLoading && !team) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      {/* Header Section */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">{team?.name}</h2>
          <button
            onClick={() => navigate(`${basePath}/team`)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
          >
            Back to Teams
          </button>
        </div>

        {/* Team Info */}
        <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
          <div>
            <p className="text-sm text-gray-600">Department</p>
            <p className="font-medium">{team?.department?.dep_name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Manager</p>
            <p className="font-medium">{team?.managerId?.userId?.name}</p>
          </div>
          {team?.description && (
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Description</p>
              <p className="font-medium">{team.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Error/Success Messages */}
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

      {/* Add Member Section */}
      {(user.role === 'admin' || (user.role === 'manager' && team?.managerId?._id === user._id)) && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">Add Team Member</h3>
          <div className="flex gap-4">
            <select
              value={selectedEmployee}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="flex-1 p-2 border rounded focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select Employee</option>
              {availableEmployees.map(emp => (
                <option key={emp._id} value={emp._id}>
                  {emp.userId?.name} - {emp.employeeId}
                </option>
              ))}
            </select>
            <button
              onClick={handleAddMember}
              disabled={!selectedEmployee || isLoading}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 
                       disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? 'Adding...' : 'Add Member'}
            </button>
          </div>
        </div>
      )}

      {/* Members Table */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Team Members ({members.length})</h3>
        <DataTable
          columns={columns}
          data={members}
          pagination
          paginationRowsPerPageOptions={[10, 20, 30]}
          responsive
          striped
          highlightOnHover
          progressPending={isLoading}
          progressComponent={
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
          }
        />
      </div>
    </div>
  );
};

export default TeamMembers;