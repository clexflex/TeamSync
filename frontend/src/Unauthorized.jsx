import React from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Container
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';

const Unauthorized = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'grey.50'
      }}
    >
      <Container maxWidth="sm">
        <Box sx={{ textAlign: 'center' }}>
          <LockIcon
            sx={{
              fontSize: 64,
              color: 'error.main',
              mb: 3
            }}
          />
          
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 'bold',
              mb: 2
            }}
          >
            Access Denied
          </Typography>

          <Typography
            variant="h6"
            color="text.secondary"
            sx={{ mb: 4 }}
          >
            You do not have permission to access this page.
          </Typography>

          <Button
            component={Link}
            to="/login"
            variant="contained"
            size="large"
          >
            Return to Login
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Unauthorized;