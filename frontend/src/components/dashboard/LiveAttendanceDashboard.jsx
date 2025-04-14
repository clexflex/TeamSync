import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Card, 
  CardContent, 
  Grid, 
  Avatar, 
  Chip, 
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Badge,
  CircularProgress,
  Alert,
  Snackbar,
  Tooltip,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Button
} from '@mui/material';
import { 
  Groups as GroupsIcon,
  Check as CheckIcon,
  AccessTime as ClockIcon,
  Warning as WarningIcon,
  LocationOn as LocationIcon,
  Visibility as VisibilityIcon,
  Notifications as NotificationIcon,
  Refresh as RefreshIcon,
  CorporateFare as OnSiteIcon,
  Home as RemoteIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';
import useSocket from '../../hooks/useSocket';
import TaskDetailsModal from '../modal/TaskDetailsModal';
import { logger } from '../../utils/logger';

const LiveAttendanceDashboard = () => {
  const [activeEmployees, setActiveEmployees] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    onsite: 0,
    remote: 0
  });
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  
  const { socket, connected } = useSocket();
  
  useEffect(() => {
    fetchAttendanceData();
    
    // Set up refresh interval (every 5 minutes as backup if socket fails)
    const intervalId = setInterval(() => {
      if (!connected) {
        fetchAttendanceData();
      }
    }, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  useEffect(() => {
    if (socket) {
      socket.on('team_attendance_update', handleAttendanceUpdate);
      socket.on('admin_attendance_update', handleAttendanceUpdate);
      
      return () => {
        socket.off('team_attendance_update');
        socket.off('admin_attendance_update');
      };
    }
  }, [socket]);
  
  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      
      // Get today's date in ISO format
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      
      const response = await axios.get(`${config.API_URL}/api/attendance/all`, {
        params: { date: todayStr },
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      if (response.data.success) {
        const attendanceData = response.data.attendance || [];
        
        // Filter active employees (clocked in but not out)
        const active = attendanceData.filter(record => 
          record.clockIn && !record.clockOut
        );
        
        setActiveEmployees(active);
        
        // Process recent activity
        const recent = attendanceData
          .sort((a, b) => {
            // Use clockOut if available, otherwise clockIn
            const aTime = a.clockOut ? new Date(a.clockOut) : new Date(a.clockIn);
            const bTime = b.clockOut ? new Date(b.clockOut) : new Date(b.clockIn);
            return bTime - aTime; // Most recent first
          })
          .slice(0, 10); // Take the 10 most recent
        
        setRecentActivity(recent);
        
        // Calculate stats
        const totalEmployees = new Set(attendanceData.map(record => record.userId._id)).size;
        
        const calculateStats = {
          present: attendanceData.filter(record => 
            (record.status === 'Present' || record.clockIn) && !record.clockOut
          ).length,
          absent: totalEmployees - attendanceData.length,
          late: attendanceData.filter(record => {
            if (!record.clockIn) return false;
            const clockInTime = new Date(record.clockIn);
            return clockInTime.getHours() >= 9 && clockInTime.getMinutes() > 30; // After 9:30 AM
          }).length,
          onsite: attendanceData.filter(record => record.workLocation === 'Onsite').length,
          remote: attendanceData.filter(record => record.workLocation === 'Remote').length
        };
        
        setStats(calculateStats);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      setError('Failed to fetch attendance data. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAttendanceUpdate = (data) => {
    logger.info('Attendance update received:', data);
    
    // Show notification
    setNotification({
      message: data.type === 'clock-in' 
        ? `${data.userName} has clocked in (${data.attendance.workLocation})`
        : data.type === 'clock-out'
        ? `${data.userName} has clocked out after ${data.attendance.hoursWorked?.toFixed(2) || 0} hours`
        : `${data.userName}'s attendance was ${data.status?.toLowerCase() || 'updated'} by ${data.approvedBy || 'admin'}`,
      type: data.type,
      timestamp: new Date(),
      severity: data.type === 'approval_status' && data.status === 'Rejected' ? 'warning' : 'info'
    });
    setShowNotification(true);
    
    // Refresh data to reflect the changes
    fetchAttendanceData();
    
    // Browser notification
    if (Notification.permission === 'granted') {
      const title = data.type === 'clock-in' 
        ? `${data.userName} clocked in` 
        : data.type === 'clock-out'
        ? `${data.userName} clocked out`
        : `Attendance ${data.status || 'update'}`;
        
      const body = data.type === 'clock-in'
        ? `Location: ${data.attendance.workLocation}`
        : data.type === 'clock-out'
        ? `Duration: ${data.attendance.hoursWorked?.toFixed(2) || 0} hours`
        : `${data.userName}'s attendance was updated`;
        
      new Notification(title, { body });
    }
  };
  
  const viewAttendanceDetails = (attendance) => {
    setSelectedAttendance(attendance);
    setIsModalOpen(true);
  };
  
  const handleRefresh = () => {
    fetchAttendanceData();
  };
  
  if (loading && !activeEmployees.length) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (error && !activeEmployees.length) {
    return (
      <Paper sx={{ p: 3, bgcolor: 'error.soft', color: 'error.main' }}>
        <Typography>{error}</Typography>
        <Button variant="outlined" color="error" onClick={handleRefresh} sx={{ mt: 2 }}>
          Try Again
        </Button>
      </Paper>
    );
  }
  
  const formatTime = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  const calculateDuration = (clockIn, clockOut) => {
    if (!clockIn) return null;
    
    const start = new Date(clockIn);
    const end = clockOut ? new Date(clockOut) : new Date();
    const diffMs = end - start;
    const diffHrs = diffMs / (1000 * 60 * 60);
    
    return diffHrs.toFixed(2);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold">
          Live Attendance Dashboard
        </Typography>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {connected ? (
              <Chip 
                label="Live Updates" 
                color="success" 
                size="small" 
                icon={<NotificationIcon fontSize="small" />} 
                variant="outlined"
              />
            ) : (
              <Chip 
                label="Offline Mode" 
                color="warning" 
                size="small" 
                icon={<WarningIcon fontSize="small" />} 
                variant="outlined"
              />
            )}
          </Typography>
          
          <Tooltip title="Refresh data">
            <IconButton onClick={handleRefresh} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={0} sx={{ bgcolor: 'primary.soft', height: '100%' }}>
            <CardContent>
              <Typography color="primary" variant="overline" fontWeight="medium">Present</Typography>
              <Typography variant="h4" color="primary.dark">{stats.present}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={0} sx={{ bgcolor: 'error.soft', height: '100%' }}>
            <CardContent>
              <Typography color="error" variant="overline" fontWeight="medium">Absent</Typography>
              <Typography variant="h4" color="error.dark">{stats.absent}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={0} sx={{ bgcolor: 'warning.soft', height: '100%' }}>
            <CardContent>
              <Typography color="warning.dark" variant="overline" fontWeight="medium">Late</Typography>
              <Typography variant="h4" color="warning.dark">{stats.late}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={0} sx={{ bgcolor: 'success.soft', height: '100%' }}>
            <CardContent>
              <Typography color="success.dark" variant="overline" fontWeight="medium">Onsite</Typography>
              <Typography variant="h4" color="success.dark">{stats.onsite}</Typography>
            </CardContent>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6} md={2.4}>
          <Card elevation={0} sx={{ bgcolor: 'info.soft', height: '100%' }}>
            <CardContent>
              <Typography color="info.dark" variant="overline" fontWeight="medium">Remote</Typography>
              <Typography variant="h4" color="info.dark">{stats.remote}</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
      <Grid container spacing={3}>
        {/* Currently Working Employees */}
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 0, border: 1, borderColor: 'divider', height: '100%', overflow: 'hidden', borderRadius: 2 }}>
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              bgcolor: 'grey.50',
              borderBottom: 1,
              borderColor: 'divider'
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Badge 
                  badgeContent={activeEmployees.length} 
                  color="success"
                  sx={{ '& .MuiBadge-badge': { fontSize: 12, height: 20, minWidth: 20 } }}
                >
                  <GroupsIcon color="primary" />
                </Badge>
                <Typography variant="h6" ml={1.5} fontWeight="medium">
                  Currently Working
                </Typography>
              </Box>
              
              <Typography variant="caption" color="text.secondary">
                Last updated: {lastUpdate.toLocaleTimeString()}
              </Typography>
            </Box>
            
            {activeEmployees.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No employees currently clocked in. 
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Employees will appear here when they clock in.
                </Typography>
              </Box>
            ) : (
              <TableContainer sx={{ maxHeight: 440, overflowY: 'auto' }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Employee</TableCell>
                      <TableCell>Location</TableCell>
                      <TableCell>Clock In</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {activeEmployees.map((employee) => (
                      <TableRow key={employee._id} hover>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                            <Avatar alt={employee.userId.name} src={employee.userId.profileImage}>
                              {employee.userId.name.charAt(0)}
                            </Avatar>
                            <Typography variant="body2" fontWeight="medium">
                              {employee.userId.name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Chip
                            icon={employee.workLocation === 'Onsite' ? <OnSiteIcon fontSize="small" /> : <RemoteIcon fontSize="small" />}
                            label={employee.workLocation}
                            size="small"
                            color={employee.workLocation === 'Onsite' ? 'success' : 'info'}
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          {formatTime(employee.clockIn)}
                        </TableCell>
                        <TableCell>
                          {calculateDuration(employee.clockIn)} hrs
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={employee.approvalStatus}
                            size="small"
                            color={
                              employee.approvalStatus === 'Approved' ? 'success' :
                              employee.approvalStatus === 'Rejected' ? 'error' : 'warning'
                            }
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell align="right">
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              onClick={() => viewAttendanceDetails(employee)}
                              sx={{ 
                                bgcolor: 'primary.soft', 
                                color: 'primary.main',
                                '&:hover': { bgcolor: 'primary.main', color: 'white' } 
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
        
        {/* Recent Activity */}
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 0, border: 1, borderColor: 'divider', height: '100%', overflow: 'hidden', borderRadius: 2 }}>
            <Box sx={{ 
              p: 2, 
              display: 'flex', 
              alignItems: 'center', 
              bgcolor: 'grey.50',
              borderBottom: 1,
              borderColor: 'divider'
            }}>
              <ClockIcon color="primary" />
              <Typography variant="h6" ml={1.5} fontWeight="medium">
                Recent Activity
              </Typography>
            </Box>
            
            {recentActivity.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  No recent activity. 
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Employee activity will appear here as they clock in/out.
                </Typography>
              </Box>
            ) : (
              <List sx={{ maxHeight: 440, overflow: 'auto' }}>
                {recentActivity.map((activity) => (
                  <React.Fragment key={activity._id}>
                    <ListItem
                      secondaryAction={
                        <Chip
                          label={activity.clockOut ? "Completed" : "Working"}
                          size="small"
                          color={activity.clockOut ? "success" : "primary"}
                          variant="outlined"
                        />
                      }
                    >
                      <ListItemAvatar>
                        <Avatar 
                          sx={{ 
                            bgcolor: activity.clockOut ? 'success.main' : 'primary.main',
                            color: 'white'
                          }}
                        >
                          {activity.clockOut ? <CheckIcon /> : <ClockIcon />}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="body2" fontWeight="medium">
                            {activity.userId.name}
                          </Typography>
                        }
                        secondary={
                          <Box>
                            <Typography variant="caption" display="block">
                              {activity.clockOut 
                                ? `Clocked out at ${formatTime(activity.clockOut)}` 
                                : `Clocked in at ${formatTime(activity.clockIn)}`}
                            </Typography>
                            
                            {activity.clockOut && activity.clockIn && (
                              <Typography variant="caption" display="block" color="text.secondary">
                                Duration: {calculateDuration(activity.clockIn, activity.clockOut)} hrs
                              </Typography>
                            )}
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider variant="inset" component="li" />
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Attendance details modal */}
      <TaskDetailsModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        attendanceRecord={selectedAttendance}
      />
      
      {/* Real-time notification */}
      <Snackbar
        open={showNotification}
        autoHideDuration={5000}
        onClose={() => setShowNotification(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          severity={notification?.severity || "info"}
          variant="filled"
          action={
            <IconButton size="small" color="inherit" onClick={() => setShowNotification(false)}>
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        >
          {notification?.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default LiveAttendanceDashboard;