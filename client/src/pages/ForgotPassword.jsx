import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate,useParams } from 'react-router-dom'
import toast from 'react-hot-toast'

import { getOTPStudent, submitOTPStudent } from '../redux/actions/studentAction'
import { getOTPFaculty, submitOTPFaculty } from '../redux/actions/facultyAction'

import { Box, Container, Card, CardContent, Typography, TextField, Button, Grid, Stepper, Step, StepLabel, InputAdornment, IconButton, Tooltip } from '@mui/material'
import { MailOutline as MailIcon, PhoneIphone as OtpIcon, Lock as LockIcon, LockOpen as LockOpenIcon, Send as SendIcon, CheckCircle as CheckIcon, Brightness4 as DarkModeIcon, Brightness7 as LightModeIcon } from '@mui/icons-material'
import { useTheme as useCustomTheme } from '../contexts/ThemeContext'

const ForgotPassword = () => {
    const store = useSelector((store) => store)
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const params = useParams();

    const [user,setUser] = useState("");
    const [email,setEmail] = useState("");
    const [otp, setOtp] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmNewPassword, setConfirmNewPassword] = useState("")

    const [helper,setHelper] = useState(false);
    const [loading, setLoading] = useState(false)
    const { darkMode, toggleTheme } = useCustomTheme()

    useEffect(() => {
      setUser(params.user);
    },[params.user])

    useEffect(() => {
        if (store.student.flag) {
            setHelper(true)
        }
    },[store.student.flag])

    const sendOtpHandler = (e) => {
        e.preventDefault();
        setLoading(true)
        if(user === "student")
        {
            dispatch(getOTPStudent({email})).finally(() => setLoading(false))
        }
        else if (user === "faculty") {
            dispatch(getOTPFaculty({email})).finally(() => setLoading(false))
         }
    }

    const submitOtpHandler = (e) => {
        e.preventDefault();  
        if (newPassword !== confirmNewPassword) {
          toast.error('Passwords do not match');
          return;
        }
        setLoading(true)
        if (user === "student") {
            dispatch(submitOTPStudent({ email, otp, newPassword, confirmNewPassword })).then(() => {
              toast.success("Please login with New Password");
              navigate('/');
            }).finally(() => setLoading(false));
        }
        else if (user === "faculty")
        {
            dispatch(submitOTPFaculty({ email, otp, newPassword, confirmNewPassword })).then(() => {
              toast.success("Please login with New Password");
              navigate('/')
            }).finally(() => setLoading(false));
        }
    }

    const activeStep = helper ? 1 : 0

    return(
      <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2, position: 'relative' }}>
        <Box sx={{ position: 'absolute', top: 8, right: 8 }}>
          <Tooltip title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}>
            <IconButton size="small" onClick={toggleTheme}>
              {darkMode ? <LightModeIcon/> : <DarkModeIcon/>}
            </IconButton>
          </Tooltip>
        </Box>
        <Container maxWidth="sm">
          <Card sx={{ borderRadius: 3, boxShadow: '0 20px 40px rgba(0,0,0,0.08)' }}>
            <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
              <Typography variant="h5" fontWeight={700} textAlign="center" sx={{ mb: 1 }}>Forgot Password</Typography>
              <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 2 }}>Reset your {user} account password</Typography>

              <Stepper activeStep={activeStep} alternativeLabel sx={{ mb: 2 }}>
                <Step><StepLabel>Request OTP</StepLabel></Step>
                <Step><StepLabel>Reset Password</StepLabel></Step>
              </Stepper>

              {!helper ? (
                <Box component="form" onSubmit={sendOtpHandler}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start"><MailIcon color="primary" /></InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button type="submit" fullWidth variant="contained" startIcon={<SendIcon />} disabled={loading}>
                        {loading ? 'Sending...' : 'Send OTP'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              ) : (
                <Box component="form" onSubmit={submitOtpHandler}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="OTP"
                        required
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start"><OtpIcon color="primary" /></InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="New Password"
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start"><LockIcon color="primary" /></InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        type="password"
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start"><LockOpenIcon color="primary" /></InputAdornment>
                          )
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button type="submit" fullWidth variant="contained" startIcon={<CheckIcon />} disabled={loading}>
                        {loading ? 'Updating...' : 'Reset Password'}
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Container>
      </Box>
    )
}

export default ForgotPassword;
