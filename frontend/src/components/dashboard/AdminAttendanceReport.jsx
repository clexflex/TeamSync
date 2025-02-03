import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import config from '../../config';

const AdminAttendanceReport = () => {
  const [selectedTeam, setSelectedTeam] = useState('all');
  const [teams, setTeams] = useState([]);
  const [reportData, setReportData] = useState({
    userAttendanceStats: [],
    teamStats: [],
    dailyTrends: [],
    periodInfo: { 
      totalDays: 0, 
      totalAttendance: 0, 
      totalValidAttendance: 0 
    }
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState(() => {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    return {
      startDate: firstDay.toISOString().split('T')[0],
      endDate: today.toISOString().split('T')[0]
    };
  });

  // Quick date range presets
  const datePresets = {
    'This Month': () => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      setDateRange({
        startDate: firstDay.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      });
    },
    'Last Month': () => {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const lastDay = new Date(today.getFullYear(), today.getMonth(), 0);
      setDateRange({
        startDate: firstDay.toISOString().split('T')[0],
        endDate: lastDay.toISOString().split('T')[0]
      });
    },
    'Last 3 Months': () => {
      const today = new Date();
      const threeMonthsAgo = new Date(today.getFullYear(), today.getMonth() - 2, 1);
      setDateRange({
        startDate: threeMonthsAgo.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      });
    }
  };

  useEffect(() => {
    const fetchTeams = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/api/team`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });
        if (response.data.success) {
          setTeams(response.data.teams);
        }
      } catch (error) {
        console.error('Error fetching teams:', error);
      }
    };
    fetchTeams();
  }, []);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${config.API_URL}/api/attendance/reports`, {
          params: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
            teamId: selectedTeam
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        });

        if (response.data.success) {
          setReportData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, [selectedTeam, dateRange]);

  // Memoized calculations for performance
  const reportSummary = useMemo(() => {
    const userAttendanceStats = reportData.userAttendanceStats || [];
    const periodInfo = reportData.periodInfo || {};

    return {
      totalUsers: userAttendanceStats.length,
      totalAttendance: periodInfo.totalAttendance || 0,
      totalValidAttendance: periodInfo.totalValidAttendance || 0
    };
  }, [reportData]);

  const renderDateRangeSelector = () => (
    <div className="flex flex-wrap items-center space-x-4 mb-4">
      <div className="flex items-center space-x-2">
        <label>From:</label>
        <input
          type="date"
          value={dateRange.startDate}
          onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
          className="border rounded p-2"
        />
      </div>
      <div className="flex items-center space-x-2">
        <label>To:</label>
        <input
          type="date"
          value={dateRange.endDate}
          onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
          className="border rounded p-2"
        />
      </div>
      <div className="flex space-x-2">
        {Object.entries(datePresets).map(([label, handler]) => (
          <button
            key={label}
            onClick={handler}
            className="bg-blue-100 hover:bg-blue-200 px-3 py-2 rounded"
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );

  // Enhanced report table with department and detailed information
  const renderReportTable = () => {
    const { userAttendanceStats } = reportData;
    
    return (
      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Department</th>
              <th className="p-3 text-center">Total Working Days</th>
              <th className="p-3 text-center">Attendance</th>
              <th className="p-3 text-center">Work Type</th>
              <th className="p-3 text-center">Avg Hours</th>
            </tr>
          </thead>
          <tbody>
            {userAttendanceStats.map((user, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="p-3">{user.name}</td>
                <td className="p-3">{user.department || 'Unassigned'}</td>
                <td className="p-3 text-center">{user.totalWorkingDays}</td>
                <td className="p-3 text-center">
                  {user.totalValidPresent}/{reportData.periodInfo.totalDays} 
                  <span className="text-xs text-gray-500 block">({user.attendancePercentage}%)</span>
                </td>
                <td className="p-3 text-center">
                  Remote: {user.remoteWork}
                  <br />
                  Onsite: {user.onsiteWork}
                </td>
                <td className="p-3 text-center">{user.avgHoursWorked.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-4">Attendance Analytics</h1>
        
        {renderDateRangeSelector()}
        
        <div className="flex space-x-4 mb-4">
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="border rounded p-2"
          >
            <option value="all">All Teams</option>
            {teams.map(team => (
              <option key={team._id} value={team._id}>{team.name}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-100 p-4 rounded">
            <h3 className="text-sm text-gray-600">Total Users</h3>
            <p className="text-2xl font-bold">{reportSummary.totalUsers}</p>
          </div>
          <div className="bg-green-100 p-4 rounded">
            <h3 className="text-sm text-gray-600">Total Attendance</h3>
            <p className="text-2xl font-bold">{reportSummary.totalAttendance}</p>
          </div>
          <div className="bg-yellow-100 p-4 rounded">
            <h3 className="text-sm text-gray-600">Valid Attendance</h3>
            <p className="text-2xl font-bold">{reportSummary.totalValidAttendance}</p>
          </div>
          <div className="bg-purple-100 p-4 rounded">
            <h3 className="text-sm text-gray-600">Date Range</h3>
            <p className="text-sm">
              {new Date(dateRange.startDate).toLocaleDateString()} - 
              {new Date(dateRange.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        {renderReportTable()}
      </div>
    </div>
  );
};

export default AdminAttendanceReport;