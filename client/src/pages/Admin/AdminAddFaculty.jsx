import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'
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
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
  Divider
} from '@mui/material'
import {
  PersonAdd as PersonAddIcon,
  Face as FaceIcon,
  MailOutline as MailIcon,
  Class as ClassIcon,
  Phone as PhoneIcon,
  SupervisorAccount as SupervisorIcon,
  Work as WorkIcon,
  Save as SaveIcon,
  Clear as ClearIcon
} from '@mui/icons-material'
import AdminLayout from '../../components/AdminLayout'
import { DEPARTMENTS } from '../../config/departments'
import { adminAddFaculty } from '../../redux/actions/adminAction'

const steps = ['Personal Information', 'Professional Details', 'Review & Submit'];

const AdminAddFaculty = () => {
  const dispatch = useDispatch();
  const admin = useSelector((store) => store.admin);
  const navigate = useNavigate();
  const alert = toast;

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    designation: '',
    facultyMobileNumber: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const departments = DEPARTMENTS;

  const designations = [
    'Professor',
    'Associate Professor',
    'Assistant Professor',
    'Lecturer',
    'Senior Lecturer',
    'Head of Department',
    'Dean',
    'Director'
  ];

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

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      email: '',
      department: '',
      designation: '',
      facultyMobileNumber: ''
    });
    setErrors({});
    setActiveStep(0);
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0:
        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.facultyMobileNumber.trim()) newErrors.facultyMobileNumber = 'Mobile number is required';
        break;
      case 1:
        if (!formData.department) newErrors.department = 'Department is required';
        if (!formData.designation) newErrors.designation = 'Designation is required';
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStepNext = () => {
    if (validateStep(activeStep)) {
      handleNext();
    }
  };

  const handleSubmitClick = () => {
    // Only allow submission from the review step
    if (activeStep !== steps.length - 1) {
      toast.error('Please complete all steps before submitting.');
      return;
    }
    
    // Final validation before submission
    if (!validateStep(0) || !validateStep(1)) {
      toast.error('Please fix all validation errors before submitting.');
      return;
    }
    
    setShowConfirmDialog(true);
  };

  const formHandler = async (e) => {
    e.preventDefault();
    setShowConfirmDialog(false);
    setIsLoading(true);
    
    try {
      await dispatch(adminAddFaculty(formData));
      toast.success('Faculty added successfully!');
      handleReset();
    } catch (error) {
      toast.error('Failed to add faculty. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                Personal Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Full Name"
                value={formData.name}
                onChange={handleInputChange('name')}
                error={!!errors.name}
                helperText={errors.name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaceIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mobile Number"
                value={formData.facultyMobileNumber}
                onChange={handleInputChange('facultyMobileNumber')}
                error={!!errors.facultyMobileNumber}
                helperText={errors.facultyMobileNumber}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                Professional Details
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.department}>
                <InputLabel>Department</InputLabel>
                <Select
                  value={formData.department}
                  onChange={handleInputChange('department')}
                  label="Department"
                >
                  {departments.map((dept) => (
                    <MenuItem key={dept} value={dept}>
                      {dept}
                    </MenuItem>
                  ))}
                </Select>
                {errors.department && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                    {errors.department}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.designation}>
                <InputLabel>Designation</InputLabel>
                <Select
                  value={formData.designation}
                  onChange={handleInputChange('designation')}
                  label="Designation"
                >
                  {designations.map((designation) => (
                    <MenuItem key={designation} value={designation}>
                      {designation}
                    </MenuItem>
                  ))}
                </Select>
                {errors.designation && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                    {errors.designation}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Box>
            <Typography variant="h6" sx={{ mb: 3, color: 'primary.main', fontWeight: 'bold' }}>
              Review Information
            </Typography>
            <Paper sx={{ p: 3, mb: 3, border: '2px solid', borderColor: 'primary.main' }}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', textAlign: 'center' }}>
                Please review all information before submitting
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Name:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{formData.name}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Email:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{formData.email}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Mobile Number:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{formData.facultyMobileNumber}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Department:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{formData.department}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Designation:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{formData.designation}</Typography>
                </Grid>
              </Grid>
            </Paper>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
              <Typography variant="body2" color="warning.contrastText">
                ⚠️ Please verify all information is correct before clicking "Add Faculty"
              </Typography>
            </Box>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <AdminLayout title="Add New Faculty">
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
              <PersonAddIcon sx={{ fontSize: { xs: 24, sm: 30, md: 36, lg: 40 } }} />
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
              Add New Faculty
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                lineHeight: 1.4
              }}
            >
              Fill in the faculty information to add them to the system
            </Typography>
          </Box>

          {/* Stepper */}
          <Card sx={{ 
            mb: { xs: 1.5, sm: 2, md: 3 }, 
            borderRadius: 3,
            width: '100%',
            boxSizing: 'border-box'
          }}>
            <CardContent sx={{ 
              p: { xs: 1, sm: 2, md: 2.5 },
              '&:last-child': { pb: { xs: 1, sm: 2, md: 2.5 } }
            }}>
              <Stepper 
                activeStep={activeStep} 
                alternativeLabel
                sx={{
                  width: '100%',
                  '& .MuiStepLabel-label': {
                    fontSize: { xs: '0.625rem', sm: '0.75rem', md: '0.875rem', lg: '1rem' },
                    fontWeight: 500
                  },
                  '& .MuiStepLabel-root': {
                    padding: { xs: '0 2px', sm: '0 4px', md: '0 8px' }
                  },
                  '& .MuiStepConnector-root': {
                    top: { xs: 12, sm: 16, md: 20 }
                  },
                  '& .MuiStepLabel-iconContainer': {
                    '& .MuiSvgIcon-root': {
                      fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
                    }
                  }
                }}
              >
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel>{label}</StepLabel>
                  </Step>
                ))}
              </Stepper>
            </CardContent>
          </Card>

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
              <form onSubmit={formHandler}>
                {renderStepContent(activeStep)}

                <Divider sx={{ my: { xs: 1.5, sm: 2, md: 3 } }} />

                {/* Navigation Buttons */}
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'space-between',
                  flexDirection: { xs: 'column', sm: 'row' },
                  gap: { xs: 1, sm: 1.5, md: 2 },
                  width: '100%',
                  alignItems: { xs: 'stretch', sm: 'center' }
                }}>
                  <Button
                    disabled={activeStep === 0}
                    onClick={handleBack}
                    startIcon={<ClearIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
                    size="small"
                    sx={{ 
                      borderRadius: { xs: 1, sm: 2 },
                      width: { xs: '100%', sm: 'auto' },
                      minWidth: { xs: 'auto', sm: 100, md: 120 },
                      minHeight: { xs: 40, sm: 44, md: 48 },
                      fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                      px: { xs: 1.5, sm: 2, md: 3 },
                      py: { xs: 0.75, sm: 1, md: 1.25 }
                    }}
                  >
                    Back
                  </Button>

                  <Box sx={{ 
                    display: 'flex', 
                    gap: { xs: 1, sm: 1.5, md: 2 },
                    flexDirection: { xs: 'column', sm: 'row' },
                    width: { xs: '100%', sm: 'auto' },
                    flex: { xs: 1, sm: 'none' }
                  }}>
                    {activeStep === steps.length - 1 ? (
                      <Button
                        type="button"
                        variant="contained"
                        disabled={isLoading}
                        onClick={handleSubmitClick}
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
                        {isLoading ? 'Adding Faculty...' : 'Add Faculty'}
                      </Button>
                    ) : (
                      <Button
                        variant="contained"
                        onClick={handleStepNext}
                        size="small"
                        sx={{
                          borderRadius: { xs: 1, sm: 2 },
                          px: { xs: 1.5, sm: 2, md: 3 },
                          py: { xs: 0.75, sm: 1, md: 1.25 },
                          width: { xs: '100%', sm: 'auto' },
                          minWidth: { xs: 'auto', sm: 100, md: 120 },
                          minHeight: { xs: 40, sm: 44, md: 48 },
                          fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                          background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                          '&:hover': {
                            background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                          }
                        }}
                      >
                        Next
                      </Button>
                    )}

                    <Button
                      onClick={handleReset}
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
                      Reset
                    </Button>
                  </Box>
                </Box>
              </form>
            </CardContent>
          </Card>
         </Container>
      </Box>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <Paper sx={{ 
            p: { xs: 3, sm: 4 }, 
            maxWidth: { xs: '90%', sm: 400 }, 
            mx: 2,
            width: '100%'
          }}>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 2, 
                textAlign: 'center',
                fontSize: { xs: '1.1rem', sm: '1.25rem' }
              }}
            >
              Confirm Faculty Addition
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 3, 
                textAlign: 'center',
                fontSize: { xs: '0.875rem', sm: '0.875rem' }
              }}
            >
              Are you sure you want to add this faculty member? This action cannot be undone.
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              justifyContent: 'center',
              flexDirection: { xs: 'column', sm: 'row' }
            }}>
              <Button
                variant="outlined"
                onClick={() => setShowConfirmDialog(false)}
                sx={{ 
                  px: 3,
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Cancel
              </Button>
              <Button
                variant="contained"
                onClick={formHandler}
                sx={{ 
                  px: 3,
                  width: { xs: '100%', sm: 'auto' }
                }}
              >
                Confirm & Add Faculty
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </AdminLayout>
  );
};

export default AdminAddFaculty;
