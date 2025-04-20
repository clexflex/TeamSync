// src/pages/AboutPage.jsx
import React from 'react';
import { 
  Box, Container, Typography, Grid, Paper, 
  Button, Divider, Card, CardContent, Avatar,
  List, ListItem, ListItemIcon, ListItemText
} from '@mui/material';
import { 
  Business as BusinessIcon, 
  LocationOn as LocationIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Flag as FlagIcon,
  Lightbulb as LightbulbIcon,
  Visibility as VisionIcon,
  Architecture as ArchitectureIcon,
  DataObject as DataIcon,
  Devices as DevicesIcon,
  AccessTime as AccessTimeIcon,
  EventNote as EventNoteIcon,
  AttachMoney as AttachMoneyIcon,
  FolderSpecial as FolderSpecialIcon,
  ConfirmationNumber as ConfirmationNumberIcon,
  NotificationsActive as NotificationsActiveIcon,
  Engineering as EngineeringIcon,
  FormatQuote as FormatQuoteIcon,
  Link as LinkIcon
} from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';

const AboutPage = () => {
  const techs = [
    { name: 'React', type: 'frontend' },
    { name: 'Material-UI', type: 'frontend' },
    { name: 'Node.js', type: 'backend' },
    { name: 'Express', type: 'backend' },
    { name: 'MongoDB', type: 'database' },
    { name: 'Mongoose', type: 'database' },
    { name: 'JWT', type: 'auth' },
    { name: 'Socket.io', type: 'realtime' },
    { name: 'Axios', type: 'http' }
  ];
  
  const features = [
    { name: 'Attendance Tracking', icon: <AccessTimeIcon />, description: 'Real-time attendance with geolocation and approval workflows' },
    { name: 'Leave Management', icon: <EventNoteIcon />, description: 'Automated leave application and balance tracking' },
    { name: 'Salary Processing', icon: <AttachMoneyIcon />, description: 'Integrated payroll based on attendance credits' },
    { name: 'Document Center', icon: <FolderSpecialIcon />, description: 'Centralized document repository for company and employee files' },
    { name: 'Tickets System', icon: <ConfirmationNumberIcon />, description: 'Internal support ticket system for employee requests' },
    { name: 'Real-time Notifications', icon: <NotificationsActiveIcon />, description: 'Instant updates for all system activities' }
  ];
  
  const renderLeadershipCard = (name, title, description, imgSrc) => (
    <Card elevation={0} sx={{ 
      height: '100%',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 2,
      overflow: 'visible'
    }}>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
          <Avatar 
            src={imgSrc}
            sx={{ 
              width: 100, 
              height: 100, 
              mb: 2, 
              border: '4px solid',
              borderColor: 'primary.light'
            }}
          >
            {name.split(' ').map(n => n[0]).join('')}
          </Avatar>
          <Typography variant="h6" fontWeight="bold" gutterBottom align="center">
            {name}
          </Typography>
          <Typography variant="subtitle2" color="text.secondary" align="center" sx={{ mb: 2 }}>
            {title}
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" align="center">
          {description}
        </Typography>
      </CardContent>
    </Card>
  );
  
  return (
    <Box sx={{ py: 8, bgcolor: 'background.default' }}>
      <Container maxWidth="lg">
        {/* Company Section */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <BusinessIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h4" component="h1" fontWeight="bold">
              Maximize Market Research
            </Typography>
          </Box>
          
          <Typography variant="h6" sx={{ mb: 4 }}>
            One of the fastest-growing market research and business consulting firms serving clients globally
          </Typography>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={8}>
              <Typography variant="body1" paragraph>
                In the chaos of data, corporates are struggling to find required and trustworthy insights, analysis and updated trends. Being 10 years in the industry, Maximize Market Research has become a global and trustworthy name in 45 countries across the world. The experienced team of domain expert, business expert, field research expert and allowances in the global field research surveyors make MMR a strong name in market research and consultancy industry.
              </Typography>
              
              <Typography variant="body1">
                Maximize Market Research has a diversified portfolio and serves a variety of industries such as IT & telecom, chemical, food & beverage, aerospace & defense, healthcare and others. Our revenue impact and focused growth-driven research initiatives make us a proud partner of majority of the Fortune 500 companies.
              </Typography>
              
              <Grid container spacing={3} sx={{ mt: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <FlagIcon sx={{ mr: 1.5, color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Mission
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        To act as an exclusive provider for the clients across the industries for syndicated research, customized research and growth consulting services to provide them the advantage of being updated on industry trends.
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <VisionIcon sx={{ mr: 1.5, color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Vision
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Our vision is to become Future Focused, creative, relevant, value based organization and provides maximum satisfaction to our clients with our professionalism, high end knowledge, accurate market research and flawless growth consulting services.
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <LightbulbIcon sx={{ mr: 1.5, color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Value
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        In the ever-changing business world of today, dependability is essential to success. It's not just about keeping your word; it's also about regularly going above and beyond and exhibiting steadfast reliability in all facets of business.
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <EngineeringIcon sx={{ mr: 1.5, color: 'primary.main', mt: 0.5 }} />
                    <Box>
                      <Typography variant="subtitle1" fontWeight="bold">
                        Culture
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        At Maximize, we believe in hiring best talent irrespective to nationality, ethnicity or religious value. A purpose-driven: Our aim is to provide the best solutions to our clients Engagement and loyalty: We believe, Employee engagement can never be bought.
                      </Typography>
                    </Box>
                  </Box>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 3, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Contact Information
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <LocationIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary="Corporate Office"
                      secondary="2nd Floor, Navale IT park Phase 3, Pune Banglore Highway, Narhe, Pune, Maharashtra 411041, India"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <PhoneIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="+91 9607365656" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <EmailIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary="sales@maximizemarketresearch.com" />
                  </ListItem>
                </List>
                
                <Divider sx={{ my: 2 }} />
                
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Our Growth Solutions
                </Typography>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <LinkIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Increasing production cost" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LinkIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Thinning profit margins" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LinkIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Market Saturation and Growing competition" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LinkIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Incessant changes in technologies & processes" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LinkIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Changing demographic structures of economies" />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LinkIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary="Changing business centers and Consumer segments" />
                  </ListItem>
                </List>
              </Paper>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Leadership Section */}
        <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
          Leadership
        </Typography>
        
        <Grid container spacing={3} sx={{ mb: 6 }}>
          <Grid item xs={12} sm={6}>
            {renderLeadershipCard(
              "Mr. Ramesh Agawane",
              "Founder Chairman",
              "As a Superintending Engineer at Public Work Department, Maharashtra, the most industrialist state in India, he has shown great leadership qualities and has implemented latest technologies in smart city projects including green building, rain water harvesting, optimum use of power in houses and public buildings.",
              ""
            )}
          </Grid>
          <Grid item xs={12} sm={6}>
            {renderLeadershipCard(
              "Mr. Vikas Godage",
              "Founder | CEO | Director",
              "Graduate in English Literature and MBA in Marketing, Vikas Godage is a founder and CEO at Maximize Market Research. MMR is a Global market intelligence and growth advisory firm having client base in 34 countries across the world. The Company is catering to Manufacturing, IT as well as service sector and has helped fortune five hundred companies with market intelligence and consultancy.",
              ""
            )}
          </Grid>
        </Grid>
        
        {/* TeamSync Project Section */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: 2, mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <ArchitectureIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h5" fontWeight="bold">
              TeamSync: EMS for Maximize Market Research
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" paragraph>
                TeamSync is a comprehensive Employee Management System developed specifically for Maximize Market Research. The project was built to streamline HR processes, improve efficiency, and provide a better experience for employees, managers, and administrators.
              </Typography>
              
              <Typography variant="body1" paragraph>
                The system integrates attendance tracking with geolocation, leave management, salary processing, document management, and other essential HR functions into a unified platform tailored to MMR's unique workflow requirements.
              </Typography>
              
              <Box sx={{ 
                p: 2, 
                bgcolor: 'primary.soft', 
                borderRadius: 2, 
                border: '1px solid',
                borderColor: 'primary.light',
                mt: 3,
                display: 'flex',
                alignItems: 'center'
              }}>
                <FormatQuoteIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2, opacity: 0.5 }} />
                <Typography variant="body2" fontStyle="italic">
                  "TeamSync has revolutionized our human resource management, making it easier for our growing team to stay connected and efficient. This custom solution aligns perfectly with our company culture and operational needs."
                </Typography>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Typography variant="subtitle1" fontWeight="bold" sx={{ mb: 2 }}>
                Key Features
              </Typography>
              
              <Grid container spacing={2}>
                {features.map((feature, index) => (
                  <Grid item xs={12} key={index}>
                    <Paper elevation={0} sx={{ 
                      p: 2, 
                      borderRadius: 2, 
                      border: '1px solid',
                      borderColor: 'divider',
                      display: 'flex',
                      alignItems: 'flex-start'
                    }}>
                      <Box sx={{ 
                        mr: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: 2,
                        bgcolor: 'primary.soft',
                        color: 'primary.main'
                      }}>
                        {feature.icon}
                      </Box>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {feature.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Technology Section */}
        <Paper elevation={0} sx={{ p: 4, borderRadius: 2, mb: 6 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <DataIcon sx={{ mr: 2, fontSize: 32, color: 'primary.main' }} />
            <Typography variant="h5" fontWeight="bold">
              Technology Stack
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="body1" paragraph>
                TeamSync is built using modern web technologies to provide a responsive, secure, and scalable solution that meets the specific needs of Maximize Market Research:
              </Typography>
              
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: 'grey.50',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Frontend
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {techs.filter(t => t.type === 'frontend').map((tech, i) => (
                        <Box key={i} sx={{ 
                          px: 1.5, 
                          py: 0.5, 
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}>
                          {tech.name}
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: 'grey.50',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Backend
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {techs.filter(t => t.type === 'backend').map((tech, i) => (
                        <Box key={i} sx={{ 
                          px: 1.5, 
                          py: 0.5, 
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}>
                          {tech.name}
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: 'grey.50',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Database
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {techs.filter(t => t.type === 'database').map((tech, i) => (
                        <Box key={i} sx={{ 
                          px: 1.5, 
                          py: 0.5, 
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}>
                          {tech.name}
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Paper elevation={0} sx={{ 
                    p: 2, 
                    borderRadius: 2, 
                    bgcolor: 'grey.50',
                    border: '1px solid',
                    borderColor: 'divider'
                  }}>
                    <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                      Other Technologies
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {techs.filter(t => ['auth', 'realtime', 'http'].includes(t.type)).map((tech, i) => (
                        <Box key={i} sx={{ 
                          px: 1.5, 
                          py: 0.5, 
                          bgcolor: 'background.paper',
                          borderRadius: 1,
                          fontSize: '0.75rem',
                          border: '1px solid',
                          borderColor: 'divider'
                        }}>
                          {tech.name}
                        </Box>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              </Grid>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <DevicesIcon sx={{ mr: 2, fontSize: 28, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight="bold">
                  Responsive Design
                </Typography>
              </Box>
              
              <Typography variant="body1" paragraph>
                The application is fully responsive and works seamlessly across desktops, tablets, and mobile devices, providing a consistent experience for all users regardless of their device.
              </Typography>
              
              <Box sx={{ mt: 4 }}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box component="span" sx={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', bgcolor: 'success.main', mr: 1.5 }} />
                  Built In-House at Maximize Market Research
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  TeamSync was developed internally by our technical team to ensure perfect alignment with MMR's unique processes and requirements. This custom approach allows for continuous improvement and adaptation as the company grows.
                </Typography>
              </Box>
              
              <Box sx={{ 
                mt: 3, 
                p: 2.5, 
                bgcolor: 'grey.50', 
                borderRadius: 2, 
                border: '1px solid', 
                borderColor: 'divider',
                fontSize: '0.875rem',
                color: 'text.secondary',
                fontStyle: 'italic'
              }}>
                <Typography variant="body2">
                  Development Credits: This application was built in-house with contributions from Yashraj Ghosalkar (GitHub: @clexflex) and the MMR technical team.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
        
        {/* CTA Section */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button 
            variant="contained" 
            component={RouterLink}
            to="/"
            size="large"
          >
            Back to Home
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default AboutPage;