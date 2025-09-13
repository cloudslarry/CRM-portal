# Environment Setup Guide

## Issue Fixed
The server was failing to start with the error:
```
TypeError: JwtStrategy requires a secret or key
```

## Solution Applied
I've updated the `server/config/key.js` file to provide fallback values for environment variables.

## Environment Variables Required

### 1. Create a `.env` file in the `server` directory

Create a file named `.env` in the `server` folder with the following content:

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

### 2. Fallback Values (Already Applied)

I've updated `server/config/key.js` to include fallback values:

```javascript
module.exports = {
  secretOrKey: process.env.JWT_SECRET || "your_super_secret_jwt_key_here_change_this_in_production",
  mongoURI: process.env.MONGO_URI || "mongodb://localhost:27017/crm-portal",
  port: process.env.PORT || 5000,
  nodeEnv: process.env.NODE_ENV || "development",
};
```

### 3. Server Configuration Updated

I've also updated `server/server.js` to use the fallback values:

```javascript
const keys = require("./config/key");

const PORT = process.env.PORT || keys.port;

mongoose
  .connect(process.env.MONGO_URI || keys.mongoURI)
  .then((data) => {
    _response.database = "Healthy";
    console.log(`MongoDB connected with server ${data.connection.host}`);
  })
  .catch((err) => {
    console.log("Error in connecting to MongoDB", err.message);
  });
```

## Quick Fix (Immediate)

The server should now start with the fallback values. However, for production, you should:

1. **Create a `.env` file** in the `server` directory
2. **Set a strong JWT secret** (change the default one)
3. **Configure your MongoDB URI** if not using localhost
4. **Set up email credentials** for OTP functionality
5. **Configure Cloudinary** for image uploads

## Testing

1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. You should see:
   ```
   Server running on port: 5000
   MongoDB connected with server localhost
   WebSocket server initialized
   ```

## Security Notes

- **Never commit the `.env` file** to version control
- **Use strong, unique JWT secrets** in production
- **Change all default values** before deploying
- **Use environment-specific configurations** for different environments

## Files Modified

1. `server/config/key.js` - Added fallback values
2. `server/server.js` - Updated to use fallback values

The server should now start successfully even without a `.env` file!
