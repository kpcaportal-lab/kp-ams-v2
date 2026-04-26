import axios from 'axios';

async function testAllRoutes() {
  try {
    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'admin@kirtanepandit.com',
      password: 'KpAms@2025'
    });
    const token = loginRes.data.token;
    console.log('Login successful.');

    const routes = [
      '/api/users',
      '/api/users/managers',
      '/api/users/partners',
      '/api/dashboard/summary',
      '/api/dashboard/work-progress',
      '/api/dashboard/insights',
      '/api/dashboard/documents',
      '/api/calendar/events'
    ];

    for (const route of routes) {
      try {
        console.log(`Testing ${route}...`);
        const res = await axios.get(`http://localhost:4000${route}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ ${route} successful:`, Array.isArray(res.data) ? res.data.length + ' items' : 'Object');
      } catch (err: any) {
        console.error(`❌ ${route} FAILED:`, err.response?.status || err.message);
        if (err.response?.data) console.error('Error Detail:', JSON.stringify(err.response.data));
      }
    }

  } catch (err: any) {
    console.error('CRITICAL FAILURE:', err.message);
  }
}

testAllRoutes();
