import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import AdminLayout from '../../components/AdminLayout';
import { adminGetApplicantById, adminApproveApplicant, adminRejectApplicant, adminPendingApplicant, adminMarkApplicantSeen } from '../../redux/actions/adminAction';
import { Container, Paper, Typography, Stack, Button, Grid, Chip, Divider } from '@mui/material';

const AdminApplicantDetails = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [applicant, setApplicant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await dispatch(adminGetApplicantById(id));
      if (res.success) setApplicant(res.data);
      setLoading(false);
    };
    load();
  }, [dispatch, id]);

  const update = async (status) => {
    if (!applicant) return;
    const action = status === 'approved' ? adminApproveApplicant : status === 'rejected' ? adminRejectApplicant : adminPendingApplicant;
    const res = await dispatch(action(applicant._id));
    if (res.success) navigate('/admin/applicants');
  };

  return (
    <AdminLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Button variant="text" onClick={() => navigate(-1)} sx={{ mb: 2 }}>Back</Button>
        <Paper sx={{ p: 3 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>Applicant Details</Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              {applicant && (
                <Chip label={(applicant.status || 'pending').toLowerCase()} color={(applicant.status || 'pending').toLowerCase() === 'approved' ? 'success' : (applicant.status || 'pending').toLowerCase() === 'rejected' ? 'error' : 'default'} sx={{ textTransform: 'capitalize' }} />
              )}
              {applicant && (
                <Chip label={applicant.seen ? 'Seen' : 'Unseen'} color={applicant.seen ? 'default' : 'warning'} />
              )}
            </Stack>
          </Stack>
          <Divider sx={{ mb: 2 }} />
          {loading ? (
            <Typography>Loading...</Typography>
          ) : applicant ? (
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}><Typography><strong>Name:</strong> {applicant.name}</Typography></Grid>
              <Grid item xs={12} sm={6}><Typography><strong>Email:</strong> {applicant.email}</Typography></Grid>
              {applicant.contactNumber && (<Grid item xs={12} sm={6}><Typography><strong>Contact:</strong> {applicant.contactNumber}</Typography></Grid>)}
              {applicant.department && (<Grid item xs={12} sm={6}><Typography><strong>Department:</strong> {applicant.department}</Typography></Grid>)}
              {applicant.year && (<Grid item xs={12} sm={6}><Typography><strong>Year:</strong> {applicant.year}</Typography></Grid>)}
              {applicant.section && (<Grid item xs={12} sm={6}><Typography><strong>Section:</strong> {applicant.section}</Typography></Grid>)}
              {applicant.applicationId && (<Grid item xs={12} sm={6}><Typography><strong>Application ID:</strong> {applicant.applicationId}</Typography></Grid>)}
              <Grid item xs={12}><Typography color="text.secondary"><strong>Registered:</strong> {new Date(applicant.createdAt).toLocaleString()}</Typography></Grid>
              <Grid item xs={12}>
                <Stack direction="row" spacing={1} sx={{ mt: 1, justifyContent: 'flex-end' }}>
                  {!applicant.seen && (
                    <Button variant="outlined" onClick={async () => { await dispatch(adminMarkApplicantSeen(applicant._id)); setApplicant({ ...applicant, seen: true }); }}>Mark Seen</Button>
                  )}
                  <Button variant="outlined" onClick={() => update('pending')}>Mark Pending</Button>
                  <Button variant="outlined" color="error" onClick={() => update('rejected')}>Decline</Button>
                  <Button variant="contained" color="success" onClick={() => update('approved')}>Approve</Button>
                </Stack>
              </Grid>
            </Grid>
          ) : (
            <Typography color="error">Applicant not found</Typography>
          )}
        </Paper>
      </Container>
    </AdminLayout>
  );
};

export default AdminApplicantDetails;


