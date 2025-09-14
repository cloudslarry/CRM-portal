const axios = require('axios');

// Test the notifications API
async function testNotificationsAPI() {
  try {
    console.log('Testing notifications API...');
    
    // First, let's test with a valid ObjectId format
    const validObjectId = '507f1f77bcf86cd799439011'; // This is a valid ObjectId format
    console.log(`Testing with valid ObjectId: ${validObjectId}`);
    
    const response = await axios.get(`http://localhost:3000/api/chat/notifications/${validObjectId}`, {
      headers: {
        'Authorization': 'Bearer test-token' // This will fail auth but we can see the validation
      }
    });
    
    console.log('Response:', response.data);
  } catch (error) {
    console.log('Error response:', error.response?.data);
    console.log('Error status:', error.response?.status);
  }
}

// Test the hostel notices API
async function testHostelNoticesAPI() {
  try {
    console.log('\nTesting hostel notices API...');
    
    const response = await axios.get('http://localhost:3000/api/student/hostel/notices', {
      headers: {
        'Authorization': 'Bearer test-token' // This will fail auth but we can see the validation
      }
    });
    
    console.log('Response:', response.data);
  } catch (error) {
    console.log('Error response:', error.response?.data);
    console.log('Error status:', error.response?.status);
  }
}

// Run tests
testNotificationsAPI();
testHostelNoticesAPI();
