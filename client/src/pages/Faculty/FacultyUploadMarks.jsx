import React,{useState,useEffect} from 'react'
import {useSelector,useDispatch} from 'react-redux'
import {DataGrid} from '@mui/x-data-grid'
import {useNavigate} from 'react-router-dom'

import { Box, Container, Card, CardContent, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Button, TextField, Divider, CircularProgress } from '@mui/material'
import { Person as PersonIcon, CalendarToday as CalendarIcon, Search as SearchIcon, Class as ClassIcon, Upload as UploadIcon } from '@mui/icons-material'
import FacultyLayout from '../../components/FacultyLayout'
import {fetchStudents,uploadMarks,fetchSubjects} from '../../redux/actions/facultyAction'
import { getDepartmentOptions, getFullForm } from '../../config/departments'
import toast from 'react-hot-toast'

const FacultyUploadMarks = () => {
    const faculty = useSelector((store) => store.faculty);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    // Get department options from config
    const departmentOptions = getDepartmentOptions();

    const [department, setDepartment] = useState("")
    const [year, setYear] = useState("")
    const [marks, setMarks] = useState([])
    const [section, setSection] = useState("")
    const [subjectCode, setSubjectCode] = useState("")
    const [totalMarks, setTotalMarks] = useState('')
    const [exam ,setExam] = useState("")
    const [error, setError] = useState({})
    const [errorHelper, setErrorHelper] = useState({})
    const [isFetchingStudents,setIsFetchingStudents] = useState(false);
    const [loading, setLoading] = useState(false)

    useEffect(() => { if (faculty.error) setError(faculty.error) }, [faculty.error])
    useEffect(() => { if (faculty.errorHelper) setErrorHelper(faculty.errorHelper) }, [faculty.errorHelper])
    
    // Fetch subjects when department and year are selected
    useEffect(() => {
        if (department && year) {
            // Use short form for subjects since that's how they're stored in the database
            dispatch(fetchSubjects(department, year));
        }
    }, [department, year, dispatch])

    const handleInputChange = (value,_id) => {
        const newMarks = [...marks];
        let index = newMarks.findIndex(m => m._id === _id);
        if(index === -1) newMarks.push({_id,value}); else newMarks[index].value = value;
        setMarks(newMarks);
    }

    const columns = [
        {field:"id",headerName:"No.",flex:0.2,minWidth:80},
        {field:"code",headerName:"Registration Number",flex:1,minWidth:180},
        {field:"name",headerName:"Name",flex:1.2,minWidth:200},
        {field:"year",headerName:"Marks",flex:0.8,sortable:false,
         renderCell:(params) => (
            <TextField size="small" type="number" onChange={(e) => handleInputChange(e.target.value,params.id)} placeholder="Enter marks" />
         )
        },
    ]

    const rows = [];
    faculty.fetchedStudents.forEach((item,index) => {
        rows.push({ id:item._id, code:item.registrationNumber, name:item.name })
    })

    const formHandler = (e) => {
        e.preventDefault();
        if (!section || !exam || !department || !year) { toast.error('Select all fields'); return; }
        setLoading(true)
        
        // Convert department to full form for API call
        const fullFormDepartment = getFullForm(department);
        console.log('Department conversion:', { short: department, full: fullFormDepartment });
        
        dispatch(fetchStudents(fullFormDepartment, year, section))
            .then(() => {
                toast.success('Students fetched successfully');
            })
            .catch((err) => {
                toast.error('Failed to fetch students');
                console.error('Error fetching students:', err);
            })
            .finally(() => setLoading(false));
    }

    const secondFormHandler = (e) => {
        e.preventDefault();
        if (!subjectCode || !totalMarks) { toast.error('Select subject and enter total marks'); return; }
        
        // Convert department to full form for API call
        const fullFormDepartment = getFullForm(department);
        
        dispatch(uploadMarks(subjectCode, exam, totalMarks, marks, fullFormDepartment, year, section));
        toast.success("Marks uploaded successfully");
    }

    return (
      <FacultyLayout title="Upload Marks">
        <Box sx={{ p: { xs: 0.5, sm: 1, md: 2 } }}>
          <Container maxWidth="lg" sx={{ px: { xs: 0.5, sm: 1, md: 2 } }}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>Search Students</Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Section</InputLabel>
                      <Select value={section} label="Section" onChange={(e) => setSection(e.target.value)} startAdornment={<ClassIcon sx={{ mr: 1 }} />}>
                        <MenuItem value="">Select Section</MenuItem>
                        {['A','B','C','D'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Exam</InputLabel>
                      <Select value={exam} label="Exam" onChange={(e) => setExam(e.target.value)}>
                        <MenuItem value="">Select Exam</MenuItem>
                        <MenuItem value="Unit Test 1">Unit Test 1</MenuItem>
                        <MenuItem value="Unit Test 2">Unit Test 2</MenuItem>
                        <MenuItem value="Semester">Semester</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                   <Grid item xs={12} sm={6} md={3}>
                     <FormControl fullWidth>
                       <InputLabel>Department</InputLabel>
                       <Select 
                         value={department} 
                         label="Department" 
                         onChange={(e) => setDepartment(e.target.value)} 
                         startAdornment={<PersonIcon sx={{ mr: 1 }} />}
                       >
                         <MenuItem value="">Select Department</MenuItem>
                         {departmentOptions.map(dept => (
                           <MenuItem key={dept.value} value={dept.value}>
                             <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                               <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                                 {dept.value}
                               </Typography>
                               <Typography variant="caption" color="text.secondary">
                                 {dept.fullForm}
                               </Typography>
                             </Box>
                           </MenuItem>
                         ))}
                       </Select>
                     </FormControl>
                   </Grid>
                  <Grid item xs={12} sm={6} md={3}>
                    <FormControl fullWidth>
                      <InputLabel>Year</InputLabel>
                      <Select value={year} label="Year" onChange={(e) => setYear(e.target.value)} startAdornment={<CalendarIcon sx={{ mr: 1 }} />}>
                        <MenuItem value="">Year</MenuItem>
                        {[1,2,3,4].map(y => <MenuItem key={y} value={String(y)}>{y}</MenuItem>)}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12}>
                    <Button onClick={formHandler} variant="contained" startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <SearchIcon />}>{loading ? 'Searching...' : 'Search Students'}</Button>
                  </Grid>
                </Grid>
                
                {faculty.fetchedStudents && faculty.fetchedStudents.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="h6" sx={{ mb: 2 }}>Upload Marks</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={4}>
                        <FormControl fullWidth>
                          <InputLabel>Subject</InputLabel>
                          <Select 
                            value={subjectCode} 
                            label="Subject" 
                            onChange={(e) => setSubjectCode(e.target.value)} 
                            startAdornment={<ClassIcon sx={{ mr: 1 }} />}
                            disabled={!department || !year || faculty.allSubjectCodeList.length === 0}
                          >
                            <MenuItem value="">
                              {!department || !year ? "Select Department & Year first" : 
                               faculty.allSubjectCodeList.length === 0 ? "No subjects available" : 
                               "Select Subject"}
                            </MenuItem>
                            {faculty.allSubjectCodeList.map(code => (
                              <MenuItem key={code} value={code}>{code}</MenuItem>
                            ))}
                          </Select>
                        </FormControl>
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <TextField fullWidth type="number" label="Total Marks" value={totalMarks} onChange={(e) => setTotalMarks(e.target.value)} />
                      </Grid>
                      <Grid item xs={12} sm={6} md={4}>
                        <Button onClick={secondFormHandler} variant="contained" color="success" startIcon={<UploadIcon />}>Submit Marks</Button>
                      </Grid>
                    </Grid>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ p: 0 }}>
                {faculty.fetchedStudents && faculty.fetchedStudents.length > 0 ? (
                  <Box sx={{ height: 520, width: '100%' }}>
                    <DataGrid 
                      rows={rows} 
                      columns={columns} 
                      pageSize={10} 
                      rowsPerPageOptions={[5,10,25]} 
                      disableSelectionOnClick 
                      sx={{ 
                        '& .MuiDataGrid-columnHeaders': { backgroundColor: 'action.hover' }, 
                        '& .MuiDataGrid-row:hover': { backgroundColor: 'action.hover' } 
                      }} 
                    />
                  </Box>
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                      {faculty.fetchedStudents && faculty.fetchedStudents.length === 0 
                        ? 'No students found for the selected criteria' 
                        : 'Search for students to see the list here'}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          </Container>
        </Box>
      </FacultyLayout>
    )
}

export default FacultyUploadMarks
