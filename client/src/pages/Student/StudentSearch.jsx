import React,{useState,useEffect} from 'react'
import {useSelector,useDispatch} from 'react-redux'
import {DataGrid} from '@mui/x-data-grid'
import {Link,useNavigate} from 'react-router-dom';

import api from '../../config/api';
import { getAllStudents } from '../../redux/actions/studentAction';

import styled from 'styled-components'
import StudentNavbar from '../../components/StudentNavbar'
import StudentLayout from '../../components/StudentLayout'
import { Box, Container, Card, CardContent, Typography, Grid, FormControl, InputLabel, Select, MenuItem, Button } from '@mui/material'

import {Person,CalendarToday,Search,Class,Explore} from '@mui/icons-material'

const ContainerDiv = styled.div` 
width:100%;
box-sizing:border-box;
background-color: rgb(255, 255, 255);
display:flex;
flex-direction:column;
border-left: 1px solid rgba(0, 0, 0, 0.158);
height: 100vh;
`
const Heading = styled.h1` 
font:400 2rem;
padding:0.5vmax; 
box-sizing:border-box;
color:#0077b6;
transition: all 0.5s;
margin: 2rem;
text-align: center;
border-bottom:1px solid #0077b6;
`
const Form = styled.form` 
width:100%;
display: flex;
flex-direction: column;
align-items: center;
margin: auto;
padding: 3vmax;
background-color: white;
`

const FormItemContainer  = styled.div` 
display:flex;
justify-content:center;
width: 100%;
`
const FormItem = styled.div` 
display: flex;
align-items: center;
margin: 2rem;
>input{
    padding:1vmax 4vmax;
    padding-right:1vmax;
    width: 100%;
    box-sizing: border-box;
    border: 1px solid rgba(0, 0, 0, 0.267);
    border-radius: 4px;
    font: 300 0.9vmax;
    outline: none;
}
>select{
    padding:1vmax 4vmax;
    padding-right:1vmax;
    width: 100%;
    box-sizing: border-box;
    border: 1px solid rgba(0, 0, 0, 0.267);
    border-radius: 4px;
    font: 300 0.9vmax;
    outline: none;
}
>svg{
    position:absolute;
    transform:translateX(1vmax);
    font-size:1.6vmax; 
    color:rgba(0,0,0,0.623)
}
`


const StudentSearch = () => {

    const student = useSelector((store) => store.student);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [department, setDepartment] = useState("")
    const [year, setYear] = useState("")
    const [section, setSection] = useState("")
    const [result, setResult] = useState([])

    const fetchStudents = async() => {
        try{
            console.log('StudentSearch: Fetching students with criteria:', {department, year, section});
            const {data} = await api.post('/api/student/getAllStudents',{
                department,year,section
            })

            console.log('StudentSearch: API response:', data);
            setResult(data.result);

        }catch(err)
        {
            console.error('StudentSearch: Error fetching students:', err);
            alert("Something went wrong..");
        }
    }

    const columns = [
        {field:"num",headerName:"S.R No.",flex:0.1},
        {field:"id",headerName:"G.R Number",flex:0.5},
        {field:"name",headerName:"Name",flex:0.5},
        {field:"email",headerName:"Email",flex:0.3},
        {field:"section",headerName:"Section",flex:0.4},
        {field:"visit",headerName:"Visit",flex:0.2,type:"number",sortable:"false",renderCell:(params) => {
            return(
                <>
                <Link to={`/profile/${params.id}`}>
                 <Explore style={{color:"#0077b6"}}/>
                </Link>
                </>
            )
        }}
    ]

    /*
    const subjects = [
        {no:1,code:12345,name:"Shifon Shaikh",email:"abc123@gmail.com",year:"A"},
        {no:2,code:12345,name:"Rahul Yadav",email:"abc123@gmail.com",year:"B"},
        {no:3,code:12345,name:"Disha Patani",email:"abc123@gmail.com",year:"C"},
        {no:4,code:12345,name:"Rakesh Mali",email:"abc123@gmail.com",year:"C"},
        {no:5,code:12345,name:"Raj Aryan",email:"abc123@gmail.com",year:"D"},
    ]
    */

    const rows = [];
    result && result.forEach((item,index) => {
        rows.push({
            num:index + 1,
            id:item.registrationNumber,
            name:item.name,
            email:item.email,
            section:item.section
        })
    })

    console.log('StudentSearch: Result data:', result);
    console.log('StudentSearch: Rows data:', rows);

    const formHandler = (e) => {
        e.preventDefault();
        fetchStudents();
    }

  return (
    <StudentLayout title="Search Students">
      <Container maxWidth="lg">
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Department</InputLabel>
                  <Select value={department} label="Department" onChange={(e) => setDepartment(e.target.value)}>
                    {['C.S.E','E.C.E','I.T','Civil','Mechanical'].map(d => <MenuItem key={d} value={d}>{d}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Year</InputLabel>
                  <Select value={year} label="Year" onChange={(e) => setYear(e.target.value)}>
                    {[1,2,3,4].map(y => <MenuItem key={y} value={String(y)}>{y}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth>
                  <InputLabel>Section</InputLabel>
                  <Select value={section} label="Section" onChange={(e) => setSection(e.target.value)}>
                    {['A','B','C','D'].map(s => <MenuItem key={s} value={s}>{s}</MenuItem>)}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <Button variant="contained" onClick={formHandler} startIcon={<Search/>}>Search</Button>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box sx={{ height: 560, width: '100%' }}>
              <DataGrid rows={rows} columns={columns} pageSize={10} rowsPerPageOptions={[5,10,25]} disableSelectionOnClick />
            </Box>
          </CardContent>
        </Card>
      </Container>
    </StudentLayout>
  )
}

export default StudentSearch
