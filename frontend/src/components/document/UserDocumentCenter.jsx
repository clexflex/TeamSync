// frontend/src/components/document/UserDocumentCenter.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tabs,
  Tab,
  Tooltip,
  Grid,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Description as DocumentIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon,
  Work as WorkIcon,
  HomeWork as AddressIcon,
  School as EducationIcon,
  AccountBalance as AccountsIcon,
  Policy as PolicyIcon,
  Assignment as FormsIcon,
  AttachMoney as FormIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/authContext';
import { Link } from 'react-router-dom';

// TabPanel component for the tabs
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`document-tabpanel-${index}`}
      aria-labelledby={`document-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const getCategoryIcon = (category) => {
  switch (category) {
    case 'Address':
      return <AddressIcon />;
    case 'Qualification':
      return <EducationIcon />;
    case 'Previous Employment':
      return <WorkIcon />;
    case 'Accounts & Statutory':
      return <AccountsIcon />;
    case 'Company Policies':
      return <PolicyIcon />;
    case 'Form 16':
      return <FormIcon />;
    case 'Forms':
      return <FormsIcon />;
    default:
      return <DocumentIcon />;
  }
};

const UserDocumentCenter = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [globalDocuments, setGlobalDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    if (user) {
      fetchUserDocuments();
      fetchGlobalDocuments();
    }
  }, [user]);

  const fetchUserDocuments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${config.API_URL}/api/documents/user/${user._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        // Filter out global documents since we'll show them separately
        setDocuments(response.data.documents.filter(doc => !doc.isGlobal));
      }
    } catch (error) {
      setError('Failed to fetch your documents.');
      console.error('Error fetching user documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchGlobalDocuments = async () => {
    try {
      const response = await axios.get(
        `${config.API_URL}/api/documents/global`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        setGlobalDocuments(response.data.documents);
      }
    } catch (error) {
      console.error('Error fetching global documents:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleDownloadDocument = async (document) => {
    try {
      window.open(`${config.API_URL}/api/documents/download/${document._id}`, '_blank');
    } catch (error) {
      setError('Error downloading document');
      console.error('Error downloading document:', error);
    }
  };

  // Get documents for a specific category
  const getCategoryDocuments = (category) => {
    return documents.filter(doc => doc.category === category);
  };

  // Get global documents for a specific category
  const getGlobalCategoryDocuments = (category) => {
    return globalDocuments.filter(doc => doc.category === category);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Document Center
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="document categories">
          <Tab label="Documents" />
          <Tab label="Company Policies" />
          <Tab label="Form 16" />
          <Tab label="Forms" />
          <Tab label="PaySlips" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <Typography variant="h6" gutterBottom>
              My Documents
            </Typography>
            
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AddressIcon sx={{ mr: 1 }} /> Address
                      </Box>
                    </Typography>
                    <DocumentList 
                      documents={getCategoryDocuments('Address')} 
                      onDownload={handleDownloadDocument} 
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <EducationIcon sx={{ mr: 1 }} /> Qualification
                      </Box>
                    </Typography>
                    <DocumentList 
                      documents={getCategoryDocuments('Qualification')} 
                      onDownload={handleDownloadDocument} 
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WorkIcon sx={{ mr: 1 }} /> Previous Employment
                      </Box>
                    </Typography>
                    <DocumentList 
                      documents={getCategoryDocuments('Previous Employment')} 
                      onDownload={handleDownloadDocument} 
                    />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Card sx={{ mb: 3 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AccountsIcon sx={{ mr: 1 }} /> Accounts & Statutory
                      </Box>
                    </Typography>
                    <DocumentList 
                      documents={getCategoryDocuments('Accounts & Statutory')} 
                      onDownload={handleDownloadDocument} 
                    />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        <Typography variant="h6" gutterBottom>
          Company Policies
        </Typography>
        
        <Card>
          <CardContent>
            <DocumentList 
              documents={getGlobalCategoryDocuments('Company Policies')} 
              onDownload={handleDownloadDocument} 
            />
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        <Typography variant="h6" gutterBottom>
          Form 16
        </Typography>
        
        <Card>
          <CardContent>
            <DocumentList 
              documents={[
                ...getCategoryDocuments('Form 16'),
                ...getGlobalCategoryDocuments('Form 16')
              ]} 
              onDownload={handleDownloadDocument} 
            />
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        <Typography variant="h6" gutterBottom>
          Forms
        </Typography>
        
        <Card>
          <CardContent>
            <DocumentList 
              documents={getGlobalCategoryDocuments('Forms')} 
              onDownload={handleDownloadDocument} 
            />
          </CardContent>
        </Card>
      </TabPanel>

      <TabPanel value={tabValue} index={4}>
        <Typography variant="h6" gutterBottom>
          PaySlips
        </Typography>
        
        <Card>
          <CardContent>
            <Typography variant="body1" paragraph>
              Access your salary payslips here.
            </Typography>
            
            <Button 
              variant="contained" 
              color="primary"
              component={Link}
              to={`/${user.role}-dashboard/salary/history/`}
            >
              View PaySlips
            </Button>
          </CardContent>
        </Card>
      </TabPanel>
    </Box>
  );
};

// DocumentList component to display list of documents
const DocumentList = ({ documents, onDownload }) => {
  if (documents.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary">
        No documents available in this category.
      </Typography>
    );
  }

  return (
    <List>
      {documents.map((document) => (
        <ListItem key={document._id} divider>
          <ListItemIcon>
            {getCategoryIcon(document.category)}
          </ListItemIcon>
          <ListItemText
            primary={document.title}
            secondary={
              <>
                {document.subCategory && <span>Sub-category: {document.subCategory}</span>}
                {document.description && (
                  <Typography variant="body2" color="text.secondary">
                    {document.description}
                  </Typography>
                )}
                <Typography variant="caption" color="text.secondary">
                  Uploaded on: {new Date(document.createdAt).toLocaleDateString()}
                </Typography>
              </>
            }
          />
          <ListItemSecondaryAction>
            <Tooltip title="Download">
              <IconButton
                edge="end"
                color="primary"
                onClick={() => onDownload(document)}
              >
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </ListItemSecondaryAction>
        </ListItem>
      ))}
    </List>
  );
};

export default UserDocumentCenter;