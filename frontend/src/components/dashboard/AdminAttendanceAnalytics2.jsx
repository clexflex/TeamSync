import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Select,
  MenuItem,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Card,
  CardContent,
  Stack,
  FormControl,
  InputLabel,
  TextField,
  Tooltip,
  IconButton,
  Chip,
  InputAdornment,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  GetApp as DownloadIcon,
  Search as SearchIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Group as TeamIcon,
  CheckCircle,
  Star,
  Close as ClearIcon,
  Info as InfoIcon,
  Print as PrintIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';

const AdminAttendanceAnalytics2 = () => {
  // State for data
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

  // State for UI
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  // State for detailed report
  const [detailedReportOpen, setDetailedReportOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [detailedReportLoading, setDetailedReportLoading] = useState(false);
  const [attendanceThreshold, setAttanceThreshold] = useState(80);

  // Month selection
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    const month = today.getDate() > 25 ? today.getMonth() + 1 : today.getMonth();
    const year = today.getFullYear();
    return `${year}-${String(month).padStart(2, '0')}`;
  });

  // Derived state
  const departments = React.useMemo(() => {
    const depts = new Set();
    Object.values(reportData.usersByRole).forEach(users => {
      users.forEach(user => {
        if (user.department) depts.add(user.department);
      });
    });
    return Array.from(depts);
  }, [reportData.usersByRole]);

  const teams = React.useMemo(() => {
    const teamsSet = new Set();
    Object.values(reportData.usersByRole).forEach(users => {
      users.forEach(user => {
        if (user.team) teamsSet.add(user.team);
      });
    });
    return Array.from(teamsSet);
  }, [reportData.usersByRole]);

  // Filtered users based on search and filters
  const filteredUsers = React.useMemo(() => {
    let result = {};

    Object.entries(reportData.usersByRole).forEach(([role, users]) => {
      const filtered = users.filter(user => {
        // Search filter
        const nameMatch = user.name?.toLowerCase().includes(searchQuery.toLowerCase());

        // Department filter
        const departmentMatch = departmentFilter === 'all' || user.department === departmentFilter;

        // Team filter
        const teamMatch = teamFilter === 'all' || user.team === teamFilter;

        // Status filter
        let statusMatch = true;
        if (statusFilter === 'low') {
          statusMatch = parseFloat(user.stats.attendancePercentage) < attendanceThreshold;
        } else if (statusFilter === 'perfect') {
          statusMatch = parseFloat(user.stats.attendancePercentage) === 100;
        } else if (statusFilter === 'high') {
          statusMatch = parseFloat(user.stats.attendancePercentage) > 90 && parseFloat(user.stats.attendancePercentage) < 100;
        }

        return nameMatch && departmentMatch && teamMatch && statusMatch;
      });

      if (filtered.length > 0) {
        result[role] = filtered;
      }
    });

    return result;
  }, [reportData.usersByRole, searchQuery, departmentFilter, teamFilter, statusFilter]);

  // Attendance statistics
  const attendanceStats = React.useMemo(() => {
    let totalUsers = 0;
    let totalAttendance = 0;
    let lowAttendanceCount = 0;
    let highAttendanceCount = 0;
    let perfectAttendanceCount = 0;

    Object.values(reportData.usersByRole).forEach(users => {
      users.forEach(user => {
        totalUsers++;
        const attendancePercentage = parseFloat(user.stats.attendancePercentage);
        totalAttendance += attendancePercentage;

        if (attendancePercentage < attendanceThreshold) {
          lowAttendanceCount++;
        } else if (attendancePercentage === 100) {
          perfectAttendanceCount++;
        } else if (attendancePercentage > 90) {
          highAttendanceCount++;
        }
      });
    });

    return {
      averageAttendance: totalUsers ? (totalAttendance / totalUsers).toFixed(2) : 0,
      lowAttendanceCount,
      highAttendanceCount,
      perfectAttendanceCount,
      totalUsers
    };
  }, [reportData.usersByRole]);

  // Fetch report data
  useEffect(() => {
    fetchReportData();
  }, [selectedMonth]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const [year, month] = selectedMonth.split('-').map(Number);

      // Calculate date range (26th of previous month to 25th of selected month)
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
      setError('Failed to load attendance report data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Generate detailed report for a specific user
  const generateDetailedReport = async (user) => {
    setSelectedUser(user);
    setDetailedReportLoading(true);
    setDetailedReportOpen(true);

    try {
      // If you need to fetch additional data, you would do it here
      // For now, we'll just use the data we already have

      setTimeout(() => {
        setDetailedReportLoading(false);
      }, 500);
    } catch (error) {
      console.error('Error generating detailed report:', error);
      setDetailedReportLoading(false);
    }
  };

  // Download detailed report
  const downloadDetailedReport = () => {
    if (!selectedUser) return;

    const printWindow = window.open('', '_blank');

    if (!printWindow) {
      alert('Please allow popups to download the report');
      return;
    }

    // Format date for the report header
    const now = new Date();
    const formattedDate = `${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

    // Calculate attendance metrics
    const totalWorkingDays = reportData.periodInfo.workingDays;
    const presentDays = selectedUser.stats.totalPresent || 0;
    const absentDays = selectedUser.stats.totalAbsent || 0;
    const leaveDays = (selectedUser.stats.totalPaidLeave || 0) + (selectedUser.stats.totalUnpaidLeave || 0);

    // Set up page title and styles
    printWindow.document.write(`
      <html>
        <head>
          <title>Attendance Report - ${selectedUser.name}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            h1 { color: #1976d2; margin-bottom: 10px; }
            h2 { color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px; }
            .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .company-info { text-align: right; }
            .employee-details { margin-bottom: 20px; }
            .employee-details table { width: 100%; border-collapse: collapse; }
            .employee-details td { padding: 5px; }
            .summary-box { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
            .summary-stats { display: flex; justify-content: space-between; flex-wrap: wrap; }
            .stat-box { width: 23%; text-align: center; background: white; padding: 10px; border-radius: 5px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
            .stat-value { font-size: 24px; font-weight: bold; margin: 5px 0; }
            .stat-label { color: #666; }
            .attendance-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            .attendance-table th, .attendance-table td { border: 1px solid #ddd; padding: 8px; text-align: center; }
            .attendance-table th { background-color: #f5f5f5; }
            .present { color: #2e7d32; }
            .absent { color: #c62828; }
            .half-day { color: #ef6c00; }
            .leave { color: #0288d1; }
            .weekend { color: #7b1fa2; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>Employee Attendance Report</h1>
              <div>Period: ${reportData.periodInfo.startDate} to ${reportData.periodInfo.endDate}</div>
            </div>
            <div class="company-info">
              <h3>TeamSync</h3>
              <div>Report Generated: ${formattedDate}</div>
            </div>
          </div>

          <div class="employee-details">
            <h2>Employee Information</h2>
            <table>
              <tr>
                <td><strong>Name:</strong></td>
                <td>${selectedUser.name}</td>
                <td><strong>Role:</strong></td>
                <td>${selectedUser.role}</td>
              </tr>
              <tr>
                <td><strong>Department:</strong></td>
                <td>${selectedUser.department || 'N/A'}</td>
                <td><strong>Team:</strong></td>
                <td>${selectedUser.team || 'N/A'}</td>
              </tr>
            </table>
          </div>

          <div class="summary-box">
            <h2>Attendance Summary</h2>
            <div class="summary-stats">
              <div class="stat-box">
                <div class="stat-value">${selectedUser.stats.attendancePercentage}%</div>
                <div class="stat-label">Attendance Rate</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${presentDays}</div>
                <div class="stat-label">Present Days</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${absentDays}</div>
                <div class="stat-label">Absent Days</div>
              </div>
              <div class="stat-box">
                <div class="stat-value">${leaveDays}</div>
                <div class="stat-label">Leave Days</div>
              </div>
            </div>
          </div>

          <h2>Detailed Attendance Log</h2>
          <table class="attendance-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Day</th>
                <th>Status</th>
                <th>Hours Worked</th>
                <th>Credits</th>
              </tr>
            </thead>
            <tbody>
    `);

    // Add daily attendance records
    reportData.dateRange.forEach(date => {
      const attendance = selectedUser.attendance[date.date];
      const isWeekend = date.isWeekend;
      const isHoliday = date.isHoliday;

      let status = 'Absent';
      let statusClass = 'absent';
      let hoursWorked = 0;
      let credits = 0;

      if (attendance) {
        status = attendance.status;
        hoursWorked = attendance.hoursWorked || 0;
        credits = attendance.credits || 0;

        if (status === 'Present') {
          statusClass = 'present';
        } else if (status.includes('Half')) {
          statusClass = 'half-day';
        } else if (status.includes('Leave')) {
          statusClass = 'leave';
        }
      }

      if (isWeekend || isHoliday) {
        status = isHoliday ? 'Holiday' : 'Weekend';
        statusClass = 'weekend';
      }

      const dateObj = new Date(date.date);
      const formattedRowDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;

      printWindow.document.write(`
        <tr>
          <td>${formattedRowDate}</td>
          <td>${date.dayName}</td>
          <td class="${statusClass}">${status}</td>
          <td>${hoursWorked.toFixed(1)}</td>
          <td>${credits}</td>
        </tr>
      `);
    });

    // Close table and document
    printWindow.document.write(`
            </tbody>
          </table>

          <div class="footer">
            <p>This is an auto-generated report. For any discrepancies, please contact HR.</p>
          </div>
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  // Component for attendance percentage visualization
  const AttendancePercentage = ({ percentage }) => {
    let color = '#4CAF50'; // Green for good attendance
if (percentage < attendanceThreshold) {
  color = '#F44336'; // Red for poor attendance
} else if (percentage < 90) {
  color = '#FF9800'; // Orange for moderate attendance
}

    return (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{
          width: 100,
          height: 10,
          bgcolor: '#e0e0e0',
          borderRadius: 5,
          overflow: 'hidden'
        }}>
          <Box sx={{
            width: `${percentage}%`,
            height: '100%',
            bgcolor: color,
            borderRadius: 5
          }} />
        </Box>
        <Typography variant="body2" fontWeight="medium" sx={{ color }}>
          {percentage}%
        </Typography>
      </Box>
    );
  };

  // Render summary cards
  const renderSummaryCards = () => (
    <Grid container spacing={3} mb={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card elevation={1}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} mb={1}>
              <Box sx={{
                p: 1.5,
                borderRadius: '50%',
                bgcolor: 'primary.light',
                display: 'flex'
              }}>
                <CalendarIcon color="primary" />
              </Box>
              <Typography color="textSecondary" variant="h6">
                Period Overview
              </Typography>
            </Stack>
            <Stack spacing={1}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="textSecondary">Total Days:</Typography>
                <Typography variant="body2" fontWeight="medium">{reportData.periodInfo.totalDays}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="textSecondary">Working Days:</Typography>
                <Typography variant="body2" fontWeight="medium" color="success.main">
                  {reportData.periodInfo.workingDays}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2" color="textSecondary">Holidays:</Typography>
                <Typography variant="body2" fontWeight="medium" color="secondary.main">
                  {reportData.periodInfo.totalHolidays}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card elevation={1}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} mb={1}>
              <Box sx={{
                p: 1.5,
                borderRadius: '50%',
                bgcolor: 'success.light',
                display: 'flex'
              }}>
                <CheckCircle color="success" />
              </Box>
              <Typography color="textSecondary" variant="h6">
                Attendance Rate
              </Typography>
            </Stack>
            <Typography variant="h3" fontWeight="medium" sx={{ mb: 1 }}>
              {attendanceStats.averageAttendance}%
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Average attendance rate
              </Typography>
              <Chip
                size="small"
                label={attendanceStats.totalUsers + " users"}
                color="primary"
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card elevation={1}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} mb={1}>
              <Box sx={{
                p: 1.5,
                borderRadius: '50%',
                bgcolor: '#FFF3E0',
                display: 'flex'
              }}>
                <InfoIcon sx={{ color: '#FF9800' }} />
              </Box>
              <Typography color="textSecondary" variant="h6">
                Attendance Issues
              </Typography>
            </Stack>
            <Typography variant="h3" fontWeight="medium" sx={{ mb: 1 }}>
              {attendanceStats.lowAttendanceCount}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="body2" color="textSecondary">
  Users below {attendanceThreshold}% attendance
</Typography>
              <Chip
                size="small"
                label={`${((attendanceStats.lowAttendanceCount / attendanceStats.totalUsers) * 100).toFixed(1)}%`}
                color="error"
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card elevation={1}>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2} mb={1}>
              <Box sx={{
                p: 1.5,
                borderRadius: '50%',
                bgcolor: '#E8F5E9',
                display: 'flex'
              }}>
                <Star sx={{ color: '#4CAF50' }} />
              </Box>
              <Typography color="textSecondary" variant="h6">
                Perfect Attendance
              </Typography>
            </Stack>
            <Typography variant="h3" fontWeight="medium" sx={{ mb: 1 }}>
              {attendanceStats.perfectAttendanceCount}
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" color="textSecondary">
                Users with 100% attendance
              </Typography>
              <Chip
                size="small"
                label={`${((attendanceStats.perfectAttendanceCount / attendanceStats.totalUsers) * 100).toFixed(1)}%`}
                color="success"
                variant="outlined"
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  // Render filters
  const renderFilters = () => (
    <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems="center" mb={2}>
        <Typography variant="subtitle1" fontWeight="medium" sx={{ minWidth: 100 }}>
          Period:
        </Typography>
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
      </Stack>

      <Divider sx={{ my: 2 }} />

      <Typography variant="subtitle1" fontWeight="medium" mb={2}>
        Filters:
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            size="small"
            placeholder="Search by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchQuery('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              )
            }}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Department</InputLabel>
            <Select
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              label="Department"
            >
              <MenuItem value="all">All Departments</MenuItem>
              {departments.map(dept => (
                <MenuItem key={dept} value={dept}>{dept}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Team</InputLabel>
            <Select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              label="Team"
            >
              <MenuItem value="all">All Teams</MenuItem>
              {teams.map(team => (
                <MenuItem key={team} value={team}>{team}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <FormControl fullWidth size="small">
            <InputLabel>Attendance Status</InputLabel>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              label="Attendance Status"
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="low">Below 80%</MenuItem>
              <MenuItem value="high">High (90%+)</MenuItem>
              <MenuItem value="perfect">Perfect (100%)</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <TextField
            fullWidth
            label="Attendance Threshold %"
            type="number"
            size="small"
            value={attendanceThreshold}
            onChange={(e) => setAttanceThreshold(Math.max(0, Math.min(100, parseInt(e.target.value) || 0)))}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />
        </Grid>
      </Grid>

    </Paper>
  );

  // Render the main attendance table
  const renderAttendanceTable = () => {
    return Object.entries(filteredUsers).map(([role, users]) => (
      <Paper key={role} elevation={1} sx={{ p: 0, mb: 3, overflow: 'hidden' }}>
        <Box sx={{
          p: 2,
          bgcolor: 'grey.50',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center'
        }}>
          <Typography variant="h6" sx={{ textTransform: 'capitalize' }}>
            {role}s
          </Typography>
          <Chip
            size="small"
            label={`${users.length} users`}
            sx={{ ml: 2 }}
            color="primary"
            variant="outlined"
          />
        </Box>

        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader size="small">
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Team</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Attendance Rate</TableCell>
                <TableCell align="center">Present</TableCell>
                <TableCell align="center">Absent</TableCell>
                <TableCell align="center">Leaves</TableCell>
                <TableCell align="center">Avg. Hours</TableCell>
                <TableCell align="center">Credits</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user, idx) => {
                const attendancePercent = parseFloat(user.stats.attendancePercentage);
                let statusColor = 'success';
                let statusText = 'Good';

                if (attendancePercent < 50) {
                  statusColor = 'error';
                  statusText = 'Poor';
                } else if (attendancePercent < 90) {
                  statusColor = 'warning';
                  statusText = 'Average';
                } else if (attendancePercent === 100) {
                  statusText = 'Perfect';
                }

                const paidLeaves = user.stats.totalPaidLeave || 0;
                const unpaidLeaves = user.stats.totalUnpaidLeave || 0;
                const totalLeaves = paidLeaves + unpaidLeaves;
                const totalCredits = user.stats.totalCredits || 0;

                return (
                  <TableRow
                    key={idx}
                    hover
                    sx={{
                      bgcolor: attendancePercent < attendanceThreshold ? 'rgba(244, 67, 54, 0.05)' : 'inherit'
                    }}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        <PersonIcon fontSize="small" color="action" />
                        <Typography variant="body2">{user.name}</Typography>
                      </Stack>
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
                      <AttendancePercentage percentage={attendancePercent} />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={user.stats.totalPresent}
                        color="success"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        size="small"
                        label={user.stats.totalAbsent}
                        color="error"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title={`Paid: ${paidLeaves}, Unpaid: ${unpaidLeaves}`}>
                        <Chip
                          size="small"
                          label={totalLeaves}
                          color="primary"
                          variant="outlined"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" fontWeight="medium">
                        {user.stats.avgHoursPerDay}h
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Total accumulated credits">
                        <Chip
                          size="small"
                          label={totalCredits.toFixed(1)}
                          color="secondary"
                          variant="outlined"
                        />
                      </Tooltip>
                    </TableCell>
                    <TableCell align="center">
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => generateDetailedReport(user)}
                      >
                        Detailed Report
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    ));
  };

  // Render detailed report dialog
  const renderDetailedReportDialog = () => (
    <Dialog
      open={detailedReportOpen}
      onClose={() => setDetailedReportOpen(false)}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Detailed Attendance Report</Typography>
          <IconButton onClick={() => setDetailedReportOpen(false)} size="small">
            <ClearIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {detailedReportLoading ? (
          <Box display="flex" justifyContent="center" alignItems="center" py={4}>
            <CircularProgress />
          </Box>
        ) : selectedUser ? (
          <Box>
            <Grid container spacing={3} mb={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Employee Information
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">Name:</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedUser.name}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">Role:</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedUser.role}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">Department:</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedUser.department}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">Team:</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedUser.team}</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper elevation={0} variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                    Attendance Summary
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">Attendance Rate:</Typography>
                      <Typography variant="body2" fontWeight="medium" color={
                        parseFloat(selectedUser.stats.attendancePercentage) < 80 ? 'error.main' :
                          parseFloat(selectedUser.stats.attendancePercentage) < 90 ? 'warning.main' : 'success.main'
                      }>
                        {selectedUser.stats.attendancePercentage}%
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">Present Days:</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedUser.stats.totalPresent}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">Absent Days:</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedUser.stats.totalAbsent}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">Average Hours:</Typography>
                      <Typography variant="body2" fontWeight="medium">{selectedUser.stats.avgHoursPerDay}h</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="textSecondary">Total Credits:</Typography>
                      <Typography variant="body2" fontWeight="medium">{(selectedUser.stats.totalCredits || 0).toFixed(1)}</Typography>
                    </Box>
                  </Stack>
                </Paper>
              </Grid>
            </Grid>

            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Daily Attendance Details
            </Typography>

            <TableContainer sx={{ maxHeight: 350 }}>
              <Table size="small" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Date</TableCell>
                    <TableCell>Day</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell align="center">Clock In</TableCell>
                    <TableCell align="center">Clock Out</TableCell>
                    <TableCell align="right">Hours</TableCell>
                    <TableCell align="right">Credits</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {reportData.dateRange.map((date, index) => {
                    const attendance = selectedUser.attendance[date.date];
                    const isWeekend = date.isWeekend;
                    const isHoliday = date.isHoliday;

                    let status = 'Absent';
                    let statusColor = 'error.main';
                    let hoursWorked = 0;
                    let credits = 0;
                    let clockIn = '-';
                    let clockOut = '-';

                    if (attendance) {
                      status = attendance.status;
                      hoursWorked = attendance.hoursWorked || 0;
                      credits = attendance.credits || 0;

                      if (attendance.clockIn) {
                        const clockInDate = new Date(attendance.clockIn);
                        clockIn = clockInDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      }

                      if (attendance.clockOut) {
                        const clockOutDate = new Date(attendance.clockOut);
                        clockOut = clockOutDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      }

                      if (status === 'Present') {
                        statusColor = 'success.main';
                      } else if (status.includes('Half')) {
                        statusColor = 'warning.main';
                      } else if (status.includes('Leave')) {
                        statusColor = 'info.main';
                      }
                    }

                    if (isWeekend || isHoliday) {
                      status = isHoliday ? 'Holiday' : 'Weekend';
                      statusColor = 'secondary.main';
                    }

                    const dateObj = new Date(date.date);
                    const formattedDate = `${dateObj.getDate()}/${dateObj.getMonth() + 1}/${dateObj.getFullYear()}`;

                    return (
                      <TableRow key={index} hover>
                        <TableCell>{formattedDate}</TableCell>
                        <TableCell>{date.dayName}</TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            color={statusColor}
                            fontWeight="medium"
                          >
                            {status}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">{clockIn}</TableCell>
                        <TableCell align="center">{clockOut}</TableCell>
                        <TableCell align="right">{hoursWorked.toFixed(1)}</TableCell>
                        <TableCell align="right">{credits.toFixed(1)}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Box>
        ) : (
          <Typography>No user selected</Typography>
        )}
      </DialogContent>

      <DialogActions>
        <Button
          onClick={() => setDetailedReportOpen(false)}
          color="inherit"
        >
          Close
        </Button>
        <Button
          onClick={downloadDetailedReport}
          variant="contained"
          color="primary"
          startIcon={<PrintIcon />}
          disabled={!selectedUser || detailedReportLoading}
        >
          Print Report
        </Button>
        <Button
          onClick={downloadDetailedReport}
          variant="outlined"
          color="primary"
          startIcon={<FileDownloadIcon />}
          disabled={!selectedUser || detailedReportLoading}
        >
          Download PDF
        </Button>
      </DialogActions>
    </Dialog>
  );

  // Main render
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 3 }}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Attendance Analytics Dashboard
      </Typography>

      {renderSummaryCards()}
      {renderFilters()}

      {Object.keys(filteredUsers).length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No users match the current filter criteria. Try adjusting your filters.
        </Alert>
      ) : (
        renderAttendanceTable()
      )}

      {renderDetailedReportDialog()}
    </Box>
  );
};

export default AdminAttendanceAnalytics2;