import React, { useState, useEffect } from 'react';
import api from '../../config/api';
import ApplicantLayout from '../../components/ApplicantLayout';
import { 
  Container, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Stack,
  Box,
  Grid,
  Alert,
  Divider
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ApplicantSettings = () => {
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    contactNumber: '',
    address: ''
  });
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const { data } = await api.get('/api/applicant/profile');
      setProfile(data.result);
    } catch (err) {
      console.error('Failed to fetch profile:', err);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      await api.put('/api/applicant/profile', profile);
      setSuccess('Profile updated successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    try {
      await api.put('/api/applicant/password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setSuccess('Password changed successfully!');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('applicantToken');
    navigate('/applicant/login');
  };

  return (
    <ApplicantLayout title="Settings">
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Typography variant="h4" gutterBottom>Account Settings</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage your account information and preferences
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Profile Information */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Profile Information</Typography>
            <Box component="form" onSubmit={handleProfileUpdate}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Full Name" 
                    value={profile.name} 
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Email" 
                    type="email"
                    value={profile.email} 
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Contact Number" 
                    value={profile.contactNumber} 
                    onChange={(e) => setProfile({ ...profile, contactNumber: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Address" 
                    multiline
                    rows={3}
                    value={profile.address} 
                    onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  />
                </Grid>
              </Grid>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? 'Updating...' : 'Update Profile'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Change Password</Typography>
            <Box component="form" onSubmit={handlePasswordChange}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Current Password" 
                    type="password"
                    value={passwordForm.currentPassword} 
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="New Password" 
                    type="password"
                    value={passwordForm.newPassword} 
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Confirm New Password" 
                    type="password"
                    value={passwordForm.confirmPassword} 
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                  />
                </Grid>
              </Grid>
              <Button 
                type="submit" 
                variant="contained" 
                disabled={loading}
                sx={{ mt: 2 }}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </Button>
            </Box>
          </CardContent>
        </Card>

        {/* Account Actions */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Account Actions</Typography>
            <Stack direction="row" spacing={2}>
              <Button 
                variant="outlined" 
                color="error"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Container>
    </ApplicantLayout>
  );
};

export default ApplicantSettings;

