// Create a new file: src/components/shared/ErrorBoundary.jsx
import React from 'react';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Paper,
  Divider
} from '@mui/material';
import { SentimentVeryDissatisfied as SadIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // You could log the error to a service here
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Container maxWidth="md" sx={{ py: 8 }}>
          <Paper
            elevation={2}
            sx={{
              p: 4,
              borderRadius: 2,
              textAlign: 'center'
            }}
          >
            <SadIcon sx={{ fontSize: 80, color: 'warning.main', mb: 2 }} />
            
            <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
              Something went wrong
            </Typography>
            
            <Typography variant="body1" color="text.secondary" paragraph>
              We're sorry, but an unexpected error occurred. Our team has been notified.
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 4 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
              
              <Button
                variant="outlined"
                color="primary"
                onClick={() => window.location.href = '/'}
              >
                Go to Homepage
              </Button>
            </Box>
            
            <Divider sx={{ my: 3 }} />
            
            {process.env.NODE_ENV === 'development' && (
              <Box sx={{ textAlign: 'left', mt: 3 }}>
                <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                  Error Details (Development Only):
                </Typography>
                <Box
                  component="pre"
                  sx={{
                    p: 2,
                    bgcolor: 'grey.100',
                    borderRadius: 1,
                    overflow: 'auto',
                    fontSize: '0.75rem',
                    color: 'error.main'
                  }}
                >
                  {this.state.error && this.state.error.toString()}
                  <Box component="div" sx={{ mt: 1, color: 'text.secondary' }}>
                    {this.state.errorInfo && this.state.errorInfo.componentStack}
                  </Box>
                </Box>
              </Box>
            )}
          </Paper>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;