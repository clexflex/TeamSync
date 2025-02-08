import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { Clock } from 'lucide-react';
import useAttendanceTracking from '../../hooks/useAttendanceTracking';
import AttendanceHistoryModal from './AttendanceHistoryModal';
import AttendanceCalendar from './AttendanceCalendar';
import { logger } from '../../utils/logger'; 

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
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'

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

    // console.log("Checking geofence for:", lat, lon);
    return isInsideGeoFence(lat, lon, geoFencePoints);
  };

  const showNotification = (msg, type = 'error') => {
    logger.info(`Notification: ${msg}`);
    setMessage(msg);
    setMessageType(type);
    // Clear message after 5 seconds
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
        // console.log("Geofence check result:", isInside);
        
        if (!isInside) {
          showNotification("You are not within the office premises. Please make sure you're at the office location to clock in for onsite work.");
          logger.warn("Clock-in failed due to geofence restriction", { location });
          setLoading(false);
          return;
        }
      }

      // console.log("Sending Clock-in request with location:", location);

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
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Attendance Dashboard</h1>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-gray-600" />
            <span className="text-gray-600">
              {new Date().toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* Messages */}
        {message && (
          <div className={`mb-4 p-4 rounded-lg ${
            messageType === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          } transition-all duration-300 ease-in-out`}>
            {message}
          </div>
        )}

        {/* Today's Attendance Panel */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h2 className="text-lg font-semibold mb-4">Today's Attendance</h2>
          {attendanceStatus === 'not-started' ? (
            <div className="space-y-4">
              <select
                value={form.workLocation}
                onChange={(e) => setForm(prev => ({ ...prev, workLocation: e.target.value }))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 transition-all duration-200"
              >
                <option value="Onsite">Onsite</option>
                <option value="Remote">Remote</option>
              </select>
              <button
                onClick={handleClockIn}
                disabled={loading}
                className={`w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50
                         transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                         hover:shadow-lg flex items-center justify-center`}
              >
                {loading ? (
                  <span className="inline-block animate-spin mr-2">⌛</span>
                ) : null}
                Clock In
              </button>
            </div>
          ) : attendanceStatus === 'clocked-in' ? (
            <div className="space-y-4">
              <textarea
                value={form.tasksDone}
                onChange={(e) => setForm(prev => ({ ...prev, tasksDone: e.target.value }))}
                placeholder="Enter tasks completed..."
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                rows={4}
              />
              <button
                onClick={handleClockOut}
                disabled={loading}
                className={`w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50
                         transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                         hover:shadow-lg flex items-center justify-center`}
              >
                {loading ? (
                  <span className="inline-block animate-spin mr-2">⌛</span>
                ) : null}
                Clock Out
              </button>
            </div>
          ) : null}
        </div>

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
      </div>
    </div>
  );
};

export default EmployeeAttendanceForm;