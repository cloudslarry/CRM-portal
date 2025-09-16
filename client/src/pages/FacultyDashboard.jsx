import React from 'react'
import { useSelector } from 'react-redux'
import FacultyLayout from '../components/FacultyLayout'
import { Box, Grid, Card, CardContent, Typography, Avatar, Button, List, ListItem, ListItemIcon, ListItemText, Divider } from '@mui/material'
import { Person as PersonIcon, Class as ClassIcon, Assignment as AssignmentIcon, Event as EventIcon, Upload as UploadIcon, Checklist as ChecklistIcon, Group as GroupIcon, LibraryBooks as LibraryBooksIcon, ArrowForward as ArrowForwardIcon, Announcement as AnnouncementIcon } from '@mui/icons-material'
import { useNavigate } from 'react-router-dom'

const FacultyDashboard = () => {
    const facultyStore = useSelector((store) => store.faculty)
    const faculty = facultyStore.faculty?.faculty || {}
    const navigate = useNavigate()

  if (!facultyStore.isAuthenticated) {
    return null
  }

  return (
    <FacultyLayout title="Faculty Dashboard">
      <Box sx={{ mb: 2 }}>
        <Typography variant="h5" fontWeight={700} gutterBottom>
          Welcome, {faculty.name || 'Faculty'}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Overview of your classes and quick actions
        </Typography>
      </Box>

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <PersonIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>{faculty.designation || 'Faculty'}</Typography>
                <Typography variant="body2" color="text.secondary">{faculty.registrationNumber}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <ClassIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>{faculty.subjects?.length || 0}</Typography>
                <Typography variant="body2" color="text.secondary">Assigned Subjects</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <AssignmentIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>{faculty.classesTaken || 0}</Typography>
                <Typography variant="body2" color="text.secondary">Lectures Conducted</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={3}>
          <Card>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar sx={{ bgcolor: 'info.main' }}>
                <GroupIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={600}>{faculty.totalStudents || 0}</Typography>
                <Typography variant="body2" color="text.secondary">Students Managed</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Quick Actions</Typography>
              <Grid container spacing={1}>
                <Grid item xs={12} sm={6}>
                  <Button fullWidth variant="contained" startIcon={<ChecklistIcon />} onClick={() => navigate('/faculty/attendance')}>
                    Take Attendance
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button fullWidth variant="contained" color="success" startIcon={<UploadIcon />} onClick={() => navigate('/faculty/marks')}>
                    Upload Marks
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button fullWidth variant="outlined" startIcon={<LibraryBooksIcon />} onClick={() => navigate('/faculty/subjects')}>
                    View Subjects
                  </Button>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Button fullWidth variant="outlined" startIcon={<PersonIcon />} onClick={() => navigate('/faculty/settings')}>
                    Settings
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Upcoming Classes */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Upcoming Classes</Typography>
              <List dense>
                <ListItem secondaryAction={<ArrowForwardIcon color="disabled" />}> 
                  <ListItemIcon>
                    <EventIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Mon 10:00 - Data Structures (CSE-2A)" secondary="Room 203" />
                </ListItem>
                <Divider component="li" />
                <ListItem secondaryAction={<ArrowForwardIcon color="disabled" />}> 
                  <ListItemIcon>
                    <EventIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Tue 11:30 - Algorithms (CSE-2B)" secondary="Room 105" />
                </ListItem>
                <Divider component="li" />
                <ListItem secondaryAction={<ArrowForwardIcon color="disabled" />}> 
                  <ListItemIcon>
                    <EventIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Wed 09:00 - Operating Systems (CSE-3A)" secondary="Lab 2" />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mt: 1 }}>
        {/* Announcements */}
        <Grid item xs={12} md={7}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Recent Announcements</Typography>
              <List dense>
                <ListItem>
                  <ListItemIcon>
                    <AnnouncementIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText primary="Mid-term schedule released" secondary="Check the academics portal for details." />
                </ListItem>
                <Divider component="li" />
                <ListItem>
                  <ListItemIcon>
                    <AnnouncementIcon color="warning" />
                  </ListItemIcon>
                  <ListItemText primary="Attendance policy updated" secondary="Please mark attendance within 24 hours of class." />
                </ListItem>
              </List>
            </CardContent>
          </Card>
        </Grid>

        {/* Quick Links */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Quick Links</Typography>
              <Grid container spacing={1}>
                <Grid item xs={12}>
                  <Button fullWidth variant="text" onClick={() => navigate('/faculty/attendance')} endIcon={<ArrowForwardIcon />}>
                    Attendance Dashboard
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button fullWidth variant="text" onClick={() => navigate('/faculty/marks')} endIcon={<ArrowForwardIcon />}>
                    Marks Uploads
                  </Button>
                </Grid>
                <Grid item xs={12}>
                  <Button fullWidth variant="text" onClick={() => navigate('/student/search')} endIcon={<ArrowForwardIcon />}>
                    Student Search
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </FacultyLayout>
  )
}

export default FacultyDashboard
