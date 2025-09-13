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
  Box
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import ApplicantLayout from '../../components/ApplicantLayout';

const ApplicantLogin = () => {
  const [form, setForm] = useState({ email: '' });
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const sendOtp = async () => {
    try {
      setError('');
      await api.post('/api/applicant/login', { email: form.email });
      setSent(true);
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

  return (
    <ApplicantLayout title="Applicant Login">
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>Applicant Login</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Login to your account to apply for admission
            </Typography>
          {!sent ? (
            <>
              <TextField 
                fullWidth 
                label="Email" 
                type="email"
                value={form.email} 
                onChange={(e) => setForm({ ...form, email: e.target.value })} 
                sx={{ mb: 2 }} 
              />
              {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
              <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={sendOtp}>Send OTP</Button>
              </Stack>
            </>
          ) : (
            <>
              <Typography sx={{ mb: 2 }}>OTP has been sent to {form.email}</Typography>
              <TextField 
                fullWidth 
                label="Enter OTP" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)} 
                sx={{ mb: 2 }} 
              />
              {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
              <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={verifyOtp}>Verify & Login</Button>
                <Button variant="text" onClick={sendOtp}>Resend OTP</Button>
              </Stack>
            </>
          )}
          
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Button 
                variant="text" 
                onClick={() => navigate('/applicant/register')}
                sx={{ textDecoration: 'none', fontWeight: 'bold' }}
              >
                Create New Account
              </Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Container>
    </ApplicantLayout>
  );
};

export default ApplicantLogin;

