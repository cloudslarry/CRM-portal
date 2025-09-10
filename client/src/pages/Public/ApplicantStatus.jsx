import React, { useState } from 'react';
import api from '../../config/api';
import { Container, Card, CardContent, Typography, TextField, Button, Grid, Stack } from '@mui/material';
import ApplicantLayout from '../../components/ApplicantLayout';

const ApplicantStatus = () => {
  const [input, setInput] = useState({ applicationId: '', admid: '', email: '' });
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const onChange = (e) => setInput({ ...input, [e.target.name]: e.target.value });
  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    try {
      const params = new URLSearchParams();
      if (input.applicationId) params.append('applicationId', input.applicationId);
      if (input.admid) params.append('admid', input.admid);
      if (input.email) params.append('email', input.email);
      const { data } = await api.get(`/api/admissions/status?${params.toString()}`);
      setResult(data.result);
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to fetch status');
    }
  };

  return (
    <ApplicantLayout title="Application Status">
      <Container maxWidth="sm" sx={{ py: 6 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>Check Application Status</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>Enter either your Application ID or your email (and optional registration number).</Typography>
            <form onSubmit={onSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}><TextField fullWidth label="Application ID" name="applicationId" value={input.applicationId} onChange={onChange} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Admission ID (admid)" name="admid" value={input.admid} onChange={onChange} /></Grid>
                <Grid item xs={12}><TextField fullWidth label="Email" name="email" value={input.email} onChange={onChange} /></Grid>
              </Grid>
              {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button type="submit" variant="contained">Check Status</Button>
              </Stack>
            </form>
            {result && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="subtitle1">Status: {result.status}</Typography>
                  {result.reviewNote ? <Typography variant="body2">Note: {result.reviewNote}</Typography> : null}
                  <Typography variant="caption">Admission ID: {result.admid}</Typography>
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


