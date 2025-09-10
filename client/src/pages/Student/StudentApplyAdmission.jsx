import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  studentSubmitAdmission,
  studentListAdmissions
} from '../../redux/actions/studentAction';
import StudentLayout from '../../components/StudentLayout';
import {
  Box,
  Container,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Grid,
  Divider,
  Stack,
} from '@mui/material';

const StudentApplyAdmission = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { student, admissions } = useSelector((s) => s.student);

  const [form, setForm] = useState({
    name: '',
    email: '',
    department: '',
    year: '',
    section: '',
    studentMobileNumber: '',
    fatherName: '',
    fatherMobileNumber: '',
    address: '',
    dateOfBirth: '',
  });

  useEffect(() => {
    if (student) {
      setForm((f) => ({
        ...f,
        name: student.name || '',
        email: student.email || '',
        department: student.department || '',
        year: student.year ? String(student.year) : '',
        section: student.section || '',
        
      }));
    }
    dispatch(studentListAdmissions());
  }, [student, dispatch]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    await dispatch(studentSubmitAdmission(form));
    await dispatch(studentListAdmissions());
  };

  return (
    <StudentLayout>
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Card>
          <CardContent>
            <Typography variant="h5" gutterBottom>Apply for Admission</Typography>
            <Divider sx={{ mb: 3 }} />
            <Box component="form" onSubmit={onSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Name" name="name" value={form.name} onChange={onChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Email" name="email" value={form.email} onChange={onChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Department" name="department" value={form.department} onChange={onChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Year" name="year" value={form.year} onChange={onChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Section" name="section" value={form.section} onChange={onChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Registration Number" name="registrationNumber" value={form.registrationNumber} onChange={onChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Student Mobile Number" name="studentMobileNumber" value={form.studentMobileNumber} onChange={onChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Father Name" name="fatherName" value={form.fatherName} onChange={onChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Father Mobile Number" name="fatherMobileNumber" value={form.fatherMobileNumber} onChange={onChange} />
                </Grid>
                <Grid item xs={12}>
                  <TextField fullWidth label="Address" name="address" value={form.address} onChange={onChange} />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField fullWidth label="Date of Birth" name="dateOfBirth" type="date" InputLabelProps={{ shrink: true }} value={form.dateOfBirth} onChange={onChange} />
                </Grid>
              </Grid>
              <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
                <Button type="submit" variant="contained">Submit</Button>
                <Button variant="outlined" onClick={() => navigate(-1)}>Back</Button>
              </Stack>
            </Box>
          </CardContent>
        </Card>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>My Applications</Typography>
          {(admissions || []).map((a) => (
            <Card key={a._id} sx={{ mb: 2 }}>
              <CardContent>
                <Typography>Status: {a.status}</Typography>
                {a.reviewNote ? <Typography variant="body2">Note: {a.reviewNote}</Typography> : null}
                <Typography variant="caption">Submitted: {new Date(a.createdAt).toLocaleString()}</Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      </Container>
    </StudentLayout>
  );
};

export default StudentApplyAdmission;


