// A component to display the list of teams created by the manager.Displays a list of all teams with actions to edit or view team members.for both admin and manager


import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import DataTable from '../shared/DataTable';
import config from '../../config';
import { useAuth } from '../../context/authContext';
import { getBasePath } from '../../utils/RoleHelper';

const TeamList = () => {
  const [teams, setTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth()
  const navigate = useNavigate();
  const basePath = getBasePath();
  useEffect(() => {
    fetchTeams();
  }, [user]);

  const fetchTeams = async () => {
    try {
      setIsLoading(true);
      let endpoint = `${config.API_URL}/api/team`;
      
      // If user is a manager, only fetch their teams
      if (user.role === 'manager') {
        endpoint = `${config.API_URL}/api/team/manager/${user._id}`;
      }
      
      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Transform the data to include populated fields
      const transformedTeams = response.data.teams.map(team => ({
        ...team,
        managerName: team.managerId?.userId?.name || 'N/A',
        departmentName: team.department?.dep_name || 'N/A',
        memberCount: team.memberCount || 0
      }));
      
      setTeams(transformedTeams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      alert('Failed to fetch teams');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (teamId) => {
    if (!window.confirm('Are you sure you want to delete this team?')) return;
    
    try {
      await axios.delete(`${config.API_URL}/api/team/${teamId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Refresh the team list
      fetchTeams();
    } catch (error) {
      console.error('Error deleting team:', error);
      alert('Failed to delete team');
    }
  };

  const columns = [
    {
      name: 'Team Name',
      selector: row => row.name,
      sortable: true,
      cell: row => (
        <div className="font-medium text-gray-900">{row.name}</div>
      )
    },
    {
      name: 'Manager',
      selector: row => row.managerName,
      sortable: true
    },
    {
      name: 'Department',
      selector: row => row.departmentName,
      sortable: true
    },
    {
      name: 'Members',
      selector: row => row.memberCount,
      sortable: true,
      cell: row => (
        <div className="px-3 py-1 text-center">
          {row.memberCount}
        </div>
      )
    },
    {
      name: 'Actions',
       width: '300px',
      cell: row => (
        <div className="flex gap-2">
          <button
            onClick={() => navigate(`${basePath}/team/members/${row._id}`)}
            className="px-3 py-1 text-sm text-white bg-blue-500 rounded hover:bg-blue-600"
          >
            View Members
          </button>
          {(user.role === 'admin' || (user.role === 'manager' && row.managerId === user._id)) && (
            <>
              <button
                onClick={() => navigate(`${basePath}/team/edit/${row._id}`)}
                className="px-3 py-1 text-sm text-white bg-green-500 rounded hover:bg-green-600"
              >
                Edit
              </button>
              {user.role === 'admin' && (
                <button
                  onClick={() => handleDelete(row._id)}
                  className="px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              )}
            </>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Team Management</h2>
        {(user.role === 'admin' || user.role === 'manager') && (
          <button
            onClick={() => navigate(`${basePath}/team/create`)}
            className="px-4 py-2 text-white bg-indigo-600 rounded hover:bg-indigo-700"
          >
            Add New Team
          </button>
        )}
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          Loading teams...
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={teams}
          pagination
          paginationRowsPerPageOptions={[10, 20, 30, 50]}
          responsive
          striped
          highlightOnHover
        />
      )}
    </div>
  );
};

export default TeamList;