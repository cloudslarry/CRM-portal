import React,{useEffect, useState} from 'react'
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
  IconButton,
  ToggleButtonGroup,
  ToggleButton,
  CircularProgress,
  Tooltip
} from '@mui/material'
import { 
  School as SchoolIcon,
  Person as PersonIcon,
  Lock as LockIcon,
  Login as LoginIcon,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon
} from '@mui/icons-material'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { facultyLogin } from '../redux/actions/facultyAction'
import { studentLogin } from '../redux/actions/studentAction'

import toast from 'react-hot-toast'
import { useTheme as useCustomTheme } from '../contexts/ThemeContext'

const FacultyStudentLogin = () => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state)
    const alert = toast;
    const {isAuthenticated} = useSelector((state) => state.student);
    const {isAuthenticated:facultyAuthenticated} = useSelector((state) => state.faculty)
    
    const [facultyRegNum, setFacultyRegNum] = useState('')
    const [facultyPassword, setFacultyPassword] = useState('')
    const [studentRegNum, setStudentRegNum] = useState('')
    const [studentPassword, setStudentPassword] = useState('')
    const [errors, setErrors] = useState({})
    const [errorsHelper, setErrorsHelper] = useState({})
    const [isFacultyLoading, setIsFacultyLoading] = useState(false)
    const [isStudentLoading, setIsStudentLoading] = useState(false)
    const [isStudentLogin,setIsStudentLogin] = useState(true);

    const navigate = useNavigate();
    const { darkMode, toggleTheme } = useCustomTheme()

    useEffect(() => {
        if(facultyAuthenticated)
        {
            navigate('/faculty')
            
        }
    },[facultyAuthenticated])

    useEffect(() => {
        if(isAuthenticated)
        {
            navigate('/home')
           
        }
    },[isAuthenticated])

    useEffect(() => {
        if(store.error)
        {
            setErrors(store.error)
            setIsFacultyLoading(false)
            setIsStudentLoading(false)
        }
    },[store.error])

    useEffect(() => {
        if (store.errorHelper) {
            setErrorsHelper(store.errorHelper)
            setIsStudentLoading(false)
        }
    }, [store.errorHelper])

    const studentLoginHandler = (e) => {
        e.preventDefault();
        setIsStudentLoading(true);
        dispatch(studentLogin({registrationNumber:studentRegNum,password:studentPassword}))
    }

    const facultyLoginHandler = (e) => {
        e.preventDefault();
        setIsFacultyLoading(true);
        dispatch(facultyLogin({registrationNumber:facultyRegNum,password:facultyPassword}))
    }

    useEffect(() => {
        if(store.error || facultyAuthenticated){
            setIsFacultyLoading(false)
        }

    },[store.error,facultyAuthenticated])

    useEffect(() => {
        if(store.errorHelper || isAuthenticated || store.error)
        {
            setIsStudentLoading(false);
        }

    },[store.errorHelper,isAuthenticated,store.error])

    const handleToggle = (event, next) => {
        if (next === null) return;
        setIsStudentLogin(next === 'student');
    }
   

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        p: 2,
        position: 'relative'
      }}
    >
      <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
        <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
          <IconButton size="small" onClick={toggleTheme}>
            {darkMode ? <LightModeIcon/> : <DarkModeIcon/>}
          </IconButton>
        </Tooltip>
      </Box>
      <Container maxWidth="lg">
        <Fade in={true} timeout={800}>
          <Grid container spacing={3} alignItems="center">
            {/* Left - Branding */}
            <Grid item xs={12} md={6}>
              <Box sx={{ textAlign: 'center', color: 'text.primary', mb: 4 }}>
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'primary.main',
                    color: 'common.white',
                    mx: 'auto',
                    mb: 3
                  }}
                >
                  <SchoolIcon sx={{ fontSize: 60 }} />
                </Avatar>
                <Typography variant="h2" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
                  Smart ERP
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
            <Grid item xs={12} md={6}>
              <Card sx={{ maxWidth: 520, mx: 'auto', borderRadius: 3, boxShadow: '0 20px 40px rgba(0,0,0,0.1)', backgroundColor: 'background.paper', borderTop: '6px solid', borderColor: 'primary.main' }}>
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ textAlign: 'center', mb: 2 }}>
                    <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                      {isStudentLogin ? 'Student Login' : 'Faculty Login'}
                    </Typography>
                    <ToggleButtonGroup
                      color="primary"
                      exclusive
                      value={isStudentLogin ? 'student' : 'faculty'}
                      onChange={handleToggle}
                      sx={{ mt: 1 }}
                      size="small"
                    >
                      <ToggleButton value="student">Student</ToggleButton>
                      <ToggleButton value="faculty">Faculty</ToggleButton>
                    </ToggleButtonGroup>
                  </Box>

                  {isStudentLogin ? (
                    <Box component="form" onSubmit={studentLoginHandler} sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        label="Student GR Number"
                        variant="outlined"
                        value={studentRegNum}
                        onChange={(e) => setStudentRegNum(e.target.value)}
                        required
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        variant="outlined"
                        value={studentPassword}
                        onChange={(e) => setStudentPassword(e.target.value)}
                        required
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={isStudentLoading}
                        sx={{ py: 1.25, fontWeight: 'bold', borderRadius: 2 }}
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
                    <Box component="form" onSubmit={facultyLoginHandler} sx={{ mt: 2 }}>
                      <TextField
                        fullWidth
                        label="Faculty GR Number"
                        variant="outlined"
                        value={facultyRegNum}
                        onChange={(e) => setFacultyRegNum(e.target.value)}
                        required
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        variant="outlined"
                        value={facultyPassword}
                        onChange={(e) => setFacultyPassword(e.target.value)}
                        required
                        sx={{ mb: 3 }}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon color="primary" />
                            </InputAdornment>
                          ),
                        }}
                      />
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        size="large"
                        disabled={isFacultyLoading}
                        sx={{ py: 1.25, fontWeight: 'bold', borderRadius: 2 }}
                        startIcon={isFacultyLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                      >
                        {isFacultyLoading ? 'Signing In...' : 'Log In'}
                      </Button>
                      <Box sx={{ mt: 2, textAlign: 'center' }}>
                        <Typography variant="body2">
                          <Link to="/forgotPassword/user">Forgot Password?</Link>
                        </Typography>
                      </Box>
                    </Box>
                  )}

                  <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      {isStudentLogin ? (
                        <>
                          Want to login as Faculty?{' '}
                          <Button onClick={() => setIsStudentLogin(false)} size="small">Switch</Button>
                        </>
                      ) : (
                        <>
                          Want to login as Student?{' '}
                          <Button onClick={() => setIsStudentLogin(true)} size="small">Switch</Button>
                        </>
                      )}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Fade>
    </Container>
    </Box>
  )
}

export default FacultyStudentLogin
