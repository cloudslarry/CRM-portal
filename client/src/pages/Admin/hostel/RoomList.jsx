import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
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
  Breadcrumbs,
  Link,
  Tooltip
} from '@mui/material';
import {
  Room as RoomIcon,
  Add as AddIcon,
  Visibility as ViewIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PersonAdd as PersonAddIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  People as PeopleIcon,
  Bed as BedIcon,
  NavigateNext as NavigateNextIcon,
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import AdminLayout from '../../../components/AdminLayout';
import { fetchRoomsByHostel, deleteRoom } from '../../../redux/actions/hostelAction';
import { fetchHostels } from '../../../redux/actions/hostelAction';
import toast from 'react-hot-toast';

const RoomList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { hostelId } = useParams();
  const { darkMode } = useTheme();
  const { rooms, hostels, loading, error } = useSelector((state) => state.hostel);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredRooms, setFilteredRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const currentHostel = hostels.find(h => h._id === hostelId);

  useEffect(() => {
    if (hostelId && hostelId !== 'undefined') {
      fetchRoomsData();
    } else if (!hostelId || hostelId === 'undefined') {
      toast.error('Invalid hostel ID. Please select a hostel first.');
      navigate('/admin/hostels');
    }
    if (hostels.length === 0) {
      dispatch(fetchHostels());
    }
  }, [hostelId, navigate, dispatch, hostels.length]);

  useEffect(() => {
    let filtered = rooms.filter(room => {
      const matchesSearch = !searchTerm || 
        room.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.students?.some(student => 
          student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          student.registrationNumber?.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesType = !filterType || room.type === filterType;
      const matchesStatus = !filterStatus || room.status === filterStatus;
      
      return matchesSearch && matchesType && matchesStatus;
    });
    
    setFilteredRooms(filtered);
  }, [rooms, searchTerm, filterType, filterStatus]);

  const fetchRoomsData = async () => {
    const result = await dispatch(fetchRoomsByHostel(hostelId));
    if (!result.success) {
      toast.error(result.error?.message || 'Failed to fetch rooms');
    }
  };

  const handleEditRoom = (row) => {
    const id = row?._id || selectedRoom?._id;
    navigate(`/admin/hostels/${hostelId}/rooms/edit/${id}`);
  };

  const handleAssignStudent = (row) => {
    const id = row?._id || selectedRoom?._id;
    navigate(`/admin/hostels/${hostelId}/rooms/${id}/assign`);
  };

  const handleDeleteRoom = (row) => {
    setSelectedRoom(row);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    const result = await dispatch(deleteRoom(selectedRoom._id));
    if (result.success) {
      toast.success('Room deleted successfully');
      fetchRoomsData();
    } else {
      toast.error(result.error?.message || 'Failed to delete room');
    }
    setDeleteDialogOpen(false);
  };

  const getRoomTypeColor = (type) => {
    switch (type) {
      case 'Single': return 'success';
      case 'Double': return 'info';
      case 'Triple': return 'warning';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'success';
      case 'Maintenance': return 'warning';
      default: return 'default';
    }
  };

  const columns = [
    {
      field: 'roomNumber',
      headerName: 'Room Number',
      width: 150,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 32, height: 32 }}>
            <RoomIcon />
          </Avatar>
          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
            {params.row.roomNumber}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.type}
          color={getRoomTypeColor(params.row.type)}
          size="small"
        />
      ),
    },
    {
      field: 'capacity',
      headerName: 'Capacity',
      width: 100,
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
      field: 'occupied',
      headerName: 'Occupied',
      width: 100,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <BedIcon color="primary" sx={{ fontSize: 16 }} />
          <Typography variant="body2">
            {params.row.occupied}
          </Typography>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.row.status}
          color={getStatusColor(params.row.status)}
          size="small"
        />
      ),
    },
    {
      field: 'students',
      headerName: 'Students',
      width: 200,
      renderCell: (params) => (
        <Box>
          {params.row.students?.length > 0 ? (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              {params.row.students.slice(0, 2).map((student, index) => (
                <Typography key={index} variant="caption" sx={{ display: 'block' }}>
                  {student.name} ({student.registrationNumber})
                </Typography>
              ))}
              {params.row.students.length > 2 && (
                <Typography variant="caption" color="text.secondary">
                  +{params.row.students.length - 2} more
                </Typography>
              )}
            </Box>
          ) : (
            <Typography variant="caption" color="text.secondary">
              No students assigned
            </Typography>
          )}
        </Box>
      ),
    },
    {
      field: 'actions',
      headerName: 'Action',
      width: 170,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <Tooltip title="Assign Student"><IconButton size="small" onClick={() => handleAssignStudent(params.row)}><ViewIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Edit"><IconButton size="small" onClick={() => handleEditRoom(params.row)}><EditIcon fontSize="small" /></IconButton></Tooltip>
          <Tooltip title="Delete"><IconButton size="small" onClick={() => handleDeleteRoom(params.row)}><DeleteIcon fontSize="small" color="error" /></IconButton></Tooltip>
        </Box>
      ),
      sortable: false,
      filterable: false,
    },
  ];

  const getRowId = (row) => row._id || row.id;

  if (loading) {
    return (
      <AdminLayout title="Rooms">
        <Box sx={{ p: 3 }}>
          <Container maxWidth="xl">
            <Skeleton variant="rectangular" height={400} />
          </Container>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Room Management">
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
          {/* Breadcrumbs */}
          <Box sx={{ mb: 2 }}>
            <Breadcrumbs separator={<NavigateNextIcon fontSize="small" />}>
              <Link
                color="inherit"
                href="/admin/hostels"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/admin/hostels');
                }}
                sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
              >
                <HomeIcon sx={{ fontSize: 16 }} />
                Hostels
              </Link>
              <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <RoomIcon sx={{ fontSize: 16 }} />
                {currentHostel?.name || 'Rooms'}
              </Typography>
            </Breadcrumbs>
          </Box>

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
                  Room Management
                </Typography>
                <Typography 
                  variant="body1" 
                  color="text.secondary"
                  sx={{ 
                    fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                    lineHeight: 1.4
                  }}
                >
                  {currentHostel?.name} - Manage rooms and student assignments
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
                  startIcon={<RefreshIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
                  onClick={fetchRoomsData}
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
                  onClick={() => navigate(`/admin/hostels/${hostelId}/rooms/add`)}
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
                  Add Room
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
                    placeholder="Search rooms or students..."
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
                    <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Room Type</InputLabel>
                    <Select
                      value={filterType}
                      onChange={(e) => setFilterType(e.target.value)}
                      label="Room Type"
                      sx={{
                        minHeight: { xs: 36, sm: 40, md: 44 },
                        '& .MuiSelect-select': {
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }
                      }}
                    >
                      <MenuItem value="" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>All Types</MenuItem>
                      <MenuItem value="Single" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Single</MenuItem>
                      <MenuItem value="Double" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Double</MenuItem>
                      <MenuItem value="Triple" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Triple</MenuItem>
                      <MenuItem value="Quad" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Quad</MenuItem>
                      <MenuItem value="Dormitory" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Dormitory</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                  <FormControl fullWidth>
                    <InputLabel sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Status</InputLabel>
                    <Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      label="Status"
                      sx={{
                        minHeight: { xs: 36, sm: 40, md: 44 },
                        '& .MuiSelect-select': {
                          fontSize: { xs: '0.875rem', sm: '1rem' }
                        }
                      }}
                    >
                      <MenuItem value="" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>All Status</MenuItem>
                      <MenuItem value="Active" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Active</MenuItem>
                      <MenuItem value="Maintenance" sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>Maintenance</MenuItem>
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
                        {filteredRooms.length}
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
                background: 'linear-gradient(45deg, #4CAF50 30%, #8BC34A 90%)', 
                color: 'white',
                boxShadow: darkMode ? 'none' : '0 4px 8px rgba(0,0,0,0.1)',
                transition: darkMode ? 'none' : 'all 0.3s ease'
              }}>
                <CardContent sx={{ py: 1, px: 1.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                        {filteredRooms.reduce((sum, room) => sum + (room.occupied || 0), 0)}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: darkMode ? 0.8 : 0.9 }}>
                        Occupied Beds
                      </Typography>
                    </Box>
                    <BedIcon sx={{ fontSize: 40, opacity: darkMode ? 0.6 : 0.8 }} />
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
                        {filteredRooms.reduce((sum, room) => sum + (room.capacity || 0), 0)}
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
                        {filteredRooms.filter(r => r.status === 'Active').length}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: darkMode ? 0.8 : 0.9 }}>
                        Active Rooms
                      </Typography>
                    </Box>
                    <RoomIcon sx={{ fontSize: 40, opacity: darkMode ? 0.6 : 0.8 }} />
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
                  rows={filteredRooms}
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
            Are you sure you want to delete room "{selectedRoom?.roomNumber}"? This action cannot be undone.
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

export default RoomList;
