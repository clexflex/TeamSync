import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/authContext';
import { useNavigate, useLocation } from 'react-router-dom';
import config from '../config';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  FormControlLabel,
  Checkbox,
  Alert,
  CircularProgress,
  useTheme,
  useMediaQuery
} from '@mui/material';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberEmail: false
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg'));

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    if (rememberedEmail) {
      setFormData(prev => ({
        ...prev,
        email: rememberedEmail,
        rememberEmail: true
      }));
    }
    setError(null);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (error) setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `${config.API_URL}/api/auth/login`,
        { email: formData.email, password: formData.password },
        { withCredentials: true }
      );

      if (response.data.success) {
        if (formData.rememberEmail) {
          localStorage.setItem('rememberedEmail', formData.email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        localStorage.setItem('token', response.data.token);
        login(response.data.user);

        const redirectPath =
          response.data.user.role === "admin"
            ? "/admin-dashboard"
            : response.data.user.role === "manager"
              ? "/manager-dashboard"
              : "/employee-dashboard";

        const intendedPath = location.state?.from || redirectPath;
        navigate(intendedPath, { replace: true });
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error ||
        'Unable to connect to the server. Please try again later.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        bgcolor: 'grey.50'
      }}
    >
      {!isMobile && (
        <Box
          sx={{
            flex: 1,
            bgcolor: 'primary.main',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Box sx={{ textAlign: 'center', color: 'white' }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold' }}>
              TeamSync
            </Typography>
            <Typography variant="h6" sx={{ mt: 2, color: 'primary.light' }}>
              Streamline Your Workforce Management
            </Typography>
            <Box sx={{ mt: 4, width: 64, height: 4, bgcolor: 'primary.light', mx: 'auto', borderRadius: 2 }} />
          </Box>
        </Box>
      )}

      <Box
        sx={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4
        }}
      >
        <Container maxWidth="sm">
          {isMobile && (
            <Typography
              variant="h4"
              component="h1"
              color="primary"
              sx={{ textAlign: 'center', mb: 4, fontWeight: 'bold' }}
            >
              TeamSync
            </Typography>
          )}

          <Paper elevation={isMobile ? 1 : 0} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 4, fontWeight: 'bold' }}>
              Sign in to your account
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                id="email"
                name="email"
                type="email"
                label="Email Address"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                placeholder="name@company.com"
                sx={{ mb: 3 }}
              />

              <TextField
                fullWidth
                id="password"
                name="password"
                type="password"
                label="Password"
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                sx={{ mb: 3 }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    name="rememberEmail"
                    checked={formData.rememberEmail}
                    onChange={handleChange}
                    color="primary"
                  />
                }
                label="Remember email"
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={isLoading}
                sx={{
                  py: 1.5,
                  position: 'relative'
                }}
              >
                {isLoading ? (
                  <>
                    <CircularProgress
                      size={24}
                      sx={{
                        position: 'absolute',
                        left: '50%',
                        marginLeft: '-12px'
                      }}
                    />
                    Signing in...
                  </>
                ) : 'Sign In'}
              </Button>
            </form>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
};

export default Login;