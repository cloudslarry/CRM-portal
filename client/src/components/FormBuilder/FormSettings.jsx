import React, { useState } from 'react';
import {
  Box,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Switch,
  FormControlLabel,
  Divider,
  Typography,
  Chip,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Email as EmailIcon
} from '@mui/icons-material';

const FormSettings = ({ settings, onSettingsUpdate }) => {
  const [newEmail, setNewEmail] = useState('');
  const handleSettingChange = (key, value) => {
    onSettingsUpdate({
      ...settings,
      [key]: value
    });
  };

  const handleNestedSettingChange = (parentKey, childKey, value) => {
    onSettingsUpdate({
      ...settings,
      [parentKey]: {
        ...settings[parentKey],
        [childKey]: value
      }
    });
  };

  const handleEmailAdd = (email) => {
    if (email && !settings.emailNotifications.recipients.includes(email)) {
      handleNestedSettingChange('emailNotifications', 'recipients', [
        ...settings.emailNotifications.recipients,
        email
      ]);
    }
  };

  const handleEmailRemove = (email) => {
    handleNestedSettingChange('emailNotifications', 'recipients', 
      settings.emailNotifications.recipients.filter(e => e !== email)
    );
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Form Settings
      </Typography>

      <Grid container spacing={3}>
        {/* General Settings */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom color="primary">
            General Settings
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.allowMultipleSubmissions}
                onChange={(e) => handleSettingChange('allowMultipleSubmissions', e.target.checked)}
              />
            }
            label="Allow multiple submissions"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.requireAuthentication}
                onChange={(e) => handleSettingChange('requireAuthentication', e.target.checked)}
              />
            }
            label="Require authentication"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.collectEmail}
                onChange={(e) => handleSettingChange('collectEmail', e.target.checked)}
              />
            }
            label="Collect email address"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.showProgressBar}
                onChange={(e) => handleSettingChange('showProgressBar', e.target.checked)}
              />
            }
            label="Show progress bar"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Submit button text"
            value={settings.submitButtonText}
            onChange={(e) => handleSettingChange('submitButtonText', e.target.value)}
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Success message"
            value={settings.successMessage}
            onChange={(e) => handleSettingChange('successMessage', e.target.value)}
            multiline
            rows={2}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Redirect URL (optional)"
            value={settings.redirectUrl || ''}
            onChange={(e) => handleSettingChange('redirectUrl', e.target.value)}
            placeholder="https://example.com/thank-you"
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Email Notifications */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom color="primary">
            Email Notifications
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.emailNotifications.enabled}
                onChange={(e) => handleNestedSettingChange('emailNotifications', 'enabled', e.target.checked)}
              />
            }
            label="Enable email notifications"
          />
        </Grid>

        {settings.emailNotifications.enabled && (
          <Grid item xs={12}>
            <Typography variant="subtitle2" gutterBottom>
              Notification Recipients
            </Typography>
            <List dense>
              {settings.emailNotifications.recipients.map((email, index) => (
                <ListItem key={index}>
                  <ListItemText primary={email} />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      onClick={() => handleEmailRemove(email)}
                      size="small"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
            </List>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <TextField
                size="small"
                placeholder="Enter email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleEmailAdd(newEmail.trim());
                    setNewEmail('');
                  }
                }}
              />
              <IconButton
                onClick={() => {
                  handleEmailAdd(newEmail.trim());
                  setNewEmail('');
                }}
              >
                <AddIcon />
              </IconButton>
            </Box>
          </Grid>
        )}

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Spam Protection */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom color="primary">
            Spam Protection
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.spamProtection.enabled}
                onChange={(e) => handleNestedSettingChange('spamProtection', 'enabled', e.target.checked)}
              />
            }
            label="Enable spam protection"
          />
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.spamProtection.captcha}
                onChange={(e) => handleNestedSettingChange('spamProtection', 'captcha', e.target.checked)}
                disabled={!settings.spamProtection.enabled}
              />
            }
            label="Enable CAPTCHA"
          />
        </Grid>

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Response Limits */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom color="primary">
            Response Limits
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.responseLimit.enabled}
                onChange={(e) => handleNestedSettingChange('responseLimit', 'enabled', e.target.checked)}
              />
            }
            label="Enable response limit"
          />
        </Grid>

        {settings.responseLimit.enabled && (
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              type="number"
              label="Maximum responses"
              value={settings.responseLimit.maxResponses}
              onChange={(e) => handleNestedSettingChange('responseLimit', 'maxResponses', parseInt(e.target.value))}
              inputProps={{ min: 1 }}
            />
          </Grid>
        )}

        <Grid item xs={12}>
          <Divider sx={{ my: 2 }} />
        </Grid>

        {/* Time Limits */}
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom color="primary">
            Time Limits
          </Typography>
        </Grid>

        <Grid item xs={12} md={6}>
          <FormControlLabel
            control={
              <Switch
                checked={settings.timeLimit.enabled}
                onChange={(e) => handleNestedSettingChange('timeLimit', 'enabled', e.target.checked)}
              />
            }
            label="Enable time limit"
          />
        </Grid>

        {settings.timeLimit.enabled && (
          <>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="Start date and time"
                value={settings.timeLimit.startDate ? new Date(settings.timeLimit.startDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleNestedSettingChange('timeLimit', 'startDate', e.target.value ? new Date(e.target.value) : null)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                type="datetime-local"
                label="End date and time"
                value={settings.timeLimit.endDate ? new Date(settings.timeLimit.endDate).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleNestedSettingChange('timeLimit', 'endDate', e.target.value ? new Date(e.target.value) : null)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </>
        )}
      </Grid>
    </Box>
  );
};

export default FormSettings;


