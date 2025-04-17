import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Paper, 
  Typography, 
  TextField, 
  Alert, 
  CircularProgress,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { Business as BusinessIcon } from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';
import TaskDetailsModal from '../modal/TaskDetailsModal';
import AttendanceTable from '../shared/AttendanceTable';
import RejectionDialog from '../modal/RejectionDialog';

const TeamAttendanceApproval = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [groupedAttendance, setGroupedAttendance] = useState({});
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [rejectionDialogOpen, setRejectionDialogOpen] = useState(false);
  const [recordToReject, setRecordToReject] = useState(null);

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

  const handleRejection = (record) => {
    setRecordToReject(record);
    setRejectionDialogOpen(true);
  };

  const confirmRejection = async (comment) => {
    try {
      const response = await axios.put(
        `${config.API_URL}/api/attendance/approve`,
        {
          attendanceId: recordToReject._id,
          approvalStatus: "Rejected",
          comments: comment
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        fetchTeamAttendance();
        setRejectionDialogOpen(false);
        setRecordToReject(null);
      } else {
        setError("Failed to reject attendance");
      }
    } catch (err) {
      setError("Failed to reject attendance");
      console.error('Error:', err);
    }
  };

  return (
    <Paper elevation={0} sx={{ p: { xs: 2, sm: 3 } }}>
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
          Team Attendance Approval
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
          {Object.entries(groupedAttendance).map(([teamName, teamRecords]) => (
            <AttendanceTable
              key={teamName}
              records={teamRecords.map(record => ({
                ...record,
                onApprove: () => handleApproval(record._id, 'Approved'),
                onReject: () => handleRejection(record),
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

export default TeamAttendanceApproval;