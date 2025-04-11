import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Divider,
  Tab,
  Tabs,
  CircularProgress,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  MarkEmailRead as MarkReadIcon,
  DeleteSweep as ClearAllIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import { useNotifications } from '../../context/notificationContext';
import NotificationList from './NotificationList';

const NotificationsPage = () => {
  const { loading, unreadCount, fetchNotifications, markAllAsRead, clearAllNotifications } = useNotifications();
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleRefresh = () => {
    fetchNotifications();
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    clearAllNotifications();
  };

  return (
    <Paper elevation={0} sx={{ p: 3, height: '100%' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" fontWeight="bold" color="text.primary">
          Notifications
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Refresh">
            <IconButton onClick={handleRefresh} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Mark all as read">
            <IconButton 
              onClick={handleMarkAllRead} 
              color="primary"
              disabled={loading || unreadCount === 0}
            >
              <MarkReadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear all notifications">
            <IconButton 
              onClick={handleClearAll} 
              color="error"
              disabled={loading}
            >
              <ClearAllIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>

      <Tabs
        value={tabValue}
        onChange={handleTabChange}
        sx={{ mb: 3, borderBottom: 1, borderColor: 'divider' }}
      >
        <Tab label="All" />
        <Tab label={`Unread (${unreadCount})`} />
      </Tabs>

      <Paper variant="outlined" sx={{ p: 0, minHeight: 400 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
            <CircularProgress />
          </Box>
        ) : (
          <NotificationList />
        )}
      </Paper>
    </Paper>
  );
};

export default NotificationsPage;