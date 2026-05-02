import jwt from 'jsonwebtoken';

const JWT_SECRET = 'kp_ams_super_secret_jwt_key_2025_change_in_production';
const BASE_URL = 'http://localhost:4000/api/budget';

const testUser = {
    id: '25985dc5-ee26-4d09-823d-dc492298f938', // The Admin ID found during seeding
    email: 'admin@kp-ams.com',
    role: 'admin',
    full_name: 'System Admin'
};

const token = jwt.sign(testUser, JWT_SECRET);

async function testRoutes() {
    console.log('🚀 Testing Budget Analytics Routes...\n');

    const endpoints = [
        { name: 'Summary (2025-26)', url: `${BASE_URL}/summary?fiscal_year=2025-26` },
        { name: 'Comparative', url: `${BASE_URL}/comparative` },
        { name: 'Forecasting', url: `${BASE_URL}/forecasting?current_fy=2026-27` }
    ];

    for (const endpoint of endpoints) {
        console.log(`📡 Testing ${endpoint.name}...`);
        try {
            const res = await fetch(endpoint.url, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (res.ok) {
                console.log('✅ Success:');
                console.dir(data, { depth: null });
            } else {
                console.log('❌ Failed:', data);
            }
        } catch (err) {
            console.error('💥 Error:', err);
        }
        console.log('-------------------\n');
    }
}

testRoutes();
