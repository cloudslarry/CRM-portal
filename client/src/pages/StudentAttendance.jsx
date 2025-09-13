import React,{useEffect,useState} from 'react'
import {useNavigate} from 'react-router-dom'
import {DataGrid} from '@mui/x-data-grid'
import {useSelector,useDispatch} from 'react-redux'

import StudentNavbar from '../components/StudentNavbar'
import StudentLayout from '../components/StudentLayout'
import { Box, Container, Card, CardContent, Typography, Grid, TextField, InputAdornment, Button } from '@mui/material'
import { CalendarMonth as CalendarMonthIcon, Search as SearchIcon } from '@mui/icons-material'

import {fetchAttendance} from '../redux/actions/studentAction'

const StudentAttendance = () => {

    const student = useSelector(store => store.student)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [date, setDate] = useState(() => {
      const d = new Date();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${d.getFullYear()}-${mm}-${dd}`;
    })

    useEffect(() => {
        dispatch(fetchAttendance(date))
    },[dispatch])

    const refresh = () => {
      dispatch(fetchAttendance(date))
    }

    const columns = [
        {field:"id",headerName:"#",flex:0.3, minWidth:60},
        {field:"code",headerName:"Subject Code",flex:0.8, minWidth:140},
        {field:"name",headerName:"Subject Name",flex:1.5, minWidth:200},
        {field:"max",headerName:"Max Hours",flex:0.6, minWidth:120},
        {field:"absent",headerName:"Absent Hours",flex:0.6, minWidth:120},
        {field:"total",headerName:"Total Hours",flex:0.6, minWidth:120},
        {field:"attendance",headerName:"Attendance",flex:0.8, minWidth:120},
    ]

    const rows = [];
    student?.attendence?.forEach((item,index) => {
        rows.push({
            id:index+1,
            code:item.subjectCode,
            name:item.subjectName,
            max:item.maxHours,
            absent:item.absentHours,
            total:item.totalLectures,
            attendance:`${item.attendance}%`,
        })
    })

    if (!student.isAuthenticated) { navigate('/'); return null }

    return(
      <StudentLayout title="Attendance">
        <Container maxWidth="lg">
          <Typography variant="h5" fontWeight={700} sx={{ mb: 2 }}>Student Attendance</Typography>
          <Card sx={{ mb: 2 }}>
            <CardContent>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6} md={3}>
                  <TextField fullWidth type="date" label="Date" value={date} onChange={(e) => setDate(e.target.value)} InputLabelProps={{ shrink: true }} InputProps={{ startAdornment: <InputAdornment position="start"><CalendarMonthIcon /></InputAdornment> }} />
                </Grid>
                <Grid item xs={12} sm={6} md={2}>
                  <Button variant="contained" startIcon={<SearchIcon />} onClick={refresh} fullWidth>View</Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ height: 560, width: '100%' }}>
                <DataGrid rows={rows} columns={columns} pageSize={10} rowsPerPageOptions={[5,10,25]} disableSelectionOnClick sx={{ border: 0 }} />
              </Box>
            </CardContent>
          </Card>
        </Container>
      </StudentLayout>
    )
}

export default StudentAttendance;
