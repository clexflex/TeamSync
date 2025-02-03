import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';

const AdminAttendanceReport = () => {
  const [reportData, setReportData] = useState({
    dateRange: [],
    usersByRole: {},
    holidays: [],
    periodInfo: {
      totalDays: 0,
      totalHolidays: 0,
      workingDays: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    const month = today.getDate() > 25 ? today.getMonth() + 1 : today.getMonth();
    const year = today.getFullYear();
    return `${year}-${String(month).padStart(2, '0')}`;
  });

  useEffect(() => {
    fetchReportData();
  }, [selectedMonth]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [year, month] = selectedMonth.split('-').map(Number);
      
      // Create dates in the user's local timezone
      const startDate = new Date(year, month - 1, 26);
      const endDate = new Date(year, month, 25);
  
      // Format dates in ISO format but preserve the local date
      const formatDate = (date) => {
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        return adjustedDate.toISOString().split('T')[0];
      };
  
      const response = await axios.get(`${config.API_URL}/api/attendance/reports`, {
        params: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate)
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
  
      if (response.data.success) {
        // Convert UTC dates back to local timezone for display
        const processedData = {
          ...response.data.data,
          dateRange: response.data.data.dateRange.map(date => ({
            ...date,
            date: date.date,
            dayName: new Date(date.date).toLocaleDateString('en-US', { weekday: 'short' }),
          }))
        };
        setReportData(processedData);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const roles = Object.keys(reportData.usersByRole);
    const headers = [
      'Name',
      'Role',
      'Team',
      'Department',
      'Total Present',
      'Total Absent',
      'Attendance %',
      'Avg Hours/Day',
      ...reportData.dateRange.map(date => date.date)
    ].join(',');

    const rows = roles.flatMap(role =>
      reportData.usersByRole[role].map(user => {
        const dailyAttendance = reportData.dateRange.map(date => {
          const attendance = user.attendance[date.date];
          return attendance ? attendance.status : 'Absent';
        });

        return [
          user.name,
          role,
          user.team,
          user.department,
          user.stats.totalPresent,
          user.stats.totalAbsent,
          user.stats.attendancePercentage,
          user.stats.avgHoursPerDay,
          ...dailyAttendance
        ].join(',');
      })
    );

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${selectedMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const renderMonthSelector = () => (
    <div className="flex items-center space-x-4">
      <select
        value={selectedMonth}
        onChange={(e) => setSelectedMonth(e.target.value)}
        className="border rounded-md p-2"
      >
        {Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        }).map((month) => (
          <option key={month} value={month}>
            {new Date(month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
          </option>
        ))}
      </select>
      <button
        onClick={exportToCSV}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
      >
        Export Report
      </button>
    </div>
  );

  const renderSummaryCard = () => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Total Days</h3>
        <p className="text-2xl font-bold text-blue-600">{reportData.periodInfo.totalDays}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Working Days</h3>
        <p className="text-2xl font-bold text-green-600">{reportData.periodInfo.workingDays}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Holidays</h3>
        <p className="text-2xl font-bold text-purple-600">{reportData.periodInfo.totalHolidays}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-lg font-semibold text-gray-700">Period</h3>
        <p className="text-sm font-medium text-gray-600">
          {reportData.periodInfo.startDate} - {reportData.periodInfo.endDate}
        </p>
      </div>
    </div>
  );

  const AttendanceStatus = ({ data }) => {
    const getStatusColor = () => {
      if (data.isHoliday) return 'bg-purple-100 text-purple-800';
      switch (data.status) {
        case 'Present': return 'bg-green-100 text-green-800';
        case 'Absent': return 'bg-red-100 text-red-800';
        case 'Half-Day': return 'bg-yellow-100 text-yellow-800';
        case 'Pending': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className={`p-2 rounded ${getStatusColor()}`}>
        <div className="text-xs font-medium">{data.status}</div>
        {data.hoursWorked > 0 && (
          <div className="text-xs">{data.hoursWorked.toFixed(1)}h</div>
        )}
      </div>
    );
  };

  const renderRoleSection = (role, users) => (
    <div key={role} className="mb-8">
      <h2 className="text-xl font-bold mb-4 text-gray-800 capitalize">{role}s</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                Employee
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stats
              </th>
              {reportData.dateRange.map((date) => (
                <th key={date.date} className="px-3 py-3 text-center">
                  <div className="flex flex-col items-center text-xs">
                    <span className={`font-medium ${date.dayName === 'Sun' || date.dayName === 'Sat' ? 'text-red-500' : ''}`}>
                      {date.dayName}
                    </span>
                    <span>{new Date(date.date).getDate()}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-4 whitespace-nowrap sticky left-0 bg-inherit">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.team}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {user.department}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <div className="text-xs space-y-1">
                    <div>Present: {user.stats.totalPresent}</div>
                    <div>Absent: {user.stats.totalAbsent}</div>
                    <div>Attendance: {user.stats.attendancePercentage}%</div>
                    <div>Avg Hours: {user.stats.avgHoursPerDay}h</div>
                  </div>
                </td>
                {reportData.dateRange.map((date) => (
                  <td key={date.date} className="px-3 py-4 whitespace-nowrap text-sm text-center">
                    <AttendanceStatus data={{
                      status: user.attendance[date.date]?.status || 'Absent',
                      hoursWorked: user.attendance[date.date]?.hoursWorked || 0,
                      isHoliday: date.isHoliday
                    }} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full bg-gray-50">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 space-y-4 md:space-y-0">
        <h1 className="text-2xl font-bold text-gray-900">Attendance Report</h1>
        {renderMonthSelector()}
      </div>

      {renderSummaryCard()}

      {Object.entries(reportData.usersByRole).map(([role, users]) => 
        renderRoleSection(role, users)
      )}
    </div>
  );
};

export default AdminAttendanceReport;