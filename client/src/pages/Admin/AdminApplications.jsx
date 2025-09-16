import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import AdminLayout from '../../components/AdminLayout';
import { adminFetchApplications, adminApproveApplication, adminRejectApplication } from '../../redux/actions/adminAction';
import {
  Container,
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  Stack,
  Divider
} from '@mui/material';

const AdminApplications = () => {
  const dispatch = useDispatch();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await dispatch(adminFetchApplications());
    setApps(res.payload || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id) => {
    const res = await dispatch(adminApproveApplication(id));
    if (!res.error) load();
  };
  const reject = async (id) => {
    const res = await dispatch(adminRejectApplication(id));
    if (!res.error) load();
  };

  return (
    <AdminLayout>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ fontWeight: 'bold' }}>Admission Applications</Typography>
          <Typography variant="body2" color="text.secondary">Approve or reject submitted applications</Typography>
        </Box>

        <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
          <Button variant="outlined" onClick={load}>Refresh</Button>
        </Stack>

        <Grid container spacing={2}>
          {(apps || []).map((a) => (
            <Grid item xs={12} md={6} key={a._id}>
              <Paper sx={{ p: 2 }} variant="outlined">
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">{a.name}</Typography>
                  <Chip label={a.status} color={a.status === 'approved' ? 'success' : a.status === 'rejected' ? 'error' : 'default'} variant="outlined" sx={{ textTransform: 'capitalize' }} />
                </Box>
                <Typography variant="body2" color="text.secondary">{a.email}</Typography>
                <Divider sx={{ my: 1.5 }} />
                <Grid container spacing={1}>
                  <Grid item xs={6}><Typography variant="body2"><strong>Department:</strong> {a.department}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2"><strong>Year:</strong> {a.year}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2"><strong>Section:</strong> {a.section}</Typography></Grid>
                  <Grid item xs={6}><Typography variant="body2"><strong>ADMID:</strong> {a.admid}</Typography></Grid>
                </Grid>
                <Stack direction="row" spacing={1} sx={{ mt: 2, justifyContent: 'flex-end' }}>
                  <Button size="small" variant="outlined" onClick={() => approve(a._id)} disabled={a.status !== 'pending'}>Approve</Button>
                  <Button size="small" variant="outlined" color="error" onClick={() => reject(a._id)} disabled={a.status !== 'pending'}>Reject</Button>
                </Stack>
              </Paper>
            </Grid>
          ))}
        </Grid>
      </Container>
    </AdminLayout>
  );
};

export default AdminApplications;



