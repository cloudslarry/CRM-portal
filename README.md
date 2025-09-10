# CRM Portal - College Management System

A comprehensive College Management System with admission processing, student management, faculty administration, and real-time communication features.

## 🚀 Features

### Core Modules
- **Student Management**: Registration, profiles, attendance, performance tracking
- **Faculty Management**: Faculty profiles, course management, grade uploads
- **Admin Dashboard**: Complete system administration and analytics
- **Admission System**: Public application submission with admin approval workflow
- **Real-time Chat**: WebSocket-based messaging between students and faculty
- **Notification System**: Real-time notifications for all users

### Admission System
- **Public Application**: Anyone can apply without registration
- **Applicant Authentication**: OTP-based registration and login
- **Admin Review**: Approve/reject applications with notes
- **Status Tracking**: Check application status using admission ID (admid)
- **Course Information**: View available courses and fee structure
- **College Information**: Access college details and facilities

## 🛠️ Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Passport.js** for authentication strategies
- **WebSocket** for real-time communication
- **Multer** for file uploads
- **Nodemailer** for email services

### Frontend
- **React.js** with functional components
- **Material-UI (MUI)** for UI components
- **Redux** for state management
- **React Router** for navigation
- **Axios** for API calls

## 📁 Project Structure

```
CRM-portal/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── redux/          # State management
│   │   ├── config/         # Configuration files
│   │   └── services/       # API services
├── server/                 # Node.js backend
│   ├── controllers/        # Route controllers
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Custom middleware
│   ├── utils/             # Utility functions
│   └── websocket/         # WebSocket server
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CRM-portal
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**
   ```bash
   cd ../client
   npm install
   ```

4. **Environment Setup**
   
   Create `.env` file in the server directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/crm-portal
   SECRET_OR_KEY=your-secret-key
   PORT=5000
   ```

5. **Start the application**
   
   **Terminal 1 - Start Server:**
   ```bash
   cd server
   npm start
   ```
   
   **Terminal 2 - Start Client:**
   ```bash
   cd client
   npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 👥 User Roles & Access

### 1. Admin
- **Login**: `/admin/login`
- **Features**:
  - Manage students, faculty, and subjects
  - Review and approve admission applications
  - View analytics and statistics
  - Send notifications
  - System configuration

### 2. Faculty
- **Login**: `/` (Faculty tab)
- **Features**:
  - Upload student marks
  - Manage attendance
  - Chat with students
  - View notifications
  - Update profile

### 3. Student
- **Login**: `/` (Student tab)
- **Features**:
  - View performance and attendance
  - Chat with faculty
  - Apply for admission (if not enrolled)
  - Update profile
  - View notifications

### 4. Applicant (Public)
- **Registration**: `/applicant/auth`
- **Features**:
  - Apply for admission
  - Check application status
  - View courses and fees
  - View college information

## 📋 Admission System Workflow

### For Applicants
1. **Register/Login**: Visit `/applicant/auth`
2. **Apply**: Submit application at `/admissions/apply`
3. **Track**: Check status at `/admissions/status` using admission ID
4. **Browse**: View courses at `/courses` and college info at `/college`

### For Admins
1. **Review**: Access applications at `/admin/admissions`
2. **Approve/Reject**: Make decisions with optional notes
3. **Monitor**: Track application statistics

## 🔌 API Endpoints

### Authentication
```
POST /api/admin/login
POST /api/faculty/login
POST /api/student/login
POST /api/applicant/register
POST /api/applicant/verify
```

### Admissions
```
POST /api/admissions/apply          # Public application
GET  /api/admissions/status         # Check status
POST /api/applicant/admissions      # Submit (authenticated)
GET  /api/applicant/admissions      # List applications
GET  /api/admin/admissions          # Admin view
POST /api/admin/admissions/:id/approve
POST /api/admin/admissions/:id/reject
```

### Public Information
```
GET /api/public/courses
GET /api/public/college-info
```

### Student Management
```
GET  /api/student/dashboard
GET  /api/student/notifications
PUT  /api/student/notifications/:id/read
POST /api/student/updateProfile
```

### Faculty Management
```
GET  /api/faculty/dashboard
POST /api/faculty/marks
GET  /api/faculty/attendance
```

### Admin Management
```
GET  /api/admin/dashboard
GET  /api/admin/statistics
POST /api/admin/addStudent
POST /api/admin/addFaculty
POST /api/admin/addSubject
```

## 🗄️ Database Models

### Core Models
- **Student**: Student information and academic data
- **Faculty**: Faculty profiles and course assignments
- **Admin**: Administrative user accounts
- **Subject**: Course and subject information
- **Attendance**: Student attendance records
- **Marks**: Student performance data
- **Message**: Chat messages
- **Notification**: System notifications

### Admission Models
- **Applicant**: Public applicant accounts
- **AdmissionApplication**: Application submissions with auto-generated admission IDs

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- OTP verification for applicants
- Protected routes with Passport.js
- Input validation and sanitization
- CORS configuration

## 📱 Real-time Features

- **WebSocket Chat**: Real-time messaging between users
- **Notifications**: Instant notification delivery
- **Live Updates**: Real-time status updates

## 🎨 UI/UX Features

- **Responsive Design**: Mobile-friendly interface
- **Dark/Light Theme**: User preference support
- **Material Design**: Modern UI components
- **Sidebar Navigation**: Role-based navigation
- **Toast Notifications**: User feedback
- **Loading States**: Better user experience

## 🚀 Deployment

### Production Setup
1. Set up MongoDB Atlas or production MongoDB
2. Configure environment variables
3. Build the React app: `npm run build`
4. Deploy server to your preferred platform
5. Serve static files from the build directory

### Environment Variables
```env
NODE_ENV=production
MONGO_URI=your-production-mongodb-uri
SECRET_OR_KEY=your-production-secret
PORT=5000
CLOUDINARY_CLOUD_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-cloudinary-key
CLOUDINARY_API_SECRET=your-cloudinary-secret
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the API endpoints

## 🔄 Recent Updates

- ✅ Added comprehensive admission system
- ✅ Implemented OTP-based applicant authentication
- ✅ Created public application pages with sidebar navigation
- ✅ Added automatic admission ID generation
- ✅ Integrated admin approval workflow
- ✅ Added course and college information pages
- ✅ Implemented status tracking system

---

**Built with ❤️ for educational institutions**
