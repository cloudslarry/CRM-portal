import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
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
  Paper,
  CircularProgress,
  Snackbar
} from '@mui/material';
import {
  Send as SendIcon,
  CheckCircle as CheckCircleIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const PublicFormView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [form, setForm] = useState(null);
  const [formValues, setFormValues] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [error, setError] = useState(null);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    fetchForm();
  }, [id]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/forms/public/${id}`);
      setForm(response.data.data);
    } catch (error) {
      console.error('Error fetching form:', error);
      setError('Form not found or is not available');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldId, value) => {
    setFormValues(prev => ({
      ...prev,
      [fieldId]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form) return;

    // Validate required fields
    const requiredFields = form.fields.filter(field => field.required);
    const missingFields = requiredFields.filter(field => !formValues[field.id]);
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.map(f => f.label).join(', ')}`);
      return;
    }

    try {
      setSubmitting(true);
      
      const submissionData = {
        responses: form.fields.map(field => ({
          fieldId: field.id,
          fieldType: field.type,
          value: formValues[field.id] ?? (['checkbox'].includes(field.type) ? [] : '')
        })),
        completionTime: Math.floor((Date.now() - startTime) / 1000)
      };

      const studentToken = localStorage.getItem('studentToken');
      const hasAuth = Boolean(studentToken);
      const headers = hasAuth ? { Authorization: `Bearer ${studentToken.startsWith('Bearer ') ? studentToken.substring(7) : studentToken}` } : undefined;
      const url = hasAuth ? `/api/forms/${id}/submit` : `/api/forms/public/${id}/submit`;
      await axios.post(url, submissionData, { headers });
      
      setSubmitted(true);
      toast.success(form.settings?.successMessage || 'Thank you for your submission!');
    } catch (error) {
      console.error('Error submitting form:', error?.response?.data || error.message);
      const apiMsg = error?.response?.data?.message || 'Failed to submit form. Please try again.';
      toast.error(apiMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const commonProps = {
      fullWidth: true,
      required: field.required,
      value: formValues[field.id] || '',
      onChange: (e) => handleInputChange(field.id, e.target.value),
      sx: {
        fontFamily: form.styling?.fontFamily,
        '& .MuiOutlinedInput-root': {
          borderRadius: form.styling?.borderRadius
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
                fontFamily: form.styling?.fontFamily,
                '& .MuiOutlinedInput-root': {
                  borderRadius: form.styling?.borderRadius
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
                fontFamily: form.styling?.fontFamily,
                borderRadius: form.styling?.borderRadius
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

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Loading form...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error" sx={{ textAlign: 'center' }}>
          {error}
        </Alert>
        <Box sx={{ textAlign: 'center', mt: 2 }}>
          <Button
            variant="contained"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/')}
          >
            Go Back
          </Button>
        </Box>
      </Container>
    );
  }

  if (submitted) {
    return (
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Card sx={{ textAlign: 'center' }}>
          <CardContent sx={{ py: 6 }}>
            <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              {form.settings?.successMessage || 'Thank you for your submission!'}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              Your response has been recorded successfully.
            </Typography>
            <Button
              variant="contained"
              startIcon={<ArrowBackIcon />}
              onClick={() => navigate('/')}
            >
              Go Back
            </Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: form.styling?.borderRadius || '8px',
          border: `1px solid ${form.styling?.primaryColor || '#1976d2'}`,
          backgroundColor: form.styling?.backgroundColor || '#ffffff',
          fontFamily: form.styling?.fontFamily
        }}
      >
        {/* Form Header */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography
            variant="h4"
            gutterBottom
            sx={{
              color: form.styling?.primaryColor || '#1976d2',
              fontWeight: 'bold'
            }}
          >
            {form.title}
          </Typography>
          {form.description && (
            <Typography variant="body1" color="textSecondary">
              {form.description}
            </Typography>
          )}
        </Box>

        {/* Progress Bar */}
        {form.settings?.showProgressBar && form.fields?.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <LinearProgress
              variant="determinate"
              value={(currentStep / form.fields.length) * 100}
              sx={{
                height: 8,
                borderRadius: 4,
                backgroundColor: 'rgba(0,0,0,0.1)',
                '& .MuiLinearProgress-bar': {
                  backgroundColor: form.styling?.primaryColor || '#1976d2',
                  borderRadius: 4
                }
              }}
            />
            <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
              Step {currentStep + 1} of {form.fields.length}
            </Typography>
          </Box>
        )}

        {/* Form Fields */}
        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {form.fields?.map((field, index) => (
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
              startIcon={submitting ? <CircularProgress size={20} /> : <SendIcon />}
              disabled={submitting}
              sx={{
                backgroundColor: form.styling?.primaryColor || '#1976d2',
                borderRadius: form.styling?.borderRadius || '8px',
                fontFamily: form.styling?.fontFamily,
                px: 4,
                py: 1.5,
                '&:hover': {
                  backgroundColor: form.styling?.primaryColor || '#1976d2',
                  opacity: 0.9
                }
              }}
            >
              {submitting ? 'Submitting...' : (form.settings?.submitButtonText || 'Submit')}
            </Button>
          </Box>
        </form>

        {/* Custom CSS */}
        {form.styling?.customCSS && (
          <style>
            {form.styling.customCSS}
          </style>
        )}
      </Paper>
    </Container>
  );
};

export default PublicFormView;
