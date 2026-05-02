import pool from '../src/db/pool.ts';

async function removeDuplicates() {
    try {
        console.log('🚀 Starting targeted cleanup of duplicate profiles...');
        
        // These are the IDs of the lowercase profiles that have NO data and were created by mistake
        const targetIds = [
            '00000000-0000-0000-0000-000000000009', // Bhushan Patil (lowercase)
            '00000000-0000-0000-0000-000000000013', // Dhanashree Dekhane (lowercase)
            '00000000-0000-0000-0000-000000000010', // Mohit Joshi (lowercase)
            '00000000-0000-0000-0000-000000000008'  // Sanjeev Deshpande (lowercase)
        ];

        for (const id of targetIds) {
            const res = await pool.query('DELETE FROM profiles WHERE id = $1 RETURNING email', [id]);
            if (res.rowCount && res.rowCount > 0) {
                console.log(`✅ Removed duplicate: ${res.rows[0].email} (${id})`);
            } else {
                console.log(`ℹ️ Profile ${id} not found or already removed.`);
            }
        }

        console.log('✨ Cleanup complete.');
    } catch (err) {
        console.error('❌ Cleanup failed:', err);
    } finally {
        await pool.end();
    }
}

removeDuplicates();
