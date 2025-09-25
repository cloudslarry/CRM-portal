# Form Builder Feature

A comprehensive form builder system similar to Ikiform, integrated into the CRM portal. This feature allows administrators and faculty to create, manage, and analyze custom forms with advanced functionality.

## Features

### 🎨 **Form Builder Interface**
- **Drag & Drop Editor**: Intuitive drag-and-drop interface for building forms
- **Multiple Field Types**: Support for 12+ field types including text, email, number, textarea, select, radio, checkbox, date, time, file upload, rating, and signature
- **Real-time Preview**: Live preview of forms as you build them
- **Custom Styling**: Advanced theming and customization options
- **Form Settings**: Comprehensive configuration options for form behavior

### 📊 **Analytics & Insights**
- **Submission Analytics**: Track form views, submissions, and conversion rates
- **Response Analysis**: Detailed breakdown of field responses
- **Device Analytics**: Track submissions by device type
- **Spam Protection**: Built-in spam detection and filtering
- **Export Functionality**: Export form data and analytics

### 🔐 **Security & Permissions**
- **Role-based Access**: Only administrators and faculty can create forms
- **Access Control**: Public, private, and restricted form visibility
- **Authentication**: Optional authentication requirements
- **Spam Protection**: Multiple layers of spam prevention

### 🎯 **Advanced Features**
- **Conditional Logic**: Show/hide fields based on responses
- **Multi-step Forms**: Support for multi-step form flows
- **File Uploads**: Secure file upload handling
- **Email Notifications**: Automated email notifications
- **Response Limits**: Set maximum response limits
- **Time Limits**: Schedule form availability
- **Custom CSS**: Advanced styling capabilities

## Field Types Supported

1. **Text Input** - Single line text input
2. **Email** - Email validation included
3. **Number** - Numeric input with validation
4. **Textarea** - Multi-line text input
5. **Dropdown** - Single selection from options
6. **Radio Buttons** - Single selection from multiple options
7. **Checkboxes** - Multiple selection from options
8. **Date** - Date picker input
9. **Time** - Time picker input
10. **File Upload** - File attachment with type restrictions
11. **Rating** - Star rating system
12. **Signature** - Digital signature capture

## Form Settings

### General Settings
- Allow multiple submissions
- Require authentication
- Collect email addresses
- Show progress bar
- Custom submit button text
- Success message customization
- Redirect URL after submission

### Email Notifications
- Enable/disable email notifications
- Configure notification recipients
- Custom email templates

### Spam Protection
- Enable spam protection
- CAPTCHA integration
- Automatic spam detection
- Response filtering

### Response Limits
- Set maximum response limits
- Time-based availability
- Start and end date scheduling

### Styling Options
- Multiple pre-built themes
- Custom color schemes
- Font family selection
- Border radius customization
- Custom CSS support

## API Endpoints

### Form Management
- `POST /api/forms` - Create new form
- `GET /api/forms` - Get user's forms
- `GET /api/forms/:id` - Get specific form
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form
- `PATCH /api/forms/:id/publish` - Publish form

### Form Submissions
- `POST /api/forms/:id/submit` - Submit form response
- `GET /api/forms/:id/submissions` - Get form submissions
- `GET /api/forms/:id/analytics` - Get form analytics

### Public Access
- `GET /api/forms/public/:id` - Get public form
- `POST /api/forms/public/:id/submit` - Submit to public form

## Database Models

### Form Model
- Form metadata (title, description, status)
- Field definitions with validation rules
- Styling and theming options
- Access control settings
- Analytics tracking
- Creator information

### FormSubmission Model
- Response data for each field
- Submission metadata (IP, user agent, device)
- Completion time tracking
- Spam score calculation
- Review status and notes
- File attachments

## User Interface

### Admin Interface
- **Form Builder Dashboard**: Overview of all forms with statistics
- **Form Editor**: Comprehensive form creation and editing interface
- **Analytics Dashboard**: Detailed analytics and insights
- **Submission Management**: View and manage form responses

### Faculty Interface
- **Simplified Form Builder**: Streamlined interface for faculty
- **Form Management**: Create and manage forms
- **Basic Analytics**: View form performance

### Public Interface
- **Form Filling**: Clean, responsive form interface
- **Mobile Optimized**: Works seamlessly on all devices
- **Progress Tracking**: Visual progress indicators
- **Validation**: Real-time form validation

## Navigation Integration

### Admin Sidebar
- Form Builder section with:
  - All Forms
  - Create Form
  - Form Analytics

### Faculty Sidebar
- Form Builder menu item
- Direct access to form management

## Installation & Setup

### Dependencies
```bash
# Frontend dependencies
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities recharts

# Backend dependencies (already included)
mongoose express
```

### Database
The form builder uses MongoDB with the following collections:
- `forms` - Form definitions and metadata
- `formsubmissions` - Form response data

### Configuration
No additional configuration required. The form builder integrates seamlessly with the existing CRM portal authentication and theming system.

## Usage

### Creating a Form
1. Navigate to Form Builder in the admin or faculty sidebar
2. Click "Create New Form"
3. Add form title and description
4. Drag and drop fields from the field palette
5. Configure field properties and validation
6. Set form settings and styling
7. Preview and test the form
8. Save and publish

### Managing Forms
- View all forms in the dashboard
- Edit, duplicate, or delete forms
- View analytics and submissions
- Share forms via public links

### Filling Forms
- Access forms via public links
- Fill out forms with real-time validation
- Submit responses securely
- Receive confirmation messages

## Security Features

- **Role-based Access Control**: Only authorized users can create forms
- **Input Validation**: Server-side validation for all form inputs
- **Spam Protection**: Multiple layers of spam detection
- **File Upload Security**: Secure file handling with type restrictions
- **Rate Limiting**: Protection against abuse
- **Data Encryption**: Secure storage of sensitive data

## Performance

- **Optimized Queries**: Efficient database queries with proper indexing
- **Caching**: Form data caching for improved performance
- **Lazy Loading**: Components load only when needed
- **Responsive Design**: Optimized for all screen sizes

## Future Enhancements

- **Advanced Analytics**: More detailed reporting and insights
- **Form Templates**: Pre-built form templates
- **Integration APIs**: Connect with external services
- **Advanced Conditional Logic**: More complex field dependencies
- **Multi-language Support**: Internationalization
- **Advanced File Handling**: Cloud storage integration
- **Form Versioning**: Track form changes over time

## Support

For technical support or feature requests, please contact the development team or create an issue in the project repository.

---

**Note**: This form builder is designed to be a comprehensive solution similar to Ikiform, providing all the essential features needed for creating and managing custom forms within the CRM portal ecosystem.


