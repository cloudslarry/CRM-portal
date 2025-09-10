import React, { useEffect, useState } from 'react';
import api from '../../config/api';
import { Container, Card, CardContent, Typography, Grid } from '@mui/material';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/api/public/courses');
        setCourses(data.result || []);
      } catch (err) {
        setError('Unable to load courses');
      }
    })();
  }, []);

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Typography variant="h5" gutterBottom>Courses & Fees</Typography>
      <Grid container spacing={2}>
        {(courses || []).map((c) => (
          <Grid item xs={12} sm={6} key={c.code}>
            <Card>
              <CardContent>
                <Typography variant="h6">{c.name}</Typography>
                <Typography variant="body2">Department: {c.department}</Typography>
                <Typography variant="body2">Duration: {c.durationYears} years</Typography>
                <Typography variant="body2">Semesters: {c.totalSemesters}</Typography>
                <Typography variant="subtitle2">Per Semester Fee: ₹{c.semesterFee.toLocaleString()}</Typography>
                <Typography variant="subtitle2">Estimated Total: ₹{(c.semesterFee * c.totalSemesters).toLocaleString()}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
    </Container>
  );
};

export default Courses;


