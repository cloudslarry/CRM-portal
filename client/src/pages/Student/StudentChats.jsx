import React from 'react'
import {useSelector} from 'react-redux'
import { Link } from 'react-router-dom'
import StudentLayout from '../../components/StudentLayout'
import { Box, Container, Card, CardContent, Typography, List, ListItem, ListItemAvatar, Avatar, ListItemText, Button, Divider } from '@mui/material'
import { Message as MessageIcon, Inbox as InboxIcon } from '@mui/icons-material'

const StudentChats = () => {
    const student = useSelector((store) => store.student)

    return(
      <StudentLayout title="Messages">
        <Container maxWidth="md">
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>New Messages</Typography>
              <List>
                {student.newerChats.map((res,index) => (
                  <React.Fragment key={`new-${index}`}>
                    <ListItem secondaryAction={
                      <Button variant="contained" size="small" component={Link} to={`/chat/${res.receiverRegistrationNumber}.${res.senderRegistrationNumber}`}>Chat</Button>
                    }>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'primary.main' }}><MessageIcon/></Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={res.senderName} secondary={res.senderRegistrationNumber} />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
              <Typography variant="h6" fontWeight={700} sx={{ mt: 2, mb: 1 }}>Previous Chats</Typography>
              <List>
                {student.previousChats.map((res,index) => (
                  <React.Fragment key={`old-${index}`}>
                    <ListItem secondaryAction={
                      <Button variant="outlined" size="small" component={Link} to={`/chat/${res.senderRegistrationNumber}.${res.receiverRegistrationNumber}`}>Chat</Button>
                    }>
                      <ListItemAvatar>
                        <Avatar sx={{ bgcolor: 'info.main' }}><InboxIcon/></Avatar>
                      </ListItemAvatar>
                      <ListItemText primary={res.receiverName} secondary={res.receiverRegistrationNumber} />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            </CardContent>
          </Card>
        </Container>
      </StudentLayout>
    )
}

export default StudentChats; 
