import api from "../../config/api";

const authToken = (token) => {
  if (token) {
    // FIXED: Validate token format before using it
    const cleanToken = token.startsWith('Bearer ') ? token.substring(7) : token;
    
    // Basic JWT format validation (header.payload.signature)
    const jwtPattern = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/;
    
    if (!jwtPattern.test(cleanToken)) {
      console.error('Invalid JWT token format:', cleanToken.substring(0, 20) + '...');
      // Clear invalid token from localStorage
      localStorage.removeItem('studentToken');
      localStorage.removeItem('adminToken');
      localStorage.removeItem('facultyToken');
      delete api.defaults.headers.common["Authorization"];
      console.log('Invalid token cleared from storage and headers');
      return;
    }
    
    // Ensure token has "Bearer " prefix for proper authentication
    const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    api.defaults.headers.common["Authorization"] = formattedToken;
    
    // DEBUG: Log token setup for troubleshooting
    console.log('Auth token set:', {
      original: token.substring(0, 20) + '...',
      formatted: formattedToken.substring(0, 20) + '...',
      hasBearer: formattedToken.startsWith('Bearer '),
      isValidJWT: jwtPattern.test(cleanToken)
    });
  } else {
    delete api.defaults.headers.common["Authorization"];
    console.log('Auth token cleared');
  }
};

export default authToken;
