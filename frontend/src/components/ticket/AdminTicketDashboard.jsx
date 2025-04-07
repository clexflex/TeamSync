import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
  Tab,
  Tabs,
  TextField,
  MenuItem,
  IconButton,
  Chip,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Divider,
  Alert
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  PriorityHigh as PriorityHighIcon,
  AssignmentLate as AssignmentLateIcon,
  CheckCircle as CheckCircleIcon,
  DoDisturbOn as DoDisturbOnIcon,
  Send as SendIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';

const AdminTicketDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [stats, setStats] = useState({
    statusStats: {},
    typeStats: {},
    priorityStats: {},
    recentTicketsCount: 0,
    unassignedCount: 0,
    totalTickets: 0
  });
  const [tabValue, setTabValue] = useState('all');
  const [filters, setFilters] = useState({
    status: '',
    type: '',
    priority: '',
    search: ''
  });
  const [error, setError] = useState('');
  
  const navigate = useNavigate();

  // Fetch tickets
  const fetchTickets = async () => {
    setLoading(true);
    try {
      // Build query string from filters
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.priority) queryParams.append('priority', filters.priority);
      if (filters.search) queryParams.append('search', filters.search);
      
      const response = await axios.get(
        `${config.API_URL}/api/tickets?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        setTickets(response.data.tickets);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Failed to fetch tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch statistics
  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${config.API_URL}/api/tickets/stats/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        setStats(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching ticket stats:', error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchTickets();
    fetchStats();
  }, []);

  // Fetch tickets when filters change
  useEffect(() => {
    fetchTickets();
  }, [filters.status, filters.type, filters.priority]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    
    // Update status filter based on tab
    if (newValue === 'all') {
      setFilters({ ...filters, status: '' });
    } else {
      setFilters({ ...filters, status: newValue });
    }
  };

  // Handle filter changes
  const handleFilterChange = (event) => {
    setFilters({
      ...filters,
      [event.target.name]: event.target.value
    });
  };

  // Handle search
  const handleSearch = () => {
    fetchTickets();
  };

  // Reset filters
  const handleResetFilters = () => {
    setFilters({
      status: '',
      type: '',
      priority: '',
      search: ''
    });
    setTabValue('all');
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Get priority color
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'Low': return 'info';
      case 'Medium': return 'success';
      case 'High': return 'warning';
      case 'Critical': return 'error';
      default: return 'default';
    }
  };

  // Get status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'Open': return 'info';
      case 'In Progress': return 'warning';
      case 'Resolved': return 'success';
      case 'Closed': return 'default';
      case 'Reopened': return 'error';
      default: return 'default';
    }
  };

  return (
    <Box>
      <Typography variant="h5" component="h1" sx={{ mb: 3, fontWeight: 600 }}>
        Ticket Management
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Tickets
              </Typography>
              <Typography variant="h4" component="div">
                {stats.totalTickets || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Open Tickets
              </Typography>
              <Typography variant="h4" component="div">
                {stats.statusStats?.Open || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Unassigned Tickets
              </Typography>
              <Typography variant="h4" component="div">
                {stats.unassignedCount || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Recent Tickets (30 days)
              </Typography>
              <Typography variant="h4" component="div">
                {stats.recentTicketsCount || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs and Filters */}
      <Box sx={{ mb: 3 }}>
        <Paper sx={{ p: 2 }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            sx={{ mb: 2 }}
          >
            <Tab label="All Tickets" value="all" />
            <Tab label="Open" value="Open" />
            <Tab label="In Progress" value="In Progress" />
            <Tab label="Resolved" value="Resolved" />
            <Tab label="Closed" value="Closed" />
          </Tabs>
          
          <Divider sx={{ my: 2 }} />
          
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                label="Type"
                name="type"
                value={filters.type}
                onChange={handleFilterChange}
                size="small"
                variant="outlined"
              >
                <MenuItem value="">All Types</MenuItem>
                <MenuItem value="Tech Support">Tech Support</MenuItem>
                <MenuItem value="HR">HR</MenuItem>
                <MenuItem value="Payroll">Payroll</MenuItem>
                <MenuItem value="Facility">Facility</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                select
                fullWidth
                label="Priority"
                name="priority"
                value={filters.priority}
                onChange={handleFilterChange}
                size="small"
                variant="outlined"
              >
                <MenuItem value="">All Priorities</MenuItem>
                <MenuItem value="Low">Low</MenuItem>
                <MenuItem value="Medium">Medium</MenuItem>
                <MenuItem value="High">High</MenuItem>
                <MenuItem value="Critical">Critical</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Search"
                name="search"
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                size="small"
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <IconButton
                      size="small"
                      onClick={handleSearch}
                      edge="end"
                    >
                      <SearchIcon />
                    </IconButton>
                  ),
                }}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
              />
            </Grid>
            <Grid item xs={12} sm={2} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleResetFilters}
                size="small"
              >
                Reset
              </Button>
            </Grid>
          </Grid>
        </Paper>
      </Box>

      {/* Tickets Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Title</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Submitted By</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    <CircularProgress size={40} />
                  </TableCell>
                </TableRow>
              ) : tickets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} align="center">
                    No tickets found.
                  </TableCell>
                </TableRow>
              ) : (
                tickets.map((ticket) => (
                  <TableRow 
                    key={ticket._id}
                    hover
                    onClick={() => navigate(`/admin-dashboard/tickets/${ticket._id}`)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <TableCell component="th" scope="row">
                      {ticket._id.substring(ticket._id.length - 6).toUpperCase()}
                    </TableCell>
                    <TableCell>{ticket.title}</TableCell>
                    <TableCell>{ticket.type}</TableCell>
                    <TableCell>
                      {ticket.userId?.name || 'Unknown'}
                      <Typography variant="caption" display="block" color="textSecondary">
                        {ticket.userId?.role || 'Unknown'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={ticket.status} 
                        size="small" 
                        color={getStatusColor(ticket.status)} 
                      />
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={ticket.priority} 
                        size="small" 
                        color={getPriorityColor(ticket.priority)} 
                      />
                    </TableCell>
                    <TableCell>{formatDate(ticket.createdAt)}</TableCell>
                    <TableCell>
                      <Tooltip title="View Details">
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/admin-dashboard/tickets/${ticket._id}`);
                          }}
                        >
                          <SendIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
};

export default AdminTicketDashboard;