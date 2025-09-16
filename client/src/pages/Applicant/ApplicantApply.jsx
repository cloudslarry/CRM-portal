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
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';

const ApplicantApply = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    contactNumber: '',
    fatherName: '',
    motherName: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    category: '',
    department: '',
    year: '',
    section: '',
    previousQualification: '',
    previousMarks: '',
    previousSchool: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data } = await api.post('/api/applicant/apply', form);
      setSuccess('Application submitted successfully! Your ADMID is: ' + data.result.admid);
      // Reset form
      setForm({
        name: '',
        email: '',
        contactNumber: '',
        fatherName: '',
        motherName: '',
        address: '',
        dateOfBirth: '',
        gender: '',
        category: '',
        department: '',
        year: '',
        section: '',
        previousQualification: '',
        previousMarks: '',
        previousSchool: ''
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ApplicantLayout title="Apply for Admission">
      <Container maxWidth="md" sx={{ py: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>Admission Application Form</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
              Fill out the form below to apply for admission. All fields marked with * are required.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }}>
                {success}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit}>
              <Typography variant="h6" gutterBottom sx={{ mt: 3, mb: 2 }}>
                Personal Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Full Name *" 
                    value={form.name} 
                    onChange={(e) => handleChange('name', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Email *" 
                    type="email"
                    value={form.email} 
                    onChange={(e) => handleChange('email', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Contact Number *" 
                    value={form.contactNumber} 
                    onChange={(e) => handleChange('contactNumber', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Date of Birth *" 
                    type="date"
                    value={form.dateOfBirth} 
                    onChange={(e) => handleChange('dateOfBirth', e.target.value)}
                    InputLabelProps={{ shrink: true }}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Gender *</InputLabel>
                    <Select
                      value={form.gender}
                      onChange={(e) => handleChange('gender', e.target.value)}
                      label="Gender *"
                    >
                      <MenuItem value="Male">Male</MenuItem>
                      <MenuItem value="Female">Female</MenuItem>
                      <MenuItem value="Other">Other</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Category *</InputLabel>
                    <Select
                      value={form.category}
                      onChange={(e) => handleChange('category', e.target.value)}
                      label="Category *"
                    >
                      <MenuItem value="General">General</MenuItem>
                      <MenuItem value="OBC">OBC</MenuItem>
                      <MenuItem value="SC">SC</MenuItem>
                      <MenuItem value="ST">ST</MenuItem>
                      <MenuItem value="EWS">EWS</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Father's Name *" 
                    value={form.fatherName} 
                    onChange={(e) => handleChange('fatherName', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Mother's Name *" 
                    value={form.motherName} 
                    onChange={(e) => handleChange('motherName', e.target.value)}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField 
                    fullWidth 
                    label="Address *" 
                    multiline
                    rows={3}
                    value={form.address} 
                    onChange={(e) => handleChange('address', e.target.value)}
                    required
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
                Academic Information
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Department *</InputLabel>
                    <Select
                      value={form.department}
                      onChange={(e) => handleChange('department', e.target.value)}
                      label="Department *"
                    >
                      <MenuItem value="C.S.E">Computer Science Engineering</MenuItem>
                      <MenuItem value="E.C.E">Electronics & Communication Engineering</MenuItem>
                      <MenuItem value="I.T">Information Technology</MenuItem>
                      <MenuItem value="Mechanical">Mechanical Engineering</MenuItem>
                      <MenuItem value="Civil">Civil Engineering</MenuItem>
                      <MenuItem value="E.E.E">Electrical & Electronics Engineering</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Year *</InputLabel>
                    <Select
                      value={form.year}
                      onChange={(e) => handleChange('year', e.target.value)}
                      label="Year *"
                    >
                      <MenuItem value="1st Year">1st Year</MenuItem>
                      <MenuItem value="2nd Year">2nd Year</MenuItem>
                      <MenuItem value="3rd Year">3rd Year</MenuItem>
                      <MenuItem value="4th Year">4th Year</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth required>
                    <InputLabel>Section *</InputLabel>
                    <Select
                      value={form.section}
                      onChange={(e) => handleChange('section', e.target.value)}
                      label="Section *"
                    >
                      <MenuItem value="A">Section A</MenuItem>
                      <MenuItem value="B">Section B</MenuItem>
                      <MenuItem value="C">Section C</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Previous Qualification *" 
                    value={form.previousQualification} 
                    onChange={(e) => handleChange('previousQualification', e.target.value)}
                    placeholder="e.g., 12th Standard, Diploma"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Previous Marks/Percentage *" 
                    value={form.previousMarks} 
                    onChange={(e) => handleChange('previousMarks', e.target.value)}
                    placeholder="e.g., 85% or 8.5 CGPA"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField 
                    fullWidth 
                    label="Previous School/College *" 
                    value={form.previousSchool} 
                    onChange={(e) => handleChange('previousSchool', e.target.value)}
                    required
                  />
                </Grid>
              </Grid>

              <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                <Button 
                  type="submit" 
                  variant="contained" 
                  disabled={loading}
                  size="large"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </Button>
                <Button 
                  variant="outlined" 
                  onClick={() => navigate('/applicant/dashboard')}
                  size="large"
                >
                  Cancel
                </Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>
      </Container>
    </ApplicantLayout>
  );
};

export default ApplicantApply;

