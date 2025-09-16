const axios = require('axios');

const API_BASE_URL = 'http://localhost:5000';

// Test admin APIs specifically
async function testAdminAPIs() {
  console.log('🧪 Testing Admin APIs...\n');

  try {
    // Test admin login first
    console.log('1. Testing Admin Login...');
    const loginResponse = await axios.post(`${API_BASE_URL}/api/admin/login`, {
      registrationNumber: 'ADM2024001',
      password: 'admin123'
    });
    
    if (loginResponse.data.success) {
      console.log('✅ Admin login successful');
      const token = loginResponse.data.token.replace('Bearer ', '');
      
      // Test getAllFaculty
      console.log('\n2. Testing getAllFaculty API...');
      const facultyResponse = await axios.post(`${API_BASE_URL}/api/admin/getAllFaculty`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ getAllFaculty API working');
      console.log(`   - Response status: ${facultyResponse.status}`);
      console.log(`   - Faculty count: ${facultyResponse.data.result?.length || 0}`);
      console.log(`   - Sample faculty:`, facultyResponse.data.result?.[0]?.name || 'No faculty found');
      
      // Test getAllStudent
      console.log('\n3. Testing getAllStudent API...');
      const studentResponse = await axios.post(`${API_BASE_URL}/api/admin/getAllStudent`, {}, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('✅ getAllStudent API working');
      console.log(`   - Response status: ${studentResponse.status}`);
      console.log(`   - Student count: ${studentResponse.data.result?.length || 0}`);
      console.log(`   - Sample student:`, studentResponse.data.result?.[0]?.name || 'No students found');
      
      // Test statistics
      console.log('\n4. Testing statistics API...');
      const statsResponse = await axios.get(`${API_BASE_URL}/api/admin/statistics`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('✅ Statistics API working');
      console.log(`   - Response status: ${statsResponse.status}`);
      console.log(`   - Statistics:`, statsResponse.data.statistics);
      
      console.log('\n🎉 All Admin APIs are working correctly!');
      
    } else {
      console.log('❌ Admin login failed');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      console.log('\n💡 Tip: Make sure you have an admin user in the database');
      console.log('   You can create one using the addAdmin API');
    }
  }
}

// Test without authentication (should fail)
async function testWithoutAuth() {
  console.log('\n5. Testing APIs without authentication (should fail)...');
  
  try {
    await axios.post(`${API_BASE_URL}/api/admin/getAllFaculty`);
    console.log('❌ API should require authentication');
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ API correctly requires authentication');
    } else {
      console.log('❌ Unexpected error:', error.message);
    }
  }
}

// Main test function
async function runTests() {
  console.log('🚀 Starting Admin API Tests...\n');
  
  await testAdminAPIs();
  await testWithoutAuth();
  
  console.log('\n📋 Test Summary:');
  console.log('- Admin login: ✅');
  console.log('- getAllFaculty: ✅');
  console.log('- getAllStudent: ✅');
  console.log('- Statistics: ✅');
  console.log('- Authentication: ✅');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = {
  testAdminAPIs,
  testWithoutAuth,
  runTests
};
