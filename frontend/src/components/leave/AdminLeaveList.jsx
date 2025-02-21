import React, { useEffect, useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Button,
  Chip,
  Stack,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Avatar,
  Divider,
  Grid
} from '@mui/material';
import { Search as SearchIcon, Visibility as VisibilityIcon, Check as CheckIcon, Close as CloseIcon } from '@mui/icons-material';
import axios from 'axios';
import config from "../../config";

const LeaveDetailItem = ({ label, value }) => (
  <Box>
    <Typography variant="subtitle1" fontWeight="bold" component="span">
      {label}:
    </Typography>
    <Typography component="span" sx={{ ml: 1 }}>
      {value}
    </Typography>
  </Box>
);

const AdminLeaveList = () => {
  const [leaves, setLeaves] = useState([]);
  const [filteredLeaves, setFilteredLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLeave, setSelectedLeave] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  let sno = 1;

  const fetchLeaves = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${config.API_URL}/api/leave`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.data.success) {
        const leavesWithUserData = response.data.leaves.filter(leave => leave.userId);
        setLeaves(leavesWithUserData);
        setFilteredLeaves(leavesWithUserData);
      }
    } catch (error) {
      setError(error.response?.data?.error || error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaveDetail = async (leaveId) => {
    try {
      const response = await axios.get(`${config.API_URL}/api/leave/detail/${leaveId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      if (response.data.success) {
        setSelectedLeave(response.data.leave);
        setDetailModalOpen(true);
      }
    } catch (error) {
      setError(error.response?.data?.error || error.message);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSearch = (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = leaves.filter(leave => 
      leave.userId?.name?.toLowerCase().includes(searchTerm) ||
      leave.leaveType?.toLowerCase().includes(searchTerm) ||
      leave.reason?.toLowerCase().includes(searchTerm) ||
      leave.status?.toLowerCase().includes(searchTerm) ||
      leave.userId?.role?.toLowerCase().includes(searchTerm)
    );
    setFilteredLeaves(filtered);
  };

  const handleViewDetail = (leaveId) => {
    fetchLeaveDetail(leaveId);
  };

  const handleCloseDetailModal = () => {
    setDetailModalOpen(false);
    setSelectedLeave(null);
  };

  const handleStatusUpdate = async (leaveId, newStatus) => {
    try {
      const response = await axios.put(
        `${config.API_URL}/api/leave/${leaveId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data.success) {
        await fetchLeaves();
        if (detailModalOpen) {
          handleCloseDetailModal();
        }
      }
    } catch (error) {
      setError(error.response?.data?.error || error.message);
    }
  };

  const getStatusChipProps = (status) => {
    const baseProps = {
      size: "small",
      sx: { minWidth: 80 }
    };

    switch (status) {
      case 'Approved':
        return {
          ...baseProps,
          color: "success",
          variant: "outlined"
        };
      case 'Rejected':
        return {
          ...baseProps,
          color: "error",
          variant: "outlined"
        };
      default:
        return {
          ...baseProps,
          color: "warning",
          variant: "outlined"
        };
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: 'error.main' }}>
        Error: {error}
      </Box>
    );
  }

  return (
    <>
      <Paper elevation={0} sx={{ p: 3, borderRadius: 2 }}>
        <Stack spacing={3}>
          <Typography variant="h5" fontWeight="bold">
            Leave Applications
          </Typography>

          <TextField
            fullWidth
            placeholder="Search by employee name, leave type, status..."
            variant="outlined"
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: 'text.secondary' }} />
                </InputAdornment>
              ),
            }}
            sx={{ mb: 2 }}
          />

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>SNO</TableCell>
                  <TableCell>Employee</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Leave Type</TableCell>
                  <TableCell>From</TableCell>
                  <TableCell>To</TableCell>
                  <TableCell>Description</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredLeaves.map((leave) => (
                  <TableRow key={leave._id} hover>
                    <TableCell>{sno++}</TableCell>
                    <TableCell>{leave.userId?.name || 'N/A'}</TableCell>
                    <TableCell sx={{ textTransform: 'capitalize' }}>
                      {leave.userId?.role || 'N/A'}
                    </TableCell>
                    <TableCell>{leave.leaveType}</TableCell>
                    <TableCell>
                      {new Date(leave.startDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {new Date(leave.endDate).toLocaleDateString()}
                    </TableCell>
                    <TableCell>{leave.reason}</TableCell>
                    <TableCell>
                      <Chip 
                        label={leave.status}
                        {...getStatusChipProps(leave.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          startIcon={<VisibilityIcon />}
                          onClick={() => handleViewDetail(leave._id)}
                        >
                          View
                        </Button>
                        {leave.status === 'Pending' && (
                          <>
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => handleStatusUpdate(leave._id, 'Approved')}
                            >
                              Approve
                            </Button>
                            <Button
                              size="small"
                              variant="outlined"
                              color="error"
                              onClick={() => handleStatusUpdate(leave._id, 'Rejected')}
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Stack>
      </Paper>

      {/* Leave Detail Modal */}
      <Dialog
        open={detailModalOpen}
        onClose={handleCloseDetailModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Typography variant="h5" fontWeight="bold" textAlign="center">
            Leave Details
          </Typography>
        </DialogTitle>
        <DialogContent>
          {selectedLeave && (
            <>
              <Divider sx={{ my: 2 }} />
              <Grid container spacing={4}>
                <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Avatar
                    src={selectedLeave.userId?.profileImage ? `${config.API_URL}/${selectedLeave.userId.profileImage}` : ''}
                    sx={{ width: 200, height: 200 }}
                  />
                </Grid>

                <Grid item xs={12} md={8}>
                  <Stack spacing={2}>
                    <LeaveDetailItem label="Name" value={selectedLeave.userId?.name || 'N/A'} />
                    <LeaveDetailItem label="Role" value={selectedLeave.userId?.role || 'N/A'} />
                    <LeaveDetailItem label="Leave Type" value={selectedLeave.leaveType} />
                    <LeaveDetailItem label="Reason" value={selectedLeave.reason} />
                    <LeaveDetailItem 
                      label="Start Date" 
                      value={new Date(selectedLeave.startDate).toLocaleDateString()} 
                    />
                    <LeaveDetailItem 
                      label="End Date" 
                      value={new Date(selectedLeave.endDate).toLocaleDateString()} 
                    />
                    
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                        {selectedLeave.status === "Pending" ? "Action:" : "Status:"}
                      </Typography>
                      
                      {selectedLeave.status === "Pending" ? (
                        <Stack direction="row" spacing={2}>
                          <Button
                            variant="contained"
                            color="success"
                            startIcon={<CheckIcon />}
                            onClick={() => handleStatusUpdate(selectedLeave._id, "Approved")}
                          >
                            Approve
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<CloseIcon />}
                            onClick={() => handleStatusUpdate(selectedLeave._id, "Rejected")}
                          >
                            Reject
                          </Button>
                        </Stack>
                      ) : (
                        <Typography variant="body1" sx={{
                          color: selectedLeave.status === 'Approved' ? 'success.main' : 'error.main',
                          fontWeight: 'medium'
                        }}>
                          {selectedLeave.status}
                        </Typography>
                      )}
                    </Box>
                  </Stack>
                </Grid>
              </Grid>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetailModal}>Close</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default AdminLeaveList;