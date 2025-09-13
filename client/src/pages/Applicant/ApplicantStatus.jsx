import React, { useState } from 'react';
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
  Chip,
  Alert,
  Grid
} from '@mui/material';
import { Search as SearchIcon } from '@mui/icons-material';

const ApplicantStatus = () => {
  const [admid, setAdmid] = useState('');
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkStatus = async () => {
    if (!admid.trim()) {
      setError('Please enter your ADMID');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const { data } = await api.get(`/api/public/application-status/${admid}`);
      setApplication(data.result);
    } catch (err) {
      setError(err.response?.data?.message || 'Application not found');
      setApplication(null);
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

  return (
    <ApplicantLayout title="Check Application Status">
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>Check Application Status</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Enter your ADMID to check the status of your admission application
            </Typography>
            
            <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
              <TextField 
                fullWidth 
                label="ADMID" 
                value={admid} 
                onChange={(e) => setAdmid(e.target.value)}
                placeholder="Enter your Application ID"
                onKeyPress={(e) => e.key === 'Enter' && checkStatus()}
              />
              <Button 
                variant="contained" 
                onClick={checkStatus}
                disabled={loading}
                startIcon={<SearchIcon />}
                sx={{ minWidth: 120 }}
              >
                {loading ? 'Checking...' : 'Check Status'}
              </Button>
            </Stack>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {application && (
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>Application Details</Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="body1">
                      <strong>ADMID:</strong> {application.admid}
                    </Typography>
                    <Chip 
                      label={application.status} 
                      color={getStatusColor(application.status)}
                      variant="outlined"
                      sx={{ textTransform: 'capitalize' }}
                    />
                  </Box>

                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Name:</strong> {application.name}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Email:</strong> {application.email}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Department:</strong> {application.department}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Year:</strong> {application.year}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Section:</strong> {application.section}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2">
                        <strong>Applied Date:</strong> {new Date(application.createdAt).toLocaleDateString()}
                      </Typography>
                    </Grid>
                  </Grid>

                  {application.reviewNote && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2">
                        <strong>Review Note:</strong> {application.reviewNote}
                      </Typography>
                    </Box>
                  )}

                  {application.status === 'approved' && (
                    <Alert severity="success" sx={{ mt: 2 }}>
                      Congratulations! Your application has been approved. You will receive further instructions via email.
                    </Alert>
                  )}

                  {application.status === 'rejected' && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                      Unfortunately, your application has been rejected. Please contact the admission office for more information.
                    </Alert>
                  )}

                  {application.status === 'pending' && (
                    <Alert severity="info" sx={{ mt: 2 }}>
                      Your application is under review. We will notify you once a decision has been made.
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </Container>
    </ApplicantLayout>
  );
};

export default ApplicantStatus;

