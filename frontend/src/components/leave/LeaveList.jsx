import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/authContext';
import config from '../../config';
import { Box, Typography, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TablePagination, Chip, Button, CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem, TextField, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, } from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const LeaveList = () => {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [statusFilter, setStatusFilter] = useState('All');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const navigate = useNavigate();
  const getBasePath = (user) => {
    return user.role === "employee" ? "/employee-dashboard" : "/manager-dashboard";
  };

  const basePath = getBasePath(user);

  useEffect(() => {
    const fetchLeaves = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${config.API_URL}/api/leave/${user._id}/${user.role}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            status: statusFilter !== 'All' ? statusFilter : undefined,
            from: startDate || undefined,
            to: endDate || undefined,
          },
        });

        if (response.data.success) {
          setLeaves(response.data.leaves);
        } else {
          setError('Failed to fetch leave data');
        }
      } catch (err) {
        setError(err.response?.data?.error || 'An error occurred while fetching leaves');
        console.error('Error fetching leaves:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchLeaves();
    }
  }, [user, statusFilter, startDate, endDate]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleFilterChange = (event) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  const handleStartDateChange = (event) => {
    setStartDate(event.target.value);
    setPage(0);
  };

  const handleEndDateChange = (event) => {
    setEndDate(event.target.value);
    setPage(0);
  };

  const handleCancelLeave = (leave) => {
    setSelectedLeave(leave);
    setDialogOpen(true);
  };

  const confirmCancelLeave = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${config.API_URL}/api/leave/${selectedLeave._id}/cancel`,
        { comment: cancelReason },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Update the leave status in the local state
        setLeaves(leaves.map(leave =>
          leave._id === selectedLeave._id
            ? { ...leave, status: 'Rejected', approvalComment: cancelReason || 'Leave request cancelled' }
            : leave
        ));
      } else {
        setError('Failed to cancel leave');
      }
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred while cancelling leave');
      console.error('Error cancelling leave:', err);
    } finally {
      setLoading(false);
      setDialogOpen(false);
      setCancelReason('');
      setSelectedLeave(null);
    }
  };

  const getStatusChipProps = (status) => {
    switch (status) {
      case 'Approved':
        return { label: 'Approved', color: 'success' };
      case 'Rejected':
        return { label: 'Rejected', color: 'error' };
      case 'Pending':
      default:
        return { label: 'Pending', color: 'warning' };
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>

        <Typography variant="h5" gutterBottom component="div">
          Leave Applications
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate(`${basePath}/add-leave`)}
          sx={{ px: 3 }}
        >Apply Leave
        </Button>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ mb: 3, display: 'flex', flexWrap: 'wrap', gap: 2 }}>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel id="status-filter-label">Status</InputLabel>
          <Select
            labelId="status-filter-label"
            value={statusFilter}
            label="Status"
            onChange={handleFilterChange}
          >
            <MenuItem value="All">All</MenuItem>
            <MenuItem value="Pending">Pending</MenuItem>
            <MenuItem value="Approved">Approved</MenuItem>
            <MenuItem value="Rejected">Rejected</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="From Date"
          type="date"
          value={startDate}
          onChange={handleStartDateChange}
          InputLabelProps={{ shrink: true }}
        />

        <TextField
          label="To Date"
          type="date"
          value={endDate}
          onChange={handleEndDateChange}
          InputLabelProps={{ shrink: true }}
        />
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : leaves.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">No leave applications found.</Typography>
        </Paper>
      ) : (
        <Paper sx={{ width: '100%', overflow: 'hidden' }}>
          <TableContainer sx={{ maxHeight: 440 }}>
            <Table stickyHeader aria-label="leave applications table">
              <TableHead>
                <TableRow>
                  <TableCell>Leave Type</TableCell>
                  <TableCell>Start Date</TableCell>
                  <TableCell>End Date</TableCell>
                  <TableCell>Total Days</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Applied On</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {leaves
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((leave) => {
                    const { label, color } = getStatusChipProps(leave.status);
                    return (
                      <TableRow hover key={leave._id}>
                        <TableCell>{leave.leaveType}</TableCell>
                        <TableCell>
                          {format(new Date(leave.startDate), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          {format(new Date(leave.endDate), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>{leave.totalDays}</TableCell>
                        <TableCell sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {leave.reason}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={label}
                            color={color}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {format(new Date(leave.appliedAt), 'dd MMM yyyy')}
                        </TableCell>
                        <TableCell>
                          {leave.status === 'Pending' && (
                            <Button
                              variant="outlined"
                              color="error"
                              size="small"
                              onClick={() => handleCancelLeave(leave)}
                            >
                              Cancel
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={leaves.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}

      {/* Cancel Leave Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Cancel Leave Application</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to cancel this leave application? This action cannot be undone.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="cancelReason"
            label="Reason for Cancellation (Optional)"
            type="text"
            fullWidth
            variant="outlined"
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>No, Keep It</Button>
          <Button onClick={confirmCancelLeave} color="error">
            Yes, Cancel Leave
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LeaveList;