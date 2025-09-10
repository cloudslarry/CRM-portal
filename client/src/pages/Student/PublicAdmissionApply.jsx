import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../config/api';
import { Container, Card, CardContent, Typography, Grid, TextField, Button, Stack, Divider } from '@mui/material';
import ApplicantLayout from '../../components/ApplicantLayout';

const PublicAdmissionApply = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', department: '', year: '', section: '',
    studentMobileNumber: '', fatherName: '', fatherMobileNumber: '', address: '', dateOfBirth: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await api.post('/api/admissions/apply', form);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Submission failed');
    }
  };

  return (
    <ApplicantLayout title="Apply for Admission">
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>Apply for Admission</Typography>
            <Divider sx={{ mb: 3 }} />
            {submitted ? (
              <>
                <Typography color="success.main" sx={{ mb: 2 }}>Application submitted successfully. We will contact you soon.</Typography>
                <Button variant="contained" onClick={() => navigate('/')}>Go Home</Button>
              </>
            ) : (
              <form onSubmit={onSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Name" name="name" value={form.name} onChange={onChange} required /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Email" name="email" value={form.email} onChange={onChange} required /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Department" name="department" value={form.department} onChange={onChange} required /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Year" name="year" value={form.year} onChange={onChange} required /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Section" name="section" value={form.section} onChange={onChange} required /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Student Mobile Number" name="studentMobileNumber" value={form.studentMobileNumber} onChange={onChange} /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Father Name" name="fatherName" value={form.fatherName} onChange={onChange} /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Father Mobile Number" name="fatherMobileNumber" value={form.fatherMobileNumber} onChange={onChange} /></Grid>
                  <Grid item xs={12}><TextField fullWidth label="Address" name="address" value={form.address} onChange={onChange} /></Grid>
                  <Grid item xs={12} sm={6}><TextField fullWidth label="Date of Birth" type="date" InputLabelProps={{ shrink: true }} name="dateOfBirth" value={form.dateOfBirth} onChange={onChange} /></Grid>
                </Grid>
                {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
                <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                  <Button type="submit" variant="contained">Submit</Button>
                  <Button variant="outlined" onClick={() => navigate('/')}>Cancel</Button>
                </Stack>
              </form>
            )}
          </CardContent>
        </Card>
      </Container>
    </ApplicantLayout>
  );
};

export default PublicAdmissionApply;


