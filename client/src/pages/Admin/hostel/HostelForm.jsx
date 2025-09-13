import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  InputAdornment,
  Divider,
} from '@mui/material';
import {
  Home as HomeIcon,
  Save as SaveIcon,
  Clear as ClearIcon,
  LocationOn as LocationIcon,
  SupervisorAccount as WardenIcon,
  People as PeopleIcon,
  Add as AddIcon,
  Close as CloseIcon,
  Description as DescriptionIcon,
  Male as MaleIcon,
  Female as FemaleIcon,
} from '@mui/icons-material';
import AdminLayout from '../../../components/AdminLayout';
import { createHostel, updateHostel, fetchHostels } from '../../../redux/actions/hostelAction';
import toast from 'react-hot-toast';

const HostelForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id } = useParams();
  const { hostels, loading } = useSelector((state) => state.hostel);
  
  const isEdit = Boolean(id);
  const [formData, setFormData] = useState({
    name: '',
    warden: '',
    location: '',
    capacity: '',
    description: '',
    facilities: []
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [newFacility, setNewFacility] = useState('');

  useEffect(() => {
    if (isEdit && hostels.length > 0) {
      const hostel = hostels.find(h => h._id === id);
      if (hostel) {
        setFormData({
          name: hostel.name || '',
          warden: hostel.warden || '',
          location: hostel.location || '',
          capacity: hostel.capacity || '',
          description: hostel.description || '',
          facilities: hostel.facilities || []
        });
      }
    }
  }, [isEdit, id, hostels]);

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

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) newErrors.name = 'Hostel name is required';
    if (!formData.warden.trim()) newErrors.warden = 'Warden name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
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
      const hostelData = {
        ...formData,
        capacity: parseInt(formData.capacity)
      };

      let result;
      if (isEdit) {
        result = await dispatch(updateHostel(id, hostelData));
      } else {
        result = await dispatch(createHostel(hostelData));
      }

      if (result.success) {
        toast.success(`Hostel ${isEdit ? 'updated' : 'created'} successfully!`);
        navigate('/admin/hostels');
      } else {
        toast.error(result.error?.message || `Failed to ${isEdit ? 'update' : 'create'} hostel`);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFormData({
      name: '',
      warden: '',
      location: '',
      capacity: '',
      description: '',
      facilities: []
    });
    setErrors({});
    setNewFacility('');
  };

  // If not editing, show the simplified selector for Boys/Girls hostel instead of the full form
  if (!isEdit) {
    const handleSelect = async (type) => {
      try {
        // Try to find existing hostel by canonical name
        const name = type === 'boys' ? 'Boys Hostel' : 'Girls Hostel';
        const existing = hostels.find(h => (h.name || '').toLowerCase() === name.toLowerCase());
        if (existing) {
          toast.success(`${name} selected`);
          navigate(`/admin/hostels/${existing._id}/rooms`);
          return;
        }

        // Create default hostel if it doesn't exist
        const defaultHostel = {
          name,
          warden: type === 'boys' ? 'Boys Warden' : 'Girls Warden',
          location: 'Campus',
          capacity: 100,
          description: `${name} - default configuration`,
          facilities: ['wifi', 'security']
        };

        const result = await dispatch(createHostel(defaultHostel));
        if (result.success) {
          toast.success(`${name} created`);
          navigate(`/admin/hostels/${result.data?.result?._id || result.payload?._id || ''}/rooms`);
        } else {
          toast.error(result.error?.message || `Failed to create ${name}`);
        }
      } catch (err) {
        toast.error('Unexpected error');
      }
    };

    return (
      <AdminLayout title="Select Hostel">
        <Box sx={{ p: { xs: 0.5, sm: 1, md: 2 } }}>
          <Container maxWidth="md">
            <Card sx={{ borderRadius: 3 }}>
              <CardContent sx={{ p: { xs: 2, md: 4 } }}>
                <Box sx={{ textAlign: 'center', mb: 3 }}>
                  <Avatar sx={{ bgcolor: 'primary.main', width: 72, height: 72, mx: 'auto', mb: 1 }}>
                    <HomeIcon />
                  </Avatar>
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Choose Hostel</Typography>
                  <Typography variant="body2" color="text.secondary">College has two hostels. Select one to manage.</Typography>
                </Box>

                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Avatar sx={{ bgcolor: 'info.main' }}><MaleIcon /></Avatar>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>Boys Hostel</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Manage rooms, fees and notices for Boys Hostel.
                        </Typography>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => handleSelect('boys')}
                        >
                          Select Boys Hostel
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Card variant="outlined" sx={{ height: '100%' }}>
                      <CardContent>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Avatar sx={{ bgcolor: 'secondary.main' }}><FemaleIcon /></Avatar>
                          <Typography variant="h6" sx={{ fontWeight: 600 }}>Girls Hostel</Typography>
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          Manage rooms, fees and notices for Girls Hostel.
                        </Typography>
                        <Button
                          variant="contained"
                          fullWidth
                          onClick={() => handleSelect('girls')}
                        >
                          Select Girls Hostel
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                </Grid>
                <Box sx={{ mt: 3, textAlign: 'center' }}>
                  <Button variant="outlined" onClick={() => navigate('/admin/hostels')}>Back to Hostels</Button>
                </Box>
              </CardContent>
            </Card>
          </Container>
        </Box>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEdit ? "Edit Hostel" : "Add New Hostel"}>
      <Box sx={{ 
        p: { xs: 0.5, sm: 1, md: 2 },
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}>
        <Container 
          maxWidth="lg"
          sx={{
            px: { xs: 0.5, sm: 1, md: 2 },
            py: { xs: 0.5, sm: 1 },
            width: '100%',
            maxWidth: '100%',
            boxSizing: 'border-box'
          }}
        >
          {/* Header */}
          <Box sx={{ 
            mb: { xs: 1.5, sm: 2, md: 3, lg: 4 }, 
            textAlign: 'center',
            p: { xs: 1, sm: 2 }
          }}>
            <Avatar
              sx={{
                width: { xs: 50, sm: 60, md: 70, lg: 80 },
                height: { xs: 50, sm: 60, md: 70, lg: 80 },
                mx: 'auto',
                mb: { xs: 0.5, sm: 1, md: 2 },
                bgcolor: 'primary.main'
              }}
            >
              <HomeIcon sx={{ fontSize: { xs: 24, sm: 30, md: 36, lg: 40 } }} />
            </Avatar>
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
              {isEdit ? 'Edit Hostel' : 'Add New Hostel'}
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                lineHeight: 1.4
              }}
            >
              {isEdit ? 'Update hostel information' : 'Fill in the hostel information to add it to the system'}
            </Typography>
          </Box>

          {/* Form */}
          <Card sx={{ 
            borderRadius: 3, 
            boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <CardContent sx={{ 
              p: { xs: 1, sm: 2, md: 3 },
              '&:last-child': { pb: { xs: 1, sm: 2, md: 3 } }
            }}>
              <form onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  {/* Basic Information */}
                  <Grid item xs={12}>
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 2, 
                        color: 'primary.main', 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' }
                      }}
                    >
                      Basic Information
                    </Typography>
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Hostel Name"
                      value={formData.name}
                      onChange={handleInputChange('name')}
                      error={!!errors.name}
                      helperText={errors.name}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <HomeIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Warden Name"
                      value={formData.warden}
                      onChange={handleInputChange('warden')}
                      error={!!errors.warden}
                      helperText={errors.warden}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <WardenIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Location"
                      value={formData.location}
                      onChange={handleInputChange('location')}
                      error={!!errors.location}
                      helperText={errors.location}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <LocationIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Capacity"
                      type="number"
                      value={formData.capacity}
                      onChange={handleInputChange('capacity')}
                      error={!!errors.capacity}
                      helperText={errors.capacity}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PeopleIcon color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={formData.description}
                      onChange={handleInputChange('description')}
                      multiline
                      rows={3}
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
                    <Divider sx={{ my: 2 }} />
                    <Typography 
                      variant="h6" 
                      sx={{ 
                        mb: 2, 
                        color: 'primary.main', 
                        fontWeight: 'bold',
                        fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' }
                      }}
                    >
                      Facilities
                    </Typography>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <TextField
                        fullWidth
                        label="Add Facility"
                        value={newFacility}
                        onChange={(e) => setNewFacility(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddFacility();
                          }
                        }}
                        placeholder="e.g., WiFi, Laundry, Gym"
                      />
                      <Button
                        variant="contained"
                        onClick={handleAddFacility}
                        disabled={!newFacility.trim()}
                        sx={{ minWidth: 'auto', px: 2 }}
                      >
                        <AddIcon />
                      </Button>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {formData.facilities.map((facility, index) => (
                        <Chip
                          key={index}
                          label={facility}
                          onDelete={() => handleRemoveFacility(facility)}
                          color="primary"
                          variant="outlined"
                          deleteIcon={<CloseIcon />}
                        />
                      ))}
                    </Box>
                  </Grid>
                </Grid>

                <Divider sx={{ my: { xs: 1.5, sm: 2, md: 3 } }} />

                {/* Action Buttons */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 1, sm: 1.5, md: 2 },
                  width: '100%',
                  alignItems: { xs: 'stretch', sm: 'center' }
                }}>
                  <Button
                    onClick={handleReset}
                    variant="outlined"
                    startIcon={<ClearIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
                    size="small"
                    sx={{ 
                      borderRadius: { xs: 1, sm: 2 },
                      width: { xs: '100%', sm: 'auto' },
                      minWidth: { xs: 'auto', sm: 80, md: 100 },
                      minHeight: { xs: 40, sm: 44, md: 48 },
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                      px: { xs: 1.5, sm: 2, md: 3 },
                      py: { xs: 0.75, sm: 1, md: 1.25 }
                    }}
                  >
                    Reset
                  </Button>

                  <Box sx={{ 
                    display: 'flex', 
                    gap: { xs: 1, sm: 1.5, md: 2 },
                    flexDirection: { xs: 'column', sm: 'row' },
                    width: { xs: '100%', sm: 'auto' },
                    flex: { xs: 1, sm: 'none' }
                  }}>
                    <Button
                      type="submit"
                      variant="contained"
                      disabled={isLoading}
                      startIcon={<SaveIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
                      size="small"
                      sx={{
                        borderRadius: { xs: 1, sm: 2 },
                        px: { xs: 1.5, sm: 2, md: 3 },
                        py: { xs: 0.75, sm: 1, md: 1.25 },
                        width: { xs: '100%', sm: 'auto' },
                        minWidth: { xs: 'auto', sm: 120, md: 140 },
                        minHeight: { xs: 40, sm: 44, md: 48 },
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                        background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)',
                        }
                      }}
                    >
                      {isLoading ? 'Saving...' : (isEdit ? 'Update Hostel' : 'Create Hostel')}
                    </Button>

                    <Button
                      onClick={() => navigate('/admin/hostels')}
                      variant="outlined"
                      size="small"
                      sx={{ 
                        borderRadius: { xs: 1, sm: 2 },
                        px: { xs: 1.5, sm: 2, md: 3 },
                        py: { xs: 0.75, sm: 1, md: 1.25 },
                        width: { xs: '100%', sm: 'auto' },
                        minWidth: { xs: 'auto', sm: 80, md: 100 },
                        minHeight: { xs: 40, sm: 44, md: 48 },
                        fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }
                      }}
                    >
                      Cancel
                    </Button>
                  </Box>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </AdminLayout>
  );
};

export default HostelForm;
