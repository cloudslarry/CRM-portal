import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
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
  InputAdornment,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  PhoneIphone as PhoneIphoneIcon,
  PhotoCamera as PhotoIcon,
  Save as SaveIcon
} from '@mui/icons-material';
import StudentLayout from '../../components/StudentLayout';
import { studentUpdate, studentUpdatePassword, studentLogout } from '../../redux/actions/studentAction';
import toast from 'react-hot-toast';

const StudentSettings = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const studentStore = useSelector((store) => store.student);

  const student = studentStore?.student?.student || {};

  // Profile
  const [email, setEmail] = useState(student.email || '');
  const [mobile, setMobile] = useState(student.studentMobileNumber || '');
  const [fatherName, setFatherName] = useState(student.fatherName || '');
  const [fatherMobile, setFatherMobile] = useState(student.fatherMobileNumber || '');
  const avatarUrl = student?.avatar?.url || '';
  const [avatar, setAvatar] = useState(avatarUrl);
  const [avatarPreview, setAvatarPreview] = useState(avatarUrl);

  // Password
  const [passwords, setPasswords] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({ old: false, new: false, confirm: false });

  const imageHandler = (e) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatarPreview(reader.result);
        setAvatar(reader.result);
      }
    };
    if (e.target.files && e.target.files[0]) reader.readAsDataURL(e.target.files[0]);
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('studentMobileNumber', mobile);
    form.append('email', email);
    form.append('fatherName', fatherName);
    form.append('fatherMobileNumber', fatherMobile);
    form.append('registrationNumber', student.registrationNumber);
    form.append('avatar', avatar);
    dispatch(studentUpdate(form));
    toast.success('Profile updated. Please login again');
    dispatch(studentLogout());
    navigate('/');
  };

  const togglePasswordVisibility = (field) => setShowPasswords((p) => ({ ...p, [field]: !p[field] }));
  const handlePasswordChange = (field) => (e) => setPasswords({ ...passwords, [field]: e.target.value });

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    dispatch(
      studentUpdatePassword({
        oldPassword: passwords.oldPassword,
        newPassword: passwords.newPassword,
        confirmNewPassword: passwords.confirmPassword,
        registrationNumber: student.registrationNumber,
      })
    );
    toast.success('Password updated. Please login again');
    dispatch(studentLogout());
    navigate('/');
  };

  if (!studentStore?.isAuthenticated) {
    navigate('/');
    return null;
  }

  return (
    <StudentLayout title="Settings">
      <Container maxWidth="lg">
        <Box sx={{ mb: 2 }}>
          <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
            Settings
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Manage your account and preferences
          </Typography>
        </Box>

        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', minHeight: { md: 360, xs: 'auto' } }}>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Avatar sx={{ width: 80, height: 80, mx: 'auto', mb: 2 }} src={avatarPreview}>
                  <PersonIcon sx={{ fontSize: 40 }} />
                </Avatar>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                  {student.name || 'Student'}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {student.registrationNumber || 'ID'}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <List dense>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon><EmailIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Email" secondary={student.email} />
                  </ListItem>
                  <ListItem sx={{ px: 0 }}>
                    <ListItemIcon><PhoneIcon color="primary" /></ListItemIcon>
                    <ListItemText primary="Contact" secondary={student.studentMobileNumber} />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={8}>
            <Grid container spacing={0}>
              <Grid item xs={12}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', mb: 2 }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Update Profile</Typography>
                    <Box component="form" onSubmit={handleProfileSubmit}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Box sx={{ textAlign: 'center' }}>
                            <Avatar src={avatarPreview} sx={{ width: 96, height: 96, mx: 'auto', mb: 1 }} />
                            <Button variant="outlined" component="label" startIcon={<PhotoIcon />} size="small">
                              Change Photo
                              <input hidden accept="image/*" type="file" onChange={imageHandler} />
                            </Button>
                          </Box>
                        </Grid>
                        <Grid item xs={12}>
                          <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><EmailIcon /></InputAdornment> }} />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField fullWidth label="Student Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIcon /></InputAdornment> }} />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField fullWidth label="Father Name" value={fatherName} onChange={(e) => setFatherName(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><PersonIcon /></InputAdornment> }} />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField fullWidth label="Father Mobile" value={fatherMobile} onChange={(e) => setFatherMobile(e.target.value)} InputProps={{ startAdornment: <InputAdornment position="start"><PhoneIphoneIcon /></InputAdornment> }} />
                        </Grid>
                        <Grid item xs={12}>
                          <Button type="submit" variant="contained" startIcon={<SaveIcon />}>Save Changes</Button>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>

              <Grid item xs={12}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', mt: 3 }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }}>Change Password</Typography>
                    <Box component="form" onSubmit={handlePasswordSubmit}>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <TextField fullWidth label="Current Password" type={showPasswords.old ? 'text' : 'password'} value={passwords.oldPassword} onChange={handlePasswordChange('oldPassword')} InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton onClick={() => togglePasswordVisibility('old')} edge="end">{showPasswords.old ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }} />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField fullWidth label="New Password" type={showPasswords.new ? 'text' : 'password'} value={passwords.newPassword} onChange={handlePasswordChange('newPassword')} InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton onClick={() => togglePasswordVisibility('new')} edge="end">{showPasswords.new ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }} />
                        </Grid>
                        <Grid item xs={12}>
                          <TextField fullWidth label="Confirm New Password" type={showPasswords.confirm ? 'text' : 'password'} value={passwords.confirmPassword} onChange={handlePasswordChange('confirmPassword')} InputProps={{ startAdornment: <InputAdornment position="start"><LockIcon /></InputAdornment>, endAdornment: <InputAdornment position="end"><IconButton onClick={() => togglePasswordVisibility('confirm')} edge="end">{showPasswords.confirm ? <VisibilityOff /> : <Visibility />}</IconButton></InputAdornment> }} />
                        </Grid>
                        <Grid item xs={12}>
                          <Button type="submit" variant="contained">Update Password</Button>
                        </Grid>
                      </Grid>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </StudentLayout>
  );
};

export default StudentSettings;


