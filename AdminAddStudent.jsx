import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Box,
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  InputAdornment,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Face as FaceIcon,
  MailOutline as MailIcon,
  Phone as PhoneIcon,
  Save as SaveIcon,
  SupervisorAccount as SupervisorAccountIcon,
} from '@mui/icons-material';
import AdminLayout from '../../components/AdminLayout';
import { adminAddStudent } from '../../redux/actions/adminAction';

const AdminAddStudent = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const admin = useSelector(store => store.admin);
  const { isAuthenticated } = admin;

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [year, setYear] = useState('');
  const [section, setSection] = useState('');
  const [studentMobileNumber, setStudentMobileNumber] = useState('');
  const [fatherName, setFatherName] = useState('');
  const [fatherMobileNumber, setFatherMobileNumber] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  const formHandler = async (e) => {
    e.preventDefault();
    const studentData = {
      name,
      email,
      department,
      year,
      section,
      studentMobileNumber,
      fatherName,
      fatherMobileNumber,
    };
    await dispatch(adminAddStudent(studentData));
    toast.success('Student added successfully!');
    navigate('/admin/students');
  };

  return (
    <AdminLayout>
      <Container maxWidth="lg">
        <Paper sx={{ p: 4, mt: 4, borderRadius: 2, boxShadow: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
            <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
              <PersonAddIcon />
            </Avatar>
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
              Add New Student
            </Typography>
          </Box>
          <form onSubmit={formHandler}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Full Name"
                  variant="outlined"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <FaceIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Address"
                  variant="outlined"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required variant="outlined">
                  <InputLabel id="department-select-label">Department</InputLabel>
                  <Select
                    labelId="department-select-label"
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    label="Department"
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    <MenuItem value="Computer Science">Computer Science</MenuItem>
                    <MenuItem value="Information Technology">Information Technology</MenuItem>
                    <MenuItem value="Electronics & Communication">Electronics & Communication</MenuItem>
                    <MenuItem value="Mechanical Engineering">Mechanical Engineering</MenuItem>
                    <MenuItem value="Civil Engineering">Civil Engineering</MenuItem>
                    <MenuItem value="Electrical Engineering">Electrical Engineering</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required variant="outlined">
                  <InputLabel id="year-select-label">Year</InputLabel>
                  <Select
                    labelId="year-select-label"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                    label="Year"
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    <MenuItem value="1">1st Year</MenuItem>
                    <MenuItem value="2">2nd Year</MenuItem>
                    <MenuItem value="3">3rd Year</MenuItem>
                    <MenuItem value="4">4th Year</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={4}>
                <FormControl fullWidth required variant="outlined">
                  <InputLabel id="section-select-label">Section</InputLabel>
                  <Select
                    labelId="section-select-label"
                    value={section}
                    onChange={(e) => setSection(e.target.value)}
                    label="Section"
                  >
                    <MenuItem value=""><em>None</em></MenuItem>
                    <MenuItem value="A">A</MenuItem>
                    <MenuItem value="B">B</MenuItem>
                    <MenuItem value="C">C</MenuItem>
                    <MenuItem value="D">D</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Student Mobile Number"
                  variant="outlined"
                  value={studentMobileNumber}
                  onChange={(e) => setStudentMobileNumber(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Father's Name"
                  variant="outlined"
                  value={fatherName}
                  onChange={(e) => setFatherName(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SupervisorAccountIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Father's Mobile Number"
                  variant="outlined"
                  value={fatherMobileNumber}
                  onChange={(e) => setFatherMobileNumber(e.target.value)}
                  required
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <PhoneIcon />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="secondary"
                  size="large"
                  startIcon={<SaveIcon />}
                  sx={{ mt: 2 }}
                >
                  Add Student
                </Button>
              </Grid>
            </Grid>
          </form>
        </Paper>
      </Container>
    </AdminLayout>
  );
};

export default AdminAddStudent;
