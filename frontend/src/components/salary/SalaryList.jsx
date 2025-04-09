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
  Grid,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
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
  ArrowDropDown as ExpandIcon,
  ArrowBack
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
  const [success, setSuccess] = useState(null);
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

  // Selection state for bulk operations
  const [selected, setSelected] = useState([]);
  const [bulkActionOpen, setBulkActionOpen] = useState(false);
  const [bulkAction, setBulkAction] = useState(''); // 'approve' or 'reject'
  const [bulkComments, setBulkComments] = useState('');

  useEffect(() => {
    fetchSalaries();
  }, [location.search]);

  const fetchSalaries = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

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
        setSelected([]); // Clear selection
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

  // Selection handlers for bulk operations
  const handleSelectAll = (event) => {
    if (event.target.checked) {
      // Only select records in Draft or Verified status
      const eligibleIds = salaries
        .filter(s => ['Draft', 'Verified'].includes(s.status))
        .map(s => s._id);
      setSelected(eligibleIds);
      return;
    }
    setSelected([]);
  };

  const handleSelectOne = (event, id) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }

    setSelected(newSelected);
  };

  const handleBulkAction = (action) => {
    if (selected.length === 0) {
      setError('No salary records selected');
      return;
    }

    setBulkAction(action);
    setBulkActionOpen(true);
  };

  const executeBulkAction = async () => {
    try {
      if (bulkAction === 'reject' && !bulkComments.trim()) {
        setError('Comments are required for rejection');
        return;
      }

      setLoading(true);
      setError(null);
      setSuccess(null);

      const endpoint = bulkAction === 'approve'
        ? `${config.API_URL}/api/salary/bulk/approve`
        : `${config.API_URL}/api/salary/bulk/reject`;

      const response = await axios.post(
        endpoint,
        {
          salaryIds: selected,
          comments: bulkComments
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          }
        }
      );

      if (response.data.success) {
        setSuccess(`Successfully ${bulkAction === 'approve' ? 'approved' : 'rejected'} ${response.data.count} salary records`);
        fetchSalaries(); // Refresh the list
        setSelected([]); // Clear selection
      } else {
        setError(`Failed to ${bulkAction} salary records`);
      }
    } catch (error) {
      console.error(`Error executing bulk ${bulkAction}:`, error);
      setError(error.response?.data?.error || `An error occurred while processing bulk ${bulkAction}`);
    } finally {
      setLoading(false);
      setBulkActionOpen(false);
      setBulkComments('');
    }
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

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

  if (loading && salaries.length === 0) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => navigate('/admin-dashboard/salary-management')}
          sx={{ mb: 2 }}
        >
          Back to Dashboard
        </Button>
      </Box>
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
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(null)}>
          {success}
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

      {/* Bulk Action Buttons */}
      {selected.length > 0 && (
        <Box sx={{ mb: 2, p: 2, display: 'flex', alignItems: 'center', bgcolor: 'primary.light', color: 'white', borderRadius: 1 }}>
          <Typography variant="body2" sx={{ mr: 2 }}>
            {selected.length} records selected
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, ml: 'auto' }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<ApproveIcon />}
              onClick={() => handleBulkAction('approve')}
              size="small"
            >
              Approve Selected
            </Button>
            <Button
              variant="contained"
              color="error"
              startIcon={<RejectIcon />}
              onClick={() => handleBulkAction('reject')}
              size="small"
            >
              Reject Selected
            </Button>
            <Button
              variant="outlined"
              onClick={() => setSelected([])}
              size="small"
              sx={{ color: 'white', borderColor: 'white' }}
            >
              Clear Selection
            </Button>
          </Box>
        </Box>
      )}

      {/* Salary Records Table */}
      {salaries.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">No salary records found.</Typography>
        </Paper>
      ) : (
        <Paper variant="outlined">
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selected.length > 0 && selected.length < salaries.filter(s => ['Draft', 'Verified'].includes(s.status)).length}
                      checked={salaries.filter(s => ['Draft', 'Verified'].includes(s.status)).length > 0 &&
                        selected.length === salaries.filter(s => ['Draft', 'Verified'].includes(s.status)).length}
                      onChange={handleSelectAll}
                      inputProps={{ 'aria-label': 'select all salaries' }}
                    />
                  </TableCell>
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
                  .map((salary) => {
                    const isItemSelected = isSelected(salary._id);
                    const isSelectable = ['Draft', 'Verified'].includes(salary.status);

                    return (
                      <TableRow
                        key={salary._id}
                        hover
                        selected={isItemSelected}
                        sx={{
                          '&.Mui-selected': {
                            backgroundColor: 'primary.soft'
                          }
                        }}
                      >
                        <TableCell padding="checkbox">
                          {isSelectable && (
                            <Checkbox
                              checked={isItemSelected}
                              onChange={(event) => handleSelectOne(event, salary._id)}
                              inputProps={{ 'aria-labelledby': salary._id }}
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {salary.userId?.name || 'Unknown User'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
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
                    );
                  })}
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

      {/* Bulk Action Dialog */}
      <Dialog
        open={bulkActionOpen}
        onClose={() => setBulkActionOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {bulkAction === 'approve' ? 'Bulk Approve Salary Records' : 'Bulk Reject Salary Records'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {bulkAction === 'approve'
              ? `You are about to approve ${selected.length} salary records. This will mark them as approved and ready for payment.`
              : `You are about to reject ${selected.length} salary records. Please provide a reason for rejection.`
            }
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            label={bulkAction === 'approve' ? "Comments (Optional)" : "Reason for Rejection (Required)"}
            fullWidth
            variant="outlined"
            value={bulkComments}
            onChange={(e) => setBulkComments(e.target.value)}
            multiline
            rows={3}
            sx={{ mt: 2 }}
            required={bulkAction === 'reject'}
            error={bulkAction === 'reject' && !bulkComments.trim()}
            helperText={bulkAction === 'reject' && !bulkComments.trim() ? "Reason is required for rejection" : ""}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBulkActionOpen(false)}>Cancel</Button>
          <Button
            onClick={executeBulkAction}
            variant="contained"
            color={bulkAction === 'approve' ? "success" : "error"}
            disabled={(bulkAction === 'reject' && !bulkComments.trim()) || loading}
          >
            {loading ? <CircularProgress size={24} /> : (bulkAction === 'approve' ? 'Approve' : 'Reject')}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalaryList;