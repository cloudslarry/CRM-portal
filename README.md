# 🎓 SIH 2025 - ERP-based Integrated Student Management System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green.svg)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express-4.18+-lightgrey.svg)](https://expressjs.com/)

A comprehensive **Enterprise Resource Planning (ERP) system** designed for educational institutions to manage students, faculty, academics, hostels, and administrative operations efficiently. Built for **Smart India Hackathon 2025**.

## 🌟 Key Features

### 👥 Multi-Role Management
- **Admin Dashboard**: Complete system oversight and management
- **Faculty Portal**: Academic management, attendance, and grading
- **Student Portal**: Academic records, performance tracking, and communication
- **Applicant Portal**: Streamlined admission process with OTP authentication

### 📚 Academic Management
- **Subject Management**: Dynamic department and subject configuration
- **Attendance Tracking**: Real-time attendance marking and monitoring
- **Grade Management**: Comprehensive marks upload and performance analytics
- **Performance Analytics**: Detailed academic insights and trends

### 🏠 Hostel Management
- **Room Allocation**: Automated and manual room assignment
- **Fee Management**: Hostel and college fee tracking
- **Notice Board**: Real-time announcements and updates
- **Reports**: Occupancy and financial reports

### 💬 Real-time Communication
- **Live Chat System**: WebSocket-based messaging between users
- **Notifications**: Real-time notification delivery
- **File Sharing**: Secure document and media sharing
- **Typing Indicators**: Enhanced user experience

### 📖 Library Management
- **Book Catalog**: Digital library with search functionality
- **File Management**: Secure document storage and retrieval
- **Access Control**: Role-based library access

## 🚀 Technology Stack

### Frontend
- **React 18.3.1** - Modern UI framework
- **Redux Toolkit** - State management
- **Material-UI (MUI)** - Component library
- **React Router** - Navigation
- **Axios** - HTTP client
- **Socket.io-client** - Real-time communication
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **Passport.js** - Authentication middleware
- **Socket.io** - WebSocket server
- **Multer** - File upload handling
- **Nodemailer** - Email services
- **Cloudinary** - Image storage

### Development Tools
- **Git** - Version control
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 📊 System Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React Client  │    │  Express Server │    │    MongoDB      │
│                 │    │                 │    │                 │
│ • Admin Portal  │◄──►│ • REST APIs     │◄──►│ • User Data     │
│ • Faculty Portal│    │ • WebSocket     │    │ • Academic Data │
│ • Student Portal│    │ • Authentication│    │ • Hostel Data   │
│ • Applicant     │    │ • File Upload   │    │ • Library Data  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v6.0 or higher)
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/daxeshchothani/SIH-2025-ERP-based-Integrated-Student-Management-system.git
cd SIH-2025-ERP-based-Integrated-Student-Management-system
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create a `.env` file in the `server` directory:
```env
# JWT Secret Key (REQUIRED)
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production

# Database Configuration
MONGO_URI=mongodb://localhost:27017/crm-portal

# Server Configuration
PORT=5000
NODE_ENV=development

# Email Configuration (for OTP)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Cloudinary Configuration (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Frontend URL
CLIENT_URL=http://localhost:3000
```

Start the backend server:
```bash
npm start
```

### 3. Frontend Setup
```bash
cd client
npm install
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- WebSocket: ws://localhost:5000/ws

## 📋 API Documentation

### Total APIs: 145 REST Endpoints

#### Student APIs (19 endpoints)
- Authentication: Login, password reset with OTP
- Profile: Update profile and password
- Academic: Dashboard, subjects, attendance, marks
- Communication: Chat, notifications
- Search: Student search by various criteria

#### Faculty APIs (18 endpoints)
- Authentication: Login, password reset with OTP
- Profile: Update profile and password
- Academic: Dashboard, student management, attendance marking, marks upload
- Communication: Notifications, chat

#### Admin APIs (33 endpoints)
- Authentication: Login, password management
- User Management: Add/update/delete students, faculty, admins
- Academic Management: Subject management, analytics
- System Management: Notifications, statistics, reports
- Applicant Management: Complete admission workflow

#### Hostel Management (37 endpoints)
- Hostel CRUD operations
- Room management and assignment
- Fee management and tracking
- Notice board and announcements
- Comprehensive reporting

#### Additional Modules
- **Department Management** (9 endpoints)
- **Library Management** (6 endpoints)
- **Chat System** (11 endpoints)
- **Applicant Management** (2 endpoints)

## 🔐 Authentication & Security

- **JWT-based Authentication** with role-based access control
- **Password Hashing** using bcrypt
- **OTP Verification** for password reset and applicant login
- **Input Validation** and sanitization
- **CORS Protection** for cross-origin requests
- **Rate Limiting** to prevent abuse
- **WebSocket Authentication** for real-time features

## 📱 User Roles & Permissions

### Admin
- Complete system management
- User creation and management
- Academic configuration
- Hostel and fee management
- Analytics and reporting
- Notification management

### Faculty
- Student management
- Attendance marking
- Grade management
- Subject management
- Communication with students
- Performance analytics

### Student
- Academic record access
- Attendance tracking
- Performance monitoring
- Communication with faculty
- Hostel information
- Library access

### Applicant
- Application submission
- OTP-based authentication
- Application status tracking
- Document upload

## 🎯 Key Features in Detail

### Real-time Communication
- **WebSocket Integration**: Live messaging between users
- **Typing Indicators**: Real-time typing status
- **File Sharing**: Secure document and media sharing
- **Message Persistence**: Chat history storage and retrieval
- **Notification System**: Real-time notification delivery

### Academic Management
- **Dynamic Department System**: Configurable departments and subjects
- **Attendance Tracking**: Real-time attendance marking with analytics
- **Grade Management**: Comprehensive marks upload and tracking
- **Performance Analytics**: Detailed academic insights and trends
- **Subject Assignment**: Faculty-subject assignment system

### Hostel Management
- **Room Allocation**: Automated and manual room assignment
- **Fee Management**: Hostel and college fee tracking and payment
- **Notice Board**: Real-time announcements and updates
- **Reporting**: Comprehensive occupancy and financial reports
- **Student Assignment**: Automated student-to-hostel assignment

## 🚀 Deployment

### Production Environment Variables
```env
NODE_ENV=production
MONGO_URI=your_production_mongodb_uri
JWT_SECRET=your_production_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_USER=your_production_email
EMAIL_PASS=your_production_email_password
CLIENT_URL=https://your-frontend-domain.com
```

### Build for Production
```bash
# Frontend build
cd client
npm run build

# Backend (already production ready)
cd server
npm start
```

## 📈 Performance & Scalability

- **Optimized Database Queries** with proper indexing
- **Efficient State Management** with Redux Toolkit
- **Code Splitting** for better performance
- **Image Optimization** with Cloudinary
- **Caching Strategies** for frequently accessed data
- **WebSocket Connection Management** with auto-reconnection

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Daxesh Chothani** - Full Stack Developer
- **Team Members** - [Add team member names]

## 🏆 SIH 2025

This project is developed for **Smart India Hackathon 2025** - a nationwide initiative to promote innovation and problem-solving in India.

## 📞 Support

For support and queries, please contact:
- Email: [your-email@example.com]
- GitHub Issues: [Create an issue](https://github.com/daxeshchothani/SIH-2025-ERP-based-Integrated-Student-Management-system/issues)

## 🙏 Acknowledgments

- Smart India Hackathon 2025 for the platform
- Open source community for the amazing tools and libraries
- Educational institutions for their valuable feedback

---

**Made with ❤️ for Smart India Hackathon 2025**
