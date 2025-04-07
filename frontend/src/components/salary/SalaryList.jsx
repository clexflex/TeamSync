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
  TextField,
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
  MonetizationOn as PayIcon,
  Description as PayslipIcon,
  FilterList as FilterIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  ArrowDropDown as ExpandIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';
import { useNavigate, useLocation } from 'react-router-dom';

const SalaryList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  const [salaries, setSalaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
  // Pagination state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  // Filter state
  const [filters, setFilters] = useState({
    status: queryParams.get('status') || 'All',
    period: '',
    role: 'All'
  });
  
  useEffect(() => {
    fetchSalaries();
  }, [location.search]);
  
  const fetchSalaries = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Build query params
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'All') {
        params.append('status', filters.status);
      }
      if (filters.period) {
        params.append('period', filters.period);
      }
      if (filters.role && filters.role !== 'All') {
        params.append('role', filters.role);
      }
      
      const response = await axios.get(`${config.API_URL}/api/salary/list?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (response.data.success) {
        setSalaries(response.data.salaries || []);
        setPage(0); // Reset to first page when data changes
      } else {
        setError('Failed to fetch salary records');
      }
    } catch (error) {
      console.error('Error fetching salary records:', error);
      setError(error.response?.data?.error || 'An error occurred while fetching salary records');
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
    fetchSalaries();
  };
  
  const resetFilters = () => {
    setFilters({
      status: 'All',
      period: '',
      role: 'All'
    });
    
    // Apply reset after state update
    setTimeout(() => fetchSalaries(), 0);
  };
  
  const handleViewSalary = (salaryId) => {
    navigate(`/admin-dashboard/salary/detail/${salaryId}`);
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const formatCurrency = (amount) => {
    return `₹ ${parseFloat(amount).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };
  
  const getStatusChip = (status) => {
    let color = 'default';
    let label = status;
    
    switch (status) {
      case 'Draft':
        color = 'default';
        break;
      case 'Verified':
        color = 'info';
        break;
      case 'Approved':
        color = 'success';
        break;
      case 'Rejected':
        color = 'error';
        break;
      case 'Paid':
        color = 'primary';
        break;
      default:
        color = 'default';
    }
    
    return (
      <Chip
        label={label}
        color={color}
        size="small"
        sx={{ fontWeight: 500 }}
      />
    );
  };
  
  const getRoleChip = (role) => {
    if (!role) return null;
    
    let color = role === 'employee' ? 'primary' : 'secondary';
    return (
      <Chip
        label={role === 'employee' ? 'Employee' : 'Manager'}
        color={color}
        size="small"
        variant="outlined"
        sx={{ textTransform: 'capitalize' }}
      />
    );
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight="bold">
          Salary Records
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<FilterIcon />}
            onClick={() => setShowFilters(!showFilters)}
          >
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </Button>
          
          <Button
            variant="contained"
            onClick={() => navigate('/admin-dashboard/salary/generate')}
            color="primary"
          >
            Generate New Salary
          </Button>
        </Box>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
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
                  <MenuItem value="Draft">Draft</MenuItem>
                  <MenuItem value="Verified">Verified</MenuItem>
                  <MenuItem value="Approved">Approved</MenuItem>
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Period</InputLabel>
                <Select
                  name="period"
                  value={filters.period}
                  onChange={handleFilterChange}
                  label="Period"
                >
                  <MenuItem value="">All Periods</MenuItem>
                  {/* Generate last 12 months */}
                  {Array.from({ length: 12 }).map((_, i) => {
                    const date = new Date();
                    date.setMonth(date.getMonth() - i);
                    const period = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
                    return (
                      <MenuItem key={period} value={period}>
                        {period}
                      </MenuItem>
                    );
                  })}
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
                  <MenuItem value="All">All Roles</MenuItem>
                  <MenuItem value="employee">Employees</MenuItem>
                  <MenuItem value="manager">Managers</MenuItem>
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
      
      {/* Salary Records Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : salaries.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">No salary records found.</Typography>
        </Paper>
      ) : (
        <Paper variant="outlined">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Employee</TableCell>
                  <TableCell>Pay Period</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Working Days</TableCell>
                  <TableCell>Credits</TableCell>
                  <TableCell align="right">Net Salary</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {salaries
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((salary) => (
                    <TableRow key={salary._id} hover>
                      <TableCell>
                        <Box>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {/* Handle case when user might be null or undefined */}
                            {salary.userId?.name || 'Unknown User'}
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                            {/* Only render role chip if userId exists and has role */}
                            {salary.userId?.role && getRoleChip(salary.userId.role)}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {salary.payPeriod || 'N/A'}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" display="block">
                          {formatDate(salary.periodStart)} - {formatDate(salary.periodEnd)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(salary.status)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {salary.totalWorkingDays || 0} / {salary.totalDays || 0}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          (Weekends: {salary.totalWeeklyOffs || 0}, Holidays: {salary.totalHolidays || 0})
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="medium">
                          {(salary.totalCredits || 0).toFixed(1)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(salary.netSalary || 0)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
                          <Tooltip title="View Details">
                            <IconButton 
                              size="small" 
                              color="primary"
                              onClick={() => handleViewSalary(salary._id)}
                            >
                              <ViewIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          
                          {salary.status === 'Draft' && (
                            <Tooltip title="Approve">
                              <IconButton 
                                size="small" 
                                color="success"
                                onClick={() => navigate(`/admin-dashboard/salary/detail/${salary._id}?action=approve`)}
                              >
                                <ApproveIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {salary.status === 'Approved' && (
                            <Tooltip title="Mark as Paid">
                              <IconButton 
                                size="small" 
                                color="info"
                                onClick={() => navigate(`/admin-dashboard/salary/detail/${salary._id}?action=pay`)}
                              >
                                <PayIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          )}
                          
                          {(salary.status === 'Approved' || salary.status === 'Paid') && (
                            <Tooltip title="Generate Payslip">
                              <IconButton 
                                size="small" 
                                color="secondary"
                                onClick={() => navigate(`/admin-dashboard/salary/detail/${salary._id}?action=payslip`)}
                              >
                                <PayslipIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
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
            count={salaries.length}
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

export default SalaryList;