import React,{useRef,useState,useEffect} from 'react'
import { getPrivateConversation, sendMessage } from '../redux/actions/studentAction'
import { useSelector, useDispatch } from 'react-redux'
import toast from 'react-hot-toast'



import io from 'socket.io-client'
import {useNavigate,useParams} from 'react-router-dom'
import styled from 'styled-components'

import StudentNavbar from '../components/StudentNavbar'
import StudentLayout from '../components/StudentLayout'
import Message from '../components/Message'
import { Box, Container, Card, CardContent, Typography, TextField, IconButton } from '@mui/material'
import { Send as SendIcon } from '@mui/icons-material'

const ContainerOuter = styled.div` display:flex; width:100vw; min-height:100vh; `

//Swap utility function
function swap(input,a,b){
    var temp = input[a];
    input[a] = input[b];
    input[b] = temp;
}

let socket;

const Chat = ({match}) => {

    const student = useSelector((store) => store.student)
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const params = useParams();
    const scrollRef = useRef();
    const alert = toast;

    const [room1, setRoom1] = useState("")
    const [room2, setRoom2] = useState("")
    const [receiverRegistrationNumber, setReceiverRegistrationNumber] = useState("")
    const [message, setMessage] = useState("")
    const [messageArray, setMessageArray] = useState([])
    const [olderMessages, setOlderMessages] = useState([])

    const socketUrl = process.env.REACT_APP_API_BASE_URL || "http://localhost:5000"

    useEffect(() => {
        let temp = params.room;
        socket = io(socketUrl);
        let tempArr = temp.split(".");
        setReceiverRegistrationNumber(tempArr[1]);
        setRoom1(temp)
        swap(tempArr, 0, 1)
        let tempRoom2 = tempArr[0] + '.' + tempArr[1];
        setRoom2(tempRoom2);
      
    },[socketUrl,params.room])

    useEffect(() => {
  dispatch(getPrivateConversation(room1));
  // dispatch(getPrivateConversation2(room2)); // Removed: not needed
        socket = io(socketUrl);
        socket.emit('join room',{
            room1,
            room2
        })

        socket.on('new Message',(data) => {
            setMessageArray([...messageArray,data])
        })

        return () => {
            socket.disconnect();
            socket.off();
        }
    },[room1,room2])

    useEffect(() => {
        socket.on("new Message", (data) => {
            setOlderMessages(student.privateChat)
            setMessageArray([...messageArray, data])
        })
        
    },[messageArray,olderMessages]);

    const formHandler = (e) => {
        e.preventDefault();
        if(message.trim().length > 0)
        {
            socket.emit("private message",{
                sender:student.student.student.name,
                message,
                room:room1
            })
            setMessage("");
            let messageObj = {
                roomId:room1,
                senderName:student.student.student.name,
                senderId:student.student.student._id,
                message,
                senderRegistrationNumber: student.student.student.registrationNumber,
                receiverRegistrationNumber
            }
            dispatch(sendMessage(room1,messageObj))
        }else
        {
            toast.error("Message cannot be empty")
        }
    }
    
    if (!student.isAuthenticated) { navigate('/'); return null }

    return(
      <StudentLayout title="Chat">
        <Container maxWidth="md">
          <Card>
            <CardContent sx={{ display: 'flex', flexDirection: 'column', height: '70vh', p: { xs: 1, sm: 2 } }}>
              <Box sx={{ flex: 1, overflowY: 'auto', pr: 1 }}>
                {student.privateChat.map((obj,index) => (
                  <Message key={index} message={obj} own={obj.senderRegistrationNumber === student.student.student.registrationNumber}/>
                ))}
                {messageArray.map((obj,index) => (
                  <Message key={index} message={obj} own/>
                ))}
              </Box>
              <Box component="form" onSubmit={formHandler} sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <TextField fullWidth size="small" placeholder="Write a message..." value={message} onChange={(e) => setMessage(e.target.value)} />
                <IconButton color="primary" type="submit"><SendIcon/></IconButton>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </StudentLayout>
    )
}

export default Chat;
