import React from 'react'
import {useSelector} from 'react-redux'
import {Link,useNavigate} from 'react-router-dom'
import StudentNavbar from '../components/StudentNavbar'
import StudentLayout from '../components/StudentLayout'
import { Box, Container, Grid, Card, CardContent, Typography, Avatar, Button } from '@mui/material'
import { School as SchoolIcon, Email as EmailIcon, Phone as PhoneIcon, Person as PersonIcon, CalendarToday as CalendarIcon, ArrowForward as ArrowForwardIcon } from '@mui/icons-material'

const StudentDashboard = () => {
    const studentStore = useSelector((store) => store.student)
    const s = studentStore.student?.student || {}
    const navigate = useNavigate();

  if (!studentStore.isAuthenticated) { navigate('/'); return null }

  return (
    <StudentLayout title="Student Dashboard">
      <Container maxWidth="lg">
        <Box sx={{ textAlign: 'center', mb: 2 }}>
          <Avatar 
            src={s.avatar?.url || s.avatar} 
            sx={{ width: 96, height: 96, mx: 'auto', mb: 1 }}
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
          <Typography variant="h5" fontWeight={700}>{s.name}</Typography>
          <Typography variant="body2" color="text.secondary">{s.registrationNumber}</Typography>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}><EmailIcon/></Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="subtitle1">{s.email}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}><SchoolIcon/></Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">Department</Typography>
                  <Typography variant="subtitle1">{s.department}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main' }}><CalendarIcon/></Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">Year</Typography>
                  <Typography variant="subtitle1">{s.year}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'info.main' }}><PhoneIcon/></Avatar>
                <Box>
                  <Typography variant="body2" color="text.secondary">Mobile</Typography>
                  <Typography variant="subtitle1">{s.studentMobileNumber}</Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Quick Links</Typography>
                <Button fullWidth variant="text" onClick={() => navigate('/student/subjects')} endIcon={<ArrowForwardIcon/>}>Subjects</Button>
                <Button fullWidth variant="text" onClick={() => navigate('/student/performance')} endIcon={<ArrowForwardIcon/>}>Performance</Button>
                <Button fullWidth variant="text" onClick={() => navigate('/student/attendance')} endIcon={<ArrowForwardIcon/>}>Attendance</Button>
                <Button fullWidth variant="text" onClick={() => navigate('/student/settings')} endIcon={<ArrowForwardIcon/>}>Settings</Button>
                <Button fullWidth variant="text" onClick={() => navigate('/student/search')} endIcon={<ArrowForwardIcon/>}>Search Students</Button>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>About</Typography>
                <Typography variant="body2" color="text.secondary">
                  Keep your profile up-to-date and track your academic progress. Use the quick links to view subjects, performance, and attendance.
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </StudentLayout>
  )
}

export default StudentDashboard
