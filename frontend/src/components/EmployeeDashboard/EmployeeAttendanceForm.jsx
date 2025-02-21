import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import useAttendanceTracking from '../../hooks/useAttendanceTracking';
import AttendanceHistoryModal from './AttendanceHistoryModal';
import AttendanceCalendar from './AttendanceCalendar';
import { logger } from '../../utils/logger';
import {   Box,   Paper,   Typography,   Select,   MenuItem,   Button,   TextField,   Alert,   Container,   CircularProgress,   FormControl,   InputLabel }from '@mui/material';
import { Clock } from 'lucide-react';

const EmployeeAttendanceForm = () => {
  const { attendance, attendanceStatus, error, refetch } = useAttendanceTracking();
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

  useEffect(() => {
    logger.info('EmployeeAttendanceForm loaded');
  }, []);

  const isInsideGeoFence = (lat, lon, geoFencePoints) => {
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
    return isInsideGeoFence(lat, lon, geoFencePoints);
  };

  const showNotification = (msg, type = 'error') => {
    logger.info(`Notification: ${msg}`);
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      refetch();
      setMessage('');
      setMessageType('');
    }, 3000);
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

      const response = await axios.post(
        `${config.API_URL}/api/attendance/clock-in`,
        {
          workLocation: form.workLocation,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
          location,
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      logger.info('Clock-in successful', response.data);
      showNotification('Clock-in successful', 'success');
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

      await axios.post(
        `${config.API_URL}/api/attendance/clock-out`,
        {
          tasksDone: form.tasksDone,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      logger.info('Clock-out successful');
      showNotification('Clock-out successful', 'success');
      refetch();
    } catch (error) {
      logger.error('Clock-out failed', error);
      const errorMessage = error.response?.data?.error || 'Failed to clock out';
      showNotification(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <Typography variant="h4" component="h1" fontWeight="bold" color="text.primary">
            Attendance Dashboard
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Clock size={20} />
            <Typography variant="body1" color="text.secondary">
              {new Date().toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        {/* Messages */}
        {message && (
          <Alert 
            severity={messageType === 'success' ? 'success' : 'error'}
            sx={{ mb: 3 }}
          >
            {message}
          </Alert>
        )}

        {/* Today's Attendance Panel */}
        <Paper variant="outlined" sx={{ p: 3, mb: 4, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            Today's Attendance
          </Typography>
          
          {attendanceStatus === 'not-started' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Work Location</InputLabel>
                <Select
                  value={form.workLocation}
                  onChange={(e) => setForm(prev => ({ ...prev, workLocation: e.target.value }))}
                  label="Work Location"
                >
                  <MenuItem value="Onsite">Onsite</MenuItem>
                  <MenuItem value="Remote">Remote</MenuItem>
                </Select>
              </FormControl>
              
              <Button
                variant="outlined"
                onClick={handleClockIn}
                disabled={loading}
                sx={{
                  py: 1.5,
                  position: 'relative',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  },
                  transition: 'transform 0.2s'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Clock In'}
              </Button>
            </Box>
          ) : attendanceStatus === 'clocked-in' ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField
                multiline
                rows={4}
                value={form.tasksDone}
                onChange={(e) => setForm(prev => ({ ...prev, tasksDone: e.target.value }))}
                placeholder="Enter tasks completed..."
                variant="outlined"
                fullWidth
              />
              
              <Button
                variant="contained"
                onClick={handleClockOut}
                disabled={loading}
                color="success"
                sx={{
                  py: 1.5,
                  position: 'relative',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  },
                  transition: 'transform 0.2s'
                }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Clock Out'}
              </Button>
            </Box>
          ) : null}
        </Paper>

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
        />

        {showModal && selectedAttendance && (
          <AttendanceHistoryModal
            attendance={selectedAttendance}
            onClose={() => setShowModal(false)}
          />
        )}
      </Paper>
    </Container>
  );
};

export default EmployeeAttendanceForm;