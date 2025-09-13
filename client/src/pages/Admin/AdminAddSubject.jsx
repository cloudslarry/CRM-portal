import React, { useState, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

import AdminLayout from '../../components/AdminLayout'
import { DEPARTMENTS } from '../../config/departments'
import styled from 'styled-components'
import {adminAddSubject} from '../../redux/actions/adminAction'

import {Class,Face,MailOutline,Phone,PhoneIphone,SupervisorAccount,CalendarToday, Subject as SubjectIcon, Book as BookIcon, Save as SaveIcon, Clear as ClearIcon} from '@mui/icons-material'
import { Box, Container as MUIContainer, Card, CardContent, Typography, TextField, Button, Grid, Avatar, Paper, FormControl, InputLabel, Select, MenuItem, InputAdornment, Divider } from '@mui/material'

const Container = styled.div`
width:100%;
min-height:100vh;
display:flex;
justify-content:center;
align-items: center;
background-color:rgb(231,231,231);
padding: 1rem;
box-sizing: border-box;

@media (max-width: 768px) {
  padding: 0.5rem;
}
`

const ProfileBox = styled.div` 
background-color:white;
width: 100%;
max-width: 500px;
min-height: 70vh;
box-sizing:border-box;
border-radius: 8px;
box-shadow: 0 4px 6px rgba(0,0,0,0.1);

@media (max-width: 768px) {
  width: 100%;
  min-height: 60vh;
  margin: 1rem 0;
}

@media (min-width: 769px) and (max-width: 1024px) {
  width: 80%;
  max-width: 600px;
}

@media (min-width: 1025px) {
  width: 25vw;
  min-width: 400px;
  max-width: 500px;
}
`

const ProfileHeader = styled.h1` 
text-align:center;
color:#0077b6;
font:400 1.3vmax;
padding:1.3vmax;
border-bottom:1px solid #0077b6;
width:50%;
margin:auto;

@media (max-width: 768px) {
  font-size: 1.5rem;
  padding: 1rem;
  width: 80%;
}

@media (min-width: 769px) and (max-width: 1024px) {
  font-size: 1.8rem;
  padding: 1.2rem;
  width: 60%;
}
`

const ProfileForm = styled.form` 
display:flex;
flex-direction: column;
align-items:center;
justify-content:flex-start;
margin: auto;
padding: 2vmax;
height: 70%;
gap: 1rem;

@media (max-width: 768px) {
  padding: 1rem;
  height: auto;
  gap: 1rem;
}

@media (min-width: 769px) and (max-width: 1024px) {
  padding: 1.5rem;
  gap: 1.2rem;
}

>div{
    display:flex;
    align-items:center;
    width:100%;
    
    @media (max-width: 768px) {
      flex-direction: column;
      align-items: flex-start;
      gap: 0.5rem;
    }
}
`
const ProfileName = styled.div` 
position: relative;
width: 100%;

>select{
    padding:1vmax 4vmax;
    padding-right:1vmax;
    width:100%;
    box-sizing:border-box;
    border:1px solid rgba(0,0,0,0.267);
    border-radius:4px;
    font:300 0.9vmax;
    outline:none;
    
    @media (max-width: 768px) {
      padding: 0.8rem 3rem 0.8rem 1rem;
      font-size: 1rem;
      min-height: 44px;
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
      padding: 0.9rem 3.5rem 0.9rem 1.2rem;
      font-size: 1.1rem;
    }
};

>svg{
    position:absolute;
    top: 50%;
    transform: translateY(-50%) translateX(1vmax);
    font-size:1.6vmax;
    pointer-events: none;
    
    @media (max-width: 768px) {
      font-size: 1.2rem;
      transform: translateY(-50%) translateX(0.5rem);
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
      font-size: 1.4rem;
    }
}
`
const ProfileEmail = styled.div` 
position: relative;
width: 100%;

>svg{
    position:absolute;
    top: 50%;
    transform: translateY(-50%) translateX(1vmax);
    font-size:1.6vmax;
    pointer-events: none;
    
    @media (max-width: 768px) {
      font-size: 1.2rem;
      transform: translateY(-50%) translateX(0.5rem);
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
      font-size: 1.4rem;
    }
}
`
const ProfilePhone = styled.div` 
position: relative;
width: 100%;

>svg{
    position:absolute;
    top: 50%;
    transform: translateY(-50%) translateX(1vmax);
    font-size:1.6vmax;
    pointer-events: none;
    
    @media (max-width: 768px) {
      font-size: 1.2rem;
      transform: translateY(-50%) translateX(0.5rem);
    }
    
    @media (min-width: 769px) and (max-width: 1024px) {
      font-size: 1.4rem;
    }
}
`

const ProfileImage = styled.div` 
>img{
    width:3vmax;
    border-radius:100%;
    margin:1vmax;
}
>input{
    display:flex;
    padding:0%;
}
`
const ProfileInput = styled.input` 
padding:1vmax 4vmax;
padding-right:1vmax;
width:100%;
box-sizing:border-box;
border:1px solid #0077b6;
border-radius:4px;
font:300 0.9vmax;
outline:none;

@media (max-width: 768px) {
  padding: 0.8rem 3rem 0.8rem 1rem;
  font-size: 1rem;
  min-height: 44px;
}

@media (min-width: 769px) and (max-width: 1024px) {
  padding: 0.9rem 3.5rem 0.9rem 1.2rem;
  font-size: 1.1rem;
}
`
const ProfileButton = styled.button` 
border:none;
background-color: #0077b6;
color:white;
font:300 0.9vmax;
width: 100%;
padding: 0.8vmax;
cursor: pointer;
border-radius: 4px;
outline: none;
box-shadow:0 2px 5px rgba(0,0,0,0.219);
transition: all 0.3s ease;

@media (max-width: 768px) {
  padding: 0.8rem;
  font-size: 1rem;
  min-height: 44px;
}

@media (min-width: 769px) and (max-width: 1024px) {
  padding: 0.9rem;
  font-size: 1.1rem;
}

&:hover {
  background-color: #005a8b;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0,0,0,0.3);
}

&:active {
  transform: translateY(0);
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}
`

const AdminAddSubject = () => {
 
      const admin = useSelector((state) => state.admin);
      const dispatch = useDispatch();
      const navigate = useNavigate();
      const alert = toast;

    const [subjectName, setSubjectName] = useState('')
    const [subjectCode, setSubjectCode] = useState('')
    const [totalLectures, setTotalLectures] = useState('')
    const [department, setDepartment] = useState('')
    const [year, setYear] = useState('')

    const [errors, setErrors] = useState({})
    const [isLoading, setIsLoading] = useState(false)
    const [showConfirmDialog, setShowConfirmDialog] = useState(false)

    const departments = ['C.S.E', 'I.T', 'E.C.E', 'Civil', 'Mechanical']
    const years = ['1', '2', '3', '4', '5']

    const handleReset = () => {
      setSubjectName('')
      setSubjectCode('')
      setTotalLectures('')
      setDepartment('')
      setYear('')
      setErrors({})
    }

    const validate = () => {
      const newErrors = {}
      
      // Subject Name validation
      if (!subjectName.trim()) {
        newErrors.subjectName = 'Subject name is required'
      } else if (subjectName.trim().length < 2 || subjectName.trim().length > 100) {
        newErrors.subjectName = 'Subject name must be between 2 and 100 characters'
      }
      
      // Subject Code validation
      if (!subjectCode.trim()) {
        newErrors.subjectCode = 'Subject code is required'
      } else if (subjectCode.trim().length < 2 || subjectCode.trim().length > 20) {
        newErrors.subjectCode = 'Subject code must be between 2 and 20 characters'
      } else if (!/^[A-Z0-9-]+$/.test(subjectCode.trim())) {
        newErrors.subjectCode = 'Subject code must contain only uppercase letters, numbers, and hyphens'
      }
      
      // Total Lectures validation
      if (!String(totalLectures).trim()) {
        newErrors.totalLectures = 'Total lectures is required'
      } else {
        const lectures = parseInt(totalLectures)
        if (isNaN(lectures) || lectures < 1 || lectures > 200) {
          newErrors.totalLectures = 'Total lectures must be between 1 and 200'
        }
      }
      
      // Department validation
      if (!department) {
        newErrors.department = 'Department is required'
      }
      
      // Year validation
      if (!year) {
        newErrors.year = 'Year is required'
      } else {
        const yearNum = parseInt(year)
        if (isNaN(yearNum) || yearNum < 1 || yearNum > 5) {
          newErrors.year = 'Year must be between 1 and 5'
        }
      }
      
      setErrors(newErrors)
      return Object.keys(newErrors).length === 0
    }

    const handleSubmitClick = () => {
      if (!validate()) return
      setShowConfirmDialog(true)
    }

    const formHandler = async (e) => {
      e.preventDefault();
      if (!validate()) return
      setShowConfirmDialog(false)
      setIsLoading(true)
      
      try {
        const result = await dispatch(adminAddSubject({
          department,
          year,
          subjectCode,
          subjectName,
          totalLectures,
        }));
        
        if (result.success) {
          toast.success(`Subject added successfully! Affected ${result.data.studentsAffected || 0} students.`);
          handleReset();
          navigate('/admin/subjects');
        } else {
          // Handle validation errors
          if (result.error.errors) {
            setErrors(result.error.errors);
            toast.error('Please fix the validation errors');
          } else {
            toast.error(result.error.message || 'Failed to add subject. Please try again.');
          }
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        toast.error('An unexpected error occurred. Please try again.');
      } finally {
        setIsLoading(false);
      }
    }

    return(
        <>
        {
            admin.isAuthenticated?(
                <>
                <AdminLayout>
                <Box sx={{ p: { xs: 0.5, sm: 1, md: 2 }, width: '100%', maxWidth: '100%', boxSizing: 'border-box' }}>
                  <MUIContainer maxWidth="lg" sx={{ px: { xs: 0.5, sm: 1, md: 2 }, py: { xs: 0.5, sm: 1 } }}>
                    <Box sx={{ mb: { xs: 1.5, sm: 2, md: 3, lg: 4 }, textAlign: 'center', p: { xs: 1, sm: 2 } }}>
                      <Avatar sx={{ width: { xs: 50, sm: 60, md: 70, lg: 80 }, height: { xs: 50, sm: 60, md: 70, lg: 80 }, mx: 'auto', mb: { xs: 0.5, sm: 1, md: 2 }, bgcolor: 'primary.main' }}>
                        <SubjectIcon sx={{ fontSize: { xs: 24, sm: 30, md: 36, lg: 40 } }} />
                      </Avatar>
                      <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: { xs: 0.5, sm: 1 }, fontSize: { xs: '1.25rem', sm: '1.75rem', md: '2rem', lg: '2.5rem' }, lineHeight: 1.2 }}>
                        Add New Subject
                      </Typography>
                      <Typography variant="body1" color="text.secondary" sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }, lineHeight: 1.4 }}>
                        Fill in the subject information to add it to the system
                      </Typography>
                    </Box>

                    <Card sx={{ borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' }}>
                      <CardContent sx={{ p: { xs: 1, sm: 2, md: 3 }, '&:last-child': { pb: { xs: 1, sm: 2, md: 3 } } }}>
                        <form onSubmit={formHandler}>
                          <Grid container spacing={{ xs: 1.5, sm: 2, md: 3 }}>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Subject Name"
                                value={subjectName}
                                onChange={(e) => setSubjectName(e.target.value)}
                                error={!!errors.subjectName}
                                helperText={errors.subjectName}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <BookIcon color="primary" />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Subject Code"
                                value={subjectCode}
                                onChange={(e) => setSubjectCode(e.target.value)}
                                error={!!errors.subjectCode}
                                helperText={errors.subjectCode}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <Class />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <FormControl fullWidth error={!!errors.department}>
                                <InputLabel>Department</InputLabel>
                                <Select value={department} onChange={(e) => setDepartment(e.target.value)} label="Department">
                                  {departments.map((dept) => (
                                    <MenuItem key={dept} value={dept}>{dept}</MenuItem>
                                  ))}
                                </Select>
                                {errors.department && (
                                  <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                                    {errors.department}
                                  </Typography>
                                )}
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <FormControl fullWidth error={!!errors.year}>
                                <InputLabel>Year</InputLabel>
                                <Select value={year} onChange={(e) => setYear(e.target.value)} label="Year">
                                  {years.map((yr) => (
                                    <MenuItem key={yr} value={yr}>{yr}</MenuItem>
                                  ))}
                                </Select>
                                {errors.year && (
                                  <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                                    {errors.year}
                                  </Typography>
                                )}
                              </FormControl>
                            </Grid>
                            <Grid item xs={12} md={6}>
                              <TextField
                                fullWidth
                                label="Total Lectures"
                                type="number"
                                value={totalLectures}
                                onChange={(e) => setTotalLectures(e.target.value)}
                                error={!!errors.totalLectures}
                                helperText={errors.totalLectures}
                                InputProps={{
                                  startAdornment: (
                                    <InputAdornment position="start">
                                      <CalendarToday />
                                    </InputAdornment>
                                  ),
                                }}
                              />
                            </Grid>
                          </Grid>

                          <Divider sx={{ my: { xs: 1.5, sm: 2, md: 3 } }} />

                          <Box sx={{ display: 'flex', justifyContent: 'flex-end', flexDirection: { xs: 'column', sm: 'row' }, gap: { xs: 1, sm: 1.5, md: 2 } }}>
                            <Button
                              onClick={handleReset}
                              variant="outlined"
                              size="small"
                              startIcon={<ClearIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
                              sx={{ borderRadius: { xs: 1, sm: 2 }, px: { xs: 1.5, sm: 2, md: 3 }, py: { xs: 0.75, sm: 1, md: 1.25 }, width: { xs: '100%', sm: 'auto' }, minWidth: { xs: 'auto', sm: 100 }, minHeight: { xs: 40, sm: 44, md: 48 }, fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' } }}
                            >
                              Reset
                            </Button>
                            <Button
                              type="button"
                              variant="contained"
                              disabled={isLoading}
                              onClick={handleSubmitClick}
                              startIcon={<SaveIcon sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }} />}
                              size="small"
                              sx={{ borderRadius: { xs: 1, sm: 2 }, px: { xs: 1.5, sm: 2, md: 3 }, py: { xs: 0.75, sm: 1, md: 1.25 }, width: { xs: '100%', sm: 'auto' }, minWidth: { xs: 'auto', sm: 140 }, minHeight: { xs: 40, sm: 44, md: 48 }, fontSize: { xs: '0.75rem', sm: '0.875rem', md: '1rem' }, background: 'linear-gradient(45deg, #4caf50 30%, #66bb6a 90%)', '&:hover': { background: 'linear-gradient(45deg, #388e3c 30%, #4caf50 90%)' } }}
                            >
                              {isLoading ? 'Adding...' : 'Add Subject'}
                            </Button>
                          </Box>
                        </form>
                      </CardContent>
                    </Card>
                  </MUIContainer>
                </Box>

                {showConfirmDialog && (
                  <Box sx={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, bgcolor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
                    <Paper sx={{ p: { xs: 3, sm: 4 }, maxWidth: { xs: '90%', sm: 400 }, mx: 2, width: '100%' }}>
                      <Typography variant="h6" sx={{ mb: 2, textAlign: 'center', fontSize: { xs: '1.1rem', sm: '1.25rem' } }}>
                        Confirm Subject Addition
                      </Typography>
                      <Typography variant="body2" sx={{ mb: 3, textAlign: 'center', fontSize: { xs: '0.875rem', sm: '0.875rem' } }}>
                        Are you sure you want to add this subject? This action cannot be undone.
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexDirection: { xs: 'column', sm: 'row' } }}>
                        <Button variant="outlined" onClick={() => setShowConfirmDialog(false)} sx={{ px: 3, width: { xs: '100%', sm: 'auto' } }}>
                          Cancel
                        </Button>
                        <Button variant="contained" onClick={formHandler} sx={{ px: 3, width: { xs: '100%', sm: 'auto' } }}>
                          Confirm & Add Subject
                        </Button>
                      </Box>
                    </Paper>
                  </Box>
                )}
                </AdminLayout>
                </>
            ):(
                navigate('/admin/login')
            )
        }
        </>
          
    )
}

export default AdminAddSubject;
