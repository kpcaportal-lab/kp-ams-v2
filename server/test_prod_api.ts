import axios from 'axios';

async function testProduction() {
  const prodUrl = 'https://kpca-portal-5ysc.onrender.com';
  try {
    console.log('Testing Production API: ' + prodUrl);
    
    console.log('Logging in to production...');
    const loginRes = await axios.post(`${prodUrl}/api/auth/login`, {
      email: 'admin@kirtanepandit.com',
      password: 'KpAms@2025'
    });
    const token = loginRes.data.token;
    console.log('Login successful.');

    const routes = ['/api/users', '/api/dashboard/documents'];

    for (const route of routes) {
      try {
        console.log(`Testing ${route}...`);
        const res = await axios.get(`${prodUrl}${route}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ ${route} successful:`, Array.isArray(res.data) ? res.data.length + ' items' : 'Object');
      } catch (err: any) {
        console.error(`❌ ${route} FAILED:`, err.response?.status || err.message);
        if (err.response?.data) {
          console.error('Error Detail:', JSON.stringify(err.response.data));
        }
      }
    }

  } catch (err: any) {
    console.error('PROD TEST CRITICAL FAILURE:');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', JSON.stringify(err.response.data));
    } else {
      console.error(err.message);
    }
  }
}

testProduction();
