import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { Check, X, AlertCircle, Clock, Building } from 'lucide-react';
import TaskDetailsModal from '../modal/TaskDetailsModal';

const TeamAttendanceApproval = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [groupedAttendance, setGroupedAttendance] = useState({});
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchTeamAttendance();
  }, [selectedDate]);

  const fetchTeamAttendance = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_URL}/api/attendance/team`, {
        params: {
          date: selectedDate.toISOString(),
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        // Use the pre-grouped data from the backend
        setGroupedAttendance(response.data.groupedAttendance || {});
        setAttendanceData(response.data.attendance || []);
      }
    } catch (err) {
      setError('Failed to fetch team attendance');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (attendanceId, status) => {
    try {
      await axios.put(
        `${config.API_URL}/api/attendance/approve`,
        {
          attendanceId,
          approvalStatus: status,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      fetchTeamAttendance();
    } catch (err) {
      setError('Failed to update approval status');
      console.error('Error:', err);
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="w-full h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white shadow-md rounded-md p-4">
      <div className="flex flex-row items-center justify-between pb-4 border-b">
        <h2 className="text-xl font-bold">Team Attendance Approval</h2>
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="p-2 border rounded-md"
        />
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 text-red-600 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}

      {Object.entries(groupedAttendance).map(([teamName, teamRecords]) => (
        <div key={teamName} className="mt-6">
          <div className="flex items-center mb-4">
            <Building className="w-5 h-5 mr-2 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-800">{teamName}</h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-4 border-b">Employee</th>
                  <th className="p-4 border-b">Clock In</th>
                  <th className="p-4 border-b">Clock Out</th>
                  <th className="p-4 border-b">Hours</th>
                  <th className="p-4 border-b">Tasks</th>
                  <th className="p-4 border-b">Status</th>
                  <th className="p-4 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {teamRecords.map((record) => (
                  <tr key={record._id} className="border-b hover:bg-gray-50">
                    <td className="p-4">
                      <div className="flex items-center">
                        <div>
                          <div className="font-medium">{record.userId.name}</div>
                          <div className="text-sm text-gray-500">{record.workLocation}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">{formatTime(record.clockIn)}</td>
                    <td className="p-4">{record.clockOut ? formatTime(record.clockOut) : '-'}</td>
                    <td className="p-4">{record.hoursWorked ? record.hoursWorked.toFixed(2) : '-'}</td>
                    <td className="p-4 border">
                      <div className="flex items-center space-x-2">
                        <div className="max-w-xs truncate">{record.tasksDone || '-'}</div>
                        {record.tasksDone && (
                          <button
                            onClick={() => {
                              setSelectedRecord(record);
                              setIsModalOpen(true);
                            }}
                            className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            View Details
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={`px-2 py-1 rounded-full text-xs ${record.approvalStatus === 'Approved'
                        ? 'bg-green-100 text-green-800'
                        : record.approvalStatus === 'Rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                        }`}>
                        {record.approvalStatus}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleApproval(record._id, 'Approved')}
                          className="p-1 hover:bg-green-100 rounded-full"
                          disabled={record.approvalStatus === 'Approved'}>
                          <Check className="w-5 h-5 text-green-600" />
                        </button>
                        <button
                          onClick={() => handleApproval(record._id, 'Rejected')}
                          className="p-1 hover:bg-red-100 rounded-full"
                          disabled={record.approvalStatus === 'Rejected'}>
                          <X className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
      {/* Task Details Modal */}
      <TaskDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRecord(null);
        }}
        attendanceRecord={selectedRecord}
      />
    </div>
  );
};

export default TeamAttendanceApproval;