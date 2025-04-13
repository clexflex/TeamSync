import React from 'react';
import { 
  Box, 
  List, 
  ListItem, 
  ListItemText, 
  ListItemAvatar, 
  Avatar, 
  Typography, 
  IconButton, 
  Divider, 
  Paper, 
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Cake as BirthdayIcon,
  Work as WorkAnniversaryIcon,
  LocalActivity as LeaveIcon,
  AccessTime as AttendanceIcon,
  Description as DocumentIcon,
  Task as TaskIcon,
  Info as InfoIcon,
  Delete as DeleteIcon,
  Circle as UnreadIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../context/notificationContext';
import { formatDistanceToNow } from 'date-fns';

const NotificationList = ({ small = false, onNotificationClick }) => {
  const { notifications, loading, markAsRead, deleteNotification } = useNotifications();
  const navigate = useNavigate();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'birthday':
        return <BirthdayIcon />;
      case 'work_anniversary':
        return <WorkAnniversaryIcon />;
      case 'leave_request':
        return <LeaveIcon />;
      case 'attendance':
        return <AttendanceIcon />;
      case 'document':
        return <DocumentIcon />;
      case 'task':
        return <TaskIcon />;
      default:
        return <InfoIcon />;
    }
  };

  const getIconColor = (type) => {
    switch (type) {
      case 'birthday':
        return '#F06292'; // Pink
      case 'work_anniversary':
        return '#5C6BC0'; // Indigo
      case 'leave_request':
        return '#FFA726'; // Orange
      case 'attendance':
        return '#66BB6A'; // Green
      case 'document':
        return '#42A5F5'; // Blue
      case 'task':
        return '#7E57C2'; // Purple
      default:
        return '#78909C'; // Blue Gray
    }
  };

  const handleNotificationClick = (notification) => {
    // If the notification isn't read, mark it as read
    if (!notification.isRead) {
      markAsRead(notification._id);
    }
    
    // Handle navigation based on notification type and related model
    if (notification.relatedTo && notification.relatedTo.model) {
      const { model, id } = notification.relatedTo;
      
      switch (model) {
        default:
          // No specific navigation
          break;
      }
    }
    
    // Close dropdown if specified
    if (onNotificationClick) {
      onNotificationClick();
    }
  };

  const handleDelete = (e, id) => {
    e.stopPropagation(); // Prevent triggering the parent click
    deleteNotification(id);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (notifications.length === 0) {
    return (
      <Box sx={{ p: small ? 2 : 3 }}>
        <Alert severity="info">No notifications to display</Alert>
      </Box>
    );
  }

  return (
    <List disablePadding>
      {notifications.map((notification, index) => (
        <React.Fragment key={notification._id}>
          <ListItem
            alignItems="flex-start"
            button
            onClick={() => handleNotificationClick(notification)}
            dense={small}
            sx={{
              bgcolor: notification.isRead ? 'transparent' : 'action.hover',
              py: small ? 1 : 1.5,
              px: small ? 2 : 3
            }}
            secondaryAction={
              <IconButton 
                edge="end" 
                aria-label="delete" 
                size="small"
                onClick={(e) => handleDelete(e, notification._id)}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            }
          >
            <ListItemAvatar>
              <Avatar sx={{ bgcolor: getIconColor(notification.type) }}>
                {getNotificationIcon(notification.type)}
              </Avatar>
            </ListItemAvatar>
            <ListItemText
              primary={
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography
                    variant={small ? "body2" : "subtitle1"}
                    fontWeight={notification.isRead ? 'normal' : 'bold'}
                    sx={{ flex: 1, pr: 1 }}
                  >
                    {notification.title}
                  </Typography>
                  {!notification.isRead && (
                    <UnreadIcon 
                      sx={{ 
                        color: 'primary.main', 
                        fontSize: 'small',
                        ml: 1
                      }} 
                    />
                  )}
                </Box>
              }
              secondary={
                <>
                  <Typography
                    component="span"
                    variant={small ? "caption" : "body2"}
                    color="text.primary"
                    sx={{ display: 'block', mb: 0.5 }}
                  >
                    {notification.message}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                  </Typography>
                </>
              }
            />
          </ListItem>
          {index < notifications.length - 1 && <Divider variant="inset" component="li" />}
        </React.Fragment>
      ))}
    </List>
  );
};

export default NotificationList;