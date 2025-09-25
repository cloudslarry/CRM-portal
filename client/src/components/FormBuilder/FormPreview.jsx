import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Radio,
  Checkbox,
  FormGroup,
  LinearProgress,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import {
  Send as SendIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';

const FormPreview = ({ formData, onClose }) => {
  const [formValues, setFormValues] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const handleInputChange = (fieldId, value) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    // In a real implementation, this would submit to the API
    console.log('Form submitted:', formValues);
  };

  const renderField = (field) => {
    const commonProps = {
      fullWidth: true,
      required: field.required,
      value: formValues[field.id] || '',
      onChange: (e) => handleInputChange(field.id, e.target.value),
      sx: {
        fontFamily: formData.styling?.fontFamily,
        '& .MuiOutlinedInput-root': {
          borderRadius: formData.styling?.borderRadius
        }
      }
    };

    switch (field.type) {
      case 'text':
        return (
          <TextField
            {...commonProps}
            label={field.label}
            placeholder={field.placeholder}
            type="text"
          />
        );

      case 'email':
        return (
          <TextField
            {...commonProps}
            label={field.label}
            placeholder={field.placeholder}
            type="email"
          />
        );

      case 'number':
        return (
          <TextField
            {...commonProps}
            label={field.label}
            placeholder={field.placeholder}
            type="number"
            inputProps={field.properties}
          />
        );

      case 'textarea':
        return (
          <TextField
            {...commonProps}
            label={field.label}
            placeholder={field.placeholder}
            multiline
            rows={field.properties?.rows || 3}
          />
        );

      case 'select':
        return (
          <FormControl fullWidth required={field.required}>
            <InputLabel>{field.label}</InputLabel>
            <Select
              value={formValues[field.id] || ''}
              label={field.label}
              onChange={(e) => handleInputChange(field.id, e.target.value)}
              sx={{
                fontFamily: formData.styling?.fontFamily,
                '& .MuiOutlinedInput-root': {
                  borderRadius: formData.styling?.borderRadius
                }
              }}
            >
              {field.options?.map((option, index) => (
                <MenuItem key={index} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case 'radio':
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: field.required ? 'bold' : 'normal' }}>
              {field.label} {field.required && '*'}
            </Typography>
            <FormControl component="fieldset">
              {field.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Radio
                      checked={formValues[field.id] === option.value}
                      onChange={(e) => handleInputChange(field.id, e.target.value)}
                      value={option.value}
                    />
                  }
                  label={option.label}
                />
              ))}
            </FormControl>
          </Box>
        );

      case 'checkbox':
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: field.required ? 'bold' : 'normal' }}>
              {field.label} {field.required && '*'}
            </Typography>
            <FormGroup>
              {field.options?.map((option, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={formValues[field.id]?.includes(option.value) || false}
                      onChange={(e) => {
                        const currentValues = formValues[field.id] || [];
                        const newValues = e.target.checked
                          ? [...currentValues, option.value]
                          : currentValues.filter(v => v !== option.value);
                        handleInputChange(field.id, newValues);
                      }}
                    />
                  }
                  label={option.label}
                />
              ))}
            </FormGroup>
          </Box>
        );

      case 'date':
        return (
          <TextField
            {...commonProps}
            label={field.label}
            type="date"
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'time':
        return (
          <TextField
            {...commonProps}
            label={field.label}
            type="time"
            InputLabelProps={{ shrink: true }}
          />
        );

      case 'file':
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: field.required ? 'bold' : 'normal' }}>
              {field.label} {field.required && '*'}
            </Typography>
            <Button
              variant="outlined"
              component="label"
              sx={{
                fontFamily: formData.styling?.fontFamily,
                borderRadius: formData.styling?.borderRadius
              }}
            >
              Choose File
              <input
                type="file"
                hidden
                accept={field.properties?.accept}
                onChange={(e) => handleInputChange(field.id, e.target.files[0])}
              />
            </Button>
          </Box>
        );

      case 'rating':
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: field.required ? 'bold' : 'normal' }}>
              {field.label} {field.required && '*'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Typography
                  key={star}
                  sx={{
                    fontSize: '2rem',
                    cursor: 'pointer',
                    color: star <= (formValues[field.id] || 0) ? '#ffc107' : '#e0e0e0',
                    '&:hover': { color: '#ffc107' }
                  }}
                  onClick={() => handleInputChange(field.id, star)}
                >
                  ⭐
                </Typography>
              ))}
            </Box>
          </Box>
        );

      case 'signature':
        return (
          <Box>
            <Typography variant="body1" sx={{ mb: 1, fontWeight: field.required ? 'bold' : 'normal' }}>
              {field.label} {field.required && '*'}
            </Typography>
            <Paper
              sx={{
                height: 120,
                border: '2px dashed',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary',
                cursor: 'pointer',
                '&:hover': { borderColor: 'primary.main' }
              }}
              onClick={() => handleInputChange(field.id, 'signature_placeholder')}
            >
              <Typography variant="body2">
                {formValues[field.id] ? 'Signature captured' : 'Click to sign'}
              </Typography>
            </Paper>
          </Box>
        );

      default:
        return (
          <TextField
            {...commonProps}
            label={field.label}
            placeholder={field.placeholder}
          />
        );
    }
  };

  if (submitted) {
    return (
      <Card sx={{ maxWidth: 600, mx: 'auto', textAlign: 'center' }}>
        <CardContent sx={{ py: 6 }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            {formData.settings?.successMessage || 'Thank you for your submission!'}
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
            Your response has been recorded successfully.
          </Typography>
          {onClose && (
            <Button variant="contained" onClick={onClose}>
              Close Preview
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: 'auto',
        p: 3,
        backgroundColor: formData.styling?.backgroundColor || '#ffffff',
        fontFamily: formData.styling?.fontFamily
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 4,
          borderRadius: formData.styling?.borderRadius || '8px',
          border: `1px solid ${formData.styling?.primaryColor || '#1976d2'}`,
          position: 'relative'
        }}
      >
        {/* Form Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              color: formData.styling?.primaryColor || '#1976d2',
              fontWeight: 'bold'
            }}
          >
            {formData.title || 'Untitled Form'}
          </Typography>
          {formData.description && (
            <Typography variant="body1" color="textSecondary">
              {formData.description}
            </Typography>
          )}
        </Box>

        {/* Progress Bar */}
        {formData.settings?.showProgressBar && formData.fields?.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <LinearProgress
              variant="determinate"
              value={(currentStep / formData.fields.length) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: formData.styling?.primaryColor || '#1976d2',
                  borderRadius: 4
                }
              }}
            />
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              Step {currentStep + 1} of {formData.fields.length}
            </Typography>
          </Box>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {formData.fields?.map((field, index) => (
              <Box key={field.id}>
                {renderField(field)}
              </Box>
            ))}
          </Box>

          {/* Submit Button */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<SendIcon />}
              sx={{
                backgroundColor: formData.styling?.primaryColor || '#1976d2',
                borderRadius: formData.styling?.borderRadius || '8px',
                fontFamily: formData.styling?.fontFamily,
                px: 4,
                py: 1.5,
                '&:hover': {
                  backgroundColor: formData.styling?.primaryColor || '#1976d2',
                  opacity: 0.9
                }
              }}
            >
              {formData.settings?.submitButtonText || 'Submit'}
            </Button>
          </Box>
        </form>

        {/* Custom CSS */}
        {formData.styling?.customCSS && (
          <style>
            {formData.styling.customCSS}
          </style>
        )}
      </Paper>
    </Box>
  );
};

export default FormPreview;


