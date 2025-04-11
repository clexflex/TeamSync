import React, { useState } from 'react';
import { Badge, IconButton, Box, Menu, Typography, Divider } from '@mui/material';
import { Notifications as NotificationsIcon } from '@mui/icons-material';
import { useNotifications } from '../../context/notificationContext';
import NotificationList from './NotificationList';

const NotificationBell = () => {
  const { unreadCount, markAllAsRead, clearAllNotifications } = useNotifications();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  const handleClearAll = () => {
    clearAllNotifications();
    handleClose();
  };

  return (
    <>
      <IconButton
        aria-label="notifications"
        onClick={handleClick}
        sx={{ 
          position: 'relative',
          marginRight: 1,
          color: 'text.primary', // Use text.primary for better visibility
          '&:hover': {
            backgroundColor: 'action.hover'
          }
        }}
      >
        <Badge 
          badgeContent={unreadCount} 
          color="error" 
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              right: -3,
              top: 3,
              border: (theme) => `2px solid ${theme.palette.background.paper}`,
              padding: '0 4px',
            }
          }}
        >
          <NotificationsIcon color="action" />
        </Badge>
      </IconButton>
      
      {/* Rest of the component remains the same */}
      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 350,
            maxWidth: 400,
            maxHeight: 500,
            overflow: 'hidden',
            borderRadius: 2,
            mt: 1
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Notifications
          </Typography>
          <Box>
            <Typography 
              variant="caption" 
              color="primary" 
              sx={{ cursor: 'pointer', mr: 2 }}
              onClick={handleMarkAllRead}
            >
              Mark all as read
            </Typography>
            <Typography 
              variant="caption" 
              color="error" 
              sx={{ cursor: 'pointer' }}
              onClick={handleClearAll}
            >
              Clear all
            </Typography>
          </Box>
        </Box>
        
        <Divider />
        
        <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
          <NotificationList small onNotificationClick={handleClose} />
        </Box>
      </Menu>
    </>
  );
};

export default NotificationBell;