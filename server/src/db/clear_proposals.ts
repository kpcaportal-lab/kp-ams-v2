import pool from './pool.js';

async function clearProposals() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        console.log('🧹 Cleaning up existing proposals...');
        await client.query('DELETE FROM proposals');
        await client.query('DELETE FROM proposal_sequences');
        await client.query('COMMIT');
        console.log('✅ Proposals cleared successfully!');
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('❌ Failed to clear proposals:', err);
    } finally {
        client.release();
        process.exit();
    }
}

clearProposals();
