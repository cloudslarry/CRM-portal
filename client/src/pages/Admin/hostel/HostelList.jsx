import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../../contexts/ThemeContext';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Chip,
  Avatar,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
  Tooltip
} from '@mui/material';
import {
  Home as HomeIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Room as RoomIcon,
  Assessment as ReportIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  LocationOn as LocationIcon,
  SupervisorAccount as WardenIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import AdminLayout from '../../../components/AdminLayout';
import { fetchHostels, deleteHostel } from '../../../redux/actions/hostelAction';
import toast from 'react-hot-toast';

const HostelList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { hostels, loading, error } = useSelector((state) => state.hostel);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHostels, setFilteredHostels] = useState([]);
  const [selectedHostel, setSelectedHostel] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterDepartment, setFilterDepartment] = useState('');
  const [hostelTypeFilter, setHostelTypeFilter] = useState('all'); // all | boys | girls

  useEffect(() => {
    fetchHostelsData();
  }, []);

  useEffect(() => {
    let filtered = hostels.filter(hostel => {
      const matchesSearch = !searchTerm || 
        hostel.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hostel.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hostel.warden?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesDepartment = !filterDepartment || 
        hostel.department === filterDepartment;
      const lowerName = (hostel.name || '').toLowerCase();
      const matchesType = hostelTypeFilter === 'all' ||
        (hostelTypeFilter === 'boys' && lowerName.includes('boys')) ||
        (hostelTypeFilter === 'girls' && lowerName.includes('girls'));
      
      return matchesSearch && matchesDepartment && matchesType;
    });
    
    setFilteredHostels(filtered);
  }, [hostels, searchTerm, filterDepartment, hostelTypeFilter]);

  const fetchHostelsData = async () => {
    const result = await dispatch(fetchHostels());
    if (!result.success) {
      toast.error(result.error?.message || 'Failed to fetch hostels');
    }
  };

  const handleEditHostel = (row) => {
    const id = row?._id || selectedHostel?._id;
    navigate(`/admin/hostels/${id}/edit`);
  };

  const handleManageRooms = (row) => {
    const id = row?._id || selectedHostel?._id;
    navigate(`/admin/hostels/${id}/rooms`);
  };

  const handleViewReports = (row) => {
    const id = row?._id || selectedHostel?._id;
    navigate(`/admin/hostels/${id}/reports`);
  };

  const handleDeleteHostel = (row) => {
    setSelectedHostel(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!selectedHostel || !selectedHostel._id) {
      setDeleteDialogOpen(false);
      return;
    }
    const result = await dispatch(deleteHostel(selectedHostel._id));
    if (result.success) {
      toast.success('Hostel deleted successfully');
      fetchHostelsData();
    } else {
      toast.error(result.error?.message || 'Failed to delete hostel');
    }
    setDeleteDialogOpen(false);
    setSelectedHostel(null);
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Hostel Name',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
            <HomeIcon />
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
              {params.row.name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {params.row.location}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      field: 'warden',
      headerName: 'Warden',
      width: 180,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <WardenIcon color="primary" sx={{ fontSize: 16 }} />
          <Typography variant="body2">
            {params.row.warden}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'capacity',
      headerName: 'Capacity',
      width: 120,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <PeopleIcon color="primary" sx={{ fontSize: 16 }} />
          <Typography variant="body2">
            {params.row.capacity}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'rooms',
      headerName: 'Rooms',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.row.rooms?.length || 0}
          color="secondary"
          size="small"
          icon={<RoomIcon />}
        />
      ),
    },
    {
      field: 'facilities',
      headerName: 'Facilities',
      width: 200,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
          {params.row.facilities?.slice(0, 2).map((facility, index) => (
            <Chip
              key={index}
              label={facility}
              size="small"
              variant="outlined"
              color="info"
            />
          ))}
          {params.row.facilities?.length > 2 && (
            <Chip
              label={`+${params.row.facilities.length - 2}`}
              size="small"
              variant="outlined"
              color="default"
            />
          )}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Action',
      width: 160,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="View"><IconButton size="small" onClick={() => handleManageRooms(params.row)}><ViewIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Edit"><IconButton size="small" onClick={() => handleEditHostel(params.row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDeleteHostel(params.row)}><DeleteIcon fontSize="small" color="error" /></IconButton></Tooltip>
        </Box>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  const getRowId = (row) => row._id || row.id;

  if (loading) {
    return (
      <AdminLayout title="Hostels">
        <Box sx={{ p: 3 }}>
          <Container maxWidth="xl">
            <Skeleton variant="rectangular" height={400} />
          </Container>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Hostel Management">
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
                  Hostel Management
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                    lineHeight: 1.4
                  }}
                >
                  Manage hostels, rooms, and student accommodations
                </Typography>
              </Box>
              <Box sx={{ 
                display: 'flex', 
                gap: { xs: 1, sm: 1.5, md: 2 },
                flexDirection: { xs: 'column', sm: 'row' },
                width: { xs: '100%', sm: 'auto' }
              }}>
                <ToggleButtonGroup
                  exclusive
                  color="primary"
                  value={hostelTypeFilter}
                  onChange={(e, val) => { if (val) setHostelTypeFilter(val); }}
                  size="small"
                >
                  <ToggleButton value="all">All</ToggleButton>
                  <ToggleButton value="boys">Boys Hostel</ToggleButton>
                  <ToggleButton value="girls">Girls Hostel</ToggleButton>
                </ToggleButtonGroup>
                <Button
                  variant="outlined"
                  startIcon={<RefreshIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
                  onClick={fetchHostelsData}
                  disabled={loading}
                  sx={{
                    borderRadius: { xs: 1, sm: 2 },
                    px: { xs: 1.25, sm: 1.5, md: 2 },
                    py: { xs: 0.5, sm: 0.75, md: 1 },
                    minHeight: { xs: 36, sm: 40, md: 44 },
                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                    width: { xs: '100%', sm: 'auto' },
                  }}
                >
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  startIcon={<AddIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
                  onClick={() => navigate('/admin/hostels/add')}
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
                  Select Boys/Girls Hostel
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
                    placeholder="Search hostels..."
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
                      value={filterDepartment}
                      onChange={(e) => setFilterDepartment(e.target.value)}
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
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
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
                        {filteredHostels.length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: darkMode ? 0.8 : 0.9 }}>
                        Total Hostels
                      </Typography>
                    </Box>
                    <HomeIcon sx={{ fontSize: 40, opacity: darkMode ? 0.6 : 0.8 }} />
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
                        {filteredHostels.reduce((sum, hostel) => sum + (hostel.rooms?.length || 0), 0)}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: darkMode ? 0.8 : 0.9 }}>
                        Total Rooms
                      </Typography>
                    </Box>
                    <RoomIcon sx={{ fontSize: 40, opacity: darkMode ? 0.6 : 0.8 }} />
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
                        {filteredHostels.reduce((sum, hostel) => sum + (hostel.capacity || 0), 0)}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: darkMode ? 0.8 : 0.9 }}>
                        Total Capacity
                      </Typography>
                    </Box>
                    <PeopleIcon sx={{ fontSize: 40, opacity: darkMode ? 0.6 : 0.8 }} />
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
                        {filteredHostels.filter(h => h.rooms?.length > 0).length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: darkMode ? 0.8 : 0.9 }}>
                        Active Hostels
                      </Typography>
                    </Box>
                    <LocationIcon sx={{ fontSize: 40, opacity: darkMode ? 0.6 : 0.8 }} />
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
                  rows={filteredHostels}
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

      

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete "{selectedHostel?.name}"? This action cannot be undone.
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

export default HostelList;
