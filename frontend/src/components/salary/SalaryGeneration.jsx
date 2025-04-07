import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  CircularProgress,
  Alert,
  Divider,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { 
  Paid, 
  CalendarMonth, 
  Group, 
  ArrowForward, 
  CheckCircle,
  Info as InfoIcon,
  Refresh,
  Warning as WarningIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';
import { useNavigate } from 'react-router-dom';

const SalaryGeneration = () => {
  const [generationType, setGenerationType] = useState('all');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [employees, setEmployees] = useState([]);
  const [periodStart, setPeriodStart] = useState('');
  const [periodEnd, setPeriodEnd] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [generationResults, setGenerationResults] = useState(null);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
  const [selectedError, setSelectedError] = useState('');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [pendingDatesOpen, setPendingDatesOpen] = useState(false);
  const [pendingDates, setPendingDates] = useState([]);
  
  const navigate = useNavigate();
  
  const steps = ['Select Options', 'Review Period', 'Generate Salary'];
  
  useEffect(() => {
    fetchEmployees();
    
    // Set default dates (26th of last month to 25th of current month)
    const today = new Date();
    const lastMonth = new Date(today);
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    
    const startDate = new Date(lastMonth.getFullYear(), lastMonth.getMonth(), 26);
    const endDate = new Date(today.getFullYear(), today.getMonth(), 25);
    
    setPeriodStart(formatDateForInput(startDate));
    setPeriodEnd(formatDateForInput(endDate));
  }, []);
  
  const formatDateForInput = (date) => {
    const d = new Date(date);
    const month = `${d.getMonth() + 1}`.padStart(2, '0');
    const day = `${d.getDate()}`.padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      
      // Use the UserProfile endpoint instead of separate employee/manager endpoints
      const userProfileResponse = await axios.get(`${config.API_URL}/api/user-profile`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });
      
      if (userProfileResponse.data.success && userProfileResponse.data.userProfiles) {
        // Process user profiles and create a structured list of employees and managers
        const userList = userProfileResponse.data.userProfiles
          .filter(profile => profile.user && ['employee', 'manager'].includes(profile.user.role))
          .map(profile => ({
            id: profile.user._id,
            name: profile.user.name || 'Unknown User',
            role: profile.user.role || 'employee',
            department: profile.department?.dep_name || 'N/A',
            employeeId: profile.employeeId || profile.managerId || 'N/A'
          }));
        
        setEmployees(userList);
      } else {
        setError('Failed to fetch user profiles');
      }
    } catch (error) {
      console.error('Error fetching user profiles:', error);
      setError('Failed to fetch employees and managers');
    } finally {
      setLoading(false);
    }
  };
  
  const validatePeriod = () => {
    if (!periodStart || !periodEnd) {
      setError('Please select both start and end dates for the period');
      return false;
    }
    
    const start = new Date(periodStart);
    const end = new Date(periodEnd);
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      setError('Invalid date format');
      return false;
    }
    
    if (end < start) {
      setError('End date cannot be before start date');
      return false;
    }
    
    // Check if period spans approximately one month
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    
    if (diffDays < 28 || diffDays > 31) {
      setError('Period should span approximately one month (28-31 days)');
      return false;
    }
    
    return true;
  };
  
  const handleNext = () => {
    if (activeStep === 0) {
      // Validate first step
      if (generationType === 'individual' && !selectedEmployee) {
        setError('Please select an employee');
        return;
      }
      setError(null);
    } else if (activeStep === 1) {
      // Validate second step
      if (!validatePeriod()) {
        return;
      }
      setError(null);
    }
    
    setActiveStep((prevStep) => prevStep + 1);
  };
  
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    setError(null);
    setSuccess(null);
  };
  
  const handleOpenConfirmDialog = () => {
    setConfirmDialogOpen(true);
  };
  
  const handleCloseConfirmDialog = () => {
    setConfirmDialogOpen(false);
  };
  
  const generateSalary = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      handleCloseConfirmDialog();
      
      if (generationType === 'individual') {
        // Generate salary for single employee
        const response = await axios.post(
          `${config.API_URL}/api/salary/generate`,
          {
            userId: selectedEmployee,
            periodStart,
            periodEnd
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (response.data.success) {
          setSuccess(`Salary draft generated successfully for the selected employee`);
          setGenerationResults({
            success: [
              {
                userId: selectedEmployee,
                name: employees.find(emp => emp.id === selectedEmployee)?.name || 'Employee',
                salaryId: response.data.salaryId,
                payPeriod: response.data.payPeriod,
                netSalary: response.data.netSalary
              }
            ],
            failed: []
          });
        }
      } else {
        // Generate salary for all employees
        const response = await axios.post(
          `${config.API_URL}/api/salary/generate-all`,
          {
            periodStart,
            periodEnd,
            roleFilter: 'all' // Or you could add a dropdown to select 'employee', 'manager', etc.
          },
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`
            }
          }
        );
        
        if (response.data.success) {
          setSuccess(`Generated salary drafts for ${response.data.results.success.length} employees/managers`);
          setGenerationResults(response.data.results);
        }
      }
    } catch (error) {
      console.error('Error generating salary:', error);
      
      // Handle specific case of pending attendance records
      if (error.response?.data?.error?.includes('pending approval')) {
        if (error.response.data.pendingDates) {
          setPendingDates(error.response.data.pendingDates);
          setPendingDatesOpen(true);
        }
        setError('Cannot generate salary draft while attendance records are pending approval');
      } else {
        setError(error.response?.data?.error || 'Failed to generate salary');
      }
    } finally {
      setLoading(false);
    }
  };
  
  const handleShowErrorDetails = (errorMessage) => {
    setSelectedError(errorMessage);
    setDetailsDialogOpen(true);
  };
  
  const viewSalaryRecord = (salaryId) => {
    navigate(`/admin-dashboard/salary/detail/${salaryId}`);
  };

  const viewPendingAttendance = () => {
    setPendingDatesOpen(true);
  };

  const handleEmployeeChange = (e) => {
    setSelectedEmployee(e.target.value);
    console.log("Selected employee:", e.target.value); // Add this for debugging
  };
  
  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Select Generation Type
            </Typography>
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Generation Type</InputLabel>
              <Select
                value={generationType}
                onChange={(e) => setGenerationType(e.target.value)}
                label="Generation Type"
              >
                <MenuItem value="all">All Employees & Managers</MenuItem>
                <MenuItem value="individual">Individual Employee/Manager</MenuItem>
              </Select>
            </FormControl>
            
            {generationType === 'individual' && (
              // Replace the existing Select component for employee selection with this:
<FormControl fullWidth sx={{ mb: 3 }}>
  <InputLabel id="employee-select-label">Select Employee/Manager</InputLabel>
  <Select
    labelId="employee-select-label"
    name="selectedEmployee"
    value={selectedEmployee}
    onChange={(e) => setSelectedEmployee(e.target.value)}
    label="Select Employee/Manager"
  >
    <MenuItem value="" disabled>
      Select an Employee or Manager
    </MenuItem>
    
    {/* Employee Section */}
    <MenuItem value="" disabled divider>
      --- Employees ---
    </MenuItem>
    {employees
      .filter(emp => emp.role === 'employee')
      .map(employee => (
        <MenuItem key={employee.id} value={employee.id}>
          {employee.name} ({employee.employeeId}) - {employee.department}
        </MenuItem>
      ))}
    
    {/* Manager Section */}
    <MenuItem value="" disabled divider>
      --- Managers ---
    </MenuItem>
    {employees
      .filter(emp => emp.role === 'manager')
      .map(manager => (
        <MenuItem key={manager.id} value={manager.id}>
          {manager.name} ({manager.employeeId}) - {manager.department}
        </MenuItem>
      ))}
  </Select>
</FormControl>
            )}
          </Box>
        );
      case 1:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Set Pay Period
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Period Start Date"
                  type="date"
                  value={periodStart}
                  onChange={(e) => setPeriodStart(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  helperText="Typically 26th of previous month"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Period End Date"
                  type="date"
                  value={periodEnd}
                  onChange={(e) => setPeriodEnd(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  helperText="Typically 25th of current month"
                />
              </Grid>
            </Grid>
            
            <Paper sx={{ mt: 3, p: 2, bgcolor: 'info.50', borderRadius: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <InfoIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="body2">
                  This period will be used to calculate attendance credits and salary adjustments.
                  Make sure to include the entire pay cycle.
                </Typography>
              </Box>
            </Paper>
            
            <Box sx={{ mt: 3, p: 2, border: '1px dashed', borderColor: 'divider', borderRadius: 1 }}>
              <Typography variant="subtitle2" gutterBottom>
                Summary:
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Generation Type:
                  </Typography>
                  <Typography variant="body1">
                    {generationType === 'all' 
                      ? 'All Employees & Managers' 
                      : 'Individual Employee/Manager'}
                  </Typography>
                </Grid>
                {generationType === 'individual' && (
                  <Grid item xs={12} sm={6}>
                    <Typography variant="body2" color="textSecondary">
                      Selected Person:
                    </Typography>
                    <Typography variant="body1">
                      {employees.find(emp => emp.id === selectedEmployee)?.name || 'None'}
                    </Typography>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Period:
                  </Typography>
                  <Typography variant="body1">
                    {periodStart && periodEnd 
                      ? `${formatDate(periodStart)} to ${formatDate(periodEnd)}` 
                      : 'Not set'}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
          </Box>
        );
      case 2:
        return (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6" gutterBottom>
              Generate Salary
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : success ? (
              <Box>
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}
                </Alert>
                
                {generationResults && (
                  <Box>
                    {generationResults.success.length > 0 && (
                      <Box sx={{ mb: 4 }}>
                        <Typography variant="subtitle1" gutterBottom>
                          Successfully Generated ({generationResults.success.length})
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Pay Period</TableCell>
                                <TableCell align="right">Net Salary</TableCell>
                                <TableCell align="right">Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {generationResults.success.map((result) => (
                                <TableRow key={result.userId}>
                                  <TableCell>{result.name}</TableCell>
                                  <TableCell>{result.payPeriod}</TableCell>
                                  <TableCell align="right">₹ {result.netSalary.toFixed(2)}</TableCell>
                                  <TableCell align="right">
                                    <Button
                                      size="small"
                                      variant="outlined"
                                      onClick={() => viewSalaryRecord(result.salaryId)}
                                    >
                                      View
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                    
                    {generationResults.failed && generationResults.failed.length > 0 && (
                      <Box>
                        <Typography variant="subtitle1" gutterBottom color="error">
                          Failed ({generationResults.failed.length})
                        </Typography>
                        <TableContainer component={Paper} variant="outlined">
                          <Table size="small">
                            <TableHead>
                              <TableRow>
                                <TableCell>Name</TableCell>
                                <TableCell>Error</TableCell>
                                <TableCell align="right">Actions</TableCell>
                              </TableRow>
                            </TableHead>
                            <TableBody>
                              {generationResults.failed.map((result) => (
                                <TableRow key={result.userId}>
                                  <TableCell>{result.name}</TableCell>
                                  <TableCell>
                                    {result.error.length > 50 
                                      ? `${result.error.substring(0, 50)}...` 
                                      : result.error}
                                  </TableCell>
                                  <TableCell align="right">
                                    <Button
                                      size="small"
                                      variant="text"
                                      color="primary"
                                      onClick={() => handleShowErrorDetails(result.error)}
                                    >
                                      Details
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </TableContainer>
                      </Box>
                    )}
                  </Box>
                )}
                
                <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => navigate('/admin-dashboard/salary/list')}
                    startIcon={<ArrowForward />}
                  >
                    Go to Salary Records
                  </Button>
                </Box>
              </Box>
            ) : (
              <Box>
                <Paper sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'primary.light', borderRadius: 2 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    Please review the information below before generating salaries
                  </Typography>
                  
                  <Grid container spacing={2} sx={{ mt: 1 }}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">
                        Generation Type:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {generationType === 'all' 
                          ? 'All Employees & Managers' 
                          : 'Individual Employee/Manager'}
                      </Typography>
                    </Grid>
                    
                    {generationType === 'individual' && (
                      <Grid item xs={12} sm={6}>
                        <Typography variant="body2" color="textSecondary">
                          Selected Person:
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                          {employees.find(emp => emp.id === selectedEmployee)?.name || 'None'}
                        </Typography>
                      </Grid>
                    )}
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">
                        Period Start:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {formatDate(periodStart)}
                      </Typography>
                    </Grid>
                    
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">
                        Period End:
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                        {formatDate(periodEnd)}
                      </Typography>
                    </Grid>
                  </Grid>
                </Paper>
                
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleOpenConfirmDialog}
                    startIcon={<Paid />}
                    size="large"
                  >
                    Generate Salary Now
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        );
      default:
        return null;
    }
  };
  
  return (
    <Box sx={{ p: 3 }}>
      <Paper elevation={1} sx={{ p: 3 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            Generate Salary Drafts
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Generate salary drafts for employees and managers based on attendance data.
          </Typography>
        </Box>
        
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        
        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            action={
              error.includes('pending approval') && (
                <Button 
                  color="inherit" 
                  size="small"
                  onClick={viewPendingAttendance}
                >
                  View Dates
                </Button>
              )
            }
          >
            {error}
          </Alert>
        )}
        
        {renderStepContent()}
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
          <Button
            disabled={activeStep === 0 || loading || success}
            onClick={handleBack}
            variant="outlined"
          >
            Back
          </Button>
          
          {activeStep < steps.length - 1 ? (
            <Button
              variant="contained"
              onClick={handleNext}
              disabled={loading}
            >
              Next
            </Button>
          ) : (
            !success && (
              <Button
                variant="contained"
                color="primary"
                onClick={handleOpenConfirmDialog}
                disabled={loading || false}
                startIcon={<Paid />}
              >
                Generate Salary
              </Button>
            )
          )}
        </Box>
      </Paper>
      
      {/* Error Details Dialog */}
      <Dialog
        open={detailsDialogOpen}
        onClose={() => setDetailsDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Error Details</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {selectedError}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Pending Attendance Dates Dialog */}
      <Dialog
        open={pendingDatesOpen}
        onClose={() => setPendingDatesOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WarningIcon color="warning" />
          Pending Attendance Records
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            The following dates have attendance records pending approval. Please approve or reject these records before generating salary.
          </DialogContentText>
          
          {pendingDates.length > 0 ? (
            <List sx={{ maxHeight: 300, overflow: 'auto', bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              {pendingDates.map((date, index) => (
                <ListItem key={index} divider={index < pendingDates.length - 1}>
                  <ListItemText 
                    primary={formatDate(date)} 
                    secondary={new Date(date).toLocaleDateString('en-US', { weekday: 'long' })}
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography color="text.secondary">
              No specific dates available. Please check attendance records.
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => navigate('/admin-dashboard/attendance-approval')}
            color="primary"
            variant="contained"
          >
            Go to Attendance Approval
          </Button>
          <Button onClick={() => setPendingDatesOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}
      >
        <DialogTitle>Confirm Salary Generation</DialogTitle>
        <DialogContent>
          <DialogContentText>
            {generationType === 'all' ? (
              <>
                You are about to generate salary drafts for all employees and managers 
                for the period <strong>{formatDate(periodStart)}</strong> to <strong>{formatDate(periodEnd)}</strong>.
              </>
            ) : (
              <>
                You are about to generate a salary draft for <strong>{employees.find(emp => emp.id === selectedEmployee)?.name}</strong> 
                for the period <strong>{formatDate(periodStart)}</strong> to <strong>{formatDate(periodEnd)}</strong>.
              </>
            )}
          </DialogContentText>
          <DialogContentText sx={{ mt: 2 }}>
            This action will calculate salaries based on attendance records. Please ensure that all attendance 
            records for this period have been approved.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseConfirmDialog}>Cancel</Button>
          <Button 
            onClick={generateSalary} 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Confirm & Generate'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SalaryGeneration;