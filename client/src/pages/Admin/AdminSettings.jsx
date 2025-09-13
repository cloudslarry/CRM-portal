import React, { useState } from 'react';
import {
  Box,
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  InputAdornment,
  IconButton,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Work as WorkIcon,
  Security as SecurityIcon,
  Notifications as NotificationsIcon,
  Palette as PaletteIcon,
  Language as LanguageIcon
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { adminUpdatePassword } from '../../redux/actions/adminAction';
import AdminLayout from '../../components/AdminLayout';
import { useTheme as useCustomTheme } from '../../contexts/ThemeContext';
import Swal from 'sweetalert2';

const AdminSettings = () => {
  const admin = useSelector((state) => state.admin);
  const dispatch = useDispatch();
  const { darkMode, toggleTheme } = useCustomTheme();
  
  // Password change state
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  // UI state
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Settings state
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: true,
    darkMode: false,
    language: 'en'
  });

  const handlePasswordChange = (field) => (event) => {
    setPasswordData({
      ...passwordData,
      [field]: event.target.value
    });
    setError('');
    setSuccess('');
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords({
      ...showPasswords,
      [field]: !showPasswords[field]
    });
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return {
      isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
      checks: {
        minLength,
        hasUpperCase,
        hasLowerCase,
        hasNumbers,
        hasSpecialChar
      }
    };
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    const passwordValidation = validatePassword(passwordData.newPassword);
    if (!passwordValidation.isValid) {
      setError('Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters');
      return;
    }

    if (passwordData.currentPassword === passwordData.newPassword) {
      setError('New password must be different from current password');
      return;
    }

    setLoading(true);

    try {
      // Dispatch password update action
      await dispatch(adminUpdatePassword(passwordData));
      
      setSuccess('Password updated successfully!');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });

      // Show success alert
      Swal.fire({
        icon: 'success',
        title: 'Success!',
        text: 'Your password has been updated successfully.',
        confirmButtonColor: '#1976d2'
      });

    } catch (err) {
      setError('Failed to update password. Please try again.');
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to update password. Please check your current password and try again.',
        confirmButtonColor: '#d32f2f'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (setting) => (event) => {
    setSettings({
      ...settings,
      [setting]: event.target.checked
    });
  };

  const PasswordStrengthIndicator = ({ password }) => {
    const validation = validatePassword(password);
    const checks = validation.checks;
    
    if (!password) return null;

    return (
      <Box sx={{ mt: 1 }}>
        <Typography variant="caption" color="text.secondary">
          Password Strength:
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, mt: 0.5 }}>
          {Object.entries(checks).map(([key, isValid]) => (
            <Box
              key={key}
              sx={{
                width: 20,
                height: 4,
                borderRadius: 2,
                backgroundColor: isValid ? 'success.main' : 'grey.300'
              }}
            />
          ))}
        </Box>
        <Typography variant="caption" color={validation.isValid ? 'success.main' : 'warning.main'}>
          {validation.isValid ? 'Strong' : 'Weak'}
        </Typography>
      </Box>
    );
  };

  return (
    <AdminLayout title="Settings">
      <Container maxWidth="lg">
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account settings and preferences
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Profile Information */}
          <Grid item xs={12} md={4}>
            <Card sx={{ height: 'fit-content' }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    mx: 'auto',
                    mb: 2,
                    bgcolor: 'primary.main'
                  }}
                  src={admin.admin?.avatar}
                >
                  <PersonIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {admin.admin?.name || 'Admin'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {admin.admin?.registrationNumber || 'Admin ID'}
                </Typography>
                
                <Divider sx={{ my: 2 }} />
                
                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <EmailIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Email"
                      secondary={admin.admin?.email}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <PhoneIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Contact"
                      secondary={admin.admin?.contactNumber}
                    />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon>
                      <WorkIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="Department"
                      secondary={admin.admin?.department}
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          {/* Settings Content */}
          <Grid item xs={12} md={8}>
            <Grid container spacing={3}>
              {/* Change Password */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <SecurityIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Change Password
                      </Typography>
                    </Box>

                    {error && (
                      <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                      </Alert>
                    )}

                    {success && (
                      <Alert severity="success" sx={{ mb: 2 }}>
                        {success}
                      </Alert>
                    )}

                    <Box component="form" onSubmit={handlePasswordSubmit}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Current Password"
                            type={showPasswords.current ? 'text' : 'password'}
                            value={passwordData.currentPassword}
                            onChange={handlePasswordChange('currentPassword')}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LockIcon color="action" />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => togglePasswordVisibility('current')}
                                    edge="end"
                                  >
                                    {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              )
                            }}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="New Password"
                            type={showPasswords.new ? 'text' : 'password'}
                            value={passwordData.newPassword}
                            onChange={handlePasswordChange('newPassword')}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LockIcon color="action" />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => togglePasswordVisibility('new')}
                                    edge="end"
                                  >
                                    {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              )
                            }}
                          />
                          <PasswordStrengthIndicator password={passwordData.newPassword} />
                        </Grid>

                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Confirm New Password"
                            type={showPasswords.confirm ? 'text' : 'password'}
                            value={passwordData.confirmPassword}
                            onChange={handlePasswordChange('confirmPassword')}
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <LockIcon color="action" />
                                </InputAdornment>
                              ),
                              endAdornment: (
                                <InputAdornment position="end">
                                  <IconButton
                                    onClick={() => togglePasswordVisibility('confirm')}
                                    edge="end"
                                  >
                                    {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                                  </IconButton>
                                </InputAdornment>
                              )
                            }}
                          />
                        </Grid>

                        <Grid item xs={12}>
                          <Button
                            type="submit"
                            variant="contained"
                            fullWidth
                            disabled={loading}
                            sx={{ mt: 2 }}
                          >
                            {loading ? 'Updating...' : 'Update Password'}
                          </Button>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              {/* Preferences */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <PaletteIcon sx={{ mr: 2, color: 'primary.main' }} />
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        Preferences
                      </Typography>
                    </Box>

                    <List>
                      <ListItem>
                        <ListItemIcon>
                          <NotificationsIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Push Notifications"
                          secondary="Receive notifications for important updates"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.notifications}
                              onChange={handleSettingChange('notifications')}
                            />
                          }
                          label=""
                        />
                      </ListItem>

                      <ListItem>
                        <ListItemIcon>
                          <EmailIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Email Notifications"
                          secondary="Receive email notifications"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={settings.emailNotifications}
                              onChange={handleSettingChange('emailNotifications')}
                            />
                          }
                          label=""
                        />
                      </ListItem>

                      <ListItem>
                        <ListItemIcon>
                          <PaletteIcon color="primary" />
                        </ListItemIcon>
                        <ListItemText 
                          primary="Dark Mode"
                          secondary="Switch to dark theme"
                        />
                        <FormControlLabel
                          control={
                            <Switch
                              checked={darkMode}
                              onChange={toggleTheme}
                            />
                          }
                          label=""
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </AdminLayout>
  );
};

export default AdminSettings;
