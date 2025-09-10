import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { DataGrid } from '@mui/x-data-grid'
import { useNavigate } from 'react-router-dom'
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
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  FormGroup
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
  ExpandMore as ExpandMoreIcon,
  Clear as ClearIcon,
  Class as ClassIcon,
  CalendarToday as CalendarIcon,
  Book as BookIcon,
  Subject as SubjectIcon
} from '@mui/icons-material'
import AdminLayout from '../../components/AdminLayout'
import { adminGetAllSubject } from '../../redux/actions/adminAction'
import toast from 'react-hot-toast'




const AdminGetSubjects = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const admin = useSelector((store) => store.admin);
  const [subjects, setSubjects] = useState([]);
  const [allSubjects, setAllSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredSubjects, setFilteredSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);
  const [anchorEl, setAnchorEl] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [showAll, setShowAll] = useState(false);
  
  // Filter states
  const [filters, setFilters] = useState({
    department: '',
    year: '',
    yearRange: [1, 5],
    dateRange: {
      start: '',
      end: ''
    },
    showAdvanced: false
  });
  const [activeFilters, setActiveFilters] = useState([]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  // Watch for Redux state changes
  useEffect(() => {
    if (admin.allSubject !== undefined) {
      const subjectData = admin.allSubject || [];
      setSubjects(subjectData);
      setAllSubjects(subjectData);
      setLoading(false);
    }
  }, [admin.allSubject]);

  // Search and filter logic
  useEffect(() => {
    console.log('AdminGetSubjects: Filtering subjects with filters:', filters);
    console.log('AdminGetSubjects: All subjects:', allSubjects);
    let filtered = allSubjects;

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(subject =>
        subject.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        subject.department?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.department) {
      filtered = filtered.filter(subject => subject.department === filters.department);
    }

    if (filters.year) {
      filtered = filtered.filter(subject => {
        // Handle both string and number year formats
        let subjectYear = subject.year;
        if (typeof subjectYear === 'string') {
          // Extract number from string like "1st Year" -> 1
          subjectYear = parseInt(subjectYear.charAt(0)) || 0;
        }
        return subjectYear === parseInt(filters.year);
      });
    }

    if (filters.yearRange[0] !== 1 || filters.yearRange[1] !== 5) {
      filtered = filtered.filter(subject => {
        // Handle both string and number year formats
        let subjectYear = subject.year;
        if (typeof subjectYear === 'string') {
          // Extract number from string like "1st Year" -> 1
          subjectYear = parseInt(subjectYear.charAt(0)) || 0;
        } else if (typeof subjectYear === 'number') {
          subjectYear = subjectYear;
        } else {
          // Fallback: try to convert to string first
          subjectYear = parseInt(String(subjectYear).charAt(0)) || 0;
        }
        
        console.log('Subject year type:', typeof subject.year, 'value:', subject.year, 'extracted:', subjectYear);
        return subjectYear >= filters.yearRange[0] && subjectYear <= filters.yearRange[1];
      });
    }

    setFilteredSubjects(filtered);
  }, [allSubjects, searchTerm, filters]);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      await dispatch(adminGetAllSubject());
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      department: '',
      year: '',
      yearRange: [1, 5],
      dateRange: { start: '', end: '' },
      showAdvanced: false
    });
    setSearchTerm('');
    setActiveFilters([]);
  };

  const handleMenuClick = (event, subject) => {
    setAnchorEl(event.currentTarget);
    setSelectedSubject(subject);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSubject(null);
  };

  const handleViewSubject = () => {
    setViewDialogOpen(true);
    handleMenuClose();
  };

  const handleEditSubject = () => {
    // Navigate to edit page or open edit dialog
    toast.success('Edit functionality coming soon!');
    handleMenuClose();
  };

  const handleDeleteSubject = () => {
    setDeleteDialogOpen(true);
    handleMenuClose();
  };

  const confirmDelete = () => {
    // Implement delete logic
    toast.success('Delete functionality coming soon!');
    setDeleteDialogOpen(false);
  };

  const getDepartmentColor = (department) => {
    const colors = {
      'C.S.E': 'primary',
      'I.T': 'secondary',
      'E.C.E': 'success',
      'Civil': 'warning',
      'Mechanical': 'error',
      'Default': 'default'
    };
    return colors[department] || 'default';
  };

  const getYearColor = (year) => {
    const colors = {
      '1': 'primary',
      '2': 'secondary',
      '3': 'success',
      '4': 'warning',
      '5': 'error'
    };
    return colors[year] || 'default';
  };

  const columns = [
    {
      field: 'subjectCode',
      headerName: 'Subject Code',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BookIcon sx={{ fontSize: 20, color: 'primary.main' }} />
          <Typography variant="body2" fontWeight={600}>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'subjectName',
      headerName: 'Subject Name',
      flex: 2,
      minWidth: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" fontWeight={500} noWrap>
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'department',
      headerName: 'Department',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getDepartmentColor(params.value)}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'year',
      headerName: 'Year',
      flex: 0.5,
      minWidth: 80,
      renderCell: (params) => (
        <Chip
          label={params.value}
          color={getYearColor(params.value)}
          size="small"
          variant="filled"
        />
      ),
    },
    {
      field: 'totalLectures',
      headerName: 'Total Lectures',
      flex: 1,
      minWidth: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <ClassIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
          <Typography variant="body2">
            {params.value}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      flex: 0.5,
      minWidth: 80,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          size="small"
          onClick={(e) => handleMenuClick(e, params.row)}
          sx={{ color: 'text.secondary' }}
        >
          <MoreVertIcon />
        </IconButton>
      ),
    },
  ];

  const rows = filteredSubjects.map((subject, index) => ({
    id: subject._id || index,
    subjectCode: subject.subjectCode || 'N/A',
    subjectName: subject.subjectName || 'N/A',
    department: subject.department || 'N/A',
    year: subject.year || 'N/A',
    totalLectures: subject.totalLectures || 0,
  }));


  if (!admin.isAuthenticated) {
    navigate('/admin/login');
    return null;
  }

  return (
    <AdminLayout>
      <Container maxWidth="xl" sx={{ py: 3 }}>
        {/* Header Section */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
            <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
              <SubjectIcon />
            </Avatar>
            <Box>
              <Typography variant="h4" fontWeight={700} color="text.primary">
                Subject Management
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage and view all subjects in the system
              </Typography>
            </Box>
          </Box>

          {/* Stats Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      <BookIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {allSubjects.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Subjects
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'success.main' }}>
                      <SchoolIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {new Set(allSubjects.map(s => s.department)).size}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Departments
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'warning.main' }}>
                      <ClassIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {allSubjects.reduce((sum, s) => sum + (s.totalLectures || 0), 0)}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Lectures
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Card sx={{ height: '100%' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Avatar sx={{ bgcolor: 'info.main' }}>
                      <FilterIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={600}>
                        {filteredSubjects.length}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Filtered Results
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>

        {/* Search and Filter Section */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={5}>
                <TextField
                  fullWidth
                  placeholder="Search subjects by name, code, or department..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon color="action" />
                      </InputAdornment>
                    ),
                    endAdornment: searchTerm && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={() => setSearchTerm('')}
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                    },
                  }}
                />
              </Grid>
              <Grid item xs={12} md={3}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select
                    value={filters.department}
                    label="Department"
                    onChange={(e) => handleFilterChange('department', e.target.value)}
                  >
                    <MenuItem value="">All Departments</MenuItem>
                    <MenuItem value="C.S.E" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>C.S.E</MenuItem>
                    <MenuItem value="E.C.E" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>E.C.E</MenuItem>
                    <MenuItem value="I.T" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>I.T</MenuItem>
                    <MenuItem value="Civil" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Civil</MenuItem>
                    <MenuItem value="Mechanical" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Mechanical</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Year</InputLabel>
                  <Select
                    value={filters.year}
                    label="Year"
                    onChange={(e) => handleFilterChange('year', e.target.value)}
                  >
                    <MenuItem value="">All Years</MenuItem>
                    <MenuItem value="1" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>1st Year</MenuItem>
                    <MenuItem value="2" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>2nd Year</MenuItem>
                    <MenuItem value="3" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>3rd Year</MenuItem>
                    <MenuItem value="4" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>4th Year</MenuItem>
                    <MenuItem value="5" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>5th Year</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Box sx={{ 
                  display: 'flex', 
                  gap: { xs: 1, sm: 1 }, 
                  justifyContent: { xs: 'center', sm: 'flex-end' },
                  width: '100%',
                  flexWrap: { xs: 'wrap', sm: 'nowrap' }
                }}>
                  <Button
                    variant="outlined"
                    startIcon={<FilterIcon sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }} />}
                    onClick={() => handleFilterChange('showAdvanced', !filters.showAdvanced)}
                    sx={{ 
                      borderRadius: { xs: 1, sm: 2 },
                      px: { xs: 1, sm: 1.5 },
                      py: { xs: 0.5, sm: 0.75 },
                      minHeight: { xs: 36, sm: 40, md: 44 },
                      fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                      width: { xs: '48%', sm: 'auto' }
                    }}
                  >
                    Advanced
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<RefreshIcon sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }} />}
                    onClick={fetchSubjects}
                    sx={{ 
                      borderRadius: { xs: 1, sm: 2 },
                      px: { xs: 1, sm: 1.5 },
                      py: { xs: 0.5, sm: 0.75 },
                      minHeight: { xs: 36, sm: 40, md: 44 },
                      fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                      width: { xs: '48%', sm: 'auto' }
                    }}
                  >
                    Refresh
                  </Button>
                </Box>
              </Grid>
            </Grid>

            {/* Advanced Filters */}
            {filters.showAdvanced && (
              <Box sx={{ 
                mt: { xs: 2, sm: 3 }, 
                pt: { xs: 1.5, sm: 2 }, 
                borderTop: 1, 
                borderColor: 'divider' 
              }}>
                <Accordion>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Advanced Filters</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" gutterBottom>
                          Year Range
                        </Typography>
                        <Slider
                          value={filters.yearRange}
                          onChange={(e, newValue) => handleFilterChange('yearRange', newValue)}
                          valueLabelDisplay="auto"
                          min={1}
                          max={5}
                          step={1}
                          marks={[
                            { value: 1, label: '1st' },
                            { value: 2, label: '2nd' },
                            { value: 3, label: '3rd' },
                            { value: 4, label: '4th' },
                            { value: 5, label: '5th' },
                          ]}
                        />
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                          <Button
                            variant="outlined"
                            onClick={handleClearFilters}
                            startIcon={<ClearIcon />}
                          >
                            Clear Filters
                          </Button>
                        </Box>
                      </Grid>
                    </Grid>
                  </AccordionDetails>
                </Accordion>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Data Grid */}
        <Card>
          <CardContent sx={{ p: 0 }}>
            {loading ? (
              <Box sx={{ p: 3 }}>
                {[...Array(5)].map((_, index) => (
                  <Skeleton key={index} variant="rectangular" height={60} sx={{ mb: 1 }} />
                ))}
              </Box>
            ) : (
              <Box sx={{ height: 600, width: '100%' }}>
                <DataGrid
                  rows={rows}
                  columns={columns}
                  pageSize={10}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  disableSelectionOnClick
                  sx={{
                    border: 0,
                    '& .MuiDataGrid-cell': {
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                      padding: { xs: '4px 8px', sm: '8px 16px' }
                    },
                    '& .MuiDataGrid-columnHeaders': {
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                      fontWeight: 600,
                      backgroundColor: 'grey.50',
                    },
                    '& .MuiDataGrid-footerContainer': {
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                    },
                    '& .MuiDataGrid-row:hover': {
                      backgroundColor: 'action.hover',
                    },
                  }}
                />
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Action Menu */}
        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleViewSubject}>
            <ListItemIcon>
              <ViewIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>View Details</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleEditSubject}>
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Subject</ListItemText>
          </MenuItem>
          <MenuItem onClick={handleDeleteSubject} sx={{ color: 'error.main' }}>
            <ListItemIcon>
              <DeleteIcon fontSize="small" color="error" />
            </ListItemIcon>
            <ListItemText>Delete Subject</ListItemText>
          </MenuItem>
        </Menu>

        {/* View Subject Dialog */}
        <Dialog
          open={viewDialogOpen}
          onClose={() => setViewDialogOpen(false)}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Subject Details</DialogTitle>
          <DialogContent>
            {selectedSubject && (
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Subject Code
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedSubject.subjectCode}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Subject Name
                  </Typography>
                  <Typography variant="body1" gutterBottom>
                    {selectedSubject.subjectName}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Department
                  </Typography>
                  <Chip
                    label={selectedSubject.department}
                    color={getDepartmentColor(selectedSubject.department)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Year
                  </Typography>
                  <Chip
                    label={selectedSubject.year}
                    color={getYearColor(selectedSubject.year)}
                    size="small"
                  />
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Lectures
                  </Typography>
                  <Typography variant="body1">
                    {selectedSubject.totalLectures}
                  </Typography>
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setViewDialogOpen(false)}>
              Close
            </Button>
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
              Are you sure you want to delete this subject? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmDelete} color="error" variant="contained">
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </AdminLayout>
  );
}

export default AdminGetSubjects
