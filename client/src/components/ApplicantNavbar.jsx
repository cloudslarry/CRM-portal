import React from 'react'
import { AppBar, Toolbar, IconButton, Typography } from '@mui/material'
import { Menu as MenuIcon } from '@mui/icons-material'

const ApplicantNavbar = ({ title = 'Applicant', onMenu }) => {
  return (
    <AppBar position="sticky" color="default" elevation={0} sx={{ borderBottom: '1px solid', borderColor: 'divider' }}>
      <Toolbar variant="dense">
        <IconButton size="small" edge="start" onClick={onMenu} sx={{ mr: 1 }}>
          <MenuIcon/>
        </IconButton>
        <Typography variant="h6" fontWeight={600}>{title}</Typography>
      </Toolbar>
    </AppBar>
  )
}

export default ApplicantNavbar


