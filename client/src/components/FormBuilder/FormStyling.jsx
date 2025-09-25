import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Card,
  CardContent,
  Button,
  Divider,
  Paper,
  Slider,
  Switch,
  FormControlLabel,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Palette as PaletteIcon,
  Typography as TypographyIcon,
  BorderAll as BorderIcon,
  Code as CodeIcon
} from '@mui/icons-material';

const themes = [
  { value: 'default', label: 'Default', preview: { primary: '#1976d2', background: '#ffffff' } },
  { value: 'modern', label: 'Modern', preview: { primary: '#6366f1', background: '#f8fafc' } },
  { value: 'minimal', label: 'Minimal', preview: { primary: '#000000', background: '#ffffff' } },
  { value: 'colorful', label: 'Colorful', preview: { primary: '#ec4899', background: '#fef3f2' } },
  { value: 'dark', label: 'Dark', preview: { primary: '#8b5cf6', background: '#1f2937' } }
];

const fontFamilies = [
  { value: 'Inter, sans-serif', label: 'Inter' },
  { value: 'Roboto, sans-serif', label: 'Roboto' },
  { value: 'Open Sans, sans-serif', label: 'Open Sans' },
  { value: 'Lato, sans-serif', label: 'Lato' },
  { value: 'Poppins, sans-serif', label: 'Poppins' },
  { value: 'Montserrat, sans-serif', label: 'Montserrat' },
  { value: 'Source Sans Pro, sans-serif', label: 'Source Sans Pro' }
];

const FormStyling = ({ styling, onStylingUpdate }) => {
  const [customCSSOpen, setCustomCSSOpen] = useState(false);

  const handleStylingChange = (key, value) => {
    onStylingUpdate({
      ...styling,
      [key]: value
    });
  };

  const handleColorChange = (colorKey, color) => {
    onStylingUpdate({
      ...styling,
      [colorKey]: color
    });
  };

  const renderColorPreview = () => {
    return (
      <Paper
        sx={{
          p: 3,
          backgroundColor: styling.backgroundColor,
          color: styling.primaryColor,
          fontFamily: styling.fontFamily,
          borderRadius: styling.borderRadius,
          border: `2px solid ${styling.primaryColor}`,
          textAlign: 'center'
        }}
      >
        <Typography variant="h6" sx={{ color: styling.primaryColor, mb: 1 }}>
          Form Preview
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          This is how your form will look
        </Typography>
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            sx={{
              backgroundColor: styling.primaryColor,
              borderRadius: styling.borderRadius,
              fontFamily: styling.fontFamily
            }}
          >
            Sample Button
          </Button>
        </Box>
      </Paper>
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Form Styling
      </Typography>

      <Grid container spacing={3}>
        {/* Theme Selection */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom color="primary">
            Theme
          </Typography>
          <Grid container spacing={2}>
            {themes.map((theme) => (
              <Grid item xs={12} sm={6} md={4} key={theme.value}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    border: styling.theme === theme.value ? 2 : 1,
                    borderColor: styling.theme === theme.value ? 'primary.main' : 'divider',
                    '&:hover': { borderColor: 'primary.main' }
                  }}
                  onClick={() => handleStylingChange('theme', theme.value)}
                >
                  <CardContent sx={{ p: 2 }}>
                    <Box
                      sx={{
                        height: 60,
                        backgroundColor: theme.preview.background,
                        border: `2px solid ${theme.preview.primary}`,
                        borderRadius: 1,
                        mb: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{ color: theme.preview.primary, fontWeight: 'bold' }}
                      >
                        Sample
                      </Typography>
                    </Box>
                    <Typography variant="body2" align="center">
                      {theme.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Colors */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom color="primary">
            Colors
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="color"
            label="Primary Color"
            value={styling.primaryColor}
            onChange={(e) => handleColorChange('primaryColor', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            type="color"
            label="Background Color"
            value={styling.backgroundColor}
            onChange={(e) => handleColorChange('backgroundColor', e.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Typography */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom color="primary">
            Typography
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControl fullWidth>
            <InputLabel>Font Family</InputLabel>
            <Select
              value={styling.fontFamily}
              label="Font Family"
              onChange={(e) => handleStylingChange('fontFamily', e.target.value)}
            >
              {fontFamilies.map((font) => (
                <MenuItem key={font.value} value={font.value}>
                  <Box sx={{ fontFamily: font.value }}>
                    {font.label}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Border Radius"
            value={styling.borderRadius}
            onChange={(e) => handleStylingChange('borderRadius', e.target.value)}
            placeholder="8px"
            helperText="e.g., 8px, 12px, 50%"
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Custom CSS */}
        <Grid item xs={12}>
          <Accordion expanded={customCSSOpen} onChange={() => setCustomCSSOpen(!customCSSOpen)}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CodeIcon />
                <Typography variant="h6">Custom CSS</Typography>
              </Box>
            </AccordionSummary>
            <AccordionDetails>
              <TextField
                fullWidth
                multiline
                rows={8}
                label="Custom CSS"
                value={styling.customCSS}
                onChange={(e) => handleStylingChange('customCSS', e.target.value)}
                placeholder="/* Add your custom CSS here */
.form-container {
  /* Your styles */
}"
                sx={{
                  '& .MuiInputBase-input': {
                    fontFamily: 'monospace',
                    fontSize: '0.875rem'
                  }
                }}
              />
              <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                Add custom CSS to further customize your form appearance
              </Typography>
            </AccordionDetails>
          </Accordion>
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Preview */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom color="primary">
            Preview
          </Typography>
          {renderColorPreview()}
        </Grid>
      </Grid>
    </Box>
  );
};

export default FormStyling;


