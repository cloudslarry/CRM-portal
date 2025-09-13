import React,{useEffect} from 'react'
import {DataGrid} from '@mui/x-data-grid'
import {useSelector,useDispatch} from 'react-redux'

import {getMarks} from '../../redux/actions/studentAction'

import StudentNavbar from '../../components/StudentNavbar'
import StudentLayout from '../../components/StudentLayout'
import { Box, Container, Card, CardContent, Typography } from '@mui/material'

const StudentPerformance = () => {
    const dispatch = useDispatch();
    const student = useSelector((store) => store.student);

    useEffect(() => { 
        console.log('StudentPerformance: Fetching marks...');
        dispatch(getMarks()); 
    },[dispatch])

    const columns = [
        {field:"id",headerName:"#",flex:0.3,minWidth:60},
        {field:"code",headerName:"Subject Code",flex:1},
        {field:"name",headerName:"Subject Name",flex:1.5},
        {field:"marks",headerName:"Marks",flex:0.5},
        {field:"totalMarks",headerName:"Total Marks",flex:0.7}
    ]

    const rows1 = []; const rows2 = []; const rows3 = [];
    student?.allMarks?.UnitTest1?.forEach((item,index) => { rows1.push({ id:index + 1, code:item.subject.subjectCode, name:item.subject.subjectName, marks:item.marks, totalMarks:item.totalMarks }) })
    student?.allMarks?.UnitTest2?.forEach((item,index) => { rows2.push({ id:index + 1, code:item.subject.subjectCode, name:item.subject.subjectName, marks:item.marks, totalMarks:item.totalMarks }) })
    student?.allMarks?.Semester?.forEach((item,index) => { rows3.push({ id:index + 1, code:item.subject.subjectCode, name:item.subject.subjectName, marks:item.marks, totalMarks:item.totalMarks }) })

    console.log('StudentPerformance: Marks data:', student.allMarks);
    console.log('StudentPerformance: UnitTest1 rows:', rows1);
    console.log('StudentPerformance: UnitTest2 rows:', rows2);
    console.log('StudentPerformance: Semester rows:', rows3);

    return(
      <StudentLayout title="Performance">
        <Container maxWidth="lg">
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Unit Test 1</Typography>
                <Box sx={{ height: 400 }}>
                  <DataGrid rows={rows1} columns={columns} pageSize={10} rowsPerPageOptions={[5,10,25]} disableSelectionOnClick sx={{ border: 0 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card sx={{ mb: 2 }}>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Unit Test 2</Typography>
                <Box sx={{ height: 400 }}>
                  <DataGrid rows={rows2} columns={columns} pageSize={10} rowsPerPageOptions={[5,10,25]} disableSelectionOnClick sx={{ border: 0 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
          <Card>
            <CardContent sx={{ p: 0 }}>
              <Box sx={{ p: 2 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>Semester</Typography>
                <Box sx={{ height: 400 }}>
                  <DataGrid rows={rows3} columns={columns} pageSize={10} rowsPerPageOptions={[5,10,25]} disableSelectionOnClick sx={{ border: 0 }} />
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </StudentLayout>
    )
}

export default StudentPerformance;
