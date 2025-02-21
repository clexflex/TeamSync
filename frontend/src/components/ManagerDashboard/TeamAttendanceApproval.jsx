import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Alert, 
  CircularProgress,
  IconButton
} from '@mui/material';
import { Business as BusinessIcon } from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';
import TaskDetailsModal from '../modal/TaskDetailsModal';
import AttendanceTable from '../shared/AttendanceTable';

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

  return (
    <Paper elevation={0} sx={{ p: 3 }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        mb: 3,
        pb: 2,
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          Team Attendance Approval
        </Typography>
        <TextField
          type="date"
          size="small"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          sx={{ width: 200 }}
        />
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {Object.entries(groupedAttendance).map(([teamName, teamRecords]) => (
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
                workLocation: record.workLocation
              }))}
              title={teamName}
              icon={BusinessIcon}
            />
          ))}
        </Box>
      )}

      <TaskDetailsModal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedRecord(null);
        }}
        attendanceRecord={selectedRecord}
      />
    </Paper>
  );
};

export default TeamAttendanceApproval;