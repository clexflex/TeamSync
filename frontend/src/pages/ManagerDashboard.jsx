import React, { useState } from 'react';
import { Box, CssBaseline, AppBar, Toolbar, IconButton, Typography, 
         Drawer, List, ListItemButton, ListItemIcon, ListItemText, 
         useTheme, useMediaQuery } from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Groups as TeamIcon,
  EventNote as AttendanceIcon,
  AssignmentTurnedIn as ApprovalIcon,
  CalendarToday as LeaveIcon,
  AttachMoney as SalaryIcon,
  Person as ProfileIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import { Outlet, useNavigate, NavLink } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import UserMenu from './UserMenu';

const drawerWidth = 280;

const ManagerDashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user } = useAuth();

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/manager-dashboard' },
    { text: 'My Profile', icon: <ProfileIcon />, path: `/manager-dashboard/user-profile/${user?._id}` },
    { text: 'Manage Teams', icon: <TeamIcon />, path: '/manager-dashboard/team' },
    { text: 'Attendance', icon: <AttendanceIcon />, path: '/manager-dashboard/attendance-form' },
    { text: 'Employee Attendance', icon: <ApprovalIcon />, path: '/manager-dashboard/attendance-approval' },
    { text: 'Leave', icon: <LeaveIcon />, path: `/manager-dashboard/leaves/${user?._id}` },
    { text: 'Salary', icon: <SalaryIcon />, path: `/manager-dashboard/salary/${user?._id}` },
      ];

  const drawer = (
    <Box>
      <Box sx={{ 
        p: 3,
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderBottom: 1,
        borderColor: 'divider'
      }}>
        <Typography 
          variant="h5" 
          color="primary" 
          sx={{ 
            fontWeight: 700,
            letterSpacing: 0.5
          }}
        >
          TeamSync
        </Typography>
      </Box>
      <List sx={{ p: 2 }}>
        {menuItems.map((item) => (
          <ListItemButton
            key={item.text}
            component={NavLink}
            to={item.path}
            onClick={() => isMobile && setMobileOpen(false)}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              '&.active': {
                bgcolor: 'primary.soft',
                color: 'primary.main',
                '& .MuiListItemIcon-root': {
                  color: 'primary.main',
                },
              },
              '&:hover': {
                bgcolor: 'grey.50',
              },
            }}
          >
            <ListItemIcon sx={{ 
              minWidth: 40,
              color: 'grey.600',
            }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text}
              primaryTypographyProps={{ 
                fontSize: 14,
                fontWeight: 600
              }}
            />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', bgcolor: 'grey.50', minHeight: '100vh' }}>
      <CssBaseline />
      
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${drawerWidth}px)` },
          ml: { md: `${drawerWidth}px` },
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider'
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <IconButton
            onClick={() => setMobileOpen(!mobileOpen)}
            sx={{ display: { md: 'none' }, color: 'grey.600' }}
            edge="start"
          >
            <MenuIcon />
          </IconButton>
          
          <Typography 
            variant="h6" 
            color="text.primary" 
            sx={{ 
              fontWeight: 600,
              display: { xs: 'none', sm: 'block' }
            }}
          >
            Manager Dashboard
          </Typography>
          
          <UserMenu />
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', md: 'none' },
            '& .MuiDrawer-paper': { 
              width: drawerWidth,
              bgcolor: 'background.paper',
              boxSizing: 'border-box',
            },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', md: 'block' },
            '& .MuiDrawer-paper': { 
              width: drawerWidth,
              bgcolor: 'background.paper',
              boxSizing: 'border-box',
              borderRight: 1,
              borderColor: 'divider'
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { md: `calc(100% - ${drawerWidth}px)` },
          mt: 8
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default ManagerDashboard;