import axios from 'axios';
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

const token = jwt.sign(
  { id: 'afc14005-3e62-4ac1-9380-f412d3bed792', role: 'manager', full_name: 'Hamza Momin' },
  process.env.JWT_SECRET || 'kp-ams-v2-secure-fallback-secret-2025'
);

async function run() {
  try {
    const res = await axios.get('http://localhost:4000/api/assignments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log(`Returned ${res.data.length} assignments.`);
    if (res.data.length > 0) {
      console.log('Keys in first assignment:', Object.keys(res.data[0]));
      console.log('amount_receipt value:', res.data[0].amount_receipt);
    }
  } catch (err: any) {
    console.error(err.response?.data || err.message);
  }
}

run();
