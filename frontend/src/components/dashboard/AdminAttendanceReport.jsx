import React, { useState, useEffect } from 'react';
import {   Box,   Paper,   Typography,   Grid,   Select,   MenuItem,   Button,   Table,   TableBody,   TableCell,   TableContainer,   TableHead,   TableRow,   CircularProgress,   Card,   CardContent,   Stack,   FormControl } from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  GetApp as DownloadIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';

const AdminAttendanceReport = () => {
  const [reportData, setReportData] = useState({
    dateRange: [],
    usersByRole: {},
    holidays: [],
    periodInfo: {
      totalDays: 0,
      totalHolidays: 0,
      workingDays: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    const month = today.getDate() > 25 ? today.getMonth() + 1 : today.getMonth();
    const year = today.getFullYear();
    return `${year}-${String(month).padStart(2, '0')}`;
  });

  useEffect(() => {
    fetchReportData();
  }, [selectedMonth]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [year, month] = selectedMonth.split('-').map(Number);

      const currentMonth = month - 1; // Convert to 0-based
      const prevMonthDate = new Date(year, currentMonth - 1, 1); // Previous month's 1st day
      const startYear = prevMonthDate.getFullYear();
      const startMonth = prevMonthDate.getMonth();
      const startDate = new Date(startYear, startMonth, 26);
      const endDate = new Date(year, currentMonth, 25);

      const formatDate = (date) => {
        const offset = date.getTimezoneOffset();
        const adjustedDate = new Date(date.getTime() - (offset * 60 * 1000));
        return adjustedDate.toISOString().split('T')[0];
      };

      const response = await axios.get(`${config.API_URL}/api/attendance/reports`, {
        params: {
          startDate: formatDate(startDate),
          endDate: formatDate(endDate)
        },
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        const processedData = {
          ...response.data.data,
          dateRange: response.data.data.dateRange.map(date => ({
            ...date,
            date: date.date,
            dayName: new Date(date.date).toLocaleDateString('en-US', { weekday: 'short' }),
          }))
        };
        setReportData(processedData);
      }
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportToCSV = () => {
    const roles = Object.keys(reportData.usersByRole);
    const headers = [
      'Name',
      'Role',
      'Team',
      'Department',
      'Total Present',
      'Total Absent',
      'Attendance %',
      'Avg Hours/Day',
      ...reportData.dateRange.map(date => date.date)
    ].join(',');

    const rows = roles.flatMap(role =>
      reportData.usersByRole[role].map(user => {
        const dailyAttendance = reportData.dateRange.map(date => {
          const attendance = user.attendance[date.date];
          return attendance ? attendance.status : 'Absent';
        });

        return [
          user.name,
          role,
          user.team,
          user.department,
          user.stats.totalPresent,
          user.stats.totalAbsent,
          user.stats.attendancePercentage,
          user.stats.avgHoursPerDay,
          ...dailyAttendance
        ].join(',');
      })
    );

    const csvContent = [headers, ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_report_${selectedMonth}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const AttendanceStatus = ({ data }) => {
    const getStatusColor = (status, isHoliday) => {
      if (isHoliday) return {
        bgcolor: '#F3E5F5',
        color: '#6A1B9A'
      };

      const statusColors = {
        Present: {
          bgcolor: '#E8F5E9',
          color: '#2E7D32'
        },
        Absent: {
          bgcolor: '#FFEBEE',
          color: '#C62828'
        },
        'Half-Day': {
          bgcolor: '#FFF3E0',
          color: '#EF6C00'
        },
        Pending: {
          bgcolor: '#F5F5F5',
          color: '#424242'
        }
      };

      return statusColors[status] || statusColors.Pending;
    };

    const colors = getStatusColor(data.status, data.isHoliday);

    return (
      <Box sx={{ ...colors, p: 1, borderRadius: 1, minWidth: 80 }}>
        <Typography variant="caption" display="block" align="center" fontWeight="medium">
          {data.status}
        </Typography>
        {data.hoursWorked > 0 && (
          <Typography variant="caption" display="block" align="center">
            {data.hoursWorked.toFixed(1)}h
          </Typography>
        )}
      </Box>
    );
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={0} sx={{ p: 3, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            Attendance Report
          </Typography>

          <Stack direction="row" spacing={2}>
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {
                  Array.from({ length: 12 }, (_, i) => {
                    const baseDate = new Date(); // Current date
                    baseDate.setDate(1); // Avoid day overflow issues
                    baseDate.setMonth(baseDate.getMonth() - i);
                    const periodEndDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + 1, 0); // Last day of the current month
                    const value = `${baseDate.getFullYear()}-${String(baseDate.getMonth() + 1).padStart(2, '0')}`;
                    return (
                      <MenuItem key={value} value={value}>
                        {periodEndDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      </MenuItem>
                    );
                  })}
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<DownloadIcon />}
              onClick={exportToCSV}
            >
              Export Report
            </Button>
          </Stack>
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Days
                </Typography>
                <Typography variant="h4" component="div">
                  {reportData.periodInfo.totalDays}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Working Days
                </Typography>
                <Typography variant="h4" component="div" sx={{ color: 'success.main' }}>
                  {reportData.periodInfo.workingDays}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Holidays
                </Typography>
                <Typography variant="h4" component="div" sx={{ color: '#9C27B0' }}>
                  {reportData.periodInfo.totalHolidays}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card elevation={0} sx={{ bgcolor: 'grey.50' }}>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Period
                </Typography>

                <Typography variant="body1" component="div">
                  {new Date(reportData.periodInfo.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })} -{' '}
                  {new Date(reportData.periodInfo.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Paper>

      {Object.entries(reportData.usersByRole).map(([role, users]) => (
        <Paper key={role} elevation={0} sx={{ p: 3, mb: 3 }}>
          <Typography variant="h6" sx={{ mb: 3, textTransform: 'capitalize' }}>
            {role}s
          </Typography>

          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Team</TableCell>
                  <TableCell>Department</TableCell>
                  <TableCell>Stats</TableCell>
                  {reportData.dateRange.map((date) => (
                    <TableCell key={date.date} align="center">
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: date.dayName === 'Sun' || date.dayName === 'Sat'
                              ? 'error.main'
                              : 'inherit'
                          }}
                        >
                          {date.dayName}
                        </Typography>
                        <Typography variant="caption">
                          {new Date(date.date).getDate()}
                        </Typography>
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user, idx) => (
                  <TableRow key={idx} hover>
                    <TableCell>
                      <Typography variant="body2">{user.name}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {user.team}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="textSecondary">
                        {user.department}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Typography variant="caption">
                          Present: {user.stats.totalPresent}
                        </Typography>
                        <Typography variant="caption">
                          Absent: {user.stats.totalAbsent}
                        </Typography>
                        <Typography variant="caption">
                          Attendance: {user.stats.attendancePercentage}%
                        </Typography>
                        <Typography variant="caption">
                          Avg Hours: {user.stats.avgHoursPerDay}h
                        </Typography>
                      </Stack>
                    </TableCell>
                    {reportData.dateRange.map((date) => (
                      <TableCell key={date.date} align="center">
                        <AttendanceStatus
                          data={{
                            status: user.attendance[date.date]?.status || 'Absent',
                            hoursWorked: user.attendance[date.date]?.hoursWorked || 0,
                            isHoliday: date.isHoliday
                          }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      ))}
    </Box>
  );
};

export default AdminAttendanceReport;