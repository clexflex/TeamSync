import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import config from '../../config';
import { useAuth } from '../../context/authContext';
import { getBasePath } from '../../utils/RoleHelper';

const AddTeam = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [managers, setManagers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    managerId: '',
    department: '',
    description: '',
  });
  const basePath = getBasePath();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);

        if (user.role === 'admin') {
          const managersResponse = await axios.get(`${config.API_URL}/api/manager`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setManagers(managersResponse.data.managers);

          const departmentsResponse = await axios.get(`${config.API_URL}/api/department`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          setDepartments(departmentsResponse.data.departments);
        } else if (user.role === 'manager') {
          const managerResponse = await axios.get(`${config.API_URL}/api/manager/${user._id}`, {
            headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
          });
          const managerData = managerResponse.data.manager;
          setFormData(prev => ({
            ...prev,
            managerId: managerData._id,
            department: managerData.department._id
          }));

          const employeesResponse = await axios.get(
            `${config.API_URL}/api/employee/department/${managerData.department._id}`,
            { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
          );
          setEmployees(employeesResponse.data.employees);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to load required data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, [user]);

  const handleManagerSelect = async (managerId) => {
    try {
      const managerInfo = managers.find(m => m._id === managerId);
      if (managerInfo) {
        setFormData(prev => ({
          ...prev,
          managerId,
          department: managerInfo.department._id
        }));

        const response = await axios.get(
          `${config.API_URL}/api/employee/department/${managerInfo.department._id}`,
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
        );
        setEmployees(response.data.employees);
      }
    } catch (error) {
      console.error('Error fetching department employees:', error);
      alert('Failed to load department employees');
    }
  };

  const handleEmployeeSelect = (employeeId) => {
    setSelectedEmployees((prev) =>
      prev.includes(employeeId) ? prev.filter((id) => id !== employeeId) : [...prev, employeeId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      const teamData = {
        ...formData,
        members: selectedEmployees,
      };

      await axios.post(`${config.API_URL}/api/team/create`, teamData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      navigate(`${basePath}/team`);
    } catch (error) {
      console.error('Error creating team:', error);
      alert(error.response?.data?.error || 'Failed to create team');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-600"></div>
    </div>;
  }

  return (
    <div className="max-w-4xl mx-auto bg-white p-10">
      <div className="border-b border-gray-200 pb-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-gray-800">Create New Team</h2>
          <button
            onClick={() => navigate(`${basePath}/team`)}
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Team Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>

          {user.role === 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
              <select
                value={formData.managerId}
                onChange={(e) => handleManagerSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              >
                <option value="">Select Manager</option>
                {managers.map(manager => (
                  <option key={manager._id} value={manager._id}>
                    {manager.userId.name} - {manager.department.dep_name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows="4"
            />
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Select Team Members</h3>
          <div className="bg-gray-50 rounded-lg p-4 max-h-80 overflow-y-auto">
            {employees.length === 0 ? (
              <p className="text-gray-500 text-center">No available employees found</p>
            ) : (
              <div className="space-y-2">
                {employees.map((employee) => (
                  <div key={employee._id} className="flex items-center p-2 hover:bg-gray-100 rounded-md transition-colors">
                    <input
                      type="checkbox"
                      id={employee._id}
                      checked={selectedEmployees.includes(employee._id)}
                      onChange={() => handleEmployeeSelect(employee._id)}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor={employee._id} className="ml-3 text-sm text-gray-700 cursor-pointer">
                      {employee.userId?.name} - {employee.employeeId}
                    </label>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => navigate(`${basePath}/team`)}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Team'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddTeam;