import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Tooltip,
  Fab,
  Tabs,
  Tab,
  Badge
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as ViewIcon,
  ToggleOn as ToggleOnIcon,
  ToggleOff as ToggleOffIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  FileUpload as UploadIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import AdminLayout from '../../components/AdminLayout';
import api from '../../config/api';
import toast from 'react-hot-toast';

const DepartmentManagement = () => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [tabValue, setTabValue] = useState(0);
  const [stats, setStats] = useState({});
  
  // Form state
  const [formData, setFormData] = useState({
    shortForm: '',
    fullForm: '',
    description: '',
    category: 'Engineering',
    degreeTypes: [],
    years: [],
    sections: ['A', 'B', 'C', 'D'],
    allowedRoles: ['admin', 'faculty', 'student', 'applicant'],
    isActive: true,
    isPublic: true,
    contactEmail: '',
    contactPhone: '',
    establishedDate: ''
  });

  const categories = ['Engineering', 'Management', 'Arts', 'Science', 'Medical', 'Law', 'Other'];
  const degreeTypes = ['Bachelor', 'Master', 'PhD', 'Diploma', 'Certificate'];
  const roles = ['admin', 'faculty', 'student', 'applicant'];

  useEffect(() => {
    fetchDepartments();
    fetchStats();
  }, []);

  const fetchDepartments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchTerm) params.append('search', searchTerm);
      if (categoryFilter) params.append('category', categoryFilter);
      if (statusFilter) params.append('active', statusFilter);
      
      const response = await api.get(`/api/department?${params.toString()}`);
      setDepartments(response.data.data);
    } catch (error) {
      toast.error('Failed to fetch departments');
      console.error('Error fetching departments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await api.get('/api/department/stats');
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleCreateDepartment = async () => {
    try {
      await api.post('/api/department', formData);
      toast.success('Department created successfully');
      setOpenDialog(false);
      resetForm();
      fetchDepartments();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create department');
    }
  };

  const handleUpdateDepartment = async () => {
    try {
      await api.put(`/api/department/${editingDepartment._id}`, formData);
      toast.success('Department updated successfully');
      setOpenDialog(false);
      setEditingDepartment(null);
      resetForm();
      fetchDepartments();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update department');
    }
  };

  const handleDeleteDepartment = async (id) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      try {
        await api.delete(`/api/department/${id}`);
        toast.success('Department deleted successfully');
        fetchDepartments();
        fetchStats();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete department');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/api/department/${id}/toggle-status`);
      toast.success(`Department ${currentStatus ? 'deactivated' : 'activated'} successfully`);
      fetchDepartments();
      fetchStats();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to toggle department status');
    }
  };

  const handleEdit = (department) => {
    setEditingDepartment(department);
    setFormData({
      shortForm: department.shortForm,
      fullForm: department.fullForm,
      description: department.description || '',
      category: department.category,
      degreeTypes: department.degreeTypes || [],
      years: department.years || [],
      sections: department.sections || ['A', 'B', 'C', 'D'],
      allowedRoles: department.allowedRoles || ['admin', 'faculty', 'student', 'applicant'],
      isActive: department.isActive,
      isPublic: department.isPublic,
      contactEmail: department.contactEmail || '',
      contactPhone: department.contactPhone || '',
      establishedDate: department.establishedDate ? new Date(department.establishedDate).toISOString().split('T')[0] : ''
    });
    setOpenDialog(true);
  };

  const resetForm = () => {
    setFormData({
      shortForm: '',
      fullForm: '',
      description: '',
      category: 'Engineering',
      degreeTypes: [],
      years: [],
      sections: ['A', 'B', 'C', 'D'],
      allowedRoles: ['admin', 'faculty', 'student', 'applicant'],
      isActive: true,
      isPublic: true,
      contactEmail: '',
      contactPhone: '',
      establishedDate: ''
    });
  };

  const handleOpenDialog = () => {
    resetForm();
    setEditingDepartment(null);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingDepartment(null);
    resetForm();
  };

  const filteredDepartments = departments.filter(dept => {
    const matchesSearch = dept.fullForm.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dept.shortForm.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFilter || dept.category === categoryFilter;
    const matchesStatus = statusFilter === '' || 
                         (statusFilter === 'active' && dept.isActive) ||
                         (statusFilter === 'inactive' && !dept.isActive);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const StatCard = ({ title, value, color = 'primary', icon }) => (
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h4" component="h2" color={color}>
              {value}
            </Typography>
          </Box>
          <Box color={`${color}.main`}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <AdminLayout title="Department Management">
      <Container maxWidth="lg">
        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Total Departments"
              value={stats.total || 0}
              color="primary"
              icon={<SchoolIcon fontSize="large" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Active Departments"
              value={stats.active || 0}
              color="success"
              icon={<ToggleOnIcon fontSize="large" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Inactive Departments"
              value={stats.inactive || 0}
              color="error"
              icon={<ToggleOffIcon fontSize="large" />}
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <StatCard
              title="Categories"
              value={stats.byCategory?.length || 0}
              color="info"
              icon={<FilterIcon fontSize="large" />}
            />
          </Grid>
        </Grid>

        {/* Main Content */}
        <Card>
          <CardContent>
            {/* Header */}
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
              <Typography variant="h5" component="h1">
                Department Management
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleOpenDialog}
                color="primary"
              >
                Add Department
              </Button>
            </Box>

            {/* Filters */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Search Departments"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    label="Category"
                  >
                    <MenuItem value="">All Categories</MenuItem>
                    {categories.map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={3}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    label="Status"
                  >
                    <MenuItem value="">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="inactive">Inactive</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={2}>
                <Button
                  fullWidth
                  variant="outlined"
                  startIcon={<RefreshIcon />}
                  onClick={fetchDepartments}
                >
                  Refresh
                </Button>
              </Grid>
            </Grid>

            {/* Departments Table */}
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Short Form</TableCell>
                    <TableCell>Full Form</TableCell>
                    <TableCell>Category</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Students</TableCell>
                    <TableCell>Faculty</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : filteredDepartments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center">
                        No departments found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDepartments.map((department) => (
                      <TableRow key={department._id}>
                        <TableCell>
                          <Typography variant="subtitle2" fontWeight="bold">
                            {department.shortForm}
                          </Typography>
                        </TableCell>
                        <TableCell>{department.fullForm}</TableCell>
                        <TableCell>
                          <Chip
                            label={department.category}
                            color="primary"
                            size="small"
                            variant="outlined"
                          />
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={department.isActive ? 'Active' : 'Inactive'}
                            color={department.isActive ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{department.totalStudents || 0}</TableCell>
                        <TableCell>{department.totalFaculty || 0}</TableCell>
                        <TableCell>
                          <Box display="flex" gap={1}>
                            <Tooltip title="Edit">
                              <IconButton
                                size="small"
                                onClick={() => handleEdit(department)}
                                color="primary"
                              >
                                <EditIcon />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title={department.isActive ? 'Deactivate' : 'Activate'}>
                              <IconButton
                                size="small"
                                onClick={() => handleToggleStatus(department._id, department.isActive)}
                                color={department.isActive ? 'warning' : 'success'}
                              >
                                {department.isActive ? <ToggleOffIcon /> : <ToggleOnIcon />}
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteDepartment(department._id)}
                                color="error"
                              >
                                <DeleteIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Add/Edit Department Dialog */}
        <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
          <DialogTitle>
            {editingDepartment ? 'Edit Department' : 'Add New Department'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 1 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Short Form"
                  value={formData.shortForm}
                  onChange={(e) => setFormData({...formData, shortForm: e.target.value.toUpperCase()})}
                  required
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Full Form"
                  value={formData.fullForm}
                  onChange={(e) => setFormData({...formData, fullForm: e.target.value})}
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  multiline
                  rows={3}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth required>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    label="Category"
                  >
                    {categories.map(cat => (
                      <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Established Date"
                  type="date"
                  value={formData.establishedDate}
                  onChange={(e) => setFormData({...formData, establishedDate: e.target.value})}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Email"
                  type="email"
                  value={formData.contactEmail}
                  onChange={(e) => setFormData({...formData, contactEmail: e.target.value})}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Contact Phone"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData({...formData, contactPhone: e.target.value})}
                />
              </Grid>
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isActive}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    />
                  }
                  label="Active"
                />
                <FormControlLabel
                  control={
                    <Switch
                      checked={formData.isPublic}
                      onChange={(e) => setFormData({...formData, isPublic: e.target.checked})}
                    />
                  }
                  label="Public"
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button
              onClick={editingDepartment ? handleUpdateDepartment : handleCreateDepartment}
              variant="contained"
            >
              {editingDepartment ? 'Update' : 'Create'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AdminLayout>
  );
};

export default DepartmentManagement;
