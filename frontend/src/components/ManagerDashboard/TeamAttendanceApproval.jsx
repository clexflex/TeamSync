import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { Check, X, AlertCircle, Clock, Building } from 'lucide-react';
import TaskDetailsModal from '../modal/TaskDetailsModal';
import AttendanceTable from "../shared/AttendanceTable";

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
      const response = await axios.put(
        `${config.API_URL}/api/attendance/approve`,
        {
          attendanceId,
          approvalStatus: status
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        fetchTeamAttendance();
      } else {
        setError("Failed to update approval status");
      }
    } catch (err) {
      setError("Failed to update approval status");
      console.error('Error:', err);
    }
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

      {loading ? (
        <div className="w-full h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        Object.entries(groupedAttendance).map(([teamName, teamRecords]) => (
          <AttendanceTable
            key={teamName}
            records={teamRecords.map(record => ({
              ...record,
              onApprove: () => handleApproval(record._id, 'Approved'),
              onReject: () => handleApproval(record._id, 'Rejected'),
              onViewTasks: () => {
                setSelectedRecord(record);
                setIsModalOpen(true);
              },
              // Add work location that's specific to TeamAttendanceApproval
              workLocation: record.workLocation
            }))}
            title={teamName}
            icon={Building}
          />
        ))
      )}

      {/* Keep the TaskDetailsModal as is */}
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