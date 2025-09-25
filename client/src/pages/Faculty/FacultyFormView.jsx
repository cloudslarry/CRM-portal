import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Box, Skeleton, Alert, Button } from '@mui/material';
import FacultyLayout from '../../components/FacultyLayout';
import FormPreview from '../../components/FormBuilder/FormPreview';
import axios from 'axios';

const FacultyFormView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    const fetchForm = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/forms/${id}`);
        setFormData(res.data.data);
      } catch (e) {
        const msg = e?.response?.data?.message || 'Failed to load form';
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchForm();
  }, [id]);

  return (
    <FacultyLayout title="View Form">
      <Container maxWidth="md" sx={{ mt: 3, mb: 4 }}>
        {loading && (
          <Box>
            <Skeleton variant="rectangular" height={56} sx={{ mb: 2 }} />
            <Skeleton variant="rectangular" height={420} />
          </Box>
        )}
        {!loading && error && (
          <Alert severity="error" action={<Button onClick={() => navigate(-1)}>Back</Button>}>{error}</Alert>
        )}
        {!loading && !error && formData && (
          <Box>
            <FormPreview formData={formData} />
          </Box>
        )}
      </Container>
    </FacultyLayout>
  );
};

export default FacultyFormView;


