import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Chip,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Paper
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  DragIndicator as DragIcon,
  ExpandMore as ExpandMoreIcon,
  Edit as EditIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

const fieldTypes = [
  { type: 'text', label: 'Text Input', icon: '📝' },
  { type: 'email', label: 'Email', icon: '📧' },
  { type: 'number', label: 'Number', icon: '🔢' },
  { type: 'textarea', label: 'Text Area', icon: '📄' },
  { type: 'select', label: 'Dropdown', icon: '📋' },
  { type: 'radio', label: 'Radio Buttons', icon: '🔘' },
  { type: 'checkbox', label: 'Checkboxes', icon: '☑️' },
  { type: 'date', label: 'Date', icon: '📅' },
  { type: 'time', label: 'Time', icon: '⏰' },
  { type: 'file', label: 'File Upload', icon: '📎' },
  { type: 'rating', label: 'Rating', icon: '⭐' },
  { type: 'signature', label: 'Signature', icon: '✍️' }
];

const FormFieldEditor = ({
  fields,
  onFieldAdd,
  onFieldUpdate,
  onFieldDelete,
  onFieldReorder
}) => {
  const [selectedField, setSelectedField] = useState(null);
  const [fieldDialog, setFieldDialog] = useState(false);
  const [fieldTypeDialog, setFieldTypeDialog] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event) => {
    const { active, over } = event;
    
    if (active.id !== over.id) {
      const oldIndex = fields.findIndex(field => field.id === active.id);
      const newIndex = fields.findIndex(field => field.id === over.id);
      
      onFieldReorder(oldIndex, newIndex);
    }
  };

  const handleFieldClick = (field) => {
    setSelectedField(field);
    setFieldDialog(true);
  };

  const handleFieldSave = (updates) => {
    onFieldUpdate(selectedField.id, updates);
    setFieldDialog(false);
    setSelectedField(null);
  };

  const handleAddField = (fieldType) => {
    onFieldAdd(fieldType);
    setFieldTypeDialog(false);
  };

  const renderFieldPreview = (field) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <TextField
            fullWidth
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            disabled
            size="small"
          />
        );
      case 'textarea':
        return (
          <TextField
            fullWidth
            multiline
            rows={3}
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            disabled
            size="small"
          />
        );
      case 'select':
        return (
          <FormControl fullWidth disabled size="small">
            <InputLabel>{field.label}</InputLabel>
            <Select value="">
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
            <Typography variant="body2" sx={{ mb: 1 }}>
              {field.label} {field.required && '*'}
            </Typography>
            {field.options?.map((option, index) => (
              <FormControlLabel
                key={index}
                control={<input type="radio" disabled />}
                label={option.label}
              />
            ))}
          </Box>
        );
      case 'checkbox':
        return (
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {field.label} {field.required && '*'}
            </Typography>
            {field.options?.map((option, index) => (
              <FormControlLabel
                key={index}
                control={<input type="checkbox" disabled />}
                label={option.label}
              />
            ))}
          </Box>
        );
      case 'date':
        return (
          <TextField
            fullWidth
            type="date"
            label={field.label}
            required={field.required}
            disabled
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        );
      case 'time':
        return (
          <TextField
            fullWidth
            type="time"
            label={field.label}
            required={field.required}
            disabled
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        );
      case 'file':
        return (
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {field.label} {field.required && '*'}
            </Typography>
            <Button variant="outlined" disabled size="small">
              Choose File
            </Button>
          </Box>
        );
      case 'rating':
        return (
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {field.label} {field.required && '*'}
            </Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <Typography key={star} sx={{ color: 'text.disabled' }}>
                  ⭐
                </Typography>
              ))}
            </Box>
          </Box>
        );
      case 'signature':
        return (
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {field.label} {field.required && '*'}
            </Typography>
            <Paper
              sx={{
                height: 100,
                border: '2px dashed',
                borderColor: 'divider',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'text.secondary'
              }}
            >
              <Typography variant="body2">Signature Pad</Typography>
            </Paper>
          </Box>
        );
      default:
        return (
          <TextField
            fullWidth
            label={field.label}
            placeholder={field.placeholder}
            required={field.required}
            disabled
            size="small"
          />
        );
    }
  };

  return (
    <Box>
      {/* Add Field Button */}
      <Box sx={{ mb: 3, textAlign: 'center' }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setFieldTypeDialog(true)}
          sx={{ borderRadius: 2 }}
        >
          Add Field
        </Button>
      </Box>

      {/* Fields List */}
      {fields.length === 0 ? (
        <Paper
          sx={{
            p: 4,
            textAlign: 'center',
            border: '2px dashed',
            borderColor: 'divider',
            backgroundColor: 'grey.50'
          }}
        >
          <Typography variant="h6" color="textSecondary" gutterBottom>
            No fields added yet
          </Typography>
          <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
            Click "Add Field" to start building your form
          </Typography>
        </Paper>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext items={fields.map(f => f.id)} strategy={verticalListSortingStrategy}>
            {fields.map((field) => (
              <SortableFieldItem
                key={field.id}
                field={field}
                onFieldClick={handleFieldClick}
                onFieldDelete={onFieldDelete}
                renderFieldPreview={renderFieldPreview}
                fieldTypes={fieldTypes}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}

      {/* Field Type Selection Dialog */}
      <Dialog open={fieldTypeDialog} onClose={() => setFieldTypeDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Select Field Type</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            {fieldTypes.map((fieldType) => (
              <Grid item xs={12} sm={6} md={4} key={fieldType.type}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    '&:hover': { backgroundColor: 'action.hover' },
                    transition: 'background-color 0.2s'
                  }}
                  onClick={() => handleAddField(fieldType.type)}
                >
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" sx={{ mb: 1 }}>
                      {fieldType.icon}
                    </Typography>
                    <Typography variant="body1">
                      {fieldType.label}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFieldTypeDialog(false)}>Cancel</Button>
        </DialogActions>
      </Dialog>

      {/* Field Editor Dialog */}
      {selectedField && (
        <FieldEditorDialog
          field={selectedField}
          open={fieldDialog}
          onClose={() => {
            setFieldDialog(false);
            setSelectedField(null);
          }}
          onSave={handleFieldSave}
        />
      )}
    </Box>
  );
};

// Field Editor Dialog Component
const FieldEditorDialog = ({ field, open, onClose, onSave }) => {
  const [fieldData, setFieldData] = useState(field);

  useEffect(() => {
    setFieldData(field);
  }, [field]);

  const handleSave = () => {
    onSave(fieldData);
  };

  const handleOptionAdd = () => {
    const newOption = { label: '', value: '' };
    setFieldData(prev => ({
      ...prev,
      options: [...(prev.options || []), newOption]
    }));
  };

  const handleOptionUpdate = (index, updates) => {
    setFieldData(prev => ({
      ...prev,
      options: prev.options.map((option, i) => 
        i === index ? { ...option, ...updates } : option
      )
    }));
  };

  const handleOptionDelete = (index) => {
    setFieldData(prev => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index)
    }));
  };

  const hasOptions = ['select', 'radio', 'checkbox'].includes(field.type);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Edit Field</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Field Label"
              value={fieldData.label}
              onChange={(e) => setFieldData(prev => ({ ...prev, label: e.target.value }))}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Placeholder"
              value={fieldData.placeholder}
              onChange={(e) => setFieldData(prev => ({ ...prev, placeholder: e.target.value }))}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={fieldData.required}
                  onChange={(e) => setFieldData(prev => ({ ...prev, required: e.target.checked }))}
                />
              }
              label="Required field"
            />
          </Grid>

          {hasOptions && (
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Options
              </Typography>
              {fieldData.options?.map((option, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2, mb: 2, alignItems: 'center' }}>
                  <TextField
                    label="Label"
                    value={option.label}
                    onChange={(e) => handleOptionUpdate(index, { label: e.target.value })}
                    size="small"
                  />
                  <TextField
                    label="Value"
                    value={option.value}
                    onChange={(e) => handleOptionUpdate(index, { value: e.target.value })}
                    size="small"
                  />
                  <IconButton onClick={() => handleOptionDelete(index)} color="error">
                    <DeleteIcon />
                  </IconButton>
                </Box>
              ))}
              <Button startIcon={<AddIcon />} onClick={handleOptionAdd}>
                Add Option
              </Button>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave} variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Sortable Field Item Component
const SortableFieldItem = ({ field, onFieldClick, onFieldDelete, renderFieldPreview, fieldTypes }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: field.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card
      ref={setNodeRef}
      style={style}
      sx={{
        mb: 2,
        cursor: 'grab',
        '&:hover': { boxShadow: 2 },
        transition: 'all 0.2s ease'
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box
            {...attributes}
            {...listeners}
            sx={{
              display: 'flex',
              alignItems: 'center',
              cursor: 'grab',
              color: 'text.secondary',
              '&:hover': { color: 'text.primary' }
            }}
          >
            <DragIcon />
          </Box>
          
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Chip
                label={fieldTypes.find(ft => ft.type === field.type)?.label || field.type}
                size="small"
                color="primary"
                variant="outlined"
              />
              {field.required && (
                <Chip label="Required" size="small" color="error" />
              )}
              <Typography variant="body2" color="textSecondary">
                {field.label}
              </Typography>
            </Box>
            
            {renderFieldPreview(field)}
          </Box>
          
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <IconButton
              size="small"
              onClick={() => onFieldClick(field)}
              color="primary"
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onFieldDelete(field.id)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default FormFieldEditor;
