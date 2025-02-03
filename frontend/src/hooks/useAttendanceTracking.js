import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import config from '../config';

export const useAttendanceTracking = () => {
  const [attendance, setAttendance] = useState(null);
  const [attendanceStatus, setAttendanceStatus] = useState('loading');
  const [monthlyAttendance, setMonthlyAttendance] = useState({});
  const [error, setError] = useState(null);
  const [lastFetch, setLastFetch] = useState(null);

  const fetchCurrentStatus = useCallback(async () => {
    try {
      if (lastFetch && (Date.now() - lastFetch) < 30000) return;

      const response = await axios.get(
        `${config.API_URL}/api/attendance/current-status`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache'
          }
        }
      );
      
      if (response.data.success) {
        setAttendanceStatus(response.data.status);
        setAttendance(response.data.attendance || null);
        setLastFetch(Date.now());
      }
    } catch (error) {
      setError(error.message);
      console.error('Error fetching attendance status:', error);
    }
  }, [lastFetch]);

  const fetchMonthlyAttendance = useCallback(async (date) => {
    try {
      const startDate = new Date(date.getFullYear(), date.getMonth(), 1);
      const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 0);
      
      const response = await axios.get(
        `${config.API_URL}/api/attendance/my-attendance`,
        {
          params: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          },
          headers: { 
            Authorization: `Bearer ${localStorage.getItem('token')}` 
          }
        }
      );

      if (response.data.success) {
        const attendanceMap = {};
        response.data.attendance.forEach(record => {
          const date = new Date(record.date).toISOString().split('T')[0];
          attendanceMap[date] = record;
        });
        setMonthlyAttendance(attendanceMap);
      }
    } catch (error) {
      setError(error.message);
      console.error('Error fetching monthly attendance:', error);
    }
  }, []);

  useEffect(() => {
    fetchCurrentStatus();
    const currentDate = new Date();
    fetchMonthlyAttendance(currentDate);

    const intervalId = setInterval(fetchCurrentStatus, 60000);
    
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchCurrentStatus();
        fetchMonthlyAttendance(currentDate);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [fetchCurrentStatus, fetchMonthlyAttendance]);

  return { 
    attendance, 
    attendanceStatus, 
    monthlyAttendance, 
    error, 
    refetch: fetchCurrentStatus,
    fetchMonthlyAttendance 
  };
};

export default useAttendanceTracking;