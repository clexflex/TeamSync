import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  TextField, 
  Alert, 
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { PersonOutline, Groups } from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';
import TaskDetailsModal from '../modal/TaskDetailsModal';
import AttendanceTable from '../shared/AttendanceTable';
import RejectionDialog from '../modal/RejectionDialog';

const AdminAttendanceApproval = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [attendanceData, setAttendanceData] = useState([]);
  const [groupedAttendance, setGroupedAttendance] = useState({
    managers: [],
    teams: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [recordToReject, setRecordToReject] = useState(null);

  useEffect(() => {
    fetchAllAttendance();
  }, [selectedDate]);

  const fetchAllAttendance = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_URL}/api/attendance/all`, {
        params: { date: selectedDate.toISOString() },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      if (response.data.success) {
        setAttendanceData(response.data.attendance || []);
        const grouped = { managers: [], teams: {} };
        response.data.attendance.forEach((record) => {
          if (record.role === 'manager') {
            grouped.managers.push(record);
          } else {
            const teamName = record.teamId?.name || 'Unassigned';
            if (!grouped.teams[teamName]) {
              grouped.teams[teamName] = [];
            }
            grouped.teams[teamName].push(record);
          }
        });
        setGroupedAttendance(grouped);
      }
    } catch (err) {
      setError('Failed to fetch attendance data');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApproval = async (attendanceId, status) => {
    try {
      await axios.put(
        `${config.API_URL}/api/attendance/approve`,
        { attendanceId, approvalStatus: status },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchAllAttendance();
    } catch (err) {
      setError('Failed to update approval status');
      console.error('Error:', err);
    }
  };

  const handleRejection = (record) => {
    setRecordToReject(record);
    setRejectionDialogOpen(true);
  };

  const confirmRejection = async (comment) => {
    try {
      await axios.put(
        `${config.API_URL}/api/attendance/approve`,
        {
          attendanceId: recordToReject._id,
          approvalStatus: "Rejected",
          comments: comment
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      fetchAllAttendance();
      setRejectionDialogOpen(false);
      setRecordToReject(null);
    } catch (err) {
      setError('Failed to reject attendance');
      console.error('Error:', err);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 }, height: '100%' }}>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: isMobile ? 'column' : 'row',
        justifyContent: 'space-between', 
        alignItems: isMobile ? 'flex-start' : 'center', 
        mb: 3, 
        pb: 2, 
        gap: isMobile ? 2 : 0,
        borderBottom: 1, 
        borderColor: 'divider'
      }}>
        <Typography variant="h5" fontWeight="bold" color="text.primary" sx={{ mb: isMobile ? 1 : 0 }}>
          Attendance Approval
        </Typography>
        <TextField
          type="date"
          size="small"
          fullWidth={isMobile}
          value={selectedDate.toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          sx={{ width: isMobile ? '100%' : 200 }}
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
          {groupedAttendance.managers.length > 0 && (
            <AttendanceTable
              records={groupedAttendance.managers.map(record => ({
                ...record,
                onApprove: (id, status) => handleApproval(id, status),
                onReject: () => handleRejection(record),
                onViewTasks: () => {
                  setSelectedRecord(record);
                  setIsModalOpen(true);
                }
              }))}
              title="Manager Attendance"
              icon={PersonOutline}
            />
          )}

          {Object.entries(groupedAttendance.teams).map(([teamName, records]) => (
            <AttendanceTable
              key={teamName}
              records={records.map(record => ({
                ...record,
                onApprove: (id, status) => handleApproval(id, status),
                onReject: () => handleRejection(record),
                onViewTasks: () => {
                  setSelectedRecord(record);
                  setIsModalOpen(true);
                }
              }))}
              title={`${teamName} Team Attendance`}
              icon={Groups}
            />
          ))}
        </Box>
      )}

      <TaskDetailsModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        attendanceRecord={selectedRecord}
      />

      <RejectionDialog
        open={rejectionDialogOpen}
        onClose={() => {
          setRejectionDialogOpen(false);
          setRecordToReject(null);
        }}
        onConfirm={confirmRejection}
        attendanceRecord={recordToReject}
      />
    </Paper>
  );
};

export default AdminAttendanceApproval;