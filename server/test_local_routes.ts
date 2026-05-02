
import jwt from 'jsonwebtoken';
import axios from 'axios';

const JWT_SECRET = 'kp_ams_super_secret_jwt_key_2025_change_in_production';
const token = jwt.sign({
    id: '00000000-0000-0000-0000-000000000001',
    email: 'admin.kpams@gmail.com',
    role: 'admin',
    full_name: 'System Administrator'
}, JWT_SECRET);

console.log('Test Token:', token);

async function testRoutes() {
    const baseUrl = 'http://localhost:4000/api';
    try {
        console.log('Testing /api/clients...');
        const clients = await axios.get(`${baseUrl}/clients`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Clients Status:', clients.status);
        console.log('Clients Count:', clients.data.length);

        console.log('Testing /api/proposals...');
        const proposals = await axios.get(`${baseUrl}/proposals`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        console.log('Proposals Status:', proposals.status);
        console.log('Proposals Count:', proposals.data.length);

    } catch (err: any) {
        if (err.response) {
            console.error('Error Response:', err.response.status, err.response.data);
        } else {
            console.error('Error:', err.message);
        }
    }
}

// Note: This script assumes the server is running. 
// I will run the server in the background first.
testRoutes();
