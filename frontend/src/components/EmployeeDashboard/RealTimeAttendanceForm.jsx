import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../../config';
import useAttendanceTracking from '../../hooks/useAttendanceTracking';
import useSocket from '../../hooks/useSocket';
import AttendanceHistoryModal from './AttendanceHistoryModal';
import AttendanceCalendar from './AttendanceCalendar';
import { logger } from '../../utils/logger';
import {
  Box,
  Paper,
  Typography,
  Select,
  MenuItem,
  Button,
  TextField,
  Alert,
  Container,
  CircularProgress,
  FormControl,
  InputLabel,
  Chip,
  Snackbar,
  Card,
  CardContent,
  Grid,
  Divider,
  IconButton,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  AccessTime as ClockIcon,
  Check as CheckIcon,
  LocationOn as LocationIcon,
  Person as PersonIcon,
  EventNote as TasksIcon,
  Cancel as CancelIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';

const RealTimeAttendanceForm = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Get the user's timezone from the browser
  const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  const { attendance, attendanceStatus, error: attendanceError, refetch } = useAttendanceTracking(userTimezone);
  const { socket, connected: socketConnected } = useSocket();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [monthlyAttendance, setMonthlyAttendance] = useState({});
  const [selectedAttendance, setSelectedAttendance] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    workLocation: 'Onsite',
    tasksDone: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [socketNotification, setSocketNotification] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [clockInTime, setClockInTime] = useState(null);

  // Handle socket notifications
  useEffect(() => {
    if (socket) {
      socket.on('attendance_update', (data) => {
        logger.info('Received attendance update:', data);
        
        // Show notification
        setSocketNotification(data);
        setShowSnackbar(true);
        
        // Update UI based on event type
        if (data.type === 'clock-in' || data.type === 'clock-out' || data.type === 'approval_status') {
          refetch();
        }
      });
      
      return () => {
        socket.off('attendance_update');
      };
    }
  }, [socket, refetch]);

  // Calculate elapsed time for active sessions
  useEffect(() => {
    let intervalId;
    
    if (attendanceStatus === 'clocked-in' && attendance?.clockIn) {
      setClockInTime(new Date(attendance.clockIn));
      const startTime = new Date(attendance.clockIn).getTime();
      
      const updateElapsedTime = () => {
        const currentTime = Date.now();
        const elapsed = Math.floor((currentTime - startTime) / 1000); // in seconds
        setElapsedTime(elapsed);
      };
      
      updateElapsedTime();
      intervalId = setInterval(updateElapsedTime, 1000);
    } else {
      setElapsedTime(0);
      setClockInTime(null);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [attendanceStatus, attendance]);

  const fetchMonthlyAttendance = useCallback(async (date) => {
    try {
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      
      const response = await axios.get(
        `${config.API_URL}/api/attendance/monthly`,
        {
          params: { 
            month, 
            year,
            timezone: userTimezone // Add user timezone
          },
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }
      );
      
      if (response.data.success) {
        setMonthlyAttendance(response.data.attendance);
      }
    } catch (err) {
      logger.error('Error fetching monthly attendance:', err);
    }
  }, [userTimezone]);

  useEffect(() => {
    fetchMonthlyAttendance(selectedDate);
  }, [selectedDate, fetchMonthlyAttendance]);

  const getGeoLocation = async () => {
    return new Promise((resolve, reject) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            logger.info('Geolocation retrieved', position.coords);
            resolve(position.coords);
          },
          (error) => {
            logger.error('Geolocation error', error);
            reject(new Error('Failed to get your location. Please make sure location services are enabled.'));
          }
        );
      } else {
        logger.warn('Geolocation not supported by browser');
        reject(new Error('Geolocation is not supported by your browser.'));
      }
    });
  };

  const checkGeoFence = (lat, lon) => {
    const geoFencePoints = [
      { lat: 18.886617, lon: 74.288205 },
      { lat: 18.886617, lon: 73.389729 },
      { lat: 18.202419, lon: 73.389729 },
      { lat: 18.202419, lon: 74.288205 }
    ];
    
    let inside = false;
    for (let i = 0, j = geoFencePoints.length - 1; i < geoFencePoints.length; j = i++) {
      const xi = geoFencePoints[i].lat, yi = geoFencePoints[i].lon;
      const xj = geoFencePoints[j].lat, yj = geoFencePoints[j].lon;

      const intersect = ((yi > lon) !== (yj > lon)) &&
        (lat < (xj - xi) * (lon - yi) / (yj - yi) + xi);
      if (intersect) inside = !inside;
    }
    return inside;
  };

  const showNotification = (msg, type = 'error') => {
    logger.info(`Notification: ${msg}`);
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      refetch();
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const handleClockIn = async () => {
    try {
      setLoading(true);
      logger.info('Clock-in attempt started');
      let location;

      try {
        location = await getGeoLocation();
      } catch (error) {
        showNotification(error.message);
        setLoading(false);
        return;
      }

      if (form.workLocation === "Onsite") {
        const isInside = checkGeoFence(location.latitude, location.longitude);
        if (!isInside) {
          showNotification("You are not within the office premises. Please make sure you're at the office location to clock in for onsite work.");
          logger.warn("Clock-in failed due to geofence restriction", { location });
          setLoading(false);
          return;
        }
      }

      // Include timezone information in the request
      await axios.post(
        `${config.API_URL}/api/attendance/clock-in`,
        {
          workLocation: form.workLocation,
          timezone: userTimezone,
          location,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      showNotification('Clock-in successful. You are now on duty!', 'success');
      refetch();
    } catch (error) {
      const errorMessage = error.response?.data?.error || 'Failed to clock in. Please try again.';
      showNotification(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClockOut = async () => {
    try {
      if (!form.tasksDone.trim()) {
        showNotification('Please provide tasks done before clocking out');
        return;
      }
      setLoading(true);
      logger.info('Clock-out attempt started');

      // Include timezone in the clock-out request
      await axios.post(
        `${config.API_URL}/api/attendance/clock-out`,
        {
          tasksDone: form.tasksDone,
          timezone: userTimezone
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      showNotification('Clock-out successful. Your work day has been recorded!', 'success');
      refetch();
    } catch (error) {
      logger.error('Clock-out failed', error);
      const errorMessage = error.response?.data?.error || 'Failed to clock out';
      showNotification(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const formatElapsedTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatTime = (date) => {
    if (!date) return "";
    const d = new Date(date);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  // Display the user's current local time and timezone for debugging
  const userLocalTime = new Date().toLocaleString('en-US', { timeZone: userTimezone });

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 2, sm: 3, md: 4 }, px: { xs: 1, sm: 2, md: 3 } }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
        {/* Header */}
        <Box sx={{ 
          display: 'flex', 
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between', 
          alignItems: isMobile ? 'flex-start' : 'center', 
          gap: isMobile ? 1 : 0,
          mb: { xs: 2, sm: 3, md: 4 } 
        }}>
          <Typography 
            variant={isMobile ? "h5" : "h4"} 
            component="h1" 
            fontWeight="bold" 
            color="text.primary"
          >
            Real-Time Attendance
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 1.5,
            mt: isMobile ? 1 : 0
          }}>
            {socketConnected ? (
              <Chip 
                label="Live" 
                color="success" 
                size="small" 
                variant="outlined"
                sx={{ borderRadius: 4, height: 24 }}
              />
            ) : (
              <Chip 
                label="Offline" 
                color="error" 
                size="small" 
                variant="outlined"
                sx={{ borderRadius: 4, height: 24 }}
              />
            )}
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ fontSize: isMobile ? 12 : 14 }}
            >
              {userLocalTime} ({userTimezone})
            </Typography>
          </Box>
        </Box>

        {/* Messages */}
        {message && (
          <Alert 
            severity={messageType === 'success' ? 'success' : 'error'}
            sx={{ mb: { xs: 2, md: 3 } }}
            onClose={() => setMessage('')}
          >
            {message}
          </Alert>
        )}

        {/* Real-time attendance status */}
        <Paper 
          variant="outlined" 
          sx={{ 
            p: 0, 
            mb: { xs: 3, md: 4 }, 
            bgcolor: attendanceStatus === 'clocked-in' ? 'success.soft' : 'grey.50',
            borderColor: attendanceStatus === 'clocked-in' ? 'success.main' : 'divider',
            position: 'relative',
            overflow: 'hidden',
            borderRadius: 2
          }}
        >
          <Box 
            sx={{ 
              p: { xs: 1.5, sm: 2 },
              bgcolor: attendanceStatus === 'clocked-in' ? 'success.soft' : 'grey.50',
              borderBottom: 1,
              borderColor: 'divider',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <ClockIcon 
                color={attendanceStatus === 'clocked-in' ? 'success' : 'primary'} 
                fontSize={isMobile ? "small" : "medium"}
              />
              <Typography 
                variant={isMobile ? "subtitle1" : "h6"} 
                fontWeight="medium" 
                color={attendanceStatus === 'clocked-in' ? 'success.dark' : 'primary'}
              >
                {attendanceStatus === 'clocked-in' ? 'Currently Working' : 'Today\'s Attendance'}
              </Typography>
            </Box>
            
            {attendanceStatus === 'clocked-in' && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography 
                  variant={isMobile ? "subtitle1" : "h6"} 
                  fontWeight="bold" 
                  color="success.dark"
                >
                  {formatElapsedTime(elapsedTime)}
                </Typography>
              </Box>
            )}
          </Box>
          
          <Box sx={{ p: { xs: 2, sm: 3 } }}>
            {attendanceStatus === 'loading' ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : attendanceStatus === 'not-started' ? (
              <Grid container spacing={isMobile ? 2 : 3}>
                <Grid item  size={{ xs: 12, md: 8 }} >
                  <FormControl fullWidth>
                    <InputLabel>Work Location</InputLabel>
                    <Select
                      value={form.workLocation}
                      onChange={(e) => setForm(prev => ({ ...prev, workLocation: e.target.value }))}
                      label="Work Location"
                      size={isMobile ? "small" : "medium"}
                    >
                      <MenuItem value="Onsite">Onsite</MenuItem>
                      <MenuItem value="Remote">Remote</MenuItem>
                    </Select>
                  </FormControl>
                  
                  <Typography 
                    variant="body2" 
                    color="text.secondary" 
                    sx={{ mt: 1.5, mb: { xs: 2, md: 3 } }}
                  >
                    {form.workLocation === "Onsite" 
                      ? "You must be within office premises to clock in for onsite work." 
                      : "You can work from anywhere with remote work."}
                  </Typography>
                  
                  <Button
                    variant="contained"
                    onClick={handleClockIn}
                    disabled={loading}
                    fullWidth
                    color="primary"
                    size={isMobile ? "medium" : "large"}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <ClockIcon />}
                    sx={{
                      py: isMobile ? 1 : 1.5,
                      position: 'relative',
                      '&:hover': {
                        transform: 'scale(1.01)'
                      },
                      transition: 'transform 0.2s'
                    }}
                  >
                    Clock In Now
                  </Button>
                </Grid>
                
                <Grid item  size={{ xs: 12, md: 4 }} >
                  <Card sx={{ 
                    height: '100%', 
                    bgcolor: 'grey.50', 
                    border: 1, 
                    borderColor: 'divider',
                    minHeight: isMobile ? 'auto' : 156  // Add minimum height for consistent layout
                  }}>
                    <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                        Not Clocked In
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        Your attendance status will update in real-time once you clock in.
                      </Typography>
                      <Divider sx={{ my: 1.5 }} />
                      <Typography variant="caption" color="text.secondary">
                        Last updated: {new Date().toLocaleTimeString()}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : attendanceStatus === 'clocked-in' ? (
              <Grid container spacing={isMobile ? 2 : 3}>
                <Grid item  size={{ xs: 12, md: 8 }} >
                  <TextField
                    multiline
                    rows={isMobile ? 3 : 4}
                    value={form.tasksDone}
                    onChange={(e) => setForm(prev => ({ ...prev, tasksDone: e.target.value }))}
                    placeholder="Enter tasks completed during your work day..."
                    variant="outlined"
                    fullWidth
                    required
                    label="Tasks Completed"
                    size={isMobile ? "small" : "medium"}
                  />
                  
                  <Button
                    variant="contained"
                    onClick={handleClockOut}
                    disabled={loading}
                    fullWidth
                    color="success"
                    size={isMobile ? "medium" : "large"}
                    startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <CheckIcon />}
                    sx={{
                      py: isMobile ? 1 : 1.5,
                      mt: { xs: 2, md: 3 },
                      position: 'relative',
                      '&:hover': {
                        transform: 'scale(1.01)'
                      },
                      transition: 'transform 0.2s'
                    }}
                  >
                    Clock Out
                  </Button>
                </Grid>
                
                <Grid item  size={{ xs: 12, md: 4 }} >
                  <Card sx={{ 
                    height: '100%', 
                    bgcolor: 'background.paper', 
                    border: 1, 
                    borderColor: 'divider',
                    minHeight: isMobile ? 'auto' : 156  // Add minimum height for consistent layout
                  }}>
                    <CardContent sx={{ p: isMobile ? 1.5 : 2 }}>
                      <Typography 
                        variant={isMobile ? "subtitle2" : "subtitle1"} 
                        gutterBottom 
                        sx={{ fontWeight: 'medium', color: 'success.main' }}
                      >
                        Currently Working
                      </Typography>
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        mb: 1,
                        flexWrap: isMobile ? 'wrap' : 'nowrap' 
                      }}>
                        <ClockIcon fontSize="small" color="action" />
                        <Typography variant="body2" noWrap={!isMobile}>
                          Clock In: {formatTime(clockInTime)}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        mb: 1,
                        flexWrap: isMobile ? 'wrap' : 'nowrap'
                      }}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2" noWrap={!isMobile}>
                          Location: {attendance?.workLocation || "N/A"}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1, 
                        mb: 1,
                        flexWrap: isMobile ? 'wrap' : 'nowrap'
                      }}>
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2" noWrap={!isMobile}>
                          Status: {attendance?.approvalStatus || "Pending"}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: 1,
                        flexWrap: isMobile ? 'wrap' : 'nowrap'
                      }}>
                        <TasksIcon fontSize="small" color="action" />
                        <Typography variant="body2" noWrap={!isMobile}>
                          Task entry required before clock-out
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            ) : (
              <Box sx={{ p: { xs: 2, sm: 3 }, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  You've already completed your attendance for today.
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>

        {/* Make the calendar responsive */}
        <Box sx={{ 
          overflow: 'auto',
          maxWidth: '100%',
          WebkitOverflowScrolling: 'touch',
          '&::-webkit-scrollbar': {
            height: '8px',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: '4px',
          },
        }}>
          <AttendanceCalendar
            monthlyAttendance={monthlyAttendance}
            currentDate={selectedDate}
            onDateSelect={(date, attendance) => {
              setSelectedDate(date);
              setSelectedAttendance(attendance);
              if (attendance) {
                setShowModal(true);
              }
            }}
            userTimezone={userTimezone}
          />
        </Box>

        {showModal && selectedAttendance && (
          <AttendanceHistoryModal
            attendance={selectedAttendance}
            onClose={() => setShowModal(false)}
          />
        )}
        
        {/* Socket notification snackbar - Mobile-optimized */}
        <Snackbar
          open={showSnackbar}
          autoHideDuration={5000}
          onClose={() => setShowSnackbar(false)}
          anchorOrigin={{ 
            vertical: isMobile ? 'top' : 'bottom', 
            horizontal: isMobile ? 'center' : 'right' 
          }}
          sx={{ 
            '& .MuiPaper-root': { 
              borderRadius: 2,
              boxShadow: 4,
              maxWidth: isMobile ? '90vw' : '400px',
              width: isMobile ? '90vw' : 'auto'
            } 
          }}
        >
          <Alert 
            severity={
              socketNotification?.type === 'clock-in' || 
              socketNotification?.type === 'clock-out' || 
              (socketNotification?.type === 'approval_status' && 
              socketNotification?.status === 'Approved') ? 'success' : 'info'
            }
            variant="filled"
            sx={{ width: '100%' }}
            action={
              <IconButton
                size="small"
                color="inherit"
                onClick={() => setShowSnackbar(false)}
              >
                <CancelIcon fontSize="small" />
              </IconButton>
            }
            icon={<NotificationsIcon />}
          >
            {socketNotification?.message || 'Attendance updated'}
          </Alert>
        </Snackbar>
      </Paper>
    </Container>
  );
};

export default RealTimeAttendanceForm;