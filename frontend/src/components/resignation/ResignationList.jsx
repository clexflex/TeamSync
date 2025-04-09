import React, { useState, useEffect } from 'react';
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
  TablePagination,
  Button,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  CircularProgress,
  Alert,
  Tooltip,
  Grid
} from '@mui/material';
import {
  Visibility as ViewIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';
import { useNavigate } from 'react-router-dom';

const ResignationList = () => {
  const [resignations, setResignations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filter state
  const [filters, setFilters] = useState({
    status: 'All'
  });
  
  const navigate = useNavigate();
  
  useEffect(() => {
    fetchResignations();
  }, []);
  
  const fetchResignations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'All') {
        params.append('status', filters.status);
      }
      
      const response = await axios.get(`${config.API_URL}/api/resignation/list?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setResignations(response.data.requests || []);
        setPage(0); // Reset to first page when data changes
      } else {
        setError('Failed to fetch resignation requests');
      }
    } catch (error) {
      console.error('Error fetching resignation requests:', error);
      setError(error.response?.data?.error || 'An error occurred while fetching resignation requests');
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
  
  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value
    });
  };
  
  const applyFilters = () => {
    fetchResignations();
  };
  
  const resetFilters = () => {
    setFilters({
      status: 'All'
    });
    
    // Apply reset after state update
    setTimeout(() => fetchResignations(), 0);
  };
  
  const handleViewResignation = (resignationId) => {
    navigate(`/admin-dashboard/resignations/detail/${resignationId}`);
  };
  
  const getStatusChip = (status) => {
    let color = 'default';
    
    switch (status) {
      case 'Pending':
        color = 'warning';
        break;
      case 'Approved':
        color = 'success';
        break;
      case 'Rejected':
        color = 'error';
        break;
      case 'Withdrawn':
        color = 'info';
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip
        label={status}
        color={color}
        size="small"
        sx={{ fontWeight: 500 }}
      />
    );
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  if (loading && resignations.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold">
          Resignation Requests
        </Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}
      
      {/* Filters */}
      {showFilters && (
        <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  label="Status"
                >
                  <MenuItem value="All">All Statuses</MenuItem>
                  <MenuItem value="Pending">Pending</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                  <MenuItem value="Withdrawn">Withdrawn</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={applyFilters}
                  startIcon={<SearchIcon />}
                >
                  Apply
                </Button>
                <Button
                  variant="outlined"
                  onClick={resetFilters}
                  startIcon={<RefreshIcon />}
                >
                  Reset
                </Button>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}
      
      {/* Resignation Requests Table */}
      {resignations.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">No resignation requests found.</Typography>
        </Paper>
      ) : (
        <Paper variant="outlined">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Submission Date</TableCell>
                  <TableCell>Last Working Day</TableCell>
                  <TableCell>Notice Period</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {resignations
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((resignation) => (
                    <TableRow key={resignation._id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {resignation.userId?.name || 'Unknown User'}
                          </Typography>
                          <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'capitalize' }}>
                            {resignation.userId?.role}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        {formatDate(resignation.submissionDate)}
                      </TableCell>
                      <TableCell>
                        {formatDate(resignation.lastWorkingDay)}
                      </TableCell>
                      <TableCell>
                        {resignation.noticePeriod} days
                      </TableCell>
                      <TableCell>
                        {getStatusChip(resignation.status)}
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              color="primary"
                              onClick={() => handleViewResignation(resignation._id)}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {resignation.status === 'Pending' && (
                            <>
                              <Tooltip title="Approve">
                                <IconButton
                                  size="small"
                                  color="success"
                                  onClick={() => navigate(`/admin-dashboard/resignations/detail/${resignation._id}?action=approve`)}
                                >
                                  <ApproveIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              
                              <Tooltip title="Reject">
                                <IconButton
                                  size="small"
                                  color="error"
                                  onClick={() => navigate(`/admin-dashboard/resignations/detail/${resignation._id}?action=reject`)}
                                >
                                  <RejectIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </>
                          )}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
          
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={resignations.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      )}
    </Box>
  );
};

export default ResignationList;