import React, { useState, useEffect } from 'react';
import { 
  Box, Container, Typography, Button, Grid, Card, CardContent, 
  AppBar, Toolbar, IconButton, useTheme, useMediaQuery,
  Drawer, List, ListItem, ListItemText, Divider, 
  Paper, Fade, Slide, Chip
} from '@mui/material';
import { 
  Menu as MenuIcon,
  Close as CloseIcon,
  AccessTime as TimeIcon,
  EventNote as LeaveIcon,
  AttachMoney as SalaryIcon,
  People as TeamIcon,
  Folder as DocumentIcon,
  NotificationsActive as NotificationIcon,
  Business as CompanyIcon,
  ArrowForward as ArrowIcon,
  Login as LoginIcon
} from '@mui/icons-material';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';

// Core features of TeamSync
const coreFeatures = [
  {
    id: 'attendance',
    title: 'Attendance Management',
    icon: <TimeIcon sx={{ fontSize: 32 }} />,
    description: 'Precise attendance tracking with geolocation, automated credit calculations, and detailed analytics.',
    color: '#007AFF' // Apple blue
  },
  {
    id: 'leave',
    title: 'Leave Management',
    icon: <LeaveIcon sx={{ fontSize: 32 }} />,
    description: 'Streamlined leave applications with automatic balance tracking, approvals, and integration with payroll.',
    color: '#FF2D55' // Apple pink
  },
  {
    id: 'payroll',
    title: 'Salary Processing',
    icon: <SalaryIcon sx={{ fontSize: 32 }} />,
    description: 'Automated salary calculations based on attendance credits with comprehensive payslip generation.',
    color: '#5856D6' // Apple purple
  },
  {
    id: 'team',
    title: 'Team Organization',
    icon: <TeamIcon sx={{ fontSize: 32 }} />,
    description: 'Effective department and team management with streamlined approval workflows and hierarchy.',
    color: '#34C759' // Apple green
  },
  {
    id: 'documents',
    title: 'Document Center',
    icon: <DocumentIcon sx={{ fontSize: 32 }} />,
    description: 'Centralized repository for company policies, forms, and personal documents with role-based access.',
    color: '#FF9500' // Apple orange
  },
  {
    id: 'notifications',
    title: 'Smart Notifications',
    icon: <NotificationIcon sx={{ fontSize: 32 }} />,
    description: 'Real-time updates for approvals, submissions, and important company announcements.',
    color: '#AF52DE' // Apple purple alt
  }
];

