import React,{useEffect} from 'react'
import {useNavigate} from 'react-router-dom'
import {DataGrid} from '@mui/x-data-grid'
import {useSelector,useDispatch} from 'react-redux'

import StudentNavbar from '../../components/StudentNavbar'
import StudentLayout from '../../components/StudentLayout'
import { Box, Container, Card, CardContent, Typography } from '@mui/material'
import styled from 'styled-components'
import {getAllSubjects} from '../../redux/actions/studentAction'

const ContainerDiv = styled.div` 
width:100%;
box-sizing:border-box;
background-color: rgb(255, 255, 255);
display:flex;
flex-direction:column;
border-left: 1px solid rgba(0, 0, 0, 0.158);
height: 100vh;
`

const Header = styled.h1` 
font:400 2rem;
padding:0.5vmax;
box-sizing:border-box;
color:#0077b6;
transition: all 0.5s;
margin: 2rem;
text-align: center;
`

const StudentSubjectList = () => {

    const student = useSelector((store) => store.student)
    const navigate = useNavigate()
    const dispatch = useDispatch()

    useEffect(() => {
       console.log('StudentSubjectList: Fetching subjects...');
       dispatch(getAllSubjects())
    },[dispatch])

    const columns = [
        {field:"id",headerName:"Subject No.",flex:0.3},
        {field:"code",headerName:"Subject Code",flex:1},
        {field:"name",headerName:"Subject Name",flex:1},
        {field:"year",headerName:"Year",flex:0.3},
        {field:"total",headerName:"Total Hours",flex:0.4}
    ]

    /*
    const subjects = [
        {no:1,code:12345,name:"Data Structures",year:2,total:24},
        {no:2,code:12345,name:"Algorithms",year:2,total:28},
        {no:3,code:12345,name:"Operating Systems",year:2,total:36},
        {no:4,code:12345,name:"Database Management",year:2,total:36},
        {no:5,code:12345,name:"Machine Learning",year:2,total:24},
    ]
    */

    const rows = [];
    student.allSubjects && student.allSubjects.forEach((item,index) => {
        rows.push({
            id:index+1,
            code:item.subjectCode,
            name:item.subjectName,
            year:item.year,
            total:item.totalLectures
        })
    })

    console.log('StudentSubjectList: Subjects data:', student.allSubjects);
    console.log('StudentSubjectList: Rows data:', rows);

    if (!student.isAuthenticated) { navigate('/'); return null }

    return(
      <StudentLayout title="Subjects">
        <Container maxWidth="lg">
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

export default StudentSubjectList;
