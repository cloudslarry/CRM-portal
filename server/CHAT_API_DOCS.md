# Chat API Documentation

## Overview
This document describes the REST API endpoints and Socket.io events for the student chat system.

## Base URL
```
http://localhost:5000/api/chat
```

## Authentication
All endpoints require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## REST API Endpoints

### 1. Send Message
**POST** `/send`

Send a text message with optional file attachment.

**Request Body:**
```json
{
  "senderId": "string (required)",
  "receiverId": "string (required)",
  "message": "string (optional if file provided)",
  "senderName": "string",
  "receiverName": "string",
  "senderRegistrationNumber": "string",
  "receiverRegistrationNumber": "string",
  "roomId": "string"
}
```

**File Upload:**
- Use `multipart/form-data` content type
- Field name: `files`
- Maximum 5 files per request
- Maximum file size: 10MB
- Allowed file types: images, PDFs, documents

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully",
  "data": {
    "_id": "message_id",
    "senderId": "sender_id",
    "receiverId": "receiver_id",
    "message": "message_text",
    "fileUrl": "/uploads/chatDocs/filename.pdf",
    "fileName": "original_filename.pdf",
    "fileType": "application/pdf",
    "fileSize": 1024000,
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 2. Get Chat History
**GET** `/:userId/:receiverId`

Get chat history between two users with pagination.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Messages per page (default: 50)

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "message_id",
        "senderId": "sender_id",
        "receiverId": "receiver_id",
        "message": "message_text",
        "fileUrl": "/uploads/chatDocs/filename.pdf",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalMessages": 250,
      "hasNextPage": true,
      "hasPrevPage": false
    },
    "users": {
      "sender": {
        "name": "John Doe",
        "registrationNumber": "REG001",
        "department": "Computer Science"
      },
      "receiver": {
        "name": "Jane Smith",
        "registrationNumber": "REG002",
        "department": "Electronics"
      }
    }
  }
}
```

### 3. Get User Conversations
**GET** `/conversations/:userId`

Get all conversations for a user with last message and unread count.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "userId": "receiver_id",
      "userName": "Jane Smith",
      "userRegistrationNumber": "REG002",
      "userDepartment": "Electronics",
      "lastMessage": {
        "message": "Hello!",
        "fileUrl": null,
        "createdAt": "2024-01-01T00:00:00.000Z",
        "senderId": "sender_id"
      },
      "unreadCount": 3
    }
  ]
}
```

### 4. Mark Messages as Read
**PUT** `/mark-read`

Mark messages as read.

**Request Body:**
```json
{
  "userId": "string (required)",
  "senderId": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Messages marked as read"
}
```

### 5. Delete Message
**DELETE** `/:messageId`

Delete a message (only sender can delete).

**Request Body:**
```json
{
  "userId": "string (required)"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message deleted successfully"
}
```

### 6. Search Messages
**GET** `/search/:userId`

Search messages containing specific text.

**Query Parameters:**
- `query` (required): Search term
- `page` (optional): Page number (default: 1)
- `limit` (optional): Results per page (default: 20)

**Response:**
```json
{
  "success": true,
  "data": {
    "messages": [
      {
        "_id": "message_id",
        "message": "search result message",
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 2,
      "totalMessages": 25,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

## Socket.io Events

### Client to Server Events

#### 1. Join Room
```javascript
socket.emit('join room', {
  room1: 'senderId_receiverId',
  room2: 'receiverId_senderId'
});
```

#### 2. Send Private Message
```javascript
socket.emit('private message', {
  sender: 'John Doe',
  message: 'Hello!',
  room: 'senderId_receiverId',
  senderId: 'sender_id',
  receiverId: 'receiver_id',
  senderName: 'John Doe',
  receiverName: 'Jane Smith',
  senderRegistrationNumber: 'REG001',
  receiverRegistrationNumber: 'REG002',
  files: [
    {
      url: '/uploads/chatDocs/file.pdf',
      name: 'document.pdf',
      type: 'application/pdf',
      size: 1024000
    }
  ]
});
```

#### 3. Typing Indicator
```javascript
socket.emit('typing', {
  room: 'senderId_receiverId',
  user: 'John Doe',
  isTyping: true
});
```

#### 4. Mark as Read
```javascript
socket.emit('mark as read', {
  messageId: 'message_id',
  userId: 'user_id',
  room: 'senderId_receiverId'
});
```

#### 5. User Online Status
```javascript
socket.emit('user online', {
  userId: 'user_id'
});
```

### Server to Client Events

#### 1. New Message
```javascript
socket.on('new Message', (data) => {
  console.log('New message:', data);
  // data contains: _id, message, sender, senderId, receiverId, fileUrl, fileName, fileType, fileSize, createdAt, roomId
});
```

#### 2. User Typing
```javascript
socket.on('user typing', (data) => {
  console.log('User typing:', data);
  // data contains: user, isTyping
});
```

#### 3. Message Read
```javascript
socket.on('message read', (data) => {
  console.log('Message read:', data);
  // data contains: messageId, readBy, readAt
});
```

#### 4. User Status
```javascript
socket.on('user status', (data) => {
  console.log('User status:', data);
  // data contains: userId, status ('online' or 'offline')
});
```

#### 5. Error
```javascript
socket.on('error', (data) => {
  console.log('Error:', data);
  // data contains: message
});
```

## File Upload Configuration

### Supported File Types
- **Images**: JPEG, JPG, PNG, GIF
- **Documents**: PDF, DOC, DOCX
- **Text**: TXT

### File Storage
- Files are stored in `/uploads/chatDocs/`
- Files are accessible via `/uploads/chatDocs/filename`
- Maximum file size: 10MB
- Maximum files per request: 5

### File URL Format
```
http://localhost:5000/uploads/chatDocs/filename.pdf
```

## Error Handling

### Common Error Responses
```json
{
  "success": false,
  "message": "Error description"
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden
- `404`: Not Found
- `500`: Internal Server Error

## Room Naming Convention

Rooms are created using the format: `${senderId}_${receiverId}`

Example:
- User A (ID: 123) chatting with User B (ID: 456)
- Room names: `123_456` and `456_123`
- Both users join both rooms for bidirectional communication

## Database Schema

### Message Collection
```javascript
{
  _id: ObjectId,
  senderId: String (required),
  receiverId: String (required),
  message: String,
  fileUrl: String,
  fileName: String,
  fileType: String,
  fileSize: Number,
  senderName: String,
  receiverName: String,
  senderRegistrationNumber: String,
  receiverRegistrationNumber: String,
  roomId: String,
  isRead: Boolean (default: false),
  readAt: Date,
  createdAt: Date (default: Date.now)
}
```

## CORS Configuration

The server is configured to allow requests from any origin. In production, update the CORS configuration in `server.js`:

```javascript
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Your frontend URL
    methods: ["GET", "POST"],
  },
});
```
