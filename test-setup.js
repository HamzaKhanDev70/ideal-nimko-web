// Test script to verify the setup
const axios = require('axios');

async function testSetup() {
  console.log('Testing Ideal Nimko E-commerce Setup...\n');
  
  try {
    // Test backend health
    console.log('1. Testing Backend Health...');
    const healthResponse = await axios.get('http://localhost:5000/api/health');
    console.log('✅ Backend is running:', healthResponse.data);
    
    // Test products endpoint
    console.log('\n2. Testing Products Endpoint...');
    const productsResponse = await axios.get('http://localhost:5000/api/products');
    console.log('✅ Products endpoint working. Found', productsResponse.data.products?.length || productsResponse.data.length, 'products');
    
    // Test admin login
    console.log('\n3. Testing Admin Login...');
    const loginResponse = await axios.post('http://localhost:5000/api/admin/login', {
      email: 'admin@idealnimko.com',
      password: 'admin123'
    });
    console.log('✅ Admin login working. Token received:', loginResponse.data.token ? 'Yes' : 'No');
    
    console.log('\n🎉 All tests passed! Your e-commerce website is ready.');
    console.log('\nAccess Points:');
    console.log('- Frontend: http://localhost:5173');
    console.log('- Admin Panel: http://localhost:5173/admin');
    console.log('- Backend API: http://localhost:5000');
    console.log('\nAdmin Credentials:');
    console.log('- Email: admin@idealnimko.com');
    console.log('- Password: admin123');
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Make sure the backend server is running on port 5000');
    }
  }
}

testSetup();
