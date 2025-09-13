import React,{useState,useEffect} from 'react'
import {useSelector,useDispatch} from 'react-redux'
import {DataGrid} from '@mui/x-data-grid'
import {useNavigate} from 'react-router-dom'

import { Box, Container, Card, CardContent, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Button, TextField, Divider, CircularProgress } from '@mui/material'
import { Person as PersonIcon, CalendarToday as CalendarIcon, Search as SearchIcon, Class as ClassIcon, Upload as UploadIcon } from '@mui/icons-material'
import FacultyLayout from '../../components/FacultyLayout'
import {fetchStudents,uploadMarks} from '../../redux/actions/facultyAction'
import toast from 'react-hot-toast'

const FacultyUploadMarks = () => {
    const store = useSelector((store) => store)
    const faculty = useSelector((store) => store.faculty);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [department, setDepartment] = useState("")
    const [year, setYear] = useState("")
    const [marks, setMarks] = useState([])
    const [section, setSection] = useState("")
    const [subjectCode, setSubjectCode] = useState("")
    const [totalMarks, setTotalMarks] = useState('')
    const [exam ,setExam] = useState("")
    const [error, setError] = useState({})
    const [errorHelper, setErrorHelper] = useState({})
    const [isFetchingStudents,setIsFetchingStudents] = useState(true);
    const [loading, setLoading] = useState(false)

    useEffect(() => { if (store.error) setError(store.error) }, [store.error])
    useEffect(() => { if (store.errorHelper) setErrorHelper(store.errorHelper) }, [store.errorHelper])

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
        dispatch(fetchStudents(department, year, section)).then(() => setIsFetchingStudents(false)).finally(() => setLoading(false))
    }

    const secondFormHandler = (e) => {
        e.preventDefault();
        if (!subjectCode || !totalMarks) { toast.error('Select subject and enter total marks'); return; }
        dispatch(uploadMarks(subjectCode, exam, totalMarks, marks, department, year, section));
        toast.success("Marks uploaded successfully");
    }

    return (
      <FacultyLayout title="Upload Marks">
        <Box sx={{ p: { xs: 0.5, sm: 1, md: 2 } }}>
          <Container maxWidth="lg" sx={{ px: { xs: 0.5, sm: 1, md: 2 } }}>
            <Card sx={{ mb: 2 }}>
              <CardContent>
                {isFetchingStudents ? (
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
                        <Select value={department} label="Department" onChange={(e) => setDepartment(e.target.value)} startAdornment={<PersonIcon sx={{ mr: 1 }} />}>
                          <MenuItem value="">Department</MenuItem>
                          {['C.S.E','E.C.E','I.T','Civil','Mechanical'].map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
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
                ) : (
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={4}>
                      <FormControl fullWidth>
                        <InputLabel>Subject</InputLabel>
                        <Select value={subjectCode} label="Subject" onChange={(e) => setSubjectCode(e.target.value)} startAdornment={<ClassIcon sx={{ mr: 1 }} />}>
                          <MenuItem value="">Subject</MenuItem>
                          {faculty.allSubjectCodeList.map(code => <MenuItem key={code} value={code}>{code}</MenuItem>)}
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
                )}
              </CardContent>
            </Card>

            <Card>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ height: 520, width: '100%' }}>
                  <DataGrid rows={rows} columns={columns} pageSize={10} rowsPerPageOptions={[5,10,25]} disableSelectionOnClick sx={{ '& .MuiDataGrid-columnHeaders': { backgroundColor: 'action.hover' }, '& .MuiDataGrid-row:hover': { backgroundColor: 'action.hover' } }} />
                </Box>
              </CardContent>
            </Card>
          </Container>
        </Box>
      </FacultyLayout>
    )
}

export default FacultyUploadMarks
