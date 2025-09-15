// Centralized MUI sx styles for Library pages (Faculty + Student)
// Aligns with theme colors, shadows, typography, and spacing used elsewhere

export const containerSx = {
  px: { xs: 0.5, sm: 1, md: 2 }
}

export const cardSx = {
  mb: 2
}

export const toolbarCardContentSx = {
  py: { xs: 1, sm: 1.5 },
  px: { xs: 1, sm: 2 }
}

export const toolbarGridSx = {
  alignItems: 'center'
}

export const searchFieldSx = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2
  }
}

export const actionButtonSx = {
  minWidth: 140
}

export const tableCardContentSx = {
  p: { xs: 1, sm: 2 }
}

export const dataGridSx = {
  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: 'action.hover',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8
  },
  '& .MuiDataGrid-row:hover': {
    backgroundColor: 'action.hover'
  },
  '& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus': {
    outline: 'none'
  }
}

export const formStackSx = {
  '& .MuiTextField-root': { width: '100%' }
}

export const formGridSx = {
  mt: 0
}

export const fileRowSx = {
  alignItems: 'center'
}

export const dialogActionsSx = {
  px: 3,
  py: 2
}

// Responsive helpers for buttons group in toolbar
export const toolbarRightActionsSx = {
  display: 'flex',
  gap: 1,
  flexWrap: { xs: 'wrap', sm: 'nowrap' }
}

// Section title styles when embedding in Layout headers (if needed)
export const headerTitleSx = {
  fontWeight: 600
}


