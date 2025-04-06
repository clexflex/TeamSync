import React, { useState, useEffect } from 'react';
import axios from 'axios';
import config from '../../config';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  CircularProgress,
  Alert,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid
} from '@mui/material';
import { Add, Delete, Search, Refresh, FilterAlt } from '@mui/icons-material';
import { format } from 'date-fns';

const AdminAttendanceManagement = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [filterOpen, setFilterOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedAttendanceId, setSelectedAttendanceId] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    userId: '',
    dateFrom: '',
    dateTo: '',
    status: '',
    role: ''
  });

  // Status options for filter dropdown
  const statusOptions = [
    "Present", "Absent", "Paid Leave", "Unpaid Leave", 
    "Paid Half Leave", "Unpaid Half Leave", "Extra Work", 
    "Incomplete Attendance", "Weekly Off"
  ];

  // Role options for filter dropdown
  const roleOptions = ["employee", "manager"];

  useEffect(() => {
    fetchAttendanceRecords();
  }, [page, rowsPerPage]);

  const fetchAttendanceRecords = async () => {
    try {
      setLoading(true);
      
      // Build query string from filters
      const queryParams = new URLSearchParams();
      queryParams.append('page', page + 1); // API uses 1-based indexing
      queryParams.append('limit', rowsPerPage);
      
      // Add filters if they have values
      Object.entries(filters).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });
      
      const response = await axios.get(
        `${config.API_URL}/api/attendance/records?${queryParams.toString()}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      setAttendanceRecords(response.data.attendanceRecords);
      setTotalRecords(response.data.pagination.total);
    } catch (error) {
      console.error('Error fetching attendance records:', error);
      showNotification('Failed to load attendance records', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    setPage(0); // Reset to first page when applying filters
    fetchAttendanceRecords();
    setFilterOpen(false);
  };

  const resetFilters = () => {
    setFilters({
      userId: '',
      dateFrom: '',
      dateTo: '',
      status: '',
      role: ''
    });
    setPage(0);
    fetchAttendanceRecords();
    setFilterOpen(false);
  };

  const handleAddNewAttendance = () => {
    navigate('/admin-dashboard/attendance/add');
  };

  const handleDeleteClick = (attendanceId) => {
    setSelectedAttendanceId(attendanceId);
    setConfirmDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      setLoading(true);
      await axios.delete(
        `${config.API_URL}/api/attendance/delete-record/${selectedAttendanceId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      
      showNotification('Attendance record deleted successfully', 'success');
      fetchAttendanceRecords();
    } catch (error) {
      console.error('Error deleting attendance record:', error);
      showNotification('Failed to delete attendance record', 'error');
    } finally {
      setLoading(false);
      setConfirmDeleteOpen(false);
      setSelectedAttendanceId(null);
    }
  };

  const showNotification = (msg, type = 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 5000);
  };

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy');
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const formatTime = (dateString) => {
    try {
      return format(new Date(dateString), 'hh:mm aa');
    } catch (error) {
      return 'N/A';
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" component="h1">
            Attendance Management
          </Typography>
          <Box>
            <Button 
              variant="contained" 
              startIcon={<Add />} 
              onClick={handleAddNewAttendance} 
              sx={{ mr: 1 }}
            >
              Add Attendance
            </Button>
            <Button 
              variant="outlined" 
              startIcon={<FilterAlt />} 
              onClick={() => setFilterOpen(!filterOpen)}
            >
              Filters
            </Button>
          </Box>
        </Box>

        {message && (
          <Alert severity={messageType} sx={{ mb: 2 }}>
            {message}
          </Alert>
        )}

        {filterOpen && (
          <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Filter Attendance Records
            </Typography>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="User ID"
                  name="userId"
                  value={filters.userId}
                  onChange={handleFilterChange}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="From Date"
                  name="dateFrom"
                  type="date"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <TextField
                  fullWidth
                  label="To Date"
                  name="dateTo"
                  type="date"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                  InputLabelProps={{ shrink: true }}
                  variant="outlined"
                  size="small"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Status</InputLabel>
                  <Select
                    name="status"
                    value={filters.status}
                    onChange={handleFilterChange}
                    label="Status"
                  >
                    <MenuItem value="">All</MenuItem>
                    {statusOptions.map(option => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <FormControl fullWidth size="small">
                  <InputLabel>Role</InputLabel>
                  <Select
                    name="role"
                    value={filters.role}
                    onChange={handleFilterChange}
                    label="Role"
                  >
                    <MenuItem value="">All</MenuItem>
                    {roleOptions.map(option => (
                      <MenuItem key={option} value={option}>{option}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="contained"
                  startIcon={<Search />}
                  onClick={applyFilters}
                  fullWidth
                >
                  Apply
                </Button>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Button
                  variant="outlined"
                  startIcon={<Refresh />}
                  onClick={resetFilters}
                  fullWidth
                >
                  Reset
                </Button>
              </Grid>
            </Grid>
          </Paper>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} variant="outlined">
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow sx={{ backgroundColor: 'grey.100' }}>
                    <TableCell>User</TableCell>
                    <TableCell>Date</TableCell>
                    <TableCell>Clock In</TableCell>
                    <TableCell>Clock Out</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Credits</TableCell>
                    <TableCell>Role</TableCell>
                    <TableCell align="center">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {attendanceRecords.length > 0 ? (
                    attendanceRecords.map((record) => (
                      <TableRow key={record._id}>
                        <TableCell>
                          {record.userId ? `${record.userId.name} (${record.userId._id})` : 'Unknown User'}
                        </TableCell>
                        <TableCell>{formatDate(record.date)}</TableCell>
                        <TableCell>{formatTime(record.clockIn)}</TableCell>
                        <TableCell>{record.clockOut ? formatTime(record.clockOut) : 'N/A'}</TableCell>
                        <TableCell>{record.status}</TableCell>
                        <TableCell>{record.credits}</TableCell>
                        <TableCell>{record.role}</TableCell>
                        <TableCell align="center">
                          <IconButton 
                            color="error" 
                            onClick={() => handleDeleteClick(record._id)}
                            size="small"
                          >
                            <Delete />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        No attendance records found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            
            <TablePagination
              rowsPerPageOptions={[5, 10, 25, 50]}
              component="div"
              count={totalRecords}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this attendance record? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminAttendanceManagement;