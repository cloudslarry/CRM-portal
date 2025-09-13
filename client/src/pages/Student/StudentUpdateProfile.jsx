import React,{useState} from 'react'
import { useDispatch,useSelector } from 'react-redux'
import {useNavigate} from 'react-router-dom'
import toast from 'react-hot-toast'
import { Box, Container, Card, CardContent, Typography, TextField, Button, Avatar, Grid } from '@mui/material'
import { MailOutline as MailIcon, Phone as PhoneIcon, Person as PersonIcon, PhoneIphone as PhoneIphoneIcon, PhotoCamera as PhotoIcon, Save as SaveIcon } from '@mui/icons-material'
import StudentNavbar from '../../components/StudentNavbar'
import StudentLayout from '../../components/StudentLayout'
import {studentUpdate,studentLogout} from '../../redux/actions/studentAction'

const StudentUpdateProfile = () => {
    const student = useSelector((store) => store.student)
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [email,setEmail] = useState(student.student.student.email);
    const [mobile,setMobile] = useState(student.student.student.studentMobileNumber);
    const [fatherName,setFatherName] = useState(student.student.student.fatherName);
    const [fatherMobile,setFatherMobile] = useState(student.student.student.fatherMobileNumber);
    const [avatar,setAvatar] = useState(student.student.student.avatar.url);
    const [avatarPreview,setAvatarPreview] = useState(student.student.student.avatar.url);

    const imageHandler = (e) => {
       const reader = new FileReader();
       reader.onload = () => { if(reader.readyState === 2) { setAvatarPreview(reader.result); setAvatar(reader.result); } }
       reader.readAsDataURL(e.target.files[0]);
    }

    const fileHandler = async(e) => {
        e.preventDefault();
        const myForm = new FormData();
        myForm.append("studentMobileNumber",mobile);
        myForm.append("email",email);
        myForm.append("fatherName",fatherName);
        myForm.append("fatherMobileNumber",fatherMobile);
        myForm.append("registrationNumber",student.student.student.registrationNumber);
        myForm.append("avatar",avatar);
        dispatch(studentUpdate(myForm));
        toast.success("Please login again to view updates");
        dispatch(studentLogout());
        navigate('/');
    }

    return(
        <StudentLayout title="Update Profile">
          <Container maxWidth="sm">
            <Card sx={{ borderRadius: 3 }}>
              <CardContent>
                <Box sx={{ textAlign: 'center', mb: 2 }}>
                  <Avatar src={avatarPreview} sx={{ width: 96, height: 96, mx: 'auto', mb: 1 }} />
                  <Button variant="outlined" component="label" startIcon={<PhotoIcon />} size="small">
                    Change Photo
                    <input hidden accept="image/*" type="file" onChange={imageHandler} />
                  </Button>
                </Box>
                <Box component="form" onSubmit={fileHandler}>
                  <Grid container spacing={2}>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Email" value={email} onChange={(e) => setEmail(e.target.value)} InputProps={{ startAdornment: <MailIcon sx={{ mr: 1, color: 'primary.main' }} /> }} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Student Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} InputProps={{ startAdornment: <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} /> }} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Father Name" value={fatherName} onChange={(e) => setFatherName(e.target.value)} InputProps={{ startAdornment: <PersonIcon sx={{ mr: 1, color: 'primary.main' }} /> }} />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField fullWidth label="Father Mobile" value={fatherMobile} onChange={(e) => setFatherMobile(e.target.value)} InputProps={{ startAdornment: <PhoneIphoneIcon sx={{ mr: 1, color: 'primary.main' }} /> }} />
                    </Grid>
                  </Grid>
                  <Box sx={{ mt: 2, textAlign: 'right' }}>
                    <Button type="submit" variant="contained" startIcon={<SaveIcon />}>Update Profile</Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Container>
        </StudentLayout>
    )
}

export default StudentUpdateProfile;
