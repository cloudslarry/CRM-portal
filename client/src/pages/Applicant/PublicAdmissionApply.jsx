import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { Container, Card, CardContent, Typography, Grid, TextField, Button, Stack, Divider, Box, Paper, FormControl, InputLabel, Select, MenuItem, InputAdornment, Stepper, Step, StepLabel, Avatar } from '@mui/material';
import { Email as EmailIcon, Person as PersonIcon, School as SchoolIcon, Class as ClassIcon, Phone as PhoneIcon, Home as HomeIcon, CalendarToday as CalendarIcon, PersonAddAlt as AddUserIcon, CheckCircle as CheckCircleIcon } from '@mui/icons-material';
import { DEPARTMENTS } from '../../config/departments';
import ApplicantLayout from '../../components/ApplicantLayout';

const PublicAdmissionApply = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', department: '', year: '', section: '',
    studentMobileNumber: '', fatherName: '', fatherMobileNumber: '', address: '', dateOfBirth: ''
  });
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onBlur = (e) => setTouched({ ...touched, [e.target.name]: true });

  const errors = {
    name: !form.name && touched.name ? 'Name is required' : '',
    email: !form.email && touched.email ? 'Email is required' : '',
    department: !form.department && touched.department ? 'Department is required' : '',
    year: !form.year && touched.year ? 'Year is required' : '',
    section: !form.section && touched.section ? 'Section is required' : '',
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      setSubmitting(true);
      await api.post('/api/public/admissions/apply', form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const steps = ['Personal Information', 'Academic Details', 'Contact Information', 'Review & Submit'];

  const stepIsValid = (step) => {
    if (step === 0) {
      return Boolean(form.name && form.email);
    }
    if (step === 1) {
      return Boolean(form.department && form.year && form.section);
    }
    if (step === 2) {
      return true;
    }
    return true;
  };

  const handleNext = () => {
    setTouched({
      ...touched,
      ...(activeStep === 0 ? { name: true, email: true } : {}),
      ...(activeStep === 1 ? { department: true, year: true, section: true } : {}),
    });
    if (!stepIsValid(activeStep)) return;
    setActiveStep((prev) => prev + 1);
  };

  const handleBack = () => setActiveStep((prev) => Math.max(0, prev - 1));
  const handleReset = () => {
    setForm({
      name: '', email: '', department: '', year: '', section: '',
      studentMobileNumber: '', fatherName: '', fatherMobileNumber: '', address: '', dateOfBirth: ''
    });
    setTouched({});
    setError('');
    setActiveStep(0);
  };

  return (
    <ApplicantLayout title="Apply for Admission">
      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Header */}
        <Box sx={{ textAlign: 'center', mb: 3 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', width: 64, height: 64, mb: 1 }}>
            <AddUserIcon sx={{ color: 'white' }} />
          </Avatar>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
            Apply for Admission
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Fill in the student information to submit an application
          </Typography>
        </Box>

        {/* Stepper */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Stepper activeStep={activeStep} alternativeLabel>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
          </CardContent>
        </Card>

        {/* Info Bar (mirroring admin style with Paper) */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Typography variant="subtitle2" color="text.secondary">
            Note: Please ensure all required fields are accurate. You will receive an email with your application ID after submission.
          </Typography>
        </Paper>

        <Card>
          <CardContent>
            {submitted ? (
              <>
                <Typography color="success.main" sx={{ mb: 2 }}>Application submitted successfully. We will contact you soon.</Typography>
                <Button variant="contained" onClick={() => navigate('/')}>Go Home</Button>
              </>
            ) : (
              <form onSubmit={onSubmit}>
                {activeStep === 0 && (
                  <>
                    <Typography variant="h6" sx={{ mb: 2 }}>Personal Information</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Full Name" name="name" value={form.name} onChange={onChange} onBlur={onBlur} required error={Boolean(errors.name)} helperText={errors.name} InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon fontSize="small" /></InputAdornment> }} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Email Address" name="email" value={form.email} onChange={onChange} onBlur={onBlur} required error={Boolean(errors.email)} helperText={errors.email} InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon fontSize="small" /></InputAdornment> }} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} name="dateOfBirth" value={form.dateOfBirth} onChange={onChange} InputProps={{ startAdornment: <InputAdornment position="start"><CalendarIcon fontSize="small" /></InputAdornment> }} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Address" name="address" value={form.address} onChange={onChange} InputProps={{ startAdornment: <InputAdornment position="start"><HomeIcon fontSize="small" /></InputAdornment> }} />
                      </Grid>
                    </Grid>
                  </>
                )}

                {activeStep === 1 && (
                  <>
                    <Typography variant="h6" sx={{ mb: 2 }}>Academic Details</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required error={Boolean(errors.department)}>
                          <InputLabel>Department</InputLabel>
                          <Select label="Department" name="department" value={form.department} onChange={onChange} onBlur={onBlur}>
                            {DEPARTMENTS.map((d) => (<MenuItem key={d} value={d}>{d}</MenuItem>))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required error={Boolean(errors.year)}>
                          <InputLabel>Year</InputLabel>
                          <Select label="Year" name="year" value={form.year} onChange={onChange} onBlur={onBlur}>
                            <MenuItem value="1st Year">1st Year</MenuItem>
                            <MenuItem value="2nd Year">2nd Year</MenuItem>
                            <MenuItem value="3rd Year">3rd Year</MenuItem>
                            <MenuItem value="4th Year">4th Year</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <FormControl fullWidth required error={Boolean(errors.section)}>
                          <InputLabel>Section</InputLabel>
                          <Select label="Section" name="section" value={form.section} onChange={onChange} onBlur={onBlur}>
                            <MenuItem value="A">A</MenuItem>
                            <MenuItem value="B">B</MenuItem>
                            <MenuItem value="C">C</MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    </Grid>
                  </>
                )}

                {activeStep === 2 && (
                  <>
                    <Typography variant="h6" sx={{ mb: 2 }}>Contact Information</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Student Mobile Number" name="studentMobileNumber" value={form.studentMobileNumber} onChange={onChange} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" /></InputAdornment> }} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Father Name" name="fatherName" value={form.fatherName} onChange={onChange} />
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <TextField fullWidth label="Father Mobile Number" name="fatherMobileNumber" value={form.fatherMobileNumber} onChange={onChange} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon fontSize="small" /></InputAdornment> }} />
                      </Grid>
                    </Grid>
                  </>
                )}

                {activeStep === 3 && (
                  <>
                    <Typography variant="h6" sx={{ mb: 2 }}>Review & Submit</Typography>
                    <Grid container spacing={2}>
                      {[
                        ['Name', form.name],
                        ['Email', form.email],
                        ['Department', form.department],
                        ['Year', form.year],
                        ['Section', form.section],
                        ['Student Mobile', form.studentMobileNumber],
                        ['Father Name', form.fatherName],
                        ['Father Mobile', form.fatherMobileNumber],
                        ['Address', form.address],
                        ['Date of Birth', form.dateOfBirth],
                      ].map(([label, value]) => (
                        <Grid item xs={12} sm={6} key={label}>
                          <Paper sx={{ p: 1.5 }}>
                            <Typography variant="caption" color="text.secondary">{label}</Typography>
                            <Typography variant="body1">{value || '-'}</Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </>
                )}

                {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
                <Stack direction="row" spacing={2} sx={{ mt: 3, justifyContent: 'space-between' }}>
                  <Box>
                    <Button variant="text" onClick={() => navigate('/admissions/status')}>Check Status</Button>
                  </Box>
                  <Box>
                    <Button sx={{ mr: 1 }} onClick={handleReset} color="inherit">Reset</Button>
                    {activeStep > 0 && (
                      <Button sx={{ mr: 1 }} variant="outlined" onClick={handleBack}>Back</Button>
                    )}
                    {activeStep < steps.length - 1 && (
                      <Button variant="contained" onClick={handleNext}>Next</Button>
                    )}
                    {activeStep === steps.length - 1 && (
                      submitted ? (
                        <Button variant="contained" color="success" startIcon={<CheckCircleIcon />} disabled>
                          Submitted
                        </Button>
                      ) : (
                        <Button type="submit" variant="contained" disabled={submitting}>
                          {submitting ? 'Submitting...' : 'Submit'}
                        </Button>
                      )
                    )}
                  </Box>
                </Stack>
              </form>
            )}
          </CardContent>
        </Card>
      </Container>
    </ApplicantLayout>
  );
};

export default PublicAdmissionApply;


