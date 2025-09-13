import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { DataGrid } from '@mui/x-data-grid'
import { useNavigate } from 'react-router-dom'
import { useTheme } from '../../contexts/ThemeContext'
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Avatar,
  Chip,
  IconButton,
  TextField,
  InputAdornment,
  Button,
  Grid,
  Paper,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  Tooltip
} from '@mui/material'
import {
  Person as PersonIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  MoreVert as MoreVertIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  School as SchoolIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Class as ClassIcon,
  Clear as ClearIcon,
  CheckBox as CheckBoxIcon,
  CheckBoxOutlineBlank as CheckBoxOutlineBlankIcon,
  LibraryBooks as LibraryBooksIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material'
import AdminLayout from '../../components/AdminLayout'
import { adminGetAllFaculty, adminViewFaculty, adminUpdateFaculty, adminDeleteFaculty, adminBulkDeleteFaculty, getAllSubjects, assignSubjectToFaculty } from '../../redux/actions/adminAction'
import toast from 'react-hot-toast'

const AdminGetFaculty = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const admin = useSelector((store) => store.admin);
  const { darkMode } = useTheme();
  const [faculty, setFaculty] = useState([]);
  const [allFaculty, setAllFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredFaculty, setFilteredFaculty] = useState([]);
  const [selectedFaculty, setSelectedFaculty] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [assignSubjectDialogOpen, setAssignSubjectDialogOpen] = useState(false);
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectSearchTerm, setSubjectSearchTerm] = useState('');
  const [selectionModel, setSelectionModel] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [department, setDepartment] = useState('Computer Science');
  const [showAll, setShowAll] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    department: '',
    designation: '',
    experience: '',
    status: '',
    sortBy: '',
    quickAction: '',
    emailDomain: '',
    regRange: '',
    showAdvanced: false
  });
  const [activeFilters, setActiveFilters] = useState([]);

  const departments = [
    'Computer Science',
    'Information Technology',
    'Electronics & Communication',
    'Mechanical Engineering',
    'Civil Engineering',
    'Electrical Engineering',
    'Business Administration',
    'Commerce',
    'Arts',
    'Science'
  ];

  useEffect(() => {
    console.log('Component mounted, fetching faculty...');
    fetchFaculty();
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await dispatch(getAllSubjects());
      if (response.success) {
        setSubjects(response.result);
      } else {
        toast.error('Failed to fetch subjects');
      }
    } catch (error) {
      console.error('Error fetching subjects:', error);
      toast.error('Failed to fetch subjects');
    }
  };

  // Keyboard shortcut for advanced search (Ctrl/Cmd + Shift + A)
  useEffect(() => {
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'A') {
        event.preventDefault();
        handleFilterChange('showAdvanced', !filters.showAdvanced);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [filters.showAdvanced]);

  // Watch for Redux state changes
  useEffect(() => {
    if (admin.allFaculty !== undefined && admin.allFaculty.length >= 0) {
      const facultyData = admin.allFaculty || [];
      console.log('Faculty data received:', facultyData);
      setFaculty(facultyData);
      setAllFaculty(facultyData);
      setLoading(false);
    }
  }, [admin.allFaculty]);

  useEffect(() => {
    // Use allFaculty when showAll is true, otherwise use faculty
    const sourceData = showAll ? allFaculty : faculty;
    
    let filtered = sourceData.filter(facultyMember => {
      // Search term filter
      const matchesSearch = !searchTerm || 
        facultyMember.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facultyMember.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facultyMember.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facultyMember.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facultyMember.designation?.toLowerCase().includes(searchTerm.toLowerCase());

      // Department filter
      const matchesDepartment = !filters.department || 
        facultyMember.department === filters.department;

      // Designation filter
      const matchesDesignation = !filters.designation || 
        facultyMember.designation === filters.designation;

      // Experience filter (mock implementation - you can enhance based on actual data)
      const matchesExperience = !filters.experience || 
        (filters.experience === '0-2' && (!facultyMember.experience || facultyMember.experience <= 2)) ||
        (filters.experience === '3-5' && facultyMember.experience >= 3 && facultyMember.experience <= 5) ||
        (filters.experience === '6-10' && facultyMember.experience >= 6 && facultyMember.experience <= 10) ||
        (filters.experience === '10+' && facultyMember.experience > 10);

      // Status filter (mock implementation - you can enhance based on actual data)
      const matchesStatus = !filters.status || 
        (filters.status === 'Active' && facultyMember.status !== 'Inactive') ||
        (filters.status === 'On Leave' && facultyMember.status === 'On Leave') ||
        (filters.status === 'Retired' && facultyMember.status === 'Retired');

      // Email domain filter
      const matchesEmailDomain = !filters.emailDomain || 
        facultyMember.email?.includes(filters.emailDomain);

      // Registration number range filter
      const matchesRegRange = !filters.regRange || 
        (() => {
          const regNum = facultyMember.registrationNumber || '';
          const range = filters.regRange.split('-');
          if (range.length === 2) {
            const startYear = range[0];
            const endYear = range[1];
            return regNum.includes(startYear) || regNum.includes(endYear) || 
                   (regNum >= startYear && regNum <= endYear);
          }
          return regNum.includes(filters.regRange);
        })();

      return matchesSearch && matchesDepartment && matchesDesignation && matchesExperience && matchesStatus && matchesEmailDomain && matchesRegRange;
    });

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        switch (filters.sortBy) {
          case 'name':
            return (a.name || '').localeCompare(b.name || '');
          case 'name-desc':
            return (b.name || '').localeCompare(a.name || '');
          case 'department':
            return (a.department || '').localeCompare(b.department || '');
          case 'designation':
            return (a.designation || '').localeCompare(b.designation || '');
          case 'registrationNumber':
            return (a.registrationNumber || '').localeCompare(b.registrationNumber || '');
          default:
            return 0;
        }
      });
    }
    
    setFilteredFaculty(filtered);
    
    // Update active filters display
    const newActiveFilters = [];
    if (showAll) newActiveFilters.push('Showing: All Faculty');
    if (filters.department) newActiveFilters.push(`Department: ${filters.department}`);
    if (filters.designation) newActiveFilters.push(`Designation: ${filters.designation}`);
    if (filters.experience) newActiveFilters.push(`Experience: ${filters.experience}`);
    if (filters.status) newActiveFilters.push(`Status: ${filters.status}`);
    if (filters.sortBy) newActiveFilters.push(`Sort: ${filters.sortBy}`);
    if (filters.emailDomain) newActiveFilters.push(`Email Domain: ${filters.emailDomain}`);
    if (filters.regRange) newActiveFilters.push(`Reg Range: ${filters.regRange}`);
    setActiveFilters(newActiveFilters);
  }, [searchTerm, faculty, allFaculty, filters, showAll]);

  const fetchFaculty = async () => {
    try {
      console.log('Starting faculty fetch...');
      setLoading(true);
      await dispatch(adminGetAllFaculty());
      // Data will be updated via useEffect watching admin.allFaculty
    } catch (error) {
      console.error('Faculty fetch error:', error);
      toast.error('Failed to fetch faculty');
      setLoading(false);
    }
  };

  const fetchAllFaculty = async () => {
    try {
      setLoading(true);
      // Fetch all faculty - the API already returns all faculty
      await dispatch(adminGetAllFaculty());
      setShowAll(true);
      setLoading(false);
      toast.success('Loaded all faculty');
    } catch (error) {
      toast.error('Failed to fetch all faculty');
      setLoading(false);
    }
  };

  const handleDepartmentChange = (event) => {
    setDepartment(event.target.value);
  };

  const handleSearch = () => {
    fetchFaculty();
  };

  const handleViewFaculty = async (row) => {
    try {
      const id = row._id || row.id;
      const res = await dispatch(adminViewFaculty(id));
      if (res && res.payload) {
        setSelectedFaculty(res.payload);
      } else {
        setSelectedFaculty(row);
        if (res?.error?.message) toast.error(res.error.message);
      }
    } catch (e) {
      setSelectedFaculty(row);
      toast.error('Unable to load full faculty details. Showing cached data.');
    } finally {
      setIsEditMode(false);
      setViewDialogOpen(true);
    }
  };

  const handleEditFaculty = async (row) => {
    try {
      const id = row._id || row.id;
      const res = await dispatch(adminViewFaculty(id));
      if (res && res.payload) {
        setSelectedFaculty(res.payload);
      } else {
        setSelectedFaculty(row);
        if (res?.error?.message) toast.error(res.error.message);
      }
    } catch (e) {
      setSelectedFaculty(row);
    } finally {
      setIsEditMode(true);
      setViewDialogOpen(true);
    }
  };

  const handleDeleteFaculty = (row) => {
    setSelectedFaculty(row);
    setDeleteDialogOpen(true);
  };

  const handleAssignSubject = (row) => {
    setSelectedFaculty(row);
    setSelectedSubjects(row.subjects || []);
    setAssignSubjectDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedFaculty) return;
    const id = selectedFaculty._id || selectedFaculty.id;
    const res = await dispatch(adminDeleteFaculty(id));
    if (res && res.payload) {
      toast.success('Faculty deleted successfully');
    } else {
      toast.error(res?.error?.message || 'Failed to delete faculty');
    }
    setDeleteDialogOpen(false);
  };

  const confirmBulkDelete = async () => {
    if (!selectionModel.length) return;
    const res = await dispatch(adminBulkDeleteFaculty(selectionModel));
    if (res && res.payload) {
      toast.success(`Deleted ${selectionModel.length} faculty`);
      setSelectionModel([]);
    } else {
      toast.error(res?.error?.message || 'Failed to delete selected');
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      department: '',
      designation: '',
      experience: '',
      status: '',
      sortBy: '',
      quickAction: '',
      emailDomain: '',
      regRange: '',
      showAdvanced: false
    });
    setSearchTerm('');
    setShowAll(false);
  };

  const removeFilter = (filterToRemove) => {
    if (filterToRemove.startsWith('Department:')) {
      setFilters(prev => ({ ...prev, department: '' }));
    } else if (filterToRemove.startsWith('Designation:')) {
      setFilters(prev => ({ ...prev, designation: '' }));
    } else if (filterToRemove.startsWith('Experience:')) {
      setFilters(prev => ({ ...prev, experience: '' }));
    } else if (filterToRemove.startsWith('Status:')) {
      setFilters(prev => ({ ...prev, status: '' }));
    } else if (filterToRemove.startsWith('Sort:')) {
      setFilters(prev => ({ ...prev, sortBy: '' }));
    } else if (filterToRemove.startsWith('Email Domain:')) {
      setFilters(prev => ({ ...prev, emailDomain: '' }));
    } else if (filterToRemove.startsWith('Reg Range:')) {
      setFilters(prev => ({ ...prev, regRange: '' }));
    }
  };

  const handleQuickAction = (action) => {
    setFilters(prev => ({ ...prev, quickAction: '' })); // Reset the select
    
    switch (action) {
      case 'export':
        toast.success('Export functionality would be implemented here');
        break;
      case 'email':
        toast.success('Email functionality would be implemented here');
        break;
      case 'report':
        toast.success('Report generation would be implemented here');
        break;
      default:
        break;
    }
  };

    const columns = [
    {
      field: 'avatar',
      headerName: 'Avatar',
      width: 80,
      renderCell: (params) => (
        <Avatar
          src={params.row?.avatar?.url || undefined}
          sx={{ width: 40, height: 40 }}
        >
          <PersonIcon />
        </Avatar>
      ),
      sortable: false,
      filterable: false,
    },
    {
      field: 'name',
      headerName: 'Name',
      width: 220,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }} noWrap>
            {params.row.name}
          </Typography>
        </Box>
      ),
    },
    { field: 'registrationNumber', headerName: 'Reg. No.', width: 160 },
    { field: 'joiningYear', headerName: 'Joined', width: 110 },
    {
      field: 'email',
      headerName: 'Email',
      width: 250,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <EmailIcon color="primary" sx={{ fontSize: 16 }} />
          <Typography variant="body2">
            {params.row.email}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'designation',
      headerName: 'Designation',
      width: 180,
      renderCell: (params) => (
        <Chip
          label={params.row.designation}
          color="primary"
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      field: 'department',
      headerName: 'Department',
      width: 180,
      renderCell: (params) => (
        <Chip
          label={params.row.department}
          color="secondary"
          size="small"
        />
      ),
    },
    {
      field: 'facultyMobileNumber',
      headerName: 'Contact',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhoneIcon color="primary" sx={{ fontSize: 16 }} />
          <Typography variant="body2">
            {params.row.facultyMobileNumber}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Action',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View"><IconButton size="small" onClick={() => handleViewFaculty(params.row)}><ViewIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Update"><IconButton size="small" onClick={() => handleEditFaculty(params.row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDeleteFaculty(params.row)}><DeleteIcon fontSize="small" color="error" /></IconButton></Tooltip>
          <Tooltip title="Assign Subjects">
            <IconButton 
              size="small" 
              onClick={() => navigate('/admin/assign-subject', { state: { selectedFaculty: params.row } })}
            >
              <ClassIcon fontSize="small" color="primary" />
            </IconButton>
          </Tooltip>
        </Box>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  const getRowId = (row) => row._id || row.id;

  if (loading) {
    return (
      <AdminLayout title="Faculty">
        <Box sx={{ p: 3 }}>
          <Container maxWidth="xl">
            <Skeleton variant="rectangular" height={400} />
          </Container>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Faculty Management">
      <Box sx={{ 
        p: { xs: 0.25, sm: 0.5, md: 1, lg: 1.5 },
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        <Container 
          maxWidth="xl"
          sx={{
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
        >
          {/* Header */}
          <Box sx={{ 
            mb: { xs: 0.75, sm: 1.5, md: 2 },
            p: { xs: 0.25, sm: 1 }
          }}>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' },
              mb: { xs: 1, sm: 1.5 },
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 2, sm: 0 }
            }}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography 
                  variant="h4" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 'bold', 
                    mb: { xs: 0.5, sm: 1 },
                    fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2rem', lg: '2.5rem' },
                    lineHeight: 1.2
                  }}
                >
                  Faculty Management
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                    lineHeight: 1.4
                  }}
                >
                  Manage and view all faculty information
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                gap: { xs: 1, sm: 1.5, md: 2 },
                flexDirection: { xs: 'column', sm: 'row' },
                width: { xs: '100%', sm: 'auto' }
              }}>
                <Button
                  variant="outlined"
                  startIcon={<PersonIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
                  onClick={fetchAllFaculty}
                  disabled={loading}
                  sx={{
                    borderRadius: { xs: 1, sm: 2 },
                    px: { xs: 1.25, sm: 1.5, md: 2 },
                    py: { xs: 0.5, sm: 0.75, md: 1 },
                    minHeight: { xs: 36, sm: 40, md: 44 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                    width: { xs: '100%', sm: 'auto' },
                    borderColor: '#1976d2',
                    color: '#1976d2',
                    '&:hover': {
                      borderColor: '#1565c0',
                      backgroundColor: 'rgba(25, 118, 210, 0.04)',
                    }
                  }}
                >
                  {showAll ? 'Viewing All' : 'See All Faculty'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
                  onClick={() => navigate('/admin/add/faculties')}
                  sx={{
                    borderRadius: { xs: 1, sm: 2 },
                    px: { xs: 1.25, sm: 1.5, md: 2 },
                    py: { xs: 0.5, sm: 0.75, md: 1 },
                    minHeight: { xs: 36, sm: 40, md: 44 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                    width: { xs: '100%', sm: 'auto' },
                    background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)',
                    }
                  }}
                >
                  Add Faculty
                </Button>
                <Button
                  variant="contained"
                  startIcon={<ClassIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
                  onClick={() => navigate('/admin/assign-subject')}
                  sx={{
                    borderRadius: { xs: 1, sm: 2 },
                    px: { xs: 1.25, sm: 1.5, md: 2 },
                    py: { xs: 0.5, sm: 0.75, md: 1 },
                    minHeight: { xs: 36, sm: 40, md: 44 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                    width: { xs: '100%', sm: 'auto' },
                    background: 'linear-gradient(45deg, #1976d2 30%, #64b5f6 90%)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                    }
                  }}
                >
                  Assign Subject
                </Button>
              </Box>
            </Box>

            {/* Search and Filter Bar */}
            <Paper sx={{ 
              p: { xs: 0.5, sm: 0.75, md: 1 }, 
              mb: { xs: 1, sm: 1.5 }, 
              borderRadius: { xs: 1, sm: 2 },
              width: '100%',
              boxSizing: 'border-box'
            }}>
              <Grid container spacing={{ xs: 0.75, sm: 1 }} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <TextField
                    fullWidth
                    placeholder="Search faculty..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon 
                            color="primary" 
                            sx={{ fontSize: { xs: '1rem', sm: '1.25rem' } }}
                          />
                        </InputAdornment>
                      ),
                    }}
                    sx={{ 
                      borderRadius: { xs: 1, sm: 2 },
                      '& .MuiInputBase-root': {
                        minHeight: { xs: 36, sm: 40, md: 44 }
                      }
                    }}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Department</InputLabel>
                    <Select
                      value={filters.department}
                      onChange={(e) => handleFilterChange('department', e.target.value)}
                      label="Department"
                    >
                      <MenuItem value="">All Departments</MenuItem>
                      {departments.map((dept) => (
                        <MenuItem key={dept} value={dept}>
                          {dept}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel>Designation</InputLabel>
                    <Select
                      value={filters.designation}
                      onChange={(e) => handleFilterChange('designation', e.target.value)}
                      label="Designation"
                    >
                      <MenuItem value="">All Designations</MenuItem>
                      <MenuItem value="Professor">Professor</MenuItem>
                      <MenuItem value="Associate Professor">Associate Professor</MenuItem>
                      <MenuItem value="Assistant Professor">Assistant Professor</MenuItem>
                      <MenuItem value="Lecturer">Lecturer</MenuItem>
                      <MenuItem value="Senior Lecturer">Senior Lecturer</MenuItem>
                      <MenuItem value="Head of Department">Head of Department</MenuItem>
                      <MenuItem value="Dean">Dean</MenuItem>
                      <MenuItem value="Director">Director</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} md={3}>
                  <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                    <Tooltip title="Advanced Search (Ctrl+Shift+A)">
                      <Button
                        variant="outlined"
                        startIcon={<FilterIcon />}
                        onClick={() => handleFilterChange('showAdvanced', !filters.showAdvanced)}
                        sx={{ borderRadius: 2 }}
                      >
                        Advanced
                      </Button>
                    </Tooltip>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={fetchFaculty}
                      sx={{ borderRadius: 2 }}
                    >
                      Refresh
                    </Button>
                  </Box>
                </Grid>
              </Grid>

              {/* Advanced Search Panel */}
              {filters.showAdvanced && (
                <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #e0e0e0' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ color: 'primary.main' }}>
                      Advanced Search Options
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Use multiple filters to narrow down results
                    </Typography>
                  </Box>
                  <Grid container spacing={1}>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Experience Range</InputLabel>
                        <Select
                          value={filters.experience || ''}
                          onChange={(e) => handleFilterChange('experience', e.target.value)}
                          label="Experience Range"
                        >
                          <MenuItem value="">All Experience Levels</MenuItem>
                          <MenuItem value="0-2">0-2 years</MenuItem>
                          <MenuItem value="3-5">3-5 years</MenuItem>
                          <MenuItem value="6-10">6-10 years</MenuItem>
                          <MenuItem value="10+">10+ years</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Status</InputLabel>
                        <Select
                          value={filters.status || ''}
                          onChange={(e) => handleFilterChange('status', e.target.value)}
                          label="Status"
                        >
                          <MenuItem value="">All Status</MenuItem>
                          <MenuItem value="Active">Active</MenuItem>
                          <MenuItem value="On Leave">On Leave</MenuItem>
                          <MenuItem value="Retired">Retired</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Sort By</InputLabel>
                        <Select
                          value={filters.sortBy || ''}
                          onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                          label="Sort By"
                        >
                          <MenuItem value="">Default</MenuItem>
                          <MenuItem value="name">Name (A-Z)</MenuItem>
                          <MenuItem value="name-desc">Name (Z-A)</MenuItem>
                          <MenuItem value="department">Department</MenuItem>
                          <MenuItem value="designation">Designation</MenuItem>
                          <MenuItem value="registrationNumber">Registration Number</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Quick Actions</InputLabel>
                        <Select
                          value={filters.quickAction || ''}
                          onChange={(e) => handleQuickAction(e.target.value)}
                          label="Quick Actions"
                        >
                          <MenuItem value="">Select Action</MenuItem>
                          <MenuItem value="export">Export Selected</MenuItem>
                          <MenuItem value="email">Send Email to All</MenuItem>
                          <MenuItem value="report">Generate Report</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Search by Email Domain"
                        placeholder="e.g., @university.edu"
                        value={filters.emailDomain || ''}
                        onChange={(e) => handleFilterChange('emailDomain', e.target.value)}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <TextField
                        fullWidth
                        label="Registration Number Range"
                        placeholder="e.g., 2020-2024"
                        value={filters.regRange || ''}
                        onChange={(e) => handleFilterChange('regRange', e.target.value)}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Found {filteredFaculty.length} faculty members with current filters
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <Button
                        variant="outlined"
                        onClick={() => handleFilterChange('showAdvanced', false)}
                      >
                        Close Advanced
                      </Button>
                      <Button
                        variant="contained"
                        onClick={clearAllFilters}
                        startIcon={<ClearIcon />}
                      >
                        Reset All Filters
                      </Button>
                    </Box>
                  </Box>
                </Box>
              )}

              {/* Active Filters */}
              {activeFilters.length > 0 && (
                <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #e0e0e0' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="body2" color="text.secondary">
                      Active filters:
                    </Typography>
                    {activeFilters.map((filter, index) => (
                      <Chip
                        key={index}
                        label={filter}
                        onDelete={() => removeFilter(filter)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                    <Button
                      size="small"
                      startIcon={<ClearIcon />}
                      onClick={clearAllFilters}
                      sx={{ ml: 1 }}
                    >
                      Clear All
                    </Button>
                  </Box>
                </Box>
              )}
            </Paper>
          </Box>

          {/* Statistics Cards */}
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)', 
                color: 'white',
                boxShadow: darkMode ? 'none' : '0 4px 8px rgba(0,0,0,0.1)',
                transition: darkMode ? 'none' : 'all 0.3s ease'
              }}>
                <CardContent sx={{ py: 1, px: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {filteredFaculty.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: darkMode ? 0.8 : 0.9 }}>
                        {showAll ? 'All Faculty' : 'Filtered Faculty'}
                      </Typography>
                      {!showAll && allFaculty.length > 0 && (
                        <Typography variant="caption" sx={{ opacity: darkMode ? 0.6 : 0.7 }}>
                          of {allFaculty.length} total
                        </Typography>
                      )}
                    </Box>
                    <PersonIcon sx={{ fontSize: 40, opacity: darkMode ? 0.6 : 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)', 
                color: 'white',
                boxShadow: darkMode ? 'none' : '0 4px 8px rgba(0,0,0,0.1)',
                transition: darkMode ? 'none' : 'all 0.3s ease'
              }}>
                <CardContent sx={{ py: 1, px: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {filteredFaculty.filter(f => f.designation === 'Professor').length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: darkMode ? 0.8 : 0.9 }}>
                        Professors
                      </Typography>
                      {!showAll && allFaculty.length > 0 && (
                        <Typography variant="caption" sx={{ opacity: darkMode ? 0.6 : 0.7 }}>
                          of {allFaculty.filter(f => f.designation === 'Professor').length} total
                        </Typography>
                      )}
                    </Box>
                    <WorkIcon sx={{ fontSize: 40, opacity: darkMode ? 0.6 : 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                background: 'linear-gradient(45deg, #FF9800 30%, #FFC107 90%)', 
                color: 'white',
                boxShadow: darkMode ? 'none' : '0 4px 8px rgba(0,0,0,0.1)',
                transition: darkMode ? 'none' : 'all 0.3s ease'
              }}>
                <CardContent sx={{ py: 1, px: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {new Set(filteredFaculty.map(f => f.department)).size}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: darkMode ? 0.8 : 0.9 }}>
                        Departments
                      </Typography>
                      {!showAll && allFaculty.length > 0 && (
                        <Typography variant="caption" sx={{ opacity: darkMode ? 0.6 : 0.7 }}>
                          of {new Set(allFaculty.map(f => f.department)).size} total
                        </Typography>
                      )}
                    </Box>
                    <SchoolIcon sx={{ fontSize: 40, opacity: darkMode ? 0.6 : 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ 
                borderRadius: 2, 
                background: 'linear-gradient(45deg, #9C27B0 30%, #E91E63 90%)', 
                color: 'white',
                boxShadow: darkMode ? 'none' : '0 4px 8px rgba(0,0,0,0.1)',
                transition: darkMode ? 'none' : 'all 0.3s ease'
              }}>
                <CardContent sx={{ py: 1, px: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {filteredFaculty.filter(f => f.designation === 'Assistant Professor').length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: darkMode ? 0.8 : 0.9 }}>
                        Assistant Professors
                      </Typography>
                      {!showAll && allFaculty.length > 0 && (
                        <Typography variant="caption" sx={{ opacity: darkMode ? 0.6 : 0.7 }}>
                          of {allFaculty.filter(f => f.designation === 'Assistant Professor').length} total
                        </Typography>
                      )}
                    </Box>
                    <PersonIcon sx={{ fontSize: 40, opacity: darkMode ? 0.6 : 0.8 }} />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          {/* Data Grid */}
          <Card sx={{ 
            borderRadius: { xs: 2, sm: 3 }, 
            boxShadow: darkMode 
              ? 'none' 
              : { xs: 1, sm: 2, md: '0 8px 32px rgba(0,0,0,0.1)' },
            width: '100%',
            boxSizing: 'border-box',
            transition: darkMode ? 'none' : 'all 0.3s ease'
          }}>
            <CardContent sx={{ 
              p: 0,
              '&:last-child': { pb: 0 }
            }}>
              <Box sx={{ 
                height: { xs: 400, sm: 500, md: 600 }, 
                width: '100%',
                minHeight: 300
              }}>
                <DataGrid
                  rows={filteredFaculty}
                  columns={columns}
                  getRowId={getRowId}
                  pageSize={10}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  checkboxSelection
                  onSelectionModelChange={(newSelection) => setSelectionModel(newSelection)}
                  selectionModel={selectionModel}
                  disableSelectionOnClick
                  onRowDoubleClick={(params) => handleViewFaculty(params.row)}
                  sx={{
                    border: 'none',
                    '& .MuiDataGrid-cell': {
                      borderBottom: darkMode ? '1px solid #333' : '1px solid #f0f0f0',
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                      padding: { xs: '4px 8px', sm: '8px 16px' }
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      backgroundColor: darkMode ? '#2d3748' : '#f8f9fa',
                      borderBottom: darkMode ? '2px solid #333' : '2px solid #e0e0e0',
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                      fontWeight: 600
                    },
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: darkMode ? '#374151' : '#f5f5f5',
                      transition: darkMode ? 'none' : 'background-color 0.2s ease'
                    },
                    '& .MuiDataGrid-footerContainer': {
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                    },
                    '& .MuiTablePagination-root': {
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                    }
                  }}
                />
              </Box>
            </CardContent>
          </Card>
    </Container>
      </Box>

      {/* Bulk actions */}
      {selectionModel.length > 0 && (
        <Box sx={{ position: 'fixed', bottom: 16, right: 16, display: 'flex', gap: 1 }}>
          <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={confirmBulkDelete}>
            Delete Selected ({selectionModel.length})
          </Button>
        </Box>
      )}

      {/* View/Edit Faculty Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={selectedFaculty?.avatar?.url || undefined}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedFaculty?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedFaculty?.registrationNumber}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedFaculty && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                {isEditMode ? (
                  <TextField fullWidth size="small" value={selectedFaculty.email || ''} onChange={(e) => setSelectedFaculty({ ...selectedFaculty, email: e.target.value })} sx={{ mb: 2 }} />
                ) : (
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedFaculty.email || '-'}</Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Designation</Typography>
                {isEditMode ? (
                  <TextField fullWidth size="small" value={selectedFaculty.designation || ''} onChange={(e) => setSelectedFaculty({ ...selectedFaculty, designation: e.target.value })} sx={{ mb: 2 }} />
                ) : (
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedFaculty.designation || '-'}</Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Department</Typography>
                {isEditMode ? (
                  <TextField fullWidth size="small" value={selectedFaculty.department || ''} onChange={(e) => setSelectedFaculty({ ...selectedFaculty, department: e.target.value })} sx={{ mb: 2 }} />
                ) : (
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedFaculty.department || '-'}</Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Contact</Typography>
                {isEditMode ? (
                  <TextField fullWidth size="small" value={selectedFaculty.facultyMobileNumber || ''} onChange={(e) => setSelectedFaculty({ ...selectedFaculty, facultyMobileNumber: e.target.value })} sx={{ mb: 2 }} />
                ) : (
                  <Typography variant="body1" sx={{ mb: 2 }}>{selectedFaculty.facultyMobileNumber || '-'}</Typography>
                )}
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Registration Number</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedFaculty.registrationNumber || '-'}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Joining Year</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedFaculty.joiningYear || '-'}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
          {!isEditMode && selectedFaculty && (
            <Button variant="outlined" onClick={() => setIsEditMode(true)}>Edit</Button>
          )}
          {isEditMode && selectedFaculty && (
            <Button onClick={async () => {
              const id = selectedFaculty._id || selectedFaculty.id;
              const { name, email, designation, department, facultyMobileNumber } = selectedFaculty;
              const res = await dispatch(adminUpdateFaculty(id, { name, email, designation, department, facultyMobileNumber }));
              if (res && res.payload) {
                toast.success('Faculty updated');
                setIsEditMode(false);
                setViewDialogOpen(false);
              } else {
                toast.error(res?.error?.message || 'Failed to update faculty');
              }
            }} variant="contained">Save Changes</Button>
          )}
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedFaculty?.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Subject Assignment Dialog */}
      <Dialog
        open={assignSubjectDialogOpen}
        onClose={() => {
          setAssignSubjectDialogOpen(false);
          setSelectedSubjects([]);
          setSubjectSearchTerm('');
        }}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
            <AssignmentIcon color="primary" />
            <Typography variant="h6">
              Assign Subjects to Faculty
            </Typography>
          </Box>
          {selectedFaculty && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 1 }}>
              <Avatar src={selectedFaculty?.avatar?.url}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>
                  {selectedFaculty.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedFaculty.department} • {selectedFaculty.designation}
                </Typography>
              </Box>
            </Box>
          )}
        </DialogTitle>

        <DialogContent sx={{ py: 2 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                variant="outlined"
                placeholder="Search subjects by name or code..."
                value={subjectSearchTerm}
                onChange={(e) => setSubjectSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  )
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Paper variant="outlined" sx={{ p: 2, maxHeight: 400, overflow: 'auto' }}>
                <Grid container spacing={1}>
                  {subjects
                    .filter(subject => 
                      subject.subjectName.toLowerCase().includes(subjectSearchTerm.toLowerCase()) ||
                      subject.subjectCode.toLowerCase().includes(subjectSearchTerm.toLowerCase())
                    )
                    .map((subject) => (
                      <Grid item xs={12} sm={6} key={subject._id}>
                        <Paper
                          variant="outlined"
                          sx={{
                            p: 1,
                            display: 'flex',
                            alignItems: 'center',
                            cursor: 'pointer',
                            bgcolor: selectedSubjects.includes(subject._id) ? 'action.selected' : 'background.paper',
                            '&:hover': {
                              bgcolor: 'action.hover',
                            },
                          }}
                          onClick={() => {
                            setSelectedSubjects(prev => 
                              prev.includes(subject._id)
                                ? prev.filter(id => id !== subject._id)
                                : [...prev, subject._id]
                            );
                          }}
                        >
                          {selectedSubjects.includes(subject._id) ? (
                            <CheckBoxIcon color="primary" sx={{ mr: 1 }} />
                          ) : (
                            <CheckBoxOutlineBlankIcon sx={{ mr: 1 }} />
                          )}
                          <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                              {subject.subjectName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              Code: {subject.subjectCode}
                            </Typography>
                          </Box>
                          <Chip
                            size="small"
                            label={subject.department}
                            color="primary"
                            variant="outlined"
                          />
                        </Paper>
                      </Grid>
                    ))}
                </Grid>
              </Paper>
            </Grid>

            {selectedSubjects.length > 0 && (
              <Grid item xs={12}>
                <Paper variant="outlined" sx={{ p: 1, bgcolor: 'background.default' }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>
                    Selected Subjects ({selectedSubjects.length}):
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selectedSubjects.map(subjectId => {
                      const subject = subjects.find(s => s._id === subjectId);
                      return (
                        <Chip
                          key={subjectId}
                          label={`${subject?.subjectName} (${subject?.subjectCode})`}
                          onDelete={() => {
                            setSelectedSubjects(prev => prev.filter(id => id !== subjectId));
                          }}
                          size="small"
                        />
                      );
                    })}
                  </Box>
                </Paper>
              </Grid>
            )}
          </Grid>
        </DialogContent>

        <DialogActions sx={{ px: 3, py: 2, borderTop: 1, borderColor: 'divider' }}>
          <Button
            onClick={() => {
              setAssignSubjectDialogOpen(false);
              setSelectedSubjects([]);
              setSubjectSearchTerm('');
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={selectedSubjects.length === 0}
            onClick={async () => {
              try {
                const response = await dispatch(assignSubjectToFaculty(selectedFaculty._id, selectedSubjects));
                if (response.success) {
                  toast.success('Subjects assigned successfully');
                  fetchFaculty();  // Refresh faculty list
                  setAssignSubjectDialogOpen(false);
                  setSelectedSubjects([]);
                  setSubjectSearchTerm('');
                } else {
                  toast.error(response.error?.message || 'Failed to assign subjects');
                }
              } catch (error) {
                console.error('Error assigning subjects:', error);
                toast.error('Failed to assign subjects');
              }
            }}
            startIcon={<AssignmentIcon />}
          >
            Assign Selected Subjects
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminGetFaculty;