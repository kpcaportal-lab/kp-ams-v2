import axios from 'axios';

async function testApi() {
  try {
    console.log('Logging in...');
    const loginRes = await axios.post('http://localhost:4000/api/auth/login', {
      email: 'admin.kpams@gmail.com',
      password: 'KpAms@2025'
    });
    const token = loginRes.data.token;
    console.log('Login successful.');

    console.log('Fetching users...');
    const usersRes = await axios.get('http://localhost:4000/api/users', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Users fetched successfully:', usersRes.data.length);

    console.log('Fetching documents...');
    const docsRes = await axios.get('http://localhost:4000/api/dashboard/documents', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Documents fetched successfully.');

  } catch (err: any) {
    console.error('API TEST FAILED:');
    if (err.response) {
      console.error('Status:', err.response.status);
      console.error('Data:', JSON.stringify(err.response.data));
    } else {
      console.error(err.message);
    }
  }
}

testApi();
