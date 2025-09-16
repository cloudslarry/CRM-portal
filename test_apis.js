const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

// Test configuration
const testConfig = {
  student: {
    registrationNumber: 'STU2024001',
    password: 'student123'
  },
  faculty: {
    registrationNumber: 'FAC2024001', 
    password: 'faculty123'
  },
  admin: {
    registrationNumber: 'ADM2024001',
    password: 'admin123'
  }
};

// Helper function to make API calls
async function makeRequest(method, url, data = null, token = null) {
  try {
    const config = {
      method,
      url: `${API_BASE_URL}${url}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data || error.message,
      status: error.response?.status || 500
    };
  }
}

// Test functions
async function testStudentAPIs() {
  console.log('\n=== Testing Student APIs ===');
  
  // Test login
  const loginResult = await makeRequest('POST', '/api/student/login', testConfig.student);
  if (!loginResult.success) {
    console.log('❌ Student login failed:', loginResult.error);
    return;
  }
  console.log('✅ Student login successful');
  
  const token = loginResult.data.token.replace('Bearer ', '');
  
  // Test dashboard
  const dashboardResult = await makeRequest('GET', '/api/student/dashboard', null, token);
  if (dashboardResult.success) {
    console.log('✅ Student dashboard API working');
  } else {
    console.log('❌ Student dashboard failed:', dashboardResult.error);
  }
  
  // Test notifications
  const notificationsResult = await makeRequest('GET', '/api/student/notifications', null, token);
  if (notificationsResult.success) {
    console.log('✅ Student notifications API working');
  } else {
    console.log('❌ Student notifications failed:', notificationsResult.error);
  }
  
  // Test subjects
  const subjectsResult = await makeRequest('GET', '/api/student/getAllSubjects', null, token);
  if (subjectsResult.success) {
    console.log('✅ Student subjects API working');
  } else {
    console.log('❌ Student subjects failed:', subjectsResult.error);
  }
}

async function testFacultyAPIs() {
  console.log('\n=== Testing Faculty APIs ===');
  
  // Test login
  const loginResult = await makeRequest('POST', '/api/faculty/login', testConfig.faculty);
  if (!loginResult.success) {
    console.log('❌ Faculty login failed:', loginResult.error);
    return;
  }
  console.log('✅ Faculty login successful');
  
  const token = loginResult.data.token.replace('Bearer ', '');
  
  // Test dashboard
  const dashboardResult = await makeRequest('GET', '/api/faculty/dashboard', null, token);
  if (dashboardResult.success) {
    console.log('✅ Faculty dashboard API working');
  } else {
    console.log('❌ Faculty dashboard failed:', dashboardResult.error);
  }
  
  // Test notifications
  const notificationsResult = await makeRequest('GET', '/api/faculty/notifications', null, token);
  if (notificationsResult.success) {
    console.log('✅ Faculty notifications API working');
  } else {
    console.log('❌ Faculty notifications failed:', notificationsResult.error);
  }
}

async function testAdminAPIs() {
  console.log('\n=== Testing Admin APIs ===');
  
  // Test login
  const loginResult = await makeRequest('POST', '/api/admin/login', testConfig.admin);
  if (!loginResult.success) {
    console.log('❌ Admin login failed:', loginResult.error);
    return;
  }
  console.log('✅ Admin login successful');
  
  const token = loginResult.data.token.replace('Bearer ', '');
  
  // Test dashboard
  const dashboardResult = await makeRequest('GET', '/api/admin/dashboard', null, token);
  if (dashboardResult.success) {
    console.log('✅ Admin dashboard API working');
  } else {
    console.log('❌ Admin dashboard failed:', dashboardResult.error);
  }
  
  // Test statistics
  const statsResult = await makeRequest('GET', '/api/admin/statistics', null, token);
  if (statsResult.success) {
    console.log('✅ Admin statistics API working');
  } else {
    console.log('❌ Admin statistics failed:', statsResult.error);
  }
  
  // Test test-statistics (no auth required)
  const testStatsResult = await makeRequest('GET', '/api/admin/test-statistics');
  if (testStatsResult.success) {
    console.log('✅ Admin test-statistics API working');
  } else {
    console.log('❌ Admin test-statistics failed:', testStatsResult.error);
  }
  
  // Test notifications
  const notificationsResult = await makeRequest('GET', '/api/admin/notifications', null, token);
  if (notificationsResult.success) {
    console.log('✅ Admin notifications API working');
  } else {
    console.log('❌ Admin notifications failed:', notificationsResult.error);
  }
}

async function testWebSocketConnection() {
  console.log('\n=== Testing WebSocket Connection ===');
  
  try {
    const WebSocket = require('ws');
    const ws = new WebSocket('ws://localhost:5000/ws?token=test_token');
    
    ws.on('open', () => {
      console.log('✅ WebSocket connection established');
      ws.close();
    });
    
    ws.on('error', (error) => {
      console.log('❌ WebSocket connection failed:', error.message);
    });
    
    ws.on('close', () => {
      console.log('✅ WebSocket connection closed');
    });
    
  } catch (error) {
    console.log('❌ WebSocket test failed:', error.message);
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting API Tests...\n');
  
  try {
    await testStudentAPIs();
    await testFacultyAPIs();
    await testAdminAPIs();
    await testWebSocketConnection();
    
    console.log('\n✅ All tests completed!');
  } catch (error) {
    console.log('\n❌ Test suite failed:', error.message);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests();
}

module.exports = {
  testStudentAPIs,
  testFacultyAPIs,
  testAdminAPIs,
  testWebSocketConnection,
  runTests
};
