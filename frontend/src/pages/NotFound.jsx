import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import {
  Box,
  Typography,
  Button,
  Container,
  SvgIcon
} from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const handleNavigateBack = () => {
    if (user) {
      let dashboard;
      if (user.role === "admin") dashboard = "/admin-dashboard";
      else if (user.role === "manager") dashboard = "/manager-dashboard";
      else dashboard = "/employee-dashboard";
  
      navigate(dashboard);
    } else {
      navigate("/login");
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.50',
        py: 6,
        px: 2
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center' }}>
          <ErrorOutlineIcon
            sx={{
              fontSize: 96,
              color: 'primary.main',
              mb: 4
            }}
          />

          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 'bold',
              mb: 2
            }}
          >
            Page Not Found
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 1 }}
          >
            Oops! The page you're looking for doesn't exist.
          </Typography>

          <Typography
            variant="body1"
            sx={{
              mb: 4,
              color: 'text.secondary',
              '& .url': {
                bgcolor: 'grey.100',
                px: 1,
                py: 0.5,
                borderRadius: 1,
                fontFamily: 'monospace',
                fontSize: '0.875rem'
              }
            }}
          >
            The URL <span className="url">{location.pathname}</span> could not be found.
          </Typography>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Button
              variant="contained"
              size="large"
              fullWidth
              onClick={handleNavigateBack}
            >
              Return to Dashboard
            </Button>
            
            <Button
              variant="outlined"
              size="large"
              fullWidth
              onClick={() => navigate(-1)}
            >
              Go Back
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default NotFound;