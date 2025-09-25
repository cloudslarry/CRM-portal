import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Skeleton
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon,
  Share as ShareIcon,
  Analytics as AnalyticsIcon,
  ContentCopy as CopyIcon,
  Archive as ArchiveIcon,
  Publish as PublishIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import axios from 'axios';

const AdminFormBuilder = () => {
  const navigate = useNavigate();
  const admin = useSelector((state) => state.admin);
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedForm, setSelectedForm] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [publishDialog, setPublishDialog] = useState(false);

  useEffect(() => {
    fetchForms();
  }, []);

  const fetchForms = async () => {
    try {
      setLoading(true);
      const raw = localStorage.getItem('adminToken');
      const token = raw && raw.startsWith('Bearer ') ? raw.substring(7) : raw;
      const response = await axios.get('/api/forms', {
        headers: token ? { Authorization: `Bearer ${token}` } : {}
      });
      setForms(response.data.data.forms);
    } catch (error) {
      console.error('Error fetching forms:', error);
      toast.error('Failed to fetch forms');
    } finally {
      setLoading(false);
    }
  };

  const handleMenuClick = (event, form) => {
    setAnchorEl(event.currentTarget);
    setSelectedForm(form);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedForm(null);
  };

  const handleEdit = (form) => {
    navigate(`/admin/forms/edit/${form._id}`);
  };

  const handleView = (form) => {
    navigate(`/admin/forms/view/${form._id}`);
  };

  const handleAnalytics = (form) => {
    navigate(`/admin/forms/analytics/${form._id}`);
  };

  const handleDuplicate = async (form) => {
    try {
      const raw = localStorage.getItem('adminToken');
      const token = raw && raw.startsWith('Bearer ') ? raw.substring(7) : raw;
      const duplicateData = {
        ...form,
        title: `${form.title} (Copy)`,
        status: 'draft'
      };
      delete duplicateData._id;
      delete duplicateData.createdAt;
      delete duplicateData.updatedAt;
      delete duplicateData.analytics;

      await axios.post('/api/forms', duplicateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Form duplicated successfully');
      fetchForms();
    } catch (error) {
      console.error('Error duplicating form:', error);
      toast.error('Failed to duplicate form');
    }
    handleMenuClose();
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      await axios.delete(`/api/forms/${selectedForm._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Form deleted successfully');
      fetchForms();
    } catch (error) {
      console.error('Error deleting form:', error);
      toast.error('Failed to delete form');
    }
    setDeleteDialog(false);
    handleMenuClose();
  };

  const handlePublish = async () => {
    try {
      const raw = localStorage.getItem('adminToken');
      const token = raw && raw.startsWith('Bearer ') ? raw.substring(7) : raw;
      await axios.patch(`/api/forms/${selectedForm._id}/publish`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Form published successfully');
      fetchForms();
    } catch (error) {
      console.error('Error publishing form:', error);
      toast.error('Failed to publish form');
    }
    setPublishDialog(false);
    handleMenuClose();
  };

  const handleShare = (form) => {
    const url = `${window.location.origin}/forms/${form._id}`;
    navigator.clipboard.writeText(url);
    toast.success('Form link copied to clipboard');
    handleMenuClose();
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const filteredForms = forms.filter(form => {
    const matchesSearch = form.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         form.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || form.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getFormStats = () => {
    const total = forms.length;
    const published = forms.filter(f => f.status === 'published').length;
    const drafts = forms.filter(f => f.status === 'draft').length;
    const totalSubmissions = forms.reduce((sum, f) => sum + (f.analytics?.totalSubmissions || 0), 0);
    
    return { total, published, drafts, totalSubmissions };
  };

  const stats = getFormStats();

  if (loading) {
    return (
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            Form Builder
          </Typography>
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {[1, 2, 3, 4].map((i) => (
              <Grid item xs={12} sm={6} md={3} key={i}>
                <Skeleton variant="rectangular" height={100} />
              </Grid>
            ))}
          </Grid>
          <Grid container spacing={3}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Grid item xs={12} md={6} lg={4} key={i}>
                <Skeleton variant="rectangular" height={200} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Container>
    );
  }

  return (
    <AdminLayout title="Form Builder">
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" gutterBottom>
              Form Builder
            </Typography>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => navigate('/admin/forms/create')}
              sx={{ borderRadius: 2 }}
            >
              Create New Form
            </Button>
          </Box>

        {/* Stats Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Forms
                </Typography>
                <Typography variant="h4">
                  {stats.total}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Published
                </Typography>
                <Typography variant="h4" color="success.main">
                  {stats.published}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Drafts
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {stats.drafts}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Submissions
                </Typography>
                <Typography variant="h4" color="primary.main">
                  {stats.totalSubmissions}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Filters */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
          <TextField
            placeholder="Search forms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ minWidth: 300 }}
          />
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Status</InputLabel>
            <Select
              value={statusFilter}
              label="Status"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All</MenuItem>
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* Forms Grid */}
      {filteredForms.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {searchTerm || statusFilter !== 'all' ? 'No forms match your filters' : 'No forms created yet'}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Create your first form to get started'
              }
            </Typography>
            {!searchTerm && statusFilter === 'all' && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => navigate('/admin/forms/create')}
              >
                Create Your First Form
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {filteredForms.map((form) => (
            <Grid item xs={12} md={6} lg={4} key={form._id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Typography variant="h6" component="h2" sx={{ flexGrow: 1, mr: 1 }}>
                      {form.title}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuClick(e, form)}
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </Box>
                  
                  <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                    {form.description || 'No description provided'}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                    <Chip
                      label={form.status}
                      color={getStatusColor(form.status)}
                      size="small"
                    />
                    <Chip
                      label={`${form.fields?.length || 0} fields`}
                      variant="outlined"
                      size="small"
                    />
                    {form.visibility && (
                      <Chip
                        label={form.visibility}
                        variant="outlined"
                        size="small"
                      />
                    )}
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="textSecondary">
                      {form.analytics?.totalSubmissions || 0} submissions
                    </Typography>
                    <Typography variant="caption" color="textSecondary">
                      Updated {new Date(form.updatedAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleView(selectedForm)}>
          <VisibilityIcon sx={{ mr: 1 }} />
          View
        </MenuItem>
        <MenuItem onClick={() => handleEdit(selectedForm)}>
          <EditIcon sx={{ mr: 1 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleAnalytics(selectedForm)}>
          <AnalyticsIcon sx={{ mr: 1 }} />
          Analytics
        </MenuItem>
        <MenuItem onClick={() => handleShare(selectedForm)}>
          <ShareIcon sx={{ mr: 1 }} />
          Share
        </MenuItem>
        <MenuItem onClick={() => handleDuplicate(selectedForm)}>
          <CopyIcon sx={{ mr: 1 }} />
          Duplicate
        </MenuItem>
        {selectedForm?.status === 'draft' && (
          <MenuItem onClick={() => setPublishDialog(true)}>
            <PublishIcon sx={{ mr: 1 }} />
            Publish
          </MenuItem>
        )}
        <Divider />
        <MenuItem onClick={() => setDeleteDialog(true)} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1 }} />
          Delete
        </MenuItem>
      </Menu>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Form</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedForm?.title}"? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Publish Confirmation Dialog */}
      <Dialog open={publishDialog} onClose={() => setPublishDialog(false)}>
        <DialogTitle>Publish Form</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to publish "{selectedForm?.title}"? Once published, the form will be available for submissions.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishDialog(false)}>Cancel</Button>
          <Button onClick={handlePublish} color="success" variant="contained">
            Publish
          </Button>
        </DialogActions>
      </Dialog>
      </Container>
    </AdminLayout>
  );
};

export default AdminFormBuilder;
