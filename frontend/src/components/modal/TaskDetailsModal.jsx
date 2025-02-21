import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Typography,
  Box,
  Grid,
  Chip,
  Button,
  Paper
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

const TaskDetailsModal = ({ open, onClose, attendanceRecord }) => {
  if (!attendanceRecord) return null;

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      default:
        return 'warning';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          p: 1
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}>
        <Box>
          <Typography variant="h6" fontWeight="bold">
            Task Details - {attendanceRecord.userId?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {formatDate(attendanceRecord.date)}
          </Typography>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper elevation={0} sx={{ p: 2, bgcolor: 'grey.50' }}>
            <Grid container spacing={4}>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Clock In</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {formatTime(attendanceRecord.clockIn)}
                </Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2" color="text.secondary">Clock Out</Typography>
                <Typography variant="body1" fontWeight="medium">
                  {attendanceRecord.clockOut ? formatTime(attendanceRecord.clockOut) : '-'}
                </Typography>
              </Grid>
            </Grid>
          </Paper>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">Work Location</Typography>
              <Chip 
                label={attendanceRecord.workLocation}
                size="small"
                color="primary"
                variant="outlined"
              />
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">Hours Worked</Typography>
              <Typography variant="body2" fontWeight="medium">
                {attendanceRecord.hoursWorked ? `${attendanceRecord.hoursWorked.toFixed(2)} hours` : '-'}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="text.secondary">Status</Typography>
              <Chip 
                label={attendanceRecord.approvalStatus}
                size="small"
                color={getStatusColor(attendanceRecord.approvalStatus)}
              />
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" gutterBottom fontWeight="medium">
              Tasks Completed
            </Typography>
            <Paper 
              elevation={0} 
              sx={{ 
                p: 2, 
                bgcolor: 'grey.50', 
                whiteSpace: 'pre-wrap',
                minHeight: 100
              }}
            >
              <Typography variant="body2">
                {attendanceRecord.tasksDone || 'No tasks recorded'}
              </Typography>
            </Paper>
          </Box>
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button 
          onClick={onClose}
          variant="contained"
          color="inherit"
          size="small"
        >
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskDetailsModal;