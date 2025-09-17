import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Container,
  Grid,
  Avatar,
  Fade,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Tooltip,
  IconButton,
} from '@mui/material';
import {
  School as SchoolIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Login as LoginIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { facultyLogin } from '../redux/actions/facultyAction';
import { studentLogin } from '../redux/actions/studentAction';
import { useTheme as useCustomTheme } from '../contexts/ThemeContext';

const FacultyStudentLogin = () => {
  const dispatch = useDispatch();
  const store = useSelector((state) => state);
  const navigate = useNavigate();
  const { darkMode, toggleTheme } = useCustomTheme();

  const [isStudentLogin, setIsStudentLogin] = useState(true);
  const [studentRegNum, setStudentRegNum] = useState('');
  const [studentPassword, setStudentPassword] = useState('');
  const [facultyRegNum, setFacultyRegNum] = useState('');
  const [facultyPassword, setFacultyPassword] = useState('');

  const [isStudentLoading, setIsStudentLoading] = useState(false);
  const [isFacultyLoading, setIsFacultyLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Effect to handle navigation after successful login
  useEffect(() => {
    if (store.student.isAuthenticated) {
      navigate('/home');
    }
    if (store.faculty.isAuthenticated) {
      navigate('/faculty');
    }
  }, [store.student.isAuthenticated, store.faculty.isAuthenticated, navigate]);

  // Effect to handle errors from Redux store
  useEffect(() => {
    if (store.error.message) {
      setErrors({ message: store.error.message });
      setIsStudentLoading(false);
      setIsFacultyLoading(false);
    } else {
      setErrors({});
    }
  }, [store.error]);

  const studentLoginHandler = (e) => {
    e.preventDefault();
    setIsStudentLoading(true);
    dispatch(
      studentLogin({
        registrationNumber: studentRegNum,
        password: studentPassword,
      })
    );
  };

  const facultyLoginHandler = (e) => {
    e.preventDefault();
    setIsFacultyLoading(true);
    dispatch(
      facultyLogin({
        registrationNumber: facultyRegNum,
        password: facultyPassword,
      })
    );
  };

  const handleToggle = (event, next) => {
    if (next !== null) {
      setIsStudentLogin(next === 'student');
      setErrors({}); // Clear errors when switching forms
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative',
      }}
    >
      <Box sx={{ position: 'absolute', top: 16, right: 16 }}>
        <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          <IconButton onClick={toggleTheme}>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </IconButton>
        </Tooltip>
      </Box>
      <Container maxWidth="lg">
        <Fade in={true} timeout={800}>
          <Grid container spacing={4} alignItems="center" justifyContent="center">
            {/* Left - Branding */}
            <Grid item xs={12} md={6} sx={{ display: { xs: 'none', md: 'block' } }}>
              <Box sx={{ textAlign: 'center', color: 'text.primary' }}>
                <Avatar
                  sx={{
                    width: 120, height: 120, bgcolor: 'primary.main', color: 'common.white', mx: 'auto', mb: 3,
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 60 }} />
                </Avatar>
                <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  VidyaVerse
                </Typography>
                <Typography variant="h5" sx={{ opacity: 0.9, fontWeight: 300 }}>
                  Student & Faculty Portal
                </Typography>
                <Typography variant="body1" sx={{ mt: 1.5, opacity: 0.75 }}>
                  Access academics and resources with your credentials
                </Typography>
              </Box>
            </Grid>

            {/* Right - Login Card */}
            <Grid item xs={12} sm={8} md={6}>
              <Card
                sx={{
                  maxWidth: 480, mx: 'auto', borderRadius: 4, boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  backgroundColor: 'background.paper', borderTop: '6px solid', borderColor: 'primary.main',
                }}
              >
                <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography
                      variant="h4"
                      component="h2"
                      sx={{ fontWeight: 'bold', color: 'text.primary', mb: 2 }}
                    >
                      {isStudentLogin ? 'Student Login' : 'Faculty Login'}
                    </Typography>
                    <ToggleButtonGroup
                      color="primary"
                      exclusive
                      value={isStudentLogin ? 'student' : 'faculty'}
                      onChange={handleToggle}
                      size="small"
                    >
                      <ToggleButton value="student">Student</ToggleButton>
                      <ToggleButton value="faculty">Faculty</ToggleButton>
                    </ToggleButtonGroup>
                    <Box sx={{ mt: 2 }}>
                      <Button
                        component={Link}
                        to="/admissions/apply"
                        variant="outlined"
                        size="small"
                      >
                        Apply for Admission
                      </Button>
                    </Box>
                  </Box>

                  {isStudentLogin ? (
                    <Box component="form" onSubmit={studentLoginHandler}>
                      <TextField
                        fullWidth
                        label="Registration Number"
                        variant="outlined"
                        value={studentRegNum}
                        onChange={(e) => setStudentRegNum(e.target.value)}
                        required
                        sx={{ mb: 2 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon />
                            </InputAdornment>
                          ),
                        }}
                        // --- IMPROVEMENT: Inline Error Display ---
                        error={!!errors.message}
                        helperText={errors.message}
                      />
                      <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        variant="outlined"
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        required
                        sx={{ mb: 2 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon />
                            </InputAdornment>
                          ),
                        }}
                         // --- IMPROVEMENT: Inline Error Display ---
                        error={!!errors.message}
                      />
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={isStudentLoading}
                        sx={{ py: 1.5, fontWeight: 'bold', borderRadius: 2, mt: 1 }}
                        startIcon={isStudentLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                      >
                        {isStudentLoading ? 'Signing In...' : 'Log In'}
                      </Button>
                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2">
                          <Link to="/forgotPassword/student">Forgot Password?</Link>
                        </Typography>
                      </Box>
                    </Box>
                  ) : (
                    <Box component="form" onSubmit={facultyLoginHandler}>
                       <TextField
                        fullWidth
                        label="Registration Number"
                        variant="outlined"
                        value={facultyRegNum}
                        onChange={(e) => setFacultyRegNum(e.target.value)}
                        required
                        sx={{ mb: 2 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon />
                            </InputAdornment>
                          ),
                        }}
                        // --- IMPROVEMENT: Inline Error Display ---
                        error={!!errors.message}
                        helperText={errors.message}
                      />
                      <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        variant="outlined"
                        value={facultyPassword}
                        onChange={(e) => setFacultyPassword(e.target.value)}
                        required
                        sx={{ mb: 2 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon />
                            </InputAdornment>
                          ),
                        }}
                        // --- IMPROVEMENT: Inline Error Display ---
                        error={!!errors.message}
                      />
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={isFacultyLoading}
                        sx={{ py: 1.5, fontWeight: 'bold', borderRadius: 2, mt: 1 }}
                        startIcon={isFacultyLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                      >
                        {isFacultyLoading ? 'Signing In...' : 'Log In'}
                      </Button>
                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2">
                           {/* --- FIX: Corrected Link --- */}
                          <Link to="/forgotPassword/faculty">Forgot Password?</Link>
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>
      </Container>
    </Box>
  );
};

export default FacultyStudentLogin;






