import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AdminLayout from '../../components/AdminLayout';
import { adminListAdmissions, adminApproveAdmission, adminRejectAdmission } from '../../redux/actions/adminAction';
import { Container, Card, CardContent, Typography, Button, Stack, Chip, Box, Divider } from '@mui/material';

const AdminReviewAdmissions = () => {
  const dispatch = useDispatch();
  const { admissions } = useSelector((s) => s.admin);
  const [filter, setFilter] = useState('pending');

  useEffect(() => {
    dispatch(adminListAdmissions(filter));
  }, [dispatch, filter]);

  const handleApprove = async (id) => {
    await dispatch(adminApproveAdmission(id));
    await dispatch(adminListAdmissions(filter));
  };

  const handleReject = async (id) => {
    await dispatch(adminRejectAdmission(id));
    await dispatch(adminListAdmissions(filter));
  };

  return (
    <AdminLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" gutterBottom>Admission Applications</Typography>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          {['pending','approved','rejected'].map(s => (
            <Chip key={s} label={s} color={filter===s? 'primary':'default'} onClick={() => setFilter(s)} />
          ))}
        </Stack>
        {(admissions || []).map((a) => (
          <Card key={a._id} sx={{ mb: 2 }}>
            <CardContent>
              <Typography variant="h6">{a.name} - {a.registrationNumber}</Typography>
              <Typography variant="body2">{a.email}</Typography>
              <Typography variant="body2">{a.department} • Year {a.year} • Section {a.section}</Typography>
              <Typography variant="body2">Status: {a.status}</Typography>
              {a.reviewNote ? <Typography variant="body2">Note: {a.reviewNote}</Typography> : null}
              <Divider sx={{ my: 2 }} />
              <Stack direction="row" spacing={2}>
                <Button variant="contained" disabled={a.status !== 'pending'} onClick={() => handleApprove(a._id)}>Approve</Button>
                <Button variant="outlined" disabled={a.status !== 'pending'} onClick={() => handleReject(a._id)}>Reject</Button>
              </Stack>
            </CardContent>
          </Card>
        ))}
        {(!admissions || admissions.length === 0) && (
          <Box sx={{ py: 4 }}>
            <Typography align="center" color="text.secondary">No applications</Typography>
          </Box>
        )}
      </Container>
    </AdminLayout>
  );
};

export default AdminReviewAdmissions;


