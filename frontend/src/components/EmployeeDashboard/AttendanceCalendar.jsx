import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { 
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    startOfWeek,
    endOfWeek,
    isSameDay,
    isToday,
    isBefore,
    addMonths,
    subMonths,
    parseISO,
    addDays
} from 'date-fns';
import { ChevronLeft, ChevronRight, Clock, Calendar, AlertCircle } from 'lucide-react';

const AttendanceCalendar = ({ onDateSelect }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [calendarDays, setCalendarDays] = useState([]);

    // Define week days starting from Monday
    const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    useEffect(() => {
        // Generate calendar days including padding days
        const generateCalendarDays = () => {
            const monthStart = startOfMonth(currentMonth);
            const monthEnd = endOfMonth(monthStart);
            const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); // 1 represents Monday
            const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

            const days = eachDayOfInterval({ start: startDate, end: endDate });
            setCalendarDays(days);
        };

        generateCalendarDays();
        fetchMonthlyAttendance(currentMonth);
    }, [currentMonth]);

    const fetchMonthlyAttendance = async (date) => {
        try {
            setLoading(true);
            const response = await axios.get(
                `${config.API_URL}/api/attendance/monthly`,
                {
                    params: {
                        month: date.getMonth() + 1,
                        year: date.getFullYear()
                    },
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                }
            );

            if (response.data.success) {
                setAttendanceData(response.data.attendance);
            }
        } catch (err) {
            setError('Failed to fetch attendance data');
            console.error('Error fetching attendance:', err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        console.log("Attendance Data:", attendanceData);
    }, [attendanceData]);
    
    const isWeekend = (date) => {
        const day = date.getDay();
        return day === 0 || day === 6; // Sunday (0) or Saturday (6)
    };

    const getStatusColor = (dayData) => {
        if (!dayData) return 'bg-gray-50 hover:bg-gray-100';
        
        const baseClasses = 'transition-colors duration-200';
        
        if (dayData.isHoliday) {
            return `${baseClasses} bg-purple-100 hover:bg-purple-200`;
        }
        if (dayData.isWeekend) {
            return `${baseClasses} bg-blue-50 hover:bg-blue-100`;
        }

        const attendance = dayData.attendance;
        if (!attendance && isBefore(new Date(dayData.date), new Date())) {
            return `${baseClasses} bg-red-100 hover:bg-red-200`; // Missing attendance
        }
        if (!attendance) {
            return `${baseClasses} bg-gray-50 hover:bg-gray-100`;
        }

        switch (attendance.approvalStatus) {
            case 'Approved':
                return `${baseClasses} bg-green-100 hover:bg-green-200`;
            case 'Pending':
                return `${baseClasses} bg-yellow-100 hover:bg-yellow-200`;
            case 'Rejected':
                return `${baseClasses} bg-red-100 hover:bg-red-200`;
            case 'Auto-Approved':
                return `${baseClasses} bg-teal-100 hover:bg-teal-200`;
            default:
                return `${baseClasses} bg-gray-50 hover:bg-gray-100`;
        }
    };

    const getAttendanceInfo = (date) => {
        if (!date) return null;
        
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayData = attendanceData[dateStr];
        
        if (!dayData) return null;

        if (dayData.isHoliday) {
            return {
                icon: Calendar,
                label: dayData.holidayName || 'Holiday',
                time: null
            };
        }
        
        if (dayData.isWeekend) {
            return {
                icon: Calendar,
                label: 'Weekend',
                time: null
            };
        }

        const attendance = dayData.attendance;
        if (!attendance) {
            if (isBefore(new Date(date), new Date())) {
                return {
                    icon: AlertCircle,
                    label: 'Missing',
                    time: null
                };
            }
            return null;
        }

        return {
            icon: Clock,
            label: attendance.status,
            subLabel: attendance.approvalStatus,
            time: attendance.clockIn ? format(new Date(attendance.clockIn), 'HH:mm') : null,
            hoursWorked: attendance.hoursWorked
        };
    };

    const navigateMonth = (direction) => {
        setCurrentMonth(direction === 'next' ? 
            addMonths(currentMonth, 1) : 
            subMonths(currentMonth, 1)
        );
    };

    if (loading) {
        return (
            <div className="w-full h-96 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="w-full p-4 text-center text-red-600 bg-red-50 rounded-lg">
                {error}
            </div>
        );
    }

    const isCurrentMonth = (date) => {
        return date.getMonth() === currentMonth.getMonth();
    };

    return (
        <div className="w-full bg-white shadow-lg rounded-lg p-6">
            {/* Calendar Header */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                    Attendance Calendar
                </h2>
                <div className="flex items-center space-x-4">
                    <button
                        onClick={() => navigateMonth('prev')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-lg font-medium text-gray-700">
                        {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <button
                        onClick={() => navigateMonth('next')}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200"
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-100 rounded" />
                    <span className="text-sm text-gray-600">Approved</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-yellow-100 rounded" />
                    <span className="text-sm text-gray-600">Pending</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-100 rounded" />
                    <span className="text-sm text-gray-600">Missing/Rejected</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-purple-100 rounded" />
                    <span className="text-sm text-gray-600">Holiday</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-50 rounded" />
                    <span className="text-sm text-gray-600">Weekend</span>
                </div>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2">
                {/* Week day headers */}
                {weekDays.map((day) => (
                    <div
                        key={day}
                        className="text-center font-medium p-2 text-gray-600"
                    >
                        {day}
                    </div>
                ))}

                {/* Calendar days */}
                {calendarDays.map((day, index) => {
                    const dateStr = format(day, 'yyyy-MM-dd');
                    const dayData = attendanceData[dateStr];
                    const isCurrentDay = isToday(day);
                    const attendanceInfo = getAttendanceInfo(day);
                    const isDifferentMonth = !isCurrentMonth(day);

                    return (
                        <button
                            key={dateStr}
                            onClick={() => onDateSelect(day, dayData?.attendance)}
                            className={`
                                relative p-4 rounded-lg min-h-[100px]
                                ${getStatusColor(dayData)}
                                ${isCurrentDay ? 'ring-2 ring-blue-500' : ''}
                                ${isDifferentMonth ? 'opacity-50' : ''}
                                flex flex-col items-center justify-between
                            `}
                            disabled={!isBefore(day, new Date()) && !isToday(day)}
                        >
                            <span className={`
                                text-sm font-medium
                                ${isCurrentDay ? 'text-blue-600' : 'text-gray-700'}
                            `}>
                                {format(day, 'd')}
                            </span>

                            {attendanceInfo && (
                                <div className="flex flex-col items-center mt-2 gap-1">
                                    <attendanceInfo.icon className="w-4 h-4 text-gray-600" />
                                    <span className="text-xs text-gray-600 font-medium">
                                        {attendanceInfo.label}
                                    </span>
                                    {attendanceInfo.subLabel && (
                                        <span className="text-xs text-gray-500">
                                            {attendanceInfo.subLabel}
                                        </span>
                                    )}
                                    {attendanceInfo.time && (
                                        <span className="text-xs text-gray-500">
                                            {attendanceInfo.time}
                                        </span>
                                    )}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default AttendanceCalendar;