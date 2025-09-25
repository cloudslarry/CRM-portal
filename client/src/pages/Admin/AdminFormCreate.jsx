import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Alert,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import {
  Save as SaveIcon,
  Preview as PreviewIcon,
  Publish as PublishIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  Settings as SettingsIcon,
  Palette as PaletteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import axios from 'axios';
import FormFieldEditor from '../../components/FormBuilder/FormFieldEditor';
import FormPreview from '../../components/FormBuilder/FormPreview';
import FormSettings from '../../components/FormBuilder/FormSettings';
import FormStyling from '../../components/FormBuilder/FormStyling';

const AdminFormCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const admin = useSelector((state) => state.admin);

  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fields: [],
    settings: {
      allowMultipleSubmissions: true,
      requireAuthentication: false,
      collectEmail: false,
      showProgressBar: true,
      submitButtonText: 'Submit',
      successMessage: 'Thank you for your submission!',
      emailNotifications: { enabled: false, recipients: [] },
      spamProtection: { enabled: true, captcha: false },
      responseLimit: { enabled: false, maxResponses: 100 },
      timeLimit: { enabled: false, startDate: null, endDate: null }
    },
    styling: {
      theme: 'default',
      primaryColor: '#1976d2',
      backgroundColor: '#ffffff',
      fontFamily: 'Inter, sans-serif',
      borderRadius: '8px',
      customCSS: ''
    },
    visibility: 'private',
    accessControl: {
      allowedRoles: [],
      allowedUsers: []
    },
    tags: []
  });

  useEffect(() => {
    if (isEdit) {
      fetchForm();
    }
  }, [id, isEdit]);

  const fetchForm = async () => {
    try {
      setLoading(true);
      const rawToken = localStorage.getItem('adminToken');
      const token = rawToken && rawToken.startsWith('Bearer ') ? rawToken.substring(7) : rawToken;
      const response = await axios.get(`/api/forms/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFormData(response.data.data);
    } catch (error) {
      console.error('Error fetching form:', error);
      toast.error('Failed to fetch form');
      navigate('/admin/forms');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (publish = false) => {
    try {
      setSaving(true);
      const token = localStorage.getItem('adminToken');
      let formId = id; // Default to edit mode ID
      
      if (isEdit) {
        await axios.put(`/api/forms/${id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Form updated successfully');
      } else {
        const response = await axios.post('/api/forms', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        formId = response.data.data._id; // Set the new form ID
        toast.success('Form created successfully');
        if (!publish) {
          navigate(`/admin/forms/edit/${formId}`);
        }
      }

      if (publish) {
        await axios.patch(`/api/forms/${formId}/publish`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        toast.success('Form published successfully');
        navigate('/admin/forms');
      }
    } catch (error) {
      console.error('Error saving form:', error);
      toast.error('Failed to save form');
    } finally {
      setSaving(false);
    }
  };

  const handleFieldAdd = (fieldType) => {
    const newField = {
      id: `field_${Date.now()}`,
      type: fieldType,
      label: `New ${fieldType} field`,
      placeholder: '',
      required: false,
      options: fieldType === 'select' || fieldType === 'radio' || fieldType === 'checkbox' 
        ? [{ label: 'Option 1', value: 'option1' }] 
        : [],
      validation: {},
      properties: {},
      styling: {
        width: '100%',
        height: '',
        fontSize: '',
        color: '',
        backgroundColor: ''
      },
      conditionalLogic: {
        showIf: []
      }
    };

    setFormData(prev => ({
      ...prev,
      fields: [...prev.fields, newField]
    }));
  };

  const handleFieldUpdate = (fieldId, updates) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.map(field => 
        field.id === fieldId ? { ...field, ...updates } : field
      )
    }));
  };

  const handleFieldDelete = (fieldId) => {
    setFormData(prev => ({
      ...prev,
      fields: prev.fields.filter(field => field.id !== fieldId)
    }));
  };

  const handleFieldReorder = (fromIndex, toIndex) => {
    setFormData(prev => {
      const newFields = [...prev.fields];
      const [movedField] = newFields.splice(fromIndex, 1);
      newFields.splice(toIndex, 0, movedField);
      return {
        ...prev,
        fields: newFields
      };
    });
  };

  const handleFormDataUpdate = (updates) => {
    setFormData(prev => ({
      ...prev,
      ...updates
    }));
  };

  const tabs = [
    { label: 'Form Fields', icon: <AddIcon /> },
    { label: 'Settings', icon: <SettingsIcon /> },
    { label: 'Styling', icon: <PaletteIcon /> },
    { label: 'Preview', icon: <VisibilityIcon /> }
  ];

  if (loading) {
    return (
      <AdminLayout title={isEdit ? 'Edit Form' : 'Create New Form'}>
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
          <Typography variant="h4" gutterBottom>
            {isEdit ? 'Edit Form' : 'Create New Form'}
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
            <Typography>Loading...</Typography>
          </Box>
        </Container>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title={isEdit ? 'Edit Form' : 'Create New Form'}>
      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={() => navigate('/admin/forms')} sx={{ mr: 2 }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography variant="h4">
            {isEdit ? 'Edit Form' : 'Create New Form'}
          </Typography>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={() => handleSave(false)}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Draft'}
          </Button>
          <Button
            variant="contained"
            startIcon={<PublishIcon />}
            onClick={() => handleSave(true)}
            disabled={saving || formData.fields.length === 0}
          >
            {saving ? 'Publishing...' : 'Save & Publish'}
          </Button>
          <Button
            variant="outlined"
            startIcon={<PreviewIcon />}
            onClick={() => setPreviewOpen(true)}
          >
            Preview
          </Button>
        </Box>

        {/* Form Title and Description */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Form Title"
                  value={formData.title}
                  onChange={(e) => handleFormDataUpdate({ title: e.target.value })}
                  placeholder="Enter form title"
                />
              </Grid>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Visibility</InputLabel>
                  <Select
                    value={formData.visibility}
                    label="Visibility"
                    onChange={(e) => handleFormDataUpdate({ visibility: e.target.value })}
                  >
                    <MenuItem value="private">Private</MenuItem>
                    <MenuItem value="public">Public</MenuItem>
                    <MenuItem value="restricted">Restricted</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleFormDataUpdate({ description: e.target.value })}
                  placeholder="Enter form description (optional)"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Box>

      {/* Tabs */}
      <Card>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
            {tabs.map((tab, index) => (
              <Tab
                key={index}
                label={tab.label}
                icon={tab.icon}
                iconPosition="start"
              />
            ))}
          </Tabs>
        </Box>

        <CardContent sx={{ minHeight: 600 }}>
          {activeTab === 0 && (
            <FormFieldEditor
              fields={formData.fields}
              onFieldAdd={handleFieldAdd}
              onFieldUpdate={handleFieldUpdate}
              onFieldDelete={handleFieldDelete}
              onFieldReorder={handleFieldReorder}
            />
          )}
          {activeTab === 1 && (
            <FormSettings
              settings={formData.settings}
              onSettingsUpdate={(settings) => handleFormDataUpdate({ settings })}
            />
          )}
          {activeTab === 2 && (
            <FormStyling
              styling={formData.styling}
              onStylingUpdate={(styling) => handleFormDataUpdate({ styling })}
            />
          )}
          {activeTab === 3 && (
            <FormPreview
              formData={formData}
              onClose={() => setActiveTab(0)}
            />
          )}
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      <Dialog
        open={previewOpen}
        onClose={() => setPreviewOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Form Preview</DialogTitle>
        <DialogContent>
          <FormPreview formData={formData} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
      </Container>
    </AdminLayout>
  );
};

export default AdminFormCreate;
