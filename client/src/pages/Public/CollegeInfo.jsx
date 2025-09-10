import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { Container, Card, CardContent, Typography, Chip, Stack, Link as MuiLink } from '@mui/material';

const CollegeInfo = () => {
  const [info, setInfo] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/api/public/college-info');
        setInfo(data.result);
      } catch (err) {
        setError('Unable to load college info');
      }
    })();
  }, []);

  if (error) return <Container sx={{ py: 6 }}><Typography color="error">{error}</Typography></Container>;
  if (!info) return <Container sx={{ py: 6 }}><Typography>Loading...</Typography></Container>;

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Card>
        <CardContent>
          <Typography variant="h4" gutterBottom>{info.name}</Typography>
          <Typography variant="body1" sx={{ mb: 2 }}>{info.about}</Typography>
          <Typography variant="body2">Address: {info.address}</Typography>
          <Typography variant="body2">Email: {info.contactEmail}</Typography>
          <Typography variant="body2">Phone: {info.contactPhone}</Typography>
          <Typography variant="body2">Admission Helpline: {info.admissionHelpline}</Typography>
          <Typography variant="body2" sx={{ mt: 1 }}>Website: <MuiLink href={info.website} target="_blank" rel="noopener">{info.website}</MuiLink></Typography>
          <Typography variant="subtitle1" sx={{ mt: 3, mb: 1 }}>Facilities</Typography>
          <Stack direction="row" spacing={1} flexWrap="wrap">
            {(info.facilities || []).map((f) => <Chip key={f} label={f} sx={{ mb: 1 }} />)}
          </Stack>
        </CardContent>
      </Card>
    </Container>
  );
};

export default CollegeInfo;


