import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { Clock } from 'lucide-react';
import useAttendanceTracking  from '../../hooks/useAttendanceTracking';
import AttendanceHistoryModal from './AttendanceHistoryModal';
import AttendanceCalendar from './AttendanceCalendar';

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

  // In EmployeeAttendanceForm.jsx
const handleClockIn = async () => {
  try {
      setLoading(true);
      await axios.post(
          `${config.API_URL}/api/attendance/clock-in`,
          { 
              workLocation: form.workLocation,
              timezone: Intl.DateTimeFormat().resolvedOptions().timeZone 
          },
          { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setMessage('Clock-in successful');
      refetch();
  } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to clock in');
  } finally {
      setLoading(false);
  }
};

  const handleClockOut = async () => {
    try {
      if (!form.tasksDone.trim()) {
        setMessage('Please provide tasks done before clocking out');
        return;
      }
      setLoading(true);
      await axios.post(
        `${config.API_URL}/api/attendance/clock-out`,
        { tasksDone: form.tasksDone },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setMessage('Clock-out successful');
      refetch();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Failed to clock out');
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
        {(message || error) && (
          <div className={`mb-4 p-3 rounded ${error ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
            {message || error}
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
                        onClick={async () => {
                            await handleClockIn();
                            window.location.reload();
                        }}
                        disabled={loading}
                        className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50
                                 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                                 hover:shadow-lg"
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
                        onClick={async () => {
                            await handleClockOut();
                            window.location.reload();
                        }}
                        disabled={loading}
                        className="w-full py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50
                                 transform transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]
                                 hover:shadow-lg"
                    >
                        {loading ? (
                            <span className="inline-block animate-spin mr-2">⌛</span>
                        ) : null}
                        Clock Out
                    </button>
                </div>
            )  : null}
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