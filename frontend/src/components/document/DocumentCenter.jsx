// frontend/src/components/document/DocumentCenter.jsx
import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
  FormControlLabel,
  Checkbox,
  Grid,
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Download as DownloadIcon,
  Visibility as ViewIcon
} from '@mui/icons-material';
import axios from 'axios';
import config from '../../config';
import { useAuth } from '../../context/authContext';

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

const DocumentCenter = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    userId: '',
    category: '',
    subCategory: '',
    title: '',
    description: '',
    isGlobal: false,
    file: null
  });

  // Fetch users and documents on component mount
  useEffect(() => {
    fetchUsers();
    fetchDocuments();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(
        `${config.API_URL}/api/user-profile`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        setUsers(response.data.userProfiles);
      }
    } catch (error) {
      setError('Failed to fetch users.');
      console.error('Error fetching users:', error);
    }
  };

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const response = await axios.get(
        `${config.API_URL}/api/documents/all`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        setDocuments(response.data.documents);
      }
    } catch (error) {
      setError('Failed to fetch documents.');
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleFormChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      file: e.target.files[0]
    });
  };

  const resetForm = () => {
    setFormData({
      userId: '',
      category: '',
      subCategory: '',
      title: '',
      description: '',
      isGlobal: false,
      file: null
    });
  };

  const handleOpenForm = (document = null) => {
    if (document) {
      setFormData({
        userId: document.userId._id,
        category: document.category,
        subCategory: document.subCategory || '',
        title: document.title,
        description: document.description || '',
        isGlobal: document.isGlobal,
        file: null
      });
      setSelectedDocument(document);
    } else {
      resetForm();
      setSelectedDocument(null);
    }
    setFormOpen(true);
  };

  const handleCloseForm = () => {
    setFormOpen(false);
    resetForm();
    setSelectedDocument(null);
  };

  const handleOpenDeleteConfirm = (document) => {
    setSelectedDocument(document);
    setConfirmDeleteOpen(true);
  };

  const handleCloseDeleteConfirm = () => {
    setConfirmDeleteOpen(false);
    setSelectedDocument(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataObj = new FormData();
      formDataObj.append('userId', formData.userId);
      formDataObj.append('category', formData.category);
      formDataObj.append('subCategory', formData.subCategory);
      formDataObj.append('title', formData.title);
      formDataObj.append('description', formData.description);
      formDataObj.append('isGlobal', formData.isGlobal);
      
      if (formData.file) {
        formDataObj.append('file', formData.file);
      }

      let response;
      if (selectedDocument) {
        // Update existing document
        response = await axios.put(
          `${config.API_URL}/api/documents/${selectedDocument._id}`,
          formDataObj,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'multipart/form-data'
            },
          }
        );
      } else {
        // Create new document
        response = await axios.post(
          `${config.API_URL}/api/documents/upload`,
          formDataObj,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'multipart/form-data'
            },
          }
        );
      }

      if (response.data.success) {
        setSuccess(selectedDocument ? 'Document updated successfully' : 'Document uploaded successfully');
        fetchDocuments();
        handleCloseForm();
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Error processing document');
      console.error('Error processing document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDocument = async () => {
    if (!selectedDocument) return;
    
    setLoading(true);
    try {
      const response = await axios.delete(
        `${config.API_URL}/api/documents/${selectedDocument._id}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.success) {
        setSuccess('Document deleted successfully');
        fetchDocuments();
        handleCloseDeleteConfirm();
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Error deleting document');
      console.error('Error deleting document:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadDocument = async (document) => {
    try {
      // Instead of opening the URL directly, make a request to download endpoint
      window.location.href = `${config.API_URL}/api/documents/download/${document._id}`;
    } catch (error) {
      setError('Error downloading document');
      console.error('Error downloading document:', error);
    }
  };

  // Filter documents based on the selected tab
  const getFilteredDocuments = () => {
    if (tabValue === 0) { // All Documents
      return documents;
    } else if (tabValue === 1) { // Employee Documents
      return documents.filter(doc => doc.userId.role === 'employee' && !doc.isGlobal);
    } else if (tabValue === 2) { // Manager Documents
      return documents.filter(doc => doc.userId.role === 'manager' && !doc.isGlobal);
    } else if (tabValue === 3) { // Global Documents
      return documents.filter(doc => doc.isGlobal);
    }
    return [];
  };

  // Get the category-specific documents for a category
  const getCategoryDocuments = (category) => {
    return getFilteredDocuments().filter(doc => doc.category === category);
  };

  return (
    <Box sx={{ padding: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Document Center
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
        >
          Upload New Document
        </Button>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="document categories">
          <Tab label="All Documents" />
          <Tab label="Employee Documents" />
          <Tab label="Manager Documents" />
          <Tab label="Global Documents" />
        </Tabs>
      </Box>

      <TabPanel value={tabValue} index={0}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <DocumentCategorySection
            title="Address"
            documents={getCategoryDocuments('Address')}
            onEdit={handleOpenForm}
            onDelete={handleOpenDeleteConfirm}
            onDownload={handleDownloadDocument}
          />
        )}

        <DocumentCategorySection
          title="Qualification"
          documents={getCategoryDocuments('Qualification')}
          onEdit={handleOpenForm}
          onDelete={handleOpenDeleteConfirm}
          onDownload={handleDownloadDocument}
        />

        <DocumentCategorySection
          title="Previous Employment"
          documents={getCategoryDocuments('Previous Employment')}
          onEdit={handleOpenForm}
          onDelete={handleOpenDeleteConfirm}
          onDownload={handleDownloadDocument}
        />

        <DocumentCategorySection
          title="Accounts & Statutory"
          documents={getCategoryDocuments('Accounts & Statutory')}
          onEdit={handleOpenForm}
          onDelete={handleOpenDeleteConfirm}
          onDownload={handleDownloadDocument}
        />

        <DocumentCategorySection
          title="Company Policies"
          documents={getCategoryDocuments('Company Policies')}
          onEdit={handleOpenForm}
          onDelete={handleOpenDeleteConfirm}
          onDownload={handleDownloadDocument}
        />

        <DocumentCategorySection
          title="Form 16"
          documents={getCategoryDocuments('Form 16')}
          onEdit={handleOpenForm}
          onDelete={handleOpenDeleteConfirm}
          onDownload={handleDownloadDocument}
        />

        <DocumentCategorySection
          title="Forms"
          documents={getCategoryDocuments('Forms')}
          onEdit={handleOpenForm}
          onDelete={handleOpenDeleteConfirm}
          onDownload={handleDownloadDocument}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Employee Documents Tab - Same categories as All Documents but filtered */}
        <DocumentCategorySection
          title="Address"
          documents={getCategoryDocuments('Address')}
          onEdit={handleOpenForm}
          onDelete={handleOpenDeleteConfirm}
          onDownload={handleDownloadDocument}
        />
        {/* Repeat for other categories */}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Manager Documents Tab - Same categories as All Documents but filtered */}
        <DocumentCategorySection
          title="Address"
          documents={getCategoryDocuments('Address')}
          onEdit={handleOpenForm}
          onDelete={handleOpenDeleteConfirm}
          onDownload={handleDownloadDocument}
        />
        {/* Repeat for other categories */}
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {/* Global Documents Tab - Same categories as All Documents but filtered */}
        <DocumentCategorySection
          title="Company Policies"
          documents={getCategoryDocuments('Company Policies')}
          onEdit={handleOpenForm}
          onDelete={handleOpenDeleteConfirm}
          onDownload={handleDownloadDocument}
        />
        
        <DocumentCategorySection
          title="Forms"
          documents={getCategoryDocuments('Forms')}
          onEdit={handleOpenForm}
          onDelete={handleOpenDeleteConfirm}
          onDownload={handleDownloadDocument}
        />
        {/* Only include relevant categories for global documents */}
      </TabPanel>

      {/* Upload/Edit Document Dialog */}
      <Dialog open={formOpen} onClose={handleCloseForm} maxWidth="md" fullWidth>
        <DialogTitle>{selectedDocument ? 'Edit Document' : 'Upload New Document'}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="user-select-label">User</InputLabel>
                  <Select
                    labelId="user-select-label"
                    name="userId"
                    value={formData.userId}
                    onChange={handleFormChange}
                    label="User"
                  >
                    {users.map((userProfile) => (
                      <MenuItem key={userProfile.user._id} value={userProfile.user._id}>
                        {userProfile.user.name} ({userProfile.user.email}) - {userProfile.user.role.charAt(0).toUpperCase() + userProfile.user.role.slice(1)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal" required>
                  <InputLabel id="category-select-label">Category</InputLabel>
                  <Select
                    labelId="category-select-label"
                    name="category"
                    value={formData.category}
                    onChange={handleFormChange}
                    label="Category"
                  >
                    <MenuItem value="Address">Address</MenuItem>
                    <MenuItem value="Qualification">Qualification</MenuItem>
                    <MenuItem value="Previous Employment">Previous Employment</MenuItem>
                    <MenuItem value="Accounts & Statutory">Accounts & Statutory</MenuItem>
                    <MenuItem value="Company Policies">Company Policies</MenuItem>
                    <MenuItem value="Form 16">Form 16</MenuItem>
                    <MenuItem value="Forms">Forms</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  name="subCategory"
                  label="Sub-Category"
                  fullWidth
                  value={formData.subCategory}
                  onChange={handleFormChange}
                  placeholder="E.g., Permanent Address, Degree Certificate, etc."
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  margin="normal"
                  name="title"
                  label="Document Title"
                  fullWidth
                  required
                  value={formData.title}
                  onChange={handleFormChange}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  name="description"
                  label="Description"
                  fullWidth
                  multiline
                  rows={2}
                  value={formData.description}
                  onChange={handleFormChange}
                />
              </Grid>

              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.isGlobal}
                      onChange={handleFormChange}
                      name="isGlobal"
                    />
                  }
                  label="Make this document globally available to all users"
                />
              </Grid>

              <Grid item xs={12}>
                <Box sx={{ mt: 2 }}>
                  <input
                    type="file"
                    id="document-file"
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                  />
                  <label htmlFor="document-file">
                    <Button
                      variant="outlined"
                      component="span"
                    >
                      {selectedDocument ? 'Update File (Optional)' : 'Upload File'}
                    </Button>
                  </label>
                  {formData.file && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Selected file: {formData.file.name}
                    </Typography>
                  )}
                  {selectedDocument && !formData.file && (
                    <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                      Current file: {selectedDocument.title}
                    </Typography>
                  )}
                </Box>
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseForm} color="inherit">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || (selectedDocument && !formData.file && !formData.title)}
            >
              {loading ? <CircularProgress size={24} /> : selectedDocument ? 'Update' : 'Upload'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDeleteOpen} onClose={handleCloseDeleteConfirm}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the document "{selectedDocument?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteConfirm} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteDocument}
            variant="contained"
            color="error"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Delete'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

// DocumentCategorySection component to display documents by category
const DocumentCategorySection = ({ title, documents, onEdit, onDelete, onDownload }) => {
  return (
    <Box sx={{ mb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2 }}>{title}</Typography>
      {documents.length === 0 ? (
        <Card>
          <CardContent>
            <Typography variant="body2" color="text.secondary">
              No documents found in this category.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Document Title</TableCell>
                <TableCell>Sub-Category</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Global</TableCell>
                <TableCell>Uploaded By</TableCell>
                <TableCell>Uploaded On</TableCell>
                <TableCell align="center">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {documents.map((document) => (
                <TableRow key={document._id}>
                  <TableCell>{document.title}</TableCell>
                  <TableCell>{document.subCategory || '-'}</TableCell>
                  <TableCell>
                    {document.userId?.name} ({document.userId?.role})
                  </TableCell>
                  <TableCell>{document.isGlobal ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{document.uploadedBy?.name || 'Unknown'}</TableCell>
                  <TableCell>
                    {new Date(document.createdAt).toLocaleDateString()} - {new Date(document.createdAt).toLocaleTimeString()}
                  </TableCell>
                  <TableCell align="center">
                    <Tooltip title="Download">
                      <IconButton 
                        color="primary" 
                        onClick={() => onDownload(document)}
                      >
                        <DownloadIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Edit">
                      <IconButton
                        color="info"
                        onClick={() => onEdit(document)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton
                        color="error"
                        onClick={() => onDelete(document)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default DocumentCenter;