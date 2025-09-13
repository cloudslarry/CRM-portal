import React, { useState } from 'react';
import api from '../../config/api';
import authToken from '../../redux/utils/authToken';
import { jwtDecode } from 'jwt-decode';
import store from '../../redux/store';
import { setStudentUser } from '../../redux/actions/studentAction';
import { 
  Container, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Stack,
  Box,
  Stepper,
  Step,
  StepLabel,
  Grid
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ApplicantLayout from '../../components/ApplicantLayout';

const ApplicantRegistration = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [form, setForm] = useState({ 
    name: '', 
    email: '', 
    contactNumber: '',
    fatherName: '',
    motherName: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    category: ''
  });
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const steps = ['Personal Information', 'Contact Details', 'Verification'];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const sendOtp = async () => {
    try {
      setError('');
      await api.post('/api/applicant/register', form);
      setSent(true);
      handleNext();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP');
    }
  };

  const verifyOtp = async () => {
    try {
      setError('');
      const { data } = await api.post('/api/applicant/verify', { email: form.email, otp });
      const token = data.token;
      localStorage.setItem('applicantToken', token);
      authToken(token);
      const decoded = jwtDecode(token);
      store.dispatch(setStudentUser(decoded));
      navigate('/admissions/apply');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP');
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                label="Full Name" 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })} 
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                label="Email" 
                type="email"
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                label="Father's Name" 
                value={form.fatherName} 
                onChange={(e) => setForm({ ...form, fatherName: e.target.value })} 
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                label="Mother's Name" 
                value={form.motherName} 
                onChange={(e) => setForm({ ...form, motherName: e.target.value })} 
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                label="Date of Birth" 
                type="date"
                value={form.dateOfBirth} 
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} 
                InputLabelProps={{ shrink: true }}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                label="Gender" 
                select
                value={form.gender} 
                onChange={(e) => setForm({ ...form, gender: e.target.value })} 
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Category" 
                select
                value={form.category} 
                onChange={(e) => setForm({ ...form, category: e.target.value })} 
                required
              >
                <option value="">Select Category</option>
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </TextField>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField 
                fullWidth 
                label="Contact Number" 
                value={form.contactNumber} 
                onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} 
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField 
                fullWidth 
                label="Address" 
                multiline
                rows={3}
                value={form.address} 
                onChange={(e) => setForm({ ...form, address: e.target.value })} 
                required
              />
            </Grid>
          </Grid>
        );
      case 2:
        return (
          <Box>
            <Typography variant="h6" gutterBottom>Email Verification</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              We've sent a verification code to {form.email}
            </Typography>
            <TextField 
              fullWidth 
              label="Enter OTP" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              sx={{ mb: 2 }} 
            />
            {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
            <Stack direction="row" spacing={2}>
              <Button variant="text" onClick={sendOtp}>Resend OTP</Button>
            </Stack>
          </Box>
        );
      default:
        return 'Unknown step';
    }
  };

  return (
    <ApplicantLayout title="Applicant Registration">
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>Create Your Account</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Complete the registration process to apply for admission
            </Typography>
            
            <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box sx={{ mb: 4 }}>
              {renderStepContent(activeStep)}
            </Box>

            <Stack direction="row" spacing={2} justifyContent="space-between">
              <Button
                disabled={activeStep === 0}
                onClick={handleBack}
                variant="outlined"
              >
                Back
              </Button>
              <Box>
                {activeStep === steps.length - 1 ? (
                  <Button variant="contained" onClick={verifyOtp}>
                    Complete Registration
                  </Button>
                ) : activeStep === 1 ? (
                  <Button variant="contained" onClick={sendOtp}>
                    Send OTP
                  </Button>
                ) : (
                  <Button variant="contained" onClick={handleNext}>
                    Next
                  </Button>
                )}
              </Box>
            </Stack>
          
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <Button 
                variant="text" 
                onClick={() => navigate('/applicant/login')}
                sx={{ textDecoration: 'none', fontWeight: 'bold' }}
              >
                Login here
              </Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
    </ApplicantLayout>
  );
};

export default ApplicantRegistration;

