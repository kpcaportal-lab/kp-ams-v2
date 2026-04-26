import pool from './src/db/pool.js';
import bcrypt from 'bcryptjs';

async function addAdmin() {
    try {
        const hash = await bcrypt.hash('KpAms@2025', 10);
        const adminId = '00000000-0000-0000-0000-000000000001';
        const email = 'admin@gmail.com';

        await pool.query(`
            INSERT INTO profiles (id, email, password_hash, role, full_name, display_name, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, true)
            ON CONFLICT (id) DO UPDATE SET 
                email = EXCLUDED.email,
                password_hash = EXCLUDED.password_hash,
                role = EXCLUDED.role,
                full_name = EXCLUDED.full_name,
                is_active = true
        `, [adminId, email, hash, 'admin', 'System Administrator', 'Admin']);
        
        console.log('✅ Admin user restored/updated successfully');
    } catch (err) {
        console.error('Failed to add admin:', err);
    } finally {
        process.exit();
    }
}

addAdmin();
