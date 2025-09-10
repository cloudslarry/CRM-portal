import React, { useState } from 'react';
import api from '../../config/api';
import authToken from '../../redux/utils/authToken';
import { jwtDecode } from 'jwt-decode';
import store from '../../redux/store';
import { setStudentUser } from '../../redux/actions/studentAction';
import { Container, Card, CardContent, Typography, TextField, Button, Stack } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ApplicantAuth = () => {
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [otp, setOtp] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const sendOtp = async () => {
    try {
      setError('');
      await api.post('/api/applicant/register', form);
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
      // We don't have applicant reducer; token carries identity for API calls
      // Optionally set into student slice to keep isAuthenticated true for apply page navigation
      store.dispatch(setStudentUser(decoded));
      navigate('/admissions/apply');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify OTP');
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Card>
        <CardContent>
          <Typography variant="h5" gutterBottom>Applicant Registration / Login</Typography>
          {!sent ? (
            <>
              <TextField fullWidth label="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} sx={{ mb: 2 }} />
              <TextField fullWidth label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} sx={{ mb: 2 }} />
              <TextField fullWidth label="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} sx={{ mb: 2 }} />
              {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
              <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={sendOtp}>Send OTP</Button>
              </Stack>
            </>
          ) : (
            <>
              <Typography sx={{ mb: 2 }}>OTP has been sent to your email.</Typography>
              <TextField fullWidth label="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} sx={{ mb: 2 }} />
              {error && <Typography color="error" sx={{ mb: 2 }}>{error}</Typography>}
              <Stack direction="row" spacing={2}>
                <Button variant="contained" onClick={verifyOtp}>Verify & Continue</Button>
                <Button variant="text" onClick={sendOtp}>Resend OTP</Button>
              </Stack>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default ApplicantAuth;


