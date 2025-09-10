import React, { useState } from 'react'
import { Box, useTheme, useMediaQuery } from '@mui/material'
import ApplicantSidebar from './ApplicantSidebar'
import ApplicantNavbar from './ApplicantNavbar'

const ApplicantLayout = ({ title = 'Applicant', children }) => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [open, setOpen] = useState(!isMobile)
  const sidebarWidth = open ? 280 : 64

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <ApplicantSidebar open={open} onClose={() => setOpen(false)} width={280} />
      <Box component="main" sx={{ flexGrow: 1, width: { md: `calc(100% - ${sidebarWidth}px)` } }}>
        <ApplicantNavbar title={title} onMenu={() => setOpen(v => !v)} />
        <Box sx={{ p: { xs: 0.5, sm: 1, md: 2 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  )
}

export default ApplicantLayout


