import React, { useState } from 'react'
import { Box, Container, Card, CardContent, Typography, List, ListItem, ListItemText, ListItemIcon, Divider, Button } from '@mui/material'
import { Notifications as NotificationsIcon, DoneAll as DoneAllIcon } from '@mui/icons-material'
import StudentLayout from '../../components/StudentLayout'

const StudentNotifications = () => {
  const [notifications, setNotifications] = useState([
    { id: 1, title: 'New grade posted', body: 'Check your performance page.', read: false },
    { id: 2, title: 'Event tomorrow', body: 'Workshop at 2PM in Hall A.', read: true }
  ])

  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })))

  return (
    <StudentLayout title="Notifications">
      <Container maxWidth="md">
        <Card>
          <CardContent>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="h6" fontWeight={700}>Notifications</Typography>
              <Button size="small" startIcon={<DoneAllIcon/>} onClick={markAllRead}>Mark all as read</Button>
            </Box>
            <List>
              {notifications.length === 0 && (
                <Typography variant="body2" color="text.secondary">No notifications</Typography>
              )}
              {notifications.map(n => (
                <React.Fragment key={n.id}>
                  <ListItem sx={{ opacity: n.read ? 0.7 : 1 }}>
                    <ListItemIcon><NotificationsIcon color={n.read ? 'disabled' : 'primary'} /></ListItemIcon>
                    <ListItemText primary={n.title} secondary={n.body} />
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

export default StudentNotifications


