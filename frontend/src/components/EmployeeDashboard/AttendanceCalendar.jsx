import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isToday, isBefore, addMonths, subMonths } from 'date-fns';
import { Box, Paper, Typography, IconButton, CircularProgress, useTheme, useMediaQuery } from '@mui/material';
import { ChevronLeft, ChevronRight, Clock, Calendar, AlertCircle } from 'lucide-react';
import config from "../../config";

const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const AttendanceCalendar = ({ onDateSelect }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [attendanceData, setAttendanceData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [calendarDays, setCalendarDays] = useState([]);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const generateCalendarDays = () => {
            const monthStart = startOfMonth(currentMonth);
            const monthEnd = endOfMonth(monthStart);
            const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
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

    const getStatusColor = (dayData) => {
        if (!dayData) return 'transparent';
        if (dayData.isHoliday) return '#F3E5F5';
        if (dayData.isWeekend) return '#E3F2FD';

        const attendance = dayData.attendance;
        if (!attendance && isBefore(new Date(dayData.date), new Date())) {
            return '#FFEBEE';
        }
        if (!attendance) return 'transparent';

        switch (attendance.approvalStatus) {
            case 'Approved': return '#E8F5E9';
            case 'Pending': return '#FFF3E0';
            case 'Rejected': return '#FFEBEE';
            case 'Auto-Approved': return '#E0F2F1';
            default: return 'transparent';
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

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box p={2} bgcolor="error.light" borderRadius={1}>
                <Typography color="error">{error}</Typography>
            </Box>
        );
    }

    const MobileCalendarDay = ({ day, dayData, attendanceInfo, isCurrentDay, isCurrentMonth, isPastDate }) => (
        <Box
            onClick={() => isPastDate && onDateSelect(day, dayData?.attendance)}
            sx={{
                display: 'flex',
                p: 2,
                bgcolor: getStatusColor(dayData),
                opacity: isCurrentMonth ? 1 : 0.5,
                cursor: isPastDate ? 'pointer' : 'default',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
                mb: 1,
                transition: 'all 0.2s',
                '&:hover': isPastDate ? {
                    transform: 'scale(1.01)',
                    bgcolor: theme => getStatusColor(dayData) === 'transparent'
                        ? theme.palette.action.hover
                        : getStatusColor(dayData),
                } : {}
            }}
        >
            <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                <Typography
                    variant="subtitle2"
                    sx={{
                        fontWeight: isCurrentDay ? 'bold' : 'medium',
                        color: isCurrentDay ? 'primary.main' : 'text.primary'
                    }}
                >
                    {format(day, 'EEE, MMM d')}
                </Typography>

                {attendanceInfo && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, gap: 1 }}>
                        <attendanceInfo.icon size={16} />
                        <Typography variant="body2">
                            {attendanceInfo.label}
                            {attendanceInfo.subLabel && ` - ${attendanceInfo.subLabel}`}
                        </Typography>
                        {attendanceInfo.time && (
                            <Typography
                                variant="body2"
                                sx={{
                                    ml: 'auto',
                                    bgcolor: 'background.paper',
                                    px: 1,
                                    py: 0.5,
                                    borderRadius: 1,
                                    border: '1px solid',
                                    borderColor: 'divider'
                                }}
                            >
                                {attendanceInfo.time}
                            </Typography>
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );

    const DesktopCalendarDay = ({ day, dayData, attendanceInfo, isCurrentDay, isCurrentMonth, isPastDate }) => (
        <Box
            onClick={() => isPastDate && onDateSelect(day, dayData?.attendance)}
            sx={{
                position: 'relative',
                pt: '100%',
                bgcolor: getStatusColor(dayData),
                opacity: isCurrentMonth ? 1 : 0.5,
                cursor: isPastDate ? 'pointer' : 'default',
                border: isCurrentDay ? '2px solid' : '1px solid',
                borderColor: isCurrentDay ? 'primary.main' : 'divider',
                transition: 'all 0.2s',
                '&:hover': isPastDate ? {
                    transform: 'scale(1.02)',
                    bgcolor: theme => getStatusColor(dayData) === 'transparent'
                        ? theme.palette.action.hover
                        : getStatusColor(dayData),
                } : {}
            }}
        >
            <Box
                sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    p: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center'
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        position: 'absolute',
                        top: 4,
                        left: 4,
                        fontWeight: isCurrentDay ? 'bold' : 'medium',
                        color: isCurrentDay ? 'primary.main' : 'text.primary'
                    }}
                >
                    {format(day, 'd')}
                </Typography>

                {attendanceInfo && (
                    <Box sx={{ mt: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                        <attendanceInfo.icon size={16} />
                        <Typography variant="caption" sx={{ textAlign: 'center', lineHeight: 1.2 }}>
                            {attendanceInfo.label}
                        </Typography>
                        {attendanceInfo.subLabel && (
                            <Typography variant="caption" sx={{ textAlign: 'center', lineHeight: 1.2 }}>
                                {attendanceInfo.subLabel}
                            </Typography>
                        )}
                        {attendanceInfo.time && (
                            <Box sx={{
                                mt: 0.5,
                                px: 1,
                                py: 0.25,
                                bgcolor: 'background.paper',
                                border: '1px solid',
                                borderColor: 'divider',
                                borderRadius: 4,
                                fontSize: '0.75rem'
                            }}>
                                {attendanceInfo.time}
                            </Box>
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
    return (
        <Paper elevation={1} sx={{ p: 3, maxWidth: '100%', overflow: 'hidden' }}>
            {/* Calendar Header */}
            <Box sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                mb: 3,
                flexWrap: { xs: 'wrap', sm: 'nowrap' },
                gap: 2
            }}>
                <Typography variant="h6" fontWeight="medium" sx={{ width: { xs: '100%', sm: 'auto' } }}>
                    Attendance Calendar
                </Typography>

                <Box sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                    width: { xs: '100%', sm: 'auto' },
                    justifyContent: { xs: 'center', sm: 'flex-end' }
                }}>
                    <IconButton
                        onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
                        size="small"
                    >
                        <ChevronLeft size={20} />
                    </IconButton>
                    <Typography variant="subtitle1" sx={{
                        minWidth: 120,
                        textAlign: 'center',
                        fontSize: { xs: '0.875rem', sm: '1rem' }
                    }}>
                        {format(currentMonth, 'MMMM yyyy')}
                    </Typography>
                    <IconButton
                        onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
                        size="small"
                    >
                        <ChevronRight size={20} />
                    </IconButton>
                </Box>
            </Box>

            {/* Legend */}
            <Box sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: { xs: 1, sm: 2 },
                mb: 3,
                p: 2,
                bgcolor: 'grey.50',
                borderRadius: 1
            }}>
                {[
                    { color: '#E8F5E9', label: 'Approved' },
                    { color: '#FFF3E0', label: 'Pending' },
                    { color: '#FFEBEE', label: 'Missing/Rejected' },
                    { color: '#F3E5F5', label: 'Holiday' },
                    { color: '#E3F2FD', label: 'Weekend' }
                ].map(item => (
                    <Box key={item.label} sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        flexBasis: { xs: '45%', sm: 'auto' }
                    }}>
                        <Box sx={{
                            width: { xs: 12, sm: 16 },
                            height: { xs: 12, sm: 16 },
                            bgcolor: item.color,
                            borderRadius: 1
                        }} />
                        <Typography variant="caption" sx={{ fontSize: { xs: '0.625rem', sm: '0.75rem' } }}>
                            {item.label}
                        </Typography>
                    </Box>
                ))}
            </Box>

            {/* Responsive Calendar View */}
            {isMobile ? (
                <Box sx={{ mt: 2 }}>
                    {calendarDays.map((day, index) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const dayData = attendanceData[dateStr];
                        const attendanceInfo = getAttendanceInfo(day);
                        const isCurrentDay = isToday(day);
                        const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                        const isPastDate = isBefore(day, new Date()) || isToday(day);

                        if (!isCurrentMonth) return null;

                        return (
                            <MobileCalendarDay
                                key={dateStr}
                                day={day}
                                dayData={dayData}
                                attendanceInfo={attendanceInfo}
                                isCurrentDay={isCurrentDay}
                                isCurrentMonth={isCurrentMonth}
                                isPastDate={isPastDate}
                            />
                        );
                    })}
                </Box>
            ) : (
                <Box sx={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    gap: 0.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    overflow: 'hidden'
                }}>
                    {weekDays.map(day => (
                        <Box key={day} sx={{
                            p: 1,
                            textAlign: 'center',
                            bgcolor: 'grey.50',
                            borderBottom: '1px solid',
                            borderColor: 'divider'
                        }}>
                            <Typography variant="subtitle2" sx={{
                                fontWeight: 'medium',
                                fontSize: { xs: '0.75rem', sm: '0.875rem' }
                            }}>
                                {day}
                            </Typography>
                        </Box>
                    ))}

                    {calendarDays.map((day, index) => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const dayData = attendanceData[dateStr];
                        const attendanceInfo = getAttendanceInfo(day);
                        const isCurrentDay = isToday(day);
                        const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                        const isPastDate = isBefore(day, new Date()) || isToday(day);

                        return (
                            <DesktopCalendarDay
                                key={dateStr}
                                day={day}
                                dayData={dayData}
                                attendanceInfo={attendanceInfo}
                                isCurrentDay={isCurrentDay}
                                isCurrentMonth={isCurrentMonth}
                                isPastDate={isPastDate}
                            />
                        );
                    })}
                </Box>
            )}
        </Paper>
    );
}
export default AttendanceCalendar;