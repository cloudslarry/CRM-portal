import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  IconButton,
  InputAdornment,
  Divider,
  Breadcrumbs,
  Link,
} from '@mui/material';
import {
  Room as RoomIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  Bed as BedIcon,
  People as PeopleIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
  NavigateNext as NavigateNextIcon,
  Home as HomeIcon,
  Edit as EditIcon,
} from '@mui/icons-material';
import AdminLayout from '../../../components/AdminLayout';
import { createRoom, fetchHostels } from '../../../redux/actions/hostelAction';
import toast from 'react-hot-toast';

const AddRoom = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { hostels, loading } = useSelector((state) => state.hostel);
  
  const [formData, setFormData] = useState({
    roomNumber: '',
    type: '',
    capacity: '',
    description: '',
    facilities: [],
    hostel: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [newFacility, setNewFacility] = useState('');
  const [editingFacility, setEditingFacility] = useState(null);
  const [editFacilityValue, setEditFacilityValue] = useState('');

  useEffect(() => {
    if (hostels.length === 0) {
      dispatch(fetchHostels());
    }
  }, [dispatch, hostels.length]);

  const handleInputChange = (field) => (event) => {
    setFormData({
      ...formData,
      [field]: event.target.value
    });
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: ''
      });
    }
  };

  const handleAddFacility = () => {
    if (newFacility.trim() && !formData.facilities.includes(newFacility.trim())) {
      setFormData({
        ...formData,
        facilities: [...formData.facilities, newFacility.trim()]
      });
      setNewFacility('');
    }
  };

  const handleRemoveFacility = (facilityToRemove) => {
    setFormData({
      ...formData,
      facilities: formData.facilities.filter(facility => facility !== facilityToRemove)
    });
  };

  const handleEditFacility = (facility, index) => {
    setEditingFacility(index);
    setEditFacilityValue(facility);
  };

  const handleSaveFacilityEdit = () => {
    if (editFacilityValue.trim()) {
      const updatedFacilities = [...formData.facilities];
      updatedFacilities[editingFacility] = editFacilityValue.trim();
      setFormData({
        ...formData,
        facilities: updatedFacilities
      });
      setEditingFacility(null);
      setEditFacilityValue('');
    }
  };

  const handleCancelFacilityEdit = () => {
    setEditingFacility(null);
    setEditFacilityValue('');
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.hostel) newErrors.hostel = 'Please select a hostel';
    if (!formData.roomNumber.trim()) newErrors.roomNumber = 'Room number is required';
    if (!formData.type.trim()) newErrors.type = 'Room type is required';
    if (!formData.capacity || formData.capacity <= 0) newErrors.capacity = 'Valid capacity is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Please fix all validation errors');
      return;
    }

    setIsLoading(true);
    
    try {
      const roomData = {
        ...formData,
        capacity: parseInt(formData.capacity),
        hostel: formData.hostel
      };

      const result = await dispatch(createRoom(roomData));

      if (result.success) {
        toast.success('Room created successfully!');
        navigate('/admin/hostels/rooms');
      } else {
        toast.error(result.error?.message || 'Failed to create room');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      roomNumber: '',
      type: '',
      capacity: '',
      description: '',
      facilities: [],
      hostel: ''
    });
    setErrors({});
    setNewFacility('');
    setEditingFacility(null);
    setEditFacilityValue('');
  };

  return (
    <AdminLayout>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Container maxWidth="lg">
          {/* Breadcrumbs */}
          <Breadcrumbs 
            separator={<NavigateNextIcon fontSize="small" />} 
            sx={{ mb: 3 }}
            aria-label="breadcrumb"
          >
            <Link
              underline="hover"
              color="inherit"
              href="/admin"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Admin
            </Link>
            <Link
              underline="hover"
              color="inherit"
              href="/admin/hostels/rooms"
              sx={{ display: 'flex', alignItems: 'center' }}
            >
              <RoomIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Room Management
            </Link>
            <Typography color="text.primary" sx={{ display: 'flex', alignItems: 'center' }}>
              <AddIcon sx={{ mr: 0.5 }} fontSize="inherit" />
              Add Room
            </Typography>
          </Breadcrumbs>

          {/* Header */}
          <Box sx={{ mb: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: 'primary.main',
                  mr: 2,
                  width: 56,
                  height: 56
                }}
              >
                <RoomIcon sx={{ fontSize: 32 }} />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                  Add New Room
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Create a new room in any hostel
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Form */}
          <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
            <CardContent sx={{ p: 4 }}>
              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Hostel Selection */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required error={!!errors.hostel}>
                      <InputLabel>Select Hostel</InputLabel>
                      <Select
                        value={formData.hostel}
                        onChange={handleInputChange('hostel')}
                        label="Select Hostel"
                        startAdornment={
                          <InputAdornment position="start">
                            <HomeIcon color="primary" />
                          </InputAdornment>
                        }
                      >
                        {hostels.map((hostel) => (
                          <MenuItem key={hostel._id} value={hostel._id}>
                            {hostel.name} - {hostel.location}
                          </MenuItem>
                        ))}
                      </Select>
                      {errors.hostel && (
                        <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 2 }}>
                          {errors.hostel}
                        </Typography>
                      )}
                    </FormControl>
                  </Grid>

                  {/* Room Number */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Room Number"
                      variant="outlined"
                      value={formData.roomNumber}
                      onChange={handleInputChange('roomNumber')}
                      error={!!errors.roomNumber}
                      helperText={errors.roomNumber}
                      required
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <RoomIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Room Type */}
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth required error={!!errors.type}>
                      <InputLabel>Room Type</InputLabel>
                      <Select
                        value={formData.type}
                        onChange={handleInputChange('type')}
                        label="Room Type"
                        startAdornment={
                          <InputAdornment position="start">
                            <BedIcon color="primary" />
                          </InputAdornment>
                        }
                      >
                        <MenuItem value="Single">Single</MenuItem>
                        <MenuItem value="Double">Double</MenuItem>
                        <MenuItem value="Triple">Triple</MenuItem>
                        <MenuItem value="Quad">Quad</MenuItem>
                        <MenuItem value="Dormitory">Dormitory</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Capacity */}
                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Capacity"
                      type="number"
                      variant="outlined"
                      value={formData.capacity}
                      onChange={handleInputChange('capacity')}
                      error={!!errors.capacity}
                      helperText={errors.capacity}
                      required
                      inputProps={{ min: 1, max: 10 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PeopleIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Description */}
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      variant="outlined"
                      multiline
                      rows={3}
                      value={formData.description}
                      onChange={handleInputChange('description')}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <DescriptionIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  {/* Facilities */}
                  <Grid item xs={12}>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
                      <AddIcon sx={{ mr: 1 }} />
                      Facilities
                    </Typography>
                    
                    <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
                      {formData.facilities.map((facility, index) => (
                        <Chip
                          key={index}
                          label={
                            editingFacility === index ? (
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                <TextField
                                  size="small"
                                  value={editFacilityValue}
                                  onChange={(e) => setEditFacilityValue(e.target.value)}
                                  onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                      e.preventDefault();
                                      handleSaveFacilityEdit();
                                    }
                                  }}
                                  sx={{ minWidth: 100 }}
                                />
                                <IconButton
                                  size="small"
                                  onClick={handleSaveFacilityEdit}
                                  color="primary"
                                >
                                  <SaveIcon fontSize="small" />
                                </IconButton>
                                <IconButton
                                  size="small"
                                  onClick={handleCancelFacilityEdit}
                                  color="error"
                                >
                                  <CloseIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            ) : (
                              facility
                            )
                          }
                          onDelete={editingFacility === index ? undefined : () => handleRemoveFacility(facility)}
                          color="primary"
                          variant="outlined"
                          deleteIcon={
                            editingFacility === index ? null : (
                              <Box sx={{ display: 'flex', gap: 0.5 }}>
                                <EditIcon 
                                  fontSize="small" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditFacility(facility, index);
                                  }}
                                  sx={{ cursor: 'pointer' }}
                                />
                                <CloseIcon fontSize="small" />
                              </Box>
                            )
                          }
                        />
                      ))}
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <TextField
                        label="Add Facility"
                        variant="outlined"
                        value={newFacility}
                        onChange={(e) => setNewFacility(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddFacility();
                          }
                        }}
                        sx={{ flexGrow: 1 }}
                      />
                      <Button
                        variant="outlined"
                        onClick={handleAddFacility}
                        disabled={!newFacility.trim()}
                        startIcon={<AddIcon />}
                      >
                        Add
                      </Button>
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: 3 }} />

                {/* Action Buttons */}
                <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                  <Button
                    variant="outlined"
                    onClick={handleReset}
                    startIcon={<ClearIcon />}
                    disabled={isLoading}
                    sx={{ minWidth: 120 }}
                  >
                    Reset
                  </Button>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={isLoading}
                    startIcon={<SaveIcon />}
                    sx={{ 
                      minWidth: 120,
                      background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)',
                      }
                    }}
                  >
                    {isLoading ? 'Creating...' : 'Create Room'}
                  </Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </AdminLayout>
  );
};

export default AddRoom;
