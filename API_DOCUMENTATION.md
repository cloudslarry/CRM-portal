# CRM Portal API Documentation

## Overview
This document provides comprehensive documentation for all the APIs in the CRM Portal system, including student, faculty, and admin endpoints with real-time features.

## Base URL
- Development: `http://localhost:5000`
- WebSocket: `ws://localhost:5000/ws`

## Authentication
All protected endpoints require JWT authentication via Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

## Student APIs

### Authentication
- `POST /api/student/login` - Student login
- `POST /api/student/forgotPassword` - Request password reset OTP
- `POST /api/student/postOTP` - Submit OTP for password reset

### Profile Management
- `PUT /api/student/updateProfile` - Update student profile
- `POST /api/student/updatePassword` - Update password

### Dashboard & Data
- `GET /api/student/dashboard` - Get comprehensive dashboard data
- `GET /api/student/getAllSubjects` - Get all subjects for student
- `GET /api/student/checkAttendance` - Get attendance records
- `GET /api/student/getMarks` - Get marks/performance data

### Notifications
- `GET /api/student/notifications` - Get all notifications
- `PUT /api/student/notifications/:id/read` - Mark notification as read

### Chat System
- `POST /api/student/chat/:roomId` - Send message to room
- `GET /api/student/chat/:roomId` - Get messages from room
- `GET /api/student/chat/previousChats/:senderName` - Get previous chats
- `GET /api/student/chat/newerChats/:receiverName` - Get newer chats

### Search
- `POST /api/student/getAllStudents` - Search students by criteria
- `POST /api/student/getStudentByName` - Search by name
- `POST /api/student/getStudentByRegNum` - Search by registration number

## Faculty APIs

### Authentication
- `POST /api/faculty/login` - Faculty login
- `POST /api/faculty/forgotPassword` - Request password reset OTP
- `POST /api/faculty/postOTP` - Submit OTP for password reset

### Profile Management
- `PUT /api/faculty/updateProfile` - Update faculty profile
- `POST /api/faculty/updatePassword` - Update password

### Dashboard & Data
- `GET /api/faculty/dashboard` - Get comprehensive dashboard data
- `POST /api/faculty/fetchAllSubjects` - Get all subjects
- `POST /api/faculty/fetchStudents` - Get students by criteria

### Notifications
- `GET /api/faculty/notifications` - Get all notifications
- `PUT /api/faculty/notifications/:id/read` - Mark notification as read

### Student Management
- `POST /api/faculty/getStudentsByCriteria` - Advanced student search
- `POST /api/faculty/getAttendanceSummary` - Get attendance summary for subject

### Academic Operations
- `POST /api/faculty/markAttendance` - Mark student attendance
- `POST /api/faculty/uploadMarks` - Upload student marks

## Admin APIs

### Authentication
- `POST /api/admin/login` - Admin login
- `POST /api/admin/updatePassword` - Update admin password

### Dashboard & Analytics
- `GET /api/admin/dashboard` - Get comprehensive dashboard data
- `GET /api/admin/statistics` - Get system statistics
- `GET /api/admin/test-statistics` - Test statistics (no auth required)
- `GET /api/admin/analytics` - Get detailed analytics with trends

### Notifications
- `GET /api/admin/notifications` - Get all notifications
- `PUT /api/admin/notifications/:id/read` - Mark notification as read
- `POST /api/admin/notifications` - Create new notification

### User Management
- `POST /api/admin/addAdmin` - Add new admin
- `POST /api/admin/addStudentDirect` - Add student (no auth required)
- `POST /api/admin/addStudent` - Add student (authenticated)
- `POST /api/admin/addFaculty` - Add faculty member
- `POST /api/admin/addSubject` - Add new subject

### Data Retrieval
- `POST /api/admin/getAllFaculty` - Get all faculty
- `POST /api/admin/getAllStudent` - Get all students
- `POST /api/admin/getAllSubject` - Get all subjects
- `POST /api/admin/getFaculties` - Get faculty by department
- `POST /api/admin/getStudents` - Get students by criteria
- `POST /api/admin/getSubjects` - Get subjects by criteria

