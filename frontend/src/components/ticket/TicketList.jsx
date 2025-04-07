import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Tab,
  Tabs,
  Chip,
  Card,
  CardContent,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Add as AddIcon,
  OpenInNew as OpenInNewIcon,
  Refresh as RefreshIcon,
  QuestionAnswer as QuestionAnswerIcon,
  CheckCircle as CheckCircleIcon,
  ErrorOutline as ErrorOutlineIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/authContext';

const TicketList = () => {
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [tabValue, setTabValue] = useState('all');
  const [error, setError] = useState('');
  const [ticketStats, setTicketStats] = useState({
    total: 0,
    open: 0,
    inProgress: 0,
    resolved: 0,
    closed: 0
  });
  
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch tickets based on current status filter
  const fetchTickets = async () => {
    setLoading(true);
    try {
      let url = `${config.API_URL}/api/tickets/my-tickets`;
      if (tabValue !== 'all') {
        url += `?status=${tabValue}`;
      }
      
      const response = await axios.get(url, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (response.data.success) {
        setTickets(response.data.tickets);
        
        // Calculate ticket statistics
        const stats = {
          total: response.data.count,
          open: 0,
          inProgress: 0,
          resolved: 0,
          closed: 0
        };
        
        response.data.tickets.forEach(ticket => {
          if (ticket.status === 'Open') stats.open++;
          else if (ticket.status === 'In Progress') stats.inProgress++;
          else if (ticket.status === 'Resolved') stats.resolved++;
          else if (ticket.status === 'Closed') stats.closed++;
        });
        
        setTicketStats(stats);
      }
    } catch (error) {
      console.error('Error fetching tickets:', error);
      setError('Failed to fetch tickets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchTickets();
  }, []);

  // Fetch tickets when tab changes
  useEffect(() => {
    fetchTickets();
  }, [tabValue]);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
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

  // Get status icon
  const getStatusIcon = (status) => {
    switch(status) {
      case 'Open': return <ErrorOutlineIcon color="info" />;
      case 'In Progress': return <AccessTimeIcon color="warning" />;
      case 'Resolved': return <CheckCircleIcon color="success" />;
      case 'Closed': return <CheckCircleIcon color="disabled" />;
      case 'Reopened': return <ErrorOutlineIcon color="error" />;
      default: return <QuestionAnswerIcon />;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
          My Tickets
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={fetchTickets}
            sx={{ mr: 2 }}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => navigate(`/${user.role}-dashboard/add-ticket`)}
          >
            Create New Ticket
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Tickets
              </Typography>
              <Typography variant="h4" component="div">
                {ticketStats.total}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Open
              </Typography>
              <Typography variant="h4" component="div" color="primary">
                {ticketStats.open}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                In Progress
              </Typography>
              <Typography variant="h4" component="div" color="warning.main">
                {ticketStats.inProgress}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Resolved
              </Typography>
              <Typography variant="h4" component="div" color="success.main">
                {ticketStats.resolved}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Closed
              </Typography>
              <Typography variant="h4" component="div" color="text.secondary">
                {ticketStats.closed}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="All Tickets" value="all" />
          <Tab label="Open" value="Open" />
          <Tab label="In Progress" value="In Progress" />
          <Tab label="Resolved" value="Resolved" />
          <Tab label="Closed" value="Closed" />
        </Tabs>
      </Paper>

      {/* Tickets List */}
      <Paper>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : tickets.length === 0 ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
            <Typography variant="h6" color="textSecondary" sx={{ mb: 2 }}>
              No tickets found
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/${user.role}-dashboard/add-ticket`)}
            >
              Create New Ticket
            </Button>
          </Box>
        ) : (
          <List sx={{ width: '100%' }}>
            {tickets.map((ticket) => (
              <React.Fragment key={ticket._id}>
                <ListItem
                  alignItems="flex-start"
                  button
                  onClick={() => navigate(`/${user.role}-dashboard/tickets/${ticket._id}`)}
                >
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', width: '100%' }}>
                    <Box sx={{ mr: 2, mt: 1 }}>
                      {getStatusIcon(ticket.status)}
                    </Box>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Typography variant="h6" component="span">
                            {ticket.title}
                          </Typography>
                          <Chip 
                            label={ticket.status} 
                            size="small" 
                            color={getStatusColor(ticket.status)} 
                            sx={{ ml: 2 }}
                          />
                          <Chip 
                            label={ticket.priority} 
                            size="small" 
                            color={getPriorityColor(ticket.priority)} 
                            sx={{ ml: 1 }}
                          />
                          <Chip 
                            label={ticket.type} 
                            size="small" 
                            variant="outlined"
                            sx={{ ml: 1 }}
                          />
                        </Box>
                      }
                      secondary={
                        <React.Fragment>
                          <Typography
                            sx={{ display: 'inline' }}
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            Created: {formatDate(ticket.createdAt)}
                          </Typography>
                          {ticket.responses && ticket.responses.length > 0 && (
                            <Typography component="span" variant="body2" sx={{ ml: 2 }}>
                              {ticket.responses.length} {ticket.responses.length === 1 ? 'response' : 'responses'}
                            </Typography>
                          )}
                          <Typography
                            component="div"
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 1 }}
                          >
                            {ticket.description.substring(0, 150)}
                            {ticket.description.length > 150 ? '...' : ''}
                          </Typography>
                        </React.Fragment>
                      }
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title="View Ticket">
                        <IconButton 
                          edge="end" 
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/${user.role}-dashboard/tickets/${ticket._id}`);
                          }}
                        >
                          <OpenInNewIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </Box>
                </ListItem>
                <Divider component="li" />
              </React.Fragment>
            ))}
          </List>
        )}
      </Paper>
    </Box>
  );
};

export default TicketList;