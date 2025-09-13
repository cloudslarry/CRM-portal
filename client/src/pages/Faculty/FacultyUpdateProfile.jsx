import React,{useState} from 'react'
import { useDispatch,useSelector } from 'react-redux'
import {useNavigate} from 'react-router-dom'
import toast from 'react-hot-toast'
import { Box, Container, Card, CardContent, Typography, TextField, Button, Avatar, Grid } from '@mui/material'
import { MailOutline as MailIcon, Phone as PhoneIcon, PhotoCamera as PhotoIcon, Save as SaveIcon } from '@mui/icons-material'
import FacultyLayout from '../../components/FacultyLayout'
import {facultyUpdate,facultyLogout} from '../../redux/actions/facultyAction'

const FacultyUpdateProfile = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const faculty = useSelector((store) => store.faculty)

    const [email,setEmail] = useState(faculty.faculty.faculty.email);
    const [mobile,setMobile] = useState(faculty.faculty.faculty.facultyMobileNumber);
    const [avatar,setAvatar] = useState(faculty.faculty.faculty.avatar.url);
    const [avatarPreview,setAvatarPreview] = useState(faculty.faculty.faculty.avatar.url);

    const imageHandler = (e) => {
       const reader = new FileReader();
       reader.onload = () => { if(reader.readyState === 2) { setAvatarPreview(reader.result); setAvatar(reader.result) } }
       reader.readAsDataURL(e.target.files[0]);
    }

    const fileHandler = async(e) => {
        e.preventDefault();
        const myForm = new FormData();
        myForm.append("facultyMobileNumber",mobile);
        myForm.append("email",email);
        myForm.append("avatar",avatar);
        myForm.append("registrationNumber",faculty.faculty.faculty.registrationNumber);
        dispatch(facultyUpdate(myForm));
        toast.success("Profile Update Successful..Please Login Again");
        dispatch(facultyLogout());
        navigate('/');
    }

    if (!faculty.isAuthenticated) { navigate('/'); return null }

    return(
        <FacultyLayout title="Update Profile">
          <Box sx={{ p: { xs: 0.5, sm: 1, md: 2 } }}>
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
                        <TextField fullWidth label="Faculty Mobile" value={mobile} onChange={(e) => setMobile(e.target.value)} InputProps={{ startAdornment: <PhoneIcon sx={{ mr: 1, color: 'primary.main' }} /> }} />
                      </Grid>
                    </Grid>
                    <Box sx={{ mt: 2, textAlign: 'right' }}>
                      <Button type="submit" variant="contained" startIcon={<SaveIcon />}>Update Profile</Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Container>
          </Box>
        </FacultyLayout>
    )
}

export default FacultyUpdateProfile;