## WebSocket API

### Connection
Connect to WebSocket with JWT token:
```
ws://localhost:5000/ws?token=<jwt_token>
```

### Message Types

#### Client to Server
- `chat` - Send chat message
- `typing` - Send typing indicator
- `ping` - Ping server

#### Server to Client
- `connection` - Connection confirmation
- `new_message` - New message received
- `message_sent` - Message sent confirmation
- `room_message` - Message in room
- `typing` - Typing indicator
- `pong` - Pong response
- `error` - Error message

### Chat Message Format
```json
{
  "type": "chat",
  "roomId": "room123",
  "message": "Hello!",
  "receiverId": "user123",
  "receiverName": "John Doe",
  "receiverRegistrationNumber": "STU2024001"
}
```

### Typing Indicator Format
```json
{
  "type": "typing",
  "roomId": "room123",
  "isTyping": true
}
```

## Response Formats

### Success Response
```json
{
  "success": true,
  "result": { ... },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "error": "Detailed error information"
}
```

### Dashboard Response (Student)
```json
{
  "success": true,
  "result": {
    "attendanceSummary": [
      {
        "subjectCode": "CS101",
        "subjectName": "Programming",
        "attendancePercentage": "85.5",
        "totalLectures": 40,
        "lecturesAttended": 34
      }
    ],
    "recentMarks": [...],
    "unreadNotifications": 3,
    "recentMessages": 5,
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

### Dashboard Response (Faculty)
```json
{
  "success": true,
  "result": {
    "totalStudents": 150,
    "subjects": 8,
    "recentAttendance": [...],
    "recentMarks": [...],
    "unreadNotifications": 2,
    "attendanceStats": {
      "totalLectures": 500,
      "totalAttended": 450
    },
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

### Dashboard Response (Admin)
```json
{
  "success": true,
  "result": {
    "overview": {
      "totalStudents": 500,
      "totalFaculty": 25,
      "totalSubjects": 30,
      "totalAdmins": 3,
      "unreadNotifications": 5
    },
    "departmentStats": {
      "students": [...],
      "faculty": [...]
    },
    "recentActivities": {
      "students": [...],
      "faculty": [...]
    },
    "academicStats": {
      "attendance": {...},
      "marks": [...]
    },
    "lastUpdated": "2024-01-15T10:30:00.000Z"
  }
}
```

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found (resource not found)
- `500` - Internal Server Error

## Rate Limiting
- API calls: 100 requests per minute per user
- WebSocket messages: 60 messages per minute per connection

## Testing

### Test Statistics Endpoint
```bash
curl -X GET http://localhost:5000/api/admin/test-statistics
```

### WebSocket Test
```javascript
const ws = new WebSocket('ws://localhost:5000/ws?token=your_jwt_token');
ws.onopen = () => console.log('Connected');
ws.onmessage = (event) => console.log('Message:', JSON.parse(event.data));
```

## Environment Variables

### Server
- `MONGO_URI` - MongoDB connection string
- `PORT` - Server port (default: 5000)
- `JWT_SECRET` - JWT secret key
- `ADMIN_PASSWORD` - Default admin password
- `STUDENT_PASSWORD` - Default student password
- `FACULTY_PASSWORD` - Default faculty password

### Client
- `REACT_APP_API_BASE_URL` - API base URL
- `REACT_APP_WS_URL` - WebSocket URL

## Real-time Features

1. **Live Chat**: Real-time messaging between users
2. **Typing Indicators**: Show when someone is typing
3. **Notifications**: Real-time notification delivery
4. **Dashboard Updates**: Live data updates
5. **Connection Status**: Automatic reconnection on connection loss

## Security Features

1. **JWT Authentication**: Secure token-based authentication
2. **Password Hashing**: Bcrypt password hashing
3. **Input Validation**: Comprehensive input validation
4. **CORS Protection**: Cross-origin request protection
5. **Rate Limiting**: API rate limiting
6. **WebSocket Authentication**: Token-based WebSocket authentication
