import React,{useState} from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import StudentNavbar from '../../components/StudentNavbar'
import StudentLayout from '../../components/StudentLayout'
import { Box, Container, Card, CardContent, Typography, TextField, Button, Grid } from '@mui/material'
import { VpnKey as VpnKeyIcon, Lock as LockIcon, LockOpen as LockOpenIcon, Save as SaveIcon } from '@mui/icons-material'
import { studentUpdatePassword,studentLogout } from '../../redux/actions/studentAction'

const StudentUpdatePassword = () => {
    const student = useSelector((store) => store.student)
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [oldPassword,setOldPassword] = useState("");
    const [newPassword,setNewPassword] = useState("");
    const [confirmNewPassword,setConfirmNewPassword] = useState("");

    const formHandler = async(e) => {
        e.preventDefault();
        if (newPassword !== confirmNewPassword) {
          toast.error('Passwords do not match');
          return;
        }
        dispatch(studentUpdatePassword({oldPassword,newPassword,confirmNewPassword,registrationNumber:student.student.student.registrationNumber}))
        toast.success("Password Updated Successfully..Please Login Again");
        dispatch(studentLogout());
        navigate('/')
    }

    return(
      <StudentLayout title="Update Password">
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
                    <TextField fullWidth type="password" label="Confirm Password" value={confirmNewPassword} onChange={(e) => setConfirmNewPassword(e.target.value)} InputProps={{ startAdornment: <LockOpenIcon sx={{ mr: 1, color: 'primary.main' }} /> }} />
                  </Grid>
                </Grid>
                <Box sx={{ mt: 2, textAlign: 'right' }}>
                  <Button type="submit" variant="contained" startIcon={<SaveIcon />}>Update Password</Button>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </StudentLayout>
    )
}

export default StudentUpdatePassword;
