import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast'

import FacultyLayout from "../../components/FacultyLayout";
import { Box, Container, Card, CardContent, Typography, TextField, Button, Grid } from '@mui/material'
import { VpnKey as VpnKeyIcon, Lock as LockIcon, LockOpen as LockOpenIcon, Save as SaveIcon } from '@mui/icons-material'

import {
  facultyUpdatePassword,
  facultyLogout,
} from "../../redux/actions/facultyAction";

const FacultyUpdatePassword = () => {
  const faculty = useSelector((store) => store.faculty);

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const navigate = useNavigate();
  const dispatch = useDispatch();

  const formHandler = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    dispatch(
      facultyUpdatePassword({
        oldPassword,
        newPassword,
        confirmNewPassword: confirmPassword,
        registrationNumber: faculty.faculty.faculty.registrationNumber,
      })
    );
    toast.success("Password update successful..Please login again");
    dispatch(facultyLogout());
    navigate("/");
  };

  if (!faculty.isAuthenticated) { navigate('/'); return null }

  return (
    <FacultyLayout title="Update Password">
      <Box sx={{ p: { xs: 0.5, sm: 1, md: 2 } }}>
        <Container maxWidth="sm">
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Change your password</Typography>
              <Box component="form" onSubmit={formHandler}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField fullWidth type="password" label="Old Password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} InputProps={{ startAdornment: <VpnKeyIcon sx={{ mr: 1, color: 'primary.main' }} /> }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth type="password" label="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} InputProps={{ startAdornment: <LockIcon sx={{ mr: 1, color: 'primary.main' }} /> }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth type="password" label="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} InputProps={{ startAdornment: <LockOpenIcon sx={{ mr: 1, color: 'primary.main' }} /> }} />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, textAlign: 'right' }}>
                  <Button type="submit" variant="contained" startIcon={<SaveIcon />}>Update Password</Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
    </FacultyLayout>
  );
};

export default FacultyUpdatePassword;
