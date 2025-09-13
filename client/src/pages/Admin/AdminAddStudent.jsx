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
  PhoneIphone as PhoneIphoneIcon,
  SupervisorAccount as SupervisorIcon,
  CalendarToday as CalendarIcon,
  School as SchoolIcon,
  Save as SaveIcon,
  Clear as ClearIcon
} from '@mui/icons-material'
import AdminLayout from '../../components/AdminLayout'
import { DEPARTMENTS } from '../../config/departments'
import { adminAddStudent } from '../../redux/actions/adminAction'

const steps = ['Personal Information', 'Academic Details', 'Contact Information', 'Review & Submit'];

const AdminAddStudent = () => {
  const dispatch = useDispatch();
  const admin = useSelector((store) => store.admin);
  const navigate = useNavigate();
  const alert = toast;

  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    department: '',
    year: '',
    section: '',
    registrationNumber: '',
    studentMobileNumber: '',
    fatherName: '',
    fatherMobileNumber: '',
    address: '',
    dateOfBirth: '',
    gender: ''
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const departments = DEPARTMENTS;

  const years = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year'];
  const genderOptions = ['Male', 'Female'];

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
      year: '',
      section: '',
      registrationNumber: '',
      studentMobileNumber: '',
      fatherName: '',
      fatherMobileNumber: '',
      address: '',
      dateOfBirth: '',
      gender: ''
    });
    setErrors({});
    setActiveStep(0);
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    switch (step) {
      case 0:
        if (!formData.name || !formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.email || !formData.email.trim()) newErrors.email = 'Email is required';
        else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Email is invalid';
        if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
        if (!formData.gender) newErrors.gender = 'Gender is required';
        break;
      case 1:
        if (!formData.registrationNumber || !formData.registrationNumber.trim()) newErrors.registrationNumber = 'Registration number is required';
        if (!formData.department) newErrors.department = 'Department is required';
        if (!formData.year) newErrors.year = 'Year is required';
        if (!formData.section || !formData.section.trim()) newErrors.section = 'Section is required';
        break;
      case 2:
        if (!formData.studentMobileNumber || !formData.studentMobileNumber.trim()) newErrors.studentMobileNumber = 'Student contact number is required';
        if (!formData.fatherName || !formData.fatherName.trim()) newErrors.fatherName = 'Father name is required';
        if (!formData.fatherMobileNumber || !formData.fatherMobileNumber.trim()) newErrors.fatherMobileNumber = 'Father contact number is required';
        if (!formData.address || !formData.address.trim()) newErrors.address = 'Address is required';
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
    if (!validateStep(0) || !validateStep(1) || !validateStep(2)) {
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
      const res = await dispatch(adminAddStudent(formData));
      if (res?.success) {
        const payload = res.data;
        const reg = payload?.result?.registrationNumber;
        const defaultPwd = payload?.defaultPassword;
        if (reg) {
          toast.success(`Student added! Reg No: ${reg}`);
          if (defaultPwd) {
            toast.success(`Temporary password: ${defaultPwd}`);
          } else {
            toast.success('Use configured default student password.');
          }
        } else {
          toast.success('Student added successfully!');
        }
      } else {
        throw new Error('Add student failed');
      }
      handleReset();
    } catch (error) {
      toast.error('Failed to add student. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid 
            container 
            spacing={{ xs: 1.5, sm: 2, md: 3 }}
            sx={{ width: '100%', margin: 0 }}
          >
            <Grid item xs={12}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: { xs: 1.5, sm: 2 }, 
                  color: 'primary.main', 
                  fontWeight: 'bold',
                  fontSize: { xs: '0.9rem', sm: '1.1rem', md: '1.25rem' }
                }}
              >
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
                label="Date of Birth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleInputChange('dateOfBirth')}
                error={!!errors.dateOfBirth}
                helperText={errors.dateOfBirth}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <CalendarIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth error={!!errors.gender}>
                <InputLabel>Gender</InputLabel>
                <Select
                  value={formData.gender}
                  onChange={handleInputChange('gender')}
                  label="Gender"
                >
                  {genderOptions.map((g) => (
                    <MenuItem key={g} value={g}>{g}</MenuItem>
                  ))}
                </Select>
                {errors.gender && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                    {errors.gender}
                  </Typography>
                )}
              </FormControl>
            </Grid>
          </Grid>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                Academic Details
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Registration Number"
                value={formData.registrationNumber}
                onChange={handleInputChange('registrationNumber')}
                error={!!errors.registrationNumber}
                helperText={errors.registrationNumber}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SchoolIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
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
              <FormControl fullWidth error={!!errors.year}>
                <InputLabel>Academic Year</InputLabel>
                <Select
                  value={formData.year}
                  onChange={handleInputChange('year')}
                  label="Academic Year"
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
                {errors.year && (
                  <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                    {errors.year}
                  </Typography>
                )}
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Section"
                value={formData.section}
                onChange={handleInputChange('section')}
                error={!!errors.section}
                helperText={errors.section}
                placeholder="e.g., A, B, C"
              />
            </Grid>
          </Grid>
        );

      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" sx={{ mb: 2, color: 'primary.main', fontWeight: 'bold' }}>
                Contact Information
              </Typography>
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Number"
                value={formData.studentMobileNumber}
                onChange={handleInputChange('studentMobileNumber')}
                error={!!errors.studentMobileNumber}
                helperText={errors.studentMobileNumber}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Parent/Guardian Name"
                value={formData.fatherName}
                onChange={handleInputChange('fatherName')}
                error={!!errors.fatherName}
                helperText={errors.fatherName}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SupervisorIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Parent Contact Number"
                value={formData.fatherMobileNumber}
                onChange={handleInputChange('fatherMobileNumber')}
                error={!!errors.fatherMobileNumber}
                helperText={errors.fatherMobileNumber}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneIphoneIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Address"
                value={formData.address}
                onChange={handleInputChange('address')}
                error={!!errors.address}
                helperText={errors.address}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        );

      case 3:
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
                  <Typography variant="subtitle2" color="text.secondary">Registration Number:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{formData.registrationNumber}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Department:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{formData.department}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Year:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{formData.year}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Section:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{formData.section}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Contact Number:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{formData.studentMobileNumber}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Father Name:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{formData.fatherName}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Father Contact:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{formData.fatherMobileNumber}</Typography>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary">Address:</Typography>
                  <Typography variant="body1" sx={{ mb: 1 }}>{formData.address}</Typography>
                </Grid>
              </Grid>
            </Paper>
            <Box sx={{ textAlign: 'center', p: 2, bgcolor: 'warning.light', borderRadius: 2 }}>
              <Typography variant="body2" color="warning.contrastText">
                ⚠️ Please verify all information is correct before clicking "Add Student"
              </Typography>
            </Box>
          </Box>
        );

      default:
        return 'Unknown step';
    }
  };

  return (
    <AdminLayout title="Add New Student">
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
              Add New Student
            </Typography>
            <Typography 
              variant="body1" 
              color="text.secondary"
              sx={{ 
                fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' },
                lineHeight: 1.4
              }}
            >
              Fill in the student information to add them to the system
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
                        {isLoading ? 'Adding...' : 'Add Student'}
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
              Confirm Student Addition
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                mb: 3, 
                textAlign: 'center',
                fontSize: { xs: '0.875rem', sm: '0.875rem' }
              }}
            >
              Are you sure you want to add this student? This action cannot be undone.
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
                Confirm & Add Student
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
    </AdminLayout>
  );
};

export default AdminAddStudent;
