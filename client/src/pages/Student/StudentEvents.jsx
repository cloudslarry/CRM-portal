import React, { useEffect, useState } from 'react';
import StudentLayout from '../../components/StudentLayout';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  InputAdornment,
  Chip,
  Skeleton
} from '@mui/material';
import { Search as SearchIcon, OpenInNew as OpenInNewIcon } from '@mui/icons-material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const StudentEvents = () => {
  const navigate = useNavigate();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchForms();
  }, []);

  useEffect(() => {
    const id = setTimeout(() => fetchForms(search), 300);
    return () => clearTimeout(id);
  }, [search]);

  const fetchForms = async (term = '') => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/forms/public${term ? `?search=${encodeURIComponent(term)}` : ''}`);
      // Ensure we only show published & public (backend already filters, this is a safeguard)
      setForms(res.data.data.forms || []);
    } catch (e) {
      console.error('Error loading public forms', e);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => setSearch(e.target.value);

  const openForm = (formId) => navigate(`/forms/${formId}`);

  return (
    <StudentLayout title="Event registration">
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Event registration</Typography>
        <TextField
          placeholder="Search events..."
          value={search}
          onChange={handleSearch}
          InputProps={{ startAdornment: (<InputAdornment position="start"><SearchIcon /></InputAdornment>) }}
          sx={{ width: 320 }}
        />
      </Box>

      {loading ? (
        <Grid container spacing={3}>
          {[1,2,3,4,5,6].map(i => (
            <Grid item xs={12} md={6} lg={4} key={i}>
              <Skeleton variant="rectangular" height={180} />
            </Grid>
          ))}
        </Grid>
      ) : forms.length === 0 ? (
        <Card>
          <CardContent>
            <Typography>No events available right now.</Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {forms.map((f) => (
            <Grid item xs={12} md={6} lg={4} key={f._id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>{f.title}</Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>{f.description || 'No description'}</Typography>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip size="small" label={`${f.analytics?.totalSubmissions || 0} submissions`} />
                    <Chip size="small" label={`Updated ${new Date(f.updatedAt).toLocaleDateString()}`} variant="outlined" />
                  </Box>
                  <Button variant="contained" endIcon={<OpenInNewIcon />} onClick={() => openForm(f._id)}>Open form</Button>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
    </StudentLayout>
  );
};

export default StudentEvents;