const LandingPage = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentSection, setCurrentSection] = useState('hero');
  
  // Handle scroll events for navbar appearance and section detection
  useEffect(() => {
    const handleScroll = () => {
      // Navbar appearance
      setScrolled(window.scrollY > 50);
      
      // Section detection
      const sections = ['hero', 'features', 'roles', 'platform'];
      const currentPosition = window.scrollY + window.innerHeight / 2;
      
      for (const section of sections) {
        const element = document.getElementById(section);
        if (element) {
          const { top, bottom } = element.getBoundingClientRect();
          const offset = element.offsetTop;
          
          if (currentPosition >= offset && currentPosition <= offset + element.offsetHeight) {
            setCurrentSection(section);
            break;
          }
        }
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  // Determine which dashboard to navigate to based on user role
  const navigateToDashboard = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    switch (user.role) {
      case 'admin':
        navigate('/admin-dashboard');
        break;
      case 'manager':
        navigate('/manager-dashboard');
        break;
      case 'employee':
        navigate('/employee-dashboard');
        break;
      default:
        navigate('/login');
    }
  };
  
  // Redirect if user is already logged in and has accessed the app before
  useEffect(() => {
    const hasUsedApp = localStorage.getItem('hasUsedTeamSync');
    if (user && hasUsedApp) {
      navigateToDashboard();
    }
  }, [user]);
  
  // Navigation items
  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'Platform', href: '#platform' },
    { name: 'Roles', href: '#roles' },
    { name: 'Documentation', href: '/documentation' }
  ];
  
  // Core Feature Card Component
  const FeatureCard = ({ title, description, icon, color }) => (
    <Card 
      sx={{ 
        height: '100%',
        borderRadius: 4,
        border: 'none',
        boxShadow: '0 4px 30px rgba(0,0,0,0.05)',
        transition: 'transform 0.3s, box-shadow 0.3s',
        overflow: 'visible',
        position: 'relative',
        '&:hover': {
          transform: 'translateY(-8px)',
          boxShadow: '0 10px 40px rgba(0,0,0,0.1)'
        },
        display: 'flex',
        flexDirection: 'column'
      }}
      elevation={0}
    >
      <Box 
        sx={{ 
          position: 'absolute',
          top: -20,
          left: 20,
          width: 56,
          height: 56,
          borderRadius: 3,
          backgroundColor: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
        }}
      >
        {icon}
      </Box>
      <CardContent sx={{ pt: 5, px: 3, pb: 3, flexGrow: 1 }}>
        <Typography variant="h5" component="h3" fontWeight={600} gutterBottom pt={1}>
          {title}
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.7 }}>
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
  
  // Role Feature Item
  const RoleFeature = ({ icon, title, items, bgColor }) => (
    <Paper
      elevation={0}
      sx={{
        p: 4,
        borderRadius: 4,
        height: '100%',
        backgroundColor: bgColor,
        transition: 'transform 0.3s',
        '&:hover': {
          transform: 'translateY(-8px)',
        },
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Box
          sx={{
            mr: 2,
            p: 1.5,
            borderRadius: 2,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
          }}
        >
          {icon}
        </Box>
        <Typography variant="h5" fontWeight={600}>
          {title}
        </Typography>
      </Box>
      <Box component="ul" sx={{ pl: 4, mb: 0 }}>
        {items.map((item, index) => (
          <Typography 
            component="li" 
            variant="body1" 
            key={index} 
            sx={{ 
              mb: 1.5,
              color: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            {item}
          </Typography>
        ))}
      </Box>
    </Paper>
  );

  return (
    <Box sx={{ overflow: 'hidden' }}>
      {/* Header/Navbar */}
      <AppBar 
        position="fixed" 
        elevation={scrolled ? 1 : 0} 
        sx={{ 
          backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.9)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid rgba(0, 0, 0, 0.05)' : 'none',
          transition: 'all 0.3s ease',
          color: scrolled ? 'text.primary' : 'white'
        }}
      >
        <Container maxWidth="xl">
          <Toolbar 
            sx={{ 
              py: { xs: 1.5, md: 1 }, 
              px: { xs: 1, md: 2 },
              justifyContent: 'space-between'
            }}
            disableGutters
          >
            {/* Logo */}
            <Box 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                cursor: 'pointer'
              }}
              component={RouterLink}
              to="/"
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <CompanyIcon 
                sx={{ 
                  mr: 1.5, 
                  fontSize: 28,
                  color: scrolled ? 'primary.main' : 'white'
                }} 
              />
              <Typography 
                variant="h5" 
                component="div" 
                fontWeight={600}
                letterSpacing={-0.5}
                sx={{ 
                  color: scrolled ? 'text.primary' : 'white'
                }}
              >
                TeamSync
              </Typography>
            </Box>
            
            {/* Desktop Navigation */}
            {!isMobile && (
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                {navItems.map((item, index) => (
                  <Button
                    key={index}
                    component="a"
                    href={item.href}
                    sx={{ 
                      mx: 1,
                      color: scrolled ? 'text.primary' : 'white',
                      fontWeight: 500,
                      fontSize: '0.95rem',
                      opacity: 0.9,
                      '&:hover': {
                        opacity: 1,
                        backgroundColor: 'transparent'
                      }
                    }}
                  >
                    {item.name}
                  </Button>
                ))}
                
                {user ? (
                  <Button
                    onClick={navigateToDashboard}
                    variant="contained"
                    disableElevation
                    sx={{ 
                      ml: 2, 
                      px: 3,
                      py: 1,
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      backgroundColor: scrolled ? 'primary.main' : 'white',
                      color: scrolled ? 'white' : 'primary.main',
                      '&:hover': {
                        backgroundColor: scrolled ? 'primary.dark' : '#f0f0f0'
                      }
                    }}
                  >
                    Dashboard
                  </Button>
                ) : (
                  <Button
                    component={RouterLink}
                    to="/login"
                    variant="contained"
                    disableElevation
                    startIcon={<LoginIcon />}
                    sx={{ 
                      ml: 2, 
                      px: 3,
                      py: 1,
                      borderRadius: '12px',
                      textTransform: 'none',
                      fontWeight: 600,
                      backgroundColor: scrolled ? 'primary.main' : 'white',
                      color: scrolled ? 'white' : 'primary.main',
                      '&:hover': {
                        backgroundColor: scrolled ? 'primary.dark' : '#f0f0f0'
                      }
                    }}
                  >
                    Login
                  </Button>
                )}
              </Box>
            )}
            
            {/* Mobile Navigation Icon */}
            {isMobile && (
              <IconButton 
                edge="end" 
                color="inherit" 
                aria-label="menu"
                onClick={() => setMenuOpen(true)}
                sx={{ p: 1 }}
              >
                <MenuIcon sx={{ fontSize: 28 }} />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Mobile Menu Drawer */}
      <Drawer
        anchor="right"
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        PaperProps={{
          sx: { 
            width: '100%', 
            maxWidth: 350,
            px: 2
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          py: 2
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CompanyIcon sx={{ mr: 1, fontSize: 28, color: 'primary.main' }} />
            <Typography variant="h6" fontWeight={600}>
              TeamSync
            </Typography>
          </Box>
          <IconButton onClick={() => setMenuOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider sx={{ mb: 2 }} />
        <List>
          {navItems.map((item, index) => (
            <ListItem
              key={index}
              component="a"
              href={item.href}
              onClick={() => setMenuOpen(false)}
              sx={{ 
                py: 2,
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'rgba(0, 0, 0, 0.04)'
                }
              }}
            >
              <ListItemText 
                primary={item.name} 
                primaryTypographyProps={{ 
                  fontWeight: 500,
                  fontSize: '1.1rem'
                }}
              />
            </ListItem>
          ))}
          <ListItem sx={{ mt: 2 }}>
            {user ? (
              <Button
                onClick={() => {
                  setMenuOpen(false);
                  navigateToDashboard();
                }}
                variant="contained"
                disableElevation
                fullWidth
                sx={{ 
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Go to Dashboard
              </Button>
            ) : (
              <Button
                component={RouterLink}
                to="/login"
                variant="contained"
                disableElevation
                fullWidth
                startIcon={<LoginIcon />}
                sx={{ 
                  py: 1.5,
                  borderRadius: '12px',
                  textTransform: 'none',
                  fontWeight: 600
                }}
              >
                Login
              </Button>
            )}
          </ListItem>
        </List>
      </Drawer>
      
      {/* Hero Section */}
      <Box 
        id="hero"
        sx={{ 
          pt: { xs: 15, md: 20 },
          pb: { xs: 12, md: 16 },
          minHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(120deg, #1a237e 0%, #3949ab 100%)',
          color: 'white',
          zIndex: 0
        }}
      >
        {/* Abstract shapes in background */}
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: -1,
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              width: '300px',
              height: '300px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
              top: '20%',
              left: '10%'
            },
            '&::after': {
              content: '""',
              position: 'absolute',
              width: '500px',
              height: '500px',
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 70%)',
              bottom: '-10%',
              right: '-5%'
            }
          }}
        />
        
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={7}>
              <Box sx={{ position: 'relative', zIndex: 1 }}>
                <Fade in={true} timeout={1000}>
                  <Box>
                    <Chip 
                      label="Employee Management System" 
                      sx={{ 
                        mb: 3, 
                        fontWeight: 500, 
                        color: 'white',
                        backgroundColor: 'rgba(255, 255, 255, 0.15)'
                      }} 
                    />
                    <Typography 
                      component="h1" 
                      variant="h2" 
                      fontWeight={700} 
                      sx={{ 
                        mb: 3,
                        letterSpacing: '-1px',
                        lineHeight: 1.1,
                        fontSize: { xs: '2.5rem', sm: '3rem', md: '3.75rem' }
                      }}
                    >
                      Streamline Your Workforce Management
                    </Typography>
                    <Typography 
                      variant="h5" 
                      sx={{ 
                        mb: 6, 
                        fontWeight: 400, 
                        maxWidth: '85%',
                        lineHeight: 1.5,
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        opacity: 0.9
                      }}
                    >
                      A powerful platform designed for Maximize Market Research to simplify attendance tracking, leave management, and salary processing.
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                      <Button
                        variant="contained"
                        size="large"
                        onClick={navigateToDashboard}
                        sx={{ 
                          px: 4, 
                          py: 1.5,
                          bgcolor: 'white',
                          color: 'primary.main',
                          borderRadius: '14px',
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '1rem',
                          '&:hover': {
                            bgcolor: 'rgba(255, 255, 255, 0.9)'
                          }
                        }}
                      >
                        {user ? 'Go to Dashboard' : 'Get Started'} <ArrowIcon sx={{ ml: 1 }} />
                      </Button>
                      <Button
                        variant="outlined"
                        size="large"
                        component={RouterLink}
                        to="/documentation"
                        sx={{ 
                          px: 4, 
                          py: 1.5,
                          color: 'white',
                          borderColor: 'rgba(255, 255, 255, 0.5)',
                          borderRadius: '14px',
                          textTransform: 'none',
                          fontWeight: 600,
                          fontSize: '1rem',
                          '&:hover': {
                            borderColor: 'white',
                            backgroundColor: 'rgba(255, 255, 255, 0.05)'
                          }
                        }}
                      >
                        Learn More
                      </Button>
                    </Box>
                  </Box>
                </Fade>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={5}>
              <Slide direction="left" in={true} timeout={700} mountOnEnter>
                <Box 
                  sx={{ 
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  {/* Mock device frame with dashboard screenshot */}
                  <Paper
                    elevation={24}
                    sx={{
                      borderRadius: '24px',
                      overflow: 'hidden',
                      width: '100%',
                      maxWidth: 380,
                      height: 'auto',
                      aspectRatio: '9/16',
                      position: 'relative',
                      border: '12px solid #333',
                      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)',
                      background: 'linear-gradient(to bottom, #f5f5f5, #fff)',
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '30%',
                        height: '4%',
                        backgroundColor: '#333',
                        borderBottomLeftRadius: '8px',
                        borderBottomRightRadius: '8px',
                        zIndex: 2
                      }
                    }}
                  >
                    {/* This would be an image in a real implementation */}
                    <Box 
                      sx={{ 
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      {/* Header bar */}
                      <Box sx={{ 
                        bgcolor: 'primary.main', 
                        color: 'white', 
                        p: 1.5,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}>
                        <Typography variant="subtitle1" fontWeight={600}>TeamSync</Typography>
                        <Box sx={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: '50%', 
                          bgcolor: 'rgba(255,255,255,0.2)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 16
                        }}>
                          U
                        </Box>
                      </Box>
                      
                      {/* Dashboard content */}
                      <Box sx={{ flex: 1, p: 2, bgcolor: '#f8f9fa' }}>
                        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>Welcome, User</Typography>
                        
                        {/* Cards */}
                        <Box sx={{ 
                          display: 'grid', 
                          gridTemplateColumns: 'repeat(2, 1fr)', 
                          gap: 1.5,
                          mb: 2 
                        }}>
                          <Paper sx={{ p: 1.5, bgcolor: '#e3f2fd', borderRadius: 2 }}>
                            <Typography variant="caption" color="primary.dark">Attendance</Typography>
                            <Typography variant="h6" sx={{ mt: 0.5 }}>8:30 AM</Typography>
                          </Paper>
                          <Paper sx={{ p: 1.5, bgcolor: '#fce4ec', borderRadius: 2 }}>
                            <Typography variant="caption" color="#c2185b">Leave Balance</Typography>
                            <Typography variant="h6" sx={{ mt: 0.5 }}>12 days</Typography>
                          </Paper>
                          <Paper sx={{ p: 1.5, bgcolor: '#f3e5f5', borderRadius: 2 }}>
                            <Typography variant="caption" color="#7b1fa2">Pay Day</Typography>
                            <Typography variant="h6" sx={{ mt: 0.5 }}>Apr 30</Typography>
                          </Paper>
                          <Paper sx={{ p: 1.5, bgcolor: '#e8f5e9', borderRadius: 2 }}>
                            <Typography variant="caption" color="#2e7d32">Tasks</Typography>
                            <Typography variant="h6" sx={{ mt: 0.5 }}>5 pending</Typography>
                          </Paper>
                        </Box>
                        
                        {/* Activity */}
                        <Paper sx={{ p: 2, borderRadius: 2, mb: 1.5 }}>
                          <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Today's Activity</Typography>
                          <Box sx={{ 
                            height: 8, 
                            borderRadius: 4, 
                            bgcolor: '#e0e0e0',
                            position: 'relative',
                            overflow: 'hidden',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '65%',
                              height: '100%',
                              bgcolor: 'primary.main',
                              borderRadius: 4
                            }
                          }} />
                          <Typography variant="caption" sx={{ mt: 0.5, display: 'block', textAlign: 'right' }}>
                            65% Complete
                          </Typography>
                        </Paper>
                        
                        {/* Quick Access */}
                        <Typography variant="subtitle2" fontWeight={600} sx={{ mb: 1 }}>Quick Access</Typography>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip label="Clock In" size="small" sx={{ bgcolor: 'primary.light', color: 'primary.dark' }} />
                          <Chip label="Apply Leave" size="small" sx={{ bgcolor: '#ffebee', color: '#c62828' }} />
                          <Chip label="View Payslip" size="small" sx={{ bgcolor: '#e8eaf6', color: '#3949ab' }} />
                        </Box>
                      </Box>
                    </Box>
                  </Paper>
                </Box>
              </Slide>
            </Grid>
          </Grid>
          
          {/* Core Features Preview */}
          <Box sx={{ mt: { xs: 10, md: 16 }, textAlign: 'center' }}>
            <Typography 
              variant="h3" 
              fontWeight={700} 
              sx={{ 
                mb: 1.5,
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
              }}
            >
              Everything You Need
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 6, 
                opacity: 0.9,
                maxWidth: 700,
                mx: 'auto',
                fontWeight: 400
              }}
            >
              The complete solution for workforce management at Maximize Market Research
            </Typography>
            
            <Grid container spacing={3} justifyContent="center">
              <Grid item xs={6} sm={4} md={2}>
                <Box sx={{ 
                  textAlign: 'center',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}>
                  <Paper
                    elevation={0}
                    sx={{
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '16px',
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      mb: 1.5
                    }}
                  >
                    <TimeIcon sx={{ fontSize: 32 }} />
                  </Paper>
                  <Typography variant="body2" fontWeight={500}>
                    Attendance
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Box sx={{ 
                  textAlign: 'center',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}>
                  <Paper
                    elevation={0}
                    sx={{
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '16px',
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      mb: 1.5
                    }}
                  >
                    <LeaveIcon sx={{ fontSize: 32 }} />
                  </Paper>
                  <Typography variant="body2" fontWeight={500}>
                    Leave
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Box sx={{ 
                  textAlign: 'center',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}>
                  <Paper
                    elevation={0}
                    sx={{
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '16px',
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      mb: 1.5
                    }}
                  >
                    <SalaryIcon sx={{ fontSize: 32 }} />
                  </Paper>
                  <Typography variant="body2" fontWeight={500}>
                    Payroll
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Box sx={{ 
                  textAlign: 'center',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}>
                  <Paper
                    elevation={0}
                    sx={{
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '16px',
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      mb: 1.5
                    }}
                  >
                    <TeamIcon sx={{ fontSize: 32 }} />
                  </Paper>
                  <Typography variant="body2" fontWeight={500}>
                    Teams
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={6} sm={4} md={2}>
                <Box sx={{ 
                  textAlign: 'center',
                  transition: 'transform 0.3s',
                  '&:hover': { transform: 'translateY(-5px)' }
                }}>
                  <Paper
                    elevation={0}
                    sx={{
                      width: 64,
                      height: 64,
                      mx: 'auto',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: '16px',
                      bgcolor: 'rgba(255, 255, 255, 0.15)',
                      mb: 1.5
                    }}
                  >
                    <DocumentIcon sx={{ fontSize: 32 }} />
                  </Paper>
                  <Typography variant="body2" fontWeight={500}>
                    Documents
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Container>
      </Box>
      
      {/* Features Section */}
      <Box 
        id="features" 
        sx={{ 
          py: { xs: 10, md: 14 },
          backgroundColor: 'background.default'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="overline" 
              component="p"
              sx={{ 
                color: 'primary.main', 
                fontWeight: 600,
                letterSpacing: 2,
                mb: 1
              }}
            >
              CORE FEATURES
            </Typography>
            <Typography 
              variant="h3" 
              component="h2" 
              fontWeight={700}
              sx={{ mb: 2 }}
            >
              Powerful Tools for Your Team
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                maxWidth: 700,
                mx: 'auto',
                fontSize: '1.1rem',
                lineHeight: 1.6
              }}
            >
              TeamSync provides comprehensive tools to streamline HR processes, boost productivity, and enhance collaboration.
            </Typography>
          </Box>
          
          <Grid container spacing={4} justifyContent="center">
            {coreFeatures.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <FeatureCard 
                  title={feature.title}
                  description={feature.description}
                  icon={feature.icon}
                  color={feature.color}
                />
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>
      
      {/* Roles Section */}
      <Box 
        id="roles" 
        sx={{ 
          py: { xs: 10, md: 14 },
          bgcolor: '#f5f7fa',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Typography 
              variant="overline" 
              component="p"
              sx={{ 
                color: 'primary.main', 
                fontWeight: 600,
                letterSpacing: 2,
                mb: 1
              }}
            >
              TAILORED FOR EVERYONE
            </Typography>
            <Typography 
              variant="h3" 
              component="h2" 
              fontWeight={700}
              sx={{ mb: 2 }}
            >
              Role-Based Experience
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                maxWidth: 700,
                mx: 'auto',
                fontSize: '1.1rem',
                lineHeight: 1.6
              }}
            >
              TeamSync adapts to different roles with customized interfaces and permissions for administrators, managers, and employees.
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <RoleFeature
                title="Admin"
                icon={<CompanyIcon sx={{ fontSize: 28, color: 'white' }} />}
                bgColor="#1976d2"
                items={[
                  'Complete system administration',
                  'User management and permissions',
                  'Department and team creation',
                  'Leave policy configuration',
                  'Holiday management',
                  'Global reporting and analytics',
                  'Document management'
                ]}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <RoleFeature
                title="Manager"
                icon={<TeamIcon sx={{ fontSize: 28, color: 'white' }} />}
                bgColor="#7b1fa2"
                items={[
                  'Team management',
                  'Attendance approval',
                  'Team attendance reporting',
                  'Team creation and assignment',
                  'Personal attendance management',
                  'Document access',
                  'Leave application and tracking'
                ]}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <RoleFeature
                title="Employee"
                icon={<TimeIcon sx={{ fontSize: 28, color: 'white' }} />}
                bgColor="#f57c00"
                items={[
                  'Attendance tracking',
                  'Leave application',
                  'Document center access',
                  'Salary slip viewing',
                  'Profile management',
                  'Support ticket creation',
                  'Real-time notifications'
                ]}
              />
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* Platform Overview */}
      <Box 
        id="platform" 
        sx={{ 
          py: { xs: 10, md: 14 }
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="overline" 
                component="p"
                sx={{ 
                  color: 'primary.main', 
                  fontWeight: 600,
                  letterSpacing: 2,
                  mb: 1
                }}
              >
                THE COMPLETE PLATFORM
              </Typography>
              <Typography 
                variant="h3" 
                component="h2" 
                fontWeight={700}
                sx={{ mb: 3 }}
              >
                Designed for Maximize Market Research
              </Typography>
              <Typography 
                variant="body1" 
                color="text.secondary"
                sx={{ 
                  mb: 4,
                  fontSize: '1.1rem',
                  lineHeight: 1.7
                }}
              >
                TeamSync is tailored to the specific needs of Maximize Market Research, integrating seamlessly with your existing workflows and enhancing organizational efficiency.
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <Box 
                      sx={{ 
                        minWidth: 48, 
                        height: 48, 
                        borderRadius: 2, 
                        bgcolor: '#e3f2fd', 
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                      }}
                    >
                      <TimeIcon />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                        Time Efficiency
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Save up to 5 hours per week with automated processes
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <Box 
                      sx={{ 
                        minWidth: 48, 
                        height: 48, 
                        borderRadius: 2, 
                        bgcolor: '#fff8e1', 
                        color: '#f57f17',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                      }}
                    >
                      <DocumentIcon />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                        Paperless HR
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Digital forms and documents for all HR processes
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <Box 
                      sx={{ 
                        minWidth: 48, 
                        height: 48, 
                        borderRadius: 2, 
                        bgcolor: '#fce4ec', 
                        color: '#d81b60',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                      }}
                    >
                      <NotificationIcon />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                        Real-time Updates
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Instant notifications for critical updates
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', mb: 3 }}>
                    <Box 
                      sx={{ 
                        minWidth: 48, 
                        height: 48, 
                        borderRadius: 2, 
                        bgcolor: '#e8f5e9', 
                        color: '#388e3c',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 2
                      }}
                    >
                      <SalaryIcon />
                    </Box>
                    <Box>
                      <Typography variant="h6" fontWeight={600} sx={{ mb: 0.5 }}>
                        Accurate Payroll
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Automated calculations based on attendance
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
              
              <Button
                variant="contained"
                size="large"
                onClick={navigateToDashboard}
                disableElevation
                sx={{ 
                  mt: 4,
                  px: 4,
                  py: 1.5, 
                  borderRadius: 3,
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '1rem'
                }}
              >
                {user ? 'Go to Dashboard' : 'Get Started'} <ArrowIcon sx={{ ml: 1 }} />
              </Button>
            </Grid>
            
            <Grid item xs={12} md={6}>
              {/* Platform features visualization - Could be a statistics dashboard image */}
              <Box sx={{ position: 'relative' }}>
                <Paper
                  elevation={8}
                  sx={{
                    p: 3,
                    borderRadius: 4,
                    overflow: 'hidden',
                    minHeight: 500,
                    position: 'relative',
                    zIndex: 1,
                    bgcolor: 'background.paper',
                    '&::after': {
                      content: '""',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      background: 'linear-gradient(to bottom, rgba(255,255,255,0) 60%, rgba(255,255,255,1) 100%)'
                    }
                  }}
                >
                  {/* This would be a dashboard screenshot or visualization in a real implementation */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                      Admin Dashboard
                    </Typography>
                    
                    {/* Mock statistics overview */}
                    <Grid container spacing={2} sx={{ mb: 4 }}>
                      <Grid item xs={6} sm={3}>
                        <Paper sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="h4" fontWeight={700} color="primary.main">150</Typography>
                          <Typography variant="body2" color="text.secondary">Employees</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Paper sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="h4" fontWeight={700} color="#f57c00">12</Typography>
                          <Typography variant="body2" color="text.secondary">Departments</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Paper sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="h4" fontWeight={700} color="#7b1fa2">85%</Typography>
                          <Typography variant="body2" color="text.secondary">Attendance</Typography>
                        </Paper>
                      </Grid>
                      <Grid item xs={6} sm={3}>
                        <Paper sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, textAlign: 'center' }}>
                          <Typography variant="h4" fontWeight={700} color="#d32f2f">15</Typography>
                          <Typography variant="body2" color="text.secondary">On Leave</Typography>
                        </Paper>
                      </Grid>
                    </Grid>
                  </Box>
                  
                  {/* Mock chart section */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                      Attendance Overview
                    </Typography>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        borderRadius: 2, 
                        height: 200, 
                        bgcolor: '#f9f9f9',
                        display: 'flex',
                        flexDirection: 'column'
                      }}
                    >
                      {/* Mock chart bars */}
                      <Box sx={{ display: 'flex', flex: 1, alignItems: 'flex-end', gap: 1 }}>
                        <Box sx={{ height: '65%', flex: 1, bgcolor: '#bbdefb', borderRadius: '4px 4px 0 0' }} />
                        <Box sx={{ height: '82%', flex: 1, bgcolor: '#90caf9', borderRadius: '4px 4px 0 0' }} />
                        <Box sx={{ height: '70%', flex: 1, bgcolor: '#64b5f6', borderRadius: '4px 4px 0 0' }} />
                        <Box sx={{ height: '90%', flex: 1, bgcolor: '#42a5f5', borderRadius: '4px 4px 0 0' }} />
                        <Box sx={{ height: '75%', flex: 1, bgcolor: '#2196f3', borderRadius: '4px 4px 0 0' }} />
                        <Box sx={{ height: '55%', flex: 1, bgcolor: '#1e88e5', borderRadius: '4px 4px 0 0' }} />
                        <Box sx={{ height: '85%', flex: 1, bgcolor: '#1976d2', borderRadius: '4px 4px 0 0' }} />
                      </Box>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                        <Typography variant="caption">Mon</Typography>
                        <Typography variant="caption">Tue</Typography>
                        <Typography variant="caption">Wed</Typography>
                        <Typography variant="caption">Thu</Typography>
                        <Typography variant="caption">Fri</Typography>
                        <Typography variant="caption">Sat</Typography>
                        <Typography variant="caption">Sun</Typography>
                      </Box>
                    </Paper>
                  </Box>
                  
                  {/* Mock recent activity */}
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                      Recent Activity
                    </Typography>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                      <Paper sx={{ p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ 
                          width: 36, 
                          height: 36, 
                          borderRadius: 18, 
                          bgcolor: '#e3f2fd', 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 1.5
                        }}>
                          <TimeIcon sx={{ fontSize: 20, color: 'primary.main' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2">John Smith clocked in</Typography>
                          <Typography variant="caption" color="text.secondary">Today, 9:05 AM</Typography>
                        </Box>
                      </Paper>
                      <Paper sx={{ p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ 
                          width: 36, 
                          height: 36, 
                          borderRadius: 18, 
                          bgcolor: '#fff8e1', 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 1.5
                        }}>
                          <LeaveIcon sx={{ fontSize: 20, color: '#ff9800' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2">Sarah Jones applied for leave</Typography>
                          <Typography variant="caption" color="text.secondary">Today, 8:45 AM</Typography>
                        </Box>
                      </Paper>
                      <Paper sx={{ p: 1.5, borderRadius: 2, display: 'flex', alignItems: 'center' }}>
                        <Box sx={{ 
                          width: 36, 
                          height: 36, 
                          borderRadius: 18, 
                          bgcolor: '#e8f5e9', 
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          mr: 1.5
                        }}>
                          <SalaryIcon sx={{ fontSize: 20, color: '#4caf50' }} />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                          <Typography variant="body2">April salary disbursement initiated</Typography>
                          <Typography variant="caption" color="text.secondary">Yesterday, 4:30 PM</Typography>
                        </Box>
                      </Paper>
                    </Box>
                  </Box>
                </Paper>
                
                {/* Decorative elements */}
                <Box
                  sx={{
                    position: 'absolute',
                    top: -20,
                    right: -20,
                    width: 120,
                    height: 120,
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #e3f2fd 0%, #bbdefb 100%)',
                    zIndex: 0,
                    opacity: 0.6
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -15,
                    left: -15,
                    width: 80,
                    height: 80,
                    borderRadius: '50%',
                    background: 'linear-gradient(45deg, #e8f5e9 0%, #c8e6c9 100%)',
                    zIndex: 0,
                    opacity: 0.6
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
      
      {/* CTA Section */}
      <Box 
        sx={{ 
          py: { xs: 8, md: 10 },
          background: 'linear-gradient(120deg, #1a237e 0%, #3949ab 100%)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <Typography
            variant="h3"
            component="h2"
            fontWeight={700}
            sx={{ mb: 3 }}
          >
            Ready to Transform Your Workflow?
          </Typography>
          <Typography
            variant="h6"
            sx={{ 
              mb: 4,
              opacity: 0.9,
              fontWeight: 400,
              lineHeight: 1.6
            }}
          >
            Join your colleagues at Maximize Market Research who are already using TeamSync
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={navigateToDashboard}
            sx={{ 
              px: 6,
              py: 1.5,
              bgcolor: 'white',
              color: 'primary.main',
              borderRadius: '14px',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '1.1rem',
              '&:hover': {
                bgcolor: 'rgba(255, 255, 255, 0.9)'
              }
            }}
          >
            {user ? 'Go to Dashboard' : 'Get Started'} <ArrowIcon sx={{ ml: 1 }} />
          </Button>
        </Container>
      </Box>
      
      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          py: 6,
          bgcolor: 'background.paper',
          borderTop: '1px solid',
          borderColor: 'divider'
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <CompanyIcon sx={{ mr: 1.5, fontSize: 28, color: 'primary.main' }} />
                <Typography variant="h6" component="div" fontWeight={600}>
                  TeamSync
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                The complete workforce management solution for Maximize Market Research.
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                <Typography variant="body2" color="text.secondary">
                  © {new Date().getFullYear()} Maximize Market Research Pvt. Ltd. All rights reserved.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;