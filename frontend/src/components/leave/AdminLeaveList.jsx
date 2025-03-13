import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {   
  Box,   
  Typography,   
  Paper,   
  Table,   
  TableBody,   
  TableCell,   
  TableContainer,   
  TableHead,   
  TableRow,   
  Button,   
  IconButton,   
  Dialog,   
  DialogActions,   
  DialogContent,   
  DialogContentText,   
  DialogTitle,   
  TextField,   
  CircularProgress,   
  Alert,   
  Chip,   
  MenuItem,   
  Select,   
  FormControl,   
  InputLabel,   
  Grid,   
  TablePagination,
  Link,
  Divider
} from '@mui/material';
import { 
  CheckCircle as ApproveIcon, 
  Cancel as RejectIcon, 
  Visibility as ViewIcon, 
  FilterList as FilterIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import config from "../../config";

const AdminLeaveList = () => {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Pagination states
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filters
  const [filters, setFilters] = useState({
    status: 'All',
    fromDate: '',
    toDate: ''
  });
  
  // For approval/rejection dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState('');
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [comment, setComment] = useState('');
  
  // For leave details dialog
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [leaveDetails, setLeaveDetails] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  useEffect(() => {
    fetchLeaves();
  }, []);
  
  const fetchLeaves = async () => {
    try {
      setLoading(true);
      setError('');
      
      let url = `${config.API_URL}/api/leave/`;
      const params = new URLSearchParams();
      
      if (filters.status && filters.status !== 'All') {
        params.append('status', filters.status);
      }
      
      if (filters.fromDate) {
        params.append('from', filters.fromDate);
      }
      
      if (filters.toDate) {
        params.append('to', filters.toDate);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setLeaves(response.data.leaves || []);
        setPage(0); // Reset to first page when fetching new data
      }
    } catch (error) {
      console.error('Error fetching leaves:', error);
      setError('Failed to fetch leave applications');
    } finally {
      setLoading(false);
    }
  };
  
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };
  
  const applyFilters = () => {
    fetchLeaves();
  };
  
  const resetFilters = () => {
    setFilters({
      status: 'All',
      fromDate: '',
      toDate: ''
    });
    setTimeout(() => fetchLeaves(), 100);
  };
  
  const handleApproveClick = (leave) => {
    setSelectedLeave(leave);
    setDialogType('approve');
    setComment('');
    setDialogOpen(true);
  };
  
  const handleRejectClick = (leave) => {
    setSelectedLeave(leave);
    setDialogType('reject');
    setComment('');
    setDialogOpen(true);
  };

  const handleViewDetails = async (leaveId) => {
    try {
      setDetailsLoading(true);
      
      const response = await axios.get(`${config.API_URL}/api/leave/detail/${leaveId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setLeaveDetails(response.data);
        setDetailsDialogOpen(true);
      }
    } catch (error) {
      console.error('Error fetching leave details:', error);
      setError('Failed to fetch leave details');
    } finally {
      setDetailsLoading(false);
    }
  };
  
  const closeDetailsDialog = () => {
    setDetailsDialogOpen(false);
    setLeaveDetails(null);
  };
  
  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedLeave(null);
    setComment('');
  };
 
  const handleApproveReject = async () => {
    if (!selectedLeave) return;
    
    try {
      setLoading(true);
      
      const endpoint = dialogType === 'approve' 
        ? `${config.API_URL}/api/leave/${selectedLeave._id}/approve` 
        : `${config.API_URL}/api/leave/${selectedLeave._id}/reject`;
      
      const response = await axios.post(endpoint, { comment }, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setSuccess(`Leave application ${dialogType === 'approve' ? 'approved' : 'rejected'} successfully`);
        // Refresh leaves list
        fetchLeaves();
      }
    } catch (error) {
      console.error(`Error ${dialogType}ing leave:`, error);
      setError(`Failed to ${dialogType} leave application`);
    } finally {
      setLoading(false);
      closeDialog();
    }
  };
  
  const getStatusChipColor = (status) => {
    switch (status) {
      case 'Approved':
        return 'success';
      case 'Rejected':
        return 'error';
      case 'Pending':
      default:
        return 'warning';
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  // Pagination handlers
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };
  
  // Get current page data
  const displayedLeaves = rowsPerPage > 0
    ? leaves.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    : leaves;
  
  const clearMessage = () => {
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 5000);
  };
  
  useEffect(() => {
    if (success || error) {
      clearMessage();
    }
  }, [success, error]);
  
  return (
    <Paper elevation={3} sx={{ p: 3, marginTop: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Leave Applications
        </Typography>
        
        <Button 
          startIcon={<FilterIcon />} 
          onClick={() => setShowFilters(!showFilters)}
          color="primary"
          variant="outlined"
        >
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </Button>
      </Box>
      
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      
      {/* Filters */}
      {showFilters && (
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Typography variant="h6" gutterBottom>Filters</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel id="status-filter-label">Status</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  label="Status"
                >
                  <MenuItem value="All">All</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="From Date"
                type="date"
                name="fromDate"
                value={filters.fromDate}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="To Date"
                type="date"
                name="toDate"
                value={filters.toDate}
                onChange={handleFilterChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            
            <Grid item xs={12} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  onClick={applyFilters}
                >
                  Apply
                </Button>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  onClick={resetFilters}
                >
                  Reset
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      ) : leaves.length === 0 ? (
        <Alert severity="info">No leave applications found</Alert>
      ) : (
        <>
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Leave Type</TableCell>
                  <TableCell>From</TableCell>
                  <TableCell>To</TableCell>
                  <TableCell>Days</TableCell>
                  <TableCell>Paid</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Applied On</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {displayedLeaves.map((leave) => (
                  <TableRow key={leave._id}>
                    <TableCell>
                      {leave.userId?.name || 'N/A'}
                      <Typography variant="caption" display="block" color="textSecondary">
                        {leave.userId?.role || 'N/A'}
                      </Typography>
                    </TableCell>
                    <TableCell>{leave.leaveType}</TableCell>
                    <TableCell>{formatDate(leave.startDate)}</TableCell>
                    <TableCell>{formatDate(leave.endDate)}</TableCell>
                    <TableCell>{leave.totalDays}</TableCell>
                    <TableCell>
                      <Chip 
                        label={leave.isPaid ? 'Paid' : 'Unpaid'} 
                        color={leave.isPaid ? 'info' : 'default'} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={leave.status} 
                        color={getStatusChipColor(leave.status)} 
                        size="small" 
                      />
                    </TableCell>
                    <TableCell>{formatDate(leave.appliedAt)}</TableCell>
                    <TableCell>
                      <IconButton 
                        color="info" 
                        size="small" 
                        onClick={() => handleViewDetails(leave._id)}
                        title="View details"
                      >
                        <ViewIcon />
                      </IconButton>
                      
                      {leave.status === 'Pending' && (
                        <>
                          <IconButton 
                            color="success" 
                            size="small" 
                            onClick={() => handleApproveClick(leave)}
                            title="Approve"
                          >
                            <ApproveIcon />
                          </IconButton>
                          <IconButton 
                            color="error" 
                            size="small" 
                            onClick={() => handleRejectClick(leave)}
                            title="Reject"
                          >
                            <RejectIcon />
                          </IconButton>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          {/* Pagination */}
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={leaves.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </>
      )}
      
      {/* Approve/Reject Dialog */}
      <Dialog open={dialogOpen} onClose={closeDialog}>
        <DialogTitle>
          {dialogType === 'approve' ? 'Approve Leave' : 'Reject Leave'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogType === 'approve' 
              ? 'Are you sure you want to approve this leave application?' 
              : 'Are you sure you want to reject this leave application?'}
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label="Comment"
            fullWidth
            variant="outlined"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} color="primary">
            Cancel
          </Button>
          <Button 
            onClick={handleApproveReject} 
            color={dialogType === 'approve' ? 'success' : 'error'}
            variant="contained"
            disabled={loading}
          >
            {loading ? 'Processing...' : dialogType === 'approve' ? 'Approve' : 'Reject'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Leave Details Dialog */}
      <Dialog 
        open={detailsDialogOpen} 
        onClose={closeDetailsDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Leave Application Details</span>
          <IconButton onClick={closeDetailsDialog} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {detailsLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress />
            </Box>
          ) : leaveDetails ? (
            <Grid container spacing={3}>
              {/* Employee Information */}
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>Employee Information</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2">Name</Typography>
                      <Typography>{leaveDetails.leave.userId?.name || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2">Role</Typography>
                      <Typography>{leaveDetails.leave.userId?.role || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <Typography variant="subtitle2">Email</Typography>
                      <Typography>{leaveDetails.leave.userId?.email || 'N/A'}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Leave Details */}
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>Leave Information</Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Leave Type</Typography>
                      <Typography>{leaveDetails.leave.leaveType || 'N/A'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Status</Typography>
                      <Chip 
                        label={leaveDetails.leave.status} 
                        color={getStatusChipColor(leaveDetails.leave.status)} 
                        size="small" 
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Start Date</Typography>
                      <Typography>{formatDate(leaveDetails.leave.startDate)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">End Date</Typography>
                      <Typography>{formatDate(leaveDetails.leave.endDate)}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Total Days</Typography>
                      <Typography>{leaveDetails.leave.totalDays}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Is Paid</Typography>
                      <Chip 
                        label={leaveDetails.leave.isPaid ? 'Paid' : 'Unpaid'} 
                        color={leaveDetails.leave.isPaid ? 'info' : 'default'} 
                        size="small" 
                      />
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Use Leave Balance</Typography>
                      <Typography>{leaveDetails.leave.useLeaveBalance ? 'Yes' : 'No'}</Typography>
                    </Grid>
                    <Grid item xs={6}>
                      <Typography variant="subtitle2">Applied On</Typography>
                      <Typography>{formatDate(leaveDetails.leave.appliedAt)}</Typography>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>

              {/* Leave Balance Information */}
              <Grid item xs={12} md={6}>
                <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>Leave Balance</Typography>
                  {leaveDetails.userProfile ? (
                    <TableContainer>
                      <Table size="small">
                        <TableHead>
                          <TableRow>
                            <TableCell>Leave Type</TableCell>
                            <TableCell align="right">Available</TableCell>
                            <TableCell align="right">Used</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {leaveDetails.userProfile.leaveBalances.map((balance, index) => (
                            <TableRow key={index}>
                              <TableCell>{balance.leaveType}</TableCell>
                              <TableCell align="right">{balance.balance}</TableCell>
                              <TableCell align="right">{balance.used}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  ) : (
                    <Typography>No leave balance information available</Typography>
                  )}
                </Paper>
              </Grid>

              {/* Reason */}
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>Reason for Leave</Typography>
                  <Typography paragraph>{leaveDetails.leave.reason || 'No reason provided'}</Typography>
                </Paper>
              </Grid>

              {/* Documents */}
              <Grid item xs={12}>
                <Paper elevation={1} sx={{ p: 2, mb: 2 }}>
                  <Typography variant="h6" gutterBottom>Attached Documents</Typography>
                  {leaveDetails.leave.documents && leaveDetails.leave.documents.length > 0 ? (
                    <Grid container spacing={1}>
                      {leaveDetails.leave.documents.map((doc, index) => (
                        <Grid item key={index}>
                          <Chip 
                            label={`Document ${index + 1}`}
                            component={Link}
                            href={`${config.API_URL}/uploads/leave-documents/${doc}`}
                            target="_blank"
                            clickable
                            color="primary"
                            variant="outlined"
                          />
                        </Grid>
                      ))}
                    </Grid>
                  ) : (
                    <Typography>No documents attached</Typography>
                  )}
                </Paper>
              </Grid>

              {/* Approval Information */}
              {leaveDetails.leave.status !== 'Pending' && (
                <Grid item xs={12}>
                  <Paper elevation={1} sx={{ p: 2 }}>
                    <Typography variant="h6" gutterBottom>Approval Information</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={4}>
                        <Typography variant="subtitle2">Approved/Rejected By</Typography>
                        <Typography>
                          {leaveDetails.leave.approvedBy ? 
                            `${leaveDetails.leave.approvedBy.name} (${leaveDetails.leave.approvedBy.role})` : 
                            'N/A'}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} md={8}>
                        <Typography variant="subtitle2">Comment</Typography>
                        <Typography>{leaveDetails.leave.approvalComment || 'No comment provided'}</Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              )}
            </Grid>
          ) : (
            <Typography>No leave details available</Typography>
          )}
        </DialogContent>
        <DialogActions>
          {leaveDetails && leaveDetails.leave.status === 'Pending' && (
            <>
              <Button 
                onClick={() => {
                  closeDetailsDialog();
                  handleApproveClick(leaveDetails.leave);
                }} 
                color="success" 
                variant="contained"
                startIcon={<ApproveIcon />}
              >
                Approve
              </Button>
              <Button 
                onClick={() => {
                  closeDetailsDialog();
                  handleRejectClick(leaveDetails.leave);
                }} 
                color="error" 
                variant="contained"
                startIcon={<RejectIcon />}
              >
                Reject
              </Button>
            </>
          )}
          <Button onClick={closeDetailsDialog} color="primary" variant="outlined">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AdminLeaveList;