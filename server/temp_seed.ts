import pool from './src/db/pool.js';

async function main() {
    try {
        await pool.query(`
            INSERT INTO profiles (id, email, password_hash, role, full_name, display_name, reports_to) 
            VALUES ('00000000-0000-0000-0000-000000000018', 'staff1@kirtanepandit.com', '$2a$10$xWCoSeTFNUX2XB2dBLYixe5Te3A7lqbeUbpiPm2oTvcnCK3dvtf3a', 'staff', 'Staff 1', 'Staff 1', '00000000-0000-0000-0000-000000000008')
            ON CONFLICT DO NOTHING
        `);
        console.log('Successfully inserted staff1');
    } catch (e) {
        console.error(e);
    } finally {
        await pool.end();
    }
}

main();
