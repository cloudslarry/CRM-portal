import React,{useEffect, useState} from 'react'
import { 
  Box, 
  Card, 
  CardContent, 
  TextField, 
  Button, 
  Typography, 
  Container,
  Paper,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
  Grid,
  Avatar,
  Fade,
  Tooltip
} from '@mui/material'
import { 
  Visibility, 
  VisibilityOff, 
  AdminPanelSettings,
  Login as LoginIcon,
  Person,
  Lock,
  Brightness4 as DarkModeIcon,
  Brightness7 as LightModeIcon
} from '@mui/icons-material'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import { adminLogin } from '../redux/actions/adminAction'
import toast from 'react-hot-toast'
import { useTheme as useCustomTheme } from '../contexts/ThemeContext'

const AdminLogin = () => {
    const dispatch = useDispatch();
    const store = useSelector((state) => state)

    const [regNum,setRegNum] = useState("");
    const [password,setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({})
    const [errorsHelper, setErrorsHelper] = useState({})
    const [isLoading, setIsLoading] = useState(false)
   
    const navigate = useNavigate();
    const { darkMode, toggleTheme } = useCustomTheme()

    useEffect(() => {
        if(store.admin.isAuthenticated)
        {
            navigate('/admin')
            toast.success("Admin Login Successful");
        }
    },[store.admin.isAuthenticated])

    useEffect(() => {
        if(store.error)
        {
            setErrors(store.error)
            toast.error(store.error.message || "Login failed");
        }
    },[store.error])

    const loginHandler = (e) => {
        e.preventDefault();
        setIsLoading(true);
        dispatch(adminLogin({registrationNumber:regNum,password}))
    }

    useEffect(() => {
        if(store.error || store.admin.isAuthenticated){
            setIsLoading(false)
        }
        else{
            setIsLoading(true)
        }
    },[store.error,store.admin.isAuthenticated]) 

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        backgroundColor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 2,
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
        <Fade in={true} timeout={1000}>
          <Grid container spacing={3} alignItems="center">
            {/* Left Side - Branding */}
            <Grid item xs={12} md={6}>
              <Box
                sx={{
                  textAlign: 'center',
                  color: 'text.primary',
                  mb: 4
                }}
              >
                <Avatar
                  sx={{
                    width: 120,
                    height: 120,
                    bgcolor: 'primary.main',
                    margin: '0 auto 2rem',
                    color: 'common.white'
                  }}
                >
                  <AdminPanelSettings sx={{ fontSize: 60 }} />
                </Avatar>
                <Typography 
                  variant="h2" 
                  component="h1" 
                  sx={{ 
                    fontWeight: 'bold',
                    mb: 2,
                    textShadow: 'none'
                  }}
                >
                  Smart ERP
                </Typography>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    opacity: 0.9,
                    fontWeight: 300
                  }}
                >
                  Admin Portal
                </Typography>
                <Typography 
                  variant="h6" 
                  sx={{ 
                    mt: 2,
                    opacity: 0.8,
                    fontWeight: 300
                  }}
                >
                  Manage your institution with ease
                </Typography>
              </Box>
            </Grid>

            {/* Right Side - Login Form */}
            <Grid item xs={12} md={6}>
              <Card
                sx={{
                  maxWidth: 500,
                  mx: 'auto',
                  borderRadius: 3,
                  boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                  backgroundColor: 'background.paper',
                  borderTop: '6px solid',
                  borderColor: 'primary.main'
                }}
              >
                <CardContent sx={{ p: 4 }}>
                  <Box sx={{ textAlign: 'center', mb: 3 }}>
                    <Typography variant="h4" component="h2" sx={{ fontWeight: 'bold', color: '#1976d2', mb: 1 }}>
                      Welcome Back
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      Sign in to your admin account
                    </Typography>
                  </Box>

                  <Box component="form" onSubmit={loginHandler} sx={{ mt: 2 }}>
                    <TextField
                      fullWidth
                      label="Admin GR Number"
                      variant="outlined"
                      value={regNum}
                      onChange={(e) => setRegNum(e.target.value)}
                      required
                      sx={{ mb: 3 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Person color="primary" />
                          </InputAdornment>
                        ),
                      }}
                    />
                    
                    <TextField
                      fullWidth
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      variant="outlined"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      sx={{ mb: 3 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <Lock color="primary" />
                          </InputAdornment>
                        ),
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              aria-label="toggle password visibility"
                              onClick={handleClickShowPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                            >
                              {showPassword ? <VisibilityOff /> : <Visibility />}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={isLoading}
                      sx={{
                        py: 1.5,
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        borderRadius: 2,
                        background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
                        boxShadow: '0 3px 5px 2px rgba(25, 118, 210, .3)',
                        '&:hover': {
                          background: 'linear-gradient(45deg, #1565c0 30%, #1976d2 90%)',
                        }
                      }}
                      startIcon={isLoading ? <CircularProgress size={20} color="inherit" /> : <LoginIcon />}
                    >
                      {isLoading ? 'Signing In...' : 'Sign In'}
                    </Button>
                  </Box>

                  <Box sx={{ mt: 3, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Having trouble? Contact system administrator
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

export default AdminLogin
