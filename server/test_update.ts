import axios from 'axios';
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
dotenv.config();

// Create a JWT for admin
const token = jwt.sign(
  { id: '2cba9aeb-7eb5-433b-85cd-a5796c810d7c', role: 'admin', full_name: 'Admin User' },
  process.env.JWT_SECRET || 'kp_ams_super_secret_jwt_key_2025_change_in_production'
);

async function run() {
  try {
    // get assignments
    const res = await axios.get('http://localhost:4000/api/assignments', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (res.data.length === 0) {
      console.log('No assignments found');
      return;
    }
    
    const target = res.data[0];
    console.log(`Target Assignment: ${target.id}, current amount_receipt: ${target.amount_receipt}`);
    
    // update
    const updateRes = await axios.put(`http://localhost:4000/api/assignments/${target.id}`, {
      amount_receipt: 9999
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Update result:', updateRes.data.amount_receipt);
    
  } catch (err: any) {
    console.error(err.response?.data || err.message);
  }
}

run();
