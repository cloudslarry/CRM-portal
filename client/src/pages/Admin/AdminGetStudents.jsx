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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Tooltip
} from '@mui/material'
import {
  Person as PersonIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
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
  CalendarToday as CalendarIcon
} from '@mui/icons-material'
import AdminLayout from '../../components/AdminLayout'
import { adminGetAllStudent, adminDeleteStudent } from '../../redux/actions/adminAction'
import toast from 'react-hot-toast'

const AdminGetStudents = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const admin = useSelector((store) => store.admin);
  const { darkMode } = useTheme();
  const [students, setStudents] = useState([]);
  const [allStudents, setAllStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
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
    console.log('Component mounted, fetching students...');
    fetchStudents();
  }, []);

  // Watch for Redux state changes
  useEffect(() => {
    if (admin.allStudent !== undefined && admin.allStudent.length >= 0) {
      const studentData = admin.allStudent || [];
      console.log('Student data received:', studentData);
      setStudents(studentData);
      setAllStudents(studentData);
      setLoading(false);
    }
  }, [admin.allStudent]);

  useEffect(() => {
    // Use allStudents when showAll is true, otherwise use students
    const sourceData = showAll ? allStudents : students;
    
    let filtered = sourceData.filter(student => {
      // Search term filter
      const matchesSearch = !searchTerm || 
        student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchTerm.toLowerCase());

      // Department filter
      const matchesDepartment = !filters.department || 
        student.department === filters.department;

      // Year filter
      const matchesYear = !filters.year || 
        student.year === filters.year;

      // Year range filter
      let yearNumber = 0;
      if (student.year) {
        console.log('Student year type:', typeof student.year, 'value:', student.year);
        if (typeof student.year === 'string') {
          yearNumber = parseInt(student.year.charAt(0));
        } else if (typeof student.year === 'number') {
          yearNumber = student.year;
        } else {
          // Try to convert to string first, then extract first character
          yearNumber = parseInt(String(student.year).charAt(0));
        }
        console.log('Extracted year number:', yearNumber);
      }
      const matchesYearRange = yearNumber >= filters.yearRange[0] && yearNumber <= filters.yearRange[1];

      // Date range filter (if dateOfBirth exists)
      let matchesDateRange = true;
      if (filters.dateRange.start && student.dateOfBirth) {
        const studentDate = new Date(student.dateOfBirth);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        matchesDateRange = studentDate >= startDate && studentDate <= endDate;
      }

      return matchesSearch && matchesDepartment && matchesYear && matchesYearRange && matchesDateRange;
    });
    
    setFilteredStudents(filtered);
    
    // Update active filters display
    const newActiveFilters = [];
    if (showAll) newActiveFilters.push('Showing: All Students');
    if (filters.department) newActiveFilters.push(`Department: ${filters.department}`);
    if (filters.year) newActiveFilters.push(`Year: ${filters.year}`);
    if (filters.yearRange[0] !== 1 || filters.yearRange[1] !== 5) {
      newActiveFilters.push(`Year Range: ${filters.yearRange[0]} - ${filters.yearRange[1]}`);
    }
    if (filters.dateRange.start) newActiveFilters.push(`Date: ${filters.dateRange.start} - ${filters.dateRange.end}`);
    setActiveFilters(newActiveFilters);
  }, [searchTerm, students, allStudents, filters, showAll]);

  const fetchStudents = async () => {
    if (loading) return; // Prevent multiple simultaneous requests
    try {
      console.log('Starting student fetch...');
      setLoading(true);
      await dispatch(adminGetAllStudent());
      // Data will be updated via useEffect watching admin.allStudent
    } catch (error) {
      console.error('Student fetch error:', error);
      toast.error('Failed to fetch students');
      setLoading(false);
    }
  };

  const fetchAllStudents = async () => {
    if (loading) return; // Prevent multiple simultaneous requests
    try {
      setLoading(true);
      // Fetch all students without any department filter
      await dispatch(adminGetAllStudent());
      setShowAll(true);
      // Data will be updated via useEffect watching admin.allStudent
      toast.success('Loaded all students');
    } catch (error) {
      toast.error('Failed to fetch all students');
      setLoading(false);
    }
  };

  const handleViewStudent = (row) => {
    setSelectedStudent(row);
    setViewDialogOpen(true);
  };

  const handleEditStudent = (row) => {
    const id = row._id || row.id;
    navigate(`/admin/edit/student/${id}`);
  };

  const handleDeleteStudent = (row) => {
    setSelectedStudent(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedStudent?._id && !selectedStudent?.id) return;
    const id = selectedStudent._id || selectedStudent.id;
    const result = await dispatch(adminDeleteStudent(id));
    if (!result.error) {
      toast.success('Student deleted successfully');
      setDeleteDialogOpen(false);
      setSelectedStudent(null);
      fetchStudents();
    } else {
      toast.error(result.error?.message || 'Failed to delete student');
    }
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleYearRangeChange = (event, newValue) => {
    setFilters(prev => ({
      ...prev,
      yearRange: newValue
    }));
  };

  const clearAllFilters = () => {
    setFilters({
      department: '',
      year: '',
      yearRange: [1, 5],
      dateRange: {
        start: '',
        end: ''
      },
      showAdvanced: false
    });
    setSearchTerm('');
    setShowAll(false);
  };

  const removeFilter = (filterToRemove) => {
    if (filterToRemove.startsWith('Department:')) {
      setFilters(prev => ({ ...prev, department: '' }));
    } else if (filterToRemove.startsWith('Year:')) {
      setFilters(prev => ({ ...prev, year: '' }));
    } else if (filterToRemove.startsWith('Year Range:')) {
      setFilters(prev => ({ ...prev, yearRange: [1, 5] }));
    } else if (filterToRemove.startsWith('Date:')) {
      setFilters(prev => ({ 
        ...prev, 
        dateRange: { start: '', end: '' } 
      }));
    }
  };

    const columns = [
    {
      field: 'avatar',
      headerName: 'Avatar',
      width: 80,
      renderCell: (params) => (
        <Avatar
          src={params.row.avatar}
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
      width: 200,
      renderCell: (params) => (
        <Box>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {params.row.name}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {params.row.registrationNumber}
          </Typography>
        </Box>
      ),
    },
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
      field: 'department',
      headerName: 'Department',
      width: 180,
      renderCell: (params) => (
        <Chip
          label={params.row.department}
          color="primary"
          variant="outlined"
          size="small"
        />
      ),
    },
    {
      field: 'year',
      headerName: 'Year',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.year}
          color="secondary"
          size="small"
        />
      ),
    },
    {
      field: 'contactNumber',
      headerName: 'Contact',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PhoneIcon color="primary" sx={{ fontSize: 16 }} />
          <Typography variant="body2">
            {params.row.contactNumber}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Action',
      width: 140,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View"><IconButton size="small" onClick={() => handleViewStudent(params.row)}><ViewIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Update"><IconButton size="small" onClick={() => handleEditStudent(params.row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDeleteStudent(params.row)}><DeleteIcon fontSize="small" color="error" /></IconButton></Tooltip>
        </Box>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  const getRowId = (row) => row._id || row.id;

  if (loading) {
    return (
      <AdminLayout title="Students">
        <Box sx={{ p: 3 }}>
          <Container maxWidth="xl">
            <Skeleton variant="rectangular" height={400} />
          </Container>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Students Management">
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
            mb: { xs: 1, sm: 1.5, md: 2 },
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
                  Students Management
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                    lineHeight: 1.4
                  }}
                >
                  Manage and view all student information
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
                  onClick={fetchAllStudents}
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
                  {showAll ? 'Viewing All' : 'See All Students'}
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
                  onClick={() => navigate('/admin/add/students')}
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
                  Add Student
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
                <Grid item xs={12} sm={6} md={4}>
                  <TextField
                    fullWidth
                    placeholder="Search students..."
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
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Department</InputLabel>
                    <Select
                      value={filters.department}
                      onChange={(e) => handleFilterChange('department', e.target.value)}
                      label="Department"
                      sx={{
                        minHeight: { xs: 36, sm: 40, md: 44 },
                        '& .MuiSelect-select': {
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }
                      }}
                    >
                      <MenuItem value="" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>All Departments</MenuItem>
                      <MenuItem value="Computer Science" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Computer Science</MenuItem>
                      <MenuItem value="Information Technology" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Information Technology</MenuItem>
                      <MenuItem value="Electronics & Communication" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Electronics & Communication</MenuItem>
                      <MenuItem value="Mechanical Engineering" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Mechanical Engineering</MenuItem>
                      <MenuItem value="Civil Engineering" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Civil Engineering</MenuItem>
                      <MenuItem value="Electrical Engineering" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Electrical Engineering</MenuItem>
                      <MenuItem value="Business Administration" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Business Administration</MenuItem>
                      <MenuItem value="Commerce" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Commerce</MenuItem>
                      <MenuItem value="Arts" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Arts</MenuItem>
                      <MenuItem value="Science" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Science</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Year</InputLabel>
                    <Select
                      value={filters.year}
                      onChange={(e) => handleFilterChange('year', e.target.value)}
                      label="Year"
                      sx={{
                        minHeight: { xs: 36, sm: 40, md: 44 },
                        '& .MuiSelect-select': {
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }
                      }}
                    >
                      <MenuItem value="" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>All Years</MenuItem>
                      <MenuItem value="1st Year" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>1st Year</MenuItem>
                      <MenuItem value="2nd Year" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>2nd Year</MenuItem>
                      <MenuItem value="3rd Year" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>3rd Year</MenuItem>
                      <MenuItem value="4th Year" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>4th Year</MenuItem>
                      <MenuItem value="5th Year" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>5th Year</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Box sx={{ 
                    display: 'flex', 
                    gap: { xs: 1, sm: 1.25 }, 
                    justifyContent: { xs: 'center', sm: 'flex-end' },
                    width: '100%'
                  }}>
                    <Button
                      variant="outlined"
                      startIcon={<FilterIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
                      onClick={() => handleFilterChange('showAdvanced', !filters.showAdvanced)}
                      sx={{ 
                        borderRadius: { xs: 1, sm: 2 },
                        px: { xs: 1.25, sm: 1.5 },
                        py: { xs: 0.5, sm: 0.75 },
                        minHeight: { xs: 36, sm: 40, md: 44 },
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                        width: { xs: '100%', sm: 'auto' }
                      }}
                    >
                      Advanced
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
                      onClick={fetchStudents}
                      sx={{ 
                        borderRadius: { xs: 1, sm: 2 },
                        px: { xs: 1.25, sm: 1.5 },
                        py: { xs: 0.5, sm: 0.75 },
                        minHeight: { xs: 36, sm: 40, md: 44 },
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                        width: { xs: '100%', sm: 'auto' }
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
                  mt: { xs: 1, sm: 1.5 }, 
                  pt: { xs: 1, sm: 1.25 }, 
                  borderTop: '1px solid #e0e0e0' 
                }}>
                  <Grid container spacing={{ xs: 1, sm: 1.5 }}>
                    <Grid item xs={12} md={6}>
                      <Typography 
                        variant="subtitle2" 
                        sx={{ 
                          mb: { xs: 0.75, sm: 1.5 },
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }}
                      >
                        Year Range: {filters.yearRange[0]} - {filters.yearRange[1]}
                      </Typography>
                      <Slider
                        value={filters.yearRange}
                        onChange={handleYearRangeChange}
                        valueLabelDisplay="auto"
                        min={1}
                        max={5}
                        marks={[
                          { value: 1, label: '1st' },
                          { value: 2, label: '2nd' },
                          { value: 3, label: '3rd' },
                          { value: 4, label: '4th' },
                          { value: 5, label: '5th' }
                        ]}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle2" sx={{ mb: 2 }}>
                        Date of Birth Range
                      </Typography>
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            type="date"
                            label="Start Date"
                            value={filters.dateRange.start}
                            onChange={(e) => handleFilterChange('dateRange', {
                              ...filters.dateRange,
                              start: e.target.value
                            })}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            fullWidth
                            type="date"
                            label="End Date"
                            value={filters.dateRange.end}
                            onChange={(e) => handleFilterChange('dateRange', {
                              ...filters.dateRange,
                              end: e.target.value
                            })}
                            InputLabelProps={{ shrink: true }}
                          />
                        </Grid>
                      </Grid>
                    </Grid>
                  </Grid>
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
                        {filteredStudents.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: darkMode ? 0.8 : 0.9 }}>
                        {showAll ? 'All Students' : 'Filtered Students'}
                      </Typography>
                      {!showAll && allStudents.length > 0 && (
                        <Typography variant="caption" sx={{ opacity: darkMode ? 0.6 : 0.7 }}>
                          of {allStudents.length} total
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
                        {filteredStudents.filter(s => s.year === '1st Year').length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: darkMode ? 0.8 : 0.9 }}>
                        First Year
                      </Typography>
                      {!showAll && allStudents.length > 0 && (
                        <Typography variant="caption" sx={{ opacity: darkMode ? 0.6 : 0.7 }}>
                          of {allStudents.filter(s => s.year === '1st Year').length} total
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
                background: 'linear-gradient(45deg, #FF9800 30%, #FFC107 90%)', 
                color: 'white',
                boxShadow: darkMode ? 'none' : '0 4px 8px rgba(0,0,0,0.1)',
                transition: darkMode ? 'none' : 'all 0.3s ease'
              }}>
                <CardContent sx={{ py: 1, px: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {new Set(filteredStudents.map(s => s.department)).size}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: darkMode ? 0.8 : 0.9 }}>
                        Departments
                      </Typography>
                      {!showAll && allStudents.length > 0 && (
                        <Typography variant="caption" sx={{ opacity: darkMode ? 0.6 : 0.7 }}>
                          of {new Set(allStudents.map(s => s.department)).size} total
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
                        {filteredStudents.filter(s => s.year === '4th Year').length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: darkMode ? 0.8 : 0.9 }}>
                        Final Year
                      </Typography>
                      {!showAll && allStudents.length > 0 && (
                        <Typography variant="caption" sx={{ opacity: darkMode ? 0.6 : 0.7 }}>
                          of {allStudents.filter(s => s.year === '4th Year').length} total
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
                  rows={filteredStudents}
                  columns={columns}
                  getRowId={getRowId}
                  pageSize={10}
                  rowsPerPageOptions={[5, 10, 25, 50]}
                  checkboxSelection
                  disableSelectionOnClick
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

      

      {/* View Student Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Avatar src={selectedStudent?.avatar}>
              <PersonIcon />
            </Avatar>
            <Box>
              <Typography variant="h6">{selectedStudent?.name}</Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedStudent?.registrationNumber}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        <DialogContent>
          {selectedStudent && (
            <Grid container spacing={3} sx={{ mt: 1 }}>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Email</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedStudent.email}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Department</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedStudent.department}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Year</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedStudent.year}</Typography>
              </Grid>
              <Grid item xs={12} md={6}>
                <Typography variant="subtitle2" color="text.secondary">Contact</Typography>
                <Typography variant="body1" sx={{ mb: 2 }}>{selectedStudent.contactNumber}</Typography>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => { setDeleteDialogOpen(false); setSelectedStudent(null); }}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedStudent?.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
};

export default AdminGetStudents;
