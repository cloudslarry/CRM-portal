import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import ApplicantLayout from '../../components/ApplicantLayout';
import { 
  Container, 
  Card, 
  CardContent, 
  Typography, 
  Grid,
  Box,
  Button,
  Chip,
  Stack
} from '@mui/material';
import { 
  Assignment as AssignmentIcon,
  School as SchoolIcon,
  Person as PersonIcon,
  Email as EmailIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const ApplicantDashboard = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const { data } = await api.get('/api/applicant/applications');
      setApplications(data.result || []);
    } catch (err) {
      console.error('Failed to fetch applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'approved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getStatusCount = (status) => {
    return applications.filter(app => app.status === status).length;
  };

  if (loading) {
    return (
      <ApplicantLayout title="Dashboard">
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Typography>Loading...</Typography>
        </Container>
      </ApplicantLayout>
    );
  }

  return (
    <ApplicantLayout title="Dashboard">
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h4" gutterBottom>Welcome to Your Dashboard</Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Manage your admission applications and track their status
        </Typography>

        {/* Quick Stats */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" color="primary.main">
                      {applications.length}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Applications
                    </Typography>
                  </Box>
                  <AssignmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" color="warning.main">
                      {getStatusCount('pending')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Pending
                    </Typography>
                  </Box>
                  <AssignmentIcon sx={{ fontSize: 40, color: 'warning.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" color="success.main">
                      {getStatusCount('approved')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Approved
                    </Typography>
                  </Box>
                  <SchoolIcon sx={{ fontSize: 40, color: 'success.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="h4" color="error.main">
                      {getStatusCount('rejected')}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Rejected
                    </Typography>
                  </Box>
                  <AssignmentIcon sx={{ fontSize: 40, color: 'error.main' }} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Quick Actions */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>Quick Actions</Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap">
              <Button 
                variant="contained" 
                onClick={() => navigate('/admissions/apply')}
                startIcon={<AssignmentIcon />}
              >
                New Application
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/applicant/status')}
                startIcon={<AssignmentIcon />}
              >
                Check Status
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/applicant/courses')}
                startIcon={<SchoolIcon />}
              >
                View Courses
              </Button>
              <Button 
                variant="outlined" 
                onClick={() => navigate('/applicant/college-info')}
                startIcon={<PersonIcon />}
              >
                College Info
              </Button>
            </Stack>
          </CardContent>
        </Card>

        {/* Recent Applications */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>Your Applications</Typography>
            {applications.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <AssignmentIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No applications yet
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Start your admission journey by submitting an application
                </Typography>
                <Button 
                  variant="contained" 
                  onClick={() => navigate('/admissions/apply')}
                >
                  Apply Now
                </Button>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {applications.map((app) => (
                  <Grid item xs={12} sm={6} md={4} key={app._id}>
                    <Card variant="outlined">
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                          <Typography variant="h6" noWrap>
                            {app.admid}
                          </Typography>
                          <Chip 
                            label={app.status} 
                            color={getStatusColor(app.status)}
                            size="small"
                            sx={{ textTransform: 'capitalize' }}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {app.department} • {app.year}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Applied: {new Date(app.createdAt).toLocaleDateString()}
                        </Typography>
                        {app.reviewNote && (
                          <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                            Note: {app.reviewNote}
                          </Typography>
                        )}
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </CardContent>
        </Card>
      </Container>
    </ApplicantLayout>
  );
};

export default ApplicantDashboard;

