import React from 'react'
import { Drawer, List, ListItemButton, ListItemIcon, ListItemText, Toolbar } from '@mui/material'
import { Home as HomeIcon, Assignment as AssignmentIcon, Search as SearchIcon, School as SchoolIcon, Info as InfoIcon, Logout as LogoutIcon, Login as LoginIcon } from '@mui/icons-material'
import { useNavigate, useLocation } from 'react-router-dom'

const ApplicantSidebar = ({ open, onClose, width = 280 }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const items = [
    { label: 'Apply Admission', icon: <AssignmentIcon/>, to: '/admissions/apply' },
    { label: 'Application Status', icon: <SearchIcon/>, to: '/admissions/status' },
    { label: 'Courses & Fees', icon: <SchoolIcon/>, to: '/courses' },
    { label: 'College Info', icon: <InfoIcon/>, to: '/college' },
    { label: 'Applicant Login', icon: <LoginIcon/>, to: '/applicant/auth' },
  ]

  return (
    <Drawer
      variant="persistent"
      open={open}
      onClose={onClose}
      sx={{
        width,
        flexShrink: 0,
        '& .MuiDrawer-paper': { width, boxSizing: 'border-box' }
      }}
    >
      <Toolbar/>
      <List>
        {items.map((item) => (
          <ListItemButton key={item.to} selected={location.pathname === item.to} onClick={() => { navigate(item.to); onClose?.() }}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  )
}

export default ApplicantSidebar


