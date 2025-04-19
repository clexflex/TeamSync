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
  Card,
  CardContent,
  Divider,
  IconButton,
  Snackbar
} from '@mui/material';
import {
  DownloadForOffline as DownloadIcon,
  CalendarMonth as CalendarIcon,
  Business as BusinessIcon,
  Info as InfoIcon,
  ArrowBack as ArrowBackIcon,
  FileDownload as FileDownloadIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';
import { useNavigate } from 'react-router-dom';

const SalaryExport = () => {
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [company, setCompany] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [exportReady, setExportReady] = useState(false);
  const [yearOptions] = useState(() => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 1, currentYear, currentYear + 1];
  });
  
  const navigate = useNavigate();

  // Months array for dropdown
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  useEffect(() => {
    // Set default month to current month (or previous month if it's early in the month)
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
    
    // If we're before the 25th of the month, default to previous month
    // since salary is typically processed for 26th of prev month to 25th of current month
    if (currentDate.getDate() < 25) {
      setMonth(currentMonth === 1 ? 12 : currentMonth - 1);
      if (currentMonth === 1) {
        setYear(currentDate.getFullYear() - 1);
      }
    } else {
      setMonth(currentMonth);
    }

    // Fetch available companies
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      setInitialLoading(true);
      const response = await axios.get(`${config.API_URL}/api/salary-export/companies`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setCompanies(response.data.companies);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError('Failed to fetch company list');
    } finally {
      setInitialLoading(false);
    }
  };

  const validateForm = () => {
    if (!month) {
      setError('Please select a month');
      return false;
    }
    if (!year) {
      setError('Please select a year');
      return false;
    }
    return true;
  };

  const handleExport = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);
    setExportReady(false);

    try {
      // Just for validation check - we'll do the actual download in a different way
      const checkResponse = await axios.post(
        `${config.API_URL}/api/salary-export/export`,
        {
          month,
          year,
          company
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          responseType: 'blob' // Important for handling file download
        }
      );

      // If we get here, the file is ready to download
      setExportReady(true);
      setSuccess('Salary data is ready for export. Click the download button to start the download.');
    } catch (error) {
      console.error('Error checking export:', error);
      if (error.response?.data) {
        // Try to read the error message from the blob
        try {
          const blob = error.response.data;
          const text = await blob.text();
          const errorData = JSON.parse(text);
          setError(errorData.error || 'Failed to export salary data');
        } catch (blobError) {
          setError('Failed to export salary data');
        }
      } else {
        setError(error.response?.data?.error || 'Failed to export salary data');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await axios.post(
        `${config.API_URL}/api/salary-export/export`,
        {
          month,
          year,
          company
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`
          },
          responseType: 'blob' // Important for handling file download
        }
      );

      // Create a download link
      const monthName = months.find(m => m.value === parseInt(month))?.label || month;
      const fileName = `Salary_Report_${monthName}_${year}.xlsx`;
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      setSuccess('Salary export downloaded successfully');
    } catch (error) {
      console.error('Error downloading export:', error);
      setError('Failed to download salary data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3 } }}>
      <Paper elevation={1} sx={{ p: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/admin-dashboard/salary-management')}
            sx={{ mb: { xs: 1, sm: 0 } }}
          >
            Back to Dashboard
          </Button>
          
          <Typography variant="h5" fontWeight="bold" sx={{ width: { xs: '100%', sm: 'auto' } }}>
            Salary Export Tool
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="body1" gutterBottom>
            Generate Excel reports for salary data to share with accounting and banks for payment processing.
          </Typography>
        </Box>

        {initialLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <Card variant="outlined" sx={{ mb: 4 }}>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Export Options
                </Typography>
                
                <Grid container spacing={3}>
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel id="month-select-label">Month</InputLabel>
                      <Select
                        labelId="month-select-label"
                        value={month}
                        onChange={(e) => setMonth(e.target.value)}
                        label="Month"
                        startAdornment={<CalendarIcon color="action" sx={{ mr: 1 }} />}
                      >
                        {months.map((monthOption) => (
                          <MenuItem key={monthOption.value} value={monthOption.value}>
                            {monthOption.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel id="year-select-label">Year</InputLabel>
                      <Select
                        labelId="year-select-label"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        label="Year"
                        startAdornment={<CalendarIcon color="action" sx={{ mr: 1 }} />}
                      >
                        {yearOptions.map((yearOption) => (
                          <MenuItem key={yearOption} value={yearOption}>
                            {yearOption}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel id="company-select-label">Company (Optional)</InputLabel>
                      <Select
                        labelId="company-select-label"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        label="Company (Optional)"
                        startAdornment={<BusinessIcon color="action" sx={{ mr: 1 }} />}
                      >
                        <MenuItem value="">All Companies</MenuItem>
                        {companies.map((companyOption) => (
                          <MenuItem key={companyOption} value={companyOption}>
                            {companyOption}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
                
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<DownloadIcon />}
                    onClick={handleExport}
                    disabled={loading}
                    sx={{ mr: 2 }}
                  >
                    {loading ? <CircularProgress size={24} /> : 'Prepare Export'}
                  </Button>
                </Box>
              </CardContent>
            </Card>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            {exportReady && (
              <Card sx={{ mb: 3, bgcolor: 'success.50', border: 1, borderColor: 'success.main' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                    <Typography variant="body1" sx={{ flexGrow: 1 }}>
                      <InfoIcon color="info" sx={{ mr: 1, verticalAlign: 'middle' }} />
                      Salary data for {months.find(m => m.value === parseInt(month))?.label} {year} is ready for download.
                    </Typography>
                    
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<FileDownloadIcon />}
                      onClick={handleDownload}
                      disabled={loading}
                    >
                      {loading ? <CircularProgress size={24} /> : 'Download Excel'}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            )}

            <Paper variant="outlined" sx={{ p: 2, bgcolor: 'info.50' }}>
              <Typography variant="subtitle2" gutterBottom>
                About this tool:
              </Typography>
              <Typography variant="body2">
                This tool generates an Excel report containing detailed salary information for all employees
                and managers with approved or paid salary records for the selected month. The report includes
                bank details, PF/ESI contributions, and attendance data to facilitate bulk payments and accounting.
              </Typography>
            </Paper>
          </Box>
        )}
      </Paper>

      <Snackbar
        open={!!success && !error}
        autoHideDuration={6000}
        onClose={() => setSuccess(null)}
        message={success}
      />
    </Box>
  );
};

export default SalaryExport;