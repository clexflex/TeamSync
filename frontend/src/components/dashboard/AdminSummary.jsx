import React, { useState, useEffect } from 'react';
import { Box, Grid2, Paper, Typography, CircularProgress } from '@mui/material';
import { People as PeopleIcon, Business as BusinessIcon,
         MonetizationOn as MoneyIcon, Description as FileIcon,
         CheckCircle as CheckIcon, HourglassEmpty as PendingIcon,
         Cancel as RejectIcon } from '@mui/icons-material';
import axios from 'axios';
import config from "../../config";

const SummaryCard = ({ icon, text, number, color }) => (
  <Paper elevation={2} sx={{ p: 2, height: '100%' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <Box sx={{ 
        p: 1.5, 
        borderRadius: 2, 
        backgroundColor: `${color}.light`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {React.cloneElement(icon, { sx: { color: `${color}.main`, fontSize: 28 } })}
      </Box>
      <Box>
        <Typography color="text.secondary" fontWeight="medium" gutterBottom>
          {text}
        </Typography>
        <Typography variant="h5" fontWeight="bold">
          {number}
        </Typography>
      </Box>
    </Box>
  </Paper>
);

const AdminSummary = () => {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const response = await axios.get(`${config.API_URL}/api/dashboard/summary`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem('token')}`
          }
        });
        setSummary(response.data);
      } catch (error) {
        console.error('Error fetching summary:', error);
      }
    };
    fetchSummary();
  }, []);

  if (!summary) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight="bold" color="text.primary" mb={4}>
        Dashboard Overview
      </Typography>
      
      <Grid2 container spacing={3}>
        <Grid2 item xs={12} md={4}>
          <SummaryCard
            icon={<PeopleIcon />}
            text="Total Employees"
            number={summary.totalEmployees}
            color="primary"
          />
        </Grid2>
        <Grid2 item xs={12} md={4}>
          <SummaryCard
            icon={<BusinessIcon />}
            text="Total Departments"
            number={summary.totalDepartments}
            color="warning"
          />
        </Grid2>
        <Grid2 item xs={12} md={4}>
          <SummaryCard
            icon={<MoneyIcon />}
            text="Monthly Salary"
            number={summary.totalSalary}
            color="success"
          />
        </Grid2>
      </Grid2>

      <Typography variant="h4" fontWeight="bold" color="text.primary" my={4}>
        Leave Details
      </Typography>
      
      <Grid2 container spacing={3}>
        <Grid2 item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<FileIcon />}
            text="Leave Applied"
            number={summary.leaveSummary.appliedFor}
            color="secondary"
          />
        </Grid2>
        <Grid2 item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<CheckIcon />}
            text="Leave Approved"
            number={summary.leaveSummary.approved}
            color="success"
          />
        </Grid2>
        <Grid2 item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<PendingIcon />}
            text="Leave Pending"
            number={summary.leaveSummary.pending}
            color="warning"
          />
        </Grid2>
        <Grid2 item xs={12} sm={6} md={3}>
          <SummaryCard
            icon={<RejectIcon />}
            text="Leave Rejected"
            number={summary.leaveSummary.rejected}
            color="error"
          />
        </Grid2>
      </Grid2>
    </Box>
  );
};

export default AdminSummary;