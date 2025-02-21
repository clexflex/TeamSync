import React, { useState } from 'react';
import {
  Box, IconButton, Avatar, Menu, MenuItem, ListItemIcon,
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, Alert, Typography, Divider
} from '@mui/material';
import {
  Logout as LogoutIcon,
  Person as PersonIcon,
  Save as SaveIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../context/authContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import config from '../config';

const UserMenu = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [profileDialogOpen, setProfileDialogOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleProfileOpen = () => {
    setProfileData({
      name: user?.name || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setProfileDialogOpen(true);
    setAnchorEl(null);
    setError('');
    setSuccess('');
  };

  const handleProfileSave = async () => {
    if (!profileData.currentPassword) {
      setError('Current password is required');
      return;
    }

    if (profileData.newPassword !== profileData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const response = await axios.put(
        `${config.API_URL}/api/setting/change-password`,
        {
          userId: user._id,
          oldPassword: profileData.currentPassword,
          newPassword: profileData.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        setSuccess('Profile updated successfully');
        setTimeout(() => {
          setSuccess('');
          setProfileDialogOpen(false);
        }, 2000);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Error updating profile');
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography 
          variant="subtitle1" 
          color="text.secondary"
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          Welcome, {user?.name}
        </Typography>
        
        <IconButton
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{ p: 0.5 }}
        >
          <Avatar 
            sx={{ 
              bgcolor: 'primary.main',
              width: 40,
              height: 40,
              fontWeight: 600
            }}
          >
            {user?.name?.charAt(0)}
          </Avatar>
        </IconButton>
      </Box>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        PaperProps={{
          elevation: 3,
          sx: {
            minWidth: 200,
            mt: 1,
            '& .MuiMenuItem-root': {
              py: 1.5
            }
          }
        }}
      >
        <MenuItem onClick={handleProfileOpen}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          Edit Profile
        </MenuItem>
        <Divider />
        <MenuItem onClick={() => {
          setAnchorEl(null);
          setLogoutDialogOpen(true);
        }}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Profile Dialog */}
      <Dialog 
        open={profileDialogOpen}
        onClose={() => setProfileDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ 
          pb: 2,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Typography variant="h6" component="div">
            Edit Profile
          </Typography>
          <IconButton
            onClick={() => setProfileDialogOpen(false)}
            size="small"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {error && (
              <Alert severity="error" onClose={() => setError('')}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" onClose={() => setSuccess('')}>
                {success}
              </Alert>
            )}
            
            <TextField
              label="Name"
              value={profileData.name}
              onChange={(e) => setProfileData({...profileData, name: e.target.value})}
              fullWidth
              variant="outlined"
            />

            <Typography variant="subtitle1" color="text.secondary" sx={{ pt: 2 }}>
              Change Password
            </Typography>

            <TextField
              label="Current Password"
              type="password"
              value={profileData.currentPassword}
              onChange={(e) => setProfileData({...profileData, currentPassword: e.target.value})}
              fullWidth
              required
            />
            <TextField
              label="New Password"
              type="password"
              value={profileData.newPassword}
              onChange={(e) => setProfileData({...profileData, newPassword: e.target.value})}
              fullWidth
            />
            <TextField
              label="Confirm New Password"
              type="password"
              value={profileData.confirmPassword}
              onChange={(e) => setProfileData({...profileData, confirmPassword: e.target.value})}
              fullWidth
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => setProfileDialogOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleProfileSave}
            variant="contained"
            startIcon={<SaveIcon />}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Logout Dialog */}
      <Dialog
        open={logoutDialogOpen}
        onClose={() => setLogoutDialogOpen(false)}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Confirm Logout
        </DialogTitle>
        <DialogContent>
          <Typography color="text.secondary">
            Are you sure you want to logout? You will need to sign back in to continue.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={() => setLogoutDialogOpen(false)}
            color="inherit"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => {
              logout();
              navigate('/login');
              setLogoutDialogOpen(false);
            }}
            variant="contained"
            color="primary"
          >
            Logout
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UserMenu;