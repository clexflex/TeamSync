// Create a new file: src/components/shared/AppLoader.jsx
import React from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const AppLoader = () => {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        bgcolor: 'background.default'
      }}
    >
      <Box
        sx={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 3
        }}
      >
        <CircularProgress
          size={60}
          thickness={4}
          sx={{ color: 'primary.main' }}
        />
        <Box
          sx={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: '100%'
          }}
        >
          <Typography
            variant="h5"
            component="span"
            sx={{
              fontWeight: 'bold',
              color: 'primary.main'
            }}
          >
            TS
          </Typography>
        </Box>
      </Box>
      <Typography
        variant="h6"
        sx={{
          fontWeight: 600,
          color: 'primary.main'
        }}
      >
        TeamSync
      </Typography>
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mt: 1 }}
      >
        Loading your experience...
      </Typography>
    </Box>
  );
};

export default AppLoader;